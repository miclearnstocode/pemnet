(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/submit/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SubmitPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const thematicAreas = [
    "Food Production, Agricultural, Fisheries, and Natural Resource Systems",
    "Health, Nutrition, Wellness, and Community Care",
    "Education, Literacy, Skills Development, and Lifelong Learning",
    "Livelihood, Entrepreneurships; Cooperatives, MSMEs, and Local Economic Development",
    "Environment, Climate Action, Disaster Risk Reduction, and Community Resilience"
];
const paperCategories = [
    "Completed Extension Project Papers",
    "Ongoing Extension Project Papers"
];
const API_URL = (("TURBOPACK compile-time value", "http://localhost:5000") || 'http://localhost:5000').replace(/\/+$/, '');
// Toast Component
const Toast = ({ message, type, onClose })=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Toast.useEffect": ()=>{
            const timer = setTimeout({
                "Toast.useEffect.timer": ()=>{
                    onClose();
                }
            }["Toast.useEffect.timer"], 5000);
            return ({
                "Toast.useEffect": ()=>clearTimeout(timer)
            })["Toast.useEffect"];
        }
    }["Toast.useEffect"], [
        onClose
    ]);
    const bgColor = type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
    const iconColor = type === 'success' ? 'text-emerald-700' : 'text-red-700';
    const progressColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-20 right-4 z-9999 animate-slide-in",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `relative w-96 max-w-[calc(100vw-2rem)] p-4 rounded-xl border shadow-2xl ${bgColor}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `h-full ${progressColor} animate-progress-shrink`
                    }, void 0, false, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 41,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 40,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `shrink-0 mt-0.5 ${iconColor}`,
                            children: type === 'success' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                strokeWidth: 2,
                                stroke: "currentColor",
                                className: "w-5 h-5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 48,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 47,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                strokeWidth: 2,
                                stroke: "currentColor",
                                className: "w-5 h-5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 52,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 51,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 45,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex-1 ${textColor}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold text-sm",
                                    children: type === 'success' ? 'Success!' : 'Error!'
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm",
                                    children: message
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 56,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: `shrink-0 ${textColor} hover:opacity-70 transition`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                strokeWidth: 2,
                                stroke: "currentColor",
                                className: "w-4 h-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M6 18L18 6M6 6l12 12"
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 66,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 62,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 44,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/app/submit/page.js",
            lineNumber: 39,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/submit/page.js",
        lineNumber: 38,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toast, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Toast;
