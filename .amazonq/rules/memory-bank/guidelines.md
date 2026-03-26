# Development Guidelines — ATS Forge

## Code Quality Standards

### File & Component Structure
- Each page/component lives in its own folder with co-located CSS: `ComponentName/ComponentName.jsx` + `ComponentName.css`
- Exception: CSS Modules used for FontPickerPanel (`FontPickerPanel.module.css`)
- Large page files (ResumeBuilder, CoverLetterBuilder) contain all sub-components in a single file — avoid splitting unless reused elsewhere
- Helper/utility functions defined at module scope above the main component
- Constants and design tokens defined at the top of the file before components

### Naming Conventions
- Components: PascalCase (`ResumeBuilder`, `CoverLetterBuilder`, `PortalLogo`)
- Helper sub-components: Short abbreviations when file-local (`FL`, `SH`, `AB`, `RB`, `RS`, `SS`, `MH`)
- State variables: camelCase, descriptive (`activeSection`, `showUpload`, `isSaving`)
- Style objects: Short uppercase or abbreviated names (`IS` for input style, `CS` for card style, `S` for page-level style object)
- Constants: SCREAMING_SNAKE_CASE for config arrays (`ATS_FONTS`, `FONT_PAIRS`, `CARDS`, `COUNTRY_CATS`)
- Design token objects: Single letter `C` for color/design tokens

### ESLint Rules
- `no-unused-vars` errors except for UPPER_CASE or underscore-prefixed variables
- React Hooks rules enforced via `eslint-plugin-react-hooks`
- React Refresh compatibility enforced via `eslint-plugin-react-refresh`

---

## Styling Patterns

### Design Token Pattern
Define a `C` object at the top of each major file for all colors/spacing:
```js
const C = {
  appBg: "#f8f9fa", sidebarBg: "#ffffff", panelBg: "#ffffff",
  accent: "#6B4DB0", accentLight: "rgba(107, 77, 176, 0.08)",
  text: "#111111", textMuted: "#666666",
  inputBg: "#ffffff", inputBorder: "#d1d5db",
};
```

### Inline Styles (Primary Approach)
- All component styling uses inline style objects — Tailwind is available but rarely used in page components
- Reusable style snippets stored as variables: `const IS = { width: "100%", padding: "11px 14px", ... }`
- Page-level style objects collected in a single `S` object at the bottom of the file (see JobPortals pattern)
- Hover states managed via `onMouseEnter`/`onMouseLeave` with direct `e.currentTarget.style` mutation

### Tailwind Usage
- Tailwind is configured but used primarily for utility classes in CSS files, not in JSX inline styles
- CSS class names follow BEM-like conventions: `cl-page`, `cl-navbar`, `cl-left`, `cl-toolbar-btn-active`

### Responsive Design
- Media queries injected via `<style>` tags inside components when needed
- Breakpoints: 1024px (2-col grid), 640px (1-col), 480px (compact)
- `clamp()` used for fluid typography: `fontSize: "clamp(40px, 4.5vw, 60px)"`

### Animation
- Framer Motion used for scroll-triggered card animations (`motion.div` with `whileInView`)
- CSS `@keyframes` injected inline for simple animations (spin, fadeUp, floatA/B)
- Transitions: `"all 0.2s"` or `"all 0.35s cubic-bezier(.25,.46,.45,.94)"` for smooth interactions
- `requestAnimationFrame` used for scroll-based parallax effects

---

## React Patterns

### State Management
- All state is local `useState` — no global state manager (no Redux/Zustand/Context)
- Complex state updates use functional form: `setData(prev => ({ ...prev, ... }))`
- Deep state updates use `JSON.parse(JSON.stringify(prev))` for safe immutable cloning:
```js
const update = useCallback((path, value) => {
  setData(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    const keys = path.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    return next;
  });
}, []);
```

### Array State Updates (Immutable Pattern)
Consistent pattern for updating array items:
```js
const upd = (i, k, v) => setData(p => {
  const arr = [...p.items];
  arr[i] = { ...arr[i], [k]: v };
  return { ...p, items: arr };
});
const add = () => setData(p => ({ ...p, items: [...p.items, { field: "" }] }));
const del = i => setData(p => {
  const arr = [...p.items];
  arr.splice(i, 1);
  return { ...p, items: arr };
});
```

### useEffect Patterns
- Auth subscription with cleanup:
```js
useEffect(() => {
  let isMounted = true;
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...);
  return () => { isMounted = false; subscription.unsubscribe(); };
}, []);
```
- ResizeObserver with debounce for DOM measurements:
```js
const ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(measure, 80); });
ro.observe(el);
return () => { ro.disconnect(); clearTimeout(timer); };
```
- Scroll event with `requestAnimationFrame` throttle and `{ passive: true }` flag

### useCallback for Stable References
- Wrap handlers passed to child components in `useCallback` to prevent unnecessary re-renders
- Especially important for `update`, `handleParsed` functions in ResumeBuilder

### useRef Usage
- `useRef` for DOM element references (PDF export target, file input, measurement container)
- `useRef` for mutable values that shouldn't trigger re-renders (fetch lock, scroll ticking flag)

---

## API Integration Patterns

### Groq API Calls (Standard Pattern)
All AI calls follow this exact structure:
```js
const resp = await fetch("/api/groq", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,          // Low for structured output, 0.72 for creative
    max_tokens: 4000,
    response_format: { type: "json_object" },  // For structured JSON responses
    messages: [
      { role: "system", content: "..." },
      { role: "user", content: "..." }
    ]
  })
});

if (!resp.ok) {
  let errStr = "";
  try {
    const errData = await resp.json();
    errStr = errData?.error?.message || errData?.message || JSON.stringify(errData);
  } catch {
    errStr = "The backend server was unreachable...";
  }
  if (resp.status === 429) errStr = "Groq API rate limit exceeded...";
  throw new Error(errStr || `Groq API error ${resp.status}.`);
}
```

