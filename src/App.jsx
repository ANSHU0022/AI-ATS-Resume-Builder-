import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import html2pdf from "html2pdf.js";
import * as pdfjsLib from "pdfjs-dist";
// Use Vite's ?url syntax to get the worker path statically
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

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
};

// ── Design Tokens ──────────────────────────────────────────────────────────────
const C = {
  appBg: "#f5f7fa", sidebarBg: "#ffffff", panelBg: "#ffffff",
  toolbarBg: "#ffffff", previewBg: "#d8dde6", cardBg: "#f9fafb",
  atsBg: "#f0f7ff", border: "#e3e8ef", cardBorder: "#e5e9f0",
  text: "#1a2332", textMuted: "#6b7688", textLight: "#9aa3af",
  inputBg: "#ffffff", inputBorder: "#d5dae3",
  accent: "#2563eb", accentLight: "#eff6ff", accentBorder: "#bfdbfe",
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
function RS({ title, children, accent = "#1a1a1a" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {/* Ensure the heading doesn't stick to the bottom of the page if the content moves to next page */}
      <div style={{ fontSize: "10pt", fontWeight: 700, letterSpacing: 0.5, borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 5, pageBreakAfter: "avoid", breakAfter: "avoid" }}>{title}</div>
      <div style={{ fontSize: "9.5pt" }}>{children}</div>
    </div>
  );
}
function SS({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "8pt", letterSpacing: 2, color: "#64748b", marginBottom: 6, fontWeight: 700, pageBreakAfter: "avoid", breakAfter: "avoid" }}>{title}</div>
      {children}
    </div>
  );
}
function MH({ title }) {
  return <div style={{ fontSize: "8pt", fontWeight: 700, letterSpacing: 2, color: "#888", marginBottom: 4, marginTop: 10, borderBottom: "1px solid #ddd", paddingBottom: 3 }}>{title}</div>;
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

  await html2pdf().set(opt).from(node).save();
}

// ── PAGINATED RESUME WRAPPER ──────────────────────────────────────────────────
const PAGE_W = 794;  // 210mm
const PAGE_H = 1123; // 297mm A4 pixel height

