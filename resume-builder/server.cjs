// ── Groq Proxy Server ─────────────────────────────────────────────────────────
// Solves CORS: browser → this server → Groq API
// Run: node server.js
// Requires: npm install express cors node-fetch dotenv
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
console.log("GROQ_API_KEY status:", GROQ_API_KEY ? `Loaded (starts with ${GROQ_API_KEY.slice(0, 7)}...)` : "Missing");

app.use(cors()); // Allow all origins — browser can now call this server
app.use(express.json({ limit: "10mb" })); // Allow large resume payloads

// Serve the built React app (if using Vite/CRA build output)
app.use(express.static(path.join(__dirname, "dist")));

// ── Proxy endpoint: /api/groq ─────────────────────────────────────────────────
app.post("/api/groq", async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;

    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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


// ── New endpoint: /api/latex ──────────────────────────────────────────────────
const latexRoutes = require('./backend/latex-editor/routes/latexRoutes.cjs');
app.use('/api/latex', latexRoutes);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "Groq Proxy" }));

// Fallback: serve React app for all other routes (SPA routing)
app.get(/(.*)/, (_, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Groq proxy running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/groq  →  Groq API`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use by another instance. Using existing proxy.`);
  } else {
    console.error(`❌ Server error:`, err);
  }
});

process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
