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
      if (block.forceNewPage && cur.length) flush();

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

  // Total = 1 cover page + however many continuation pages packBlocks produced
  // (minus the merged-first-page if packBlocks already produced one).
  const extraPages = pages
    ? (pages[0]?.isFirstPage ? pages.length - 1 : pages.length)
    : 0;
  const totalPages = 1 + extraPages;

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
          <>
            {/* ---- Always-rendered cover page ---- */}
            <A4Sheet
              key="cover"
              pageNumber={1}
              totalPages={totalPages}
              isFirstPage={true}
              allowOverflow={extraPages === 0}
              BLUE={BLUE}
              LIGHT={LIGHT}
              BORDER={BORDER}
            >
              {null}
            </A4Sheet>

            {/* ---- Continuation pages ---- */}
            {pages
              .map((page, idx) => (
                <A4Sheet
                  key={`page-${idx + 2}`}
                  pageNumber={idx + 2}
                  totalPages={totalPages}
                  isFirstPage={false}
                  allowOverflow={idx === extraPages - 1}
                  BLUE={BLUE}
                  LIGHT={LIGHT}
                  BORDER={BORDER}
                >
                  {page.blocks.map((b, i) => (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: b.html }}
                    />
                  ))}
                </A4Sheet>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function A4Sheet({
  pageNumber,
  totalPages,
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
      {/* ---------- Header zone ---------- */}
      <div
        style={{
          height: HEADER_ZONE_H,
          minHeight: HEADER_ZONE_H,
          maxHeight: HEADER_ZONE_H,
          flexShrink: 0,
          flexGrow: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          background: '#fff',
        }}
      >
      </div>

      {/* ---------- First-page title block ---------- */}
      {isFirstPage && (
        <div
          style={{ flexShrink: 0 }}
          dangerouslySetInnerHTML={{
            __html: firstPageTitleHTML(BLUE, LIGHT, BORDER),
          }}
        />
      )}

      {/* ---------- Dynamic content ---------- */}
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

      {/* ---------- Footer ---------- */}
      <div
        style={{
          height: FOOTER_ZONE_H,
          minHeight: FOOTER_ZONE_H,
          maxHeight: FOOTER_ZONE_H,
          flexShrink: 0,
          flexGrow: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          paddingBottom: '10mm',
          fontFamily: 'Cambria, Georgia, serif',
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
          lineHeight: 1.3,
        }}
      >
        <span style={{ display: 'block', margin: 0, padding: 0, color: 'gray'}}>
          © 2026 Ricky P. Becodo, All Rights Reserved.
        </span>
        <span style={{ display: 'block', margin: 0, padding: 0, color: 'gray' }}>
          Prepared for the Philippine Extension Managers Network (PEMNet), Inc.
        </span>
      </div>
    </div>
  );
}

function firstPageTitleHTML(BLUE, LIGHT, BORDER) {
  return `
    <div style="display:flex;align-items:center;gap:0px;margin-bottom:24px;">
      <img
        src="/images/pemnet_logo.png"
        alt="PEMNet Logo"
        style="width:70px;height:70px;object-fit:contain;flex-shrink:0;margin-left:20px;"
      />
      <div style="flex:1;text-align:center;">
        <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12pt;font-weight:700;color:#000;letter-spacing:0.3px;">
          PHILIPPINE EXTENSION MANAGERS NETWORK (PEMNet), INC.
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12pt;font-weight:700;color:#000;">
          1st NATIONAL EXTENSION CONFERENCE 2026
        </p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;">
        Theme:
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-style:italic;color:#000;line-height:1.4;">
        HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development
      </p>
    </div>

    <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;">
      COMPLETED EXTENSION PROJECT FULL PAPER TEMPLATE
    </p>

    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;">
      General Manuscript Format
    </p>

    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;line-height:1.5;margin-bottom:14px;">
      <p style="margin:0;"><span style="font-weight:700;">Length:</span> Approximately 3,000–7,000 words, excluding references and appendices</p>
      <p style="margin:0;"><span style="font-weight:700;">Font:</span> Arial, 11 points</p>
      <p style="margin:0;"><span style="font-weight:700;">Spacing:</span> Single</p>
      <p style="margin:0;"><span style="font-weight:700;">Margins:</span> 1 inch on all sides</p>
      <p style="margin:0;"><span style="font-weight:700;">Citation and Reference Style:</span> APA 7th Edition</p>
      <p style="margin:0;"><span style="font-weight:700;">File Format:</span> Microsoft Word (.docx)</p>
    </div>

    <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">
      The manuscript should be written as a <span style="font-weight:700;">scholarly extension paper</span>, not merely as a chronological accomplishment report. It should demonstrate the relationship among the <span style="font-weight:700;">identified need, intervention, evidence, results, interpretation, and implications for extension practice.</span>
    </p>
  `;
}

function consentPageHTML(BLUE, LIGHT, BORDER) {
  const para = (html) =>
    `<p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">${html}</p>`;
  const li = (html) =>
    `<li style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">${html}</li>`;

  return `
    <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;">Please read</p>

    <h2 style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:13pt;font-weight:700;color:#000;text-align:center;text-transform:uppercase;letter-spacing:0.3px;">
      AUTHOR CONSENT AND LIMITED PUBLICATION LICENSE
    </h2>

    ${para(`By submitting a full paper to the <b>PEMNet 1st National Extension Conference 2026</b>, the author/s acknowledge and agree that the submitted manuscript may be received, stored, reviewed, evaluated, analyzed, and processed by the <b>Philippine Extension and Management Network, Inc. (PEMNet)</b> for purposes related to the conference, scholarly documentation, knowledge dissemination, research, and possible publication.`)}

    ${para(`The author/s grant PEMNet a <b>non-exclusive, royalty-free permission</b> to use the submitted manuscript, in whole or in part, for the following purposes:`)}

    <ol style="margin:0 0 14px 0;padding-left:26px;list-style-type:decimal;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#000;line-height:1.5;">
      ${li(`peer, technical, editorial, and quality review of the manuscript;`)}
      ${li(`analysis and synthesis of information, evidence, findings, practices, outcomes, and lessons contained in the submitted paper;`)}
      ${li(`preparation of conference proceedings, reports, scholarly publications, policy or practice briefs, research syntheses, databases, and other knowledge products arising from or related to the conference;`)}
      ${li(`use of appropriate data, findings, tables, figures, quotations, or summarized information from the manuscript for scholarly, research, or publication purposes, subject to proper acknowledgment and citation of the original author/s and source; and`)}
      ${li(`editorial processing, including reasonable formatting, copyediting, language editing, and other modifications necessary to meet publication standards, without materially changing the meaning of the author's work.`)}
    </ol>

    ${para(`The author/s <b>retain copyright and ownership</b> of the submitted manuscript. Submission to PEMNet does not constitute an assignment or transfer of copyright to PEMNet.`)}

    ${para(`The author/s further certify that the manuscript is their original work; that all sources have been properly acknowledged; and that they have secured the necessary permission for copyrighted materials, data, photographs, figures, instruments, or other materials owned by third parties that are included in the manuscript.`)}

    ${para(`Where information from submitted papers is subsequently used as a source of data for research, synthesis, comparative analysis, or scholarly publication undertaken or authorized by PEMNet, such use shall observe accepted principles of <b>research ethics, responsible scholarship, proper attribution, and applicable data privacy requirements.</b> Personally identifiable or confidential information shall not be disclosed beyond what is legitimately included and authorized for scholarly dissemination.`)}

    ${para(`Submission of the full paper signifies that the author/s have read, understood, and accepted these conditions. <b>Acceptance of a manuscript for conference presentation does not automatically guarantee its publication</b>, as inclusion in conference proceedings or other scholarly publications may remain subject to further editorial, technical, ethical, and/or peer-review requirements.`)}
  `;
}

const THEMATIC_AREAS = [
  'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
  'Health, Nutrition, Wellness, and Community Care',
  'Education, Literacy, Skills Development, and Lifelong Learning',
  'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
  'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
];

function titleAuthorPageHTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:30px;">${inner}</div>`;

  const titleHTML = safe(data.title).trim()
    ? filled(safe(data.title))
    : placeholder('[Insert a concise, informative, and scholarly title]');

  const authorsHTML = safe(data.authors).trim()
    ? filled(safe(data.authors))
    : placeholder(
        'Click or tap here and enter all author names, using superscript affiliation numbers as applicable.'
      );

  const affiliationsHTML = safe(data.affiliations).trim()
    ? filled(safe(data.affiliations))
    : placeholder(
        'Click or tap here and enter the corresponding institutional affiliation/s.'
      );

  const thematicLine = data.thematicArea
    ? filled(`${data.thematicArea}. ${safe(data.thematicAreaTitle) || ''}`)
    : placeholder(
        'Click or tap here and enter the selected thematic area number and full title.'
      );

  return `
    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;line-height:1.0;">
      TITLE OF THE PAPER
    </p>
    <div style="border:1px solid ${BORDER};padding:8px 12px;margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;color:${ACCENT};">
      ${titleHTML}
    </div>
    <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;text-align:justify;">
      The title should communicate the central intervention or extension issue, major outcome or focus, and context where appropriate. Avoid titles consisting only of the institutional project name or acronym.
    </p>
    <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;">
      Example structure:
    </p>
    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-style:italic;color:${ACCENT};line-height:1.0;">
      Implementation and Outcomes of a Community-Based Natural Farming Extension Program among Smallholder Farmers in [Location]
    </p>
    <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      rather than:
    </p>
    <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-style:italic;color:${ACCENT};line-height:1.0;">
      Project UMWAD: An Extension Program
    </p>

    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;line-height:1.0;">
      AUTHOR INFORMATION
    </p>
    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};font-weight:700;line-height:1.0;">
      First Author<sup>1</sup>, Second Author<sup>2</sup>, Third Author<sup>3</sup>
    </p>
    <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      <sup>1</sup>Department/College/Unit, University/Institution, City, Philippines
    </p>
    <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      <sup>2</sup>Department/College/Unit, University/Institution, City, Philippines
    </p>
    <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      <sup>3</sup>Partner Institution, if applicable
    </p>
    ${fieldBox(authorsHTML)}
    ${fieldBox(affiliationsHTML)}

    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;">
      Corresponding Author:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;">
      <tbody>
        <tr>
          <td style="width:30%;padding:6px 0;color:${ACCENT};font-weight:700;">Name:</td>
          <td style="padding:4px 0;">
            <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;">
              ${safe(data.correspondingName).trim() ? filled(safe(data.correspondingName)) : placeholder('Enter name')}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${ACCENT};font-weight:700;">Email Address:</td>
          <td style="padding:4px 0;">
            <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;">
              ${safe(data.correspondingEmail).trim() ? filled(safe(data.correspondingEmail)) : placeholder('Enter email address')}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${ACCENT};font-weight:700;">ORCID:</td>
          <td style="padding:4px 0;">
            <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;">
              ${safe(data.correspondingOrcid).trim() ? filled(safe(data.correspondingOrcid)) : placeholder('Enter ORCID, if available')}
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      <b>Paper Category:</b> Completed Extension Project Paper
    </p>
    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;">
      Thematic Area:
    </p>
    <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      [Select only one]
    </p>
    <ol style="margin:0 0 10px 0;padding-left:24px;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      ${THEMATIC_AREAS.map((a) => `<li style="margin:0 0 2px 0;">${a}</li>`).join('')}
    </ol>
    <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;text-align:justify;">
      These five areas are the official thematic classifications of the conference, and authors are expected to select the area representing the project's primary intended outcome and strongest evidence of public value.
    </p>
    ${fieldBox(thematicLine)}
  `;
}

function bodyPageHTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;

  // Typography
  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:80px;">${inner}</div>`;

  const abstractHTML = safe(data.abstract).trim()
    ? filled(safe(data.abstract))
    : placeholder(
        'Click or tap here and write the 250–300-word abstract as one coherent paragraph.'
      );

  const keywordsHTML = safe(data.keywords).trim()
    ? filled(safe(data.keywords))
    : placeholder(
        'Click or tap here and enter 4–6 keywords separated by semicolons.'
      );

  return `
    <!-- ===================== ABSTRACT ===================== -->
    <p style="${H_SECTION}text-transform:uppercase;">ABSTRACT</p>
    <p style="${NOTE}">Recommended length: <span style="${NOTE_RED}">250–300 words</span></p>
    <p style="${P}">
      Provide a concise, self-contained summary of the entire paper. The abstract should contain the following elements, preferably as one coherent paragraph:
    </p>
    <p style="${P_TIGHT}">
      <b>Background/Need:</b> Briefly identify the community, institutional, or sectoral condition that justified the extension project.
    </p>
    <p style="${P_TIGHT}">
      <b>Objective:</b> State the principal objective or purpose of the project.
    </p>
    <p style="${P_TIGHT}">
      <b>Methods/Approach:</b> Briefly describe the setting, intended users or beneficiaries, extension intervention, implementation approach, and methods used to assess results.
    </p>
    <p style="${P_TIGHT}">
      <b>Results:</b> Present the most important quantitative and/or qualitative findings. Give actual evidence rather than merely stating that the project was "successful."
    </p>
    <p style="${P_TIGHT}">
      <b>Conclusion:</b> State what the evidence indicates and its principal implication for extension practice, sustainability, policy, or public value.
    </p>
    <p style="${P}">
      Do not introduce claims in the abstract that are not supported in the main paper.
    </p>
    ${fieldBox(abstractHTML)}

    <p style="${P_TIGHT}"><b>Keywords:</b> [4–6 keywords, separated by semicolons]</p>
    ${fieldBox(keywordsHTML)}

    <!-- ===================== 1. INTRODUCTION ===================== -->
    <p style="${H_SECTION}margin-top:16px;">1. INTRODUCTION</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">900–1,100 words</span></p>
    <p style="${P}">
      The Introduction should establish the scholarly and development basis of the extension project.
    </p>

    <p style="${H_SUB}">1.1 Background and Context</p>
    <p style="${P}">
      Describe the community, institutional, sectoral, environmental, economic, educational, health, or development context within which the project was implemented.
    </p>
    <p style="${P}">
      Explain the significance of the issue being addressed.
    </p>
    <p style="${P}">
      Where appropriate, provide relevant statistics, policies, research findings, or documented community evidence.
    </p>
    ${fieldBox(
      placeholder('Click or tap here and replace this text with your response.')
    )}

    <p style="${H_SUB}">1.2 Evidence of the Problem or Development Need</p>
    <p style="${P}">
      Explain how the need, condition, gap, or opportunity was established.
    </p>
    <p style="${P}">Evidence may come from:</p>
    <ul style="margin:0 0 10px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">situational or needs assessment;</li>
      <li style="${LI}">baseline data;</li>
      <li style="${LI}">community consultations;</li>
      <li style="${LI}">surveys;</li>
      <li style="${LI}">focus group discussions;</li>
      <li style="${LI}">key informant interviews;</li>
      <li style="${LI}">institutional records;</li>
      <li style="${LI}">government statistics;</li>
      <li style="${LI}">previous research;</li>
      <li style="${LI}">technical assessments; or</li>
    </ul>
    ${fieldBox(
      placeholder('Click or tap here and replace this text with your response.')
    )}
  `;
}

