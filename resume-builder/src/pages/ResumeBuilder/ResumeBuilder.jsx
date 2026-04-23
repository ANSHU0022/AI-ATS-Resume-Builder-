import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { exportResumePDF, exportCoverLetterPDF } from "../../lib/pdfExport";
import * as pdfjsLib from "pdfjs-dist";
// Use Vite's ?url syntax to get the worker path statically
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import LatexEditor from "../latex-editor/pages";
import FontPickerPanel from "../../components/FontPickerPanel/FontPickerPanel";
import { supabase } from "../../lib/supabase";
import Template4 from "./templates/Template4";
import Template5Preview from "./components/Template5Preview";
import { buildResumeSnapshot, calculateJDScore, calculateResumeScore, formatResumeReviewPayload } from "./scoring";
import { getSafeAIMessageFromError, getSafeAIMessageFromResponse } from "../../lib/aiError";
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
  experience: [{ role: "", company: "", location: "", duration: "", bullets: [""], link: "" }],
  projects: [{ name: "", tech: "", link: "", bullets: [""] }],
  certifications: [{ name: "", issuer: "", year: "" }],
  achievements: [{ title: "", url: "" }],
};

// ── ATS Scoring ───────────────────────────────────────────────────────────────
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
      <div style={{ fontSize: "1em", fontWeight: 700, letterSpacing: 0.5, borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 5, pageBreakAfter: "avoid", breakAfter: "avoid", ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>
      <div style={{ fontSize: "0.95em" }}>{children}</div>
    </div>
  );
}
function SS({ title, children, headingFontFamily }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.8em", letterSpacing: 2, color: "#64748b", marginBottom: 6, fontWeight: 700, pageBreakAfter: "avoid", breakAfter: "avoid", ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>
      {children}
    </div>
  );
}
function MH({ title, headingFontFamily }) {
  return <div style={{ fontSize: "0.85em", fontWeight: 700, letterSpacing: 2, color: "#888", marginBottom: 4, marginTop: 10, borderBottom: "1px solid #ddd", paddingBottom: 3, ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}) }}>{title}</div>;
}

// ── PDF Export ────────────────────────────────────────────────────────────────
// Uses direct jsPDF + html2canvas (see src/lib/pdfExport.js)
const exportPDF = exportResumePDF;

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

const CL_FONTS = ATS_FONTS;
const loadCLFont = loadFont;

function cleanCoverLetter(letter, name = "") {
  return (letter || "")
    .replace(new RegExp(`^${(name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
    .trim();
}



function PaginatedResume({ data, template, exportRef, headingFont, bodyFont, fontSize = 10, lineHeight = 1.45 }) {
  const TemplateComp = template === "A" ? TemplateA : template === "B" ? TemplateB : template === "C" ? TemplateC : Template4;

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

  const renderPage = (pi, mode = "preview") => {
    const TOP_GAP = 32;
    const pageStart = pageBreaks[pi] ?? (pageBreaks[pageBreaks.length - 1] + PAGE_H);
    const nextPageStart = pageBreaks[pi + 1];
    const vTop = pi === 0 ? 0 : TOP_GAP;
    const contentHeight = nextPageStart != null
      ? nextPageStart - pageStart
      : totalH - pageStart;
    const vHeight = Math.min(contentHeight, PAGE_H - vTop);
    const cTop = -pageStart;
    const isExport = mode === "export";

    return (
      <div
        key={`${mode}-${pi}`}
        className={isExport ? "resume-export-page" : undefined}
        style={{
          width: PAGE_W,
          height: PAGE_H,
          background: "#fff",
          overflow: "hidden",
          position: "relative",
          boxShadow: isExport ? "none" : "0 4px 24px rgba(0,0,0,0.13)",
          borderRadius: isExport ? 0 : 2,
          marginBottom: isExport ? 0 : 24,
        }}
      >
        <div style={{ position: "absolute", top: vTop, left: 0, width: PAGE_W, height: vHeight, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: cTop, left: 0, width: PAGE_W }}>
            <div className="resume-container" style={{ boxShadow: "none", minHeight: vHeight }}>
              <TemplateComp data={data} headingFont={headingFont} bodyFont={bodyFont} fontSize={fontSize} lineHeight={lineHeight} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 8, right: 14, fontSize: 8.5, color: "#c0c8d2", fontFamily: "'Segoe UI', sans-serif", letterSpacing: 0.5, pointerEvents: "none" }}>
          {pi + 1} / {numPages}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Hidden export tree that mirrors the visible preview pages exactly */}
      <div style={{ position: "fixed", top: 0, left: -9999, width: PAGE_W, pointerEvents: "none", zIndex: -1 }}>
        <div ref={exportRef} className="resume-export-root">
          {Array.from({ length: numPages }).map((_, pi) => renderPage(pi, "export"))}
        </div>
      </div>

      {/* Hidden measuring container */}
      <div style={{ position: "fixed", top: 0, left: -9999, width: PAGE_W, pointerEvents: "none", zIndex: -1 }}>
        <div ref={measureRef} className="resume-container">
          <TemplateComp data={data} headingFont={headingFont} bodyFont={bodyFont} fontSize={fontSize} lineHeight={lineHeight} />
        </div>
      </div>

      {/* Visible sliced page cards using content-aware break points */}
      {Array.from({ length: numPages }).map((_, pi) => {
        return (
          <div key={pi} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {renderPage(pi, "preview")}
          </div>
        );
      })}
    </div>
  );
}

const LinkIconSVG = () => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 13,
      height: 13,
      marginLeft: 4,
      flexShrink: 0,
      overflow: "visible",
      lineHeight: 1,
      padding: 1,
      boxSizing: "content-box",
    }}
  >
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", overflow: "visible" }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </span>
);

const WithLinkIcon = ({ url, text, color = "#1a1a1a", dec = "none" }) => {
  if (!url) return <span style={{ color }}>{text}</span>;
  const href = url.startsWith("http") ? url : `https://${url}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color,
        textDecoration: dec,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1.2,
        overflow: "visible",
      }}
      title={url}
    >
      <span>{text}</span>
      <LinkIconSVG />
    </a>
  );
};

// ── Template A (Classic) ──────────────────────────────────────────────────────
function TemplateA({ data, headingFont, bodyFont, fontSize = 10, lineHeight = 1.45 }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, achievements } = data;
  return (
    <div style={{ fontSize: `${fontSize}pt`, color: "#1a1a1a", padding: "28px 32px", lineHeight: lineHeight, fontFamily: bf, background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        {p.name && <div style={{ fontSize: "22pt", fontWeight: 600, fontFamily: hf, letterSpacing: 1, marginBottom: 2 }}>{p.name}</div>}
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
              <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}><WithLinkIcon url={e.link} text={e.company} /></strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
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
                <strong style={{ fontFamily: hf }}>
                  <WithLinkIcon url={proj.link} text={proj.name} />
                </strong>
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
                    <WithLinkIcon url={c.link} text={c.name} dec="underline" />
                    {c.issuer ? ` - ${c.issuer}` : ""}
                  </span>
                  {c.year && <span>{c.year}</span>}
                </div>
              </li>
            ))}
          </ul>
        </RS>
      )}
      {achievements?.some(a => a.title) && (
        <RS title="ACHIEVEMENTS & AWARDS" headingFontFamily={hf}>
          <ul style={{ margin: 0, padding: "0 0 0 18px", listStyle: "disc" }}>
            {achievements.filter(a => a.title).map((a, i) => (
              <li key={i} style={{ marginBottom: 2 }}>
                <WithLinkIcon url={a.url} text={a.title} />
              </li>
            ))}
          </ul>
        </RS>
      )}
    </div>
  );
}

