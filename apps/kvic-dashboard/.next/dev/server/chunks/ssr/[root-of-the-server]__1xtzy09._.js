module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BlockchainPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/ui.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/lib/api.ts [app-rsc] (ecmascript)");
;
;
;
;
async function BlockchainPage({ searchParams }) {
    const [data, params] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])('/api/admin/fabric/events?limit=100'),
        searchParams
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageHeader"], {
                kicker: "Cryptographic evidence",
                title: "On-chain event register",
                description: "Chaincode events, block references, submitting MSPs, and independently rechecked hash anchors.",
                aside: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "network-seal",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Channel"
                        }, void 0, false, {
                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                            lineNumber: 9,
                            columnNumber: 255
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "honeychannel"
                        }, void 0, false, {
                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                            lineNumber: 9,
                            columnNumber: 275
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                            children: "3 organizations"
                        }, void 0, false, {
                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                            lineNumber: 9,
                            columnNumber: 304
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                    lineNumber: 9,
                    columnNumber: 225
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                lineNumber: 9,
                columnNumber: 33
            }, this),
            params.verified ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "success-banner",
                children: [
                    "Proof check completed for transaction ",
                    params.verified.slice(0, 18),
                    "…"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                lineNumber: 10,
                columnNumber: 24
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel table-panel",
                children: data.events.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "table-wrap",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Block / transaction"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                            lineNumber: 11,
                                            columnNumber: 112
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Event"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                            lineNumber: 11,
                                            columnNumber: 140
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Actor"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                            lineNumber: 11,
                                            columnNumber: 154
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Payload anchor"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                            lineNumber: 11,
                                            columnNumber: 168
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Proof"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                            lineNumber: 11,
                                            columnNumber: 191
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                    lineNumber: 11,
                                    columnNumber: 108
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                lineNumber: 11,
                                columnNumber: 101
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: data.events.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            "#",
                                                            event.blockNumber ?? 'pending'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                        lineNumber: 11,
                                                        columnNumber: 278
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                        children: [
                                                            event.txId.slice(0, 24),
                                                            "…"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                        lineNumber: 11,
                                                        columnNumber: 328
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                lineNumber: 11,
                                                columnNumber: 274
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: event.eventType
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                        lineNumber: 11,
                                                        columnNumber: 376
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                        children: event.batchId
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                        lineNumber: 11,
                                                        columnNumber: 410
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Status"], {
                                                        children: event.status ?? 'COMMITTED'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                        lineNumber: 11,
                                                        columnNumber: 440
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                lineNumber: 11,
                                                columnNumber: 372
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: event.actorMsp ?? 'Unknown MSP'
                                            }, void 0, false, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                lineNumber: 11,
                                                columnNumber: 491
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                    children: event.payloadHash ? `${event.payloadHash.slice(0, 25)}…` : 'No hash'
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                    lineNumber: 11,
                                                    columnNumber: 537
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                lineNumber: 11,
                                                columnNumber: 533
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: event.verificationStatus ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Status"], {
                                                    children: event.verificationStatus
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                    lineNumber: 11,
                                                    columnNumber: 657
                                                }, this) : event.payloadHash ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                    action: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyProofAction"],
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "hidden",
                                                            name: "transactionId",
                                                            value: event.txId
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                            lineNumber: 11,
                                                            columnNumber: 756
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "button compact",
                                                            type: "submit",
                                                            children: "Verify anchor"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                            lineNumber: 11,
                                                            columnNumber: 818
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                    lineNumber: 11,
                                                    columnNumber: 723
                                                }, this) : 'Not verifiable'
                                            }, void 0, false, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                                lineNumber: 11,
                                                columnNumber: 625
                                            }, this)
                                        ]
                                    }, event.txId, true, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                        lineNumber: 11,
                                        columnNumber: 253
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                                lineNumber: 11,
                                columnNumber: 218
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                        lineNumber: 11,
                        columnNumber: 94
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                    lineNumber: 11,
                    columnNumber: 66
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Empty"], {
                    children: "No events have been indexed. Enable the Fabric event indexer after deploying the network."
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                    lineNumber: 11,
                    columnNumber: 953
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/apps/kvic-dashboard/components/ui.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Empty",
    ()=>Empty,
    "Metric",
    ()=>Metric,
    "PageHeader",
    ()=>PageHeader,
    "Status",
    ()=>Status
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function PageHeader({ kicker, title, description, aside }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "page-header",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: kicker
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                        lineNumber: 2,
                        columnNumber: 47
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                        lineNumber: 2,
                        columnNumber: 82
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                        lineNumber: 2,
                        columnNumber: 98
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                lineNumber: 2,
                columnNumber: 42
            }, this),
            aside
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
        lineNumber: 2,
        columnNumber: 10
    }, this);
}
function Metric({ label, value, note }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "metric",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                lineNumber: 6,
                columnNumber: 38
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: value
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                lineNumber: 6,
                columnNumber: 58
            }, this),
            note ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                children: note
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
                lineNumber: 6,
                columnNumber: 90
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
function Status({ children }) {
    const key = String(children).toLowerCase().replaceAll('_', '-');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `status status-${key}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
        lineNumber: 11,
        columnNumber: 10
    }, this);
}
function Empty({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "empty",
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/kvic-dashboard/components/ui.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xtzy09._.js.map