function bodyPage2HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  // Typography — 11pt, line-height 1.0
  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 1.2 bullet list ========== -->
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">other credible sources.</li>
    </ul>
    <p style="${P}">
      Avoid relying solely on statements such as "the community requested training."
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 1.3 ===================== -->
    <p style="${H_SUB}">1.3 Related Literature and Extension Evidence</p>
    <p style="${P}">
      Provide a focused synthesis of relevant scholarly and technical literature concerning:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">the issue being addressed;</li>
      <li style="${LI}">comparable interventions;</li>
      <li style="${LI}">relevant extension approaches;</li>
      <li style="${LI}">documented factors influencing adoption or outcomes; and</li>
      <li style="${LI}">the knowledge or practice gap the project sought to address.</li>
    </ul>
    <p style="${P}">
      This section should not become an exhaustive review of literature. Its purpose is to demonstrate that the extension intervention was informed by existing knowledge and to establish how the project contributes to extension knowledge or practice.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 1.4 ===================== -->
    <p style="${H_SUB}">1.4 Rationale and Contribution of the Project</p>
    <p style="${P}">
      Explain why the intervention was appropriate given the identified problem, available evidence, community context, and institutional expertise.
    </p>
    <p style="${P}">
      Clearly identify what is potentially distinctive or useful about the project.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 1.5 ===================== -->
    <p style="${H_SUB}">1.5 Objectives</p>
    <p style="${P}">
      State the general and specific objectives.
    </p>
    <p style="${P}">
      The objectives reported here should correspond with the results presented later in the paper.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2. MATERIALS AND METHODS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">2. MATERIALS AND METHODS / EXTENSION PROJECT METHODOLOGY</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,100–1,400 words</span></p>
    <p style="${P}">
      This section must be sufficiently detailed to allow readers to understand what was done, with whom, how, why, and how results were determined.
    </p>

    <!-- ===================== 2.1 ===================== -->
    <p style="${H_SUB}">2.1 Project Setting and Duration</p>
    <p style="${P}">Describe:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">project site;</li>
      <li style="${LI}">relevant characteristics of the community or institution;</li>
      <li style="${LI}">implementation period; and</li>
      <li style="${LI}">contextual conditions important to understanding the intervention.</li>
    </ul>
    <p style="${P}">
      A map may be included when genuinely useful.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2.2 ===================== -->
    <p style="${H_SUB}">2.2 Participants, Intended Users, or Beneficiaries</p>
    <p style="${P}">Describe:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">target population;</li>
      <li style="${LI}">participant selection or inclusion criteria;</li>
      <li style="${LI}">number of participants or households/institutions reached;</li>
      <li style="${LI}">relevant demographic or sectoral characteristics; and</li>
      <li style="${LI}">involvement of women, youth, vulnerable groups, or other relevant sectors where applicable.</li>
    </ul>
    ${fieldBox(answer)}
  `;
}

function bodyPage3HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 2.2 ========== -->
    <p style="${P}">
      Distinguish between persons reached by project activities and the population for whom outcome data were actually obtained.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2.3 ===================== -->
    <p style="${H_SUB}">2.3 Situational Analysis and Baseline</p>
    <p style="${P}">
      Describe how the initial situation was established.
    </p>
    <p style="${P}">Identify:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">information collected;</li>
      <li style="${LI}">data sources;</li>
      <li style="${LI}">methods or instruments used;</li>
      <li style="${LI}">baseline indicators, where available; and</li>
      <li style="${LI}">major findings that informed project design.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 2.4 ===================== -->
    <p style="${H_SUB}">2.4 Project or Intervention Design</p>
    <p style="${P}">
      Describe the extension intervention and its underlying logic.
    </p>
    <p style="${P}">
      Authors are encouraged to present a project logic or results pathway such as:
    </p>

    <!-- Project Design / Results Pathway diagram -->
    <div style="margin:6px 0 14px 0;text-align:center;">
      <img
        src="/images/project%20design.png"
        alt="Project Design and Results Pathway"
        style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;"
      />
    </div>

    <p style="${P}">
      Explain why the selected intervention was expected to address the identified condition.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2.5 ===================== -->
    <p style="${H_SUB}">2.5 Implementation Strategies</p>
    <p style="${P}">
      Describe the major strategies used, such as:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">capability-building;</li>
      <li style="${LI}">technical assistance;</li>
      <li style="${LI}">demonstrations;</li>
      <li style="${LI}">mentoring or coaching;</li>
      <li style="${LI}">community organizing;</li>
      <li style="${LI}">communication interventions;</li>
      <li style="${LI}">technology transfer;</li>
    </ul>
    ${fieldBox(answer)}
  `;
}

