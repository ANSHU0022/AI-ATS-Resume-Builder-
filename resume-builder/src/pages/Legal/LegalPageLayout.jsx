import { Link } from "react-router-dom";

const shellStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 42%, #f8fafc 100%)",
  padding: "40px 16px 72px",
};

const cardStyle = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
};

const headerStyle = {
  padding: "28px 28px 22px",
  background: "linear-gradient(135deg, #eef2ff 0%, #ecfeff 55%, #ffffff 100%)",
  borderBottom: "1px solid #e2e8f0",
};

const bodyStyle = {
  padding: "28px",
  color: "#334155",
  fontSize: 15,
  lineHeight: 1.75,
};

const navLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 14px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  textDecoration: "none",
  color: "#334155",
  fontWeight: 700,
  fontSize: 13,
  background: "#fff",
};

export default function LegalPageLayout({ title, lastUpdated, intro, sections }) {
  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "inline-flex", padding: "6px 11px", borderRadius: 999, background: "#ffffffd9", border: "1px solid #dbeafe", color: "#4f46e5", fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>
                ATSForge Legal
              </div>
              <h1 style={{ margin: "0 0 8px 0", fontSize: 34, lineHeight: 1.1, letterSpacing: -0.9, color: "#0f172a" }}>{title}</h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 700 }}>Last updated: {lastUpdated}</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/" style={navLinkStyle}>Home</Link>
              <Link to="/builder" style={navLinkStyle}>Resume Builder</Link>
            </div>
          </div>
          <p style={{ margin: "16px 0 0 0", color: "#475569", fontSize: 15, lineHeight: 1.7, maxWidth: 760 }}>{intro}</p>
        </div>

        <div style={bodyStyle}>
          {sections.map((section) => (
            <section key={section.title} style={{ marginBottom: 26 }}>
              <h2 style={{ margin: "0 0 10px 0", fontSize: 20, color: "#0f172a", letterSpacing: -0.3 }}>{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} style={{ margin: index === section.paragraphs.length - 1 ? 0 : "0 0 12px 0" }}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
