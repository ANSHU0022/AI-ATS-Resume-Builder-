import { useState, useEffect, useRef } from "react";

const Blink = () => {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(v => !v), 900); return () => clearInterval(t); }, []);
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c5cbf", display: "inline-block", opacity: on ? 1 : 0.3, transition: "opacity .5s" }} />;
};

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
    <circle cx="8" cy="8" r="7.5" stroke="#7c5cbf" strokeWidth="1" fill="rgba(124,92,191,0.08)" />
    <polyline points="5,8 7,10.5 11,5.5" stroke="#7c5cbf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SVG1 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="300" y1="0" x2="300" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <rect x="120" y="20" width="160" height="160" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    <rect x="120" y="20" width="160" height="5" rx="2" fill="url(#gg1)" />
    <defs><linearGradient id="gg1" x1="120" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#c8963e" /><stop offset="100%" stopColor="#f0c878" /></linearGradient></defs>
    <circle cx="155" cy="52" r="14" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    <text x="155" y="57" textAnchor="middle" fontSize="12" fill="white" fontFamily="sans-serif" fontWeight="700">A</text>
    <rect x="176" y="44" width="70" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
    <rect x="176" y="54" width="50" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <rect x="130" y="78" width="40" height="4" rx="2" fill="#c8963e" opacity="0.9" />
    <rect x="130" y="87" width="130" height="3.5" rx="1.75" fill="rgba(255,255,255,0.5)" />
    <rect x="130" y="93" width="110" height="3.5" rx="1.75" fill="rgba(255,255,255,0.35)" />
    <rect x="130" y="99" width="120" height="3.5" rx="1.75" fill="rgba(255,255,255,0.35)" />
    <rect x="130" y="110" width="55" height="4" rx="2" fill="#c8963e" opacity="0.9" />
    <rect x="130" y="119" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
    <rect x="130" y="126" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
    <rect x="130" y="133" width="120" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    <circle cx="230" cy="165" r="6" fill="rgba(255,255,255,0.9)" />
    <circle cx="245" cy="165" r="6" fill="rgba(200,150,62,0.7)" />
    <circle cx="260" cy="165" r="6" fill="rgba(255,255,255,0.3)" />
    <rect x="133" y="156" width="50" height="18" rx="6" fill="rgba(124,92,191,0.8)" />
    <text x="158" y="169" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="600">↓ Download</text>
    <rect x="280" y="60" width="80" height="28" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <text x="320" y="72" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif" fontWeight="600">FONT</text>
    <text x="320" y="83" textAnchor="middle" fontSize="10" fill="white" fontFamily="serif" fontWeight="700">Sora</text>
    <rect x="30" y="80" width="70" height="40" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="65" y="97" textAnchor="middle" fontSize="18" fill="white" fontFamily="sans-serif" fontWeight="800">8</text>
    <text x="65" y="112" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">Sections</text>
  </svg>
);

const SVG2 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <line x1="0" y1="66" x2="400" y2="66" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="0" y1="133" x2="400" y2="133" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="133" y1="0" x2="133" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="266" y1="0" x2="266" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <rect x="100" y="25" width="200" height="110" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />
    <circle cx="200" cy="65" r="22" fill="rgba(255,255,255,0.12)" />
    <line x1="200" y1="75" x2="200" y2="53" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <polyline points="192,61 200,53 208,61" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="200" y="102" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="600">Drop your PDF here</text>
    <text x="200" y="116" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">or click to browse</text>
    <rect x="60" y="148" width="280" height="30" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <rect x="68" y="156" width="180" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
    <rect x="68" y="156" width="140" height="6" rx="3" fill="url(#gprog2)" />
    <defs><linearGradient id="gprog2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7c5cbf" /><stop offset="100%" stopColor="#c8963e" /></linearGradient></defs>
    <text x="258" y="163" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">AI Parsing…</text>
    <rect x="20" y="40" width="68" height="20" rx="6" fill="rgba(124,92,191,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="54" y="54" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Experience</text>
    <rect x="20" y="68" width="60" height="20" rx="6" fill="rgba(124,92,191,0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="50" y="82" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Skills</text>
    <rect x="20" y="96" width="70" height="20" rx="6" fill="rgba(124,92,191,0.35)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <text x="55" y="110" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Education</text>
    <rect x="312" y="40" width="70" height="20" rx="6" fill="rgba(200,150,62,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="347" y="54" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Summary</text>
    <rect x="315" y="68" width="65" height="20" rx="6" fill="rgba(200,150,62,0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="348" y="82" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="600">Projects</text>
  </svg>
);

