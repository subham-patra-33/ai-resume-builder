# Backend for AI Resume Builder (minimal)

This is a minimal Express backend to support the `ai-resume-builder` frontend. It includes:

- Email/password auth (JWT)
- Resume CRUD endpoints
- A simple AI stub (returns mock improvements when OpenAI key missing)
- A PDF generator stub that writes files into `src/uploads/`

Setup

1. From the `backend` folder install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

3. Start the server in development:

```bash
npm run dev
```

Server will run on the port from `.env` or 4000 by default.

Notes

- The AI and PDF utilities are stubs for local development. To enable real AI and PDF generation:
  - Install OpenAI SDK and set `OPENAI_API_KEY`.
  - Replace `src/utils/pdf.js` implementation with Puppeteer or a proper PDF library and optionally upload to S3.
