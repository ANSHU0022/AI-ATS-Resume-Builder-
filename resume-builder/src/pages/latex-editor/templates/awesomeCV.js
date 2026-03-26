export const awesomeCV = `\\documentclass[11pt, a4paper]{awesome-cv}

\\fontdir[fonts/]
\\colorlet{awesome}{awesome-red}
\\setbool{acvSectionColorHighlight}{true}

\\renewcommand{\\acvHeaderSocialSep}{\\quad\\textbar\\quad}

%-------------------------------------------------------------------------------
%	PERSONAL INFORMATION
%-------------------------------------------------------------------------------
\\name{Claud D.}{Park}
\\position{Software Engineer{\\enskip\\cdotp\\enskip}Security Expert}
\\address{42-8, Bangbae-ro 15-gil, Seocho-gu, Seoul, 06686, Rep. of KOREA}

\\mobile{(+82) 10-9030-1843}
\\email{posquit0.bj@gmail.com}
\\homepage{www.posquit0.com}
\\github{posquit0}
\\linkedin{posquit0}

%-------------------------------------------------------------------------------
\\begin{document}

% Print the header with above personal informations
% Give optional argument to change alignment(C: center, L: left, R: right)
\\makecvheader[C]

% Print the footer with 3 arguments(<left>, <center>, <right>)
% Leave any of these blank if they are not needed
\\makecvfooter
  {\\today}
  {Claud D. Park~~~·~~~Résumé}
  {\\thepage}


%-------------------------------------------------------------------------------
%	CV/RESUME CONTENT
%-------------------------------------------------------------------------------
\\cvsection{Summary}
\\begin{cvparagraph}
Software Engineer with 5+ years of experience in developing scalable web applications and distributed systems. Expert in JavaScript, Python, and cloud infrastructure. Passionate about open-source contributions and building developer tools.
\\end{cvparagraph}

\\cvsection{Work Experience}
\\begin{cventries}
  \\cventry
    {Senior Software Engineer} % Job title
    {Tech Company Inc.} % Organization
    {San Francisco, CA} % Location
    {Jan. 2018 - Present} % Date(s)
    {
      \\begin{cvitems} % Description(s) of tasks/responsibilities
        \\item {Architected and implemented a microservices-based backend using Node.js and Docker, improving system reliability by 99.9\\%.}
        \\item {Led a team of 4 engineers to migrate legacy monolith application to AWS ECS.}
        \\item {Reduced API latency by 40\\% through aggressive caching and database query optimization.}
      \\end{cvitems}
    }
  \\cventry
    {Software Engineer} % Job title
    {Startup LLC} % Organization
    {New York, NY} % Location
    {Jun. 2015 - Dec. 2017} % Date(s)
    {
      \\begin{cvitems} % Description(s) of tasks/responsibilities
        \\item {Developed user-facing features using React.js and Redux for a financial dashboard application.}
        \\item {Built real-time data processing pipelines using Python, Apache Kafka, and PostgreSQL.}
      \\end{cvitems}
    }
\\end{cventries}

\\cvsection{Education}
\\begin{cventries}
  \\cventry
    {B.S. in Computer Science} % Degree
    {University of Technology} % Institution
    {Seoul, S.Korea} % Location
    {Mar. 2011 - Feb. 2015} % Date(s)
    {
      \\begin{cvitems} % Description(s) bullet points
        \\item {Graduated with Honors, Cum Laude.}
        \\item {Relevant Coursework: Data Structures, Algorithms, Distributed Systems, Database Management.}
      \\end{cvitems}
    }
\\end{cventries}

\\cvsection{Skills}
\\begin{cvskills}
  \\cvskill
    {Languages} % Category
    {JavaScript, TypeScript, Python, Go, SQL, HTML/CSS} % Skills
  \\cvskill
    {Frameworks} % Category
    {React, Node.js, Express, Django, FastAPI} % Skills
  \\cvskill
    {Tools} % Category
    {Git, Docker, Kubernetes, AWS, CI/CD (GitHub Actions)} % Skills
\\end{cvskills}

%-------------------------------------------------------------------------------
\\end{document}
`;
