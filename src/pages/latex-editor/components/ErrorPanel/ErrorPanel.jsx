import React, { useState } from 'react';
import styles from './ErrorPanel.module.css';

export default function ErrorPanel({ errors }) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!errors || errors.length === 0) {
        return null;
    }

    return (
        <div className={styles.errorContainer}>
            <div
                className={styles.errorHeader}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={styles.errorTitle}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Compilation Failed ({errors.length} errors)
                </div>
                <button className={styles.toggleBtn}>
                    {isExpanded ? 'Hide' : 'Show'}
                </button>
            </div>

            {isExpanded && (
                <div className={styles.errorList}>
                    {errors.map((err, idx) => (
                        <div key={idx} className={styles.errorItem}>
                            {err.line && <span className={styles.errorLine}>Line {err.line}:</span>}
                            <span className={styles.errorMessage}>{err.message}</span>
                        </div>
                    ))}
                    <div className={styles.errorHint}>
                        Tip: Ensure you have closed all environments (e.g., \end{'{'}itemize{'}'}) and imported necessary packages.
                    </div>
                </div>
            )}
        </div>
    );
}