function bodyPage4HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 2.5 bullet list ========== -->
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">enterprise development;</li>
      <li style="${LI}">policy or institutional development;</li>
      <li style="${LI}">partnership building;</li>
      <li style="${LI}">participatory planning; or</li>
      <li style="${LI}">other relevant approaches.</li>
    </ul>
    <p style="${P}">
      Avoid presenting a simple chronological list of activities unless chronology is analytically important.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2.6 ===================== -->
    <p style="${H_SUB}">2.6 Partnership and Stakeholder Participation</p>
    <p style="${P}">
      Identify important partners and explain their actual roles, rather than merely listing organizations.
    </p>
    <p style="${P}">
      Describe relevant community participation in:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">project planning;</li>
      <li style="${LI}">implementation;</li>
      <li style="${LI}">monitoring;</li>
      <li style="${LI}">decision-making;</li>
      <li style="${LI}">resource mobilization; or</li>
      <li style="${LI}">sustainability mechanisms.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 2.7 ===================== -->
    <p style="${H_SUB}">2.7 Monitoring and Evaluation Design</p>
    <p style="${P}">
      Explain how the project's results were measured or verified.
    </p>
    <p style="${P}">Identify:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">indicators;</li>
      <li style="${LI}">data sources;</li>
      <li style="${LI}">instruments;</li>
      <li style="${LI}">timing of measurements;</li>
      <li style="${LI}">persons or groups from whom data were obtained;</li>
      <li style="${LI}">follow-up procedures; and</li>
      <li style="${LI}">methods used to verify or triangulate evidence.</li>
    </ul>
    <p style="${P}">
      Where baseline and endline measurements were conducted, describe them clearly.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 2.8 ===================== -->
    <p style="${H_SUB}">2.8 Data Analysis</p>
    <p style="${P}">
      Describe how quantitative and/or qualitative data were analyzed.
    </p>
    <p style="${P}">Examples include:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">frequencies and percentages;</li>
      <li style="${LI}">means or other descriptive statistics;</li>
      <li style="${LI}">pre-post comparison;</li>
      <li style="${LI}">appropriate statistical tests;</li>
      <li style="${LI}">thematic analysis;</li>
      <li style="${LI}">content analysis; or</li>
      <li style="${LI}">triangulation of multiple evidence sources.</li>
    </ul>
    <p style="${P}">
      Do not employ statistical tests merely to make the manuscript appear more scholarly. The analysis must be appropriate to the data and evaluation design.
    </p>
    ${fieldBox(answer)}
  `;
}

function bodyPage5HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ===================== 2.9 ===================== -->
    <p style="${H_SUB}">2.9 Ethical Considerations</p>
    <p style="${P}">
      Explain relevant safeguards concerning:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">informed participation or consent;</li>
      <li style="${LI}">confidentiality;</li>
      <li style="${LI}">privacy;</li>
      <li style="${LI}">community data;</li>
      <li style="${LI}">photographs;</li>
      <li style="${LI}">interviews and testimonies;</li>
      <li style="${LI}">vulnerable participants; and</li>
      <li style="${LI}">institutional records.</li>
    </ul>
    <p style="${P}">
      Where formal ethics clearance was required and obtained, state the approving body and approval/reference number.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 3. RESULTS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">3. RESULTS</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,200–1,600 words</span></p>
    <p style="${P}">
      Present the evidence objectively and systematically.
    </p>
    <p style="${P}">
      Results should correspond directly with the project objectives and indicators.
    </p>

    <!-- ===================== 3.1 ===================== -->
    <p style="${H_SUB}">3.1 Project Reach and Implementation</p>
    <p style="${P}">
      Briefly report important implementation evidence, including:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">actual participants reached;</li>
      <li style="${LI}">interventions delivered;</li>
      <li style="${LI}">completion levels;</li>
      <li style="${LI}">major products or outputs; and</li>
      <li style="${LI}">significant deviations from the original project design.</li>
    </ul>
    <p style="${P}">
      Do not allow activity counts to dominate the Results section.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 3.2 ===================== -->
    <p style="${H_SUB}">3.2 Immediate Results</p>
    <p style="${P}">
      Present documented immediate changes following the intervention, where applicable.
    </p>
    <p style="${P}">Examples include changes in:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">knowledge;</li>
      <li style="${LI}">skills;</li>
      <li style="${LI}">practices;</li>
      <li style="${LI}">confidence;</li>
      <li style="${LI}">organizational capacity;</li>
      <li style="${LI}">access;</li>
      <li style="${LI}">productivity;</li>
      <li style="${LI}">service delivery; or</li>
      <li style="${LI}">institutional processes.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 3.3 ===================== -->
    <p style="${H_SUB}">3.3 Outcomes</p>
    <p style="${P}">
      Present evidence of changes that occurred beyond immediate project outputs.
    </p>
    <p style="${P}">
      Where possible, distinguish clearly among:
    </p>
    <p style="${P_TIGHT}">
      <b>Output</b> – what the project produced
    </p>
    <p style="${P_TIGHT}">
      <b>Immediate result</b> – what changed shortly after the intervention
    </p>
  `;
}

