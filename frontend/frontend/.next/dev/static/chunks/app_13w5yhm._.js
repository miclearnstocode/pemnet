(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/ConfirmModal.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Yes', cancelText = 'No', isLoading = false, type = 'success', showEmailCheckbox = false, emailChecked = true, onEmailToggle = null }) {
    if (!isOpen) return null;
    const isWarning = type === 'warning';
    const isInfo = type === 'info';
    const getIcon = ()=>{
        if (isWarning) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                strokeWidth: 1.5,
                stroke: "currentColor",
                className: "w-6 h-6 text-yellow-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                }, void 0, false, {
                    fileName: "[project]/app/components/ConfirmModal.js",
                    lineNumber: 26,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ConfirmModal.js",
                lineNumber: 25,
                columnNumber: 9
            }, this);
        } else if (isInfo) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                strokeWidth: 1.5,
                stroke: "currentColor",
                className: "w-6 h-6 text-blue-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                }, void 0, false, {
                    fileName: "[project]/app/components/ConfirmModal.js",
                    lineNumber: 32,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ConfirmModal.js",
                lineNumber: 31,
                columnNumber: 9
            }, this);
        } else {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                strokeWidth: 1.5,
                stroke: "currentColor",
                className: "w-6 h-6 text-emerald-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                }, void 0, false, {
                    fileName: "[project]/app/components/ConfirmModal.js",
                    lineNumber: 38,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ConfirmModal.js",
                lineNumber: 37,
                columnNumber: 9
            }, this);
        }
    };
    const getBgColor = ()=>{
        if (isWarning) return 'bg-yellow-100';
        if (isInfo) return 'bg-blue-100';
        return 'bg-emerald-100';
    };
    const getButtonColor = ()=>{
        if (isWarning) return 'bg-yellow-600 hover:bg-yellow-700';
        if (isInfo) return 'bg-blue-600 hover:bg-blue-700';
        return 'bg-emerald-600 hover:bg-emerald-700';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-60 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/components/ConfirmModal.js",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-full flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${getBgColor()}`,
                                children: getIcon()
                            }, void 0, false, {
                                fileName: "[project]/app/components/ConfirmModal.js",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-slate-900 text-center mb-2",
                                children: title || 'Confirm Action'
                            }, void 0, false, {
                                fileName: "[project]/app/components/ConfirmModal.js",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-slate-600 text-center mb-6",
                                children: typeof message === 'string' && (message.includes('<') || message.includes('>')) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    dangerouslySetInnerHTML: {
                                        __html: message
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ConfirmModal.js",
                                    lineNumber: 72,
                                    columnNumber: 17
                                }, this) : message
                            }, void 0, false, {
                                fileName: "[project]/app/components/ConfirmModal.js",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this),
                            showEmailCheckbox && onEmailToggle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "flex items-center gap-2 text-sm text-blue-800 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: emailChecked,
                                                onChange: (e)=>onEmailToggle(e.target.checked),
                                                className: "w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ConfirmModal.js",
                                                lineNumber: 82,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Send confirmation email to corresponding author"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ConfirmModal.js",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ConfirmModal.js",
                                        lineNumber: 81,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-blue-600 mt-1 ml-6",
                                        children: "An email will be sent to the corresponding author with the acceptance details."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ConfirmModal.js",
                                        lineNumber: 90,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ConfirmModal.js",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex gap-3 ${showEmailCheckbox ? 'mt-4' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        disabled: isLoading,
                                        className: "flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50",
                                        children: cancelText
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ConfirmModal.js",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onConfirm,
                                        disabled: isLoading,
                                        className: `flex-1 px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white ${getButtonColor()}`,
                                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/ConfirmModal.js",
                                                    lineNumber: 111,
                                                    columnNumber: 21
                                                }, this),
                                                "Processing..."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/ConfirmModal.js",
                                            lineNumber: 110,
                                            columnNumber: 19
                                        }, this) : confirmText
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ConfirmModal.js",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ConfirmModal.js",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ConfirmModal.js",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/ConfirmModal.js",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ConfirmModal.js",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ConfirmModal.js",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_c = ConfirmModal;
var _c;
__turbopack_context__.k.register(_c, "ConfirmModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/DiscussionSection.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DiscussionSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function DiscussionSection({ submissionId, currentUserId, currentUserName, onNewMessage, initialDiscussions = [], isMasterApprover = false, title = 'Evaluator Discussion', maxHeight = '300px' }) {
    _s();
    const [discussions, setDiscussions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialDiscussions);
    const [newMessage, setNewMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSending, setIsSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [allUsers, setAllUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isInitialMount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    // Fetch users on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscussionSection.useEffect": ()=>{
            fetchUsers();
        }
    }["DiscussionSection.useEffect"], []);
    // Fetch discussions when submissionId changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscussionSection.useEffect": ()=>{
            if (submissionId) {
                fetchDiscussions();
            } else {
                setDiscussions([]);
                setError(null);
            }
        }
    }["DiscussionSection.useEffect"], [
        submissionId
    ]);
    // Update discussions when initialDiscussions changes (but only if it's a real change)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscussionSection.useEffect": ()=>{
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            // Compare by IDs to avoid unnecessary updates
            const currentIds = discussions.map({
                "DiscussionSection.useEffect.currentIds": (d)=>d.id
            }["DiscussionSection.useEffect.currentIds"]).join(',');
            const newIds = initialDiscussions.map({
                "DiscussionSection.useEffect.newIds": (d)=>d.id
            }["DiscussionSection.useEffect.newIds"]).join(',');
            if (currentIds !== newIds && initialDiscussions.length > 0) {
                setDiscussions(initialDiscussions);
            }
        }
    }["DiscussionSection.useEffect"], [
        initialDiscussions
    ]);
    const fetchUsers = async ()=>{
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/users`);
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const fetchDiscussions = async ()=>{
        if (!submissionId) {
            console.log('No submissionId provided to DiscussionSection');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching discussions for submissionId:', submissionId);
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${submissionId}/discussions`);
            if (res.ok) {
                const data = await res.json();
                console.log('Discussions fetched:', data);
                setDiscussions(Array.isArray(data) ? data : []);
            } else {
                const errorText = await res.text();
                console.error('Failed to fetch discussions:', res.status, errorText);
                setError(`Failed to load discussions (${res.status})`);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
            setError('Network error loading discussions');
        } finally{
            setIsLoading(false);
        }
    };
    const postMessage = async ()=>{
        if (!newMessage.trim() || !submissionId) {
            console.log('Cannot send empty message or missing submissionId');
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            console.log('Posting message to submissionId:', submissionId);
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${submissionId}/discussions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evaluator_id: currentUserId,
                    message: newMessage
                })
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Message posted:', data);
                const newDiscussion = {
                    id: data.id || Date.now(),
                    evaluator_id: data.evaluator_id || currentUserId,
                    evaluator_name: currentUserName || 'You',
                    message: data.message || newMessage,
                    created_at: data.created_at || new Date().toLocaleString()
                };
                setDiscussions((prev)=>[
                        ...prev,
                        newDiscussion
                    ]);
                setNewMessage('');
                if (onNewMessage) {
                    onNewMessage(newDiscussion);
                }
            } else {
                const errorText = await res.text();
                console.error('Failed to post message:', res.status, errorText);
                setError(`Failed to send message (${res.status})`);
            }
        } catch (error) {
            console.error('Error posting message:', error);
            setError('Network error sending message');
        } finally{
            setIsSending(false);
        }
    };
    const getEvaluatorName = (id)=>{
        // If id is a string, try to convert to number
        const userId = typeof id === 'string' ? parseInt(id) : id;
        const user = allUsers.find((u)=>u.id === userId);
        return user ? user.full_name : `Evaluator ${id}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-linear-to-br from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl p-4 ${isMasterApprover ? 'border-purple-200' : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faComment"],
                                className: `w-5 h-5 ${isMasterApprover ? 'text-purple-600' : 'text-indigo-600'}`
                            }, void 0, false, {
                                fileName: "[project]/app/components/DiscussionSection.js",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: `text-sm font-bold uppercase tracking-wider ${isMasterApprover ? 'text-purple-700' : 'text-slate-700'}`,
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/app/components/DiscussionSection.js",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-slate-400",
                                children: [
                                    "(",
                                    discussions.length,
                                    " ",
                                    discussions.length === 1 ? 'message' : 'messages',
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DiscussionSection.js",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            isMasterApprover && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600 border border-purple-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
                                        className: "w-2.5 h-2.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DiscussionSection.js",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this),
                                    "Master View"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DiscussionSection.js",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            submissionId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-slate-400 ml-1",
                                children: [
                                    "(ID: ",
                                    submissionId,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DiscussionSection.js",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: fetchDiscussions,
                        disabled: isLoading || !submissionId,
                        className: "text-xs text-blue-600 hover:text-blue-700 font-medium transition disabled:opacity-50 flex items-center gap-1",
                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                                    className: "w-3 h-3 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 193,
                                    columnNumber: 15
                                }, this),
                                "Loading..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 192,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSync"],
                                    className: "w-3 h-3"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 198,
                                    columnNumber: 15
                                }, this),
                                "Refresh"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 197,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/DiscussionSection.js",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faComment"],
                        className: "w-3 h-3"
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this),
                    error,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: fetchDiscussions,
                        className: "text-red-700 underline ml-auto",
                        children: "Retry"
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 210,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/DiscussionSection.js",
                lineNumber: 207,
                columnNumber: 9
            }, this),
            !submissionId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-600 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faComment"],
                        className: "w-3 h-3"
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this),
                    "No submission selected"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/DiscussionSection.js",
                lineNumber: 218,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl p-3 mb-3 space-y-3",
                style: {
                    maxHeight
                },
                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                        className: "w-6 h-6 text-blue-500 animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 231,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/DiscussionSection.js",
                    lineNumber: 230,
                    columnNumber: 11
                }, this) : discussions.length > 0 ? discussions.map((msg)=>{
                    const isCurrentUser = msg.evaluator_id === currentUserId;
                    const evaluatorName = msg.evaluator_name || getEvaluatorName(msg.evaluator_id) || 'Unknown';
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                                            className: `w-3 h-3 ${isCurrentUser ? 'text-blue-500' : 'text-slate-400'}`
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DiscussionSection.js",
                                            lineNumber: 242,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `text-xs font-bold ${isCurrentUser ? 'text-blue-700' : 'text-slate-600'}`,
                                            children: [
                                                isCurrentUser ? 'You' : evaluatorName,
                                                isMasterApprover && !isCurrentUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-1 text-[10px] font-normal text-purple-500",
                                                    children: "(Evaluator)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DiscussionSection.js",
                                                    lineNumber: 249,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/DiscussionSection.js",
                                            lineNumber: 246,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-slate-400 flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faClock"],
                                                    className: "w-2.5 h-2.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DiscussionSection.js",
                                                    lineNumber: 253,
                                                    columnNumber: 23
                                                }, this),
                                                msg.created_at
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/DiscussionSection.js",
                                            lineNumber: 252,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 241,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `px-4 py-2.5 rounded-2xl text-sm ${isCurrentUser ? `bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md ${isMasterApprover ? 'shadow-blue-500/30' : 'shadow-blue-500/20'}` : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "whitespace-pre-wrap wrap-break-word",
                                        children: msg.message || msg.text || 'No message'
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DiscussionSection.js",
                                        lineNumber: 262,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 257,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 240,
                            columnNumber: 17
                        }, this)
                    }, msg.id || Math.random(), false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 239,
                        columnNumber: 15
                    }, this);
                }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-8 text-slate-400",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faComment"],
                            className: "w-8 h-8 text-slate-300 mb-2"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 270,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm",
                            children: "No discussions yet"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 271,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "Start the conversation with other evaluators"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 272,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DiscussionSection.js",
                    lineNumber: 269,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/DiscussionSection.js",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: newMessage,
                        onChange: (e)=>setNewMessage(e.target.value),
                        onKeyDown: (e)=>e.key === 'Enter' && postMessage(),
                        placeholder: isMasterApprover ? "Write a message to evaluators..." : "Write a message to other evaluators...",
                        className: "flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all",
                        disabled: isSending || !submissionId
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 279,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: postMessage,
                        disabled: !newMessage.trim() || isSending || !submissionId,
                        className: `inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isMasterApprover ? 'bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25' : 'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'} disabled:opacity-50 disabled:cursor-not-allowed`,
                        children: isSending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 299,
                                    columnNumber: 15
                                }, this),
                                "Sending..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 298,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faPaperPlane"],
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DiscussionSection.js",
                                    lineNumber: 304,
                                    columnNumber: 15
                                }, this),
                                "Send"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DiscussionSection.js",
                            lineNumber: 303,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DiscussionSection.js",
                        lineNumber: 288,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/DiscussionSection.js",
                lineNumber: 278,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/DiscussionSection.js",
        lineNumber: 160,
        columnNumber: 5
    }, this);
}
_s(DiscussionSection, "w4nlfPBNZibXCewAKPKi7/uuGf8=");
_c = DiscussionSection;
var _c;
__turbopack_context__.k.register(_c, "DiscussionSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/DowngradeModal.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DowngradeModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function DowngradeModal({ isOpen, onClose, onSubmit, isLoading, paperCategory = '' }) {
    _s();
    const [selectedOption, setSelectedOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Only "Completed Extension Project Papers" can be downgraded
    const isDowngradable = (()=>{
        if (!paperCategory) return false;
        const normalized = String(paperCategory).toLowerCase();
        // Match any variant: "Completed Extension Project Papers", "Completed Extension Project Paper", "Completed"
        return normalized.includes('completed');
    })();
    // Reset selection when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DowngradeModal.useEffect": ()=>{
            if (isOpen) {
                setSelectedOption(isDowngradable ? 'downgraded-non_competitive' : '');
            }
        }
    }["DowngradeModal.useEffect"], [
        isOpen,
        isDowngradable
    ]);
    if (!isOpen) return null;
    // Poster Only option has been REMOVED.
    // Only Non-Competitive downgrade remains.
    const downgradeOptions = [
        {
            value: 'downgraded-non_competitive',
            label: 'Non-Competitive Presentation with Poster',
            description: 'Abstract is accepted as a poster presentation only (non-competitive)'
        }
    ];
    const handleSubmit = ()=>{
        if (!selectedOption || !isDowngradable) return;
        onSubmit(selectedOption);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-55 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/components/DowngradeModal.js",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-full flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-6 py-4 border-b border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-bold text-slate-900",
                                    children: "Downgrade Submission"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "text-slate-400 hover:text-slate-600 transition",
                                    "aria-label": "Close modal",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        strokeWidth: 2,
                                        stroke: "currentColor",
                                        className: "w-6 h-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M6 18L18 6M6 6l12 12"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 60,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DowngradeModal.js",
                                        lineNumber: 59,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DowngradeModal.js",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: [
                                !isDowngradable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-red-50 border border-red-200 rounded-xl mb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLock"],
                                                className: "w-5 h-5 text-red-600 mt-0.5 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                lineNumber: 70,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-red-800 mb-1",
                                                        children: "Downgrade Not Allowed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 72,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-red-700",
                                                        children: [
                                                            "Only ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: "Completed Extension Project Papers"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                                lineNumber: 76,
                                                                columnNumber: 28
                                                            }, this),
                                                            " can be downgraded to Non-Competitive Presentation."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 75,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-red-600 mt-2",
                                                        children: [
                                                            "Current Paper Category:",
                                                            ' ',
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-semibold",
                                                                children: paperCategory || 'Not specified'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                                lineNumber: 80,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 78,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                lineNumber: 71,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DowngradeModal.js",
                                        lineNumber: 69,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-yellow-800 mb-1",
                                            children: "⚠️ Downgrade Option"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 89,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-yellow-700",
                                            children: [
                                                "Select the downgrade type. This will update the evaluation status to ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Non-Competitive Presentation"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DowngradeModal.js",
                                                    lineNumber: 91,
                                                    columnNumber: 88
                                                }, this),
                                                "."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 88,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-semibold text-slate-700 mb-3",
                                    children: "Select Downgrade Type"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: downgradeOptions.map((option)=>{
                                        const disabled = !isDowngradable;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            onClick: ()=>{
                                                if (disabled) return;
                                                setSelectedOption(option.value);
                                            },
                                            className: `p-3 border rounded-xl transition ${disabled ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : selectedOption === option.value ? 'border-yellow-500 bg-yellow-50 cursor-pointer' : 'border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/50 cursor-pointer'}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-0.5",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === option.value && !disabled ? 'border-yellow-500 bg-yellow-500' : 'border-slate-300'}`,
                                                            children: selectedOption === option.value && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-1.5 h-1.5 rounded-full bg-white"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                                lineNumber: 126,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DowngradeModal.js",
                                                            lineNumber: 120,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 119,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-semibold text-slate-900",
                                                                children: option.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                                lineNumber: 131,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-slate-500 mt-0.5",
                                                                children: option.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                                lineNumber: 132,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 130,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                lineNumber: 118,
                                                columnNumber: 21
                                            }, this)
                                        }, option.value, false, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 104,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            disabled: isLoading,
                                            className: "flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 141,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSubmit,
                                            disabled: !selectedOption || !isDowngradable || isLoading,
                                            title: !isDowngradable ? 'Only Completed Extension Project Papers can be downgraded' : '',
                                            className: "flex-1 px-4 py-2 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DowngradeModal.js",
                                                        lineNumber: 156,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Submitting..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DowngradeModal.js",
                                                lineNumber: 155,
                                                columnNumber: 19
                                            }, this) : 'Confirm Downgrade'
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DowngradeModal.js",
                                            lineNumber: 148,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/DowngradeModal.js",
                                    lineNumber: 140,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DowngradeModal.js",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DowngradeModal.js",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/DowngradeModal.js",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/DowngradeModal.js",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(DowngradeModal, "6qrs5fI+ea3skPVkyt44zCXTdWg=");
