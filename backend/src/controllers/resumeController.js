const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { generatePdf } = require('../utils/pdf');
const { callOpenAI } = require('../utils/openai');
async function autoGenerate(req, res) {
  try {
    const { title, data: inputData } = req.body || {};
    const minimal = inputData || {};

    // ✅ Prepare data
    const initial = {
      fullName: minimal.fullName || 'Candidate',
      email: minimal.email || '',
      linkedin: minimal.linkedin || '',
      github: minimal.github || '',
      summary: minimal.summary || '',
      skills: Array.isArray(minimal.skills) ? minimal.skills : [],
      projects: minimal.projects || ''
    };

    // ✅ FIXED: userId (no crash)
    const r = await Resume.create({
      userId: req.userId || "65f000000000000000000000",
      title: title || 'Generated Resume',
      data: initial
    });

    // ✅ SAFE AI (optional)
    let aiResult = null;

    try {
      if (callOpenAI && typeof callOpenAI === "function") {
        aiResult = await callOpenAI("Improve resume", initial);

        if (typeof aiResult === "string") {
          try {
            aiResult = JSON.parse(aiResult);
          } catch {
            aiResult = null;
          }
        }
      }
    } catch (err) {
      console.error("AI ERROR:", err.message);
    }

    // ✅ Merge AI
    if (aiResult && typeof aiResult === "object") {
      r.data = {
        ...initial,
        ...aiResult
      };
    }

    await r.save();

    // ❌ PDF disabled (safe)
    return res.json({
      resume: r,
      pdfUrl: null
    });

  } catch (err) {
    console.error("🔥 BACKEND ERROR:", err);
    return res.status(500).json({
      error: true,
      message: err.message
    });
  }
}

async function list(req, res) {
  const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json(resumes);
}

async function create(req, res) {
  const { title, templateId, data } = req.body;
  const r = await Resume.create({ userId: req.userId || null, title, templateId, data });
  res.status(201).json(r);
}

async function getOne(req, res) {
  const r = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  if (!r) return res.status(404).json({ message: 'Resume not found' });
  res.json(r);
}

async function update(req, res) {
  const r = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true }
  );
  if (!r) return res.status(404).json({ message: 'Resume not found' });
  res.json(r);
}

async function remove(req, res) {
  const r = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!r) return res.status(404).json({ message: 'Resume not found' });
  res.json({ message: 'Deleted' });
}

async function aiPopulate(req, res) {
  let r = null;
  if (req.userId) {
    r = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  }
  // If not found with userId (or no auth provided), try find by id alone (dev-friendly fallback)
  if (!r) {
    r = await Resume.findById(req.params.id);
  }
  if (!r) return res.status(404).json({ message: 'Resume not found' });
  const prompt = req.body.prompt || 'Improve this resume JSON';
  const ai = await callOpenAI(prompt, r.data);
  // Merge best-effort: replace fields returned if object
  if (ai && typeof ai === 'object') {
    r.data = { ...r.data, ...ai };
  } else {
    // if AI returned plain text, store as notes
    r.data.aiNotes = ai;
  }
  await r.save();
  res.json(r);
}

async function generatePdfHandler(req, res) {
  let r = null;
  if (req.userId) {
    r = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  }
  if (!r) r = await Resume.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Resume not found' });
  const url = await generatePdf(r);
  r.pdfUrl = url;
  await r.save();
  res.json({ pdfUrl: url });
}

async function atsCheck(req, res) {
  // Find resume (respecting auth when present, fallback to id)
  let r = null;
  if (req.userId) r = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  if (!r) r = await Resume.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Resume not found' });

  const resumeData = r.data || {};

  // If OpenAI key available, ask the model to evaluate ATS-friendliness and provide suggestions.
  const prompt = `You are an expert at Applicant Tracking Systems (ATS). Given the following resume JSON: ${JSON.stringify(resumeData)}\nEvaluate its ATS compatibility from 0-100 and return a JSON object { score: number, issues: [strings], suggestions: [strings], keywords: [strings] }. Be concise and return JSON only.`;

  try {
    const aiResp = await callOpenAI(prompt, resumeData);
    // If the AI returns an object, try to use it directly; otherwise wrap text into aiText
    if (aiResp && typeof aiResp === 'object') {
      return res.json({ result: aiResp });
    }
    return res.json({ result: { aiText: aiResp } });
  } catch (err) {
    // Fallback heuristic if AI unavailable
    const issues = [];
    const suggestions = [];
    const keywords = [];
    if (!resumeData.summary) {
      issues.push('Missing professional summary');
      suggestions.push('Add a concise professional summary at the top');
    }
    if (!resumeData.skills || !Array.isArray(resumeData.skills) || resumeData.skills.length < 3) {
      issues.push('Insufficient skills listed');
      suggestions.push('Add 8-12 relevant technical and soft skills as separate items');
    }
    if (!resumeData.experience || !Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
      issues.push('No experience entries');
      suggestions.push('Add at least one work experience with bullets describing achievements and metrics');
    }
    // Basic keyword extraction from skills
    if (Array.isArray(resumeData.skills)) {
      resumeData.skills.slice(0, 10).forEach(k => keywords.push(k));
    }
    const score = Math.max(20, 100 - issues.length * 20);
    return res.json({ result: { score, issues, suggestions, keywords } });
  }
}

module.exports = { list, create, getOne, update, remove, aiPopulate, generatePdfHandler, autoGenerate, atsCheck };
