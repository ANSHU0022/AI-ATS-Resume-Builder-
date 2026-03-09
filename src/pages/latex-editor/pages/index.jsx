import React from 'react';
import EditorNavbar from '../components/EditorNavbar/EditorNavbar';
import EditorPanel from '../components/EditorPanel/EditorPanel';
import PreviewPanel from '../components/PreviewPanel/PreviewPanel';
import ErrorPanel from '../components/ErrorPanel/ErrorPanel';
import { useLatexCompiler } from '../hooks/useLatexCompiler';
import styles from './LatexEditor.module.css';
import { faangResume } from '../templates/faangResume'; // Import the FAANG template

// The DEFAULT_BLANK_CODE is no longer the primary default, but kept for reference or other uses if needed.
const DEFAULT_BLANK_CODE = `% Write or paste your LaTeX code here.\n% Or select a template from the "Templates" dropdown above.\n`;

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
    } = useLatexCompiler(faangResume); // Pass faangResume as the initial template

    return (
        <div className={styles.pageContainer}>
            <EditorNavbar
                onCompile={handleCompile}
                isCompiling={isCompiling}
                onSelectTemplate={loadTemplate}
                pdfUrl={pdfUrl}
                // Add the beta version text to the EditorNavbar
                betaVersion={true}
            />

            <div className={styles.splitScreenContainer}>
                {/* Left Panel: Code Editor */}
                <div className={styles.leftPanel}>
                    <EditorPanel
                        latexCode={latexCode}
                        onChange={setLatexCode}
                        onCompile={handleCompile}
                        lastCompiledAt={lastCompiledAt}
                    />
                </div>

                {/* Resize Divider */}
                <div className={styles.divider}></div>

                {/* Right Panel: Live PDF Preview */}
                <div className={styles.rightPanel}>
                    <PreviewPanel
                        pdfUrl={pdfUrl}
                        isCompiling={isCompiling}
                        errors={errors}
                    />
                    <ErrorPanel errors={errors} />
                </div>
            </div>
        </div>
    );
}
