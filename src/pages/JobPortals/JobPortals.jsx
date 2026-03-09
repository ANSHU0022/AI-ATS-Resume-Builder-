import { useState } from "react";

const jobPortals = [
  { name: "Indeed", tagline: "The world's #1 job site", url: "https://www.indeed.com", domain: "indeed.com", category: "Global", badge: "🌐 Global Giant", howToApply: "Create account → Upload resume → Apply with Indeed profile or company site" },
  { name: "LinkedIn Jobs", tagline: "World's largest professional network", url: "https://www.linkedin.com/jobs", domain: "linkedin.com", category: "Global", badge: "🌍 #1 Network", howToApply: "Create profile → Search jobs → Click Easy Apply or redirect to company site" },
  { name: "Glassdoor", tagline: "Jobs + company reviews & salaries", url: "https://www.glassdoor.com", domain: "glassdoor.com", category: "Global", badge: "⭐ Reviews + Jobs", howToApply: "Sign up → Browse jobs → Apply via portal or company redirect" },
  { name: "Monster", tagline: "Connecting job seekers and employers worldwide", url: "https://www.monster.com", domain: "monster.com", category: "Global", badge: "Classic Board", howToApply: "Create profile → Upload resume → Search & apply to listings" },
  { name: "CareerBuilder", tagline: "Smart job matching with AI", url: "https://www.careerbuilder.com", domain: "careerbuilder.com", category: "Global", badge: "AI Matching", howToApply: "Register → Build profile → Get matched & apply directly" },
  { name: "SimplyHired", tagline: "Millions of jobs, simplified search", url: "https://www.simplyhired.com", domain: "simplyhired.com", category: "Global", badge: "Simple Search", howToApply: "Browse without registration → Click job → Apply on employer site" },
  { name: "Talent.com", tagline: "Aggregated jobs from across the web", url: "https://www.talent.com", domain: "talent.com", category: "Global", badge: "Aggregator", howToApply: "Search by keyword/location → Redirect to employer or source site to apply" },
  { name: "Wellfound", tagline: "Top platform for startup jobs worldwide", url: "https://wellfound.com", domain: "wellfound.com", category: "Global", badge: "Startups", howToApply: "Build AngelList profile → Browse startup roles → Apply with one click" },
  { name: "ZipRecruiter", tagline: "Get matched to jobs by employers actively hiring", url: "https://www.ziprecruiter.com", domain: "ziprecruiter.com", category: "Global", badge: "Instant Match", howToApply: "Upload resume → Get discovered by employers → Apply to invitations" },
  { name: "FlexJobs", tagline: "Vetted remote, part-time & flexible jobs", url: "https://www.flexjobs.com", domain: "flexjobs.com", category: "Global", badge: "Flexible Work", howToApply: "Subscribe → Search scam-free listings → Apply via company pages" },
  { name: "We Work Remotely", tagline: "The largest remote work community", url: "https://weworkremotely.com", domain: "weworkremotely.com", category: "Global", badge: "Remote Only", howToApply: "Browse categories → Click listing → Apply via employer's site" },
  { name: "RemoteOK", tagline: "Remote jobs for digital nomads", url: "https://remoteok.com", domain: "remoteok.com", category: "Global", badge: "Nomad Jobs", howToApply: "Browse tech/design/marketing listings → Click apply → Redirect to company" },
  { name: "Working Nomads", tagline: "Curated remote jobs for location-independent workers", url: "https://www.workingnomads.com", domain: "workingnomads.com", category: "Global", badge: "Nomad Life", howToApply: "Filter by category/region → Subscribe to alerts → Apply via listing link" },
  { name: "Relocate.me", tagline: "Jobs with relocation packages worldwide", url: "https://relocate.me", domain: "relocate.me", category: "Global", badge: "Relocate", howToApply: "Browse relocation-included jobs → Apply → Company handles visa/move support" },
  { name: "XpatJobs", tagline: "Expat jobs across the globe", url: "https://www.xpatjobs.com", domain: "xpatjobs.com", category: "Global", badge: "Expat Focus", howToApply: "Register → Search by country → Apply to international postings" },
  { name: "GlobalJobs", tagline: "International job listings worldwide", url: "https://www.globaljobs.org", domain: "globaljobs.org", category: "Global", badge: "International", howToApply: "Search by role/region → Click listing → Apply on employer platform" },
  { name: "EuroJobs", tagline: "Pan-European career opportunities", url: "https://www.eurojobs.com", domain: "eurojobs.com", category: "Global", badge: "Euro Wide", howToApply: "Register → Select country/language → Browse & apply to EU jobs" },
  { name: "JobboardFinder", tagline: "Find the right job board for your career", url: "https://www.jobboardfinder.com", domain: "jobboardfinder.com", category: "Global", badge: "Meta Board", howToApply: "Search by industry/country → Get directed to best job boards → Apply there" },
  { name: "Welcome to the Jungle", tagline: "Discover companies & jobs with culture insights", url: "https://www.welcometothejungle.com", domain: "welcometothejungle.com", category: "Global", badge: "Culture First", howToApply: "Explore company profiles → Find culture-fit roles → Apply within platform" },
  { name: "Naukri", tagline: "India's No.1 Job Portal", url: "https://www.naukri.com", domain: "naukri.com", category: "India", badge: "#1 India", howToApply: "Register → Upload resume → Search & apply directly to listings" },
  { name: "Foundit", tagline: "Monster India rebranded — smart job matching", url: "https://www.foundit.in", domain: "foundit.in", category: "India", badge: "Smart Match", howToApply: "Register → Build profile → Get AI-matched jobs & apply" },
  { name: "TimesJobs", tagline: "Jobs across industries from Times Group", url: "https://www.timesjobs.com", domain: "timesjobs.com", category: "India", badge: "Times Group", howToApply: "Create profile → Search jobs by skill/city → Apply directly" },
  { name: "Shine", tagline: "HT Media's job portal for Indian professionals", url: "https://www.shine.com", domain: "shine.com", category: "India", badge: "HT Media", howToApply: "Register → Upload CV → Browse & apply to openings" },
  { name: "Freshersworld", tagline: "Jobs & internships for freshers in India", url: "https://www.freshersworld.com", domain: "freshersworld.com", category: "India", badge: "Freshers", howToApply: "Register as fresher → Complete profile → Apply to entry-level listings" },
  { name: "Internshala", tagline: "Internships & fresher jobs in India", url: "https://internshala.com", domain: "internshala.com", category: "India", badge: "Internships", howToApply: "Register as student → Fill profile → Apply to internships & trainings" },
  { name: "Cutshort", tagline: "AI-powered job matching for tech professionals", url: "https://cutshort.io", domain: "cutshort.io", category: "India", badge: "AI Shortlist", howToApply: "Create profile → Let AI match you → Apply to curated tech roles" },
  { name: "WorkIndia", tagline: "Blue-collar & semi-skilled jobs in India", url: "https://www.workindia.in", domain: "workindia.in", category: "India", badge: "Blue Collar", howToApply: "Download app → Set location → Browse & apply to local job listings" },
  { name: "Hirect", tagline: "Direct chat hiring for startups", url: "https://www.hirect.in", domain: "hirect.in", category: "India", badge: "Direct Chat", howToApply: "Register → Chat with founders directly → Get hired without middlemen" },
  { name: "QuikrJobs", tagline: "Local & gig jobs across Indian cities", url: "https://www.quikr.com/jobs", domain: "quikr.com", category: "India", badge: "Local Gigs", howToApply: "Browse by city/category → Contact employer directly via Quikr" },
  { name: "Dice", tagline: "Tech & IT jobs in the United States", url: "https://www.dice.com", domain: "dice.com", category: "USA", badge: "Tech USA", howToApply: "Create tech profile → Search roles → Apply with Dice profile" },
  { name: "The Muse", tagline: "Jobs + company culture & career coaching", url: "https://www.themuse.com", domain: "themuse.com", category: "USA", badge: "Culture Jobs", howToApply: "Browse company profiles → Find culture-fit roles → Apply directly" },
  { name: "Ladders", tagline: "$100K+ professional jobs in the US", url: "https://www.theladders.com", domain: "theladders.com", category: "USA", badge: "$100K+", howToApply: "Subscribe → Access premium listings → Apply to senior-level roles" },
  { name: "Snagajob", tagline: "Hourly & part-time jobs across America", url: "https://www.snagajob.com", domain: "snagajob.com", category: "USA", badge: "Hourly Work", howToApply: "Create profile → Search nearby hourly jobs → Apply with one click" },
  { name: "USAJobs", tagline: "Official US federal government job portal", url: "https://www.usajobs.gov", domain: "usajobs.gov", category: "USA", badge: "Gov Jobs", howToApply: "Create USA Jobs account → Search federal listings → Submit application package" },
  { name: "Handshake", tagline: "Early career & campus recruiting platform", url: "https://joinhandshake.com", domain: "joinhandshake.com", category: "USA", badge: "Campus Hire", howToApply: "Connect via university email → Attend virtual fairs → Apply to entry-level roles" },
  { name: "BuiltIn", tagline: "Tech company jobs in US tech hubs", url: "https://builtin.com", domain: "builtin.com", category: "USA", badge: "Tech Hubs", howToApply: "Create profile → Filter by city/stack → Apply to tech company roles" },
  { name: "Hired", tagline: "Tech talent marketplace — companies apply to you", url: "https://hired.com", domain: "hired.com", category: "USA", badge: "Reverse Hire", howToApply: "Create profile → Get salary offers from companies → Choose & interview" },
  { name: "WayUp", tagline: "College jobs, internships & entry-level roles", url: "https://www.wayup.com", domain: "wayup.com", category: "USA", badge: "College Grads", howToApply: "Register with .edu email → Browse entry-level → Apply with WayUp profile" },
  { name: "Idealist", tagline: "Nonprofit, social impact & mission-driven jobs", url: "https://www.idealist.org", domain: "idealist.org", category: "USA", badge: "Impact Jobs", howToApply: "Create profile → Search cause-aligned roles → Apply via employer page" },
  { name: "Reed", tagline: "UK's most comprehensive job site", url: "https://www.reed.co.uk", domain: "reed.co.uk", category: "UK", badge: "UK Leader", howToApply: "Register → Upload CV → Apply with Reed profile or external link" },
  { name: "TotalJobs", tagline: "Thousands of UK jobs across all sectors", url: "https://www.totaljobs.com", domain: "totaljobs.com", category: "UK", badge: "UK Wide", howToApply: "Sign up → Upload CV → Apply in one click to UK-based roles" },
  { name: "CV-Library", tagline: "CV-based job matching across the UK", url: "https://www.cv-library.co.uk", domain: "cv-library.co.uk", category: "UK", badge: "CV Match", howToApply: "Upload CV → Get matched to roles → Apply or let recruiters find you" },
  { name: "Jobsite", tagline: "UK jobs in IT, finance, engineering & more", url: "https://www.jobsite.co.uk", domain: "jobsite.co.uk", category: "UK", badge: "UK Sectors", howToApply: "Register → Search by sector/location → Apply directly" },
  { name: "Adzuna", tagline: "Smart UK job search with salary insights", url: "https://www.adzuna.co.uk", domain: "adzuna.co.uk", category: "UK", badge: "Salary Data", howToApply: "Search → View salary benchmarks → Click to apply on employer site" },
  { name: "Flexa Careers", tagline: "Verified flexible & remote jobs in the UK", url: "https://flexa.careers", domain: "flexa.careers", category: "UK", badge: "Flex Verified", howToApply: "Browse verified flexible companies → Check flex score → Apply directly" },
  { name: "Guardian Jobs", tagline: "Quality jobs from The Guardian newspaper", url: "https://jobs.theguardian.com", domain: "theguardian.com", category: "UK", badge: "Guardian", howToApply: "Browse by sector → Apply via Guardian's platform or employer site" },
  { name: "Milkround", tagline: "Graduate jobs & schemes in the UK", url: "https://www.milkround.com", domain: "milkround.com", category: "UK", badge: "Graduates", howToApply: "Register as graduate → Search grad schemes → Apply with profile/CV" },
  { name: "Job Bank Canada", tagline: "Canada's official government job board", url: "https://www.jobbank.gc.ca", domain: "jobbank.gc.ca", category: "Canada", badge: "Official CA", howToApply: "Create GC account → Search by province/trade → Apply to listings" },
  { name: "Workopolis", tagline: "Leading Canadian job search platform", url: "https://www.workopolis.com", domain: "workopolis.com", category: "Canada", badge: "Canada Jobs", howToApply: "Register → Upload resume → Browse & apply to Canadian roles" },
  { name: "Eluta", tagline: "Canadian job search engine", url: "https://www.eluta.ca", domain: "eluta.ca", category: "Canada", badge: "CA Search", howToApply: "Search jobs → Get redirected to employer or recruiting site to apply" },
  { name: "CanadaJobs", tagline: "Jobs across all provinces in Canada", url: "https://www.canadajobs.com", domain: "canadajobs.com", category: "Canada", badge: "Provincial", howToApply: "Browse by province → Click listing → Apply on employer's portal" },
  { name: "TalentEgg", tagline: "Student & graduate jobs in Canada", url: "https://talentegg.ca", domain: "talentegg.ca", category: "Canada", badge: "Grad Focus", howToApply: "Register → Search student/grad listings → Apply with profile" },
  { name: "SEEK", tagline: "Australia & Asia-Pacific jobs leader", url: "https://www.seek.com.au", domain: "seek.com.au", category: "Australia", badge: "#1 AU", howToApply: "Create SEEK profile → Upload CV → Apply to AU/NZ/SEA roles" },
  { name: "Jora", tagline: "Australian job aggregator from SEEK", url: "https://www.jora.com", domain: "jora.com", category: "Australia", badge: "AU Aggregator", howToApply: "Search → Get aggregated listings → Redirect to source site to apply" },
  { name: "CareerOne", tagline: "Trusted Australian job search portal", url: "https://www.careerone.com.au", domain: "careerone.com.au", category: "Australia", badge: "CareerOne", howToApply: "Register → Search by industry/state → Apply directly or via employer" },
  { name: "EthicalJobs", tagline: "Purpose-driven jobs in Australia", url: "https://ethicaljobs.com.au", domain: "ethicaljobs.com.au", category: "Australia", badge: "Ethical AU", howToApply: "Browse nonprofits & social enterprises → Apply via employer page" },
  { name: "TradeMe Jobs", tagline: "New Zealand's top job platform", url: "https://www.trademe.co.nz/jobs", domain: "trademe.co.nz", category: "Australia", badge: "New Zealand", howToApply: "Create TradeMe account → Search NZ listings → Apply directly" },
  { name: "EURES", tagline: "EU's official cross-border job mobility portal", url: "https://eures.europa.eu", domain: "europa.eu", category: "Europe", badge: "EU Official", howToApply: "Register on EURES → Search EU-wide listings → Get mobility support" },
  { name: "StepStone", tagline: "Germany's leading job platform", url: "https://www.stepstone.de", domain: "stepstone.de", category: "Europe", badge: "Germany", howToApply: "Register → Upload CV → Apply to German & European listings" },
  { name: "Arbeitsagentur", tagline: "Germany's official federal employment agency", url: "https://www.arbeitsagentur.de", domain: "arbeitsagentur.de", category: "Europe", badge: "DE Official", howToApply: "Register with BA → Create job seeker profile → Apply to official listings" },
  { name: "Apec", tagline: "Executive & management jobs in France", url: "https://www.apec.fr", domain: "apec.fr", category: "Europe", badge: "France Exec", howToApply: "Create APEC account → Search cadre-level roles → Apply directly" },
  { name: "Pole Emploi", tagline: "France's national employment service", url: "https://www.pole-emploi.fr", domain: "pole-emploi.fr", category: "Europe", badge: "FR Gov", howToApply: "Register as job seeker → Search listings → Apply via portal" },
  { name: "InfoJobs", tagline: "Spain's #1 job portal", url: "https://www.infojobs.net", domain: "infojobs.net", category: "Europe", badge: "Spain #1", howToApply: "Register → Upload CV → Browse & apply to Spanish job listings" },
  { name: "Jobs.cz", tagline: "Czech Republic's top job board", url: "https://www.jobs.cz", domain: "jobs.cz", category: "Europe", badge: "Czech Jobs", howToApply: "Register → Create profile → Apply to Czech Republic listings" },
  { name: "Pracuj", tagline: "Poland's leading employment portal", url: "https://www.pracuj.pl", domain: "pracuj.pl", category: "Europe", badge: "Poland", howToApply: "Create account → Upload CV → Browse & apply to Polish jobs" },
  { name: "JobIndex", tagline: "Denmark's comprehensive job search engine", url: "https://www.jobindex.dk", domain: "jobindex.dk", category: "Europe", badge: "Denmark", howToApply: "Register → Search Danish listings → Apply via jobindex or employer" },
  { name: "Finn.no Jobs", tagline: "Norway's most popular job board", url: "https://www.finn.no/job", domain: "finn.no", category: "Europe", badge: "Norway", howToApply: "Browse → Filter by region/type → Apply via Finn or employer site" },
  { name: "JobStreet", tagline: "Southeast Asia's leading job portal", url: "https://www.jobstreet.com", domain: "jobstreet.com", category: "SE Asia", badge: "SEA Leader", howToApply: "Register → Build profile → Apply to MY/PH/SG/ID listings" },
  { name: "JobsDB", tagline: "Hong Kong & Asia's trusted job board", url: "https://www.jobsdb.com", domain: "jobsdb.com", category: "SE Asia", badge: "HK & Asia", howToApply: "Create account → Search by location → Apply through JobsDB portal" },
  { name: "Kalibrr", tagline: "Philippines' modern job-matching platform", url: "https://www.kalibrr.com", domain: "kalibrr.com", category: "SE Asia", badge: "Philippines", howToApply: "Create profile → Take skill tests → Get matched & apply" },
  { name: "Glints", tagline: "Singapore's career platform for young professionals", url: "https://glints.com", domain: "glints.com", category: "SE Asia", badge: "Singapore", howToApply: "Register → Explore SG/SEA listings → Apply & chat with employers" },
  { name: "MyCareersFuture", tagline: "Singapore government's official job portal", url: "https://www.mycareersfuture.gov.sg", domain: "mycareersfuture.gov.sg", category: "SE Asia", badge: "SG Official", howToApply: "Log in with Singpass → Search local listings → Apply directly" },
  { name: "Bayt", tagline: "Middle East's top job portal", url: "https://www.bayt.com", domain: "bayt.com", category: "Gulf", badge: "MENA #1", howToApply: "Register → Build Arabic/English profile → Apply to MENA region jobs" },
  { name: "GulfTalent", tagline: "Senior professionals in the Gulf region", url: "https://www.gulftalent.com", domain: "gulftalent.com", category: "Gulf", badge: "Gulf Senior", howToApply: "Register → Upload CV → Get discovered or apply to Gulf listings" },
  { name: "Naukri Gulf", tagline: "Naukri extended to UAE & Gulf markets", url: "https://www.naukrigulf.com", domain: "naukrigulf.com", category: "Gulf", badge: "UAE & Gulf", howToApply: "Register → Set location to Gulf → Browse & apply to Middle East listings" },
  { name: "Dubizzle Jobs", tagline: "UAE classifieds & job listings", url: "https://dubizzle.com/jobs", domain: "dubizzle.com", category: "Gulf", badge: "Dubai Jobs", howToApply: "Browse → Contact employers directly via Dubizzle messaging" },
  { name: "Akhtaboot", tagline: "Jordan & Middle East job marketplace", url: "https://www.akhtaboot.com", domain: "akhtaboot.com", category: "Gulf", badge: "Jordan", howToApply: "Register → Create Arabic profile → Apply to Levant region listings" },
  { name: "Jobberman", tagline: "Nigeria's No.1 job platform", url: "https://www.jobberman.com", domain: "jobberman.com", category: "Africa", badge: "Nigeria #1", howToApply: "Register → Upload CV → Apply to Nigerian & West African jobs" },
  { name: "Careers24", tagline: "South Africa's leading job site", url: "https://www.careers24.com", domain: "careers24.com", category: "Africa", badge: "South Africa", howToApply: "Create profile → Search SA listings → Apply directly or via employer" },
  { name: "BrighterMonday", tagline: "Kenya's top career platform", url: "https://www.brightermonday.co.ke", domain: "brightermonday.co.ke", category: "Africa", badge: "Kenya", howToApply: "Register → Build profile → Apply to East African listings" },
  { name: "PNet", tagline: "South Africa's professional job network", url: "https://www.pnet.co.za", domain: "pnet.co.za", category: "Africa", badge: "SA Network", howToApply: "Create account → Upload CV → Browse & apply to SA roles" },
  { name: "MyJobMag", tagline: "Nigeria & Africa's growing job board", url: "https://www.myjobmag.com", domain: "myjobmag.com", category: "Africa", badge: "Africa Mag", howToApply: "Register → Search by country/sector → Apply to African listings" },
  { name: "Upwork", tagline: "World's largest freelance marketplace", url: "https://www.upwork.com", domain: "upwork.com", category: "Freelance", badge: "Freelance #1", howToApply: "Create freelancer profile → Submit proposals → Get hired for contracts" },
  { name: "Freelancer", tagline: "Bid on millions of freelance projects", url: "https://www.freelancer.com", domain: "freelancer.com", category: "Freelance", badge: "Bid & Win", howToApply: "Register → Browse contests/projects → Bid with proposal & portfolio" },
  { name: "Guru", tagline: "Professional freelance work agreements", url: "https://www.guru.com", domain: "guru.com", category: "Freelance", badge: "Pro Freelance", howToApply: "Create portfolio → Browse job listings → Send quotes to clients" },
  { name: "PeoplePerHour", tagline: "UK-based freelance platform for pros", url: "https://www.peopleperhour.com", domain: "peopleperhour.com", category: "Freelance", badge: "Hourly Gigs", howToApply: "Set up profile → Post hourlies → Apply to client project briefs" },
  { name: "Toptal", tagline: "Top 3% of freelance talent worldwide", url: "https://www.toptal.com", domain: "toptal.com", category: "Freelance", badge: "Elite Only", howToApply: "Apply → Pass screening tests → Get matched with premium clients" },
  { name: "Fiverr", tagline: "Digital services starting at $5", url: "https://www.fiverr.com", domain: "fiverr.com", category: "Freelance", badge: "Gig Economy", howToApply: "Create gig listings → Clients buy your services → Deliver & grow" },
  { name: "Hubstaff Talent", tagline: "Free remote talent marketplace", url: "https://talent.hubstaff.com", domain: "hubstaff.com", category: "Freelance", badge: "Free Remote", howToApply: "Create profile → Get discovered by remote companies → Work from anywhere" },
  { name: "Internshala", tagline: "Student internships & entry-level jobs in India", url: "https://internshala.com", domain: "internshala.com", category: "Internship", badge: "India Intern", howToApply: "Register as student → Browse internships → Apply directly" },
  { name: "Chegg Internships", tagline: "Student internships & entry-level jobs", url: "https://www.chegg.com/internships", domain: "chegg.com", category: "Internship", badge: "Chegg", howToApply: "Register with student account → Browse internships → Apply directly" },
  { name: "GradConnection", tagline: "Graduate jobs & programs in AU/NZ/Asia", url: "https://www.gradconnection.com", domain: "gradconnection.com", category: "Internship", badge: "Grad AU/NZ", howToApply: "Register → Search grad programs → Apply through GradConnection portal" },
  { name: "HackerRank Jobs", tagline: "Get hired based on your coding skills", url: "https://www.hackerrank.com/jobs", domain: "hackerrank.com", category: "Tech", badge: "Code First", howToApply: "Complete coding challenges → Showcase score → Apply to tech roles" },
  { name: "TechFetch", tagline: "US tech job search & resume matching", url: "https://www.techfetch.com", domain: "techfetch.com", category: "Tech", badge: "Tech USA", howToApply: "Create tech profile → Upload resume → Get matched to US IT roles" },
];

