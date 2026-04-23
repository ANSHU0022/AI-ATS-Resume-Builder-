const { renderPdfFromHtml } = require("../services/pdfRenderService.cjs");

function sanitizeFilename(filename = "document.pdf") {
  const clean = String(filename)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);

  return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean || "document"}.pdf`;
}

exports.render = async (req, res) => {
  try {
    const { html, filename, headerHtml, footerHtml } = req.body || {};

    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "A full HTML document string is required." });
    }

    const pdfBuffer = await renderPdfFromHtml({ html, headerHtml, footerHtml });
    const safeFilename = sanitizeFilename(filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF render error:", error);
    return res.status(500).json({ error: error.message || "Failed to render PDF." });
  }
};
