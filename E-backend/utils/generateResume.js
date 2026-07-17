//E/E-backend/utils/generateResume.js

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        experience: (user?.experience || []).map(e => ({
            title: e.designation || "Role",
            company: e.company_name || "Company",
            duration: e.duration || "",
            location: e.location || "",
            bullets: ["Mock bullet point for testing purposes."]
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
 * Omits sections the candidate has no real data for (experience, projects, certifications)
 * rather than fabricating placeholder entries.
 * Throws an Error with a `.status` on failure.
 *
 * If process.env.ETCHA_MOCK === "true", returns a fixed mock CV instead of calling
 * the Gemini API — useful for testing the apply/refer flow without burning quota.
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

    const skillsList = (user.skills && user.skills.length)
        ? user.skills.join(', ')
        : 'Not specified';

    const hasExperience = user.experience && user.experience.length > 0;
    const experienceList = hasExperience
        ? user.experience.map(e =>
            `- Role: ${e.designation || 'Not specified'} | Company: ${e.company_name || 'Not specified'} | Duration: ${e.duration || 'Not specified'} | Location: ${e.location || 'Not specified'}`
          ).join('\n')
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

CORE ATS OPTIMIZATION PRINCIPLES you must follow:
1. Extract the key hard skills, tools, certifications, and role-specific terminology directly from the job description (the "target keywords") — but ONLY to decide how to phrase and emphasize the candidate's REAL, existing skills and experience. Never use the job description as a source of new skills, projects, or certifications to add to the candidate.
2. Integrate target keywords NATURALLY throughout the summary and experience bullets — only where the candidate's actual documented background genuinely supports that keyword. NEVER stuff unrelated keywords in just to pad the count, never repeat a keyword more than 2-3 times total.
3. Use standard, single-column, plain-text-parseable structure. No tables, no icons, no columns.
4. Use strong, varied action verbs at the start of every bullet — never repeat the same starting verb twice in a row or more than twice total.
5. Include quantifiable, plausible achievements conservatively inferred from context. Never fabricate specific employers, job titles, degrees, projects, certifications, or credentials that were not provided by the candidate.
6. Section headers must use standard resume terminology only: "Professional Summary", "Core Skills", "Experience", "Projects", "Certifications".
7. ABSOLUTE RULE — TRUTHFULNESS: Only include a skill, tool, technology, project, or certification if it is explicitly present in the candidate's data provided below. Never invent, assume, or infer unstated items, even if the job description mentions them.
8. EMPTY SECTIONS RULE — CRITICAL: If the candidate has NO work experience entries (marked "NONE" below), return an EMPTY array for "experience" — do not invent a placeholder job. Apply the same rule independently to "projects" and "certifications": if marked "NONE", return an empty array for that field. Do not fabricate entries to fill a section.

Field rules for the JSON you produce:
- fullName, targetJobTitle, location: strings.
- professionalSummary: 3-4 sentences, resume-summary style (no "I"), naturally weaving in keywords ONLY where the candidate's real background supports them. If the candidate has very little real data, keep the summary honest and modest rather than padded.
- coreSkills: array of the candidate's REAL skills only. Ordered by relevance to this job, most relevant first.
- experience: array preserving every real role given, same order, each with title/company/duration/location/bullets (3-5 achievement bullets). Empty array if candidate has none.
- projects: array of the candidate's REAL projects only, each with title, description (1-2 sentences, may lightly emphasize relevance to the target job if genuinely applicable), and link (omit or empty string if none). Empty array if candidate has none.
- certifications: array of the candidate's REAL certifications only, each with name, issuer, date. Empty array if candidate has none.
- keywordsMatched: array of terms from the job description this resume genuinely and truthfully incorporates.`;

    const userPrompt = `Create a tailored, ATS-optimized, and strictly truthful resume for this candidate applying to this specific job. Only use skills, experience, projects, and certifications the candidate actually has. Omit any section with no real underlying data rather than fabricating content.

=== CANDIDATE PROFILE ===
Full Name: ${user.f_name || 'Not specified'}
Current Headline: ${user.headline || 'Not specified'}
Current Company: ${user.curr_company || 'Not specified'}
Current Location: ${user.curr_location || 'Not specified'}
About / Bio: ${user.about || 'Not specified'}
Existing Skills: ${skillsList}

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
        required: ["fullName", "targetJobTitle", "location", "professionalSummary", "coreSkills", "experience", "projects", "certifications", "keywordsMatched"]
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