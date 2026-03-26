import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { supabase } from "../../lib/supabase";
import "./CoverLetterBuilder.css";

// ── PDF Worker Setup (same as ResumeBuilder) ──────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// ── PDF Text Extraction ───────────────────────────────────────────────────────
const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(s => s.str).join(" ") + "\n";
    }
    return text.trim();
};



// ── Font Definitions ──────────────────────────────────────────────────────────
const CL_FONTS = [
    { name: "Georgia", family: "Georgia, serif", url: null, category: "Serif" },
    { name: "EB Garamond", family: "'EB Garamond', serif", url: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap", category: "Serif" },
    { name: "Lora", family: "'Lora', serif", url: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap", category: "Serif" },
    { name: "Merriweather", family: "'Merriweather', serif", url: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap", category: "Serif" },
    { name: "Playfair Display", family: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap", category: "Serif" },
    { name: "Inter", family: "'Inter', sans-serif", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", category: "Sans-Serif" },
    { name: "Roboto", family: "'Roboto', sans-serif", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap", category: "Sans-Serif" },
    { name: "Open Sans", family: "'Open Sans', sans-serif", url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap", category: "Sans-Serif" },
    { name: "Lato", family: "'Lato', sans-serif", url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap", category: "Sans-Serif" },
    { name: "Source Sans 3", family: "'Source Sans 3', sans-serif", url: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap", category: "Sans-Serif" },
    { name: "Nunito Sans", family: "'Nunito Sans', sans-serif", url: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap", category: "Sans-Serif" },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const loadCLFont = (url) => {
    if (!url) return;
    const id = "clf-" + btoa(url).slice(0, 12);
    if (!document.getElementById(id)) {
        const l = document.createElement("link");
        l.id = id; l.rel = "stylesheet"; l.href = url;
        document.head.appendChild(l);
    }
};

const detectJobTitle = (jdText) => {
    if (!jdText) return "";
    const patterns = [
        /job title[:\s]+([^\n]+)/i,
        /position[:\s]+([^\n]+)/i,
        /role[:\s]+([^\n]+)/i,
        /we are (?:looking for|hiring)(?: a| an)?\s+([^\n,.]+)/i,
        /hiring(?: a| an)?\s+([^\n,.]+)/i,
    ];
    for (const pattern of patterns) {
        const match = jdText.match(pattern);
        if (match) return match[1].trim().replace(/[–—-].*$/, "").trim();
    }
    const lines = jdText.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
        if (line.length > 5 && line.length < 80 && !line.includes("@")) {
            return line.replace(/[–—-].*$/, "").trim();
        }
    }
    return "the position";
};

const loadHtml2Pdf = () => new Promise((resolve, reject) => {
    if (window.html2pdf) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = resolve; script.onerror = reject;
    document.head.appendChild(script);
});

const cleanCoverLetter = (text) => {
    if (!text) return "";
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^Dear\s+[^,\n]+,?\s*\n?/i, "").trim();
    cleaned = cleaned.replace(/\n*Sincerely,?\s*\n.*/si, "").trim();
    return cleaned;
};

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: "#f5f7fa", panelBg: "#ffffff", border: "#e3e8ef",
    text: "#1a2332", textMuted: "#6b7688", textLight: "#9aa3af",
    inputBg: "#ffffff", inputBorder: "#d5dae3",
    accent: "#7c3aed", accentLight: "#f5f3ff", accentBorder: "#ddd6fe",
    blue: "#2563eb", blueBg: "#eff6ff", blueBorder: "#bfdbfe",
};

export default function CoverLetterBuilder() {
    const navigate = useNavigate();

    // ── Personal Info ─────────────────────────────────────────────────────────
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");

    // ── CV Upload / Parsing State ─────────────────────────────────────────────
    const [cvFile, setCvFile] = useState(null);
    const [cvParsing, setCvParsing] = useState(false);
    const [cvError, setCvError] = useState("");
    const [resumeData, setResumeData] = useState(null); // full parsed resume
    const [showParsedPreview, setShowParsedPreview] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [cvExpandedSection, setCvExpandedSection] = useState("personal"); // accordion
    const cvInputRef = useRef(null);

    // ── Cover Letter Form State ───────────────────────────────────────────────
    const [clJD, setClJD] = useState("");
    const [clTone, setClTone] = useState("Professional");
    const [clLength, setClLength] = useState("Medium");
    const [clHiringManager, setClHiringManager] = useState("");
    const [clCompany, setClCompany] = useState("");
    const [clJobTitle, setClJobTitle] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [clLoading, setClLoading] = useState(false);
    const [clError, setClError] = useState("");
    const [clCopied, setClCopied] = useState(false);

    // ── Preview / Formatting State ────────────────────────────────────────────
    const [clTemplate, setClTemplate] = useState(() => localStorage.getItem("cl_template") || "executive");
    const [clHeadingFont, setClHeadingFont] = useState("'EB Garamond', serif");
    const [clBodyFont, setClBodyFont] = useState("'Source Sans 3', sans-serif");
    const [clFontSize, setClFontSize] = useState(11);
    const [clLineHeight, setClLineHeight] = useState(1.85);
    const [clEditMode, setClEditMode] = useState(false);
    const [clDownloading, setClDownloading] = useState(false);
    const [showFontPanel, setShowFontPanel] = useState(false);
    const [detectedJobTitle, setDetectedJobTitle] = useState("");

    // ── Left panel tabs ───────────────────────────────────────────────────────
    const [leftTab, setLeftTab] = useState("generate"); // "generate" | "cv"
    const [mobileTab, setMobileTab] = useState("form"); // "form" | "preview"
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => { setDetectedJobTitle(detectJobTitle(clJD)); }, [clJD]);
    useEffect(() => { localStorage.setItem("cl_template", clTemplate); }, [clTemplate]);
    useEffect(() => {
        loadCLFont(CL_FONTS.find(f => f.name === "EB Garamond")?.url);
        loadCLFont(CL_FONTS.find(f => f.name === "Source Sans 3")?.url);
    }, []);

    // ── Auto-load from Supabase ───────────────────────────────────────────────
    useEffect(() => {
        const fetchDbData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: dbData } = await supabase.from('resume_data').select('resume_data').eq('user_id', session.user.id).single();
                if (dbData?.resume_data) {
                    const dbResume = dbData.resume_data;
                    setResumeData(dbResume);
                    if (dbResume.personal?.name) setName(dbResume.personal.name);
                    if (dbResume.personal?.email) setEmail(dbResume.personal.email);
                    if (dbResume.personal?.phone) setPhone(dbResume.personal.phone);
                    if (dbResume.personal?.location) setLocation(dbResume.personal.location);
                    if (dbResume.personal?.linkedin) setLinkedin(dbResume.personal.linkedin);
                    if (dbResume.personal?.github) setGithub(dbResume.personal.github);
                    setLeftTab("cv");
                }
            }
        };
        fetchDbData();
    }, []);

    const jt = (clJobTitle && clJobTitle.trim()) || detectedJobTitle || "the position";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const links = [linkedin, github].filter(Boolean);
    const cleanedText = cleanCoverLetter(coverLetter);

    // ── CV Upload & Parse ─────────────────────────────────────────────────────
    const uploadCVAndParse = async (file) => {
        if (!file || !file.name.endsWith(".pdf")) { setCvError("Please upload a PDF file."); return; }
        setCvFile(file); setCvParsing(true); setCvError(""); setResumeData(null);
        try {
            const rawText = await extractPdfText(file);
            if (!rawText || rawText.length < 50) throw new Error("Could not read text from PDF. Try a text-based PDF.");

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
- DO NOT include starting bullet symbols (like •, -, or *) in bullet points
- Return ONLY raw JSON — no markdown, no code blocks, no explanation

RESUME TEXT:
`;

            const parseResp = await fetch("/api/groq", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.1,
                    max_tokens: 4000,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: "You are a precise resume parser. Always respond with only valid JSON and nothing else." },
                        { role: "user", content: PARSE_PROMPT + rawText.slice(0, 8000) }
                    ]
                })
            });
            if (!parseResp.ok) {
                let errStr = "";
                try {
                    const errData = await parseResp.json();
                    errStr = errData?.error?.message || errData?.message || JSON.stringify(errData);
                } catch {
                    errStr = "The backend server was unreachable or returned an invalid response. Please make sure `npm run dev` is running.";
                }
                if (parseResp.status === 429) errStr = "Groq API rate limit exceeded. Please wait a moment and try again.";
                throw new Error(errStr || `Groq API error ${parseResp.status}. Please try again.`);
            }
            const parsed = await parseResp.json();
            const raw = parsed.choices?.[0]?.message?.content || "";
            let data;
            try { data = JSON.parse(raw); }
            catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("Could not parse resume structure."); data = JSON.parse(m[0]); }

            // Clean bullet points
            const cleanBullets = (arr) => Array.isArray(arr) ? arr.map(b => typeof b === "string" ? b.replace(/^[\s\u2022\-\*\.]+/g, "").trim() : b).filter(Boolean) : [];
            if (data.experience) data.experience = data.experience.map(e => ({ ...e, bullets: cleanBullets(e.bullets) }));
            if (data.projects) data.projects = data.projects.map(p => ({ ...p, bullets: cleanBullets(p.bullets) }));

            setResumeData(data);
            setCvExpandedSection("personal");
            // Auto-fill personal fields
            if (data.personal?.name) setName(data.personal.name);
            if (data.personal?.email) setEmail(data.personal.email);
            if (data.personal?.phone) setPhone(data.personal.phone);
            if (data.personal?.location) setLocation(data.personal.location);
            if (data.personal?.linkedin) setLinkedin(data.personal.linkedin);
            if (data.personal?.github) setGithub(data.personal.github);
            setLeftTab("cv");
        } catch (e) {
            setCvError("Parse error: " + e.message);
            setCvFile(null);
        }
        setCvParsing(false);
    };

    const removeCv = () => { setCvFile(null); setResumeData(null); setCvError(""); setShowParsedPreview(false); };

    const handleFileDrop = (e) => {
        e.preventDefault(); setIsDragOver(false);
        const f = e.dataTransfer?.files?.[0]; if (f) uploadCVAndParse(f);
    };

    // ── Generate ──────────────────────────────────────────────────────────────
    const generateCoverLetter = async () => {
        if (!clJD.trim()) { setClError("Please paste a job description first."); return; }
        setClLoading(true); setClError(""); setCoverLetter("");
        const lengthMap = { "Short": "around 150 words", "Medium": "around 250 words", "Long": "around 400 words" };
        const toneMap = { "Professional": "formal, polished, results-focused", "Confident": "assertive, achievement-driven, bold", "Enthusiastic": "energetic, passionate, warm", "Formal": "very formal, structured, traditional", "Creative": "memorable opening, storytelling, unique", "Concise": "brief, punchy, every sentence earns its place" };

        let resumeSection = "";
        if (resumeData) {
            const rd = resumeData;
            const skillsStr = (rd.skills || []).filter(s => s.items).map(s => `${s.category}: ${s.items}`).join(" | ");
            const expStr = (rd.experience || []).filter(e => e.role).map(e =>
                `${e.role} at ${e.company} (${e.duration}):\n${(e.bullets || []).filter(Boolean).map(b => `  - ${b}`).join("\n")}`
            ).join("\n\n");
            const projStr = (rd.projects || []).filter(p => p.name).map(p => `${p.name} [${p.tech}]: ${p.description}`).join("\n");
            const eduStr = (rd.education || []).filter(e => e.degree).map(e => `${e.degree} — ${e.institution} (${e.year})`).join(", ");
            const certStr = (rd.certifications || []).filter(c => c.name).map(c => c.name).join(", ");
            resumeSection = `
CANDIDATE RESUME:
Name: ${name || rd.personal?.name || "Candidate"}
Title: ${rd.personal?.title || ""}
Email: ${email || rd.personal?.email || ""} | Phone: ${phone || rd.personal?.phone || ""} | Location: ${location || rd.personal?.location || ""}

PROFESSIONAL SUMMARY:
${rd.summary || ""}

WORK EXPERIENCE:
${expStr || "Not provided"}

KEY SKILLS:
${skillsStr || "Not provided"}

PROJECTS:
${projStr || "Not provided"}

EDUCATION:
${eduStr || "Not provided"}

CERTIFICATIONS:
${certStr || "Not provided"}`;
        } else {
            resumeSection = `
CANDIDATE:
Name: ${name || "Candidate"}
Email: ${email || ""} | Phone: ${phone || ""} | Location: ${location || ""}
(No resume uploaded — write a professional letter based on the job description only)`;
        }

        const prompt = `Write a ${toneMap[clTone]} professional cover letter that is ${lengthMap[clLength]}.${resumeSection}

JOB DESCRIPTION:
${clJD}

HIRING MANAGER: ${clHiringManager || "Hiring Manager"}
COMPANY: ${clCompany || "the company"}

STRICT RULES:
1. Start DIRECTLY with: Dear ${clHiringManager || "Hiring Team"},
2. Opening: One powerful sentence — connect the candidate's strongest achievement to THIS specific role
3. Body: Reference REAL experience and achievements from the resume that match JD requirements. Be specific with company names, roles, and accomplishments.
4. Skills paragraph: Pick 3-4 skills from the resume that appear in the JD
5. Closing: Strong call to action
6. Sign off: Sincerely,\n${name || "Candidate"}
7. Mirror JD keywords naturally throughout
8. NEVER hallucinate — only mention skills/experience that are in the candidate's resume
9. NEVER use: "I am writing to express", "Please find attached", "passionate about", "I believe I would be a great fit"
10. Output ONLY the letter body — start from Dear, end after sign-off. No address/date header.`;
        try {
            const resp = await fetch("/api/groq", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", temperature: 0.72, max_tokens: 1500,
                    messages: [
                        { role: "system", content: "You are a world-class career coach and cover letter writer. You write specific, ATS-optimized cover letters using only the candidate's real experience. Every sentence must add value. Never use cliche phrases." },
                        { role: "user", content: prompt }
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
                throw new Error(errStr || `Groq API error ${resp.status}. Please try again.`);
            }
            const json = await resp.json();
            const text = json.choices?.[0]?.message?.content?.trim() || "";
            if (text) { setCoverLetter(text); setClEditMode(false); }
            else setClError("Generation failed. Please try again.");
        } catch (e) { setClError("API error: " + e.message); }
        setClLoading(false);
    };

    // ── Copy ──────────────────────────────────────────────────────────────────
    const handleCopyCL = () => {
        const contact = [email, phone, location].filter(Boolean).join(" · ");
        const full = [name, contact, date, "", clHiringManager, clCompany, "", coverLetter].filter(l => l !== undefined && l !== null).join("\n");
        navigator.clipboard.writeText(full);
        setClCopied(true); setTimeout(() => setClCopied(false), 2500);
    };

    // ── Download PDF ──────────────────────────────────────────────────────────
    const downloadCoverLetterPDF = async () => {
        if (!coverLetter) return;
        setClDownloading(true);
        try {
            await loadHtml2Pdf();
            let bodyHtml = "";
            const fontLinks = [clHeadingFont, clBodyFont].map(f => CL_FONTS.find(x => x.family === f)).filter(f => f?.url).map(f => `<link rel="stylesheet" href="${f.url}">`).join("\n");
            if (clTemplate === "executive") {
                bodyHtml = `${fontLinks}<div style="font-family:${clBodyFont};padding:56px 64px;background:#fff;color:#1e293b;">
          <div style="font-family:${clHeadingFont};font-size:26pt;font-weight:700;color:#0f172a;margin-bottom:5px;">${name || "Your Name"}</div>
          <div style="font-size:10.5pt;font-weight:600;color:#2563eb;margin-bottom:8px;">Applying for: ${jt}</div>
          <div style="font-size:9pt;color:#64748b;">${[email, phone, location].filter(Boolean).join(" · ")}${links.length ? " · " + links.join(" · ") : ""}</div>
          <div style="height:2px;background:linear-gradient(to right,#0f172a 55%,#e2e8f0 100%);margin:20px 0 24px;"></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:26px;">
            <div style="font-size:9.5pt;color:#64748b;font-style:italic;">${date}</div>
            <div style="text-align:right;"><div style="font-family:${clHeadingFont};font-size:12pt;font-weight:700;color:#0f172a;">${clHiringManager || ""}</div><div style="font-size:10pt;font-weight:600;color:#475569;">${clCompany || ""}</div></div>
          </div>
          <div style="font-family:${clHeadingFont};font-size:12pt;font-weight:600;color:#0f172a;margin-bottom:20px;">Dear ${clHiringManager || "Hiring Team"},</div>
          <div style="font-size:${clFontSize}pt;line-height:${clLineHeight};text-align:justify;white-space:pre-wrap;">${cleanedText}</div>
          <div style="margin-top:28px;"><div style="font-size:11pt;margin-bottom:30px;">Sincerely,</div><div style="width:160px;height:1px;background:#cbd5e1;margin-bottom:6px;"></div><div style="font-family:${clHeadingFont};font-size:13pt;font-weight:700;color:#0f172a;margin-bottom:2px;">${name || ""}</div><div style="font-size:9pt;color:#64748b;">Applying for: ${jt}</div></div>
        </div>`;
            } else if (clTemplate === "modern") {
                bodyHtml = `${fontLinks}<div style="display:flex;font-family:${clBodyFont};">
          <div style="width:30%;background:#0f172a;color:#fff;padding:40px 20px;">
            <div style="font-family:${clHeadingFont};font-size:16pt;font-weight:700;color:#fff;margin-bottom:4px;">${name || "Your Name"}</div>
            <div style="font-size:8pt;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px;">Applying for</div>
            <div style="font-size:9.5pt;color:#60a5fa;font-weight:600;margin-bottom:18px;line-height:1.4;">${jt}</div>
            <div style="height:1px;background:#334155;margin-bottom:16px;"></div>
            <div style="font-size:8pt;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Contact</div>
            ${[email, phone, location, ...links].filter(Boolean).map(c => `<div style="font-size:8.5pt;color:#cbd5e1;margin-bottom:5px;word-break:break-all;">${c}</div>`).join("")}
            <div style="height:1px;background:#334155;margin:16px 0;"></div>
            <div style="font-size:8pt;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Date</div>
            <div style="font-size:8.5pt;color:#cbd5e1;margin-bottom:16px;">${date}</div>
            <div style="font-size:8pt;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">To</div>
            <div style="font-size:10pt;font-weight:700;color:#fff;margin-bottom:2px;">${clHiringManager || ""}</div>
            <div style="font-size:9pt;color:#94a3b8;">${clCompany || ""}</div>
          </div>
          <div style="flex:1;padding:44px 40px;background:#fff;">
            <div style="font-family:${clHeadingFont};font-size:13pt;font-weight:600;color:#0f172a;margin-bottom:22px;">Dear ${clHiringManager || "Hiring Team"},</div>
            <div style="font-size:${clFontSize}pt;line-height:${clLineHeight};color:#1e293b;text-align:justify;white-space:pre-wrap;">${cleanedText}</div>
            <div style="margin-top:28px;"><div style="font-size:11pt;margin-bottom:26px;">Sincerely,</div><div style="width:40px;height:3px;background:#2563eb;margin-bottom:10px;"></div><div style="font-family:${clHeadingFont};font-size:13pt;font-weight:700;color:#0f172a;margin-bottom:3px;">${name || ""}</div><div style="font-size:9pt;color:#64748b;">Applying for: ${jt}</div></div>
          </div>
        </div>`;
            } else {
                bodyHtml = `${fontLinks}<div style="font-family:${clBodyFont};padding:64px 80px;background:#fff;color:#374151;">
          <div style="font-family:${clHeadingFont};font-size:22pt;font-weight:700;color:#111827;letter-spacing:-0.5px;margin-bottom:3px;">${name || "Your Name"}</div>
          <div style="font-size:10pt;color:#6b7280;font-weight:500;margin-bottom:10px;">Applying for: ${jt}</div>
          <div style="font-size:8.5pt;color:#9ca3af;">${[email, phone, location].filter(Boolean).join("  |  ")}</div>
          <div style="width:32px;height:3px;background:#111827;margin:18px 0 20px;"></div>
          <div style="font-size:9pt;color:#9ca3af;margin-bottom:16px;">${date}</div>
          <div style="margin-bottom:22px;"><div style="font-size:10.5pt;font-weight:700;color:#111827;margin-bottom:1px;">${clHiringManager || ""}</div><div style="font-size:10pt;color:#6b7280;">${clCompany || ""}</div></div>
          <div style="font-size:11pt;font-weight:600;color:#111827;margin-bottom:18px;">Dear ${clHiringManager || "Hiring Team"},</div>
          <div style="font-size:${clFontSize}pt;line-height:${clLineHeight};white-space:pre-wrap;color:#374151;">${cleanedText}</div>
          <div style="margin-top:28px;"><div style="font-size:10.5pt;margin-bottom:22px;color:#374151;">Sincerely,</div><div style="font-family:${clHeadingFont};font-size:12pt;font-weight:700;color:#111827;margin-bottom:2px;">${name || ""}</div><div style="font-size:9pt;color:#9ca3af;">Applying for: ${jt}</div></div>
        </div>`;
            }
            const container = document.createElement("div");
            container.style.cssText = "position:absolute;left:0;top:0;width:210mm;z-index:-9999;overflow:hidden;opacity:0;";
            container.innerHTML = bodyHtml;
            document.body.appendChild(container);
            const fontEls = [clHeadingFont, clBodyFont].map(f => CL_FONTS.find(x => x.family === f)).filter(f => f?.url);
            fontEls.forEach(f => loadCLFont(f.url));
            await new Promise(r => setTimeout(r, 800));
            const jtClean = jt.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
            const nameClean = (name || "").replace(/\s+/g, "_");
            const el = container.firstElementChild || container;
            await window.html2pdf().set({
                margin: 0,
                filename: `Cover_Letter_${nameClean}${jtClean ? "_" + jtClean : ""}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false, width: el.scrollWidth, height: el.scrollHeight },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            }).from(el).save();
            document.body.removeChild(container);
        } catch (e) {
            console.error("PDF download error:", e);
            alert("PDF download failed: " + e.message);
        }
        setClDownloading(false);
    };

    // ── Computed ──────────────────────────────────────────────────────────────
    const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0;
    const wcColor = wordCount === 0 ? "#c0c8d2" : wordCount > 400 ? "#b45309" : wordCount >= 150 ? "#15803d" : "#9aa3af";

    const IS = { width: "100%", padding: "8px 11px", background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 7, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="cl-page">
            {/* Mobile tab visibility */}
            <style>{`
                @media (max-width: 640px) {
                    .cl-left  { display: ${mobileTab === "preview" ? "none" : "flex"} !important; }
                    .cl-right { display: ${mobileTab === "preview" ? "flex" : "none"} !important; }
                    .cl-page  { padding-bottom: 72px; }
                }
            `}</style>

            {/* ── Top Navbar ── */}
            <div className="cl-navbar">
                <button className="cl-back-btn" onClick={() => navigate("/builder")}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Resume Builder
                </button>
                <div className="cl-navbar-center">
                    <div className="cl-navbar-icon">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /></svg>
                    </div>
                    <div>
                        <div className="cl-navbar-title">Cover Letter Builder</div>
                        <div className="cl-navbar-sub">AI-powered ATS optimized</div>
                    </div>
                </div>
                <div className="cl-navbar-actions">
                    <button onClick={handleCopyCL} disabled={!coverLetter} className="cl-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {clCopied ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Copied!</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy</>
                        )}
                    </button>
                    <button onClick={downloadCoverLetterPDF} disabled={!coverLetter || clDownloading} className="cl-btn-primary">
                        {clDownloading ? "⏳ Generating..." : (
                            <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> Download PDF</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="cl-body">

                {/* ── Left Panel ── */}
                <div className="cl-left">

                    {/* Tab Switcher */}
                    <div className="cl-tab-row">
                        <button className={`cl-tab ${leftTab === "generate" ? "cl-tab-active" : ""}`} onClick={() => setLeftTab("generate")} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            Generate
                        </button>
                        <button className={`cl-tab ${leftTab === "cv" ? "cl-tab-active" : ""}`} onClick={() => setLeftTab("cv")} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            {resumeData ? (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> CV Info</>
                            ) : (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> CV Info</>
                            )}
                        </button>
                    </div>

                    <div className="cl-left-content">
                        {leftTab === "cv" ? (
                            /* ── CV Info Tab ── */
                            <>
                                {resumeData ? (
                                    <>
                                        {/* CV loaded badge */}
                                        <div className="cl-cv-badge">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> CV Loaded: <strong>{cvFile?.name}</strong></span>
                                            <button onClick={removeCv} className="cl-cv-remove">✕ Remove</button>
                                        </div>

                                        {/* ── Accordion CV Panel ── */}
                                        <div className="cl-cv-info-panel">

                                            {/* Personal */}
                                            {(() => {
                                                const open = cvExpandedSection === "personal";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "personal")}>
                                                            <span>👤 Personal Info</span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {name && <div className="cl-cv-personal-name">{name}</div>}
                                                                {resumeData.personal?.title && <div className="cl-cv-personal-title">{resumeData.personal.title}</div>}
                                                                {[email, phone, location].filter(Boolean).map((v, i) => <div key={i} className="cl-cv-personal-item">{v}</div>)}
                                                                {linkedin && <div className="cl-cv-personal-item cl-cv-link">{linkedin}</div>}
                                                                {github && <div className="cl-cv-personal-item cl-cv-link">{github}</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Summary */}
                                            {resumeData.summary && (() => {
                                                const open = cvExpandedSection === "summary";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "summary")}>
                                                            <span>📝 Summary</span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                <div className="cl-cv-summary-text">{resumeData.summary}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Skills */}
                                            {resumeData.skills?.some(s => s.items) && (() => {
                                                const open = cvExpandedSection === "skills";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "skills")}>
                                                            <span>⚡ Skills <span className="cl-cv-acc-count">({resumeData.skills.filter(s => s.items).length} categories)</span></span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {resumeData.skills.filter(s => s.items).map((s, i) => (
                                                                    <div key={i} className="cl-cv-skill-group">
                                                                        <div className="cl-cv-skill-cat">{s.category}</div>
                                                                        <div className="cl-cv-skill-badges">
                                                                            {s.items.split(",").map((sk, j) => <span key={j} className="cl-cv-skill-badge">{sk.trim()}</span>)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Education */}
                                            {resumeData.education?.some(e => e.degree) && (() => {
                                                const open = cvExpandedSection === "education";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "education")}>
                                                            <span>🎓 Education <span className="cl-cv-acc-count">({resumeData.education.filter(e => e.degree).length})</span></span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {resumeData.education.filter(e => e.degree).map((e, i) => (
                                                                    <div key={i} className="cl-cv-entry">
                                                                        <div className="cl-cv-entry-top">
                                                                            <span className="cl-cv-entry-title">{e.institution}</span>
                                                                            <span className="cl-cv-entry-meta">{e.year}</span>
                                                                        </div>
                                                                        <div className="cl-cv-entry-sub">{e.degree}{e.cgpa ? ` · CGPA: ${e.cgpa}` : ""}</div>
                                                                        {e.location && <div className="cl-cv-entry-loc">{e.location}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Experience */}
                                            {resumeData.experience?.some(e => e.role) && (() => {
                                                const open = cvExpandedSection === "experience";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "experience")}>
                                                            <span>💼 Experience <span className="cl-cv-acc-count">({resumeData.experience.filter(e => e.role).length})</span></span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {resumeData.experience.filter(e => e.role).map((e, i) => (
                                                                    <div key={i} className="cl-cv-entry">
                                                                        <div className="cl-cv-entry-top">
                                                                            <span className="cl-cv-entry-title">{e.role}</span>
                                                                            <span className="cl-cv-entry-meta">{e.duration}</span>
                                                                        </div>
                                                                        <div className="cl-cv-entry-sub">{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                                                                        {e.bullets?.filter(b => b?.trim()).length > 0 && (
                                                                            <ul className="cl-cv-bullets">
                                                                                {e.bullets.filter(b => b?.trim()).map((b, j) => <li key={j}>{b}</li>)}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Projects */}
                                            {resumeData.projects?.some(p => p.name) && (() => {
                                                const open = cvExpandedSection === "projects";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "projects")}>
                                                            <span>🚀 Projects <span className="cl-cv-acc-count">({resumeData.projects.filter(p => p.name).length})</span></span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {resumeData.projects.filter(p => p.name).map((p, i) => (
                                                                    <div key={i} className="cl-cv-entry">
                                                                        <div className="cl-cv-entry-top">
                                                                            <span className="cl-cv-entry-title">{p.name}</span>
                                                                        </div>
                                                                        {p.tech && <div className="cl-cv-tech-tag">{p.tech}</div>}
                                                                        {p.bullets?.filter(b => b?.trim()).length > 0 && (
                                                                            <ul className="cl-cv-bullets">
                                                                                {p.bullets.filter(b => b?.trim()).map((b, j) => <li key={j}>{b}</li>)}
                                                                            </ul>
                                                                        )}
                                                                        {!p.bullets?.length && p.description && <div className="cl-cv-summary-text">{p.description}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Certifications */}
                                            {resumeData.certifications?.some(c => c.name) && (() => {
                                                const open = cvExpandedSection === "certifications";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "certifications")}>
                                                            <span>📜 Certifications <span className="cl-cv-acc-count">({resumeData.certifications.filter(c => c.name).length})</span></span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                {resumeData.certifications.filter(c => c.name).map((c, i) => (
                                                                    <div key={i} className="cl-cv-entry">
                                                                        <div className="cl-cv-entry-top">
                                                                            <span className="cl-cv-entry-title">{c.name}</span>
                                                                            {c.year && <span className="cl-cv-entry-meta">{c.year}</span>}
                                                                        </div>
                                                                        {c.issuer && <div className="cl-cv-entry-sub">{c.issuer}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Hobbies */}
                                            {resumeData.hobbies && (() => {
                                                const open = cvExpandedSection === "hobbies";
                                                return (
                                                    <div className="cl-cv-section">
                                                        <button className={`cl-cv-accordion-btn ${open ? "cl-cv-accordion-open" : ""}`}
                                                            onClick={() => setCvExpandedSection(open ? null : "hobbies")}>
                                                            <span>🎯 Hobbies &amp; Interests</span>
                                                            <span className="cl-cv-accordion-arrow">{open ? "▲" : "▼"}</span>
                                                        </button>
                                                        {open && (
                                                            <div className="cl-cv-accordion-body">
                                                                <div className="cl-cv-summary-text">{resumeData.hobbies}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                        </div>{/* end cl-cv-info-panel */}

                                    </>
                                ) : (
                                    /* No CV uploaded yet — show personal fields */
                                    <div className="cl-section">
                                        <div className="cl-section-title">Your Personal Details</div>
                                        <div className="cl-section-sub">Upload your CV above to auto-fill, or enter manually</div>
                                        {[
                                            ["Full Name", name, setName, "e.g. Anshu Prasad"],
                                            ["Email", email, setEmail, "you@email.com"],
                                            ["Phone", phone, setPhone, "+91-9876543210"],
                                            ["Location", location, setLocation, "Noida, India"],
                                            ["LinkedIn URL", linkedin, setLinkedin, "https://linkedin.com/in/..."],
                                            ["GitHub URL", github, setGithub, "https://github.com/..."],
                                        ].map(([lbl, val, setter, ph]) => (
                                            <div key={lbl} className="cl-field">
                                                <label className="cl-label">{lbl}</label>
                                                <input value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={IS} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── Generate Tab ── */
                            <>
                                {/* Step 0 — Upload CV */}
                                <div
                                    className={`cl-upload-zone ${isDragOver ? "cl-upload-drag" : ""}${cvFile ? " cl-upload-done" : ""}`}
                                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => !cvFile && cvInputRef.current?.click()}
                                >
                                    <input ref={cvInputRef} type="file" accept=".pdf" style={{ display: "none" }}
                                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadCVAndParse(f); }} />
                                    {cvParsing ? (
                                        <div className="cl-upload-status" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animation: "spin 2s linear infinite" }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
                                            Parsing your CV with AI...
                                        </div>
                                    ) : cvFile ? (
                                        <div className="cl-upload-status">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <strong>{cvFile.name}</strong></span>
                                            <button onClick={e => { e.stopPropagation(); removeCv(); }} className="cl-cv-remove">✕</button>
                                        </div>
                                    ) : (
                                        <div className="cl-upload-prompt">
                                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                                            <div className="cl-upload-title">Upload your CV / Resume</div>
                                            <div className="cl-upload-sub">PDF only · Drag & drop or click · AI auto-extracts your experience</div>
                                        </div>
                                    )}
                                </div>
                                {cvError && <div className="cl-error">⚠ {cvError}</div>}

                                {/* Step 1 — JD */}
                                <div className="cl-section">
                                    <div className="cl-step-badge">STEP 1</div>
                                    <div className="cl-section-title">Paste Job Description</div>
                                    <textarea
                                        value={clJD}
                                        onChange={e => setClJD(e.target.value)}
                                        placeholder="Paste the full job description here — the more detail, the better the letter..."
                                        rows={7}
                                        style={{ ...IS, resize: "vertical", lineHeight: 1.6 }}
                                    />
                                    {clJD.trim() && <div className="cl-word-count">{clJD.trim().split(/\s+/).length} words</div>}
                                </div>

                                {/* Step 2 — Customize */}
                                <div className="cl-section">
                                    <div className="cl-step-badge">STEP 2</div>
                                    <div className="cl-section-title">Customize</div>
                                    <div className="cl-row-2">
                                        <div>
                                            <label className="cl-label">Tone</label>
                                            <select value={clTone} onChange={e => setClTone(e.target.value)} style={{ ...IS, cursor: "pointer" }}>
                                                {["Professional", "Confident", "Enthusiastic", "Formal", "Creative", "Concise"].map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="cl-label">Length</label>
                                            <select value={clLength} onChange={e => setClLength(e.target.value)} style={{ ...IS, cursor: "pointer" }}>
                                                <option value="Short">Short (~150 words)</option>
                                                <option value="Medium">Medium (~250 words)</option>
                                                <option value="Long">Long (~400 words)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="cl-row-2" style={{ marginTop: 8 }}>
                                        <div>
                                            <label className="cl-label">Hiring Manager</label>
                                            <input value={clHiringManager} onChange={e => setClHiringManager(e.target.value)} placeholder="Mr. Sharma (optional)" style={IS} />
                                        </div>
                                        <div>
                                            <label className="cl-label">Company Name</label>
                                            <input value={clCompany} onChange={e => setClCompany(e.target.value)} placeholder="Google, TechCorp..." style={IS} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <label className="cl-label">Job Title</label>
                                        <input value={clJobTitle} onChange={e => setClJobTitle(e.target.value)} placeholder={detectedJobTitle || "e.g. Data Analyst"} style={IS} />
                                        {detectedJobTitle && !clJobTitle && <div className="cl-auto-detected">Auto-detected: {detectedJobTitle}</div>}
                                    </div>
                                </div>

                                {/* No-CV warning */}
                                {!resumeData && (
                                    <div className="cl-no-cv-warn">
                                        ⚠ <strong>No CV uploaded.</strong> Upload your resume above so the AI can reference your real experience, skills & projects.
                                        <br /><span style={{ fontSize: 10, opacity: 0.7 }}>Without a CV the letter will be generic.</span>
                                    </div>
                                )}

                                {/* Generate button */}
                                <button onClick={generateCoverLetter} disabled={clLoading} className="cl-generate-btn">
                                    {clLoading
                                        ? <><span>⏳</span> Creating your cover letter...</>
                                        : <><span>✨</span> Generate Professional Cover Letter</>
                                    }
                                </button>

                                {clError && <div className="cl-error">⚠ {clError}</div>}

                                {/* Tips */}
                                <div className="cl-tips">
                                    <div className="cl-tips-title">⚡ TIPS FOR BEST RESULTS</div>
                                    {[
                                        "Upload your CV first — AI will match it to the JD",
                                        "Paste the complete job description for better matching",
                                        "Use Edit mode in the preview to fine-tune the output",
                                        "Try regenerating to get a different version",
                                    ].map((t, i) => (
                                        <div key={i} className="cl-tip-item">• {t}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Right Panel (Preview) ── */}
                <div className="cl-right">

                    {/* Preview Toolbar */}
                    <div className="cl-toolbar">
                        {/* Template selector */}
                        <div className="cl-toolbar-group">
                            {[
                                { id: "executive", label: "Executive" },
                                { id: "modern", label: "Modern" },
                                { id: "minimal", label: "Minimal" },
                            ].map(t => (
                                <button key={t.id} onClick={() => setClTemplate(t.id)}
                                    className={`cl-template-btn ${clTemplate === t.id ? "cl-template-active" : ""}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="cl-toolbar-sep" />

                        {/* Font */}
                        <div style={{ position: "relative" }}>
                            <button onClick={() => setShowFontPanel(v => !v)} className={`cl-toolbar-btn ${showFontPanel ? "cl-toolbar-btn-active" : ""}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                                Fonts
                            </button>
                            {showFontPanel && (
                                <div className="cl-font-panel" onClick={e => e.stopPropagation()}>
                                    <div className="cl-font-panel-header">
                                        <span className="cl-font-panel-title">🔤 Font Picker</span>
                                        <button className="cl-font-panel-close" onClick={() => setShowFontPanel(false)}>✕</button>
                                    </div>
                                    <div className="cl-font-cols-wrap">
                                        <div className="cl-font-col">
                                            <div className="cl-font-col-title">HEADING FONT</div>
                                            <div className="cl-font-col-sub">Name · Date · Signature</div>
                                            {["Serif", "Sans-Serif"].map(cat => (
                                                <div key={cat}>
                                                    <div className="cl-font-cat">{cat.toUpperCase()}</div>
                                                    {CL_FONTS.filter(f => f.category === cat).map(f => (
                                                        <div key={f.name}
                                                            onClick={() => { setClHeadingFont(f.family); loadCLFont(f.url); }}
                                                            className={`cl-font-item ${clHeadingFont === f.family ? "cl-font-active" : ""}`}>
                                                            <span style={{ fontFamily: f.family }}>{f.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="cl-font-divider" />
                                        <div className="cl-font-col">
                                            <div className="cl-font-col-title">BODY FONT</div>
                                            <div className="cl-font-col-sub">Paragraphs · All body text</div>
                                            {["Serif", "Sans-Serif"].map(cat => (
                                                <div key={cat}>
                                                    <div className="cl-font-cat">{cat.toUpperCase()}</div>
                                                    {CL_FONTS.filter(f => f.category === cat).map(f => (
                                                        <div key={f.name}
                                                            onClick={() => { setClBodyFont(f.family); loadCLFont(f.url); }}
                                                            className={`cl-font-item ${clBodyFont === f.family ? "cl-font-active" : ""}`}>
                                                            <span style={{ fontFamily: f.family }}>{f.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Font Size */}
                        <div className="cl-toolbar-group">
                            <button onClick={() => setClFontSize(v => Math.max(9, v - 0.5))} className="cl-size-btn">−</button>
                            <span className="cl-size-label">{clFontSize}pt</span>
                            <button onClick={() => setClFontSize(v => Math.min(14, v + 0.5))} className="cl-size-btn">+</button>
                        </div>

                        {/* Line Spacing */}
                        <div className="cl-toolbar-group">
                            <span className="cl-spacing-label">Spacing</span>
                            {[1.5, 1.8, 2.0].map(lh => (
                                <button key={lh} onClick={() => setClLineHeight(lh)}
                                    className={`cl-spacing-btn ${clLineHeight === lh ? "cl-spacing-active" : ""}`}>{lh}</button>
                            ))}
                        </div>

                        <div className="cl-toolbar-sep" />

                        {/* Edit mode */}
                        <button onClick={() => setClEditMode(v => !v)}
                            className={`cl-toolbar-btn ${clEditMode ? "cl-toolbar-btn-active" : ""}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {clEditMode ? (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> View Mode</>
                            ) : (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit Letter</>
                            )}
                        </button>

                        {wordCount > 0 && (
                            <span className="cl-wc" style={{ color: wcColor }}>
                                {wordCount} words{wordCount > 400 ? " · consider shortening" : wordCount >= 150 ? " · ✓ good" : ""}
                            </span>
                        )}
                    </div>

                    {/* Preview Canvas */}
                    <div className="cl-preview-scroll">
                        <div className="cl-page-wrap-outer">
                        <div className="cl-page-wrap">

                            {/* ── EXECUTIVE TEMPLATE ── */}
                            {clTemplate === "executive" && (
                                <div className="cl-paper cl-executive">
                                    <div style={{ fontFamily: clHeadingFont, fontSize: "26pt", fontWeight: 700, color: "#0f172a", marginBottom: 5 }}>{name || "Your Name"}</div>
                                    {jt && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "10.5pt", fontWeight: 600, color: "#2563eb", marginBottom: 8 }}>Applying for: {jt}</div>}
                                    <div style={{ fontSize: "9pt", color: "#64748b" }}>
                                        {[email, phone, location].filter(Boolean).join(" · ")}
                                        {links.length > 0 && <> · {links.map((l, i) => <span key={i} style={{ color: "#2563eb" }}>{i > 0 ? " · " : ""}{l}</span>)}</>}
                                    </div>
                                    <div style={{ height: 2, background: "linear-gradient(to right,#0f172a 55%,#e2e8f0 100%)", margin: "20px 0 24px" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
                                        <div style={{ fontSize: "9.5pt", color: "#64748b", fontStyle: "italic" }}>{date}</div>
                                        <div style={{ textAlign: "right" }}>
                                            {clHiringManager && <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 700, color: "#0f172a" }}>{clHiringManager}</div>}
                                            {clCompany && <div style={{ fontSize: "10pt", fontWeight: 600, color: "#475569" }}>{clCompany}</div>}
                                        </div>
                                    </div>
                                    {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Dear {clHiringManager || "Hiring Team"},</div>}
                                    {clLoading && <div className="cl-loading-text">✨ Creating your cover letter...</div>}
                                    {!clLoading && clEditMode && <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="cl-edit-area" style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight }} />}
                                    {!clLoading && !clEditMode && cleanedText && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#1e293b", whiteSpace: "pre-wrap", textAlign: "justify", marginBottom: 18 }}>{cleanedText}</div>}
                                    {!clLoading && !clEditMode && !cleanedText && !clEditMode && <div className="cl-empty-text">Your cover letter will appear here.<br />Fill in the form on the left,<br />then click Generate ✨</div>}
                                    {cleanedText && !clLoading && !clEditMode && (
                                        <div style={{ marginTop: 28 }}>
                                            <div style={{ fontFamily: clBodyFont, fontSize: "11pt", color: "#1e293b", marginBottom: 32 }}>Sincerely,</div>
                                            <div style={{ width: 160, height: 1, background: "#cbd5e1", marginBottom: 6 }} />
                                            <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{name || "Your Name"}</div>
                                            <div style={{ fontSize: "9pt", color: "#64748b" }}>Applying for: {jt}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── MODERN TEMPLATE ── */}
                            {clTemplate === "modern" && (
                                <div className="cl-paper" style={{ display: "flex", padding: 0, overflow: "hidden" }}>
                                    <div style={{ width: "28%", background: "#0f172a", color: "#fff", padding: "40px 20px", display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontFamily: clHeadingFont, fontSize: "16pt", fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>{name || "Your Name"}</div>
                                        <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>Applying for</div>
                                        <div style={{ fontSize: "9.5pt", color: "#60a5fa", fontWeight: 600, lineHeight: 1.4, marginBottom: 0 }}>{jt}</div>
                                        <div style={{ height: 1, background: "#334155", margin: "16px 0" }} />
                                        <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Contact</div>
                                        {[email, phone, location, ...links].filter(Boolean).map((c, i) => (
                                            <div key={i} style={{ fontSize: "8.5pt", color: "#cbd5e1", marginBottom: 6, wordBreak: "break-all", lineHeight: 1.4 }}>{c}</div>
                                        ))}
                                        <div style={{ height: 1, background: "#334155", margin: "16px 0" }} />
                                        <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Date</div>
                                        <div style={{ fontSize: "8.5pt", color: "#cbd5e1", marginBottom: 16 }}>{date}</div>
                                        <div style={{ fontSize: "8pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>To</div>
                                        {clHiringManager && <div style={{ fontSize: "10pt", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{clHiringManager}</div>}
                                        {clCompany && <div style={{ fontSize: "9pt", color: "#94a3b8" }}>{clCompany}</div>}
                                    </div>
                                    <div style={{ flex: 1, padding: "44px 40px 44px 36px", position: "relative" }}>
                                        {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 600, color: "#0f172a", marginBottom: 22 }}>Dear {clHiringManager || "Hiring Team"},</div>}
                                        {clLoading && <div className="cl-loading-text">✨ Creating your cover letter...</div>}
                                        {!clLoading && clEditMode && <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="cl-edit-area" style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight }} />}
                                        {!clLoading && !clEditMode && cleanedText && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#1e293b", whiteSpace: "pre-wrap", textAlign: "justify", marginBottom: 16 }}>{cleanedText}</div>}
                                        {!clLoading && !clEditMode && !cleanedText && <div className="cl-empty-text" style={{ paddingTop: 40 }}>Your cover letter will appear here.<br />Fill in the form,<br />then click Generate ✨</div>}
                                        {cleanedText && !clLoading && !clEditMode && (
                                            <div style={{ marginTop: 28 }}>
                                                <div style={{ fontSize: "11pt", color: "#1e293b", marginBottom: 28 }}>Sincerely,</div>
                                                <div style={{ width: 40, height: 3, background: "#2563eb", marginBottom: 10 }} />
                                                <div style={{ fontFamily: clHeadingFont, fontSize: "13pt", fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{name || "Your Name"}</div>
                                                <div style={{ fontSize: "9pt", color: "#64748b" }}>Applying for: {jt}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── MINIMAL TEMPLATE ── */}
                            {clTemplate === "minimal" && (
                                <div className="cl-paper" style={{ padding: "64px 80px" }}>
                                    <div style={{ fontFamily: clHeadingFont, fontSize: "22pt", fontWeight: 700, color: "#111827", letterSpacing: -0.5, marginBottom: 3 }}>{name || "Your Name"}</div>
                                    {jt && <div style={{ fontSize: "10pt", color: "#6b7280", fontWeight: 500, marginBottom: 10 }}>Applying for: {jt}</div>}
                                    <div style={{ fontSize: "8.5pt", color: "#9ca3af" }}>{[email, phone, location].filter(Boolean).join("  |  ")}</div>
                                    <div style={{ width: 32, height: 3, background: "#111827", margin: "18px 0 20px" }} />
                                    <div style={{ fontSize: "9pt", color: "#9ca3af", marginBottom: 16 }}>{date}</div>
                                    <div style={{ marginBottom: 22 }}>
                                        {clHiringManager && <div style={{ fontSize: "10.5pt", fontWeight: 700, color: "#111827", marginBottom: 1 }}>{clHiringManager}</div>}
                                        {clCompany && <div style={{ fontSize: "10pt", color: "#6b7280" }}>{clCompany}</div>}
                                    </div>
                                    {!clLoading && <div style={{ fontFamily: clHeadingFont, fontSize: "11pt", fontWeight: 600, color: "#111827", marginBottom: 18 }}>Dear {clHiringManager || "Hiring Team"},</div>}
                                    {clLoading && <div className="cl-loading-text">✨ Creating your cover letter...</div>}
                                    {!clLoading && clEditMode && <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="cl-edit-area" style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight }} />}
                                    {!clLoading && !clEditMode && cleanedText && <div style={{ fontFamily: clBodyFont, fontSize: `${clFontSize}pt`, lineHeight: clLineHeight, color: "#374151", whiteSpace: "pre-wrap", textAlign: "left", marginBottom: 16 }}>{cleanedText}</div>}
                                    {!clLoading && !clEditMode && !cleanedText && <div className="cl-empty-text" style={{ paddingTop: 40 }}>Your cover letter will appear here.<br />Fill in the form,<br />then click Generate ✨</div>}
                                    {cleanedText && !clLoading && !clEditMode && (
                                        <div style={{ marginTop: 28 }}>
                                            <div style={{ fontSize: "10.5pt", color: "#374151", marginBottom: 24 }}>Sincerely,</div>
                                            <div style={{ fontFamily: clHeadingFont, fontSize: "12pt", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{name || "Your Name"}</div>
                                            <div style={{ fontSize: "9pt", color: "#9ca3af" }}>Applying for: {jt}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>{/* cl-page-wrap */}
                        </div>{/* cl-page-wrap-outer */}
                    </div>{/* cl-preview-scroll */}
                </div>{/* cl-right */}
            </div>{/* end cl-body */}

            {/* ── Mobile Bottom Nav ── */}
            <nav className="cl-bottom-nav">
                <button className={mobileTab === "form" && leftTab === "generate" ? "active" : ""}
                    onClick={() => { setMobileTab("form"); setLeftTab("generate"); }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Generate
                </button>
                <button className={mobileTab === "form" && leftTab === "cv" ? "active" : ""}
                    onClick={() => { setMobileTab("form"); setLeftTab("cv"); }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    CV Info
                </button>
                <button className={mobileTab === "preview" ? "active" : ""}
                    onClick={() => setMobileTab("preview")}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    Preview
                </button>
                <button onClick={downloadCoverLetterPDF} disabled={!coverLetter || clDownloading}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    PDF
                </button>
            </nav>
        </div>
    );
}