function bodyPage6HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 3.3 ========== -->
    <p style="${P_TIGHT}">
      <b>Outcome</b> – meaningful change in practice, behavior, condition, performance, or institutional capacity
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 3.4 ===================== -->
    <p style="${H_SUB}">3.4 Adoption, Utilization, Adaptation, or Continuation</p>
    <p style="${P}">
      Where applicable, report evidence that project participants or partners:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">used acquired knowledge or technologies;</li>
      <li style="${LI}">adopted recommended practices;</li>
      <li style="${LI}">adapted an intervention to local circumstances;</li>
      <li style="${LI}">continued activities beyond project-supported delivery; or</li>
      <li style="${LI}">replicated project practices.</li>
    </ul>
    <p style="${P}">
      Specify who adopted what, how many, to what extent, and based on what evidence whenever the data permit.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 3.5 ===================== -->
    <p style="${H_SUB}">3.5 Institutionalization and Sustainability</p>
    <p style="${P}">
      Present documented evidence of mechanisms such as:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">partner policies;</li>
      <li style="${LI}">local ordinances or resolutions;</li>
      <li style="${LI}">budget allocations;</li>
      <li style="${LI}">integration into regular programs;</li>
      <li style="${LI}">institutional structures;</li>
      <li style="${LI}">trained local implementers;</li>
      <li style="${LI}">community management mechanisms;</li>
      <li style="${LI}">continuing partnerships;</li>
      <li style="${LI}">locally generated resources; or</li>
      <li style="${LI}">other arrangements supporting continuation.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 3.6 ===================== -->
    <p style="${H_SUB}">3.6 Public Value and Broader Benefits</p>
    <p style="${P}">
      Where supported by evidence, describe the project's contribution to community or institutional benefit.
    </p>
    <p style="${P}">Possible areas include:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">improved livelihood;</li>
      <li style="${LI}">health or wellbeing;</li>
      <li style="${LI}">educational improvement;</li>
      <li style="${LI}">strengthened institutional capacity;</li>
      <li style="${LI}">increased resilience;</li>
      <li style="${LI}">improved environmental practices;</li>
      <li style="${LI}">empowerment;</li>
      <li style="${LI}">improved service delivery; or</li>
      <li style="${LI}">other documented public benefits.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== Important Evidence Rule ===================== -->
    <p style="${H_SUB}">Important Evidence Rule</p>
    <p style="${P} color:#000; ">
      Attendance sheets, photographs, certificates, and activity reports can verify that an activity occurred, but they should not by themselves be used as proof that an outcome, adoption, utilization, or impact occurred. This distinction is expressly reflected in PEMNet's conference requirements.
    </p>
  `;
}

function bodyPage7HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== closing note from section 3 ========== -->
    <p style="${P}color:#000">
      Authors should not feel compelled to claim "impact." The conference guidelines specifically recognize that completed projects need not claim long-term impact when such evidence is unavailable.
    </p>

    <!-- ===================== 4. DISCUSSION ===================== -->
    <p style="${H_SECTION}margin-top:16px;">4. DISCUSSION</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,000–1,400 words</span></p>
    <p style="${P}">
      This is essential if PEMNet wants these papers eventually to become publishable scholarly manuscripts.
    </p>
    <p style="${P}">
      The Discussion should explain what the results mean, rather than repeat the Results section.
    </p>
    <p style="${P}">
      Address the following as applicable.
    </p>

    <!-- ===================== 4.1 ===================== -->
    <p style="${H_SUB}">4.1 Interpretation of Major Findings</p>
    <p style="${P}">
      Explain the most important findings.
    </p>
    <p style="${P}">
      Why did the intervention appear to work—or not work?
    </p>
    <p style="${P}">
      What conditions may explain the observed results?
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 4.2 ===================== -->
    <p style="${H_SUB}">4.2 Relationship to Previous Research and Extension Literature</p>
    <p style="${P}">
      Compare the results with relevant published studies, extension literature, policies, frameworks, or previous interventions.
    </p>
    <p style="${P}">Explain whether the results:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">support;</li>
      <li style="${LI}">extend;</li>
      <li style="${LI}">differ from; or</li>
      <li style="${LI}">qualify</li>
    </ul>
    <p style="${P}">
      what is already known.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 4.3 ===================== -->
    <p style="${H_SUB}">4.3 Factors Affecting Implementation and Outcomes</p>
    <p style="${P}">
      Discuss important enabling or constraining factors, such as:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">community participation;</li>
      <li style="${LI}">leadership;</li>
      <li style="${LI}">institutional support;</li>
      <li style="${LI}">local culture;</li>
      <li style="${LI}">resources;</li>
      <li style="${LI}">partnerships;</li>
      <li style="${LI}">market conditions;</li>
      <li style="${LI}">environmental conditions;</li>
      <li style="${LI}">policy context;</li>
      <li style="${LI}">implementation fidelity; or</li>
      <li style="${LI}">other contextual factors.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 4.4 ===================== -->
    <p style="${H_SUB}">4.4 Inclusion, Sustainability, and Resilience</p>
    <p style="${P}">
      Where applicable, interpret how the project addressed:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">gender and social inclusion;</li>
      <li style="${LI}">participation of vulnerable or underserved groups;</li>
      <li style="${LI}">sustainability;</li>
      <li style="${LI}">resilience;</li>
    </ul>
  `;
}

