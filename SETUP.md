# Resume Builder — Setup Guide

## Why a server is needed
Browsers block direct calls to `api.groq.com` due to **CORS policy**.
The proxy server (`server.js`) sits in the middle:

```
Browser → localhost:3001/api/groq → api.groq.com
```

---

## Setup (2 steps)

### Step 1 — Install & run the proxy server
```bash
npm install
node server.js
```
You should see:
```
✅ Groq proxy running at http://localhost:3001
```

### Step 2 — Run your React app (Vite example)
In a separate terminal:
```bash
npm run dev
```

> If using **Vite**, add this to `vite.config.js` so `/api/groq` is forwarded to port 3001:
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

> If using **Create React App**, add to `package.json`:
```json
"proxy": "http://localhost:3001"
```

---

## How it works
1. User uploads PDF/TXT resume in the browser
2. pdf.js extracts the text client-side
3. Text is sent to `POST /api/groq` on your local server
4. Server forwards it to Groq's API with the API key (safely server-side)
5. Groq LLaMA 3.3 70B returns structured JSON
6. All 8 resume sections are auto-filled instantly

---

## Files
| File | Purpose |
|------|---------|
| `server.js` | Groq proxy server (fixes CORS) |
| `package.json` | Node dependencies |
| `resume-builder.jsx` | React frontend component |
