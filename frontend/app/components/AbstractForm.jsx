    "use client";

    import { useState, useEffect, useRef, useMemo } from 'react';

    const thematicAreas = [
    "Food Production, Agricultural, Fisheries, and Natural Resource Systems",
    "Health, Nutrition, Wellness, and Community Care",
    "Education, Literacy, Skills Development, and Lifelong Learning",
    "Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development",
    "Environment, Climate Action, Disaster Risk Reduction, and Community Resilience"
    ];

    const paperCategories = [
    "Completed Extension Project Paper",
    "Ongoing Extension Project Paper"
    ];

    export function AbstractPreview({ data }) {
    const BLUE = '#1F3864';
    const LIGHT = '#E8EEF7';
    const BORDER = '#B4C6E0';

    return (
        <>
        <style jsx global>{`
        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            /* Reset page background */
            html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            }

            /* Hide EVERYTHING by default */
            body * {
            visibility: hidden !important;
            }

            /* Reveal ONLY the A4 preview wrapper and everything inside it */
            .a4-preview-wrapper,
            .a4-preview-wrapper * {
            visibility: visible !important;
            }

            /* Position the wrapper at the top-left of the page */
            .a4-preview-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            min-height: 0 !important;
            }

            /* Make sure the sheets container doesn't add extra spacing */
            .a4-sheets-container {
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            }

            /* Each A4 sheet prints as its own physical page */
            .a4-sheet {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 18mm 16mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            }

            .a4-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
            }

            /* Ensure colors print correctly */
            .a4-sheet,
            .a4-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            }

            /* Hide preview toolbar / navbars / anything else */
            .no-print {
            display: none !important;
            }
        }
        `}</style>

        <A4Paginator data={data} BLUE={BLUE} LIGHT={LIGHT} BORDER={BORDER} />
        </>
    );
    }

    function A4Paginator({ data, BLUE, LIGHT, BORDER }) {
    const [pages, setPages] = useState(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const measureRef = useRef(null);
    const wrapperRef = useRef(null);

    const blocks = useMemo(
        () => buildBlocks({ data, BLUE, LIGHT, BORDER }),
        [data, BLUE, LIGHT, BORDER]
    );

    // Track container width once mounted
    useEffect(() => {
        if (!wrapperRef.current) return;
        const update = () => setContainerWidth(wrapperRef.current.offsetWidth);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (!measureRef.current || containerWidth === 0) return;

        const probeWidthPx = measureRef.current.offsetWidth;
        if (probeWidthPx === 0) return;

        // A4 page usable height (mm -> px conversion at 96dpi)
        const MM_TO_PX = 3.7795275591;
        const PAGE_HEIGHT = 297 * MM_TO_PX;
        const PAGE_PADDING_TOP = 18 * MM_TO_PX;
        const PAGE_PADDING_BOTTOM = 18 * MM_TO_PX;
        const FOOTER_RESERVE = 30;             // px for footer
        const RUNNING_HEADER_RESERVE = 40;     // px for page 2+ running header
        const USABLE_HEIGHT = PAGE_HEIGHT - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM - FOOTER_RESERVE;

        // Measure each block in isolation
        const measured = blocks.map((b) => {
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        probe.style.width = probeWidthPx + 'px';
        probe.style.fontFamily = 'Times New Roman, Georgia, serif';
        probe.style.fontSize = '11pt';
        probe.style.lineHeight = '1.4';
        probe.innerHTML = b.html;
        measureRef.current.appendChild(probe);
        const h = probe.offsetHeight;
        measureRef.current.removeChild(probe);
        return { ...b, heightPx: h };
        });

        // Measure first-page header (rendered to a probe)
        const headerProbe = document.createElement('div');
        headerProbe.style.position = 'absolute';
        headerProbe.style.visibility = 'hidden';
        headerProbe.style.width = probeWidthPx + 'px';
        headerProbe.innerHTML = firstPageHeaderHTML(BLUE, LIGHT, BORDER);
        measureRef.current.appendChild(headerProbe);
        const firstPageHeaderHeight = headerProbe.offsetHeight;
        measureRef.current.removeChild(headerProbe);

        // Distribute blocks across pages
        const result = [];
        let currentBlocks = [];
        let currentHeight = 0;
        let isFirstPage = true;

        for (const block of measured) {
        const available =
            (isFirstPage ? USABLE_HEIGHT - firstPageHeaderHeight : USABLE_HEIGHT - RUNNING_HEADER_RESERVE);

        // Block fits on this page
        if (currentHeight + block.heightPx <= available) {
            currentBlocks.push(block);
            currentHeight += block.heightPx;
        } else {
            // Doesn't fit — close current page
            if (currentBlocks.length > 0) {
            result.push({ blocks: currentBlocks, isFirstPage });
            isFirstPage = false;
            currentBlocks = [];
            currentHeight = 0;
            }

            // If the block alone is still bigger than a full page, put it on its own page (it will be clipped by overflow:hidden)
            const freshAvailable = isFirstPage
            ? USABLE_HEIGHT - firstPageHeaderHeight
            : USABLE_HEIGHT - RUNNING_HEADER_RESERVE;

            if (block.heightPx > freshAvailable) {
            result.push({ blocks: [block], isFirstPage });
            isFirstPage = false;
            } else {
            currentBlocks.push(block);
            currentHeight = block.heightPx;
            }
        }
        }
        if (currentBlocks.length > 0) {
        result.push({ blocks: currentBlocks, isFirstPage });
        }

        setPages(result);
    }, [blocks, containerWidth, BLUE, LIGHT, BORDER]);

    const totalPages = pages ? pages.length : 1;

    return (
        <div
        ref={wrapperRef}
        className="w-full flex justify-center"
        >
        {/* Hidden measurement container */}
        <div
            ref={measureRef}
            style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: '178mm', // A4 width minus 2×16mm padding
            fontFamily: 'Times New Roman, Georgia, serif',
            fontSize: '11pt',
            lineHeight: 1.4,
            left: '-99999px',
            top: 0,
            }}
            aria-hidden="true"
        />

        {/* Rendered pages */}
        <div className="a4-sheets-container flex flex-col items-center gap-6">
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

    function A4Sheet({ pageNumber, isFirstPage, children, BLUE, LIGHT, BORDER }) {
    return (
        <div
        className="a4-sheet bg-white shadow-2xl"
        style={{
            width: '210mm',
            height: '297mm',
            padding: '18mm 16mm',
            fontFamily: 'Times New Roman, Georgia, serif',
            fontSize: '11pt',
            lineHeight: 1.4,
            color: '#111',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}
        >
        {/* ===== RUNNING HEADER — every page ===== */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <span
            style={{
                display: 'inline-block',
                color: BLUE,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '12pt',
                opacity: '0.7',
                fontWeight: 600,
            }}
            >
            1<sup>st</sup> PEMNet National Extension Conference 2026
            </span>
        </div>

        {/* ===== PAGE 1 ONLY — title block + instructions ===== */}
        {isFirstPage && (
            <>
            <div style={{ textAlign: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <h2
                style={{
                    color: BLUE,
                    fontWeight: 700,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '13pt',
                    margin: '0 0 12px 0',
                }}
                >
                ABSTRACT TEMPLATE
                </h2>
                <p
                style={{
                    fontSize: '11pt',
                    lineHeight: 1.3,
                    color: '#000',
                    margin: 0,
                }}
                >
                <span style={{ fontWeight: 400, fontFamily: 'Arial', fontSize: '10.5pt' }}>
                    Theme:{' '}
                </span>
                <span style={{ fontWeight: 700, fontFamily: 'Calibri', fontSize: '11pt' }}>
                    HEIs at the Forefront of Transformative Extension: Advancing
                    Evidence-Based, Inclusive, Sustainable, and Resilient Community
                    Development
                </span>
                </p>
            </div>

            <div
                style={{
                backgroundColor: LIGHT,
                border: `1px solid ${BORDER}`,
                color: BLUE,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '9pt',
                lineHeight: 1.3,
                padding: '6px 12px',
                marginBottom: '20px',
                borderRadius: '2px',
                flexShrink: 0,
                }}
            >
                <span style={{ fontWeight: 700 }}>Instructions:</span> Complete all
                sections. Select only one paper category and one thematic area. Use
                clear, evidence-based statements and avoid unsupported outcome or
                impact claims.
            </div>
            </>
        )}

        {/* ===== CONTENT AREA ===== */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {children}
        </div>

        {/* ===== FOOTER — every page ===== */}
        <div
            style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '64px',
            marginTop: '16px',
            flexShrink: 0,
            fontFamily: 'Cambria',
            fontSize: '9pt',
            color: '#8EA9C7',
            }}
        >
            <span>Abstract</span>
            <span>{pageNumber}</span>
        </div>
        </div>
    );
    }

    function firstPageHeaderHTML(BLUE, LIGHT, BORDER) {
    return `
        <div style="text-align:center;margin-bottom:20px;">
        <h1 style="color:${BLUE};font-weight:600;font-family:Arial;font-size:12pt;line-height:1.2;margin:0;">
            1<sup>st</sup> PEMNet National Extension Conference 2026
        </h1>
        <h2 style="color:${BLUE};font-weight:700;font-family:Arial;font-size:12pt;margin-top:4px;margin-bottom:0;">
            ABSTRACT TEMPLATE
        </h2>
        <p style="font-size:11pt;margin-top:12px;line-height:1.3;color:#000;">
            <span style="font-weight:400;font-family:Arial;font-size:10.5pt;">Theme: </span>
            <span style="font-weight:700;font-family:Calibri;font-size:11pt;">
            HEIs at the Forefront of Transformative Extension: Advancing
            Evidence-Based, Inclusive, Sustainable, and Resilient Community Development
            </span>
        </p>
        </div>
        <div style="background:${LIGHT};border:1px solid ${BORDER};color:${BLUE};font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.3;padding:6px 12px;margin-bottom:20px;">
        <span style="font-weight:700;">Instructions:</span> Complete all sections. Select only one paper category and one thematic area. Use clear, evidence-based statements and avoid unsupported outcome or impact claims.
        </div>
    `;
    }


    function buildBlocks({ data, BLUE, LIGHT, BORDER }) {
    const safe = (v) => (v == null ? '' : String(v));

    const rowHTML = (label, value, opts = {}) => `
        <tr>
        <th style="background:${LIGHT};color:${BLUE};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};font-weight:700;font-family:Arial;font-size:11pt;text-align:left;vertical-align:top;padding:8px 12px;${
        opts.width ? `width:${opts.width};` : ''
    }">
            ${label}
            ${
            opts.note
                ? `<p style="color:${BLUE};font-family:Arial;font-size:8pt;font-style:italic;font-weight:400;margin-top:4px;">${opts.note}</p>`
                : ''
            }
        </th>
        <td style="border-bottom:1px solid ${BORDER};vertical-align:top;padding:8px 12px;">${value}</td>
        </tr>
    `;

    const sectionHeading = (text, mt = 0) => `
        <h3 style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-top:${mt}px;margin-bottom:8px;">${text}</h3>
    `;

    const narrativeBlockHTML = (number, title, hint, body) => `
        <div style="margin-top:16px;">
        <p style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:4px;">${number} ${title}</p>
        ${
            hint
            ? `<p style="color:${BLUE};font-family:Arial;font-size:9pt;margin-bottom:4px;line-height:1.3;">${hint}</p>`
            : ''
        }
        <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(body)}</div>
        </div>
    `;

    // ---- Section A ----
    const sectionA = `
        ${sectionHeading('A. Paper Information')}
        <table style="width:100%;border-collapse:collapse;border:1px solid ${BORDER};font-size:10.5pt;">
        <tbody>
            ${rowHTML('1. Title of the Extension Project Paper', safe(data.title), { width: '42%' })}
            ${rowHTML(
            '2. Author/s and Institutional Affiliation/s',
            [
                data.project_leader && `${data.project_leader}*`,
                data.presenter && `${data.presenter} (paper presenter)`,
                ...(Array.isArray(data.co_authors) ? data.co_authors : []),
            ]
                .filter(Boolean)
                .join('; '),
            {
                note: 'Note: Use an asterisk (*) after the name of the project leader. If the presenter is not the project leader, write "paper presenter" after the name.',
            }
            )}
            ${rowHTML(
            '3. Name and Email Address of Corresponding Author',
            [
                data.corresponding_author_name,
                data.corresponding_author_position && `(${data.corresponding_author_position})`,
                data.corresponding_author_email && `<${data.corresponding_author_email}>`,
            ]
                .filter(Boolean)
                .join(' ')
            )}
            ${rowHTML(
            '4. Paper Category',
            paperCategories
                .map(
                (c) =>
                    `<div style="display:flex;gap:6px;"><span style="color:${BLUE};min-width:14px;">[${
                    data.paper_category === c ? '✓' : ' '
                    }]</span><span>${c}</span></div>`
                )
                .join('')
            )}
            ${rowHTML(
            '5. Thematic Area (choose 1 only)',
            thematicAreas
                .map(
                (t) =>
                    `<div style="display:flex;gap:6px;"><span style="color:${BLUE};min-width:14px;">[${
                    data.thematic_area === t ? '✓' : ' '
                    }]</span><span>${t}</span></div>`
                )
                .join('')
            )}
        </tbody>
        </table>
    `;

    // ---- Section B heading ----
    const sectionBHeading = `
        ${sectionHeading('B. Extended Abstract Narrative', 24)}
        <p style="color:${BLUE};font-family:Arial;font-size:9pt;margin-bottom:16px;">
        <span style="font-weight:700;">Guide:</span> Write concise paragraphs under each required component.
        </p>
    `;

    // ---- Blocks 5, 6, 7 ----
    const block5 = narrativeBlockHTML(
        '5.',
        'Community or Sectoral Need Addressed',
        'Briefly describe in not more than 150 words the validated community, institutional, or sectoral need addressed by the project.',
        data.community_need
    );

    const block6 = narrativeBlockHTML(
        '6.',
        'Project Objectives',
        'State the main objective/s of the extension project.',
        data.project_objectives
    );

    const block7 = narrativeBlockHTML(
        '7.',
        'Extension Methods, Strategies, or Activities Implemented',
        'Describe in not more than 300 words the major extension approaches, methods, strategies, or activities implemented.',
        data.extension_methods
    );

    // ---- Block 8 ----
    const block8 = `
        <div style="margin-top:20px;">
        <h4 style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:6px;">
            8. Key Outputs, Emerging Results, and Evidence of Outcomes, Adoption, or Utilization
        </h4>
        <p style="color:${BLUE};font-family:Arial;font-size:9pt;line-height:1.3;margin-bottom:12px;">
            Briefly present in not more than 300 words the documented outputs and emerging results of the project. Include available evidence of outcomes, adoption, utilization, capability-building, institutional change, or public value, if applicable. Claims must be supported by verifiable evidence.
        </p>

        <div style="margin-bottom:12px;">
            <p style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:4px;">a. Major Outputs or Emerging Results</p>
            <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(data.major_outputs)}</div>
        </div>

        <div style="margin-bottom:12px;">
            <p style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:4px;">b. Evidence of Outcomes, Adoption, or Utilization</p>
            <p style="color:${BLUE};font-family:Arial;font-size:9pt;margin-bottom:4px;">[Type response here. If not yet available, write: &ldquo;Not yet available.&rdquo;]</p>
            <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(data.evidence_outcomes)}</div>
        </div>

        <div style="margin-bottom:12px;">
            <p style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:4px;">c. Supporting Documents/Evidence Available</p>
            <p style="color:${BLUE};font-family:Arial;font-size:9pt;line-height:1.3;margin-bottom:4px;">[Examples: attendance sheets, monitoring reports, photos, testimonials, adoption records, partnership agreements, policy issuances, utilization reports, or other proof.]</p>
            <p style="color:${BLUE};font-family:Arial;font-size:9pt;line-height:1.3;margin-bottom:4px;">[Upload Attachments below.]</p>
            <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(data.supporting_docs)}</div>
        </div>
        </div>
    `;

    // ---- Block 9 ----
    const block9 = `
        <div style="margin-top:20px;">
        <h4 style="color:${BLUE};font-family:Arial;font-size:11pt;font-weight:700;margin-bottom:6px;">9. Sustainability Direction or Next Steps</h4>
        <p style="color:${BLUE};font-family:Arial;font-size:9pt;line-height:1.3;margin-bottom:8px;">
            Explain in not more than 150 words how the project will be sustained, institutionalized, scaled, or improved, or state the next steps for ongoing projects.
        </p>
        <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(data.sustainability)}</div>
        </div>
    `;

    // ---- Section C ----
    const blockC = `
        ${sectionHeading('C. Keywords', 28)}
        <div style="border:1px solid ${BORDER};min-height:46px;color:${BLUE};font-family:Arial;font-size:10pt;padding:6px 8px;white-space:pre-wrap;">${safe(data.keywords)}</div>
    `;

    // ---- Review + signature ----
    const blockReview = `
        <div style="margin-top:24px;">
        <p style="color:${BLUE};font-family:Arial;font-size:10.5pt;font-weight:700;">For PEMnet Abstract Review Committee Use Only:</p>
        <div style="color:${BLUE};font-family:Arial;font-size:10.5pt;margin-top:8px;margin-left:32px;">
            <div style="display:flex;gap:6px;"><span style="min-width:14px;">[ ]</span><span>Recommended for Acceptance</span></div>
            <div style="display:flex;gap:6px;"><span style="min-width:14px;">[ ]</span><span>Not Recommended for Acceptance</span></div>
        </div>
        </div>

        <div style="margin-top:40px;display:flex;justify-content:flex-end;">
        <div style="width:65%;">
            <div style="display:flex;align-items:flex-end;gap:8px;">
            <p style="color:${BLUE};font-family:Arial;font-size:10.5pt;white-space:nowrap;margin:0;">Reviewed by:</p>
            <div style="flex:1;border-bottom:1px solid ${BLUE};height:1px;margin-bottom:4px;"></div>
            </div>
            <p style="color:${BLUE};font-family:Arial;font-size:10.5pt;font-weight:700;text-align:right;margin-top:-5px;">Chair, PEMNet Scientific / Abstract Review Committee</p>
        </div>
        </div>
    `;

    return [
        { id: 'A', html: sectionA },
        { id: 'B-head', html: sectionBHeading },
        { id: '5', html: block5 },
        { id: '6', html: block6 },
        { id: '7', html: block7 },
        { id: '8', html: block8 },
        { id: '9', html: block9 },
        { id: 'C', html: blockC },
        { id: 'review', html: blockReview },
    ];
    }

    export default function AbstractForm({
    user,
    onSubmit,
    submitting,
    error,
    sucList,
    isLoadingSucs,
    onSucAdded,
    }) {
    const [formData, setFormData] = useState({
        title: '',
        thematic_area: '',
        paper_category: '',
        project_leader: '',
        presenter: '',
        corresponding_author_name: '',
        corresponding_author_position: '',
        corresponding_author_email: '',
        community_need: '',
        project_objectives: '',
        extension_methods: '',
        major_outputs: '',
        evidence_outcomes: '',
        supporting_docs: '',
        sustainability: '',
        keywords: '',
    });

    const [coAuthors, setCoAuthors] = useState(['']);
    const [chosenSuc, setChosenSuc] = useState('');
    const [showOtherSuc, setShowOtherSuc] = useState(false);
    const [otherSucName, setOtherSucName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSucList, setFilteredSucList] = useState(sucList || []);
    const [showDropdown, setShowDropdown] = useState(false);
    const [endorsementFile, setEndorsementFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setFilteredSucList(sucList || []);
    }, [sucList]);

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) setFilteredSucList(sucList || []);
        else {
        setFilteredSucList(
            (sucList || []).filter(
            (s) =>
                s.name?.toLowerCase().includes(term) ||
                s.abbreviation?.toLowerCase().includes(term) ||
                s.region?.toLowerCase().includes(term)
            )
        );
        }
    }, [searchTerm, sucList]);

    useEffect(() => {
        const handler = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const addCoAuthor = () => setCoAuthors([...coAuthors, '']);
    const removeCoAuthor = (i) => setCoAuthors(coAuthors.filter((_, idx) => idx !== i));
    const handleCoAuthorChange = (i, v) => {
        const next = [...coAuthors];
        next[i] = v;
        setCoAuthors(next);
    };

    const handleSucSelect = (suc) => {
        setChosenSuc(suc.name);
        setSearchTerm(suc.name);
        setShowDropdown(false);
        setShowOtherSuc(false);
    };

    const handleOtherSucChange = (e) => {
        setOtherSucName(e.target.value);
        setChosenSuc(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalSuc = chosenSuc;
        if (showOtherSuc) {
        finalSuc = otherSucName.trim();
        if (!finalSuc) {
            onSubmit({ error: 'Please enter your SUC/Agency name.' });
            return;
        }
        }
        if (!finalSuc) {
        onSubmit({ error: 'Please select or enter your SUC/Agency.' });
        return;
        }
        if (!endorsementFile) {
        onSubmit({ error: 'Endorsement PDF file is required.' });
        return;
        }

        const existing = (sucList || []).find(
        (s) => s.name.toLowerCase() === finalSuc.toLowerCase()
        );
        if (!existing && showOtherSuc) {
        try {
            const res = await fetch(
            `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '')}/api/sucs`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: finalSuc, region: 'Other' }),
            }
            );
            if (res.ok) {
            const newSuc = await res.json();
            onSucAdded?.(newSuc);
            }
        } catch (err) {
            console.error('Error adding SUC:', err);
        }
        }

        const submitData = new FormData();
        const filteredCoAuthors = coAuthors.filter((c) => c.trim() !== '');

        submitData.append('user_id', user.id);
        submitData.append('extension_project_title', formData.title);
        submitData.append('thematic_area', formData.thematic_area);
        submitData.append('paper_category', formData.paper_category);
        submitData.append('suc_agencies', finalSuc);
        submitData.append('project_leader', formData.project_leader);
        submitData.append('presenter', formData.presenter);
        submitData.append('corresponding_author_name', formData.corresponding_author_name);
        submitData.append('corresponding_author_position', formData.corresponding_author_position);
        submitData.append('corresponding_author_email', formData.corresponding_author_email);
        submitData.append('co_authors', filteredCoAuthors.join(', '));
        submitData.append('community_need', formData.community_need);
        submitData.append('project_objectives', formData.project_objectives);
        submitData.append('extension_methods', formData.extension_methods);
        submitData.append('major_outputs', formData.major_outputs);
        submitData.append('evidence_outcomes', formData.evidence_outcomes || 'Not yet available.');
        submitData.append('supporting_docs', formData.supporting_docs);
        submitData.append('sustainability', formData.sustainability);
        submitData.append('keywords', formData.keywords);

        const safeName = endorsementFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        submitData.append(
        'endorsement_file',
        new File([endorsementFile], safeName, { type: 'application/pdf' })
        );

        onSubmit({
        formData: submitData,
        rawData: {
            ...formData,
            co_authors: filteredCoAuthors,
            suc_agencies: finalSuc,
        },
        });
    };

    const previewData = {
        ...formData,
        co_authors: coAuthors.filter((c) => c.trim()),
        suc_agencies: chosenSuc,
    };

    /* ---------------- Preview mode ---------------- */
    if (showPreview) {
        return (
        <div>
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                </div>
                <div>
                <h2 className="font-bold text-slate-900">Abstract Preview (A4)</h2>
                <p className="text-xs text-slate-500">Review before submitting</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
                </svg>
                Print
                </button>
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

            <div className="a4-preview-wrapper p-6 overflow-auto bg-slate-100 min-h-screen">
            <AbstractPreview data={previewData} />
            </div>
        </div>
        );
    }

    /* ---------------- Form mode ---------------- */
    return (
        <form onSubmit={handleSubmit}>
        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-4 flex items-start gap-2 max-w-4xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
            </div>
        )}

        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-blue-700 to-blue-800 px-6 py-4 flex items-center justify-between">
            <div className="text-white">
                <h1 className="text-lg font-bold">Abstract Submission</h1>
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

            <div className="p-6 space-y-6">
            {/* A. PAPER INFORMATION */}
            <SectionBlock letter="A" title="Paper Information">
                <Field
                label="1. Title of the Extension Project Paper"
                required
                value={formData.title}
                onChange={handleChange}
                name="title"
                placeholder="Enter your project title"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                    label="2a. Project Leader (add * to name)"
                    required
                    value={formData.project_leader}
                    onChange={handleChange}
                    name="project_leader"
                    placeholder="Project Leader Name *"
                />
                <Field
                    label="2b. Paper Presenter"
                    required
                    value={formData.presenter}
                    onChange={handleChange}
                    name="presenter"
                    placeholder="Presenter Name (paper presenter)"
                />
                </div>

                <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">2c. Co-Authors</label>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {coAuthors.length}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {coAuthors.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 h-10 bg-slate-50 border text-slate-700 border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-blue-600">{i + 1}.</span>
                        <input
                        type="text"
                        value={a}
                        onChange={(e) => handleCoAuthorChange(i, e.target.value)}
                        placeholder={`Author ${i + 1}`}
                        className="w-32 bg-transparent text-sm focus:outline-none"
                        />
                        {coAuthors.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeCoAuthor(i)}
                            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addCoAuthor}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-xs hover:border-blue-500 hover:bg-blue-50"
                >
                    + Add Co-Author
                </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                    label="3a. Corresponding Author Name"
                    required
                    value={formData.corresponding_author_name}
                    onChange={handleChange}
                    name="corresponding_author_name"
                    placeholder="Full Name"
                />
                <Field
                    label="3b. Position/Designation"
                    value={formData.corresponding_author_position}
                    onChange={handleChange}
                    name="corresponding_author_position"
                    placeholder="e.g., Professor"
                />
                </div>
                <Field
                label="3c. Corresponding Author Email"
                required
                type="email"
                value={formData.corresponding_author_email}
                onChange={handleChange}
                name="corresponding_author_email"
                placeholder="email@example.com"
                />

                <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    4. Paper Category <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    {paperCategories.map((c) => (
                        <label
                        key={c}
                        className="flex items-center gap-2 cursor-pointer text-sm text-slate-800"
                        >
                        <input
                            type="radio"
                            name="paper_category"
                            value={c}
                            required
                            checked={formData.paper_category === c}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 accent-blue-600"
                        />
                        <span className="text-slate-800">{c}</span>
                        </label>
                    ))}
                </div>
                </div>

                <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    5. Thematic Area (choose 1 only) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    {thematicAreas.map((t) => (
                        <label
                        key={t}
                        className="flex items-start gap-2 cursor-pointer text-sm text-slate-800"
                        >
                        <input
                            type="radio"
                            name="thematic_area"
                            value={t}
                            required
                            checked={formData.thematic_area === t}
                            onChange={handleChange}
                            className="w-4 h-4 mt-0.5 text-blue-600 accent-blue-600"
                        />
                        <span className="text-slate-800 leading-snug">{t}</span>
                        </label>
                    ))}
                </div>
                </div>

                <div ref={dropdownRef} className="relative">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    SUC / Agency <span className="text-red-500">*</span>
                </label>
                {!showOtherSuc ? (
                    <>
                    <input
                        type="text"
                        placeholder="Search SUC/Agency..."
                        value={searchTerm}
                        onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    />
                    {showDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingSucs ? (
                            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
                        ) : filteredSucList.length > 0 ? (
                            filteredSucList.map((suc) => (
                            <button
                                key={suc.id}
                                type="button"
                                onClick={() => handleSucSelect(suc)}
                                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 text-slate-700  flex justify-between border-b border-slate-50 last:border-0"
                            >
                                <span className="text-sm">{suc.name}</span>
                                <span className="text-xs text-slate-400">{suc.region}</span>
                            </button>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-slate-500">
                            No SUCs found.{' '}
                            <button
                                type="button"
                                onClick={() => {
                                setShowOtherSuc(true);
                                setShowDropdown(false);
                                setOtherSucName(searchTerm);
                                }}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Add "{searchTerm}"
                            </button>
                            </div>
                        )}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowOtherSuc(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        + Can't find your SUC? Add it here
                    </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={otherSucName}
                        onChange={handleOtherSucChange}
                        placeholder="Enter your SUC/Agency name"
                        required
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => {
                        setShowOtherSuc(false);
                        setOtherSucName('');
                        setChosenSuc('');
                        }}
                        className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                )}
                </div>
            </SectionBlock>

            {/* B. EXTENDED ABSTRACT NARRATIVE */}
            <SectionBlock letter="B" title="Extended Abstract Narrative">
                <NarrativeField
                label="6. Community or Sectoral Need Addressed"
                hint="Briefly describe in not more than 150 words the validated community, institutional, or sectoral need addressed by the project."
                name="community_need"
                value={formData.community_need}
                onChange={handleChange}
                rows={4}
                required
                />
                <NarrativeField
                label="7. Project Objectives"
                hint="State the main objective/s of the extension project."
                name="project_objectives"
                value={formData.project_objectives}
                onChange={handleChange}
                rows={4}
                required
                />
                <NarrativeField
                label="8. Extension Methods, Strategies, or Activities Implemented"
                hint="Describe in not more than 300 words the major extension approaches, methods, strategies, or activities implemented."
                name="extension_methods"
                value={formData.extension_methods}
                onChange={handleChange}
                rows={5}
                required
                />

                <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="font-bold text-sm text-slate-800 mb-3">
                    9. Key Outputs, Emerging Results, and Evidence of Outcomes, Adoption, or Utilization
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                    Briefly present in not more than 300 words the documented outputs and emerging results. Claims must be supported by verifiable evidence.
                </p>
                <div className="space-y-3">
                    <NarrativeField
                    label="a. Major Outputs or Emerging Results"
                    name="major_outputs"
                    value={formData.major_outputs}
                    onChange={handleChange}
                    rows={3}
                    required
                    />
                    <NarrativeField
                    label="b. Evidence of Outcomes, Adoption, or Utilization"
                    hint='If not yet available, write: "Not yet available."'
                    name="evidence_outcomes"
                    value={formData.evidence_outcomes}
                    onChange={handleChange}
                    rows={3}
                    />
                    <NarrativeField
                    label="c. Supporting Documents/Evidence Available"
                    hint="Examples: attendance sheets, monitoring reports, photos, testimonials, adoption records, partnership agreements, policy issuances, utilization reports."
                    name="supporting_docs"
                    value={formData.supporting_docs}
                    onChange={handleChange}
                    rows={3}
                    />
                </div>
                </div>

                <NarrativeField
                label="10. Sustainability Direction or Next Steps"
                hint="Explain in not more than 150 words how the project will be sustained, institutionalized, scaled, or improved."
                name="sustainability"
                value={formData.sustainability}
                onChange={handleChange}
                rows={4}
                required
                />
            </SectionBlock>

            {/* C. KEYWORDS */}
            <SectionBlock letter="C" title="Keywords">
                <Field
                label="Keywords (3–5, comma-separated)"
                required
                value={formData.keywords}
                onChange={handleChange}
                name="keywords"
                placeholder="e.g., community extension, sustainable agriculture, capability-building"
                />
            </SectionBlock>

            {/* D. FILE UPLOAD */}
            <SectionBlock letter="D" title="File Upload">
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                </div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Endorsement PDF <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setEndorsementFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 cursor-pointer"
                />
                {endorsementFile && (
                    <p className="text-xs text-emerald-600 mt-2">{endorsementFile.name}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">Upload the signed endorsement (PDF only).</p>
                </div>
            </SectionBlock>

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
                Preview Abstract
                </button>
                <button
                type="submit"
                disabled={submitting}
                className="sm:flex-2 py-3 rounded-xl font-bold text-white bg-linear-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                {submitting ? 'Submitting...' : 'Submit Abstract'}
                </button>
            </div>
            </div>
        </div>
        </form>
    );
    }

    /* ---------- Reusable sub-components ---------- */
    function SectionBlock({ letter, title, children }) {
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-md text-xs mr-2">
                {letter}
            </span>
            {title}
            </h3>
        </div>
        <div className="p-4 space-y-4">{children}</div>
        </div>
    );
    }

    function Field({ label, required, hint, ...props }) {
    return (
        <div>
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
        <input
            {...props}
            required={required}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
        />
        </div>
    );
    }

    function NarrativeField({ label, hint, rows = 4, ...props }) {
    return (
        <div>
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
            {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
        <textarea
            {...props}
            rows={rows}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition resize-y"
        />
        </div>
    );
    }