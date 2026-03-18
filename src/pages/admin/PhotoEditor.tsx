import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, push, set } from "firebase/database";
import { db } from "../../firebase";

// Models
import type { Photo } from "../../models/Photo.ts";
import type { Employee } from "../../models/Employee.ts";
import type { Service } from "../../models/Service.ts";
import type { LocalizedText } from "../../models/LocalizedText.ts";

// Components
import { useFetchData } from "../../hooks/useFetchData.ts";
import { SyncedRelationSelect } from "../../components/SyncedRelationSelect.tsx";
import ImageInputBlock from "../../components/ImageInputBlock.tsx";
import {useTranslation} from "react-i18next";
import {adminPath} from "../../utils/adminNavigate.ts";

export default function PhotoEditor() {
    const { i18n } = useTranslation();
    const { businessSlug, id, lang } = useParams<{
        businessSlug: string;
        id: string;
        lang: string;
    }>();


    const navigate = useNavigate();

    const emptyPhoto: Photo = {
        mainImage: "",
        title: {},
        description: {},
        imgArr: [],
        serviceIds: [],
        subserviceIds: [],
        employeeId: "",
    };

    const [photo, setPhoto] = useState<Photo>(emptyPhoto);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Загружаем только сервисы и сотрудников
    const { data: relatedData, loading } = useFetchData(
        ["services", "employees"],
        businessSlug
    );

    useEffect(() => {
        if (!businessSlug || !id || id === "new") return;

        get(ref(db, `businesses/${businessSlug}/photos/${id}`))
            .then(snapshot => {
                if (snapshot.exists()) {
                    setPhoto({ ...emptyPhoto, ...snapshot.val(), id });
                }
            });
    }, [id, businessSlug]);

    const handleSave = async () => {
        if (!photo.mainImage) {
            setErrors({ mainImage: "Cover image is required" });
            return;
        }

        const baseRef = ref(db, `businesses/${businessSlug}/photos`);

        const photoId =
            id === "new" || !id
                ? push(baseRef).key
                : id;

        if (!photoId) return;

        await set(ref(db, `businesses/${businessSlug}/photos/${photoId}`), {
            ...photo,
            id: photoId,
        });

        navigate(adminPath(lang!, businessSlug!, "photos"));
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">
            Loading Gallery Editor...
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Gallery Editor</h1>
                    <p className="text-gray-400 text-sm font-medium">Portfolio management</p>
                </div>

                <div className="border-t border-gray-50 pt-8 flex justify-end items-center gap-6">
                    <button
                        onClick={() => navigate(adminPath(lang!, businessSlug!, "photos"))}
                        className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
                    >
                        Discard Changes
                    </button>

                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95">
                        Save Gallery
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left: Settings & Relations */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 text-center">
                        <label className="block font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Main Cover</label>
                        <ImageInputBlock
                            image={photo.mainImage}
                            onChange={(url: string) => setPhoto({ ...photo, mainImage: url })}
                        />
                        {errors.mainImage && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.mainImage}</p>}
                    </div>

                    <div className="bg-blue-50/30 p-8 rounded-[40px] border border-blue-100 space-y-6 shadow-inner">
                        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Linked Objects
                        </h3>

                        {/* Сервисы - теперь multiple={false} чтобы работал один выбор */}
                        <SyncedRelationSelect<Service>
                            label="Services (Multiple)"
                            // Используем массив ID напрямую
                            value={photo.serviceIds || []}
                            options={(relatedData.services || []) as Service[]}
                            getLabel={(o) => {
                                const t = o.title?.[i18n.language as keyof typeof o.title]
                                    || o.title?.uk
                                    || o.title?.ru
                                    || o.title?.en
                                    || "Untitled Service";
                                return String(t);
                            }}
                            getValue={(o) => String(o.id || "")}

                            // Ключевые изменения здесь:
                            multiple={true}
                            syncType="array" // SyncedRelationSelect уже умеет работать с массивами

                            firebasePath={`businesses/${businessSlug}/services`}
                            parentId={id === "new" ? undefined : id}
                            parentFieldName="photos"

                            // Обновляем состояние массива в объекте photo
                            onChange={(v) => setPhoto(prev => ({ ...prev, serviceIds: v }))}
                        />

                        {/* Специалисты */}
                        <SyncedRelationSelect<Employee>
                            label="Specialist"
                            value={photo.employeeId ? [photo.employeeId] : []}
                            options={(relatedData.employees || []) as Employee[]}
                            getLabel={(o) => {
                                const name = o.fullName?.[i18n.language as keyof typeof o.fullName]
                                    || o.fullName?.uk
                                    || o.fullName?.ru
                                    || "Unnamed Employee";
                                return String(name);
                            }}

                            getValue={(o) => String(o.id || "")}
                            multiple={false}
                            firebasePath={`businesses/${businessSlug}/employees`}
                            parentId={id === "new" ? undefined : id}
                            parentFieldName="photos"
                            syncType="array"
                            onChange={(v) => setPhoto(prev => ({ ...prev, employeeId: v[0] || "" }))}
                        />
                    </div>
                </div>

                {/* Right: Content & Array */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="p-8 border border-gray-100 rounded-[32px] space-y-8 bg-white shadow-sm">
                        <LocalizedInputGroup
                            title="Global Title"
                            value={photo.title || {}}
                            onChange={(lang, val) =>
                                setPhoto(prev => ({ ...prev, title: { ...prev.title, [lang]: val } }))
                            }
                        />
                        <LocalizedInputGroup
                            title="Global Description"
                            value={photo.description || {}}
                            isTextArea
                            onChange={(lang, val) =>
                                setPhoto(prev => ({ ...prev, description: { ...prev.description, [lang]: val } }))
                            }
                        />
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Gallery Items</h2>
                        <button
                            onClick={() => setPhoto(prev => ({
                                ...prev,
                                imgArr: [...(prev.imgArr || []), { src: "", title: {}, description: {} }]
                            }))}
                            className="bg-gray-900 text-white text-[10px] font-black px-8 py-3 rounded-2xl uppercase tracking-widest hover:bg-black transition shadow-xl active:scale-95"
                        >
                            + Add Photo Pair
                        </button>
                    </div>

                    <div className="space-y-6">
                        {(photo.imgArr || []).map((item, i) => (
                            <div key={i} className="relative p-8 border border-gray-100 rounded-[40px] bg-gray-50/30 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <button
                                    onClick={() => {
                                        const newArr = [...(photo.imgArr || [])];
                                        newArr.splice(i, 1);
                                        setPhoto({ ...photo, imgArr: newArr });
                                    }}
                                    className="absolute top-6 right-8 text-red-400 hover:text-red-600 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all tracking-widest"
                                >
                                    Delete Item
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-4">
                                        <div className="max-w-[200px] mx-auto">
                                            <ImageInputBlock
                                                image={item.src}
                                                onChange={(url: string) => {
                                                    const newArr = [...(photo.imgArr || [])];
                                                    newArr[i].src = url;
                                                    setPhoto({ ...photo, imgArr: newArr });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 space-y-6">
                                        <LocalizedInputGroup
                                            title="Item Title"
                                            compact
                                            value={item.title || {}}
                                            onChange={(l, v) => {
                                                const newArr = [...(photo.imgArr || [])];
                                                newArr[i].title = { ...newArr[i].title, [l]: v };
                                                setPhoto({ ...photo, imgArr: newArr });
                                            }}
                                        />
                                        <LocalizedInputGroup
                                            title="Item Description"
                                            compact
                                            isTextArea
                                            value={item.description || {}}
                                            onChange={(l, v) => {
                                                const newArr = [...(photo.imgArr || [])];
                                                newArr[i].description = { ...newArr[i].description, [l]: v };
                                                setPhoto({ ...photo, imgArr: newArr });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-50 pt-8 flex justify-end items-center gap-6">
                <button
                    onClick={() => navigate(adminPath(lang!, businessSlug!, "photos"))}
                    className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
                >
                    Discard Changes
                </button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95">
                    Save Gallery
                </button>
            </div>
        </div>
    );
}

// --- Вспомогательный компонент для ввода текстов ---
interface LocalizedInputGroupProps {
    title: string;
    value: LocalizedText;
    onChange: (lang: string, val: string) => void;
    isTextArea?: boolean;
    compact?: boolean;
}

function LocalizedInputGroup({ title, value, onChange, isTextArea, compact }: LocalizedInputGroupProps) {
    const langs = ["uk", "ru", "en", "de"];
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">{title}</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {langs.map(l => (
                    <div key={l}>
                        <div className="text-[9px] font-black text-gray-300 mb-1 ml-1 uppercase">{l}</div>
                        {isTextArea ? (
                            <textarea
                                className="w-full border border-gray-100 rounded-2xl p-3 text-xs focus:ring-4 focus:ring-blue-50 outline-none resize-none bg-gray-50/50 focus:bg-white transition-all shadow-inner"
                                rows={compact ? 2 : 4}
                                value={String(value?.[l as keyof LocalizedText] || "")}
                                onChange={e => onChange(l, e.target.value)}
                            />
                        ) : (
                            <input
                                className="w-full border border-gray-100 rounded-2xl p-3 text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-gray-50/50 focus:bg-white transition-all shadow-inner"
                                value={String(value?.[l as keyof LocalizedText] || "")}
                                onChange={e => onChange(l, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}