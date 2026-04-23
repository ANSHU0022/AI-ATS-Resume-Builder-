import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getSafeAIMessageFromError, getSafeAIMessageFromResponse } from '../../lib/aiError';
import './Networking.css';

const Networking = () => {
    const [user, setUser] = useState(null);
    const [resumeData, setResumeData] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [cvParsing, setCvParsing] = useState(false);

    // Inputs
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [recipient, setRecipient] = useState("");
    const [jd, setJd] = useState("");

    // Outputs
    const [emailOutput, setEmailOutput] = useState("");
    const [dmOutput, setDmOutput] = useState("");
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingDm, setLoadingDm] = useState(false);
    const [emailEditMode, setEmailEditMode] = useState(false);
    const [dmEditMode, setDmEditMode] = useState(false);

    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedDm, setCopiedDm] = useState(false);
    const [dmLength, setDmLength] = useState("medium"); // short | medium | long

    const cvInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // Fetch saved resume
                const { data: dbData } = await supabase.from('resume_data').select('resume_data').eq('user_id', session.user.id).single();
                if (dbData?.resume_data) setResumeData(dbData.resume_data);
            }
        };
        fetchUser();
    }, []);

    const parseCV = async (file) => {
        setCvFile(file);
        setCvParsing(true);
        // Simplified parsing for networking - just need text roughly or metadata
        // In a real scenario, reuse the parsing logic from ResumeBuilder or CoverLetterBuilder
        // For now, let's assume we use the saved resumeData if available, 
        // or just acknowledge the file is uploaded.
        setTimeout(() => setCvParsing(false), 1500);
    };

    const generateOutreach = async (type) => {
        const isLoading = type === 'email' ? setLoadingEmail : setLoadingDm;
        const setOutput = type === 'email' ? setEmailOutput : setDmOutput;

        isLoading(true);

        // Extract user's real name from saved resume data
        const userName = resumeData?.personal?.name || "";
        const userTitle = resumeData?.personal?.title || "";
        const userEmail = resumeData?.personal?.email || "";
        const userPhone = resumeData?.personal?.phone || "";
        const userLinkedin = resumeData?.personal?.linkedin || "";

        // Build resume skills and experience summary for context
        const skillsSummary = resumeData?.skills?.map(s => `${s.category}: ${s.items}`).join("; ") || "";
        const experienceSummary = resumeData?.experience?.filter(e => e.role).map(e => `${e.role} at ${e.company} — ${(e.bullets || []).join(", ")}`).join("; ") || "";
        const projectsSummary = resumeData?.projects?.filter(p => p.name).map(p => `${p.name} (${p.tech || ""}) — ${(p.bullets || []).join(", ")}`).join("; ") || "";

        const prompt = type === 'email'
            ? `You are a professional cold email writer for job seekers who want a REFERRAL. Write a high-conversion cold email asking for a referral.

CONTEXT:
- Sender Name: ${userName || "[Your Name]"}
- Sender Title: ${userTitle || "Professional"}
- Sender Email: ${userEmail || ""}
- Sender Phone: ${userPhone || ""}
- Target Company: ${company || "the company"}
- Target Role: ${role || "a relevant position"}
- Recipient Name: ${recipient || "Hiring Manager"}
${jd ? `\nJOB DESCRIPTION:\n${jd}` : ""}

SENDER'S RESUME SKILLS: ${skillsSummary || "Not provided"}
SENDER'S EXPERIENCE: ${experienceSummary || "Not provided"}
SENDER'S PROJECTS: ${projectsSummary || "Not provided"}

INSTRUCTIONS:
1. Start with a compelling subject line.
2. Open with a warm, respectful greeting. Show genuine interest in the recipient and their work at the company.
3. Clearly state that you are reaching out because you are interested in the "${role || "a position"}" role at ${company || "their company"} and would greatly appreciate a referral.
4. Highlight 2-3 specific skills/experience/projects from the sender's resume that DIRECTLY match the Job Description. Show WHY you are a strong fit for the role.
5. If a JD is provided, analyze it and reference specific keywords/requirements to demonstrate alignment.
6. Politely ask if the recipient would be open to referring you or connecting you with the hiring team.
7. Sign off with "Best Regards," followed by the sender's actual name: "${userName || "[Your Name]"}"${userEmail ? `, email: ${userEmail}` : ""}${userPhone ? `, phone: ${userPhone}` : ""}${userLinkedin ? `, LinkedIn: ${userLinkedin}` : ""}.
8. Keep the email concise (150-220 words), professional, warm, and action-oriented.
9. Do NOT use generic filler. Every sentence should demonstrate value and fit for the role.
10. The tone should be confident but humble — you are requesting a favor, not demanding.

Output ONLY the email text (including Subject line). No explanations.`
            : (() => {
                const lengthGuide = dmLength === 'short'
                    ? 'Write exactly 2-3 lines. Keep it crisp and to the point. Under 50 words total.'
                    : dmLength === 'long'
                    ? 'Write 7-8 lines. Go into detail about your matching skills, experience, and relevant projects. Around 120-150 words.'
                    : 'Write 4-5 lines. Balance brevity with detail. Around 70-90 words.';

                return `You are a LinkedIn DM expert for job seekers seeking REFERRALS. Write a personalized LinkedIn direct message asking for a referral.

CONTEXT:
- Sender Name: ${userName || "[Your Name]"}
- Sender Title: ${userTitle || "Professional"}
- Target Company: ${company || "the company"}
- Target Role: ${role || "a relevant position"}
- Recipient Name: ${recipient || "a professional"}
${jd ? `\nJOB DESCRIPTION:\n${jd}` : ""}

SENDER'S KEY SKILLS: ${skillsSummary || "Not provided"}
SENDER'S EXPERIENCE: ${experienceSummary || "Not provided"}
SENDER'S PROJECTS: ${projectsSummary || "Not provided"}

LENGTH: ${dmLength.toUpperCase()}
${lengthGuide}

INSTRUCTIONS:
1. Start with a friendly, respectful greeting using the recipient's name if provided.
2. Mention that you came across the "${role || "a position"}" role at ${company || "their company"} and are very interested in it.
3. Highlight your strongest skills, experience, or projects that directly match the role/JD requirements. Show you are a strong fit for the role.
4. Politely ask if the recipient would be willing to refer you or share any insights about the role.
5. STRICTLY follow the LENGTH instruction above. ${dmLength === 'short' ? '2-3 lines only.' : dmLength === 'long' ? '7-8 detailed lines.' : '4-5 lines.'}
6. Be warm, genuine, and professional. Show respect for their time.
7. End with a clear but polite ask for a referral.
8. Sign off with "Best regards,\n${userName || "[Your Name]"}".
9. Do NOT use placeholder names like "[Your Name]". Always use the actual sender name.

Output ONLY the DM text. No explanations.`;
            })();

        try {
            const resp = await fetch("/api/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 1500,
                    messages: [
                        { role: "system", content: "You are an expert job networking assistant. You write compelling, personalized outreach messages that get responses. Never use placeholder text like [Your Name] — always use the actual sender name provided." },
                        { role: "user", content: prompt }
                    ]
                })
            });
            if (!resp.ok) {
                throw new Error(await getSafeAIMessageFromResponse(resp, "AI is temporarily unavailable. Please try again in a few minutes."));
            }
            const json = await resp.json();
            let output = json.choices?.[0]?.message?.content || "Failed to generate.";
            // Replace any remaining placeholders with actual name
            if (userName) {
                output = output.replace(/\[Your Name\]/gi, userName);
                output = output.replace(/\[Your Full Name\]/gi, userName);
                output = output.replace(/\[Name\]/gi, userName);
            }
            setOutput(output);
        } catch (err) {
            setOutput(getSafeAIMessageFromError(err, "AI is temporarily unavailable. Please try again in a few minutes."));
        } finally {
            isLoading(false);
        }
    };

    const copyToClipboard = (text, setCopied) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="nw-page">
            <div className="nw-container">
                <header className="nw-header">
                    <div className="nw-pill">
                        <span className="nw-pill-dot"></span>
                        AI OUTREACH SUITE
                    </div>
                    <h1 className="nw-main-heading">
                        AI Networking & <em className="nw-italic">Outreach</em>
                    </h1>
                    <p className="nw-sub-heading">Generate high-conversion cold emails and LinkedIn DMs using your profile data.</p>
                </header>

                <div className="nw-grid">
                    {/* Input Panel */}
                    <div className="nw-panel-left">
                        <div className="nw-card nw-3d-card">
                            <h2 className="nw-card-title">Outreach Context</h2>
                            <div className="nw-form-group">
                                <label>Company Name</label>
                                <input className="nw-input nw-3d-input" placeholder="e.g. Google, Tesla" value={company} onChange={e => setCompany(e.target.value)} />
                            </div>
                            <div className="nw-form-group">
                                <label>Target Role</label>
                                <input className="nw-input nw-3d-input" placeholder="e.g. Senior Product Manager" value={role} onChange={e => setRole(e.target.value)} />
                            </div>
                            <div className="nw-form-group">
                                <label>Recipient Name (Optional)</label>
                                <input className="nw-input nw-3d-input" placeholder="e.g. John Doe" value={recipient} onChange={e => setRecipient(e.target.value)} />
                            </div>
                            <div className="nw-form-group">
                                <label>Job Description (Optional)</label>
                                <textarea className="nw-textarea nw-3d-input" placeholder="Paste the JD here for better personalization..." value={jd} onChange={e => setJd(e.target.value)} />
                            </div>

                            <div className="nw-resume-section">
                                <label>Target Resume Sourcing</label>
                                <div className="nw-resume-status">
                                    {cvFile ? (
                                        <div className="nw-badge success">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Parsed: {cvFile.name}
                                        </div>
                                    ) : resumeData ? (
                                        <div className="nw-badge info">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            Using Saved Resume
                                        </div>
                                    ) : (
                                        <div className="nw-badge warn">No Resume Sourced</div>
                                    )}
                                </div>
                                <button className="nw-btn-secondary nw-3d-btn" onClick={() => cvInputRef.current.click()}>
                                    {cvParsing ? "Parsing..." : "Upload New CV"}
                                </button>
                                <input type="file" ref={cvInputRef} style={{ display: 'none' }} onChange={e => parseCV(e.target.files[0])} accept=".pdf" />
                            </div>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="nw-panel-right">
                        {/* Cold Email Section */}
                        <div className="nw-card nw-3d-card outreach-section">
                            <div className="nw-section-header">
                                <h2 className="nw-card-title">AI Cold Email Enrichment</h2>
                                <button className="nw-btn-primary nw-3d-btn" onClick={() => generateOutreach('email')} disabled={loadingEmail}>
                                    {loadingEmail ? "Writing..." : "Generate Email"}
                                </button>
                            </div>
                            <div className="nw-output-area">
                                {emailEditMode ? (
                                    <textarea className="nw-output-edit nw-3d-input" value={emailOutput} onChange={e => setEmailOutput(e.target.value)} />
                                ) : (
                                    <div className="nw-output-text">
                                        {emailOutput || <span className="placeholder">Generated email will appear here...</span>}
                                    </div>
                                )}
                                {emailOutput && (
                                    <div className="nw-output-actions">
                                        <button className="nw-action-btn" onClick={() => setEmailEditMode(!emailEditMode)}>
                                            {emailEditMode ? "Save" : "Edit"}
                                        </button>
                                        <button className="nw-action-btn" onClick={() => copyToClipboard(emailOutput, setCopiedEmail)}>
                                            {copiedEmail ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LinkedIn DM Section */}
                        <div className="nw-card nw-3d-card outreach-section">
                            <div className="nw-section-header">
                                <h2 className="nw-card-title">LinkedIn & Other DMs</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="nw-length-toggle">
                                        {['short', 'medium', 'long'].map(len => (
                                            <button
                                                key={len}
                                                className={`nw-length-btn${dmLength === len ? ' active' : ''}`}
                                                onClick={() => setDmLength(len)}
                                            >
                                                {len.charAt(0).toUpperCase() + len.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="nw-btn-primary nw-3d-btn" onClick={() => generateOutreach('dm')} disabled={loadingDm}>
                                        {loadingDm ? "Writing..." : "Generate DM"}
                                    </button>
                                </div>
                            </div>
                            <div className="nw-output-area">
                                {dmEditMode ? (
                                    <textarea className="nw-output-edit nw-3d-input" value={dmOutput} onChange={e => setDmOutput(e.target.value)} />
                                ) : (
                                    <div className="nw-output-text">
                                        {dmOutput || <span className="placeholder">Generated DM will appear here...</span>}
                                    </div>
                                )}
                                {dmOutput && (
                                    <div className="nw-output-actions">
                                        <button className="nw-action-btn" onClick={() => setDmEditMode(!dmEditMode)}>
                                            {dmEditMode ? "Save" : "Edit"}
                                        </button>
                                        <button className="nw-action-btn" onClick={() => copyToClipboard(dmOutput, setCopiedDm)}>
                                            {copiedDm ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Networking;
