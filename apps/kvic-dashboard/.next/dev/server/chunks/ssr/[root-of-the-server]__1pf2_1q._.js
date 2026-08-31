module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TransactionDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$auto$2d$refresh$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/ui.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/lib/api.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function TransactionDetailPage({ params, searchParams }) {
    const [{ transactionId }, query] = await Promise.all([
        params,
        searchParams
    ]);
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])(`/api/admin/fabric/events/${encodeURIComponent(transactionId)}`);
    const event = data.event;
    const receipt = data.receipt;
    const eventStatus = text(event.status) ?? 'INDEXED';
    const verificationStatus = text(event.verificationStatus);
    const payload = event.payload ?? event.payloadJson ?? receipt?.payload ?? receipt?.requestPayload ?? null;
    const actor = text(event.actorName) ?? text(event.actorId) ?? text(receipt?.actorId);
    const msp = text(event.actorMsp) ?? text(receipt?.actorMsp) ?? text(receipt?.mspId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page transaction-detail",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$auto$2d$refresh$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AutoRefresh"], {}, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageHeader"], {
                kicker: "Fabric transaction evidence",
                title: "Transaction detail",
                description: "Indexed event, transaction receipt, payload proof, and field-by-field comparison.",
                aside: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    className: "button",
                    href: "/blockchain",
                    children: "Back to register"
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                    lineNumber: 24,
                    columnNumber: 184
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 24,
                columnNumber: 5
            }, this),
            query.verified ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "success-banner",
                children: "Proof comparison refreshed."
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 25,
                columnNumber: 23
            }, this) : null,
            query.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "form-error",
                children: query.error
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 26,
                columnNumber: 20
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "transaction-identity",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Transaction ID"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 29,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: transactionId
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 29,
                                columnNumber: 39
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 29,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Block"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 30,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: display(event.blockNumber ?? receipt?.blockNumber)
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 30,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 30,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Event record"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 31,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Status"], {
                                children: eventStatus
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 31,
                                columnNumber: 37
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 31,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Proof comparison"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 32,
                                columnNumber: 12
                            }, this),
                            verificationStatus ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Status"], {
                                children: verificationStatus
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 32,
                                columnNumber: 63
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Not checked"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 32,
                                columnNumber: 103
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 32,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 28,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "split-grid detail-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel-head",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "eyebrow",
                                            children: "Indexed event"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                            lineNumber: 36,
                                            columnNumber: 67
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            children: display(event.eventType, 'Unnamed event')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                            lineNumber: 36,
                                            columnNumber: 107
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 62
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 36,
                                columnNumber: 34
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                className: "record-fields",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Batch ID",
                                        value: event.batchId
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Payload hash",
                                        value: event.payloadHash
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 56
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Observed at",
                                        value: dateValue(event.observedAt)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 111
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Indexed at",
                                        value: dateValue(event.indexedAt)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 175
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Created at",
                                        value: dateValue(event.createdAt)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 237
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 36,
                                columnNumber: 171
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 36,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "panel-head",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "eyebrow",
                                            children: "Identity context"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                            lineNumber: 39,
                                            columnNumber: 67
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            children: "Actors and submitter"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                            lineNumber: 39,
                                            columnNumber: 110
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 39,
                                    columnNumber: 62
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 39,
                                columnNumber: 34
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                className: "record-fields",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Database actor",
                                        value: actor ?? 'Not recorded'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Application role",
                                        value: receipt?.actorRole
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 72
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Fabric MSP",
                                        value: msp ?? 'Not reported'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 132
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Validation code",
                                        value: receipt?.validationCode ?? event.validationCode
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 189
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Committed successfully",
                                        value: receipt?.successful
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 277
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Channel",
                                        value: event.channel
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 40,
                                        columnNumber: 344
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 39,
                                columnNumber: 151
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "panel-note",
                                children: "The database actor is an application identity. The Fabric MSP is the submitting network membership identity; they are not interchangeable."
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 41,
                                columnNumber: 12
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 39,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 35,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel proof-panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel-head",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "Independent check"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 77
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "Proof and field comparison"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 121
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 44,
                                columnNumber: 72
                            }, this),
                            event.payloadHash ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyProofAction"],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "transactionId",
                                        value: transactionId
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 216
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        name: "returnTo",
                                        value: `/blockchain/${encodeURIComponent(transactionId)}`
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 281
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button primary",
                                        type: "submit",
                                        children: verificationStatus ? 'Reverify proof' : 'Verify proof'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 44,
                                        columnNumber: 378
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 44,
                                columnNumber: 183
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 44,
                        columnNumber: 44
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "evidence-note",
                        children: "A mismatch describes this comparison result. It does not label the underlying business operation as an on-chain failure."
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 45,
                        columnNumber: 7
                    }, this),
                    data.proof_error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "form-error",
                        children: [
                            "On-chain proof could not be loaded: ",
                            data.proof_error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 46,
                        columnNumber: 27
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Comparison, {
                        value: data.comparison
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 47,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 44,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "split-grid detail-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonPanel, {
                        title: "Payload JSON",
                        kicker: "Event payload",
                        value: payload
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 51,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonPanel, {
                        title: "Receipt JSON",
                        kicker: "Fabric receipt",
                        value: receipt
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 52,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 50,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "split-grid detail-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonPanel, {
                        title: "Proof JSON",
                        kicker: "Verification evidence",
                        value: data.proof
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 55,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonPanel, {
                        title: "Full event JSON",
                        kicker: "Indexer record",
                        value: event
                    }, void 0, false, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 56,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 54,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
function Field({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 62,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                children: display(value)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 62,
                columnNumber: 31
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
        lineNumber: 62,
        columnNumber: 10
    }, this);
}
function Comparison({ value }) {
    if (!value) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "empty",
        children: "No field comparison has been returned."
    }, void 0, false, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
        lineNumber: 66,
        columnNumber: 22
    }, this);
    const rows = Array.isArray(value) ? value : Object.entries(value).map(([field, result])=>typeof result === 'object' && result !== null ? {
            field,
            ...result
        } : {
            field,
            result
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "table-wrap",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "comparison-table",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: "Field"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 85
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: "Database / indexed value"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 99
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: "Fabric proof value"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 132
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: "Comparison"
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 159
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                        lineNumber: 68,
                        columnNumber: 81
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                    lineNumber: 68,
                    columnNumber: 74
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: rows.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: display(row.field ?? row.name, `Field ${index + 1}`)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 271
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 267
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: display(row.local ?? row.database ?? row.indexed ?? row.expected)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 351
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 347
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        children: display(row.onChain ?? row.fabric ?? row.proof ?? row.actual)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 440
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 436
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Status"], {
                                        children: row.matches === true ? 'MATCH' : row.matches === false ? 'MISMATCH' : display(row.status ?? row.result ?? row.match, 'NOT_REPORTED')
                                    }, void 0, false, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                        lineNumber: 68,
                                        columnNumber: 525
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 521
                                }, this)
                            ]
                        }, `${display(row.field)}-${index}`, true, {
                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                            lineNumber: 68,
                            columnNumber: 224
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                    lineNumber: 68,
                    columnNumber: 191
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
            lineNumber: 68,
            columnNumber: 38
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
        lineNumber: 68,
        columnNumber: 10
    }, this);
}
function JsonPanel({ title, kicker, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "panel json-panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: kicker
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 72,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 72,
                columnNumber: 83
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                children: value == null ? 'Not returned' : JSON.stringify(value, null, 2)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
                lineNumber: 72,
                columnNumber: 99
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx",
        lineNumber: 72,
        columnNumber: 10
    }, this);
}
function text(value) {
    return typeof value === 'string' && value ? value : null;
}
function display(value, fallback = 'Not reported') {
    if (value == null || value === '') return fallback;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}
function dateValue(value) {
    const raw = text(value);
    return raw ? new Date(raw).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    }) : 'Not reported';
}
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/kvic-dashboard/app/(dashboard)/blockchain/[transactionId]/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoRefresh",
    ()=>AutoRefresh
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AutoRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AutoRefresh() from the server but AutoRefresh is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/kvic-dashboard/components/auto-refresh.tsx", "AutoRefresh");
}),
"[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoRefresh",
    ()=>AutoRefresh
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AutoRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AutoRefresh() from the server but AutoRefresh is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/kvic-dashboard/components/auto-refresh.tsx <module evaluation>", "AutoRefresh");
}),
"[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$auto$2d$refresh$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$auto$2d$refresh$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$auto$2d$refresh$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1pf2_1q._.js.map