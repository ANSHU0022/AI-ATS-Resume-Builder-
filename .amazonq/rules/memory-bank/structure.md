# Project Structure — ATS Forge

## Root Layout
```
ATS Resume Bulider/
├── server.js                  # Root-level Groq proxy server (Express, port 3001)
├── package.json               # Root server dependencies (express, cors, node-fetch)
├── SETUP.md                   # Setup guide for proxy + React app
├── resume-builder (1).jsx     # Standalone legacy component (reference copy)
└── resume-builder/            # Main React application (Vite + React 19)
```

## Frontend Application: resume-builder/
```
resume-builder/
├── src/
│   ├── main.jsx               # App entry: BrowserRouter, Routes (/auth, /*)
│   ├── index.css              # Global styles
│   ├── assets/                # Static assets (SVGs)
│   ├── lib/
│   │   └── supabase.js        # Supabase client singleton (env-based config)
│   ├── components/            # Shared/reusable UI components
│   │   ├── Header/            # Header.jsx + Header.css
│   │   ├── Footer/            # Footer.jsx + Footer.css
│   │   ├── FontPickerPanel/   # FontPickerPanel.jsx + .module.css (CSS Modules)
│   │   ├── Features.jsx       # Landing page features section
│   │   └── Steps.jsx          # Landing page steps section
│   └── pages/                 # Route-level page components
│       ├── Auth/              # Auth.jsx + Auth.css (Supabase login/signup)
│       ├── HomePage/          # HomePage.jsx + HomePage.css
│       ├── ResumeBuilder/     # ResumeBuilder.jsx + .css (core feature)
│       ├── CoverLetterBuilder/# CoverLetterBuilder.jsx + .css
│       ├── JobPortals/        # JobPortals.jsx (job portal directory)
│       ├── Networking/        # Networking.jsx + .css
│       └── latex-editor/      # Full LaTeX editor sub-feature
│           ├── pages/         # index.jsx (LatexEditor page entry)
│           ├── components/    # EditorNavbar, EditorPanel, ErrorPanel, PreviewPanel, TemplateSelector
│           ├── hooks/         # useLatexCompiler.js (custom hook)
│           ├── services/      # latexService.js (API calls to backend)
│           ├── templates/     # jakesResume.js, altaCV.js, awesomeCV.js, modernCV.js, faangResume.js
│           └── utils/         # latexHelpers.js
├── backend/
│   └── latex-editor/          # LaTeX compilation backend
│       ├── controllers/       # Request handlers
│       ├── routes/            # Express route definitions
│       ├── services/          # LaTeX compilation logic
│       └── utils/             # Helper utilities
├── api/
│   └── groq.js                # Groq API integration module
├── public/                    # Static public assets (logos, sample images)
├── temp_latex/                # Temp directory for LaTeX compilation output
├── server.cjs                 # In-app Express server (CJS, runs alongside Vite)
├── vite.config.js             # Vite config: React plugin, proxy /api → localhost:3001
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS config
├── eslint.config.js           # ESLint flat config
├── vercel.json                # Vercel deployment config
└── package.json               # App dependencies (React 19, Vite, Tailwind, Supabase, etc.)
```

## Routing Architecture
- `/auth` → Auth page (Supabase login/signup)
- `/*` → ResumeBuilder (acts as shell/layout with nested routes)
- ResumeBuilder internally renders sub-pages: HomePage, CoverLetterBuilder, JobPortals, Networking, LaTeX Editor

## Core Component Relationships
```
main.jsx
  └── BrowserRouter
        ├── /auth → Auth
        └── /* → ResumeBuilder (shell)
                    ├── Header
                    ├── HomePage (landing)
                    │     ├── Features
                    │     └── Steps
                    ├── ResumeBuilder (resume editor)
                    │     └── FontPickerPanel
                    ├── CoverLetterBuilder
                    ├── JobPortals
                    ├── Networking
                    ├── LaTeX Editor
                    │     ├── EditorNavbar
                    │     ├── TemplateSelector
                    │     ├── EditorPanel (Monaco)
                    │     ├── PreviewPanel
                    │     └── ErrorPanel
                    └── Footer
```

## Architectural Patterns
- Monorepo-style: root proxy server + nested React app
- Feature-based page organization under `src/pages/`
- Shared components in `src/components/`
- Custom hooks for complex logic isolation (`useLatexCompiler`)
- Service layer for external API calls (`latexService.js`, `api/groq.js`)
- Proxy pattern: Vite dev server proxies `/api` to Express server to avoid CORS
- CSS co-location: each component/page has its own `.css` or `.module.css` file