const COUNTRY_CATS = ["All", "Global", "India", "USA", "UK", "Canada", "Australia", "Europe", "SE Asia", "Gulf", "Africa"];
const SPECIAL_CATS = ["Freelance", "Internship", "Tech"];

const FLAG_URLS = {
  India: "https://flagcdn.com/w40/in.png",
  USA: "https://flagcdn.com/w40/us.png",
  UK: "https://flagcdn.com/w40/gb.png",
  Canada: "https://flagcdn.com/w40/ca.png",
  Australia: "https://flagcdn.com/w40/au.png",
  Europe: "https://flagcdn.com/w40/eu.png",
  "SE Asia": "https://flagcdn.com/w40/sg.png",
  Gulf: "https://flagcdn.com/w40/ae.png",
  Africa: "https://flagcdn.com/w40/za.png",
};

function PortalLogo({ name, domain }) {
  const [idx, setIdx] = useState(0);
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://www.google.com/s2/favicons?domain=www.${domain}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
  if (idx >= sources.length) {
    return (
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 900, fontFamily: "serif" }}>
        {name[0]}
      </div>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt={name}
      style={{ width: 40, height: 40, objectFit: "contain", display: "block" }}
      onError={() => setIdx(i => i + 1)}
    />
  );
}

export default function JobPortals() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  const filtered = jobPortals.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCount = (cat) => cat === "All" ? jobPortals.length : jobPortals.filter(p => p.category === cat).length;

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.pill}>✦ Your Career Companion ✦</div>
          <h1 style={S.title}>Job Portal<span style={S.accent}> Universe</span></h1>
          <p style={S.subtitle}>
            Discover <strong style={{ color: "#7C3AED" }}>{jobPortals.length} top platforms</strong> across the globe. Browse, compare & apply — all in one place.
          </p>
          <div style={S.searchBox}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input style={S.searchInput} placeholder="Search by name, country or specialty..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {searchTerm && (
              <button style={S.clearBtn} onClick={() => setSearchTerm("")}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── STATS ── */}
      <div style={S.statsRow}>
        {[
          { label: "Total Portals", val: jobPortals.length, sub: "across 14 regions", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
          { label: "Regions Covered", val: "14", sub: "global coverage", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
          { label: "Jobs Available", val: "50M+", sub: "active listings", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
          { label: "Daily Applicants", val: "2M+", sub: "users per day", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statIconBox}>{s.icon}</div>
            <div style={S.statVal}>{s.val}</div>
            <div style={S.statLabel}>{s.label}</div>
            <div style={S.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={S.filterSection}>
        {/* Row 1 — Countries */}
        <div style={S.filterGroupLabel}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          By Region / Country
        </div>
        <div style={S.filterRow}>
          {COUNTRY_CATS.map(cat => {
            const isActive = activeCategory === cat;
            const flag = FLAG_URLS[cat];
            return (
              <button key={cat} style={{ ...S.filterBtn, ...(isActive ? S.filterBtnActive : {}) }} onClick={() => setActiveCategory(cat)}>
                {cat === "All" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#fff" : "#7C3AED"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                ) : cat === "Global" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#fff" : "#7C3AED"} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ) : flag ? (
                  <img src={flag} alt={cat} style={{ width: 20, height: 14, objectFit: "cover", borderRadius: 2, display: "block", flexShrink: 0 }} />
                ) : null}
                <span>{cat}</span>
                <span style={{ ...S.filterCount, ...(isActive ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : {}) }}>{getCount(cat)}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2 — Job Types */}
        <div style={{ ...S.filterGroupLabel, marginTop: 16 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          By Job Type
        </div>
        <div style={S.filterRow}>
          {SPECIAL_CATS.map(cat => {
            const isActive = activeCategory === cat;
            const icons = { Freelance: "◈", Internship: "◎", Tech: "</>" };
            return (
              <button key={cat} style={{ ...S.filterBtn, ...(isActive ? S.filterBtnActive : {}) }} onClick={() => setActiveCategory(cat)}>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, letterSpacing: "-0.5px" }}>{icons[cat]}</span>
                <span>{cat}</span>
                <span style={{ ...S.filterCount, ...(isActive ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : {}) }}>{getCount(cat)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p style={S.resultCount}>
        Showing <strong style={{ color: "#7C3AED" }}>{filtered.length}</strong> portals
        {activeCategory !== "All" && <span style={{ color: "#7C3AED" }}> in {activeCategory}</span>}
        {searchTerm && <span style={{ color: "#9CA3AF" }}> for "<em>{searchTerm}</em>"</span>}
      </p>

      {/* ── GRID ── */}
      <div style={S.grid}>
        {filtered.map((portal, idx) => (
          <div
            key={portal.name}
            style={{ ...S.card, ...(hoveredCard === portal.name ? S.cardHover : {}), animationDelay: `${Math.min(idx * 0.025, 0.4)}s` }}
            onMouseEnter={() => setHoveredCard(portal.name)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={S.cardGlow} />
            <div style={S.badge}>{portal.badge}</div>
            <div style={S.logoRow}>
              <div style={S.logoBox}>
                <PortalLogo name={portal.name} domain={portal.domain} />
              </div>
              <div>
                <div style={S.portalName}>{portal.name}</div>
                <span style={S.catTag}>{portal.category}</span>
              </div>
            </div>
            <div style={S.divider} />
            <p style={S.tagline}>{portal.tagline}</p>
            <button
              style={{ ...S.accordionBtn, background: expandedCard === portal.name ? "#F0EBFF" : "transparent" }}
              onClick={() => setExpandedCard(expandedCard === portal.name ? null : portal.name)}
            >
              <span>How to Apply</span>
              <span style={{ transform: expandedCard === portal.name ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", display: "inline-block", color: "#7C3AED" }}>▾</span>
            </button>
            {expandedCard === portal.name && <div style={S.accordionBody}>{portal.howToApply}</div>}
            <a href={portal.url} target="_blank" rel="noopener noreferrer" style={S.visitBtn}>Visit Portal →</a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px", position: "relative", zIndex: 1 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 16 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p style={{ fontSize: 18, color: "#6B7280", fontWeight: 500 }}>No portals found</p>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8 }}>Try a different keyword or clear the search</p>
        </div>
      )}

      <footer style={S.footer}>
        <p style={S.footerText}>✦ Built with care for job seekers worldwide · {jobPortals.length} portals indexed ✦</p>
        <p style={S.footerSub}>Your next career move is one click away.</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(3deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      `}</style>
    </div>
  );
}

const S = {
  page: { fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(145deg,#F5F0FF 0%,#FAFAFF 45%,#EDE8FF 75%,#F9F7FF 100%)", minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: 60 },
  blob1: { position: "fixed", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,#C4B5FD55 0%,transparent 70%)", animation: "floatA 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 },
  blob2: { position: "fixed", bottom: 80, left: -100, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,#DDD6FE44 0%,transparent 70%)", animation: "floatB 11s ease-in-out infinite", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 1, textAlign: "center", padding: "64px 24px 36px" },
  headerInner: { maxWidth: 720, margin: "0 auto" },
  pill: { display: "inline-block", background: "linear-gradient(135deg,#7C3AED18,#A78BFA28)", border: "1px solid #A78BFA55", color: "#6D28D9", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", padding: "6px 18px", borderRadius: 100, marginBottom: 20 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(40px,7vw,72px)", fontWeight: 900, color: "#1A0533", lineHeight: 1.05, marginBottom: 18, letterSpacing: "-1px" },
  accent: { color: "#7C3AED", fontStyle: "italic" },
  subtitle: { fontSize: 16, color: "#4B5563", lineHeight: 1.7, fontWeight: 300, marginBottom: 28 },
  searchBox: { display: "flex", alignItems: "center", background: "#fff", border: "2px solid #DDD6FE", borderRadius: 16, padding: "11px 18px", maxWidth: 520, margin: "0 auto", boxShadow: "0 8px 32px #7C3AED15", gap: 10 },
  searchInput: { border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1A0533", width: "100%", fontFamily: "'DM Sans',sans-serif" },
  clearBtn: { background: "#F3EEFF", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", color: "#7C3AED", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  statsRow: { position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", padding: "0 24px 40px" },
  statCard: { display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: "1px solid #EDE9FE", borderRadius: 20, padding: "20px 22px 16px", gap: 3, boxShadow: "0 2px 18px #7C3AED0D", minWidth: 130, flex: "1 1 130px", maxWidth: 175 },
  statIconBox: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#F3EEFF,#EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, border: "1px solid #DDD6FE" },
  statVal: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#7C3AED", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#1A0533", fontWeight: 600, marginTop: 3, textAlign: "center" },
  statSub: { fontSize: 10, color: "#9CA3AF", fontWeight: 400, letterSpacing: "0.3px" },
  filterSection: { position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px 20px" },
  filterGroupLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10, paddingLeft: 2 },
  filterRow: { display: "flex", gap: 7, flexWrap: "wrap" },
  filterBtn: { background: "#fff", border: "1.5px solid #E9D5FF", color: "#374151", borderRadius: 100, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  filterBtnActive: { background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", borderColor: "transparent", boxShadow: "0 4px 16px #7C3AED44", transform: "translateY(-2px)" },
  filterCount: { background: "#F3EEFF", color: "#7C3AED", borderRadius: 100, padding: "1px 7px", fontSize: 10, fontWeight: 700, minWidth: 20, textAlign: "center" },
  resultCount: { position: "relative", zIndex: 1, textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 28, fontWeight: 400, padding: "0 24px" },
  grid: { position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))", gap: 20, padding: "0 clamp(16px,5vw,60px)", maxWidth: 1500, margin: "0 auto" },
  card: { background: "#fff", borderRadius: 22, padding: 24, border: "1.5px solid #E9D5FF", boxShadow: "0 4px 24px #7C3AED0A", position: "relative", overflow: "hidden", transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)", animation: "fadeUp 0.5s ease both", display: "flex", flexDirection: "column", gap: 12 },
  cardHover: { transform: "translateY(-7px) scale(1.01)", boxShadow: "0 18px 48px #7C3AED22", borderColor: "#A78BFA", background: "#FDFBFF" },
  cardGlow: { position: "absolute", top: -28, right: -28, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,#EDE9FE 0%,transparent 70%)", pointerEvents: "none" },
  badge: { position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, letterSpacing: "0.3px", background: "#F3EEFF", color: "#6D28D9", border: "1px solid #DDD6FE", whiteSpace: "nowrap" },
  logoRow: { display: "flex", alignItems: "center", gap: 13, marginTop: 4 },
  logoBox: { width: 56, height: 56, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: "1.5px solid #E9D5FF", boxShadow: "0 2px 12px #7C3AED15", padding: 7 },
  portalName: { fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#1A0533", lineHeight: 1.2 },
  catTag: { display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", padding: "2px 8px", borderRadius: 5, marginTop: 3, background: "#1A053310", color: "#4B1D96", border: "1px solid #C4B5FD" },
  divider: { height: 1, background: "linear-gradient(90deg,#DDD6FE,transparent)", borderRadius: 2 },
  tagline: { fontSize: 13, color: "#374151", lineHeight: 1.6, fontWeight: 400 },
  accordionBtn: { border: "1px solid #E9D5FF", borderRadius: 8, padding: "7px 11px", fontSize: 11.5, fontWeight: 600, color: "#7C3AED", cursor: "pointer", width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Sans',sans-serif", transition: "background 0.2s" },
  accordionBody: { background: "#F5F0FF", border: "1px solid #DDD6FE", borderRadius: 9, padding: "10px 13px", fontSize: 12, color: "#1A0533", lineHeight: 1.65 },
  visitBtn: { display: "block", textAlign: "center", color: "#6D28D9", textDecoration: "none", borderRadius: 13, padding: "11px 18px", fontSize: 13, fontWeight: 700, letterSpacing: "0.3px", transition: "all 0.25s ease", marginTop: "auto", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#EDE9FE,#DDD6FE)", boxShadow: "0 2px 12px #7C3AED1A", border: "1px solid #C4B5FD" },
  footer: { position: "relative", zIndex: 1, textAlign: "center", padding: "56px 24px 16px" },
  footerText: { fontFamily: "'Playfair Display',serif", fontSize: 17, color: "#7C3AED", marginBottom: 8, fontStyle: "italic" },
  footerSub: { fontSize: 13, color: "#9CA3AF" },
};