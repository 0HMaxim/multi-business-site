import { useParams, useNavigate } from "react-router-dom";
import { ref, get, set, update } from "firebase/database";
import { db } from "../../firebase";
import type { BusinessMeta, BusinessType } from "../../models/Meta";
import type { GeneralInfo } from "../../models/GeneralInfo";
import { useBusiness } from "../../context/BusinessContext.tsx";
import ImageInputBlock from "../../components/ImageInputBlock.tsx";
import { TopImage } from "../../components/TopImage.tsx";
import { useEffect, useState } from "react";
import IconXMark from "~icons/fa6-solid/xmark";
import type {MetaTab} from "../../models/MetaTab.ts";
import {adminPath} from "../../utils/adminNavigate.ts";

const LANGS = ["uk", "ru", "en", "de"] as const;
const BUSINESS_TYPES: BusinessType[] = ["clinic", "salon", "company", "studio", "shop", "other"];

export default function MetaEditor() {
    const { businessSlug, lang = "en" } = useParams<{ businessSlug: string; lang?: string }>();
    const navigate = useNavigate();
    const { slug, meta: businessContextMeta } = useBusiness();

    const [meta, setMeta] = useState<BusinessMeta | null>(null);
    const [info, setInfo] = useState<GeneralInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const displayName = businessContextMeta?.name?.[lang as keyof typeof businessContextMeta.name] || slug;

    useEffect(() => {
        if (!businessSlug) return;
        const fetchData = async () => {
            setLoading(true);
            const [metaSnap, infoSnap] = await Promise.all([
                get(ref(db, `businesses/${businessSlug}/meta`)),
                get(ref(db, `businesses/${businessSlug}/generalInfo`))
            ]);

            if (metaSnap.exists()) {
                setMeta(metaSnap.val());
            } else {
                setMeta({
                    name: {}, shortName: {}, type: "other",
                    description: {}, slogan: {}, logo: "",
                    tabs: {}
                } as BusinessMeta);
            }

            if (infoSnap.exists()) {
                setInfo(infoSnap.val());
            } else {
                setInfo({ map: "" } as GeneralInfo);
            }
            setLoading(false);
        };
        fetchData();
    }, [businessSlug]);


    const moveTab = (key: string, direction: "up" | "down") => {
        setMeta(prev => {
            if (!prev || !prev.tabs) return prev;

            // 1. Превращаем в массив и сортируем по текущему order, чтобы работать с актуальным порядком
            const entries = Object.entries(prev.tabs).sort(
                ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0)
            );

            const index = entries.findIndex(([k]) => k === key);
            if (index === -1) return prev;
            if (direction === "up" && index === 0) return prev;
            if (direction === "down" && index === entries.length - 1) return prev;

            const newEntries = [...entries];
            const targetIndex = direction === "up" ? index - 1 : index + 1;

            // 2. Меняем местами в массиве
            [newEntries[index], newEntries[targetIndex]] = [newEntries[targetIndex], newEntries[index]];

            // 3. ПЕРЕЗАПИСЫВАЕМ поле order для каждого таба согласно его новому индексу
            const updatedTabs: Record<string, MetaTab> = {};
            newEntries.forEach(([k, tab], i) => {
                updatedTabs[k] = {
                    ...tab,
                    order: i // Теперь индекс в массиве становится его порядковым номером
                };
            });

            return {
                ...prev,
                tabs: updatedTabs
            };
        });
    };


    const handleSave = async () => {
        if (!meta || !businessSlug) return;
        try {
            await Promise.all([
                set(ref(db, `businesses/${businessSlug}/meta`), {
                    ...meta,
                    updatedAt: Date.now()
                }),
                update(ref(db, `businesses/${businessSlug}/meta`), {
                    map: info?.map || ""
                })
            ]);

            navigate(adminPath(lang!, businessSlug!, ""));
        } catch (e) {
            console.error("Save error:", e);
        }
    };

    // Универсальный рендер картинок (для Logo, HomeHeader и Табов)
    const renderImageInput = (label: string, field: keyof BusinessMeta | "tabs", tabKey?: string) => {
        const currentTab = tabKey ? meta?.tabs?.[tabKey] : null;
        const currentImage = tabKey ? currentTab?.headerImage : (meta?.[field as keyof BusinessMeta] as string);

        const handleChange = (url: string) => {
            setMeta(prev => {
                if (!prev || !tabKey || !prev.tabs) return prev;

                const tab = prev.tabs[tabKey];
                if (!tab) return prev;

                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        [tabKey]: {
                            ...tab,
                            headerImage: url,
                        },
                    },
                };
            });
        };


        return (
            <div className="bg-gray-50/30 p-6 rounded-[32px] border border-gray-100 space-y-4 shadow-sm">
                <label className="block font-black text-gray-400 uppercase text-[10px] tracking-widest ml-1">
                    {label}
                </label>

                <div className="w-full h-32 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-white">
                    <TopImage source={currentImage} />
                </div>

                <ImageInputBlock image={currentImage || ""} onChange={handleChange} />

                {/* Если передан tabKey, рисуем инпут для Route этого конкретного таба */}
                {tabKey && (
                    <div className="pt-2 border-t border-gray-200/50 mt-2">
                        <label className="block font-black text-gray-300 uppercase text-[8px] tracking-widest mb-1 ml-1">
                            Page Route / URL
                        </label>
                        <input
                            className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono bg-white outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="e.g. services or /contacts"
                            value={meta?.tabs?.[tabKey]?.route || ""}
                            onChange={(e) => {
                                const newRoute = e.target.value;
                                setMeta(prev => {
                                    if (!prev) return null;
                                    return {
                                        ...prev,
                                        tabs: {
                                            ...(prev.tabs || {}),
                                            [tabKey]: {
                                                ...(prev.tabs?.[tabKey] || { enabled: true, shortName: {}, title: {} }),
                                                route: newRoute
                                            }
                                        }
                                    };
                                });
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    if (loading || !meta || !info) return (
        <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading Data...</div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">{displayName} — Meta</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Full Branding & Navigation Control</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate(adminPath(lang!, businessSlug!, ""))} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">Discard</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95">Save All</button>
                </div>
            </div>

            <div className="space-y-12">

                {/* 1. Названия (Name & Short Name) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm space-y-6">
                        <label className="block font-black text-gray-400 uppercase text-[10px] tracking-widest">Full Business Name</label>
                        <div className="grid grid-cols-2 gap-4">
                            {LANGS.map(l => (
                                <div key={l} className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-300 uppercase ml-1">{l}</span>
                                    <input className="w-full border border-gray-50 rounded-xl p-3 text-sm bg-gray-50/30 outline-none"
                                           value={meta.name?.[l] || ""}
                                           onChange={e => setMeta({...meta, name: {...meta.name, [l]: e.target.value}})} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm space-y-6">
                        <label className="block font-black text-gray-400 uppercase text-[10px] tracking-widest">Short Name (Menu/Mobile)</label>
                        <div className="grid grid-cols-2 gap-4">
                            {LANGS.map(l => (
                                <div key={l} className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-300 uppercase ml-1">{l}</span>
                                    <input className="w-full border border-gray-50 rounded-xl p-3 text-sm bg-gray-50/30 outline-none"
                                           value={meta.shortName?.[l] || ""}
                                           onChange={e => setMeta({...meta, shortName: {...(meta.shortName || {}), [l]: e.target.value}})} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Тип бизнеса и Логотип */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="p-8 border border-gray-100 rounded-[32px] bg-gray-50/30 space-y-6">
                        <label className="block font-black text-gray-400 uppercase text-[10px] tracking-widest">Business Category</label>
                        <select className="w-full border border-white bg-white rounded-2xl p-4 font-bold text-gray-700 outline-none shadow-sm"
                                value={meta.type}
                                onChange={e => setMeta({...meta, type: e.target.value as BusinessType})}>
                            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                        <div className="pt-4 flex flex-col items-center border-t border-white/50">
                            <label className="block font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest self-start">Logo</label>
                            <ImageInputBlock image={meta.logo || ""} onChange={(url) => setMeta({ ...meta, logo: url })} />
                        </div>
                    </div>
                    {renderImageInput("Home Header", "tabs", "home")}
                </div>

                {/* 3. Слоган и Описание */}
                <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-[0.2em]">Marketing & SEO Texts</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Slogan */}
                        <div className="space-y-4">
                            <label className="block font-black text-blue-500 uppercase text-[10px] tracking-widest ml-1">Slogan</label>
                            {LANGS.map(l => (
                                <input key={l} className="w-full border border-gray-50 rounded-xl p-3 text-sm bg-gray-50/30 outline-none"
                                       placeholder={`Slogan ${l}`}
                                       value={meta.slogan?.[l] || ""}
                                       onChange={e => setMeta({...meta, slogan: {...(meta.slogan || {}), [l]: e.target.value}})} />
                            ))}
                        </div>
                        {/* Description */}
                        <div className="space-y-4">
                            <label className="block font-black text-blue-500 uppercase text-[10px] tracking-widest ml-1">Description</label>
                            {LANGS.map(l => (
                                <textarea key={l} className="w-full border border-gray-50 rounded-xl p-3 text-xs bg-gray-50/30 outline-none h-16 resize-none shadow-inner"
                                          placeholder={`Full text ${l}`}
                                          value={meta.description?.[l] || ""}
                                          onChange={e => setMeta({...meta, description: {...(meta.description || {}), [l]: e.target.value}})} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Табы (MetaTab) */}
                {/* 4. Табы (MetaTab) */}
                <div className="p-8 border border-gray-100 rounded-[40px] bg-gray-50/20">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Navigation Tabs (Dynamic)</h3>
                        <button onClick={() => {
                            const id = `tab_${Date.now()}`;
                            setMeta(prev => ({
                                ...prev!,
                                tabs: {
                                    ...(prev?.tabs || {}),
                                    [id]: {
                                        shortName: { uk: "", ru: "", en: "", de: "" },
                                        title: { uk: "", ru: "", en: "", de: "" },
                                        description: { uk: "", ru: "", en: "", de: "" },
                                        route: "new-path",
                                        enabled: true,
                                        headerImage: "",
                                        order: Object.keys(prev?.tabs || {}).length
                                    }
                                }
                            }));
                        }} className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:scale-105 active:scale-95 shadow-xl">
                            + Add New Tab
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                        {Object.entries(meta.tabs || {})
                            .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
                            .map(([key, tab]) => (
                                <div key={key} className="p-8 border border-gray-200 rounded-[32px] bg-white shadow-sm overflow-hidden">
                                    <div className="flex flex-col gap-8">

                                        {/* Хедер таба с управлением */}
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                            <div className="flex items-center gap-4">
                                <span className="font-black text-blue-600 uppercase text-[11px] tracking-widest">
                                    Tab ID: {key}
                                </span>
                                                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                    <button onClick={() => moveTab(key, "up")} className="p-1 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                                                    </button>
                                                    <button onClick={() => moveTab(key, "down")} className="p-1 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={tab.enabled !== false}
                                                        onChange={e => setMeta(prev => ({
                                                            ...prev!,
                                                            tabs: {...prev!.tabs!, [key]: {...tab, enabled: e.target.checked}}
                                                        }))}
                                                        className="w-4 h-4 rounded-md"
                                                    />
                                                    Active
                                                </label>
                                                <button
                                                    onClick={() => setMeta(prev => {
                                                        const t = {...prev!.tabs};
                                                        delete t[key];
                                                        return {...prev!, tabs: t};
                                                    })}
                                                    className="text-red-300 hover:text-red-500 transition"
                                                >
                                                    <IconXMark className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Основной контент таба */}
                                        <div className="flex flex-col lg:flex-row gap-10">

                                            {/* Левая часть: 4 языка */}
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {LANGS.map(l => (
                                                    <div key={l} className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded uppercase">{l}</span>
                                                        </div>

                                                        {/* Short Name */}
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase ml-1">Menu Label (Short)</span>
                                                            <input
                                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                                                                placeholder="e.g. Courses"
                                                                value={tab.shortName?.[l] || ""}
                                                                onChange={e => setMeta(prev => ({
                                                                    ...prev!,
                                                                    tabs: { ...prev!.tabs!, [key]: { ...tab, shortName: { ...(tab.shortName || {}), [l]: e.target.value } } }
                                                                }))}
                                                            />
                                                        </div>

                                                        {/* Full Title */}
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase ml-1">Full Page Title</span>
                                                            <input
                                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all"
                                                                placeholder="e.g. Our Language Courses"
                                                                value={tab.title?.[l] || ""}
                                                                onChange={e => setMeta(prev => ({
                                                                    ...prev!,
                                                                    tabs: { ...prev!.tabs!, [key]: { ...tab, title: { ...(tab.title || {}), [l]: e.target.value } } }
                                                                }))}
                                                            />
                                                        </div>

                                                        {/* Description */}
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase ml-1">Description</span>
                                                            <textarea
                                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all h-20 resize-none"
                                                                placeholder="Describe this page..."
                                                                value={tab.description?.[l] || ""}
                                                                onChange={e => setMeta(prev => ({
                                                                    ...prev!,
                                                                    tabs: { ...prev!.tabs!, [key]: { ...tab, description: { ...(tab.description || {}), [l]: e.target.value } } }
                                                                }))}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Правая часть: Визуал (Header Image) и Route */}
                                            <div className="w-full lg:w-80">
                                                {renderImageInput("Tab Banner & Route", "tabs", key)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>



                {/* 5. Google Map */}
                <div className="p-8 border border-gray-100 rounded-[40px] bg-blue-50/20">
                    <label className="block font-black text-blue-600 mb-5 uppercase text-[10px] tracking-widest ml-1">Map Embed Code</label>
                    <textarea className="w-full border border-blue-100 rounded-2xl p-4 font-mono text-xs bg-white h-32 outline-none shadow-inner"
                              value={info.map || ""} onChange={e => setInfo({...info, map: e.target.value})} placeholder='Paste iframe here...' />
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                <button onClick={() => navigate(adminPath(lang!, businessSlug!, ""))} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">Discard</button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-20 py-6 rounded-[2.5rem] transition-all font-black shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-sm">Update All Metadata</button>
            </div>
        </div>
    );
}