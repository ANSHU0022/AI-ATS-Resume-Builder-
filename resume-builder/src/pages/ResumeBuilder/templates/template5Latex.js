function escapeLatex(value = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}$&#_%])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function escapeLatexUrl(value = "") {
  const raw = String(value).trim().replace(/\\/g, "/");
  if (!raw) return "";
  const normalized = /^(mailto:|https?:\/\/|ftp:\/\/)/i.test(raw) ? raw : `https://${raw}`;
  return encodeURI(normalized);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanBullet(value = "") {
  return String(value).replace(/^[\s\u2022\-*.]+/, "").trim();
}

function buildIconLink(icon, label, href) {
  if (!hasText(href)) return "";
  return `\\href{${escapeLatexUrl(href)}}{${icon}\\ \\underline{${escapeLatex(label)}}}`;
}

function buildExternalIcon(href) {
  if (!hasText(href)) return "";
  return `\\ \\href{${escapeLatexUrl(href)}}{\\faExternalLink}`;
}

function buildHeading(personal = {}) {
  const contactParts = [
    hasText(personal.phone) ? `\\faPhone\\ \\underline{${escapeLatex(personal.phone)}}` : "",
    hasText(personal.email)
      ? `\\href{mailto:${encodeURI(String(personal.email).trim())}}{\\faEnvelope\\ \\underline{${escapeLatex(personal.email)}}}`
      : "",
    buildIconLink("\\faLinkedinSquare", "Linkedin", personal.linkedin),
    buildIconLink("\\faGithub", "Github", personal.github),
    buildIconLink("\\faGlobe", "Portfolio", personal.portfolio),
  ].filter(Boolean);

  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(personal.name || "Your Name")}} \\\\ \\vspace{1pt}
    ${hasText(personal.location) ? `${escapeLatex(personal.location)} \\\\ \\vspace{2pt}` : ""}
    \\small ${contactParts.join(" ~ ")}
\\end{center}`;
}

function buildSummary(summary) {
  if (!hasText(summary)) return "";
  return `\\section{Summary}
\\small{
    ${escapeLatex(summary.trim())}
}
`;
}

function buildEducation(education = []) {
  const rows = education.filter((item) => hasText(item.degree) || hasText(item.institution));
  if (!rows.length) return "";

  return `\\section{Education}
  \\resumeSubHeadingListStart
${rows.map((item) => `    \\resumeSubheading
      {${escapeLatex(item.institution || "")}}{${escapeLatex(item.location || "")}}
      {${escapeLatex(item.degree || "")}${hasText(item.cgpa) ? `, CGPA: ${escapeLatex(item.cgpa)}` : ""}}{${escapeLatex(item.year || "")}}`).join("\n")}
  \\resumeSubHeadingListEnd
`;
}

function buildSkills(skills = []) {
  const rows = skills.filter((item) => hasText(item.category) && hasText(item.items));
  if (!rows.length) return "";

  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${rows.map((item) => `     \\textbf{${escapeLatex(item.category)}}{: ${escapeLatex(item.items)}} \\\\`).join("\n")}
    }}
 \\end{itemize}
`;
}

function buildBulletList(items = []) {
  const valid = items.map(cleanBullet).filter(hasText);
  if (!valid.length) return "";

  return `\\resumeItemListStart
${valid.map((item) => `        \\resumeItem{\\normalsize{${escapeLatex(item)}}}`).join("\n")}
      \\resumeItemListEnd`;
}

function buildExperience(experience = []) {
  const rows = experience.filter((item) => hasText(item.role) || hasText(item.company));
  if (!rows.length) return "";

  return `\\section{Experience}
  \\resumeSubHeadingListStart
${rows.map((item) => `    \\resumeSubheading
      {${escapeLatex(item.company || "")}${buildExternalIcon(item.link)}}{${escapeLatex(item.duration || "")}}
      {\\underline{${escapeLatex(item.role || "")}}}{${escapeLatex(item.location || "")}}
      \\vspace{-2pt}
      ${buildBulletList(item.bullets) || "\\resumeItemListStart\n        \\resumeItem{Add impact-focused bullet points here.}\n      \\resumeItemListEnd"}`).join("\n\n")}
  \\resumeSubHeadingListEnd
\\vspace{-12pt}
`;
}

function buildProjects(projects = []) {
  const rows = projects.filter((item) => hasText(item.name));
  if (!rows.length) return "";

  return `\\section{Projects}
    \\vspace{-5pt}
    \\resumeSubHeadingListStart
${rows.map((item) => `      \\resumeProjectHeading
          {\\textbf{\\large{\\underline{${escapeLatex(item.name)}}}}${buildExternalIcon(item.link)}${hasText(item.tech) ? ` $|$ \\large{\\underline{${escapeLatex(item.tech)}}}` : ""}}{${escapeLatex(item.year || item.date || "")}}\\\\
          ${buildBulletList(item.bullets)?.replace(/^/gm, "  ").trim() || "\\resumeItemListStart\n            \\resumeItem{\\normalsize{Describe the project impact here.}}\n          \\resumeItemListEnd"}
          \\vspace{-13pt}`).join("\n\n")}
    \\resumeSubHeadingListEnd
`;
}

function buildCertifications(certifications = []) {
  const rows = certifications.filter((item) => hasText(item.name));
  if (!rows.length) return "";

  return `\\section{Certifications}
\\small
${rows.map((item) => {
    const certLine = [
      `${hasText(item.link) ? `\\href{${escapeLatexUrl(item.link)}}{${escapeLatex(item.name)}}${buildExternalIcon(item.link)}` : escapeLatex(item.name)}`,
      hasText(item.issuer) ? `- ${escapeLatex(item.issuer)}` : "",
      hasText(item.year) ? `(${escapeLatex(item.year)})` : "",
    ].filter(Boolean).join(" ");
    return `$\\sbullet[.75] \\hspace{0.1cm}$ ${certLine}\\\\`;
  }).join("\n")}
\\vspace{-8pt}
`;
}

function buildAchievements(achievements = []) {
  const rows = achievements.filter((item) => hasText(item.title));
  if (!rows.length) return "";

  return `\\section{Awards \\& Achievements}
  \\resumeSubHeadingListStart
${rows.map((item) => `    \\resumeProjectHeading
      {${escapeLatex(item.title)}${hasText(item.url) ? `\\ \\href{${escapeLatexUrl(item.url)}}{\\faExternalLink}` : ""}}{}
`).join("\n")}
  \\resumeSubHeadingListEnd
`;
}

export function buildTemplate5Latex(data) {
  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome}
\\usepackage{multicol}
\\usepackage{graphicx}
\\input{glyphtounicode}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\large#1} & \\textbf{\\small #2} \\\\
      \\textit{\\large#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\newcommand\\sbullet[1][.5]{\\mathbin{\\vcenter{\\hbox{\\scalebox{#1}{$\\bullet$}}}}}

\\begin{document}

${buildHeading(data.personal)}

${buildSummary(data.summary)}
${buildEducation(data.education)}
${buildSkills(data.skills)}
${buildExperience(data.experience)}
${buildProjects(data.projects)}
${buildCertifications(data.certifications)}
${buildAchievements(data.achievements)}

\\end{document}
`;
}
