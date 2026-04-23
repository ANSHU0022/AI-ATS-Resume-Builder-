function cloneHeadForPrint() {
  const nodes = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'));
  return nodes.map((node) => node.outerHTML).join("\n");
}

function getPdfRenderEndpoint() {
  const envUrl = import.meta.env.VITE_PDF_RENDER_URL;
  if (envUrl) return envUrl;

  if (import.meta.env.DEV) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001/api/pdf/render`;
  }

  return "/api/pdf/render";
}

function getBackendHealthEndpoint() {
  const pdfEndpoint = getPdfRenderEndpoint();
  return pdfEndpoint.replace(/\/api\/pdf\/render$/, "/api/health");
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function buildHtmlDocument(node, title) {
  const clonedNode = node.cloneNode(true);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${cloneHeadForPrint()}
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { width: 794px; margin: 0 auto; overflow: visible; }
      .resume-export-root { width: 794px; background: #fff; }
      .resume-export-page {
        width: 794px;
        height: 1123px;
        background: #fff;
        overflow: hidden;
        position: relative;
        break-after: page;
        page-break-after: always;
      }
      .resume-export-page:last-child {
        break-after: auto;
        page-break-after: auto;
      }
      @page { size: A4; margin: 0; }
    </style>
  </head>
  <body>${clonedNode.outerHTML}</body>
</html>`;
}

async function exportNodeViaServer(node, filename) {
  let healthOk = false;
  try {
    const resp = await fetch(getBackendHealthEndpoint(), { method: "GET" });
    healthOk = resp.ok;
  } catch {
    healthOk = false;
  }

  if (!healthOk) {
    throw new Error("PDF server is not running. Start the backend on port 3001 and try again.");
  }

  const html = buildHtmlDocument(node, filename);
  const response = await fetch(getPdfRenderEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!response.ok) {
    let message = "PDF export failed.";
    try {
      const data = await response.json();
      message = data?.error?.message || data?.message || message;
    } catch {
      // Keep generic fallback message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error("PDF export failed. Please try again.");
  }

  triggerBlobDownload(blob, filename);
}

export async function exportResumePDF(ref, name) {
  const node = ref.current;
  if (!node) return;

  const fontLinksForPdf = [window.__resumeHeadingFont, window.__resumeBodyFont]
    .filter((font) => font && font.googleUrl)
    .map((font) => font.googleUrl);

  fontLinksForPdf.forEach((url) => {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  });

  try {
    await exportNodeViaServer(node, `${name || "Resume"}.pdf`);
  } catch (error) {
    alert(error.message || "PDF export failed.");
  }
}

export async function exportCoverLetterPDF(el, filename) {
  try {
    await exportNodeViaServer(el, filename);
  } catch (error) {
    alert(error.message || "PDF export failed.");
  }
}
