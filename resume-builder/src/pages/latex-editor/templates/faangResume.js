export const faangResume = `\\documentclass[letterpaper,11pt]{article}

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
\\input{glyphtounicode}

% Font options
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\raggedright\\large\\bfseries
}{}{0em}{\\MakeUppercase}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
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
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape First Last} \\\\ \\vspace{1pt}
    \\small City, State $|$ 123-456-7890 $|$ \\href{mailto:email@example.com}{\\underline{email@example.com}} $|$ 
    \\href{https://linkedin.com/in/username}{\\underline{Linkedin}} $|$
    \\href{https://github.com/username}{\\underline{Github}} $|$
    \\href{https://portfolio.com}{\\underline{Portfolio}}
\\end{center}

%-----------SUMMARY-----------
\\section{Summary}
\\small{
    Results-driven Software Engineer with 5+ years of experience in designing and leading the development of scalable backend systems and robust web applications. Proven expertise in optimizing database performance, implementing CI/CD pipelines, and driving AI-driven feature integrations to deliver high business value.
}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {University Name}{City, State}
      {Bachelor of Science in Computer Science}{Aug. 2018 -- May 2022}
  \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Programming}{: Python, Java, C++, JavaScript, TypeScript, Go, SQL} \\\\
     \\textbf{Databases}{: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB} \\\\
     \\textbf{AI / Automation}{: PyTorch, TensorFlow, LangChain, OpenAI API, GitHub Actions} \\\\
     \\textbf{Tools \\& Platforms}{: Docker, Kubernetes, AWS, GCP, Git, Linux} \\\\
     \\textbf{Frameworks}{: React, Node.js, Spring Boot, FastAPI, Django}
    }}
 \\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart

    \\resumeSubheading
      {Senior Software Engineer}{Jan 2023 -- Present}
      {Tech Company Name}{City, State}
      \\resumeItemListStart
        \\resumeItem{Spearheaded the migration of a legacy monolithic application to a microservices architecture, reducing latency by 40\\% and increasing system uptime to 99.99\\%.}
        \\resumeItem{Engineered an automated data-processing pipeline using Python and Apache Kafka, capable of handling 5M+ daily events with real-time analytics.}
        \\resumeItem{Mentored a team of 4 junior developers and established code review guidelines, improving overall deployment success rate by 15\\%.}
      \\resumeItemListEnd
      
    \\resumeSubheading
      {Software Engineer}{Jun 2022 -- Dec 2022}
      {Another Tech Company}{City, State}
      \\resumeItemListStart
        \\resumeItem{Developed scalable RESTful APIs in Node.js, serving over 100K active daily users with sub-50ms response times.}
        \\resumeItem{Optimized SQL queries and introduced Redis caching, which reduced database load by 60\\% during peak usage hours.}
      \\resumeItemListEnd

  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
      \\resumeProjectHeading
          {\\textbf{Distributed Task Queue} $|$ \\emph{Go, Redis, Docker, AWS}}{\\href{https://github.com/username/project}{\\underline{github.com/username/project}}}
          \\resumeItemListStart
            \\resumeItem{Designed and implemented a high-performance distributed task queue in Go, achieving a throughput of 10,000 tasks/sec.}
            \\resumeItem{Integrated Redis for fast in-memory job state tracking and deployed the system on AWS ECS.}
          \\resumeItemListEnd
          
      \\resumeProjectHeading
          {\\textbf{AI Resume Parsing Engine} $|$ \\emph{Python, FastAPI, NLP, React}}{\\href{https://github.com/username/project2}{\\underline{github.com/username/project2}}}
          \\resumeItemListStart
            \\resumeItem{Built an NLP-powered API to extract structured data from PDF resumes with 95\\% accuracy.}
            \\resumeItem{Created a React dashboard to visualize extracted metrics, reducing recruiters' manual screening time by 30\\%.}
          \\resumeItemListEnd
    \\resumeSubHeadingListEnd

%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {AWS Certified Solutions Architect -- Associate}{Valid util Dec 2026}
      {Amazon Web Services}{}
  \\resumeSubHeadingListEnd

%-------------------------------------------
\\end{document}
`;
