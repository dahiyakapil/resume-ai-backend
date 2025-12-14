import axios from "axios";

// Analyze resume with OpenRouter + sanitize + fallback
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
          "X-Title": " Resumind AI Resume Analyzer",
        },
        timeout: 60000, // 60 second timeout for resume analysis
      }
    );
    let result = response.data.choices[0].message.content;
    console.log("✅ OpenRouter AI Raw Response:", result);

    // More aggressive cleaning
    result = result
      .replace(/```json|```/g, "") // Remove markdown
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\_/g, "_")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Try to extract JSON if wrapped in text
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
      console.error("🔍 Cleaned content:", result);
      
      // Return a fallback response instead of error
      return {
        ats_score: 0,
        suggestions: ["Unable to parse AI response. Please try again."],
        repeated_phrases: [],
        buzzwords: [],
        action_verbs: [],
        missing_sections: checkMissingSections(truncatedResumeText),
        tone_analysis: "Unable to analyze tone.",
        verdict_summary: "Analysis failed due to parsing error.",
        error: "Invalid JSON from OpenRouter."
      };
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
    // Handle specific HTTP error codes
    if (err.response) {
      const status = err.response.status;
      
      if (status === 402) {
        console.error("❌ OpenRouter API: Credits exhausted (402)");
        console.error("💡 Add credits at: https://openrouter.ai/credits");
        return {
          ats_score: 0,
          suggestions: [
            "⚠️ AI Analysis unavailable - OpenRouter API credits exhausted",
            "Please add credits at: https://openrouter.ai/credits",
            "Your resume will be processed with basic analysis only"
          ],
          repeated_phrases: [],
          buzzwords: [],
          action_verbs: [],
          missing_sections: checkMissingSections(truncatedResumeText),
          tone_analysis: "AI analysis requires API credits",
          verdict_summary: "OpenRouter API credits exhausted. Please recharge to enable AI features.",
          error: "OpenRouter API credits exhausted (402)"
        };
      } else if (status === 429) {
        console.error("❌ OpenRouter API: Rate limit exceeded (429)");
        return {
          ats_score: 0,
          suggestions: [
            "⚠️ AI Analysis temporarily unavailable - Rate limit exceeded",
            "Please wait a few moments and try again"
          ],
          repeated_phrases: [],
          buzzwords: [],
          action_verbs: [],
          missing_sections: checkMissingSections(truncatedResumeText),
          tone_analysis: "Rate limit exceeded",
          verdict_summary: "Too many requests. Please try again in a few moments.",
          error: "Rate limit exceeded (429)"
        };
      } else if (status === 401) {
        console.error("❌ OpenRouter API: Invalid API key (401)");
        return {
          ats_score: 0,
          suggestions: [
            "⚠️ AI Analysis unavailable - Invalid API key",
            "Please check your OpenRouter API key configuration"
          ],
          repeated_phrases: [],
          buzzwords: [],
          action_verbs: [],
          missing_sections: checkMissingSections(truncatedResumeText),
          tone_analysis: "Invalid API key",
          verdict_summary: "API authentication failed. Please verify your OpenRouter API key.",
          error: "Invalid API key (401)"
        };
      }
    }
    
    console.error("❌ OpenRouter API Error:", err.message);
    return {
      ats_score: 0,
      suggestions: [
        "⚠️ AI Analysis failed. Please try again later.",
        err.message || "Unknown error occurred"
      ],
      repeated_phrases: [],
      buzzwords: [],
      action_verbs: [],
      missing_sections: checkMissingSections(truncatedResumeText),
      tone_analysis: "Unable to analyze",
      verdict_summary: "Analysis failed. Please try again.",
      error: err.message || "Failed to analyze resume via OpenRouter"
    };
  }
};

// Fallback missing section checker
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

// Check if a word is an ATS keyword
const isATSKeyword = (word) => {
  const atsTerms = [
    "summary", "experience", "project", "education", "skills",
    "certification", "award", "honor", "linkedin", "github"
  ];
  return atsTerms.some((term) => word.toLowerCase().includes(term));
};