function PaginatedResume({ data, template, exportRef }) {
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
          <TemplateComp data={data} />
        </div>
      </div>

      {/* Hidden measuring container */}
      <div style={{ position: "fixed", top: 0, left: -9999, width: PAGE_W, pointerEvents: "none", zIndex: -1 }}>
        <div ref={measureRef} className="resume-container">
          <TemplateComp data={data} />
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
                    <TemplateComp data={data} />
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
function TemplateA({ data }) {
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontFamily: "'Calibri', sans-serif", fontSize: "10pt", color: "#1a1a1a", padding: "28px 32px", lineHeight: 1.45, background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        {p.name && <div style={{ fontSize: "22pt", fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{p.name}</div>}
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
      {summary && <RS title="SUMMARY"><p style={{ margin: 0 }}>{summary}</p></RS>}
      {education.some(e => e.degree) && (
        <RS title="EDUCATION">
          {education.filter(e => e.degree).map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.institution}</strong><span style={{ color: "#555", fontSize: "9pt" }}>{e.location}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><em>{e.degree}{e.cgpa ? ` - CGPA: ${e.cgpa}` : ""}</em><span style={{ color: "#555", fontSize: "9pt" }}>{e.year}</span></div>
            </div>
          ))}
        </RS>
      )}
      {skills.some(s => s.items) && (
        <RS title="TECHNICAL SKILLS">
          {skills.filter(s => s.items).map((s, i) => (
            <div key={i} style={{ marginBottom: 3 }}><strong>{s.category}:</strong> {s.items}</div>
          ))}
        </RS>
      )}
      {experience.some(e => e.role) && (
        <RS title="EXPERIENCE">
          {experience.filter(e => e.role).map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.company}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><em>Role - {e.role}</em><span style={{ fontSize: "9pt", color: "#555" }}>{e.location}</span></div>
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
        <RS title="PROJECTS">
          {projects.filter(p => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>
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
        <RS title="CERTIFICATIONS">
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
      {hobbies && <RS title="HOBBIES & INTERESTS"><p style={{ margin: 0 }}>{hobbies}</p></RS>}
    </div>
  );
}

// ── Template B (Modern Sidebar) ───────────────────────────────────────────────
function TemplateB({ data }) {
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontFamily: "'Georgia', serif", fontSize: "10pt", color: "#1a1a1a", background: "#fff", display: "flex", minHeight: "100%" }}>
      <div style={{ width: "32%", background: "#2c3e50", color: "#ecf0f1", padding: "28px 16px" }}>
        {p.name && <div style={{ fontSize: "15pt", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.name}</div>}
        {p.title && <div style={{ fontSize: "9pt", color: "#bdc3c7", marginBottom: 16 }}>{p.title}</div>}
        <SS title="CONTACT">
          {p.email && <div style={{ fontSize: "8.5pt", marginBottom: 4, wordBreak: "break-all" }}>{p.email}</div>}
          {p.phone && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.phone}</div>}
          {p.location && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}>{p.location}</div>}
          {p.linkedin && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>LinkedIn</a></div>}
          {p.github && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.github.startsWith("http") ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>Github</a></div>}
          {p.portfolio && <div style={{ fontSize: "8.5pt", marginBottom: 4 }}><a href={p.portfolio.startsWith("http") ? p.portfolio : `https://${p.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: "#7fb3d3", textDecoration: "underline" }}>Portfolio</a></div>}
        </SS>
        {skills.some(s => s.items) && (
          <SS title="SKILLS">
            {skills.filter(s => s.items).map((s, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: "8pt", color: "#bdc3c7", marginBottom: 2 }}>{s.category.toUpperCase()}</div>
                <div>{s.items.split(",").map((sk, j) => <span key={j} style={{ display: "inline-block", background: "#3d5166", borderRadius: 3, padding: "1px 6px", margin: "2px 2px", fontSize: "8pt" }}>{sk.trim()}</span>)}</div>
              </div>
            ))}
          </SS>
        )}
        {certifications.some(c => c.name) && (
          <SS title="CERTIFICATIONS">
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
        {hobbies && <SS title="HOBBIES"><div style={{ fontSize: "9pt", lineHeight: 1.6 }}>{hobbies}</div></SS>}
      </div>
      <div style={{ flex: 1, padding: "28px 24px" }}>
        {summary && <RS title="PROFILE" accent="#2c3e50">{summary}</RS>}
        {education.some(e => e.degree) && (
          <RS title="EDUCATION" accent="#2c3e50">
            {education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.institution}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.year}</span></div>
                <div>{e.degree}{e.cgpa ? ` • CGPA: ${e.cgpa}` : ""}</div>
              </div>
            ))}
          </RS>
        )}
        {experience.some(e => e.role) && (
          <RS title="EXPERIENCE" accent="#2c3e50">
            {experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.role}</strong><span style={{ fontSize: "9pt", color: "#555" }}>{e.duration}</span></div>
                <div style={{ color: "#2c3e50", fontStyle: "italic" }}>{e.company}{e.location ? ` · ${e.location}` : ""}</div>
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
          <RS title="PROJECTS" accent="#2c3e50">
            {projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <strong>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>{proj.tech && <span style={{ fontSize: "9pt", color: "#555" }}> · {proj.tech}</span>}
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
function TemplateC({ data }) {
  const { personal: p, summary, skills, education, experience, projects, certifications, hobbies } = data;
  return (
    <div style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "9.5pt", color: "#111", padding: "24px 36px", background: "#fff" }}>
      {p.name && <div style={{ fontSize: "24pt", fontWeight: 900, borderBottom: "3px solid #111", paddingBottom: 6, marginBottom: 4 }}>{p.name}</div>}
      {p.title && <div style={{ fontSize: "11pt", color: "#555", marginBottom: 8 }}>{p.title}</div>}
      <div style={{ fontSize: "8.5pt", color: "#444", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        {p.linkedin && <a href={p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>LinkedIn</a>}
        {p.github && <a href={p.github.startsWith("http") ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>Github</a>}
        {p.portfolio && <a href={p.portfolio.startsWith("http") ? p.portfolio : `https://${p.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>Portfolio</a>}
      </div>
      {summary && <><MH title="SUMMARY" /><p style={{ margin: "0 0 10px 0", borderLeft: "3px solid #111", paddingLeft: 10 }}>{summary}</p></>}
      {skills.some(s => s.items) && (<><MH title="SKILLS" />{skills.filter(s => s.items).map((s, i) => <div key={i} style={{ marginBottom: 3 }}><strong>{s.category}:</strong> {s.items}</div>)}<div style={{ marginBottom: 10 }} /></>)}
      {experience.some(e => e.role) && (<><MH title="EXPERIENCE" />{experience.filter(e => e.role).map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span><strong>{e.role}</strong> @ {e.company}</span><strong>{e.duration}</strong></div>
          {e.bullets?.filter(b => b?.trim()).map((b, j) => <div key={j} style={{ paddingLeft: 12 }}>• {b}</div>)}
        </div>
      ))}</>)}
      {education.some(e => e.degree) && (<><MH title="EDUCATION" />{education.filter(e => e.degree).map((e, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.institution}</strong><span>{e.year}</span></div>
          <div>{e.degree}{e.cgpa ? ` — CGPA: ${e.cgpa}` : ""}</div>
        </div>
      ))}</>)}
      {projects.some(p => p.name) && (<><MH title="PROJECTS" />{projects.filter(p => p.name).map((proj, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <strong>{proj.link ? <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "none" }}>{proj.name}</a> : proj.name}</strong>{proj.tech ? ` [${proj.tech}]` : ""}
          {proj.bullets?.filter(b => b?.trim()).map((b, j) => <div key={j} style={{ paddingLeft: 12 }}>• {b}</div>)}
        </div>
      ))}</>)}
      {certifications.some(c => c.name) && (<><MH title="CERTIFICATIONS" />{certifications.filter(c => c.name).map((c, i) => (
        <div key={i} style={{ marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
          <span>
            {c.link ? <a href={c.link.startsWith("http") ? c.link : `https://${c.link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>{c.name}</a> : c.name}
            {c.issuer ? ` — ${c.issuer}` : ""}
          </span>
          {c.year && <span>{c.year}</span>}
        </div>
      ))}</>)}
      {hobbies && <><MH title="HOBBIES" /><div>{hobbies}</div></>}
    </div>
  );
}

// ── UPLOAD MODAL ──────────────────────────────────────────────────────────────
// ── Groq API key (persisted in memory for session) ────────────────────────────
const GROQ_API_KEY = ""; // Set via environment variable on server-side

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
    const key = GROQ_API_KEY;
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
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Groq API error ${resp.status}. Please try again.`);
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
              Powered by <span style={{ fontWeight: 700, color: "#f55036" }}>Groq</span> · LLaMA 3.3 70B · Ultra-fast parsing
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
            onClick={() => !isBusy && inputRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? C.accent : file ? "#22c55e" : C.inputBorder}`, borderRadius: 12, padding: "24px 20px", textAlign: "center", background: dragging ? C.accentLight : file ? "#f0fdf4" : "#fafafa", cursor: isBusy ? "default" : "pointer", transition: "all 0.2s", marginBottom: 14 }}>
            <input ref={inputRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{(file.size / 1024).toFixed(1)} KB · {!isBusy && "Click to change"}</div>
              </div>
            ) : (
              <div>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" style={{ margin: "0 auto 8px" }}><path d={icons.upload} /></svg>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>Drag & drop your resume here</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>or click to browse</div>
                <span style={{ fontSize: 11, color: C.textLight, background: "#f3f4f6", borderRadius: 6, padding: "3px 10px" }}>PDF · TXT · DOC · DOCX</span>
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
              style={{ flex: 2, padding: "9px 16px", background: canParse ? "#f55036" : "#e5e7eb", border: `1.5px solid ${canParse ? "#f55036" : "#e5e7eb"}`, borderRadius: 8, color: canParse ? "#fff" : "#9ca3af", fontSize: 13, fontWeight: 700, cursor: canParse ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.upload} /></svg>
              {isBusy ? "Working…" : status === "done" ? "✓ Done!" : "Parse with Groq ⚡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Routing Wrapper ───────────────────────────────────────────────────────────
import HomePage from './HomePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/builder" element={<ResumeBuilder />} />
    </Routes>
  );
}

// ── Resume Builder Page ──────────────────────────────────────────────────────
function ResumeBuilder() {
  const [data, setData] = useState(initialData);
  const [activeSection, setActiveSection] = useState("personal");
  const [activeTemplate, setActiveTemplate] = useState("A");
  const [ats, setAts] = useState({ score: 0, tips: [] });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const previewRef = useRef(null);
  const [numPages, setNumPages] = useState(1);
  const [zoom, setZoom] = useState(80);

  const [formWidth, setFormWidth] = useState(330);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      let w = e.clientX - 58;
      if (w < 250) w = 250;
      if (w > 800) w = 800;
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
      // Personal
      Object.keys(parsed.personal || {}).forEach(k => {
        if (!merged.personal[k] && parsed.personal[k]) merged.personal[k] = parsed.personal[k];
      });
      if (!merged.summary && parsed.summary) merged.summary = parsed.summary;
      if (parsed.skills?.length) merged.skills = parsed.skills;
      if (parsed.education?.some(e => e.degree)) merged.education = parsed.education;
      if (parsed.experience?.some(e => e.role)) merged.experience = parsed.experience;
      if (parsed.projects?.some(p => p.name)) merged.projects = parsed.projects;
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
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Write a professional resume summary (2-3 sentences, ATS-friendly) for:\nName: ${data.personal.name || "Professional"}\nTitle: ${data.personal.title || ""}\nExperience: ${expText || "fresher"}\nSkills: ${skillText}\nKeep it concise, impactful, avoid first-person. Output only the summary text.` }]
        })
      });
      const json = await resp.json();
      const text = json.content?.[0]?.text || "";
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

  const IS = { width: "100%", padding: "7px 10px", background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 7, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box" };
  const CS = { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 14, marginBottom: 10 };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.appBg, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onParsed={handleParsed} />}

      {/* ── Sidebar with Icons + Labels ── */}
      <div style={{ width: 140, background: C.sidebarBg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 2, boxShadow: "1px 0 4px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 34, height: 34, background: C.accentLight, border: `2px solid ${C.accentBorder}`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <span style={{ color: C.accent, fontWeight: 900, fontSize: 15 }}>R</span>
        </div>
        {sideNav.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} title={s.label}
            style={{ width: "90%", height: 38, border: activeSection === s.id ? `1.5px solid ${C.accentBorder}` : "1.5px solid transparent", cursor: "pointer", borderRadius: 9, display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, background: activeSection === s.id ? C.accentLight : "transparent", color: activeSection === s.id ? C.accent : C.textLight, transition: "all 0.15s", fontSize: 12, fontWeight: activeSection === s.id ? 700 : 500 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Form Panel ── */}
      <div style={{ width: formWidth, flexShrink: 0, background: C.panelBg, borderRight: `none`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header with Upload button */}
        <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Resume Builder</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>AI-powered · ATS optimized</div>
            </div>
            {/* Upload Resume button */}
            <button onClick={() => setShowUpload(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "#fff", border: `1.5px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.upload} /></svg>
              Upload CV
            </button>
          </div>
          {/* Upload hint */}
          <div style={{ marginTop: 8, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 7, padding: "6px 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d={icons.info} /></svg>
            <span style={{ fontSize: 10.5, color: C.accent }}>Upload your existing resume — AI auto-fills all fields instantly</span>
          </div>
        </div>

        {/* ATS Score */}
        <div style={{ padding: "10px 16px 12px", borderBottom: `1px solid ${C.border}`, background: C.atsBg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>ATS SCORE</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: atsColor }}>{ats.score}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>/100</span>
              <button onClick={() => setShowTips(!showTips)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 2 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={icons.info} /></svg>
              </button>
            </div>
          </div>
          <div style={{ background: "#dbeafe", borderRadius: 4, height: 7, overflow: "hidden" }}>
            <div style={{ width: `${ats.score}%`, height: "100%", background: atsBar, borderRadius: 4, transition: "width 0.5s" }} />
          </div>
          {showTips && ats.tips.length > 0 && (
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.border}` }}>
              {ats.tips.map((t, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#92400e", marginBottom: 3, display: "flex", gap: 5 }}>
                  <span>⚡</span><span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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

          <button onClick={() => exportPDF(previewRef, data.personal.name)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", background: "#fff", border: `1.5px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={icons.download} /></svg>
            Download PDF
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", background: C.previewBg, padding: "28px 0 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", width: PAGE_W }}>
            <PaginatedResume
              data={data}
              template={activeTemplate}
              exportRef={previewRef}
            />
          </div>
        </div>
      </div>
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
      ＋ {label}
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
      <button onClick={onAdd} style={{ background: "#fff", border: `1px dashed ${C.inputBorder}`, borderRadius: 6, color: C.textMuted, fontSize: 11, padding: "4px 10px", cursor: "pointer", width: "100%", marginTop: 2 }}>＋ Add bullet point</button>
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
      <textarea value={hobbies} onChange={e => update("hobbies", e.target.value)} placeholder="Reading tech blogs, Open source, Chess, Photography..." rows={4} style={{ ...IS, resize: "vertical" }} />
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Separate multiple hobbies with commas.</div>
    </div>
  );
}
