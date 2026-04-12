import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import { compileLatexCode } from "../../latex-editor/services/latexService";
import { createPdfBlobUrl } from "../../latex-editor/utils/latexHelpers";
import { buildTemplate5Latex } from "../templates/template5Latex";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export default function Template5Preview({ data, onPreviewChange }) {
  const latexCode = useMemo(() => buildTemplate5Latex(data), [data]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isRenderingMobilePreview, setIsRenderingMobilePreview] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const latestUrlRef = useRef(null);
  const previewContainerRef = useRef(null);
  const compileRequestRef = useRef(0);
  const lastCompiledLatexRef = useRef("");
  const isMobileOrTablet = windowWidth <= 1024;

  const clearPreviewUrl = () => {
    if (latestUrlRef.current) {
      URL.revokeObjectURL(latestUrlRef.current);
      latestUrlRef.current = null;
    }
    setPdfUrl(null);
    setPreviewImages([]);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (latexCode === lastCompiledLatexRef.current) return;

      const requestId = compileRequestRef.current + 1;
      compileRequestRef.current = requestId;
      setIsCompiling(true);
      setErrors([]);
      onPreviewChange?.({ pdfUrl: latestUrlRef.current, isCompiling: true, errors: [], latexCode });

      const result = await compileLatexCode(latexCode);
      if (requestId !== compileRequestRef.current) return;

      if (result.success && result.pdf) {
        const nextUrl = createPdfBlobUrl(result.pdf);
        if (latestUrlRef.current) URL.revokeObjectURL(latestUrlRef.current);
        latestUrlRef.current = nextUrl;
        lastCompiledLatexRef.current = latexCode;
        setPdfUrl(nextUrl);
        setErrors([]);
        onPreviewChange?.({ pdfUrl: nextUrl, isCompiling: false, errors: [], latexCode });
      } else {
        const nextErrors = result.errors || [{ message: "Template 5 compilation failed." }];
        clearPreviewUrl();
        setErrors(nextErrors);
        onPreviewChange?.({ pdfUrl: null, isCompiling: false, errors: nextErrors, latexCode });
      }

      setIsCompiling(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, [latexCode, onPreviewChange]);

  useEffect(() => {
    return () => {
      clearPreviewUrl();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderMobilePreview = async () => {
      if (!pdfUrl || !isMobileOrTablet) {
        setPreviewImages([]);
        setIsRenderingMobilePreview(false);
        return;
      }

      setIsRenderingMobilePreview(true);

      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const containerWidth = Math.max(280, previewContainerRef.current?.clientWidth || windowWidth - 32);
        const pageImages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(1.35, containerWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          pageImages.push({
            pageNumber,
            src: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height,
          });
        }

        if (!cancelled) setPreviewImages(pageImages);
      } catch {
        if (!cancelled) setPreviewImages([]);
      } finally {
        if (!cancelled) setIsRenderingMobilePreview(false);
      }
    };

    renderMobilePreview();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, isMobileOrTablet, windowWidth]);

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

      <div ref={previewContainerRef} style={{ width: "100%", minHeight: isMobileOrTablet ? 420 : 1080, background: "#fff", borderRadius: 18, boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.9)" }}>
        {pdfUrl && !isMobileOrTablet ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title="Template 5 PDF Preview"
            style={{ width: "100%", minHeight: 1080, border: "none", background: "#fff" }}
          />
        ) : pdfUrl && isMobileOrTablet ? (
          <div style={{ padding: 12, background: "#f8fafc", minHeight: 420 }}>
            {isRenderingMobilePreview && previewImages.length === 0 ? (
              <div style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                Rendering mobile preview...
              </div>
            ) : previewImages.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {previewImages.map((page) => (
                  <div key={page.pageNumber} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.9)" }}>
                    <img
                      src={page.src}
                      alt={`Template 5 page ${page.pageNumber}`}
                      style={{ display: "block", width: "100%", height: "auto", background: "#fff" }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                <div>Mobile preview is preparing. You can still open or download the compiled PDF.</div>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "9px 14px", borderRadius: 999, background: "#6B4DB0", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                >
                  Open PDF
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ minHeight: isMobileOrTablet ? 420 : 1080, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            {isCompiling ? "Generating Template 5 PDF preview..." : "Template 5 preview will appear here once the LaTeX compiles."}
          </div>
        )}
      </div>
    </div>
  );
}