function SubmitPage() {
    _s1();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('submit');
    const [coAuthors, setCoAuthors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        ''
    ]);
    const [chosenSuc, setChosenSuc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showOtherSuc, setShowOtherSuc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [otherSucName, setOtherSucName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [abstractFile, setAbstractFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [endorsementFile, setEndorsementFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sucList, setSucList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filteredSucList, setFilteredSucList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoadingSucs, setIsLoadingSucs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showDropdown, setShowDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [userSubmissions, setUserSubmissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paymentFile, setPaymentFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [paymentData, setPaymentData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [paymentLoading, setPaymentLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [referenceNumber, setReferenceNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [paymentAmount, setPaymentAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [paymentDate, setPaymentDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [paymentStatus, setPaymentStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isUploadingPayment, setIsUploadingPayment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [userPayments, setUserPayments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedSubmission, setSelectedSubmission] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitPage.useEffect": ()=>{
            const fetchSUCs = {
                "SubmitPage.useEffect.fetchSUCs": async ()=>{
                    try {
                        console.log('Fetching SUCs...');
                        const response = await fetch(`${API_URL}/api/sucs`);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        console.log('SUCs fetched:', data.length, 'items');
                        if (Array.isArray(data)) {
                            const sanitizedData = data.map({
                                "SubmitPage.useEffect.fetchSUCs.sanitizedData": (suc)=>({
                                        ...suc,
                                        region: suc.region || 'Unknown Region',
                                        name: suc.name || 'Unknown SUC'
                                    })
                            }["SubmitPage.useEffect.fetchSUCs.sanitizedData"]);
                            setSucList(sanitizedData);
                            setFilteredSucList(sanitizedData);
                        } else {
                            console.error('Unexpected data format:', data);
                            setSucList([]);
                            setFilteredSucList([]);
                        }
                    } catch (error) {
                        console.error('Error fetching SUCs:', error);
                        setSucList([]);
                        setFilteredSucList([]);
                    } finally{
                        setIsLoadingSucs(false);
                    }
                }
            }["SubmitPage.useEffect.fetchSUCs"];
            fetchSUCs();
        }
    }["SubmitPage.useEffect"], []);
    // Check if user is logged in - simply check localStorage for user data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitPage.useEffect": ()=>{
            const userData = localStorage.getItem('pemnet_user');
            if (!userData) {
                window.location.href = '/login';
            } else {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    fetchUserSubmissions(parsedUser.id);
                    fetchUserPayments(parsedUser.id);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('pemnet_user');
                    window.location.href = '/login';
                }
            }
        }
    }["SubmitPage.useEffect"], []);
    const fetchUserSubmissions = async (userId)=>{
        setIsLoadingSubmissions(true);
        try {
            const response = await fetch(`${API_URL}/api/submissions/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserSubmissions(data);
            } else {
                console.error('Failed to fetch user submissions');
            }
        } catch (error) {
            console.error('Error fetching user submissions:', error);
        } finally{
            setIsLoadingSubmissions(false);
        }
    };
    const fetchUserPayments = async (userId)=>{
        try {
            const response = await fetch(`${API_URL}/api/payments/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserPayments(data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };
    // Close dropdown when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitPage.useEffect": ()=>{
            const handleClickOutside = {
                "SubmitPage.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setShowDropdown(false);
                    }
                }
            }["SubmitPage.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "SubmitPage.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["SubmitPage.useEffect"];
        }
    }["SubmitPage.useEffect"], []);
    // Filter SUCs based on search term
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubmitPage.useEffect": ()=>{
            if (searchTerm.trim() === '') {
                setFilteredSucList(sucList);
            } else {
                const filtered = sucList.filter({
                    "SubmitPage.useEffect.filtered": (suc)=>suc.name.toLowerCase().includes(searchTerm.toLowerCase()) || suc.abbreviation && suc.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) || suc.region.toLowerCase().includes(searchTerm.toLowerCase())
                }["SubmitPage.useEffect.filtered"]);
                setFilteredSucList(filtered);
            }
        }
    }["SubmitPage.useEffect"], [
        searchTerm,
        sucList
    ]);
    const checkPaymentStatus = async (submissionId)=>{
        try {
            const response = await fetch(`${API_URL}/api/payments/submission/${submissionId}`);
            if (response.ok) {
                const data = await response.json();
                setPaymentData(data);
                if (data.exists) {
                    setPaymentStatus(data.payment.payment_status);
                }
                return data;
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
        return null;
    };
    const handlePaymentUpload = async (e)=>{
        e.preventDefault();
        if (!paymentFile || !selectedSubmission) {
            showToast('Please select a payment proof file', 'error');
            return;
        }
        setIsUploadingPayment(true);
        try {
            const userData = JSON.parse(localStorage.getItem('pemnet_user'));
            const formData = new FormData();
            formData.append('user_id', userData.id);
            formData.append('submission_id', selectedSubmission.id);
            formData.append('reference_number', referenceNumber);
            formData.append('payment_amount', paymentAmount);
            formData.append('payment_date', paymentDate);
            formData.append('payment_proof', paymentFile);
            const response = await fetch(`${API_URL}/api/payments/upload`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                showToast('Payment proof uploaded successfully!', 'success');
                setPaymentData(data);
                setPaymentStatus('pending');
                setPaymentFile(null);
                setReferenceNumber('');
                setPaymentAmount('');
                setPaymentDate('');
                fetchUserPayments(userData.id);
            } else {
                const error = await response.json();
                showToast(error.detail || 'Failed to upload payment proof', 'error');
            }
        } catch (error) {
            console.error('Error uploading payment:', error);
            showToast('Network error. Please try again.', 'error');
        } finally{
            setIsUploadingPayment(false);
        }
    };
    const showToast = (message, type)=>{
        setToast({
            message,
            type
        });
        setTimeout(()=>{
            setToast(null);
        }, 5000);
    };
    const hideToast = ()=>{
        setToast(null);
    };
    const addCoAuthor = ()=>{
        setCoAuthors([
            ...coAuthors,
            ''
        ]);
    };
    const removeCoAuthor = (index)=>{
        const newCoAuthors = coAuthors.filter((_, i)=>i !== index);
        setCoAuthors(newCoAuthors);
    };
    const handleCoAuthorChange = (index, value)=>{
        const newCoAuthors = [
            ...coAuthors
        ];
        newCoAuthors[index] = value;
        setCoAuthors(newCoAuthors);
    };
    const handleSucSelect = (suc)=>{
        setChosenSuc(suc.name);
        setShowOtherSuc(false);
        setShowDropdown(false);
        setSearchTerm(suc.name);
    };
    const handleOtherSucChange = (e)=>{
        setOtherSucName(e.target.value);
        setChosenSuc(e.target.value);
    };
    const handleSearchChange = (e)=>{
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);
    };
    const handleAddOther = ()=>{
        setShowOtherSuc(true);
        setShowDropdown(false);
        setSearchTerm('');
    };
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setToast(null);
        // Check if user exists in localStorage
        const userData = localStorage.getItem('pemnet_user');
        if (!userData) {
            const errorMsg = 'You are not logged in. Please login again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            setTimeout(()=>{
                window.location.href = '/login';
            }, 2000);
            return;
        }
        let parsedUser;
        try {
            parsedUser = JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            const errorMsg = 'Session error. Please login again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            localStorage.removeItem('pemnet_user');
            setTimeout(()=>{
                window.location.href = '/login';
            }, 2000);
            return;
        }
        if (!parsedUser || !parsedUser.id) {
            const errorMsg = 'Invalid user session. Please login again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            localStorage.removeItem('pemnet_user');
            setTimeout(()=>{
                window.location.href = '/login';
            }, 2000);
            return;
        }
        const formData = new FormData(e.target);
        const filteredCoAuthors = coAuthors.filter((c)=>c.trim() !== '');
        let finalSuc = chosenSuc;
        if (showOtherSuc) {
            finalSuc = otherSucName.trim();
            if (!finalSuc) {
                const errorMsg = "Please enter your SUC/Agency name.";
                setError(errorMsg);
                showToast(errorMsg, 'error');
                setSubmitting(false);
                return;
            }
        }
        if (!finalSuc) {
            const errorMsg = "Please select or enter your SUC/Agency.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            return;
        }
        // Check if the SUC exists in the database, if not, add it
        const existingSuc = sucList.find((s)=>s.name.toLowerCase() === finalSuc.toLowerCase());
        if (!existingSuc && showOtherSuc) {
            try {
                const addResponse = await fetch(`${API_URL}/api/sucs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: finalSuc,
                        region: 'Other'
                    })
                });
                if (addResponse.ok) {
                    const newSuc = await addResponse.json();
                    setSucList([
                        ...sucList,
                        newSuc
                    ]);
                    showToast('New SUC/Agency added to the database!', 'success');
                }
            } catch (error) {
                console.error('Error adding SUC:', error);
            }
        }
        // Build FormData for submission
        const submitData = new FormData();
        submitData.append('user_id', parsedUser.id);
        submitData.append('extension_project_title', formData.get('title'));
        submitData.append('thematic_area', formData.get('thematicArea'));
        submitData.append('paper_category', formData.get('paperCategory'));
        submitData.append('suc_agencies', finalSuc);
        submitData.append('project_leader', formData.get('project_leader'));
        submitData.append('presenter', formData.get('presenter'));
        submitData.append('corresponding_author_name', formData.get('correspondingAuthorName'));
        submitData.append('corresponding_author_email', formData.get('correspondingAuthorEmail'));
        submitData.append('co_authors', filteredCoAuthors.length > 0 ? filteredCoAuthors.join(', ') : '');
        if (!abstractFile) {
            const errorMsg = 'Abstract PDF file is required.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            return;
        }
        if (!endorsementFile) {
            const errorMsg = 'Endorsement PDF file is required.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setSubmitting(false);
            return;
        }
        const safeAbstractName = abstractFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeAbstractFile = new File([
            abstractFile
        ], safeAbstractName, {
            type: 'application/pdf'
        });
        submitData.append('abstract_file', safeAbstractFile);
        const safeEndorsementName = endorsementFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeEndorsementFile = new File([
            endorsementFile
        ], safeEndorsementName, {
            type: 'application/pdf'
        });
        submitData.append('endorsement_file', safeEndorsementFile);
        console.log('Submitting data with user_id:', parsedUser.id);
        for (let pair of submitData.entries()){
            if (pair[0].includes('file')) {
                console.log(pair[0] + ': ' + (pair[1]?.name || 'No file'));
            } else {
                console.log(pair[0] + ': ' + pair[1]);
            }
        }
        try {
            const res = await fetch(`${API_URL}/api/submit`, {
                method: 'POST',
                body: submitData
            });
            console.log('Response status:', res.status);
            let data;
            const text = await res.text();
            console.log('Response text:', text);
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', text);
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
            }
            if (res.ok) {
                console.log('Submission successful:', data);
                showToast('Abstract submitted successfully!', 'success');
                setAbstractFile(null);
                setEndorsementFile(null);
                setChosenSuc('');
                setSearchTerm('');
                setCoAuthors([
                    ''
                ]);
                fetchUserSubmissions(parsedUser.id);
                setTimeout(()=>{
                    setActiveTab('my-submissions');
                }, 1000);
            } else {
                console.error('Submission failed:', data);
                const errorMsg = data.detail || data.error || data.msg || 'Submission failed. Please try again.';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch (err) {
            console.error('Submission network error:', err);
            const errorMsg = err.message || 'Network error. Is the backend running on port 5000?';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally{
            setSubmitting(false);
        }
    }
    const renderSubmissions = ()=>{
        if (isLoadingSubmissions) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center items-center py-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"
                }, void 0, false, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 528,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/submit/page.js",
                lineNumber: 527,
                columnNumber: 9
            }, this);
        }
        if (userSubmissions.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            strokeWidth: 1.5,
                            stroke: "currentColor",
                            className: "w-8 h-8 text-slate-400",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            }, void 0, false, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 538,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 537,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 536,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-slate-700",
                        children: "No Submissions Yet"
                    }, void 0, false, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 541,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-500 text-sm mt-1",
                        children: "You haven't submitted any abstracts yet."
                    }, void 0, false, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 542,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('submit'),
                        className: "mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition",
                        children: "Submit Your First Abstract"
                    }, void 0, false, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 543,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/submit/page.js",
                lineNumber: 535,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: userSubmissions.map((submission)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-semibold text-slate-900 truncate",
                                        children: submission.extension_project_title
                                    }, void 0, false, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 559,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2 mt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full",
                                                children: submission.thematic_area
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 563,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full",
                                                children: submission.paper_category
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 566,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-xs px-2.5 py-1 rounded-full ${submission.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : submission.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`,
                                                children: submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 569,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 562,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-4 mt-3 text-sm text-slate-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: "Project Leader:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 578,
                                                        columnNumber: 25
                                                    }, this),
                                                    " ",
                                                    submission.project_leader
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 578,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: "Presenter:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 579,
                                                        columnNumber: 25
                                                    }, this),
                                                    " ",
                                                    submission.presenter
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 579,
                                                columnNumber: 19
                                            }, this),
                                            submission.corresponding_author_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: "Corresponding Author:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 581,
                                                        columnNumber: 27
                                                    }, this),
                                                    " ",
                                                    submission.corresponding_author_name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 581,
                                                columnNumber: 21
                                            }, this),
                                            submission.corresponding_author_position && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: "Position:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 584,
                                                        columnNumber: 27
                                                    }, this),
                                                    " ",
                                                    submission.corresponding_author_position
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 584,
                                                columnNumber: 21
                                            }, this),
                                            submission.suc_agencies && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: "SUC:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 587,
                                                        columnNumber: 27
                                                    }, this),
                                                    " ",
                                                    submission.suc_agencies
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 587,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 577,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 text-xs text-slate-400",
                                        children: [
                                            "Submitted: ",
                                            new Date(submission.created_at).toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 590,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 558,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-end gap-2 shrink-0",
                                children: [
                                    submission.abstract_view_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: submission.abstract_view_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 2,
                                                stroke: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 603,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 602,
                                                columnNumber: 21
                                            }, this),
                                            "View Abstract"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 596,
                                        columnNumber: 19
                                    }, this),
                                    submission.endorsement_view_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: submission.endorsement_view_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 2,
                                                stroke: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 616,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 615,
                                                columnNumber: 21
                                            }, this),
                                            "View Endorsement"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 609,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 594,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/submit/page.js",
                        lineNumber: 557,
                        columnNumber: 13
                    }, this)
                }, submission.id, false, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 556,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/app/submit/page.js",
            lineNumber: 554,
            columnNumber: 7
        }, this);
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center",
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/app/submit/page.js",
            lineNumber: 630,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-7ae810da9302cfe2" + " " + "min-h-screen bg-slate-50",
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Toast, {
                message: toast.message,
                type: toast.type,
                onClose: hideToast
            }, void 0, false, {
                fileName: "[project]/app/submit/page.js",
                lineNumber: 637,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "jsx-7ae810da9302cfe2" + " " + "bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-7ae810da9302cfe2" + " " + "max-w-5xl mx-auto px-6 py-4 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7ae810da9302cfe2" + " " + "w-10 h-10 bg-linear-to-br from-blue-50 to-emerald-50 rounded-xl p-1.5 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/images/pemnet_logo.png",
                                        alt: "PEMNet Logo",
                                        width: 32,
                                        height: 32,
                                        className: "jsx-7ae810da9302cfe2" + " " + "object-contain"
                                    }, void 0, false, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 649,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 648,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "jsx-7ae810da9302cfe2" + " " + "text-xl font-bold text-slate-900",
                                    children: "PEMNet"
                                }, void 0, false, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 651,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 647,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-slate-600",
                                    children: [
                                        "Welcome, ",
                                        user.full_name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 655,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    className: "inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-all hover:bg-red-50 px-4 py-2 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSignOutAlt"],
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 657,
                                            columnNumber: 15
                                        }, this),
                                        "Logout"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 656,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 654,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 646,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/submit/page.js",
                lineNumber: 645,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-7ae810da9302cfe2" + " " + "max-w-5xl mx-auto px-6 pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-7ae810da9302cfe2" + " " + "bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-7ae810da9302cfe2" + " " + "flex border-b border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab('submit'),
                                    className: "jsx-7ae810da9302cfe2" + " " + `flex-1 px-6 py-4 text-sm font-semibold transition relative ${activeTab === 'submit' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`,
                                    children: [
                                        "Submit Abstract",
                                        activeTab === 'submit' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7ae810da9302cfe2" + " " + "absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 678,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 668,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setActiveTab('my-submissions');
                                        fetchUserSubmissions(user.id);
                                    },
                                    className: "jsx-7ae810da9302cfe2" + " " + `flex-1 px-6 py-4 text-sm font-semibold transition relative ${activeTab === 'my-submissions' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`,
                                    children: [
                                        "My Submissions",
                                        userSubmissions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-7ae810da9302cfe2" + " " + "ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full",
                                            children: userSubmissions.length
                                        }, void 0, false, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 694,
                                            columnNumber: 17
                                        }, this),
                                        activeTab === 'my-submissions' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7ae810da9302cfe2" + " " + "absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 699,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 681,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setActiveTab('payment');
                                        if (user) {
                                            fetchUserPayments(user.id);
                                        }
                                    },
                                    className: "jsx-7ae810da9302cfe2" + " " + `flex-1 px-6 py-4 text-sm font-semibold transition relative ${activeTab === 'payment' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`,
                                    children: [
                                        "Payment",
                                        activeTab === 'payment' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7ae810da9302cfe2" + " " + "absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 717,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/submit/page.js",
                                    lineNumber: 702,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 667,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-7ae810da9302cfe2" + " " + "p-8",
                            children: activeTab === 'submit' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "flex justify-between items-center mb-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7ae810da9302cfe2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-3xl font-bold text-slate-900",
                                                    children: "Submit Extension Project Abstract"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 728,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-slate-500 text-sm mt-1",
                                                    children: "Upload your abstract for the conference"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 729,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 727,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 726,
                                        columnNumber: 17
                                    }, this),
                                    error && !toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 2,
                                                stroke: "currentColor",
                                                className: "jsx-7ae810da9302cfe2" + " " + "w-5 h-5 shrink-0 mt-0.5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
                                                    className: "jsx-7ae810da9302cfe2"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 736,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 735,
                                                columnNumber: 21
                                            }, this),
                                            error
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 734,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleSubmit,
                                        className: "jsx-7ae810da9302cfe2" + " " + "space-y-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-700 font-medium text-center",
                                                            children: "PEMNet 1st National Extension Conference 2026"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/submit/page.js",
                                                            lineNumber: 746,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 745,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-3 mb-6 mt-6",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-blue-700 font-bold text-sm",
                                                                    children: "1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/submit/page.js",
                                                                    lineNumber: 752,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 751,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-slate-900",
                                                                children: "Project Information"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 754,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 750,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "space-y-5 pl-11",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                        children: "Extension Project Title"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 759,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        name: "title",
                                                                        type: "text",
                                                                        required: true,
                                                                        placeholder: "Enter project title",
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 760,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 758,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "grid grid-cols-1 md:grid-cols-2 gap-5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Thematic Area"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 771,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                name: "thematicArea",
                                                                                required: true,
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: "",
                                                                                        className: "jsx-7ae810da9302cfe2",
                                                                                        children: "Select Thematic Area"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 777,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    thematicAreas.map((area)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            value: area,
                                                                                            className: "jsx-7ae810da9302cfe2",
                                                                                            children: area
                                                                                        }, area, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 779,
                                                                                            columnNumber: 31
                                                                                        }, this))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 772,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 770,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Paper Category"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 785,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                name: "paperCategory",
                                                                                required: true,
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: "",
                                                                                        className: "jsx-7ae810da9302cfe2",
                                                                                        children: "Select Category"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 791,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    paperCategories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            value: cat,
                                                                                            className: "jsx-7ae810da9302cfe2",
                                                                                            children: cat
                                                                                        }, cat, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 793,
                                                                                            columnNumber: 31
                                                                                        }, this))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 786,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 784,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 769,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                ref: dropdownRef,
                                                                className: "jsx-7ae810da9302cfe2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                        children: "SUC / Agency"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 800,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    !showOtherSuc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "relative",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "relative",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        placeholder: "Search SUC/Agency...",
                                                                                        value: searchTerm,
                                                                                        onChange: handleSearchChange,
                                                                                        onFocus: ()=>setShowDropdown(true),
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 805,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    isLoadingSucs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "absolute right-3 top-1/2 -translate-y-1/2",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "jsx-7ae810da9302cfe2" + " " + "animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 815,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 814,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 804,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            showDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto",
                                                                                children: filteredSucList.length > 0 ? filteredSucList.map((suc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>handleSucSelect(suc),
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between border-b border-slate-50 last:border-0",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "jsx-7ae810da9302cfe2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-sm font-medium text-slate-900",
                                                                                                        children: suc.name
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                                        lineNumber: 831,
                                                                                                        columnNumber: 41
                                                                                                    }, this),
                                                                                                    suc.abbreviation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-slate-500 ml-2",
                                                                                                        children: [
                                                                                                            "(",
                                                                                                            suc.abbreviation,
                                                                                                            ")"
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                                        lineNumber: 833,
                                                                                                        columnNumber: 43
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/submit/page.js",
                                                                                                lineNumber: 830,
                                                                                                columnNumber: 39
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-slate-400",
                                                                                                children: suc.region
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/submit/page.js",
                                                                                                lineNumber: 836,
                                                                                                columnNumber: 39
                                                                                            }, this)
                                                                                        ]
                                                                                    }, suc.id, true, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 824,
                                                                                        columnNumber: 37
                                                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-7ae810da9302cfe2" + " " + "px-4 py-3 text-sm text-slate-500",
                                                                                    children: [
                                                                                        "No SUCs found.",
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            onClick: handleAddOther,
                                                                                            className: "jsx-7ae810da9302cfe2" + " " + "text-blue-600 font-semibold hover:underline ml-1",
                                                                                            children: [
                                                                                                'Add "',
                                                                                                searchTerm,
                                                                                                '" as new SUC'
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 842,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/submit/page.js",
                                                                                    lineNumber: 840,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 821,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            chosenSuc && !showOtherSuc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "mt-2 flex items-center gap-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-emerald-600 font-medium",
                                                                                        children: [
                                                                                            "Selected: ",
                                                                                            chosenSuc
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 856,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>{
                                                                                            setChosenSuc('');
                                                                                            setSearchTerm('');
                                                                                        },
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-red-500 hover:text-red-700",
                                                                                        children: "Clear"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 857,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 855,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                type: "button",
                                                                                onClick: handleAddOther,
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                        xmlns: "http://www.w3.org/2000/svg",
                                                                                        fill: "none",
                                                                                        viewBox: "0 0 24 24",
                                                                                        strokeWidth: 2,
                                                                                        stroke: "currentColor",
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-4 h-4",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                            strokeLinecap: "round",
                                                                                            strokeLinejoin: "round",
                                                                                            d: "M12 4.5v15m7.5-7.5h-15",
                                                                                            className: "jsx-7ae810da9302cfe2"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 876,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 875,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    "Can't find your SUC? Add it here"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 870,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 803,
                                                                        columnNumber: 27
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        name: "sucAgenciesOther",
                                                                                        value: otherSucName,
                                                                                        onChange: handleOtherSucChange,
                                                                                        placeholder: "Enter your SUC/Agency name",
                                                                                        required: true,
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 884,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>{
                                                                                            setShowOtherSuc(false);
                                                                                            setOtherSucName('');
                                                                                            setChosenSuc('');
                                                                                        },
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                            xmlns: "http://www.w3.org/2000/svg",
                                                                                            fill: "none",
                                                                                            viewBox: "0 0 24 24",
                                                                                            strokeWidth: 2,
                                                                                            stroke: "currentColor",
                                                                                            className: "jsx-7ae810da9302cfe2" + " " + "w-5 h-5",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                strokeLinecap: "round",
                                                                                                strokeLinejoin: "round",
                                                                                                d: "M6 18L18 6M6 6l12 12",
                                                                                                className: "jsx-7ae810da9302cfe2"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/submit/page.js",
                                                                                                lineNumber: 903,
                                                                                                columnNumber: 35
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 902,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 893,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 883,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-slate-500 mt-1.5",
                                                                                children: "This SUC/Agency will be added when you submit."
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 907,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 882,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 799,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 757,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 744,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-3 mb-6",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-emerald-700 font-bold text-sm",
                                                                    children: "2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/submit/page.js",
                                                                    lineNumber: 920,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 919,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-slate-900",
                                                                children: "Author Information"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 922,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 918,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "space-y-5 pl-11",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "grid grid-cols-1 md:grid-cols-2 gap-5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Project Leader"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 928,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                name: "project_leader",
                                                                                type: "text",
                                                                                required: true,
                                                                                placeholder: "Project Leader Name",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 929,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 927,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Paper Presenter"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 939,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                name: "presenter",
                                                                                type: "text",
                                                                                required: true,
                                                                                placeholder: "Presenter Name",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 940,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 938,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Corresponding Author Name"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 950,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                name: "correspondingAuthorName",
                                                                                type: "text",
                                                                                placeholder: "Corresponding Author Name",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 951,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 949,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Corresponding Author Position/Designation"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 960,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                name: "correspondingAuthorPosition",
                                                                                type: "text",
                                                                                placeholder: "e.g., Professor, Research Director, Extension Coordinator",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 961,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 959,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Corresponding Author Email"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 970,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                name: "correspondingAuthorEmail",
                                                                                type: "email",
                                                                                placeholder: "corresponding@email.com",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 971,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 969,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 926,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex items-center justify-between mb-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700",
                                                                                children: "Co-Authors"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 982,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full",
                                                                                children: [
                                                                                    coAuthors.length,
                                                                                    " ",
                                                                                    coAuthors.length === 1 ? 'Author' : 'Authors'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 983,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 981,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex flex-wrap gap-2",
                                                                        children: coAuthors.map((author, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-1.5 px-3 h-10 bg-slate-50 border border-slate-200 rounded-xl transition-colors hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-xs font-bold text-blue-600",
                                                                                        children: [
                                                                                            index + 1,
                                                                                            "."
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 994,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        value: author,
                                                                                        onChange: (e)=>handleCoAuthorChange(index, e.target.value),
                                                                                        placeholder: `Author ${index + 1}`,
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-32 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 998,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    coAuthors.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>removeCoAuthor(index),
                                                                                        title: "Remove",
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-5 h-5 shrink-0 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                            xmlns: "http://www.w3.org/2000/svg",
                                                                                            fill: "none",
                                                                                            viewBox: "0 0 24 24",
                                                                                            strokeWidth: 2,
                                                                                            stroke: "currentColor",
                                                                                            className: "jsx-7ae810da9302cfe2" + " " + "w-3 h-3",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                strokeLinecap: "round",
                                                                                                strokeLinejoin: "round",
                                                                                                d: "M6 18L18 6M6 6l12 12",
                                                                                                className: "jsx-7ae810da9302cfe2"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/submit/page.js",
                                                                                                lineNumber: 1014,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 1013,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1007,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, index, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 990,
                                                                                columnNumber: 29
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 988,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: addCoAuthor,
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "mt-3 inline-flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                xmlns: "http://www.w3.org/2000/svg",
                                                                                fill: "none",
                                                                                viewBox: "0 0 24 24",
                                                                                strokeWidth: 2,
                                                                                stroke: "currentColor",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-4 h-4",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                    strokeLinecap: "round",
                                                                                    strokeLinejoin: "round",
                                                                                    d: "M12 4.5v15m7.5-7.5h-15",
                                                                                    className: "jsx-7ae810da9302cfe2"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/submit/page.js",
                                                                                    lineNumber: 1028,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1027,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            "Add Co-Author"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1022,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 980,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 925,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 917,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "flex items-center gap-3 mb-6",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-yellow-700 font-bold text-sm",
                                                                    children: "3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/submit/page.js",
                                                                    lineNumber: 1040,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1039,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-slate-900",
                                                                children: "File Uploads"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1042,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1038,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "grid grid-cols-1 md:grid-cols-2 gap-5 pl-11",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                            xmlns: "http://www.w3.org/2000/svg",
                                                                            fill: "none",
                                                                            viewBox: "0 0 24 24",
                                                                            strokeWidth: 1.5,
                                                                            stroke: "currentColor",
                                                                            className: "jsx-7ae810da9302cfe2" + " " + "w-6 h-6 text-blue-600",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                strokeLinecap: "round",
                                                                                strokeLinejoin: "round",
                                                                                d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
                                                                                className: "jsx-7ae810da9302cfe2"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1049,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/submit/page.js",
                                                                            lineNumber: 1048,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1047,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-2",
                                                                        children: "Abstract PDF *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1052,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "file",
                                                                        accept: ".pdf",
                                                                        required: true,
                                                                        onChange: (e)=>setAbstractFile(e.target.files[0]),
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-blue-700 file:text-white file:font-semibold hover:file:bg-blue-800 cursor-pointer transition"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1053,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    abstractFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-emerald-600 mt-2",
                                                                        children: abstractFile.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1061,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1046,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                            xmlns: "http://www.w3.org/2000/svg",
                                                                            fill: "none",
                                                                            viewBox: "0 0 24 24",
                                                                            strokeWidth: 1.5,
                                                                            stroke: "currentColor",
                                                                            className: "jsx-7ae810da9302cfe2" + " " + "w-6 h-6 text-emerald-600",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                strokeLinecap: "round",
                                                                                strokeLinejoin: "round",
                                                                                d: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
                                                                                className: "jsx-7ae810da9302cfe2"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1067,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/submit/page.js",
                                                                            lineNumber: 1066,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1065,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-2",
                                                                        children: "Endorsement PDF *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1070,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "file",
                                                                        accept: ".pdf",
                                                                        required: true,
                                                                        onChange: (e)=>setEndorsementFile(e.target.files[0]),
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 cursor-pointer transition"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1071,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    endorsementFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-emerald-600 mt-2",
                                                                        children: endorsementFile.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1079,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1064,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1045,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1037,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "pt-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: submitting || loading,
                                                    className: "jsx-7ae810da9302cfe2" + " " + "w-full bg-linear-to-r from-blue-700 to-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-900 transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-not-allowed",
                                                    children: submitting ? "Submitting..." : "Submit Abstract"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 1087,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1086,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 742,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 725,
                                columnNumber: 15
                            }, this) : activeTab === 'my-submissions' ? // My Submissions Tab
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "flex justify-between items-center mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-3xl font-bold text-slate-900",
                                                        children: "My Submissions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1102,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-slate-500 text-sm mt-1",
                                                        children: "View all your submitted abstracts"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1103,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1101,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setActiveTab('submit');
                                                    fetchUserSubmissions(user.id);
                                                },
                                                className: "jsx-7ae810da9302cfe2" + " " + "text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 transition",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        xmlns: "http://www.w3.org/2000/svg",
                                                        fill: "none",
                                                        viewBox: "0 0 24 24",
                                                        strokeWidth: 2,
                                                        stroke: "currentColor",
                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-4 h-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M12 4.5v15m7.5-7.5h-15",
                                                            className: "jsx-7ae810da9302cfe2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/submit/page.js",
                                                            lineNumber: 1113,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1112,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Submit New Abstract"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1105,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1100,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "mt-4",
                                        children: renderSubmissions()
                                    }, void 0, false, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1119,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 1099,
                                columnNumber: 15
                            }, this) : // Payment Tab
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "flex justify-between items-center mb-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7ae810da9302cfe2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-3xl font-bold text-slate-900",
                                                    children: "Payment"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 1128,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7ae810da9302cfe2" + " " + "text-slate-500 text-sm mt-1",
                                                    children: "Manage your registration payments"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 1129,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/submit/page.js",
                                            lineNumber: 1127,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1126,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-blue-800 mb-2",
                                                children: "Registration Fees"
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1135,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "space-y-2 text-blue-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-7ae810da9302cfe2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                children: "Regular Registration Fee:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1137,
                                                                columnNumber: 24
                                                            }, this),
                                                            " PhP 6,500.00"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1137,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-7ae810da9302cfe2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                children: "Early-Bird Registration Fee:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1138,
                                                                columnNumber: 24
                                                            }, this),
                                                            " PhP 6,000.00 ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-blue-500",
                                                                children: "(for payments made on or before October 3, 2026)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1138,
                                                                columnNumber: 105
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1138,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "mt-3 pt-3 border-t border-blue-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                children: "Registration Fee Inclusions:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1140,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "list-disc list-inside text-sm space-y-1 ml-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: "Conference kit"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1142,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: "Two (2) managed buffet lunches"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1143,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: "Five (5) snacks"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1144,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1141,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1139,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "mt-3 pt-3 border-t border-blue-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                children: "Payment Details"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1148,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-sm",
                                                                children: "Payments may be deposited or transferred to the following official account:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1149,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "bg-white p-4 rounded-lg mt-2 space-y-1 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                                children: "Account Name:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1151,
                                                                                columnNumber: 28
                                                                            }, this),
                                                                            " Philippine Extension Managers Network, Inc."
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1151,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                                children: "Bank:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1152,
                                                                                columnNumber: 28
                                                                            }, this),
                                                                            " Bank of the Philippine Islands"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1152,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                                children: "Account Number:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1153,
                                                                                columnNumber: 28
                                                                            }, this),
                                                                            " 1330-0222-23"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1153,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                                children: "Branch:"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1154,
                                                                                columnNumber: 28
                                                                            }, this),
                                                                            " Iloilo Jaro Branch: E Lopez St. Cor D.B. Ledesma St., Jaro, Iloilo City 5000"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1154,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1150,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-blue-600 mt-2",
                                                                children: "After payment, upload a clear copy of the validated deposit slip or electronic transaction receipt. The proof of payment must indicate the participant's full name, institution, amount paid, date of payment, and transaction or reference number."
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1156,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1147,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1136,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1134,
                                        columnNumber: 17
                                    }, this),
                                    userSubmissions.filter((s)=>s.status === 'endorse').length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "bg-white border border-slate-200 rounded-xl p-6 mb-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-slate-900 mb-4",
                                                        children: "Upload Payment Proof"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1165,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-slate-600 mb-4",
                                                        children: "Select an endorsed submission and upload your payment proof."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1166,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                        onSubmit: handlePaymentUpload,
                                                        className: "jsx-7ae810da9302cfe2" + " " + "space-y-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                        children: "Select Submission"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1170,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        onChange: (e)=>{
                                                                            const subId = parseInt(e.target.value);
                                                                            const sub = userSubmissions.find((s)=>s.id === subId);
                                                                            setSelectedSubmission(sub);
                                                                            if (sub) {
                                                                                checkPaymentStatus(sub.id);
                                                                            }
                                                                        },
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                className: "jsx-7ae810da9302cfe2",
                                                                                children: "Select a submission"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1182,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            userSubmissions.filter((s)=>s.status === 'endorse').map((sub)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: sub.id,
                                                                                    className: "jsx-7ae810da9302cfe2",
                                                                                    children: sub.extension_project_title
                                                                                }, sub.id, false, {
                                                                                    fileName: "[project]/app/submit/page.js",
                                                                                    lineNumber: 1184,
                                                                                    columnNumber: 31
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1171,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1169,
                                                                columnNumber: 25
                                                            }, this),
                                                            selectedSubmission && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                        children: "Reference Number"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1195,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        value: referenceNumber,
                                                                                        onChange: (e)=>setReferenceNumber(e.target.value),
                                                                                        placeholder: "Enter transaction/reference number",
                                                                                        required: true,
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1196,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1194,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                        children: "Payment Amount (PHP)"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1206,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "number",
                                                                                        value: paymentAmount,
                                                                                        onChange: (e)=>setPaymentAmount(e.target.value),
                                                                                        placeholder: "6500.00",
                                                                                        required: true,
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1207,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1205,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1193,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-1.5",
                                                                                children: "Payment Date"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1218,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "date",
                                                                                value: paymentDate,
                                                                                onChange: (e)=>setPaymentDate(e.target.value),
                                                                                required: true,
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1219,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1217,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition text-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                                    fill: "none",
                                                                                    viewBox: "0 0 24 24",
                                                                                    strokeWidth: 1.5,
                                                                                    stroke: "currentColor",
                                                                                    className: "jsx-7ae810da9302cfe2" + " " + "w-6 h-6 text-blue-600",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                        strokeLinecap: "round",
                                                                                        strokeLinejoin: "round",
                                                                                        d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
                                                                                        className: "jsx-7ae810da9302cfe2"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1231,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/submit/page.js",
                                                                                    lineNumber: 1230,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1229,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "block text-sm font-semibold text-slate-700 mb-2",
                                                                                children: "Payment Proof (Image or PDF)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1234,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "file",
                                                                                accept: ".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf",
                                                                                onChange: (e)=>setPaymentFile(e.target.files[0]),
                                                                                required: true,
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-blue-700 file:text-white file:font-semibold hover:file:bg-blue-800 cursor-pointer transition"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1235,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-slate-500 mt-2",
                                                                                children: "Accepted formats: JPG, PNG, GIF, BMP, WEBP, PDF"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1242,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            paymentFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-emerald-600 mt-2",
                                                                                children: paymentFile.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1244,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1228,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    paymentData && paymentData.exists && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + `p-4 rounded-xl ${paymentData.payment.payment_status === 'verified' ? 'bg-emerald-50 border border-emerald-200' : paymentData.payment.payment_status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold",
                                                                                children: [
                                                                                    "Payment Status: ",
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + ((paymentData.payment.payment_status === 'verified' ? 'text-emerald-600' : paymentData.payment.payment_status === 'rejected' ? 'text-red-600' : 'text-yellow-600') || ""),
                                                                                        children: paymentData.payment.payment_status.toUpperCase()
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1250,
                                                                                        columnNumber: 78
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1250,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            paymentData.payment.payment_status === 'rejected' && paymentData.payment.rejection_reason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-red-600 mt-1",
                                                                                children: [
                                                                                    "Reason: ",
                                                                                    paymentData.payment.rejection_reason
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1256,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            paymentData.payment.payment_proof_view_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                                href: paymentData.payment.payment_proof_view_url,
                                                                                target: "_blank",
                                                                                rel: "noopener noreferrer",
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 mt-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                        xmlns: "http://www.w3.org/2000/svg",
                                                                                        fill: "none",
                                                                                        viewBox: "0 0 24 24",
                                                                                        strokeWidth: 2,
                                                                                        stroke: "currentColor",
                                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-4 h-4",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                            strokeLinecap: "round",
                                                                                            strokeLinejoin: "round",
                                                                                            d: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
                                                                                            className: "jsx-7ae810da9302cfe2"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/submit/page.js",
                                                                                            lineNumber: 1261,
                                                                                            columnNumber: 39
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/submit/page.js",
                                                                                        lineNumber: 1260,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    "View Payment Proof"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1259,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1249,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "submit",
                                                                        disabled: isUploadingPayment || !paymentFile,
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed",
                                                                        children: isUploadingPayment ? 'Uploading...' : 'Upload Payment Proof'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1269,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1192,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1168,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1164,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "bg-white border border-slate-200 rounded-xl p-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-bold text-slate-900 mb-4",
                                                        children: "Payment History"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1283,
                                                        columnNumber: 23
                                                    }, this),
                                                    userPayments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "space-y-3",
                                                        children: userPayments.map((payment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7ae810da9302cfe2" + " " + "flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "font-semibold text-slate-900",
                                                                                children: payment.submission_title || 'Submission'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1289,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-slate-600",
                                                                                children: [
                                                                                    "Amount: PhP ",
                                                                                    payment.payment_amount
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1290,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-sm text-slate-600",
                                                                                children: [
                                                                                    "Reference: ",
                                                                                    payment.reference_number
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1291,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1288,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-right",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + `inline-flex px-3 py-1 rounded-full text-xs font-medium ${payment.payment_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : payment.payment_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`,
                                                                                children: payment.payment_status.toUpperCase()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1294,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-7ae810da9302cfe2" + " " + "text-xs text-slate-400 mt-1",
                                                                                children: new Date(payment.created_at).toLocaleDateString()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/submit/page.js",
                                                                                lineNumber: 1300,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/submit/page.js",
                                                                        lineNumber: 1293,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, payment.id, true, {
                                                                fileName: "[project]/app/submit/page.js",
                                                                lineNumber: 1287,
                                                                columnNumber: 29
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1285,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-7ae810da9302cfe2" + " " + "text-center text-slate-500 py-4",
                                                        children: "No payment records found."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1306,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1282,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1163,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7ae810da9302cfe2" + " " + "bg-white border border-slate-200 rounded-xl p-8 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    fill: "none",
                                                    viewBox: "0 0 24 24",
                                                    strokeWidth: 1.5,
                                                    stroke: "currentColor",
                                                    className: "jsx-7ae810da9302cfe2" + " " + "w-8 h-8 text-slate-400",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                                        className: "jsx-7ae810da9302cfe2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/submit/page.js",
                                                        lineNumber: 1314,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/submit/page.js",
                                                    lineNumber: 1313,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1312,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "text-lg font-semibold text-slate-700",
                                                children: "No Endorsed Submissions"
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1317,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "text-slate-500 text-sm mt-1",
                                                children: "You need to have an endorsed submission to make a payment."
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1318,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "jsx-7ae810da9302cfe2" + " " + "text-slate-500 text-sm",
                                                children: "Please wait for your submission to be endorsed by the evaluators."
                                            }, void 0, false, {
                                                fileName: "[project]/app/submit/page.js",
                                                lineNumber: 1319,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/submit/page.js",
                                        lineNumber: 1311,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/submit/page.js",
                                lineNumber: 1125,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/submit/page.js",
                            lineNumber: 723,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/submit/page.js",
                    lineNumber: 666,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/submit/page.js",
                lineNumber: 665,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "7ae810da9302cfe2",
                children: "@keyframes slideIn{0%{opacity:0;transform:translate(100%)}to{opacity:1;transform:translate(0)}}@keyframes progressShrink{0%{width:100%}to{width:0%}}.animate-slide-in.jsx-7ae810da9302cfe2{animation:.3s ease-out slideIn}.animate-progress-shrink.jsx-7ae810da9302cfe2{animation:5s linear forwards progressShrink}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/submit/page.js",
        lineNumber: 634,
        columnNumber: 5
    }, this);
}
_s1(SubmitPage, "4uZaJJQfAZE/r2Bo3QSW//2w+t0=");
_c1 = SubmitPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "Toast");
__turbopack_context__.k.register(_c1, "SubmitPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_submit_page_08ltfcz.js.map