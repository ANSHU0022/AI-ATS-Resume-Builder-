export const altaCV = `\\documentclass[10pt,a4paper,ragged2e,withhyper]{altacv}

\\geometry{left=1.25cm,right=1.25cm,top=1.5cm,bottom=1.5cm,columnsep=1.2cm}

\\usepackage{paracol}

\\ifxetexorluatex
  \\setmainfont{Lato}
\\else
  \\usepackage[default]{lato}
\\fi

\\definecolor{VividPurple}{HTML}{3E0097}
\\definecolor{SlateGrey}{HTML}{2E2E2E}
\\definecolor{LightGrey}{HTML}{666666}

\\colorlet{name}{black}
\\colorlet{tagline}{VividPurple}
\\colorlet{heading}{VividPurple}
\\colorlet{headingrule}{VividPurple}
\\colorlet{subheading}{VividPurple}
\\colorlet{accent}{VividPurple}
\\colorlet{emphasis}{SlateGrey}
\\colorlet{body}{LightGrey}

\\renewcommand{\\itemmarker}{{\\small\\textbullet}}
\\renewcommand{\\ratingmarker}{\\faCircle}

\\begin{document}

\\name{Your Name}
\\tagline{Software Engineer}
\\photoR{2.5cm}{profile} % Remove or uncomment to add a photo

\\personalinfo{%
  \\email{your@email.com}
  \\phone{+1 (000) 000-0000}
  \\location{Your City, Country}
  \\linkedin{linkedin.com/in/yourprofile}
  \\github{github.com/yourusername}
}

\\makecvheader

\\columnratio{0.6}
\\begin{paracol}{2}

\\cvsection{Experience}

\\cvevent{Software Engineer}{Tech Company}{Jan 2020 -- Present}{City, Country}
\\begin{itemize}
\\item Developed scalable web applications using React and Node.js
\\item Improved database query performance by 40\\%
\\item Led a team of 3 developers to deliver a critical feature
\\end{itemize}

\\divider

\\cvevent{Junior Developer}{Startup Inc}{Jun 2018 -- Dec 2019}{City, Country}
\\begin{itemize}
\\item Assisted in building RESTful APIs using Express.js
\\item Wrote unit tests and increased code coverage to 85\\%
\\item Collaborated with UX designers to implement responsive UI
\\end{itemize}

\\cvsection{Projects}

\\cvevent{Personal Portfolio Website}{}{}{}
\\begin{itemize}
\\item Built a responsive portfolio website using Next.js and Tailwind CSS
\\item Deployed on Vercel with custom domain and automated CI/CD
\\end{itemize}

\\divider

\\cvevent{E-commerce Platform}{}{}{}
\\begin{itemize}
\\item Developed a full-stack e-commerce solution using MongoDB, Express, React, Node.js
\\item Integrated Stripe API for secure payment processing
\\end{itemize}

\\switchcolumn

\\cvsection{Education}

\\cvevent{B.S. in Computer Science}{University Name}{Sept 2014 -- June 2018}{}

\\cvsection{Skills}

\\cvtag{JavaScript}
\\cvtag{TypeScript}
\\cvtag{React}
\\cvtag{Node.js}
\\cvtag{Python}
\\cvtag{SQL}
\\cvtag{Git}
\\cvtag{Docker}

\\cvsection{Languages}

\\cvskill{English}{5}
\\cvskill{Spanish}{3}
\\cvskill{French}{2}

\\end{paracol}

\\end{document}
`;
