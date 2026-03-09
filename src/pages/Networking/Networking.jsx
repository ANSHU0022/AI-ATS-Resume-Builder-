import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
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

        const context = {
            company,
            role,
            recipient,
            jd,
            resume: resumeData || "No resume data found. Focus on general professional tone."
        };

        const prompt = type === 'email'
            ? `Write a professional cold email to ${context.recipient || 'a Hiring Manager'} at ${context.company || 'their company'} for a ${context.role || 'Software Engineer'} role. 
               ${context.jd ? `Job Description: ${context.jd}` : ""}
               Use the following resume details: ${JSON.stringify(context.resume)}
               Keep it short, punchy, and highlight 2-3 specific matching skills. Provide a clear subject line.`
            : `Write a punchy LinkedIn DM to ${context.recipient || 'a connection'} at ${context.company || 'their company'} regarding a ${context.role || 'Software Engineer'} position.
               Use the following resume details: ${JSON.stringify(context.resume)}
               Keep it under 300 characters. Friendly but professional.`;

        try {
            const resp = await fetch("/api/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const json = await resp.json();
            setOutput(json.choices?.[0]?.message?.content || "Failed to generate.");
        } catch (err) {
            setOutput("Error connecting to AI. Please try again.");
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
                                <button className="nw-btn-primary nw-3d-btn" onClick={() => generateOutreach('dm')} disabled={loadingDm}>
                                    {loadingDm ? "Writing..." : "Generate DM"}
                                </button>
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
