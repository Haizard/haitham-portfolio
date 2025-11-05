(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/Cresta-Creator-161-1721991823190_src_4a9d6c6b._.js", {

"[project]/Cresta-Creator-161-1721991823190/src/hooks/use-comparison.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ComparisonProvider": (()=>ComparisonProvider),
    "useComparison": (()=>useComparison)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/hooks/use-toast'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const MAX_COMPARE_ITEMS = 3;
const ComparisonContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useComparison() {
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}
_s(useComparison, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function ComparisonProvider({ children }) {
    _s1();
    const [selectedRestaurants, setSelectedRestaurants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const { toast } = useToast();
    const addToCompare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComparisonProvider.useCallback[addToCompare]": (restaurant)=>{
            setSelectedRestaurants({
                "ComparisonProvider.useCallback[addToCompare]": (prev)=>{
                    if (prev.find({
                        "ComparisonProvider.useCallback[addToCompare]": (r)=>r.id === restaurant.id
                    }["ComparisonProvider.useCallback[addToCompare]"])) {
                        return prev; // Already exists
                    }
                    if (prev.length >= MAX_COMPARE_ITEMS) {
                        toast({
                            title: "Comparison Limit Reached",
                            description: `You can only compare up to ${MAX_COMPARE_ITEMS} restaurants at a time.`,
                            variant: "destructive"
                        });
                        return prev;
                    }
                    return [
                        ...prev,
                        restaurant
                    ];
                }
            }["ComparisonProvider.useCallback[addToCompare]"]);
        }
    }["ComparisonProvider.useCallback[addToCompare]"], [
        toast
    ]);
    const removeFromCompare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComparisonProvider.useCallback[removeFromCompare]": (restaurantId)=>{
            setSelectedRestaurants({
                "ComparisonProvider.useCallback[removeFromCompare]": (prev)=>prev.filter({
                        "ComparisonProvider.useCallback[removeFromCompare]": (r)=>r.id !== restaurantId
                    }["ComparisonProvider.useCallback[removeFromCompare]"])
            }["ComparisonProvider.useCallback[removeFromCompare]"]);
        }
    }["ComparisonProvider.useCallback[removeFromCompare]"], []);
    const clearComparison = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComparisonProvider.useCallback[clearComparison]": ()=>{
            setSelectedRestaurants([]);
        }
    }["ComparisonProvider.useCallback[clearComparison]"], []);
    const isComparing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComparisonProvider.useCallback[isComparing]": (restaurantId)=>{
            return selectedRestaurants.some({
                "ComparisonProvider.useCallback[isComparing]": (r)=>r.id === restaurantId
            }["ComparisonProvider.useCallback[isComparing]"]);
        }
    }["ComparisonProvider.useCallback[isComparing]"], [
        selectedRestaurants
    ]);
    const comparisonCount = selectedRestaurants.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ComparisonContext.Provider, {
        value: {
            selectedRestaurants,
            addToCompare,
            removeFromCompare,
            isComparing,
            clearComparison,
            comparisonCount
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Cresta-Creator-161-1721991823190/src/hooks/use-comparison.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s1(ComparisonProvider, "gzKmTCT/STko7s/1LSjNUSrEJWs=", false, function() {
    return [
        useToast
    ];
});
_c = ComparisonProvider;
var _c;
__turbopack_context__.k.register(_c, "ComparisonProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ClientProviders": (()=>ClientProviders)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/ui/toaster'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/hooks/use-cart'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/hooks/use-wishlist'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/components/layout/global-nav'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/providers/user-provider'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Cresta$2d$Creator$2d$161$2d$1721991823190$2f$src$2f$hooks$2f$use$2d$comparison$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Cresta-Creator-161-1721991823190/src/hooks/use-comparison.tsx [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/layout/app-layout'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/providers/theme-provider'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
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
function ClientProviders({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const protectedAppRoutes = [
        '/dashboard',
        '/admin',
        '/vendor',
        '/content-studio',
        '/my-jobs',
        '/my-proposals',
        '/my-projects',
        '/my-services',
        '/post-job',
        '/client-portal',
        '/social-media',
        '/chat',
        '/delivery',
        '/profile',
        '/transport'
    ];
    const isAppRoute = protectedAppRoutes.some((prefix)=>pathname === prefix || pathname.startsWith(`${prefix}/`));
    let content;
    if (isAppRoute) {
        content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppLayout, {
            children: children
        }, void 0, false, {
            fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
            lineNumber: 29,
            columnNumber: 15
        }, this);
    } else {
        content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GlobalNav, {}, void 0, false, {
                    fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "pb-16 md:pb-0",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Toaster, {}, void 0, false, {
                    fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProvider, {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserProvider, {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WishlistProvider, {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartProvider, {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Cresta$2d$Creator$2d$161$2d$1721991823190$2f$src$2f$hooks$2f$use$2d$comparison$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComparisonProvider"], {
                        children: content
                    }, void 0, false, {
                        fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                        lineNumber: 50,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                    lineNumber: 49,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
                lineNumber: 48,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
            lineNumber: 47,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/Cresta-Creator-161-1721991823190/src/components/layout/client-providers.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(ClientProviders, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = ClientProviders;
var _c;
__turbopack_context__.k.register(_c, "ClientProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=Cresta-Creator-161-1721991823190_src_4a9d6c6b._.js.map