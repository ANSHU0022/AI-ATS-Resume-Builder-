// ── Groq Proxy Server ─────────────────────────────────────────────────────────
// Solves CORS: browser → this server → Groq API
// Run: node server.js
// Requires: npm install express cors node-fetch

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, "resume-builder", "dist");
const ENV_FILE = path.join(__dirname, "resume-builder", ".env");

function buildSafeGroqError(status) {
  if (status === 429) {
    return { error: { message: "AI is busy right now. Please try again in a few minutes.", code: "AI_RATE_LIMITED" } };
  }
  if (status >= 500) {
    return { error: { message: "AI is temporarily unavailable. Please try again in a few minutes.", code: "AI_UNAVAILABLE" } };
  }
  return { error: { message: "We could not complete that AI request. Please try again in a few minutes.", code: "AI_REQUEST_FAILED" } };
}

function getGroqApiKey() {
  const runtimeKey = (process.env.GROQ_API_KEY || "").trim();
  if (runtimeKey) {
    return runtimeKey;
  }

  const result = dotenv.config({ path: ENV_FILE, quiet: true });
  if (result.error) {
    return "";
  }

  return (process.env.GROQ_API_KEY || "").trim();
}

app.use(cors()); // Allow all origins — browser can now call this server
app.use(express.json({ limit: "10mb" })); // Allow large resume payloads
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Serve the built React app (Vite build output)
app.use(express.static(DIST_DIR));

// ── Proxy endpoint: /api/groq ─────────────────────────────────────────────────
app.post("/api/groq", async (req, res) => {
  try {
    const GROQ_API_KEY = getGroqApiKey();
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: { message: `GROQ_API_KEY not found in runtime environment or ${ENV_FILE}` },
      });
    }

    // Dynamic import of node-fetch (ESM compatible)
    const { default: fetch } = await import("node-fetch");

    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await groqResp.json();

    if (!groqResp.ok) {
      console.error("Groq proxy upstream error:", groqResp.status, data?.error?.message || data);
      return res.status(groqResp.status).json(buildSafeGroqError(groqResp.status));
    }

    res.json(data);
  } catch (err) {
    console.error("Groq proxy error:", err.message);
    res.status(500).json(buildSafeGroqError(500));
  }
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "Groq Proxy" }));

// ── Proxy endpoint: /api/latex ─────────────────────────────────────────────────
app.use('/api/latex', require('./resume-builder/backend/latex-editor/routes/latexRoutes.cjs'));
app.use('/api/pdf', require('./resume-builder/backend/pdf/routes/pdfRoutes.cjs'));

// Fallback: serve React app for all other routes (SPA routing)
app.get("*", (_, res) => res.sendFile(path.join(DIST_DIR, "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Groq proxy running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/groq  →  Groq API`);
});
