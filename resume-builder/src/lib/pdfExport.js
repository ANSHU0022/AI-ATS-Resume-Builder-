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

function ensureDownloadFrame() {
  const frameName = "pdf-download-frame";
  let frame = document.querySelector(`iframe[name="${frameName}"]`);

  if (!frame) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.style.display = "none";
    document.body.appendChild(frame);
  }

  return frameName;
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
  const form = document.createElement("form");
  form.method = "POST";
  form.action = getPdfRenderEndpoint();
  form.target = ensureDownloadFrame();
  form.style.display = "none";

  const htmlInput = document.createElement("input");
  htmlInput.type = "hidden";
  htmlInput.name = "html";
  htmlInput.value = html;

  const filenameInput = document.createElement("input");
  filenameInput.type = "hidden";
  filenameInput.name = "filename";
  filenameInput.value = filename;

  form.appendChild(htmlInput);
  form.appendChild(filenameInput);
  document.body.appendChild(form);
  form.submit();
  form.remove();
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
