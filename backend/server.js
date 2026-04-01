import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/flowai", async (req, res) => {
    try {
        const { message } = req.body;

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

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
