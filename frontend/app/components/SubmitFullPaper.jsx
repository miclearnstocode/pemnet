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
// Small atomic blocks for non-splittable content
const A = (html) => ({ kind: 'atomic', html });
const A_HEAD = (html) => ({ kind: 'atomic', html, forceNewPage: true });

// A user-answer box: the body is splittable across pages,
// and the heading (if any) is repeated if the block breaks.
const N = (headingHtml, bodyText) => ({
  kind: 'narrative',
  heading: headingHtml,
  bodyText: bodyText ?? '',
});

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
            <A4Sheet key="cover" pageNumber={1} totalPages={totalPages} isFirstPage={true} BLUE={BLUE} LIGHT={LIGHT} BORDER={BORDER}>
              {null}
            </A4Sheet>

            {pages.map((page, idx) => (
              <A4Sheet key={`page-${idx + 2}`} pageNumber={idx + 2} totalPages={totalPages} isFirstPage={false} BLUE={BLUE} LIGHT={LIGHT} BORDER={BORDER}>
                {page.blocks.map((b, i) => <div key={i} dangerouslySetInnerHTML={{ __html: b.html }} />)}
              </A4Sheet>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function A4Sheet({ pageNumber, totalPages, isFirstPage, children, BLUE, LIGHT, BORDER }) {
  const HEADER_ZONE_H = `calc(0.1in + 18mm)`;
  const FOOTER_ZONE_H = `calc(0.2in + 18mm)`;

  return (
    <div
      className="a4-sheet bg-white shadow-2xl"
      style={{
        width: '210mm',
        height: '297mm',         // fixed, not minHeight
        padding: '0 16mm',
        fontFamily: 'Times New Roman, Georgia, serif',
        fontSize: '11pt',
        lineHeight: 1.4,
        color: '#111',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',      // clip
        position: 'relative',
      }}
    >
      {/* header */}
      <div style={{ height: HEADER_ZONE_H, minHeight: HEADER_ZONE_H, maxHeight: HEADER_ZONE_H, flexShrink: 0, flexGrow: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 10, background: '#fff' }} />

      {/* first-page title block */}
      {isFirstPage && (
        <div style={{ flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: firstPageTitleHTML(BLUE, LIGHT, BORDER) }} />
      )}

      {/* dynamic content */}
      <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* footer — always relative, always at the bottom */}
      <div style={{ height: FOOTER_ZONE_H, minHeight: FOOTER_ZONE_H, maxHeight: FOOTER_ZONE_H, flexShrink: 0, flexGrow: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: '10mm', fontFamily: 'Cambria, Georgia, serif', fontSize: '9pt', color: '#A78BFA', overflow: 'hidden', position: 'relative', zIndex: 10, background: '#fff', lineHeight: 1.3 }}>
        <span style={{ display: 'block', margin: 0, padding: 0, color: 'gray' }}>© 2026 Ricky P. Becodo, All Rights Reserved.</span>
        <span style={{ display: 'block', margin: 0, padding: 0, color: 'gray' }}>Prepared for the Philippine Extension Managers Network (PEMNet), Inc.</span>
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

function buildBodyBlocks(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';
  const RED = '#FF0000';

  const H_SECTION = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 6px 0;`;
  const H_SUB     = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:0 0 4px 0;`;
  const P         = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT   = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 4px 0;`;
  const LI        = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;
  const NOTE      = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;`;
  const NOTE_RED  = `font-family:Arial,Helvetica,sans-serif;font-size:11pt;font-weight:700;color:${RED};line-height:1.0;`;

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  // ---- Bulleted list as one atomic block (it's fine if a whole list moves)
  const UL = (items, styleLI = LI) =>
    `<ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">${items
      .map((t) => `<li style="${styleLI}">${t}</li>`)
      .join('')}</ul>`;

  const blocks = [];
  const push = (...b) => blocks.push(...b);

  // ============================================================
  // ABSTRACT
  // ============================================================
  push(
    A(`<style>ul>li::marker{color:#000;}ol>li::marker{color:#000;}</style>`),
    A(`<p style="${H_SECTION}text-transform:uppercase;">ABSTRACT</p>`),
    A(`<p style="${NOTE}">Recommended length: <span style="${NOTE_RED}">250–300 words</span></p>`),
    A(`<p style="${P}">Provide a concise, self-contained summary of the entire paper. The abstract should contain the following elements, preferably as one coherent paragraph:</p>`),
    A(`<p style="${P_TIGHT}"><b>Background/Need:</b> Briefly identify the community, institutional, or sectoral condition that justified the extension project.</p>`),
    A(`<p style="${P_TIGHT}"><b>Objective:</b> State the principal objective or purpose of the project.</p>`),
    A(`<p style="${P_TIGHT}"><b>Methods/Approach:</b> Briefly describe the setting, intended users or beneficiaries, extension intervention, implementation approach, and methods used to assess results.</p>`),
    A(`<p style="${P_TIGHT}"><b>Results:</b> Present the most important quantitative and/or qualitative findings. Give actual evidence rather than merely stating that the project was "successful."</p>`),
    A(`<p style="${P_TIGHT}"><b>Conclusion:</b> State what the evidence indicates and its principal implication for extension practice, sustainability, policy, or public value.</p>`),
    A(`<p style="${P}">Do not introduce claims in the abstract that are not supported in the main paper.</p>`),
    N('', safe(data.abstract).trim() || ANSWER_PH),
    A(`<p style="${P_TIGHT}"><b>Keywords:</b> [4–6 keywords, separated by semicolons]</p>`),
    N('', safe(data.keywords).trim() || ANSWER_PH),
  );

  // ============================================================
  // 1. INTRODUCTION
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">1. INTRODUCTION</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">900–1,100 words</span></p>`),
    A(`<p style="${P}">The Introduction should establish the scholarly and development basis of the extension project.</p>`),

    A(`<p style="${H_SUB}">1.1 Background and Context</p>`),
    A(`<p style="${P}">Describe the community, institutional, sectoral, environmental, economic, educational, health, or development context within which the project was implemented.</p>`),
    A(`<p style="${P}">Explain the significance of the issue being addressed.</p>`),
    A(`<p style="${P}">Where appropriate, provide relevant statistics, policies, research findings, or documented community evidence.</p>`),
    N('', safe(data.backgroundContext).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.2 Evidence of the Problem or Development Need</p>`),
    A(`<p style="${P}">Explain how the need, condition, gap, or opportunity was established.</p>`),
    A(`<p style="${P}">Evidence may come from:</p>`),
    A(UL([
      'situational or needs assessment;','baseline data;','community consultations;',
      'surveys;','focus group discussions;','key informant interviews;',
      'institutional records;','government statistics;','previous research;',
      'technical assessments; or','other credible sources.'
    ])),
    A(`<p style="${P}">Avoid relying solely on statements such as "the community requested training."</p>`),
    N('', safe(data.evidenceNeed).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.3 Related Literature and Extension Evidence</p>`),
    A(`<p style="${P}">Provide a focused synthesis of relevant scholarly and technical literature concerning:</p>`),
    A(UL([
      'the issue being addressed;','comparable interventions;',
      'relevant extension approaches;','documented factors influencing adoption or outcomes; and',
      'the knowledge or practice gap the project sought to address.'
    ])),
    A(`<p style="${P}">This section should not become an exhaustive review of literature. Its purpose is to demonstrate that the extension intervention was informed by existing knowledge and to establish how the project contributes to extension knowledge or practice.</p>`),
    N('', safe(data.relatedLiterature).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.4 Rationale and Contribution of the Project</p>`),
    A(`<p style="${P}">Explain why the intervention was appropriate given the identified problem, available evidence, community context, and institutional expertise.</p>`),
    A(`<p style="${P}">Clearly identify what is potentially distinctive or useful about the project.</p>`),
    N('', safe(data.rationale).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.5 Objectives</p>`),
    A(`<p style="${P}">State the general and specific objectives.</p>`),
    A(`<p style="${P}">The objectives reported here should correspond with the results presented later in the paper.</p>`),
    N('', safe(data.objectives).trim() || ANSWER_PH),
  );

  // ============================================================
  // 2. MATERIALS AND METHODS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">2. MATERIALS AND METHODS / EXTENSION PROJECT METHODOLOGY</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,100–1,400 words</span></p>`),
    A(`<p style="${P}">This section must be sufficiently detailed to allow readers to understand what was done, with whom, how, why, and how results were determined.</p>`),

    A(`<p style="${H_SUB}">2.1 Project Setting and Duration</p>`),
    A(`<p style="${P}">Describe:</p>`),
    A(UL([
      'project site;','relevant characteristics of the community or institution;',
      'implementation period; and','contextual conditions important to understanding the intervention.'
    ])),
    A(`<p style="${P}">A map may be included when genuinely useful.</p>`),
    N('', safe(data.settingDuration).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.2 Participants, Intended Users, or Beneficiaries</p>`),
    A(`<p style="${P}">Describe:</p>`),
    A(UL([
      'target population;','participant selection or inclusion criteria;',
      'number of participants or households/institutions reached;',
      'relevant demographic or sectoral characteristics; and',
      'involvement of women, youth, vulnerable groups, or other relevant sectors where applicable.'
    ])),
    N('', safe(data.participantsDesc).trim() || ANSWER_PH),

    A(`<p style="${P}">Distinguish between persons reached by project activities and the population for whom outcome data were actually obtained.</p>`),
    N('', safe(data.reachPopulation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.3 Situational Analysis and Baseline</p>`),
    A(`<p style="${P}">Describe how the initial situation was established.</p>`),
    A(`<p style="${P}">Identify:</p>`),
    A(UL([
      'information collected;','data sources;','methods or instruments used;',
      'baseline indicators, where available; and','major findings that informed project design.'
    ])),
    N('', safe(data.situationalAnalysis).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.4 Project or Intervention Design</p>`),
    A(`<p style="${P}">Describe the extension intervention and its underlying logic.</p>`),
    A(`<p style="${P}">Authors are encouraged to present a project logic or results pathway such as:</p>`),
    A(`<div style="margin:6px 0 14px 0;text-align:center;"><img src="/images/project%20design.png" alt="Project Design and Results Pathway" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`),
    A(`<p style="${P}">Explain why the selected intervention was expected to address the identified condition.</p>`),
    N('', safe(data.interventionRationale).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.5 Implementation Strategies</p>`),
    A(`<p style="${P}">Describe the major strategies used, such as:</p>`),
    A(UL([
      'capability-building;','technical assistance;','demonstrations;',
      'mentoring or coaching;','community organizing;','communication interventions;',
      'technology transfer;','enterprise development;','policy or institutional development;',
      'partnership building;','participatory planning; or','other relevant approaches.'
    ])),
    A(`<p style="${P}">Avoid presenting a simple chronological list of activities unless chronology is analytically important.</p>`),
    N('', safe(data.implementationStrategies).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.6 Partnership and Stakeholder Participation</p>`),
    A(`<p style="${P}">Identify important partners and explain their actual roles, rather than merely listing organizations.</p>`),
    A(`<p style="${P}">Describe relevant community participation in:</p>`),
    A(UL([
      'project planning;','implementation;','monitoring;','decision-making;',
      'resource mobilization; or','sustainability mechanisms.'
    ])),
    N('', safe(data.partnership).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.7 Monitoring and Evaluation Design</p>`),
    A(`<p style="${P}">Explain how the project\'s results were measured or verified.</p>`),
    A(`<p style="${P}">Identify:</p>`),
    A(UL([
      'indicators;','data sources;','instruments;','timing of measurements;',
      'persons or groups from whom data were obtained;',
      'follow-up procedures; and','methods used to verify or triangulate evidence.'
    ])),
    A(`<p style="${P}">Where baseline and endline measurements were conducted, describe them clearly.</p>`),
    N('', safe(data.monitoringEval).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.8 Data Analysis</p>`),
    A(`<p style="${P}">Describe how quantitative and/or qualitative data were analyzed.</p>`),
    A(`<p style="${P}">Examples include:</p>`),
    A(UL([
      'frequencies and percentages;','means or other descriptive statistics;',
      'pre-post comparison;','appropriate statistical tests;','thematic analysis;',
      'content analysis; or','triangulation of multiple evidence sources.'
    ])),
    A(`<p style="${P}">Do not employ statistical tests merely to make the manuscript appear more scholarly. The analysis must be appropriate to the data and evaluation design.</p>`),
    N('', safe(data.dataAnalysis).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.9 Ethical Considerations</p>`),
    A(`<p style="${P}">Explain relevant safeguards concerning:</p>`),
    A(UL([
      'informed participation or consent;','confidentiality;','privacy;',
      'community data;','photographs;','interviews and testimonies;',
      'vulnerable participants; and','institutional records.'
    ])),
    A(`<p style="${P}">Where formal ethics clearance was required and obtained, state the approving body and approval/reference number.</p>`),
    N('', safe(data.ethicalConsiderations).trim() || ANSWER_PH),
  );

  // ============================================================
  // 3. RESULTS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">3. RESULTS</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,200–1,600 words</span></p>`),
    A(`<p style="${P}">Present the evidence objectively and systematically.</p>`),
    A(`<p style="${P}">Results should correspond directly with the project objectives and indicators.</p>`),

    A(`<p style="${H_SUB}">3.1 Project Reach and Implementation</p>`),
    A(`<p style="${P}">Briefly report important implementation evidence, including:</p>`),
    A(UL([
      'actual participants reached;','interventions delivered;','completion levels;',
      'major products or outputs; and','significant deviations from the original project design.'
    ])),
    A(`<p style="${P}">Do not allow activity counts to dominate the Results section.</p>`),
    N('', safe(data.reachImplementation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.2 Immediate Results</p>`),
    A(`<p style="${P}">Present documented immediate changes following the intervention, where applicable.</p>`),
    A(`<p style="${P}">Examples include changes in:</p>`),
    A(UL([
      'knowledge;','skills;','practices;','confidence;','organizational capacity;',
      'access;','productivity;','service delivery; or','institutional processes.'
    ])),
    N('', safe(data.immediateResults).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.3 Outcomes</p>`),
    A(`<p style="${P}">Present evidence of changes that occurred beyond immediate project outputs.</p>`),
    A(`<p style="${P}">Where possible, distinguish clearly among:</p>`),
    A(`<p style="${P_TIGHT}"><b>Output</b> – what the project produced</p>`),
    A(`<p style="${P_TIGHT}"><b>Immediate result</b> – what changed shortly after the intervention</p>`),
    A(`<p style="${P_TIGHT}"><b>Outcome</b> – meaningful change in practice, behavior, condition, performance, or institutional capacity</p>`),
    N('', safe(data.outcomes).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.4 Adoption, Utilization, Adaptation, or Continuation</p>`),
    A(`<p style="${P}">Where applicable, report evidence that project participants or partners:</p>`),
    A(UL([
      'used acquired knowledge or technologies;','adopted recommended practices;',
      'adapted an intervention to local circumstances;',
      'continued activities beyond project-supported delivery; or','replicated project practices.'
    ])),
    A(`<p style="${P}">Specify who adopted what, how many, to what extent, and based on what evidence whenever the data permit.</p>`),
    N('', safe(data.adoption).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.5 Institutionalization and Sustainability</p>`),
    A(`<p style="${P}">Present documented evidence of mechanisms such as:</p>`),
    A(UL([
      'partner policies;','local ordinances or resolutions;','budget allocations;',
      'integration into regular programs;','institutional structures;',
      'trained local implementers;','community management mechanisms;',
      'continuing partnerships;','locally generated resources; or',
      'other arrangements supporting continuation.'
    ])),
    N('', safe(data.institutionalization).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.6 Public Value and Broader Benefits</p>`),
    A(`<p style="${P}">Where supported by evidence, describe the project\'s contribution to community or institutional benefit.</p>`),
    A(`<p style="${P}">Possible areas include:</p>`),
    A(UL([
      'improved livelihood;','health or wellbeing;','educational improvement;',
      'strengthened institutional capacity;','increased resilience;',
      'improved environmental practices;','empowerment;',
      'improved service delivery; or','other documented public benefits.'
    ])),
    N('', safe(data.publicValue).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">Important Evidence Rule</p>`),
    A(`<p style="${P}color:#000;">Attendance sheets, photographs, certificates, and activity reports can verify that an activity occurred, but they should not by themselves be used as proof that an outcome, adoption, utilization, or impact occurred. This distinction is expressly reflected in PEMNet\'s conference requirements.</p>`),
    A(`<p style="${P}color:#000">Authors should not feel compelled to claim "impact." The conference guidelines specifically recognize that completed projects need not claim long-term impact when such evidence is unavailable.</p>`),
  );

  // ============================================================
  // 4. DISCUSSION
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">4. DISCUSSION</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">1,000–1,400 words</span></p>`),
    A(`<p style="${P}">This is essential if PEMNet wants these papers eventually to become publishable scholarly manuscripts.</p>`),
    A(`<p style="${P}">The Discussion should explain what the results mean, rather than repeat the Results section.</p>`),
    A(`<p style="${P}">Address the following as applicable.</p>`),

    A(`<p style="${H_SUB}">4.1 Interpretation of Major Findings</p>`),
    A(`<p style="${P}">Explain the most important findings.</p>`),
    A(`<p style="${P}">Why did the intervention appear to work—or not work?</p>`),
    A(`<p style="${P}">What conditions may explain the observed results?</p>`),
    N('', safe(data.interpretation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.2 Relationship to Previous Research and Extension Literature</p>`),
    A(`<p style="${P}">Compare the results with relevant published studies, extension literature, policies, frameworks, or previous interventions.</p>`),
    A(`<p style="${P}">Explain whether the results support, extend, differ from, or qualify what is already known.</p>`),
    N('', safe(data.relationshipLiterature).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.3 Factors Affecting Implementation and Outcomes</p>`),
    A(`<p style="${P}">Discuss important enabling or constraining factors, such as:</p>`),
    A(UL([
      'community participation;','leadership;','institutional support;',
      'local culture;','resources;','partnerships;','market conditions;',
      'environmental conditions;','policy context;','implementation fidelity; or',
      'other contextual factors.'
    ])),
    N('', safe(data.factorsAffecting).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.4 Inclusion, Sustainability, and Resilience</p>`),
    A(`<p style="${P}">Where applicable, interpret how the project addressed:</p>`),
    A(UL([
      'gender and social inclusion;','participation of vulnerable or underserved groups;',
      'sustainability;','resilience;','institutional ownership; and','local capacity.'
    ])),
    N('', safe(data.inclusionResilience).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.5 Transferability, Replication, or Scaling</p>`),
    A(`<p style="${P}">Discuss whether the intervention may reasonably be:</p>`),
    A(UL([
      'replicated;','adapted;','scaled;','institutionalized; or',
      'transferred to another context.'
    ])),
    A(`<p style="${P}">Do not automatically recommend scaling solely because participants were satisfied with the project.</p>`),
    N('', safe(data.transferability).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.6 Limitations</p>`),
    A(`<p style="${P}">Clearly acknowledge relevant limitations, including possible weaknesses in:</p>`),
    A(UL([
      'baseline information;','participant selection;','sample size;',
      'absence of a comparison group;','duration of follow-up;',
      'reliance on self-reported information;','missing data;',
      'measurement instruments;','attribution of outcomes; or',
      'other methodological constraints.'
    ])),
    A(`<p style="${P}">A credible limitations section strengthens, rather than weakens, a scholarly paper.</p>`),
    N('', safe(data.limitations).trim() || ANSWER_PH),
  );

  // ============================================================
  // 5. IMPLICATIONS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">5. IMPLICATIONS FOR EXTENSION PRACTICE AND POLICY</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">400–500 words</span></p>`),
    A(`<p style="${P}">Explain what extension managers, HEIs, practitioners, LGUs, partner institutions, policymakers, or other stakeholders can reasonably learn from the project.</p>`),
    A(`<p style="${P}">Possible implications may concern:</p>`),
    A(UL([
      'extension project design;','community engagement;','monitoring and evaluation;',
      'evidence generation;','institutional partnerships;','technology adoption;',
      'capability-building;','sustainability mechanisms;','quality assurance;',
      'policy development; or','scaling and replication.'
    ])),
    A(`<p style="${P}">Recommendations must arise from the evidence presented in the paper.</p>`),
    N('', safe(data.implications).trim() || ANSWER_PH),
  );

  // ============================================================
  // 6. CONCLUSION + BACK MATTER
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;text-transform:uppercase;">6. CONCLUSION</p>`),
    A(`<p style="${NOTE}">Recommended maximum: <span style="${NOTE_RED}">300–500 words</span></p>`),
    A(`<p style="${P}">Provide a concise synthesis of:</p>`),
    A(`<ol style="margin:0 0 6px 0;padding-left:24px;font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:${ACCENT};line-height:1.0;"><li>the development issue addressed;</li><li>the principal intervention;</li><li>the strongest documented results;</li><li>the significance of those results; and</li><li>the central implication for transformative extension.</li></ol>`),
    A(`<p style="${P}">Do not introduce new data or literature in the Conclusion.</p>`),
    A(`<p style="${P}">Avoid exaggerated claims such as "the project completely transformed the community" unless such a conclusion is genuinely supported by the evidence.</p>`),
    N('', safe(data.conclusion).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">ACKNOWLEDGMENTS</p>`),
    A(`<p style="${P}">Acknowledge institutions, communities, partners, funders, technical personnel, or individuals who contributed materially to the project but do not qualify for authorship.</p>`),
    A(`<p style="${P}">Do not use this section merely to list officials.</p>`),
    N('', safe(data.acknowledgments).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">FUNDING STATEMENT</p>`),
    A(`<p style="${P}">Example:</p>`),
    A(`<p style="${P}">This extension project was funded by [Institution/Agency] under [program/grant, if applicable].</p>`),
    A(`<p style="${P}">or</p>`),
    A(`<p style="${P}">The authors received no external funding for the implementation of this project.</p>`),
    N('', safe(data.funding).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">CONFLICT OF INTEREST</p>`),
    A(`<p style="${P}">Example: The authors declare no conflict of interest.</p>`),
    A(`<p style="${P}">Where a relevant conflict exists, it should be disclosed.</p>`),
    N('', safe(data.conflictOfInterest).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">ETHICS AND INFORMED CONSENT STATEMENT</p>`),
    A(`<p style="${P}">Where applicable: The project and associated data-gathering procedures were reviewed/approved by [appropriate body]. Informed consent was obtained from participants prior to data collection and/or use of identifiable photographs and testimonies.</p>`),
    A(`<p style="${P}">Adapt the statement according to what actually occurred. Authors should not claim ethical clearance that was not obtained.</p>`),
    N('', safe(data.ethicsStatement).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">DATA AVAILABILITY STATEMENT</p>`),
    A(`<p style="${P}">Where appropriate: The data supporting the findings of this paper are available from the corresponding author upon reasonable request, subject to applicable privacy, consent, institutional, and data-protection requirements.</p>`),
    N('', safe(data.dataAvailability).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">AUTHOR CONTRIBUTIONS</p>`),
    A(`<p style="${P}">For stronger publication readiness, PEMNet can encourage the CRediT-style contributor approach. Example:</p>`),
    A(`<div style="margin:0 0 10px 0;"><p style="${P_TIGHT}">Conceptualization: A.A., B.B.</p><p style="${P_TIGHT}">Project Implementation: A.A., B.B., C.C.</p><p style="${P_TIGHT}">Methodology: A.A., C.C.</p><p style="${P_TIGHT}">Data Collection: B.B., C.C.</p><p style="${P_TIGHT}">Data Analysis: A.A.</p><p style="${P_TIGHT}">Writing – Original Draft: A.A.</p><p style="${P_TIGHT}">Writing – Review and Editing: A.A., B.B., C.C.</p><p style="${P_TIGHT}">Project Administration: B.B.</p></div>`),
    A(`<p style="${P}">This can be optional for the conference version but is valuable for eventual journal submission.</p>`),
    N('', safe(data.authorContributions).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">REFERENCES</p>`),
    A(`<p style="${P}">Use APA 7th Edition consistently.</p>`),
    A(`<p style="${P}">Authors should prioritize:</p>`),
    A(UL([
      'peer-reviewed journal articles;','scholarly books;','government publications;',
      'official institutional reports;','authoritative technical publications; and',
      'other credible primary sources.'
    ])),
    A(`<p style="${P}">References appearing in the list must be cited in the manuscript, and all cited works must appear in the reference list.</p>`),
    A(`<p style="${P_TIGHT}"><b>Journal Article</b></p>`),
    A(`<p style="${P_TIGHT}">Author, A. A., &amp; Author, B. B. (Year). Title of article. <i>Journal Title</i>, <u>Volume</u>(Issue), xx–xx. DOI</p>`),
    A(`<p style="${P_TIGHT}margin-top:8px;"><b>Government/Institutional Report</b></p>`),
    A(`<p style="${P_TIGHT}">Institution. (Year). <i>Title of report</i>. Publisher/Institution. URL</p>`),
    A(`<p style="${P_TIGHT}margin-top:8px;"><b>Book</b></p>`),
    A(`<p style="${P_TIGHT}">Author, A. A. (Year). <i>Title of book</i>. Publisher.</p>`),
    N('', safe(data.references).trim() || 'Click or tap here and enter the complete APA 7th Edition reference list.'),

    A(`<p style="${H_SECTION}margin-top:16px;">APPENDICES</p>`),
    A(`<p style="${P}">Appendices are optional and should contain only evidence necessary for understanding or verifying the manuscript.</p>`),
    A(`<p style="${P}">Possible appendices include:</p>`),
    A(`<p style="${P_TIGHT}">Appendix A: Project Results Framework</p>`),
    A(`<p style="${P_TIGHT}">Appendix B: Major Monitoring Indicators</p>`),
    A(`<p style="${P_TIGHT}">Appendix C: Relevant Data Collection Instrument</p>`),
    A(`<p style="${P_TIGHT}">Appendix D: Additional Results Table</p>`),
    A(`<p style="${P_TIGHT}">Appendix E: Evidence of Institutionalization</p>`),
    A(`<p style="${P}">Do not turn the manuscript into a portfolio of certificates, attendance sheets, photographs, and administrative documents.</p>`),
    N('', safe(data.appendices).trim() || 'Click or tap here to insert or list only the appendices necessary for understanding or verifying the manuscript.'),

    A(`<p style="${P_TIGHT}">Table 1</p>`),
    A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.table1Title) || 'Baseline and Post-Intervention Status of Selected Indicators'}</p>`),
    A(`
      <table style="width:100%;border-collapse:collapse;margin:0 0 8px 0;">
        <thead>
          <tr>
            <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;">Indicator</th>
            <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;">Baseline</th>
            <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;">Endline/Follow-up</th>
            <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;">Change</th>
            <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px;text-align:left;">Source of Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${(Array.isArray(data.table1Rows) ? data.table1Rows : []).map((row) => {
            const cell = (v, ph) => v && String(v).trim()
              ? `<td style="border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;padding:6px 8px;">${String(v).replace(/[&<>"']/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</td>`
              : `<td style="border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:#94A3B8;font-style:italic;line-height:1.0;padding:6px 8px;">${ph}</td>`;
            return `<tr>
              ${cell(row.indicator, 'Indicator')}
              ${cell(row.baseline, '[Type here]')}
              ${cell(row.endline, '[Type here]')}
              ${cell(row.change, '[Type here]')}
              ${cell(row.source, '[Type here]')}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `),
    A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.table1Note) || 'Baseline and Post-Intervention Status of Selected Indicators. Note. Explain abbreviations or important qualifications.'}</p>`),
    A(`<p style="${P}">Every table must be discussed in the text.</p>`),
  );

    // Dynamic Figures from uploaded files
    if (Array.isArray(data.figures) && data.figures.length > 0) {
      data.figures.forEach((fig, idx) => {
        const figNum = idx + 1;
        push(
          A(`<p style="${P_TIGHT}margin-top:10px;">Figure ${figNum} <i>${safe(fig.title) || ''}</i></p>`),
          fig.dataUrl 
            ? A(`<div style="border:1px solid #94A3B8;background:#fff;padding:12px;margin:0 0 6px 0;text-align:center;"><img src="${fig.dataUrl}" alt="${safe(fig.title)}" style="max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`)
            : A(`<div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">[Image loading...]</div>`),
          A(`<p style="${P_TIGHT}font-style:italic;">${safe(fig.note) || ''}</p>`),
        );
      });
    } else {
      push(
        A(`<p style="${P_TIGHT}margin-top:10px;">Figure 1</p>`),
        A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.figure1Title) || 'Extension Project Results Pathway'}</p>`),
        A(`<div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">[Insert figure]</div>`),
        A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.figure1Note) || 'Note. Source or explanatory note, where necessary.'}</p>`),
      );
    }

  const concludingNotesHTML = `
    <div style="margin-top:30px;">
      <p style="${P}">Tables and figures should communicate evidence, not simply decorate the manuscript.</p>
      <p style="${P}">PEMNet's existing requirements similarly provide that tables and figures be properly numbered, labeled, explained in the text, and directly relevant to the claims being presented.</p>
      <p style="${P} margin-top:24px; font-weight:700;">NOTE: By submitting this manuscript, the author/s confirm their acceptance of the Author Consent and Limited Publication License stated earlier in this template.</p>
    </div>
  `;

  push(
    A_HEAD(concludingNotesHTML)
  );

  return blocks;
}

function buildBlocks({ data, BLUE, LIGHT, BORDER }) {
  const head = { kind: 'atomic', html: firstPageTitleHTML(BLUE, LIGHT, BORDER), forceNewPage: true };
  return [
    { kind: 'atomic', html: consentPageHTML(BLUE, LIGHT, BORDER), forceNewPage: true },
    { kind: 'atomic', html: titleAuthorPageHTML(data, BLUE, LIGHT, BORDER), forceNewPage: true },
    ...buildBodyBlocks(data, BLUE, LIGHT, BORDER),
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
  const [table1Title, setTable1Title] = useState('');
  const [table1Rows, setTable1Rows] = useState([
    { indicator: '', baseline: '', endline: '', change: '', source: '' },
    { indicator: '', baseline: '', endline: '', change: '', source: '' },
  ]);
  const [table1Note, setTable1Note] = useState('');
  const [figure1Title, setFigure1Title] = useState('');
  const [figure1Note, setFigure1Note] = useState('');
  const [figures, setFigures] = useState([]);
  const addTable1Row = () =>
    setTable1Rows((rows) => [...rows, { indicator: '', baseline: '', endline: '', change: '', source: '' }]);

  const removeTable1Row = (idx) =>
    setTable1Rows((rows) => rows.filter((_, i) => i !== idx));

  const updateTable1Row = (idx, field, value) =>
    setTable1Rows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
    const handleAddFigures = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per figure
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      files.forEach((file) => {
        if (!allowed.includes(file.type)) {
          onToast?.(`"${file.name}" is not a supported image type.`, 'error');
          return;
        }
        if (file.size > MAX_BYTES) {
          onToast?.(`"${file.name}" exceeds the 8 MB limit.`, 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setFigures((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title: '',
              note: '',
              dataUrl: String(reader.result),
              fileName: file.name,
              mimeType: file.type,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });

      // reset input so the same file can be re-added if removed
      e.target.value = '';
    };

    const removeFigure = (id) =>
      setFigures((prev) => prev.filter((f) => f.id !== id));

    const updateFigure = (id, field, value) =>
      setFigures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
      );

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
    setTable1Title('');
    setTable1Rows([
      { indicator: '', baseline: '', endline: '', change: '', source: '' },
      { indicator: '', baseline: '', endline: '', change: '', source: '' },
    ]);
    setTable1Note('');
    setFigure1Title('');
    setFigure1Note('');
    setFigures([]);

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

        // Section 1 — Introduction
        backgroundContext,
        evidenceNeed,
        relatedLiterature,
        rationale,
        objectives,

        // Section 2 — Materials and Methods
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

        // Section 3 — Results
        reachImplementation,
        immediateResults,
        outcomes,
        adoption,
        institutionalization,
        publicValue,

        // Section 4 — Discussion
        interpretation,
        relationshipLiterature,
        factorsAffecting,
        inclusionResilience,
        transferability,
        limitations,

        // Section 5 — Implications
        implications,

        // Section 6 + Back Matter
        conclusion,
        acknowledgments,
        funding,
        conflictOfInterest,
        ethicsStatement,
        dataAvailability,
        authorContributions,
        references,
        appendices,
        table1Title,
        table1Rows,
        table1Note,
        figure1Title,
        figure1Note,
        figures,
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

        // Section 1 — Introduction
        backgroundContext,
        evidenceNeed,
        relatedLiterature,
        rationale,
        objectives,

        // Section 2 — Materials and Methods
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

        // Section 3 — Results
        reachImplementation,
        immediateResults,
        outcomes,
        adoption,
        institutionalization,
        publicValue,

        // Section 4 — Discussion
        interpretation,
        relationshipLiterature,
        factorsAffecting,
        inclusionResilience,
        transferability,
        limitations,

        // Section 5 — Implications
        implications,

        // Section 6 + Back Matter
        conclusion,
        acknowledgments,
        funding,
        conflictOfInterest,
        ethicsStatement,
        dataAvailability,
        authorContributions,
        references,
        appendices,
        table1Title,
        table1Rows,
        table1Note,
        figure1Title,
        figure1Note,
        figures,
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

                    {/* ---- TABLE AND FIGURE FORMAT ---- */}
                    <div className="border-t border-slate-200 pt-5 mt-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                        Table and Figure Format
                      </h4>
                      <div className="space-y-4">

                        {/* ---------- Table 1 title ---------- */}
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                            Table 1 — Title
                          </label>
                          <input
                            type="text"
                            value={table1Title}
                            onChange={(e) => setTable1Title(e.target.value)}
                            placeholder="e.g., Baseline and Post-Intervention Status of Selected Indicators"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* ---------- Table 1 rows ---------- */}
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                            Table 1 — Rows
                          </label>
                          <p className="text-xs text-slate-500 mb-3">
                            Fill in the indicators and their baseline / endline values. Add or remove rows as needed.
                          </p>

                          {/* Column header row */}
                          <div className="hidden sm:grid sm:grid-cols-5 gap-2 mb-2 px-1">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Indicator</span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Baseline</span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Endline/Follow-up</span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Change</span>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Source of Evidence</span>
                          </div>

                          <div className="space-y-3">
                            {table1Rows.map((row, idx) => (
                              <div key={idx} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-2 sm:items-start pb-3 sm:pb-0 border-b border-slate-100 sm:border-0">

                                {/* Mobile labels + inputs */}
                                <div className="sm:hidden">
                                  <span className="text-xs font-semibold text-slate-500 mb-1 block">Indicator</span>
                                  <input
                                    type="text"
                                    value={row.indicator}
                                    onChange={(e) => updateTable1Row(idx, 'indicator', e.target.value)}
                                    placeholder="Indicator"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div className="sm:hidden">
                                  <span className="text-xs font-semibold text-slate-500 mb-1 block">Baseline</span>
                                  <input
                                    type="text"
                                    value={row.baseline}
                                    onChange={(e) => updateTable1Row(idx, 'baseline', e.target.value)}
                                    placeholder="Baseline"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div className="sm:hidden">
                                  <span className="text-xs font-semibold text-slate-500 mb-1 block">Endline/Follow-up</span>
                                  <input
                                    type="text"
                                    value={row.endline}
                                    onChange={(e) => updateTable1Row(idx, 'endline', e.target.value)}
                                    placeholder="Endline/Follow-up"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div className="sm:hidden">
                                  <span className="text-xs font-semibold text-slate-500 mb-1 block">Change</span>
                                  <input
                                    type="text"
                                    value={row.change}
                                    onChange={(e) => updateTable1Row(idx, 'change', e.target.value)}
                                    placeholder="Change"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div className="sm:hidden">
                                  <span className="text-xs font-semibold text-slate-500 mb-1 block">Source of Evidence</span>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={row.source}
                                      onChange={(e) => updateTable1Row(idx, 'source', e.target.value)}
                                      placeholder="Source of Evidence"
                                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                    />
                                    {table1Rows.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeTable1Row(idx)}
                                        className="px-2 text-slate-400 hover:text-red-500 transition"
                                        aria-label="Remove row"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Desktop inputs (5-column grid) */}
                                <input
                                  type="text"
                                  value={row.indicator}
                                  onChange={(e) => updateTable1Row(idx, 'indicator', e.target.value)}
                                  placeholder="Indicator"
                                  className="hidden sm:block px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={row.baseline}
                                  onChange={(e) => updateTable1Row(idx, 'baseline', e.target.value)}
                                  placeholder="Baseline"
                                  className="hidden sm:block px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={row.endline}
                                  onChange={(e) => updateTable1Row(idx, 'endline', e.target.value)}
                                  placeholder="Endline/Follow-up"
                                  className="hidden sm:block px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={row.change}
                                  onChange={(e) => updateTable1Row(idx, 'change', e.target.value)}
                                  placeholder="Change"
                                  className="hidden sm:block px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                />
                                <div className="hidden sm:flex gap-2">
                                  <input
                                    type="text"
                                    value={row.source}
                                    onChange={(e) => updateTable1Row(idx, 'source', e.target.value)}
                                    placeholder="Source of Evidence"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                  />
                                  {table1Rows.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTable1Row(idx)}
                                      className="px-2 text-slate-400 hover:text-red-500 transition"
                                      aria-label="Remove row"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={addTable1Row}
                            className="mt-3 px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition inline-flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add row
                          </button>
                        </div>

                        {/* ---------- Table 1 note ---------- */}
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                            Table 1 — Note
                          </label>
                          <textarea
                            value={table1Note}
                            onChange={(e) => setTable1Note(e.target.value)}
                            placeholder="e.g., Baseline and Post-Intervention Status of Selected Indicators. Note. Explain abbreviations or important qualifications."
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                          />
                        </div>

                        {/* ---------- Figures ---------- */}
                        <div className="border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <label className="text-sm font-semibold text-slate-700 block">
                                Figures
                              </label>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Attach one or more figure images. Each will be numbered sequentially (Figure 1, Figure 2, …).
                              </p>
                            </div>
                            <label className="cursor-pointer px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition inline-flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Add figure
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                multiple
                                className="hidden"
                                onChange={handleAddFigures}
                              />
                            </label>
                          </div>

                          {figures.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                              No figures attached yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {figures.map((fig, idx) => (
                                <div
                                  key={fig.id}
                                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <span className="text-sm font-bold text-slate-700">
                                      Figure {idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFigure(fig.id)}
                                      className="text-slate-400 hover:text-red-500 transition"
                                      aria-label="Remove figure"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Image preview */}
                                  <div className="border border-slate-200 rounded-lg bg-white p-2 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={fig.dataUrl}
                                      alt={fig.title || `Figure ${idx + 1}`}
                                      className="max-h-48 w-auto object-contain"
                                    />
                                  </div>

                                  {/* Title */}
                                  <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                      Figure {idx + 1} — Title
                                    </label>
                                    <input
                                      type="text"
                                      value={fig.title}
                                      onChange={(e) => updateFigure(fig.id, 'title', e.target.value)}
                                      placeholder="e.g., Extension Project Results Pathway"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                                    />
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                      Figure {idx + 1} — Description
                                    </label>
                                    <textarea
                                      value={fig.note}
                                      onChange={(e) => updateFigure(fig.id, 'note', e.target.value)}
                                      placeholder="e.g., Description. Source or explanatory sentences, where necessary."
                                      rows={2}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none resize-y"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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