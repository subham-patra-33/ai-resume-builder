import React, { useState, useEffect } from "react";
import BackButton from '../BackButton';
import API from "../../lib/api";

function Resume() {
  const [title] = useState('My Resume');
  const [fullName, setFullName] = useState('');
  const [emailAddr, setEmailAddr] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [previewData, setPreviewData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPreviewData({
      fullName: "Your Name",
      summary: "Your summary will appear here",
      skills: ["React", "JavaScript"]
    });
  }, []);

  const formatSkills = () =>
    skills.split(',').map(s => s.trim()).filter(Boolean);

  async function handleGenerate(e) {
    e.preventDefault();

    if (!fullName || !summary) {
      setError("Please fill required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        data: {
          fullName,
          email: emailAddr || "test@example.com",
          linkedin,
          github,
          summary,
          skills: formatSkills(),
          projects
        }
      };

      const resp = await API.autoGenerate(payload);

      if (resp && resp.resume) {
        setPreviewData(resp.resume.data || resp.resume);

        if (resp.pdfUrl) {
          window.open(resp.pdfUrl, "_blank");

          const link = document.createElement('a');
          link.href = resp.pdfUrl;
          link.download = `${(fullName || "Resume").replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError("Failed to generate resume");
      }

    } catch (err) {
      console.error(err);
      setError("Error generating resume");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center w-full px-4">
      <div className="max-w-6xl w-full">

        {/* HEADER */}
        <div className="mb-6">
          <BackButton fallbackRoute="/db" />
          <h1 className="text-3xl font-bold mt-2">Create Resume</h1>
        </div>

        {/* 🔥 STICKY BUTTON */}
        <div className="sticky top-0 bg-white z-20 pb-3 mb-4">
          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow"
            disabled={loading}
          >
            {loading ? "🤖 AI is analyzing & generating..." : "🚀 Generate Smart ATS Resume"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* FORM */}
          <div className="card p-4">

            <h2 className="font-semibold mb-4">Enter Details</h2>

            <input
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input mb-3"
            />

            <input
              placeholder="Email"
              value={emailAddr}
              onChange={e => setEmailAddr(e.target.value)}
              className="input mb-3"
            />

            <input
              placeholder="LinkedIn"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              className="input mb-3"
            />

            <input
              placeholder="GitHub"
              value={github}
              onChange={e => setGithub(e.target.value)}
              className="input mb-3"
            />

            <textarea
              placeholder="Summary"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="textarea mb-3"
            />

            <textarea
              placeholder="Skills (comma separated)"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="textarea mb-3"
            />

            <textarea
              placeholder="Projects"
              value={projects}
              onChange={e => setProjects(e.target.value)}
              className="textarea mb-3"
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {/* PREVIEW */}
          <div className="bg-white text-black p-6 shadow-lg">

            <h1 className="text-2xl font-bold uppercase mb-2">
              {previewData.fullName || fullName}
            </h1>

            <div className="text-sm mb-4">
              <p>📧 {emailAddr}</p>
              <p>💼 {linkedin}</p>
              <p>🐙 {github}</p>
            </div>

            <h2 className="font-semibold border-b mb-2">Summary</h2>
            <p className="text-sm mb-4">
              {previewData.summary || summary}
            </p>

            <h2 className="font-semibold border-b mb-2">Skills</h2>
            <ul className="text-sm mb-4">
              {(previewData.skills || formatSkills()).map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>

            {previewData.experience && (
              <>
                <h2 className="font-semibold border-b mb-2">Experience</h2>
                {previewData.experience.map((exp, i) => (
                  <div key={i} className="mb-3">
                    <strong>{exp.role}</strong> ({exp.start}-{exp.end})
                    <p>{exp.company}</p>
                    <ul>
                      {exp.bullets?.map((b, j) => <li key={j}>• {b}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            )}

            <h2 className="font-semibold border-b mb-2">Projects</h2>
            <p className="text-sm">
              {previewData.projects || projects}
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Resume;