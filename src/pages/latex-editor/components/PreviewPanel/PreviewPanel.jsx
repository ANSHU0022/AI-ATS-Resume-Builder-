import React from 'react';
import styles from './PreviewPanel.module.css';

export default function PreviewPanel({ pdfUrl, isCompiling, errors }) {
    // If we have errors and no previous PDF, or simply errors occurred
    const hasErrors = errors && errors.length > 0;

    return (
        <div className={styles.previewContainer}>

            {isCompiling && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Compiling PDF...</p>
                </div>
            )}

            {!pdfUrl && !isCompiling && !hasErrors && (
                <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>📄</div>
                    <h3>No PDF generated yet</h3>
                    <p>Click the <strong>Compile</strong> button (or press Ctrl+Enter) to generate your resume preview.</p>
                </div>
            )}

            {pdfUrl && (
                <iframe
                    className={`${styles.pdfFrame} ${isCompiling ? styles.blur : ''}`}
                    src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="Resume PDF Preview"
                />
            )}
        </div>
    );
}