const SVG3 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <circle cx="200" cy="100" r="120" fill="rgba(255,255,255,0.03)" />
    <circle cx="200" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
    <circle cx="200" cy="75" r="30" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="200" y1="38" x2="200" y2="30" stroke="#f0c878" strokeWidth="2" strokeLinecap="round" />
    <line x1="222" y1="45" x2="227" y2="38" stroke="#f0c878" strokeWidth="2" strokeLinecap="round" />
    <line x1="237" y1="65" x2="244" y2="62" stroke="#f0c878" strokeWidth="2" strokeLinecap="round" />
    <line x1="178" y1="45" x2="173" y2="38" stroke="#f0c878" strokeWidth="2" strokeLinecap="round" />
    <line x1="163" y1="65" x2="156" y2="62" stroke="#f0c878" strokeWidth="2" strokeLinecap="round" />
    <text x="200" y="82" textAnchor="middle" fontSize="20" fill="white" fontFamily="sans-serif" fontWeight="800">AI</text>
    <rect x="90" y="118" width="220" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
    <rect x="90" y="128" width="190" height="5" rx="2.5" fill="rgba(255,255,255,0.45)" />
    <rect x="90" y="138" width="210" height="5" rx="2.5" fill="rgba(255,255,255,0.45)" />
    <rect x="90" y="148" width="160" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
    <rect x="252" y="148" width="2" height="11" rx="1" fill="white" opacity="0.8" />
    <rect x="130" y="165" width="140" height="24" rx="8" fill="rgba(155,125,212,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <text x="200" y="181" textAnchor="middle" fontSize="9.5" fill="white" fontFamily="sans-serif" fontWeight="700">↺ Regenerate Summary</text>
    <rect x="310" y="118" width="60" height="30" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    <text x="340" y="131" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">Versions</text>
    <text x="340" y="143" textAnchor="middle" fontSize="13" fill="white" fontFamily="sans-serif" fontWeight="800">∞</text>
  </svg>
);

