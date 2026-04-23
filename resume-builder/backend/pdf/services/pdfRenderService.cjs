const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let browserPromise = null;

function firstExistingPath(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return "";
}

function resolveChromeExecutablePath() {
  const envExecutable = (process.env.PUPPETEER_EXECUTABLE_PATH || "").trim();
  if (envExecutable && fs.existsSync(envExecutable)) {
    return envExecutable;
  }

  const systemChrome = firstExistingPath([
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Chromium", "Application", "chrome.exe"),
  ]);
  if (systemChrome) {
    return systemChrome;
  }

  const bundledExecutable = puppeteer.executablePath();
  return bundledExecutable && fs.existsSync(bundledExecutable) ? bundledExecutable : "";
}

function getLaunchOptions() {
  const executablePath = resolveChromeExecutablePath();
  const isWindows = process.platform === "win32";

  return {
    headless: true,
    executablePath: executablePath || undefined,
    args: [
      "--disable-dev-shm-usage",
      "--font-render-hinting=medium",
      ...(isWindows ? [] : ["--no-sandbox", "--disable-setuid-sandbox"]),
    ],
  };
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch(getLaunchOptions());
    browserPromise.then((browser) => {
      browser.on("disconnected", () => {
        browserPromise = null;
      });
    }).catch(() => {
      browserPromise = null;
    });
  }

  return browserPromise;
}

async function renderPdfFromHtml({ html, headerHtml = "", footerHtml = "" }) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.emulateMediaType("screen");
    await page.setContent(html, { waitUntil: ["domcontentloaded", "networkidle0"] });
    await page.evaluateHandle("document.fonts.ready");

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      displayHeaderFooter: Boolean(headerHtml || footerHtml),
      headerTemplate: headerHtml || "<span></span>",
      footerTemplate: footerHtml || "<span></span>",
      tagged: true,
    });
  } finally {
    await page.close().catch(() => {});
  }
}

module.exports = {
  renderPdfFromHtml,
};
