import React, { useState, useEffect } from 'react';
import EditorNavbar from '../components/EditorNavbar/EditorNavbar';
import EditorPanel from '../components/EditorPanel/EditorPanel';
import PreviewPanel from '../components/PreviewPanel/PreviewPanel';
import ErrorPanel from '../components/ErrorPanel/ErrorPanel';
import TemplateSelector from '../components/TemplateSelector/TemplateSelector';
import { useLatexCompiler } from '../hooks/useLatexCompiler';
import styles from './LatexEditor.module.css';
import { faangResume } from '../templates/faangResume';

export default function LatexEditor() {
    const {
        latexCode,
        setLatexCode,
        isCompiling,
        pdfUrl,
        errors,
        handleCompile,
        loadTemplate,
        lastCompiledAt
    } = useLatexCompiler(faangResume);

    const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview' | 'templates'
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isMobile = windowWidth <= 768;

    return (
        <div className={styles.pageContainer}>
            {/* Mobile tab visibility */}
            <style>{`
                @media (max-width: 768px) {
                    .latex-left  { display: ${mobileTab === 'preview' ? 'none' : 'flex'} !important; }
                    .latex-right { display: ${mobileTab === 'preview' ? 'flex' : 'none'} !important; }
                    .latex-divider { display: none !important; }
                }
            `}</style>

            <EditorNavbar
                onCompile={handleCompile}
                isCompiling={isCompiling}
                onSelectTemplate={loadTemplate}
                pdfUrl={pdfUrl}
                betaVersion={true}
            />

            {/* Mobile template drawer */}
            {isMobile && showTemplates && (
                <div className={styles.mobileTemplateDrawer}>
                    <div className={styles.mobileTemplateHeader}>
                        <span>Select Template</span>
                        <button onClick={() => setShowTemplates(false)} className={styles.mobileTemplateClose}>✕</button>
                    </div>
                    <TemplateSelector onSelectTemplate={(t) => { loadTemplate(t); setShowTemplates(false); setMobileTab('editor'); }} />
                </div>
            )}

            <div className={styles.splitScreenContainer}>
                {/* Left Panel: Code Editor */}
                <div className={`${styles.leftPanel} latex-left`}>
                    <EditorPanel
                        latexCode={latexCode}
                        onChange={setLatexCode}
                        onCompile={handleCompile}
                        lastCompiledAt={lastCompiledAt}
                    />
                </div>

                <div className={`${styles.divider} latex-divider`}></div>

                {/* Right Panel: PDF Preview */}
                <div className={`${styles.rightPanel} latex-right`}>
                    <PreviewPanel
                        pdfUrl={pdfUrl}
                        isCompiling={isCompiling}
                        errors={errors}
                    />
                    <ErrorPanel errors={errors} />
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className={styles.mobileBottomNav}>
                <button
                    className={mobileTab === 'editor' ? styles.mobileNavActive : ''}
                    onClick={() => setMobileTab('editor')}
                >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                    </svg>
                    Editor
                </button>
                <button
                    className={showTemplates ? styles.mobileNavActive : ''}
                    onClick={() => { setShowTemplates(v => !v); setMobileTab('editor'); }}
                >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    Templates
                </button>
                <button
                    className={mobileTab === 'preview' ? styles.mobileNavActive : ''}
                    onClick={() => { setMobileTab('preview'); setShowTemplates(false); }}
                >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Preview
                </button>
                <button
                    onClick={() => {
                        if (!isCompiling) handleCompile();
                    }}
                    className={isCompiling ? styles.mobileNavCompiling : ''}
                >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    {isCompiling ? 'Running...' : 'Compile'}
                </button>
                <button
                    onClick={() => {
                        if (!pdfUrl) return;
                        const a = document.createElement('a');
                        a.href = pdfUrl;
                        a.download = 'resume.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}
                    disabled={!pdfUrl || isCompiling}
                    className={pdfUrl && !isCompiling ? styles.mobileNavDownload : ''}
                    title={!pdfUrl ? 'Compile first to download' : 'Download PDF'}
                >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                </button>
            </nav>
        </div>
    );
}
