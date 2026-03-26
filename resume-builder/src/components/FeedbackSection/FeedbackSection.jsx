import { useState } from 'react';
import './FeedbackSection.css';

const INITIAL_FORM = {
    name: '',
    email: '',
    whatsapp: '',
    type: 'General Feedback',
    subject: '',
    message: '',
};

const FEEDBACK_TYPES = [
    'General Feedback',
    'Issue / Problem',
    'Feature Request',
    'Improvement Suggestion',
];

export default function FeedbackSection() {
    const [formData, setFormData] = useState(INITIAL_FORM);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formattedMessage = [
            'Hello ATSForge Team,',
            '',
            '*New Feedback Submission*',
            `Name: ${formData.name}`,
            `Email: ${formData.email}`,
            `WhatsApp: ${formData.whatsapp || 'Not provided'}`,
            `Category: ${formData.type}`,
            `Subject: ${formData.subject}`,
            '',
            'Feedback / Issue Details:',
            formData.message,
        ].join('\n');

        const whatsappUrl = `https://wa.me/919304002266?text=${encodeURIComponent(formattedMessage)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        setFormData(INITIAL_FORM);
    };

    return (
        <section className="feedback-section" id="feedback" aria-labelledby="feedback-heading">
            <div className="feedback-shell">
                <div className="feedback-copy">
                    <div className="feedback-pill">
                        <span className="feedback-pill-dot" />
                        Your Feedback Matters
                    </div>

                    <h2 id="feedback-heading">
                        Help us improve ATSForge for
                        <span> every job seeker</span>
                    </h2>

                    <p className="feedback-intro">
                        Share your feedback, report any issue, or request a feature you want next.
                        Every message goes directly to our WhatsApp so we can review it quickly,
                        fix problems faster, and keep improving your experience.
                    </p>

                    <div className="feedback-points">
                        <div className="feedback-point">
                            <div className="feedback-point-icon">💬</div>
                            <div>
                                <h3>Share honest feedback</h3>
                                <p>Tell us what you liked, what felt confusing, and what can be better.</p>
                            </div>
                        </div>

                        <div className="feedback-point">
                            <div className="feedback-point-icon">🛠</div>
                            <div>
                                <h3>Report issues easily</h3>
                                <p>If something is broken or not working, describe it and we will work on fixing it.</p>
                            </div>
                        </div>

                        <div className="feedback-point">
                            <div className="feedback-point-icon">✨</div>
                            <div>
                                <h3>Request new features</h3>
                                <p>Want a new resume tool or workflow? Send your idea and help shape future updates.</p>
                            </div>
                        </div>
                    </div>

                    <div className="feedback-contact-card">
                        <span className="feedback-contact-label">WhatsApp feedback line</span>
                        <a href="https://wa.me/919304002266" target="_blank" rel="noreferrer">
                            +91 9304002266
                        </a>
                        <p>
                            Opens in WhatsApp with all details pre-filled in a clean format,
                            so you can review and send instantly.
                        </p>
                    </div>
                </div>

                <div className="feedback-form-card">
                    <div className="feedback-form-head">
                        <h3>Send feedback or report a problem</h3>
                        <p>Fill out the form and submit to continue on WhatsApp.</p>
                    </div>

                    <form className="feedback-form" onSubmit={handleSubmit}>
                        <div className="feedback-grid">
                            <label className="feedback-field">
                                <span>Your name</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </label>

                            <label className="feedback-field">
                                <span>Email address</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </label>
                        </div>

                        <div className="feedback-grid">
                            <label className="feedback-field">
                                <span>WhatsApp number</span>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                />
                            </label>

                            <label className="feedback-field">
                                <span>Feedback type</span>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    {FEEDBACK_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="feedback-field">
                            <span>Subject</span>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Short title for your feedback"
                                required
                            />
                        </label>

                        <label className="feedback-field">
                            <span>Feedback / issue details</span>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us your feedback, problem, or requested feature..."
                                rows="6"
                                required
                            />
                        </label>

                        <button className="feedback-submit" type="submit">
                            Submit on WhatsApp
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
