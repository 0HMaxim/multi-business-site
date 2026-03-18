import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { db } from "../../firebase.ts";

// Models
import type { LocalizedText } from "../../models/LocalizedText.ts";
import type { FAQ } from "../../models/FAQ.ts";
import type { Service } from "../../models/Service.ts";

// Components
import { useFetchData } from "../../hooks/useFetchData.ts";
import { SyncedRelationSelect } from "../../components/SyncedRelationSelect.tsx";
import {adminPath} from "../../utils/adminNavigate.ts";

export default function FAQEditor() {
  const { id, businessSlug, lang = "en" } = useParams<{ id: string; businessSlug: string; lang: string }>();
  const navigate = useNavigate();

  // Путь для возврата (согласован с роутами App.tsx)
  const emptyFAQ: FAQ = {
    question: { uk: "", ru: "", en: "", de: "" },
    answer: { uk: "", ru: "", en: "", de: "" },
    serviceId: "", // ID привязанной услуги
  };

  const [faq, setFAQ] = useState<FAQ>(emptyFAQ);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(id && id !== "new");

  const displayName = businessSlug;


  // Load all services for select ( SyncedRelationSelect)
  const { data: relatedData, loading: relatedLoading } = useFetchData(["services"], businessSlug);
  const allServices = (relatedData.services || []) as Service[];

  // 1. Загрузка данных существующего FAQ
  useEffect(() => {
    if (id && id !== "new" && businessSlug) {
      setLoading(true);
      get(ref(db, `businesses/${businessSlug}/faqs/${id}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              setFAQ({ ...emptyFAQ, ...snapshot.val(), id });
            }
          })
          .finally(() => setLoading(false));
    } else {
      setFAQ(emptyFAQ);
    }
  }, [id, businessSlug]);

  const handleLocalizedChange = (field: keyof FAQ, l: string, value: string) => {
    setFAQ((prev) => ({
      ...prev,
      [field]: { ...((prev[field] as LocalizedText) || {}), [l]: value },
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // 2. Сохранение
  const handleSave = async () => {
    if (!businessSlug) return;

    // Простейшая валидация заголовка
    const hasQuestion = Object.values(faq.question || {}).some(
        v => typeof v === "string" && v.trim() !== ""
    );


    if (!hasQuestion) {
      setErrors({ question: "Please fill the question in at least one language" });
      return;
    }

    try {
      const faqFolderRef = ref(db, `businesses/${businessSlug}/faqs`);
      const targetId = (id === "new" || !id) ? push(faqFolderRef).key : id;

      if (!targetId) return;

      const dataToSave = {
        ...faq,
        id: targetId,
        updatedAt: Date.now()
      };

      await set(ref(db, `businesses/${businessSlug}/faqs/${targetId}`), dataToSave);

      navigate(adminPath(lang!, businessSlug!, "employees"))

    } catch (e) {
      console.error("Save error:", e);
    }
  };

  if (loading) {
    return (
        <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">
          Loading FAQ Data...
        </div>
    );
  }

  return (
      <div className="p-6 max-w-5xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
              {displayName} {id === "new" ? "New FAQ" : "Edit FAQ"}
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-tight mt-1">
              Configure question for {businessSlug}
            </p>
          </div>
          <div className="flex justify-end items-center gap-6">
            <button
                onClick={() => navigate(adminPath(lang!, businessSlug!, "faq"))}
                className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
            >
              Discard
            </button>
            <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
            >
              Save FAQ
            </button>
          </div>
        </div>

        <div className="space-y-8">

          {/* Connection Section: Link to Service */}
          <div className="bg-blue-900 p-10 rounded-[40px] shadow-2xl">
            <h2 className="text-white text-[10px] font-black mb-6 uppercase tracking-[0.4em] opacity-60">
              Ecosystem Linkage
            </h2>
            {relatedLoading ? (
                <div className="text-blue-300 text-[10px] animate-pulse uppercase font-bold">Loading Services...</div>
            ) : (
                <SyncedRelationSelect<Service>
                    label="Associated Services"
                    multiple={true}
                    value={faq.serviceIds || []}
                    options={allServices}
                    getLabel={(o) => String(o.title?.[lang] || o.title?.uk || "Untitled Service")}
                    getValue={(o) => o.id!}
                    onChange={(v) => setFAQ({ ...faq, serviceIds: v })}
                    firebasePath={`businesses/${businessSlug}/services`}
                    parentId={faq.id}
                    parentFieldName="faqs"
                    syncType="array"
                />
            )}
          </div>

          {/* Question Section */}
          <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm transition-all hover:shadow-md">
            <label className="block font-black text-blue-500 mb-6 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Question (Title)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["uk", "ru", "en", "de"].map((l) => (
                  <div key={`q-${l}`}>
                    <div className="text-[9px] font-black text-gray-300 mb-1 ml-2 uppercase">{l}</div>
                    <input
                        type="text"
                        value={(faq.question as LocalizedText)?.[l] || ""}
                        onChange={(e) => handleLocalizedChange("question", l, e.target.value)}
                        className="w-full border border-gray-50 bg-gray-50/30 rounded-2xl p-4 text-xs font-bold shadow-inner focus:ring-4 focus:ring-blue-50 outline-none transition-all hover:border-gray-200"
                        placeholder={`Question in ${l}...`}
                    />
                  </div>
              ))}
            </div>
            {errors.question && (
                <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.question}</p>
            )}
          </div>

          {/* Answer Section */}
          <div className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm transition-all hover:shadow-md">
            <label className="block font-black text-emerald-500 mb-6 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Answer (Content)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["uk", "ru", "en", "de"].map((l) => (
                  <div key={`a-${l}`}>
                    <div className="text-[9px] font-black text-gray-300 mb-1 ml-2 uppercase">{l}</div>
                    <textarea
                        rows={4}
                        value={(faq.answer as LocalizedText)?.[l] || ""}
                        onChange={(e) => handleLocalizedChange("answer", l, e.target.value)}
                        className="w-full border border-gray-50 bg-gray-50/30 rounded-2xl p-4 text-xs font-medium shadow-inner focus:ring-4 focus:ring-emerald-50 outline-none transition-all hover:border-gray-200 resize-none"
                        placeholder={`Detailed answer in ${l}...`}
                    />
                  </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center gap-6">
            <button
                onClick={() => navigate(adminPath(lang!, businessSlug!, "faq"))}
                className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition"
            >
              Discard
            </button>
            <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
            >
              Save FAQ
            </button>
          </div>
        </div>
      </div>
  );
}