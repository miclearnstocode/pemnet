"use client";

import React, { useState } from 'react';
import PrintA4SheetsButton from "@/app/components/PrintA4Sheets";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

const MM_TO_PX = 3.7795275591;
const IN_TO_PX = 96;
const A4_HEIGHT_PX = 297 * MM_TO_PX;
const HEADER_ZONE_PX = 0.1 * IN_TO_PX + 18 * MM_TO_PX;
const FOOTER_ZONE_PX = 0.2 * IN_TO_PX + 18 * MM_TO_PX;
const CONTENT_HEIGHT_PX =
  A4_HEIGHT_PX - HEADER_ZONE_PX - FOOTER_ZONE_PX;

const SAFETY_PX = 3;
const LAST_PAGE_OVERFLOW_ALLOWANCE_PX = 120;
const MAX_LOOP_GUARD = 10000;

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

function packBlocks(blocks, { measure, boxHTML, titleHeight }) {
  const boxedBody = (text) => boxHTML(escapeHtml(text));
  const AVAIL_FIRST = CONTENT_HEIGHT_PX - titleHeight - SAFETY_PX;
  const AVAIL_REST = CONTENT_HEIGHT_PX - SAFETY_PX;

  const prepared = blocks.map((b) => {
    if (b.kind === 'atomic') return { ...b, totalH: measure(b.html) };
    const headingHtml = b.heading + (b.hintHTML || '');
    const headingH = measure(headingHtml);
    return {
      ...b,
      headingHtml,
      headingH,
      totalH: headingH + measure(boxedBody(b.bodyText)),
    };
  });

  const tailH = new Array(prepared.length + 1).fill(0);
  for (let i = prepared.length - 1; i >= 0; i--) {
    tailH[i] = tailH[i + 1] + prepared[i].totalH;
  }

  const minStartBoxH = measure(boxHTML('A'));

  const tokenize = (t) => String(t ?? '').match(/\S+\s*/g) || [];
  const fitTokens = (text, maxH, force) => {
    const toks = tokenize(text);
    if (!toks.length) return { fitText: '', restText: '' };
    const join = (n) => toks.slice(0, n).join('').trimEnd();
    let lo = 0,
      hi = toks.length - 1,
      best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (measure(boxedBody(join(mid))) <= maxH) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    if (force) best = Math.max(best, 1);
    else if (best < 2 && toks.length > 2) best = 0;
    return { fitText: join(best), restText: toks.slice(best).join('') };
  };

  const result = [];
  let cur = [];
  let curH = 0;
  const avail = () => (result.length === 0 ? AVAIL_FIRST : AVAIL_REST);
  const flush = () => {
    if (!cur.length) return;
    result.push({ blocks: cur, isFirstPage: result.length === 0 });
    cur = [];
    curH = 0;
  };
  const place = (html, h) => {
    cur.push({ html });
    curH += h;
  };
  const dumpFrom = (idx) => {
    for (let j = idx; j < prepared.length; j++) {
      const b = prepared[j];
      if (b.kind === 'atomic') place(b.html, b.totalH);
      else {
        place(b.headingHtml, b.headingH);
        place(boxedBody(b.bodyText), b.totalH - b.headingH);
      }
    }
  };

  let done = false;
  for (let bi = 0; bi < prepared.length && !done; bi++) {
    const block = prepared[bi];

    if (block.kind === 'atomic') {
      if (curH + tailH[bi] <= avail() + LAST_PAGE_OVERFLOW_ALLOWANCE_PX) {
        dumpFrom(bi);
        done = true;
        break;
      }
      let need = block.totalH;
      const next = prepared[bi + 1];
      if (block.keepWithNext && next) {
        need +=
          next.kind === 'narrative'
            ? next.headingH + minStartBoxH
            : next.totalH;
      }
      if (curH + need > avail()) flush();
      place(block.html, block.totalH);
      continue;
    }

    let text = block.bodyText;
    let headingShown = false;
    const placeChunk = (chunk, h) => {
      if (!headingShown) {
        place(block.headingHtml, block.headingH);
        headingShown = true;
      }
      place(boxedBody(chunk), h);
    };

    for (let guard = 0; ; guard++) {
      if (guard > MAX_LOOP_GUARD) {
        placeChunk(text, 0);
        break;
      }
      const pendingH = headingShown ? 0 : block.headingH;
      const fullH = measure(boxedBody(text));
      const need = pendingH + fullH;
      const room = avail() - curH;

      if (need <= room) {
        placeChunk(text, fullH);
        break;
      }

      if (need + tailH[bi + 1] <= room + LAST_PAGE_OVERFLOW_ALLOWANCE_PX) {
        placeChunk(text, fullH);
        dumpFrom(bi + 1);
        done = true;
        break;
      }

      if (room >= pendingH + minStartBoxH) {
        const { fitText, restText } = fitTokens(text, room - pendingH, false);
        if (fitText) {
          placeChunk(fitText, room - pendingH);
          flush();
          text = restText;
          if (!text) break;
          continue;
        }
      }

      if (cur.length) {
        flush();
        continue;
      }

      const forced = fitTokens(text, room - pendingH, true);
      if (!forced.fitText) {
        placeChunk(text, fullH);
        break;
      }
      placeChunk(forced.fitText, room - pendingH);
      flush();
      text = forced.restText;
      if (!text) break;
    }
  }

  flush();
  return result;
}

