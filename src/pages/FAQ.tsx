import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { TopImage } from "../components/TopImage.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import FAQList from "../components/FAQList.tsx";
import { useBusiness } from "../context/BusinessContext.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import type {Service} from "../models/Service.ts";
import type {FAQ} from "../models/FAQ.ts";
import type {PriceModel} from "../models/Price.ts";
import type {Blog} from "../models/Blog.ts";
import type {Special} from "../models/Special.ts";
import type {Employee} from "../models/Employee.ts";
import type {Photo} from "../models/Photo.ts";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function FAQ() {
  const { businessSlug } = useParams<{  businessSlug: string }>();
  const { i18n, t } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";

  // Получаем все данные через хук для конкретного бизнеса
  const { data, loading } = useFetchData<{
    services: Service[];
    prices: PriceModel[];
    blogs: Blog[];
    specials: Special[];
    employees: Employee[];
    faqs: FAQ[];
    photos: Photo[];
  }>([
    "services",
    "prices",
    "blogs",
    "specials",
    "employees",
    "faqs",
    "photos",
  ], businessSlug);


  const faqs = data.faqs ?? [];
  const services = data.services ?? [];


  const getTabLabel = (localizedValue: any) => {
    if (!localizedValue) return "";
    return localizedValue[lang] || localizedValue["en"] || "";
  };


  const { meta } = useBusiness();

  const { pageContent } = usePageContent(businessSlug, "faq");

  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'faq' || t.route === '/faq')
      : null;

  const headerImage =
      dynamicTab?.headerImage || "";


  const [selectedService, setSelectedService] = useState("all");
  const [page, setPage] = useState(0);

  const serviceOptions = useMemo(
      () => [
        { id: "all", title: t("FAQ.allServices") || "Все услуги" },
        ...services.map((s) => ({ id: s.id, title: s.title?.[lang] || "Untitled" })),
      ],
      [services, lang, t]
  );

  const filteredFaqs = useMemo(
      () =>
          selectedService === "all"
              ? faqs
              : faqs.filter((faq) => faq.serviceId === selectedService),
      [faqs, selectedService]
  );

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setPage(0);
  };

  if (loading)
    return <p className="text-center py-10">{t("FAQ.loading") || "Загрузка..."}</p>;

  return (
      <div className="w-full items-center justify-center">
        <TopImage source={headerImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs />

          {pageContent?.content && pageContent.content.length > 0 && (
              <div className="mb-12">
                <ContentBlockRenderer content={pageContent.content} />
              </div>
          )}

          <div className="py-8 mb-[3.5rem] w-full duration-500 text-foreground">
            <h2 className="text-3xl lg:text-5xl font-[800] mb-[1.5rem]">
              {getTabLabel(dynamicTab?.title) || t("FAQ.title")}
            </h2>

            <div className="md:flex justify-between block">
              <p className="text-base lg:text-2xl font-normal mb-4">
                {getTabLabel(dynamicTab?.description) || t("FAQ.subtitle")}
              </p>

              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
              <span className="text-[1.5rem] font-[600]">
                {t("FAQ.direction") || "Направление:"}
              </span>

                <select
                    className="border rounded-lg py-2 px-3 text-black w-full md:w-auto outline-none focus:ring-2 focus:ring-primary"
                    value={selectedService}
                    onChange={(e) => handleServiceChange(e.target.value)}
                >
                  {serviceOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                  ))}
                </select>
              </div>
            </div>
          </div>




          <FAQList faqs={filteredFaqs} currentPage={page} setCurrentPage={setPage} />
        </div>
      </div>
  );
}