_c = DowngradeModal;
var _c;
__turbopack_context__.k.register(_c, "DowngradeModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/EditSubmission.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditSubmission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function EditSubmission({ isOpen, onClose, data, onSave, isLoading = false, currentUser, isMasterApprover = false, title = 'Edit Submission', fields = null, submissionType = 'system' }) {
    _s();
    const [editForm, setEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [showSucDropdown, setShowSucDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sucSearchTerm, setSucSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sucList, setSucList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isAddingSuc, setIsAddingSuc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newSucName, setNewSucName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newSucRegion, setNewSucRegion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasChanges, setHasChanges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const systemFields = {
        extension_project_title: {
            label: 'Title',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
            type: 'text'
        },
        project_leader: {
            label: 'Project Leader',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            type: 'text'
        },
        presenter: {
            label: 'Presenter',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
            type: 'text'
        },
        suc_agencies: {
            label: 'SUC / Agency',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
            type: 'suc'
        },
        corresponding_author_name: {
            label: 'Corresponding Author',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
            type: 'text'
        },
        corresponding_author_email: {
            label: 'Corresponding Email',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
            type: 'email'
        },
        corresponding_author_position: {
            label: 'Corresponding Position',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
            type: 'text'
        },
        co_authors: {
            label: 'Co-Authors',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
            type: 'text'
        },
        paper_category: {
            label: 'Paper Category',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
            type: 'select',
            options: [
                'Not specified',
                'Completed Extension Project Paper',
                'Ongoing Extension Project Paper'
            ]
        },
        thematic_area: {
            label: 'Thematic Area',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
            type: 'select',
            options: [
                'Not specified',
                'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
                'Health, Nutrition, Wellness, and Community Care',
                'Education, Literacy, Skills Development, and Lifelong Learning',
                'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
                'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
            ]
        }
    };
    const emailFields = {
        title: {
            label: 'Title',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
            type: 'text'
        },
        project_leader: {
            label: 'Project Leader',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            type: 'text'
        },
        sucs: {
            label: 'SUC / Agency',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
            type: 'suc'
        },
        corresponding_author_name: {
            label: 'Corresponding Author',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
            type: 'text'
        },
        corresponding_author_email: {
            label: 'Corresponding Email',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
            type: 'email'
        },
        corresponding_author_position: {
            label: 'Corresponding Position',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
            type: 'text'
        },
        authors_list: {
            label: 'Authors List',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
            type: 'text'
        },
        paper_category: {
            label: 'Paper Category',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
            type: 'select',
            options: [
                'Not specified',
                'Completed Extension Project Papers',
                'Ongoing Extension Project Papers'
            ]
        },
        thematic_area: {
            label: 'Thematic Area',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
            type: 'select',
            options: [
                'Not specified',
                'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
                'Health, Nutrition, Wellness, and Community Care',
                'Education, Literacy, Skills Development, and Lifelong Learning',
                'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
                'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
            ]
        },
        theme: {
            label: 'Theme',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
            type: 'text'
        }
    };
    const defaultFields = submissionType === 'email' ? emailFields : systemFields;
    const fieldConfig = fields || defaultFields;
    // ---- Form initialization ----
    // Empty values (null / undefined / '') are filled with 'Not specified'
    // so the user sees the same value here as in the details panel.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditSubmission.useEffect": ()=>{
            if (isOpen && data) {
                const initialForm = {};
                Object.keys(fieldConfig).forEach({
                    "EditSubmission.useEffect": (key)=>{
                        const rawValue = data[key];
                        // Normalize: treat null / undefined / '' as empty
                        const isEmpty = rawValue === undefined || rawValue === null || typeof rawValue === 'string' && rawValue.trim() === '';
                        if (isEmpty) {
                            initialForm[key] = 'Not specified';
                        } else {
                            initialForm[key] = rawValue;
                        }
                    }
                }["EditSubmission.useEffect"]);
                setEditForm(initialForm);
                setHasChanges(false);
            }
        }
    }["EditSubmission.useEffect"], [
        isOpen,
        data,
        fieldConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditSubmission.useEffect": ()=>{
            if (isOpen) {
                fetchSucs();
            }
        }
    }["EditSubmission.useEffect"], [
        isOpen
    ]);
    const fetchSucs = async ()=>{
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/sucs`);
            if (res.ok) {
                const data = await res.json();
                setSucList(data);
            }
        } catch (err) {
            console.error('Error fetching SUCs:', err);
        }
    };
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setEditForm((prev)=>({
                ...prev,
                [name]: value
            }));
        setHasChanges(true);
    };
    const handleSucSelect = (sucName)=>{
        const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
        setEditForm((prev)=>({
                ...prev,
                [sucField]: sucName
            }));
        setShowSucDropdown(false);
        setSucSearchTerm('');
        setHasChanges(true);
    };
    const handleAddNewSuc = async ()=>{
        if (!newSucName.trim()) return;
        setIsAddingSuc(true);
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/sucs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newSucName.trim(),
                    region: newSucRegion.trim() || 'Other'
                })
            });
            if (res.ok) {
                const data = await res.json();
                setSucList((prev)=>[
                        ...prev,
                        data
                    ]);
                const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
                setEditForm((prev)=>({
                        ...prev,
                        [sucField]: data.name
                    }));
                setNewSucName('');
                setNewSucRegion('');
                setShowSucDropdown(false);
                setHasChanges(true);
            } else {
                const error = await res.json();
                console.error('Failed to add SUC:', error);
            }
        } catch (error) {
            console.error('Error adding SUC:', error);
        } finally{
            setIsAddingSuc(false);
        }
    };
    const handleSubmit = ()=>{
        if (!hasChanges) {
            onClose();
            return;
        }
        setShowConfirm(true);
    };
    // Strip 'Not specified' back to '' before saving so the DB stores null/empty
    const buildCleanPayload = ()=>{
        const clean = {};
        Object.keys(editForm).forEach((key)=>{
            const value = editForm[key];
            if (typeof value === 'string' && value.trim() === 'Not specified') {
                clean[key] = '';
            } else {
                clean[key] = value;
            }
        });
        return clean;
    };
    const confirmSave = ()=>{
        setShowConfirm(false);
        if (onSave) {
            onSave(buildCleanPayload());
        }
    };
    const cancelSave = ()=>{
        setShowConfirm(false);
    };
    if (!isOpen) return null;
    const filteredSucs = sucList.filter((suc)=>suc.name.toLowerCase().includes(sucSearchTerm.toLowerCase()));
    const getSucValue = ()=>{
        if (submissionType === 'email') {
            return editForm.sucs || '';
        }
        return editForm.suc_agencies || '';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-60 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                        onClick: onClose
                    }, void 0, false, {
                        fileName: "[project]/app/components/EditSubmission.js",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative min-h-full flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-center justify-between px-6 py-4 border-b border-slate-200 ${isMasterApprover ? 'bg-linear-to-rrom-purple-50 to-blue-50' : 'bg-linear-to-r from-blue-50 to-white'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-10 h-10 rounded-lg flex items-center justify-center ${isMasterApprover ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEdit"],
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 250,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 249,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-lg font-bold text-slate-900",
                                                            children: title
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 253,
                                                            columnNumber: 19
                                                        }, this),
                                                        isMasterApprover && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-purple-600 font-medium",
                                                            children: "Master Approver Edit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 255,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-slate-400",
                                                            children: submissionType === 'email' ? '📧 Email Submission' : '📝 System Submission'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 257,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 252,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 248,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            className: "w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTimes"],
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 266,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 262,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/EditSubmission.js",
                                    lineNumber: 247,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 overflow-y-auto max-h-[calc(90vh-180px)]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: Object.keys(fieldConfig).map((key)=>{
                                                const field = fieldConfig[key];
                                                const value = editForm[key] || '';
                                                if (key === 'sucs' && submissionType !== 'email') {
                                                    return null;
                                                }
                                                if (key === 'suc_agencies' && submissionType === 'email') {
                                                    return null;
                                                }
                                                if (field.type === 'select') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: field.icon,
                                                                        className: "w-4 h-4 text-blue-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                        lineNumber: 288,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    field.label
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                lineNumber: 287,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                name: key,
                                                                value: value,
                                                                onChange: handleChange,
                                                                className: "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all bg-white",
                                                                children: field.options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: option,
                                                                        children: option
                                                                    }, option, false, {
                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                        lineNumber: 298,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                lineNumber: 291,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, key, true, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 286,
                                                        columnNumber: 23
                                                    }, this);
                                                }
                                                if (field.type === 'suc') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: field.icon,
                                                                        className: "w-4 h-4 text-amber-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                        lineNumber: 309,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    field.label
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                lineNumber: 308,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        name: key,
                                                                        value: getSucValue(),
                                                                        onChange: (e)=>{
                                                                            const sucField = submissionType === 'email' ? 'sucs' : 'suc_agencies';
                                                                            setEditForm((prev)=>({
                                                                                    ...prev,
                                                                                    [sucField]: e.target.value
                                                                                }));
                                                                            setSucSearchTerm(e.target.value);
                                                                            setShowSucDropdown(true);
                                                                            setHasChanges(true);
                                                                        },
                                                                        onFocus: ()=>setShowSucDropdown(true),
                                                                        placeholder: "Not specified",
                                                                        className: "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                        lineNumber: 313,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    showSucDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute z-60 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto",
                                                                        children: filteredSucs.length > 0 ? filteredSucs.map((suc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 flex items-center justify-between",
                                                                                onClick: ()=>handleSucSelect(suc.name),
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        children: suc.name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                                        lineNumber: 337,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs text-slate-400",
                                                                                        children: suc.region
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                                        lineNumber: 338,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, suc.id, true, {
                                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                                lineNumber: 332,
                                                                                columnNumber: 35
                                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-3",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-sm text-slate-500 mb-2",
                                                                                    children: "No SUC found. Add new:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                                    lineNumber: 343,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex gap-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            type: "text",
                                                                                            placeholder: "SUC Name",
                                                                                            value: newSucName,
                                                                                            onChange: (e)=>setNewSucName(e.target.value),
                                                                                            className: "flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                                                            lineNumber: 345,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            type: "text",
                                                                                            placeholder: "Region",
                                                                                            value: newSucRegion,
                                                                                            onChange: (e)=>setNewSucRegion(e.target.value),
                                                                                            className: "flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                                                            lineNumber: 352,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: handleAddNewSuc,
                                                                                            disabled: isAddingSuc,
                                                                                            className: "px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all disabled:opacity-50",
                                                                                            children: isAddingSuc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                                                                                                className: "w-4 h-4 animate-spin"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                                                lineNumber: 364,
                                                                                                columnNumber: 54
                                                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faPlus"],
                                                                                                className: "w-4 h-4"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                                                lineNumber: 364,
                                                                                                columnNumber: 126
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                                                            lineNumber: 359,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                                    lineNumber: 344,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                                            lineNumber: 342,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                                        lineNumber: 329,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/EditSubmission.js",
                                                                lineNumber: 312,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, key, true, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 307,
                                                        columnNumber: 23
                                                    }, this);
                                                }
                                                // Default: text/email input — placeholder shows "Not specified" for empty
                                                const isEmptyText = value === undefined || value === null || typeof value === 'string' && value.trim() === '' || value === 'Not specified';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: field.icon,
                                                                    className: "w-4 h-4 text-blue-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                    lineNumber: 386,
                                                                    columnNumber: 25
                                                                }, this),
                                                                field.label
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 385,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: field.type || 'text',
                                                            name: key,
                                                            value: value,
                                                            onChange: handleChange,
                                                            placeholder: "Not specified",
                                                            className: "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 placeholder:italic focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 389,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, key, true, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 384,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 272,
                                            columnNumber: 15
                                        }, this),
                                        isMasterApprover && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-semibold text-purple-700 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEdit"],
                                                            className: "w-4 h-4 mr-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 406,
                                                            columnNumber: 21
                                                        }, this),
                                                        "Master Approver Notes"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 405,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    name: "master_notes",
                                                    value: editForm.master_notes || '',
                                                    onChange: handleChange,
                                                    placeholder: "Add notes about this edit (optional)...",
                                                    className: "w-full px-4 py-2.5 border border-purple-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all bg-white",
                                                    rows: "3"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 409,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 404,
                                            columnNumber: 17
                                        }, this),
                                        data?.edited_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-xs text-slate-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faHistory"],
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 424,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Last edited: ",
                                                    new Date(data.edited_at).toLocaleString(),
                                                    data.edited_by && ` by ${data.edited_by}`
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 423,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 422,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/EditSubmission.js",
                                    lineNumber: 271,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-end gap-4 px-8 py-5 border-t border-slate-200 bg-slate-50/80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            disabled: isLoading,
                                            className: "px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50 min-w-25",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 434,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSubmit,
                                            disabled: isLoading,
                                            className: `px-8 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-3 text-white min-w-35 ${isMasterApprover ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'} disabled:opacity-50 disabled:cursor-not-allowed`,
                                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 452,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Saving..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 451,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSave"],
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 457,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Save Changes"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 456,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 441,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/EditSubmission.js",
                                    lineNumber: 433,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/EditSubmission.js",
                            lineNumber: 245,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/EditSubmission.js",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/EditSubmission.js",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            showConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-70 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                        onClick: cancelSave
                    }, void 0, false, {
                        fileName: "[project]/app/components/EditSubmission.js",
                        lineNumber: 470,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative min-h-full flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faExclamationTriangle"],
                                            className: "w-6 h-6 text-yellow-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/EditSubmission.js",
                                            lineNumber: 475,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/EditSubmission.js",
                                        lineNumber: 474,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-bold text-slate-900 text-center mb-2",
                                        children: "Confirm Changes"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/EditSubmission.js",
                                        lineNumber: 478,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-slate-600 text-center mb-6",
                                        children: [
                                            isMasterApprover ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    "Are you sure you want to save these changes? This action will be recorded in the edit history with your role as ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Master Approver"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/EditSubmission.js",
                                                        lineNumber: 484,
                                                        columnNumber: 136
                                                    }, this),
                                                    "."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 484,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Are you sure you want to save these changes? This action will be recorded in the edit history."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 486,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-400 mt-2",
                                                children: Object.keys(editForm).map((key)=>{
                                                    const originalValue = data?.[key] || '';
                                                    const newValue = editForm[key] || '';
                                                    if (originalValue !== newValue && originalValue !== '' && newValue !== '') {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block mt-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: [
                                                                        fieldConfig[key]?.label || key,
                                                                        ":"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                    lineNumber: 495,
                                                                    columnNumber: 29
                                                                }, this),
                                                                ' ',
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "line-through text-red-400",
                                                                    children: originalValue || '(empty)'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                    lineNumber: 496,
                                                                    columnNumber: 29
                                                                }, this),
                                                                ' → ',
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-emerald-600",
                                                                    children: newValue || '(empty)'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                                    lineNumber: 498,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, key, true, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 494,
                                                            columnNumber: 27
                                                        }, this);
                                                    }
                                                    return null;
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 488,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/EditSubmission.js",
                                        lineNumber: 482,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: cancelSave,
                                                disabled: isLoading,
                                                className: "flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 508,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: confirmSave,
                                                disabled: isLoading,
                                                className: "flex-1 px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-white bg-yellow-600 hover:bg-yellow-700",
                                                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 522,
                                                            columnNumber: 25
                                                        }, this),
                                                        "Saving..."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 521,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSave"],
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/EditSubmission.js",
                                                            lineNumber: 527,
                                                            columnNumber: 25
                                                        }, this),
                                                        "Yes, Save Changes"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/EditSubmission.js",
                                                    lineNumber: 526,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/EditSubmission.js",
                                                lineNumber: 515,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/EditSubmission.js",
                                        lineNumber: 507,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/EditSubmission.js",
                                lineNumber: 473,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/EditSubmission.js",
                            lineNumber: 472,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/EditSubmission.js",
                        lineNumber: 471,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/EditSubmission.js",
                lineNumber: 469,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/EditSubmission.js",
        lineNumber: 240,
        columnNumber: 5
    }, this);
}
_s(EditSubmission, "g9y/3Axp6xdrsgGN2AGZMA/hPPA=");
_c = EditSubmission;
var _c;
__turbopack_context__.k.register(_c, "EditSubmission");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ReassignModal.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReassignModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ReassignModal({ isOpen, onClose, onSubmit, currentThematicArea, userThematicAreas = [], isLoading }) {
    _s();
    const [selectedArea, setSelectedArea] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentThematicArea || '');
    const [showAllAreas, setShowAllAreas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Reset selected area when modal opens with new current area
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReassignModal.useEffect": ()=>{
            if (isOpen) {
                setSelectedArea(currentThematicArea || '');
            }
        }
    }["ReassignModal.useEffect"], [
        isOpen,
        currentThematicArea
    ]);
    if (!isOpen) return null;
    // All possible thematic areas (from your system)
    const allThematicAreas = [
        'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
        'Health, Nutrition, Wellness, and Community Care',
        'Education, Literacy, Skills Development, and Lifelong Learning',
        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience'
    ];
    const handleSubmit = ()=>{
        if (!selectedArea) return;
        onSubmit(selectedArea);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-55 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/components/ReassignModal.js",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-full flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-6 py-4 border-b border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-bold text-slate-900",
                                    children: "Reassign Thematic Area"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "text-slate-400 hover:text-slate-600 transition",
                                    "aria-label": "Close modal",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        strokeWidth: 2,
                                        stroke: "currentColor",
                                        className: "w-6 h-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M6 18L18 6M6 6l12 12"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 51,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ReassignModal.js",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ReassignModal.js",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-blue-700 mb-1",
                                            children: "Current Thematic Area"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 59,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-base font-bold text-blue-900",
                                            children: currentThematicArea || 'Not Set'
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 60,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this),
                                userThematicAreas.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-500 mb-2",
                                            children: "This user has used these thematic areas before:"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-1",
                                            children: userThematicAreas.map((area, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `px-2 py-1 rounded-full text-xs font-medium ${area === currentThematicArea ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-600'}`,
                                                    children: area.length > 30 ? area.substring(0, 30) + '...' : area
                                                }, idx, false, {
                                                    fileName: "[project]/app/components/ReassignModal.js",
                                                    lineNumber: 73,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-semibold text-slate-700 mb-2",
                                    children: "Select New Thematic Area"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: selectedArea,
                                    onChange: (e)=>setSelectedArea(e.target.value),
                                    className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none",
                                    disabled: isLoading,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "-- Select New Area --"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 99,
                                            columnNumber: 15
                                        }, this),
                                        allThematicAreas.map((area)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: area,
                                                children: area
                                            }, area, false, {
                                                fileName: "[project]/app/components/ReassignModal.js",
                                                lineNumber: 101,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this),
                                selectedArea && selectedArea !== currentThematicArea && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-yellow-700",
                                        children: [
                                            '🔄 Changing from "',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: currentThematicArea || 'Not Set'
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ReassignModal.js",
                                                lineNumber: 109,
                                                columnNumber: 37
                                            }, this),
                                            '" to "',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedArea
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ReassignModal.js",
                                                lineNumber: 109,
                                                columnNumber: 94
                                            }, this),
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ReassignModal.js",
                                        lineNumber: 108,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            disabled: isLoading,
                                            className: "flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 115,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSubmit,
                                            disabled: !selectedArea || selectedArea === currentThematicArea || isLoading,
                                            className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/ReassignModal.js",
                                                        lineNumber: 129,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Submitting..."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/ReassignModal.js",
                                                lineNumber: 128,
                                                columnNumber: 19
                                            }, this) : 'Reassign'
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ReassignModal.js",
                                            lineNumber: 122,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ReassignModal.js",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ReassignModal.js",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ReassignModal.js",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ReassignModal.js",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ReassignModal.js",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_s(ReassignModal, "KMNFZ/8wKrPHBx169QP5N8JwoN0=");
