import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import * as pdfjsLib from "pdfjs-dist";
// Use Vite's ?url syntax to get the worker path statically
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import LatexEditor from "../latex-editor/pages";
import FontPickerPanel from "../../components/FontPickerPanel/FontPickerPanel";
import { supabase } from "../../lib/supabase";
import "./ResumeBuilder.css";
// Set the workerSrc for PDF.js globally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const icons = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  award: "M12 15l-2 5 2-1 2 1-2-5M8.2 9.8A4 4 0 1 0 15.8 9.8 4 4 0 0 0 8.2 9.8z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  info: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  coverLetter: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
};

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  appBg: "#f8f9fa", sidebarBg: "#ffffff", panelBg: "#ffffff",
  toolbarBg: "#ffffff", previewBg: "#f1f3f5", cardBg: "#ffffff",
  atsBg: "#f8f5ff", border: "#e5e7eb", cardBorder: "#e5e7eb",
  text: "#111111", textMuted: "#666666", textLight: "#888888",
  inputBg: "#ffffff", inputBorder: "#d1d5db",
  accent: "#6B4DB0", accentLight: "rgba(107, 77, 176, 0.08)", accentBorder: "rgba(107, 77, 176, 0.2)",
};

const initialData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  skills: [{ category: "Programming Languages", items: "" }, { category: "Tools & Technologies", items: "" }, { category: "Soft Skills", items: "" }],
  education: [{ degree: "", institution: "", location: "", year: "", cgpa: "" }],
  experience: [{ role: "", company: "", location: "", duration: "", bullets: [""] }],
  projects: [{ name: "", tech: "", link: "", bullets: [""] }],
  certifications: [{ name: "", issuer: "", year: "" }],
  hobbies: "",
};

// ── ATS Scoring ───────────────────────────────────────────────────────────────
function calcATS(data) {
  let score = 0; const tips = [];
  const pF = ["name", "email", "phone", "location", "linkedin"];
  const pFilled = pF.filter(f => data.personal[f]?.trim()).length;
  score += (pFilled / pF.length) * 20;
  if (pFilled < pF.length) tips.push("Complete all personal details");
  if (data.summary?.trim().length > 50) score += 15; else tips.push("Add a professional summary (50+ characters)");
  if (data.skills.map(s => s.items).join("").trim().length > 20) score += 15; else tips.push("Add more skills in each category");
  const expFilled = data.experience.filter(e => e.role && e.company).length;
  if (expFilled > 0) score += 20; else tips.push("Add at least one work experience");
  if (data.education.some(e => e.degree && e.institution)) score += 10; else tips.push("Add your education details");
  if (data.projects.some(p => p.name)) score += 10; else tips.push("Add projects to stand out");
  if (data.certifications.some(c => c.name)) score += 5;
  const expText = data.experience.map(e => e.bullets?.join(" ")).join(" ");
  if (/\d+%|\d+\+|improved|built|led|designed/.test(expText.toLowerCase())) score += 5;
  else tips.push("Add numbers & achievements in bullets");
  return { score: Math.min(100, Math.round(score)), tips };
}

