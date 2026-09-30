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

  const selectedArea = safe(data.thematicArea).trim();

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
      ${THEMATIC_AREAS.map((a, idx) => {
        const num = String(idx + 1);
        const isSelected = num === selectedArea;
        const style = isSelected
          ? 'margin:0 0 2px 0;font-weight:700;'
          : 'margin:0 0 2px 0;';
        return `<li style="${style}">${a}</li>`;
      }).join('')}
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
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

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
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

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
      orPlaceholder(
        data.backgroundContext,
        'Click or tap here and replace this text with your response.'
      )
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
      orPlaceholder(
        data.evidenceNeed,
        'Click or tap here and replace this text with your response.'
      )
    )}
  `;
}

function bodyPage2HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

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
    ${fieldBox(orPlaceholder(data.evidenceNeed, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.relatedLiterature, ANSWER_PH))}

    <!-- ===================== 1.4 ===================== -->
    <p style="${H_SUB}">1.4 Rationale and Contribution of the Project</p>
    <p style="${P}">
      Explain why the intervention was appropriate given the identified problem, available evidence, community context, and institutional expertise.
    </p>
    <p style="${P}">
      Clearly identify what is potentially distinctive or useful about the project.
    </p>
    ${fieldBox(orPlaceholder(data.rationale, ANSWER_PH))}

    <!-- ===================== 1.5 ===================== -->
    <p style="${H_SUB}">1.5 Objectives</p>
    <p style="${P}">
      State the general and specific objectives.
    </p>
    <p style="${P}">
      The objectives reported here should correspond with the results presented later in the paper.
    </p>
    ${fieldBox(orPlaceholder(data.objectives, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.settingDuration, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.participantsDesc, ANSWER_PH))}
  `;
}

function bodyPage3HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 2.2 ========== -->
    <p style="${P}">
      Distinguish between persons reached by project activities and the population for whom outcome data were actually obtained.
    </p>
    ${fieldBox(orPlaceholder(data.reachPopulation, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.situationalAnalysis, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.interventionRationale, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.implementationStrategies, ANSWER_PH))}
  `;
}

function bodyPage4HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

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
    ${fieldBox(orPlaceholder(data.implementationStrategies, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.partnership, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.monitoringEval, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.dataAnalysis, ANSWER_PH))}
  `;
}

function bodyPage5HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

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
    ${fieldBox(orPlaceholder(data.ethicalConsiderations, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.reachImplementation, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.immediateResults, ANSWER_PH))}

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
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of 3.3 ========== -->
    <p style="${P_TIGHT}">
      <b>Outcome</b> – meaningful change in practice, behavior, condition, performance, or institutional capacity
    </p>
    ${fieldBox(orPlaceholder(data.outcomes, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.adoption, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.institutionalization, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.publicValue, ANSWER_PH))}

    <!-- ===================== Important Evidence Rule ===================== -->
    <p style="${H_SUB}">Important Evidence Rule</p>
    <p style="${P}color:#000;">
      Attendance sheets, photographs, certificates, and activity reports can verify that an activity occurred, but they should not by themselves be used as proof that an outcome, adoption, utilization, or impact occurred. This distinction is expressly reflected in PEMNet's conference requirements.
    </p>
  `;
}

function bodyPage7HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

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
    ${fieldBox(orPlaceholder(data.interpretation, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.relationshipLiterature, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.factorsAffecting, ANSWER_PH))}

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
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

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
    ${fieldBox(orPlaceholder(data.inclusionResilience, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.transferability, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.limitations, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.implications, ANSWER_PH))}
  `;
}

