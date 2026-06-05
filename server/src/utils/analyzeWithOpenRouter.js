import { callOpenRouter, getOpenRouterErrorResponse } from "./openRouterClient.js";

export const analyzeWithOpenRouter = async (resumeText) => {
  const truncatedResumeText = resumeText.slice(0, 8000);

  const prompt = `
You are a strict and professional ATS resume analyzer trained on Resume Worded, Jobscan, and recruiter screening data.

Your job is to analyze the following resume and return ONLY valid JSON with these exact keys:

{
  "ats_score": 0,
  "suggestions": [],
  "repeated_phrases": [],
  "buzzwords": [],
  "action_verbs": [],
  "missing_sections": [],
  "tone_analysis": "",
  "verdict_summary": ""
}

### ATS Scoring Rules:
- Give 90+ only if it's nearly perfect.
- Penalize vague descriptions, weak verbs, repetition, and lack of measurable results.
- Score 60–80 for decent resumes, <60 for basic ones.

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
    });

    let result = content;
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
      return {
        ats_score: 0,
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

    return {
      ats_score: 0,
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
