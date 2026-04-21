const ACTION_VERBS = [
  "achieved", "administered", "analyzed", "architected", "automated", "boosted", "built", "championed", "collaborated",
  "conceived", "conducted", "consolidated", "created", "debugged", "decreased", "delivered", "deployed", "designed",
  "developed", "directed", "drove", "elevated", "enabled", "engineered", "enhanced", "established", "evaluated",
  "executed", "expanded", "expedited", "forecasted", "formed", "generated", "guided", "implemented", "improved",
  "increased", "initiated", "innovated", "integrated", "launched", "led", "managed", "mentored", "modernized",
  "negotiated", "optimized", "orchestrated", "organized", "oversaw", "pioneered", "planned", "presented", "produced",
  "programmed", "promoted", "reduced", "refined", "resolved", "revamped", "scaled", "simplified", "solved",
  "spearheaded", "streamlined", "strengthened", "supervised", "supported", "tested", "transformed", "upgraded",
  "validated", "won"
];

const RESULT_TERMS = [
  "improved", "reduced", "increased", "automated", "launched", "delivered", "optimized", "saved", "boosted", "grew",
  "accelerated", "raised", "cut", "expanded", "streamlined", "enhanced", "won", "generated", "drove", "lifted"
];

const BUZZWORDS = [
  "hardworking", "team player", "detail-oriented", "go-getter", "synergy", "results-driven", "dynamic", "passionate",
  "self-starter", "problem-solver", "think outside the box", "fast learner", "motivated professional", "ninja", "guru"
];

const PLACEHOLDERS = [
  "lorem ipsum", "your summary", "write summary", "add summary", "bullet point", "project name", "company name"
];

const ATS_SECTION_WEIGHTS = {
  personal: 18,
  summary: 10,
  skills: 15,
  experience: 28,
  education: 8,
  projects: 15,
  credentials: 6,
};

const JD_IMPORTANCE_WEIGHTS = { must: 3, preferred: 2, nice: 1 };
const SENIORITY_WORDS = ["intern", "junior", "associate", "mid", "senior", "lead", "principal", "manager", "director"];
const JD_SKILLS_CATEGORIES = new Set(["technical skills", "tools / software", "frameworks", "ai/ml", "cloud platforms", "databases", "analytics"]);

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value);
}

function text(value) {
  return (value || "").toString().trim();
}

function normalize(value) {
  return text(value).toLowerCase();
}

function words(value) {
  return text(value).split(/\s+/).filter(Boolean);
}

