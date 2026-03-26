# Technology Stack — ATS Forge

## Languages
- JavaScript (ES2020+, ESM modules in frontend, CJS in server.cjs)
- JSX (React components)
- CSS (plain CSS + CSS Modules for FontPickerPanel)
- LaTeX (resume templates stored as JS template literals)

## Frontend

### Core Framework
- React 19.2.0 — UI library
- React DOM 19.2.0 — DOM rendering
- React Router DOM 7.13.1 — client-side routing (BrowserRouter)

### Build Tool
- Vite 7.3.1 — dev server, bundler, HMR
- @vitejs/plugin-react 5.1.1 — Babel-based React Fast Refresh

### Styling
- Tailwind CSS 3.4.19 — utility-first CSS framework
- PostCSS + Autoprefixer — CSS processing pipeline
- Plain CSS files co-located with components
- CSS Modules (FontPickerPanel.module.css)

### UI & Animation
- Framer Motion 12.35.2 — animations and transitions

### Editor
- @monaco-editor/react 4.7.0 — VS Code-style LaTeX editor in browser

### PDF Handling
- pdfjs-dist 3.11.174 — client-side PDF text extraction
- html2pdf.js 0.14.0 — HTML-to-PDF export for resume download

### HTTP Client
- Axios 1.13.6 — API requests from frontend
- node-fetch 3.3.2 — fetch in Node.js environments

### Auth & Database
- @supabase/supabase-js 2.98.0 — authentication and data persistence
- Supabase client configured via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars

### Utilities
- uuid 13.0.0 — unique ID generation
- form-data 4.0.5 — multipart form data handling
- fs-extra 11.3.3 — enhanced file system operations (server-side)
- dotenv 17.3.1 — environment variable loading

## Backend

### Proxy Server (root-level server.js)
- Node.js + Express 4.18.2
- Proxies `/api/groq` → `api.groq.com` to bypass browser CORS
- Runs on port 3001

### In-app Server (resume-builder/server.cjs)
- Express 5.2.1 (CJS format)
- Runs concurrently with Vite via `concurrently` package
- Handles LaTeX compilation requests

### AI Integration
- Groq API — LLaMA 3.3 70B model for resume parsing
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- API key stored server-side (never exposed to browser)

## Development Tools

### Linting
- ESLint 9.39.1 — flat config format (eslint.config.js)
- eslint-plugin-react-hooks 7.0.1 — hooks rules enforcement
- eslint-plugin-react-refresh 0.4.24 — Fast Refresh compatibility
- Rule: `no-unused-vars` errors except for UPPER_CASE/underscore-prefixed vars

### Dev Workflow
- concurrently 9.2.1 — runs Vite + server.cjs simultaneously
- nodemon 3.0.1 — auto-restart for root proxy server

## Deployment
- Vercel — frontend deployment target
- vercel.json rewrites: `/api/groq` passthrough, all other routes → `/` (SPA fallback)
- Vite proxy config: dev `/api` → `http://localhost:3001`

## Environment Variables
```
VITE_SUPABASE_URL=        # Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Supabase anonymous key
GROQ_API_KEY=             # Groq API key (server-side only)
```

## Key Dev Commands
```bash
# Root proxy server
npm start          # node server.js
npm run dev        # nodemon server.js

# React app (resume-builder/)
npm run dev        # concurrently runs Vite + server.cjs
npm run build      # vite build
npm run lint       # eslint .
npm run preview    # vite preview
```
