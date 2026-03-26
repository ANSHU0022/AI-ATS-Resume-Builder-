import React from 'react';
import { Link } from 'react-router-dom';
import TemplateSelector from '../TemplateSelector/TemplateSelector';
import styles from './EditorNavbar.module.css';

export default function EditorNavbar({
    onCompile,
    isCompiling,
    onSelectTemplate,
    pdfUrl
}) {
    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className={styles.navbar}>
            <div className={styles.navLeft}>
                <Link to="/" className={styles.homeLink} title="Back to main app">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </Link>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>$\\LaTeX$</span>
                    <span className={styles.logoText}>Editor</span>
                </div>
            </div>

            <div className={styles.navCenter}>
                <div className={styles.betaBadge}>BETA VERSION</div>
            </div>

            <div className={styles.navRight}>
                <TemplateSelector onSelectTemplate={onSelectTemplate} />

                <button
                    className={`${styles.btn} ${styles.compileBtn} ${isCompiling ? styles.loading : ''}`}
                    onClick={onCompile}
                    disabled={isCompiling}
                >
                    {isCompiling ? (
                        <>
                            <div className={styles.btnSpinner}></div>
                            <span className={styles.btnLabel}>Compiling...</span>
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span className={styles.btnLabel}>Compile</span>
                        </>
                    )}
                </button>

                <button
                    className={`${styles.btn} ${styles.downloadBtn}`}
                    onClick={handleDownload}
                    disabled={!pdfUrl || isCompiling}
                    title={!pdfUrl ? "Compile PDF first to download" : "Download PDF"}
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span className={styles.btnLabel}>Download PDF</span>
                </button>
            </div >
        </div >
    );
}
