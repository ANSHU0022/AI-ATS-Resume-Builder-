import React, { useState, useRef, useEffect } from 'react';
import styles from './TemplateSelector.module.css';

// Import raw latex strings from the feature-local templates folder
import { jakesResume } from '../../templates/jakesResume';
import { altaCV } from '../../templates/altaCV';
import { modernCV } from '../../templates/modernCV';
import { awesomeCV } from '../../templates/awesomeCV';
import { faangResume } from '../../templates/faangResume';

const TEMPLATES = [
    { id: 'faang', name: "FAANG Industry", description: "Single column, professional & ATS-optimized", content: faangResume },
    { id: 'jakes', name: "Jake's Resume", description: 'Single column, classic ATS-friendly', content: jakesResume },
    { id: 'alta', name: "AltaCV", description: 'Two column layout with sidebar', content: altaCV },
    { id: 'modern', name: "ModernCV", description: 'Classic professional format', content: modernCV },
    { id: 'awesome', name: "Awesome-CV", description: 'Modern and colorful design', content: awesomeCV }
];

export default function TemplateSelector({ onSelectTemplate }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (template) => {
        // Basic confirmation dialog before overwriting
        if (window.confirm(`Are you sure you want to load the ${template.name} template? This will overwrite your current code.`)) {
            onSelectTemplate(template.content);
            setIsOpen(false);
        }
    };

    return (
        <div className={styles.selectorContainer} ref={dropdownRef}>
            <button
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                title="Choose a starting template"
            >
                Templates
                <svg className={`${styles.chevron} ${isOpen ? styles.open : ''}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {TEMPLATES.map((tpl) => (
                        <div
                            key={tpl.id}
                            className={styles.templateItem}
                            onClick={() => handleSelect(tpl)}
                        >
                            <div className={styles.templateName}>{tpl.name}</div>
                            <div className={styles.templateDesc}>{tpl.description}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
