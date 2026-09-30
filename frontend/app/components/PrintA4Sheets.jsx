"use client";

import { useCallback, useRef, useEffect, useReducer } from "react";
import html2canvas from "html2canvas";

const MM_TO_PX = 3.7795275591;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export async function printA4Sheets({
  selector = ".a4-sheet",
  scale = 2,
  documentTitle = "Abstract",
  onStatus = () => {},
} = {}) {
  // 1. Make sure web fonts are ready, so the capture matches the canvas.
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  const sheets = Array.from(document.querySelectorAll(selector));
  if (sheets.length === 0) {
    console.warn(`[printA4Sheets] No elements matched "${selector}".`);
    return false;
  }

  onStatus("Capturing pages…");

  // 2. Rasterize each sheet sequentially (predictable memory usage).
  const images = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    onStatus(`Capturing page ${i + 1} of ${sheets.length}…`);

    const canvas = await html2canvas(sheet, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: sheet.offsetWidth,
      height: sheet.offsetHeight,
      windowWidth: sheet.scrollWidth,
      windowHeight: sheet.scrollHeight,
      // Strip drop-shadow on the clone so it doesn't bleed into the PDF.
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll(".a4-sheet").forEach((el) => {
          el.style.boxShadow = "none";
          el.style.margin = "0";
        });
      },
    });
    images.push(canvas.toDataURL("image/png"));
  }

  onStatus("Preparing print…");

  // 3. Build a hidden iframe with one image per A4 page.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #ffffff; }
    .page {
      width: ${A4_WIDTH_MM}mm;
      height: ${A4_HEIGHT_MM}mm;
      display: flex;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .page img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  </style>
</head>
<body>
  ${images
    .map((src) => `<div class="page"><img src="${src}" alt="" /></div>`)
    .join("")}
</body>
</html>`);
  doc.close();

  // 4. Wait for all images to decode before printing.
  const imgEls = Array.from(doc.images);
  await Promise.all(
    imgEls.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
    )
  );

  // 5. Print.
  onStatus("Opening print dialog…");
  const win = iframe.contentWindow;

  // Cleanup after the dialog closes (or after a timeout as a safety net).
  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };
  win.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(cleanup, 60000);

  win.focus();
  win.print();
  return true;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export async function captureA4SheetsAsPDF({
  selector = ".a4-sheet",
  root = document,      
  scale = 2,
  onStatus = () => {},
} = {}) {
  // Make sure web fonts are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  // ← CHANGE: query within root
  const sheets = Array.from(root.querySelectorAll(selector));
  if (sheets.length === 0) {
    throw new Error(`No elements matched "${selector}". Make sure the preview is rendered.`);
  }

  onStatus("Capturing pages…");

  const images = [];
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    onStatus(`Capturing page ${i + 1} of ${sheets.length}…`);

    const canvas = await html2canvas(sheet, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: sheet.offsetWidth,
      height: sheet.offsetHeight,
      windowWidth: sheet.scrollWidth,
      windowHeight: sheet.scrollHeight,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll(".a4-sheet").forEach((el) => {
          el.style.boxShadow = "none";
          el.style.margin = "0";
        });
      },
    });
    images.push(canvas.toDataURL("image/png"));
  }

  onStatus("Building PDF…");

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  images.forEach((dataUrl, idx) => {
    if (idx > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH, undefined, "FAST");
  });

  return pdf.output("blob");
}

export function usePrintA4Sheets(options = {}) {
  const printingRef = useRef(false);
  const statusRef = useRef("");
  const listenersRef = useRef(new Set());

  const notify = useCallback(() => {
    listenersRef.current.forEach((fn) => fn(statusRef.current));
  }, []);

  const setStatus = useCallback(
    (s) => {
      statusRef.current = s;
      notify();
    },
    [notify]
  );

  const printSheets = useCallback(
    async (overrides = {}) => {
      if (printingRef.current) return false;
      printingRef.current = true;
      try {
        return await printA4Sheets({
          ...options,
          ...overrides,
          onStatus: setStatus,
        });
      } finally {
        printingRef.current = false;
        setStatus("");
      }
    },
    [options, setStatus]
  );

  return {
    printSheets,
    isPrinting: printingRef.current,
    status: statusRef.current,
    subscribe: (fn) => {
      listenersRef.current.add(fn);
      return () => listenersRef.current.delete(fn);
    },
  };
}

export default function PrintA4SheetsButton({
  children = "Print",
  className = "",
  selector = ".a4-sheet",
  scale = 2,
  documentTitle = "Abstract",
  disabled = false,
  onError,
}) {
  const { printSheets, isPrinting, status, subscribe } = usePrintA4Sheets({
    selector,
    scale,
    documentTitle,
  });

  // Keep the label in sync with status changes.
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => subscribe(force), [subscribe]);

  const handleClick = async () => {
    try {
      await printSheets();
    } catch (err) {
      console.error("[PrintA4SheetsButton]", err);
      onError?.(err);
    }
  };

  const label = isPrinting && status ? status : children;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPrinting}
      className={className}
      aria-busy={isPrinting}
    >
      {label}
    </button>
  );
}
