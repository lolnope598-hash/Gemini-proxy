import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages, model = "gemini-1.5-pro-latest" } = req.body;

    // convert OpenAI-style messages → Gemini prompt
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    res.json({
      id: "proxy-gemini",
      object: "chat.completion",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || ""
          }
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
