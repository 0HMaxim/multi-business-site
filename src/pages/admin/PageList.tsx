// pages/admin/PageList.tsx

import { useBusiness } from "../../context/BusinessContext.tsx";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";

export default function PageList() {
    const { businessSlug, lang = "en" } = useParams<{
        businessSlug: string;
        lang?: string;
    }>();
    const { meta } = useBusiness();

    const [existingPages, setExistingPages] = useState<Set<string>>(new Set());
    const [loadingPages, setLoadingPages] = useState(true);
    const [newRouteKey, setNewRouteKey] = useState("");
    const [showNewInput, setShowNewInput] = useState(false);

    // Перезагружаем список при каждом маунте (включая навигацию назад из PageEditor)
    useEffect(() => {
        if (!businessSlug) return;
        setLoadingPages(true);
        get(ref(db, `businesses/${businessSlug}/pages`))
            .then(snapshot => {
                setExistingPages(snapshot.exists() ? new Set(Object.keys(snapshot.val())) : new Set());
            })
            .catch(console.error)
            .finally(() => setLoadingPages(false));
    }, [businessSlug]);

    // Табы из мета — включая только что добавленные (meta обновляется через BusinessProvider)
    const tabs = meta?.tabs
        ? Object.entries(meta.tabs).sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
        : [];

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">

            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
                        {businessSlug} — Pages
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Edit content blocks for each tab page
                    </p>
                </div>
                <button
                    onClick={() => setShowNewInput(v => !v)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                        showNewInput ? "bg-gray-200 text-gray-600" : "bg-black hover:bg-blue-600 text-white"
                    }`}
                >
                    {showNewInput ? "✕ Cancel" : "+ New Page"}
                </button>
            </div>

            {/* Ввод нового routeKey */}
            {showNewInput && (
                <div className="mb-8 p-6 border border-blue-100 bg-blue-50/20 rounded-2xl">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">
                        Route Key — без слэша (например: fleet, portfolio, cases, team)
                    </p>
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2 flex-1 border border-blue-100 rounded-xl bg-white px-4">
                            <span className="text-gray-400 font-mono text-sm">/</span>
                            <input
                                type="text"
                                className="flex-1 py-3 font-mono text-sm outline-none bg-transparent"
                                placeholder="my-new-page"
                                value={newRouteKey}
                                onChange={e => setNewRouteKey(
                                    e.target.value.replace(/^\//, "").replace(/\s/g, "-").toLowerCase()
                                )}
                                onKeyDown={e => { if (e.key === "Enter" && newRouteKey.trim()) setShowNewInput(false); }}
                            />
                        </div>
                        <Link
                            to={newRouteKey.trim() ? `/${lang}/admin/${businessSlug}/pages/${newRouteKey.trim()}` : "#"}
                            onClick={() => newRouteKey.trim() && setShowNewInput(false)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                newRouteKey.trim()
                                    ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed pointer-events-none"
                            }`}
                        >
                            Create →
                        </Link>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2">
                        При сохранении страница автоматически появится в навигации
                    </p>
                </div>
            )}

            {tabs.length === 0 && !loadingPages ? (
                <div className="text-center py-20">
                    <p className="text-gray-300 font-black uppercase text-xs tracking-widest">No tabs configured.</p>
                    <p className="text-gray-200 text-xs mt-2">Create a new page above, or add tabs in Meta editor first.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tabs.map(([key, tab]) => {
                        const routeKey = tab.route?.replace(/^\//, "") || key;
                        const title = tab.title?.["en"] || tab.title?.["uk"] || key;
                        const shortName = tab.shortName?.["en"] || tab.shortName?.["uk"] || "";
                        const hasContent = existingPages.has(routeKey);

                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 flex-shrink-0">
                                        {tab.order ?? 0}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-700">{title}</p>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                            /{routeKey}
                                            {shortName && <span className="ml-2 text-blue-400">({shortName})</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                      tab.enabled !== false
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                  }`}>
                    {tab.enabled !== false ? "active" : "hidden"}
                  </span>

                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                                        hasContent
                                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                                            : "bg-amber-50 text-amber-600 border border-amber-100"
                                    }`}>
                    {hasContent ? "✓ content" : "empty"}
                  </span>

                                    <Link
                                        to={`/${lang}/admin/${businessSlug}/pages/${routeKey}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                    >
                                        {hasContent ? "Edit" : "Add Content"}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}