/* ============================================================
 *  Full Paper Preview
 * ============================================================ */
export function FullPaperPreview({ data }) {
  const BLUE = '#4C1D95';
  const LIGHT = '#F3E8FF';
  const BORDER = '#C4B5FD';

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          body * { visibility: hidden !important; }
          .a4-preview-wrapper,
          .a4-preview-wrapper * {
            visibility: visible !important;
          }
          .a4-preview-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            min-height: 0 !important;
          }
          .a4-sheets-container {
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .a4-sheet {
            box-sizing: border-box !important;
            width: 210mm !important;
            height: auto !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 16mm !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .a4-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .a4-sheet, .a4-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <A4Paginator
        data={data}
        BLUE={BLUE}
        LIGHT={LIGHT}
        BORDER={BORDER}
      />
    </>
  );
}

function A4Paginator({ data, BLUE, LIGHT, BORDER }) {
  const [pages, setPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const measureRef = React.useRef(null);
  const wrapperRef = React.useRef(null);

  const blocks = React.useMemo(
    () => buildBlocks({ data, BLUE, LIGHT, BORDER }),
    [data, BLUE, LIGHT, BORDER]
  );

  React.useEffect(() => {
    if (!wrapperRef.current) return;
    const update = () => setContainerWidth(wrapperRef.current.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  React.useEffect(() => {
    if (!measureRef.current || containerWidth === 0) return;
    let cancelled = false;

    const run = () => {
      const host = measureRef.current;
      if (cancelled || !host) return;
      const probeWidthPx = host.offsetWidth;
      if (!probeWidthPx) return;

      const probe = document.createElement('div');
      probe.style.cssText =
        `position:absolute;visibility:hidden;left:0;top:0;width:${probeWidthPx}px;` +
        `font-family:'Times New Roman',Georgia,serif;font-size:11pt;line-height:1.4;`;
      host.appendChild(probe);
      const measure = (html) => {
        probe.innerHTML = html;
        return probe.offsetHeight;
      };
      const boxHTML = (inner) =>
        `<div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${inner}</div>`;

      try {
        const titleHeight = measure(firstPageTitleHTML(BLUE, LIGHT, BORDER));
        setPages(packBlocks(blocks, { measure, boxHTML, titleHeight }));
      } finally {
        host.removeChild(probe);
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run, run);
    } else {
      run();
    }
    return () => {
      cancelled = true;
    };
  }, [blocks, containerWidth, BLUE, LIGHT, BORDER]);

  const totalPages = pages ? pages.length : 1;

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '178mm',
          fontFamily: 'Times New Roman, Georgia, serif',
          fontSize: '11pt',
          lineHeight: 1.4,
          left: '-99999px',
          top: 0,
        }}
        aria-hidden="true"
      />

      <div className="a4-sheets-container flex flex-col items-center gap-16">
        {!pages ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Measuring content…
          </div>
        ) : (
          pages.map((page, idx) => (
            <A4Sheet
              key={idx}
              pageNumber={idx + 1}
              totalPages={totalPages}
              isFirstPage={page.isFirstPage}
              allowOverflow={idx === pages.length - 1}
              BLUE={BLUE}
              LIGHT={LIGHT}
              BORDER={BORDER}
            >
              {page.blocks.map((b, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: b.html }} />
              ))}
            </A4Sheet>
          ))
        )}
      </div>
    </div>
  );
}

