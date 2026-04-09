const config = require('../config');

async function callOpenAI(prompt, resumeData) {

  // ✅ MOCK AI (if no API key)
  if (!config.openaiKey) {
    return {
      ...resumeData,
      summary:
        (resumeData.summary || "") +
        " Results-driven developer with strong problem-solving skills and experience building scalable applications.",
      skills: [
        ...(resumeData.skills || []),
        "Communication",
        "Teamwork",
        "Problem Solving"
      ],
      experience: [
        {
          company: "Tech Company",
          role: "Software Developer",
          start: "2023",
          end: "Present",
          bullets: [
            "Developed web applications using modern technologies",
            "Improved performance by 30%",
            "Collaborated with cross-functional teams"
          ]
        }
      ],
      projects: [
        {
          name: "Portfolio Project",
          description:
            "Built a responsive web application using React and Tailwind CSS"
        }
      ],
      education: [
        {
          school: "Your College",
          degree: "B.Tech",
          major: "Computer Science",
          year: "2025"
        }
      ]
    };
  }

  // ✅ REAL AI (if API key exists)
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: config.openaiKey });

    const system = "You are an expert ATS resume writer. Return ONLY JSON.";

    const user = `
Improve this resume and make it ATS friendly:

${JSON.stringify(resumeData)}

Rules:
- Improve summary (3-4 lines)
- Add strong action verbs
- Add skills
- Create experience if missing
- Format projects properly
- No emojis

Return JSON:
{
  "summary": "",
  "skills": [],
  "experience": [],
  "projects": [],
  "education": []
}
`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      max_tokens: 1000
    });

    const text = res?.choices?.[0]?.message?.content;

    try {
      return JSON.parse(text);
    } catch {
      console.log("AI returned non-JSON");
      return {};
    }

  } catch (err) {
    console.error("OpenAI ERROR:", err.message);

    // fallback
    return resumeData;
  }
}

module.exports = { callOpenAI };