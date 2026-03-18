// pages/admin/PageEditor.tsx
// ИСПРАВЛЕНО:
// При создании новой страницы (routeKey не существует в meta.tabs)
// автоматически добавляем новый таб в meta.tabs в Firebase.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, set, update } from "firebase/database";
import { db } from "../../firebase";
import type { ContentBlock } from "../../models/ContentBlock";
import type { PageContent } from "../../models/PageContent";
import type { MetaTab } from "../../models/MetaTab";
import ImageInputBlock from "../../components/ImageInputBlock.tsx";
import { useBusiness } from "../../context/BusinessContext.tsx";
import { adminPath } from "../../utils/adminNavigate.ts";

export default function PageEditor() {
    const { businessSlug, routeKey: rawRouteKey, lang = "en" } = useParams<{
        businessSlug: string;
        routeKey: string;
        lang?: string;
    }>();
    const navigate = useNavigate();
    const { meta } = useBusiness();

    const routeKey = rawRouteKey?.replace(/^\//, "") ?? "";

    const [content, setContent] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Данные для нового таба (если routeKey не найден в meta.tabs)
    const existingTab = meta?.tabs
        ? Object.values(meta.tabs).find(t => (t.route ?? "").replace(/^\//, "") === routeKey)
        : null;

    const isNewPage = !existingTab;

    const [newTabTitle, setNewTabTitle] = useState({ uk: "", ru: "", en: "", de: "" });
    const [newTabShortName, setNewTabShortName] = useState({ uk: "", ru: "", en: "", de: "" });

    useEffect(() => {
        if (!businessSlug || !routeKey) {
            setLoading(false);
            return;
        }
        setContent([]);
        setLoading(true);
        get(ref(db, `businesses/${businessSlug}/pages/${routeKey}`))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const data = snapshot.val() as PageContent;
                    setContent(data.content || []);
                } else {
                    setContent([]);
                }
            })
            .catch(err => console.error("PageEditor load error:", err))
            .finally(() => setLoading(false));
    }, [businessSlug, routeKey]);

    const pageLabel =
        existingTab?.title?.[lang] ||
        existingTab?.title?.["en"] ||
        newTabTitle.en ||
        routeKey;

    // Сохранение — если новая страница, также пишем таб в meta
    const handleSave = async () => {
        if (!businessSlug || !routeKey) return;
        setSaving(true);
        try {
            // 1. Сохраняем контент страницы
            const pageData: PageContent = {
                routeKey,
                content,
                updatedAt: Date.now()
            };
            await set(ref(db, `businesses/${businessSlug}/pages/${routeKey}`), pageData);

            // 2. Если таба нет в meta.tabs — создаём его
            if (isNewPage) {
                const tabsSnap = await get(ref(db, `businesses/${businessSlug}/meta/tabs`));
                const existingTabs = tabsSnap.exists() ? tabsSnap.val() : {};
                const maxOrder = Object.values(existingTabs).reduce((max: number, t: any) => Math.max(max, t.order ?? 0), 0);

                const newTab: MetaTab = {
                    route: routeKey,
                    order: maxOrder + 1,
                    enabled: true,
                    title: {
                        uk: newTabTitle.uk || newTabTitle.en || routeKey,
                        ru: newTabTitle.ru || newTabTitle.en || routeKey,
                        en: newTabTitle.en || routeKey,
                        de: newTabTitle.de || newTabTitle.en || routeKey,
                    },
                    shortName: {
                        uk: newTabShortName.uk || newTabShortName.en || routeKey,
                        ru: newTabShortName.ru || newTabShortName.en || routeKey,
                        en: newTabShortName.en || routeKey,
                        de: newTabShortName.de || newTabShortName.en || routeKey,
                    },
                };

                // Используем routeKey как ключ таба
                await update(ref(db, `businesses/${businessSlug}/meta/tabs`), {
                    [routeKey]: newTab
                });
            }

            navigate(adminPath(lang!, businessSlug!, "pages"));
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    // ── Content block helpers ─────────────────────────────────────

    const addBlock = (type: ContentBlock["type"], parentIndex?: number) => {
        const newBlock: ContentBlock = {
            type,
            content: { uk: "", ru: "", en: "", de: "" },
            align: "left",
            ...(type === "image" ? { media: "", widthPercent: 100 } : {}),
        };
        const updated = [...content];
        if (typeof parentIndex === "number") {
            updated[parentIndex].children = [...(updated[parentIndex].children || []), newBlock];
        } else {
            updated.push(newBlock);
        }
        setContent(updated);
    };

    const handleBlockChange = (index: number, l: string, value: string, parentIndex?: number) => {
        const updated = [...content];
        if (typeof parentIndex === "number") {
            updated[parentIndex].children![index].content = {
                ...updated[parentIndex].children![index].content,
                [l]: value
            };
        } else {
            updated[index].content = { ...updated[index].content, [l]: value };
        }
        setContent([...updated]);
    };

    const moveBlock = (index: number, direction: "up" | "down", parentIndex?: number) => {
        const swap = (arr: any[], i1: number, i2: number) => { [arr[i1], arr[i2]] = [arr[i2], arr[i1]]; };
        const updated = [...content];
        if (typeof parentIndex === "number") {
            const children = [...(updated[parentIndex].children || [])];
            if (direction === "up" && index > 0) swap(children, index, index - 1);
            if (direction === "down" && index < children.length - 1) swap(children, index, index + 1);
            updated[parentIndex].children = children;
        } else {
            if (direction === "up" && index > 0) swap(updated, index, index - 1);
            if (direction === "down" && index < updated.length - 1) swap(updated, index, index + 1);
        }
        setContent([...updated]);
    };

    const removeBlock = (index: number, parentIndex?: number) => {
        const updated = [...content];
        if (typeof parentIndex === "number") updated[parentIndex].children?.splice(index, 1);
        else updated.splice(index, 1);
        setContent([...updated]);
    };

    const toggleAlign = (index: number, parentIndex?: number) => {
        const aligns: ("left" | "center" | "right")[] = ["left", "center", "right"];
        const updated = [...content];
        const block = typeof parentIndex === "number"
            ? updated[parentIndex].children![index]
            : updated[index];
        block.align = aligns[(aligns.indexOf(block.align || "left") + 1) % aligns.length];
        setContent([...updated]);
    };

    const updateImageMedia = (url: string, index: number, parentIndex?: number) => {
        const updated = [...content];
        if (typeof parentIndex === "number") updated[parentIndex].children![index].media = url;
        else updated[index].media = url;
        setContent([...updated]);
    };

    const updateImageWidth = (val: number, index: number, parentIndex?: number) => {
        const updated = [...content];
        if (typeof parentIndex === "number") updated[parentIndex].children![index].widthPercent = val;
        else updated[index].widthPercent = val;
        setContent([...updated]);
    };

    const renderBlockEditor = (block: ContentBlock, index: number, parentIndex?: number): React.ReactNode => {
        const blockLabel = parentIndex !== undefined ? `Child ${index + 1}` : `Block ${index + 1}`;
        const key = `${parentIndex ?? "root"}-${index}`;

        return (
            <div className="w-full flex" key={key}>
                <div className="border border-gray-100 rounded-[32px] p-6 my-3 bg-white shadow-sm w-full transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
              {blockLabel} — {block.type}
            </span>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => toggleAlign(index, parentIndex)} className="p-2 hover:bg-blue-50 rounded-xl transition text-[14px] border border-gray-50 flex items-center justify-center min-w-[40px]">
                                {block.align === "center" ? "≡" : block.align === "right" ? "⇶" : "≣"}
                                <span className="ml-1 text-[8px] uppercase font-black">{block.align || "left"}</span>
                            </button>
                            <div className="h-4 w-[1px] bg-gray-100 mx-1" />
                            <button onClick={() => moveBlock(index, "up", parentIndex)} className="p-2 hover:bg-gray-100 rounded-xl transition">↑</button>
                            <button onClick={() => moveBlock(index, "down", parentIndex)} className="p-2 hover:bg-gray-100 rounded-xl transition">↓</button>
                            <button onClick={() => removeBlock(index, parentIndex)} className="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase ml-2 tracking-widest">Delete</button>
                        </div>
                    </div>

                    {block.type === "image" ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Width %</span>
                                <input type="range" min={20} max={100} step={5} value={block.widthPercent || 100}
                                       onChange={e => updateImageWidth(Number(e.target.value), index, parentIndex)} className="flex-1" />
                                <span className="text-xs font-black text-blue-500 w-10">{block.widthPercent || 100}%</span>
                            </div>
                            <div className="max-w-sm mx-auto">
                                <ImageInputBlock image={block.media || ""} onChange={url => updateImageMedia(url, index, parentIndex)} />
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                {(["left", "center", "right"] as const).map(pos => (
                                    <button key={pos}
                                            onClick={() => {
                                                const updated = [...content];
                                                const b = typeof parentIndex === "number" ? updated[parentIndex].children![index] : updated[index];
                                                b.align = pos;
                                                setContent([...updated]);
                                            }}
                                            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${block.align === pos ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                                    >{pos}</button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["uk", "ru", "en", "de"].map(l => (
                                <div key={l}>
                                    <div className="text-[9px] font-black text-gray-300 mb-1 ml-1 uppercase">{l}</div>
                                    {block.type === "list" || block.type === "paragraph" ? (
                                        <textarea className="w-full border border-gray-100 rounded-2xl p-4 text-sm h-32 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner bg-gray-50/30"
                                                  value={(block.content?.[l] as string) || ""} onChange={e => handleBlockChange(index, l, e.target.value, parentIndex)} placeholder={`Content in ${l}...`} />
                                    ) : (
                                        <input type="text" className="w-full border border-gray-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-inner bg-gray-50/30 font-bold"
                                               value={(block.content?.[l] as string) || ""} onChange={e => handleBlockChange(index, l, e.target.value, parentIndex)} placeholder={`Heading in ${l}...`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {block.children?.map((child, i) => renderBlockEditor(child, i, index))}

                    {block.type === "image" && (
                        <div className="flex gap-4 mt-6 border-t border-gray-50 pt-4">
                            {["heading", "paragraph", "list"].map(t => (
                                <button key={t} onClick={() => addBlock(t as any, index)}
                                        className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition px-4 py-2 bg-blue-50 rounded-xl">
                                    + Add {t} caption
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading Page Data...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">

            <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
                        {businessSlug} — /{routeKey}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-1 tracking-tight">{pageLabel}</p>
                </div>
                <div className="flex gap-6 items-center">
                    <button onClick={() => navigate(adminPath(lang!, businessSlug!, "pages"))}
                            className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">
                        Discard
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50">
                        {saving ? "Saving..." : "Save Page"}
                    </button>
                </div>
            </div>

            {/* ── Форма для нового таба (только если страница новая) ── */}
            {isNewPage && (
                <div className="mb-12 p-8 border-2 border-blue-100 bg-blue-50/20 rounded-[32px]">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <h2 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em]">
                            New Tab — будет создан в меню при сохранении
                        </h2>
                    </div>
                    <p className="text-gray-400 text-xs mb-6">
                        Route: <code className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">/{routeKey}</code> — заполни названия таба на нужных языках
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page Title (полное название страницы)
                            </label>
                            {["en", "uk", "ru", "de"].map(l => (
                                <div key={l} className="flex gap-3 items-center">
                                    <span className="text-[10px] font-black text-gray-300 uppercase w-6">{l}</span>
                                    <input type="text"
                                           className="flex-1 border border-gray-100 rounded-xl p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                                           placeholder={`Title in ${l}`}
                                           value={newTabTitle[l as keyof typeof newTabTitle] || ""}
                                           onChange={e => setNewTabTitle(prev => ({ ...prev, [l]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Short Name */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Menu Label (короткое имя в навигации)
                            </label>
                            {["en", "uk", "ru", "de"].map(l => (
                                <div key={l} className="flex gap-3 items-center">
                                    <span className="text-[10px] font-black text-gray-300 uppercase w-6">{l}</span>
                                    <input type="text"
                                           className="flex-1 border border-gray-100 rounded-xl p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                                           placeholder={`Short name in ${l}`}
                                           value={newTabShortName[l as keyof typeof newTabShortName] || ""}
                                           onChange={e => setNewTabShortName(prev => ({ ...prev, [l]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Page Builder */}
            <div className="mb-20">
                <div className="flex justify-between items-center mb-10 px-4">
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Page Builder</h2>
                    <div className="flex gap-2">
                        {["heading", "paragraph", "image", "list"].map(type => (
                            <button key={type} onClick={() => addBlock(type as any)}
                                    className="bg-gray-100 hover:bg-black hover:text-white px-5 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest text-gray-500">
                                + {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                    {content.length > 0 ? (
                        content.map((block, i) => renderBlockEditor(block, i))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[40px] text-gray-300 font-bold uppercase tracking-widest text-xs">
                            The canvas is empty. Add blocks above.
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-50 pt-8 flex justify-end items-center gap-6">
                <button onClick={() => navigate(adminPath(lang!, businessSlug!, "pages"))}
                        className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">
                    Discard
                </button>
                <button onClick={handleSave} disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-20 py-6 rounded-[2.5rem] transition-all font-black shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-sm disabled:opacity-50">
                    {saving ? "Saving..." : isNewPage ? "Save & Add to Menu" : "Save Page"}
                </button>
            </div>
        </div>
    );
}