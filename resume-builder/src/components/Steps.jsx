import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Connector not used anymore — line is drawn as absolute behind all circles

const StepIcon = ({ num }) => {
  const icons = {
    1: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="2" width="10" height="13" rx="2" stroke="#7c5cbf" strokeWidth="1.6" fill="none" /><line x1="7" y1="6.5" x2="11" y2="6.5" stroke="#7c5cbf" strokeWidth="1.4" strokeLinecap="round" /><line x1="7" y1="9.5" x2="11" y2="9.5" stroke="#7c5cbf" strokeWidth="1.4" strokeLinecap="round" /><circle cx="16" cy="15.5" r="5" fill="#e9e4f5" stroke="#7c5cbf" strokeWidth="1.4" /><line x1="16" y1="18" x2="16" y2="13.5" stroke="#7c5cbf" strokeWidth="1.5" strokeLinecap="round" /><polyline points="13.5,15.5 16,13 18.5,15.5" stroke="#7c5cbf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>,
    2: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="5.5" stroke="#7c5cbf" strokeWidth="1.5" fill="none" /><line x1="11" y1="3" x2="11" y2="1.2" stroke="#c8963e" strokeWidth="1.6" strokeLinecap="round" /><line x1="11" y1="20.8" x2="11" y2="19" stroke="#c8963e" strokeWidth="1.6" strokeLinecap="round" /><line x1="19" y1="11" x2="20.8" y2="11" stroke="#c8963e" strokeWidth="1.6" strokeLinecap="round" /><line x1="1.2" y1="11" x2="3" y2="11" stroke="#c8963e" strokeWidth="1.6" strokeLinecap="round" /><line x1="17.2" y1="4.8" x2="18.4" y2="3.6" stroke="#c8963e" strokeWidth="1.4" strokeLinecap="round" /><text x="11" y="14.5" textAnchor="middle" fontSize="6.5" fill="#7c5cbf" fontFamily="sans-serif" fontWeight="800">AI</text></svg>,
    3: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="16" width="16" height="3" rx="1.5" stroke="#7c5cbf" strokeWidth="1.5" fill="none" /><line x1="11" y1="3" x2="11" y2="14" stroke="#7c5cbf" strokeWidth="1.6" strokeLinecap="round" /><polyline points="7,10.5 11,14.5 15,10.5" stroke="#7c5cbf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>,
  };
  return icons[num];
};

/* ─── Image URLs (public/) ─── */
const IMG1 = "/Anshu_Prasad%20_EuropassCV._page-0001.jpg"; // back-left
const IMG2 = "/Anshu_Prasad_Resume_page-0001.jpg"; // front-center (main)
const IMG3 = "/Cover_Letter_Anshu_Prasad_Process_Analyst_page-0001.jpg"; // back-right

/* ─── LEFT PANEL — exact layout from reference image ─── */
const LeftPanel = ({ offsets }) => (
  <div style={{ position: "relative", width: "100%", maxWidth: 600, padding: "56px 48px 90px 48px", minHeight: 660, perspective: 1200 }}>

    {/* ── CARD 1: back-left (more straight) ── */}
    <div style={{
      position: "absolute",
      top: 0,
      left: -100,
      width: "50%",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 6px 28px rgba(40,30,100,0.12)",
      border: "1px solid rgba(210,205,240,0.7)",
      transform: `rotate(-3deg) translate3d(0, ${offsets.card1Y}px, 0)`,
      transformStyle: "preserve-3d",
      willChange: "transform",
      zIndex: 1,
      background: "white",
    }}>
      <img
        src={IMG1}
        alt="Resume template 1"
        style={{ width: "100%", height: 400, objectFit: "contain", objectPosition: "top", display: "block", background: "white" }}
      />
    </div>

    {/* ── CARD 3: back-right (lower + more straight) ── */}
    <div style={{
      position: "absolute",
      top: 335,
      right: -40,
      width: "45%",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 6px 28px rgba(40,30,100,0.12)",
      border: "1px solid rgba(210,205,240,0.7)",
      transform: `rotate(0.5deg) translate3d(0, ${offsets.card3Y}px, 0)`,
      transformStyle: "preserve-3d",
      willChange: "transform",
      zIndex: 1,
      background: "white",
    }}>
      <img
        src={IMG3}
        alt="Resume template 3"
        style={{ width: "100%", height: 360, objectFit: "contain", objectPosition: "top", display: "block", background: "white" }}
      />
    </div>

    {/* ── CARD 2: FRONT CENTER (taller main) ── */}
    <div style={{
      position: "relative",
      zIndex: 3,
      marginTop: 24,
      marginLeft: 28,
      marginRight: 32,
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 16px 56px rgba(40,30,100,0.22), 0 2px 8px rgba(40,30,100,0.08)",
      border: "2px dashed rgba(100,120,200,0.5)",
      background: "white",
      transform: `translate3d(0, ${offsets.card2Y}px, 0)`,
      transformStyle: "preserve-3d",
      willChange: "transform",
    }}>
      <img
        src={IMG2}
        alt="Resume template 2 - Jessie Smith"
        style={{ width: "100%", height: 540, objectFit: "contain", objectPosition: "top", display: "block", background: "white" }}
      />
    </div>

    {/* sparkle decorations top-right like reference */}
    <div style={{ position: "absolute", top: 10, right: 28, color: "#3b3fa0", opacity: 0.55 }}>
      <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
        <line x1="8" y1="0" x2="8" y2="14" stroke="#3b5fa0" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="7" x2="16" y2="7" stroke="#3b5fa0" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="8" x2="22" y2="18" stroke="#3b5fa0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="13" x2="27" y2="13" stroke="#3b5fa0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const STEPS = [
  { num: 1, title: "Upload your resume or fill manually", desc: "Upload your existing PDF resume — AI parses every section instantly. Or build from scratch by filling all 8 sections step by step at your own pace.", delay: 120 },
  { num: 2, title: "Get AI suggestions & auto-formatting", desc: "AI rewrites your summary, injects matching keywords, and formats everything to ATS standards. Pick your favourite template and font with one click.", delay: 260 },
  { num: 3, title: "Download your ATS-optimised CV", desc: "Export a pixel-perfect PDF in seconds — recruiter-ready, ATS-parsed, and built to land interviews. No formatting headaches, ever.", delay: 400 },
];

