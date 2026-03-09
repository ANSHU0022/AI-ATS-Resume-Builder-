import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import styles from './EditorPanel.module.css';

export default function EditorPanel({ latexCode, onChange, onCompile, lastCompiledAt }) {
    const editorRef = useRef(null);

    // Count words (simple regex approximation) and lines
    const wordCount = latexCode ? latexCode.trim().split(/\s+/).length : 0;
    const lineCount = latexCode ? latexCode.split('\n').length : 0;

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        // Add command for Cmd/Ctrl + Enter to trigger compile
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            onCompile();
        });
    };

    // Force Monaco refresh when incoming state changes drastically (e.g., template swap)
    useEffect(() => {
        if (editorRef.current) {
            const currentEditorValue = editorRef.current.getValue();
            if (latexCode !== currentEditorValue) {
                editorRef.current.setValue(latexCode);
            }
        }
    }, [latexCode]);

    return (
        <div className={styles.editorContainer}>
            <div className={styles.editorWrapper}>
                <Editor
                    height="100%"
                    language="latex"
                    theme="vs-dark"
                    value={latexCode}
                    onChange={(value) => onChange(value || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        wordWrap: 'on',
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                    loading={<div className={styles.loading}>Loading Editor...</div>}
                />
            </div>

            {/* Editor Status Bar */}
            <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                    <span className={styles.languageIndicator}>LaTeX</span>
                    <span className={styles.stats}>{lineCount} lines</span>
                    <span className={styles.stats}>{wordCount} words</span>
                </div>
                <div className={styles.statusRight}>
                    <span className={styles.lastCompiled}>
                        {lastCompiledAt ? `Last compiled: ${lastCompiledAt.toLocaleTimeString()}` : 'Not compiled yet'}
                    </span>
                    <span className={styles.shortcutHint} title="Compile PDF">Ctrl+Enter</span>
                </div>
            </div>
        </div>
    );
}
