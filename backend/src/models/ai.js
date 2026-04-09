// routes/ai.js
import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/enhance", async (req, res) => {
  try {
    const { fullName, summary, skills, projects } = req.body;

    const prompt = `
Improve this resume:

Name: ${fullName}
Summary: ${summary}
Skills: ${skills.join(", ")}
Projects: ${projects}

1. Make summary professional (3-4 lines)
2. Add strong action words
3. Expand projects into bullet points
4. Add missing technical skills

Return JSON:
{
  "summary": "...",
  "skills": [],
  "projects": ["...", "..."]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content;
    const data = JSON.parse(text);

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;