### JSON Parsing with Fallback
```js
let parsed;
try { parsed = JSON.parse(raw); }
catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("Invalid JSON"); parsed = JSON.parse(m[0]); }
```

### Supabase Patterns
- Client singleton in `src/lib/supabase.js`
- Upsert with conflict resolution: `supabase.from('table').upsert({...}, { onConflict: 'user_id' }).select()`
- Always use `Promise.race` with timeout for DB operations:
```js
const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
const { data, error } = await Promise.race([query, timeout]);
```
- Cache DB results in `localStorage` for instant load on next visit

### PDF Export Pattern
```js
const opt = {
  margin: [3, 0, 3, 0],
  filename: `${name}.pdf`,
  image: { type: "jpeg", quality: 1.0 },
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  pagebreak: { mode: ['css', 'legacy'] }
};
await html2pdf().set(opt).from(node).save();
```

---

## Component Patterns

### SVG Icons
- SVG paths stored in a top-level `icons` object, rendered via a reusable `BIcon` component:
```js
const icons = { user: "M20 21v-2a4...", briefcase: "M20 7H4..." };
function BIcon({ path, size = 9 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" ...><path d={path} /></svg>;
}
```
- Inline SVGs used directly for one-off icons in UI buttons

### Modal Pattern
- Modals rendered conditionally with fixed positioning and backdrop:
```jsx
<div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.50)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
  onClick={e => e.target === e.currentTarget && onClose()}>
  <div style={{ background: "#fff", borderRadius: 18, ... }}>
    {/* content */}
  </div>
</div>
```
- Click-outside-to-close via `e.target === e.currentTarget` check

### Accordion Pattern (CoverLetterBuilder)
```js
const [expandedSection, setExpandedSection] = useState("personal");
// Toggle: setCvExpandedSection(open ? null : "sectionName")
// Render: {open && <div className="accordion-body">...</div>}
```

### Font Loading Pattern
```js
const loadFont = (font) => {
  if (!font || !font.googleUrl) return;
  const id = `font-${font.id}`;
  if (document.getElementById(id)) return;  // Deduplicate
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet"; link.href = font.googleUrl;
  document.head.appendChild(link);
};
```

### Image Fallback Pattern (PortalLogo)
```js
const [idx, setIdx] = useState(0);
const sources = [url1, url2, url3];
if (idx >= sources.length) return <FallbackComponent />;
return <img src={sources[idx]} onError={() => setIdx(i => i + 1)} />;
```

### Drag-and-Drop File Upload
```jsx
<div
  onDragOver={e => { e.preventDefault(); setDragging(true); }}
  onDragLeave={() => setDragging(false)}
  onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
  onClick={() => inputRef.current?.click()}
>
  <input ref={inputRef} type="file" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
</div>
```

### Resizable Panel (Drag Divider)
```js
const [isDragging, setIsDragging] = useState(false);
useEffect(() => {
  if (!isDragging) return;
  const handleMouseMove = (e) => { /* update width */ };
  const handleMouseUp = () => setIsDragging(false);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  return () => { document.removeEventListener(...); };
}, [isDragging]);
```

---

## Data Patterns

### Resume Data Shape
```js
const initialData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  skills: [{ category: "Programming Languages", items: "" }],
  education: [{ degree: "", institution: "", location: "", year: "", cgpa: "" }],
  experience: [{ role: "", company: "", location: "", duration: "", bullets: [""], link: "" }],
  projects: [{ name: "", tech: "", link: "", bullets: [""] }],
  certifications: [{ name: "", issuer: "", year: "", link: "" }],
  achievements: [{ title: "", url: "" }],
};
```

### Bullet Point Cleaning
Always clean AI-returned bullets to remove leading symbols:
```js
const cleanBullets = (arr) => Array.isArray(arr)
  ? arr.map(b => typeof b === 'string' ? b.replace(/^[\s\u2022\-\*\.]+/g, '').trim() : b)
  : [];
```

### ATS Score Calculation
Score computed from data completeness — `calcATS(data)` returns `{ score: 0-100, tips: [] }`. Recalculate on every data change via `useEffect(() => { setAts(calcATS(data)); }, [data])`.

---

## Server Patterns

### Express Proxy (server.js / server.cjs)
- CommonJS format (`require`, not `import`)
- Dynamic import for ESM-only packages: `const { default: fetch } = await import("node-fetch")`
- Standard middleware: `cors()`, `express.json({ limit: "10mb" })`
- Serve static `dist/` folder + SPA fallback route
- Health check endpoint at `/api/health`

### Error Handling in Routes
```js
try {
  // ... proxy logic
  if (!groqResp.ok) return res.status(groqResp.status).json(data);
  res.json(data);
} catch (err) {
  console.error("Proxy error:", err.message);
  res.status(500).json({ error: { message: err.message } });
}
```

---

## Performance Patterns

### Scroll Optimization
```js
let ticking = false;
const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; });
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
```

### Deduplication Guards
- Font loading: check `document.getElementById(id)` before injecting `<link>`
- DB fetch: use `fetchLockRef` to prevent concurrent same-user fetches within 10 seconds
- Save button: `if (isSaving) return` guard at start of save handler

### localStorage Caching
- Resume data cached on every successful DB save/load
- Font preferences persisted: `localStorage.setItem("resume-heading-font", font.id)`
- Cover letter template persisted: `localStorage.setItem("cl_template", clTemplate)`
