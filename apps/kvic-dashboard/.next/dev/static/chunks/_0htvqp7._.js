(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/kvic-dashboard/components/auto-refresh.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoRefresh",
    ()=>AutoRefresh
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function AutoRefresh({ interval = 5000 }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoRefresh.useEffect": ()=>{
            let timer;
            const refresh = {
                "AutoRefresh.useEffect.refresh": ()=>{
                    if (document.visibilityState === 'visible') router.refresh();
                }
            }["AutoRefresh.useEffect.refresh"];
            const syncTimer = {
                "AutoRefresh.useEffect.syncTimer": ()=>{
                    if (timer) clearInterval(timer);
                    timer = document.visibilityState === 'visible' ? setInterval(refresh, interval) : undefined;
                }
            }["AutoRefresh.useEffect.syncTimer"];
            const onFocus = {
                "AutoRefresh.useEffect.onFocus": ()=>{
                    refresh();
                    syncTimer();
                }
            }["AutoRefresh.useEffect.onFocus"];
            syncTimer();
            document.addEventListener('visibilitychange', syncTimer);
            window.addEventListener('focus', onFocus);
            return ({
                "AutoRefresh.useEffect": ()=>{
                    if (timer) clearInterval(timer);
                    document.removeEventListener('visibilitychange', syncTimer);
                    window.removeEventListener('focus', onFocus);
                }
            })["AutoRefresh.useEffect"];
        }
    }["AutoRefresh.useEffect"], [
        interval,
        router
    ]);
    return null;
}
_s(AutoRefresh, "vQduR7x+OPXj6PSmJyFnf+hU7bg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AutoRefresh;
var _c;
__turbopack_context__.k.register(_c, "AutoRefresh");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_0htvqp7._.js.map