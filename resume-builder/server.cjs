// ── Groq Proxy Server ─────────────────────────────────────────────────────────
// Solves CORS: browser → this server → Groq API
// Run: node server.js
// Requires: npm install express cors node-fetch dotenv
const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

// ── Model Fallback Chain ──────────────────────────────────────────────────────
// If the primary model hits a rate limit, we try the next one automatically.
const MODEL_FALLBACK_CHAIN = [
  "llama-3.1-8b-instant",       // Primary: fast, low token usage
  "gemma2-9b-it",               // Fallback 1: good quality, higher TPM limit
  "llama-3.2-3b-preview",       // Fallback 2: smallest, most lenient limits
];

function getGroqApiKey() {
  // Refresh local .env values during development so key swaps take effect
  // without requiring a server restart.
  dotenv.config({ override: true, quiet: true });
  return (process.env.GROQ_API_KEY || "").trim();
}

const initialGroqApiKey = getGroqApiKey();
console.log(
  "GROQ_API_KEY status:",
  initialGroqApiKey ? `Loaded (starts with ${initialGroqApiKey.slice(0, 7)}...)` : "Missing"
);

app.use(cors()); // Allow all origins — browser can now call this server
app.use(express.json({ limit: "10mb" })); // Allow large resume payloads

// Serve the built React app (if using Vite/CRA build output)
app.use(express.static(path.join(__dirname, "dist")));

// ── Retry with exponential backoff ────────────────────────────────────────────
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGroqWithRetry(fetch, apiKey, body, maxRetries = 2) {
  const models = body.model
    ? [body.model, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== body.model)]
    : MODEL_FALLBACK_CHAIN;

  let lastError = null;
  let lastStatus = 500;
  let lastData = null;

  for (const model of models) {
    const requestBody = { ...body, model };
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await groqResp.json();

        if (groqResp.ok) {
          console.log(`✅ Groq success — model: ${model}`);
          return { ok: true, status: 200, data };
        }

        lastStatus = groqResp.status;
        lastData = data;

        if (groqResp.status === 429) {
          // Rate limited — wait and retry (or try next model after retries)
          const retryAfter = parseInt(groqResp.headers.get("retry-after") || "0", 10);
          const waitMs = retryAfter > 0 ? retryAfter * 1000 : Math.pow(2, attempt) * 1500;
          console.warn(`⚠️  Rate limited (429) on model "${model}" attempt ${attempt + 1}. Waiting ${waitMs}ms…`);
          await sleep(waitMs);
          attempt++;
          continue; // retry same model
        }

        // Non-429 error — don't retry this model, break to next
        lastError = data?.error?.message || JSON.stringify(data);
        console.error(`❌ Groq error ${groqResp.status} on model "${model}": ${lastError}`);
        break;
      } catch (err) {
        lastError = err.message;
        console.error(`❌ Network error on model "${model}": ${err.message}`);
        break;
      }
    }

    if (lastStatus === 429) {
      // All retries on this model exhausted → try next model
      console.warn(`🔄 Fallback: switching from "${model}" to next model in chain…`);
      continue;
    }

    // Any other error type — break the whole chain, return error
    break;
  }

  // All models exhausted
  return {
    ok: false,
    status: lastStatus,
    data: lastData || {
      error: {
        message:
          lastStatus === 429
            ? "All Groq models are currently rate limited. Please wait 30–60 seconds and try again. Consider upgrading to a Groq paid plan for higher limits."
            : lastError || "Groq API request failed.",
      },
    },
  };
}

// ── Proxy endpoint: /api/groq ─────────────────────────────────────────────────
app.post("/api/groq", async (req, res) => {
  try {
    const GROQ_API_KEY = getGroqApiKey();
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: "GROQ_API_KEY not set in environment variables" } });
    }

    const fetch = (await import('node-fetch')).default;
    const result = await callGroqWithRetry(fetch, GROQ_API_KEY, req.body);

    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error("Groq proxy error:", err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});


// ── New endpoint: /api/latex ──────────────────────────────────────────────────
const latexRoutes = require('./backend/latex-editor/routes/latexRoutes.cjs');
app.use('/api/latex', latexRoutes);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", service: "Groq Proxy", models: MODEL_FALLBACK_CHAIN }));

// Fallback: serve React app for all other routes (SPA routing)
app.get(/(.*)/, (_, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Groq proxy running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/groq  →  Groq API`);
  console.log(`   Model fallback chain: ${MODEL_FALLBACK_CHAIN.join(" → ")}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use by another instance. Using existing proxy.`);
  } else {
    console.error(`❌ Server error:`, err);
  }
});

process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