/* ─── STEPS TIMELINE — single continuous line behind all circles ─── */
import { motion } from "framer-motion";

const StepsTimeline = () => {
  // circle diameter
  const D = 54;
  const gap = 48; // vertical gap between circles

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* continuous vertical line — runs from center of circle 1 to center of circle 3 */}
      <motion.div
        initial={{ height: 0 }}
        whileInView={{ height: "calc(100% - 54px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: D / 2 - 1,           // center of the 54px circle
          top: D / 2,                 // start at bottom edge of first circle
          width: 2,
          background: "linear-gradient(to bottom, rgba(124,92,191,0.45), rgba(124,92,191,0.15))",
          borderRadius: 2,
          zIndex: 0,
        }}
      />

      {STEPS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
          style={{
            display: "flex",
            gap: 22,
            alignItems: "flex-start",
            marginBottom: i < STEPS.length - 1 ? gap : 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* circle icon — bg white so it sits ON TOP of the line cleanly */}
          <div style={{
            width: D, height: D, borderRadius: "50%", flexShrink: 0,
            background: "#ede9f8",
            border: "1.5px solid rgba(124,92,191,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(124,92,191,0.13)",
            position: "relative", zIndex: 2,
          }}>
            <StepIcon num={s.num} />
          </div>

          {/* text */}
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: "#7c5cbf", textTransform: "uppercase", marginBottom: 4, opacity: 0.72, fontFamily: "'Sora',sans-serif" }}>
              Step {s.num}
            </div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, fontWeight: 700, color: "#0f0f1a", marginBottom: 6, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              {s.title}
            </h3>
            <p style={{ fontSize: 13.5, color: "#5a5a6e", lineHeight: 1.7, fontWeight: 400, fontFamily: "'Sora',sans-serif", maxWidth: 390 }}>
              {s.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function ATSForgeHowItWorks() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!hasScrolledRef.current) {
        hasScrolledRef.current = true;
        setHasScrolled(true);
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const p = hasScrolled ? Math.min(scrollY / 900, 1) : 0;
  const offsets = {
    card1Y: -10 * p,
    card2Y: 0 * p,
    card3Y: 16 * p,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        @media(max-width:920px){
          .hiw-wrap { flex-direction: column !important; align-items: center !important; }
          .hiw-left { width: 100% !important; max-width: 460px !important; }
        }
        @media(max-width:600px){
          .hiw-wrap { padding: 0 !important; }
          .hiw-left { display: none !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        fontFamily: "'Sora',sans-serif",
        background: `
          radial-gradient(ellipse 82% 58% at 0% 48%,  rgba(155,90,235,0.32) 0%, transparent 54%),
          radial-gradient(ellipse 62% 62% at 100% 8%,  rgba(195,115,255,0.24) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 55% 100%, rgba(255,175,95,0.09) 0%, transparent 48%),
          #e9e4f5
        `,
        display: "flex",
        alignItems: "center",
        padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 56px)",
      }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", width: "100%" }}>
          <div className="hiw-wrap" style={{ display: "flex", alignItems: "center", gap: 72, padding: "0 16px" }}>

            {/* LEFT */}
            <div className="hiw-left" style={{ flex: "0 0 auto", width: "46%" }}>
              <LeftPanel offsets={offsets} />
            </div>

            {/* RIGHT */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: "clamp(32px,3.8vw,50px)",
                fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.1,
                color: "#0f0f1a", marginBottom: 46,
              }}>
                Create your job-winning,{" "}
                <span style={{ color: "#7c5cbf", fontStyle: "italic" }}>
                  ATS-friendly CV in 3 steps
                </span>
              </h2>

              <StepsTimeline />

              <div style={{ marginTop: 38 }}>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); navigate('/builder'); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#7c5cbf", textDecoration: "none", borderBottom: "2px solid rgba(124,92,191,0.3)", paddingBottom: 2, fontFamily: "'Sora',sans-serif", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#5a3fa0"; e.currentTarget.style.borderColor = "#5a3fa0"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#7c5cbf"; e.currentTarget.style.borderColor = "rgba(124,92,191,0.3)"; }}
                >
                  Build my ATS CV
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
