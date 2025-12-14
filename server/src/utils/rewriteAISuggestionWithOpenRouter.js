import axios from "axios";


export const rewriteAISuggestionWithOpenRouter = async (text) => {
    const prompt = `
You are an expert resume writing assistant.

Rewrite the following resume bullet point to be stronger, concise, and start with a powerful action verb.

Return ONLY one rewritten bullet point. DO NOT return multiple options. DO NOT include explanations, footnotes, markdown, or comments.

Just respond with one clean bullet point.

Original:
"${text}"

Rewritten:
`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mixtral-8x7b-instruct",
                messages: [
                    { role: "system", content: "You are a resume rewriting assistant." },
                    { role: "user", content: prompt },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://yourdomain.com",
                    "X-Title": "Resumind AI Rewrite Tool",
                },
                timeout: 30000,
            }
        );

        let result = response.data.choices[0].message.content.trim();

        // Step 1: Take only the first line (in case AI adds explanations)
        result = result.split("\n")[0];

        // Step 2: Strip quotes and special characters
        result = result.replace(/^["'""]+|["'""]+$/g, "").trim();

        // Step 3: Final fallback — pick first sentence if multiple options present
        if (result.includes(" or ")) {
            result = result.split(" or ")[0].trim();
        }

        return result;
    } catch (err) {
        // Handle specific HTTP error codes
        if (err.response) {
            const status = err.response.status;
            
            if (status === 402) {
                console.error("⚠️ OpenRouter API: Credits exhausted (402)");
                console.error("💡 Add credits at: https://openrouter.ai/credits");
                return text; // Return original text when out of credits
            } else if (status === 429) {
                console.error("⚠️ OpenRouter API: Rate limit exceeded (429)");
                return text; // Return original text when rate limited
            } else if (status === 401) {
                console.error("⚠️ OpenRouter API: Invalid API key (401)");
                return text; // Return original text with invalid key
            }
        }
        
        console.error("⚠️ AI Rewrite Error:", err.message);
        // Return original text instead of throwing error - graceful degradation
        return text;
    }
};

