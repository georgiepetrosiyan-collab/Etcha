//E/E-backend/utils/generateResume.js

const { computeMatchScore } = require('./matchScore');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Below this match %, we stop trying to tailor the resume to the job and
// instead generate a clean, general, well-structured resume of the candidate's
// FULL real background (all skills, all experience) — suitable for applying
// to a range of roles, not force-fit to this one specific job.
const GENERAL_CV_MATCH_THRESHOLD = 15;

// Fixed mock résumé returned when ETCHA_MOCK=true, so we can test the
// apply/refer/CV flow without burning through the Gemini API quota.
function getMockCV(user, job) {
    return {
        fullName: user?.f_name || "Test Candidate",
        targetJobTitle: job?.title || "Software Engineer",
        location: user?.curr_location || "Yerevan, Armenia",
        professionalSummary:
            "This is a MOCK résumé generated because ETCHA_MOCK=true. " +
            "It is used for testing the application flow without calling the Gemini API.",
        coreSkills: (user?.skills && user.skills.length) ? user.skills : ["JavaScript", "React", "Node.js"],
        education: (user?.education || []).map(e => ({
            school: e.school || "School",
            degree: e.degree || "Degree",
            fieldOfStudy: e.fieldOfStudy || "",
            duration: e.duration || ""
        })),
        experience: (user?.experience || []).map(e => ({
            title: e.designation || "Role",
            company: e.company_name || "Company",
            duration: `${e.startDate || ''}${e.startDate ? ' - ' : ''}${e.endDate || 'Present'}`,
            location: e.location || "",
            bullets: e.description
                ? [e.description]
                : ["Mock bullet point for testing purposes."]
        })),
        projects: (user?.projects || []).map(p => ({
            title: p.title || "Project",
            description: p.description || "",
            link: p.link || ""
        })),
        certifications: (user?.certifications || []).map(c => ({
            name: c.name || "",
            issuer: c.issuer || "",
            date: c.date || ""
        })),
        keywordsMatched: ["mock", "test"]
    };
}

