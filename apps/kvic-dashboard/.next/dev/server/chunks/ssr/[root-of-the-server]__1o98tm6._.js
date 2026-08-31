module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuditPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/components/ui.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/lib/api.ts [app-rsc] (ecmascript)");
;
;
;
async function AuditPage() {
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])('/api/admin/audit?limit=100');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageHeader"], {
                kicker: "Accountability",
                title: "Administrative audit trail",
                description: "Tamper-evident hashes for changes made through KVIC administration APIs."
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                lineNumber: 8,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel table-panel",
                children: data.audit.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "table-wrap",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Time"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                            lineNumber: 9,
                                            columnNumber: 111
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Action"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                            lineNumber: 9,
                                            columnNumber: 124
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Actor"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                            lineNumber: 9,
                                            columnNumber: 139
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Entity"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                            lineNumber: 9,
                                            columnNumber: 153
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Change anchors"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                            lineNumber: 9,
                                            columnNumber: 168
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                    lineNumber: 9,
                                    columnNumber: 107
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                lineNumber: 9,
                                columnNumber: 100
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: data.audit.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: new Date(row.createdAt).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                lineNumber: 9,
                                                columnNumber: 253
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: row.action.replaceAll('_', ' ')
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                    lineNumber: 9,
                                                    columnNumber: 308
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                lineNumber: 9,
                                                columnNumber: 304
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    row.actorRole ?? 'SYSTEM',
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                        children: row.actorId?.slice(0, 16)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                        lineNumber: 9,
                                                        columnNumber: 394
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                lineNumber: 9,
                                                columnNumber: 363
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    row.entityType,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                        children: row.entityId
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                        lineNumber: 9,
                                                        columnNumber: 459
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                lineNumber: 9,
                                                columnNumber: 439
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                        children: row.beforeHash ? `before ${row.beforeHash.slice(7, 19)}…` : 'new record'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                        lineNumber: 9,
                                                        columnNumber: 497
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                        children: row.afterHash ? `after ${row.afterHash.slice(7, 19)}…` : ''
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                        lineNumber: 9,
                                                        columnNumber: 584
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                                lineNumber: 9,
                                                columnNumber: 493
                                            }, this)
                                        ]
                                    }, row.id, true, {
                                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                        lineNumber: 9,
                                        columnNumber: 236
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                                lineNumber: 9,
                                columnNumber: 204
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                        lineNumber: 9,
                        columnNumber: 93
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                    lineNumber: 9,
                    columnNumber: 65
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$components$2f$ui$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Empty"], {
                    children: "No administrative actions recorded."
                }, void 0, false, {
                    fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                    lineNumber: 9,
                    columnNumber: 695
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
                lineNumber: 9,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/kvic-dashboard/app/(dashboard)/audit/page.tsx [app-rsc] (ecmascript)"));
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1o98tm6._.js.map