const SVG4 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <rect x="40" y="20" width="130" height="155" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    <rect x="40" y="20" width="130" height="4" rx="2" fill="rgba(200,150,62,0.8)" />
    <text x="105" y="40" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif" fontWeight="600">JOB DESCRIPTION</text>
    <rect x="52" y="48" width="106" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <rect x="52" y="56" width="90" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="52" y="68" width="40" height="14" rx="4" fill="rgba(200,150,62,0.4)" stroke="rgba(200,150,62,0.7)" strokeWidth="1" />
    <text x="72" y="79" textAnchor="middle" fontSize="7.5" fill="#f0c878" fontFamily="sans-serif" fontWeight="700">Python</text>
    <rect x="97" y="68" width="30" height="14" rx="4" fill="rgba(200,150,62,0.4)" stroke="rgba(200,150,62,0.7)" strokeWidth="1" />
    <text x="112" y="79" textAnchor="middle" fontSize="7.5" fill="#f0c878" fontFamily="sans-serif" fontWeight="700">SQL</text>
    <rect x="52" y="88" width="46" height="14" rx="4" fill="rgba(200,150,62,0.4)" stroke="rgba(200,150,62,0.7)" strokeWidth="1" />
    <text x="75" y="99" textAnchor="middle" fontSize="7.5" fill="#f0c878" fontFamily="sans-serif" fontWeight="700">Power BI</text>
    <rect x="103" y="88" width="38" height="14" rx="4" fill="rgba(200,150,62,0.35)" stroke="rgba(200,150,62,0.6)" strokeWidth="1" />
    <text x="122" y="99" textAnchor="middle" fontSize="7.5" fill="#f0c878" fontFamily="sans-serif" fontWeight="700">Pandas</text>
    <rect x="52" y="108" width="95" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    <rect x="52" y="116" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="52" y="124" width="100" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="52" y="132" width="70" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
    <circle cx="200" cy="100" r="18" fill="rgba(74,154,106,0.4)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <text x="200" y="105" textAnchor="middle" fontSize="14" fill="white" fontFamily="sans-serif">→</text>
    <rect x="230" y="20" width="130" height="155" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    <rect x="230" y="20" width="130" height="4" rx="2" fill="rgba(74,154,106,0.8)" />
    <text x="295" y="40" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif" fontWeight="600">YOUR RESUME</text>
    <rect x="242" y="48" width="106" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <rect x="242" y="56" width="90" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="242" y="68" width="40" height="14" rx="4" fill="rgba(74,154,106,0.5)" stroke="rgba(100,200,140,0.7)" strokeWidth="1" />
    <text x="262" y="79" textAnchor="middle" fontSize="7.5" fill="#a0e8b8" fontFamily="sans-serif" fontWeight="700">✓ Python</text>
    <rect x="287" y="68" width="30" height="14" rx="4" fill="rgba(74,154,106,0.5)" stroke="rgba(100,200,140,0.7)" strokeWidth="1" />
    <text x="302" y="79" textAnchor="middle" fontSize="7.5" fill="#a0e8b8" fontFamily="sans-serif" fontWeight="700">✓ SQL</text>
    <rect x="242" y="88" width="46" height="14" rx="4" fill="rgba(74,154,106,0.5)" stroke="rgba(100,200,140,0.7)" strokeWidth="1" />
    <text x="265" y="99" textAnchor="middle" fontSize="7.5" fill="#a0e8b8" fontFamily="sans-serif" fontWeight="700">✓ Power BI</text>
    <rect x="242" y="108" width="95" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    <rect x="242" y="116" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="242" y="148" width="106" height="20" rx="6" fill="rgba(74,154,106,0.4)" stroke="rgba(100,200,140,0.5)" strokeWidth="1" />
    <text x="295" y="162" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="700">Match Score: 87%</text>
  </svg>
);

const SVG5 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <rect x="60" y="50" width="280" height="130" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    <path d="M60 50 L200 130 L340 50 Z" fill="rgba(200,150,62,0.2)" stroke="rgba(200,150,62,0.4)" strokeWidth="1.5" />
    <line x1="60" y1="180" x2="200" y2="130" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="340" y1="180" x2="200" y2="130" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <rect x="110" y="20" width="180" height="120" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    <rect x="110" y="20" width="180" height="4" rx="2" fill="url(#gcov5)" />
    <defs><linearGradient id="gcov5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c8963e" /><stop offset="100%" stopColor="#9b7dd4" /></linearGradient></defs>
    <text x="200" y="40" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif" fontWeight="600">COVER LETTER</text>
    <rect x="122" y="48" width="156" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
    <rect x="122" y="56" width="130" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <rect x="122" y="66" width="150" height="3.5" rx="1.75" fill="rgba(255,255,255,0.35)" />
    <rect x="122" y="74" width="140" height="3.5" rx="1.75" fill="rgba(255,255,255,0.3)" />
    <rect x="122" y="82" width="155" height="3.5" rx="1.75" fill="rgba(255,255,255,0.3)" />
    <rect x="122" y="90" width="120" height="3.5" rx="1.75" fill="rgba(255,255,255,0.25)" />
    <rect x="122" y="100" width="145" height="3.5" rx="1.75" fill="rgba(255,255,255,0.25)" />
    <rect x="122" y="108" width="110" height="3.5" rx="1.75" fill="rgba(255,255,255,0.2)" />
    <rect x="270" y="46" width="32" height="16" rx="5" fill="rgba(155,125,212,0.7)" />
    <text x="286" y="57" textAnchor="middle" fontSize="7.5" fill="white" fontFamily="sans-serif" fontWeight="700">AI ✦</text>
    <rect x="20" y="60" width="76" height="22" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="58" y="70" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">Job Description</text>
    <text x="58" y="79" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="600">✓ Uploaded</text>
    <rect x="20" y="90" width="76" height="22" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    <text x="58" y="100" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">Your Resume</text>
    <text x="58" y="109" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="600">✓ Analysed</text>
  </svg>
);

