import { callOpenRouter, getOpenRouterErrorResponse } from "./openRouterClient.js";

export const analyzeWithOpenRouter = async (resumeText) => {
  const truncatedResumeText = resumeText.slice(0, 8000);

  const prompt = `
You are a strict and professional ATS resume analyzer trained on Resume Worded, Jobscan, and recruiter screening data.

Your job is to analyze the following resume and return ONLY valid JSON with these exact keys:

{
  "ats_score": <integer 1-100>,
  "suggestions": ["string"],
  "repeated_phrases": ["string"],
  "buzzwords": ["string"],
  "action_verbs": ["string"],
  "missing_sections": ["string"],
  "tone_analysis": "string",
  "verdict_summary": "string"
}

### ATS Scoring Rules:
- ats_score MUST be an integer from 1 to 100. Never return 0.
- Give 90+ only if it's nearly perfect.
- Penalize vague descriptions, weak verbs, repetition, and lack of measurable results.
- Score 60–80 for decent resumes, <60 for basic ones.
- Compute a realistic score from the actual resume content below.

### Section Detection Rules:
Only count these as "present" if explicitly labeled in the resume:
- Professional Summary
- Work Experience / Experience
- Projects
- Skills
- Education
- Certifications
- Awards / Honors

Do not assume a section exists unless clearly titled. Return all missing sections.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations, no comments. Just the JSON object starting with { and ending with }.

Resume Text:
${truncatedResumeText}
`;

  try {
    const { content } = await callOpenRouter({
      messages: [
        { role: "system", content: "You are an expert ATS resume analyzer." },
        { role: "user", content: prompt },
      ],
      title: "Resumind AI Resume Analyzer",
      timeout: 60000,
      // Lower temperature tends to keep outputs closer to the requested JSON format.
      temperature: 0.2,
    });

    let result = content;
    const scoreFromRaw = extractAtsScoreFromText(content);
    console.log("✅ OpenRouter AI Raw Response:", result);

    result = result
      .replace(/```json|```/g, "")
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\_/g, "_")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s{2,}/g, " ")
      .trim();

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }

    console.log("🧹 Cleaned JSON:", result);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      console.error("❌ JSON parse error:", e.message);
      const normalizedScore = resolveAtsScore(scoreFromRaw, truncatedResumeText);
      return {
        ats_score: normalizedScore,
        suggestions: ["Unable to parse AI response. Please try again."],
        repeated_phrases: [],
        buzzwords: [],
        action_verbs: [],
        missing_sections: checkMissingSections(truncatedResumeText),
        tone_analysis: "Unable to analyze tone.",
        verdict_summary: "Analysis failed due to parsing error.",
        ai_warning: "Invalid JSON from OpenRouter.",
      };
    }

    const hasValidAnalysis =
      (parsed.suggestions?.length > 0) ||
      (parsed.buzzwords?.length > 0) ||
      (parsed.verdict_summary?.length > 0);

    const aiScore =
      normalizeAtsScore(parsed?.ats_score) ??
      normalizeAtsScore(parsed?.score) ??
      extractAtsScoreFromText(result) ??
      scoreFromRaw;

    parsed.ats_score = resolveAtsScore(aiScore, truncatedResumeText, hasValidAnalysis);

    const fallbackMissing = checkMissingSections(truncatedResumeText);
    const mergedMissing = [...new Set([...(parsed.missing_sections || []), ...fallbackMissing])];

    const buzzwords = (parsed.buzzwords || [])
      .filter((word) => !isATSKeyword(word))
      .slice(0, 10);

    return {
      ...parsed,
      missing_sections: mergedMissing,
      buzzwords,
    };
  } catch (err) {
    console.error("❌ OpenRouter API Error:", err.message);
    const errorResponse = getOpenRouterErrorResponse(err, truncatedResumeText);

    const normalizedScore = resolveAtsScore(errorResponse?.ats_score, truncatedResumeText);
    return {
      ats_score: normalizedScore,
      repeated_phrases: [],
      buzzwords: [],
      action_verbs: [],
      missing_sections: checkMissingSections(truncatedResumeText),
      ...errorResponse,
      ai_warning: errorResponse.error,
    };
  }
};

const checkMissingSections = (text) => {
  const lower = text.toLowerCase();
  const missing = [];

  if (!lower.includes("summary")) missing.push("Professional Summary");
  if (!lower.includes("experience")) missing.push("Work Experience");
  if (!lower.includes("project")) missing.push("Projects");
  if (!lower.includes("skill")) missing.push("Skills");
  if (!lower.includes("education")) missing.push("Education");
  if (!lower.includes("certification")) missing.push("Certifications");
  if (!lower.includes("award") && !lower.includes("honor")) missing.push("Awards or Honors");

  return missing;
};

const isATSKeyword = (word) => {
  const atsTerms = [
    "summary", "experience", "project", "education", "skills",
    "certification", "award", "honor", "linkedin", "github"
  ];
  return atsTerms.some((term) => word.toLowerCase().includes(term));
};

function computeLocalAtsScore(text) {
  if (!text || text.trim().length < 20) return 0;

  const lower = text.toLowerCase();
  let score = 30;

  const sections = [
    { pattern: /\bsummary\b/, points: 8 },
    { pattern: /\bexperience\b/, points: 12 },
    { pattern: /\bprojects?\b/, points: 10 },
    { pattern: /\bskills?\b/, points: 10 },
    { pattern: /\beducation\b/, points: 8 },
    { pattern: /\bcertifications?\b/, points: 5 },
    { pattern: /\b(awards?|honors?)\b/, points: 4 },
  ];

  for (const { pattern, points } of sections) {
    if (pattern.test(lower)) score += points;
  }

  const actionVerbs = [
    "developed", "built", "implemented", "designed", "led", "managed",
    "created", "optimized", "achieved", "delivered", "engineered", "deployed",
  ];
  const verbHits = actionVerbs.filter((verb) => lower.includes(verb)).length;
  score += Math.min(verbHits * 2, 12);

  if (/\d+\s*%|\$\d+|\d+\+|\d{2,}/.test(text)) score += 8;
  if (text.length > 1200) score += 5;
  if (text.length > 2500) score += 3;

  return Math.max(25, Math.min(100, Math.round(score)));
}

function resolveAtsScore(aiScore, resumeText, hasValidAnalysis = false) {
  const normalized = normalizeAtsScore(aiScore);

  if (normalized !== null && normalized > 0) {
    return normalized;
  }

  if (hasValidAnalysis || normalized === null || normalized === 0) {
    const localScore = computeLocalAtsScore(resumeText);
    if (localScore > 0) {
      console.log(`ℹ️ Using local ATS score fallback: ${localScore}`);
      return localScore;
    }
  }

  return normalized ?? 0;
}

function normalizeAtsScore(value) {
  if (value === null || value === undefined) return null;

  // Accept number-like values (including "85" or "85%").
  const raw =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.]/g, ""));

  if (!Number.isFinite(raw)) return null;

  // ATS score should be an integer percentage in [0, 100].
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function extractAtsScoreFromText(text) {
  if (!text) return null;

  // Matches: "ats_score": 85, ats_score: "85", ats_score=85, etc.
  const match =
    String(text).match(/["']?ats_score["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i) ||
    String(text).match(/["']?score["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i) ||
    String(text).match(/ATS\s*Score\s*[:=]\s*["']?(\d+(?:\.\d+)?)["']?/i);

  if (!match) return null;
  return normalizeAtsScore(match[1]);
}
