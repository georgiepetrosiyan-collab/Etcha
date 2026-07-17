//E/E-backend/utils/matchScore.js

const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'to', 'of', 'in', 'on',
    'at', 'by', 'with', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this',
    'that', 'these', 'those', 'it', 'its', 'their', 'they', 'he', 'she', 'we', 'you', 'your',
    'our', 'i', 'me', 'my', 'will', 'shall', 'can', 'could', 'should', 'would', 'may', 'might',
    'must', 'not', 'no', 'do', 'does', 'did', 'has', 'have', 'had', 'job', 'role', 'position',
    'company', 'team', 'work', 'experience', 'years', 'year', 'skills', 'required',
    'requirements', 'responsibilities', 'including', 'etc', 'strong', 'ability', 'looking',
    'candidate', 'about', 'with'
]);

function tokenize(text) {
    if (!text) return [];
    return (text.toLowerCase().match(/[a-z0-9+#./]{3,}/g) || [])
        .filter(tok => !STOPWORDS.has(tok));
}

function buildCandidateKeywordSet(user) {
    const parts = [];
    if (user.headline) parts.push(user.headline);
    if (user.about) parts.push(user.about);
    if (user.skills && user.skills.length) parts.push(user.skills.join(' '));
    if (user.experience && user.experience.length) {
        user.experience.forEach(e => {
            if (e.designation) parts.push(e.designation);
            if (e.company_name) parts.push(e.company_name);
        });
    }
    return new Set(tokenize(parts.join(' ')));
}

function buildJobKeywordSet(job) {
    const parts = [job.title, job.description, job.fullDescription].filter(Boolean);
    return new Set(tokenize(parts.join(' ')));
}

/**
 * Computes a deterministic 0-100 match score between a candidate profile and a job,
 * based on the candidate's stated skills appearing in the job text plus general
 * keyword overlap. Runs entirely locally, no external API calls, safe to run per-item
 * across a full job list or friend list.
 */
function computeMatchScore(user, job) {
    const candidateSkills = (user.skills || []).map(s => (s || '').trim()).filter(Boolean);
    const jobTextBlob = [job.title, job.description, job.fullDescription]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const matchedSkills = candidateSkills.filter(skill =>
        jobTextBlob.includes(skill.toLowerCase())
    );

    const skillCoverage = candidateSkills.length > 0
        ? matchedSkills.length / candidateSkills.length
        : 0;

    const candidateKeywords = buildCandidateKeywordSet(user);
    const jobKeywords = buildJobKeywordSet(job);

    let overlapCount = 0;
    jobKeywords.forEach(word => {
        if (candidateKeywords.has(word)) overlapCount++;
    });

    const keywordOverlap = jobKeywords.size > 0
        ? overlapCount / jobKeywords.size
        : 0;

    let percentage = Math.round((skillCoverage * 0.6 + keywordOverlap * 0.4) * 100);

    if (matchedSkills.length > 0) {
        percentage = Math.min(100, percentage + 5);
    }

    percentage = Math.max(0, Math.min(100, percentage));

    return { matchPercentage: percentage, matchedSkills };
}

module.exports = { computeMatchScore };