function bodyPage8HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 4.4 bullet list ========== -->
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">institutional ownership; and</li>
      <li style="${LI}">local capacity.</li>
    </ul>
    ${fieldBox(answer)}

    <!-- ===================== 4.5 ===================== -->
    <p style="${H_SUB}">4.5 Transferability, Replication, or Scaling</p>
    <p style="${P}">
      Discuss whether the intervention may reasonably be:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">replicated;</li>
      <li style="${LI}">adapted;</li>
      <li style="${LI}">scaled;</li>
      <li style="${LI}">institutionalized; or</li>
      <li style="${LI}">transferred to another context.</li>
    </ul>
    <p style="${P}">
      Do not automatically recommend scaling solely because participants were satisfied with the project.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 4.6 ===================== -->
    <p style="${H_SUB}">4.6 Limitations</p>
    <p style="${P}">
      Clearly acknowledge relevant limitations, including possible weaknesses in:
    </p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">baseline information;</li>
      <li style="${LI}">participant selection;</li>
      <li style="${LI}">sample size;</li>
      <li style="${LI}">absence of a comparison group;</li>
      <li style="${LI}">duration of follow-up;</li>
      <li style="${LI}">reliance on self-reported information;</li>
      <li style="${LI}">missing data;</li>
      <li style="${LI}">measurement instruments;</li>
      <li style="${LI}">attribution of outcomes; or</li>
      <li style="${LI}">other methodological constraints.</li>
    </ul>
    <p style="${P}">
      A credible limitations section strengthens, rather than weakens, a scholarly paper.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== 5. IMPLICATIONS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">5. IMPLICATIONS FOR EXTENSION PRACTICE AND POLICY</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">400–500 words</span></p>
    <p style="${P}">
      Explain what extension managers, HEIs, practitioners, LGUs, partner institutions, policymakers, or other stakeholders can reasonably learn from the project.
    </p>
    <p style="${P}">Possible implications may concern:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">extension project design;</li>
      <li style="${LI}">community engagement;</li>
      <li style="${LI}">monitoring and evaluation;</li>
      <li style="${LI}">evidence generation;</li>
      <li style="${LI}">institutional partnerships;</li>
      <li style="${LI}">technology adoption;</li>
      <li style="${LI}">capability-building;</li>
      <li style="${LI}">sustainability mechanisms;</li>
      <li style="${LI}">quality assurance;</li>
      <li style="${LI}">policy development; or</li>
      <li style="${LI}">scaling and replication.</li>
    </ul>
    <p style="${P}">
      Recommendations must arise from the evidence presented in the paper.
    </p>
    ${fieldBox(answer)}
  `;
}

function bodyPage9HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;text-transform:uppercase;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ===================== 6. CONCLUSION ===================== -->
    <p style="${H_SECTION}">6. CONCLUSION</p>
    <p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">300–500 words</span></p>
    <p style="${P}">
      Provide a concise synthesis of:
    </p>
    <ol style="margin:0 0 6px 0;padding-left:24px;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;">
      <li style="margin:0 0 2px 0;">the development issue addressed;</li>
      <li style="margin:0 0 2px 0;">the principal intervention;</li>
      <li style="margin:0 0 2px 0;">the strongest documented results;</li>
      <li style="margin:0 0 2px 0;">the significance of those results; and</li>
      <li style="margin:0 0 2px 0;">the central implication for transformative extension.</li>
    </ol>
    <p style="${P}">
      Do not introduce new data or literature in the Conclusion.
    </p>
    <p style="${P}">
      Avoid exaggerated claims such as "the project completely transformed the community" unless such a conclusion is genuinely supported by the evidence.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== ACKNOWLEDGMENTS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">ACKNOWLEDGMENTS</p>
    <p style="${P}">
      Acknowledge institutions, communities, partners, funders, technical personnel, or individuals who contributed materially to the project but do not qualify for authorship.
    </p>
    <p style="${P}">
      Do not use this section merely to list officials.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== FUNDING STATEMENT ===================== -->
    <p style="${H_SECTION}margin-top:16px;">FUNDING STATEMENT</p>
    <p style="${P}">Example:</p>
    <p style="${P}">
      This extension project was funded by [Institution/Agency] under [program/grant, if applicable].
    </p>
    <p style="${P}">or</p>
    <p style="${P}">
      The authors received no external funding for the implementation of this project.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== CONFLICT OF INTEREST ===================== -->
    <p style="${H_SECTION}margin-top:16px;">CONFLICT OF INTEREST</p>
    <p style="${P}">Example:</p>
    <p style="${P}">
      The authors declare no conflict of interest.
    </p>
    <p style="${P}">
      Where a relevant conflict exists, it should be disclosed.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== ETHICS AND INFORMED CONSENT ===================== -->
    <p style="${H_SECTION}margin-top:16px;">ETHICS AND INFORMED CONSENT STATEMENT</p>
    <p style="${P}">Where applicable:</p>
    <p style="${P}">
      The project and associated data-gathering procedures were reviewed/approved by [appropriate body]. Informed consent was obtained from participants prior to data collection and/or use of identifiable photographs and testimonies.
    </p>
    <p style="${P}">
      Adapt the statement according to what actually occurred. Authors should not claim ethical clearance that was not obtained.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== DATA AVAILABILITY ===================== -->
    <p style="${H_SECTION}margin-top:16px;">DATA AVAILABILITY STATEMENT</p>
    <p style="${P}">
      Where appropriate:
    </p>
  `;
}

