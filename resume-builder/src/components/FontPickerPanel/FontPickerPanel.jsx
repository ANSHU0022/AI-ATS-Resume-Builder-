import React, { useState, useEffect } from "react";
import styles from "./FontPickerPanel.module.css";

const FONTS = [
    // Sans-Serif
    { name: "Inter", meta: "Tech & Startups", category: "sans", family: "'DM Sans', sans-serif", quality: "top" },
    { name: "Roboto", meta: "Traditional & Clean", category: "sans", family: "'Roboto', sans-serif", quality: "top" },
    { name: "Open Sans", meta: "Corporate", category: "sans", family: "'Open Sans', sans-serif", quality: "top" },
    { name: "Lato", meta: "Modern & Clean", category: "sans", family: "'Lato', sans-serif", quality: "top" },
    { name: "Poppins", meta: "Geometric & Friendly", category: "sans", family: "'Poppins', sans-serif", quality: "top" },
    { name: "Raleway", meta: "Elegant & Sleek", category: "sans", family: "'Raleway', sans-serif", quality: "good" },
    { name: "Work Sans", meta: "Professional & Bold", category: "sans", family: "'Work Sans', sans-serif", quality: "good" },
    { name: "Josefin Sans", meta: "Geometric & Art Deco", category: "sans", family: "'Josefin Sans', sans-serif", quality: "good" },
    { name: "Source Sans 3", meta: "Editorial", category: "sans", family: "'Source Sans 3', sans-serif", quality: "top" },
    { name: "Nunito Sans", meta: "Friendly & Rounded", category: "sans", family: "'Nunito Sans', sans-serif", quality: "good" },
    // Serif
    { name: "Playfair Display", meta: "Luxury & Editorial", category: "serif", family: "'Playfair Display', serif", quality: "top" },
    { name: "Merriweather", meta: "Classic & Readable", category: "serif", family: "'Merriweather', serif", quality: "top" },
    { name: "PT Serif", meta: "Timeless & Trustworthy", category: "serif", family: "'PT Serif', serif", quality: "good" },
    { name: "Libre Baskerville", meta: "Academic & Formal", category: "serif", family: "'Libre Baskerville', serif", quality: "good" },
    { name: "EB Garamond", meta: "Historic & Elegant", category: "serif", family: "'EB Garamond', serif", quality: "good" },
    { name: "Crimson Text", meta: "Literary & Rich", category: "serif", family: "'Crimson Text', serif", quality: "good" },
];

const PAIRINGS = [
    { name: "Professional", desc: "Georgia + Lato", heading: "Lato", body: "Open Sans" },
    { name: "Modern Tech", desc: "Inter + Roboto", heading: "Inter", body: "Roboto" },
    { name: "Executive", desc: "Playfair + Open Sans", heading: "Playfair Display", body: "Open Sans" },
    { name: "Classic ATS", desc: "Roboto + Source Sans", heading: "Roboto", body: "Source Sans 3" },
];

