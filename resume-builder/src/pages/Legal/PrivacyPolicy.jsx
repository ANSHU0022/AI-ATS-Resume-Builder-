import LegalPageLayout from "./LegalPageLayout.jsx";

const sections = [
  {
    title: "Information We Receive",
    paragraphs: [
      "ATSForge may receive information that you enter directly into the product, including resume details, cover letter content, networking drafts, uploaded files, account details, and feedback you submit through the platform.",
      "We may also receive basic technical information such as browser type, device information, approximate usage data, and request logs that help us keep the service secure, reliable, and performant.",
    ],
  },
  {
    title: "How We Use Information",
    paragraphs: [
      "We use the information you provide to generate resumes, cover letters, LaTeX outputs, networking messages, and other job-search related content requested by you.",
      "We may also use limited operational data to improve product quality, troubleshoot issues, prevent abuse, support authentication, and maintain the core functionality of ATSForge.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "Some features may rely on third-party providers such as authentication, AI processing, analytics, file handling, or hosting infrastructure. When those services are needed to deliver a feature, relevant information may be transmitted to them in the normal course of product operation.",
      "We do not sell your personal information. We only share data where reasonably necessary to provide the functionality you use, operate the service, meet legal obligations, or protect the platform from misuse.",
    ],
  },
  {
    title: "Uploads and Generated Content",
    paragraphs: [
      "Resume uploads, generated drafts, and edited content are processed to provide the features you request. You remain responsible for the accuracy, legality, and appropriateness of the content you submit and export.",
      "If you use sign-in or save-related functionality, certain data may be stored or associated with your account to support those features. Retention may vary depending on the product workflow being used.",
    ],
  },
  {
    title: "Your Choices",
    paragraphs: [
      "You may choose what information to submit to ATSForge and whether to use features such as resume uploads, authentication, saved workflows, or AI generation. If you do not want certain information processed, do not submit it through the relevant feature.",
      "If you want legal, privacy, or account-related assistance, please contact ATSForge through the support or feedback options available in the product.",
    ],
  },
  {
    title: "Policy Updates",
    paragraphs: [
      "We may update this Privacy Policy from time to time as the platform evolves. When material changes are made, the updated version will be posted on this page with a revised last updated date.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="April 12, 2026"
      intro="This Privacy Policy explains, in plain language, how ATSForge handles information when you use the resume builder, cover letter tools, LaTeX editor, networking tools, and related job-search workflows."
      sections={sections}
    />
  );
}