// ── Resume sub-components ─────────────────────────────────────────────────────
function BIcon({ path, size = 9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}
function RLink({ href, label }) {
  const url = !href ? "#" : href.startsWith("http") ? href : `https://${href}`;
  return <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "underline", fontSize: "9pt" }}>{label}</a>;
}
function RS({ title, children, accent = "#1a1a1a", headingFontFamily }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {/* Ensure the heading doesn't stick to the bottom of the page if the content moves to next page */}
      <div style={{ fontSize: "10pt", fontWeight: 700, letterSpacing: 0.5, borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 5, pageBreakAfter: "avoid", breakAfter: "avoid", ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>
      <div style={{ fontSize: "9.5pt" }}>{children}</div>
    </div>
  );
}
function SS({ title, children, headingFontFamily }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "8pt", letterSpacing: 2, color: "#64748b", marginBottom: 6, fontWeight: 700, pageBreakAfter: "avoid", breakAfter: "avoid", ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>
      {children}
    </div>
  );
}
function MH({ title, headingFontFamily }) {
  return <div style={{ fontSize: "8pt", fontWeight: 700, letterSpacing: 2, color: "#888", marginBottom: 4, marginTop: 10, borderBottom: "1px solid #ddd", paddingBottom: 3, ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>;
}

// ── PDF Export ────────────────────────────────────────────────────────────────
async function exportPDF(ref, name) {
  const node = ref.current;
  if (!node) return;

  const opt = {
    margin: [3, 0, 3, 0], // 3mm top & bottom — subtle on page 1, gives breathing room on page 2+
    filename: `${name || "Resume"}.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  // Inject Google Font links for PDF export
  const fontLinksForPdf = [window.__resumeHeadingFont, window.__resumeBodyFont]
    .filter(f => f && f.googleUrl)
    .map(f => f.googleUrl);
  fontLinksForPdf.forEach(url => {
    const existing = document.querySelector(`link[href="${url}"]`);
    if (!existing) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = url;
      document.head.appendChild(l);
    }
  });
  await html2pdf().set(opt).from(node).save();
}

// ── PAGINATED RESUME WRAPPER ──────────────────────────────────────────────────
const PAGE_W = 794;  // 210mm
const PAGE_H = 1123; // 297mm A4 pixel height

// ── ATS-Friendly Font Definitions ─────────────────────────────────────────────
const ATS_FONTS = [
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", category: "Sans-Serif", atsScore: "Excellent", bestFor: "Tech & Startups" },
  { id: "roboto", name: "Roboto", family: "'Roboto', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap", category: "Sans-Serif", atsScore: "Excellent", bestFor: "General Purpose" },
  { id: "open-sans", name: "Open Sans", family: "'Open Sans', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap", category: "Sans-Serif", atsScore: "Excellent", bestFor: "Corporate" },
  { id: "lato", name: "Lato", family: "'Lato', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap", category: "Sans-Serif", atsScore: "Excellent", bestFor: "Modern & Clean" },
  { id: "source-sans", name: "Source Sans 3", family: "'Source Sans 3', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap", category: "Sans-Serif", atsScore: "Excellent", bestFor: "Readability" },
  { id: "nunito-sans", name: "Nunito Sans", family: "'Nunito Sans', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap", category: "Sans-Serif", atsScore: "Good", bestFor: "Friendly & Modern" },
  { id: "merriweather", name: "Merriweather", family: "'Merriweather', serif", googleUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap", category: "Serif", atsScore: "Excellent", bestFor: "Academic & Finance" },
  { id: "lora", name: "Lora", family: "'Lora', serif", googleUrl: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap", category: "Serif", atsScore: "Excellent", bestFor: "Elegant & Classic" },
  { id: "playfair", name: "Playfair Display", family: "'Playfair Display', serif", googleUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap", category: "Serif", atsScore: "Good", bestFor: "Executive & Creative" },
  { id: "eb-garamond", name: "EB Garamond", family: "'EB Garamond', serif", googleUrl: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap", category: "Serif", atsScore: "Good", bestFor: "Traditional & Legal" },
  { id: "georgia", name: "Georgia", family: "Georgia, serif", googleUrl: null, category: "Serif", atsScore: "Excellent", bestFor: "Safe & Universal" },
  { id: "arial", name: "Arial", family: "Arial, sans-serif", googleUrl: null, category: "Sans-Serif", atsScore: "Excellent", bestFor: "Maximum ATS Safety" },
  { id: "carlito", name: "Carlito", family: "'Carlito', 'Calibri', sans-serif", googleUrl: "https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap", category: "Sans-Serif", atsScore: "Good", bestFor: "Calibri Alternative" },
  { id: "courier-new", name: "Courier New", family: "'Courier New', Courier, monospace", googleUrl: null, category: "Monospace", atsScore: "Fair", bestFor: "Classic Monospace" },
  { id: "jetbrains-mono", name: "JetBrains Mono", family: "'JetBrains Mono', monospace", googleUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap", category: "Monospace", atsScore: "Fair", bestFor: "Developer Resumes" },
  { id: "ibm-plex-mono", name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", googleUrl: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap", category: "Monospace", atsScore: "Fair", bestFor: "Developer & Tech" },
];

const loadFont = (font) => {
  if (!font || !font.googleUrl) return;
  const id = `font-${font.id}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet"; link.href = font.googleUrl;
  document.head.appendChild(link);
};

const FONT_PAIRS = [
  { label: "Professional", headId: "merriweather", bodyId: "source-sans" },
  { label: "Modern Tech", headId: "inter", bodyId: "inter" },
  { label: "Executive", headId: "playfair", bodyId: "lato" },
  { label: "Classic ATS", headId: "georgia", bodyId: "arial" },
];



function PaginatedResume({ data, template, exportRef, headingFont, bodyFont }) {
  const TemplateComp = template === "A" ? TemplateA : template === "B" ? TemplateB : TemplateC;

  const measureRef = useRef(null);
  const [totalH, setTotalH] = useState(PAGE_H);
  const [pageBreaks, setPageBreaks] = useState([0]);

  // Measure DOM element positions and compute content-aware break points
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    let timer;
    const measure = () => {
      const h = el.scrollHeight;
      if (h > 0) setTotalH(h);

      const containerRect = el.getBoundingClientRect();
      const breaks = [0];
      let nextBoundary = PAGE_H;

      // Get positions of all block elements that could cross a page boundary
      const elements = Array.from(el.querySelectorAll('div, li, p, ul, hr'))
        .map(item => {
          const rect = item.getBoundingClientRect();
          return {
            top: Math.round(rect.top - containerRect.top),
            bottom: Math.round(rect.bottom - containerRect.top),
            height: Math.round(rect.height),
          };
        })
        .filter(pos => pos.height >= 12 && pos.height < PAGE_H)
        .sort((a, b) => a.top - b.top);

      // For each page boundary, find the element closest to boundary that would be split
      // Break before THAT element (not a large parent container) to minimize gaps
      while (nextBoundary < h) {
        const crossing = elements.filter(pos => pos.top < nextBoundary && pos.bottom > nextBoundary);
        if (crossing.length > 0) {
          // Pick the element with the largest top — closest to boundary, smallest gap
          const best = crossing.reduce((a, b) => a.top > b.top ? a : b);
          breaks.push(best.top);
          nextBoundary = best.top + PAGE_H;
        } else {
          nextBoundary += PAGE_H;
        }
      }

      setPageBreaks(breaks);
    };

    timer = setTimeout(measure, 80);
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 80);
    });
    ro.observe(el);
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, [data, template]);

  const numPages = (() => {
    const lastBreak = pageBreaks[pageBreaks.length - 1];
    const remaining = totalH - lastBreak;
    if (remaining <= 0) return pageBreaks.length;
    return pageBreaks.length + Math.max(0, Math.ceil(remaining / PAGE_H) - 1);
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Hidden continuous container for html2pdf */}
      <div style={{ position: "fixed", top: 0, left: -9999, width: PAGE_W, pointerEvents: "none", zIndex: -1 }}>
        <div ref={exportRef} className="resume-container">
          <TemplateComp data={data} headingFont={headingFont} bodyFont={bodyFont} />
        </div>
      </div>

      {/* Hidden measuring container */}
      <div style={{ position: "fixed", top: 0, left: -9999, width: PAGE_W, pointerEvents: "none", zIndex: -1 }}>
        <div ref={measureRef} className="resume-container">
          <TemplateComp data={data} headingFont={headingFont} bodyFont={bodyFont} />
        </div>
      </div>

      {/* Visible sliced page cards using content-aware break points */}
      {Array.from({ length: numPages }).map((_, pi) => {
        const TOP_GAP = 32;
        const pageStart = pageBreaks[pi] ?? (pageBreaks[pageBreaks.length - 1] + PAGE_H);
        const nextPageStart = pageBreaks[pi + 1];
        const vTop = pi === 0 ? 0 : TOP_GAP;

        const contentHeight = nextPageStart != null
          ? nextPageStart - pageStart
          : totalH - pageStart;
        const vHeight = Math.min(contentHeight, PAGE_H - vTop);
        const cTop = -pageStart;

        return (
          <div key={pi} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: PAGE_W, height: PAGE_H, background: "#fff", overflow: "hidden",
              position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.13)", borderRadius: 2,
              marginBottom: 24,
            }}>
              <div style={{ position: "absolute", top: vTop, left: 0, width: PAGE_W, height: vHeight, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: cTop, left: 0, width: PAGE_W }}>
                  <div className="resume-container" style={{ boxShadow: "none", minHeight: vHeight }}>
                    <TemplateComp data={data} headingFont={headingFont} bodyFont={bodyFont} />
                  </div>
                </div>
              </div>
              <div style={{ position: "absolute", bottom: 8, right: 14, fontSize: 8.5, color: "#c0c8d2", fontFamily: "'Segoe UI', sans-serif", letterSpacing: 0.5, pointerEvents: "none" }}>
                {pi + 1} / {numPages}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Template A (Classic) ──────────────────────────────────────────────────────
function TemplateA({ data, headingFont, bodyFont }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontSize: "10pt", color: "#1a1a1a", padding: "28px 32px", lineHeight: 1.45, fontFamily: bf, background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        {p.name && <div style={{ fontSize: "22pt", fontWeight: 700, fontFamily: hf, letterSpacing: 1, marginBottom: 2 }}>{p.name}</div>}
        {p.title && <div style={{ fontSize: "11pt", color: "#444", marginBottom: 7 }}>{p.title}</div>}
        <div style={{ fontSize: "9pt", color: "#333", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", alignItems: "center" }}>
          {p.phone && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.phone} />{p.phone}</span>}
          {p.email && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.mail} />{p.email}</span>}
          {p.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.pin} />{p.location}</span>}
          {p.linkedin && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.linkedin} /><RLink href={p.linkedin} label="LinkedIn" /></span>}
          {p.github && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.github} /><RLink href={p.github} label="Github" /></span>}
          {p.portfolio && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><BIcon path={icons.globe} /><RLink href={p.portfolio} label="Portfolio" /></span>}
        </div>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #1a1a1a", margin: "8px 0" }} />
      {summary && <RS title="SUMMARY" headingFontFamily={hf}><p style={{ margin: 0 }}>{summary}</p></RS>}
      {education.some(e => e.degree) && (
        <RS title="EDUCATION" headingFontFamily={hf}>
          {education.filter(e => e.degree).map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}>{e.institution}</strong><span style={{ color: "#555", fontSize: "9pt" }}>{e.location}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><em>{e.degree}{e.cgpa ? ` - CGPA: ${e.cgpa}` : ""}</em><span style={{ color: "#555", fontSize: "9pt" }}>{e.year}</span></div>
            </div>
          ))}
        </RS>
      )}
      {skills.some(s => s.items) && (
        <RS title="TECHNICAL SKILLS" headingFontFamily={hf}>
          {skills.filter(s => s.items).map((s, i) => (
            <div key={i} style={{ marginBottom: 3 }}><strong>{s.category}:</strong> {s.items}</div>
          ))}
        </RS>
      )}
      {experience.some(e => e.role) && (
        <RS title="EXPERIENCE" headingFontFamily={hf}>
          {experience.filter(e => e.role).map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}>{e.company}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><em style={{ fontFamily: hf }}>Role - {e.role}</em><span style={{ fontSize: "9pt", color: "#555" }}>{e.location}</span></div>
              {e.bullets?.filter(b => b?.trim()).length > 0 && (
                <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                  {e.bullets.filter(b => b?.trim()).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </RS>
      )}
      {projects.some(p => p.name) && (
        <RS title="PROJECTS" headingFontFamily={hf}>
          {projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontFamily: hf }}>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>
              </div>
              {proj.tech && <div style={{ fontSize: "9pt", color: "#555" }}>Tech: {proj.tech}</div>}
              {proj.bullets?.filter(b => b?.trim()).length > 0 && (
                <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                  {proj.bullets.filter(b => b?.trim()).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </RS>
      )}
      {certifications.some(c => c.name) && (
        <RS title="CERTIFICATIONS" headingFontFamily={hf}>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {certifications.filter(c => c.name).map((c, i) => (
              <li key={i} style={{ marginBottom: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "underline" }}>{c.name}</a> : c.name}
                    {c.issuer ? ` - ${c.issuer}` : ""}
                  </span>
                  {c.year && <span>{c.year}</span>}
                </div>
              </li>
            ))}
          </ul>
        </RS>
      )}
      {hobbies && <RS title="HOBBIES & INTERESTS" headingFontFamily={hf}><p style={{ margin: 0 }}>{hobbies}</p></RS>}
    </div>
  );
}

// ── Template B (Modern Sidebar) ───────────────────────────────────────────────
function TemplateB({ data, headingFont, bodyFont }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontFamily: bf, fontSize: "10pt", color: "#1a1a1a", background: "#fff", display: "flex", minHeight: "100%" }}>
      <div style={{ width: "32%", background: "#2c3e50", color: "#ecf0f1", padding: "28px 16px" }}>
        {p.name && <div style={{ fontSize: "15pt", fontWeight: 700, fontFamily: hf, color: "#fff", marginBottom: 4 }}>{p.name}</div>}
        {p.title && <div style={{ fontSize: "9pt", color: "#bdc3c7", marginBottom: 16 }}>{p.title}</div>}
        <SS title="CONTACT" headingFontFamily={hf}>
          {p.email && <div style={{ fontSize: "8.5pt", marginBottom: 4, wordBreak: "break-all" }}>{p.email}</div>}
          {p.phone && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.phone}</div>}
          {p.location && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.location}</div>}
          {p.linkedin && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>LinkedIn</a></div>}
          {p.github && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.github.startsWith("http") ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>Github</a></div>}
          {p.portfolio && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.portfolio.startsWith("http") ? p.portfolio : `https://${p.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>Portfolio</a></div>}
        </SS>
        {skills.some(s => s.items) && (
          <SS title="SKILLS" headingFontFamily={hf}>
            {skills.filter(s => s.items).map((s, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: "8pt", color: "#bdc3c7", marginBottom: 2 }}>{s.category.toUpperCase()}</div>
                <div>{s.items.split(",").map((sk, j) => <span key={j} style={{ display: "inline-block", background: "#3d5166", borderRadius: 3, padding: "1px 6px", margin: "2px 2px", fontSize: "8pt" }}>{sk.trim()}</span>)}</div>
              </div>
            ))}
          </SS>
        )}
        {certifications.some(c => c.name) && (
          <SS title="CERTIFICATIONS" headingFontFamily={hf}>
            {certifications.filter(c => c.name).map((c, i) => (
              <div key={i} style={{ marginBottom: 5, fontSize: "9pt", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#ecf0f1" }}>
                    {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#ecf0f1", textDecoration: "underline" }}>{c.name}</a> : c.name}
                  </div>
                  {c.issuer && <div style={{ color: "#bdc3c7", fontSize: "8pt" }}>{c.issuer}</div>}
                </div>
                {c.year && <div style={{ color: "#bdc3c7", fontSize: "8pt", whiteSpace: "nowrap", marginLeft: 8 }}>{c.year}</div>}
              </div>
            ))}
          </SS>
        )}
        {hobbies && <SS title="HOBBIES" headingFontFamily={hf}><div style={{ fontSize: "9pt", lineHeight: 1.6 }}>{hobbies}</div></SS>}
      </div>
      <div style={{ flex: 1, padding: "28px 24px" }}>
        {summary && <RS title="PROFILE" accent="#2c3e50" headingFontFamily={hf}>{summary}</RS>}
        {education.some(e => e.degree) && (
          <RS title="EDUCATION" accent="#2c3e50" headingFontFamily={hf}>
            {education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}>{e.institution}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.year}</span></div>
                <div>{e.degree}{e.cgpa ? ` • CGPA: ${e.cgpa}` : ""}</div>
              </div>
            ))}
          </RS>
        )}
        {experience.some(e => e.role) && (
          <RS title="EXPERIENCE" accent="#2c3e50" headingFontFamily={hf}>
            {experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}>{e.role}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
                <div style={{ color: "#2c3e50", fontStyle: "italic", fontFamily: hf }}>{e.company}{e.location ? ` Â· ${e.location}` : ""}</div>
                {e.bullets?.filter(b => b?.trim()).length > 0 && (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {e.bullets.filter(b => b?.trim()).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </RS>
        )}
        {projects.some(p => p.name) && (
          <RS title="PROJECTS" accent="#2c3e50" headingFontFamily={hf}>
            {projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <strong style={{ fontFamily: hf }}>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>{proj.tech && <span style={{ fontSize: "9pt", color: "#555" }}> Â· {proj.tech}</span>}
                {proj.bullets?.filter(b => b?.trim()).length > 0 && (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {proj.bullets.filter(b => b?.trim()).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </RS>
        )}
      </div>
    </div>
  );
}

// ── Template C (Minimal) ──────────────────────────────────────────────────────
function TemplateC({ data, headingFont, bodyFont }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontFamily: bf, fontSize: "9.5pt", color: "#111", padding: "24px 36px", background: "#fff" }}>
      {p.name && <div style={{ fontSize: "24pt", fontWeight: 900, fontFamily: hf, borderBottom: "3px solid #111", paddingBottom: 6, marginBottom: 4 }}>{p.name}</div>}
      {p.title && <div style={{ fontSize: "11pt", color: "#555", marginBottom: 8 }}>{p.title}</div>}
      <div style={{ fontSize: "8.5pt", color: "#444", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        {p.linkedin && <a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>LinkedIn</a>}
        {p.github && <a href={p.github.startsWith("http") ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>Github</a>}
        {p.portfolio && <a href={p.portfolio.startsWith("http") ? p.portfolio : `https://${p.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>Portfolio</a>}
      </div>
      {summary && <><MH title="SUMMARY" headingFontFamily={hf} /><p style={{ margin: "0 0 10px 0", borderLeft: "3px solid #111", paddingLeft: 10 }}>{summary}</p></>}
      {skills.some(s => s.items) && (<><MH title="SKILLS" headingFontFamily={hf} />{skills.filter(s => s.items).map((s, i) => <div key={i} style={{ marginBottom: 3 }}><strong>{s.category}:</strong> {s.items}</div>)}<div style={{ marginBottom: 10 }} /></>)}
      {experience.some(e => e.role) && (<><MH title="EXPERIENCE" headingFontFamily={hf} />{experience.filter(e => e.role).map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span><strong style={{ fontFamily: hf }}>{e.role}</strong> @ <span style={{ fontFamily: hf }}>{e.company}</span></span><strong>{e.duration}</strong></div>
          {e.bullets?.filter(b => b?.trim()).map((b, j) => <div key={j} style={{ paddingLeft: 12 }}>• {b}</div>)}
        </div>
      ))}</>)}
      {education.some(e => e.degree) && (<><MH title="EDUCATION" headingFontFamily={hf} />{education.filter(e => e.degree).map((e, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}>{e.institution}</strong><span>{e.year}</span></div>
          <div>{e.degree}{e.cgpa ? ` — CGPA: ${e.cgpa}` : ""}</div>
        </div>
      ))}</>)}
      {projects.some(p => p.name) && (<><MH title="PROJECTS" headingFontFamily={hf} />{projects.filter(p => p.name).map((proj, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <strong style={{ fontFamily: hf }}>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>{proj.tech ? ` [${proj.tech}]` : ""}
          {proj.bullets?.filter(b => b?.trim()).map((b, j) => <div key={j} style={{ paddingLeft: 12 }}>• {b}</div>)}
        </div>
      ))}</>)}
      {certifications.some(c => c.name) && (<><MH title="CERTIFICATIONS" headingFontFamily={hf} />{certifications.filter(c => c.name).map((c, i) => (
        <div key={i} style={{ marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
          <span>
            {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>{c.name}</a> : c.name}
            {c.issuer ? ` — ${c.issuer}` : ""}
          </span>
          {c.year && <span>{c.year}</span>}
        </div>
      ))}</>)}
      {hobbies && <><MH title="HOBBIES" headingFontFamily={hf} /><div>{hobbies}</div></>}
    </div>
  );
}

