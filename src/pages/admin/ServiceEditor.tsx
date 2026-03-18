import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { db } from "../../firebase";

// Models
import type { Service } from "../../models/Service";
import type { LocalizedText } from "../../models/LocalizedText";
import type { ContentBlock } from "../../models/ContentBlock";
import type { PriceModel } from "../../models/Price.ts";
import type { Special } from "../../models/Special.ts";

// Components
import ImageInputBlock from "../../components/ImageInputBlock.tsx";
import { useFetchData } from "../../hooks/useFetchData.ts";
import { SyncedRelationSelect } from "../../components/SyncedRelationSelect.tsx";
import {adminPath} from "../../utils/adminNavigate.ts";
import type {Employee} from "../../models/Employee.ts";
import type {FAQ} from "../../models/FAQ.ts";

const emptyService: Service = {
  title: { uk: "", ru: "", en: "", de: "" },
  subtitle: { uk: "", ru: "", en: "", de: "" },
  headerTitle: { uk: "", ru: "", en: "", de: "" },
  slug: "",
  mainImage: "",
  content: [],
  employees: [],
  subservices: [],
  specials: [],
  prices: [],
  blogs: [],
};

export default function ServiceEditor() {
  const { id, businessSlug, lang = "en" } = useParams<{
    id?: string;
    businessSlug: string;
    lang?: string;
  }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service>(emptyService);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // Загрузка связанных данных (передаем businessSlug в хук)
  const { data: relatedData, loading: relatedLoading } = useFetchData([
    "services", "prices", "employees", "specials", "faqs"
  ], businessSlug);

  const displayName = businessSlug;

  const availableSubservices: Service[] = ((relatedData?.services || []) as Service[])
      .filter(s => s.id !== id);

  // Загрузка данных конкретного сервиса
  useEffect(() => {
    if (id === "new" || !id) {
      setService(emptyService);
      setDataLoading(false);
      return;
    }

    if (!businessSlug) return;

    setDataLoading(true);
    get(ref(db, `businesses/${businessSlug}/services/${id}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            setService({ ...emptyService, ...snapshot.val(), id });
          }
        })
        .finally(() => setDataLoading(false));
  }, [id, businessSlug]);

  const handleLocalizedChange = (field: keyof Service, l: string, value: string) => {
    setService(prev => ({
      ...prev,
      [field]: { ...(prev[field] as LocalizedText), [l]: value },
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  /* ------------------ CONTENT BLOCKS LOGIC ------------------ */
  const addContentBlock = (type: "paragraph" | "image" | "heading" | "list", parentIndex?: number) => {
    const newBlock: ContentBlock = {
      type,
      content: { uk: "", ru: "", en: "", de: "" },
      align: "left",
      ...(type === "image" ? { media: "", widthPercent: 100 } : {}),
    };
    const updated = [...(service.content || [])];
    if (typeof parentIndex === "number") {
      updated[parentIndex].children = [...(updated[parentIndex].children || []), newBlock];
    } else {
      updated.push(newBlock);
    }
    setService({ ...service, content: updated });
  };

  const handleBlockChange = (index: number, l: string, value: string, parentIndex?: number) => {
    const updated = [...(service.content || [])];
    if (typeof parentIndex === "number") {
      updated[parentIndex].children![index].content = { ...updated[parentIndex].children![index].content, [l]: value };
    } else {
      updated[index].content = { ...updated[index].content, [l]: value };
    }
    setService({ ...service, content: updated });
  };

  const moveContentBlock = (index: number, direction: "up" | "down", parentIndex?: number) => {
    const swap = (arr: any[], i1: number, i2: number) => { [arr[i1], arr[i2]] = [arr[i2], arr[i1]]; };
    const updated = [...(service.content || [])];
    if (typeof parentIndex === "number") {
      const children = [...(updated[parentIndex].children || [])];
      if (direction === "up" && index > 0) swap(children, index, index - 1);
      if (direction === "down" && index < children.length - 1) swap(children, index, index + 1);
      updated[parentIndex].children = children;
    } else {
      if (direction === "up" && index > 0) swap(updated, index, index - 1);
      if (direction === "down" && index < updated.length - 1) swap(updated, index, index + 1);
    }
    setService({ ...service, content: updated });
  };

  const removeContentBlock = (index: number, parentIndex?: number) => {
    const updated = [...(service.content || [])];
    if (typeof parentIndex === "number") updated[parentIndex].children?.splice(index, 1);
    else updated.splice(index, 1);
    setService({ ...service, content: updated });
  };

  const toggleAlign = (index: number, parentIndex?: number) => {
    const updated = [...(service.content || [])];
    const aligns: ("left" | "center" | "right")[] = ["left", "center", "right"];

    let currentBlock;
    if (typeof parentIndex === "number") {
      currentBlock = updated[parentIndex].children![index];
    } else {
      currentBlock = updated[index];
    }

    const currentIndex = aligns.indexOf(currentBlock.align || "left");
    const nextIndex = (currentIndex + 1) % aligns.length;
    currentBlock.align = aligns[nextIndex];

    setService({ ...service, content: updated });
  };

  const renderBlockEditor = (block: ContentBlock, index: number, parentIndex?: number) => {
    const blockKey = `${parentIndex ?? "root"}-${index}`;
    return (
        <div className="w-full flex" key={blockKey}>
          <div className="border border-gray-100 rounded-[32px] p-6 my-3 bg-white shadow-sm w-full transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                {parentIndex !== undefined ? `Child ${index + 1}` : `Block ${index + 1}`} — {block.type}
              </span>

              <div className="flex gap-2 items-center">
              {/* Кнопка переключения выравнивания */}
              <button
                  onClick={() => toggleAlign(index, parentIndex)}
                  className="p-2 hover:bg-blue-50 rounded-xl transition text-[14px] border border-gray-50 flex items-center justify-center min-w-[40px]"
                  title="Toggle Alignment"
              >
                {block.align === "center" ? "≡" : block.align === "right" ? "⇶" : "≣"}
                <span className="ml-1 text-[8px] uppercase font-black">{block.align || "left"}</span>
              </button>

              <div className="h-4 w-[1px] bg-gray-100 mx-1" /> {/* Разделитель */}

              <button onClick={() => moveContentBlock(index, "up", parentIndex)} className="p-2 hover:bg-gray-100 rounded-xl transition">↑</button>
              <button onClick={() => moveContentBlock(index, "down", parentIndex)} className="p-2 hover:bg-gray-100 rounded-xl transition">↓</button>
              <button onClick={() => removeContentBlock(index, parentIndex)} className="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase ml-2 tracking-widest">Delete</button>
            </div>
            </div>

            {block.type === "image" ? (
                <div className="space-y-4">
                  <div className="max-w-sm mx-auto">
                    <ImageInputBlock
                        image={block.media || ""}
                        onChange={(url) => {
                          const updated = [...(service.content || [])];
                          if (typeof parentIndex === "number") updated[parentIndex].children![index].media = url;
                          else updated[index].media = url;
                          setService({ ...service, content: updated });
                        }}
                    />
                  </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["uk", "ru", "en", "de"].map(l => (
                      <div key={l}>
                        <div className="text-[9px] font-black text-gray-300 mb-1 ml-1 uppercase">{l}</div>
                        {block.type === "list" || block.type === "paragraph" ? (
                            <textarea className="w-full border border-gray-100 rounded-2xl p-4 text-sm h-32 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner bg-gray-50/30" value={(block.content?.[l] as string) || ""} onChange={(e) => handleBlockChange(index, l, e.target.value, parentIndex)} placeholder={`Content in ${l}...`} />
                        ) : (
                            <input type="text" className="w-full border border-gray-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-inner bg-gray-50/30 font-bold" value={(block.content?.[l] as string) || ""} onChange={(e) => handleBlockChange(index, l, e.target.value, parentIndex)} placeholder={`Heading in ${l}...`} />
                        )}
                      </div>
                  ))}
                </div>
            )}


            {block.children?.map((child, i) => renderBlockEditor(child, i, index))}

            {block.type === "image" && (
                <div className="flex gap-4 mt-6 border-t border-gray-50 pt-4">
                  {["heading", "paragraph", "list"].map(t => (
                      <button key={t} onClick={() => addContentBlock(t as any, index)} className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition px-4 py-2 bg-blue-50 rounded-xl">
                        + Add {t} caption
                      </button>
                  ))}
                </div>
            )}

          </div>
        </div>
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const isAnyLanguageFilled = (textObj: any) => {
      return textObj && Object.values(textObj).some(v => typeof v === 'string' && v.trim().length > 0);
    };

    if (!isAnyLanguageFilled(service.title)) newErrors.title = "Title is required";
    if (!service.slug?.trim()) newErrors.slug = "Slug is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !businessSlug) return;

    try {
      const servicesRef = ref(db, `businesses/${businessSlug}/services`);
      const serviceId = (id === "new" || !id) ? push(servicesRef).key : id;

      if (!serviceId) return;

      await set(ref(db, `businesses/${businessSlug}/services/${serviceId}`), {
        ...service,
        id: serviceId,
        updatedAt: Date.now(),
      });

      navigate(adminPath(lang!, businessSlug!, "services"));
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (dataLoading || relatedLoading) {
    return <div className="p-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading Service Data...</div>;
  }

  return (
      <div className="p-6 max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] my-10 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">{displayName} — {id === "new" ? "New Service" : "Edit Service"}</h1>
            <p className="text-gray-400 text-sm font-medium tracking-tight mt-1">Configure page layout and service dependencies</p>
          </div>
          <div className="flex justify-end items-center gap-6">
            <button onClick={() => navigate(adminPath(lang!, businessSlug!, "services"))} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">Discard</button>
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95">Save Service</button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50/30 p-8 rounded-[32px] border border-gray-100 space-y-4">
              <label className="block font-black text-gray-400 uppercase text-[10px] tracking-widest ml-1">Slug (URL Path)</label>
              <input className={`w-full border rounded-2xl p-4 shadow-inner outline-none focus:ring-4 focus:ring-blue-50 transition font-mono text-sm ${errors.slug ? "border-red-300 bg-red-50/30" : "border-gray-100 bg-white"}`} value={service.slug} placeholder="laser-hair-removal" onChange={(e) => setService({ ...service, slug: e.target.value })} />
              {errors.slug && <p className="text-red-500 text-[9px] font-black uppercase ml-2">{errors.slug}</p>}
            </div>
            <div className="bg-gray-50/30 p-8 rounded-[32px] border border-gray-100 text-center">
              <label className="block font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Main Service Image</label>
              <ImageInputBlock image={service.mainImage || ""} onChange={(url) => setService({ ...service, mainImage: url })} />
            </div>
          </div>

          {(["title", "subtitle", "headerTitle"] as const).map(field => (
              <div key={field} className="p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm">
                <label className="block font-black text-gray-400 mb-5 uppercase text-[10px] tracking-[0.3em] ml-1">{field}</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {["uk", "ru", "en", "de"].map(l => (
                      <div key={l}>
                        <div className="text-[9px] font-black text-gray-300 mb-1 ml-2 uppercase">{l}</div>
                        <input className={`w-full border rounded-2xl p-4 text-xs font-bold shadow-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all ${errors[field] ? "border-red-200" : "border-gray-50 hover:border-gray-200"}`} value={(service[field] as LocalizedText)?.[l] || ""} onChange={(e) => handleLocalizedChange(field, l, e.target.value)} />
                      </div>
                  ))}
                </div>
              </div>
          ))}
        </div>

        {/* Ecosystem Connectivity */}
        <div className="bg-blue-900 p-10 rounded-[40px] mb-12 shadow-2xl">
          <h2 className="text-white text-xs font-black mb-8 flex items-center gap-4 uppercase tracking-[0.4em]">Ecosystem Integration</h2>
          <div className="grid grid-cols-1 gap-6">
            <SyncedRelationSelect<Service> label="Child Subservices" multiple value={service.subservices || []} options={availableSubservices} getLabel={(o) => String(o.title?.[lang] || o.title?.uk || "Untitled Service")} getValue={(o) => o.id!} onChange={(v) => setService({ ...service, subservices: v })} firebasePath={`businesses/${businessSlug}/services`} parentId={service.id} parentFieldName="parentServiceIds" syncType="array" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SyncedRelationSelect<PriceModel> label="Linked Prices" value={service.prices || []} options={(relatedData.prices || []) as PriceModel[]} getLabel={(o) => String(o.category?.[lang] || o.category?.uk || "Untitled Price")} getValue={(o) => o.id!} onChange={(v) => setService({ ...service, prices: v })} firebasePath={`businesses/${businessSlug}/prices`} parentId={service.id} parentFieldName="serviceIds" syncType="array" />
              <SyncedRelationSelect<Special> label="Current Offers" value={service.specials || []} options={(relatedData.specials || []) as Special[]} getLabel={(o) => String(o.title?.[lang] || o.title?.uk || "Untitled Special")} getValue={(o) => o.id!} onChange={(v) => setService({ ...service, specials: v })} firebasePath={`businesses/${businessSlug}/specials`} parentId={service.id} parentFieldName="serviceIds" syncType="array" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Выбор сотрудников */}
                <SyncedRelationSelect<Employee>
                    label="Linked Specialists"
                    multiple
                    value={service.employees || []}
                    options={(relatedData.employees || []) as Employee[]}
                    getLabel={(o) => String(o.fullName?.[lang] || o.fullName?.uk || "Unnamed Specialist")}
                    getValue={(o) => o.id!}
                    onChange={(v) => setService({ ...service, employees: v })}
                    firebasePath={`businesses/${businessSlug}/employees`}
                    parentId={service.id}
                    parentFieldName="serviceIds"
                    syncType="array"
                />

                {/* Выбор FAQ */}
                <SyncedRelationSelect<FAQ> // Замените any на ваш тип FAQ, если он есть
                    label="Related FAQ"
                    multiple
                    value={service.faqs || []}
                    options={(relatedData.faqs || [])}
                    getLabel={(o) => String(o.question?.[lang] || o.question?.uk || "Untitled FAQ")}
                    getValue={(o) => o.id!}
                    onChange={(v) => setService({ ...service, faqs: v })}
                    firebasePath={`businesses/${businessSlug}/faqs`}
                    parentId={service.id}
                    parentFieldName="serviceIds"
                    syncType="array"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Content Builder */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-10 px-4">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Service Builder</h2>
            <div className="flex gap-2">
              {["heading", "paragraph", "image", "list"].map(type => (
                  <button key={type} onClick={() => addContentBlock(type as any)} className="bg-gray-100 hover:bg-black hover:text-white px-5 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest text-gray-500">+ {type}</button>
              ))}
            </div>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {service.content?.length ? service.content.map((block, i) => renderBlockEditor(block, i)) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[40px] text-gray-300 font-bold uppercase tracking-widest text-xs">The canvas is empty.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 pt-8 flex justify-end items-center gap-6">
          <button onClick={() => navigate(adminPath(lang!, businessSlug!, "services"))} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition">Discard</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 active:scale-95 uppercase">Save Service</button>
        </div>
      </div>
  );
}