_c = ReassignModal;
var _c;
__turbopack_context__.k.register(_c, "ReassignModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ViewHistory.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ViewHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ViewHistory({ isOpen, onClose, submissionId, extractedDataId, isMasterApprover = false, title = 'Edit History' }) {
    _s();
    const [revisions, setRevisions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expandedItems, setExpandedItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [allUsers, setAllUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ViewHistory.useEffect": ()=>{
            if (isOpen && (submissionId || extractedDataId)) {
                fetchHistory();
                fetchUsers();
            }
        }
    }["ViewHistory.useEffect"], [
        isOpen,
        submissionId,
        extractedDataId
    ]);
    const fetchUsers = async ()=>{
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/users`);
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const fetchHistory = async ()=>{
        setLoading(true);
        try {
            let url;
            if (extractedDataId) {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/extracted-data/${extractedDataId}/revisions`;
            } else if (submissionId) {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/submissions/${submissionId}/edit-history`;
            } else {
                setRevisions([]);
                setLoading(false);
                return;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setRevisions(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch revision history');
                setRevisions([]);
            }
        } catch (error) {
            console.error('Error fetching revision history:', error);
            setRevisions([]);
        } finally{
            setLoading(false);
        }
    };
    const toggleExpand = (id)=>{
        setExpandedItems((prev)=>({
                ...prev,
                [id]: !prev[id]
            }));
    };
    const getFieldLabel = (field)=>{
        const labels = {
            title: 'Title',
            authors: 'Authors',
            authors_list: 'Authors List',
            project_leader: 'Project Leader',
            sucs: 'SUC / Agency',
            corresponding_author_name: 'Corresponding Author',
            corresponding_author_email: 'Corresponding Email',
            corresponding_author_position: 'Corresponding Position',
            paper_category: 'Paper Category',
            thematic_area: 'Thematic Area',
            theme: 'Theme',
            extension_project_title: 'Project Title',
            author: 'Author',
            presenter: 'Presenter',
            co_authors: 'Co-Authors',
            suc_agencies: 'SUC / Agency',
            corresponding_author: 'Corresponding Author'
        };
        return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase());
    };
    const getFieldIcon = (field)=>{
        const icons = {
            title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
            authors: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
            authors_list: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            project_leader: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            sucs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
            corresponding_author_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
            corresponding_author_email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
            corresponding_author_position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
            paper_category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
            thematic_area: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
            theme: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
            extension_project_title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
            author: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            presenter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            co_authors: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
            suc_agencies: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"]
        };
        return icons[field] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"];
    };
    const getUserName = (userId)=>{
        const user = allUsers.find((u)=>u.id === userId);
        return user ? user.full_name : `User ${userId}`;
    };
    const getUserRole = (userId)=>{
        const user = allUsers.find((u)=>u.id === userId);
        return user ? user.role : 'user';
    };
    const getRoleBadge = (userId)=>{
        const role = getUserRole(userId);
        if (role === 'master_approver' || role === 'admin') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200",
                children: "Master Approver"
            }, void 0, false, {
                fileName: "[project]/app/components/ViewHistory.js",
                lineNumber: 155,
                columnNumber: 9
            }, this);
        }
        if (role === 'evaluator') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200",
                children: "Evaluator"
            }, void 0, false, {
                fileName: "[project]/app/components/ViewHistory.js",
                lineNumber: 162,
                columnNumber: 9
            }, this);
        }
        return null;
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-60 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/app/components/ViewHistory.js",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-full flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex items-center justify-between px-6 py-4 border-b border-slate-200 ${isMasterApprover ? 'bg-linear-to-r from-purple-50 to-blue-50' : 'bg-linear-to-r from-blue-50 to-white'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-10 h-10 rounded-lg flex items-center justify-center ${isMasterApprover ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faHistory"],
                                                className: "w-5 h-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ViewHistory.js",
                                                lineNumber: 185,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ViewHistory.js",
                                            lineNumber: 182,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-bold text-slate-900",
                                                    children: title
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/ViewHistory.js",
                                                    lineNumber: 188,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-slate-500",
                                                    children: [
                                                        revisions.length,
                                                        " ",
                                                        revisions.length === 1 ? 'edit' : 'edits',
                                                        " recorded"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/ViewHistory.js",
                                                    lineNumber: 189,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/ViewHistory.js",
                                            lineNumber: 187,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ViewHistory.js",
                                    lineNumber: 181,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition shadow-sm",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTimes"],
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 198,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ViewHistory.js",
                                    lineNumber: 194,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ViewHistory.js",
                            lineNumber: 178,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 overflow-y-auto max-h-[calc(90vh-140px)]",
                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center py-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                                    className: "w-8 h-8 text-blue-500 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ViewHistory.js",
                                    lineNumber: 206,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/ViewHistory.js",
                                lineNumber: 205,
                                columnNumber: 15
                            }, this) : revisions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: revisions.map((rev, index)=>{
                                    const isExpanded = expandedItems[rev.id] || false;
                                    const changes = rev.changes || {};
                                    const changeKeys = Object.keys(changes);
                                    const isLatest = index === 0;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `border rounded-xl overflow-hidden transition-all ${isLatest ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `p-4 cursor-pointer hover:bg-slate-50/50 transition flex items-center justify-between ${isLatest ? 'bg-blue-50/50' : ''}`,
                                                onClick: ()=>toggleExpand(rev.id),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3 flex-wrap",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                                                                        className: "w-5 h-5 text-slate-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 232,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-semibold text-sm text-slate-900",
                                                                        children: rev.edited_by_name || getUserName(rev.edited_by)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 236,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    getRoleBadge(rev.edited_by),
                                                                    isLatest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200",
                                                                        children: "Latest Edit"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 241,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 231,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-slate-400 flex items-center gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faClock"],
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 247,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    rev.created_at
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 246,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-slate-400",
                                                                children: [
                                                                    "(",
                                                                    changeKeys.length,
                                                                    " ",
                                                                    changeKeys.length === 1 ? 'field' : 'fields',
                                                                    " changed)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 250,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                        lineNumber: 230,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-slate-500",
                                                                children: [
                                                                    isExpanded ? 'Hide' : 'Show',
                                                                    " details"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 255,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                icon: isExpanded ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faChevronUp"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faChevronDown"],
                                                                className: "w-4 h-4 text-slate-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 258,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                        lineNumber: 254,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/ViewHistory.js",
                                                lineNumber: 224,
                                                columnNumber: 23
                                            }, this),
                                            isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 border-t border-slate-200 bg-slate-50/50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-3",
                                                    children: [
                                                        changeKeys.map((field)=>{
                                                            const change = changes[field];
                                                            const oldValue = change?.old !== undefined ? String(change.old) : '';
                                                            const newValue = change?.new !== undefined ? String(change.new) : '';
                                                            const fieldIcon = getFieldIcon(field);
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2 mb-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: fieldIcon,
                                                                                className: "w-4 h-4 text-blue-500"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 281,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-sm font-semibold text-slate-700",
                                                                                children: getFieldLabel(field)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 285,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 280,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-red-50 rounded-lg p-2 border border-red-100",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-red-600 font-medium mb-1",
                                                                                        children: "Old Value"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 291,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-red-800 line-through wrap-break-word",
                                                                                        children: oldValue || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-red-400 italic",
                                                                                            children: "Not set"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/components/ViewHistory.js",
                                                                                            lineNumber: 293,
                                                                                            columnNumber: 54
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 292,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 290,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-emerald-50 rounded-lg p-2 border border-emerald-100",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-emerald-600 font-medium mb-1",
                                                                                        children: "New Value"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 297,
                                                                                        columnNumber: 39
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-emerald-800 font-medium wrap-break-word",
                                                                                        children: newValue || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-emerald-400 italic",
                                                                                            children: "Not set"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/components/ViewHistory.js",
                                                                                            lineNumber: 299,
                                                                                            columnNumber: 54
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 298,
                                                                                        columnNumber: 39
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 296,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 289,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1 mt-2 text-[10px] text-slate-400",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faArrowRight"],
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 304,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            "Changed from ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "font-mono text-slate-500",
                                                                                children: [
                                                                                    '"',
                                                                                    oldValue || 'empty',
                                                                                    '"'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 305,
                                                                                columnNumber: 50
                                                                            }, this),
                                                                            "to ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "font-mono text-emerald-600",
                                                                                children: [
                                                                                    '"',
                                                                                    newValue || 'empty',
                                                                                    '"'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 306,
                                                                                columnNumber: 40
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 303,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                ]
                                                            }, field, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 276,
                                                                columnNumber: 33
                                                            }, this);
                                                        }),
                                                        rev.snapshot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                className: "group",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                        className: "text-xs font-medium text-blue-700 cursor-pointer flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEye"],
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 317,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            "View Full Snapshot After Edit",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faChevronDown"],
                                                                                className: "w-3 h-3 group-open:rotate-180 transition-transform"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 319,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 316,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mt-2 grid grid-cols-2 gap-2 text-xs",
                                                                        children: Object.entries(rev.snapshot).map(([key, value])=>value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-white rounded p-2 border border-blue-100",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium text-slate-600 block mb-0.5",
                                                                                        children: [
                                                                                            getFieldLabel(key),
                                                                                            ":"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 325,
                                                                                        columnNumber: 43
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-slate-800 wrap-break-word",
                                                                                        children: String(value)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                                        lineNumber: 328,
                                                                                        columnNumber: 43
                                                                                    }, this)
                                                                                ]
                                                                            }, key, true, {
                                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                                lineNumber: 324,
                                                                                columnNumber: 41
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/ViewHistory.js",
                                                                        lineNumber: 321,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/ViewHistory.js",
                                                                lineNumber: 315,
                                                                columnNumber: 33
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/ViewHistory.js",
                                                            lineNumber: 314,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/ViewHistory.js",
                                                    lineNumber: 268,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ViewHistory.js",
                                                lineNumber: 267,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, rev.id, true, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 217,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/ViewHistory.js",
                                lineNumber: 209,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-12 text-slate-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faHistory"],
                                        className: "w-12 h-12 text-slate-300 mb-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 347,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium",
                                        children: "No edit history found"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: "This submission has not been edited yet"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ViewHistory.js",
                                lineNumber: 346,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/ViewHistory.js",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-slate-500 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faHistory"],
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ViewHistory.js",
                                            lineNumber: 357,
                                            columnNumber: 15
                                        }, this),
                                        revisions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                "Showing ",
                                                revisions.length,
                                                " revision",
                                                revisions.length > 1 ? 's' : '',
                                                isMasterApprover && ' (including master approver edits)'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/ViewHistory.js",
                                            lineNumber: 359,
                                            columnNumber: 17
                                        }, this) : 'No edits recorded'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ViewHistory.js",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: fetchHistory,
                                    disabled: loading,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2",
                                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                                                className: "w-4 h-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ViewHistory.js",
                                                lineNumber: 374,
                                                columnNumber: 19
                                            }, this),
                                            "Loading..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 373,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSync"],
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ViewHistory.js",
                                                lineNumber: 379,
                                                columnNumber: 19
                                            }, this),
                                            "Refresh"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ViewHistory.js",
                                        lineNumber: 378,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ViewHistory.js",
                                    lineNumber: 367,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ViewHistory.js",
                            lineNumber: 355,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ViewHistory.js",
                    lineNumber: 176,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ViewHistory.js",
                lineNumber: 175,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ViewHistory.js",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_s(ViewHistory, "GAsiIodhUZcMC5zyQleWxpWPUtY=");
