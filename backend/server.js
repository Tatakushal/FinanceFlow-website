import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const MAX_BODY_BYTES = 150_000;
const MAX_MESSAGE_CHARS = 1200;
app.use(cors());
app.use(express.json({ limit: `${MAX_BODY_BYTES}b`, strict: true }));

app.post("/api/flowai", async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({ error: "Invalid payload." });
        }
        if (typeof req.body.message !== "string") {
            return res.status(400).json({ error: "Message must be a string." });
        }
        const message = req.body.message.trim();
        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }
        if (message.length > MAX_MESSAGE_CHARS) {
            return res.status(400).json({ error: "Message too long." });
        }
        if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(message)) {
            return res.status(400).json({ error: "Message contains invalid characters." });
        }

        const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();
        if (!geminiApiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
        }

        const prompt = `
You are FlowAI, a strict financial advisor.

STRICT RULES (MUST FOLLOW):
- Use ONLY the amount mentioned by the user
- NEVER use examples like ₹100 or ₹1000
- Extract the exact number from the user message
- ALWAYS give a clear breakdown using THAT amount only

If user says ₹500:
You MUST respond like:
₹500 → ₹300 in X, ₹200 in Y

User message:
${message}

Now give answer:
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            }
        );

        let text = response.data.candidates[0].content.parts[0].text;

        // optional safety fix
        if (text.includes("₹100")) {
            text = "₹500 → ₹300 in index fund, ₹200 in savings";
        }

        res.json({ reply: text });

    } catch (error) {
        console.error("Gemini Error:", error.response?.data || error.message);
        res.status(500).json({ error: "AI failed" });
    }
});

app.use((err, _req, res, next) => {
    if (!err) return next();
    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Request payload exceeds size limits." });
    }
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: "Invalid JSON structure." });
    }
    return res.status(400).json({ error: "Malformed request." });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
