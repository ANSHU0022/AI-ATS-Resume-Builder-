import { useEffect, useMemo, useRef, useState } from "react";
import { compileLatexCode } from "../../latex-editor/services/latexService";
import { createPdfBlobUrl } from "../../latex-editor/utils/latexHelpers";
import { buildTemplate5Latex } from "../templates/template5Latex";

export default function Template5Preview({ data, onPreviewChange }) {
  const latexCode = useMemo(() => buildTemplate5Latex(data), [data]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errors, setErrors] = useState([]);
  const latestUrlRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsCompiling(true);
      setErrors([]);
      onPreviewChange?.({ pdfUrl: latestUrlRef.current, isCompiling: true, errors: [], latexCode });

      const result = await compileLatexCode(latexCode);

      if (result.success && result.pdf) {
        const nextUrl = createPdfBlobUrl(result.pdf);
        if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
        latestUrlRef.current = nextUrl;
        setPdfUrl(nextUrl);
        setErrors([]);
        onPreviewChange?.({ pdfUrl: nextUrl, isCompiling: false, errors: [], latexCode });
      } else {
        const nextErrors = result.errors || [{ message: "Template 5 compilation failed." }];
        setErrors(nextErrors);
        onPreviewChange?.({ pdfUrl: null, isCompiling: false, errors: nextErrors, latexCode });
      }

      setIsCompiling(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [latexCode, onPreviewChange]);

  useEffect(() => {
    return () => {
      if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
    };
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 980, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Template 5 Preview</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>LaTeX PDF preview generated from the same uploaded and edited builder data.</div>
        </div>
        {isCompiling && <div style={{ fontSize: 12, fontWeight: 700, color: "#6B4DB0" }}>Compiling Template 5...</div>}
      </div>

      {errors.length > 0 && (
        <div style={{ width: "100%", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 14, padding: "14px 16px", color: "#9a3412" }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Template 5 compile issue</div>
          <div style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>{errors[0]?.message || "Unknown LaTeX compilation error."}</div>
        </div>
      )}

      <div style={{ width: "100%", minHeight: 1080, background: "#fff", borderRadius: 18, boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.9)" }}>
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title="Template 5 PDF Preview"
            style={{ width: "100%", minHeight: 1080, border: "none", background: "#fff" }}
          />
        ) : (
          <div style={{ minHeight: 1080, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            {isCompiling ? "Generating Template 5 PDF preview..." : "Template 5 preview will appear here once the LaTeX compiles."}
          </div>
        )}
      </div>
    </div>
  );
}