export default function FontPickerPanel({
    isOpen,
    onClose,
    onApply,
    defaultHeading = "Inter",
    defaultBody = "Roboto",
}) {
    const [selectedHeading, setSelectedHeading] = useState(defaultHeading);
    const [selectedBody, setSelectedBody] = useState(defaultBody);
    const [selectedPairing, setSelectedPairing] = useState("Modern Tech");

    useEffect(() => {
        if (isOpen) {
            const link = document.createElement("link");
            link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=Roboto:wght@300;400;500&family=Open+Sans:wght@300;400;600&family=Lato:wght@300;400;700&family=Source+Sans+3:wght@300;400;600&family=Nunito+Sans:wght@300;400;600&family=Merriweather:wght@300;400;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600&family=Raleway:wght@300;400;600&family=Poppins:wght@300;400;500;600&family=Work+Sans:wght@300;400;500&family=Josefin+Sans:wght@300;400;600&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;600&display=swap";
            link.rel = "stylesheet";
            document.head.appendChild(link);
            return () => {
                // Option to remove the link on unmount, or leave it. Leaving it is usually better for caching.
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePairingClick = (pairing) => {
        setSelectedHeading(pairing.heading);
        setSelectedBody(pairing.body);
        setSelectedPairing(pairing.name);
    };

    const handleReset = () => {
        setSelectedHeading("Inter");
        setSelectedBody("Roboto");
        setSelectedPairing("Modern Tech");
    };

    const renderFontCard = (font, selectedFont, onSelect) => {
        const isActive = selectedFont === font.name;
        const badgeClass = isActive
            ? styles.badgeSelected
            : font.quality === "top"
                ? styles.badgeExcellent
                : styles.badgeGood;
        const badgeText = isActive ? "● Active" : font.quality === "top" ? "Top" : "Good";

        return (
            <div
                key={font.name}
                className={`${styles.fontCard} ${isActive ? styles.fontCardActive : ""}`}
                onClick={() => {
                    onSelect(font.name);
                    setSelectedPairing(null);
                }}
            >
                <div className={styles.fontLeft}>
                    <div className={styles.fontSwatch} style={{ fontFamily: font.family }}>Aa</div>
                    <div>
                        <div className={styles.fontDisplay} style={{ fontFamily: font.family }}>{font.name}</div>
                        <div className={styles.fontMeta}>{font.meta}</div>
                    </div>
                </div>
                <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>
            </div>
        );
    };

    return (
        <div className={styles.backdrop} onClick={(e) => {
            // Close only if clicking the backdrop itself
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>T</div>
                        <div className={styles.headerText}>
                            <h2>Font Picker <span className={styles.atsBadge}>✓ ATS Safe</span></h2>
                            <p>All fonts are recruiter & ATS scanner approved</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.columns}>
                        {/* HEADING FONT */}
                        <div>
                            <div className={styles.colHeader}>
                                <div className={styles.colLabel}>Heading Font</div>
                                <div className={styles.colCount}>{FONTS.length} fonts</div>
                            </div>
                            <div className={styles.colApplies}>
                                <span className={styles.appliesIcon}>H</span>
                                Applies to: <strong>Your Name, Section Titles & Company Names</strong>
                            </div>
                            <div className={styles.fontScrollWrap}>
                                <div className={styles.fontList}>
                                    <div className={styles.catDivider}>Sans-Serif</div>
                                    {FONTS.filter(f => f.category === "sans").map(font => renderFontCard(font, selectedHeading, setSelectedHeading))}
                                    <div className={styles.catDivider}>Serif</div>
                                    {FONTS.filter(f => f.category === "serif").map(font => renderFontCard(font, selectedHeading, setSelectedHeading))}
                                </div>
                            </div>
                        </div>

                        {/* BODY FONT */}
                        <div>
                            <div className={styles.colHeader}>
                                <div className={styles.colLabel}>Body Font</div>
                                <div className={styles.colCount}>{FONTS.length} fonts</div>
                            </div>
                            <div className={styles.colApplies}>
                                <span className={styles.appliesIcon}>B</span>
                                Applies to: <strong>Bullets, Descriptions & Dates</strong>
                            </div>
                            <div className={styles.fontScrollWrap}>
                                <div className={styles.fontList}>
                                    <div className={styles.catDivider}>Sans-Serif</div>
                                    {FONTS.filter(f => f.category === "sans").map(font => renderFontCard(font, selectedBody, setSelectedBody))}
                                    <div className={styles.catDivider}>Serif</div>
                                    {FONTS.filter(f => f.category === "serif").map(font => renderFontCard(font, selectedBody, setSelectedBody))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionDivider}></div>

                    <div className={styles.pairingsLabel}>
                        <span></span> Curated Pairings <span></span>
                    </div>
                    <div className={styles.pairingsGrid}>
                        {PAIRINGS.map(pairing => (
                            <div
                                key={pairing.name}
                                className={`${styles.pairingBtn} ${selectedPairing === pairing.name ? styles.pairingBtnActive : ""}`}
                                onClick={() => handlePairingClick(pairing)}
                            >
                                <div className={styles.pairingName}>{pairing.name}</div>
                                <div className={styles.pairingDesc}>{pairing.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.panelFooter}>
                    <div className={styles.previewPill}>
                        <div className={styles.dot}></div>
                        <span>{selectedHeading} + {selectedBody}</span>
                    </div>
                    <div className={styles.footerActions}>
                        <button className={styles.btnReset} onClick={handleReset}>Reset</button>
                        <button className={styles.btnApply} onClick={() => onApply(selectedHeading, selectedBody)}>Apply Fonts</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