function bodyPage9HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;text-transform:uppercase;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const fieldBox = (inner) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:44px;">${inner}</div>`;

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
    ${fieldBox(orPlaceholder(data.conclusion, ANSWER_PH))}

    <!-- ===================== ACKNOWLEDGMENTS ===================== -->
    <p style="${H_SECTION}margin-top:16px;">ACKNOWLEDGMENTS</p>
    <p style="${P}">
      Acknowledge institutions, communities, partners, funders, technical personnel, or individuals who contributed materially to the project but do not qualify for authorship.
    </p>
    <p style="${P}">
      Do not use this section merely to list officials.
    </p>
    ${fieldBox(orPlaceholder(data.acknowledgments, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.funding, ANSWER_PH))}

    <!-- ===================== CONFLICT OF INTEREST ===================== -->
    <p style="${H_SECTION}margin-top:16px;">CONFLICT OF INTEREST</p>
    <p style="${P}">Example:</p>
    <p style="${P}">
      The authors declare no conflict of interest.
    </p>
    <p style="${P}">
      Where a relevant conflict exists, it should be disclosed.
    </p>
    ${fieldBox(orPlaceholder(data.conflictOfInterest, ANSWER_PH))}

    <!-- ===================== ETHICS AND INFORMED CONSENT ===================== -->
    <p style="${H_SECTION}margin-top:16px;">ETHICS AND INFORMED CONSENT STATEMENT</p>
    <p style="${P}">Where applicable:</p>
    <p style="${P}">
      The project and associated data-gathering procedures were reviewed/approved by [appropriate body]. Informed consent was obtained from participants prior to data collection and/or use of identifiable photographs and testimonies.
    </p>
    <p style="${P}">
      Adapt the statement according to what actually occurred. Authors should not claim ethical clearance that was not obtained.
    </p>
    ${fieldBox(orPlaceholder(data.ethicsStatement, ANSWER_PH))}

    <!-- ===================== DATA AVAILABILITY ===================== -->
    <p style="${H_SECTION}margin-top:16px;">DATA AVAILABILITY STATEMENT</p>
    <p style="${P}">
      Where appropriate:
    </p>
  `;
}

function bodyPage10HTML(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';
  const REF_PH = 'Click or tap here and enter the complete APA 7th Edition reference list.';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;text-transform:uppercase;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const REF_LINE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const fieldBox = (inner, minH = 44) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:${minH}px;">${inner}</div>`;

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== Data Availability (continuation) ========== -->
    <p style="${P}">
      The data supporting the findings of this paper are available from the corresponding author upon reasonable request, subject to applicable privacy, consent, institutional, and data-protection requirements.
    </p>
    ${fieldBox(orPlaceholder(data.dataAvailability, ANSWER_PH))}

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
    ${fieldBox(orPlaceholder(data.authorContributions, ANSWER_PH))}

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

    ${fieldBox(orPlaceholder(data.references, REF_PH), 120)}

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
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const placeholder = (text) =>
    `<span style="color:#94A3B8;font-style:italic;">${text}</span>`;
  const filled = (text) => `<span style="color:${ACCENT};">${text}</span>`;
  const orPlaceholder = (value, ph) =>
    String(value || '').trim() ? filled(value) : placeholder(ph);

  const APPENDICES_PH =
    'Click or tap here to insert or list only the appendices necessary for understanding or verifying the manuscript.';
  const ANSWER_PH =
    'Click or tap here to enter the source or explanatory note, where necessary.';

  const H_SUB = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const NOTE_ITALIC = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-style:italic;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const RED_NOTE = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#DC2626;line-height:1.0;margin:0 0 6px 0;`;

  const fieldBox = (inner, minH = 44) =>
    `<div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px;margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.0;min-height:${minH}px;">${inner}</div>`;

  // -------- Sample table cells --------
  const thStyle = `border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;`;
  const tdStyle = `border:1px solid #94A3B8;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;padding:6px 8px;`;
  const tdPlaceholder = `border:1px solid #94A3B8;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#94A3B8;font-style:italic;line-height:1.0;padding:6px 8px;`;

  return `
    <style>
      ul > li::marker { color: #000; }
      ol > li::marker { color: #000; }
    </style>

    <!-- ========== continuation of Appendices ========== -->
    <p style="${P_TIGHT}">Appendix C: Relevant Data Collection Instrument</p>
    <p style="${P_TIGHT}">Appendix D: Additional Results Table</p>
    <p style="${P_TIGHT}">Appendix E: Evidence of Institutionalization</p>
    <p style="${P}">
      Do not turn the manuscript into a portfolio of certificates, attendance sheets, photographs, and administrative documents.
    </p>
    ${fieldBox(orPlaceholder(data.appendices, APPENDICES_PH))}

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

    <div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">
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
    ${fieldBox(orPlaceholder(data.appendices, ANSWER_PH))}

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

  // Section 1
  const [backgroundContext, setBackgroundContext] = useState('');
  const [evidenceNeed, setEvidenceNeed] = useState('');
  const [relatedLiterature, setRelatedLiterature] = useState('');
  const [rationale, setRationale] = useState('');
  const [objectives, setObjectives] = useState('');

  // Section 2
  const [reachPopulation, setReachPopulation] = useState('');
  const [settingDuration, setSettingDuration] = useState('');
  const [participantsDesc, setParticipantsDesc] = useState('');
  const [situationalAnalysis, setSituationalAnalysis] = useState('');
  const [interventionRationale, setInterventionRationale] = useState('');
  const [implementationStrategies, setImplementationStrategies] = useState('');
  const [partnership, setPartnership] = useState('');
  const [monitoringEval, setMonitoringEval] = useState('');
  const [dataAnalysis, setDataAnalysis] = useState('');
  const [ethicalConsiderations, setEthicalConsiderations] = useState('');

  // Section 3 — Results
  const [reachImplementation, setReachImplementation] = useState('');
  const [immediateResults, setImmediateResults] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [adoption, setAdoption] = useState('');
  const [institutionalization, setInstitutionalization] = useState('');
  const [publicValue, setPublicValue] = useState('');

  // Section 4 — Discussion
  const [interpretation, setInterpretation] = useState('');
  const [relationshipLiterature, setRelationshipLiterature] = useState('');
  const [factorsAffecting, setFactorsAffecting] = useState('');
  const [inclusionResilience, setInclusionResilience] = useState('');
  const [transferability, setTransferability] = useState('');
  const [limitations, setLimitations] = useState('');

  // Section 5 — Implications
  const [implications, setImplications] = useState('');

  // Section 6 — Conclusion + back matter
  const [conclusion, setConclusion] = useState('');
  const [acknowledgments, setAcknowledgments] = useState('');
  const [funding, setFunding] = useState('');
  const [conflictOfInterest, setConflictOfInterest] = useState('');
  const [ethicsStatement, setEthicsStatement] = useState('');
  const [dataAvailability, setDataAvailability] = useState('');
  const [authorContributions, setAuthorContributions] = useState('');
  const [references, setReferences] = useState('');
  const [appendices, setAppendices] = useState('');

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

    setBackgroundContext('');
    setEvidenceNeed('');
    setRelatedLiterature('');
    setRationale('');
    setObjectives('');

    setReachPopulation('');
    setSettingDuration('');
    setParticipantsDesc('');
    setSituationalAnalysis('');
    setInterventionRationale('');
    setImplementationStrategies('');
    setPartnership('');
    setMonitoringEval('');
    setDataAnalysis('');
    setEthicalConsiderations('');

    setReachImplementation('');
    setImmediateResults('');
    setOutcomes('');
    setAdoption('');
    setInstitutionalization('');
    setPublicValue('');

    setInterpretation('');
    setRelationshipLiterature('');
    setFactorsAffecting('');
    setInclusionResilience('');
    setTransferability('');
    setLimitations('');

    setImplications('');

    setConclusion('');
    setAcknowledgments('');
    setFunding('');
    setConflictOfInterest('');
    setEthicsStatement('');
    setDataAvailability('');
    setAuthorContributions('');
    setReferences('');
    setAppendices('');

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
        backgroundContext,
        evidenceNeed,
        relatedLiterature,
        rationale,
        objectives,
        reachPopulation,
        settingDuration,
        participantsDesc,
        situationalAnalysis,
        interventionRationale,
        implementationStrategies,
        partnership,
        monitoringEval,
        dataAnalysis,
        ethicalConsiderations,
        reachImplementation,
        immediateResults,
        outcomes,
        adoption,
        institutionalization,
        publicValue,
        interpretation,
        relationshipLiterature,
        factorsAffecting,
        inclusionResilience,
        transferability,
        limitations,
        implications,
        conclusion,
        acknowledgments,
        funding,
        conflictOfInterest,
        ethicsStatement,
        dataAvailability,
        authorContributions,
        references,
        appendices,
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

      // Section 1
      fd.append('full_paper_background_context', backgroundContext);
      fd.append('full_paper_evidence_need', evidenceNeed);
      fd.append('full_paper_related_literature', relatedLiterature);
      fd.append('full_paper_rationale', rationale);
      fd.append('full_paper_objectives', objectives);

      // Section 2
      fd.append('full_paper_reach_population', reachPopulation);
      fd.append('full_paper_setting_duration', settingDuration);
      fd.append('full_paper_participants_desc', participantsDesc);
      fd.append('full_paper_situational_analysis', situationalAnalysis);
      fd.append('full_paper_intervention_rationale', interventionRationale);
      fd.append('full_paper_implementation_strategies', implementationStrategies);
      fd.append('full_paper_partnership', partnership);
      fd.append('full_paper_monitoring_eval', monitoringEval);
      fd.append('full_paper_data_analysis', dataAnalysis);
      fd.append('full_paper_ethical_considerations', ethicalConsiderations);

      // Section 3
      fd.append('full_paper_reach_implementation', reachImplementation);
      fd.append('full_paper_immediate_results', immediateResults);
      fd.append('full_paper_outcomes', outcomes);
      fd.append('full_paper_adoption', adoption);
      fd.append('full_paper_institutionalization', institutionalization);
      fd.append('full_paper_public_value', publicValue);

      // Section 4
      fd.append('full_paper_interpretation', interpretation);
      fd.append('full_paper_relationship_literature', relationshipLiterature);
      fd.append('full_paper_factors_affecting', factorsAffecting);
      fd.append('full_paper_inclusion_resilience', inclusionResilience);
      fd.append('full_paper_transferability', transferability);
      fd.append('full_paper_limitations', limitations);

      // Section 5
      fd.append('full_paper_implications', implications);

      // Section 6 + Back matter
      fd.append('full_paper_conclusion', conclusion);
      fd.append('full_paper_acknowledgments', acknowledgments);
      fd.append('full_paper_funding', funding);
      fd.append('full_paper_conflict_of_interest', conflictOfInterest);
      fd.append('full_paper_ethics_statement', ethicsStatement);
      fd.append('full_paper_data_availability', dataAvailability);
      fd.append('full_paper_author_contributions', authorContributions);
      fd.append('full_paper_references', references);
      fd.append('full_paper_appendices', appendices);

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
      <>
        {/* Lock only the outer page scroll while preview is open */}
        <style jsx global>{`
          html, body {
            overflow: hidden !important;
            height: 100% !important;
          }
        `}</style>
          <div className="flex flex-col" style={{ height: 'calc(100vh - 73px)' }}>
            {/* Toolbar — sits below PEMNet header, never scrolls */}
            <div className="shrink-0 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print shadow-sm">
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

            {/* Canvas — the ONLY scrollable area (scrollbar on its right edge) */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100">
              <div className="a4-preview-wrapper p-6">
                <FullPaperPreview data={previewData} />
              </div>
            </div>
          </div>
        </>
      );
    }

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100% !important;
        }

        /* Force the form scrollbar to always be visible */
        .form-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        .form-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        /* Firefox */
        .form-scroll {
          scrollbar-width: auto;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
      `}</style>

      <div
        className="flex flex-col"
        style={{ height: 'calc(100vh - 73px)' }}
      >
        {/* ---- Pinned header: title + Back to Home ---- */}
        <div className="shrink-0 w-full">
          <div className="max-w-4xl mx-auto px-6 pt-6 pb-4 flex justify-between items-center">
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
        </div>

        {/* ---- Scrollable form area ---- */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <div className="form-scroll max-w-4xl mx-auto h-full overflow-y-scroll">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
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

                {/* ============ Linked Accepted Abstract ============ */}
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

                {/* ============ Title of the Paper ============ */}
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
                </div>

                {/* ============ Author Information ============ */}
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
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Author Affiliations <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={affiliations}
                    onChange={(e) => setAffiliations(e.target.value)}
                    placeholder={`e.g.,\n¹Department of Agriculture, University of the Philippines Los Baños, Laguna, Philippines\n²College of Education, Central Mindanao University, Bukidnon, Philippines`}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                  />
                </div>

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

                {/* ============ Thematic Area ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Thematic Area <span className="text-red-500">*</span>
                  </label>
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
                </div>

                {/* ============ Keywords ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Keywords <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., community extension; sustainable agriculture; resilience"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* ============ Abstract ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Abstract <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Write the 250–300-word abstract as one coherent paragraph"
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                  />
                </div>

                {/* =====================================================
                * 1. INTRODUCTION
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                    1. Introduction
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.1 Background and Context</label>
                      <textarea
                        value={backgroundContext}
                        onChange={(e) => setBackgroundContext(e.target.value)}
                        placeholder="Describe the community, institutional, sectoral, environmental, economic, educational, health, or development context..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.2 Evidence of the Problem or Development Need</label>
                      <textarea
                        value={evidenceNeed}
                        onChange={(e) => setEvidenceNeed(e.target.value)}
                        placeholder="Explain how the need, condition, gap, or opportunity was established..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.3 Related Literature and Extension Evidence</label>
                      <textarea
                        value={relatedLiterature}
                        onChange={(e) => setRelatedLiterature(e.target.value)}
                        placeholder="Focused synthesis of relevant scholarly and technical literature..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.4 Rationale and Contribution of the Project</label>
                      <textarea
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Why the intervention was appropriate given the problem, evidence, community context, and institutional expertise..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.5 Objectives</label>
                      <textarea
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        placeholder="General and specific objectives of the extension project..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 2. MATERIALS AND METHODS
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                    2. Materials and Methods / Extension Project Methodology
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.1 Project Setting and Duration</label>
                        <textarea
                          value={settingDuration}
                          onChange={(e) => setSettingDuration(e.target.value)}
                          placeholder="Project site, community characteristics, implementation period, contextual conditions..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.2 Participants, Intended Users, or Beneficiaries</label>
                        <textarea
                          value={participantsDesc}
                          onChange={(e) => setParticipantsDesc(e.target.value)}
                          placeholder="Target population, selection criteria, number reached, demographics..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Distinguish reach vs. population for whom outcome data were obtained
                      </label>
                      <textarea
                        value={reachPopulation}
                        onChange={(e) => setReachPopulation(e.target.value)}
                        placeholder="Explain the distinction between reach and the population that provided outcome data..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.3 Situational Analysis and Baseline</label>
                      <textarea
                        value={situationalAnalysis}
                        onChange={(e) => setSituationalAnalysis(e.target.value)}
                        placeholder="Information collected, data sources, methods/instruments, baseline indicators, major findings..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.4 Project / Intervention Design — Rationale</label>
                      <textarea
                        value={interventionRationale}
                        onChange={(e) => setInterventionRationale(e.target.value)}
                        placeholder="Explain why the selected intervention was expected to address the identified condition..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.5 Implementation Strategies</label>
                      <textarea
                        value={implementationStrategies}
                        onChange={(e) => setImplementationStrategies(e.target.value)}
                        placeholder="Capability-building, technical assistance, demonstrations, mentoring, community organizing, etc..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.6 Partnership and Stakeholder Participation</label>
                      <textarea
                        value={partnership}
                        onChange={(e) => setPartnership(e.target.value)}
                        placeholder="Partners and their actual roles; community participation in planning, implementation, monitoring..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.7 Monitoring and Evaluation Design</label>
                        <textarea
                          value={monitoringEval}
                          onChange={(e) => setMonitoringEval(e.target.value)}
                          placeholder="Indicators, data sources, instruments, timing, follow-up, triangulation..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.8 Data Analysis</label>
                        <textarea
                          value={dataAnalysis}
                          onChange={(e) => setDataAnalysis(e.target.value)}
                          placeholder="Quantitative and/or qualitative analysis methods..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.9 Ethical Considerations</label>
                      <textarea
                        value={ethicalConsiderations}
                        onChange={(e) => setEthicalConsiderations(e.target.value)}
                        placeholder="Informed consent, confidentiality, privacy, community data, ethics clearance..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 3. RESULTS
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">3. Results</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.1 Project Reach and Implementation</label>
                      <textarea
                        value={reachImplementation}
                        onChange={(e) => setReachImplementation(e.target.value)}
                        placeholder="Actual participants, interventions delivered, completion levels, major outputs..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.2 Immediate Results</label>
                      <textarea
                        value={immediateResults}
                        onChange={(e) => setImmediateResults(e.target.value)}
                        placeholder="Documented changes in knowledge, skills, practices, confidence, capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.3 Outcomes</label>
                      <textarea
                        value={outcomes}
                        onChange={(e) => setOutcomes(e.target.value)}
                        placeholder="Meaningful change in practice, behavior, condition, performance, or institutional capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.4 Adoption, Utilization, Adaptation, or Continuation</label>
                      <textarea
                        value={adoption}
                        onChange={(e) => setAdoption(e.target.value)}
                        placeholder="Who adopted what, how many, to what extent, on what evidence..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.5 Institutionalization and Sustainability</label>
                      <textarea
                        value={institutionalization}
                        onChange={(e) => setInstitutionalization(e.target.value)}
                        placeholder="Partner policies, ordinances, budget allocations, integration into programs..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.6 Public Value and Broader Benefits</label>
                      <textarea
                        value={publicValue}
                        onChange={(e) => setPublicValue(e.target.value)}
                        placeholder="Improved livelihood, health, education, resilience, environment, empowerment..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 4. DISCUSSION
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">4. Discussion</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.1 Interpretation of Major Findings</label>
                      <textarea
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        placeholder="Most important findings, why the intervention worked (or not), conditions explaining results..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.2 Relationship to Previous Research and Extension Literature</label>
                      <textarea
                        value={relationshipLiterature}
                        onChange={(e) => setRelationshipLiterature(e.target.value)}
                        placeholder="Supporting, extending, differing from, or qualifying what is already known..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.3 Factors Affecting Implementation and Outcomes</label>
                      <textarea
                        value={factorsAffecting}
                        onChange={(e) => setFactorsAffecting(e.target.value)}
                        placeholder="Enabling or constraining factors: participation, leadership, resources, culture, policy..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.4 Inclusion, Sustainability, and Resilience</label>
                      <textarea
                        value={inclusionResilience}
                        onChange={(e) => setInclusionResilience(e.target.value)}
                        placeholder="Gender and social inclusion, vulnerable groups, sustainability, resilience, ownership, local capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.5 Transferability, Replication, or Scaling</label>
                      <textarea
                        value={transferability}
                        onChange={(e) => setTransferability(e.target.value)}
                        placeholder="Replicated, adapted, scaled, institutionalized, or transferred to another context..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.6 Limitations</label>
                      <textarea
                        value={limitations}
                        onChange={(e) => setLimitations(e.target.value)}
                        placeholder="Baseline, sample size, comparison group, follow-up, self-report, missing data, measurement..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 5. IMPLICATIONS
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                    5. Implications for Extension Practice and Policy
                  </h3>
                  <textarea
                    value={implications}
                    onChange={(e) => setImplications(e.target.value)}
                    placeholder="What extension managers, HEIs, LGUs, policymakers, and partners can learn from the project..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                  />
                </div>

                {/* =====================================================
                * 6. CONCLUSION + BACK MATTER
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                    6. Conclusion and Back Matter
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">6. Conclusion</label>
                      <textarea
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="Synthesis of issue, intervention, strongest results, significance, and central implication..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Acknowledgments</label>
                      <textarea
                        value={acknowledgments}
                        onChange={(e) => setAcknowledgments(e.target.value)}
                        placeholder="Institutions, communities, partners, funders, technical personnel who contributed..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Funding Statement</label>
                      <textarea
                        value={funding}
                        onChange={(e) => setFunding(e.target.value)}
                        placeholder="e.g., This extension project was funded by [Institution/Agency]..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Conflict of Interest</label>
                      <textarea
                        value={conflictOfInterest}
                        onChange={(e) => setConflictOfInterest(e.target.value)}
                        placeholder="e.g., The authors declare no conflict of interest."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Ethics and Informed Consent Statement</label>
                      <textarea
                        value={ethicsStatement}
                        onChange={(e) => setEthicsStatement(e.target.value)}
                        placeholder="e.g., The project was reviewed/approved by [appropriate body]. Informed consent was obtained..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Data Availability Statement</label>
                      <textarea
                        value={dataAvailability}
                        onChange={(e) => setDataAvailability(e.target.value)}
                        placeholder="e.g., Data are available from the corresponding author upon reasonable request..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Author Contributions (CRediT-style)</label>
                      <textarea
                        value={authorContributions}
                        onChange={(e) => setAuthorContributions(e.target.value)}
                        placeholder={`e.g.,\nConceptualization: A.A., B.B.\nMethodology: A.A., C.C.\nWriting – Original Draft: A.A.`}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">References (APA 7th Edition)</label>
                      <textarea
                        value={references}
                        onChange={(e) => setReferences(e.target.value)}
                        placeholder="Enter the complete APA 7th Edition reference list, one entry per line..."
                        rows={6}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Appendices</label>
                      <textarea
                        value={appendices}
                        onChange={(e) => setAppendices(e.target.value)}
                        placeholder="List or describe appendices that support the manuscript..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* ============ Actions ============ */}
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
                      !affiliations.trim() ||
                      !keywords.trim() ||
                      !correspondingName.trim() ||
                      !correspondingEmail.trim() ||
                      !thematicArea
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
        </div>
      </div>
    </>
  );
}