function A4Sheet({
  pageNumber,
  isFirstPage,
  allowOverflow = false,
  children,
  BLUE,
  LIGHT,
  BORDER,
}) {
  const HEADER_ZONE_H = `calc(0.1in + 18mm)`;
  const FOOTER_ZONE_H = `calc(0.2in + 18mm)`;

  return (
    <div
      className="a4-sheet bg-white shadow-2xl"
      style={{
        width: '210mm',
        ...(allowOverflow ? { minHeight: '297mm' } : { height: '297mm' }),
        padding: '0 16mm',
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: '11pt',
        lineHeight: 1.4,
        color: '#111',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: HEADER_ZONE_H,
          minHeight: HEADER_ZONE_H,
          maxHeight: HEADER_ZONE_H,
          flexShrink: 0,
          flexGrow: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '4mm',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          background: '#fff',
        }}
      >
        <span
          style={{
            display: 'block',
            color: BLUE,
            fontFamily: 'Arial',
            fontSize: '12pt',
            opacity: 0.7,
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            marginTop: '40px',
            padding: 0,
          }}
        >
          1<sup>st</sup> PEMNet National Extension Conference 2026
        </span>
      </div>

      {isFirstPage && (
        <div
          style={{ flexShrink: 0 }}
          dangerouslySetInnerHTML={{
            __html: firstPageTitleHTML(BLUE, LIGHT, BORDER),
          }}
        />
      )}

      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      <div
        style={{
          height: FOOTER_ZONE_H,
          minHeight: FOOTER_ZONE_H,
          maxHeight: FOOTER_ZONE_H,
          flexShrink: 0,
          flexGrow: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          gap: '64px',
          paddingBottom: '18mm',
          fontFamily: 'Cambria',
          fontSize: '9pt',
          color: '#A78BFA',
          overflow: 'visible',
          ...(allowOverflow
            ? {
                position: 'absolute',
                top: `calc(297mm - ${FOOTER_ZONE_H})`,
                left: '16mm',
                right: '16mm',
                zIndex: 0,
                background: 'transparent',
                pointerEvents: 'none',
              }
            : {
                position: 'relative',
                zIndex: 10,
                background: '#fff',
              }),
          lineHeight: 1,
        }}
      >
        <span style={{ display: 'block', lineHeight: 1, margin: 0, padding: 0 }}>
          Full Paper
        </span>
        <span style={{ display: 'block', lineHeight: 1, margin: 0, padding: 0 }}>
          {pageNumber}
        </span>
      </div>
    </div>
  );
}