// ── UPLOAD MODAL ──────────────────────────────────────────────────────────────

function UploadModal({ onClose, onParsed }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | extracting | parsing | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState("");
  const inputRef = useRef(null);

  // Read as ArrayBuffer for pdf.js
  const readAsArrayBuffer = (f) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsArrayBuffer(f);
  });
  const readAsText = (f) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(f);
  });

  // Extract text from PDF
  const extractPdfText = async (f) => {
    try {
      const buffer = await readAsArrayBuffer(f);
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      return text.trim();
    } catch (e) {
      console.error("PDF Parsing Error:", e);
      throw new Error(`PDF JS Error: ${e.message || "Failed to read PDF file."}`);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      setErrorMsg("Please upload a PDF, TXT, DOC or DOCX file."); return;
    }
    setFile(f); setErrorMsg(""); setStatus("idle"); setStep("");
  };

  const PARSE_PROMPT = `You are a resume parser. Extract ALL information from the resume text below and return ONLY a valid JSON object — no explanation, no markdown, no extra text.

Required JSON structure:
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "summary": "",
  "skills": [{ "category": "Category Name", "items": "skill1, skill2, skill3" }],
  "education": [{ "degree": "", "institution": "", "location": "", "year": "", "cgpa": "" }],
  "experience": [{ "role": "", "company": "", "location": "", "duration": "", "bullets": ["bullet point 1", "bullet point 2"] }],
  "projects": [{ "name": "", "tech": "", "link": "", "bullets": ["bullet point 1", "bullet point 2"] }],
  "certifications": [{ "name": "", "issuer": "", "year": "", "link": "" }],
  "hobbies": ""
}

Rules:
- Fill every field you can find in the resume
- Use "" for missing text fields, [] for missing arrays
- Group skills by category (e.g. "Programming Languages", "Frameworks", "Tools", "Soft Skills")
- Extract ALL bullet points as separate array items
- EXTREMELY IMPORTANT: DO NOT include starting bullet symbols/dots (like •, -, or *) in the extracted bullet points. Extract ONLY the text itself.
- Return ONLY raw JSON — no markdown, no code blocks, no explanation

RESUME TEXT:
`;

  const parseResume = async () => {
    if (!file) return;
    setErrorMsg(""); setStatus("extracting"); setStep("Reading file…");
    try {
      let resumeText = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setStep("Extracting text from PDF…");
        resumeText = await extractPdfText(file);
      } else {
        resumeText = await readAsText(file);
      }
      if (!resumeText || resumeText.trim().length < 10)
        throw new Error("Could not extract readable text. The document appears to be empty or is an image-based PDF without selectable text.");

      setStatus("parsing"); setStep("Groq LLaMA is reading your resume…");

      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 4000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a precise resume parser. Always respond with only valid JSON and nothing else." },
            { role: "user", content: PARSE_PROMPT + resumeText },
          ],
        }),
      });

      if (!resp.ok) {
        let errStr = "";
        try {
          const errData = await resp.json();
          errStr = errData?.error?.message || errData?.message || JSON.stringify(errData);
        } catch {
          errStr = "The backend server was unreachable or returned an invalid response. Please make sure `npm run dev` is running.";
        }

        if (resp.status === 429) {
          errStr = "Groq API rate limit exceeded. Please wait a moment and try again.";
        }

        throw new Error(errStr || `Groq API error ${resp.status}. Please try again.`);
      }

      const json = await resp.json();
      const raw = json.choices?.[0]?.message?.content || "";
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("Invalid JSON from Groq."); parsed = JSON.parse(m[0]); }

      const cleanBullets = (arr) => Array.isArray(arr) ? arr.map(b => typeof b === 'string' ? b.replace(/^[\s\u2022\-\*\.]+/g, '').trim() : b) : [];
      const cleanString = (str) => typeof str === 'string' ? str.replace(/^[\s\u2022\-\*\.]+/g, '').trim() : str;

      if (parsed.experience) {
        parsed.experience = parsed.experience.map(exp => ({ ...exp, bullets: cleanBullets(exp.bullets) }));
      }
      if (parsed.projects) {
        parsed.projects = parsed.projects.map(proj => ({ ...proj, bullets: cleanBullets(proj.bullets) }));
      }
      if (parsed.certifications) {
        parsed.certifications = parsed.certifications.map(cert => ({ ...cert, name: cleanString(cert.name) }));
      }

      setStatus("done"); setStep("All fields filled successfully!");
      setTimeout(() => { onParsed(parsed); onClose(); }, 900);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message || "Failed to parse resume. Please try again or fill manually.");
    }
  };

  const canParse = file && status === "idle";
  const isBusy = status === "extracting" || status === "parsing";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.50)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 18, width: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.20)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Upload Existing Resume</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              Powered by <span style={{ fontWeight: 700, color: "#f55036" }}>Groq</span> Â· LLaMA 3.3 70B Â· Ultra-fast parsing
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.x} /></svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>

          {/* Groq info banner */}
          <div style={{ background: "#fff8f5", border: "1px solid #fdd0c0", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <div style={{ fontSize: 11, color: "#9a3412" }}>
              <strong>Groq API</strong> uses LLaMA 3.3 70B running on custom LPU hardware — typically <strong>5–10× faster</strong> than standard LLMs. Your resume is parsed in seconds, not minutes.
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => { if (!isBusy && inputRef.current) inputRef.current.click(); }}
            style={{ border: `2px dashed ${dragging ? C.accent : file ? "#22c55e" : C.inputBorder}`, borderRadius: 12, padding: "24px 20px", textAlign: "center", background: dragging ? C.accentLight : file ? "#f0fdf4" : "#fafafa", cursor: isBusy ? "default" : "pointer", transition: "all 0.2s", marginBottom: 14 }}>
            <input ref={inputRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{(file.size / 1024).toFixed(1)} KB • {!isBusy && "Click to change"}</div>
              </div>
            ) : (
              <div>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ margin: "0 auto 8px" }}><path d={icons.upload} /></svg>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>Drag & drop your resume here</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>or click to browse</div>
                <span style={{ fontSize: 11, color: C.textLight, background: "#f3f4f6", borderRadius: 6, padding: "3px 10px" }}>PDF • TXT • DOC • DOCX</span>
              </div>
            )}
          </div>

          {/* Status messages */}
          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#dc2626", marginBottom: 12 }}>
              ⚠ {errorMsg}
            </div>
          )}
          {(status === "extracting" || status === "parsing") && (
            <div style={{ background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⏳</span>
              <div>
                <div style={{ fontWeight: 700 }}>{status === "extracting" ? "Extracting text…" : "Parsing with Groq LLaMA…"}</div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{step}</div>
              </div>
            </div>
          )}
          {status === "done" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#15803d", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.check} /></svg>
              <strong>Resume parsed! Filling in your details…</strong>
            </div>
          )}

          {/* What gets auto-filled */}
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "9px 12px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, marginBottom: 6, letterSpacing: 0.5 }}>GROQ WILL AUTO-FILL ALL 8 SECTIONS:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Personal", "Summary", "Skills", "Education", "Experience", "Projects", "Certifications", "Hobbies"].map(s => (
                <span key={s} style={{ fontSize: 10.5, background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 5, padding: "2px 8px" }}>{s}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} disabled={isBusy}
              style={{ flex: 1, padding: "9px 16px", background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: isBusy ? "not-allowed" : "pointer" }}>
              Cancel
            </button>
            <button onClick={parseResume} disabled={!canParse || isBusy || status === "done"}
              style={{ flex: 2, padding: "9px 16px", background: canParse ? "linear-gradient(135deg, #7c5cbf, #6b4db0)" : "#e5e7eb", border: "none", borderRadius: 8, color: canParse ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700, cursor: canParse ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: canParse ? "0 2px 8px rgba(107, 77, 176, 0.2)" : "none" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.upload} /></svg>
              {isBusy ? "Working…" : status === "done" ? "✓ Done!" : "Parse with Groq ⚡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// (Old inline FontPickerPanel removed, using imported FontPickerPanel)

// ── JD KEYWORD ANALYZER MODAL ─────────────────────────────────────────────────
function JDAnalyzerModal({ onClose, data, setData }) {
  const [jdText, setJdText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [analysis, setAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [added, setAdded] = useState({});
  const [showGuide, setShowGuide] = useState(false);
  const [guideRead, setGuideRead] = useState(false);

  const buildResumeText = () => {
    const p = data.personal;
    const parts = [
      p.name, p.title, data.summary,
      data.skills.map(s => s.items).join(", "),
      data.experience.map(e => [e.role, e.company, ...(e.bullets || [])].join(" ")).join(" "),
      data.projects.map(pr => [pr.name, pr.tech, ...(pr.bullets || [])].join(" ")).join(" "),
      data.education.map(e => [e.degree, e.institution].join(" ")).join(" "),
      data.certifications.map(c => c.name).join(", "),
    ];
    return parts.filter(Boolean).join("\n");
  };

  const analyze = async () => {
    if (!jdText.trim()) { setErrorMsg("Please paste a job description first."); return; }
    setStatus("analyzing"); setErrorMsg(""); setAnalysis(null); setAdded({});
    try {
      const resumeText = buildResumeText();
      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", temperature: 0.1, max_tokens: 4000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are an ATS expert. Always respond with only valid JSON." },
            { role: "user", content: `You are an ATS (Applicant Tracking System) expert. Analyze the job description and resume.\n\nJOB DESCRIPTION:\n${jdText}\n\nRESUME CONTENT:\n${resumeText}\n\nReturn ONLY valid JSON with this exact structure:\n{\n  "matchScore": 72,\n  "jobTitle": "Job title detected from JD",\n  "matchedCount": 18,\n  "matched": [\n    { "keyword": "Python", "importance": "high", "category": "Programming Languages" }\n  ],\n  "missing": [\n    { "keyword": "Docker", "importance": "high", "category": "Tools & Technologies", "suggestion": "Add to Tools & Technologies" }\n  ],\n  "softSkills": ["communication", "teamwork"],\n  "topTip": "One sentence tip to improve resume for this specific job"\n}\n\nRules:\n- importance levels: high (required or appears 3+ times), medium (preferred), low (nice to have)\n- category must be one of: Programming Languages, Frameworks, Tools & Technologies, Soft Skills, Cloud & DevOps, Databases\n- Extract EVERY SINGLE technical keyword from the JD — typically 15 to 40 keywords. Do NOT limit to 5 or 10. The missing list must include ALL keywords from JD not found in resume. Be EXHAUSTIVE\n- Return ONLY the JSON, no explanation, no markdown` }
          ]
        })
      });

      if (!resp.ok) {
        let errStr = "";
        try {
          const errData = await resp.json();
          errStr = errData?.error?.message || errData?.message || JSON.stringify(errData);
        } catch {
          errStr = "The backend server was unreachable or returned an invalid response. Please make sure `npm run dev` is running.";
        }
        if (resp.status === 429) errStr = "Groq API rate limit exceeded. Please wait a moment and try again.";
        throw new Error(errStr || `Groq API error ${resp.status}.`);
      }

      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(text);
      // Recalculate match score from actual counts — never trust AI's number
      const mc = parsed.matched?.length || 0;
      const ms = parsed.missing?.length || 0;
      const total = mc + ms;
      parsed.matchScore = total > 0 ? Math.round((mc / total) * 100) : 0;
      setAnalysis(parsed);
      setStatus("done");
    } catch (err) { setErrorMsg(err.message || "Analysis failed."); setStatus("error"); }
  };

  const addKeyword = (keyword, category) => {
    if (added[keyword]) return;
    setData(prev => {
      const skills = [...prev.skills];
      const catLower = (category || "").toLowerCase();
      let idx = skills.findIndex(s => {
        const sl = (s.category || "").toLowerCase();
        return sl === catLower || catLower.includes(sl.split(" ")[0]) || sl.includes(catLower.split(" ")[0]);
      });
      if (idx === -1 && skills.length > 0) idx = 0;
      if (idx === -1) { skills.push({ category: "Job-Matched Skills", items: keyword }); }
      else {
        const existing = skills[idx].items.split(",").map(s => s.trim().toLowerCase());
        if (existing.includes(keyword.toLowerCase())) return prev;
        skills[idx] = { ...skills[idx], items: skills[idx].items ? `${skills[idx].items}, ${keyword}` : keyword };
      }
      return { ...prev, skills };
    });
    setAdded(prev => ({ ...prev, [keyword]: category || "Skills" }));
  };

  const addAll = () => {
    if (!analysis?.missing) return;
    analysis.missing.forEach(m => addKeyword(m.keyword, m.category));
  };

  const allAdded = analysis?.missing?.length > 0 && analysis.missing.every(m => added[m.keyword]);
  const wordCount = jdText.trim().split(/\s+/).filter(Boolean).length;

  const impColor = (imp) => imp === "high" ? { c: "#dc2626", bg: "#fef2f2" } : imp === "medium" ? { c: "#b45309", bg: "#fffbeb" } : { c: "#6b7688", bg: "#f3f4f6" };
  const scoreColor = (s) => s >= 75 ? { c: "#15803d", bg: "#f0fdf4", bar: "#22c55e" } : s >= 50 ? { c: "#b45309", bg: "#fffbeb", bar: "#f59e0b" } : { c: "#dc2626", bg: "#fef2f2", bar: "#ef4444" };

  const guideContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, color: "#475569", fontSize: 12, lineHeight: 1.6 }}>
      {/* Why Use This Tool? */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          Why Use This Tool?
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, paddingLeft: 26 }}>
          The JD Analyzer compares your resume against a job description and identifies skill gaps. Get instant insights on how well your qualifications match the position.
        </div>
      </div>

      {/* What You'll Get */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          What You'll Get:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 26 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>📊</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>Match Score</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Percentage match between your resume and job description</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>✅</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>Matched Keywords</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Skills and keywords your resume already covers</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>⚠️</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>Missing Keywords</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Critical skills mentioned in the JD but not in your resume</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>💡</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>Smart Tips</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>AI-powered recommendations to improve your match score</div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          How to Use:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 26 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "#3b82f6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, minWidth: 22 }}>1</div>
            <div style={{ fontSize: 11, paddingTop: 2 }}>Find the job posting and copy the full job description</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "#3b82f6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, minWidth: 22 }}>2</div>
            <div style={{ fontSize: 11, paddingTop: 2 }}>Paste it in the text area on the left side</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "#3b82f6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, minWidth: 22 }}>3</div>
            <div style={{ fontSize: 11, paddingTop: 2 }}>Click the "Analyze Keywords" button</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "#3b82f6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, minWidth: 22 }}>4</div>
            <div style={{ fontSize: 11, paddingTop: 2 }}>Review results and update your resume accordingly</div>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div style={{ background: "#fef08a", border: "1px solid #facc15", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10 }}>
        <span style={{ fontSize: 16, minWidth: 18 }}>⭐</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontWeight: 600, color: "#714819", fontSize: 11 }}>Pro Tip</div>
          <div style={{ fontSize: 11, color: "#854d0e", lineHeight: 1.4 }}>Focus on adding the missing keywords naturally throughout your resume. Avoid keyword stuffing—hiring managers and ATS systems value quality over quantity.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ width: 900, maxWidth: "95vw", maxHeight: "90vh", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <div><div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Job Description Analyzer</div><div style={{ fontSize: 11, color: "#94a3b8" }}>Paste a JD to find missing keywords and boost your ATS score</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowGuide(s => !s)} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", background: showGuide ? "#eef2ff" : "#ffffff", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: showGuide ? "#4338ca" : "#475569" }}>
              {guideRead ? "Guide ✓" : "Why this tool?"}
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "#f3f4f6", borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Body — Two Panels */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT — JD Input */}
          <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid #e5e7eb", padding: 20, display: "flex", flexDirection: "column", gap: 12, background: "#fafbfc" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Paste Job Description</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." style={{ flex: 1, minHeight: 260, padding: 12, border: "1.5px solid #e5e7eb", borderRadius: 10, resize: "none", fontSize: 12, lineHeight: 1.6, fontFamily: "'Segoe UI', sans-serif", outline: "none", color: "#1a1a1a" }} />
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{wordCount} words</div>
            <button onClick={analyze} disabled={status === "analyzing"} style={{ padding: "11px 0", background: status === "analyzing" ? "#bba8e3" : "linear-gradient(135deg, #7c5cbf, #6b4db0)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: status === "analyzing" ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)" }}>
              {status === "analyzing" ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> Analyzing...</> : <>⚡ Analyze Keywords</>}
            </button>
            {errorMsg && <div style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>❌ {errorMsg}</div>}
          </div>

          {/* RIGHT — Results */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, position: "relative", background: "#fff" }}>
            {showGuide && (
              <div style={{ position: "absolute", inset: 12, background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, overflowY: "auto", zIndex: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Guide</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => { setGuideRead(true); setShowGuide(false); }} style={{ padding: "5px 10px", border: "1px solid #d1fae5", background: "#ecfdf3", borderRadius: 8, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#15803d" }}>
                      Mark as Read
                    </button>
                    <button onClick={() => setShowGuide(false)} style={{ width: 28, height: 28, border: "none", background: "#f3f4f6", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                </div>
                {guideContent}
              </div>
            )}
            {status === "idle" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28 }}>🔍</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>No analysis yet</div>
                <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 320 }}>Paste a job description on the left and click "Analyze Keywords" to find missing skills</div>
              </div>
            )}

            {status === "analyzing" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#f55036", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>Analyzing with AI...</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Groq LLaMA 3.3 70B is extracting keywords</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {status === "done" && analysis && (() => {
              const sc = scoreColor(analysis.matchScore);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Score Card */}
                  <div style={{ background: sc.bg, border: `1.5px solid ${sc.bar}33`, borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", border: `4px solid ${sc.bar}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: sc.c }}>{analysis.matchScore}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: sc.c }}>MATCH</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: sc.c }}>{analysis.matchScore >= 75 ? "Great Match!" : analysis.matchScore >= 50 ? "Decent Match" : "Needs Work"}</div>
                      {analysis.jobTitle && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>JD: {analysis.jobTitle}</div>}
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{analysis.matched?.length || 0} matched Â· {analysis.missing?.length || 0} missing keywords</div>
                    </div>
                  </div>

                  {/* Tip Banner */}
                  {analysis.topTip && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#1e40af", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span>💡</span><span>{analysis.topTip}</span>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {analysis.missing?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>❌ Missing Keywords ({analysis.missing.length})</div>
                        <button onClick={addAll} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 700, border: "none", borderRadius: 8, cursor: allAdded ? "default" : "pointer", background: allAdded ? "#dcfce7" : "#16a34a", color: allAdded ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                          {allAdded ? "✅ All Added!" : "➕ Add All to Skills"}
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {analysis.missing.map((m, i) => {
                          const ic = impColor(m.importance);
                          const isAdded = added[m.keyword];
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: isAdded ? "#f0fdf4" : "#fff", border: "1px solid #e5e7eb", borderLeft: `4px solid ${isAdded ? "#22c55e" : ic.c}`, borderRadius: 8, transition: "all 0.2s" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{m.keyword}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: ic.c, background: ic.bg, padding: "2px 8px", borderRadius: 20 }}>{m.importance}</span>
                                <span style={{ fontSize: 9, color: "#94a3b8" }}>{m.category}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                <button onClick={() => addKeyword(m.keyword, m.category)} disabled={!!isAdded} style={{ padding: "4px 12px", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 6, cursor: isAdded ? "default" : "pointer", background: isAdded ? "#dcfce7" : "#16a34a", color: isAdded ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                                  {isAdded ? "✓ Added" : "+ Add"}
                                </button>
                                {isAdded && <span style={{ fontSize: 9, color: "#15803d" }}>✅ Added to Skills → {isAdded}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matched Keywords */}
                  {analysis.matched?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>✅ Matched Keywords ({analysis.matched.length})</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.matched.map((m, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#15803d", background: "#f0fdf4", border: "1px solid #86efac", padding: "4px 12px", borderRadius: 20 }}>{m.keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {analysis.softSkills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>💬 Soft Skills Found</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.softSkills.map((s, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 12px", borderRadius: 20, textTransform: "capitalize" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {status === "error" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#dc2626" }}>
                <span style={{ fontSize: 48 }}>⚠️</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Analysis Failed</div>
                <div style={{ fontSize: 12, textAlign: "center", maxWidth: 280 }}>{errorMsg}</div>
                <button onClick={analyze} style={{ padding: "8px 20px", background: "#f55036", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>🔄 Retry</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Routing Wrapper ───────────────────────────────────────────────────────────
import HomePage from '../HomePage/HomePage.jsx';
import CoverLetterBuilder from '../CoverLetterBuilder/CoverLetterBuilder.jsx';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import Steps from '../../components/Steps.jsx';
import Networking from '../Networking/Networking.jsx';
import JobPortals from '../JobPortals/JobPortals.jsx';

function App() {
  const location = useLocation();
  const hideFooter = location.pathname === "/builder" || location.pathname === "/cover-letter";

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<ResumeBuilder />} />
        <Route path="/cover-letter" element={<CoverLetterBuilder />} />
        <Route path="/latex-editor" element={<LatexEditor />} />
        <Route path="/steps" element={<Steps />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/job-portals" element={<JobPortals />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

// ── Resume Builder Page ──────────────────────────────────────────────────────
function ResumeBuilder() {
  const location = useLocation();
  const [data, setData] = useState(initialData);
  const [activeSection, setActiveSection] = useState("personal");
  const [activeTemplate, setActiveTemplate] = useState("A");
  const [ats, setAts] = useState({ score: 0, tips: [] });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [headingFont, setHeadingFont] = useState(() => {
    const saved = localStorage.getItem("resume-heading-font");
    const found = saved ? ATS_FONTS.find(f => f.id === saved) : null;
    return found || ATS_FONTS.find(f => f.id === "inter");
  });
  const [bodyFont, setBodyFont] = useState(() => {
    const saved = localStorage.getItem("resume-body-font");
    const found = saved ? ATS_FONTS.find(f => f.id === saved) : null;
    return found || ATS_FONTS.find(f => f.id === "inter");
  });
  const [showFontPanel, setShowFontPanel] = useState(false);

  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Check auth and load saved resume
  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch saved resume
        const { data: dbData, error } = await supabase
          .from('resume_data')
          .select('resume_data')
          .eq('user_id', session.user.id)
          .single();

        if (dbData?.resume_data && !error) {
          // Merge with initial data to ensure all structural keys (e.g. arrays for projects) exist
          setData((prev) => ({ ...prev, ...dbData.resume_data }));
        }
      }
    };
    fetchSessionAndData();

    // Listen to login/logout events cleanly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: dbData } = await supabase.from('resume_data').select('resume_data').eq('user_id', session.user.id).single();
        if (dbData?.resume_data) {
          setData((prev) => ({ ...prev, ...dbData.resume_data }));
        }
      } else {
        setUser(null);
        setData(initialData); // Reset to blank if logged out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveToDb = async () => {
    if (!user) {
      alert("Please sign in or create an account to save your resume seamlessly.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('resume_data').upsert({
        user_id: user.id,
        resume_data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (error) throw error;

      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to save");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Load fonts on mount and when changed
  useEffect(() => { loadFont(headingFont); loadFont(bodyFont); }, []);
  useEffect(() => { loadFont(headingFont); localStorage.setItem("resume-heading-font", headingFont.id); }, [headingFont]);
  useEffect(() => { loadFont(bodyFont); localStorage.setItem("resume-body-font", bodyFont.id); }, [bodyFont]);
  useEffect(() => { window.__resumeHeadingFont = headingFont; window.__resumeBodyFont = bodyFont; }, [headingFont, bodyFont]);

  // Open JD panel if coming from header "Match JD" button
  useEffect(() => {
    if (location.state?.openJDPanel) {
      setShowJD(true);
      // Clear the state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  const [showJD, setShowJD] = useState(false);
  const previewRef = useRef(null);
  const [numPages, setNumPages] = useState(1);
  const [zoom, setZoom] = useState(80);

  const [formWidth, setFormWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      let w = e.clientX - 58;
      if (w < 250) w = 250;
      if (w > 1000) w = 1000;
      setFormWidth(w);
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => { setAts(calcATS(data)); }, [data]);

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

  // Merge parsed data — keep existing non-empty values, fill missing ones
  const handleParsed = useCallback((parsed) => {
    setData(prev => {
      const merged = JSON.parse(JSON.stringify(prev));

      // Personal - preserve explicitly requested URLs
      const preserveUrls = ['linkedin', 'github', 'portfolio'];
      Object.keys(parsed.personal || {}).forEach(k => {
        if (!merged.personal[k] && parsed.personal[k]) {
          merged.personal[k] = parsed.personal[k];
        } else if (preserveUrls.includes(k) && merged.personal[k]) {
          // Explicitly do NOT overwrite existing URL links with blank or AI guessed values
        }
      });

      if (!merged.summary && parsed.summary) merged.summary = parsed.summary;
      if (parsed.skills?.length) merged.skills = parsed.skills;
      if (parsed.education?.some(e => e.degree)) merged.education = parsed.education;
      if (parsed.experience?.some(e => e.role)) merged.experience = parsed.experience;

      // Merge Projects while preserving URLs by matching names or indices
      if (parsed.projects?.some(p => p.name)) {
        const newProjects = parsed.projects.map((p, i) => {
          // Attempt to find a matching project by name (case-insensitive)
          const existingByName = prev.projects.find(ep => ep.name && p.name && ep.name.toLowerCase() === p.name.toLowerCase());
          // Or fallback to matched array index if it had a URL
          const existingByIndex = prev.projects[i];

          let preservedLink = "";
          if (existingByName && existingByName.link) preservedLink = existingByName.link;
          else if (existingByIndex && existingByIndex.link) preservedLink = existingByIndex.link;

          return { ...p, link: preservedLink || p.link || "" };
        });
        merged.projects = newProjects;
      }

      if (parsed.certifications?.some(c => c.name)) merged.certifications = parsed.certifications;
      if (!merged.hobbies && parsed.hobbies) merged.hobbies = parsed.hobbies;

      return merged;
    });
    setActiveSection("personal");
  }, []);

  const generateSummary = async () => {
    setAiLoading(true); setAiError("");
    try {
      const expText = data.experience.filter(e => e.role).map(e => `${e.role} at ${e.company}: ${e.bullets?.join(", ")}`).join("; ");
      const skillText = data.skills.filter(s => s.items).map(s => `${s.category}: ${s.items}`).join("; ");
      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 1000,
          messages: [{ role: "system", content: "You are a professional resume writer. Write concise, ATS-friendly summaries." }, { role: "user", content: `Write a professional resume summary (2-3 sentences, ATS-friendly) for:\nName: ${data.personal.name || "Professional"}\nTitle: ${data.personal.title || ""}\nExperience: ${expText || "fresher"}\nSkills: ${skillText}\nKeep it concise, impactful, avoid first-person. Output only the summary text.` }]
        })
      });
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || "";
      if (text) update("summary", text); else setAiError("Could not generate. Try again.");
    } catch { setAiError("AI request failed."); }
    setAiLoading(false);
  };

  const atsColor = ats.score >= 75 ? "#15803d" : ats.score >= 50 ? "#b45309" : "#b91c1c";
  const atsBar = ats.score >= 75 ? "#22c55e" : ats.score >= 50 ? "#f59e0b" : "#ef4444";




  const sideNav = [
    { id: "personal", label: "Personal", icon: icons.user },
    { id: "summary", label: "Summary", icon: icons.layers },
    { id: "skills", label: "Skills", icon: icons.code },
    { id: "education", label: "Education", icon: icons.book },
    { id: "experience", label: "Experience", icon: icons.briefcase },
    { id: "projects", label: "Projects", icon: icons.globe },
    { id: "certifications", label: "Certs", icon: icons.award },
    { id: "hobbies", label: "Hobbies", icon: icons.heart },
  ];

  const IS = { width: "100%", padding: "11px 14px", background: "#f8fafc", border: `1px solid #cbd5e1`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "all 0.2s ease", boxShadow: "inset 0 3px 6px rgba(0,0,0,0.06), inset 0 0 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.8)" };
  const CS = { background: "#ffffff", border: `1px solid #e2e8f0`, borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.02)" };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.appBg, fontFamily: "'Sora', sans-serif", overflow: "hidden" }}>

      {showJD && <JDAnalyzerModal onClose={() => setShowJD(false)} data={data} setData={setData} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onParsed={handleParsed} />}

      {/* ── Sidebar with Icons + Labels ── */}
      <div style={{ width: 200, background: C.sidebarBg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, gap: 2, boxShadow: "1px 0 4px rgba(0,0,0,0.02)", fontFamily: "'Sora', sans-serif", zIndex: 10 }}>

        {/* ATS Score Circular */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#000", letterSpacing: 1.2, marginBottom: 12, marginTop: -12 }}>ATS SCORE</div>
          <div style={{ position: "relative", width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="84" height="84" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="2.5"></circle>
              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke={C.accent} strokeWidth="2.5" strokeDasharray={`${ats.score}, 100`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }}></circle>
            </svg>
            <div style={{ position: "absolute", fontSize: 24, fontWeight: 900, color: "#000" }}>{ats.score}</div>
          </div>
          <button onClick={() => setShowTips(!showTips)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, marginTop: 8, display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.info} /></svg> Tips
          </button>

          {showTips && ats.tips.length > 0 && (
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.border}`, width: "90%", boxSizing: "border-box", fontSize: 10 }}>
              {ats.tips.map((t, i) => (
                <div key={i} style={{ color: "#92400e", marginBottom: 3, display: "flex", alignItems: "flex-start", gap: 5, lineHeight: 1.3 }}>
                  <span style={{ fontSize: 10 }}>⚡</span><span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {sideNav.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} title={s.label}
            style={{
              width: "88%",
              height: 42,
              border: activeSection === s.id ? `1.5px solid ${C.accent}` : "1px solid #d1d5db",
              cursor: "pointer",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingLeft: 16,
              background: activeSection === s.id ? `linear-gradient(145deg, ${C.accentLight}, #ffffff)` : "linear-gradient(145deg, #ffffff, #f3f4f6)",
              color: activeSection === s.id ? C.accent : "#4b5563",
              transition: "all 0.15s ease",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: activeSection === s.id
                ? "0 4px 10px rgba(124, 58, 237, 0.2), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 0 rgba(124, 58, 237, 0.1)"
                : "0 4px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.02)",
              transform: activeSection === s.id ? "translateY(2px)" : "translateY(0)",
              marginBottom: 8
            }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            {s.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <button onClick={() => window.location.href = "/"} title="Home"
          style={{ width: "90%", height: 38, border: "1.5px solid transparent", cursor: "pointer", borderRadius: 9, display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, background: "transparent", color: C.textLight, transition: "all 0.15s", fontSize: 12, fontWeight: 500, marginBottom: 12 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          Home
        </button>
      </div>

      {/* ── Form Panel ── */}
      <div style={{ width: formWidth, flexShrink: 0, background: C.panelBg, borderRight: `none`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header with Upload button */}
        <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.border}`, fontFamily: "'Sora', sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>Resume<em style={{ color: C.accent, fontStyle: "normal" }}>Forge</em></div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>AI-powered ATS optimized</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {/* Save Button */}
              <button onClick={handleSaveToDb}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: `1.5px solid ${C.inputBorder}`, borderRadius: 8, color: C.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                {isSaving ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                ) : saveMessage === "Saved!" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                )} {saveMessage || "Save"}
              </button>
              {/* Match JD button */}
              <button onClick={() => setShowJD(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: `1.5px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Match JD
              </button>
              {/* Upload Resume button */}
              <button onClick={() => setShowUpload(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)" }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.upload} /></svg>
                Upload CV
              </button>
            </div>
          </div>
          {/* Upload hint */}
          <div style={{ marginTop: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 7, padding: "6px 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d={icons.info} /></svg>
            <span style={{ fontSize: 10.5, color: C.accent }}>Upload your existing resume — AI auto-fills all fields instantly</span>
          </div>
        </div>

        {/* Form Content Wrapper */}

        {/* Form Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {activeSection === "personal" && <PersonalForm data={data.personal} update={update} IS={IS} />}
          {activeSection === "summary" && <SummaryForm summary={data.summary} update={update} IS={IS} onGenerate={generateSummary} loading={aiLoading} error={aiError} />}
          {activeSection === "skills" && <SkillsForm skills={data.skills} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "education" && <EducationForm education={data.education} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "experience" && <ExperienceForm experience={data.experience} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "projects" && <ProjectsForm projects={data.projects} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "certifications" && <CertsForm certifications={data.certifications} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "hobbies" && <HobbiesForm hobbies={data.hobbies} update={update} IS={IS} />}
          {activeSection === "coverLetter" && <CoverLetterForm clJD={clJD} setClJD={setClJD} clTone={clTone} setClTone={setClTone} clLength={clLength} setClLength={setClLength} clHiringManager={clHiringManager} setClHiringManager={setClHiringManager} clCompany={clCompany} setClCompany={setClCompany} clJobTitle={clJobTitle} setClJobTitle={setClJobTitle} detectedJobTitle={detectedJobTitle} clLoading={clLoading} clError={clError} onGenerate={generateCoverLetter} IS={IS} />}
        </div>
      </div>

      {/* ── Resizer ── */}
      <div
        onMouseDown={() => setIsDragging(true)}
        style={{ width: 6, background: isDragging ? C.accent : C.border, cursor: "col-resize", zIndex: 10, transition: "background 0.2s" }}
        onMouseEnter={(e) => { if (!isDragging) e.target.style.background = C.accentLight; }}
        onMouseLeave={(e) => { if (!isDragging) e.target.style.background = C.border; }}
      />

      {/* ── Preview Panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {activeSection === "coverLetter" ? (
          <>
            {/* Cover Letter Toolbar */}
            <div style={{ padding: "9px 18px", background: "#fff", borderBottom: "1px solid #e3e8ef", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Template selector */}
              <div style={{ display: "flex", gap: 5, marginRight: 8 }}>
                {[
                  { id: "executive", label: "Executive", icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" /></svg> },
                  { id: "modern", label: "Modern", icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="18" rx="1" /><line x1="13" y1="7" x2="21" y2="7" /><line x1="13" y1="12" x2="21" y2="12" /><line x1="13" y1="17" x2="21" y2="17" /></svg> },
                  { id: "minimal", label: "Minimal", icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="13" y2="16" /></svg> }
                ].map(t => (
                  <button key={t.id} onClick={() => setClTemplate(t.id)} title={t.label}
                    style={{ width: 70, height: 42, border: `1.5px solid ${clTemplate === t.id ? "#2563eb" : "#e3e8ef"}`, borderRadius: 8, background: clTemplate === t.id ? "#eff6ff" : "#fff", color: clTemplate === t.id ? "#2563eb" : "#6b7688", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    {t.icon}
                    <span style={{ fontSize: 9, fontWeight: 700 }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowClFontPanel(v => !v)} style={{ padding: "5px 12px", background: showClFontPanel ? "#eff6ff" : "#fff", border: `1.5px solid ${showClFontPanel ? "#2563eb" : "#e3e8ef"}`, borderRadius: 7, color: showClFontPanel ? "#2563eb" : "#6b7688", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🔤 Fonts</button>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <button onClick={() => setClFontSize(v => Math.max(9, v - 0.5))} style={{ width: 26, height: 26, border: "1px solid #e3e8ef", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, color: "#6b7688", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 12, color: "#1a2332", fontWeight: 600, minWidth: 32, textAlign: "center" }}>{clFontSize}pt</span>
                <button onClick={() => setClFontSize(v => Math.min(14, v + 0.5))} style={{ width: 26, height: 26, border: "1px solid #e3e8ef", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, color: "#6b7688", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, color: "#9aa3af" }}>Spacing</span>
                {[1.5, 1.8, 2.0].map(lh => (
                  <button key={lh} onClick={() => setClLineHeight(lh)} style={{ padding: "4px 8px", background: clLineHeight === lh ? "#eff6ff" : "#fff", border: `1px solid ${clLineHeight === lh ? "#2563eb" : "#e3e8ef"}`, borderRadius: 5, color: clLineHeight === lh ? "#2563eb" : "#6b7688", fontSize: 11, cursor: "pointer" }}>{lh}</button>
                ))}
              </div>
              <button onClick={() => setClEditMode(v => !v)} style={{ padding: "5px 12px", background: clEditMode ? "#eff6ff" : "#fff", border: `1.5px solid ${clEditMode ? "#2563eb" : "#e3e8ef"}`, borderRadius: 7, color: clEditMode ? "#2563eb" : "#6b7688", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{clEditMode ? "👁 View Mode" : "✏️ Edit Letter"}</button>
              <div style={{ flex: 1 }} />
              <button onClick={handleCopyCL} style={{ padding: "5px 13px", background: "#fff", border: "1.5px solid #e3e8ef", borderRadius: 7, color: clCopied ? "#15803d" : "#6b7688", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{clCopied ? "✅ Copied!" : "📋 Copy"}</button>
              <button onClick={downloadCoverLetterPDF} disabled={!coverLetter || clDownloading} style={{ padding: "5px 16px", background: coverLetter && !clDownloading ? "#fff" : "#f3f4f6", border: `1.5px solid ${coverLetter && !clDownloading ? "#2563eb" : "#e3e8ef"}`, borderRadius: 7, color: coverLetter && !clDownloading ? "#2563eb" : "#9ca3af", fontSize: 12, fontWeight: 700, cursor: coverLetter && !clDownloading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 5, opacity: clDownloading ? 0.7 : 1 }}>
                {clDownloading ? "⏳ Generating PDF..." : <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> Download PDF</>}
              </button>
            </div>
            {showClFontPanel && (
              <div style={{ position: "relative", zIndex: 100 }}>
                <div className="card" style={{
                  position: "absolute", top: 10, left: 18, padding: 24, width: 480, display: "flex", flexDirection: "column", gap: 20, zIndex: 9000,
                }}>
                  {/* Close Button */}
                  <button onClick={() => setShowClFontPanel(false)} style={{
                    position: "absolute", top: 12, right: 12, width: 28, height: 28,
                    background: "rgba(255, 255, 255, 0.2)", border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "all 0.2s"
                  }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.x} /></svg>
                  </button>

                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column" }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 18, background: "#6366f1", borderRadius: 3 }} />
                          Heading Font
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginLeft: 12 }}>Name Â· Date Â· Signature</div>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 8, marginRight: -8 }} className="custom-scroll">
                        {["Serif", "Sans-Serif"].map(cat => (
                          <div key={cat} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                              {cat.toUpperCase()}
                              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(203, 213, 225, 0.5), transparent)" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                              {CL_FONTS.filter(f => f.category === cat).map(f => {
                                const isSel = clHeadingFont === f.family;
                                return (
                                  <div key={f.name} onClick={() => { setClHeadingFont(f.family); loadCLFont(f.url); }}
                                    style={{
                                      padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                                      background: isSel ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.4)",
                                      border: isSel ? "1.5px solid #6366f1" : "1px solid rgba(226, 232, 240, 0.6)",
                                      boxShadow: isSel ? "0 4px 12px rgba(99, 102, 241, 0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
                                      transform: isSel ? "translateY(-1px)" : "none",
                                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                    }}
                                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)"; }}
                                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"; }}>
                                    <span style={{ fontFamily: f.family, fontSize: 16, fontWeight: 500, color: isSel ? "#4f46e5" : "#1e293b", display: "block" }}>{f.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ width: 1, background: "linear-gradient(180deg, transparent, rgba(203, 213, 225, 0.6), transparent)" }} />

                    <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", flexDirection: "column" }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 18, background: "#8b5cf6", borderRadius: 3 }} />
                          Body Font
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginLeft: 12 }}>Paragraphs Â· All text</div>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 8, marginRight: -8 }} className="custom-scroll">
                        {["Serif", "Sans-Serif"].map(cat => (
                          <div key={cat} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                              {cat.toUpperCase()}
                              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(203, 213, 225, 0.5), transparent)" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                              {CL_FONTS.filter(f => f.category === cat).map(f => {
                                const isSel = clBodyFont === f.family;
                                return (
                                  <div key={f.name} onClick={() => { setClBodyFont(f.family); loadCLFont(f.url); }}
                                    style={{
                                      padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                                      background: isSel ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.4)",
                                      border: isSel ? "1.5px solid #8b5cf6" : "1px solid rgba(226, 232, 240, 0.6)",
                                      boxShadow: isSel ? "0 4px 12px rgba(139, 92, 246, 0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
                                      transform: isSel ? "translateY(-1px)" : "none",
                                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                    }}
                                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)"; }}
                                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"; }}>
                                    <span style={{ fontFamily: f.family, fontSize: 16, fontWeight: 500, color: isSel ? "#7c3aed" : "#1e293b", display: "block" }}>{f.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <CoverLetterPreview coverLetter={coverLetter} setCoverLetter={setCoverLetter} personal={data.personal} clHiringManager={clHiringManager} clCompany={clCompany} clLoading={clLoading} clEditMode={clEditMode} clHeadingFont={clHeadingFont} clBodyFont={clBodyFont} clFontSize={clFontSize} clLineHeight={clLineHeight} detectedJobTitle={detectedJobTitle} clTemplate={clTemplate} clJobTitle={clJobTitle} />
          </>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ padding: "9px 18px", background: C.toolbarBg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginRight: 4 }}>Template:</span>
              {["A", "B", "C"].map(t => (
                <button key={t} onClick={() => setActiveTemplate(t)}
                  style={{ padding: "5px 14px", border: `1.5px solid ${activeTemplate === t ? C.accent : C.border}`, borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeTemplate === t ? C.accentLight : "#fff", color: activeTemplate === t ? C.accent : C.textMuted, transition: "all 0.15s" }}>
                  {t === "A" ? "Classic" : t === "B" ? "Modern" : "Minimal"}
                </button>
              ))}
              <div style={{ flex: 1 }} />

              {/* Font Picker */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowFontPanel(!showFontPanel)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: showFontPanel ? C.accentLight : "#fff", border: showFontPanel ? `1.5px solid ${C.accentBorder}` : `1.5px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color: showFontPanel ? C.accent : C.textLight, transition: "all 0.15s" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
                  Font
                </button>
                <FontPickerPanel
                  isOpen={showFontPanel}
                  onClose={() => setShowFontPanel(false)}
                  defaultHeading={headingFont?.name || "Inter"}
                  defaultBody={bodyFont?.name || "Roboto"}
                  onApply={(hName, bName) => {
                    const hFont = ATS_FONTS.find(f => f.name === hName) || ATS_FONTS[0];
                    const bFont = ATS_FONTS.find(f => f.name === bName) || ATS_FONTS[1];
                    setHeadingFont(hFont);
                    setBodyFont(bFont);
                    setShowFontPanel(false);
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 12 }}>
                <button onClick={() => setZoom(z => Math.max(30, z - 10))}
                  style={{ width: 28, height: 28, border: `1.5px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  −
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, minWidth: 40, textAlign: "center", userSelect: "none" }}>{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(150, z + 10))}
                  style={{ width: 28, height: 28, border: `1.5px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  +
                </button>
              </div>
              {/* Export button */}
              <button disabled={aiLoading} onClick={() => exportPDF(previewRef, data.personal.name)}
                style={{ height: 32, padding: "0 14px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.download} /></svg>
                PDF
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", background: C.previewBg, padding: "28px 0 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", width: PAGE_W }}>
                <PaginatedResume
                  data={data}
                  template={activeTemplate}
                  exportRef={previewRef}
                  headingFont={headingFont}
                  bodyFont={bodyFont}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
}

// ── Shared Form Helpers ───────────────────────────────────────────────────────
function FL({ children }) {
  return <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</label>;
}
function SH({ title, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ width: 26, height: 26, background: C.accentLight, border: `1.5px solid ${C.accentBorder}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
    </div>
  );
}
function AB({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ width: "100%", marginTop: 6, padding: "8px 14px", background: C.accentLight, border: `1.5px dashed ${C.accentBorder}`, borderRadius: 8, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
      ï¼‹ {label}
    </button>
  );
}
function RB({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "2px 7px", lineHeight: 1 }}>×</button>
  );
}
function PrimaryBtn({ onClick, children, loading }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "9px 16px", background: "#fff", border: `1.5px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
      {children}
    </button>
  );
}
function BulletEditor({ bullets, onUpdate, onAdd, onRemove, IS, placeholder }) {
  return (
    <div style={{ marginTop: 8 }}>
      <FL>Bullet Points</FL>
      {bullets?.map((b, j) => (
        <div key={j} style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
          <span style={{ color: C.accent, fontWeight: 900, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>•</span>
          <input value={b} onChange={e => onUpdate(j, e.target.value)} placeholder={placeholder} style={{ ...IS, flex: 1 }} />
          <RB onClick={() => onRemove(j)} />
        </div>
      ))}
      <button onClick={onAdd} style={{ background: "#fff", border: `1px dashed ${C.inputBorder}`, borderRadius: 6, color: C.textMuted, fontSize: 11, padding: "4px 10px", cursor: "pointer", width: "100%", marginTop: 2 }}>ï¼‹ Add bullet point</button>
    </div>
  );
}

// ── Form Sections ─────────────────────────────────────────────────────────────
function PersonalForm({ data, update, IS }) {
  return (
    <div>
      <SH title="Personal Details" icon={icons.user} />
      {[["Full Name", "personal.name", "Anshu Prasad"], ["Job Title", "personal.title", "Data Analyst | AI Automation"], ["Email", "personal.email", "you@email.com"], ["Phone", "personal.phone", "+91-9876543210"], ["Location", "personal.location", "Noida, India"]].map(([lbl, path, ph]) => (
        <div key={path} style={{ marginBottom: 9 }}><FL>{lbl}</FL><input value={data[path.split(".")[1]] || ""} onChange={e => update(path, e.target.value)} placeholder={ph} style={IS} /></div>
      ))}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 6 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.accent, marginBottom: 8 }}>🔗 Links <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 10 }}>(clickable in resume)</span></div>
        {[["LinkedIn URL", "personal.linkedin", "https://linkedin.com/in/yourname"], ["GitHub URL", "personal.github", "https://github.com/yourname"], ["Portfolio URL", "personal.portfolio", "https://yourportfolio.com"]].map(([lbl, path, ph]) => (
          <div key={path} style={{ marginBottom: 9 }}><FL>{lbl}</FL><input value={data[path.split(".")[1]] || ""} onChange={e => update(path, e.target.value)} placeholder={ph} style={IS} /></div>
        ))}
      </div>
    </div>
  );
}
function SummaryForm({ summary, update, onGenerate, loading, error, IS }) {
  return (
    <div>
      <SH title="Professional Summary" icon={icons.layers} />
      <FL>Summary</FL>
      <textarea value={summary} onChange={e => update("summary", e.target.value)} placeholder="Results-driven Data Analyst with expertise in..." rows={5} style={{ ...IS, resize: "vertical", marginBottom: 10 }} />
      <PrimaryBtn onClick={onGenerate} loading={loading}>{loading ? "⏳ Generating..." : "✨ Generate with AI"}</PrimaryBtn>
      {error && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 6 }}>{error}</div>}
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>AI crafts an ATS-friendly summary from your experience & skills.</div>
    </div>
  );
}
function SkillsForm({ skills, setData, IS, CS }) {
  const upd = (i, k, v) => setData(p => { const s = [...p.skills]; s[i] = { ...s[i], [k]: v }; return { ...p, skills: s }; });
  const add = () => setData(p => ({ ...p, skills: [...p.skills, { category: "", items: "" }] }));
  const del = i => setData(p => { const s = [...p.skills]; s.splice(i, 1); return { ...p, skills: s }; });
  return (
    <div>
      <SH title="Skills" icon={icons.code} />
      {skills.map((s, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 8 }}>
              <FL>Category Name</FL>
              <input value={s.category} onChange={e => upd(i, "category", e.target.value)} placeholder="e.g. Programming Languages, AI Tools..." style={{ ...IS, fontWeight: 700 }} />
            </div>
            <div style={{ paddingTop: 17 }}><RB onClick={() => del(i)} /></div>
          </div>
          <FL>Skills (comma separated)</FL>
          <textarea value={s.items} onChange={e => upd(i, "items", e.target.value)} placeholder="SQL, Python, Power BI, Excel..." rows={2} style={{ ...IS, resize: "vertical" }} />
        </div>
      ))}
      <AB onClick={add} label="Add Skill Category" />
    </div>
  );
}
function EducationForm({ education, setData, IS, CS }) {
  const upd = (i, k, v) => setData(p => { const e = [...p.education]; e[i] = { ...e[i], [k]: v }; return { ...p, education: e }; });
  const add = () => setData(p => ({ ...p, education: [...p.education, { degree: "", institution: "", location: "", year: "", cgpa: "" }] }));
  const del = i => setData(p => { const e = [...p.education]; e.splice(i, 1); return { ...p, education: e }; });
  return (
    <div>
      <SH title="Education" icon={icons.book} />
      {education.map((e, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>Education #{i + 1}</span><RB onClick={() => del(i)} />
          </div>
          {[["Degree / Course", "degree"], ["Institution", "institution"], ["Location", "location"], ["Year", "year"], ["CGPA / Score", "cgpa"]].map(([lbl, k]) => (
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={e[k]} onChange={el => upd(i, k, el.target.value)} style={IS} /></div>
          ))}
        </div>
      ))}
      <AB onClick={add} label="Add Education" />
    </div>
  );
}
function ExperienceForm({ experience, setData, IS, CS }) {
  const upd = (i, k, v) => setData(p => { const e = [...p.experience]; e[i] = { ...e[i], [k]: v }; return { ...p, experience: e }; });
  const addB = i => setData(p => { const e = [...p.experience]; e[i].bullets = [...(e[i].bullets || []), ""]; return { ...p, experience: e }; });
  const updB = (i, j, v) => setData(p => { const e = [...p.experience]; e[i].bullets[j] = v; return { ...p, experience: e }; });
  const delB = (i, j) => setData(p => { const e = [...p.experience]; e[i].bullets.splice(j, 1); return { ...p, experience: e }; });
  const add = () => setData(p => ({ ...p, experience: [...p.experience, { role: "", company: "", location: "", duration: "", bullets: [""] }] }));
  const del = i => setData(p => { const e = [...p.experience]; e.splice(i, 1); return { ...p, experience: e }; });
  return (
    <div>
      <SH title="Experience" icon={icons.briefcase} />
      {experience.map((e, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>Experience #{i + 1}</span><RB onClick={() => del(i)} />
          </div>
          {[["Job Title / Role", "role"], ["Company", "company"], ["Location", "location"], ["Duration", "duration"]].map(([lbl, k]) => (
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={e[k]} onChange={el => upd(i, k, el.target.value)} placeholder={k === "duration" ? "Jan 2025 - Present" : ""} style={IS} /></div>
          ))}
          <BulletEditor bullets={e.bullets} onUpdate={(j, v) => updB(i, j, v)} onAdd={() => addB(i)} onRemove={(j) => delB(i, j)} IS={IS} placeholder="Built 3+ AI-driven apps improving efficiency by 30%" />
        </div>
      ))}
      <AB onClick={add} label="Add Experience" />
    </div>
  );
}
function ProjectsForm({ projects, setData, IS, CS }) {
  const upd = (i, k, v) => setData(p => { const a = [...p.projects]; a[i] = { ...a[i], [k]: v }; return { ...p, projects: a }; });
  const addB = i => setData(p => { const a = [...p.projects]; a[i].bullets = [...(a[i].bullets || []), ""]; return { ...p, projects: a }; });
  const updB = (i, j, v) => setData(p => { const a = [...p.projects]; a[i].bullets[j] = v; return { ...p, projects: a }; });
  const delB = (i, j) => setData(p => { const a = [...p.projects]; a[i].bullets.splice(j, 1); return { ...p, projects: a }; });
  const add = () => setData(p => ({ ...p, projects: [...p.projects, { name: "", tech: "", link: "", bullets: [""] }] }));
  const del = i => setData(p => { const a = [...p.projects]; a.splice(i, 1); return { ...p, projects: a }; });
  return (
    <div>
      <SH title="Projects" icon={icons.globe} />
      {projects.map((proj, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>Project #{i + 1}</span><RB onClick={() => del(i)} />
          </div>
          {[["Project Name", "name"], ["Tech Stack", "tech"], ["Project Link", "link"]].map(([lbl, k]) => (
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={proj[k]} onChange={e => upd(i, k, e.target.value)} style={IS} /></div>
          ))}
          <BulletEditor bullets={proj.bullets} onUpdate={(j, v) => updB(i, j, v)} onAdd={() => addB(i)} onRemove={(j) => delB(i, j)} IS={IS} placeholder="Built AI-powered dashboard with 10K+ real-time records" />
        </div>
      ))}
      <AB onClick={add} label="Add Project" />
    </div>
  );
}

function CertsForm({ certifications, setData, IS, CS }) {
  const upd = (i, k, v) => setData(p => { const a = [...p.certifications]; a[i] = { ...a[i], [k]: v }; return { ...p, certifications: a }; });
  const add = () => setData(p => ({ ...p, certifications: [...p.certifications, { name: "", issuer: "", year: "", link: "" }] }));
  const del = i => setData(p => { const a = [...p.certifications]; a.splice(i, 1); return { ...p, certifications: a }; });
  return (
    <div>
      <SH title="Certifications" icon={icons.award} />
      {certifications.map((c, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>Cert #{i + 1}</span><RB onClick={() => del(i)} />
          </div>
          {[["Certificate Name", "name"], ["Issuer / Organization", "issuer"], ["Year", "year"], ["URL / Link", "link"]].map(([lbl, k]) => (
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={c[k]} onChange={e => upd(i, k, e.target.value)} placeholder={k === "link" ? "https://..." : ""} style={IS} /></div>
          ))}
        </div>
      ))}
      <AB onClick={add} label="Add Certification" />
    </div>
  );
}

function HobbiesForm({ hobbies, update, IS }) {
  return (
    <div>
      <SH title="Hobbies & Interests" icon={icons.heart} />
      <FL>Hobbies</FL>
      <textarea value={hobbies} onChange={e => update("hobbies", e.target.value)} placeholder="Reading tech blogs, Open source, Chess, Photography..." rows={4} style={{ ...IS, resize: "vertical" }}
        onFocus={e => { e.currentTarget.style.border = "1px solid #000000"; e.currentTarget.style.background = "#ffffff"; }}
        onBlur={e => { e.currentTarget.style.border = `1px solid ${C.inputBorder}`; e.currentTarget.style.background = "#f8f9fa"; }} />
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Separate multiple hobbies with commas.</div>
    </div>
  );
}

// ── Cover Letter Form (left panel) ──────────────────────────────────────────
function CoverLetterForm({ clJD, setClJD, clTone, setClTone, clLength, setClLength, clHiringManager, setClHiringManager, clCompany, setClCompany, clJobTitle, setClJobTitle, detectedJobTitle, clLoading, clError, onGenerate, IS }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <div style={{ width: 28, height: 28, background: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icons.coverLetter} /></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1a2332" }}>Cover Letter Generator</div>
          <div style={{ fontSize: 10, color: "#6b7688" }}>AI writes from your resume + job description</div>
        </div>
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e9f0", borderRadius: 10, padding: 13 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed", letterSpacing: 1, marginBottom: 7 }}>STEP 1 · PASTE JOB DESCRIPTION</div>
        <textarea value={clJD} onChange={e => setClJD(e.target.value)} placeholder="Paste the full job description here..." rows={6} style={{ ...IS, resize: "vertical", fontSize: 11, lineHeight: 1.6 }} />
        {clJD.trim() && <div style={{ fontSize: 10, color: "#9aa3af", marginTop: 4 }}>{clJD.trim().split(/\s+/).length} words</div>}
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e9f0", borderRadius: 10, padding: 13 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed", letterSpacing: 1, marginBottom: 10 }}>STEP 2 · CUSTOMIZE</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7688", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Tone</div>
            <select value={clTone} onChange={e => setClTone(e.target.value)} style={{ ...IS, fontSize: 11, cursor: "pointer" }}>
              {["Professional", "Confident", "Enthusiastic", "Formal", "Creative", "Concise"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7688", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Length</div>
            <select value={clLength} onChange={e => setClLength(e.target.value)} style={{ ...IS, fontSize: 11, cursor: "pointer" }}>
              <option value="Short">Short (~150 words)</option>
              <option value="Medium">Medium (~250 words)</option>
              <option value="Long">Long (~400 words)</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7688", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Hiring Manager</div>
            <input value={clHiringManager} onChange={e => setClHiringManager(e.target.value)} placeholder="Mr. Sharma (optional)" style={{ ...IS, fontSize: 11 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7688", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Company Name</div>
            <input value={clCompany} onChange={e => setClCompany(e.target.value)} placeholder="Google, TechCorp..." style={{ ...IS, fontSize: 11 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7688", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Job Title</div>
            <input value={clJobTitle} onChange={e => setClJobTitle(e.target.value)} placeholder={detectedJobTitle || "e.g. Data Analyst"} style={{ ...IS, fontSize: 11 }} />
            {detectedJobTitle && !clJobTitle && <div style={{ fontSize: 9, color: "#9aa3af", marginTop: 3 }}>Auto-detected: {detectedJobTitle}</div>}
          </div>
        </div>
      </div>

      <button onClick={onGenerate} disabled={clLoading}
        style={{ width: "100%", padding: "12px 16px", background: clLoading ? "#e5e7eb" : "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: 10, color: clLoading ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.3, cursor: clLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {clLoading ? <><span>⏳</span> Groq AI is writing your cover letter...</> : <><span>✨</span> Generate Cover Letter with AI</>}
      </button>

      {clError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#dc2626" }}>⚠️ {clError}</div>}

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "10px 13px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#92400e", letterSpacing: 0.5, marginBottom: 6 }}>⚡ TIPS FOR BEST RESULTS</div>
        {["Fill in your Experience + Skills before generating", "Paste the complete job description for better matching", "Use Edit mode in the preview to fine-tune the output", "Try Regenerate to get a different version"].map((t, i) => (
          <div key={i} style={{ fontSize: 10.5, color: "#92400e", marginBottom: i < 3 ? 4 : 0, display: "flex", gap: 5 }}><span>•</span><span>{t}</span></div>
        ))}
      </div>
    </div>
  );
}

// ── Cover Letter Preview (right panel) — 3 templates ──────────────────────
function CoverLetterPreview({ coverLetter, setCoverLetter, personal, clHiringManager, clCompany, clLoading, clEditMode, clHeadingFont, clBodyFont, clFontSize, clLineHeight, detectedJobTitle, clTemplate, clJobTitle }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0;
  const wcColor = wordCount === 0 ? "#c0c8d2" : wordCount > 400 ? "#b45309" : wordCount >= 150 ? "#15803d" : "#9aa3af";
  const jt = (clJobTitle && clJobTitle.trim()) || detectedJobTitle || "the position";
  const links = [personal.linkedin, personal.github].filter(Boolean);
  const cleanedText = cleanCoverLetter(coverLetter, personal.name);

  const loadingEl = <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize + 1}pt`, color: "#9aa3af", fontStyle: "italic", textAlign: "center", paddingTop: 60, lineHeight: 2 }}>✨ Groq AI is crafting your cover letter...</div>;
  const emptyEl = <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize + 1}pt`, color: "#c0c8d2", fontStyle: "italic", textAlign: "center", paddingTop: 80, lineHeight: 2.2 }}>Your cover letter will appear here.<br />Fill in the form on the left,<br />then click Generate ✨</div>;
  const editEl = <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ width: "100%", minHeight: 400, border: "1.5px solid #bfdbfe", borderRadius: 6, padding: "12px 14px", fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#1e293b", outline: "none", resize: "vertical", background: "#fafeff", boxSizing: "border-box" }} />;
  const wcEl = wordCount > 0 && <div style={{ position: "absolute", bottom: 20, right: 28, fontSize: 9, color: wcColor, fontWeight: 600, fontFamily: "sans-serif" }}>{wordCount} words{wordCount > 400 ? " · consider shortening" : wordCount >= 150 ? " · ✓ good length" : ""}</div>;

  const bodyContent = clLoading ? loadingEl : clEditMode ? editEl : cleanedText ? null : emptyEl;

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#d8dde6", padding: "28px 0 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 794, transform: "scale(0.80)", transformOrigin: "top center", marginBottom: "-18%" }}>

        {/* ── EXECUTIVE TEMPLATE ── */}
        {clTemplate === "executive" && (
          <div style={{ background: "#fff", boxShadow: "0 4px 28px rgba(0,0,0,0.13)", borderRadius: 2, padding: "56px 64px 64px", minHeight: 1123, position: "relative" }}>
            <div style={{ fontFamily: clHeadingFont, fontSize: "26pt", fontWeight: 700, color: "#0f172a", marginBottom: 5 }}>{personal.name || "Your Name"}</div>
            {jt && <div style={{ fontFamily: clBodyFont, fontSize: "10.5pt", fontWeight: 600, color: "#2563eb", letterSpacing: 0.3, marginBottom: 8 }}>Applying for: {jt}</div>}
            <div style={{ fontSize: "9pt", color: "#64748b" }}>
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ")}
              {links.length > 0 && <> · {links.map((l, i) => <span key={i} style={{ color: "#2563eb" }}>{i > 0 ? " · " : ""}{l}</span>)}</>}
            </div>
            <div style={{ width: "100%", height: 2, border: "none", background: "linear-gradient(to right, #0f172a 55%, #e2e8f0 100%)", margin: "20px 0 24px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
              <div style={{ fontSize: "9.5pt", color: "#64748b", fontStyle: "italic" }}>{date}</div>
              <div style={{ textAlign: "right" }}>
                {clHiringManager && <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 700, color: "#0f172a" }}>{clHiringManager}</div>}
                {clCompany && <div style={{ fontSize: "10pt", fontWeight: 600, color: "#475569" }}>{clCompany}</div>}
              </div>
            </div>
            {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Dear {clHiringManager || "Hiring Team"},</div>}
            {bodyContent || (cleanedText && !clEditMode && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#1e293b", whiteSpace: "pre-wrap", textAlign: "justify", marginBottom: 18 }}>{cleanedText}</div>)}
            {cleanedText && !clLoading && !clEditMode && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontFamily: clBodyFont, fontSize: "11pt", color: "#1e293b", marginBottom: 32 }}>Sincerely,</div>
                <div style={{ width: 160, height: 1, background: "#cbd5e1", marginBottom: 6 }} />
                <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{personal.name}</div>
                <div style={{ fontFamily: clBodyFont, fontSize: "9pt", color: "#64748b" }}>Applying for: {jt}</div>
              </div>
            )}
            {wcEl}
          </div>
        )}

        {/* ── MODERN TEMPLATE ── */}
        {clTemplate === "modern" && (
          <div style={{ display: "flex", minHeight: 1123, boxShadow: "0 4px 28px rgba(0,0,0,0.13)", borderRadius: 2, overflow: "hidden" }}>
            {/* Sidebar */}
            <div style={{ width: "28%", background: "#0f172a", color: "#fff", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ fontFamily: clHeadingFont, fontSize: "16pt", fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>{personal.name || "Your Name"}</div>
              <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>Applying for</div>
              <div style={{ fontSize: "9.5pt", color: "#60a5fa", fontWeight: 600, lineHeight: 1.4, marginBottom: 0 }}>{jt}</div>
              <div style={{ height: 1, background: "#334155", margin: "16px 0" }} />
              <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Contact</div>
              {[personal.email, personal.phone, personal.location, ...links].filter(Boolean).map((c, i) => (
                <div key={i} style={{ fontSize: "8.5pt", color: "#cbd5e1", marginBottom: 6, wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
              ))}
              <div style={{ height: 1, background: "#334155", margin: "16px 0" }} />
              <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Date</div>
              <div style={{ fontSize: "8.5pt", color: "#cbd5e1", marginBottom: 16 }}>{date}</div>
              <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>To</div>
              {clHiringManager && <div style={{ fontSize: "10pt", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{clHiringManager}</div>}
              {clCompany && <div style={{ fontSize: "9pt", color: "#94a3b8" }}>{clCompany}</div>}
            </div>
            {/* Right content */}
            <div style={{ flex: 1, background: "#fff", padding: "44px 40px 44px 36px", position: "relative" }}>
              {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 600, color: "#0f172a", marginBottom: 22 }}>Dear {clHiringManager || "Hiring Team"},</div>}
              {bodyContent || (cleanedText && !clEditMode && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#1e293b", whiteSpace: "pre-wrap", textAlign: "justify", marginBottom: 16 }}>{cleanedText}</div>)}
              {cleanedText && !clLoading && !clEditMode && (
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontFamily: clBodyFont, fontSize: "11pt", color: "#1e293b", marginBottom: 28 }}>Sincerely,</div>
                  <div style={{ width: 40, height: 3, background: "#2563eb", marginBottom: 10 }} />
                  <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{personal.name}</div>
                  <div style={{ fontFamily: clBodyFont, fontSize: "9pt", color: "#64748b", marginTop: 3 }}>Applying for: {jt}</div>
                </div>
              )}
              {wcEl}
            </div>
          </div>
        )}

        {/* ── MINIMAL TEMPLATE ── */}
        {clTemplate === "minimal" && (
          <div style={{ background: "#fff", boxShadow: "0 4px 28px rgba(0,0,0,0.13)", borderRadius: 2, padding: "64px 80px", minHeight: 1123, position: "relative" }}>
            <div style={{ fontFamily: clHeadingFont, fontSize: "22pt", fontWeight: 700, color: "#111827", letterSpacing: -0.5, marginBottom: 3 }}>{personal.name || "Your Name"}</div>
            {jt && <div style={{ fontFamily: clBodyFont, fontSize: "10pt", color: "#6b7280", fontWeight: 500, marginBottom: 10 }}>Applying for: {jt}</div>}
            <div style={{ fontSize: "8.5pt", color: "#9ca3af" }}>{[personal.email, personal.phone, personal.location].filter(Boolean).join("  |  ")}</div>
            <div style={{ width: 32, height: 3, background: "#111827", margin: "18px 0 20px" }} />
            <div style={{ fontSize: "9pt", color: "#9ca3af", marginBottom: 16 }}>{date}</div>
            <div style={{ marginBottom: 22 }}>
              {clHiringManager && <div style={{ fontSize: "10.5pt", fontWeight: 700, color: "#111827", marginBottom: 1 }}>{clHiringManager}</div>}
              {clCompany && <div style={{ fontSize: "10pt", color: "#6b7280" }}>{clCompany}</div>}
            </div>
            {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "11pt", fontWeight: 600, color: "#111827", marginBottom: 18 }}>Dear {clHiringManager || "Hiring Team"},</div>}
            {bodyContent || (cleanedText && !clEditMode && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#374151", whiteSpace: "pre-wrap", textAlign: "left", marginBottom: 16 }}>{cleanedText}</div>)}
            {cleanedText && !clLoading && !clEditMode && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontFamily: clBodyFont, fontSize: "10.5pt", color: "#374151", marginBottom: 24 }}>Sincerely,</div>
                <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{personal.name}</div>
                <div style={{ fontFamily: clBodyFont, fontSize: "9pt", color: "#9ca3af" }}>Applying for: {jt}</div>
              </div>
            )}
            {wcEl}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
