const linkIconStyle = {
  marginLeft: 3,
  verticalAlign: "middle",
  flexShrink: 0,
};

const platformIconStyle = {
  flexShrink: 0,
};

function LinkedInIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={platformIconStyle}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <path d="M2 9h4v12H2z" />
      <path d="M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={platformIconStyle}>
      <path d="M9 19c-5 1.5-5-2.5-7-3" />
      <path d="M16 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={platformIconStyle}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={linkIconStyle}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}

function LinkWithIcon({ url, label, text, platformIcon }) {
  if (!url) return null;
  return (
    <a
      href={normalizeUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#111", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
      title={text || url}
    >
      {platformIcon}
      <span>{label}</span>
    </a>
  );
}

function SectionTitle({ children, headingFontFamily, withRule = true }) {
  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 7,
        paddingBottom: 2,
        borderBottom: withRule ? "1px solid #000" : "none",
        fontSize: "12pt",
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}),
      }}
    >
      {children}
    </div>
  );
}

function BulletList({ items }) {
  const validItems = (items || []).filter((item) => item?.trim());
  if (!validItems.length) return null;

  return (
    <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
      {validItems.map((item, index) => (
        <li key={index} style={{ marginBottom: 4 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Template4({ data, headingFont, bodyFont, fontSize = 9, lineHeight = 1.45 }) {
  const hf = headingFont?.family || "'Segoe UI', sans-serif";
  const bf = bodyFont?.family || "'Segoe UI', sans-serif";
  const { personal: p, summary, skills, education, experience, projects, certifications, achievements } = data;

  const hasEducation = education.some((item) => item.degree || item.institution);
  const hasSkills = skills.some((item) => item.items?.trim());
  const hasExperience = experience.some((item) => item.role || item.company);
  const hasProjects = projects.some((item) => item.name);
  const hasCertifications = certifications.some((item) => item.name);
  const hasAchievements = achievements?.some((item) => item.title);

  return (
    <div
      style={{
        fontFamily: bf,
        fontSize: `${fontSize}pt`,
        fontWeight: 400,
        color: "#130810",
        background: "#fff",
        padding: "26px 34px 30px",
        lineHeight,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: "22pt", fontWeight: 600, fontFamily: hf, letterSpacing: 0.2 }}>
          {p.name || "Your Name"}
        </div>
        {p.location && <div style={{ marginTop: 2, fontSize: "9.5pt" }}>{p.location}</div>}
        <div style={{ marginTop: 4, fontSize: "8.8pt", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 12px" }}>
          {p.phone && <span>{p.phone}</span>}
          {p.email && (
            <a href={`mailto:${p.email}`} style={{ color: "#111", textDecoration: "underline" }}>
              {p.email}
            </a>
          )}
          {p.linkedin && <LinkWithIcon url={p.linkedin} label="Linkedin" platformIcon={<LinkedInIcon />} />}
          {p.github && <LinkWithIcon url={p.github} label="Github" platformIcon={<GithubIcon />} />}
          {p.portfolio && <LinkWithIcon url={p.portfolio} label="Portfolio" platformIcon={<PortfolioIcon />} />}
        </div>
      </div>

      {summary?.trim() && (
        <>
          <SectionTitle headingFontFamily={hf}>Summary</SectionTitle>
          <div style={{ marginBottom: 4 }}>{summary}</div>
        </>
      )}

      {hasEducation && (
        <>
          <SectionTitle headingFontFamily={hf}>Education</SectionTitle>
          {education.filter((item) => item.degree || item.institution).map((item, index) => (
            <div key={index} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 600, fontSize: "10.4pt", fontFamily: hf }}>{item.institution}</div>
                <div style={{ fontWeight: 500, fontSize: "8.7pt" }}>{item.year}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontStyle: "italic", fontSize: "9.6pt" }}>
                  {item.degree}
                  {item.cgpa ? ` - CGPA - ${item.cgpa}` : ""}
                </div>
                <div style={{ fontStyle: "italic", fontSize: "8.7pt" }}>{item.location}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {hasSkills && (
        <>
          <SectionTitle headingFontFamily={hf}>Technical Skills</SectionTitle>
          <div style={{ marginBottom: 6 }}>
            {skills.filter((item) => item.items?.trim()).map((item, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{item.category} :</span> {item.items}
              </div>
            ))}
          </div>
        </>
      )}

      {hasExperience && (
        <>
          <SectionTitle headingFontFamily={hf}>Experience</SectionTitle>
          {experience.filter((item) => item.role || item.company).map((item, index) => (
            <div key={index} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 600, fontSize: "10.3pt", fontFamily: hf, display: "inline-flex", alignItems: "center" }}>
                  <span>{item.company}</span>
                  {item.link && <a href={normalizeUrl(item.link)} target="_blank" rel="noopener noreferrer" style={{ color: "#111", display: "inline-flex" }}><ExternalLinkIcon /></a>}
                </div>
                <div style={{ fontWeight: 500, fontSize: "8.7pt" }}>{item.duration}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontStyle: "italic", fontSize: "9.5pt", textDecoration: "underline" }}>Role - {item.role}</div>
                <div style={{ fontStyle: "italic", fontSize: "8.7pt" }}>{item.location}</div>
              </div>
              <BulletList items={item.bullets} />
            </div>
          ))}
        </>
      )}

      {hasProjects && (
        <>
          <SectionTitle headingFontFamily={hf}>Projects</SectionTitle>
          {projects.filter((item) => item.name).map((item, index) => (
            <div key={index} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  {item.link ? (
                    <a href={normalizeUrl(item.link)} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline", fontWeight: 600, fontSize: "10.3pt", fontFamily: hf, display: "inline-flex", alignItems: "center" }}>
                      <span>{item.name}</span>
                      <ExternalLinkIcon />
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: "10.3pt", fontFamily: hf, textDecoration: "underline" }}>{item.name}</span>
                  )}
                  {item.tech && <span style={{ fontSize: "9.4pt" }}>| {item.tech}</span>}
                </div>
              </div>
              <BulletList items={item.bullets} />
            </div>
          ))}
        </>
      )}

      {hasCertifications && (
        <>
          <SectionTitle headingFontFamily={hf}>Certifications</SectionTitle>
          <div style={{ marginBottom: 4 }}>
            {certifications.filter((item) => item.name).map((item, index) => (
              <div key={index} style={{ marginBottom: 5 }}>
                <span style={{ marginRight: 8 }}>•</span>
                {item.link ? (
                  <a href={normalizeUrl(item.link)} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>
                    {item.name}
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
                {item.issuer ? ` - ${item.issuer}` : ""}
                {item.year ? ` (${item.year})` : ""}
              </div>
            ))}
          </div>
        </>
      )}

      {hasAchievements && (
        <>
          <SectionTitle headingFontFamily={hf}>Achievements</SectionTitle>
          <div>
            {achievements.filter((item) => item.title).map((item, index) => (
              <div key={index} style={{ marginBottom: 5 }}>
                <span style={{ marginRight: 8 }}>•</span>
                {item.url ? (
                  <a href={normalizeUrl(item.url)} target="_blank" rel="noopener noreferrer" style={{ color: "#111", textDecoration: "underline" }}>
                    {item.title}
                  </a>
                ) : (
                  <span>{item.title}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
