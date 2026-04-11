import LegalPageLayout from "./LegalPageLayout.jsx";

const sections = [
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By using ATSForge, you agree to these Terms and Conditions. If you do not agree with them, you should stop using the service.",
    ],
  },
  {
    title: "What ATSForge Provides",
    paragraphs: [
      "ATSForge provides job-search tools such as resume building, ATS-friendly formatting, cover letter drafting, LaTeX editing, networking message generation, and curated job portal resources.",
      "The platform is designed to help users create stronger applications, but it does not guarantee interviews, job offers, recruiter responses, or placement outcomes.",
    ],
  },
  {
    title: "User Responsibilities",
    paragraphs: [
      "You are responsible for the accuracy, ownership, legality, and appropriateness of the information, files, links, and content you submit to ATSForge.",
      "You must not use the platform for unlawful activity, impersonation, harmful content, abuse of third-party services, or any attempt to damage, disrupt, scrape, or overload the product.",
    ],
  },
  {
    title: "Generated Content and Templates",
    paragraphs: [
      "ATSForge may generate text, formatting suggestions, LaTeX output, templates, and other application materials based on your inputs. You are responsible for reviewing the final output before sending it to employers, recruiters, or external platforms.",
      "Template recommendations, ATS scores, keyword suggestions, and outreach content are informational tools and should be treated as assistive guidance rather than legal, professional, or hiring guarantees.",
    ],
  },
  {
    title: "Third-Party Platforms",
    paragraphs: [
      "Some ATSForge features may interact with third-party services, APIs, authentication providers, hosting services, or external job platforms. Your use of those services may also be governed by their own terms and policies.",
      "ATSForge is not responsible for third-party outages, policy changes, account restrictions, or the actions of external websites that users choose to visit through the platform.",
    ],
  },
  {
    title: "Availability and Changes",
    paragraphs: [
      "We may update, improve, limit, suspend, or remove features at any time in order to maintain the platform, address security concerns, or evolve the product.",
      "ATSForge is provided on an as-is and as-available basis. We try to keep the product reliable, but uninterrupted access cannot be guaranteed.",
    ],
  },
  {
    title: "Contact and Updates",
    paragraphs: [
      "If you have questions about these Terms and Conditions, please contact ATSForge through the support or feedback options available in the product.",
      "We may revise these terms from time to time. Continued use of the platform after updates means you accept the revised version.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      lastUpdated="April 12, 2026"
      intro="These Terms and Conditions govern the use of ATSForge and its related tools, including the resume builder, cover letter generator, LaTeX editor, networking workflows, and job portal resources."
      sections={sections}
    />
  );
}
