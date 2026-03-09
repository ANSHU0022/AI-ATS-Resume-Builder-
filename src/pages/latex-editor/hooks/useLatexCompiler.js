import { useState, useEffect, useCallback } from 'react';
import { compileLatexCode } from '../services/latexService';
import { createPdfBlobUrl } from '../utils/latexHelpers';

const AUTOSAVE_INTERVAL_MS = 30000; // 30 seconds
const STORAGE_KEY = 'latex_editor_draft';

export function useLatexCompiler(initialTemplateCode) {
    const [latexCode, setLatexCode] = useState('');
    const [isCompiling, setIsCompiling] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [errors, setErrors] = useState([]);
    const [lastCompiledAt, setLastCompiledAt] = useState(null);

    // Initialize state with initialTemplateCode or localStorage draft
    useEffect(() => {
        // If the initialTemplateCode is the default blank code, try to load draft
        const isBlankTemplate = typeof initialTemplateCode === 'string' && initialTemplateCode.includes('Write or paste your LaTeX code here');

        if (isBlankTemplate) {
            const savedDraft = localStorage.getItem(STORAGE_KEY);
            if (savedDraft) {
                setLatexCode(savedDraft);
            } else {
                setLatexCode(initialTemplateCode);
            }
        } else {
            // If a specific template was passed initially, prioritize it
            setLatexCode(initialTemplateCode);
        }
    }, [initialTemplateCode]);

    // Handle template change
    const loadTemplate = (templateCode) => {
        setLatexCode(templateCode);
        localStorage.setItem(STORAGE_KEY, templateCode);
        handleCompile(templateCode);
    };

    // Compile action
    const handleCompile = useCallback(async (overrideCode) => {
        const codeToCompile = typeof overrideCode === 'string' ? overrideCode : latexCode;
        if (!codeToCompile.trim()) {
            setErrors([{ message: 'Editor is empty. Please enter LaTeX code.' }]);
            return;
        }

        setIsCompiling(true);
        setErrors([]);

        const result = await compileLatexCode(codeToCompile);

        if (result.success && result.pdf) {
            // Free old blob URL to prevent memory leaks
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }

            const newPdfUrl = createPdfBlobUrl(result.pdf);
            setPdfUrl(newPdfUrl);
            setLastCompiledAt(new Date());
        } else {
            setErrors(result.errors);
        }

        setIsCompiling(false);

        // Auto-save on successful manual compile as well
        localStorage.setItem(STORAGE_KEY, codeToCompile);
    }, [latexCode, pdfUrl]);

    // Debounced Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (latexCode) {
                localStorage.setItem(STORAGE_KEY, latexCode);
            }
        }, 2000); // Save to local storage 2 seconds after last type

        return () => clearTimeout(timer);
    }, [latexCode]);

    // Clean up Blob URLs when unmounting
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    return {
        latexCode,
        setLatexCode,
        isCompiling,
        pdfUrl,
        errors,
        handleCompile,
        loadTemplate,
        lastCompiledAt
    };
}
