// ── Groq Proxy Server ─────────────────────────────────────────────────────────
// Solves CORS: browser → this server → Groq API
// Run: node server.js
// Requires: npm install express cors node-fetch

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, "resume-builder", "dist");

require("dotenv").config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors()); // Allow all origins — browser can now call this server
app.use(express.json({ limit: "10mb" })); // Allow large resume payloads

// Serve the built React app (Vite build output)
app.use(express.static(DIST_DIR));

// ── Proxy endpoint: /api/groq ─────────────────────────────────────────────────
app.post("/api/groq", async (req, res) => {
  try {
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
      return res.status(groqResp.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("Groq proxy error:", err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "Groq Proxy" }));

// Fallback: serve React app for all other routes (SPA routing)
app.get("*", (_, res) => res.sendFile(path.join(DIST_DIR, "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Groq proxy running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/groq  →  Groq API`);
});
