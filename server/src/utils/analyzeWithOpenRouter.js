



import axios from "axios";

// ✅ Analyze resume with OpenRouter + sanitize + fallback
export const analyzeWithOpenRouter = async (resumeText) => {
  const truncatedResumeText = resumeText.slice(0, 8000); // ✂️ Avoid oversized prompt

  const prompt = `
You are a strict and professional ATS resume analyzer trained on Resume Worded, Jobscan, and recruiter screening data.

Your job is to analyze the following resume and return valid JSON with these keys:

{
  "ats_score": number (0–100),
  "suggestions": [string],
  "repeated_phrases": [string],
  "buzzwords": [string],
  "action_verbs": [string],
  "missing_sections": [string],
  "tone_analysis": string,
  "verdict_summary": string
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

Return ONLY valid JSON with no comments or markdown.

Resume Text:
${truncatedResumeText}
`;


  const apiUrl = `${process.env.OPENROUTER_CHAT_COMPLETIONS}`;
  try {
    const response = await axios.post(
      apiUrl,
      {
        
        model: `${process.env.OPENROUTER_MODEL}`,
        messages: [
          { role: "system", content: "You are an expert ATS resume analyzer." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://yourdomain.com",
          "X-Title": "ScanHire Resume Analyzer",
        },
      }
    );
    let result = response.data.choices[0].message.content;
    console.log("🧠 OpenRouter AI Raw Response:", result);

    result = result
      .replace(/```json|```/g, "") // Remove markdown
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\_/g, "_")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s{2,}/g, " ")
      .trim();


    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      console.error("❌ JSON parse error:", e.message);
      console.error("🔍 Raw AI content:", result);
      return { error: "Invalid JSON from OpenRouter." };
    }

    // Step 3: Merge fallback for missing sections
    const fallbackMissing = checkMissingSections(truncatedResumeText);
    const mergedMissing = [...new Set([...(parsed.missing_sections || []), ...fallbackMissing])];

    // Step 4: Limit buzzwords to top 10
    const buzzwords = (parsed.buzzwords || [])
      .filter((word) => !isATSKeyword(word))
      .slice(0, 10);

    return {
      ...parsed,
      missing_sections: mergedMissing,
      buzzwords,
    };
  } catch (err) {
    console.error("OpenRouter API Error:", err.message);
    return {
      error: "Failed to analyze resume via OpenRouter.",
    };
  }
};

// ✅ Fallback missing section checker
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

// ✅ Check if a word is an ATS keyword
const isATSKeyword = (word) => {
  const atsTerms = [
    "summary", "experience", "project", "education", "skills",
    "certification", "award", "honor", "linkedin", "github"
  ];
  return atsTerms.some((term) => word.toLowerCase().includes(term));
};
