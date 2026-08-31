module.exports = [
"[project]/apps/kvic-dashboard/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00691f2c6feb45cae80099521d2af78efd877cdc07",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logoutAction"],
    "400e8b6c217d38aec9e1234dbaa489407fcd5f66cb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminRegisterAction"],
    "402195e8a0c8d85616e059fcc3cb70945e6b2e7573",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createUserAction"],
    "4033d21a4276a554b51b82d2104df9d0b28395fe95",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reassessHivesAction"],
    "40588498d95b9c7997ae3472993b77ac192622ce16",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loginAction"],
    "40a80a6b5022b8928da39ef50ed79c9f65ed3d3103",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateAlertAction"],
    "40acd706cd10e697e073489c0d3db611e20d72e4a9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateUserStatusAction"],
    "40bf5e4bbbda1cee6c24330ede567b0379624c8739",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verifyProofAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f2e$next$2d$internal$2f$server$2f$app$2f$login$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/kvic-dashboard/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => "[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/apps/kvic-dashboard/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/apps/kvic-dashboard/app/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00691f2c6feb45cae80099521d2af78efd877cdc07":{"name":"logoutAction"},"400e8b6c217d38aec9e1234dbaa489407fcd5f66cb":{"name":"adminRegisterAction"},"402195e8a0c8d85616e059fcc3cb70945e6b2e7573":{"name":"createUserAction"},"4033d21a4276a554b51b82d2104df9d0b28395fe95":{"name":"reassessHivesAction"},"40588498d95b9c7997ae3472993b77ac192622ce16":{"name":"loginAction"},"40a80a6b5022b8928da39ef50ed79c9f65ed3d3103":{"name":"updateAlertAction"},"40acd706cd10e697e073489c0d3db611e20d72e4a9":{"name":"updateUserStatusAction"},"40bf5e4bbbda1cee6c24330ede567b0379624c8739":{"name":"verifyProofAction"}},"apps/kvic-dashboard/app/actions.ts",""] */ __turbopack_context__.s([
    "adminRegisterAction",
    ()=>adminRegisterAction,
    "createUserAction",
    ()=>createUserAction,
    "loginAction",
    ()=>loginAction,
    "logoutAction",
    ()=>logoutAction,
    "reassessHivesAction",
    ()=>reassessHivesAction,
    "updateAlertAction",
    ()=>updateAlertAction,
    "updateUserStatusAction",
    ()=>updateUserStatusAction,
    "verifyProofAction",
    ()=>verifyProofAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/kvic-dashboard/lib/api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function loginAction(formData) {
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    try {
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["login"])(email, password);
        (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()).set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionCookie"], token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            path: '/',
            maxAge: 60 * 60 * 8
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Login failed')}`);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/');
}
async function logoutAction() {
    (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()).delete(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionCookie"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
}
async function adminRegisterAction(formData) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminRegister"])({
            name: String(formData.get('name') ?? ''),
            email: String(formData.get('email') ?? ''),
            password: String(formData.get('password') ?? ''),
            registration_code: String(formData.get('registration_code') ?? '')
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/login?mode=register&error=${encodeURIComponent(error instanceof Error ? error.message : 'Registration failed')}`);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login?registered=1');
}
async function verifyProofAction(formData) {
    const txId = String(formData.get('transactionId') ?? '');
    const returnTo = safeReturnTo(formData.get('returnTo'), '/blockchain');
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])(`/api/admin/fabric/events/${encodeURIComponent(txId)}/verify`, {
            method: 'POST'
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'Proof verification failed'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'verified', txId));
}
async function updateAlertAction(formData) {
    const id = String(formData.get('id') ?? '');
    const status = String(formData.get('status') ?? 'ACKNOWLEDGED');
    const note = String(formData.get('note') ?? '');
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])(`/api/admin/alerts/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
            status,
            note: note || undefined
        })
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/alerts');
}
async function createUserAction(formData) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({
                name: String(formData.get('name') ?? ''),
                email: String(formData.get('email') ?? ''),
                password: String(formData.get('password') ?? ''),
                role: String(formData.get('role') ?? 'BEEKEEPER')
            })
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage('/directory', 'error', error instanceof Error ? error.message : 'Member creation failed'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/directory');
}
async function updateUserStatusAction(formData) {
    const id = String(formData.get('id') ?? '');
    const status = String(formData.get('status') ?? '');
    const returnTo = safeReturnTo(formData.get('returnTo'), '/directory');
    if (!id || status !== 'ACTIVE' && status !== 'DISABLED') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'error', 'Invalid user status request'));
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])(`/api/admin/users/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status
            })
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'User status update failed'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'updated', id));
}
async function reassessHivesAction(formData) {
    const hiveId = String(formData.get('hive_id') ?? '');
    const returnTo = safeReturnTo(formData.get('returnTo'), '/hives');
    const query = hiveId ? `?hive_id=${encodeURIComponent(hiveId)}` : '';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$kvic$2d$dashboard$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"])(`/api/admin/hives/reassess${query}`, {
            method: 'POST'
        });
    } catch (error) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'Assessment recalculation failed'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(withMessage(returnTo, 'assessed', hiveId || 'all'));
}
function safeReturnTo(value, fallback) {
    const path = String(value ?? '');
    return path.startsWith('/') && !path.startsWith('//') ? path : fallback;
}
function withMessage(path, key, value) {
    const url = new URL(path, 'http://dashboard.local');
    url.searchParams.set(key, value);
    return `${url.pathname}${url.search}${url.hash}`;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    loginAction,
    logoutAction,
    adminRegisterAction,
    verifyProofAction,
    updateAlertAction,
    createUserAction,
    updateUserStatusAction,
    reassessHivesAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginAction, "40588498d95b9c7997ae3472993b77ac192622ce16", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(logoutAction, "00691f2c6feb45cae80099521d2af78efd877cdc07", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminRegisterAction, "400e8b6c217d38aec9e1234dbaa489407fcd5f66cb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(verifyProofAction, "40bf5e4bbbda1cee6c24330ede567b0379624c8739", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateAlertAction, "40a80a6b5022b8928da39ef50ed79c9f65ed3d3103", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUserAction, "402195e8a0c8d85616e059fcc3cb70945e6b2e7573", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUserStatusAction, "40acd706cd10e697e073489c0d3db611e20d72e4a9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(reassessHivesAction, "4033d21a4276a554b51b82d2104df9d0b28395fe95", null);
}),
"[project]/apps/kvic-dashboard/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "adminRegister",
    ()=>adminRegister,
    "api",
    ()=>api,
    "login",
    ()=>login,
    "sessionCookie",
    ()=>sessionCookie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.3.3+c44950b42c084149/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
const sessionCookie = 'honeychain_admin_session';
async function api(path, init) {
    const token = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$3$2e$3$2b$c44950b42c084149$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])()).get(sessionCookie)?.value;
    const response = await fetch(`${backendUrl}${path}`, {
        ...init,
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...token ? {
                Authorization: `Bearer ${token}`
            } : {},
            ...init?.headers
        }
    });
    if (!response.ok) {
        const body = await response.json().catch(()=>({}));
        throw new ApiError(response.status, body.error ?? `Request failed with status ${response.status}`);
    }
    return response.json();
}
async function login(email, password) {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        }),
        cache: 'no-store'
    });
    const body = await response.json();
    if (!response.ok || !body.token) throw new ApiError(response.status, body.error ?? 'Login failed');
    if (body.user?.role !== 'ADMIN') throw new ApiError(403, 'KVIC administrator access is required');
    return body.token;
}
async function adminRegister(input) {
    const response = await fetch(`${backendUrl}/api/auth/admin-register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input),
        cache: 'no-store'
    });
    const body = await response.json().catch(()=>({}));
    if (!response.ok) throw new ApiError(response.status, body.error ?? 'Registration failed');
    return body;
}
;
class ApiError extends Error {
    status;
    constructor(status, message){
        super(message), this.status = status;
    }
}
}),
];

//# sourceMappingURL=apps_kvic-dashboard_1empuhm._.js.map