const SVG6 = () => (
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
    <rect x="20" y="15" width="190" height="165" rx="10" fill="rgba(10,10,30,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <rect x="20" y="15" width="190" height="22" rx="10" fill="rgba(255,255,255,0.08)" />
    <rect x="20" y="26" width="190" height="11" fill="rgba(255,255,255,0.08)" />
    <circle cx="35" cy="26" r="4" fill="rgba(255,80,80,0.6)" />
    <circle cx="48" cy="26" r="4" fill="rgba(255,180,30,0.6)" />
    <circle cx="61" cy="26" r="4" fill="rgba(50,200,80,0.6)" />
    <text x="140" y="29" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">resume.tex</text>
    <text x="30" y="52" fontSize="8" fill="#9b7dd4" fontFamily="monospace">\documentclass</text>
    <text x="122" y="52" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{"{article}"}</text>
    <text x="30" y="64" fontSize="8" fill="#9b7dd4" fontFamily="monospace">\usepackage</text>
    <text x="108" y="64" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="monospace">{"{geometry}"}</text>
    <text x="30" y="76" fontSize="8" fill="#c8963e" fontFamily="monospace">\begin</text>
    <text x="72" y="76" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{"{document}"}</text>
    <text x="30" y="88" fontSize="8" fill="#9b7dd4" fontFamily="monospace">\name</text>
    <text x="30" y="100" fontSize="8" fill="#9b7dd4" fontFamily="monospace">\section</text>
    <text x="30" y="112" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="monospace">  Lead Data Analyst</text>
    <text x="30" y="124" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">  Google, 2021–Now</text>
    <text x="30" y="136" fontSize="8" fill="#9b7dd4" fontFamily="monospace">\section</text>
    <text x="30" y="148" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">  Python, SQL, Power BI</text>
    <text x="30" y="160" fontSize="8" fill="#c8963e" fontFamily="monospace">\end</text>
    <rect x="40" y="167" width="150" height="20" rx="6" fill="rgba(124,92,191,0.7)" stroke="rgba(155,125,212,0.5)" strokeWidth="1" />
    <text x="115" y="181" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="700">▶ Compile &amp; Preview</text>
    <rect x="222" y="15" width="158" height="165" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    <text x="301" y="32" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif" fontWeight="600">LIVE PREVIEW</text>
    <rect x="222" y="35" width="158" height="1" fill="rgba(255,255,255,0.1)" />
    <text x="301" y="56" textAnchor="middle" fontSize="10" fill="white" fontFamily="serif" fontWeight="700">Anshu Prasad</text>
    <text x="301" y="67" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.45)" fontFamily="sans-serif">Data Analyst · Bangalore</text>
    <rect x="232" y="73" width="138" height="0.8" fill="rgba(255,255,255,0.15)" />
    <text x="232" y="84" fontSize="7.5" fill="#c8963e" fontFamily="sans-serif" fontWeight="700">EXPERIENCE</text>
    <rect x="232" y="88" width="138" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
    <rect x="232" y="94" width="115" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />
    <rect x="232" y="100" width="128" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />
    <text x="232" y="116" fontSize="7.5" fill="#c8963e" fontFamily="sans-serif" fontWeight="700">SKILLS</text>
    <rect x="232" y="120" width="130" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
    <rect x="232" y="126" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <rect x="232" y="155" width="138" height="18" rx="6" fill="rgba(200,150,62,0.5)" stroke="rgba(200,150,62,0.5)" strokeWidth="1" />
    <text x="301" y="167" textAnchor="middle" fontSize="8.5" fill="white" fontFamily="sans-serif" fontWeight="700">↓ Download PDF</text>
  </svg>
);