function firstPageTitleHTML(BLUE, LIGHT, BORDER) {
  return `<div style="text-align:center;margin-bottom:20px;">
    <h2 style="color:${BLUE};font-weight:700;font-family:Arial,Helvetica,sans-serif;font-size:13pt;margin:0 0 12px 0;">FULL PAPER SUBMISSION</h2>
    <p style="font-size:11pt;line-height:1.3;color:#000;margin:0;"><span style="font-weight:400;font-family:Arial;font-size:10.5pt;">Theme: </span><span style="font-weight:700;font-family:Calibri;font-size:11pt;">HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development</span></p>
  </div>
  <div style="background-color:${LIGHT};border:1px solid ${BORDER};color:${BLUE};font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.3;padding:6px 12px;margin-bottom:20px;border-radius:2px;"><span style="font-weight:700;">Full Paper:</span> This document accompanies the previously accepted abstract and is submitted for review under the same project.</div>`;
}

function buildBlocks({ data, BLUE, LIGHT, BORDER }) {
  const safe = (v) => (v == null ? '' : String(v));

  const sectionHeading = (text, mt = 0) => `
    <h3 style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-top:${mt}px;margin-bottom:8px;">${text}</h3>
  `;

  const narrativeBlock = (number, title, hint, bodyText) => ({
    kind: 'narrative',
    heading: `
      <div style="margin-top:16px;">
        <p style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:4px;">${number} ${title}</p>
      </div>
    `,
    hintHTML: hint
      ? `<p style="color:${BLUE};font-family:Arial;font-size:9pt;margin-bottom:4px;line-height:1.3;">${hint}</p>`
      : '',
    bodyText: safe(bodyText),
  });

  const sectionA = `
    ${sectionHeading('A. Full Paper Information')}
    <table style="width:100%;border-collapse:collapse;border:1px solid ${BORDER};font-size:10.5pt;">
      <tbody>
        <tr>
          <th style="background:${LIGHT};color:${BLUE};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};font-weight:700;font-family:Arial;font-size:11pt;text-align:left;vertical-align:top;padding:8px 12px;width:42%;">1. Linked Accepted Abstract</th>
          <td style="border-bottom:1px solid ${BORDER};vertical-align:top;padding:8px 12px;">${safe(data.linked_abstract_title) || '—'}</td>
        </tr>
        <tr>
          <th style="background:${LIGHT};color:${BLUE};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};font-weight:700;font-family:Arial;font-size:11pt;text-align:left;vertical-align:top;padding:8px 12px;">2. Full Paper Title</th>
          <td style="border-bottom:1px solid ${BORDER};vertical-align:top;padding:8px 12px;">${safe(data.title) || '—'}</td>
        </tr>
        <tr>
          <th style="background:${LIGHT};color:${BLUE};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};font-weight:700;font-family:Arial;font-size:11pt;text-align:left;vertical-align:top;padding:8px 12px;">3. Author/s</th>
          <td style="border-bottom:1px solid ${BORDER};vertical-align:top;padding:8px 12px;">${safe(data.authors) || '—'}</td>
        </tr>
        <tr>
          <th style="background:${LIGHT};color:${BLUE};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};font-weight:700;font-family:Arial;font-size:11pt;text-align:left;vertical-align:top;padding:8px 12px;">4. Keywords</th>
          <td style="border-bottom:1px solid ${BORDER};vertical-align:top;padding:8px 12px;">${safe(data.keywords) || '—'}</td>
        </tr>
      </tbody>
    </table>
  `;

  const sectionBHeading = `
    ${sectionHeading('B. Abstract', 24)}
  `;

  return [
    { kind: 'atomic', html: sectionA },
    { kind: 'atomic', html: sectionBHeading, keepWithNext: true },
    narrativeBlock('', '', null, data.abstract),
  ];
}

/* ============================================================
 *  PDF generation (same as AbstractForm)
 * ============================================================ */