function sentenceLike(value) {
  return normalize(value).replace(/[^\w\s/+.#-]/g, " ").replace(/\s+/g, " ").trim();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function escapeRegExp(value) {
  return text(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function significantTokens(value) {
  return unique(
    sentenceLike(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length > 1)
  );
}

function buildTermPattern(term) {
  const normalized = sentenceLike(term);
  if (!normalized) return null;
  const parts = normalized.split(" ").filter(Boolean).map(escapeRegExp);
  if (!parts.length) return null;
  return new RegExp(`(^|[^a-z0-9])${parts.join("\\s+")}($|[^a-z0-9])`, "i");
}

function hasWholeTerm(textBlock, term) {
  const pattern = buildTermPattern(term);
  return pattern ? pattern.test(textBlock) : false;
}

function isShortTechnicalTerm(term) {
  const normalized = sentenceLike(term).replace(/\s+/g, "");
  return normalized.length > 0 && normalized.length <= 3;
}

function isSafeEquivalentAlias(keyword, alias) {
  const normalizedKeyword = sentenceLike(keyword);
  const normalizedAlias = sentenceLike(alias);
  if (!normalizedAlias || normalizedAlias === normalizedKeyword) return true;
  if (isShortTechnicalTerm(normalizedAlias)) return false;
  if (normalizedAlias.split(" ").length >= 2) return true;
  return normalizedAlias.length >= 4 && normalizedKeyword.length <= 4;
}

function relatedTokenCoverage(textBlock, term) {
  const tokens = significantTokens(term);
  if (!tokens.length) return 0;
  const matched = tokens.filter((token) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(token)}($|[^a-z0-9])`, "i").test(textBlock)).length;
  return matched / tokens.length;
}

function deriveRecommendedSection(requirement) {
  const evidenceTarget = normalize(requirement.evidenceTarget);
  const category = normalize(requirement.category);
  if (evidenceTarget.includes("cert")) return "certifications";
  if (evidenceTarget.includes("project")) return "projects";
  if (evidenceTarget.includes("summary")) return "summary";
  if (evidenceTarget.includes("experience")) return "experience";
  if (JD_SKILLS_CATEGORIES.has(category)) return "skills";
  if (category === "domain skills") return "experience";
  return "skills";
}

function isUrlLike(value) {
  return /^https?:\/\/|^[\w.-]+\.[a-z]{2,}/i.test(text(value));
}

function getDatePattern(value) {
  const v = normalize(value);
  if (!v) return "missing";
  if (/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/.test(v)) return "month-year";
  if (/\b\d{4}\s*-\s*(present|current|\d{4})\b/.test(v)) return "year-range";
  if (/\b\d{2}\/\d{4}\b/.test(v)) return "mm-yyyy";
  if (/\b\d{4}\b/.test(v)) return "year";
  return "other";
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function distinctSkillList(data) {
  return unique(
    ensureArray(data?.skills)
      .flatMap((skill) => text(skill.items).split(","))
      .map((item) => sentenceLike(item))
  );
}

function allBullets(data) {
  return [
    ...ensureArray(data?.experience).flatMap((item) => ensureArray(item?.bullets)),
    ...ensureArray(data?.projects).flatMap((item) => ensureArray(item?.bullets)),
  ].map(text).filter(Boolean);
}

function experienceBullets(data) {
  return ensureArray(data?.experience).flatMap((item) => ensureArray(item?.bullets)).map(text).filter(Boolean);
}

export function buildResumeSnapshot(data) {
  const safeData = data && typeof data === "object" ? data : {};
  const personal = safeData.personal && typeof safeData.personal === "object" ? safeData.personal : {};
  const skills = ensureArray(safeData.skills);
  const experience = ensureArray(safeData.experience);
  const projects = ensureArray(safeData.projects);
  const education = ensureArray(safeData.education);
  const certifications = ensureArray(safeData.certifications);
  const achievements = ensureArray(safeData.achievements);
  const summary = text(safeData.summary);
  const title = text(personal.title);
  const skillEntries = distinctSkillList(safeData);
  const expEntries = experience.map((item) => ({
    ...item,
    role: text(item.role),
    company: text(item.company),
    bullets: ensureArray(item?.bullets).map(text).filter(Boolean),
  }));
  const projectEntries = projects.map((item) => ({
    ...item,
    name: text(item.name),
    tech: text(item.tech),
    bullets: ensureArray(item?.bullets).map(text).filter(Boolean),
  }));
  const educationEntries = education.map((item) => ({
    ...item,
    degree: text(item.degree),
    institution: text(item.institution),
  }));
  const certificationEntries = certifications.map((item) => ({
    ...item,
    name: text(item.name),
  }));
  const achievementEntries = achievements.map((item) => ({
    ...item,
    title: text(item.title),
  }));

  const parts = [
    personal.name, title, summary,
    skills.map((skill) => `${text(skill?.category)} ${text(skill?.items)}`).join(" "),
    expEntries.map((item) => [item.role, item.company, ...(item.bullets || [])].join(" ")).join(" "),
    projectEntries.map((item) => [item.name, item.tech, ...(item.bullets || [])].join(" ")).join(" "),
    educationEntries.map((item) => [item.degree, item.institution].join(" ")).join(" "),
    certificationEntries.map((item) => item.name).join(" "),
    achievementEntries.map((item) => item.title).join(" "),
  ];

  return {
    title,
    summary,
    skillEntries,
    expEntries,
    projectEntries,
    educationEntries,
    certificationEntries,
    achievementEntries,
    allBullets: allBullets(safeData),
    experienceBullets: experienceBullets(safeData),
    fullText: parts.filter(Boolean).join("\n").trim(),
    fullTextNormalized: sentenceLike(parts.filter(Boolean).join(" ")),
    wordCount: words(parts.filter(Boolean).join(" ")).length,
    personal,
  };
}

function hasPlaceholder(value) {
  const normalized = normalize(value);
  return PLACEHOLDERS.some((token) => normalized.includes(token));
}

function hasMeaningfulResumeContent(snapshot) {
  return !!(
    text(snapshot.personal.name) ||
    text(snapshot.personal.email) ||
    text(snapshot.personal.phone) ||
    text(snapshot.personal.linkedin) ||
    text(snapshot.summary) ||
    snapshot.skillEntries.length > 0 ||
    snapshot.expEntries.some((item) => item.role || item.company || (item.bullets || []).some(Boolean)) ||
    snapshot.educationEntries.some((item) => item.degree || item.institution) ||
    snapshot.projectEntries.some((item) => item.name || item.tech || (item.bullets || []).some(Boolean)) ||
    snapshot.certificationEntries.some((item) => item.name) ||
    snapshot.achievementEntries.some((item) => item.title)
  );
}

function scoreSectionCompleteness(snapshot) {
  const personalFields = ["name", "email", "phone", "linkedin"].filter((field) => text(snapshot.personal[field])).length;
  const hasLocation = !!text(snapshot.personal.location);
  const skillsCount = snapshot.skillEntries.length;
  const validExperienceEntries = snapshot.expEntries.filter((item) => item.role && item.company);
  const hasEducation = snapshot.educationEntries.some((item) => item.degree && item.institution);
  const hasProjects = snapshot.projectEntries.some((item) => item.name);
  const hasCertifications = snapshot.certificationEntries.some((item) => item.name);
  const hasAchievements = snapshot.achievementEntries.some((item) => item.title && item.title.length > 3);
  const summaryWordCount = words(snapshot.summary).length;

  const sections = {
    personal: personalFields >= 4 ? (hasLocation ? 1 : 0.9) : personalFields >= 3 ? 0.5 : 0,
    summary: snapshot.summary && !hasPlaceholder(snapshot.summary)
      ? (summaryWordCount >= 40 && summaryWordCount <= 90 ? 1 : 0.5)
      : 0,
    skills: skillsCount >= 8 ? 1 : skillsCount >= 4 ? 0.5 : 0,
    experience: validExperienceEntries.length >= 1
      ? (snapshot.experienceBullets.length >= 2 ? 1 : 0.5)
      : 0,
    education: hasEducation ? 1 : 0,
    projects: hasProjects ? 1 : 0,
    credentials: hasCertifications || hasAchievements ? 1 : 0,
  };

  const score = Object.entries(ATS_SECTION_WEIGHTS).reduce((sum, [key, weight]) => sum + weight * (sections[key] || 0), 0);
  return { score: clamp(score), sections };
}

function scoreActionEvidence(snapshot) {
  const bullets = snapshot.allBullets;
  const uniqueBullets = unique(bullets.map(sentenceLike));
  const quantBullets = uniqueBullets.filter((bullet) => /(\d+%|\$\d+|\b\d+(?:\.\d+)?\s*(?:x|k|m|b)\b|\b\d+\+|\b\d+\s*(hours|days|weeks|months|years|users|clients|projects|features|pipelines|models|tickets|records|reports|dashboards)\b|\b(?:cut|reduced|saved|improved)\s+\w+\s+by\s+\d+%)/i.test(bullet));
  const verbBullets = uniqueBullets.filter((bullet) => ACTION_VERBS.some((verb) => new RegExp(`^${verb}\\b`, "i").test(bullet.trim())));
  const resultBullets = uniqueBullets.filter((bullet) => RESULT_TERMS.some((term) => bullet.includes(term)));

  const quantifiedImpact = clamp((quantBullets.length / 4) * 100);
  const actionVerbQuality = clamp((verbBullets.length / 8) * 100);
  const outcomeLanguage = clamp((resultBullets.length / 5) * 100);

  const score = (quantifiedImpact * 0.38) + (actionVerbQuality * 0.32) + (outcomeLanguage * 0.3);
  return {
    score: clamp(score),
    details: { quantifiedImpact, actionVerbQuality, outcomeLanguage, quantBullets: quantBullets.length, verbBullets: verbBullets.length },
  };
}

function inferRoleFamily(snapshot) {
  const roleText = sentenceLike([
    snapshot.title,
    ...snapshot.expEntries.map((item) => item.role),
    ...snapshot.projectEntries.map((item) => item.name),
    ...snapshot.skillEntries,
  ].join(" "));

  if (/\b(machine learning|ml|llm|nlp|ai engineer|ai trainer|data annotation|evaluation|prompt|model|dataset|rag)\b/.test(roleText)) return "ai_ml";
  if (/\b(data analyst|analytics|business intelligence|power bi|tableau|sql|dashboard|reporting|kpi)\b/.test(roleText)) return "data_analytics";
  if (/\b(?:software|frontend|backend|full stack|developer|engineer|react|node|api|microservice|devops|cloud)\b/.test(roleText)) return "software_engineering";
  return "general";
}

function buildSignalKeywordInventory(snapshot, roleFamily = "general") {
  const stopwords = new Set(["and", "with", "for", "the", "using", "built", "designed", "developed", "analysis", "experience", "project", "role"]);
  const seeds = [
    ...snapshot.skillEntries,
    ...snapshot.projectEntries.flatMap((item) => [item.name, item.tech, ...(item.bullets || [])]),
    ...snapshot.expEntries.flatMap((item) => [item.role, ...(item.bullets || [])]),
    snapshot.title,
    snapshot.summary,
  ];

  const candidates = new Set();
  seeds.forEach((seed) => {
    const normalizedSeed = sentenceLike(seed);
    if (!normalizedSeed) return;
    if (normalizedSeed.split(" ").length <= 4 && normalizedSeed.length >= 2 && !stopwords.has(normalizedSeed)) {
      candidates.add(normalizedSeed);
    }
    normalizedSeed.split(" ").forEach((token) => {
      if (token.length >= 2 && !stopwords.has(token)) candidates.add(token);
    });
  });

  const roleHints = {
    software_engineering: ["javascript", "typescript", "react", "node", "api", "docker", "kubernetes", "ci cd", "backend", "frontend"],
    data_analytics: ["sql", "power bi", "tableau", "dashboard", "analytics", "reporting", "kpi", "etl", "python"],
    ai_ml: ["machine learning", "llm", "prompt", "evaluation", "dataset", "model", "training", "nlp", "rag", "annotation"],
    general: [],
  };

  roleHints[roleFamily].forEach((hint) => candidates.add(hint));
  return [...candidates].filter(Boolean);
}

function scoreKeywordSpread(snapshot, roleFamily = "general") {
  const keywords = buildSignalKeywordInventory(snapshot, roleFamily);
  const textBlocks = {
    title: sentenceLike(snapshot.title),
    summary: sentenceLike(snapshot.summary),
    skills: sentenceLike(snapshot.skillEntries.join(" ")),
    experience: sentenceLike(snapshot.expEntries.map((item) => `${item.role} ${(item.bullets || []).join(" ")}`).join(" ")),
    projects: sentenceLike(snapshot.projectEntries.map((item) => `${item.name} ${item.tech} ${(item.bullets || []).join(" ")}`).join(" ")),
  };

  const tracked = keywords.map((keyword) => {
    const presentIn = Object.entries(textBlocks)
      .filter(([, block]) => hasWholeTerm(block, keyword))
      .map(([section]) => section);
    if (!presentIn.length) return null;

    const sectionCount = presentIn.length;
    let spreadCredit = 0.35;
    if (presentIn.includes("skills") && (presentIn.includes("experience") || presentIn.includes("projects"))) spreadCredit = 1;
    else if (presentIn.includes("experience") && presentIn.includes("projects")) spreadCredit = 0.9;
    else if (presentIn.includes("skills")) spreadCredit = 0.5;
    else if (presentIn.includes("experience") || presentIn.includes("projects")) spreadCredit = 0.65;

    if (sectionCount > 2) spreadCredit *= 0.9;

    return { keyword, presentIn, spreadCredit };
  }).filter(Boolean);

  const distinctKeywords = tracked.length;
  const densityScore = clamp((distinctKeywords / 18) * 100);
  const spreadScore = tracked.length ? clamp((tracked.reduce((sum, item) => sum + item.spreadCredit, 0) / tracked.length) * 100) : 0;
  const score = clamp((densityScore * 0.55) + (spreadScore * 0.45));

  return {
    score,
    details: {
      distinctKeywords,
      densityScore: round(densityScore),
      spreadScore: round(spreadScore),
      trackedKeywords: tracked.slice(0, 24),
    },
  };
}

function scoreParseSafety(snapshot, parseMeta = {}) {
  const datePatterns = unique([
    ...snapshot.expEntries.map((item) => getDatePattern(item.duration)),
    ...snapshot.educationEntries.map((item) => getDatePattern(item.year)),
  ].filter((value) => value !== "missing"));

  const dateConsistency = datePatterns.length <= 2 ? 100 : 60;
  const linkSignals = [snapshot.personal.linkedin, snapshot.personal.github, snapshot.personal.portfolio].filter((value) => isUrlLike(value)).length > 0 ? 100 : 55;
  const bulletValidity = snapshot.allBullets.length > 0 && snapshot.allBullets.every((bullet) => words(bullet).length >= 2) ? 100 : snapshot.allBullets.length ? 60 : 30;
  const wordCountScore = snapshot.wordCount >= 350 && snapshot.wordCount <= 900 ? 100 : snapshot.wordCount >= 250 && snapshot.wordCount <= 1100 ? 70 : 35;
  const headingsScore = snapshot.expEntries.some((item) => item.role) && snapshot.educationEntries.some((item) => item.degree) && snapshot.projectEntries.some((item) => item.name) ? 100 : 65;
  const hygieneScore = clamp((dateConsistency * 0.22) + (linkSignals * 0.16) + (bulletValidity * 0.2) + (wordCountScore * 0.22) + (headingsScore * 0.2));

  let parseConfidence = 100;
  const inputPath = parseMeta?.source === "upload" ? "upload" : "builder";
  const meaningfulContent = hasMeaningfulResumeContent(snapshot);
  if (!meaningfulContent) {
    parseConfidence = 0;
  } else if (inputPath === "builder") {
    parseConfidence = 85;
  } else {
    const sectionFillRatio = [
      !!snapshot.personal.name,
      !!snapshot.summary,
      snapshot.skillEntries.length > 0,
      snapshot.expEntries.some((item) => item.role),
      snapshot.educationEntries.some((item) => item.degree),
      snapshot.projectEntries.some((item) => item.name),
      snapshot.certificationEntries.some((item) => item.name),
      snapshot.achievementEntries.some((item) => item.title),
    ].filter(Boolean).length / 8;
    const fieldCount = [
      snapshot.personal.name, snapshot.personal.email, snapshot.personal.phone, snapshot.summary,
      snapshot.expEntries.some((item) => item.role), snapshot.educationEntries.some((item) => item.degree),
      snapshot.projectEntries.some((item) => item.name), snapshot.skillEntries.length > 0,
    ].filter(Boolean).length;
    const textScore = parseMeta.extractedTextLength >= 1200 ? 100 : parseMeta.extractedTextLength >= 500 ? 70 : 35;
    const dateParseScore = dateConsistency;
    parseConfidence = clamp((sectionFillRatio * 35) + ((fieldCount / 8) * 25) + (textScore * 0.2) + (dateParseScore * 0.1) + (linkSignals * 0.1));
  }

  const score = clamp((parseConfidence * 0.55) + (hygieneScore * 0.45));
  return {
    score: clamp(score),
    parseConfidence: clamp(parseConfidence),
    details: { dateConsistency, linkSignals, bulletValidity, wordCountScore, headingsScore, hygieneScore: round(hygieneScore), inputPath },
  };
}

function scoreLanguageQuality(snapshot, aiReview = null) {
  const bullets = snapshot.allBullets;
  if (!hasMeaningfulResumeContent(snapshot)) {
    return {
      score: 0,
      details: {
        shortBullets: 0,
        longBullets: 0,
        duplicateRate: 0,
        buzzwordHits: 0,
        placeholderHits: 0,
        vaguePhraseHits: 0,
        localScore: 0,
        aiShift: 0,
      },
      aiApplied: false,
    };
  }
  const normalizedBullets = bullets.map(sentenceLike);
  const shortBullets = bullets.filter((bullet) => words(bullet).length < 5).length;
  const longBullets = bullets.filter((bullet) => words(bullet).length > 45).length;
  const duplicateRate = normalizedBullets.length ? 1 - (unique(normalizedBullets).length / normalizedBullets.length) : 0.5;
  const buzzwordHits = BUZZWORDS.filter((term) => snapshot.fullTextNormalized.includes(term)).length;
  const placeholderHits = PLACEHOLDERS.filter((term) => snapshot.fullTextNormalized.includes(term)).length;
  const vaguePhraseHits = ["responsible for", "worked on", "helped with", "involved in"].filter((term) => snapshot.fullTextNormalized.includes(term)).length;

  let base = 100;
  base -= shortBullets * 8;
  base -= longBullets * 5;
  base -= duplicateRate * 32;
  base -= buzzwordHits * 6;
  base -= placeholderHits * 12;
  base -= vaguePhraseHits * 6;

  const localScore = clamp(base);
  const clarityScore = clamp(Number(aiReview?.clarityScore) || 0, 0, 10);
  const specificityScore = clamp(Number(aiReview?.specificityScore) || 0, 0, 10);
  const aiApplied = clarityScore > 0 || specificityScore > 0;
  const aiShift = aiApplied ? clamp((((clarityScore + specificityScore) / 2) - 5) * 2, -10, 10) : 0;
  const score = clamp(localScore + aiShift);

  return {
    score,
    details: {
      shortBullets,
      longBullets,
      duplicateRate: round(duplicateRate * 100),
      buzzwordHits,
      placeholderHits,
      vaguePhraseHits,
      localScore: round(localScore),
      aiShift: round(aiShift),
    },
    aiApplied,
  };
}

export function calculateResumeScore(data, options = {}) {
  const snapshot = buildResumeSnapshot(data);
  if (!hasMeaningfulResumeContent(snapshot)) {
    return {
      overall: 0,
      label: "Needs Work",
      factors: {
        sectionCompleteness: 0,
        actionEvidence: 0,
        keywordSpread: 0,
        parseSafety: 0,
        languageQuality: 0,
      },
      tips: [
        "Add your personal details and LinkedIn URL to start the ATS score.",
        "Fill the 8 resume sections to unlock a meaningful ATS evaluation.",
      ],
      confidence: 0,
      meta: {
        inputPath: options.parseMeta?.source === "upload" ? "upload" : "builder",
        aiLanguageApplied: false,
        roleFamily: "general",
      },
      details: {},
      snapshot,
    };
  }
  const roleFamily = inferRoleFamily(snapshot);
  const sectionCompleteness = scoreSectionCompleteness(snapshot);
  const actionEvidence = scoreActionEvidence(snapshot);
  const keywordSpread = scoreKeywordSpread(snapshot, roleFamily);
  const parseSafety = scoreParseSafety(snapshot, options.parseMeta || {});
  const languageQuality = scoreLanguageQuality(snapshot, options.aiReview || null);

  const overall = clamp(
    (sectionCompleteness.score * 0.22) +
    (actionEvidence.score * 0.26) +
    (keywordSpread.score * 0.18) +
    (parseSafety.score * 0.18) +
    (languageQuality.score * 0.16)
  );

  const tips = [];
  if (sectionCompleteness.sections.personal < 1) tips.push("Add name, email, phone, LinkedIn URL, and location to complete the core contact section.");
  if (sectionCompleteness.sections.summary < 1) tips.push("Keep your summary between 40 and 90 words with a clear target-role focus.");
  if (actionEvidence.details.quantBullets < 4) tips.push("Add more quantified bullets with %, counts, time saved, users, or business impact.");
  if (actionEvidence.details.verbBullets < 5) tips.push("Begin more bullets with strong action verbs like Built, Designed, Automated, or Led.");
  if (keywordSpread.details.distinctKeywords < 12) tips.push("Add more real stack and role keywords across skills, experience, and projects.");
  if (parseSafety.parseConfidence < 80) tips.push("Improve ATS parse safety with cleaner dates, complete sections, and structured bullets.");
  if (languageQuality.score < 70) tips.push("Reduce repeated phrasing and replace vague bullets like 'worked on' with specific outcomes.");

  const label = overall >= 85 ? "Excellent" : overall >= 70 ? "Strong" : overall >= 50 ? "Fair" : "Needs Work";
  return {
    overall: round(overall),
    label,
    factors: {
      sectionCompleteness: round(sectionCompleteness.score),
      actionEvidence: round(actionEvidence.score),
      keywordSpread: round(keywordSpread.score),
      parseSafety: round(parseSafety.score),
      languageQuality: round(languageQuality.score),
    },
    tips: tips.slice(0, 5),
    confidence: round(parseSafety.parseConfidence),
    meta: {
      inputPath: parseSafety.details.inputPath,
      aiLanguageApplied: !!languageQuality.aiApplied,
      roleFamily,
    },
    details: {
      sectionCompleteness: sectionCompleteness.details || sectionCompleteness.sections,
      actionEvidence: actionEvidence.details,
      keywordSpread: keywordSpread.details,
      parseSafety: parseSafety.details,
      languageQuality: languageQuality.details,
    },
    snapshot,
  };
}

function normalizeRequirement(req) {
  return {
    keyword: text(req.keyword),
    category: text(req.category) || "Other",
    importance: normalize(req.importance) || "preferred",
    aliases: unique((req.aliases || []).map(sentenceLike)).filter((alias) => alias && alias !== sentenceLike(req.keyword)),
    evidenceTarget: normalize(req.evidenceTarget) || "skills",
    exactRequired: !!req.exactRequired,
    critical: !!req.critical,
    kind: normalize(req.kind) || "keyword",
  };
}

function keywordEvidence(snapshot, requirement) {
  const phrase = sentenceLike(requirement.keyword);
  const strictAliases = unique([phrase, ...(requirement.aliases || []).filter((alias) => isSafeEquivalentAlias(phrase, alias))]).filter(Boolean);
  const relaxedAliases = unique([phrase, ...(requirement.aliases || [])]).filter(Boolean);
  const isMultiWord = phrase.split(" ").filter(Boolean).length > 1;
  const textBlocks = {
    title: sentenceLike(snapshot.title),
    summary: sentenceLike(snapshot.summary),
    skills: sentenceLike(snapshot.skillEntries.join(" ")),
    experience: sentenceLike(snapshot.expEntries.slice(0, 2).map((item) => `${item.role} ${item.company} ${(item.bullets || []).join(" ")}`).join(" ")),
    misc: sentenceLike([
      snapshot.projectEntries.map((item) => `${item.name} ${item.tech} ${(item.bullets || []).join(" ")}`).join(" "),
      snapshot.certificationEntries.map((item) => item.name).join(" "),
      snapshot.educationEntries.map((item) => `${item.degree} ${item.institution}`).join(" "),
    ].join(" ")),
  };

  const exactPhraseHit = Object.values(textBlocks).some((block) => hasWholeTerm(block, phrase));
  const exactAliasHit = !requirement.exactRequired && strictAliases.some((alias) => alias !== phrase && Object.values(textBlocks).some((block) => hasWholeTerm(block, alias)));
  const relatedAliasHit = relaxedAliases.some((alias) => Object.values(textBlocks).some((block) => hasWholeTerm(block, alias)));
  const tokenCoverage = Math.max(...Object.values(textBlocks).map((block) => relatedTokenCoverage(block, phrase)), 0);
  const skillsOnlyHit = strictAliases.some((alias) => hasWholeTerm(textBlocks.skills, alias)) && !strictAliases.some((alias) => hasWholeTerm(textBlocks.experience, alias) || hasWholeTerm(textBlocks.misc, alias) || hasWholeTerm(textBlocks.summary, alias) || hasWholeTerm(textBlocks.title, alias));
  const matchQuality = exactPhraseHit
    ? (skillsOnlyHit ? 0.62 : 1)
    : exactAliasHit
      ? (skillsOnlyHit ? 0.6 : 0.9)
      : relatedAliasHit
        ? (isMultiWord ? 0.58 : 0.62)
        : tokenCoverage >= 0.9
          ? 0.62
          : tokenCoverage >= (isMultiWord ? 0.8 : 0.7)
            ? 0.52
            : 0;
  const matchedAlias = exactPhraseHit
    ? phrase
    : exactAliasHit
      ? strictAliases.find((alias) => alias !== phrase && Object.values(textBlocks).some((block) => hasWholeTerm(block, alias)))
      : relatedAliasHit
        ? relaxedAliases.find((alias) => Object.values(textBlocks).some((block) => hasWholeTerm(block, alias)))
        : "";
  const placementScore = [
    strictAliases.some((alias) => hasWholeTerm(textBlocks.title, alias)) || hasWholeTerm(textBlocks.title, phrase) ? 25 : 0,
    strictAliases.some((alias) => hasWholeTerm(textBlocks.summary, alias)) || hasWholeTerm(textBlocks.summary, phrase) ? 15 : 0,
    strictAliases.some((alias) => hasWholeTerm(textBlocks.skills, alias)) || hasWholeTerm(textBlocks.skills, phrase) ? 20 : 0,
    strictAliases.some((alias) => hasWholeTerm(textBlocks.experience, alias)) || hasWholeTerm(textBlocks.experience, phrase) ? 30 : 0,
    strictAliases.some((alias) => hasWholeTerm(textBlocks.misc, alias)) || hasWholeTerm(textBlocks.misc, phrase) ? 10 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const candidateBullets = snapshot.allBullets.filter((bullet) => {
    const normalizedBullet = sentenceLike(bullet);
    return relaxedAliases.some((alias) => hasWholeTerm(normalizedBullet, alias)) || relatedTokenCoverage(normalizedBullet, phrase) >= (isMultiWord ? 0.85 : 0.75);
  });
  const supportingBullet = candidateBullets[0] || "";

  return {
    matchQuality,
    placementScore,
    supportingBullet,
    matchedAlias: matchedAlias || "",
  };
}

function getSeniority(value) {
  const found = SENIORITY_WORDS.find((token) => normalize(value).includes(token));
  return found || "";
}

function computeTitleAlignment(snapshot, schema) {
  const resumeTitle = sentenceLike(snapshot.title);
  const jdTitle = sentenceLike(schema.jobTitle || "");
  if (!resumeTitle || !jdTitle) return 45;
  const sharedWords = unique(resumeTitle.split(" ").filter((token) => jdTitle.includes(token) && token.length > 2));
  let score = clamp((sharedWords.length / Math.max(jdTitle.split(" ").filter((token) => token.length > 2).length, 1)) * 100);
  const resumeSeniority = getSeniority(resumeTitle);
  const jdSeniority = getSeniority(jdTitle);
  if (jdSeniority && resumeSeniority && jdSeniority === resumeSeniority) score = clamp(score + 15);
  else if (jdSeniority && resumeSeniority && jdSeniority !== resumeSeniority) score = clamp(score - 10);
  return clamp(score);
}

export function calculateJDScore(data, schema) {
  const snapshot = buildResumeSnapshot(data);
  const requirements = (schema?.requirements || []).map(normalizeRequirement).filter((req) => req.keyword);
  if (!requirements.length) {
    return {
      overall: 0,
      label: "Needs Work",
      factors: {
        weightedKeywordCoverage: 0,
        semanticEquivalence: 0,
        titleAlignment: 0,
        criticalRequirementRisk: 0,
      },
      matched: [],
      missing: [],
      related: [],
      criticalGaps: [],
      recommendations: ["Paste a job description and analyze it to get a role-specific match score."],
      extractedRequirements: [],
    };
  }

  let totalWeight = 0;
  let matchedWeight = 0;
  let semanticAccumulator = 0;
  const matched = [];
  const related = [];
  const missing = [];
  const criticalGaps = [];

  requirements.forEach((req) => {
    const weight = JD_IMPORTANCE_WEIGHTS[req.importance] || 2;
    const evidence = keywordEvidence(snapshot, req);
    totalWeight += weight;
    matchedWeight += weight * evidence.matchQuality;
    if (evidence.matchQuality >= 0.9) semanticAccumulator += weight * 100;
    else if (evidence.matchQuality >= 0.6) semanticAccumulator += weight * 60;

    const item = {
      keyword: req.keyword,
      category: req.category,
      importance: req.importance,
      evidenceTarget: req.evidenceTarget,
      recommendedSection: deriveRecommendedSection(req),
      exactRequired: req.exactRequired,
      critical: req.critical,
      supportingBullet: evidence.supportingBullet || "",
      matchedAlias: evidence.matchedAlias || "",
      score: round(evidence.matchQuality * 100),
    };

    if (evidence.matchQuality >= 0.9) matched.push(item);
    else if (evidence.matchQuality >= 0.6) related.push(item);
    else {
      missing.push(item);
      if (req.critical || req.importance === "must") criticalGaps.push(req.keyword);
    }
  });

  const weightedKeywordCoverage = totalWeight ? (matchedWeight / totalWeight) * 100 : 0;
  const titleAlignment = computeTitleAlignment(snapshot, schema);
  const semanticEquivalence = totalWeight ? (semanticAccumulator / (totalWeight * 100)) * 100 : 0;
  const criticalRequirementRisk = criticalGaps.length === 0 ? 100 : clamp(100 - (criticalGaps.length * 22));

  const overall = clamp(
    (weightedKeywordCoverage * 0.5) +
    (semanticEquivalence * 0.2) +
    (titleAlignment * 0.15) +
    (criticalRequirementRisk * 0.15)
  );

  const recommendations = [];
  if (criticalGaps.length) recommendations.push(`Add or credibly support critical JD requirements: ${criticalGaps.slice(0, 3).join(", ")}.`);
  if (matched.length < Math.ceil(requirements.length * 0.45)) recommendations.push("Cover more must-have and preferred JD requirements to raise your match rate.");
  if (titleAlignment < 65) recommendations.push("Align the resume title and positioning more closely with the target role and seniority.");

  const label = overall >= 85 ? "Excellent Match" : overall >= 70 ? "Strong Match" : overall >= 50 ? "Decent Match" : "Needs Work";
  return {
    overall: round(overall),
    label,
    factors: {
      weightedKeywordCoverage: round(weightedKeywordCoverage),
      semanticEquivalence: round(semanticEquivalence),
      titleAlignment: round(titleAlignment),
      criticalRequirementRisk: round(criticalRequirementRisk),
    },
    matched,
    missing,
    related,
    criticalGaps: unique(criticalGaps),
    recommendations: recommendations.slice(0, 5),
    extractedRequirements: requirements,
    totals: {
      matched: matched.length,
      related: related.length,
      missing: missing.length,
      total: requirements.length,
    },
  };
}

export function formatResumeReviewPayload(aiJson = {}) {
  return {
    clarityScore: clamp(Number(aiJson.clarityScore) || 0, 0, 10),
    specificityScore: clamp(Number(aiJson.specificityScore) || 0, 0, 10),
    reason: text(aiJson.reason),
    notes: Array.isArray(aiJson.notes) ? aiJson.notes.map(text).filter(Boolean) : [],
  };
}
