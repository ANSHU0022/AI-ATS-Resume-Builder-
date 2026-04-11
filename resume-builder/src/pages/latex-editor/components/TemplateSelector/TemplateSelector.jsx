import React from 'react';
import styles from './TemplateSelector.module.css';

import { faangResume } from '../../templates/faangResume';

export default function TemplateSelector({ onSelectTemplate }) {
    const handleSelect = () => {
        // Basic confirmation dialog before overwriting
        if (window.confirm('Are you sure you want to load the FAANG Industry template? This will overwrite your current code.')) {
            onSelectTemplate(faangResume);
        }
    };

    return (
        <div className={styles.selectorContainer}>
            <button
                className={styles.dropdownButton}
                onClick={handleSelect}
                title="Load FAANG Industry Template"
            >
                FAANG Industry
                <svg className={styles.chevron} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="7 13 12 8 17 13"></polyline>
                </svg>
            </button>
        </div>
    );
}