function bodyPage10HTML(data, BLUE, LIGHT, BORDER) {
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;text-transform:uppercase;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const REF_LINE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner, minH = 44) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:${minH}px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  const refPlaceholder = placeholder(
    'Click or tap here and enter the complete APA 7th Edition reference list.'
  );

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== Data Availability (continuation) ========== -->
    <p style="${P}">
      The data supporting the findings of this paper are available from the corresponding author upon reasonable request, subject to applicable privacy, consent, institutional, and data-protection requirements.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== AUTHOR CONTRIBUTIONS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">AUTHOR CONTRIBUTIONS</p>
    <p style="${P}">
      For stronger publication readiness, PEMNet can encourage the CRediT-style contributor approach.
    </p>
    <p style="${P}">Example:</p>
    <div style="margin:0 0 10px 0;">
      <p style="${REF_LINE}">Conceptualization: A.A., B.B.</p>
      <p style="${REF_LINE}">Project Implementation: A.A., B.B., C.C.</p>
      <p style="${REF_LINE}">Methodology: A.A., C.C.</p>
      <p style="${REF_LINE}">Data Collection: B.B., C.C.</p>
      <p style="${REF_LINE}">Data Analysis: A.A.</p>
      <p style="${REF_LINE}">Writing – Original Draft: A.A.</p>
      <p style="${REF_LINE}">Writing – Review and Editing: A.A., B.B., C.C.</p>
      <p style="${REF_LINE}">Project Administration: B.B.</p>
    </div>
    <p style="${P}">
      This can be optional for the conference version but is valuable for eventual journal submission.
    </p>
    ${fieldBox(answer)}

    <!-- ===================== REFERENCES ===================== -->
    <p style="${H_SECTION}margin-top:16px;">REFERENCES</p>
    <p style="${P}">
      Use APA 7th Edition consistently.
    </p>
    <p style="${P}">Authors should prioritize:</p>
    <ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">
      <li style="${LI}">peer-reviewed journal articles;</li>
      <li style="${LI}">scholarly books;</li>
      <li style="${LI}">government publications;</li>
      <li style="${LI}">official institutional reports;</li>
      <li style="${LI}">authoritative technical publications; and</li>
      <li style="${LI}">other credible primary sources.</li>
    </ul>
    <p style="${P}">
      References appearing in the list must be cited in the manuscript, and all cited works must appear in the reference list.
    </p>

    <p style="${P_TIGHT}"><b>Journal Article</b></p>
    <p style="${P_TIGHT}">
      Author, A. A., &amp; Author, B. B. (Year). Title of article. <i>Journal Title</i>, <u>Volume</u>(Issue), xx–xx. DOI
    </p>

    <p style="${P_TIGHT}margin-top:8px;"><b>Government/Institutional Report</b></p>
    <p style="${P_TIGHT}">
      Institution. (Year). <i>Title of report</i>. Publisher/Institution. URL
    </p>

    <p style="${P_TIGHT}margin-top:8px;"><b>Book</b></p>
    <p style="${P_TIGHT}">
      Author, A. A. (Year). <i>Title of book</i>. Publisher.
    </p>

    ${fieldBox(refPlaceholder, 120)}

    <!-- ===================== APPENDICES ===================== -->
    <p style="${H_SECTION}margin-top:16px;">APPENDICES</p>
    <p style="${P}">
      Appendices are optional and should contain only evidence necessary for understanding or verifying the manuscript.
    </p>
    <p style="${P}">Possible appendices include:</p>
    <p style="${P_TIGHT}">Appendix A: Project Results Framework</p>
    <p style="${P_TIGHT}">Appendix B: Major Monitoring Indicators</p>
  `;
}

function bodyPage11HTML(data, BLUE, LIGHT, BORDER) {
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;

  const H_SUB = `font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial;font-size:11pt;color:#000;line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial;font-size:11pt;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const NOTE_ITALIC = `font-family:Arial;font-size:11pt;font-style:italic;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const RED_NOTE = `font-family:Arial;font-size:11pt;font-weight:700;color:#DC2626;line-height:1.0;margin:0 0 6px 0;`;

  const fieldBox = (inner, minH = 44) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial;font-size:11pt;line-height:1.0;min-height:${minH}px;">${inner}</div>`;

  const answer = placeholder(
    'Click or tap here and replace this text with your response.'
  );

  // -------- Sample table cells --------
  const thStyle = `border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;`;
  const tdStyle = `border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:#000;line-height:1.0;padding:6px 8px;`;
  const tdPlaceholder = `border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:#94A3B8;font-style:italic;line-height:1.0;padding:6px 8px;`;

  return `
    <!-- ========== continuation of Appendices ========== -->
    <p style="${P_TIGHT}color:#4472C4;">Appendix C: Relevant Data Collection Instrument</p>
    <p style="${P_TIGHT}color:#4472C4;">Appendix D: Additional Results Table</p>
    <p style="${P_TIGHT}color:#4472C4">Appendix E: Evidence of Institutionalization</p>
    <p style="${P}color:#4472C4">
      Do not turn the manuscript into a portfolio of certificates, attendance sheets, photographs, and administrative documents.
    </p>
    ${fieldBox(
      placeholder(
        'Click or tap here to insert or list only the appendices necessary for understanding or verifying the manuscript.'
      )
    )}

    <!-- ===================== TABLE AND FIGURE FORMAT ===================== -->
    <p style="${H_SUB}margin-top:16px;text-transform:uppercase;">TABLE AND FIGURE FORMAT</p>
    <p style="${P_TIGHT}">Table 1</p>

    <table style="width:100%;border-collapse:collapse;margin:0 0 8px 0;">
      <thead>
        <tr>
          <th style="${thStyle}">Indicator</th>
          <th style="${thStyle}">Baseline</th>
          <th style="${thStyle}">Endline/Follow-up</th>
          <th style="${thStyle}">Change</th>
          <th style="${thStyle}">Source of Evidence</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="${tdStyle}">Indicator 1</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
        </tr>
        <tr>
          <td style="${tdStyle}">Indicator 2</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
          <td style="${tdPlaceholder}">[Type here]</td>
        </tr>
      </tbody>
    </table>

    <p style="${NOTE_ITALIC}">
      Baseline and Post-Intervention Status of Selected Indicators. Note. Explain abbreviations or important qualifications.
    </p>
    <p style="${P}">
      Every table must be discussed in the text.
    </p>

    <!-- ===================== FIGURE FORMAT ===================== -->
    <p style="${P_TIGHT}margin-top:10px;">Figure 1</p>
    <p style="${NOTE_ITALIC}">Extension Project Results Pathway</p>

    <div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">
      [Insert figure]
    </div>

    <p style="${NOTE_ITALIC}">
      Note. Source or explanatory note, where necessary.
    </p>

    <p style="${P}">
      Tables and figures should communicate evidence, not simply decorate the manuscript.
    </p>
    <p style="${P}">
      PEMNet's existing requirements similarly provide that tables and figures be properly numbered, labeled, explained in the text, and directly relevant to the claims being presented.
    </p>
    ${fieldBox(
      placeholder(
        'Click or tap here to enter the source or explanatory note, where necessary.'
      )
    )}

    <p style="${P}margin-top:150px;">
      NOTE: By submitting this manuscript, the author/s confirm their acceptance of the Author Consent and Limited Publication License stated earlier in this template.
    </p>
  `;
}