// ── Template B (Modern Sidebar) ───────────────────────────────────────────────
function TemplateB({ data, headingFont, bodyFont, fontSize = 10, lineHeight = 1.45 }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, achievements } = data;
  return (
    <div style={{ fontFamily: bf, fontSize: `${fontSize}pt`, color: "#1a1a1a", background: "#fff", display: "flex", minHeight: "100%", lineHeight: lineHeight }}>
      <div style={{ width: "32%", background: "#2c3e50", color: "#ecf0f1", padding: "28px 16px" }}>
        {p.name && <div style={{ fontSize: "15pt", fontWeight: 700, fontFamily: hf, color: "#fff", marginBottom: 4 }}>{p.name}</div>}
        {p.title && <div style={{ fontSize: "9pt", color: "#bdc3c7", marginBottom: 16 }}>{p.title}</div>}
        <SS title="CONTACT" headingFontFamily={hf}>
          {p.email && <div style={{ fontSize: "8.5pt", marginBottom: 4, wordBreak: "break-all" }}>{p.email}</div>}
          {p.phone && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.phone}</div>}
          {p.location && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.location}</div>}
          {p.linkedin && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><WithLinkIcon url={p.linkedin} text="LinkedIn" color="#7fb3d3" dec="underline" /></div>}
          {p.github && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><WithLinkIcon url={p.github} text="Github" color="#7fb3d3" dec="underline" /></div>}
          {p.portfolio && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><WithLinkIcon url={p.portfolio} text="Portfolio" color="#7fb3d3" dec="underline" /></div>}
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
                    <WithLinkIcon url={c.link} text={c.name} color="#ecf0f1" dec="underline" />
                  </div>
                  {c.issuer && <div style={{ color: "#bdc3c7", fontSize: "8pt" }}>{c.issuer}</div>}
                </div>
                {c.year && <div style={{ color: "#bdc3c7", fontSize: "8pt", whiteSpace: "nowrap", marginLeft: 8 }}>{c.year}</div>}
              </div>
            ))}
          </SS>
        )}
        {achievements?.some(a => a.title) && (
          <SS title="ACHIEVEMENTS" headingFontFamily={hf}>
            <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "disc", fontSize: "9pt", lineHeight: 1.6 }}>
              {achievements.filter(a => a.title).map((a, i) => (
                <li key={i} style={{ marginBottom: 2 }}>
                  <WithLinkIcon url={a.url} text={a.title} color="#ecf0f1" />
                </li>
              ))}
            </ul>
          </SS>
        )}
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
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong style={{ fontFamily: hf }}><WithLinkIcon url={e.link} text={e.role} color={C.accent} /></strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
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
                <strong style={{ fontFamily: hf }}><WithLinkIcon url={proj.link} text={proj.name} /></strong>{proj.tech && <span style={{ fontSize: "9pt", color: "#555" }}> Â· {proj.tech}</span>}
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
function TemplateC({ data, headingFont, bodyFont, fontSize = 9.5, lineHeight = 1.45 }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, achievements } = data;
  return (
    <div style={{ fontFamily: bf, fontSize: `${fontSize}pt`, color: "#111", padding: "24px 36px", background: "#fff", lineHeight: lineHeight }}>
      {p.name && <div style={{ fontSize: "24pt", fontWeight: 900, fontFamily: hf, borderBottom: "3px solid #111", paddingBottom: 6, marginBottom: 4 }}>{p.name}</div>}
      {p.title && <div style={{ fontSize: "11pt", color: "#555", marginBottom: 8 }}>{p.title}</div>}
      <div style={{ fontSize: "8.5pt", color: "#444", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        {p.linkedin && <WithLinkIcon url={p.linkedin} text="LinkedIn" color="#111" dec="underline" />}
        {p.github && <WithLinkIcon url={p.github} text="Github" color="#111" dec="underline" />}
        {p.portfolio && <WithLinkIcon url={p.portfolio} text="Portfolio" color="#111" dec="underline" />}
      </div>
      {summary && <><MH title="SUMMARY" headingFontFamily={hf} /><p style={{ margin: "0 0 10px 0", borderLeft: "3px solid #111", paddingLeft: 10 }}>{summary}</p></>}
      {skills.some(s => s.items) && (<><MH title="SKILLS" headingFontFamily={hf} />{skills.filter(s => s.items).map((s, i) => <div key={i} style={{ marginBottom: 3 }}><strong>{s.category}:</strong> {s.items}</div>)}<div style={{ marginBottom: 10 }} /></>)}
      {experience.some(e => e.role) && (<><MH title="EXPERIENCE" headingFontFamily={hf} />{experience.filter(e => e.role).map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span><strong style={{ fontFamily: hf }}><WithLinkIcon url={e.link} text={e.role} color="#111" /></strong> @ <span style={{ fontFamily: hf }}>{e.company}</span></span><strong>{e.duration}</strong></div>
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
          <strong style={{ fontFamily: hf }}><WithLinkIcon url={proj.link} text={proj.name} color="#111" /></strong>{proj.tech ? ` [${proj.tech}]` : ""}
          {proj.bullets?.filter(b => b?.trim()).map((b, j) => <div key={j} style={{ paddingLeft: 12 }}>• {b}</div>)}
        </div>
      ))}</>)}
      {certifications.some(c => c.name) && (<><MH title="CERTIFICATIONS" headingFontFamily={hf} />{certifications.filter(c => c.name).map((c, i) => (
        <div key={i} style={{ marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
          <span>
            <WithLinkIcon url={c.link} text={c.name} color="#111" dec="underline" />
            {c.issuer ? ` — ${c.issuer}` : ""}
          </span>
          {c.year && <span>{c.year}</span>}
        </div>
      ))}</>)}
      {achievements?.some(a => a.title) && (<><MH title="ACHIEVEMENTS & AWARDS" headingFontFamily={hf} />{achievements.filter(a => a.title).map((a, i) => (
        <div key={i} style={{ marginBottom: 3, paddingLeft: 12 }}>• <WithLinkIcon url={a.url} text={a.title} color="#111" /></div>
      ))}</>)}
    </div>
  );
}

// ── TEMPLATE MODAL ────────────────────────────────────────────────────────────

function TemplateModal({ onClose, activeTemplate, onSelect }) {
  const templates = [
    {
      id: "A",
      label: "Classic",
      desc: "Traditional ATS-safe layout with clear sections and familiar hierarchy.",
      badge: "ATS Safe",
      audience: "General roles",
      accent: "#4f46e5",
      soft: "linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)",
      icon: icons.file,
      layout: "classic",
    },
    {
      id: "B",
      label: "Modern",
      desc: "Contemporary split layout with a stronger visual presence for mid-career resumes.",
      badge: "Balanced",
      audience: "Product, ops, business",
      accent: "#0f766e",
      soft: "linear-gradient(180deg, #ecfeff 0%, #ffffff 100%)",
      icon: icons.layers,
      layout: "sidebar",
    },
    {
      id: "C",
      label: "Minimal",
      desc: "Clean compact layout that puts content first with minimal visual decoration.",
      badge: "Minimal",
      audience: "Simple applications",
      accent: "#334155",
      soft: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
      icon: icons.book,
      layout: "minimal",
    },
    {
      id: "4",
      label: "Template 4",
      desc: "LaTeX-style builder template with a formal academic and analyst-friendly feel.",
      badge: "Structured",
      audience: "Analyst, academic, ops",
      accent: "#7c3aed",
      soft: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)",
      icon: icons.award,
      layout: "formal",
    },
    {
      id: "5",
      label: "Template 5 - Tech Roles",
      desc: "Optimized for software engineering, data science, AI, ML, and other technical job applications.",
      badge: "Best for Tech Roles",
      audience: "Software Engineer, Data Science, AI, ML",
      accent: "#0f766e",
      soft: "linear-gradient(135deg, #ecfeff 0%, #f0fdf4 45%, #ffffff 100%)",
      icon: icons.code,
      layout: "tech",
    }
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 10000, backdropFilter: "blur(4px)", paddingTop: 96, paddingBottom: 16 }}>
      <div className="modal-enter card" style={{ background: "#fff", width: "min(520px, calc(100vw - 20px))", maxHeight: "min(680px, calc(100vh - 20px))", borderRadius: 20, padding: 18, boxShadow: "0 24px 56px rgba(2, 6, 23, 0.22)", position: "relative", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32, background: "#f1f5f9", border: "none", borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div style={{ marginBottom: 14, paddingRight: 34 }}>
          <h2 style={{ margin: "0 0 5px 0", fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: -0.5 }}>Choose Template</h2>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>
            Template 5 is the dedicated template for software engineering, data science, AI, and ML roles.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {templates.map((t) => {
            const isActive = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); onClose(); }}
                style={{
                  textAlign: "left",
                  padding: 0,
                  borderRadius: 16,
                  border: `2px solid ${isActive ? t.accent : "#e2e8f0"}`,
                  background: isActive ? t.soft : "#fff",
                  cursor: "pointer",
                  transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
                  boxShadow: isActive ? `0 12px 22px ${t.accent}18` : "0 4px 12px rgba(15, 23, 42, 0.04)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div style={{ padding: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: isActive ? t.accent : "#f8fafc", border: `1px solid ${isActive ? `${t.accent}55` : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#fff" : t.accent, flexShrink: 0 }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, minWidth: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{t.label}</span>
                        {t.id === "5" && (
                          <span style={{ padding: "3px 7px", borderRadius: 999, background: `${t.accent}18`, border: `1px solid ${t.accent}40`, color: t.accent, fontSize: 9, fontWeight: 800, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                            Tech Focus
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.45, marginBottom: 6 }}>{t.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: t.accent, fontWeight: 800, letterSpacing: 0.3 }}>{t.badge}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>•</span>
                        <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>{t.audience}</span>
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  ) : (
                    <div style={{ padding: "3px 7px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                      {t.id}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
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
  "achievements": [{ "title": "", "url": "" }]
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

      setStatus("parsing"); setStep("AI is reading your resume…");

      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
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
        throw new Error(await getSafeAIMessageFromResponse(resp, "Resume parsing is temporarily unavailable. Please try again in a few minutes."));
      }

      const json = await resp.json();
      const raw = json.choices?.[0]?.message?.content || "";
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("Invalid JSON from Groq."); parsed = JSON.parse(m[0]); }

      const cleanBullets = (arr) => Array.isArray(arr) ? arr.map(b => typeof b === 'string' ? b.replace(/^[\s\u2022\-*.]+/g, '').trim() : b) : [];
      const cleanString = (str) => typeof str === 'string' ? str.replace(/^[\s\u2022\-*.]+/g, '').trim() : str;

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
      const parseMeta = { source: "upload", extractedTextLength: resumeText.length, fileName: file.name, fileType: file.type || "" };
      setTimeout(() => { onParsed(parsed, parseMeta); onClose(); }, 900);
    } catch (e) {
      setStatus("error");
      setErrorMsg(getSafeAIMessageFromError(e, "Resume parsing is temporarily unavailable. Please try again in a few minutes."));
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
              Powered by <span style={{ fontWeight: 700, color: "#7c5cbf" }}>AI</span> · Real-time ATS parsing
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.x} /></svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>

          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <div style={{ fontSize: 11, color: "#5b21b6" }}>
              <strong>Advanced AI</strong> analyzes your resume with high precision — typically <strong>5–10× faster</strong> than standard tools. Your resume is parsed in seconds.
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
                <div style={{ fontWeight: 700 }}>{status === "extracting" ? "Extracting text…" : "Parsing with AI…"}</div>
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
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, marginBottom: 6, letterSpacing: 0.5 }}>AI WILL AUTO-FILL ALL 8 SECTIONS:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Personal", "Summary", "Skills", "Education", "Experience", "Projects", "Certifications", "Achievements"].map(s => (
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
              {isBusy ? "Working…" : status === "done" ? "✓ Done!" : "Parse with AI ⚡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// (Old inline FontPickerPanel removed, using imported FontPickerPanel)

// ── JD KEYWORD ANALYZER MODAL ─────────────────────────────────────────────────
function JDAnalyzerModal({ onClose, data, setData, jdState, setJdState, jdScore, resumeScore, pageMode = false }) {
  const { text: jdText, status, analysis, error: errorMsg } = jdState;
  const [added, setAdded] = useState({});
  const [appliedExp, setAppliedExp] = useState({});
  const [appliedProj, setAppliedProj] = useState({});
  const [appliedSummary, setAppliedSummary] = useState(false);
  const [recommendationsApplied, setRecommendationsApplied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideRead, setGuideRead] = useState(false);
  const [openMetric, setOpenMetric] = useState("");
  const [showScoreExplainer, setShowScoreExplainer] = useState(false);
  const shouldShowSoftSkills = false;
  const applyAllLockedRef = useRef(false);
  const jdScoreWeights = [
    ["JD Keywords Found", "weightedKeywordCoverage", "50%"],
    ["Related Skill Match", "semanticEquivalence", "20%"],
    ["Job Title Match", "titleAlignment", "15%"],
    ["Critical Requirements Covered", "criticalRequirementRisk", "15%"],
  ];
  const jdImportanceWeights = [
    ["must", "3x"],
    ["preferred", "2x"],
    ["nice", "1x"],
  ];
  const normalizeSkillText = (value = "") => value.toLowerCase().replace(/[^a-z0-9+#/\s]/g, " ").replace(/\s+/g, " ").trim();
  const tokenizeSkillText = (value = "") => normalizeSkillText(value).split(" ").filter(Boolean);
  const factorDescriptions = {
    "JD Keywords Found": {
      summary: "How many important JD keywords already appear clearly in your resume.",
      improve: "Add the most important missing JD words into your skills and recent work bullets."
    },
    "Related Skill Match": {
      summary: "Shows how well your resume uses exact or close JD terminology across sections.",
      improve: "Use the same role language, tools, and phrases from the JD in your real resume content."
    },
    "Job Title Match": {
      summary: "Shows how close your resume title is to the target role.",
      improve: "Update your title and summary so they match the role name and level in the JD."
    },
    "Critical Requirements Covered": {
      summary: "Shows how many critical must-have JD requirements are already covered.",
      improve: "Fix the must-have missing keywords first before improving the nice-to-have ones."
    }
  };
  const canAddDirectly = () => true;
  const countWords = (value = "") => value.trim().split(/\s+/).filter(Boolean).length;
  const ringColors = (score) => {
    if (score >= 80) return { fg: "#16a34a", bg: "#bbf7d0", text: "#166534" };
    if (score >= 60) return { fg: "#f59e0b", bg: "#fde68a", text: "#92400e" };
    return { fg: "#ef4444", bg: "#fecaca", text: "#991b1b" };
  };
  const RingScore = ({ score = 0, tone = "blue", label = "SCORE" }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const dash = (Math.max(0, Math.min(score, 100)) / 100) * circumference;
    const palette = ringColors(score, tone);
    return (
      <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
        <svg width="92" height="92" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r={radius} fill="none" stroke={palette.bg} strokeWidth="8" />
          <circle cx="46" cy="46" r={radius} fill="none" stroke={palette.fg} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform="rotate(-90 46 46)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: palette.text, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, fontWeight: 800, color: palette.text, letterSpacing: 0.6 }}>{label}</span>
        </div>
      </div>
    );
  };
  const inferSkillGroup = (value = "") => {
    const text = normalizeSkillText(value);
    if (!text) return "general";
    if (/ai|ml|llm|rag|vector|embedding|chatgpt|machine learning|genai|nlp/.test(text)) return "ai";
    if (/devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|ci cd|cicd/.test(text)) return "cloud";
    if (/database|sql|nosql|postgres|mysql|mongodb|warehouse/.test(text)) return "database";
    if (/analytics|analysis|bi|power bi|tableau|excel|reporting|dashboard|visualization/.test(text)) return "analytics";
    if (/automation|workflow|integration|api|rest|json|zapier|power automate|n8n/.test(text)) return "automation";
    if (/soft|communication|leadership|stakeholder|collaboration|teamwork/.test(text)) return "soft";
    if (/programming|language|python|java|javascript|typescript|coding|code/.test(text)) return "programming";
    if (/tools|software|platform/.test(text)) return "tools";
    return "general";
  };
  const findBestSkillCategoryIndex = (skills, category, keyword) => {
    if (!skills.length) return -1;

    const normalizedCategory = normalizeSkillText(category);
    const categoryTokens = tokenizeSkillText(category);
    const keywordTokens = tokenizeSkillText(keyword);
    const targetGroup = inferSkillGroup(`${category} ${keyword}`);
    let bestIndex = -1;
    let bestScore = -1;

    skills.forEach((skill, index) => {
      const label = skill.category || "";
      const normalizedLabel = normalizeSkillText(label);
      const labelTokens = tokenizeSkillText(label);
      let score = 0;

      if (normalizedCategory && (normalizedLabel === normalizedCategory || normalizedLabel.includes(normalizedCategory) || normalizedCategory.includes(normalizedLabel))) {
        score += 12;
      }

      categoryTokens.forEach((token) => {
        if (labelTokens.includes(token)) score += 3;
      });

      keywordTokens.forEach((token) => {
        if (token.length > 2 && labelTokens.includes(token)) score += 1;
      });

      if (inferSkillGroup(label) === targetGroup) {
        score += 5;
      }

      if (/technical skills|technical|skills|tools/i.test(label)) {
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestScore <= 0) {
      const technicalIndex = skills.findIndex((skill) => /technical skills|technical|skills|tools/i.test(skill.category || ""));
      if (technicalIndex !== -1) return technicalIndex;
      return 0;
    }

    return bestIndex;
  };
  const mergeKeywordIntoSkills = (skills, keyword, category) => {
    const nextSkills = skills.map((skill) => ({ ...skill }));
    const targetIndex = findBestSkillCategoryIndex(nextSkills, category, keyword);

    if (targetIndex === -1) {
      return {
        changed: false,
        assignedCategory: "",
        skills
      };
    }

    const targetSkill = nextSkills[targetIndex];
    const existingItems = (targetSkill.items || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (existingItems.some((item) => item.toLowerCase() === keyword.toLowerCase())) {
      return {
        changed: false,
        assignedCategory: targetSkill.category || category || "Skills",
        skills
      };
    }

    nextSkills[targetIndex] = {
      ...targetSkill,
      items: existingItems.length ? `${existingItems.join(", ")}, ${keyword}` : keyword
    };

    return {
      changed: true,
      assignedCategory: targetSkill.category || category || "Skills",
      skills: nextSkills
    };
  };

  const containsKeyword = (value = "", keyword = "") => {
    const normalizedValue = normalizeSkillText(value);
    const normalizedKeyword = normalizeSkillText(keyword);
    if (!normalizedValue || !normalizedKeyword) return false;
    return normalizedValue.includes(normalizedKeyword);
  };

  const limitBullets = (bullets = []) => bullets.filter(Boolean).slice(0, 3);

  const stripCandidateNameFromSummary = (summary = "") => {
    const candidateName = (data.personal?.name || "").trim();
    const cleanSummary = (summary || "").trim();
    if (!cleanSummary || !candidateName) return cleanSummary;

    const escapedName = candidateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let next = cleanSummary
      .replace(new RegExp(`^${escapedName}\\s+is\\s+(an?\\s+)?`, "i"), "")
      .replace(new RegExp(`^${escapedName}\\s*,?\\s*`, "i"), "")
      .trim();

    if (next) {
      next = next.charAt(0).toUpperCase() + next.slice(1);
    }

    return next;
  };

  const normalizeSuggestionText = (value = "") => value.replace(/\s+/g, " ").trim().toLowerCase();
  const createNormalizedKey = (...parts) => parts.map((part) => normalizeSuggestionText(part || "")).filter(Boolean).join("::");
  const actionVerbStarters = new Set([
    "achieved", "analyzed", "architected", "automated", "boosted", "built", "collaborated",
    "created", "delivered", "deployed", "designed", "developed", "drove", "enabled",
    "engineered", "enhanced", "evaluated", "executed", "implemented", "improved",
    "increased", "integrated", "launched", "led", "managed", "optimized", "orchestrated",
    "produced", "reduced", "resolved", "streamlined", "supported", "trained", "validated"
  ]);
  const commonJobTitleWords = ["engineer", "scientist", "analyst", "developer", "specialist", "intern", "manager", "architect", "consultant", "researcher"];

  const extractLikelyJobTitleFromJD = (value = "") => {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 16);

    for (const line of lines) {
      const explicitMatch = line.match(/^(?:job title|role|position)\s*[:-]\s*(.+)$/i);
      if (explicitMatch?.[1]) return explicitMatch[1].trim();
    }

    for (const line of lines) {
      const normalizedLine = normalizeSuggestionText(line);
      const looksLikeTitle = commonJobTitleWords.some((word) => normalizedLine.includes(word));
      const looksLikeBodyCopy = line.length > 90 || /responsibilities|requirements|qualification|experience|about|you will|we are/i.test(line);
      if (looksLikeTitle && !looksLikeBodyCopy) {
        return line.replace(/^[•\-\d.)\s]+/, "").trim();
      }
    }

    return "";
  };

  const resolveAnalysisJobTitle = (rawJobTitle = "", sourceJD = "") => {
    const parsedTitle = (rawJobTitle || "").trim();
    const inferredTitle = extractLikelyJobTitleFromJD(sourceJD);
    const normalizedJD = normalizeSuggestionText(sourceJD);
    const parsedFoundInJD = parsedTitle && normalizedJD.includes(normalizeSuggestionText(parsedTitle));

    if (parsedFoundInJD) return parsedTitle;
    if (inferredTitle) return inferredTitle;
    return parsedTitle;
  };

  const formatKeywordList = (keywords = []) => {
    const cleaned = keywords.map((item) => item?.trim()).filter(Boolean);
    if (!cleaned.length) return "";
    if (cleaned.length === 1) return cleaned[0];
    if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
    return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
  };

  const appendKeywordsToBullet = (bullet = "", keywords = []) => {
    const additions = keywords.filter((keyword) => !containsKeyword(bullet, keyword)).slice(0, 1);
    if (!additions.length) return bullet;
    const base = bullet.trim().replace(/[.!?\s]+$/, "");
    if (/\b(using|with|including)\b/i.test(base)) {
      return `${base}, including ${formatKeywordList(additions)}.`;
    }
    return `${base} with ${formatKeywordList(additions)}.`;
  };

  const enrichSummaryWithKeywords = (summary = "", keywords = [], jobTitle = "") => {
    const additions = keywords.filter((keyword) => !containsKeyword(summary, keyword)).slice(0, 2);
    if (!additions.length) return stripCandidateNameFromSummary(summary);

    const normalizedSummary = stripCandidateNameFromSummary(summary)
      .replace(/\s+with strengths in [^.]+\.?$/i, "")
      .trim();
    const prefix = normalizedSummary
      ? normalizedSummary.replace(/[.!?\s]+$/, "")
      : `${jobTitle || "Professional"} with hands-on experience`;

    return stripCandidateNameFromSummary(`${prefix}. Experienced with ${formatKeywordList(additions)}.`);
  };

  const alignSummaryToJobTitle = (summary = "", jobTitle = "") => {
    const cleanedSummary = stripCandidateNameFromSummary(summary);
    if (!cleanedSummary || !jobTitle) return cleanedSummary;
    if (containsKeyword(cleanedSummary, jobTitle)) return cleanedSummary;

    const nextSummary = cleanedSummary.replace(
      /^[A-Za-z/&,+\-\s]{3,50}\s+(with|specializing|experienced|focused|skilled|bringing)\b/i,
      `${jobTitle} $1`
    );

    if (nextSummary !== cleanedSummary) {
      return nextSummary;
    }

    return `${jobTitle} with ${cleanedSummary.charAt(0).toLowerCase()}${cleanedSummary.slice(1)}`;
  };

  const isEffectivelySameBullet = (currentBullet = "", suggestedBullet = "") => {
    const current = normalizeSuggestionText(currentBullet);
    const suggested = normalizeSuggestionText(suggestedBullet);
    if (!current || !suggested) return false;
    return current === suggested || current.includes(suggested) || suggested.includes(current);
  };

  const startsWithActionVerb = (value = "") => {
    const firstWord = normalizeSuggestionText(value).split(" ").find(Boolean) || "";
    return actionVerbStarters.has(firstWord);
  };

  const cleanupOptimizationText = (value = "") => (
    (value || "")
      .replace(/\s+using [^.]*? to support [^.]*?requirements\.?/gi, "")
      .replace(/\s+to better support [^.]*?requirements\.?/gi, "")
      .replace(/\s+with strengths in [^.]+\.?/gi, "")
      .replace(/,\s*including\s+([^.,]+)\s+including\s+/gi, ", including ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s+([.,])/g, "$1")
  );

  const strengthenBulletForJD = (bullet = "", keywords = []) => {
    let cleanBullet = cleanupOptimizationText(bullet).replace(/[.!?\s]+$/, "");
    if (!cleanBullet) return bullet;

    if (keywords.length) {
      cleanBullet = appendKeywordsToBullet(cleanBullet, keywords);
      cleanBullet = cleanBullet.replace(/[.!?\s]+$/, "");
    }

    if (!startsWithActionVerb(cleanBullet)) {
      cleanBullet = `Delivered ${cleanBullet.charAt(0).toLowerCase()}${cleanBullet.slice(1)}`;
    }

    return `${cleanBullet}.`;
  };

  const findExperienceIndex = (entries = [], company = "", role = "") => {
    const targetKey = createNormalizedKey(company, role);
    return entries.findIndex((item) => createNormalizedKey(item.company, item.role) === targetKey);
  };

  const findProjectIndex = (entries = [], name = "") => {
    const targetKey = createNormalizedKey(name);
    return entries.findIndex((item) => createNormalizedKey(item.name) === targetKey);
  };

  const matchesSuggestedBullets = (currentBullets = [], suggestedBullets = []) => {
    const current = limitBullets(currentBullets).map(normalizeSuggestionText).filter(Boolean);
    const suggested = limitBullets(suggestedBullets).map(normalizeSuggestionText).filter(Boolean);
    if (!suggested.length) return false;
    return current.length === suggested.length && suggested.every((bullet, index) => current[index] === bullet);
  };

  const areBulletListsEquivalent = (left = [], right = []) => {
    const a = limitBullets(left).map(normalizeSuggestionText);
    const b = limitBullets(right).map(normalizeSuggestionText);
    return a.length === b.length && a.every((bullet, index) => bullet === b[index]);
  };

  const optimizeDisplayedBullets = (currentBullets = [], suggestedBullets = [], keywordPool = [], fallbackTag = "") => {
    const current = limitBullets(currentBullets);
    let remainingKeywords = [...keywordPool];
    let nextBullets = limitBullets(suggestedBullets).map((bullet, index) => {
      let nextBullet = cleanupOptimizationText(bullet);
      const currentBullet = current[index] || "";
      const isSameAsCurrent = isEffectivelySameBullet(currentBullet, nextBullet);

      if (isSameAsCurrent) {
        const availableKeywords = remainingKeywords.filter((keyword) => !containsKeyword(`${currentBullet} ${nextBullet} ${fallbackTag}`, keyword));
        if (availableKeywords.length && nextBullet) {
          const chunk = availableKeywords.slice(0, 1);
          nextBullet = appendKeywordsToBullet(nextBullet, chunk);
          remainingKeywords = remainingKeywords.filter((keyword) => !chunk.includes(keyword));
        }
      }

      if (isEffectivelySameBullet(currentBullet, nextBullet) && nextBullet) {
        nextBullet = strengthenBulletForJD(nextBullet, remainingKeywords.slice(0, 1));
        remainingKeywords = remainingKeywords.filter((keyword) => !containsKeyword(nextBullet, keyword)).slice(0, 2);
      } else if (nextBullet && !startsWithActionVerb(nextBullet)) {
        nextBullet = strengthenBulletForJD(nextBullet);
      }

      return nextBullet;
    });

    if (areBulletListsEquivalent(current, nextBullets) && nextBullets.length) {
      nextBullets = [
        strengthenBulletForJD(nextBullets[0], remainingKeywords.slice(0, 1)),
        ...nextBullets.slice(1),
      ];
    }

    return limitBullets(nextBullets);
  };

  const buildFinalOptimizedArtifacts = (sourceAnalysis = analysis, sourceData = data, scoreSnapshot = jdScore) => {
    const resolvedJobTitle = resolveAnalysisJobTitle(sourceAnalysis?.jobTitle || "", jdText);
    const rawSummary = alignSummaryToJobTitle(stripCandidateNameFromSummary(sourceAnalysis?.optimizedSummary || ""), resolvedJobTitle);
    const missingKeywords = (scoreSnapshot?.missing || [])
      .filter((item) => item.importance === "must" || item.importance === "preferred")
      .map((item) => item.keyword)
      .filter(Boolean);
    const relatedKeywords = (scoreSnapshot?.related || [])
      .map((item) => item.keyword)
      .filter(Boolean);
    const keywordPool = [...new Set([...missingKeywords, ...relatedKeywords])];
    const finalSummary = rawSummary
      ? enrichSummaryWithKeywords(rawSummary, missingKeywords.slice(0, 4), resolvedJobTitle)
      : "";

    const baseExperience = (sourceAnalysis?.optimizedExperience || []).map((item) => {
      const currentEntry = (sourceData.experience || []).find((entry) => entry.company === item.company && entry.role === item.role);
      return {
        ...item,
        bullets: optimizeDisplayedBullets(
          currentEntry?.bullets || [],
          item.optimizedBullets || [],
          keywordPool,
          `${item.role} ${item.company}`
        ),
      };
    });

    const baseProjects = (sourceAnalysis?.optimizedProjects || []).map((item) => {
      const currentProject = (sourceData.projects || []).find((project) => project.name === item.name);
      return {
        ...item,
        bullets: optimizeDisplayedBullets(
          currentProject?.bullets || [],
          item.optimizedBullets || [],
          keywordPool,
          item.name
        ),
      };
    });

    return {
      summary: cleanupOptimizationText(finalSummary),
      experience: baseExperience.map((item) => ({ ...item, optimizedBullets: limitBullets((item.bullets || []).map((bullet) => cleanupOptimizationText(bullet))) })),
      projects: baseProjects.map((item) => ({ ...item, optimizedBullets: limitBullets((item.bullets || []).map((bullet) => cleanupOptimizationText(bullet))) })),
    };
  };

  const finalOptimizedArtifacts = analysis?.preparedOptimizations || buildFinalOptimizedArtifacts();

  const summarySuggestionText = finalOptimizedArtifacts.summary;
  const isSummarySuggestionApplied = !!summarySuggestionText &&
    normalizeSuggestionText(stripCandidateNameFromSummary(data.summary || "")) === normalizeSuggestionText(summarySuggestionText);

  const isExperienceSuggestionApplied = (optExp) => {
    const target = (data.experience || []).find((item) => createNormalizedKey(item.company, item.role) === createNormalizedKey(optExp.company, optExp.role));
    if (!target) return false;
    return matchesSuggestedBullets(target.bullets || [], optExp.optimizedBullets || []);
  };

  const isProjectSuggestionApplied = (optProj) => {
    const target = (data.projects || []).find((item) => createNormalizedKey(item.name) === createNormalizedKey(optProj.name));
    if (!target) return false;
    return matchesSuggestedBullets(target.bullets || [], optProj.optimizedBullets || []);
  };

  const buildResumeText = () => {
    return buildResumeSnapshot(data).fullText;
  };

  const analyze = async () => {
    if (!jdText.trim()) {
      setJdState(prev => ({ ...prev, error: "Please paste a job description first." }));
      return;
    }
    setJdState(prev => ({ ...prev, status: "analyzing", error: "", analysis: null }));
    setAdded({});
    setAppliedExp({});
    setAppliedProj({});
    setAppliedSummary(false);
    setRecommendationsApplied(false);
    setShowScoreExplainer(false);
    applyAllLockedRef.current = false;
    try {
      const resumeText = buildResumeText();
      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", temperature: 0.1, max_tokens: 4000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system", content: `You are an ATS requirement extractor and resume optimizer.

Extract structured requirements from the Job Description only.
Do not score the resume yourself.
Do not hallucinate experience.
Treat unrelated tools as different unless the JD explicitly treats them as alternatives.
Be conservative with technical aliases, especially for short terms such as R, C, BI, ML, SQL, and AI.
Do not create broad aliases that could match ordinary words or text fragments.

Return only valid JSON.`
            },
            { role: "user", content: `Analyze the following Job Description and Resume.

JOB DESCRIPTION:
${jdText}

RESUME CONTENT:
${resumeText}

Return ONLY valid JSON using this exact shape:
{
  "jobTitle": "Exact job title from the JD",
  "seniority": "Exact seniority from the JD if stated, otherwise best estimate",
  "requirements": [
    {
      "keyword": "Python",
      "category": "Technical Skills",
      "importance": "must",
      "aliases": ["py"],
      "evidenceTarget": "experience",
      "exactRequired": false,
      "critical": true,
      "kind": "keyword"
    }
  ],
  "softSkills": ["communication"],
  "topTip": "One sentence job-specific recommendation",
  "optimizedSummary": "55 to 70 word optimized summary",
  "optimizedExperience": [
    { "company": "Company Name", "role": "Role Name", "optimizedBullets": ["Bullet 1", "Bullet 2"] }
  ],
  "optimizedProjects": [
    { "name": "Project Name", "optimizedBullets": ["Bullet 1", "Bullet 2"] }
  ]
}

Rules:
- jobTitle must come from the JD itself and should stay close to the posted role name
- never default jobTitle to Data Analyst unless the JD really says Data Analyst
- importance must be one of: must, preferred, nice
- category must be one of: Technical Skills, Tools / Software, Frameworks, AI/ML, Cloud Platforms, Databases, Analytics, Domain Skills, Certifications, Other
- aliases should include acronyms, full forms, and common written variants only when they are safe and unambiguous
- do not use single-letter aliases unless the JD clearly uses that exact term as a standalone requirement
- do not use partial-word aliases or broad synonyms that could create false exact matches
- exactRequired should be true for requirements that must not be loosely substituted
- critical should be true for clear must-have blockers
- optimizedSummary should not include the candidate's name
- optimizedSummary must be 55 to 70 words
- optimized bullets must improve existing content only
- each optimized experience or project bullet must be around 12 to 25 words
- return JSON only`
            }
          ]
        })
      });

      if (!resp.ok) {
        throw new Error(await getSafeAIMessageFromResponse(resp, "Analysis is temporarily unavailable. Please try again in a few minutes."));
      }

      const json = await resp.json();
      const rawText = json.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawText);
      const normalizedAnalysis = {
        ...parsed,
        jobTitle: resolveAnalysisJobTitle(parsed.jobTitle || "", jdText),
        requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
        optimizedExperience: Array.isArray(parsed.optimizedExperience) ? parsed.optimizedExperience : [],
        optimizedProjects: Array.isArray(parsed.optimizedProjects) ? parsed.optimizedProjects : [],
      };
      const initialJDScore = calculateJDScore(data, normalizedAnalysis);
      const preparedOptimizations = buildFinalOptimizedArtifacts(normalizedAnalysis, data, initialJDScore);
      setJdState(prev => ({
        ...prev,
        status: "done",
        error: "",
        analysis: {
          ...normalizedAnalysis,
          preparedOptimizations,
        }
      }));
    } catch (err) {
      setJdState(prev => ({ ...prev, error: getSafeAIMessageFromError(err, "Analysis is temporarily unavailable. Please try again in a few minutes."), status: "error" }));
    }
  };

  const addKeyword = (keyword, category) => {
    if (added[keyword]) return;
    let assignedCategory = category || "Skills";
    let changed = false;
    setData(prev => {
      const merged = mergeKeywordIntoSkills(prev.skills || [], keyword, category);
      assignedCategory = merged.assignedCategory;
      changed = merged.changed;
      if (!merged.changed) return prev;
      return { ...prev, skills: merged.skills };
    });
    if (changed) {
      setAdded(prev => ({ ...prev, [keyword]: assignedCategory }));
    }
  };

  const addAll = () => {
    if (!jdScore?.missing?.length) return;
    const addedKeywords = {};
    setData(prev => {
      let nextSkills = [...(prev.skills || [])];

      jdScore.missing.forEach((item) => {
        const keyword = item.keyword?.trim();
        if (!keyword) return;
        const merged = mergeKeywordIntoSkills(nextSkills, keyword, item.category);
        nextSkills = merged.skills;
        if (merged.changed) {
          addedKeywords[keyword] = merged.assignedCategory;
        }
      });

      if (!Object.keys(addedKeywords).length) return prev;
      return { ...prev, skills: nextSkills };
    });

    if (Object.keys(addedKeywords).length) {
      setAdded(prev => ({ ...prev, ...addedKeywords }));
    }
  };

  const applyExperienceOptimization = (optExp) => {
    setData(prev => {
      const e = [...prev.experience];
      const idx = findExperienceIndex(e, optExp.company, optExp.role);
      if (idx !== -1) {
        e[idx] = { ...e[idx], bullets: limitBullets(optExp.optimizedBullets) };
      }
      return { ...prev, experience: e };
    });
    setAppliedExp(prev => ({ ...prev, [createNormalizedKey(optExp.company, optExp.role)]: true }));
  };

  const applyProjectOptimization = (optProj) => {
    setData(prev => {
      const p = [...prev.projects];
      const idx = findProjectIndex(p, optProj.name);
      if (idx !== -1) {
        p[idx] = { ...p[idx], bullets: limitBullets(optProj.optimizedBullets) };
      }
      return { ...prev, projects: p };
    });
    setAppliedProj(prev => ({ ...prev, [createNormalizedKey(optProj.name)]: true }));
  };

  const applySummaryOptimization = (optSummary) => {
    setData(prev => ({ ...prev, summary: optSummary }));
    setAppliedSummary(true);
  };

  const applyAllAISuggestions = () => {
    if (!analysis || recommendationsApplied || applyAllLockedRef.current) return;
    applyAllLockedRef.current = true;
    setRecommendationsApplied(true);

    let addedKeywords = {};
    let summaryChanged = false;
    let changedExpKeys = [];
    let changedProjKeys = [];

    setData((prev) => {
      let next = {
        ...prev,
        skills: [...(prev.skills || [])],
        experience: (prev.experience || []).map((item) => ({ ...item, bullets: [...(item.bullets || [])] })),
        projects: (prev.projects || []).map((item) => ({ ...item, bullets: [...(item.bullets || [])] })),
      };

      if (jdScore?.missing?.length) {
        jdScore.missing.forEach((item) => {
          const keyword = item.keyword?.trim();
          if (!keyword) return;
          const merged = mergeKeywordIntoSkills(next.skills, keyword, item.category);
          next.skills = merged.skills;
          if (merged.changed) {
            addedKeywords[keyword] = merged.assignedCategory;
          }
        });
      }

      if (finalOptimizedArtifacts.summary && !isSummarySuggestionApplied) {
        next.summary = finalOptimizedArtifacts.summary;
        summaryChanged = true;
      }

      if (finalOptimizedArtifacts.experience?.length) {
        next.experience = next.experience.map((item) => {
          const optimized = finalOptimizedArtifacts.experience.find((optExp) => createNormalizedKey(optExp.company, optExp.role) === createNormalizedKey(item.company, item.role));
          if (!optimized || appliedExp[createNormalizedKey(optimized.company, optimized.role)]) return item;
          changedExpKeys.push(createNormalizedKey(optimized.company, optimized.role));
          return { ...item, bullets: limitBullets(optimized.optimizedBullets) };
        });
      }

      if (finalOptimizedArtifacts.projects?.length) {
        next.projects = next.projects.map((item) => {
          const optimized = finalOptimizedArtifacts.projects.find((optProj) => createNormalizedKey(optProj.name) === createNormalizedKey(item.name));
          if (!optimized || appliedProj[createNormalizedKey(optimized.name)]) return item;
          changedProjKeys.push(createNormalizedKey(optimized.name));
          return { ...item, bullets: limitBullets(optimized.optimizedBullets) };
        });
      }

      return next;
    });

    if (Object.keys(addedKeywords).length) {
      setAdded((prev) => ({ ...prev, ...addedKeywords }));
    }
    if (finalOptimizedArtifacts.summary || summaryChanged) {
      setAppliedSummary(true);
    }
    if (finalOptimizedArtifacts.experience?.length) {
      const expKeys = finalOptimizedArtifacts.experience.map((opt) => createNormalizedKey(opt.company, opt.role));
      setAppliedExp((prev) => ({ ...prev, ...Object.fromEntries([...new Set([...changedExpKeys, ...expKeys])].map((key) => [key, true])) }));
    }
    if (finalOptimizedArtifacts.projects?.length) {
      const projectKeys = finalOptimizedArtifacts.projects.map((opt) => createNormalizedKey(opt.name));
      setAppliedProj((prev) => ({ ...prev, ...Object.fromEntries([...new Set([...changedProjKeys, ...projectKeys])].map((key) => [key, true])) }));
    }
  };

  const skillReadyMissing = jdScore?.missing?.filter(canAddDirectly) || [];
  const guidedMissing = jdScore?.missing?.filter((item) => !canAddDirectly(item)) || [];
  const allAdded = skillReadyMissing.length > 0 && skillReadyMissing.every(m => added[m.keyword]);
  const allOptimizationsApplied = !!analysis && (
    (!finalOptimizedArtifacts.summary || appliedSummary || isSummarySuggestionApplied) &&
    (finalOptimizedArtifacts.experience?.every(opt => appliedExp[createNormalizedKey(opt.company, opt.role)] || isExperienceSuggestionApplied(opt)) ?? true) &&
    (finalOptimizedArtifacts.projects?.every(opt => appliedProj[createNormalizedKey(opt.name)] || isProjectSuggestionApplied(opt)) ?? true)
  );
  const everythingApplied = recommendationsApplied || (!!analysis && (allAdded || !skillReadyMissing.length) && allOptimizationsApplied);
  const wordCount = jdText.trim().split(/\s+/).filter(Boolean).length;

  const impColor = (imp) => imp === "high" ? { c: "#dc2626", bg: "#fef2f2" } : imp === "medium" ? { c: "#b45309", bg: "#fffbeb" } : { c: "#6b7688", bg: "#f3f4f6" };
  const scoreColor = (s) => s >= 75 ? { c: "#15803d", bg: "#f0fdf4", bar: "#22c55e" } : s >= 50 ? { c: "#b45309", bg: "#fffbeb", bar: "#f59e0b" } : { c: "#dc2626", bg: "#fef2f2", bar: "#ef4444" };

  const guideContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, color: "#475569", fontSize: 12, lineHeight: 1.6 }}>
      {/* Why Use This Tool? */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
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
            <div style={{ fontSize: 11, paddingTop: 2 }}>Click the "Analyze Job Match" button</div>
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

  const showPageSetup = pageMode && status === "idle" && !analysis;

  if (showPageSetup) {
    return (
      <div className="jd-page-setup" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 18, background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 18, boxShadow: "0 18px 40px rgba(15,23,42,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Paste Job Description</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5, lineHeight: 1.45, color: "#64748b", maxWidth: 520 }}>
              <div>• Find missing keywords</div>
              <div>• See your job match</div>
              <div>• Get resume suggestions</div>
            </div>
          </div>
        </div>
        <textarea
          value={jdText}
          onChange={e => setJdState(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Paste the full job description here..."
          style={{ minHeight: 120, maxHeight: 160, padding: 14, border: "1.5px solid #e5e7eb", borderRadius: 14, resize: "none", fontSize: 12, lineHeight: 1.6, fontFamily: "'Segoe UI', sans-serif", outline: "none", color: "#1a1a1a", background: "#fff", boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 10.5, color: "#94a3b8" }}>{wordCount} words</div>
          <button onClick={analyze} disabled={status === "analyzing"} style={{ minWidth: 220, padding: "12px 18px", background: status === "analyzing" ? "#bba8e3" : "linear-gradient(135deg, #7c5cbf, #6b4db0)", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: status === "analyzing" ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 10px 24px rgba(107, 77, 176, 0.18)" }}>
            {status === "analyzing" ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> Analyzing...</> : <>Analyze Job Match</>}
          </button>
        </div>
        {errorMsg && <div style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>❌ {errorMsg}</div>}
      </div>
    );
  }

  return (
      <div className={`jd-modal-inner ${pageMode ? "jd-page-analyzer" : ""}`} style={{ width: "100%", height: "100%", background: pageMode ? "transparent" : "#fff", borderRadius: pageMode ? 0 : 16, boxShadow: pageMode ? "none" : "0 8px 24px rgba(15,23,42,0.08)", display: "flex", flexDirection: "column", overflow: pageMode ? "visible" : "hidden", border: "none" }}>
        <div className={`jd-analyzer-topbar ${pageMode ? "jd-analyzer-topbar-page" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: pageMode ? "0 0 14px" : "16px 20px", borderBottom: pageMode ? "none" : "1px solid #e5e7eb", background: "transparent" }}>
          <div className="jd-analyzer-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!pageMode && <div><div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Job Description Analyzer</div><div style={{ fontSize: 11, color: "#94a3b8" }}>Paste a JD to find missing keywords and boost your ATS score</div></div>}
          </div>
          <div className="jd-analyzer-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="jd-analyzer-guide-btn" onClick={() => setShowGuide(s => !s)} style={{ display: "none", padding: "6px 12px", border: "1px solid #e5e7eb", background: showGuide ? "#eef2ff" : "#ffffff", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: showGuide ? "#4338ca" : "#475569" }}>
              {guideRead ? "Guide ✓" : "Why this tool?"}
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "#f3f4f6", borderRadius: 8, cursor: "pointer", fontSize: 16, color: "#94a3b8", display: pageMode ? "none" : "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* Body — Two Panels */}
        <div className={`jd-modal-body ${pageMode ? "jd-page-analyzer-body" : ""}`} style={{ display: "flex", flex: 1, overflow: pageMode ? "visible" : "hidden", flexDirection: pageMode ? "column" : "row", background: pageMode ? "transparent" : "#fff", minHeight: 0 }}>
          {/* LEFT — JD Input */}
          <div className={`jd-modal-left ${pageMode ? "jd-page-input" : ""}`} style={{ width: pageMode ? 0 : 300, flexShrink: 0, borderRight: pageMode ? "none" : "1px solid #e5e7eb", borderBottom: pageMode ? "none" : "none", padding: pageMode ? 0 : 20, display: pageMode ? "none" : "flex", flexDirection: "column", gap: 12, background: pageMode ? "#fcfbff" : "#fafbfc" }}>
            <label style={{ fontSize: pageMode ? 13 : 12, fontWeight: 700, color: "#374151" }}>Paste Job Description</label>
            <textarea value={jdText} onChange={e => setJdState(prev => ({ ...prev, text: e.target.value }))} placeholder="Paste the full job description here..." style={{ flex: pageMode ? "0 0 auto" : 1, minHeight: pageMode ? 148 : 260, maxHeight: pageMode ? 190 : "none", padding: 14, border: "1.5px solid #e5e7eb", borderRadius: 14, resize: "none", fontSize: 12, lineHeight: 1.6, fontFamily: "'Segoe UI', sans-serif", outline: "none", color: "#1a1a1a", background: "#fff", boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)" }} />
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{wordCount} words</div>
            <button onClick={analyze} disabled={status === "analyzing"} style={{ padding: pageMode ? "12px 0" : "11px 0", background: status === "analyzing" ? "#bba8e3" : "linear-gradient(135deg, #7c5cbf, #6b4db0)", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: status === "analyzing" ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: pageMode ? "0 10px 24px rgba(107, 77, 176, 0.18)" : "0 2px 8px rgba(107, 77, 176, 0.2)" }}>
              {status === "analyzing" ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> Analyzing...</> : <>Analyze Job Match</>}
            </button>
            {errorMsg && <div style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>❌ {errorMsg}</div>}
          </div>

          {/* RIGHT — Results */}
          <div className={`jd-modal-right ${pageMode ? "jd-page-results" : ""}`} style={{ flex: 1, overflowY: pageMode ? "visible" : "auto", padding: pageMode ? "0 4px 18px 0" : 20, position: "relative", background: "transparent", minHeight: 0, height: "auto" }}>
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
            {showScoreExplainer && (
              <div style={{ position: "absolute", inset: 12, background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, overflowY: "auto", zIndex: 6, boxShadow: "0 14px 34px rgba(15,23,42,0.16)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>How Scoring Works</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>These are the exact factors and weights used for the JD match score.</div>
                  </div>
                  <button onClick={() => setShowScoreExplainer(false)} style={{ width: 30, height: 30, border: "none", background: "#f3f4f6", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#94a3b8" }}>×</button>
                </div>

                <div style={{ display: "grid", gap: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>JD Score Weights</div>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                      {jdScoreWeights.map(([label, internal, weight], index) => (
                        <div key={label} className="jd-score-weight-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 80px", gap: 10, padding: "10px 12px", background: index % 2 ? "#fff" : "#f8fafc", borderTop: index ? "1px solid #e5e7eb" : "none", fontSize: 11.5, color: "#334155" }}>
                          <strong style={{ color: "#0f172a" }}>{label}</strong>
                          <span>{internal}</span>
                          <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="jd-score-explainer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>JD Requirement Weight</div>
                      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                        {jdImportanceWeights.map(([label, weight], index) => (
                          <div key={label} className="jd-importance-row" style={{ display: "grid", gridTemplateColumns: "1fr 70px", gap: 10, padding: "10px 12px", background: index % 2 ? "#fff" : "#f8fafc", borderTop: index ? "1px solid #e5e7eb" : "none", fontSize: 11.5 }}>
                            <strong style={{ color: "#0f172a" }}>{label}</strong>
                            <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Production Model</div>
                      <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6 }}>
                        The public JD score now shows 4 clearer factors focused on keyword match, title alignment, related terminology, and critical requirement coverage.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            {status === "idle" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28 }}>🔍</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>No analysis yet</div>
                <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 320 }}>Paste a job description and click "Analyze Job Match" to review missing skills and improvement opportunities.</div>
              </div>
            )}

            {status === "analyzing" && (
              <div className="jd-analyzing-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: pageMode ? 320 : "100%", height: pageMode ? "auto" : "100%", gap: 16, padding: pageMode ? "56px 0 24px" : 0 }}>
                <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#f55036", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>Analyzing with AI...</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Smart keyword analysis is in progress</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {status === "done" && analysis && jdScore && (() => {
              const resumePalette = ringColors(resumeScore?.overall ?? 0, "orange");
              const jdPalette = ringColors(jdScore.overall, "blue");
              return (
                <div className="jd-results-stack" style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 28 }}>
                  <div className="jd-score-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    <div style={{ background: `${resumePalette.bg}33`, border: `1.5px solid ${resumePalette.fg}33`, borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: resumePalette.text, letterSpacing: 0.4 }}>ATS SCORE</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                        <RingScore score={resumeScore?.overall ?? 0} tone="orange" label="RQS" />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: resumePalette.text }}>{resumeScore?.label || "Needs Work"}</div>
                          <div style={{ fontSize: 11, color: resumePalette.text, marginTop: 4, lineHeight: 1.5 }}>Shows how ATS-ready your resume is before matching it with a job description.</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: `${jdPalette.bg}33`, border: `1.5px solid ${jdPalette.fg}33`, borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: jdPalette.text, letterSpacing: 0.4 }}>JD MATCH SCORE</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                        <RingScore score={jdScore.overall} tone="blue" label="JMS" />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: jdPalette.text }}>{jdScore.label}</div>
                          <div style={{ fontSize: 11, color: jdPalette.text, marginTop: 4, lineHeight: 1.5 }}>Shows how closely your resume matches this specific job description.</div>
                          {analysis.jobTitle && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Target role: {analysis.jobTitle}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="jd-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                    {[
                      ["JD Keywords Found", jdScore.factors.weightedKeywordCoverage],
                      ["Related Skill Match", jdScore.factors.semanticEquivalence],
                      ["Job Title Match", jdScore.factors.titleAlignment],
                    ].map(([label, value]) => {
                      const isOpen = openMetric === label;
                      const help = factorDescriptions[label];
                      const palette = scoreColor(Number(value));
                      return (
                        <button
                          key={label}
                          onClick={() => setOpenMetric(isOpen ? "" : label)}
                          style={{ textAlign: "left", border: `1px solid ${isOpen ? palette.bar : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: isOpen ? palette.bg : "#fff", cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ fontSize: 11, color: "#475569", fontWeight: 800 }}>{label}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: palette.c }}>{value}</div>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.45 }}>{help.summary}</div>
                          {isOpen && <div style={{ fontSize: 11, color: "#334155", marginTop: 8, lineHeight: 1.55 }}><strong>How to improve:</strong> {help.improve}</div>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="jd-summary-grid" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) minmax(260px, 2fr)", gap: 10, alignItems: "stretch" }}>
                    {(() => {
                      const label = "Critical Requirements Covered";
                      const value = jdScore.factors.criticalRequirementRisk;
                      const isOpen = openMetric === label;
                      const help = factorDescriptions[label];
                      const palette = scoreColor(Number(value));
                      return (
                        <button
                          key={label}
                          onClick={() => setOpenMetric(isOpen ? "" : label)}
                          style={{ textAlign: "left", border: `1px solid ${isOpen ? palette.bar : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: isOpen ? palette.bg : "#fff", cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ fontSize: 11, color: "#475569", fontWeight: 800 }}>{label}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: palette.c }}>{value}</div>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.45 }}>{help.summary}</div>
                          {isOpen && <div style={{ fontSize: 11, color: "#334155", marginTop: 8, lineHeight: 1.55 }}><strong>How to improve:</strong> {help.improve}</div>}
                        </button>
                      );
                    })()}
                    <div style={{ background: "#f8fafc", border: "1px solid #dbe5f1", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #86efac", padding: "5px 10px", borderRadius: 999 }}>
                          {jdScore.totals?.matched || 0} Exact Match
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #93c5fd", padding: "5px 10px", borderRadius: 999 }}>
                          {jdScore.totals?.related || 0} Related
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "#fffbeb", border: "1px solid #fcd34d", padding: "5px 10px", borderRadius: 999 }}>
                          {jdScore.totals?.missing || 0} Missing
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.65 }}>
                        {analysis.topTip || jdScore.recommendations?.[0] || "Add the missing keywords naturally to improve the job match score."}
                      </div>
                    </div>
                  </div>

                  <div className="jd-inline-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => setShowScoreExplainer(true)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #dbeafe", background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                      How scoring works
                    </button>
                  </div>

                  {/* Tip Banner */}
                  {(analysis.topTip || jdScore.recommendations?.[0]) && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#1e40af", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span>💡</span><span>{analysis.topTip || jdScore.recommendations[0]}</span>
                    </div>
                  )}

                  <div className="jd-inline-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={applyAllAISuggestions}
                      disabled={everythingApplied}
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 800,
                        border: "none",
                        borderRadius: 10,
                        cursor: everythingApplied ? "default" : "pointer",
                        background: everythingApplied ? "#dcfce7" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                        color: everythingApplied ? "#15803d" : "#fff",
                        boxShadow: everythingApplied ? "none" : "0 10px 24px rgba(99, 102, 241, 0.18)",
                        transition: "all 0.2s"
                      }}
                    >
                      {everythingApplied ? "Recommended Improvements Applied" : "Apply Recommended Improvements"}
                    </button>
                  </div>

                  {/* Missing Keywords */}
                  {jdScore.missing?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Missing Keywords ({jdScore.missing.length})</div>
                        {skillReadyMissing.length > 0 && (
                          <button onClick={addAll} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 700, border: "none", borderRadius: 8, cursor: allAdded ? "default" : "pointer", background: allAdded ? "#dcfce7" : "#16a34a", color: allAdded ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                            {allAdded ? "Added to Skills" : `Add ${skillReadyMissing.length} Skill Keywords`}
                          </button>
                        )}
                      </div>
                      {guidedMissing.length > 0 && (
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>
                          Click a missing keyword to add it into the best existing skills category. Apply Recommended Improvements adds all missing keywords the same way.
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {jdScore.missing.map((m, i) => {
                          const ic = impColor(m.importance === "must" ? "high" : m.importance === "preferred" ? "medium" : "low");
                          const isAdded = added[m.keyword];
                          const directAdd = canAddDirectly(m);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: isAdded ? "#f0fdf4" : "#fff", border: "1px solid #e5e7eb", borderLeft: `4px solid ${isAdded ? "#22c55e" : ic.c}`, borderRadius: 8, transition: "all 0.2s" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{m.keyword}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: ic.c, background: ic.bg, padding: "2px 8px", borderRadius: 20 }}>{m.importance}</span>
                                <span style={{ fontSize: 9, color: "#94a3b8" }}>{m.category}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                {directAdd ? (
                                  <button onClick={() => addKeyword(m.keyword, m.category, m.recommendedSection)} disabled={!!isAdded} style={{ padding: "4px 12px", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 6, cursor: isAdded ? "default" : "pointer", background: isAdded ? "#dcfce7" : "#16a34a", color: isAdded ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                                    {isAdded ? "Added" : "Add"}
                                  </button>
                                ) : (
                                  <div style={{ padding: "4px 12px", fontSize: 10, fontWeight: 700, borderRadius: 6, background: "#eff6ff", color: "#1d4ed8" }}>
                                    Add
                                  </div>
                                )}
                                {isAdded && <span style={{ fontSize: 9, color: "#15803d" }}>Added to Skills → {isAdded}</span>}
                                {!isAdded && <span style={{ fontSize: 9, color: "#64748b", fontStyle: "italic", marginTop: 2 }}>Will be added into your existing skills groups</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matched Keywords */}
                  {jdScore.matched?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Exact Match ({jdScore.matched.length})</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {jdScore.matched.map((m, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#15803d", background: "#f0fdf4", border: "1px solid #86efac", padding: "4px 12px", borderRadius: 20 }}>{m.keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {jdScore.related?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Partial Match ({jdScore.related.length})</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {jdScore.related.map((m, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #93c5fd", padding: "4px 12px", borderRadius: 20 }}>{m.keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {shouldShowSoftSkills && analysis.softSkills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>💬 Soft Skills Found</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.softSkills.map((s, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 12px", borderRadius: 20, textTransform: "capitalize" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimized Summary */}
                  {finalOptimizedArtifacts.summary && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>✍️ Optimized Summary <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", background: "#7c3aed", padding: "2px 6px", borderRadius: 12 }}>AI Suggestion</span></div>
                      <div style={{ padding: "16px", background: (appliedSummary || isSummarySuggestionApplied) ? "#f0fdf4" : "#f8fafc", border: `1px solid ${(appliedSummary || isSummarySuggestionApplied) ? "#86efac" : "#cbd5e1"}`, borderRadius: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8, flex: 1, paddingRight: 12 }}>{summarySuggestionText}</div>
                          <button onClick={() => applySummaryOptimization(summarySuggestionText)} disabled={appliedSummary || isSummarySuggestionApplied} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 8, cursor: (appliedSummary || isSummarySuggestionApplied) ? "default" : "pointer", background: (appliedSummary || isSummarySuggestionApplied) ? "#dcfce7" : "#3b82f6", color: (appliedSummary || isSummarySuggestionApplied) ? "#15803d" : "#fff", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                            {(appliedSummary || isSummarySuggestionApplied) ? "Applied" : "Apply Update"}
                          </button>
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>Summary length: {countWords(summarySuggestionText)} words</div>
                      </div>
                    </div>
                  )}

                  {/* Optimized Experience */}
                  {finalOptimizedArtifacts.experience?.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>✨ Optimized Experience Bullets <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", background: "#7c3aed", padding: "2px 6px", borderRadius: 12 }}>AI Suggestion</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {finalOptimizedArtifacts.experience.map((opt, i) => {
                          const isApplied = appliedExp[createNormalizedKey(opt.company, opt.role)] || isExperienceSuggestionApplied(opt);
                          return (
                            <div key={i} style={{ padding: "16px", background: isApplied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${isApplied ? "#86efac" : "#cbd5e1"}`, borderRadius: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{opt.role}</div>
                                  <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>@ {opt.company}</div>
                                </div>
                                <button onClick={() => applyExperienceOptimization(opt)} disabled={isApplied} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 8, cursor: isApplied ? "default" : "pointer", background: isApplied ? "#dcfce7" : "#3b82f6", color: isApplied ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                                  {isApplied ? "Applied" : "Apply Update"}
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.9 }}>
                                {opt.optimizedBullets?.map((b, j) => <li key={j} style={{ marginBottom: 4 }}>{b}</li>)}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Optimized Projects */}
                  {finalOptimizedArtifacts.projects?.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>🚀 Optimized Project Bullets <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", background: "#7c3aed", padding: "2px 6px", borderRadius: 12 }}>AI Suggestion</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {finalOptimizedArtifacts.projects.map((opt, i) => {
                          const isApplied = appliedProj[createNormalizedKey(opt.name)] || isProjectSuggestionApplied(opt);
                          return (
                            <div key={i} style={{ padding: "16px", background: isApplied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${isApplied ? "#86efac" : "#cbd5e1"}`, borderRadius: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{opt.name}</div>
                                <button onClick={() => applyProjectOptimization(opt)} disabled={isApplied} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 8, cursor: isApplied ? "default" : "pointer", background: isApplied ? "#dcfce7" : "#3b82f6", color: isApplied ? "#15803d" : "#fff", transition: "all 0.2s" }}>
                                  {isApplied ? "Applied" : "Apply Update"}
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.9 }}>
                                {opt.optimizedBullets?.map((b, j) => <li key={j} style={{ marginBottom: 4 }}>{b}</li>)}
                              </ul>
                            </div>
                          );
                        })}
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
  );
}


// ── Routing Wrapper ───────────────────────────────────────────────────────────
function ResumePreviewPane({
  data, activeTemplate, activeTemplateLabel, setShowTemplateModal, showFontPanel, setShowFontPanel,
  headingFont, bodyFont, setHeadingFont, setBodyFont, resumeFontSize, setResumeFontSize,
  resumeLineHeight, setResumeLineHeight, zoom, setZoom, handleResumeDownload, isPdfDownloading,
  template5Preview, setTemplate5Preview, previewRef, windowWidth
}) {
  return (
    <div className="rb-preview-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@keyframes resume-pdf-spin { to { transform: rotate(360deg); } }`}</style>
      <div className="rb-toolbar" style={{ padding: "9px 18px", background: C.toolbarBg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setShowTemplateModal(true)} style={{ padding: "10px 18px", border: "1px solid rgba(107,77,176,0.20)", borderRadius: 14, cursor: "pointer", fontSize: 13, fontWeight: 800, background: "linear-gradient(180deg, #ffffff 0%, #f7f1ff 58%, #f0e6ff 100%)", color: "#5b3ea6", transition: "all 0.18s ease", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 24px rgba(107,77,176,0.12), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -3px 8px rgba(107,77,176,0.08), 0 2px 0 rgba(107,77,176,0.10)" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
          {activeTemplateLabel}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }} className="rb-font-panel-wrap-trigger">
          <button disabled={activeTemplate === "5"} onClick={() => setShowFontPanel(!showFontPanel)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: showFontPanel ? C.accentLight : "#fff", border: showFontPanel ? `1.5px solid ${C.accentBorder}` : `1.5px solid ${C.border}`, borderRadius: 8, cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 11, fontWeight: 600, color: showFontPanel ? C.accent : C.textLight, transition: "all 0.15s" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
          <button disabled={activeTemplate === "5"} onClick={() => setResumeFontSize(v => Math.max(8, v - 0.5))} style={{ width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 14, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600, minWidth: 28, textAlign: "center", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{resumeFontSize}pt</span>
          <button disabled={activeTemplate === "5"} onClick={() => setResumeFontSize(v => Math.min(14, v + 0.5))} style={{ width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 14, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 6 }}>
          <span style={{ fontSize: 11, color: C.textLight, opacity: activeTemplate === "5" ? 0.5 : 1 }}>Spacing</span>
          {[1.5, 1.8, 2].map(lh => (
            <button key={lh} disabled={activeTemplate === "5"} onClick={() => setResumeLineHeight(lh)} style={{ padding: "4px 8px", background: resumeLineHeight === lh ? C.accentLight : "#fff", border: `1px solid ${resumeLineHeight === lh ? C.accent : C.border}`, borderRadius: 5, color: resumeLineHeight === lh ? C.accent : C.textMuted, fontSize: 11, cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{lh}</button>
          ))}
        </div>
        <div style={{ width: 1, background: C.border, height: 24, margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 12 }}>
          <button disabled={activeTemplate === "5"} onClick={() => setZoom(z => Math.max(30, z - 10))} style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, minWidth: 40, textAlign: "center", userSelect: "none", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{zoom}%</span>
          <button disabled={activeTemplate === "5"} onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
        <button disabled={isPdfDownloading || (activeTemplate === "5" && template5Preview.isCompiling)} onClick={handleResumeDownload} style={{ height: 32, padding: "0 14px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: isPdfDownloading ? "wait" : "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)", opacity: isPdfDownloading ? 0.9 : 1 }}>
          {isPdfDownloading ? (
            <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", display: "inline-block", animation: "resume-pdf-spin 0.8s linear infinite" }} />
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.download} /></svg>
          )}
          {isPdfDownloading ? "Preparing..." : activeTemplate === "5" && template5Preview.isCompiling ? "Compiling..." : "PDF"}
        </button>
      </div>
      <div className="rb-preview-area" style={{ flex: 1, overflowY: "auto", background: C.previewBg, padding: "28px 0 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {activeTemplate === "5" ? (
          <Template5Preview data={data} onPreviewChange={setTemplate5Preview} />
        ) : (() => {
          const scale = windowWidth <= 640 ? Math.max(0.3, (windowWidth - 16) / PAGE_W) : windowWidth <= 1024 ? Math.max(0.4, (windowWidth - 220) / PAGE_W) : zoom / 100;
          const outerW = windowWidth <= 1024 ? Math.round(PAGE_W * scale) : PAGE_W;
          return (
            <div style={{ width: outerW, overflow: "visible", flexShrink: 0, display: "flex", justifyContent: "flex-start" }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_W, marginBottom: `${PAGE_H * (scale - 1)}px`, flexShrink: 0 }}>
                <PaginatedResume data={data} template={activeTemplate} exportRef={previewRef} headingFont={headingFont} bodyFont={bodyFont} fontSize={resumeFontSize} lineHeight={resumeLineHeight} />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function JDMatchPage() {
  const navigate = useNavigate();
  const {
    data, setData, update, showUpload, setShowUpload, showTemplateModal, setShowTemplateModal, showFontPanel, setShowFontPanel,
    activeTemplate, setActiveTemplate, headingFont, setHeadingFont, bodyFont, setBodyFont, isFetching,
    handleParsed, handleResumeDownload, isPdfDownloading, zoom, setZoom, resumeFontSize, setResumeFontSize,
    resumeLineHeight, setResumeLineHeight, template5Preview, setTemplate5Preview, previewRef, windowWidth, resumeScore
  } = useResumeWorkspace();
  const [jdState, setJdState] = useState({ text: "", status: "idle", error: "", analysis: null });
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [editorSection, setEditorSection] = useState("personal");
  const [jdMobileTab, setJdMobileTab] = useState("match");
  const snapshot = buildResumeSnapshot(data);
  const hasResumeContent = snapshot.wordCount >= 20 || snapshot.expEntries.some(e => e.role) || snapshot.projectEntries.some(p => p.name);
  const jdScore = jdState.analysis ? calculateJDScore(data, jdState.analysis) : null;
  const activeTemplateLabel = activeTemplate === "A" ? "Classic" : activeTemplate === "B" ? "Modern" : activeTemplate === "C" ? "Minimal" : activeTemplate === "4" ? "Template 4" : "Template 5";
  const showJDSetup = jdState.status === "idle" && !jdState.analysis;
  const editorNav = [
    { id: "personal", label: "Personal", icon: icons.user },
    { id: "summary", label: "Summary", icon: icons.layers },
    { id: "skills", label: "Skills", icon: icons.code },
    { id: "education", label: "Education", icon: icons.book },
    { id: "experience", label: "Experience", icon: icons.briefcase },
    { id: "projects", label: "Projects", icon: icons.globe },
    { id: "certifications", label: "Certs", icon: icons.award },
    { id: "achievements", label: "Awards", icon: icons.award },
  ];
  const IS = { width: "100%", padding: "11px 14px", background: "#f8fafc", border: `1px solid #cbd5e1`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "all 0.2s ease", boxShadow: "inset 0 3px 6px rgba(0,0,0,0.06), inset 0 0 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.8)" };
  const CS = { background: "#ffffff", border: `1px solid #e2e8f0`, borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.02)" };

  return (
    <div className="jd-page-shell" style={{ display: "flex", height: "calc(100dvh - 66px)", minHeight: 0, background: C.appBg, overflow: "hidden", position: "relative", fontFamily: "'Sora', sans-serif" }}>
      {isFetching && !hasResumeContent && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ width: 44, height: 44, border: `3.5px solid ${C.accentLight}`, borderTop: `3.5px solid ${C.accent}`, borderRadius: "50%", animation: "resume-fetch-spin 1s linear infinite", marginBottom: 18 }} />
          <style>{`@keyframes resume-fetch-spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>Loading your saved resume...</div>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onParsed={handleParsed} />}
      {showTemplateModal && <TemplateModal onClose={() => setShowTemplateModal(false)} activeTemplate={activeTemplate} onSelect={setActiveTemplate} />}

      <div className={`jd-page-sidebar ${jdMobileTab === "preview" ? "jd-mobile-hidden" : ""}`} style={{ width: 700, maxWidth: "100%", background: "#fff", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: 0, flexShrink: 0 }}>
        <div className="jd-page-header" style={{ padding: "14px 24px 12px", borderBottom: `1px solid ${C.border}`, background: "linear-gradient(180deg, #ffffff 0%, #fcfbff 100%)", boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.9), 0 10px 24px rgba(15,23,42,0.03)" }}>
          <div className="jd-page-header-main" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showJDSetup ? 10 : 0 }}>
            <div className="jd-page-header-title">
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{showInlineEditor ? "Edit Resume Details" : "Optimize Resume for This Job"}</div>
            </div>
            <div className="jd-page-header-buttons">
              <button
                onClick={() => setShowInlineEditor((prev) => !prev)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 34, padding: "8px 14px", background: "#fff", border: `1.5px solid ${showInlineEditor ? "#2563eb" : C.inputBorder}`, borderRadius: 8, color: showInlineEditor ? "#2563eb" : C.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
                {showInlineEditor ? "Previous Score" : "Edit Resume"}
              </button>
              <button
                onClick={() => setShowUpload(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 34, padding: "8px 14px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)", whiteSpace: "nowrap" }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d={icons.upload} /></svg>
                Upload CV
              </button>
            </div>
          </div>
          <div className="jd-mobile-tabs">
            <button className={jdMobileTab === "match" ? "active" : ""} onClick={() => setJdMobileTab("match")}>
              {showInlineEditor ? "Edit Resume" : "Job Match"}
            </button>
            <button className={jdMobileTab === "preview" ? "active" : ""} onClick={() => setJdMobileTab("preview")}>
              Preview
            </button>
          </div>
          {showJDSetup && <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 16 }} className="jd-top-cards">
            <div style={{ border: "1px solid rgba(107,77,176,0.16)", borderRadius: 18, padding: "16px 16px 14px", background: "linear-gradient(180deg, rgba(124,92,191,0.08), rgba(255,255,255,0.98))", boxShadow: "0 10px 26px rgba(107,77,176,0.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(107,77,176,0.14)", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icons.upload} /></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Upload Resume</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.55, color: "#64748b", marginBottom: 12 }}>Upload your resume to start job matching.</div>
              <button onClick={() => setShowUpload(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d={icons.upload} /></svg>
                Upload Resume
              </button>
            </div>
            <div style={{ border: "1px solid rgba(37,99,235,0.16)", borderRadius: 18, padding: "16px 16px 14px", background: "linear-gradient(180deg, rgba(59,130,246,0.07), rgba(255,255,255,0.98))", boxShadow: "0 10px 26px rgba(59,130,246,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(59,130,246,0.12)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Paste Job Description</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.55, color: "#64748b", marginBottom: 12 }}>Paste the job description to compare your resume.</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 700 }}>
                <span>📌</span>
                Paste JD and analyze below
              </div>
            </div>
          </div>}
        </div>

        <div className="jd-page-sidebar-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: showInlineEditor ? "16px 18px 20px" : "8px 24px 24px", display: "flex", flexDirection: "column", position: "relative" }}>
          {!hasResumeContent ? (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, background: "#fff", boxShadow: "0 8px 24px rgba(15,23,42,0.05)" }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>📄</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>No resume found yet</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: C.textMuted, marginBottom: 18 }}>
                Build your resume first or upload an existing one. Then this page will compare it with the job description and show missing keywords, exact matches, and AI suggestions.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/ats-resume-builder")} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Open Resume Builder
                </button>
                <button onClick={() => setShowUpload(true)} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Upload Resume
                </button>
              </div>
            </div>
          ) : showInlineEditor ? (
            <JDInlineEditor
              data={data}
              setData={setData}
              update={update}
              activeSection={editorSection}
              setActiveSection={setEditorSection}
              sideNav={editorNav}
              IS={IS}
              CS={CS}
            />
          ) : (
            <JDAnalyzerModal onClose={() => navigate("/ats-resume-builder")} data={data} setData={setData} jdState={jdState} setJdState={setJdState} jdScore={jdScore} resumeScore={resumeScore} pageMode />
          )}
        </div>
      </div>

      <div className={`jd-page-preview ${jdMobileTab !== "preview" ? "jd-mobile-hidden" : ""}`}>
        <ResumePreviewPane
          data={data}
          activeTemplate={activeTemplate}
          activeTemplateLabel={activeTemplateLabel}
          setShowTemplateModal={setShowTemplateModal}
          showFontPanel={showFontPanel}
          setShowFontPanel={setShowFontPanel}
          headingFont={headingFont}
          bodyFont={bodyFont}
          setHeadingFont={setHeadingFont}
          setBodyFont={setBodyFont}
          resumeFontSize={resumeFontSize}
          setResumeFontSize={setResumeFontSize}
          resumeLineHeight={resumeLineHeight}
          setResumeLineHeight={setResumeLineHeight}
          zoom={zoom}
          setZoom={setZoom}
          handleResumeDownload={handleResumeDownload}
          isPdfDownloading={isPdfDownloading}
          template5Preview={template5Preview}
          setTemplate5Preview={setTemplate5Preview}
          previewRef={previewRef}
          windowWidth={windowWidth}
        />
      </div>

      <nav className="jd-bottom-nav">
        <button className={!showInlineEditor && jdMobileTab === "match" ? "active" : ""} onClick={() => { setShowInlineEditor(false); setJdMobileTab("match"); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18" /><path d="M3 12h18" /><path d="M3 19h18" /></svg>
          Match
        </button>
        <button className={showInlineEditor && jdMobileTab === "match" ? "active" : ""} onClick={() => { setShowInlineEditor(true); setJdMobileTab("match"); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
          Edit
        </button>
        <button className={jdMobileTab === "preview" ? "active" : ""} onClick={() => setJdMobileTab("preview")}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button onClick={() => { setShowUpload(true); setJdMobileTab("match"); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icons.upload} /></svg>
          Upload
        </button>
      </nav>
    </div>
  );
}

function JDInlineEditor({ data, setData, update, activeSection, setActiveSection, sideNav, IS, CS }) {
  return (
    <div className="jd-inline-editor">
      <div className="jd-inline-editor-nav">
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: "#64748b", marginBottom: 10 }}>RESUME SECTIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sideNav.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  width: "100%",
                  border: isActive ? "1.5px solid #60a5fa" : "1px solid #dbe3ee",
                  borderRadius: 12,
                  background: isActive ? "linear-gradient(135deg, #eff6ff, #ffffff)" : "#ffffff",
                  color: isActive ? "#1d4ed8" : "#475569",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  boxShadow: isActive ? "0 8px 18px rgba(37, 99, 235, 0.12)" : "0 4px 10px rgba(15,23,42,0.04)",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d={section.icon} /></svg>
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="jd-inline-editor-form" style={{ minWidth: 0, border: "1px solid rgba(226,232,240,0.95)", borderRadius: 20, background: "rgba(255,255,255,0.92)", boxShadow: "0 18px 40px rgba(15,23,42,0.06)", padding: 18 }}>
        {activeSection === "personal" && <PersonalForm data={data.personal} update={update} IS={IS} />}
        {activeSection === "summary" && <SummaryForm summary={data.summary} update={update} IS={IS} onGenerate={() => {}} loading={false} error="" />}
        {activeSection === "skills" && <SkillsForm skills={data.skills} setData={setData} IS={IS} CS={CS} />}
        {activeSection === "education" && <EducationForm education={data.education} setData={setData} IS={IS} CS={CS} />}
        {activeSection === "experience" && <ExperienceForm experience={data.experience} setData={setData} IS={IS} CS={CS} />}
        {activeSection === "projects" && <ProjectsForm projects={data.projects} setData={setData} IS={IS} CS={CS} />}
        {activeSection === "certifications" && <CertsForm certifications={data.certifications} setData={setData} IS={IS} CS={CS} />}
        {activeSection === "achievements" && <AchievementsForm achievements={data.achievements} setData={setData} IS={IS} CS={CS} />}
      </div>
    </div>
  );
}

import HomePage from '../HomePage/HomePage.jsx';
import CoverLetterBuilder from '../CoverLetterBuilder/CoverLetterBuilder.jsx';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import SEOHead from '../../components/SEO/SEOHead.jsx';
import Steps from '../../components/Steps.jsx';
import Networking from '../Networking/Networking.jsx';
import JobPortals from '../JobPortals/JobPortals.jsx';
import PrivacyPolicy from '../Legal/PrivacyPolicy.jsx';
import TermsAndConditions from '../Legal/TermsAndConditions.jsx';

function App() {
  const location = useLocation();
  const hideFooter = (location.pathname === "/builder" || location.pathname === "/ats-resume-builder" || location.pathname === "/jd-match" || location.pathname === "/cover-letter");
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://atsforge.co.in";
  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ATSForge",
      url: siteUrl,
      logo: `${siteUrl}/high-resolution-color-logo.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ATSForge",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/job-portals`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ATSForge",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "ATS-friendly resume builder, professional cover letter generator, personalized cold email and cold DM generator, LaTeX editor, and 100+ job portal directory.",
    },
  ];

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<><SEOHead title="ATS Resume Builder, Cover Letter, Cold Email and 100+ Job Portals" description="ATSForge is a job-search suite with an ATS friendly resume builder, professional cover letter generator, personalized cold email and cold DM tools, LaTeX editor, and 100+ job portal links." path="/" keywords="ATS resume builder, ATS friendly resume builder, professional cover letter generator, cold email generator, cold DM generator, personalized outreach, 100+ job portals" schema={homeSchema} /><HomePage /></>} />
        <Route path="/ats-resume-builder" element={<><SEOHead title="ATS Friendly Resume Builder" description="Create ATS-friendly resumes with templates, resume upload auto-fill, keyword optimization, PDF export, and professional formatting for modern hiring systems." path="/ats-resume-builder" keywords="ATS friendly resume builder, ATS resume builder, resume templates, resume upload autofill, professional resume builder" /><ResumeBuilder /></>} />
        <Route path="/jd-match" element={<><SEOHead title="JD Match Analyzer" description="Match your saved resume against a job description, find missing keywords, and apply AI suggestions with a full live preview." path="/jd-match" keywords="JD match analyzer, resume keyword match, job description analyzer, ATS keyword matching" /><JDMatchPage /></>} />
        <Route path="/builder" element={<Navigate to="/ats-resume-builder" replace state={location.state} />} />
        <Route path="/cover-letter" element={<><SEOHead title="Professional Cover Letter Generator" description="Generate professional cover letters tailored to your resume and target role with editable output, formatting controls, and PDF export support." path="/cover-letter" keywords="professional cover letter generator, AI cover letter, cover letter builder, job application cover letter" /><CoverLetterBuilder /></>} />
        <Route path="/latex-editor" element={<><SEOHead title="LaTeX Resume Editor" description="Write, edit, and compile LaTeX resumes with ready-made templates, live preview, and downloadable PDF output for technical and academic applications." path="/latex-editor" keywords="LaTeX resume editor, LaTeX CV builder, LaTeX resume templates, technical resume editor" /><LatexEditor /></>} />
        <Route path="/steps" element={<><SEOHead title="How ATSForge Works" description="See the simple step-by-step workflow for building ATS-optimized resumes, cover letters, and job-search assets with ATSForge." path="/steps" keywords="how ATS resume builder works, resume builder steps, ATSForge workflow" /><Steps /></>} />
        <Route path="/network-outreach" element={<><SEOHead title="Cold DM and Cold Email Generator" description="Create personalized cold DMs and cold emails based on your profile, target company, and role to improve networking outreach and referral requests." path="/network-outreach" keywords="cold DM generator, cold email generator, personalized outreach, referral email generator, networking message generator" /><Networking /></>} />
        <Route path="/networking" element={<Navigate to="/network-outreach" replace state={location.state} />} />
        <Route path="/job-portals" element={<><SEOHead title="100+ Job Portal Links" description="Explore 100+ job portals across India, global markets, remote work, tech jobs, internships, freelance roles, and region-specific hiring platforms." path="/job-portals" keywords="100+ job portals, job portal links, job sites, tech job portals, remote job boards, internship platforms" /><JobPortals /></>} />
        <Route path="/privacy-policy" element={<><SEOHead title="Privacy Policy" description="Read the ATSForge Privacy Policy to understand how information is handled when using the resume builder, cover letter generator, LaTeX editor, and networking tools." path="/privacy-policy" keywords="ATSForge privacy policy, privacy policy" /><PrivacyPolicy /></>} />
        <Route path="/terms-and-conditions" element={<><SEOHead title="Terms and Conditions" description="Read the ATSForge Terms and Conditions for the resume builder, cover letter generator, LaTeX editor, networking features, and job portal resources." path="/terms-and-conditions" keywords="ATSForge terms and conditions, terms and conditions" /><TermsAndConditions /></>} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

// ── Resume Builder Page ──────────────────────────────────────────────────────
function useResumeWorkspace() {
  const [data, setData] = useState(initialData);
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [parseMeta, setParseMeta] = useState({ source: "builder", extractedTextLength: 0 });
  const [resumeAiReview, setResumeAiReview] = useState(null);
  const [resumeAiStatus, setResumeAiStatus] = useState("idle");
  const [activeTemplate, setActiveTemplate] = useState("5");
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
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [zoom, setZoom] = useState(100);
  const [resumeFontSize, setResumeFontSize] = useState(9);
  const [resumeLineHeight, setResumeLineHeight] = useState(1.45);
  const [template5Preview, setTemplate5Preview] = useState({ pdfUrl: null, isCompiling: false, errors: [], latexCode: "" });
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const previewRef = useRef(null);
  const fetchLockRef = useRef(null);
  const resumeScore = calculateResumeScore(data, { parseMeta, aiReview: resumeAiReview });

  const loadResumeData = useCallback((dbData) => {
    if (dbData?.resume_data) {
      let parsed = dbData.resume_data;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { /* keep raw object if parsing fails */ }
      }
      if (parsed && typeof parsed === "object") {
        localStorage.setItem("resume-data-cache", JSON.stringify(parsed));
        setData((prev) => {
          const next = { ...prev, ...parsed, personal: { ...prev.personal, ...(parsed.personal || {}) } };
          ["education", "experience", "projects", "certifications", "achievements", "skills"].forEach((field) => {
            if (!next[field] || !Array.isArray(next[field])) next[field] = prev[field] || [];
          });
          return next;
        });
      }
    }
  }, []);

  const fetchResumeFromDB = useCallback(async (userId) => {
    if (!userId) return;
    const now = Date.now();
    if (fetchLockRef.current && fetchLockRef.current.userId === userId && (now - fetchLockRef.current.ts < 10000)) return;
    setIsFetching(true);
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Database Timeout (30s)")), 30000));
      const query = supabase.from("resume_data").select("resume_data").eq("user_id", userId).maybeSingle();
      const { data: dbData, error } = await Promise.race([query, timeout]);
      if (error) throw error;
      if (dbData) {
        loadResumeData(dbData);
        fetchLockRef.current = { userId, ts: Date.now() };
      }
    } catch (err) {
      console.error("Fetch failure:", err.message);
    } finally {
      setIsFetching(false);
    }
  }, [loadResumeData]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const cache = localStorage.getItem("resume-data-cache");
      if (cache) {
        try {
          const parsedCache = JSON.parse(cache);
          if (parsedCache && typeof parsedCache === "object") setData(prev => ({ ...prev, ...parsedCache }));
        } catch { /* ignore invalid local cache */ }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchResumeFromDB(session.user.id);
      }
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
          await fetchResumeFromDB(session.user.id);
        }
      } else {
        setUser(null);
        setData(initialData);
        localStorage.removeItem("resume-data-cache");
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchResumeFromDB]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { loadFont(headingFont); loadFont(bodyFont); }, [headingFont, bodyFont]);
  useEffect(() => { localStorage.setItem("resume-heading-font", headingFont.id); }, [headingFont]);
  useEffect(() => { localStorage.setItem("resume-body-font", bodyFont.id); }, [bodyFont]);
  useEffect(() => { window.__resumeHeadingFont = headingFont; window.__resumeBodyFont = bodyFont; }, [headingFont, bodyFont]);

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

  const handleParsed = useCallback((parsed, nextParseMeta) => {
    setData(prev => {
      const merged = JSON.parse(JSON.stringify(prev));
      Object.keys(parsed.personal || {}).forEach(k => {
        if (!merged.personal[k] && parsed.personal[k]) merged.personal[k] = parsed.personal[k];
      });
      if (!merged.summary && parsed.summary) merged.summary = parsed.summary;
      if (parsed.skills?.length) merged.skills = parsed.skills;
      if (parsed.education?.some(e => e.degree)) merged.education = parsed.education;
      if (parsed.experience?.some(e => e.role)) merged.experience = parsed.experience;
      if (parsed.projects?.some(p => p.name)) {
        const newProjects = parsed.projects.map((p, i) => {
          const existingByName = prev.projects.find(ep => ep.name && p.name && ep.name.toLowerCase() === p.name.toLowerCase());
          const existingByIndex = prev.projects[i];
          let preservedLink = "";
          if (existingByName?.link) preservedLink = existingByName.link;
          else if (existingByIndex?.link) preservedLink = existingByIndex.link;
          return { ...p, link: preservedLink || p.link || "" };
        });
        merged.projects = newProjects;
      }
      if (parsed.certifications?.some(c => c.name)) merged.certifications = parsed.certifications;
      if (parsed.achievements?.some(a => a.title)) merged.achievements = parsed.achievements;
      return merged;
    });
    setParseMeta(nextParseMeta || { source: "upload", extractedTextLength: 0 });
  }, []);

  useEffect(() => {
    const snapshot = buildResumeSnapshot(data);
    const enoughContent = snapshot.wordCount >= 120 && (snapshot.expEntries.some(e => e.role) || snapshot.projectEntries.some(p => p.name));
    if (!enoughContent) {
      setResumeAiReview(null);
      setResumeAiStatus("idle");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setResumeAiStatus("loading");
        const resp = await fetch("/api/groq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: "You are a resume language reviewer. Return only JSON. Review clarity and specificity of resume writing. Never return a final ATS score." },
              { role: "user", content: `Review this resume and return JSON using this exact shape:\n{\n  "clarityScore": 0,\n  "specificityScore": 0,\n  "reason": "One short sentence",\n  "notes": ["Short note 1", "Short note 2"]\n}\n\nRules:\n- clarityScore and specificityScore must be numbers from 0 to 10\n- reward strong clarity, specificity, and recruiter readability\n- penalize vague, repetitive, generic, or buzzword-heavy language\n- keep reason short and factual\n- do not invent facts\n- return JSON only\n\nRESUME:\n${snapshot.fullText}` }
            ]
          })
        });
        if (!resp.ok) throw new Error("AI review failed");
        const json = await resp.json();
        const payload = json.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(payload);
        if (!cancelled) {
          setResumeAiReview(formatResumeReviewPayload(parsed));
          setResumeAiStatus("done");
        }
      } catch {
        if (!cancelled) {
          setResumeAiReview(null);
          setResumeAiStatus("error");
        }
      }
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data]);

  const handleSaveToDb = useCallback(async () => {
    if (!user) {
      alert("Please sign in or create an account to save your resume seamlessly.");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network Timeout: Request took more than 10 seconds")), 10000));
      const savePromise = supabase.from("resume_data").upsert({ user_id: user.id, resume_data: data, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).select();
      const { data: savedRows, error } = await Promise.race([savePromise, timeoutPromise]);
      if (error) throw error;
      if (!savedRows || savedRows.length === 0) throw new Error("Supabase returned no updated rows. Database RLS policy likely rejected the update.");
      localStorage.setItem("resume-data-cache", JSON.stringify(data));
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Err: " + (err.message || "Failed"));
      setTimeout(() => setSaveMessage(""), 4000);
    } finally {
      setIsSaving(false);
    }
  }, [data, isSaving, user]);

  const handleResumeDownload = useCallback(async () => {
    if (isPdfDownloading) return;
    setIsPdfDownloading(true);
    try {
      if (activeTemplate === "5") {
        if (!template5Preview.pdfUrl) return;
        const link = document.createElement("a");
        link.href = template5Preview.pdfUrl;
        link.download = `${data.personal.name || "Resume"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return;
      }
      await exportPDF(previewRef, data.personal.name);
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setIsPdfDownloading(false);
    }
  }, [activeTemplate, data.personal.name, isPdfDownloading, template5Preview.pdfUrl]);

  return {
    data, setData, update, showUpload, setShowUpload, showTemplateModal, setShowTemplateModal, showFontPanel, setShowFontPanel,
    showTips, setShowTips, activeTemplate, setActiveTemplate, headingFont, setHeadingFont, bodyFont, setBodyFont,
    isSaving, isFetching, saveMessage, handleSaveToDb, handleParsed, handleResumeDownload, isPdfDownloading, zoom, setZoom,
    resumeFontSize, setResumeFontSize, resumeLineHeight, setResumeLineHeight, template5Preview, setTemplate5Preview,
    previewRef, windowWidth, resumeScore, resumeAiStatus
  };
}

function ResumeBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [activeSection, setActiveSection] = useState("personal");
  const [activeTemplate, setActiveTemplate] = useState("5");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [parseMeta, setParseMeta] = useState({ source: "builder", extractedTextLength: 0 });
  const [resumeAiReview, setResumeAiReview] = useState(null);
  const [resumeAiStatus, setResumeAiStatus] = useState("idle");
  const [jdState, setJdState] = useState({ text: "", status: "idle", error: "", analysis: null });
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
  const [isFetching, setIsFetching] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fetchLockRef = useRef(null); // To prevent concurrent same-user fetches

  // Robust helper to fetch from DB with a timeout
  const fetchResumeFromDB = async (userId) => {
    if (!userId) return;
    
    // Deduplicate: If we fetched successfully in the last 10 seconds, skip redundant triggers
    const now = Date.now();
    if (fetchLockRef.current && fetchLockRef.current.userId === userId && (now - fetchLockRef.current.ts < 10000)) {
       return;
    }

    setIsFetching(true);
    try {
      // 30s timeout to handle Supabase cold starts/slow regions
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Database Timeout (30s)")), 30000));
      const query = supabase.from('resume_data').select('resume_data').eq('user_id', userId).maybeSingle();
      
      const { data: dbData, error } = await Promise.race([query, timeout]);
      
      if (error) throw error;
      if (dbData) {
        loadResumeData(dbData);
        // Mark as successfully fetched recently
        fetchLockRef.current = { userId, ts: Date.now() };
      }
    } catch (err) {
      console.error("Fetch failure:", err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const loadResumeData = (dbData) => {
    if (dbData?.resume_data) {
      let parsed = dbData.resume_data;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { /* keep raw object if parsing fails */ }
      }
      if (parsed && typeof parsed === 'object') {
        // Save to cache for next load
        localStorage.setItem("resume-data-cache", JSON.stringify(parsed));
        
        setData((prev) => {
          const next = { 
            ...prev, 
            ...parsed, 
            personal: { ...prev.personal, ...(parsed.personal || {}) } 
          };
          ['education', 'experience', 'projects', 'certifications', 'achievements', 'skills'].forEach(f => {
             if (!next[f] || !Array.isArray(next[f])) next[f] = prev[f] || [];
          });
          return next;
        });
      }
    }
  };

  // Check auth and load saved resume
  useEffect(() => {
    let isMounted = true;

    // 1. Initial manual check & Cache Restore
    (async () => {
      // Immediate Cache Restore for "Instant Load" feel
      const cache = localStorage.getItem("resume-data-cache");
      if (cache) {
        try {
          const parsedCache = JSON.parse(cache);
          if (parsedCache && typeof parsedCache === 'object') {
             setData(prev => ({ ...prev, ...parsedCache }));
          }
        } catch { /* ignore invalid local cache */ }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchResumeFromDB(session.user.id);
      }
    })();

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
           await fetchResumeFromDB(session.user.id);
        }
      } else {
        // Any state where user is missing should clear the sensitive data
        setUser(null);
        setData(initialData);
        localStorage.removeItem("resume-data-cache");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSaveToDb = async () => {
    if (!user) {
      alert("Please sign in or create an account to save your resume seamlessly.");
      return;
    }
    if (isSaving) return; // Prevent multiple concurrent clicks

    setIsSaving(true);
    try {
      // Create a 10-second timeout promise to prevent infinite freezes
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network Timeout: Request took more than 10 seconds")), 10000));
      
      // Upsert the data explicitly and ask for the row back (.select()) to guarantee it was written
      const savePromise = supabase.from('resume_data').upsert({
        user_id: user.id,
        resume_data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).select();

      const { data: savedRows, error } = await Promise.race([savePromise, timeoutPromise]);

      if (error) {
         throw error;
      }
      
      // If no error but no rows returned, RLS physically blocked the write
      if (!savedRows || savedRows.length === 0) {
         throw new Error("Supabase returned no updated rows. Database RLS policy likely rejected the update.");
      }

      // Update cache on success
      localStorage.setItem("resume-data-cache", JSON.stringify(data));

      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Err: " + (err.message || "Failed"));
      setTimeout(() => setSaveMessage(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Load fonts on mount and when changed
  useEffect(() => { loadFont(headingFont); loadFont(bodyFont); }, []);
  useEffect(() => { loadFont(headingFont); localStorage.setItem("resume-heading-font", headingFont.id); }, [headingFont]);
  useEffect(() => { loadFont(bodyFont); localStorage.setItem("resume-body-font", bodyFont.id); }, [bodyFont]);
  useEffect(() => { window.__resumeHeadingFont = headingFont; window.__resumeBodyFont = bodyFont; }, [headingFont, bodyFont]);

  // Open JD or Upload panel if coming from home page buttons
  useEffect(() => {
    if (location.state?.openJDPanel) {
      navigate("/jd-match", { replace: true });
      window.history.replaceState({}, document.title);
    }
    if (location.state?.openUpload) {
      setShowUpload(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  const [showJD, setShowJD] = useState(false);
  const previewRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [resumeFontSize, setResumeFontSize] = useState(9);
  const [resumeLineHeight, setResumeLineHeight] = useState(1.45);
  const [template5Preview, setTemplate5Preview] = useState({ pdfUrl: null, isCompiling: false, errors: [], latexCode: "" });
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const [formWidth, setFormWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileTab, setMobileTab] = useState("form"); // "form" | "preview" | "sections"
  const [sectionDrawerOpen, setSectionDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [clJD, setClJD] = useState("");
  const [clTone, setClTone] = useState("Professional");
  const [clLength, setClLength] = useState("Medium");
  const [clHiringManager, setClHiringManager] = useState("");
  const [clCompany, setClCompany] = useState("");
  const [clJobTitle, setClJobTitle] = useState("");
  const [detectedJobTitle, setDetectedJobTitle] = useState("");
  const [clLoading, setClLoading] = useState(false);
  const [clError, setClError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [clTemplate, setClTemplate] = useState("classic");
  const [showClFontPanel, setShowClFontPanel] = useState(false);
  const [clFontSize, setClFontSize] = useState(11);
  const [clLineHeight, setClLineHeight] = useState(1.6);
  const [clEditMode, setClEditMode] = useState(false);
  const [clCopied, setClCopied] = useState(false);
  const [clDownloading, setClDownloading] = useState(false);
  const [clHeadingFont, setClHeadingFont] = useState("Georgia");
  const [clBodyFont, setClBodyFont] = useState("Arial");
  const resumeScore = calculateResumeScore(data, { parseMeta, aiReview: resumeAiReview });
  const jdScore = jdState.analysis ? calculateJDScore(data, jdState.analysis) : null;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  useEffect(() => {
    if (jdState.analysis?.jobTitle) {
      setDetectedJobTitle(jdState.analysis.jobTitle);
    }
  }, [jdState.analysis]);

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
  const handleParsed = useCallback((parsed, nextParseMeta) => {
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
      if (parsed.achievements?.some(a => a.title)) merged.achievements = parsed.achievements;

      return merged;
    });
    setParseMeta(nextParseMeta || { source: "upload", extractedTextLength: 0 });
    setActiveSection("personal");
  }, []);

  useEffect(() => {
    const snapshot = buildResumeSnapshot(data);
    const enoughContent = snapshot.wordCount >= 120 && (snapshot.expEntries.some(e => e.role) || snapshot.projectEntries.some(p => p.name));
    if (!enoughContent) {
      setResumeAiReview(null);
      setResumeAiStatus("idle");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setResumeAiStatus("loading");
        const resp = await fetch("/api/groq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: "You are a resume language reviewer. Return only JSON. Review clarity and specificity of resume writing. Never return a final ATS score."
              },
              {
                role: "user",
                content: `Review this resume and return JSON using this exact shape:
{
  "clarityScore": 0,
  "specificityScore": 0,
  "reason": "One short sentence",
  "notes": ["Short note 1", "Short note 2"]
}

Rules:
- clarityScore and specificityScore must be numbers from 0 to 10
- reward strong clarity, specificity, and recruiter readability
- penalize vague, repetitive, generic, or buzzword-heavy language
- keep reason short and factual
- do not invent facts
- return JSON only

RESUME:
${snapshot.fullText}`
              }
            ]
          })
        });
        if (!resp.ok) throw new Error("AI review failed");
        const json = await resp.json();
        const payload = json.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(payload);
        if (!cancelled) {
          setResumeAiReview(formatResumeReviewPayload(parsed));
          setResumeAiStatus("done");
        }
      } catch {
        if (!cancelled) {
          setResumeAiReview(null);
          setResumeAiStatus("error");
        }
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data]);

  const generateSummary = async () => {
    setAiLoading(true); setAiError("");
    try {
      const expText = data.experience.filter(e => e.role).map(e => `${e.role} at ${e.company}: ${e.bullets?.join(", ")}`).join("; ");
      const skillText = data.skills.filter(s => s.items).map(s => `${s.category}: ${s.items}`).join("; ");
      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", max_tokens: 1000,
          messages: [{ role: "system", content: "You are a professional resume writer. Write concise, ATS-friendly summaries." }, { role: "user", content: `Write a professional resume summary (2-3 sentences, ATS-friendly) for:\nName: ${data.personal.name || "Professional"}\nTitle: ${data.personal.title || ""}\nExperience: ${expText || "fresher"}\nSkills: ${skillText}\nKeep it concise, impactful, avoid first-person. Output only the summary text.` }]
        })
      });
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || "";
      if (text) update("summary", text); else setAiError("Could not generate. Try again.");
    } catch { setAiError("AI request failed."); }
    setAiLoading(false);
  };

  const generateCoverLetter = async () => {
    if (!clJD.trim()) {
      setClError("Please paste a job description first.");
      return;
    }
    setClLoading(true);
    setClError("");
    try {
      const snapshot = buildResumeSnapshot(data);
      const resp = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 1400,
          messages: [
            {
              role: "system",
              content: "You write concise, ATS-aware cover letters. Return only the letter text."
            },
            {
              role: "user",
              content: `Write a ${clTone.toLowerCase()} cover letter of ${clLength.toLowerCase()} length for this role.

Candidate name: ${data.personal.name || "Candidate"}
Target title: ${clJobTitle || detectedJobTitle || data.personal.title || ""}
Company: ${clCompany || "the company"}
Hiring manager: ${clHiringManager || "Hiring Manager"}

RESUME:
${snapshot.fullText}

JOB DESCRIPTION:
${clJD}`
            }
          ]
        })
      });
      if (!resp.ok) throw new Error(await getSafeAIMessageFromResponse(resp, "Cover letter generation is temporarily unavailable. Please try again in a few minutes."));
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || "";
      setCoverLetter(text.trim());
      if (!clJobTitle && detectedJobTitle) setClJobTitle(detectedJobTitle);
    } catch (err) {
      setClError(getSafeAIMessageFromError(err, "Cover letter generation is temporarily unavailable. Please try again in a few minutes."));
    } finally {
      setClLoading(false);
    }
  };

  const handleCopyCL = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setClCopied(true);
      setTimeout(() => setClCopied(false), 1800);
    } catch {
      setClCopied(false);
    }
  };

  const downloadCoverLetterPDF = async () => {
    if (!coverLetter) return;
    setClDownloading(true);
    try {
      const node = document.createElement("div");
      node.style.cssText = "position:absolute;left:0;top:0;width:794px;background:#fff;z-index:-9999;pointer-events:none;";
      node.innerHTML = `<div style="padding:36px;font-family:${clBodyFont};font-size:${clFontSize}pt;line-height:${clLineHeight};color:#111827;background:#ffffff;">
        <div style="font-family:${clHeadingFont};font-size:24pt;font-weight:700;margin-bottom:8px;">${data.personal.name || "Your Name"}</div>
        <div style="font-size:10pt;color:#64748b;margin-bottom:18px;">${[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" · ")}</div>
        <div style="white-space:pre-wrap;">${cleanCoverLetter(coverLetter, data.personal.name)}</div>
      </div>`;
      document.body.appendChild(node);
      await new Promise(r => setTimeout(r, 300));
      const el = node.firstElementChild || node;
      await exportCoverLetterPDF(el, `Cover_Letter_${(data.personal.name || "Resume").replace(/\s+/g, "_")}.pdf`);
      document.body.removeChild(node);
    } catch {
      setClError("Could not export the cover letter PDF.");
    } finally {
      setClDownloading(false);
    }
  };

  const activeTemplateLabel = activeTemplate === "A" ? "Classic" : activeTemplate === "B" ? "Modern" : activeTemplate === "C" ? "Minimal" : activeTemplate === "4" ? "Template 4" : "Template 5";

  const handleResumeDownload = async () => {
    if (isPdfDownloading) return;
    setIsPdfDownloading(true);
    try {
      if (activeTemplate === "5") {
        if (!template5Preview.pdfUrl) return;
        const link = document.createElement("a");
        link.href = template5Preview.pdfUrl;
        link.download = `${data.personal.name || "Resume"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return;
      }

      await exportPDF(previewRef, data.personal.name);
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setIsPdfDownloading(false);
    }
  };




  const sideNav = [
    { id: "personal", label: "Personal", icon: icons.user },
    { id: "summary", label: "Summary", icon: icons.layers },
    { id: "skills", label: "Skills", icon: icons.code },
    { id: "education", label: "Education", icon: icons.book },
    { id: "experience", label: "Experience", icon: icons.briefcase },
    { id: "projects", label: "Projects", icon: icons.globe },
    { id: "certifications", label: "Certs", icon: icons.award },
    { id: "achievements", label: "Awards", icon: icons.award },
  ];

  const IS = { width: "100%", padding: "11px 14px", background: "#f8fafc", border: `1px solid #cbd5e1`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "all 0.2s ease", boxShadow: "inset 0 3px 6px rgba(0,0,0,0.06), inset 0 0 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.8)" };
  const CS = { background: "#ffffff", border: `1px solid #e2e8f0`, borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.02)" };

  return (
    <div className="rb-layout" style={{ display: "flex", height: "100vh", background: C.appBg, fontFamily: "'Sora', sans-serif", overflow: "hidden", position: "relative" }}>
      {/* Loading Overlay for Initial Fetch */}
      {isFetching && !data.personal.name && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ width: 44, height: 44, border: `3.5px solid ${C.accentLight}`, borderTop: `3.5px solid ${C.accent}`, borderRadius: "50%", animation: "resume-fetch-spin 1s linear infinite", marginBottom: 18 }} />
          <style>{`@keyframes resume-fetch-spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, letterSpacing: 0.5 }}>Syncing your resume...</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontWeight: 500 }}>Connecting to secure database</div>
        </div>
      )}

      {/* Mobile tab visibility */}
      <style>{`
        @media (max-width: 640px) {
          .rb-form-panel { display: ${mobileTab === "preview" ? "none" : "flex"} !important; }
          .rb-preview-panel { display: ${mobileTab === "preview" ? "flex" : "none"} !important; }
          .rb-resizer { display: none !important; }
        }
      `}</style>

      {showJD && <JDAnalyzerModal onClose={() => setShowJD(false)} data={data} setData={setData} jdState={jdState} setJdState={setJdState} jdScore={jdScore} resumeScore={resumeScore} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onParsed={handleParsed} />}
      {showTemplateModal && <TemplateModal onClose={() => setShowTemplateModal(false)} activeTemplate={activeTemplate} onSelect={setActiveTemplate} />}

      {/* ── Mobile ATS strip (tablet/mobile) ── */}
      <div className="rb-mobile-ats">
        <svg width={14} height={14} viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#e5e7eb" strokeWidth="3"/><circle cx="18" cy="18" r="15.9" fill="transparent" stroke={C.accent} strokeWidth="3" strokeDasharray={`${resumeScore.overall}, 100`} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}/></svg>
        ATS Score: <span style={{ fontSize: 13, color: resumeScore.overall >= 75 ? "#15803d" : resumeScore.overall >= 50 ? "#b45309" : "#b91c1c" }}>{resumeScore.overall}/100</span>
        {resumeScore.tips.length > 0 && <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>· {resumeScore.tips[0]}</span>}
      </div>

      {/* ── Sidebar with Icons + Labels ── */}
      <div className="rb-sidebar" style={{ width: 200, background: C.sidebarBg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, gap: 2, boxShadow: "1px 0 4px rgba(0,0,0,0.02)", fontFamily: "'Sora', sans-serif", zIndex: 10 }}>

        {/* ATS Score Circular */}
        <div className="rb-ats-score" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#000", letterSpacing: 1.2, marginBottom: 10, marginTop: -12 }} className="rb-ats-label">ATS SCORE</div>
          <div style={{ background: "#ffffff", border: `1.5px solid ${C.accentBorder}`, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(107,77,176,0.08)", width: "88%", boxSizing: "border-box" }}>
            <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="2.5"></circle>
                <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke={C.accent} strokeWidth="2.5" strokeDasharray={`${resumeScore.overall}, 100`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }}></circle>
              </svg>
              <div style={{ position: "absolute", fontSize: 24, fontWeight: 900, color: "#000" }}>{resumeScore.overall}</div>
            </div>
            <button onClick={() => setShowTips(!showTips)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.info} /></svg> {resumeScore.label} · {resumeAiStatus === "loading" ? "checking..." : "score details"}
            </button>
          </div>
          {showTips && (
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.border}`, width: "90%", boxSizing: "border-box", fontSize: 10 }}>
              <div style={{ display: "grid", gap: 4, marginBottom: resumeScore.tips.length ? 8 : 0 }}>
                {[
                  ["Section Completeness", resumeScore.factors.sectionCompleteness],
                  ["Action & Evidence", resumeScore.factors.actionEvidence],
                  ["Keyword Spread", resumeScore.factors.keywordSpread],
                  ["ATS Parse Safety", resumeScore.factors.parseSafety],
                  ["Language Quality", resumeScore.factors.languageQuality],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#475569" }}>
                    <span>{label}</span><strong style={{ color: "#0f172a" }}>{value}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#475569", marginBottom: resumeScore.tips.length ? 8 : 0 }}>
                <span>Parse Confidence</span><strong style={{ color: "#0f172a" }}>{resumeScore.confidence}</strong>
              </div>
              {resumeScore.tips.map((t, i) => (
                <div key={i} style={{ color: "#92400e", marginBottom: 3, display: "flex", alignItems: "flex-start", gap: 5, lineHeight: 1.3 }}>
                  <span style={{ fontSize: 10 }}>⚡</span><span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {jdScore && (
          <div className="rb-ats-score" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#000", letterSpacing: 1.2, marginBottom: 10, marginTop: -12 }} className="rb-ats-label">JD MATCH</div>
            <div style={{ background: "#ffffff", border: "1.5px solid rgba(37,99,235,0.18)", borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(37,99,235,0.08)", width: "88%", boxSizing: "border-box" }}>
              <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="2.5"></circle>
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#2563eb" strokeWidth="2.5" strokeDasharray={`${jdScore.overall}, 100`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }}></circle>
                </svg>
                <div style={{ position: "absolute", fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{jdScore.overall}</div>
              </div>
              <button onClick={() => navigate("/jd-match")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.info} /></svg> {jdScore.label}
              </button>
            </div>
          </div>
        )}
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
      <div className="rb-form-panel" style={{ width: formWidth, flexShrink: 0, background: C.panelBg, borderRight: `none`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header with Upload button */}
        <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.border}`, fontFamily: "'Sora', sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>ATS<em style={{ color: C.accent, fontStyle: "normal" }}>Forge</em></div>
            </div>
            <div style={{ display: "flex", gap: 6 }} className="rb-form-header-buttons">
              {/* Save Button */}
              <button onClick={handleSaveToDb} disabled={isSaving}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: `1.5px solid ${C.inputBorder}`, borderRadius: 8, color: C.textMuted, fontSize: 11, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1, transition: "all 0.2s" }}>
                {isSaving ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                ) : saveMessage === "Saved!" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : saveMessage.startsWith("Err:") ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                )} {saveMessage || "Save"}
              </button>
              {/* Match JD button */}
              <button onClick={() => navigate("/jd-match")}
                style={{ display: "flex", alignItems: "center", gap: 7, minHeight: 34, padding: "8px 14px", background: "#fff", border: `1.5px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Match JD
              </button>
              {/* Upload Resume button */}
              <button onClick={() => setShowUpload(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, minHeight: 34, padding: "8px 14px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.upload} /></svg>
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
          {activeSection === "achievements" && <AchievementsForm achievements={data.achievements} setData={setData} IS={IS} CS={CS} />}
          {activeSection === "coverLetter" && <CoverLetterForm clJD={clJD} setClJD={setClJD} clTone={clTone} setClTone={setClTone} clLength={clLength} setClLength={setClLength} clHiringManager={clHiringManager} setClHiringManager={setClHiringManager} clCompany={clCompany} setClCompany={setClCompany} clJobTitle={clJobTitle} setClJobTitle={setClJobTitle} detectedJobTitle={detectedJobTitle} clLoading={clLoading} clError={clError} onGenerate={generateCoverLetter} IS={IS} />}
        </div>
      </div>

      {/* ── Resizer ── */}
      <div
        className="rb-resizer"
        onMouseDown={() => setIsDragging(true)}
        style={{ width: 6, background: isDragging ? C.accent : C.border, cursor: "col-resize", zIndex: 10, transition: "background 0.2s" }}
        onMouseEnter={(e) => { if (!isDragging) e.target.style.background = C.accentLight; }}
        onMouseLeave={(e) => { if (!isDragging) e.target.style.background = C.border; }}
      />

      {/* ── Preview Panel ── */}
      <div className="rb-preview-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

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

                  <div style={{ display: "flex", gap: 24 }} className="rb-font-cols">
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

                    <div className="rb-font-divider" style={{ width: 1, background: "linear-gradient(180deg, transparent, rgba(203, 213, 225, 0.6), transparent)" }} />

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
            <style>{`@keyframes resume-pdf-spin { to { transform: rotate(360deg); } }`}</style>
            {/* Toolbar */}
            <div className="rb-toolbar" style={{ padding: "9px 18px", background: C.toolbarBg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setShowTemplateModal(true)}
                style={{ padding: "10px 18px", border: "1px solid rgba(107,77,176,0.20)", borderRadius: 14, cursor: "pointer", fontSize: 13, fontWeight: 800, background: "linear-gradient(180deg, #ffffff 0%, #f7f1ff 58%, #f0e6ff 100%)", color: "#5b3ea6", transition: "all 0.18s ease", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 24px rgba(107,77,176,0.12), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -3px 8px rgba(107,77,176,0.08), 0 2px 0 rgba(107,77,176,0.10)" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                {activeTemplateLabel}
              </button>
              <div style={{ flex: 1 }} />

              {/* Font Picker */}
              <div style={{ position: "relative" }} className="rb-font-panel-wrap-trigger">
                <button disabled={activeTemplate === "5"} onClick={() => setShowFontPanel(!showFontPanel)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: showFontPanel ? C.accentLight : "#fff", border: showFontPanel ? `1.5px solid ${C.accentBorder}` : `1.5px solid ${C.border}`, borderRadius: 8, cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 11, fontWeight: 600, color: showFontPanel ? C.accent : C.textLight, transition: "all 0.15s" }}>
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

              {/* Font Size Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
                <button disabled={activeTemplate === "5"} onClick={() => setResumeFontSize(v => Math.max(8, v - 0.5))} style={{ width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 14, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600, minWidth: 28, textAlign: "center", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{resumeFontSize}pt</span>
                <button disabled={activeTemplate === "5"} onClick={() => setResumeFontSize(v => Math.min(14, v + 0.5))} style={{ width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 14, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>

              {/* Line Spacing Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 6 }}>
                <span style={{ fontSize: 11, color: C.textLight, opacity: activeTemplate === "5" ? 0.5 : 1 }}>Spacing</span>
                {[1.5, 1.8, 2].map(lh => (
                  <button key={lh} disabled={activeTemplate === "5"} onClick={() => setResumeLineHeight(lh)} style={{ padding: "4px 8px", background: resumeLineHeight === lh ? C.accentLight : "#fff", border: `1px solid ${resumeLineHeight === lh ? C.accent : C.border}`, borderRadius: 5, color: resumeLineHeight === lh ? C.accent : C.textMuted, fontSize: 11, cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{lh}</button>
                ))}
              </div>

              <div style={{ width: 1, background: C.border, height: 24, margin: "0 4px" }} />

              {/* Zoom Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 12 }}>
                <button disabled={activeTemplate === "5"} onClick={() => setZoom(z => Math.max(30, z - 10))}
                  style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  −
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, minWidth: 40, textAlign: "center", userSelect: "none", opacity: activeTemplate === "5" ? 0.5 : 1 }}>{zoom}%</span>
                <button disabled={activeTemplate === "5"} onClick={() => setZoom(z => Math.min(150, z + 10))}
                  style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff", cursor: activeTemplate === "5" ? "not-allowed" : "pointer", opacity: activeTemplate === "5" ? 0.5 : 1, fontSize: 16, fontWeight: 700, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  +
                </button>
              </div>
              {/* Export button */}
              <button disabled={aiLoading || isPdfDownloading || (activeTemplate === "5" && template5Preview.isCompiling)} onClick={handleResumeDownload}
                style={{ height: 32, padding: "0 14px", background: "linear-gradient(135deg, #7c5cbf, #6b4db0)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: isPdfDownloading ? "wait" : "pointer", boxShadow: "0 2px 8px rgba(107, 77, 176, 0.2)", opacity: isPdfDownloading ? 0.9 : 1 }}>
                {isPdfDownloading ? (
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", display: "inline-block", animation: "resume-pdf-spin 0.8s linear infinite" }} />
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.download} /></svg>
                )}
          {isPdfDownloading ? "Generating PDF..." : activeTemplate === "5" && template5Preview.isCompiling ? "Compiling..." : "PDF"}
              </button>
            </div>

            <div className="rb-preview-area" style={{ flex: 1, overflowY: "auto", background: C.previewBg, padding: "28px 0 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {activeTemplate === "5" ? (
                <Template5Preview data={data} onPreviewChange={setTemplate5Preview} />
              ) : (() => {
                const scale = windowWidth <= 640
                  ? Math.max(0.3, (windowWidth - 16) / PAGE_W)
                  : windowWidth <= 1024
                  ? Math.max(0.4, (windowWidth - 220) / PAGE_W)
                  : zoom / 100;
                const outerW = windowWidth <= 1024 ? Math.round(PAGE_W * scale) : PAGE_W;
                return (
                  <div style={{
                    width: outerW,
                    overflow: "visible",
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: "flex-start"
                  }}>
                    <div style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      width: PAGE_W,
                      marginBottom: `${PAGE_H * (scale - 1)}px`,
                      flexShrink: 0
                    }}>
                      <PaginatedResume
                        data={data}
                        template={activeTemplate}
                        exportRef={previewRef}
                        headingFont={headingFont}
                        bodyFont={bodyFont}
                        fontSize={resumeFontSize}
                        lineHeight={resumeLineHeight}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
      {/* ── Mobile Section Drawer ── */}
      <div className={`rb-section-drawer${sectionDrawerOpen ? " open" : ""}`}>
        {sideNav.map(s => (
          <button key={s.id}
            className={activeSection === s.id ? "active" : ""}
            onClick={() => { setActiveSection(s.id); setSectionDrawerOpen(false); setMobileTab("form"); }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="rb-bottom-nav">
        <button className={mobileTab === "form" ? "active" : ""} onClick={() => { setMobileTab("form"); setSectionDrawerOpen(false); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icons.file} /></svg>
          Edit
        </button>
        <button className={sectionDrawerOpen ? "active" : ""} onClick={() => { setSectionDrawerOpen(v => !v); setMobileTab("form"); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          Sections
        </button>
        <button className={mobileTab === "preview" ? "active" : ""} onClick={() => { setMobileTab("preview"); setSectionDrawerOpen(false); }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button onClick={handleResumeDownload} disabled={isPdfDownloading || (activeTemplate === "5" && template5Preview.isCompiling)}>
          {isPdfDownloading ? (
            <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", display: "inline-block", animation: "resume-pdf-spin 0.8s linear infinite" }} />
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icons.download} /></svg>
          )}
          {isPdfDownloading ? "Generating" : activeTemplate === "5" && template5Preview.isCompiling ? "Compiling" : "PDF"}
        </button>
      </nav>
    </div>
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
  // Use a safer lookup for the values
  const getValue = (path) => {
    const key = path.split(".")[1];
    return data[key] || "";
  };

  return (
    <div>
      <SH title="Personal Details" icon={icons.user} />
      {[["Full Name", "personal.name", "Anshu Prasad"], ["Job Title", "personal.title", "Data Analyst | AI Automation"], ["Email", "personal.email", "you@email.com"], ["Phone", "personal.phone", "+91-9876543210"], ["Location", "personal.location", "Noida, India"]].map(([lbl, path, ph]) => (
        <div key={path} style={{ marginBottom: 9 }}><FL>{lbl}</FL><input value={getValue(path)} onChange={e => update(path, e.target.value)} placeholder={ph} style={IS} /></div>
      ))}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 6 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.accent, marginBottom: 8 }}>🔗 Links <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 10 }}>(clickable in resume)</span></div>
        {[["LinkedIn URL *", "personal.linkedin", "https://linkedin.com/in/yourname"], ["GitHub URL", "personal.github", "https://github.com/yourname"], ["Portfolio URL", "personal.portfolio", "https://yourportfolio.com"]].map(([lbl, path, ph]) => (
          <div key={path} style={{ marginBottom: 9 }}><FL>{lbl}</FL><input value={getValue(path)} onChange={e => update(path, e.target.value)} placeholder={ph} style={IS} /></div>
        ))}
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: -2 }}>LinkedIn is required for full Section Completeness score. GitHub and Portfolio remain optional.</div>
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
          {[["Job Title / Role", "role"], ["Company", "company"], ["Location", "location"], ["Duration", "duration"], ["Certification URL", "link"]].map(([lbl, k]) => (
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={e[k] || ""} onChange={el => upd(i, k, el.target.value)} placeholder={k === "duration" ? "Jan 2025 - Present" : k === "link" ? "https://..." : ""} style={IS} /></div>
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
            <div key={k} style={{ marginBottom: 7 }}><FL>{lbl}</FL><input value={proj[k] || ""} onChange={e => upd(i, k, e.target.value)} style={IS} /></div>
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

function AchievementsForm({ achievements, setData, IS, CS }) {
  const update = (idx, field, val) => setData(prev => {
    const a = [...prev.achievements]; a[idx] = { ...a[idx], [field]: val }; return { ...prev, achievements: a };
  });
  const add = () => setData(prev => ({ ...prev, achievements: [...prev.achievements, { title: "", url: "" }] }));
  const remove = (idx) => setData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== idx) }));
  return (
    <div>
      <SH title="Achievements & Awards" icon={icons.award} />
      {achievements.map((a, i) => (
        <div key={i} style={CS}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Achievement #{i + 1}</span>
            {achievements.length > 1 && <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Remove</button>}
          </div>
          <FL>Achievement / Award Title</FL>
          <input value={a.title} onChange={e => update(i, "title", e.target.value)} placeholder="e.g. Winner of Smart India Hackathon 2024" style={IS}
            onFocus={e => { e.currentTarget.style.border = "1px solid #000000"; e.currentTarget.style.background = "#ffffff"; }}
            onBlur={e => { e.currentTarget.style.border = `1px solid ${C.inputBorder}`; e.currentTarget.style.background = "#f8f9fa"; }} />
          <div style={{ height: 10 }} />
          <FL>URL / Certificate Link (Optional)</FL>
          <input value={a.url || ""} onChange={e => update(i, "url", e.target.value)} placeholder="https://certificate-link.com" style={IS}
            onFocus={e => { e.currentTarget.style.border = "1px solid #000000"; e.currentTarget.style.background = "#ffffff"; }}
            onBlur={e => { e.currentTarget.style.border = `1px solid ${C.inputBorder}`; e.currentTarget.style.background = "#f8f9fa"; }} />
        </div>
      ))}
      <AB onClick={add} label="Add Achievement" />
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
        {clLoading ? <><span>⏳</span> Creating your cover letter...</> : <><span>✨</span> Generate Professional Cover Letter</>}
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

  const loadingEl = <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize + 1}pt`, color: "#9aa3af", fontStyle: "italic", textAlign: "center", paddingTop: 60, lineHeight: 2 }}>✨ AI is crafting your cover letter...</div>;
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
