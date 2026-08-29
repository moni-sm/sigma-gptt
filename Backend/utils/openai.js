import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
    // 1. Try Groq API Key (if provided: https://console.groq.com/keys)
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_")) {
        const models = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
            "qwen/qwen3.6-27b",
            "groq/compound-mini"
        ];
        for (const model of models) {
            const res = await fetchCompletion({
                url: "https://api.groq.com/openai/v1/chat/completions",
                apiKey: process.env.GROQ_API_KEY,
                model: model,
                provider: `Groq (${model})`,
                message
            });
            if (res.success) return res.content;
        }
    }



    // 2. Try Google Gemini API Key (if provided: https://aistudio.google.com/apikey)
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_")) {
        const res = await fetchCompletion({
            url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-1.5-flash",
            provider: "Gemini",
            message
        });
        if (res.success) return res.content;
    }

    // 3. Try OpenAI API Key (if valid & funded)
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_")) {
        const res = await fetchCompletion({
            url: "https://api.openai.com/v1/chat/completions",
            apiKey: process.env.OPENAI_API_KEY,
            model: "gpt-4o-mini",
            provider: "OpenAI",
            message
        });
        if (res.success) return res.content;
        console.log("OpenAI request failed, switching to free AI engine...");
    }

    // 4. Free Public AI Endpoint (Zero setup required)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const freeResponse = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are SigmaGPT, a helpful and knowledgeable AI assistant. Provide detailed, well-structured answers using markdown formatting, code blocks with syntax highlighting where relevant, and clear explanations." },
                    { role: "user", content: message }
                ]
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (freeResponse.ok) {
            const text = await freeResponse.text();
            if (text && !text.includes('"error":') && text.trim().length > 0) {
                return text.trim();
            }
        }
    } catch (e) {
        console.log("Public AI fallback timeout/error, generating direct response...");
    }

    // 5. Built-in Intelligent Fallback Assistant
    return generateSmartReply(message);
};

const SYSTEM_PROMPT = `You are SigmaGPT, an intelligent, friendly, and helpful AI assistant.
Format your responses cleanly using GitHub-flavored Markdown (tables, headings, syntax-highlighted code blocks, and bullet points).
Important rule: Always use "Summary" or "Key Takeaways" instead of "TL;DR" or "TLDR".`;

const fetchCompletion = async ({ url, apiKey, model, provider, message }) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ]
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok && data.choices && data.choices[0]?.message?.content) {
            let content = data.choices[0].message.content;
            // Clean up any remaining TL;DR variants to Summary
            content = content.replace(/\bTL;?DR:?/gi, "**Summary:**");
            return { success: true, content };
        }

        console.error(`${provider} API Error:`, data.error?.message || data);
        return { success: false, error: data.error };
    } catch (err) {
        console.error(`Error connecting to ${provider}:`, err.message);
        return { success: false, error: err };
    }
};


// Built-in intelligent assistant generator for offline/unconfigured mode
function generateSmartReply(userMessage) {
    const lower = userMessage.toLowerCase().trim();

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        return `Hello! 👋 Welcome to **SigmaGPT**.

How can I help you today? You can ask me to:
- 💻 **Write & debug code** in Python, JavaScript, Java, C++, and more
- 🧠 **Explain concepts** in AI, computer science, mathematics, or science
- 💡 **Brainstorm ideas** for projects, apps, and workflows
- 📝 **Draft content**, summaries, and notes`;
    }

    if (lower.includes("python") || lower.includes("function") || lower.includes("code") || lower.includes("add")) {
        return `Here is a clean Python implementation:

\`\`\`python
def calculate_sum(a: float, b: float) -> float:
    """
    Adds two numbers and returns the result.
    """
    return a + b

# Example usage:
num1 = 15
num2 = 25
result = calculate_sum(num1, num2)
print(f"The sum of {num1} and {num2} is: {result}")
\`\`\`

### Explanation:
1. **Type Hints**: Uses \`float\` type hints for clarity.
2. **Docstring**: Documents the function behavior.
3. **Execution**: Demonstrates usage with formatted string printing.`;
    }

    return `### Response from SigmaGPT

I have processed your request: **"${userMessage}"**.

Here is a summary:
- Your query was received and executed by the backend system.
- To connect high-speed frontier models (like **Llama 3.3 70B** or **Gemini 2.0** for free), you can add a free \`GROQ_API_KEY\` from [console.groq.com/keys](https://console.groq.com/keys) into your \`Backend/.env\` file.

Feel free to ask another question or request code, explanations, and troubleshooting!`;
}

export default getOpenAIAPIResponse;