async function callGeminiWithRetry(body, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY
                },
                body: JSON.stringify(body)
            }
        );

        if (geminiRes.ok) {
            return { ok: true, res: geminiRes };
        }

        const errText = await geminiRes.text();
        lastError = { status: geminiRes.status, body: errText };

        const isRetryable = geminiRes.status === 503 || geminiRes.status === 429;
        if (!isRetryable || attempt === maxRetries) {
            return { ok: false, error: lastError };
        }

        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`Gemini ${geminiRes.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
    }

    return { ok: false, error: lastError };
}

/**
 * Generates an ATS-optimized, strictly truthful resume for `user` tailored to `job`.
 * If the candidate's overall match to the job is very low, instead generates a
 * general, well-structured resume covering ALL of the candidate's real skills
 * and experience (not narrowed to this job) — suitable to reuse across roles.
 * Throws an Error with a `.status` on failure.
 *
 * If process.env.ETCHA_MOCK === "true", returns a fixed mock CV instead of calling
 * the Gemini API.
 */
async function generateResumeForUser(user, job) {
    if (process.env.ETCHA_MOCK === "true") {
        return getMockCV(user, job);
    }

    if (!process.env.GEMINI_API_KEY) {
        const err = new Error("CV generation is not configured. Missing GEMINI_API_KEY.");
        err.status = 500;
        throw err;
    }

    const { matchPercentage } = computeMatchScore(user, job);
    const isLowMatch = matchPercentage < GENERAL_CV_MATCH_THRESHOLD;

    const skillsList = (user.skills && user.skills.length)
        ? user.skills.join(', ')
        : 'Not specified';

    const hasEducation = user.education && user.education.length > 0;
    const educationList = hasEducation
        ? user.education.map(e =>
            `- School: ${e.school || 'Not specified'} | Degree: ${e.degree || 'Not specified'} | Field: ${e.fieldOfStudy || 'Not specified'} | Duration: ${e.duration || 'Not specified'}`
          ).join('\n')
        : 'NONE — this candidate has no education entries on their profile.';

    const hasExperience = user.experience && user.experience.length > 0;
    const experienceList = hasExperience
        ? user.experience.map(e => {
            const range = `${e.startDate || 'Not specified'} - ${e.endDate || 'Present'}`;
            const descLine = e.description
                ? `Candidate's own description of this role: "${e.description}"`
                : `No description provided by the candidate — infer 3-5 plausible, role-typical achievement bullets based on the job title and company, staying conservative and generic (do not invent specific numbers, clients, or technologies not otherwise evidenced elsewhere in this profile).`;
            return `- Role: ${e.designation || 'Not specified'} | Company: ${e.company_name || 'Not specified'} | Duration: ${range} | Location: ${e.location || 'Not specified'}\n  ${descLine}`;
          }).join('\n')
        : 'NONE — this candidate has no work experience entries on their profile.';

    const hasProjects = user.projects && user.projects.length > 0;
    const projectsList = hasProjects
        ? user.projects.map(p =>
            `- Title: ${p.title || 'Not specified'} | Description: ${p.description || 'Not specified'} | Link: ${p.link || 'None'}`
          ).join('\n')
        : 'NONE — this candidate has no projects listed on their profile.';

    const hasCertifications = user.certifications && user.certifications.length > 0;
    const certificationsList = hasCertifications
        ? user.certifications.map(c =>
            `- Name: ${c.name || 'Not specified'} | Issuer: ${c.issuer || 'Not specified'} | Date: ${c.date || 'Not specified'}`
          ).join('\n')
        : 'NONE — this candidate has no certifications listed on their profile.';

    const systemPrompt = `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist with 15 years of experience helping candidates pass automated resume screening for top companies (Workday, Greenhouse, Taleo, iCIMS, Lever style parsers).

CORE PRINCIPLES you must follow:
1. Extract key hard skills, tools, and role-specific terminology from the job description ONLY to decide how to phrase and emphasize the candidate's REAL, existing skills and experience. Never use the job description as a source of new skills, projects, or certifications to add to the candidate.
2. For each experience entry: if the candidate provided their own description of what they did, paraphrase THAT truthfully into 2-4 achievement-style bullets (don't just copy it verbatim, but don't invent facts beyond what they described). If no description was provided, infer 3-5 plausible, generic, role-typical bullets based on the job title and company alone — stay conservative, no fabricated specific numbers/clients/technologies.
3. Use standard, single-column, plain-text-parseable structure. No tables, no icons, no columns.
4. Use strong, varied action verbs at the start of every bullet — never repeat the same starting verb twice in a row or more than twice total.
5. Never fabricate specific employers, job titles, degrees, projects, certifications, or credentials that were not provided by the candidate.
6. Section headers must use standard resume terminology only: "Professional Summary", "Core Skills", "Education", "Experience", "Projects", "Certifications".
7. ABSOLUTE RULE — TRUTHFULNESS: Only include a skill, tool, school, degree, project, or certification if it is explicitly present in the candidate's data provided below.
8. EMPTY SECTIONS RULE: If a section is marked "NONE" below, return an EMPTY array for it — do not fabricate entries.
${isLowMatch ? `9. GENERAL RESUME MODE — this candidate's background has very little real overlap with this specific job (computed match: ${matchPercentage}%). Do NOT force-fit job-description keywords into the resume, and do NOT omit or downplay any of the candidate's real skills or experience entries to make it look targeted. Include ALL of the candidate's real skills and ALL of their real experience entries — produce a clean, general, well-structured, strictly truthful resume of their FULL background, suitable for applying broadly across roles, not narrowed to this one job. It's expected that "keywordsMatched" will be empty or very short in this mode.` : ''}

Field rules for the JSON you produce:
- fullName, targetJobTitle, location: strings.
- professionalSummary: 3-4 sentences, resume-summary style (no "I")${isLowMatch ? ', written generally around the candidate\'s full real background rather than tailored to this specific job' : ', naturally weaving in keywords ONLY where the candidate\'s real background supports them'}.
- coreSkills: array of ALL of the candidate's REAL skills.${isLowMatch ? ' Include every one — do not trim.' : ' Ordered by relevance to this job, most relevant first, but include all of them.'}
- education: array of the candidate's REAL education entries only, each with school/degree/fieldOfStudy/duration. Empty array if candidate has none.
- experience: array preserving EVERY real role given, same order, each with title/company/duration/location/bullets. Empty array if candidate has none.
- projects: array of the candidate's REAL projects only. Empty array if candidate has none.
- certifications: array of the candidate's REAL certifications only. Empty array if candidate has none.
- keywordsMatched: array of terms from the job description this resume genuinely and truthfully incorporates.${isLowMatch ? ' May be empty — do not pad it.' : ''}`;

    const userPrompt = `Create a ${isLowMatch ? 'general, well-structured, full-background' : 'tailored, ATS-optimized'}, and strictly truthful resume for this candidate${isLowMatch ? '' : ' applying to this specific job'}. Only use skills, education, experience, projects, and certifications the candidate actually has.

=== CANDIDATE PROFILE ===
Full Name: ${user.f_name || 'Not specified'}
Current Headline: ${user.headline || 'Not specified'}
Current Company: ${user.curr_company || 'Not specified'}
Current Location: ${user.curr_location || 'Not specified'}
About / Bio: ${user.about || 'Not specified'}
Existing Skills: ${skillsList}

Education:
${educationList}

Work Experience:
${experienceList}

Projects:
${projectsList}

Certifications:
${certificationsList}

=== TARGET JOB ===
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Employment Type: ${job.type}
Short Description: ${job.description || 'Not specified'}
Full Job Description: ${job.fullDescription || job.description || 'Not specified'}

Generate the resume content now as a single JSON object matching the schema in your instructions.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            fullName: { type: "STRING" },
            targetJobTitle: { type: "STRING" },
            location: { type: "STRING" },
            professionalSummary: { type: "STRING" },
            coreSkills: { type: "ARRAY", items: { type: "STRING" } },
            education: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        school: { type: "STRING" },
                        degree: { type: "STRING" },
                        fieldOfStudy: { type: "STRING" },
                        duration: { type: "STRING" }
                    },
                    required: ["school", "degree"]
                }
            },
            experience: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        company: { type: "STRING" },
                        duration: { type: "STRING" },
                        location: { type: "STRING" },
                        bullets: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    required: ["title", "company", "duration", "location", "bullets"]
                }
            },
            projects: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        description: { type: "STRING" },
                        link: { type: "STRING" }
                    },
                    required: ["title", "description"]
                }
            },
            certifications: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        name: { type: "STRING" },
                        issuer: { type: "STRING" },
                        date: { type: "STRING" }
                    },
                    required: ["name", "issuer"]
                }
            },
            keywordsMatched: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["fullName", "targetJobTitle", "location", "professionalSummary", "coreSkills", "education", "experience", "projects", "certifications", "keywordsMatched"]
    };

    const requestBody = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    const result = await callGeminiWithRetry(requestBody);

    if (!result.ok) {
        console.error("Gemini API error after retries:", result.error.status, result.error.body);
        const err = new Error(
            (result.error.status === 503 || result.error.status === 429)
                ? "The AI service is currently busy. Please try again in a moment."
                : "Failed to generate CV. Please try again."
        );
        err.status = 502;
        throw err;
    }

    const data = await result.res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
        console.error("Unexpected Gemini response shape:", JSON.stringify(data));
        const err = new Error("Failed to generate CV. Please try again.");
        err.status = 502;
        throw err;
    }

    try {
        return JSON.parse(rawContent);
    } catch (parseErr) {
        console.error("Failed to parse Gemini response:", rawContent);
        const err = new Error("Failed to parse the generated CV.");
        err.status = 502;
        throw err;
    }
}

module.exports = { generateResumeForUser };