const CARDS = [
  { num: "01", title: "ATS Resume Builder", sub: "Fill in your details across 8 smart sections and watch your ATS-optimized resume build itself — ready to download instantly.", bg: "linear-gradient(135deg,#2d1f5e 0%,#5a3fa0 50%,#7c5cbf 100%)", Svg: SVG1, points: ["8 structured sections — Summary, Skills, Experience & more", "Switch fonts & templates with one click", "Download pixel-perfect PDF — ready for any job portal", "Real-time ATS score as you type"] },
  { num: "02", title: "Upload & AI Parse", sub: "Upload your existing resume as a PDF — our AI instantly reads every line and fills all 8 sections automatically, section by section.", bg: "linear-gradient(135deg,#1a2a4a 0%,#2d4a7a 50%,#4a6aa0 100%)", Svg: SVG2, points: ["AI extracts all data from your PDF resume", "Auto-fills every section — zero manual typing", "Edit, refine and re-download after parsing", "Cleans up formatting & ATS-optimizes automatically"] },
  { num: "03", title: "AI Summary Generator", sub: "One click rewrites your professional summary with AI. Regenerate as many times as you want until it sounds perfect.", bg: "linear-gradient(135deg,#3a1a4a 0%,#6a3a8a 50%,#9b5cbf 100%)", Svg: SVG3, points: ["One-click AI summary generation", "Regenerate unlimited times — keep the best", "AI tailors tone for your target industry & role", "Auto-updates instantly in your resume preview"] },
  { num: "04", title: "JD Keyword Matching", sub: "Upload any job description and our AI finds the missing keywords. One click adds them all to your resume automatically.", bg: "linear-gradient(135deg,#1a3a2a 0%,#2d6a4a 50%,#4a9a6a 100%)", Svg: SVG4, points: ["AI scans JD and extracts critical keywords", "Shows matched vs. missing keywords clearly", "One-click auto-injects missing keywords into resume", "Live match score updates as you edit"] },
  { num: "05", title: "AI Cover Letter", sub: "Upload the job description and your resume — AI analyzes both and writes a powerful, personalized cover letter tailored to the exact role.", bg: "linear-gradient(135deg,#4a2a1a 0%,#8a4a2a 50%,#c8963e 100%)", Svg: SVG5, points: ["Analyses your resume + JD for best match", "Generates role-specific, personalized letters", "Multiple tone options — formal, confident, creative", "Edit, regenerate & download as PDF or Word"] },
  { num: "06", title: "LaTeX Editor", sub: "Write or paste your LaTeX code, compile it live, and see your resume render in real time. Download the final PDF with one click.", bg: "linear-gradient(135deg,#1a1a3a 0%,#2a2a6a 50%,#4a4a9a 100%)", Svg: SVG6, points: ["Full LaTeX code editor with syntax highlighting", "Live side-by-side PDF preview as you type", "One-click compile — no local LaTeX install needed", "Download publication-quality PDF instantly"] },
];