_c = ViewHistory;
var _c;
__turbopack_context__.k.register(_c, "ViewHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/review/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReviewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ReassignModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ReassignModal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DowngradeModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/DowngradeModal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ConfirmModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ConfirmModal.js [app-client] (ecmascript)");
// Import the reusable components
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$EditSubmission$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/EditSubmission.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ViewHistory$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ViewHistory.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DiscussionSection$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/DiscussionSection.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
function ReviewPage() {
    _s();
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentEvaluatorId, setCurrentEvaluatorId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('system');
    const [submissions, setSubmissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedSubmission, setSelectedSubmission] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [categoryFilter, setCategoryFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [allUsers, setAllUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [emailExtractedData, setEmailExtractedData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sucList, setSucList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showEditModal, setShowEditModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editLoading, setEditLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showHistoryModal, setShowHistoryModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [votes, setVotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        votes: [],
        evaluation_status: 'pending'
    });
    const [voteNotes, setVoteNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showReassignModal, setShowReassignModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reassignLoading, setReassignLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDowngradeModal, setShowDowngradeModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [downgradeLoading, setDowngradeLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showConfirmModal, setShowConfirmModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmLoading, setConfirmLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingVoteAction, setPendingVoteAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [checkingEmails, setCheckingEmails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isModalLoading, setIsModalLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDowngradeConfirm, setShowDowngradeConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingDowngradeType, setPendingDowngradeType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [downgradeConfirmLoading, setDowngradeConfirmLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReviewPage.useEffect": ()=>{
            const storedUser = localStorage.getItem('pemnet_user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setCurrentUser(user);
                    setCurrentEvaluatorId(user.id || 3);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
            fetchAllUsers();
            fetchSucs();
        }
    }["ReviewPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReviewPage.useEffect": ()=>{
            if (currentEvaluatorId) {
                fetchSubmissions();
            }
        }
    }["ReviewPage.useEffect"], [
        activeTab,
        statusFilter,
        currentEvaluatorId
    ]);
    const fetchAllUsers = async ()=>{
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/users`);
            const data = await res.json();
            setAllUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };
    const fetchSucs = async ()=>{
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/sucs`);
            if (res.ok) {
                const data = await res.json();
                setSucList(data);
            }
        } catch (err) {
            console.error('Error fetching SUCs:', err);
        }
    };
    const fetchSubmissions = async ()=>{
        setLoading(true);
        try {
            let url;
            if (activeTab === 'system') {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/submissions`;
            } else {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/email-submissions?status=all`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            showToast('Failed to fetch submissions', 'error');
        } finally{
            setLoading(false);
        }
    };
    const checkEmails = async ()=>{
        setCheckingEmails(true);
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/email-submissions/check`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                showToast(`Found ${data.processed} new email submissions`, 'success');
                fetchSubmissions();
            }
        } catch (error) {
            showToast('Failed to check emails', 'error');
        } finally{
            setCheckingEmails(false);
        }
    };
    const showToast = (message, type)=>{
        setToast({
            message,
            type
        });
        setTimeout(()=>setToast(null), 5000);
    };
    const fetchExtractedData = async (emailSubmissionId)=>{
        const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/email-submissions/${emailSubmissionId}/extracted-data`);
        if (res.ok) {
            const data = await res.json();
            setEmailExtractedData(data);
            return data;
        }
        return null;
    };
    const selectSubmission = async (sub)=>{
        setSelectedSubmission(sub);
        setEmailExtractedData(null);
        const subId = sub.submission_id || sub.id;
        console.log('Selecting submission with ID:', subId, 'Type:', typeof subId);
        try {
            const votesRes = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${subId}/evaluate`);
            if (votesRes.ok) {
                const votesData = await votesRes.json();
                setVotes({
                    ...votesData,
                    evaluation_status: votesData.evaluation_status || 'pending'
                });
            } else {
                console.error('Failed to fetch votes:', await votesRes.text());
            }
            if (activeTab === 'email' && sub.id) {
                await fetchExtractedData(sub.id);
            }
        } catch (error) {
            console.error('Error selecting submission:', error);
            showToast('Failed to load submission details', 'error');
        }
    };
    const handleVote = async (vote_status)=>{
        if (!selectedSubmission) return;
        const subId = selectedSubmission.submission_id || selectedSubmission.id;
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${subId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evaluator_id: currentEvaluatorId,
                    vote_status: vote_status,
                    vote_notes: voteNotes
                })
            });
            if (res.ok) {
                const data = await res.json();
                setVotes(data);
                showToast(`Voted: ${vote_status.replace('_', ' ')}`, 'success');
                setVoteNotes('');
                if (data.evaluation_status !== 'pending') fetchSubmissions();
                return true;
            } else {
                const error = await res.json();
                showToast(error.detail || 'Failed to vote', 'error');
                return false;
            }
        } catch (error) {
            showToast('Failed to vote', 'error');
            return false;
        }
    };
    const handleEndorseWithConfirm = ()=>{
        if (!selectedSubmission) return;
        setPendingVoteAction('endorse');
        setShowConfirmModal(true);
    };
    const confirmVote = async ()=>{
        if (!pendingVoteAction) return;
        setConfirmLoading(true);
        try {
            await handleVote(pendingVoteAction);
            setShowConfirmModal(false);
            setPendingVoteAction(null);
        } finally{
            setConfirmLoading(false);
        }
    };
    const handleOpenDowngradeModal = ()=>{
        setShowDowngradeModal(true);
    };
    const handleDowngradeWithConfirm = async (downgradeType)=>{
        setPendingDowngradeType(downgradeType);
        setShowDowngradeModal(false);
        setShowDowngradeConfirm(true);
    };
    const handleDowngradeVote = async (downgradeType)=>{
        if (!selectedSubmission || !downgradeType) return;
        setDowngradeLoading(true);
        const subId = selectedSubmission.submission_id || selectedSubmission.id;
        try {
            const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${subId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evaluator_id: currentEvaluatorId,
                    vote_status: downgradeType,
                    vote_notes: voteNotes
                })
            });
            if (res.ok) {
                const data = await res.json();
                setVotes(data);
                showToast(`Submission downgraded to ${downgradeType === 'downgraded-non_competitive' ? 'Non-Competitive' : 'Poster Only'}`, 'success');
                setVoteNotes('');
                setDowngradeLoading(false);
                fetchSubmissions();
            } else {
                const error = await res.json();
                showToast(error.detail || 'Failed to downgrade', 'error');
                setDowngradeLoading(false);
            }
        } catch (error) {
            showToast('Failed to downgrade', 'error');
            setDowngradeLoading(false);
        }
    };
    const confirmDowngradeVote = async ()=>{
        if (!pendingDowngradeType) return;
        setDowngradeConfirmLoading(true);
        try {
            await handleDowngradeVote(pendingDowngradeType);
            setShowDowngradeConfirm(false);
            setPendingDowngradeType(null);
        } finally{
            setDowngradeConfirmLoading(false);
        }
    };
    const handleEditSave = async (formData)=>{
        if (!selectedSubmission) return;
        setEditLoading(true);
        try {
            const submissionId = selectedSubmission.submission_id || selectedSubmission.id;
            let url;
            let payload = {
                ...formData
            };
            if (activeTab === 'email' && emailExtractedData) {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/extracted-data/${emailExtractedData.id}/edit`;
                payload.evaluator_id = currentEvaluatorId;
            } else {
                url = `${"TURBOPACK compile-time value", "http://localhost:5000"}/api/submissions/${submissionId}/edit`;
                payload.evaluator_id = currentEvaluatorId;
            }
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                let message = data.message || 'Submission updated successfully!';
                if (data.drive_move && data.drive_move.moved && data.drive_move.moved.length > 0) {
                    message += ` ${data.drive_move.moved.length} file(s) moved to the new folder.`;
                    if (data.drive_move.trashed_folders && data.drive_move.trashed_folders.length > 0) {
                        message += ` ${data.drive_move.trashed_folders.length} empty folder(s) cleaned up.`;
                    }
                } else if (data.drive_move && data.drive_move.error) {
                    message += ' (Warning: Could not move files in Google Drive)';
                }
                showToast(message, 'success');
                setShowEditModal(false);
                // Refresh extracted data if applicable
                if (activeTab === 'email' && selectedSubmission.id) {
                    await fetchExtractedData(selectedSubmission.id);
                }
                // Refresh submissions to get updated data
                fetchSubmissions();
                // Update selected submission with new data
                if (activeTab === 'system') {
                    setSelectedSubmission((prev)=>({
                            ...prev,
                            ...formData
                        }));
                }
            } else {
                const error = await res.json();
                showToast(error.detail || 'Failed to update submission', 'error');
            }
        } catch (error) {
            console.error('Error updating submission:', error);
            showToast('Failed to update submission', 'error');
        } finally{
            setEditLoading(false);
        }
    };
    const getEditFields = (submissionType)=>{
        if (submissionType === 'email') {
            return {
                title: {
                    label: 'Title',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                    type: 'text'
                },
                project_leader: {
                    label: 'Project Leader',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
                    type: 'text'
                },
                sucs: {
                    label: 'SUC / Agency',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
                    type: 'suc'
                },
                corresponding_author_name: {
                    label: 'Corresponding Author',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                    type: 'text'
                },
                corresponding_author_email: {
                    label: 'Corresponding Email',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                    type: 'email'
                },
                corresponding_author_position: {
                    label: 'Corresponding Position',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
                    type: 'text'
                },
                authors_list: {
                    label: 'Authors List',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
                    type: 'text'
                },
                paper_category: {
                    label: 'Paper Category',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
                    type: 'select',
                    options: [
                        'Completed Extension Project Paper',
                        'Ongoing Extension Project Paper',
                        'Not specified'
                    ]
                },
                thematic_area: {
                    label: 'Thematic Area',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
                    type: 'select',
                    options: [
                        'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
                        'Health, Nutrition, Wellness, and Community Care',
                        'Education, Literacy, Skills Development, and Lifelong Learning',
                        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
                        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
                        'Not specified'
                    ]
                },
                theme: {
                    label: 'Theme',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
                    type: 'text'
                }
            };
        }
        // System submission fields
        return {
            extension_project_title: {
                label: 'Title',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                type: 'text'
            },
            project_leader: {
                label: 'Project Leader',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
                type: 'text'
            },
            presenter: {
                label: 'Presenter',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                type: 'text'
            },
            suc_agencies: {
                label: 'SUC / Agency',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
                type: 'suc'
            },
            corresponding_author_name: {
                label: 'Corresponding Author',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                type: 'text'
            },
            corresponding_author_email: {
                label: 'Corresponding Email',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                type: 'email'
            },
            corresponding_author_position: {
                label: 'Corresponding Position',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
                type: 'text'
            },
            co_authors: {
                label: 'Authors',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
                type: 'text'
            },
            paper_category: {
                label: 'Paper Category',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
                type: 'select',
                options: [
                    'Completed Extension Project Paper',
                    'Ongoing Extension Project Paper',
                    'Not specified'
                ]
            },
            thematic_area: {
                label: 'Thematic Area',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
                type: 'select',
                options: [
                    'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
                    'Health, Nutrition, Wellness, and Community Care',
                    'Education, Literacy, Skills Development, and Lifelong Learning',
                    'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
                    'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
                    'Not specified'
                ]
            }
        };
    };
    const filteredSubmissions = submissions.filter((sub)=>{
        if (!sub) return false;
        const matchesStatusFilter = (()=>{
            if (statusFilter === 'all') return true;
            const s = String(sub.status || '').toLowerCase();
            // "downgraded" is a GROUP filter — matches all downgrade variants
            if (statusFilter === 'downgraded') {
                return s === 'downgraded' || s === 'downgrade' || s.startsWith('downgraded');
            }
            // Exact match for everything else
            return s === String(statusFilter).toLowerCase();
        })();
        if (!matchesStatusFilter) return false;
        if (activeTab === 'system') {
            if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const title = (sub.extension_project_title || '').toLowerCase();
                const leader = (sub.project_leader || '').toLowerCase();
                const suc = (sub.suc_agencies || '').toLowerCase();
                return title.includes(search) || leader.includes(search) || suc.includes(search);
            }
            return true;
        } else {
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const subject = (sub.subject || '').toLowerCase();
                const projectLeader = (sub.project_leader_name || '').toLowerCase();
                const senderEmail = (sub.sender_email || '').toLowerCase();
                const senderName = (sub.sender_name || '').toLowerCase();
                return subject.includes(search) || projectLeader.includes(search) || senderEmail.includes(search) || senderName.includes(search);
            }
            return true;
        }
    });
    const isDowngraded = (status)=>{
        if (!status) return false;
        const s = String(status).toLowerCase();
        return s === 'downgraded' || s === 'downgrade' || s.startsWith('downgraded');
    };
    const isPending = (status)=>{
        if (!status) return true;
        const s = String(status).toLowerCase();
        return s === 'pending';
    };
    const isEndorsed = (status)=>{
        if (!status) return false;
        const s = String(status).toLowerCase();
        return s === 'endorse' || s === 'endorsed';
    };
    const matchesStatusFilter = (subStatus)=>{
        if (statusFilter === 'all') return true;
        const s = String(subStatus || '').toLowerCase();
        const f = String(statusFilter).toLowerCase();
        // "downgraded" is a GROUP filter — matches all downgrade variants
        if (f === 'downgraded') {
            return s === 'downgraded' || s === 'downgrade' || s.startsWith('downgraded');
        }
        // Exact match for everything else
        return s === f;
    };
    // Calculate stat counts based on the current filter
    const getFilteredStats = ()=>{
        if (activeTab === 'system') {
            const filtered = submissions.filter((sub)=>{
                if (!matchesStatusFilter(sub.status)) return false;
                if (categoryFilter !== 'all' && sub.paper_category !== categoryFilter) return false;
                return true;
            });
            const total = filtered.length;
            const pending = filtered.filter((s)=>isPending(s.status)).length;
            const endorsed = filtered.filter((s)=>isEndorsed(s.status)).length;
            const downgraded = filtered.filter((s)=>isDowngraded(s.status)).length;
            return {
                total,
                pending,
                endorsed,
                downgraded,
                uncategorized: 0
            };
        } else {
            const filtered = submissions.filter((sub)=>{
                if (!matchesStatusFilter(sub.status)) return false;
                return true;
            });
            const total = filtered.length;
            const pending = filtered.filter((s)=>isPending(s.status)).length;
            const endorsed = filtered.filter((s)=>isEndorsed(s.status)).length;
            const uncategorized = filtered.filter((s)=>s.status === 'uncategorized').length;
            const downgraded = filtered.filter((s)=>isDowngraded(s.status)).length;
            return {
                total,
                pending,
                endorsed,
                downgraded,
                uncategorized
            };
        }
    };
    const stats = getFilteredStats();
    const STAT_FILTERS = {
        total: 'all',
        pending: 'pending',
        endorsed: 'endorse',
        downgraded: activeTab === 'system' ? 'downgraded' : 'uncategorized',
        uncategorized: 'uncategorized'
    };
    const handleStatCardClick = (cardKey)=>{
        const targetFilter = STAT_FILTERS[cardKey] ?? 'all';
        setStatusFilter(targetFilter);
    };
    const isStatCardActive = (cardKey)=>{
        const targetFilter = STAT_FILTERS[cardKey] ?? 'all';
        return statusFilter === targetFilter;
    };
    // Status display functions
    const getStatusColor = (status)=>{
        const safeStatus = status || 'pending';
        switch(safeStatus){
            case 'endorse':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'downgraded':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'pending':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'uncategorized':
                return 'bg-gray-50 text-gray-700 border-gray-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };
    const getStatusDisplay = (status)=>{
        switch(status){
            case 'endorse':
                return 'Endorsed';
            case 'downgraded':
                return 'Downgraded';
            case 'pending':
                return 'Pending Review';
            case 'uncategorized':
                return 'Uncategorized';
            case 'processed':
                return 'Processed';
            case 'rejected':
                return 'Rejected';
            default:
                return status || 'Pending';
        }
    };
    const getStatusIcon = (status)=>{
        switch(status){
            case 'endorse':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCheckCircle"];
            case 'downgraded':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faExclamationTriangle"];
            case 'pending':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faClock"];
            case 'uncategorized':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faWarning"];
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faInfoCircle"];
        }
    };
    const getCategoryColor = (category)=>{
        if (!category) return 'bg-slate-50 text-slate-700 border-slate-200';
        if (category.includes('Natural')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (category.includes('Information')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (category.includes('Development')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (category.includes('Social')) return 'bg-pink-50 text-pink-700 border-pink-200';
        if (category.includes('Food')) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };
    const extractGoogleDriveId = (url)=>{
        if (!url) return null;
        const patterns = [
            /\/d\/([a-zA-Z0-9_-]+)/,
            /id=([a-zA-Z0-9_-]+)/,
            /open\?id=([a-zA-Z0-9_-]+)/,
            /\/file\/d\/([a-zA-Z0-9_-]+)/,
            /([a-zA-Z0-9_-]{25,})/
        ];
        for (let pattern of patterns){
            const match = url.match(pattern);
            if (match && match[1]) return match[1].split('?')[0].split('&')[0];
        }
        return null;
    };
    // Paper category options
    const paperCategoryOptions = [
        'Completed Extension Project Paper',
        'Ongoing Extension Project Paper',
        'Not specified'
    ];
    // Thematic area options
    const thematicAreaOptions = [
        'Food Production, Agriculture, Fisheries, and Natural Resource Systems',
        'Health, Nutrition, Wellness, and Community Care',
        'Education, Literacy, Skills Development, and Lifelong Learning',
        'Livelihood, Entrepreneurship, Cooperatives, MSMEs, and Local Economic Development',
        'Environment, Climate Action, Disaster Risk Reduction, and Community Resilience',
        'Not specified'
    ];
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 678,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-600 font-medium",
                        children: "Loading submissions..."
                    }, void 0, false, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 679,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 677,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/review/page.js",
            lineNumber: 676,
            columnNumber: 7
        }, this);
    }
    const FIELD_MAP = {
        title: {
            system: 'extension_project_title',
            email: 'title',
            fallbackEmail: 'subject'
        },
        projectLeader: {
            system: 'project_leader',
            email: 'project_leader',
            fallbackEmail: 'project_leader_name'
        },
        authorsList: {
            system: 'co_authors',
            email: 'authors_list'
        },
        suc: {
            system: 'suc_agencies',
            email: 'sucs'
        },
        correspondingAuthorName: {
            system: 'corresponding_author_name',
            email: 'corresponding_author_name'
        },
        correspondingAuthorEmail: {
            system: 'corresponding_author_email',
            email: 'corresponding_author_email',
            fallbackEmail: 'sender_email'
        },
        correspondingAuthorPos: {
            system: 'corresponding_author_position',
            email: 'corresponding_author_position'
        },
        paperCategory: {
            system: 'paper_category',
            email: 'paper_category'
        },
        thematicArea: {
            system: 'thematic_area',
            email: 'thematic_area'
        },
        theme: {
            system: 'theme',
            email: 'theme'
        }
    };
    const getField = (logicalName, fallback = 'Not specified')=>{
        const mapping = FIELD_MAP[logicalName];
        if (!mapping) return fallback;
        let value;
        if (activeTab === 'system') {
            value = selectedSubmission?.[mapping.system];
        } else {
            value = emailExtractedData?.[mapping.email];
            if ((value === undefined || value === null || value === '') && mapping.fallbackEmail) {
                value = selectedSubmission?.[mapping.fallbackEmail];
            }
        }
        if (value === undefined || value === null) return fallback;
        if (typeof value === 'string' && value.trim() === '') return fallback;
        return value;
    };
    // Authors list needs custom JSON parsing, so it has its own function
    const getAuthorsList = ()=>{
        const raw = getField('authorsList', '');
        if (!raw) return 'Not specified';
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.join(', ');
            return raw;
        } catch  {
            return raw;
        }
    };
    // ====== BACKWARDS-COMPATIBLE WRAPPERS ======
    // Keep these so existing call sites don't break.
    const getTitle = ()=>getField('title');
    const getProjectLeader = ()=>getField('projectLeader');
    const getSuc = ()=>getField('suc');
    const getThematicArea = ()=>getField('thematicArea');
    const getPaperCategory = ()=>getField('paperCategory');
    const getCorrespondingAuthorName = ()=>getField('correspondingAuthorName');
    const getCorrespondingAuthorEmail = ()=>getField('correspondingAuthorEmail');
    const getCorrespondingAuthorPosition = ()=>getField('correspondingAuthorPos');
    const getTheme = ()=>getField('theme');
    const getEvaluatorName = (id)=>{
        const user = allUsers.find((u)=>u.id === id);
        if (user) return user.full_name;
        return 'Evaluator';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-607ed4c10455b76a" + " " + "min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30",
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-607ed4c10455b76a" + " " + "fixed top-6 right-6 z-100 animate-slide-in",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-607ed4c10455b76a" + " " + `relative w-96 p-5 rounded-2xl border shadow-xl backdrop-blur-sm ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200' : 'bg-red-50/90 border-red-200'}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "flex items-start gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + `shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: toast.type === 'success' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCheckCircle"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faExclamationTriangle"],
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 761,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 758,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-607ed4c10455b76a" + " " + `font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`,
                                        children: toast.type === 'success' ? 'Success!' : 'Error!'
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 764,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-607ed4c10455b76a" + " " + `text-sm ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`,
                                        children: toast.message
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 767,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 763,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setToast(null),
                                className: "jsx-607ed4c10455b76a" + " " + "text-slate-400 hover:text-slate-600 transition",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTimes"],
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 770,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 769,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 757,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/review/page.js",
                    lineNumber: 752,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 751,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ReassignModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showReassignModal,
                onClose: ()=>setShowReassignModal(false),
                onSubmit: async (newThematicArea)=>{
                    setReassignLoading(true);
                    try {
                        // FIX: Use submission_id for all submissions
                        const res = await fetch(`${("TURBOPACK compile-time value", "http://localhost:5000")}/api/submissions/${selectedSubmission.submission_id || selectedSubmission.id}/evaluate`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                evaluator_id: currentEvaluatorId,
                                vote_status: 'reassign',
                                vote_notes: voteNotes,
                                vote_reassign_to: newThematicArea
                            })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setVotes(data);
                            setShowReassignModal(false);
                            setVoteNotes('');
                            setReassignLoading(false);
                            showToast(`Thematic area updated to "${newThematicArea}"`, 'success');
                            fetchSubmissions();
                            setSelectedSubmission({
                                ...selectedSubmission,
                                thematic_area: newThematicArea
                            });
                        } else {
                            const error = await res.json();
                            showToast(error.detail || 'Failed to update thematic area', 'error');
                            setReassignLoading(false);
                        }
                    } catch (error) {
                        showToast('Failed to update thematic area', 'error');
                        setReassignLoading(false);
                    }
                },
                currentThematicArea: getThematicArea()
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 777,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DowngradeModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showDowngradeModal,
                onClose: ()=>setShowDowngradeModal(false),
                onSubmit: handleDowngradeWithConfirm,
                isLoading: downgradeLoading,
                paperCategory: getPaperCategory()
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 816,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ConfirmModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showConfirmModal,
                onClose: ()=>{
                    setShowConfirmModal(false);
                    setPendingVoteAction(null);
                },
                onConfirm: confirmVote,
                title: "Endorse for Presentation",
                message: "Are you sure you want to endorse this submission for presentation?",
                confirmText: "Yes, Endorse",
                cancelText: "No, Cancel",
                isLoading: confirmLoading
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 824,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ConfirmModal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showDowngradeConfirm,
                onClose: ()=>{
                    setShowDowngradeConfirm(false);
                    setPendingDowngradeType(null);
                },
                onConfirm: confirmDowngradeVote,
                title: "Confirm Downgrade",
                message: `Are you sure you want to downgrade this submission? This will be recorded as a ${pendingDowngradeType === 'non_competitive' ? 'Non-Competitive (Poster)' : 'Poster Only'} decision.`,
                confirmText: "Yes, Downgrade",
                cancelText: "No, Cancel",
                isLoading: downgradeConfirmLoading,
                type: "warning"
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 835,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$EditSubmission$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showEditModal,
                onClose: ()=>setShowEditModal(false),
                data: emailExtractedData || selectedSubmission,
                onSave: handleEditSave,
                isLoading: editLoading,
                currentUser: currentUser,
                isMasterApprover: false,
                title: activeTab === 'email' ? 'Edit Email Submission Details' : 'Edit Submission Details',
                fields: getEditFields(activeTab === 'email' ? 'email' : 'system'),
                submissionType: activeTab === 'email' ? 'email' : 'system'
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 848,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ViewHistory$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showHistoryModal,
                onClose: ()=>setShowHistoryModal(false),
                submissionId: selectedSubmission?.submission_id,
                extractedDataId: emailExtractedData?.id,
                isMasterApprover: false,
                title: "Edit History"
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 862,
                columnNumber: 7
            }, this),
            selectedSubmission && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-607ed4c10455b76a" + " " + "fixed inset-0 z-50 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>setSelectedSubmission(null),
                        className: "jsx-607ed4c10455b76a" + " " + "absolute inset-0 bg-black/50 backdrop-blur-sm"
                    }, void 0, false, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 873,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "relative min-h-full flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-607ed4c10455b76a" + " " + "relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50/50 to-white",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "w-12 h-12 bg-linear-to-brrom-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                        icon: activeTab === 'system' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                                                        className: "w-6 h-6 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 879,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 878,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "text-xl font-bold text-slate-900",
                                                            children: activeTab === 'system' ? 'Submission Details' : 'Email Details'
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 882,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500 truncate max-w-md",
                                                            children: getTitle()
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 885,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 881,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 877,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelectedSubmission(null),
                                                className: "jsx-607ed4c10455b76a" + " " + "w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTimes"],
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 893,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 889,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 888,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 876,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-1 lg:grid-cols-2 h-full min-h-150",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "p-8 overflow-y-auto max-h-[80vh] border-r border-slate-100 bg-white",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between mb-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faClipboard"],
                                                                    className: "w-5 h-5 text-blue-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 902,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm font-bold text-slate-700 uppercase tracking-wider",
                                                                    children: "Submission Information"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 903,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 901,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setShowHistoryModal(true),
                                                                    title: "View History",
                                                                    className: "jsx-607ed4c10455b76a" + " " + "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-xs font-semibold",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faHistory"],
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 913,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "View History"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 908,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setShowEditModal(true),
                                                                    title: "Edit Details",
                                                                    className: "jsx-607ed4c10455b76a" + " " + "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all text-xs font-semibold",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEdit"],
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 921,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Edit Details"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 916,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 907,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 900,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "space-y-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "group",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                                                                            className: "w-4 h-4 text-blue-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 930,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Title"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 929,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900 leading-relaxed",
                                                                    children: getTitle() || 'No title'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 933,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 928,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-2 gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
                                                                                    className: "w-4 h-4 text-emerald-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 939,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Project Leader"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 938,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900",
                                                                            children: getProjectLeader()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 942,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 937,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
                                                                                    className: "w-4 h-4 text-blue-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 947,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Authors"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 946,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900",
                                                                            children: getAuthorsList()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 950,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 945,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 936,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-2 gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
                                                                                    className: "w-4 h-4 text-amber-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 957,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "SUC / Agency"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 956,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900",
                                                                            children: getSuc()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 960,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 955,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                                                                                    className: "w-4 h-4 text-cyan-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 965,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Corresponding Author"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 964,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium text-slate-900",
                                                                            children: getCorrespondingAuthorName()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 968,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 963,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 954,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-2 gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                                                                                    className: "w-4 h-4 text-red-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 975,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Corresponding Author Email"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 974,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium text-slate-900 break-all",
                                                                            children: getCorrespondingAuthorEmail()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 978,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 973,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
                                                                                    className: "w-4 h-4 text-purple-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 983,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Corresponding Author Position"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 982,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium text-slate-900",
                                                                            children: getCorrespondingAuthorPosition()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 986,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 981,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 972,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-2 gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
                                                                                    className: "w-4 h-4 text-rose-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 993,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Theme"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 992,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900",
                                                                            children: getTheme()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 996,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 991,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
                                                                                    className: "w-4 h-4 text-purple-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 1001,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Paper Category"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1000,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium border ${getCategoryColor(getPaperCategory())}`,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
                                                                                    className: "w-3 h-3"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 1005,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                getPaperCategory()?.includes('Completed') ? 'Completed' : getPaperCategory() || 'Not specified'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1004,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 999,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 990,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-2 gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faLayerGroup"],
                                                                                    className: "w-4 h-4 text-indigo-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 1014,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Thematic Area"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1013,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-base font-semibold text-slate-900",
                                                                            children: getThematicArea()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1017,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1012,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "group",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-500 mb-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCertificate"],
                                                                                    className: "w-4 h-4 text-violet-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 1022,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Final Status"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1021,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(votes.evaluation_status)}`,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                    icon: getStatusIcon(votes.evaluation_status),
                                                                                    className: "w-3.5 h-3.5"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/review/page.js",
                                                                                    lineNumber: 1026,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                getStatusDisplay(votes.evaluation_status)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1025,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1020,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1011,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 927,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "mt-8 pt-6 border-t border-slate-200 space-y-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 mb-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faGavel"],
                                                                    className: "w-4 h-4 text-slate-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1036,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-xs font-medium text-slate-500 uppercase tracking-wider",
                                                                    children: "Cast Your Vote"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1037,
                                                                    columnNumber: 27
                                                                }, this),
                                                                votes.evaluation_status !== 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCheckCircle"],
                                                                            className: "w-2.5 h-2.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1040,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        "Finalized by Master Approver"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1039,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1035,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: handleEndorseWithConfirm,
                                                            disabled: votes.evaluation_status !== 'pending',
                                                            title: votes.evaluation_status !== 'pending' ? 'This submission has been finalized by the Master Approver' : '',
                                                            className: "jsx-607ed4c10455b76a" + " " + "w-full inline-flex items-center justify-center gap-3 bg-linear-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faThumbsUp"],
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1052,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Endorse for Presentation"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1046,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: handleOpenDowngradeModal,
                                                            disabled: votes.evaluation_status !== 'pending',
                                                            title: votes.evaluation_status !== 'pending' ? 'This submission has been finalized by the Master Approver' : '',
                                                            className: "jsx-607ed4c10455b76a" + " " + "w-full inline-flex items-center justify-center gap-3 bg-amber-50 text-amber-700 py-3.5 rounded-2xl font-semibold text-sm hover:bg-amber-100 transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faThumbsDown"],
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1062,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Downgrade"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1056,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1034,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "mt-8 pt-6 border-t border-slate-200",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-3 mb-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUsers"],
                                                                    className: "w-5 h-5 text-blue-600"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1069,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm font-bold text-slate-700 uppercase tracking-wider",
                                                                    children: "Live Votes"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1070,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-xs text-slate-400",
                                                                    children: [
                                                                        "(",
                                                                        (votes.votes || []).length,
                                                                        "/3)"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1071,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1068,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "space-y-3",
                                                            children: [
                                                                (votes.votes || []).map((vote, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "p-4 bg-linear-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-607ed4c10455b76a" + " " + "flex justify-between items-center",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-sm font-semibold text-slate-900 flex items-center gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                                                                                                className: "w-4 h-4 text-slate-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/review/page.js",
                                                                                                lineNumber: 1078,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            vote.evaluator_id === currentEvaluatorId ? `${currentUser?.full_name || 'You'} (You)` : getEvaluatorName(vote.evaluator_id)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/review/page.js",
                                                                                        lineNumber: 1077,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(vote.vote_status)}`,
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                                icon: getStatusIcon(vote.vote_status),
                                                                                                className: "w-3 h-3"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/review/page.js",
                                                                                                lineNumber: 1084,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            vote.vote_status === 'endorse' ? 'Endorse' : vote.vote_status === 'downgrade' ? 'Downgraded' : vote.vote_status?.replace('_', ' ').toUpperCase()
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/review/page.js",
                                                                                        lineNumber: 1083,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1076,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            vote.vote_notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "jsx-607ed4c10455b76a" + " " + "mt-2 text-sm text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100",
                                                                                children: [
                                                                                    '"',
                                                                                    vote.vote_notes,
                                                                                    '"'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1091,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, idx, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1075,
                                                                        columnNumber: 25
                                                                    }, this)),
                                                                (votes.votes || []).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-center text-slate-400 text-sm py-4",
                                                                    children: "No votes yet"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1098,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1073,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1067,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "mt-8 pt-6 border-t border-slate-200",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DiscussionSection$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        submissionId: selectedSubmission?.submission_id || selectedSubmission?.id,
                                                        currentUserId: currentEvaluatorId,
                                                        currentUserName: currentUser?.full_name,
                                                        isMasterApprover: false,
                                                        title: "Evaluator Discussion",
                                                        maxHeight: "300px"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1105,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1104,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 899,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "bg-linear-to-br from-slate-50 to-blue-50/20 p-6 overflow-y-auto max-h-[80vh]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-3 mb-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEye"],
                                                            className: "w-5 h-5 text-indigo-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1118,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-bold text-slate-700 uppercase tracking-wider",
                                                            children: "File Viewer"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1119,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1117,
                                                    columnNumber: 19
                                                }, this),
                                                activeTab === 'system' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "space-y-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-600 mb-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilePdf"],
                                                                            className: "w-4 h-4 text-red-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1126,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        "Abstract PDF"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1125,
                                                                    columnNumber: 25
                                                                }, this),
                                                                selectedSubmission.abstract_view_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        height: '500px'
                                                                    },
                                                                    className: "jsx-607ed4c10455b76a" + " " + "border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                                                        src: `https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.abstract_view_url)}/preview?embedded=true`,
                                                                        allow: "autoplay",
                                                                        onLoad: ()=>setIsModalLoading(false),
                                                                        className: "jsx-607ed4c10455b76a" + " " + "w-full h-full"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1131,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1130,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilePdf"],
                                                                            className: "w-12 h-12 text-slate-300 mb-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1140,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium",
                                                                            children: "No Abstract Available"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1141,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1139,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1124,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-607ed4c10455b76a",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-600 mb-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilePdf"],
                                                                            className: "w-4 h-4 text-emerald-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1147,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        "Endorsement PDF"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1146,
                                                                    columnNumber: 25
                                                                }, this),
                                                                selectedSubmission.endorsement_view_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        height: '500px'
                                                                    },
                                                                    className: "jsx-607ed4c10455b76a" + " " + "border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                                                        src: `https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.endorsement_view_url)}/preview?embedded=true`,
                                                                        allow: "autoplay",
                                                                        className: "jsx-607ed4c10455b76a" + " " + "w-full h-full"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1152,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1151,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilePdf"],
                                                                            className: "w-12 h-12 text-slate-300 mb-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1160,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium",
                                                                            children: "No Endorsement Available"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1161,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1159,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1145,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1123,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "space-y-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-607ed4c10455b76a",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2 text-sm font-medium text-slate-600 mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilePdf"],
                                                                        className: "w-4 h-4 text-rose-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1170,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Attachment"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1169,
                                                                columnNumber: 25
                                                            }, this),
                                                            selectedSubmission.attachment_filename && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500 mb-3 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                                                                        className: "w-4 h-4 text-slate-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1175,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    selectedSubmission.attachment_filename
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1174,
                                                                columnNumber: 27
                                                            }, this),
                                                            selectedSubmission.attachment_view_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    height: '600px'
                                                                },
                                                                className: "jsx-607ed4c10455b76a" + " " + "border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-lg shadow-slate-200/50",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                                                                    src: `https://drive.google.com/file/d/${extractGoogleDriveId(selectedSubmission.attachment_view_url)}/preview?embedded=true`,
                                                                    allow: "autoplay",
                                                                    onLoad: ()=>setIsModalLoading(false),
                                                                    className: "jsx-607ed4c10455b76a" + " " + "w-full h-full"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1181,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1180,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                                                                        className: "w-12 h-12 text-slate-300 mb-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1190,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium",
                                                                        children: "No Attachment Available"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1191,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1189,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1168,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1167,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1116,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 898,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/review/page.js",
                            lineNumber: 875,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 874,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 872,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-607ed4c10455b76a" + " " + "bg-white border-b border-slate-100 px-8 py-5 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-607ed4c10455b76a" + " " + "max-w-7xl mx-auto flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-607ed4c10455b76a",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "jsx-607ed4c10455b76a" + " " + "text-2xl font-bold text-slate-900 flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faGavel"],
                                            className: "w-6 h-6 text-blue-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1208,
                                            columnNumber: 15
                                        }, this),
                                        "Abstract Review"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1207,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "jsx-607ed4c10455b76a" + " " + "text-slate-500 text-sm mt-0.5 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faInfoCircle"],
                                            className: "w-3.5 h-3.5 text-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1212,
                                            columnNumber: 15
                                        }, this),
                                        "Review, vote, and collaborate with your fellow evaluators."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1211,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/review/page.js",
                            lineNumber: 1206,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-3 px-4 py-2 bg-linear-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25",
                                            children: currentUser?.full_name?.charAt(0) || 'E'
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1219,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "leading-tight",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm font-semibold text-slate-800",
                                                    children: currentUser?.full_name || 'Evaluator'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1223,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-[10px] text-slate-500 uppercase tracking-wider font-medium",
                                                    children: currentUser?.role || 'User'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1224,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1222,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1218,
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
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1228,
                                            columnNumber: 15
                                        }, this),
                                        "Logout"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1227,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/review/page.js",
                            lineNumber: 1217,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/review/page.js",
                    lineNumber: 1205,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 1204,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-607ed4c10455b76a" + " " + "max-w-7xl mx-auto px-8 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + "flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setActiveTab('system');
                                            setStatusFilter('all');
                                            setCategoryFilter('all');
                                            setSearchTerm('');
                                        },
                                        className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'system' ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1246,
                                                columnNumber: 15
                                            }, this),
                                            "System Submissions"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1238,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setActiveTab('email');
                                            setCategoryFilter('all');
                                            setSearchTerm('');
                                        },
                                        className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'email' ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1257,
                                                columnNumber: 15
                                            }, this),
                                            "Email Submissions"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1249,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1237,
                                columnNumber: 11
                            }, this),
                            activeTab === 'email' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: checkEmails,
                                disabled: checkingEmails,
                                className: "jsx-607ed4c10455b76a" + " " + "inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25",
                                children: checkingEmails ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSpinner"],
                                            className: "w-4 h-4 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1268,
                                            columnNumber: 19
                                        }, this),
                                        "Checking..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1268,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faInbox"],
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1270,
                                            columnNumber: 19
                                        }, this),
                                        "Check Inbox"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1270,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1262,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 1236,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleStatCardClick('total'),
                                className: "jsx-607ed4c10455b76a" + " " + `text-left bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${isStatCardActive('total') ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-3xl font-bold text-slate-900",
                                                    children: stats.total
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1290,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500",
                                                    children: [
                                                        activeTab === 'system' ? 'Total Submissions' : 'Total Emails',
                                                        isStatCardActive('total') && ' (Active)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1291,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1289,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFolderOpen"],
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1297,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1296,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1288,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1279,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleStatCardClick('pending'),
                                className: "jsx-607ed4c10455b76a" + " " + `text-left bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${isStatCardActive('pending') ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-3xl font-bold text-amber-600",
                                                    children: stats.pending
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1314,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500",
                                                    children: [
                                                        activeTab === 'system' ? 'Pending Review' : 'Pending',
                                                        isStatCardActive('pending') && ' (Active)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1315,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1313,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faClock"],
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1321,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1320,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1312,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleStatCardClick('endorsed'),
                                className: "jsx-607ed4c10455b76a" + " " + `text-left bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${isStatCardActive('endorsed') ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-3xl font-bold text-emerald-600",
                                                    children: stats.endorsed
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1338,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500",
                                                    children: [
                                                        "Endorsed",
                                                        isStatCardActive('endorsed') && ' (Active)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1339,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1337,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCheckCircle"],
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1345,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1344,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1336,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1327,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleStatCardClick(activeTab === 'system' ? 'downgraded' : 'uncategorized'),
                                className: "jsx-607ed4c10455b76a" + " " + `text-left bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${isStatCardActive(activeTab === 'system' ? 'downgraded' : 'uncategorized') ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-3xl font-bold text-rose-600",
                                                    children: activeTab === 'system' ? stats.downgraded : stats.uncategorized
                                                }, void 0, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1364,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-607ed4c10455b76a" + " " + "text-sm text-slate-500",
                                                    children: [
                                                        activeTab === 'system' ? 'Downgraded' : 'Uncategorized',
                                                        isStatCardActive(activeTab === 'system' ? 'downgraded' : 'uncategorized') && ' (Active)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1367,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1363,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-607ed4c10455b76a" + " " + "w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                icon: activeTab === 'system' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faArrowDown"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faWarning"],
                                                className: "w-6 h-6"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1373,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1372,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1362,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1351,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 1277,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "flex gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + "flex-1 relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-607ed4c10455b76a" + " " + "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSearch"],
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1382,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1381,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: activeTab === 'system' ? "Search by title, leader, or SUC..." : "Search by subject, sender, or email...",
                                        value: searchTerm,
                                        onChange: (e)=>setSearchTerm(e.target.value),
                                        className: "jsx-607ed4c10455b76a" + " " + "w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1384,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1380,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-607ed4c10455b76a" + " " + "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFilter"],
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1394,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1393,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: statusFilter,
                                        onChange: (e)=>setStatusFilter(e.target.value),
                                        className: "jsx-607ed4c10455b76a" + " " + "pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-40",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                className: "jsx-607ed4c10455b76a",
                                                children: "All Status"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1401,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "pending",
                                                className: "jsx-607ed4c10455b76a",
                                                children: "Pending"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1402,
                                                columnNumber: 15
                                            }, this),
                                            activeTab === 'system' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "endorse",
                                                        className: "jsx-607ed4c10455b76a",
                                                        children: "Endorsed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1405,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "downgraded",
                                                        className: "jsx-607ed4c10455b76a",
                                                        children: "Downgraded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1406,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1404,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "endorse",
                                                        className: "jsx-607ed4c10455b76a",
                                                        children: "Endorsed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1410,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "uncategorized",
                                                        className: "jsx-607ed4c10455b76a",
                                                        children: "Uncategorized"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1411,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1409,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1396,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1392,
                                columnNumber: 11
                            }, this),
                            activeTab === 'system' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-607ed4c10455b76a" + " " + "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-607ed4c10455b76a" + " " + "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1419,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1418,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: categoryFilter,
                                        onChange: (e)=>setCategoryFilter(e.target.value),
                                        className: "jsx-607ed4c10455b76a" + " " + "pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                className: "jsx-607ed4c10455b76a",
                                                children: "All Categories"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1426,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "Completed Extension Project Paper",
                                                className: "jsx-607ed4c10455b76a",
                                                children: "Completed Extension"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1427,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "Ongoing Extension Project Paper",
                                                className: "jsx-607ed4c10455b76a",
                                                children: "Ongoing Extension"
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1428,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/review/page.js",
                                        lineNumber: 1421,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/review/page.js",
                                lineNumber: 1417,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 1379,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-607ed4c10455b76a" + " " + "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-607ed4c10455b76a" + " " + "overflow-x-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "jsx-607ed4c10455b76a" + " " + "w-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "jsx-607ed4c10455b76a" + " " + "bg-linear-to-r from-slate-50 to-blue-50/50 border-b border-slate-200",
                                                children: activeTab === 'system' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFileAlt"],
                                                                        className: "w-3.5 h-3.5 text-blue-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1443,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Title & Leader"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1442,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1441,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faSchool"],
                                                                        className: "w-3.5 h-3.5 text-amber-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1449,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "SUC / Agency"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1448,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1447,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faTag"],
                                                                        className: "w-3.5 h-3.5 text-purple-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1455,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Category"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1454,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1453,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCalendarAlt"],
                                                                        className: "w-3.5 h-3.5 text-slate-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1461,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Date"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1460,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1459,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
                                                                        className: "w-3.5 h-3.5 text-rose-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1467,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Status"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1466,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1465,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1440,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                                                                        className: "w-3.5 h-3.5 text-blue-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1476,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Subject / Sender"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1475,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1474,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUser"],
                                                                        className: "w-3.5 h-3.5 text-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1482,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Project Leader"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1481,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1480,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCalendarAlt"],
                                                                        className: "w-3.5 h-3.5 text-slate-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1488,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Received"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1487,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1486,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFlag"],
                                                                        className: "w-3.5 h-3.5 text-rose-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1494,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "Status"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1493,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/review/page.js",
                                                            lineNumber: 1492,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1473,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/review/page.js",
                                                lineNumber: 1438,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1437,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            className: "jsx-607ed4c10455b76a",
                                            children: filteredSubmissions.map((sub)=>{
                                                const displayStatus = activeTab === 'system' ? sub.status || 'pending' : sub.status || 'pending';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    onClick: ()=>{
                                                        selectSubmission({
                                                            ...sub,
                                                            id: sub.id,
                                                            nsubmission_id: sub.submission_id
                                                        });
                                                    },
                                                    className: "jsx-607ed4c10455b76a" + " " + "cursor-pointer border-b border-slate-100 hover:bg-blue-50/40 transition-all group",
                                                    children: activeTab === 'system' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors",
                                                                        children: sub.extension_project_title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1517,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-xs text-slate-500 mt-0.5 flex items-center gap-1.5",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faUserCircle"],
                                                                                className: "w-3 h-3 text-slate-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1519,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            sub.project_leader,
                                                                            " "
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1518,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1516,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-sm text-slate-600",
                                                                children: sub.suc_agencies
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1523,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getCategoryColor(sub.paper_category)}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faBookOpen"],
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1526,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        sub.paper_category?.includes('Completed') ? 'Completed' : 'Ongoing'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1525,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1524,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-sm text-slate-600",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCalendarAlt"],
                                                                            className: "w-3 h-3 text-slate-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1532,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        new Date(sub.created_at).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: '2-digit',
                                                                            year: 'numeric'
                                                                        })
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1531,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1530,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(displayStatus)}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: getStatusIcon(displayStatus),
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1538,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        getStatusDisplay(displayStatus)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1537,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1536,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1515,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors",
                                                                        children: sub.subject || 'No Subject'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1546,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "text-xs text-slate-500 mt-0.5 flex items-center gap-1.5",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faEnvelope"],
                                                                                className: "w-3 h-3 text-slate-400"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1548,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            sub.sender_name || 'Unknown',
                                                                            " (",
                                                                            sub.sender_email || 'No Email',
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1547,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1545,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-sm text-slate-600",
                                                                children: [
                                                                    sub.project_leader_name || 'Not specified',
                                                                    sub.extraction_status === 'failed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faWarning"],
                                                                                className: "w-2.5 h-2.5"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1556,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            "Uncategorized"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1555,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1552,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4 text-sm text-slate-600",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-607ed4c10455b76a" + " " + "flex items-center gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faCalendarAlt"],
                                                                            className: "w-3 h-3 text-slate-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/review/page.js",
                                                                            lineNumber: 1563,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        new Date(sub.email_received_at || sub.created_at).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: '2-digit',
                                                                            year: 'numeric'
                                                                        })
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/review/page.js",
                                                                    lineNumber: 1562,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1561,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "jsx-607ed4c10455b76a" + " " + "px-6 py-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + `inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(displayStatus)}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: getStatusIcon(displayStatus),
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1569,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            getStatusDisplay(displayStatus)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1568,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    sub.is_categorized === false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faExclamationTriangle"],
                                                                                className: "w-2.5 h-2.5"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1574,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            "Needs Review"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1573,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    sub.is_categorized === true && sub.extraction_status === 'failed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-607ed4c10455b76a" + " " + "ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                                                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faWarning"],
                                                                                className: "w-2.5 h-2.5"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/review/page.js",
                                                                                lineNumber: 1580,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            "Manually Categorized"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/review/page.js",
                                                                        lineNumber: 1579,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/review/page.js",
                                                                lineNumber: 1567,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/review/page.js",
                                                        lineNumber: 1544,
                                                        columnNumber: 25
                                                    }, this)
                                                }, sub.id, false, {
                                                    fileName: "[project]/app/review/page.js",
                                                    lineNumber: 1507,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1502,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1436,
                                    columnNumber: 13
                                }, this),
                                filteredSubmissions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-607ed4c10455b76a" + " " + "text-center py-16 text-slate-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: activeTab === 'system' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faFolderOpen"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faInbox"],
                                            className: "w-12 h-12 text-slate-300 mb-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1594,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-607ed4c10455b76a" + " " + "text-sm font-medium",
                                            children: [
                                                "No ",
                                                activeTab === 'system' ? 'submissions' : 'email submissions',
                                                " found"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1595,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-607ed4c10455b76a" + " " + "text-xs text-slate-400 mt-1",
                                            children: "Try adjusting your filters or search terms"
                                        }, void 0, false, {
                                            fileName: "[project]/app/review/page.js",
                                            lineNumber: 1596,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/review/page.js",
                                    lineNumber: 1593,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/review/page.js",
                            lineNumber: 1435,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/review/page.js",
                        lineNumber: 1434,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/review/page.js",
                lineNumber: 1235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "607ed4c10455b76a",
                children: "@keyframes slideIn{0%{opacity:0;transform:translate(100%)}to{opacity:1;transform:translate(0)}}.animate-slide-in.jsx-607ed4c10455b76a{animation:.3s ease-out slideIn}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/review/page.js",
        lineNumber: 749,
        columnNumber: 5
    }, this);
}
_s(ReviewPage, "SDpOe9sU6Y/hCBr6QFtxz8NcFac=");
_c = ReviewPage;
var _c;
__turbopack_context__.k.register(_c, "ReviewPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_13w5yhm._.js.map