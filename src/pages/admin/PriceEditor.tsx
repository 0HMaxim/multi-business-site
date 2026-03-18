import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set } from "firebase/database"; // Удален неиспользуемый update
import { db } from "../../firebase.ts";
import { useTranslation } from "react-i18next";

// Models
import type { PriceModel } from "../../models/Price.ts"; // Удален PriceSection из импорта
import type { Service } from "../../models/Service.ts";
import type { Special } from "../../models/Special.ts";
import type { LocalizedText } from "../../models/LocalizedText.ts";

// Components
import { useFetchData } from "../../hooks/useFetchData.ts";
import { SyncedRelationSelect } from "../../components/SyncedRelationSelect.tsx";
import {adminPath} from "../../utils/adminNavigate.ts";
import {Button} from "@heroui/react";

export default function PriceEditor() {
    const { businessSlug, id, lang } = useParams<{
        businessSlug: string;
        id: string;
        lang: string;
    }>();

    const navigate = useNavigate();
    useTranslation(); // Убрано извлечение { i18n }, если оно не используется

    const emptyPrice: PriceModel = {
        category: {},
        columns: { duration: {}, procedure: {}, price: {} },
        sections: [],
        serviceIds: [],
        specials: "",
    };

    const [price, setPrice] = useState<PriceModel>(emptyPrice);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { data, loading } = useFetchData(
        ["prices", "services", "specials"],
        businessSlug
    );

    useEffect(() => {
        if (!id || id === "new") return;

        const found = data?.prices?.find(p => p.id === id);
        if (found) setPrice({ ...emptyPrice, ...found });
    }, [id, data?.prices]);


    const langs = ["uk", "ru", "en", "de"];

    const handleLocalizedChange = (field: "category", lang: string, value: string) => {
        setPrice(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value }
        }));
    };

    const validate = () => {
        const errors: Record<string, string> = {};

        const hasCategoryName = Object.values(price.category || {}).some(
            v => typeof v === "string" && v.trim()
        );

        if (!hasCategoryName) errors.category = "Category name is required";

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!businessSlug) return;
        if (!validate()) return;

        const basePath = `businesses/${businessSlug}/prices`;
        const baseRef = ref(db, basePath);

        const priceId = id && id !== "new" ? id : push(baseRef).key;

        if (!priceId) return;

        await set(ref(db, `${basePath}/${priceId}`), {
            ...price,
            id: priceId,
        });


        navigate(adminPath(lang!, businessSlug!, "prices"));
    };



    if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading Price Data...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
                        {id && id !== "new" ? "Edit Price" : "New Price Table"}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Configure pricing architecture and service links</p>
                </div>

                <div className="border-t border-gray-50 pt-8 flex justify-end items-center gap-6">
                    <Button
                        onClick={() => navigate(adminPath(lang!, businessSlug!, "prices"))}
                        className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
                    >
                        Discard Changes
                    </Button>

                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-[2rem] transition-all font-black shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Save Price
                    </Button>
                </div>
            </div>

            <div className="space-y-12">

                {/* Step 1: Base Category Info */}
                <section className="p-10 border border-gray-100 rounded-[40px] bg-gray-50/30 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <label className="block font-black text-gray-400 mb-8 uppercase text-[10px] tracking-[0.4em] ml-1">Table Title / Category Name</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {langs.map(lang => (
                            <div key={lang}>
                                <div className="text-[10px] font-black text-gray-300 mb-2 ml-4 uppercase tracking-widest">{lang}</div>
                                <input
                                    className={`w-full border rounded-2xl p-4 shadow-inner outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold ${errors.category ? "border-red-200 bg-red-50/30" : "border-gray-50 bg-white hover:border-gray-200"}`}
                                    value={String(price.category?.[lang as keyof LocalizedText] || "")}
                                    onChange={(e) => handleLocalizedChange("category", lang, e.target.value)}
                                    placeholder="e.g. Laser Aesthetics"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step 2: Relations */}
                <section className="bg-blue-50/40 p-10 rounded-[48px] border border-blue-100/50 shadow-inner space-y-8">
                    <h2 className="text-[11px] font-black text-blue-900 mb-4 tracking-[0.3em] uppercase flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                        Strategic Connections
                    </h2>
                    <div className="grid grid-cols-1 gap-8">
                        <SyncedRelationSelect<Service>
                            label="Connect to Services"
                            value={price.serviceIds || []}
                            options={(data.services || []) as Service[]}
                            getLabel={(o) => String(o.title?.uk || "Untitled Service")}
                            getValue={(o) => o.id!}
                            onChange={(v) => setPrice({ ...price, serviceIds: v })}
                            firebasePath="services"
                            parentId={price.id}
                            parentFieldName="prices"
                            syncType="array"
                        />
                        <SyncedRelationSelect<Special>
                            label="Attach Special Offers"
                            value={(price.specials as unknown as string[]) || []}
                            options={(data.specials || []) as Special[]}
                            getLabel={(o) => String(o.title?.uk || "Untitled Special")}
                            getValue={(o) => o.id!}
                            onChange={(v) => setPrice({ ...price, specials: v.join(",") as any })}
                            firebasePath="specials"
                            parentId={price.id}
                            parentFieldName="blogIds"
                            syncType="array"
                        />
                    </div>
                </section>

                {/* Step 3: Column Headers */}
                <section className="p-10 border border-gray-100 rounded-[40px] bg-white shadow-sm">
                    <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-400 rounded-full"></span>
                        Table Header Design
                    </h2>
                    <div className="space-y-8">
                        {(["duration", "procedure", "price"] as const).map(col => (
                            <div key={col} className="bg-gray-50/30 p-8 rounded-[32px] border border-gray-100">
                                <div className="text-[10px] font-black text-gray-400 uppercase mb-5 tracking-widest italic ml-1">Column: {col}</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {langs.map(l => (
                                        <div key={l}>
                                            <div className="text-[9px] font-black text-gray-300 mb-1 ml-2 uppercase">{l}</div>
                                            <input
                                                className="w-full border border-gray-50 rounded-xl p-3 text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-white transition-all shadow-sm"
                                                value={String((price.columns[col] as any)?.[l] || "")}
                                                onChange={e => setPrice({
                                                    ...price,
                                                    columns: { ...price.columns, [col]: { ...price.columns[col], [l]: e.target.value } }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step 4: Sections & Rows */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center px-6">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Table Content</h2>
                        <Button
                            onClick={() => setPrice({ ...price, sections: [...(price.sections || []), { subtitle: {}, items: [] }] })}
                            className="bg-gray-900 text-white text-[10px] font-black px-8 py-3 rounded-2xl uppercase tracking-widest hover:bg-black transition shadow-xl active:scale-95"
                        >
                            + Add Section
                        </Button>
                    </div>

                    {(price.sections || []).map((section, sIdx) => (
                        <div key={sIdx} className="p-10 border border-gray-100 rounded-[48px] bg-white shadow-2xl shadow-gray-100/50 relative group transition-all hover:border-blue-100">
                            <button
                                onClick={() => {
                                    const newSections = [...price.sections];
                                    newSections.splice(sIdx, 1);
                                    setPrice({ ...price, sections: newSections });
                                }}
                                className="absolute top-8 right-10 text-red-400 hover:text-red-600 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all tracking-widest"
                            >
                                Remove Section
                            </button>

                            <div className="mb-10">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 ml-2">Sub-header for this group</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {langs.map(l => (
                                        <div key={l}>
                                            <input
                                                placeholder={`Group Title ${l.toUpperCase()}`}
                                                className="w-full border-b-2 border-gray-50 p-3 text-sm font-black focus:border-blue-500 outline-none transition-colors italic bg-transparent"
                                                value={String(section.subtitle?.[l as keyof LocalizedText] || "")}
                                                onChange={e => {
                                                    const newSections = [...price.sections];
                                                    newSections[sIdx].subtitle = { ...newSections[sIdx].subtitle, [l]: e.target.value };
                                                    setPrice({ ...price, sections: newSections });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {(section.items || []).map((item, iIdx) => (
                                    <div key={iIdx} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end bg-gray-50/50 p-6 rounded-[24px] border border-gray-50 relative group/item hover:bg-white transition-all hover:shadow-md">
                                        {/* --- DURATION (Локализованный) --- */}
                                        <div className="lg:col-span-4 space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">Duration / Time</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {langs.map(l => (
                                                    <div key={l}>
                                                        <div className="text-[7px] font-bold text-gray-300 uppercase ml-1">{l}</div>
                                                        <input
                                                            placeholder="45 min"
                                                            className="w-full bg-white border border-gray-100 rounded-lg p-2 text-[10px] font-bold shadow-sm focus:ring-2 focus:ring-blue-50 outline-none"
                                                            // Проверяем на объект, чтобы не упало если в базе старая строка
                                                            value={typeof item.duration === 'object' ? (item.duration?.[l as keyof LocalizedText] || "") : ""}
                                                            onChange={e => {
                                                                const newSections = [...price.sections];
                                                                const currentDuration = typeof item.duration === 'object' ? item.duration : { uk: "", ru: "", en: "", de: "" };
                                                                newSections[sIdx].items[iIdx].duration = { ...currentDuration, [l]: e.target.value };
                                                                setPrice({ ...price, sections: newSections });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                                            <label className="col-span-2 text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block tracking-widest text-center lg:text-left">Program / Procedure Name</label>
                                            {langs.map(l => (
                                                <div key={l}>
                                                    <label className="text-[8px] font-black text-gray-300 uppercase ml-2 mb-1 block tracking-tighter">{l}</label>
                                                    <input
                                                        className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-medium focus:ring-2 focus:ring-blue-50 outline-none"
                                                        value={String(item.procedure?.[l as keyof LocalizedText] || "")}
                                                        onChange={e => {
                                                            const newSections = [...price.sections];
                                                            newSections[sIdx].items[iIdx].procedure = { ...item.procedure, [l]: e.target.value };
                                                            setPrice({ ...price, sections: newSections });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="lg:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-blue-600 uppercase ml-2 mb-2 block tracking-widest">Price</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {langs.map(l => (
                                                    <div key={l}>
                                                        <div className="text-[7px] font-bold text-gray-300 uppercase ml-1">{l}</div>
                                                        <input
                                                            placeholder="від $100"
                                                            className="w-full bg-blue-50 border border-blue-100 rounded-lg p-2 text-[10px] font-black text-blue-700 shadow-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                                            value={
                                                                typeof item.price === 'object'
                                                                    ? (item.price?.[l as keyof typeof item.price] || "")
                                                                    : (l === "en" ? String(item.price || "") : "")
                                                            }
                                                            onChange={e => {
                                                                const newSections = [...price.sections];
                                                                const currentPrice = typeof item.price === 'object'
                                                                    ? item.price
                                                                    : { uk: "", ru: "", en: String(item.price || ""), de: "" };
                                                                newSections[sIdx].items[iIdx].price = { ...currentPrice, [l]: e.target.value } as any;
                                                                setPrice({ ...price, sections: newSections });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-1 flex justify-center pb-3">
                                            <Button
                                                onClick={() => {
                                                    const newSections = [...price.sections];
                                                    newSections[sIdx].items.splice(iIdx, 1);
                                                    setPrice({ ...price, sections: newSections });
                                                }}
                                                className="text-red-300 hover:text-red-500 transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    onClick={() => {
                                        const newSections = [...price.sections];
                                        newSections[sIdx].items.push({ duration: {}, procedure: {}, price: {} });
                                        setPrice({ ...price, sections: newSections });
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[20px] text-[10px] font-black text-gray-300 uppercase hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/20 transition-all mt-4 tracking-[0.2em]"
                                >
                                    + Insert Line Item
                                </Button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-50 mt-16 pt-10 flex justify-end items-center gap-8">
                <Button
                    onClick={() => navigate(adminPath(lang!, businessSlug!, "prices"))}
                    className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-gray-900 transition"
                >
                    Discard Changes
                </Button>
                <button onClick={handleSave} className="bg-gray-900 hover:bg-black text-white px-20 py-5 rounded-[2.5rem] transition-all font-black shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-xs">
                    Publish Price Structure
                </button>
            </div>
        </div>
    );
}