const Card = ({ c, i, scrollY, hasScrolled }) => {
  const [hov, setHov] = useState(false);
  const parallax = hasScrolled ? Math.sin((scrollY + i * 140) / 700) * 6 : 0;
  const tiltX = hasScrolled ? Math.sin((scrollY + i * 110) / 1200) * 2 : 0;
  const tiltY = hasScrolled ? Math.cos((scrollY + i * 130) / 1200) * 2 : 0;
  const lift = hov ? -8 : 0;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.52)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.82)",
        borderRadius: 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hov
          ? "0 10px 30px rgba(100,60,180,0.16),0 36px 64px rgba(100,60,180,0.12),inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 2px 8px rgba(100,60,180,0.06),0 10px 32px rgba(100,60,180,0.06),inset 0 1px 0 rgba(255,255,255,0.9)",
        transform: `translateY(${parallax + lift}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
        willChange: "transform",
        transition: "transform .35s cubic-bezier(.25,.46,.45,.94),box-shadow .35s",
        animationName: "cardIn",
        animationDuration: "0.65s",
        animationTimingFunction: "ease",
        animationFillMode: "both",
        animationDelay: `${i * 0.07 + 0.04}s`,
      }}
    >
      {/* illustration */}
      <div style={{ width: "100%", height: 200, background: c.bg, position: "relative", flexShrink: 0, overflow: "hidden" }}>
        <c.Svg />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.06)", pointerEvents: "none" }} />
      </div>

      {/* card body */}
      <div style={{ padding: "24px 26px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* number */}
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: "#7c5cbf", textTransform: "uppercase", opacity: 0.72, marginBottom: 11, fontFamily: "'Sora',sans-serif", display: "block" }}>
          {c.num}
        </span>

        {/* title */}
        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 21, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.2, color: "#111", marginBottom: 9 }}>
          {c.title}
        </h3>

        {/* sub */}
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#555", fontWeight: 400, marginBottom: 18, fontFamily: "'Sora',sans-serif" }}>
          {c.sub}
        </p>

        {/* divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(124,92,191,0.22) 0%,transparent 100%)", marginBottom: 16 }} />

        {/* bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {c.points.map((p, j) => (
            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5, color: "#3d3d3d", lineHeight: 1.55, fontWeight: 500, fontFamily: "'Sora',sans-serif" }}>
              <Check />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ATSForgeFeatures() {
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;}
        @keyframes cardIn{
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        @media(max-width:1024px){.ats-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px){.ats-grid{grid-template-columns:1fr!important;} .ats-section{padding:60px 20px 80px!important;}}
      `}</style>

      <div style={{
        minHeight: "100vh",
        fontFamily: "'Sora',sans-serif",
        /* ── background matching screenshots: pale lavender with soft purple radial blobs ── */
        background: `
          radial-gradient(ellipse 82% 58% at 0% 48%,  rgba(155,90,235,0.36) 0%, transparent 54%),
          radial-gradient(ellipse 62% 62% at 100% 8%,  rgba(195,115,255,0.28) 0%, transparent 50%),
          radial-gradient(ellipse 48% 38% at 52% 100%, rgba(255,175,95,0.10) 0%, transparent 48%),
          #e9e4f5
        `,
        overflowX: "hidden",
      }}>
        <section className="ats-section" style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 56px 108px" }}>

          {/* header */}
          <div style={{ textAlign: "center", marginBottom: 60 }}>

            {/* pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(124,92,191,0.10)",
              border: "1px solid rgba(124,92,191,0.26)",
              padding: "6px 18px", borderRadius: 100,
              fontSize: 11, fontWeight: 700, color: "#7c5cbf",
              letterSpacing: "1.8px", textTransform: "uppercase",
              marginBottom: 28,
            }}>
              <Blink />
              Everything You Need
            </div>

            {/* heading — exactly like screenshot: black serif, italic purple word */}
            <h2 style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: "clamp(40px,4.5vw,60px)",
              fontWeight: 400,
              letterSpacing: "-1.5px",
              lineHeight: 1.08,
              color: "#0e0e0e",
              marginBottom: 18,
            }}>
              Get hired faster with our<br />
              <em style={{ color: "#7c5cbf", fontStyle: "italic" }}>feature-packed</em>{" "}ATS suite
            </h2>

            <p style={{ fontSize: 16, color: "#5a5a6a", fontWeight: 400, lineHeight: 1.7, maxWidth: 520, margin: "0 auto", fontFamily: "'Sora',sans-serif" }}>
              Everything you need to build a professional resume, match job descriptions, and stand out to recruiters — in one place.
            </p>
          </div>

          {/* grid */}
          <div className="ats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, perspective: "1100px" }}>
            {CARDS.map((c, i) => <Card key={i} c={c} i={i} scrollY={scrollY} hasScrolled={hasScrolled} />)}
          </div>

        </section>
      </div>
    </>
  );
}