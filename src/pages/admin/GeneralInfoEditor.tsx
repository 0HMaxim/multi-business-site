import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, set } from "firebase/database";
import { db } from "../../firebase";
import type { GeneralInfo } from "../../models/GeneralInfo";
import { useBusiness } from "../../context/BusinessContext.tsx";
import {adminPath} from "../../utils/adminNavigate.ts";

const LANGS = ["uk", "ru", "en", "de"] as const;

export default function GeneralInfoEditor() {
    const { businessSlug, lang = "en" } = useParams<{ businessSlug: string; lang?: string }>();
    const { slug } = useBusiness();
    const navigate = useNavigate();

    const defaultInfo: GeneralInfo = {
        address: {},
        phone: {},
        email: "",
        working_hours: [],
        messengers: { telegram: "", viber: "", whatsapp: "" },
        socials: { instagram: "", facebook: "" },
        map: "", // Поле для iframe
    };

    const [info, setInfo] = useState<GeneralInfo>(defaultInfo);
    const [loading, setLoading] = useState(true);

    /* ------------------ LOAD DATA ------------------ */
    useEffect(() => {
        if (!businessSlug) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // ПРИВЕДЕНО К ЕДИНОМУ СТИЛЮ: generalInfo (CamelCase)
                const snapshot = await get(ref(db, `businesses/${businessSlug}/generalInfo`));
                if (snapshot.exists()) {
                    setInfo({ ...defaultInfo, ...snapshot.val() });
                }
            } catch (error) {
                console.error("Error loading general info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [businessSlug]);

    /* ------------------ SAVE DATA ------------------ */
    const handleSave = async () => {
        if (!businessSlug) return;

        try {
            await set(ref(db, `businesses/${businessSlug}/generalInfo`), {
                ...info,
                updatedAt: Date.now(),
            });

            navigate(adminPath(lang!, businessSlug!, ""));
        } catch (error) {
            console.error("Save error:", error);
        }
    };


    if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading General Info...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">{slug} — General Info</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-wider">Contact Details & Location</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate(adminPath(lang!, businessSlug!, ""))} className="text-gray-400 font-black text-xs uppercase tracking-widest px-4">Discard</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all">Save All</button>
                </div>
            </div>

            <div className="space-y-10">
                {/* 1. АДРЕС И ТЕЛЕФОН */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(["address", "phone"] as const).map((field) => (
                        <div key={field} className="p-8 border border-gray-100 rounded-[32px] bg-gray-50/20 shadow-sm">
                            <label className="block font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] mb-6">{field}</label>
                            <div className="space-y-4">
                                {LANGS.map((l) => (
                                    <div key={l}>
                                        <div className="text-[9px] font-black text-blue-400 mb-1 ml-2 uppercase">{l}</div>
                                        <input
                                            className="w-full border border-gray-100 rounded-2xl p-4 text-xs font-bold shadow-inner bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                            value={info[field]?.[l] || ""}
                                            onChange={(e) => setInfo({ ...info, [field]: { ...info[field], [l]: e.target.value } })}
                                            placeholder={`Enter ${field} in ${l}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. EMAIL & GOOGLE MAP (Инпут для карты здесь) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm flex flex-col justify-center">
                        <label className="block font-black text-gray-400 uppercase text-[10px] tracking-[0.3em] mb-4 ml-1">Official Email</label>
                        <input
                            className="w-full border border-gray-100 rounded-2xl p-4 text-sm font-bold shadow-inner bg-gray-50/30 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            value={info.email || ""}
                            onChange={(e) => setInfo({ ...info, email: e.target.value })}
                            placeholder="hello@business.com"
                        />
                    </div>

                    <div className="p-8 border border-blue-100 rounded-[32px] bg-blue-50/10 shadow-sm lg:col-span-2 space-y-4">
                        <label className="block font-black text-blue-500 uppercase text-[10px] tracking-[0.3em] ml-1">Google Maps Iframe Code</label>
                        <textarea
                            className="w-full border border-blue-100 rounded-2xl p-4 text-xs font-mono shadow-inner bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all h-24"
                            value={info.map || ""}
                            onChange={(e) => setInfo({ ...info, map: e.target.value })}
                            placeholder='Paste the <iframe...> code from Google Maps here'
                        />

                        {/* ПРЕВЬЮ КАРТЫ (Она появится сразу после вставки кода) */}
                        {info.map && info.map.toLowerCase().includes("<iframe") && (
                            <div className="mt-4 w-full h-40 rounded-2xl overflow-hidden border-2 border-white shadow-md relative">
                                <div
                                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
                                    dangerouslySetInnerHTML={{ __html: info.map }}
                                />
                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg">Live Preview</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Slogan Section - ДОБАВЛЕНО */}

                {/* 3. WORKING HOURS */}
                <div className="p-10 border border-gray-100 rounded-[40px] bg-gray-50/40 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-gray-800 font-black uppercase text-xs tracking-[0.3em]">Working Schedule</h2>
                        <button
                            onClick={() => setInfo({
                                ...info,
                                working_hours: [...info.working_hours, { days: LANGS.reduce((acc, l) => ({ ...acc, [l]: "" }), {}), hours: "" }],
                            })}
                            className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-colors"
                        >
                            + Add Time Slot
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {info.working_hours.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group">
                                <button
                                    onClick={() => {
                                        const updated = [...info.working_hours];
                                        updated.splice(idx, 1);
                                        setInfo({ ...info, working_hours: updated });
                                    }}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors font-black"
                                >✕</button>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        {LANGS.map(l => (
                                            <div key={l}>
                                                <p className="text-[8px] font-black text-gray-400 uppercase ml-1 mb-1">{l}</p>
                                                <input
                                                    className="w-full border border-gray-50 rounded-xl p-2 text-[10px] font-bold bg-gray-50/50 focus:bg-white transition-all"
                                                    value={(item.days as any)?.[l] || ""}
                                                    onChange={(e) => {
                                                        const updated = [...info.working_hours];
                                                        updated[idx].days = { ...(updated[idx].days as any), [l]: e.target.value };
                                                        setInfo({ ...info, working_hours: updated });
                                                    }}
                                                    placeholder="Mon-Fri"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-blue-500 uppercase ml-1 mb-1">Hours Range</p>
                                        <input
                                            className="w-full border border-blue-50 rounded-xl p-3 text-xs font-black text-blue-600 bg-blue-50/20"
                                            value={item.hours || ""}
                                            onChange={(e) => {
                                                const updated = [...info.working_hours];
                                                updated[idx].hours = e.target.value;
                                                setInfo({ ...info, working_hours: updated });
                                            }}
                                            placeholder="09:00 - 18:00"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. MESSENGERS & SOCIALS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Messengers (Blue) */}
                    <div className="bg-[#0A0A0A] p-10 rounded-[40px] shadow-xl space-y-6">
                        <label className="block font-black text-blue-500 uppercase text-[10px] tracking-[0.4em] mb-4">Direct Messaging</label>
                        {Object.keys(info.messengers).map((m) => (
                            <div key={m} className="flex items-center gap-4">
                                <span className="w-20 text-[10px] font-black text-gray-500 uppercase tracking-widest">{m}</span>
                                <input
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500 transition-all font-mono"
                                    value={info.messengers[m as keyof typeof info.messengers] || ""}
                                    onChange={(e) => setInfo({ ...info, messengers: { ...info.messengers, [m]: e.target.value } })}
                                    placeholder="Username or Full Link"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Socials (Gray) */}
                    <div className="bg-gray-100 p-10 rounded-[40px] shadow-inner space-y-6">
                        <label className="block font-black text-gray-400 uppercase text-[10px] tracking-[0.4em] mb-4">Social Presence</label>
                        {Object.keys(info.socials).map((s) => (
                            <div key={s} className="flex items-center gap-4">
                                <span className="w-20 text-[10px] font-black text-gray-400 uppercase tracking-widest">{s}</span>
                                <input
                                    className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 text-xs text-gray-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                                    value={info.socials[s as keyof typeof info.socials] || ""}
                                    onChange={(e) => setInfo({ ...info, socials: { ...info.socials, [s]: e.target.value } })}
                                    placeholder="@username"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                <button onClick={() => navigate(adminPath(lang!, businessSlug!, ""))} className="text-gray-400 font-black text-xs uppercase tracking-widest px-4">Discard</button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-20 py-6 rounded-[2.5rem] transition-all font-black shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-sm"
                >
                    Update Profile
                </button>
            </div>
        </div>
    );
}