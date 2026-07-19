//E/E-backend/utils/matchScore.js

// Curated dictionary of real skills/technologies/degrees/methodologies.
// The ATS only ever matches against terms in this list — never raw English
// words from free-text prose — so generic words (like "requirements") can
// never show up as a "keyword".
const SKILL_DICTIONARY = [
    // Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'golang',
    'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less',
    'dart', 'perl', 'objective-c', 'bash', 'shell scripting',
    // Frontend
    'react', 'react.js', 'vue', 'vue.js', 'angular', 'next.js', 'nuxt.js', 'svelte',
    'redux', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'jquery', 'webpack',
    'vite', 'graphql', 'rest api', 'restful', 'websocket',
    // Backend
    'node.js', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'laravel', 'ruby on rails', '.net', 'asp.net', 'nestjs',
    // Databases
    'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'elasticsearch',
    'dynamodb', 'firebase', 'firestore', 'oracle', 'cassandra', 'mariadb',
    // Cloud / DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible',
    'jenkins', 'ci/cd', 'devops', 'nginx', 'linux', 'unix', 'git', 'github', 'gitlab',
    'bitbucket', 'serverless', 'lambda', 'cloudformation',
    // Data / AI
    'machine learning', 'deep learning', 'data science', 'data analysis', 'data engineering',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'nlp', 'computer vision',
    'tableau', 'power bi', 'excel', 'etl', 'big data', 'spark', 'hadoop', 'data modeling',
    // Mobile
    'ios', 'android', 'react native', 'flutter', 'xamarin',
    // Testing / QA
    'unit testing', 'jest', 'mocha', 'cypress', 'selenium', 'qa', 'test automation',
    'manual testing', 'tdd', 'bdd',
    // Methodologies / PM
    'agile', 'scrum', 'kanban', 'waterfall', 'project management', 'product management',
    'jira', 'confluence', 'stakeholder management', 'roadmapping',
    // Design
    'figma', 'sketch', 'adobe xd', 'ui/ux', 'ui design', 'ux design', 'photoshop', 'illustrator',
    // Soft skills
    'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
    'time management', 'collaboration', 'mentoring', 'public speaking', 'negotiation',
    // Marketing / Business
    'seo', 'sem', 'google analytics', 'content marketing', 'social media marketing',
    'email marketing', 'crm', 'salesforce', 'hubspot', 'copywriting', 'branding',
    // Degrees / education
    "bachelor's degree", "master's degree", 'phd', 'doctorate', "associate degree",
    'computer science', 'software engineering', 'information technology', 'data science degree',
    'business administration', 'mba', 'electrical engineering', 'mechanical engineering',
    'mathematics', 'statistics', 'finance', 'economics', 'marketing degree',
    // Security
    'cybersecurity', 'penetration testing', 'network security', 'encryption', 'oauth',
    'authentication', 'authorization',
];

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Alphanumeric-only terms get a real word-boundary match (avoids "sql" matching
// inside "sqlserverless" etc). Terms with special characters (c++, c#, ci/cd,
// node.js, .net) fall back to a plain substring match on normalized text, since
// \b doesn't work reliably around symbols.
function termAppearsIn(term, normalizedText) {
    const isPlainAlnum = /^[a-z0-9 ]+$/i.test(term);
    if (isPlainAlnum) {
        const pattern = new RegExp(`\\b${escapeRegex(term.toLowerCase())}\\b`, 'i');
        return pattern.test(normalizedText);
    }
    return normalizedText.includes(term.toLowerCase());
}

function extractDictionaryTerms(text) {
    if (!text) return new Set();
    const normalized = text.toLowerCase();
    const found = new Set();
    SKILL_DICTIONARY.forEach(term => {
        if (termAppearsIn(term, normalized)) {
            found.add(term);
        }
    });
    return found;
}

function buildJobDictionaryTerms(job) {
    const text = [job.title, job.description, job.fullDescription].filter(Boolean).join(' ');
    return extractDictionaryTerms(text);
}

/**
 * Candidate's real, structured profile data — skills the user explicitly listed,
 * plus dictionary terms found in education (degree/field) and experience
 * (designation/company/description). Never touches free-text "about" prose.
 */
function buildCandidateDictionaryTerms(user) {
    const terms = new Set();

    (user.skills || []).forEach(s => {
        if (s) terms.add(s.trim().toLowerCase());
    });

    const structuredText = [];
    (user.education || []).forEach(e => {
        if (e.degree) structuredText.push(e.degree);
        if (e.fieldOfStudy) structuredText.push(e.fieldOfStudy);
    });
    (user.experience || []).forEach(e => {
        if (e.designation) structuredText.push(e.designation);
        if (e.description) structuredText.push(e.description);
    });

    extractDictionaryTerms(structuredText.join(' ')).forEach(t => terms.add(t));
    return terms;
}

/**
 * Same idea but reading from a generated/submitted résumé (CV object) instead
 * of the raw user profile — used by the ATS check.
 */
function buildCVDictionaryTerms(cv) {
    const terms = new Set();

    (cv.coreSkills || []).forEach(s => {
        if (s) terms.add(s.trim().toLowerCase());
    });

    const structuredText = [];
    (cv.education || []).forEach(e => {
        if (e.degree) structuredText.push(e.degree);
        if (e.fieldOfStudy) structuredText.push(e.fieldOfStudy);
    });
    (cv.experience || []).forEach(e => {
        if (e.title) structuredText.push(e.title);
        if (e.bullets && e.bullets.length) structuredText.push(e.bullets.join(' '));
    });

    extractDictionaryTerms(structuredText.join(' ')).forEach(t => terms.add(t));
    return terms;
}

/**
 * Deterministic 0-100 match score between a candidate profile and a job,
 * based purely on dictionary-recognized skills/education/experience overlap.
 * Local/offline, safe to run across a full job list or friend list.
 */
function computeMatchScore(user, job) {
    const jobTerms = buildJobDictionaryTerms(job);
    const candidateTerms = buildCandidateDictionaryTerms(user);

    if (jobTerms.size === 0) {
        return { matchPercentage: 0, matchedSkills: [] };
    }

    const matched = [...jobTerms].filter(t => candidateTerms.has(t));
    const percentage = Math.round((matched.length / jobTerms.size) * 100);

    return { matchPercentage: percentage, matchedSkills: matched };
}

/**
 * Compares a submitted résumé (CV object) against a job description using
 * only dictionary-recognized skill/education/experience terms — this is the
 * "real" ATS check surfaced to job posters.
 */
function computeATSAnalysis(cv, job) {
    if (!cv) {
        return { score: 0, matchedKeywords: [], missingKeywords: [], totalKeywords: 0 };
    }

    const jobTerms = buildJobDictionaryTerms(job);
    const cvTerms = buildCVDictionaryTerms(cv);

    const matchedKeywords = [];
    const missingKeywords = [];

    jobTerms.forEach(term => {
        if (cvTerms.has(term)) {
            matchedKeywords.push(term);
        } else {
            missingKeywords.push(term);
        }
    });

    const totalKeywords = jobTerms.size;
    const score = totalKeywords > 0
        ? Math.round((matchedKeywords.length / totalKeywords) * 100)
        : 0;

    matchedKeywords.sort();
    missingKeywords.sort();

    return { score, matchedKeywords, missingKeywords, totalKeywords };
}

module.exports = { computeMatchScore, computeATSAnalysis };