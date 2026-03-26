export const modernCV = `\\documentclass[11pt,a4paper,sans]{moderncv}

\\moderncvstyle{classic} 
\\moderncvcolor{blue}

\\usepackage[scale=0.75]{geometry}

\\name{John}{Doe}
\\title{Software Engineer}
\\address{123 Main Street}{City, State, Zip}{Country}
\\phone[mobile]{+1~(234)~567~890}
\\email{john.doe@example.com}
\\social[linkedin]{john-doe}
\\social[github]{johndoe}

\\begin{document}

\\makecvtitle

\\section{Education}
\\cventry{2015--2019}{Bachelor of Science in Computer Science}{University of Technology}{City}{}{GPA: 3.8/4.0}
\\cventry{2013--2015}{High School Diploma}{City High School}{City}{}{}

\\section{Experience}
\\cventry{2020--Present}{Senior Software Engineer}{Tech Solutions Inc.}{City}{}{
\\begin{itemize}%
\\item Led the development of a microservices architecture using Docker and Kubernetes.
\\item Implemented continuous integration and deployment pipelines using Jenkins.
\\item Mentored junior developers and conducted code reviews.
\\end{itemize}}
\\cventry{2019--2020}{Software Developer}{StartUp Co.}{City}{}{
\\begin{itemize}%
\\item Developed front-end features using React.js and Redux.
\\item Designed and implemented RESTful APIs using Node.js and Express.
\\item Optimized database queries for PostgreSQL, reducing load time by 30\\%.
\\end{itemize}}

\\section{Technical Skills}
\\cvdoubleitem{Languages}{Java, Python, JavaScript, C++}{Web Tech}{React, Node.js, HTML, CSS}
\\cvdoubleitem{Databases}{MySQL, PostgreSQL, MongoDB}{Tools}{Git, Docker, Jenkins, AWS}

\\section{Projects}
\\cventry{2021}{Project Name}{Personal Project}{}{}{
\\begin{itemize}%
\\item Description of the project and your role.
\\item Technologies used: React, Node.js, MongoDB.
\\end{itemize}}

\\section{Languages}
\\cvitemwithcomment{English}{Native}{}
\\cvitemwithcomment{Spanish}{Fluent}{}
\\cvitemwithcomment{French}{Basic}{}

\\end{document}
`;
