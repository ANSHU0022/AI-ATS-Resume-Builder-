// ── PDF Export Utility ─────────────────────────────────────────────────────────
// Direct jsPDF + html2canvas approach — replaces html2pdf.js wrapper
// Benefits: precise page slicing, no phantom blank pages, no opacity bugs

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_W_MM = 210;
const A4_H_MM = 297;

// Minimum content height (in canvas px) to qualify as a real page.
// Anything below this is rounding noise and gets discarded.
// At scale=2, 1 CSS pixel = 2 canvas pixels.  A 10-CSS-px sliver
// (≈ 2.6 mm) is definitely not a real page.
const MIN_PAGE_CONTENT_PX = 20;

/**
 * Shared logic: canvas → sliced A4 pages → jsPDF → save.
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 * @param {Array<{href:string, x:number, y:number, w:number, h:number}>} links
 */
function canvasToPDF(canvas, filename, links = []) {
  const imgW = canvas.width;
  const imgH = canvas.height;

  const pxPerMM = imgW / A4_W_MM;
  const pageHpx = Math.round(A4_H_MM * pxPerMM); // use round instead of floor

  // Calculate real page count, but discard a trailing sliver
  const rawPages = imgH / pageHpx;
  const remainder = imgH - Math.floor(rawPages) * pageHpx;
  const totalPages = (remainder > MIN_PAGE_CONTENT_PX)
    ? Math.ceil(rawPages)
    : Math.floor(rawPages) || 1;   // at least 1 page

  const pdf = new jsPDF("p", "mm", "a4");

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const srcY = i * pageHpx;
    const srcH = Math.min(pageHpx, imgH - srcY);

    // Safety: skip truly empty slivers
    if (srcH <= MIN_PAGE_CONTENT_PX) continue;

    // Slice this page out of the big canvas
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = imgW;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

    const pageImg = pageCanvas.toDataURL("image/jpeg", 0.98);
    const drawH = srcH / pxPerMM; // height in mm for this slice
    pdf.addImage(pageImg, "JPEG", 0, 0, A4_W_MM, drawH);

    // Apply clickable links to this page
    const pageStartY = i * A4_H_MM;
    const pageEndY = (i + 1) * A4_H_MM;
    
    links.forEach(l => {
      // Check if the link intersects this page vertically
      if (l.y + l.h > pageStartY && l.y < pageEndY) {
        // Calculate coordinates relative to this page
        const linkYOnPage = l.y - pageStartY;
        pdf.link(l.x, linkYOnPage, l.w, l.h, { url: l.href });
      }
    });
  }

  pdf.save(filename);
}

/**
 * Smart Pagination: Injects marginTop to push elements that cross page boundaries,
 * enforcing a strict top and bottom margin for every sliced page.
 * Returns a cleanup function to restore the DOM.
 */
function applySmartPagination(node) {
  const cssPxPerMM = node.offsetWidth / A4_W_MM;
  const pageHeightPx = A4_H_MM * cssPxPerMM;
  
  // Define safe zones (margins)
  const topMarginPx = 10 * cssPxPerMM; // 10mm top margin
  const botMarginPx = 10 * cssPxPerMM; // 10mm bottom margin
  
  // Select all block-level elements that shouldn't be split
  // (using div, p, li catches almost everything while ignoring inline spans)
  const selectors = [
    'div', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ];
  const els = Array.from(node.querySelectorAll(selectors.join(',')));
  
  const cleanups = [];
  
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    
    const topPx = rect.top - nodeRect.top;
    const bottomPx = rect.bottom - nodeRect.top;
    const heightPx = bottomPx - topPx;
    
    // Ignore elements that are huge (can't be pushed effectively)
    if (heightPx > pageHeightPx * 0.8) continue;

    const pageIndex = Math.floor(topPx / pageHeightPx);
    const pageStart = pageIndex * pageHeightPx;
    const pageEnd = pageStart + pageHeightPx;
    
    let pushAmount = 0;

    // Rule A: Element crosses the bottom margin safe zone (or straddles boundary entirely)
    if (bottomPx > pageEnd - botMarginPx) {
      // Push it to start exactly at the top margin of the NEXT page
      pushAmount = (pageEnd + topMarginPx) - topPx;
    } 
    // Rule B: Element naturally starts inside the top margin of a new page (page > 1)
    else if (pageIndex > 0 && topPx < pageStart + topMarginPx) {
      pushAmount = (pageStart + topMarginPx) - topPx;
    }

    if (pushAmount > 1) { // >1px to ignore subpixel noise
      const originalMarginTop = el.style.marginTop;
      const currentMarginTop = parseFloat(window.getComputedStyle(el).marginTop) || 0;
      
      el.style.marginTop = `${currentMarginTop + pushAmount}px`;
      
      cleanups.push(() => {
        el.style.marginTop = originalMarginTop;
      });
    }
  }
  
  return () => cleanups.forEach(fn => fn());
}

/**
 * Extract exact positions of all hyperlinks to overlay on the PDF.
 */
function extractLinks(node) {
  const links = [];
  const anchors = node.querySelectorAll('a[href]');
  const nodeRect = node.getBoundingClientRect();
  const cssPxPerMM = node.offsetWidth / A4_W_MM;
  
  anchors.forEach(a => {
    let url = a.href;
    const rawHref = a.getAttribute('href') || '';
    
    // Fix incorrectly resolved relative URLs (e.g. user typed "www.linkedin.com")
    if (!rawHref.startsWith('http') && !rawHref.startsWith('mailto:') && !rawHref.startsWith('tel:')) {
      if (rawHref.includes('.') && !rawHref.startsWith('/')) {
        url = 'https://' + rawHref;
      }
    }

    const rect = a.getBoundingClientRect();
    links.push({
      href: url,
      x: (rect.left - nodeRect.left) / cssPxPerMM,
      y: (rect.top - nodeRect.top) / cssPxPerMM,
      w: rect.width / cssPxPerMM,
      h: rect.height / cssPxPerMM
    });
  });
  return links;
}

/**
 * exportResumePDF — captures the export-root DOM node, slices it into
 * exact A4-sized pages, and saves as PDF.  No blank trailing page.
 */
export async function exportResumePDF(ref, name) {
  const node = ref.current;
  if (!node) return;

  // Inject Google Font links so html2canvas can render them
  const fontLinksForPdf = [window.__resumeHeadingFont, window.__resumeBodyFont]
    .filter(f => f && f.googleUrl)
    .map(f => f.googleUrl);
  fontLinksForPdf.forEach(url => {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = url;
      document.head.appendChild(l);
    }
  });

  // 1) Push elements that straddle the A4 boundary
  const cleanupPagination = applySmartPagination(node);

  // 2) Extract link coordinates AFTER pagination is applied
  const links = extractLinks(node);

  // Capture the full export root as a single canvas
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Restore DOM
  cleanupPagination();

  // 3) Convert to PDF and overlay links
  canvasToPDF(canvas, `${name || "Resume"}.pdf`, links);
}

/**
 * exportCoverLetterPDF — renders an off-screen HTML element to PDF.
 * Handles fonts, multi-page, no blank pages.
 */
export async function exportCoverLetterPDF(el, filename) {
  // 1) Apply smart pagination
  const cleanupPagination = applySmartPagination(el);

  // 2) Extract links
  const links = extractLinks(el);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Restore DOM
  cleanupPagination();

  canvasToPDF(canvas, filename, links);
}