function buildBlocks({ data, BLUE, LIGHT, BORDER }) {
  return [
    { kind: 'atomic', html: consentPageHTML(BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: titleAuthorPageHTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPageHTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage2HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage3HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage4HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage5HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage6HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage7HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage8HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage9HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage10HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: bodyPage11HTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
  ];
}

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

    // Ensure all images (e.g., the PEMNet logo) are loaded before capture.
    const imgs = Array.from(host.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
      )
    );

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
  const [affiliations, setAffiliations] = useState('');
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [correspondingName, setCorrespondingName] = useState('');
  const [correspondingEmail, setCorrespondingEmail] = useState('');
  const [correspondingOrcid, setCorrespondingOrcid] = useState('');
  const [thematicArea, setThematicArea] = useState('');
  const [thematicAreaTitle, setThematicAreaTitle] = useState('');
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
    setAffiliations('');
    setKeywords('');
    setAbstract('');
    setCorrespondingName('');
    setCorrespondingEmail('');
    setCorrespondingOrcid('');
    setThematicArea('');
    setThematicAreaTitle('');
    setFile(null);
    setError('');
  };

  const validate = () => {
    if (!submissionId) return 'Please select the linked accepted abstract.';
    if (!title.trim()) return 'Full paper title is required.';
    if (!authors.trim()) return 'Author/s is required.';
    if (!affiliations.trim()) return 'Author affiliations are required.';
    if (!keywords.trim()) return 'Keywords are required.';
    if (!correspondingName.trim())
      return 'Corresponding author name is required.';
    if (!correspondingEmail.trim())
      return 'Corresponding author email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correspondingEmail))
      return 'Please enter a valid email address.';
    if (!thematicArea) return 'Please select a thematic area.';
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

      const linked = acceptedSubmissions.find(
        (s) => String(s.id) === String(submissionId)
      );
      const previewData = {
        linked_abstract_title: linked?.extension_project_title || '',
        title,
        authors,
        affiliations,
        keywords,
        abstract,
        correspondingName,
        correspondingEmail,
        correspondingOrcid,
        thematicArea,
        thematicAreaTitle,
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

      const fd = new FormData();
      fd.append('full_paper_title', title);
      fd.append('full_paper_authors', authors);
      fd.append('full_paper_affiliations', affiliations);
      fd.append('full_paper_keywords', keywords);
      fd.append('full_paper_abstract', abstract);
      fd.append('full_paper_corresponding_name', correspondingName);
      fd.append('full_paper_corresponding_email', correspondingEmail);
      fd.append('full_paper_corresponding_orcid', correspondingOrcid);
      fd.append('full_paper_thematic_area', thematicArea);
      fd.append('full_paper_thematic_area_title', thematicAreaTitle);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      fd.append(
        'full_paper_file',
        new File([file], safeName, { type: 'application/pdf' })
      );
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
    affiliations,
    keywords,
    abstract,
    correspondingName,
    correspondingEmail,
    correspondingOrcid,
    thematicArea,
    thematicAreaTitle,
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

          {/* ============================================================
           * Linked Abstract
           * ============================================================ */}
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

          {/* ============================================================
           * Title of the Paper
           * ============================================================ */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Full Paper Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a concise, informative, and scholarly title"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Communicate the central intervention or extension issue, major outcome, and context. Avoid titles with only the institutional project name or acronym.
            </p>
          </div>

          {/* ============================================================
           * Author Information
           * ============================================================ */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Author/s <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g., Juan Dela Cruz¹, Maria Santos², Pedro Reyes³"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              List all authors with superscript affiliation numbers (¹, ², ³). Use an asterisk (*) after the project leader&apos;s name.
            </p>
          </div>

          {/* Affiliations */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Author Affiliations <span className="text-red-500">*</span>
            </label>
            <textarea
              value={affiliations}
              onChange={(e) => setAffiliations(e.target.value)}
              placeholder={`e.g.,\n¹Department of Agriculture, University of the Philippines Los Baños, Laguna, Philippines\n²College of Education, Central Mindanao University, Bukidnon, Philippines\n³Partner Institution, if applicable`}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              One affiliation per line. Use superscript numbers matching the author list.
            </p>
          </div>

          {/* ============================================================
           * Corresponding Author
           * ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Corresponding Author Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={correspondingName}
                onChange={(e) => setCorrespondingName(e.target.value)}
                placeholder="e.g., Juan Dela Cruz"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Corresponding Author Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={correspondingEmail}
                onChange={(e) => setCorrespondingEmail(e.target.value)}
                placeholder="e.g., juan@university.edu.ph"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ORCID */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Corresponding Author ORCID{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={correspondingOrcid}
              onChange={(e) => setCorrespondingOrcid(e.target.value)}
              placeholder="e.g., 0000-0002-1825-0097"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* ============================================================
           * Thematic Area
           * ============================================================ */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Thematic Area <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select the area representing the project&apos;s primary intended outcome and strongest evidence of public value.
            </p>
            <select
              value={thematicArea}
              onChange={(e) => {
                const num = e.target.value;
                setThematicArea(num);
                const idx = parseInt(num, 10) - 1;
                if (THEMATIC_AREAS[idx]) setThematicAreaTitle(THEMATIC_AREAS[idx]);
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none mb-3"
            >
              <option value="">— Select a thematic area —</option>
              {THEMATIC_AREAS.map((area, idx) => (
                <option key={idx} value={String(idx + 1)}>
                  {idx + 1}. {area}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={thematicAreaTitle}
              onChange={(e) => setThematicAreaTitle(e.target.value)}
              placeholder="Full title of the selected thematic area"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Auto-filled when you pick a number above; edit if needed.
            </p>
          </div>

          {/* ============================================================
           * Keywords
           * ============================================================ */}
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

          {/* ============================================================
           * Abstract
           * ============================================================ */}
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

          {/* ============================================================
           * File upload
           * ============================================================ */}
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
        </div>
      </div>
    </div>
  );
}