import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { TopImage } from "../components/TopImage";
import { SpecialsSlider } from "../components/SpecialsSection";
import { useParams } from "react-router-dom";
import { useBusiness } from "../context/BusinessContext";
import { useGeneralInfo } from "../hooks/useGeneralInfo";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function About() {
    const { t, i18n } = useTranslation();
    const { businessSlug, lang } = useParams<{ businessSlug?: string; lang?: string }>();
    const locale = lang || i18n.language;

    const { meta } = useBusiness();
    const { info, loading: infoLoading } = useGeneralInfo(businessSlug);
    const { pageContent, loading: contentLoading } = usePageContent(businessSlug, "about");

    const dynamicTab = meta?.tabs
        ? Object.values(meta.tabs).find(t => t.route === "about" || t.route === "/about")
        : null;

    const headerImage = dynamicTab?.headerImage || "";
    const loading = infoLoading || contentLoading;

    if (loading) {
        return <p className="text-center py-10 font-black text-gray-300 animate-pulse uppercase">{t("loading")}</p>;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <TopImage source={headerImage} />

            <div className="w-full px-4 md:px-[5rem]">
                <Breadcrumbs />

                {/* Заголовок и слоган */}
                <div className="py-8 mb-[2.5rem] text-foreground">
                    <h2 className="text-3xl lg:text-5xl font-extrabold mb-2">
                        {meta?.shortName?.[locale] ?? meta?.name?.[locale] ?? "Business Name"}
                    </h2>
                    {meta?.slogan?.[locale] && (
                        <p className="text-xl text-foreground/70 mb-4">{meta.slogan[locale]}</p>
                    )}
                    {/* Описание из meta.description */}
                    {meta?.description?.[locale] && (
                        <p className="text-base md:text-lg text-foreground/60 max-w-[52rem] leading-relaxed mt-3">
                            {meta.description[locale]}
                        </p>
                    )}
                </div>

                {/* ── ContentBlocks из Firebase (businesses/{slug}/pages/about) ── */}
                {pageContent?.content && pageContent.content.length > 0 && (
                    <div className="mb-12">
                        <ContentBlockRenderer content={pageContent.content} />
                    </div>
                )}

                {/* ── Контакты из generalInfo ── */}
                {info && (
                    <div className="mb-12 p-8 bg-foreground/5 rounded-[2rem] border border-foreground/10">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground mb-6">
                            {t("contact.quick_info")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                                    {t("contact.address") || "Address"}
                                </p>
                                <p className="text-base font-semibold text-foreground">
                                    {info.address?.[locale] || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                                    {t("contact.phone") || "Phone"}
                                </p>
                                <p className="text-base font-semibold text-foreground">
                                    {info.phone?.[locale] || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                                    Email
                                </p>
                                <p className="text-base font-semibold text-foreground">
                                    {info.email || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Рабочие часы */}
                        {info.working_hours && info.working_hours.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-foreground/10">
                                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-3">
                                    {t("contact.working_hours") || "Working Hours"}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {info.working_hours.map((wh, i) => {
                                        const days = typeof wh.days === "object" && !Array.isArray(wh.days)
                                            ? (wh.days as any)[locale] || (wh.days as any)["en"] || ""
                                            : Array.isArray(wh.days)
                                                ? wh.days.map((d: any) => d[locale] || d["en"] || "").join(", ")
                                                : wh.days;
                                        return (
                                            <div key={i} className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-full">
                                                <span className="text-sm font-semibold text-foreground">{days}</span>
                                                <span className="text-xs text-blue-500 font-black">{wh.hours}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Мессенджеры и соцсети */}
                        <div className="mt-6 pt-6 border-t border-foreground/10 flex flex-wrap gap-4">
                            {info.messengers?.telegram && (
                                <a href={`https://t.me/${info.messengers.telegram.replace("@", "")}`}
                                   target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300">
                                    Telegram
                                </a>
                            )}
                            {info.messengers?.whatsapp && (
                                <a href={`https://wa.me/${info.messengers.whatsapp.replace(/\D/g, "")}`}
                                   target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300">
                                    WhatsApp
                                </a>
                            )}
                            {info.messengers?.viber && (
                                <a href={`viber://chat?number=${info.messengers.viber.replace(/\D/g, "")}`}
                                   target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500 text-purple-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300">
                                    Viber
                                </a>
                            )}
                            {info.socials?.instagram && (
                                <a href={`https://${info.socials.instagram.startsWith("http") ? "" : "instagram.com/"}${info.socials.instagram.replace("instagram.com/", "")}`}
                                   target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500 text-pink-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300">
                                    Instagram
                                </a>
                            )}
                            {info.socials?.facebook && (
                                <a href={`https://${info.socials.facebook.startsWith("http") ? "" : "facebook.com/"}${info.socials.facebook.replace("facebook.com/", "")}`}
                                   target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 bg-blue-700/10 hover:bg-blue-700 text-blue-700 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300">
                                    Facebook
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Specials slider */}
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    <SpecialsSlider />
                </div>
            </div>
        </div>
    );
}