async function generateFullPaperPdfBlob(previewData) {
  const { createRoot } = await import('react-dom/client');
  const { flushSync } = await import('react-dom');
  const { captureA4SheetsAsPDF } = await import('@/app/components/PrintA4Sheets');

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'absolute';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '210mm';
  host.style.background = '#ffffff';
  host.style.zIndex = '-9999';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  host.style.overflow = 'hidden';
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(<FullPaperPreview data={previewData} />);
    });

    const deadline = Date.now() + 5000;
    let sheets = [];
    while (Date.now() < deadline) {
      sheets = host.querySelectorAll('.a4-sheet');
      if (sheets.length > 0) break;
      await new Promise((r) => setTimeout(r, 60));
    }
    if (sheets.length === 0) {
      throw new Error('Preview did not render any A4 sheets.');
    }

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }
    await new Promise((r) => setTimeout(r, 150));

    return await captureA4SheetsAsPDF({
      selector: '.a4-sheet',
      root: host,
      scale: 2,
      onStatus: () => {},
    });
  } finally {
    try {
      root.unmount();
    } catch {
      /* ignore */
    }
    if (host.parentNode) host.parentNode.removeChild(host);
  }
}

/* ============================================================
 *  Main component
 * ============================================================ */
export default function SubmitFullPaper({
  user,
  submissions = [],
  onSubmitted,
  onBack,
  onToast,
}) {
  const [submissionId, setSubmissionId] = useState('');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const acceptedSubmissions = submissions.filter((s) => s.status === 'endorse');

  // Auto-fill fields when a linked abstract is selected
  React.useEffect(() => {
    if (!submissionId) return;
    const linked = acceptedSubmissions.find(
      (s) => String(s.id) === String(submissionId)
    );
    if (!linked) return;

    setTitle((prev) => prev || linked.extension_project_title || '');
    setKeywords((prev) => prev || linked.keywords || '');
    setAuthors((prev) => {
      if (prev) return prev;
      const list = [];
      if (linked.project_leader) list.push(`${linked.project_leader}*`);
      if (linked.presenter && linked.presenter !== linked.project_leader) {
        list.push(`${linked.presenter} (paper presenter)`);
      }
      if (linked.co_authors) list.push(linked.co_authors);
      return list.filter(Boolean).join('; ');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const resetForm = () => {
    setSubmissionId('');
    setTitle('');
    setAuthors('');
    setKeywords('');
    setAbstract('');
    setFile(null);
    setError('');
  };

  const validate = () => {
    if (!submissionId) return 'Please select the linked accepted abstract.';
    if (!title.trim()) return 'Full paper title is required.';
    if (!authors.trim()) return 'Author/s is required.';
    if (!keywords.trim()) return 'Keywords are required.';
    if (!file) return 'Please attach the full paper PDF.';
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return 'Full paper must be a PDF file.';
    if (file.size > 64 * 1024 * 1024)
      return 'Full paper file is too large (max 64 MB).';
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      onToast?.(validationError, 'error');
      return;
    }

    setSubmitting(true);
    let previewBlob = null;
    try {
      const userData = JSON.parse(localStorage.getItem('pemnet_user') || '{}');
      if (!userData.id) throw new Error('Session expired. Please login again.');

      // ---- Generate full paper PDF (A4 preview) ----
      const linked = acceptedSubmissions.find(
        (s) => String(s.id) === String(submissionId)
      );
      const previewData = {
        linked_abstract_title: linked?.extension_project_title || '',
        title,
        authors,
        keywords,
        abstract,
      };

      try {
        setGeneratingPdf(true);
        previewBlob = await generateFullPaperPdfBlob(previewData);
      } catch (pdfErr) {
        console.error('Error generating full paper PDF:', pdfErr);
        const msg = 'Failed to generate full paper PDF. Please try again.';
        setError(msg);
        onToast?.(msg, 'error');
        return;
      } finally {
        setGeneratingPdf(false);
      }

      // ---- Build form data ----
      const fd = new FormData();
      fd.append('user_id', userData.id);
      fd.append('submission_id', submissionId);
      fd.append('full_paper_title', title);
      fd.append('full_paper_authors', authors);
      fd.append('full_paper_keywords', keywords);
      fd.append('full_paper_abstract', abstract);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      fd.append(
        'full_paper_file',
        new File([file], safeName, { type: 'application/pdf' })
      );
      // The generated A4 preview PDF (this is what gets archived in Drive)
      fd.append(
        'full_paper_preview_file',
        previewBlob,
        `full_paper_${title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60)}.pdf`
      );

      const res = await fetch(`${API_URL}/api/submit-full-paper`, {
        method: 'POST',
        body: fd,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned non-JSON response: ${text.substring(0, 100)}`
        );
      }

      if (!res.ok) {
        const msg =
          data.detail || data.error || data.msg || 'Full paper submission failed.';
        setError(msg);
        onToast?.(msg, 'error');
        return;
      }

      onToast?.('Full paper submitted successfully!', 'success');
      resetForm();
      onSubmitted?.(data);
    } catch (err) {
      console.error('Full paper submission error:', err);
      const msg = err.message || 'Network error. Please try again.';
      setError(msg);
      onToast?.(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const previewData = {
    linked_abstract_title:
      acceptedSubmissions.find((s) => String(s.id) === String(submissionId))
        ?.extension_project_title || '',
    title,
    authors,
    keywords,
    abstract,
  };

  /* ---------------- Preview mode ---------------- */
  if (showPreview) {
    return (
      <div>
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Full Paper Preview (A4)</h2>
              <p className="text-xs text-slate-500">Review before submitting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrintA4SheetsButton
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-2"
              documentTitle="FullPaper"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
              </svg>
              Print
            </PrintA4SheetsButton>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        <div className="a4-preview-wrapper p-6 overflow-auto bg-slate-100">
          <FullPaperPreview data={previewData} />
        </div>
      </div>
    );
  }

  /* ---------------- Form mode ---------------- */
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Submit Full Paper
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload the full paper corresponding to your accepted abstract.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 font-semibold text-sm inline-flex items-center gap-1 transition bg-slate-100 px-4 py-2 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-purple-700 to-purple-800 px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-lg font-bold">Full Paper Submission</h2>
            <p className="text-xs text-purple-100">
              1<sup>st</sup> PEMNet National Extension Conference 2026
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-sm font-semibold text-purple-800 bg-white hover:bg-purple-50 rounded-xl transition inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview A4
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Linked abstract */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Linked Accepted Abstract <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select which of your accepted abstracts this full paper belongs to.
            </p>
            {acceptedSubmissions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">No accepted abstracts yet</p>
                  <p className="text-xs mt-0.5">
                    Full paper submission is only available after your abstract has been accepted.
                  </p>
                </div>
              </div>
            ) : (
              <select
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
              >
                <option value="">— Select an accepted abstract —</option>
                {acceptedSubmissions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.extension_project_title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Full Paper Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the title of your full paper"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Authors */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Author/s <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g., Juan Dela Cruz*, Maria Santos, Pedro Reyes"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use an asterisk (*) after the project leader&apos;s name.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Keywords <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., community extension, sustainable agriculture"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Abstract (for the full paper)
            </label>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paste or write the abstract of the full paper (optional)"
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Full Paper File (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-semibold hover:file:bg-purple-700 cursor-pointer"
              />
              {file && (
                <p className="text-xs text-purple-700 mt-2 break-all font-medium">
                  {file.name} ({formatFileSize(file.size)})
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                PDF only. Max 64 MB.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="sm:flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview Full Paper
            </button>
            <button
              type="button"
              disabled={
                submitting ||
                generatingPdf ||
                acceptedSubmissions.length === 0 ||
                !submissionId ||
                !file ||
                !title.trim() ||
                !authors.trim() ||
                !keywords.trim()
              }
              onClick={handleSubmit}
              className="sm:flex-2 py-3 rounded-xl font-bold text-white bg-linear-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 transition shadow-lg shadow-purple-700/20 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {generatingPdf ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating PDF…
                </>
              ) : submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Submit Full Paper
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}