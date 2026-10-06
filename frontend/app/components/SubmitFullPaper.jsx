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
        <p style="margin:0 0 8px 0;font-family:Arial;font-size:12pt;font-weight:700;color:#000;letter-spacing:0.3px;">
          PHILIPPINE EXTENSION MANAGERS NETWORK (PEMNet), INC.
        </p>
        <p style="margin:0;font-family:Arial;font-size:12pt;font-weight:700;color:#000;">
          1st NATIONAL EXTENSION CONFERENCE 2026
        </p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <p style="margin:0 0 4px 0;font-family:Arial;font-size:11pt;font-weight:700;color:#000;">
        Theme:
      </p>
      <p style="margin:0;font-family:Arial;font-size:11pt;font-style:italic;color:#000;line-height:1.4;">
        HEIs at the Forefront of Transformative Extension: Advancing Evidence-Based, Inclusive, Sustainable, and Resilient Community Development
      </p>
    </div>

    <p style="margin:0 0 16px 0;font-family:Arial;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;">
      COMPLETED EXTENSION PROJECT FULL PAPER TEMPLATE
    </p>

    <p style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;font-weight:700;color:#000;">
      General Manuscript Format
    </p>

    <div style="font-family:Arial;font-size:11pt;color:#000;line-height:1.5;margin-bottom:14px;">
      <p style="margin:0;"><span style="font-weight:700;">Length:</span> Approximately 3,000–7,000 words, excluding references and appendices</p>
      <p style="margin:0;"><span style="font-weight:700;">Font:</span> Arial, 11 points</p>
      <p style="margin:0;"><span style="font-weight:700;">Spacing:</span> Single</p>
      <p style="margin:0;"><span style="font-weight:700;">Margins:</span> 1 inch on all sides</p>
      <p style="margin:0;"><span style="font-weight:700;">Citation and Reference Style:</span> APA 7th Edition</p>
      <p style="margin:0;"><span style="font-weight:700;">File Format:</span> Microsoft Word (.docx)</p>
    </div>

    <p style="margin:0 0 20px 0;font-family:Arial;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">
      The manuscript should be written as a <span style="font-weight:700;">scholarly extension paper</span>, not merely as a chronological accomplishment report. It should demonstrate the relationship among the <span style="font-weight:700;">identified need, intervention, evidence, results, interpretation, and implications for extension practice.</span>
    </p>
  `;
}

function consentPageHTML(BLUE, LIGHT, BORDER) {
  const para = (html) =>
    `<p style="margin:0 0 12px 0;font-family:Arial;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">${html}</p>`;
  const li = (html) =>
    `<li style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;color:#000;line-height:1.5;text-align:justify;">${html}</li>`;

  return `
    <p style="margin:0 0 16px 0;font-family:Arial;font-size:11pt;color:#000;">Please read</p>

    <h2 style="margin:0 0 16px 0;font-family:Arial;font-size:13pt;font-weight:700;color:#000;text-align:center;text-transform:uppercase;letter-spacing:0.3px;">
      AUTHOR CONSENT AND LIMITED PUBLICATION LICENSE
    </h2>

    ${para(`By submitting a full paper to the <b>PEMNet 1st National Extension Conference 2026</b>, the author/s acknowledge and agree that the submitted manuscript may be received, stored, reviewed, evaluated, analyzed, and processed by the <b>Philippine Extension and Management Network, Inc. (PEMNet)</b> for purposes related to the conference, scholarly documentation, knowledge dissemination, research, and possible publication.`)}

    ${para(`The author/s grant PEMNet a <b>non-exclusive, royalty-free permission</b> to use the submitted manuscript, in whole or in part, for the following purposes:`)}

    <ol style="margin:0 0 14px 0;padding-left:26px;list-style-type:decimal;font-family:Arial;font-size:11pt;color:#000;line-height:1.5;">
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
  const filled = (text) => `<span style="color:${ACCENT};padding:8px 0">${text}</span>`;

  const fieldBox = (inner) =>
    `<div style="padding:8px 0;font-family:Arial;font-size:11pt;line-height:1.0;">
      <div style="border:1px solid ${BORDER};background:#F8FAFC;padding:8px 12px 20px;min-height:30px;white-space:pre-line;">${inner}</div>
    </div>`;

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
    ? filled(safe(data.thematicArea) || '')
    : placeholder(
        'Click or tap here and enter the selected thematic area full title.'
      );

  return `
    <div style="padding:6px 0 4px 0;">
      <p style="margin:0 0 14px 0;font-family:Arial;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;line-height:1.0;">
        TITLE OF THE PAPER
      </p>
      <div style="border:1px solid ${BORDER};padding:8px 12px 20px;margin:0 0 12px 0;font-family:Arial;font-size:11pt;line-height:1.0;color:${ACCENT};">
        ${titleHTML}
      </div>

      <p style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;font-weight:700;color:#000;text-transform:uppercase;line-height:1.0;">
        AUTHOR INFORMATION
      </p>
      ${fieldBox(authorsHTML)}
      ${fieldBox(affiliationsHTML)}

      <p style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;font-weight:700;color:${ACCENT};line-height:1.0;">
        Corresponding Author:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px 0;font-family:Arial;font-size:11pt;line-height:1.0;">
        <tbody>
          <tr>
            <td style="width:30%;padding:6px 0;color:${ACCENT};font-weight:700;">Name:</td>
            <td style="padding:4px 0;">
              <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;padding:8px 0">
                ${safe(data.correspondingName).trim() ? filled(safe(data.correspondingName)) : placeholder('Enter name')}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:${ACCENT};font-weight:700;">Email Address:</td>
            <td style="padding:4px 0;">
              <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;padding:8px 0">
                ${safe(data.correspondingEmail).trim() ? filled(safe(data.correspondingEmail)) : placeholder('Enter email address')}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:${ACCENT};font-weight:700;">ORCID:</td>
            <td style="padding:4px 0;">
              <div style="border-bottom:1px solid ${BORDER};min-height:22px;line-height:22px;padding:8px 0">
                ${safe(data.correspondingOrcid).trim() ? filled(safe(data.correspondingOrcid)) : placeholder('Enter ORCID, if available')}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;">
        <b>Paper Category:</b> ${safe(data.paperCategory)}
      </p>
      <p style="margin:0 0 6px 0;font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;">
        <b>Thematic Area:</b> ${safe(data.thematicArea)}
      </p>
    </div>
  `;
}

function buildBodyBlocks(data, BLUE, LIGHT, BORDER) {
  const safe = (v) => (v == null ? '' : String(v));
  const ACCENT = '#4472C4';

  const H_SECTION = `font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:11px 0 11px 0;`;
  const H_SUB     = `font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;margin:11px 0 11px 0;`;
  const P         = `font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 6px 0;text-align:justify;`;
  const P_TIGHT   = `font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;margin:10px 0 14px 0;`;
  const LI        = `font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;margin:0 0 2px 0;`;

  const ANSWER_PH = 'Click or tap here and replace this text with your response.';

  // ---- Bulleted list as one atomic block (it's fine if a whole list moves)
  const UL = (items, styleLI = LI) =>
    `<ul style="margin:0 0 6px 0;padding-left:22px;list-style-type:disc;">${items
      .map((t) => `<li style="${styleLI}">${t}</li>`)
      .join('')}</ul>`;

  const blocks = [];
  const push = (...b) => blocks.push(...b);

  push(
    A(`<style>ul>li::marker{color:#000;}ol>li::marker{color:#000;}</style>`),
    A(`<p style="${H_SECTION}text-transform:uppercase;">ABSTRACT</p>`),

    N('', safe(data.abstract).trim() || ANSWER_PH),
    A(`<p style="${P_TIGHT}"><b>Keywords:</b></p>`),
    N('', safe(data.keywords).trim() || ANSWER_PH),
  );

  // ============================================================
  // 1. INTRODUCTION
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">1. INTRODUCTION</p>`),

    A(`<p style="${H_SUB}">1.1 Background and Context</p>`),
    N('', safe(data.backgroundContext).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.2 Evidence of the Problem or Development Need</p>`),
    N('', safe(data.evidenceNeed).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.3 Related Literature and Extension Evidence</p>`),
    N('', safe(data.relatedLiterature).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.4 Rationale and Contribution of the Project</p>`),
    N('', safe(data.rationale).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">1.5 Objectives</p>`),
    N('', safe(data.objectives).trim() || ANSWER_PH),
  );

  // ============================================================
  // 2. MATERIALS AND METHODS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">2. MATERIALS AND METHODS / EXTENSION PROJECT METHODOLOGY</p>`),

    A(`<p style="${H_SUB}">2.1 Project Setting and Duration</p>`),
    N('', safe(data.settingDuration).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.2 Participants, Intended Users, or Beneficiaries</p>`),
    N('', safe(data.participantsDesc).trim() || ANSWER_PH),
    N('', safe(data.reachPopulation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.3 Situational Analysis and Baseline</p>`),
    N('', safe(data.situationalAnalysis).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.4 Project or Intervention Design</p>`),
    A(data.projectDesignImage?.previewUrl
      ? `<div style="margin:6px 0 14px 0;text-align:center;"><img src="${data.projectDesignImage.previewUrl}" alt="Project Design and Results Pathway" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`
      : `<div style="margin:6px 0 14px 0;text-align:center;"><img src="/images/project%20design.png" alt="Project Design and Results Pathway" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`),
    N('', safe(data.interventionRationale).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.5 Implementation Strategies</p>`),
    N('', safe(data.implementationStrategies).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.6 Partnership and Stakeholder Participation</p>`),
    N('', safe(data.partnership).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.7 Monitoring and Evaluation Design</p>`),
    N('', safe(data.monitoringEval).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.8 Data Analysis</p>`),
    N('', safe(data.dataAnalysis).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">2.9 Ethical Considerations</p>`),
    N('', safe(data.ethicalConsiderations).trim() || ANSWER_PH),
  );

  // ============================================================
  // 3. RESULTS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">3. RESULTS</p>`),

    A(`<p style="${H_SUB}">3.1 Project Reach and Implementation</p>`),
    N('', safe(data.reachImplementation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.2 Immediate Results</p>`),
    N('', safe(data.immediateResults).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.3 Outcomes</p>`),
    N('', safe(data.outcomes).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.4 Adoption, Utilization, Adaptation, or Continuation</p>`),
    N('', safe(data.adoption).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.5 Institutionalization and Sustainability</p>`),
    N('', safe(data.institutionalization).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">3.6 Public Value and Broader Benefits</p>`),
    N('', safe(data.publicValue).trim() || ANSWER_PH),
  );

  // ============================================================
  // 4. DISCUSSION
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">4. DISCUSSION</p>`),

    A(`<p style="${H_SUB}">4.1 Interpretation of Major Findings</p>`),
    N('', safe(data.interpretation).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.2 Relationship to Previous Research and Extension Literature</p>`),
    N('', safe(data.relationshipLiterature).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.3 Factors Affecting Implementation and Outcomes</p>`),
    N('', safe(data.factorsAffecting).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.4 Inclusion, Sustainability, and Resilience</p>`),
    N('', safe(data.inclusionResilience).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.5 Transferability, Replication, or Scaling</p>`),
    N('', safe(data.transferability).trim() || ANSWER_PH),

    A(`<p style="${H_SUB}">4.6 Limitations</p>`),
    N('', safe(data.limitations).trim() || ANSWER_PH),
  );

  // ============================================================
  // 5. IMPLICATIONS
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;">5. IMPLICATIONS FOR EXTENSION PRACTICE AND POLICY</p>`),
    N('', safe(data.implications).trim() || ANSWER_PH),
  );

  // ============================================================
  // 6. CONCLUSION + BACK MATTER
  // ============================================================
  push(
    A(`<p style="${H_SECTION}margin-top:16px;text-transform:uppercase;">6. CONCLUSION</p>`),
    N('', safe(data.conclusion).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">ACKNOWLEDGMENTS</p>`),
    N('', safe(data.acknowledgments).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">FUNDING STATEMENT</p>`),
    N('', safe(data.funding).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">CONFLICT OF INTEREST</p>`),
    N('', safe(data.conflictOfInterest).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">ETHICS AND INFORMED CONSENT STATEMENT</p>`),
    N('', safe(data.ethicsStatement).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">DATA AVAILABILITY STATEMENT</p>`),
    N('', safe(data.dataAvailability).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">AUTHOR CONTRIBUTIONS</p>`),
    N('', safe(data.authorContributions).trim() || ANSWER_PH),

    A(`<p style="${H_SECTION}margin-top:16px;">REFERENCES</p>`),
    N('', safe(data.references).trim() || 'Click or tap here and enter the complete APA 7th Edition reference list.'),

    A(`<p style="${H_SECTION}margin-top:16px;">APPENDICES</p>`),
    N('', safe(data.appendices).trim() || 'Click or tap here to insert or list only the appendices necessary for understanding or verifying the manuscript.'),
  );
  // ↑↑↑ push() closes here with its OWN );

  // ============================================================
  // DYNAMIC TABLES (top-level statement, NOT inside push)
  // ============================================================
  const tables = Array.isArray(data.tables) ? data.tables : [];

  if (tables.length === 0) {
    // Fallback: template placeholder
    push(
      A(`<p style="${P_TIGHT}">Table 1</p>`),
      A(`<p style="${P_TIGHT}font-style:italic;">Baseline and Post-Intervention Status of Selected Indicators</p>`),
      A(`<div style="border:1px dashed #94A3B8;background:#F8FAFC;padding:24px 12px;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">[No tables added]</div>`),
      A(`<p style="${P_TIGHT}font-style:italic;">Note. Explain abbreviations or important qualifications.</p>`),
    );
  } else {
    tables.forEach((table, tIdx) => {
      const tableNum = tIdx + 1;
      const rows = Array.isArray(table.rows) ? table.rows : [];

      const escapeCell = (v) =>
        String(v).replace(/[&<>"']/g, (c) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[c]));

      const cell = (v, ph) =>
        v && String(v).trim()
          ? `<td style="border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:${ACCENT};line-height:1.0;padding:6px 8px 15px;">${escapeCell(v)}</td>`
          : `<td style="border:1px solid #94A3B8;font-family:Arial;font-size:11pt;color:#94A3B8;font-style:italic;line-height:1.0;padding:6px 8px 15px;">${ph}</td>`;

      push(
        A(`<p style="${P_TIGHT}">Table ${tableNum}</p>`),
        A(`<p style="${P_TIGHT}font-style:italic;">${safe(table.title) || 'Title of the table'}</p>`),
        A(`
          <table style="width:100%;border-collapse:collapse;margin:0 0 8px 0;">
            <thead>
              <tr>
                <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px 15px;text-align:left;">Indicator</th>
                <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px 15px;text-align:left;">Baseline</th>
                <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px 15px;text-align:left;">Endline/Follow-up</th>
                <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px 15px;text-align:left;">Change</th>
                <th style="border:1px solid #94A3B8;background:#F1F5F9;font-family:Arial;font-size:11pt;font-weight:700;color:#000;line-height:1.0;padding:6px 8px 15px;text-align:left;">Source of Evidence</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>
                ${cell(row.indicator, 'Indicator')}
                ${cell(row.baseline, '[Type here]')}
                ${cell(row.endline, '[Type here]')}
                ${cell(row.change, '[Type here]')}
                ${cell(row.source, '[Type here]')}
              </tr>`).join('')}
            </tbody>
          </table>
        `),
        A(`<p style="${P_TIGHT}font-style:italic;">${safe(table.note) || ''}</p>`),
      );
    });
  }
  // ↑↑↑ if/else closes here — NO stray ); after the closing }

  // ============================================================
  // DYNAMIC FIGURES (top-level statement)
  // ============================================================
  if (Array.isArray(data.figures) && data.figures.length > 0) {
    data.figures.forEach((fig, idx) => {
      const figNum = idx + 1;
      push(
        A(`<p style="${P_TIGHT}margin-top:10px;">Figure ${figNum} <i>${safe(fig.title) || ''}</i></p>`),
        fig.previewUrl
          ? A(`<div style="border:1px solid #94A3B8;background:#fff;padding:12px;margin:0 0 6px 0;text-align:center;"><img src="${fig.previewUrl}" alt="${safe(fig.title)}" style="max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`)
          : A(`<div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">[Image loading...]</div>`),
        A(`<p style="${P_TIGHT}font-style:italic;">${safe(fig.note) || ''}</p>`),
      );
    });
  } else {
    push(
      A(`<p style="${P_TIGHT}margin-top:10px;">Figure 1</p>`),
      A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.figure1Title) || 'Extension Project Results Pathway'}</p>`),
      A(`<div style="border:1px solid #94A3B8;background:#F8FAFC;padding:24px 12px;margin:0 0 6px 0;padding:15px 0 25px 0;text-align:center;font-family:Arial;font-size:11pt;font-style:italic;color:#94A3B8;line-height:1.0;">[Insert figure]</div>`),
      A(`<p style="${P_TIGHT}font-style:italic;">${safe(data.figure1Note) || 'Note. Source or explanatory note, where necessary.'}</p>`),
    );
  }

  // ============================================================
  // CONCLUDING NOTES
  // ============================================================
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

  // Create off-screen host for rendering preview
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
    // Render preview synchronously
    flushSync(() => {
      root.render(<FullPaperPreview data={previewData} />);
    });

    // Wait for A4 sheets to mount
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

    // Wait for all fonts to load
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }

    // Extra buffer for layout stabilization
    await new Promise((r) => setTimeout(r, 200));

    // Ensure ALL images are fully loaded before capture
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

    // Capture as PNG for lossless fidelity and universal compatibility
    return await captureA4SheetsAsPDF({
      selector: '.a4-sheet',
      root: host,
      scale: 2,
      imageFormat: 'png',       // Force PNG instead of default/WebP
      onStatus: () => {},
    });
  } finally {
    // Cleanup
    try {
      root.unmount();
    } catch {
      /* ignore */
    }
    if (host.parentNode) host.parentNode.removeChild(host);
  }
}


function GuidanceBlock({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-blue-800 hover:bg-blue-100/60 transition"
      >
        <span className="inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          {open ? 'Hide guidelines' : 'Show writing guidelines'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0.5 text-xs leading-relaxed space-y-1.5 border-t border-blue-100 bg-white/60" style={{ color: '#4472C4' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function countWords(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function WordCounter({ text, min = 0, max, warnAt = 0.9 }) {
  const count = countWords(text);
  const isUnder = typeof min === 'number' && min > 0 && count < min;
  const isOver = typeof max === 'number' && count > max;
  const isNearMax =
    !isUnder && !isOver && typeof max === 'number' && count >= Math.floor(max * warnAt);

  // Priority: over > under > near-max > ok
  let color = 'text-emerald-600';   // satisfied range
  let suffix = '';

  if (isOver) {
    color = 'text-red-600';
    suffix = ' — over maximum';
  } else if (isUnder) {
    color = 'text-amber-600';
    suffix = ` — ${min - count} more to reach minimum`;
  } else if (isNearMax) {
    color = 'text-amber-600';
    suffix = '';
  }

  const rangeLabel =
    typeof min === 'number' && min > 0 && typeof max === 'number'
      ? `${min}–${max}`
      : typeof max === 'number'
        ? `0–${max}`
        : '';

  return (
    <span className={`text-xs font-semibold tabular-nums ${color}`}>
      {count} / {rangeLabel} words{suffix}
    </span>
  );
}

function FieldLabel({ children, text, min, max }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-1.5">
      <label className="text-sm font-semibold text-slate-700 block">
        {children}
      </label>
      {(typeof min === 'number' && min > 0) || typeof max === 'number' ? (
        <WordCounter text={text} min={min} max={max} />
      ) : null}
    </div>
  );
}

function validateAPAReference(line) {
  const trimmed = line.trim();
  if (!trimmed) return { valid: true }; // Skip empty lines

  // ---------- Mandatory element checks (structural, not regex-strict) ----------

  // 1) Must contain a 4-digit year in parentheses
  const yearMatch = trimmed.match(/\((\d{4}[a-z]?)\)/);
  if (!yearMatch) {
    return {
      valid: false,
      message: 'Missing publication year in parentheses, e.g., (2024).',
    };
  }

  const yearIndex = yearMatch.index;
  const beforeYear = trimmed.slice(0, yearIndex).trim();
  const afterYear = trimmed.slice(yearIndex + yearMatch[0].length).trim();

  // 2) Something must come before the year (authors OR institution)
  if (!beforeYear) {
    return {
      valid: false,
      message: 'Missing author(s) or institution name before the year.',
    };
  }

  // 3) Something must come after the year (title, then source)
  if (!afterYear) {
    return {
      valid: false,
      message: 'Missing title and source after the year. Format: (Year). Title. Source.',
    };
  }

  // 4) The part after the year must contain at least one period —
  const afterYearNoTrailingDot = afterYear.replace(/[.\s]+$/, '');
  if (!afterYearNoTrailingDot.includes('.')) {
    return {
      valid: false,
      message: 'Missing source after the title. Format: (Year). Title. Source.',
    };
  }

  // 5) Reference must end with a period
  if (!/[.]$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Reference must end with a period.',
    };
  }

  // 6) URL-only lines are a common mistake
  if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
    return {
      valid: false,
      message: 'URL should appear at the END of the reference, not the beginning.',
    };
  }

  return { valid: true };
}

export default function SubmitFullPaper({
  user,
  submissions = [],
  onSubmitted,
  onBack,
  onToast,
  initialSubmission = null, 
  existingFullPaper = null, 
}) {
  const isResubmit = Boolean(existingFullPaper || initialSubmission);
  const [submissionId, setSubmissionId] = useState('');
  const [title, setTitle] = useState('');
  const [authorsList, setAuthorsList] = useState([
    { name: '', affiliation: '' },
  ]);
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [correspondingName, setCorrespondingName] = useState('');
  const [correspondingEmail, setCorrespondingEmail] = useState('');
  const [correspondingOrcid, setCorrespondingOrcid] = useState('');
  const [paperCategory, setPaperCategory] = useState('');
  const [thematicArea, setThematicArea] = useState('');

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
  const [projectDesignImage, setProjectDesignImage] = useState(null);
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
  const makeEmptyTable = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    note: '',
    rows: [
      { indicator: '', baseline: '', endline: '', change: '', source: '' },
      { indicator: '', baseline: '', endline: '', change: '', source: '' },
    ],
  });

  const [tables, setTables] = useState(() => [makeEmptyTable()]);
  const [figure1Title, setFigure1Title] = useState('');
  const [figure1Note, setFigure1Note] = useState('');
  const [figures, setFigures] = useState([]);
  const addAuthor = () =>
    setAuthorsList((list) => [...list, { name: '', affiliation: '' }]);

  const removeAuthor = (idx) =>
    setAuthorsList((list) => list.filter((_, i) => i !== idx));

  const updateAuthor = (idx, field, value) =>
    setAuthorsList((list) =>
      list.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
    
  const addTable = () =>
    setTables((prev) => [...prev, makeEmptyTable()]);

  const removeTable = (tableId) =>
    setTables((prev) => prev.filter((t) => t.id !== tableId));

  const updateTableField = (tableId, field, value) =>
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, [field]: value } : t))
    );

  const addTableRow = (tableId) =>
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              rows: [
                ...t.rows,
                { indicator: '', baseline: '', endline: '', change: '', source: '' },
              ],
            }
          : t
      )
    );

  const removeTableRow = (tableId, rowIdx) =>
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, rows: t.rows.filter((_, i) => i !== rowIdx) }
          : t
      )
    );

  const updateTableRow = (tableId, rowIdx, field, value) =>
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              rows: t.rows.map((r, i) =>
                i === rowIdx ? { ...r, [field]: value } : r
              ),
            }
          : t
      )
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
      const previewUrl = URL.createObjectURL(file); // local preview only
      setFigures((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: '',
          note: '',
          file,           // ← raw File, sent to backend
          previewUrl,     // ← object URL for <img src>
          fileName: file.name,
          mimeType: file.type,
        },
      ]);
    });

    // reset input so the same file can be re-added if removed
    e.target.value = '';
  };

  const handleAddProjectDesign = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!allowed.includes(file.type)) {
      onToast?.(`"${file.name}" is not a supported image type.`, 'error');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      onToast?.(`"${file.name}" exceeds the 8 MB limit.`, 'error');
      e.target.value = '';
      return;
    }

    setProjectDesignImage({
      file,                                   // ← raw File
      previewUrl: URL.createObjectURL(file),  // ← local preview only
      fileName: file.name,
      mimeType: file.type,
    });
    e.target.value = '';
  };

  const removeProjectDesign = () => {
    if (projectDesignImage?.previewUrl) {
      URL.revokeObjectURL(projectDesignImage.previewUrl);
    }
    setProjectDesignImage(null);
  };

  const removeFigure = (id) =>
    setFigures((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });

  const updateFigure = (id, field, value) =>
    setFigures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const acceptedSubmissions = submissions.filter((s) => s.status === 'endorse');

  // Auto-fill fields when a linked abstract is selected
  React.useEffect(() => {
    if (!submissionId) return;
    const linked = acceptedSubmissions.find(
      (s) => s.submission_id === submissionId
    );
    if (!linked) return;

    // ---------- Title & keywords ----------
    setTitle((prev) => prev || linked.extension_project_title || '');
    setKeywords((prev) => prev || linked.keywords || '');

    // ---------- Corresponding author ----------
    setCorrespondingName(
      (prev) => prev || linked.corresponding_author_name || ''
    );
    setCorrespondingEmail(
      (prev) => prev || linked.corresponding_author_email || ''
    );

    if (linked.paper_category) {
      const normalized = String(linked.paper_category)
        .trim()
        .replace(/Papers$/i, 'Paper');
      setPaperCategory((prev) => prev || normalized);
    }

    if (linked.thematic_area) {
      const ta = String(linked.thematic_area).trim();
      const match = THEMATIC_AREAS.find(
        (area) => area.toLowerCase() === ta.toLowerCase()
      );
      setThematicArea((prev) => prev || (match || ta));
    }

    setAuthorsList((prev) => {
      const hasAnyName = prev.some((a) => a?.name?.trim());
      if (hasAnyName) return prev;

      const newList = [];

      // 1) Project leader (primary author)
      if (linked.project_leader && linked.project_leader.trim()) {
        newList.push({
          name: linked.project_leader.trim(),
          // Try to extract affiliation from suc_agencies if it looks usable
          affiliation: (linked.suc_agencies || '').trim(),
        });
      }

      if (
        linked.presenter &&
        linked.presenter.trim() &&
        linked.presenter.trim() !== (linked.project_leader || '').trim()
      ) {
        newList.push({
          name: linked.presenter.trim(),
          affiliation: (linked.suc_agencies || '').trim(),
        });
      }

      if (linked.co_authors && String(linked.co_authors).trim()) {
        const parts = String(linked.co_authors)
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean);
        parts.forEach((name) => {
          newList.push({
            name,
            affiliation: (linked.suc_agencies || '').trim(),
          });
        });
      }

      return newList.length > 0
        ? newList
        : [{ name: '', affiliation: '' }];
    });

  }, [submissionId]);

  React.useEffect(() => {
    if (!existingFullPaper && !initialSubmission) return;

    const fp = existingFullPaper || {};

    // ---------- Linked abstract ----------
    const sid =
      fp.submission_id ||
      initialSubmission?.submission_id ||
      initialSubmission?.id ||
      '';
    if (sid) setSubmissionId(String(sid));

    // ---------- Core metadata ----------
    setTitle(fp.title || initialSubmission?.extension_project_title || '');
    setKeywords(fp.keywords || initialSubmission?.keywords || '');
    setAbstract(fp.abstract || '');
    setCorrespondingName(
      fp.corresponding_name ||
      initialSubmission?.corresponding_author_name ||
      ''
    );
    setCorrespondingEmail(
      fp.corresponding_email ||
      initialSubmission?.corresponding_author_email ||
      ''
    );
    setCorrespondingOrcid(fp.corresponding_orcid || '');
    setPaperCategory(fp.paper_category || initialSubmission?.paper_category || '');
    setThematicArea(fp.thematic_area || initialSubmission?.thematic_area || '');

    // ---------- Author list ----------
    if (fp.authors) {
      const raw = String(fp.authors);
      const parts = raw
        .split(/,\s*(?=[A-Z])|(?=[¹²³⁴⁵⁶⁷⁸⁹])/)
        .map((s) => s.replace(/[¹²³⁴⁵⁶⁷⁸⁹\s]+$/g, '').trim())
        .filter(Boolean);

      const affLines = String(fp.affiliations || '')
        .split('\n')
        .map((l) => l.replace(/^[¹²³⁴⁵⁶⁷⁸⁹]\s*/, '').trim());

      const list = parts.map((name, i) => ({
        name,
        affiliation: affLines[i] || affLines[0] || '',
      }));

      setAuthorsList(list.length ? list : [{ name: '', affiliation: '' }]);
    } else if (initialSubmission) {
      const fallback = [];
      if (initialSubmission.project_leader) {
        fallback.push({
          name: initialSubmission.project_leader,
          affiliation: initialSubmission.suc_agencies || '',
        });
      }
      if (
        initialSubmission.presenter &&
        initialSubmission.presenter !== initialSubmission.project_leader
      ) {
        fallback.push({
          name: initialSubmission.presenter,
          affiliation: initialSubmission.suc_agencies || '',
        });
      }
      if (initialSubmission.co_authors) {
        String(initialSubmission.co_authors)
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((name) =>
            fallback.push({
              name,
              affiliation: initialSubmission.suc_agencies || '',
            })
          );
      }
      setAuthorsList(fallback.length ? fallback : [{ name: '', affiliation: '' }]);
    }

    // ---------- Section 1 ----------
    setBackgroundContext(fp.background_context || '');
    setEvidenceNeed(fp.evidence_need || '');
    setRelatedLiterature(fp.related_literature || '');
    setRationale(fp.rationale || '');
    setObjectives(fp.objectives || '');

    // ---------- Section 2 ----------
    setReachPopulation(fp.reach_population || '');
    setSettingDuration(fp.setting_duration || '');
    setParticipantsDesc(fp.participants_desc || '');
    setSituationalAnalysis(fp.situational_analysis || '');
    setInterventionRationale(fp.intervention_rationale || '');
    setImplementationStrategies(fp.implementation_strategies || '');
    setPartnership(fp.partnership || '');
    setMonitoringEval(fp.monitoring_eval || '');
    setDataAnalysis(fp.data_analysis || '');
    setEthicalConsiderations(fp.ethical_considerations || '');

    // ---------- Section 3 ----------
    setReachImplementation(fp.reach_implementation || '');
    setImmediateResults(fp.immediate_results || '');
    setOutcomes(fp.outcomes || '');
    setAdoption(fp.adoption || '');
    setInstitutionalization(fp.institutionalization || '');
    setPublicValue(fp.public_value || '');

    // ---------- Section 4 ----------
    setInterpretation(fp.interpretation || '');
    setRelationshipLiterature(fp.relationship_literature || '');
    setFactorsAffecting(fp.factors_affecting || '');
    setInclusionResilience(fp.inclusion_resilience || '');
    setTransferability(fp.transferability || '');
    setLimitations(fp.limitations || '');

    // ---------- Section 5 ----------
    setImplications(fp.implications || '');

    // ---------- Section 6 + back matter ----------
    setConclusion(fp.conclusion || '');
    setAcknowledgments(fp.acknowledgments || '');
    setFunding(fp.funding || '');
    setConflictOfInterest(fp.conflict_of_interest || '');
    setEthicsStatement(fp.ethics_statement || '');
    setDataAvailability(fp.data_availability || '');
    setAuthorContributions(fp.author_contributions || '');
    setReferences(fp.references || '');
    setAppendices(fp.appendices || '');

    // ---------- Tables ----------
    if (Array.isArray(fp.tables) && fp.tables.length > 0) {
      setTables(
        fp.tables.map((t, i) => ({
          id: `${Date.now()}-${i}`,
          title: t.title || '',
          note: t.note || '',
          rows:
            Array.isArray(t.rows) && t.rows.length > 0
              ? t.rows.map((r) => ({
                  indicator: r.indicator || '',
                  baseline: r.baseline || '',
                  endline: r.endline || '',
                  change: r.change || '',
                  source: r.source || '',
                }))
              : [
                  { indicator: '', baseline: '', endline: '', change: '', source: '' },
                  { indicator: '', baseline: '', endline: '', change: '', source: '' },
                ],
        }))
      );
    }

    // ---------- Legacy figure 1 metadata ----------
    setFigure1Title(fp.figure1_title || '');
    setFigure1Note(fp.figure1_note || '');

    // ---------- Existing figures ----------
    if (Array.isArray(fp.figures) && fp.figures.length > 0) {
      setFigures(
        fp.figures.map((fig, i) => ({
          id: `${Date.now()}-${i}`,
          title: fig.title || '',
          note: fig.note || '',
          file: null,
          previewUrl: fig.view_url || fig.download_url || null,
          fileName: fig.original_filename || `figure_${i + 1}`,
          mimeType: fig.mime_type || 'image/png',
          isExisting: true,
          existingFileId: fig.drive_file_id || null,
        }))
      );
    }

    // ---------- Existing project design ----------
    if (
      fp.project_design &&
      (fp.project_design.view_url || fp.project_design.drive_file_id)
    ) {
      setProjectDesignImage({
        file: null,
        previewUrl: fp.project_design.view_url || null,
        fileName: fp.project_design.original_filename || 'project_design.png',
        mimeType: fp.project_design.mime_type || 'image/png',
        isExisting: true,
        existingFileId: fp.project_design.drive_file_id || null,
      });
    }
  }, [existingFullPaper, initialSubmission]);

  const resetForm = () => {
    setSubmissionId('');
    setTitle('');
    setAuthorsList([{ name: '', affiliation: '' }]);
    setKeywords('');
    setAbstract('');
    setCorrespondingName('');
    setCorrespondingEmail('');
    setCorrespondingOrcid('');
    setPaperCategory('');
    setThematicArea('');

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
    setProjectDesignImage(null);
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
    setTables([makeEmptyTable()]);
    setFigure1Title('');
    setFigure1Note('');
    figures.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFigures([]);
    if (projectDesignImage?.previewUrl) {
      URL.revokeObjectURL(projectDesignImage.previewUrl);
    }

    setError('');
  };

  const validate = () => {
    if (!submissionId) return 'Please select the linked accepted abstract.';
    if (!title.trim()) return 'Full paper title is required.';
    const validAuthors = authorsList.filter((a) => a.name.trim());
    if (validAuthors.length === 0) return 'At least one author is required.';
    if (validAuthors.some((a) => !a.affiliation.trim()))
      return 'Each author must have an affiliation.';
    if (!keywords.trim()) return 'Keywords are required.';
    if (!correspondingName.trim())
      return 'Corresponding author name is required.';
    if (!correspondingEmail.trim())
      return 'Corresponding author email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correspondingEmail))
      return 'Please enter a valid email address.';
    if (!thematicArea) return 'Please select a thematic area.';
    return null;
  };

  const SUPERSCRIPTS = ['¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','¹⁰'];
  const sup = (n) => SUPERSCRIPTS[n - 1] || `^${n}`;

  const buildAuthorsString = (list) =>
    list
      .filter((a) => a.name.trim())
      .map((a, idx) => `${a.name.trim()}${sup(idx + 1)}`)
      .join(', ');

  const buildAffiliationsString = (list) =>
    list
      .filter((a) => a.affiliation.trim())
      .map((a, idx) => `${sup(idx + 1)}${a.affiliation.trim()}`)
      .join('\n');

  const authors = buildAuthorsString(authorsList);
  const affiliations = buildAffiliationsString(authorsList);

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
        (s) => s.submission_id === submissionId
      );

      const previewData = {
        linked_abstract_title:
          acceptedSubmissions.find((s) => s.submission_id === submissionId)
            ?.extension_project_title || '',
        title,
        authors,
        affiliations,
        keywords,
        abstract,
        correspondingName,
        correspondingEmail,
        correspondingOrcid,
        paperCategory,
        thematicArea,

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
        projectDesignImage: projectDesignImage
          ? { previewUrl: projectDesignImage.previewUrl }
          : null,
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
        tables: tables.map((t) => ({
          title: t.title,
          note: t.note,
          rows: t.rows,
        })),
        figure1Title,
        figure1Note,
        figures: figures.map((f) => ({
          title: f.title,
          note: f.note,
          previewUrl: f.previewUrl,   // for live preview only
        })),
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
      fd.append('user_id', String(userData.id));
      fd.append('submission_id', String(submissionId));
      fd.append('full_paper_title', title);
      fd.append('full_paper_authors', authors);
      fd.append('full_paper_affiliations', affiliations);
      fd.append('full_paper_keywords', keywords);
      fd.append('full_paper_abstract', abstract);
      fd.append('full_paper_corresponding_name', correspondingName);
      fd.append('full_paper_corresponding_email', correspondingEmail);
      fd.append('full_paper_corresponding_orcid', correspondingOrcid);
      fd.append('full_paper_category', paperCategory);
      fd.append('full_paper_thematic_area', thematicArea);

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

      // Tables
      fd.append(
        'full_paper_tables',
        JSON.stringify(
          tables.map((t, i) => ({
            title: t.title || '',
            note: t.note || '',
            rows: t.rows || [],
            display_order: i,
          }))
        )
      );
      fd.append('full_paper_figure1_title', figure1Title || '');
      fd.append('full_paper_figure1_note', figure1Note || '');

      // Figures — send metadata as JSON + each image as a separate file
      fd.append(
        'full_paper_figures_meta',
        JSON.stringify(
          figures.map((f, i) => ({
            title: f.title || '',
            note: f.note || '',
            original_filename: f.fileName || '',
            mime_type: f.mimeType || '',
            display_order: i,
            keep_existing_id: f.isExisting ? f.existingFileId : '',
          }))
        )
      );
      figures.forEach((f, i) => {
        if (f.file) {
          fd.append(`full_paper_figure_${i}`, f.file, f.fileName || `figure_${i}.png`);
        }
      });

      // Project design image
      if (projectDesignImage?.file) {
        fd.append(
          'full_paper_project_design_meta',
          JSON.stringify({
            original_filename: projectDesignImage.fileName || '',
            mime_type: projectDesignImage.mimeType || '',
          })
        );
        fd.append(
          'full_paper_project_design',
          projectDesignImage.file,
          projectDesignImage.fileName || 'project_design.png'
        );
      } else if (projectDesignImage?.isExisting && projectDesignImage.existingFileId) {
        fd.append(
          'full_paper_project_design_meta',
          JSON.stringify({
            original_filename: projectDesignImage.fileName || '',
            mime_type: projectDesignImage.mimeType || '',
            keep_existing_id: projectDesignImage.existingFileId,
          })
        );
      }

      const baseName = `full_paper_${title
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 60)}`;
      fd.append('full_paper_file', previewBlob, `${baseName}.pdf`);
      fd.append('full_paper_preview_file', previewBlob, `preview_${baseName}.pdf`);

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

  /* ---------------- Preview data (component scope) ---------------- */
  const previewData = {
    linked_abstract_title:
      acceptedSubmissions.find((s) => s.submission_id === submissionId)
        ?.extension_project_title || '',
    title,
    authors,
    affiliations,
    keywords,
    abstract,
    correspondingName,
    correspondingEmail,
    correspondingOrcid,
    paperCategory,
    thematicArea,

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
    projectDesignImage: projectDesignImage
      ? { previewUrl: projectDesignImage.previewUrl }
      : null,
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
    tables: tables.map((t) => ({
      title: t.title,
      note: t.note,
      rows: t.rows,
    })),
    figure1Title,
    figure1Note,
    figures: figures.map((f) => ({
      title: f.title,
      note: f.note,
      previewUrl: f.previewUrl,   // for live preview only
    })),
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
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
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition inline-flex items-center gap-2"
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
                {isResubmit ? 'Resubmit Full Paper' : 'Submit Full Paper'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {isResubmit ? 'Update your existing full paper submission.' : 'Complete the full paper using the provided scholarly template below. No separate file upload is required.'}
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
              <div className="sticky top-0 z-20 bg-linear-to-r from-blue-700 to-blue-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="text-white">
                  <h2 className="text-lg font-bold">Full Paper Submission Template</h2>
                  <p className="text-xs text-blue-100">
                    1<sup>st</sup> PEMNet National Extension Conference 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 text-sm font-semibold text-blue-800 bg-white hover:bg-blue-50 rounded-xl transition inline-flex items-center gap-2"
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
                  <GuidanceBlock>
                    <p>Select which of your accepted abstracts this full paper belongs to. The title, keywords, and author information from that abstract will be auto-filled where possible.</p>
                  </GuidanceBlock>
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">— Select an accepted abstract —</option>
                      {acceptedSubmissions.map((s) => (
                        <option key={s.id} value={s.submission_id}>
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
                  <GuidanceBlock>
                    <p className="font-semibold">The title should communicate the central intervention or extension issue, major outcome or focus, and context where appropriate. Avoid titles consisting only of the institutional project name or acronym.</p>
                    <p className="italic">Example structure: <b>Implementation and Outcomes of a Community-Based Natural Farming Extension Program among Smallholder Farmers in [Location]</b></p>
                    <p className="italic">rather than: <b>Project UMWAD: An Extension Program</b></p>
                  </GuidanceBlock>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a concise, informative, and scholarly title"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* ============ Author Information ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Author/s &amp; Affiliations <span className="text-red-500">*</span>
                  </label>
                  <GuidanceBlock>
                    <p>Add each author in order. The number is assigned automatically and is used as their superscript in the paper.</p>
                    <p className="font-semibold">Example: <b>Juan Dela Cruz<sup>1</sup></b> — <i>¹Department of Agriculture, University of the Philippines Los Baños, Laguna, Philippines</i></p>
                    <p>If two authors share the same affiliation, repeat the affiliation text — the number stays unique per author.</p>
                  </GuidanceBlock>

                  <div className="space-y-4">
                    {authorsList.map((author, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700">
                            Author {idx + 1}
                          </span>
                          {authorsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAuthor(idx)}
                              className="text-slate-400 hover:text-red-500 transition"
                              aria-label={`Remove author ${idx + 1}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            Author {idx + 1} — Full Name
                          </label>
                          <input
                            type="text"
                            value={author.name}
                            onChange={(e) => updateAuthor(idx, 'name', e.target.value)}
                            placeholder="e.g., Juan Dela Cruz"
                            className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            Author {idx + 1} — Affiliation
                          </label>
                          <input
                            type="text"
                            value={author.affiliation}
                            onChange={(e) => updateAuthor(idx, 'affiliation', e.target.value)}
                            placeholder="e.g., Department of Agriculture, University of the Philippines Los Baños, Laguna, Philippines"
                            className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addAuthor}
                    className="mt-3 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add author
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Corresponding Author Name <span className="text-red-500">*</span>
                    </label>
                    <GuidanceBlock>
                      <p>Enter the full name of the author who will handle correspondence.</p>
                    </GuidanceBlock>
                    <input
                      type="text"
                      value={correspondingName}
                      onChange={(e) => setCorrespondingName(e.target.value)}
                      placeholder="e.g., Juan Dela Cruz"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Corresponding Author Email <span className="text-red-500">*</span>
                    </label>
                    <GuidanceBlock>
                      <p>Enter a valid institutional or personal email address.</p>
                    </GuidanceBlock>
                    <input
                      type="email"
                      value={correspondingEmail}
                      onChange={(e) => setCorrespondingEmail(e.target.value)}
                      placeholder="e.g., juan@university.edu.ph"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Corresponding Author ORCID{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <GuidanceBlock>
                    <p>Enter your ORCID iD if available (e.g., 0000-0002-1825-0097).</p>
                  </GuidanceBlock>
                  <input
                    type="text"
                    value={correspondingOrcid}
                    onChange={(e) => setCorrespondingOrcid(e.target.value)}
                    placeholder="e.g., 0000-0002-1825-0097"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* ============ Paper Category ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Paper Category <span className="text-red-500">*</span>
                  </label>
                  <GuidanceBlock>
                    <p>Select the category that best describes the status of your extension project at the time of submission.</p>
                  </GuidanceBlock>
                  <div className="space-y-2">
                    {[
                      'Completed Extension Project Paper',
                      'Ongoing Extension Project Paper',
                    ].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                          paperCategory === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paperCategory"
                          value={option}
                          checked={paperCategory === option}
                          onChange={(e) => setPaperCategory(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500/30"
                        />
                        <span className="text-sm font-medium text-slate-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ============ Thematic Area ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Thematic Area <span className="text-red-500">*</span>
                  </label>
                  <GuidanceBlock>
                    <p>Select the single thematic area that best represents the project&apos;s primary intended outcome and strongest evidence of public value.</p>
                  </GuidanceBlock>
                  <select
                    value={thematicArea}
                    onChange={(e) => setThematicArea(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none mb-3"
                  >
                    <option value="">— Select a thematic area —</option>
                    {THEMATIC_AREAS.map((area, idx) => (
                      <option key={idx} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ============ Keywords ============ */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Keywords <span className="text-red-500">*</span>
                  </label>
                  <GuidanceBlock>
                    <p>Provide 4–6 keywords separated by semicolons.</p>
                  </GuidanceBlock>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., community extension; sustainable agriculture; resilience"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* ============ Abstract ============ */}
                <div>
                  <FieldLabel text={abstract} min={250} max={300}>
                    Abstract <span className="text-red-500">*</span>
                  </FieldLabel>
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended length: <span style={{ color: '#FF0000' }}>250–300 words</span>, preferably as one coherent paragraph.</p>
                    <p>Include these elements: <b>Background/Need</b>, <b>Objective</b>, <b>Methods/Approach</b>, <b>Results</b> (with actual evidence), and <b>Conclusion</b> (with implication for practice/policy).</p>
                    <p>Do not introduce claims in the abstract that are not supported in the main paper.</p>
                  </GuidanceBlock>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Write the 250–300-word abstract as one coherent paragraph"
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                  />
                </div>

                {/* =====================================================
                * 1. INTRODUCTION
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                    1. Introduction
                  </h3>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Section total
                    </span>
                    <WordCounter
                      text={[backgroundContext, evidenceNeed, relatedLiterature, rationale, objectives].join(' ')}
                      min={900}
                      max={1100}
                    />
                  </div>
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>900–1,100 words</span></p>
                    <p>The Introduction should establish the scholarly and development basis of the extension project, demonstrate how the intervention was informed by existing knowledge, and clearly identify the project&apos;s objectives.</p>
                  </GuidanceBlock>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.1 Background and Context</label>
                      <GuidanceBlock>
                        <p>Describe the community, institutional, sectoral, environmental, economic, educational, health, or development context. Explain the significance of the issue and provide relevant statistics, policies, research findings, or documented community evidence where appropriate.</p>
                      </GuidanceBlock>
                      <textarea
                        value={backgroundContext}
                        onChange={(e) => setBackgroundContext(e.target.value)}
                        placeholder="Describe the community, institutional, sectoral, environmental, economic, educational, health, or development context..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.2 Evidence of the Problem or Development Need</label>
                      <GuidanceBlock>
                        <p>Explain how the need, condition, gap, or opportunity was established. Evidence may come from:</p>
                        <ul className="list-disc list-inside ml-1">
                          <li>situational or needs assessment; baseline data; community consultations</li>
                          <li>surveys; focus group discussions; key informant interviews</li>
                          <li>institutional records; government statistics; previous research; technical assessments; or other credible sources</li>
                        </ul>
                        <p>Avoid relying solely on statements such as &ldquo;the community requested training.&rdquo;</p>
                      </GuidanceBlock>
                      <textarea
                        value={evidenceNeed}
                        onChange={(e) => setEvidenceNeed(e.target.value)}
                        placeholder="Explain how the need, condition, gap, or opportunity was established..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.3 Related Literature and Extension Evidence</label>
                      <GuidanceBlock>
                        <p>Provide a focused synthesis of relevant scholarly and technical literature concerning:</p>
                        <ul className="list-disc list-inside ml-1">
                          <li>the issue being addressed; comparable interventions; relevant extension approaches</li>
                          <li>documented factors influencing adoption or outcomes; and the knowledge or practice gap the project sought to address</li>
                        </ul>
                        <p>This should not become an exhaustive review — its purpose is to demonstrate that the intervention was informed by existing knowledge.</p>
                      </GuidanceBlock>
                      <textarea
                        value={relatedLiterature}
                        onChange={(e) => setRelatedLiterature(e.target.value)}
                        placeholder="Focused synthesis of relevant scholarly and technical literature..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.4 Rationale and Contribution of the Project</label>
                      <GuidanceBlock>
                        <p>Explain why the intervention was appropriate given the identified problem, available evidence, community context, and institutional expertise. Clearly identify what is potentially distinctive or useful about the project.</p>
                      </GuidanceBlock>
                      <textarea
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Why the intervention was appropriate given the problem, evidence, community context, and institutional expertise..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">1.5 Objectives</label>
                      <GuidanceBlock>
                        <p>State the general and specific objectives. The objectives reported here should correspond with the results presented later in the paper.</p>
                      </GuidanceBlock>
                      <textarea
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        placeholder="General and specific objectives of the extension project..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
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
                  <WordCounter
                    text={[
                      settingDuration, participantsDesc, reachPopulation, situationalAnalysis,
                      interventionRationale, implementationStrategies, partnership,
                      monitoringEval, dataAnalysis, ethicalConsiderations,
                    ].join(' ')}
                    min={1100}
                    max={1400}
                  />
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>1,100–1,400 words</span></p>
                    <p>This section must be sufficiently detailed to allow readers to understand what was done, with whom, how, why, and how results were determined.</p>
                  </GuidanceBlock>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.1 Project Setting and Duration</label>
                        <GuidanceBlock>
                          <p>Describe the project site, relevant characteristics of the community or institution, implementation period, and contextual conditions important to understanding the intervention. A map may be included when genuinely useful.</p>
                        </GuidanceBlock>
                        <textarea
                          value={settingDuration}
                          onChange={(e) => setSettingDuration(e.target.value)}
                          placeholder="Project site, community characteristics, implementation period, contextual conditions..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.2 Participants, Intended Users, or Beneficiaries</label>
                        <GuidanceBlock>
                          <p>Describe the target population, participant selection or inclusion criteria, number reached, relevant demographic or sectoral characteristics, and involvement of women, youth, vulnerable groups, or other relevant sectors where applicable.</p>
                          <p>Distinguish between persons reached by project activities and the population for whom outcome data were actually obtained.</p>
                        </GuidanceBlock>
                        <textarea
                          value={participantsDesc}
                          onChange={(e) => setParticipantsDesc(e.target.value)}
                          placeholder="Target population, selection criteria, number reached, demographics..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Distinguish reach vs. population for whom outcome data were obtained
                      </label>
                      <GuidanceBlock>
                        <p>Clarify the distinction between the number of people reached by project activities and the population that actually provided outcome data.</p>
                      </GuidanceBlock>
                      <textarea
                        value={reachPopulation}
                        onChange={(e) => setReachPopulation(e.target.value)}
                        placeholder="Explain the distinction between reach and the population that provided outcome data..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.3 Situational Analysis and Baseline</label>
                      <GuidanceBlock>
                        <p>Describe how the initial situation was established. Identify information collected, data sources, methods or instruments used, baseline indicators (where available), and major findings that informed project design.</p>
                      </GuidanceBlock>
                      <textarea
                        value={situationalAnalysis}
                        onChange={(e) => setSituationalAnalysis(e.target.value)}
                        placeholder="Information collected, data sources, methods/instruments, baseline indicators, major findings..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.4 Project / Intervention Design — Rationale</label>
                      <GuidanceBlock>
                        <p>Describe the extension intervention and its underlying logic. Explain why the selected intervention was expected to address the identified condition.</p>
                      </GuidanceBlock>
                      {/* ---- 2.4 Project Design Image Upload ---- */}
                      <div className="mt-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <label className="text-sm font-semibold text-slate-700 block">
                              Project Design / Results Pathway (optional)
                            </label>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Upload your own diagram. If none is uploaded, the template default
                              (PEMNet sample pathway) will be used.
                            </p>
                          </div>
                          <label className="cursor-pointer px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {projectDesignImage ? 'Replace image' : 'Add image'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              className="hidden"
                              onChange={handleAddProjectDesign}
                            />
                          </label>
                        </div>

                        {projectDesignImage ? (
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-xs font-semibold text-slate-600 truncate">
                                {projectDesignImage.fileName}
                              </span>
                              <button
                                type="button"
                                onClick={removeProjectDesign}
                                className="text-slate-400 hover:text-red-500 transition shrink-0"
                                aria-label="Remove project design image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="border border-slate-200 rounded-lg bg-white p-2 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={projectDesignImage.previewUrl}
                                alt="Project design preview"
                                className="max-h-64 w-auto object-contain"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                            No image uploaded — the default pathway diagram will be shown in the PDF.
                          </div>
                        )}
                      </div>
                      <textarea
                        value={interventionRationale}
                        onChange={(e) => setInterventionRationale(e.target.value)}
                        placeholder="Explain why the selected intervention was expected to address the identified condition..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.5 Implementation Strategies</label>
                      <GuidanceBlock>
                        <p>Describe the major strategies used, such as capability-building, technical assistance, demonstrations, mentoring or coaching, community organizing, communication interventions, technology transfer, enterprise development, policy or institutional development, partnership building, participatory planning, or other relevant approaches.</p>
                        <p>Avoid presenting a simple chronological list of activities unless chronology is analytically important.</p>
                      </GuidanceBlock>
                      <textarea
                        value={implementationStrategies}
                        onChange={(e) => setImplementationStrategies(e.target.value)}
                        placeholder="Capability-building, technical assistance, demonstrations, mentoring, community organizing, etc..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.6 Partnership and Stakeholder Participation</label>
                      <GuidanceBlock>
                        <p>Identify important partners and explain their actual roles, rather than merely listing organizations. Describe relevant community participation in project planning, implementation, monitoring, decision-making, resource mobilization, or sustainability mechanisms.</p>
                      </GuidanceBlock>
                      <textarea
                        value={partnership}
                        onChange={(e) => setPartnership(e.target.value)}
                        placeholder="Partners and their actual roles; community participation in planning, implementation, monitoring..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.7 Monitoring and Evaluation Design</label>
                        <GuidanceBlock>
                          <p>Explain how the project&apos;s results were measured or verified. Identify indicators, data sources, instruments, timing of measurements, persons or groups from whom data were obtained, follow-up procedures, and methods used to verify or triangulate evidence.</p>
                          <p>Where baseline and endline measurements were conducted, describe them clearly.</p>
                        </GuidanceBlock>
                        <textarea
                          value={monitoringEval}
                          onChange={(e) => setMonitoringEval(e.target.value)}
                          placeholder="Indicators, data sources, instruments, timing, follow-up, triangulation..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.8 Data Analysis</label>
                        <GuidanceBlock>
                          <p>Describe how quantitative and/or qualitative data were analyzed. Examples: frequencies and percentages; means or other descriptive statistics; pre-post comparison; appropriate statistical tests; thematic analysis; content analysis; or triangulation of multiple evidence sources.</p>
                          <p>Do not employ statistical tests merely to make the manuscript appear more scholarly.</p>
                        </GuidanceBlock>
                        <textarea
                          value={dataAnalysis}
                          onChange={(e) => setDataAnalysis(e.target.value)}
                          placeholder="Quantitative and/or qualitative analysis methods..."
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">2.9 Ethical Considerations</label>
                      <GuidanceBlock>
                        <p>Explain relevant safeguards concerning informed participation or consent, confidentiality, privacy, community data, photographs, interviews and testimonies, vulnerable participants, and institutional records.</p>
                        <p>Where formal ethics clearance was required and obtained, state the approving body and approval/reference number.</p>
                      </GuidanceBlock>
                      <textarea
                        value={ethicalConsiderations}
                        onChange={(e) => setEthicalConsiderations(e.target.value)}
                        placeholder="Informed consent, confidentiality, privacy, community data, ethics clearance..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 3. RESULTS
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">3. Results</h3>
                  <WordCounter
                    text={[
                      reachImplementation, immediateResults, outcomes, adoption,
                      institutionalization, publicValue,
                    ].join(' ')}
                    min={1200}
                    max={1600}
                  />
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>1,200–1,600 words</span></p>
                    <p>Present the evidence objectively and systematically. Results should correspond directly with the project objectives and indicators.</p>
                    <p><b>Important Evidence Rule:</b> Attendance sheets, photographs, certificates, and activity reports can verify that an activity occurred, but they should not by themselves be used as proof that an outcome, adoption, utilization, or impact occurred.</p>
                  </GuidanceBlock>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.1 Project Reach and Implementation</label>
                      <GuidanceBlock>
                        <p>Briefly report important implementation evidence: actual participants reached, interventions delivered, completion levels, major products or outputs, and significant deviations from the original project design.</p>
                        <p>Do not allow activity counts to dominate the Results section.</p>
                      </GuidanceBlock>
                      <textarea
                        value={reachImplementation}
                        onChange={(e) => setReachImplementation(e.target.value)}
                        placeholder="Actual participants, interventions delivered, completion levels, major outputs..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.2 Immediate Results</label>
                      <GuidanceBlock>
                        <p>Present documented immediate changes following the intervention, where applicable. Examples include changes in knowledge, skills, practices, confidence, organizational capacity, access, productivity, service delivery, or institutional processes.</p>
                      </GuidanceBlock>
                      <textarea
                        value={immediateResults}
                        onChange={(e) => setImmediateResults(e.target.value)}
                        placeholder="Documented changes in knowledge, skills, practices, confidence, capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.3 Outcomes</label>
                      <GuidanceBlock>
                        <p>Present evidence of changes that occurred beyond immediate project outputs. Where possible, distinguish clearly among:</p>
                        <ul className="list-disc list-inside ml-1">
                          <li><b>Output</b> – what the project produced</li>
                          <li><b>Immediate result</b> – what changed shortly after the intervention</li>
                          <li><b>Outcome</b> – meaningful change in practice, behavior, condition, performance, or institutional capacity</li>
                        </ul>
                      </GuidanceBlock>
                      <textarea
                        value={outcomes}
                        onChange={(e) => setOutcomes(e.target.value)}
                        placeholder="Meaningful change in practice, behavior, condition, performance, or institutional capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.4 Adoption, Utilization, Adaptation, or Continuation</label>
                      <GuidanceBlock>
                        <p>Where applicable, report evidence that project participants or partners used acquired knowledge or technologies, adopted recommended practices, adapted an intervention to local circumstances, continued activities beyond project-supported delivery, or replicated project practices.</p>
                        <p>Specify who adopted what, how many, to what extent, and based on what evidence whenever the data permit.</p>
                      </GuidanceBlock>
                      <textarea
                        value={adoption}
                        onChange={(e) => setAdoption(e.target.value)}
                        placeholder="Who adopted what, how many, to what extent, on what evidence..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.5 Institutionalization and Sustainability</label>
                      <GuidanceBlock>
                        <p>Present documented evidence of mechanisms such as partner policies, local ordinances or resolutions, budget allocations, integration into regular programs, institutional structures, trained local implementers, community management mechanisms, continuing partnerships, locally generated resources, or other arrangements supporting continuation.</p>
                      </GuidanceBlock>
                      <textarea
                        value={institutionalization}
                        onChange={(e) => setInstitutionalization(e.target.value)}
                        placeholder="Partner policies, ordinances, budget allocations, integration into programs..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">3.6 Public Value and Broader Benefits</label>
                      <GuidanceBlock>
                        <p>Where supported by evidence, describe the project&apos;s contribution to community or institutional benefit. Possible areas include improved livelihood, health or wellbeing, educational improvement, strengthened institutional capacity, increased resilience, improved environmental practices, empowerment, improved service delivery, or other documented public benefits.</p>
                      </GuidanceBlock>
                      <textarea
                        value={publicValue}
                        onChange={(e) => setPublicValue(e.target.value)}
                        placeholder="Improved livelihood, health, education, resilience, environment, empowerment..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 4. DISCUSSION
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">4. Discussion</h3>
                  <WordCounter
                    text={[
                      interpretation, relationshipLiterature, factorsAffecting,
                      inclusionResilience, transferability, limitations,
                    ].join(' ')}
                    min={1000}
                    max={1400}
                  />
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>1,000–1,400 words</span></p>
                    <p>The Discussion should explain what the results mean, rather than repeat the Results section.</p>
                  </GuidanceBlock>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.1 Interpretation of Major Findings</label>
                      <GuidanceBlock>
                        <p>Explain the most important findings. Why did the intervention appear to work—or not work? What conditions may explain the observed results?</p>
                      </GuidanceBlock>
                      <textarea
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        placeholder="Most important findings, why the intervention worked (or not), conditions explaining results..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.2 Relationship to Previous Research and Extension Literature</label>
                      <GuidanceBlock>
                        <p>Compare the results with relevant published studies, extension literature, policies, frameworks, or previous interventions. Explain whether the results support, extend, differ from, or qualify what is already known.</p>
                      </GuidanceBlock>
                      <textarea
                        value={relationshipLiterature}
                        onChange={(e) => setRelationshipLiterature(e.target.value)}
                        placeholder="Supporting, extending, differing from, or qualifying what is already known..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.3 Factors Affecting Implementation and Outcomes</label>
                      <GuidanceBlock>
                        <p>Discuss important enabling or constraining factors, such as community participation, leadership, institutional support, local culture, resources, partnerships, market conditions, environmental conditions, policy context, implementation fidelity, or other contextual factors.</p>
                      </GuidanceBlock>
                      <textarea
                        value={factorsAffecting}
                        onChange={(e) => setFactorsAffecting(e.target.value)}
                        placeholder="Enabling or constraining factors: participation, leadership, resources, culture, policy..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.4 Inclusion, Sustainability, and Resilience</label>
                      <GuidanceBlock>
                        <p>Where applicable, interpret how the project addressed gender and social inclusion, participation of vulnerable or underserved groups, sustainability, resilience, institutional ownership, and local capacity.</p>
                      </GuidanceBlock>
                      <textarea
                        value={inclusionResilience}
                        onChange={(e) => setInclusionResilience(e.target.value)}
                        placeholder="Gender and social inclusion, vulnerable groups, sustainability, resilience, ownership, local capacity..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.5 Transferability, Replication, or Scaling</label>
                      <GuidanceBlock>
                        <p>Discuss whether the intervention may reasonably be replicated, adapted, scaled, institutionalized, or transferred to another context.</p>
                        <p>Do not automatically recommend scaling solely because participants were satisfied with the project.</p>
                      </GuidanceBlock>
                      <textarea
                        value={transferability}
                        onChange={(e) => setTransferability(e.target.value)}
                        placeholder="Replicated, adapted, scaled, institutionalized, or transferred to another context..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">4.6 Limitations</label>
                      <GuidanceBlock>
                        <p>Clearly acknowledge relevant limitations, including possible weaknesses in baseline information, participant selection, sample size, absence of a comparison group, duration of follow-up, reliance on self-reported information, missing data, measurement instruments, attribution of outcomes, or other methodological constraints.</p>
                        <p>A credible limitations section strengthens, rather than weakens, a scholarly paper.</p>
                      </GuidanceBlock>
                      <textarea
                        value={limitations}
                        onChange={(e) => setLimitations(e.target.value)}
                        placeholder="Baseline, sample size, comparison group, follow-up, self-report, missing data, measurement..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* =====================================================
                * 5. IMPLICATIONS
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <FieldLabel text={implications} min={400} max={500}>
                    5. Implications for Extension Practice and Policy
                  </FieldLabel>
                  <GuidanceBlock>
                    <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>400–500 words</span></p>
                    <p>Explain what extension managers, HEIs, practitioners, LGUs, partner institutions, policymakers, or other stakeholders can reasonably learn from the project. Possible implications may concern extension project design, community engagement, monitoring and evaluation, evidence generation, institutional partnerships, technology adoption, capability-building, sustainability mechanisms, quality assurance, policy development, or scaling and replication.</p>
                    <p>Recommendations must arise from the evidence presented in the paper.</p>
                  </GuidanceBlock>
                  <textarea
                    value={implications}
                    onChange={(e) => setImplications(e.target.value)}
                    placeholder="What extension managers, HEIs, LGUs, policymakers, and partners can learn from the project..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                  />
                </div>

                {/* =====================================================
                * 6. CONCLUSION + BACK MATTER
                * ===================================================== */}
                <div className="border-t border-slate-200 pt-5">
                  <FieldLabel text={conclusion} min={300} max={500}>
                    6. Conclusion
                  </FieldLabel>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">6. Conclusion</label>
                      <GuidanceBlock>
                        <p className="font-semibold">Recommended maximum: <span style={{ color: '#FF0000' }}>300–500 words</span></p>
                        <p>Provide a concise synthesis of the development issue addressed, the principal intervention, the strongest documented results, the significance of those results, and the central implication for transformative extension.</p>
                        <p>Do not introduce new data or literature in the Conclusion. Avoid exaggerated claims unless genuinely supported by evidence.</p>
                      </GuidanceBlock>
                      <textarea
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="Synthesis of issue, intervention, strongest results, significance, and central implication..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Acknowledgments</label>
                      <GuidanceBlock>
                        <p>Acknowledge institutions, communities, partners, funders, technical personnel, or individuals who contributed materially to the project but do not qualify for authorship.</p>
                        <p>Do not use this section merely to list officials.</p>
                      </GuidanceBlock>
                      <textarea
                        value={acknowledgments}
                        onChange={(e) => setAcknowledgments(e.target.value)}
                        placeholder="Institutions, communities, partners, funders, technical personnel who contributed..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Funding Statement</label>
                      <GuidanceBlock>
                        <p>Example: <i>This extension project was funded by [Institution/Agency] under [program/grant, if applicable].</i></p>
                        <p>Or: <i>The authors received no external funding for the implementation of this project.</i></p>
                      </GuidanceBlock>
                      <textarea
                        value={funding}
                        onChange={(e) => setFunding(e.target.value)}
                        placeholder="e.g., This extension project was funded by [Institution/Agency]..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Conflict of Interest</label>
                      <GuidanceBlock>
                        <p>Example: <i>The authors declare no conflict of interest.</i> Where a relevant conflict exists, it should be disclosed.</p>
                      </GuidanceBlock>
                      <textarea
                        value={conflictOfInterest}
                        onChange={(e) => setConflictOfInterest(e.target.value)}
                        placeholder="e.g., The authors declare no conflict of interest."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Ethics and Informed Consent Statement</label>
                      <GuidanceBlock>
                        <p>Where applicable: <i>The project and associated data-gathering procedures were reviewed/approved by [appropriate body]. Informed consent was obtained from participants prior to data collection and/or use of identifiable photographs and testimonies.</i></p>
                        <p>Adapt the statement according to what actually occurred. Do not claim ethical clearance that was not obtained.</p>
                      </GuidanceBlock>
                      <textarea
                        value={ethicsStatement}
                        onChange={(e) => setEthicsStatement(e.target.value)}
                        placeholder="e.g., The project was reviewed/approved by [appropriate body]. Informed consent was obtained..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Data Availability Statement</label>
                      <GuidanceBlock>
                        <p>Where appropriate: <i>The data supporting the findings of this paper are available from the corresponding author upon reasonable request, subject to applicable privacy, consent, institutional, and data-protection requirements.</i></p>
                      </GuidanceBlock>
                      <textarea
                        value={dataAvailability}
                        onChange={(e) => setDataAvailability(e.target.value)}
                        placeholder="e.g., Data are available from the corresponding author upon reasonable request..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Author Contributions (CRediT-style)</label>
                      <GuidanceBlock>
                        <p>For stronger publication readiness, use a CRediT-style contributor approach. Example:</p>
                        <p><i>Conceptualization: A.A., B.B.<br/>Methodology: A.A., C.C.<br/>Data Collection: B.B., C.C.<br/>Data Analysis: A.A.<br/>Writing – Original Draft: A.A.<br/>Writing – Review and Editing: A.A., B.B., C.C.<br/>Project Administration: B.B.</i></p>
                      </GuidanceBlock>
                      <textarea
                        value={authorContributions}
                        onChange={(e) => setAuthorContributions(e.target.value)}
                        placeholder={`e.g.,\nConceptualization: A.A., B.B.\nMethodology: A.A., C.C.\nWriting – Original Draft: A.A.`}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        References (APA 7th Edition)
                      </label>
                      <GuidanceBlock>
                        <p>Use APA 7th Edition consistently. References appearing in the list must be cited in the manuscript, and all cited works must appear in the reference list.</p>
                        <p>Prioritize peer-reviewed journal articles, scholarly books, government publications, official institutional reports, authoritative technical publications, and other credible primary sources.</p>
                        <p className="font-semibold">Journal Article format: <i>Author, A. A., &amp; Author, B. B. (Year). Title of article. Journal Title, Volume(Issue), xx–xx. DOI</i></p>
                        <p className="font-semibold">Government/Institutional Report: <i>Institution. (Year). Title of report. Publisher/Institution. URL</i></p>
                        <p className="font-semibold">Book: <i>Author, A. A. (Year). Title of book. Publisher.</i></p>
                      </GuidanceBlock>

                      {/* Validated textarea wrapper */}
                      <div className="relative text-slate-700">
                        <textarea
                          value={references}
                          onChange={(e) => setReferences(e.target.value)}
                          placeholder={"Enter the complete APA 7th Edition reference list, one entry per line...\n\nExample:\nSmith, J. A., & Doe, R. B. (2024). Community-based extension methods. Journal of Extension Practice, 12(3), 45–62."}
                          rows={8}
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none resize-y transition-colors ${
                            references.trim() && references.split('\n').some(l => l.trim() && !validateAPAReference(l).valid)
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                          }`}
                        />

                        {/* Per-line validation indicators */}
                        {references.trim() && (
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {references.split('\n').map((line, idx) => {
                              const result = validateAPAReference(line);
                              if (!line.trim()) return null;
                              if (result.valid) return null;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                  </svg>
                                  <div>
                                    <span className="font-mono text-red-700 font-semibold">Line {idx + 1}:</span>{' '}
                                    <span className="text-red-600">{result.message}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Appendices</label>
                      <GuidanceBlock>
                        <p>Appendices are optional and should contain only evidence necessary for understanding or verifying the manuscript. Possible appendices include: Appendix A: Project Results Framework; Appendix B: Major Monitoring Indicators; Appendix C: Relevant Data Collection Instrument; Appendix D: Additional Results Table; Appendix E: Evidence of Institutionalization.</p>
                        <p>Do not turn the manuscript into a portfolio of certificates, attendance sheets, photographs, and administrative documents.</p>
                      </GuidanceBlock>
                      <textarea
                        value={appendices}
                        onChange={(e) => setAppendices(e.target.value)}
                        placeholder="List or describe appendices that support the manuscript..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                      />
                    </div>

                    {/* ---- TABLE AND FIGURE FORMAT ---- */}
                    <div className="border-t border-slate-200 pt-5 mt-5">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                        Table and Figure Format
                      </h4>
                      <GuidanceBlock>
                        <p>Tables and figures should communicate evidence, not simply decorate the manuscript. They must be properly numbered, labeled, explained in the text, and directly relevant to the claims being presented.</p>
                        <p>Every table must be discussed in the text.</p>
                      </GuidanceBlock>
                      <div className="space-y-4">

                        {/* ---------- Tables ---------- */}
                        <div className="space-y-4">
                          {tables.map((table, tIdx) => (
                            <div
                              key={table.id}
                              className="border border-slate-200 rounded-xl p-4 bg-white space-y-3"
                            >
                              {/* Table header row */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-800">
                                  Table {tIdx + 1}
                                </span>
                                {tables.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTable(table.id)}
                                    className="text-slate-400 hover:text-red-500 transition"
                                    aria-label={`Remove table ${tIdx + 1}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {/* Title */}
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                  Table {tIdx + 1} — Title
                                </label>
                                <input
                                  type="text"
                                  value={table.title}
                                  onChange={(e) => updateTableField(table.id, 'title', e.target.value)}
                                  placeholder="e.g., Baseline and Post-Intervention Status of Selected Indicators"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                />
                              </div>

                              {/* Rows */}
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                  Table {tIdx + 1} — Rows
                                </label>

                                {/* Desktop header row */}
                                <div
                                  className="hidden sm:grid gap-2 mb-2 px-1"
                                  style={{ gridTemplateColumns: '1.4fr 1fr 1.2fr 0.8fr 1.6fr 32px' }}
                                >
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Indicator</span>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Baseline</span>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Endline/Follow-up</span>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Change</span>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Source of Evidence</span>
                                  <span />
                                </div>

                                <div className="space-y-3">
                                  {table.rows.map((row, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="space-y-2 sm:space-y-0 sm:grid sm:gap-2 sm:items-start pb-3 sm:pb-0 border-b border-slate-100 sm:border-0"
                                      style={{ gridTemplateColumns: '1.4fr 1fr 1.2fr 0.8fr 1.6fr 32px' }}
                                    >
                                      {/* Mobile inputs */}
                                      <div className="sm:hidden">
                                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Indicator</span>
                                        <input
                                          type="text"
                                          value={row.indicator}
                                          onChange={(e) => updateTableRow(table.id, rIdx, 'indicator', e.target.value)}
                                          placeholder="Indicator"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div className="sm:hidden">
                                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Baseline</span>
                                        <input
                                          type="text"
                                          value={row.baseline}
                                          onChange={(e) => updateTableRow(table.id, rIdx, 'baseline', e.target.value)}
                                          placeholder="Baseline"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div className="sm:hidden">
                                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Endline/Follow-up</span>
                                        <input
                                          type="text"
                                          value={row.endline}
                                          onChange={(e) => updateTableRow(table.id, rIdx, 'endline', e.target.value)}
                                          placeholder="Endline/Follow-up"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div className="sm:hidden">
                                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Change</span>
                                        <input
                                          type="text"
                                          value={row.change}
                                          onChange={(e) => updateTableRow(table.id, rIdx, 'change', e.target.value)}
                                          placeholder="Change"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div className="sm:hidden">
                                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Source of Evidence</span>
                                        <div className="flex gap-2 min-w-0">
                                          <input
                                            type="text"
                                            value={row.source}
                                            onChange={(e) => updateTableRow(table.id, rIdx, 'source', e.target.value)}
                                            placeholder="Source"
                                            className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                          />
                                          {table.rows.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeTableRow(table.id, rIdx)}
                                              className="px-2 text-slate-400 hover:text-red-500 transition shrink-0"
                                              aria-label="Remove row"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Desktop inputs */}
                                      <input
                                        type="text"
                                        value={row.indicator}
                                        onChange={(e) => updateTableRow(table.id, rIdx, 'indicator', e.target.value)}
                                        placeholder="Indicator"
                                        className="hidden sm:block w-full min-w-0 px-2 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={row.baseline}
                                        onChange={(e) => updateTableRow(table.id, rIdx, 'baseline', e.target.value)}
                                        placeholder="Baseline"
                                        className="hidden sm:block w-full min-w-0 px-2 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={row.endline}
                                        onChange={(e) => updateTableRow(table.id, rIdx, 'endline', e.target.value)}
                                        placeholder="Endline"
                                        className="hidden sm:block w-full min-w-0 px-2 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={row.change}
                                        onChange={(e) => updateTableRow(table.id, rIdx, 'change', e.target.value)}
                                        placeholder="Change"
                                        className="hidden sm:block w-full min-w-0 px-2 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={row.source}
                                        onChange={(e) => updateTableRow(table.id, rIdx, 'source', e.target.value)}
                                        placeholder="Source"
                                        className="hidden sm:block w-full min-w-0 px-2 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                      />
                                      <div className="hidden sm:flex items-center justify-center">
                                        {table.rows.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeTableRow(table.id, rIdx)}
                                            className="text-slate-400 hover:text-red-500 transition"
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
                                  onClick={() => addTableRow(table.id)}
                                  className="mt-3 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                  Add row
                                </button>
                              </div>

                              {/* Note */}
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                  Table {tIdx + 1} — Note
                                </label>
                                <textarea
                                  value={table.note}
                                  onChange={(e) => updateTableField(table.id, 'note', e.target.value)}
                                  placeholder="e.g., Note. Explain abbreviations or important qualifications."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addTable}
                            className="w-full px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-xl transition inline-flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add table
                          </button>
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
                            <label className="cursor-pointer px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1">
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
                                      src={fig.previewUrl}
                                      alt={fig.title || `Figure ${idx + 1}`}
                                      className="max-h-48 w-auto object-contain"
                                    />
                                  </div>

                                  {/* Title */}
                                  <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                      Figure {idx + 1} — Title
                                    </label>
                                    <GuidanceBlock>
                                      <p>Provide a concise, descriptive title for the figure (e.g., &ldquo;Extension Project Results Pathway&rdquo;).</p>
                                    </GuidanceBlock>
                                    <input
                                      type="text"
                                      value={fig.title}
                                      onChange={(e) => updateFigure(fig.id, 'title', e.target.value)}
                                      placeholder="e.g., Extension Project Results Pathway"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                      Figure {idx + 1} — Description
                                    </label>
                                    <GuidanceBlock>
                                      <p>Provide a description or source note, where necessary, following APA 7th Edition figure notes style.</p>
                                    </GuidanceBlock>
                                    <textarea
                                      value={fig.note}
                                      onChange={(e) => updateFigure(fig.id, 'note', e.target.value)}
                                      placeholder="e.g., Description. Source or explanatory sentences, where necessary."
                                      rows={2}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y"
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
                      !title.trim() ||
                      !authors.trim() ||
                      !affiliations.trim() ||
                      !keywords.trim() ||
                      !correspondingName.trim() ||
                      !correspondingEmail.trim() ||
                      !thematicArea
                    }
                    onClick={handleSubmit}
                    className="sm:flex-2 py-3 rounded-xl font-bold text-white bg-linear-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
                        {isResubmit ? 'Resubmit Full Paper' : 'Submit Full Paper'}
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