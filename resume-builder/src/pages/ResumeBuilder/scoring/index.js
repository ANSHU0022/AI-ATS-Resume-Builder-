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

const SECTION_WEIGHTS = {
  personal: 15,
  summary: 10,
  skills: 12,
  experience: 25,
  education: 12,
  projects: 10,
  certifications: 8,
  achievements: 8,
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

function distinctSkillList(data) {
  return unique(
    (data.skills || [])
      .flatMap((skill) => text(skill.items).split(","))
      .map((item) => sentenceLike(item))
  );
}

function allBullets(data) {
  return [
    ...(data.experience || []).flatMap((item) => item.bullets || []),
    ...(data.projects || []).flatMap((item) => item.bullets || []),
  ].map(text).filter(Boolean);
}

function experienceBullets(data) {
  return (data.experience || []).flatMap((item) => item.bullets || []).map(text).filter(Boolean);
}

export function buildResumeSnapshot(data) {
  const personal = data.personal || {};
  const summary = text(data.summary);
  const title = text(personal.title);
  const skillEntries = distinctSkillList(data);
  const expEntries = (data.experience || []).map((item) => ({
    ...item,
    role: text(item.role),
    company: text(item.company),
    bullets: (item.bullets || []).map(text).filter(Boolean),
  }));
  const projectEntries = (data.projects || []).map((item) => ({
    ...item,
    name: text(item.name),
    tech: text(item.tech),
    bullets: (item.bullets || []).map(text).filter(Boolean),
  }));
  const educationEntries = (data.education || []).map((item) => ({
    ...item,
    degree: text(item.degree),
    institution: text(item.institution),
  }));
  const certificationEntries = (data.certifications || []).map((item) => ({
    ...item,
    name: text(item.name),
  }));
  const achievementEntries = (data.achievements || []).map((item) => ({
    ...item,
    title: text(item.title),
  }));

  const parts = [
    personal.name, title, summary,
    (data.skills || []).map((skill) => `${text(skill.category)} ${text(skill.items)}`).join(" "),
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
    allBullets: allBullets(data),
    experienceBullets: experienceBullets(data),
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

function coverageCompletion(snapshot) {
  const personalFields = ["name", "email", "phone", "location"].filter((field) => text(snapshot.personal[field])).length;
  const linkedinBonus = text(snapshot.personal.linkedin) ? 0.2 : 0;
  const sections = {
    personal: personalFields >= 4 ? clamp((personalFields / 4) + linkedinBonus, 0, 1) : personalFields >= 2 ? 0.5 : 0,
    summary: snapshot.summary && !hasPlaceholder(snapshot.summary)
      ? (words(snapshot.summary).length >= 45 && words(snapshot.summary).length <= 90 ? 1 : 0.5)
      : 0,
    skills: snapshot.skillEntries.length >= 8 || (snapshot.skillEntries.length >= 4 && (snapshot.skillEntries.length >= 2 || (snapshot.skillEntries.length && snapshot.skillEntries.length >= 2)))
      ? 1
      : snapshot.skillEntries.length >= 3 ? 0.5 : 0,
    experience: snapshot.expEntries.some((item) => item.role && item.company)
      ? (snapshot.experienceBullets.length >= 2 ? 1 : 0.5)
      : 0,
    education: snapshot.educationEntries.some((item) => item.degree && item.institution) ? 1 : 0,
    projects: snapshot.projectEntries.some((item) => item.name && (item.tech || item.bullets.length)) ? 1 : snapshot.projectEntries.some((item) => item.name) ? 0.5 : 0,
    certifications: snapshot.certificationEntries.some((item) => item.name) ? 1 : 0,
    achievements: snapshot.achievementEntries.some((item) => item.title && item.title.length > 6) ? 1 : 0,
  };
  const score = Object.entries(SECTION_WEIGHTS).reduce((sum, [key, weight]) => sum + weight * sections[key], 0);
  return { score: clamp(score), sections };
}

function impactScore(snapshot) {
  const bullets = snapshot.allBullets;
  const uniqueBullets = unique(bullets.map(sentenceLike));
  const quantBullets = uniqueBullets.filter((bullet) => /(\d+%|\$\d+|\d+\+|\b\d+\s*(hours|days|weeks|months|years|users|clients|projects|features|pipelines|models|tickets)\b)/i.test(bullet));
  const verbBullets = uniqueBullets.filter((bullet) => ACTION_VERBS.some((verb) => new RegExp(`^${verb}\\b|\\b${verb}\\b`, "i").test(bullet.split(/\s+/).slice(0, 4).join(" "))));
  const resultBullets = uniqueBullets.filter((bullet) => RESULT_TERMS.some((term) => bullet.includes(term)));

  const quantifiedImpact = clamp((quantBullets.length / 4) * 100);
  const actionVerbQuality = clamp((verbBullets.length / 6) * 100);
  const outcomeLanguage = clamp((resultBullets.length / 5) * 100);

  const score = (quantifiedImpact * 0.4) + (actionVerbQuality * 0.35) + (outcomeLanguage * 0.25);
  return {
    score: clamp(score),
    details: { quantifiedImpact, actionVerbQuality, outcomeLanguage, quantBullets: quantBullets.length, verbBullets: verbBullets.length },
  };
}

function structureScore(snapshot, parseMeta = {}) {
  const datePatterns = unique([
    ...snapshot.expEntries.map((item) => getDatePattern(item.duration)),
    ...snapshot.educationEntries.map((item) => getDatePattern(item.year)),
  ].filter((value) => value !== "missing"));

  const dateConsistency = datePatterns.length <= 2 ? 100 : 55;
  const linkSignals = [snapshot.personal.linkedin, snapshot.personal.github, snapshot.personal.portfolio].filter((value) => isUrlLike(value)).length > 0 ? 100 : 45;
  const cleanBullets = snapshot.allBullets.length > 0 && snapshot.allBullets.every((bullet) => bullet.length >= 8) ? 100 : snapshot.allBullets.length ? 65 : 30;
  const wordCountScore = snapshot.wordCount >= 350 && snapshot.wordCount <= 900 ? 100 : snapshot.wordCount >= 250 && snapshot.wordCount <= 1100 ? 65 : 30;
  const headingsScore = snapshot.expEntries.some((item) => item.role) && snapshot.educationEntries.some((item) => item.degree) ? 100 : 60;

  let parseConfidence = 100;
  if (parseMeta?.source === "upload") {
    const fieldCount = [
      snapshot.personal.name, snapshot.personal.email, snapshot.personal.phone, snapshot.summary,
      snapshot.expEntries.some((item) => item.role), snapshot.educationEntries.some((item) => item.degree),
      snapshot.projectEntries.some((item) => item.name), snapshot.skillEntries.length > 0,
    ].filter(Boolean).length;
    const textScore = parseMeta.extractedTextLength >= 1200 ? 100 : parseMeta.extractedTextLength >= 500 ? 70 : 40;
    parseConfidence = clamp((fieldCount / 8) * 60 + (textScore * 0.4));
  }

  const score = (dateConsistency * 0.2) + (linkSignals * 0.15) + (cleanBullets * 0.15) + (wordCountScore * 0.15) + (headingsScore * 0.15) + (parseConfidence * 0.2);
  return {
    score: clamp(score),
    parseConfidence: clamp(parseConfidence),
    details: { dateConsistency, linkSignals, cleanBullets, wordCountScore, headingsScore },
  };
}

function roleClarityScore(snapshot, aiReview = null) {
  const titlePresent = snapshot.title ? 100 : 35;
  const groupedSkills = snapshot.skillEntries.length >= 8 ? 100 : snapshot.skillEntries.length >= 4 ? 70 : 35;
  const supportedSkills = snapshot.skillEntries.filter((skill) => snapshot.fullTextNormalized.includes(skill)).length;
  const supportScore = snapshot.skillEntries.length ? clamp((supportedSkills / Math.max(snapshot.skillEntries.length, 1)) * 100) : 20;
  const projectOrExpBreadth = (snapshot.expEntries.some((item) => item.role) && snapshot.projectEntries.some((item) => item.name)) ? 100 : snapshot.expEntries.some((item) => item.role) ? 70 : 40;
  let base = (titlePresent * 0.3) + (groupedSkills * 0.25) + (supportScore * 0.25) + (projectOrExpBreadth * 0.2);
  if (aiReview?.roleClarityAdjustment) base = clamp(base + aiReview.roleClarityAdjustment, 0, 100);
  return clamp(base);
}

function languageQualityScore(snapshot, aiReview = null) {
  const bullets = snapshot.allBullets;
  const normalizedBullets = bullets.map(sentenceLike);
  const shortBullets = bullets.filter((bullet) => words(bullet).length < 5).length;
  const longBullets = bullets.filter((bullet) => words(bullet).length > 32).length;
  const duplicateRate = normalizedBullets.length ? 1 - (unique(normalizedBullets).length / normalizedBullets.length) : 0.5;
  const buzzwordHits = BUZZWORDS.filter((term) => snapshot.fullTextNormalized.includes(term)).length;
  const placeholderHits = PLACEHOLDERS.filter((term) => snapshot.fullTextNormalized.includes(term)).length;

  let base = 100;
  base -= shortBullets * 7;
  base -= longBullets * 5;
  base -= duplicateRate * 35;
  base -= buzzwordHits * 6;
  base -= placeholderHits * 12;

  if (aiReview?.languageQualityAdjustment) {
    base = clamp(base + aiReview.languageQualityAdjustment, 0, 100);
  }
  return clamp(base);
}

export function calculateResumeScore(data, options = {}) {
  const snapshot = buildResumeSnapshot(data);
  const sectionCoverage = coverageCompletion(snapshot);
  const impactAchievement = impactScore(snapshot);
  const structuralIntegrity = structureScore(snapshot, options.parseMeta || {});
  const roleClarity = roleClarityScore(snapshot, options.aiReview || null);
  const languageQuality = languageQualityScore(snapshot, options.aiReview || null);

  const overall = clamp(
    (sectionCoverage.score * 0.25) +
    (impactAchievement.score * 0.25) +
    (structuralIntegrity.score * 0.2) +
    (roleClarity * 0.15) +
    (languageQuality * 0.15)
  );

  const tips = [];
  if (sectionCoverage.sections.personal < 1) tips.push("Add your full contact details: name, email, phone, location, and LinkedIn.");
  if (sectionCoverage.sections.summary < 1) tips.push("Add a short summary in 2-4 lines about your skills, experience, and target job.");
  if (impactAchievement.details.quantBullets < 3) tips.push("Add numbers in your bullets, like %, time saved, users helped, or work completed.");
  if (impactAchievement.details.verbBullets < 4) tips.push("Start your bullet points with strong words like Built, Led, Improved, or Created.");
  if (structuralIntegrity.details.wordCountScore < 100) tips.push("Keep your resume clear and complete, usually around 1 page for students.");
  if (languageQuality < 70) tips.push("Remove repeated words and make each bullet simple, clear, and specific.");

  const label = overall >= 85 ? "Excellent" : overall >= 70 ? "Strong" : overall >= 50 ? "Fair" : "Needs Work";
  return {
    overall: round(overall),
    label,
    factors: {
      sectionCoverage: round(sectionCoverage.score),
      impactAchievement: round(impactAchievement.score),
      structuralIntegrity: round(structuralIntegrity.score),
      roleClarity: round(roleClarity),
      languageQuality: round(languageQuality),
    },
    tips: tips.slice(0, 5),
    confidence: round(structuralIntegrity.parseConfidence),
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

  const supportingBullet = snapshot.allBullets.find((bullet) => relaxedAliases.some((alias) => hasWholeTerm(sentenceLike(bullet), alias)) || relatedTokenCoverage(sentenceLike(bullet), phrase) >= (isMultiWord ? 0.85 : 0.75));
  const evidenceStrength = supportingBullet
    ? clamp(
      (ACTION_VERBS.some((verb) => new RegExp(`^${verb}\\b`, "i").test(supportingBullet)) ? 40 : 10) +
      (/\d/.test(supportingBullet) ? 35 : 10) +
      (RESULT_TERMS.some((term) => normalize(supportingBullet).includes(term)) ? 25 : 10)
    )
    : (strictAliases.some((alias) => hasWholeTerm(textBlocks.skills, alias)) || hasWholeTerm(textBlocks.skills, phrase) ? 40 : 0);

  return {
    matchQuality,
    placementScore,
    evidenceStrength,
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
        keywordPlacement: 0,
        evidenceAlignment: 0,
        titleAlignment: 0,
        semanticEquivalence: 0,
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
  let placementAccumulator = 0;
  let evidenceAccumulator = 0;
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
    placementAccumulator += weight * evidence.placementScore;
    evidenceAccumulator += weight * evidence.evidenceStrength;
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
  const keywordPlacement = totalWeight ? (placementAccumulator / (totalWeight * 100)) * 100 : 0;
  const evidenceAlignment = totalWeight ? (evidenceAccumulator / (totalWeight * 100)) * 100 : 0;
  const titleAlignment = computeTitleAlignment(snapshot, schema);
  const semanticEquivalence = totalWeight ? (semanticAccumulator / (totalWeight * 100)) * 100 : 0;
  const criticalRequirementRisk = criticalGaps.length === 0 ? 100 : clamp(100 - (criticalGaps.length * 22));

  const overall = clamp(
    (weightedKeywordCoverage * 0.4) +
    (keywordPlacement * 0.2) +
    (evidenceAlignment * 0.15) +
    (titleAlignment * 0.1) +
    (semanticEquivalence * 0.1) +
    (criticalRequirementRisk * 0.05)
  );

  const recommendations = [];
  if (criticalGaps.length) recommendations.push(`Add or credibly support critical JD requirements: ${criticalGaps.slice(0, 3).join(", ")}.`);
  if (keywordPlacement < 65) recommendations.push("Move high-priority keywords into the title, summary, and recent experience bullets.");
  if (evidenceAlignment < 65) recommendations.push("Support matched skills with quantified bullets, outcomes, and real project or work evidence.");
  if (matched.length < Math.ceil(requirements.length * 0.45)) recommendations.push("Cover more must-have and preferred JD requirements to raise your match rate.");
  if (titleAlignment < 65) recommendations.push("Align the resume title and positioning more closely with the target role and seniority.");

  const label = overall >= 85 ? "Excellent Match" : overall >= 70 ? "Strong Match" : overall >= 50 ? "Decent Match" : "Needs Work";
  return {
    overall: round(overall),
    label,
    factors: {
      weightedKeywordCoverage: round(weightedKeywordCoverage),
      keywordPlacement: round(keywordPlacement),
      evidenceAlignment: round(evidenceAlignment),
      titleAlignment: round(titleAlignment),
      semanticEquivalence: round(semanticEquivalence),
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
    roleClarityAdjustment: clamp(Number(aiJson.roleClarityAdjustment) || 0, -20, 20),
    languageQualityAdjustment: clamp(Number(aiJson.languageQualityAdjustment) || 0, -20, 20),
    notes: Array.isArray(aiJson.notes) ? aiJson.notes.map(text).filter(Boolean) : [],
  };
}
