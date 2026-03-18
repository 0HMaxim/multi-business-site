import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { TopImage } from "../components/TopImage.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import PhotoList from "../components/PhotoList.tsx";
import { useBusiness } from "../context/BusinessContext.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function Gallery() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language as "uk" | "ru" | "en" | "de";
    const { businessSlug } = useParams<{ businessSlug: string }>();

    const { data, loading } = useFetchData(
        ["services", "photos", "employees"],
        businessSlug
    );

    const services = data.services ?? [];
    const photos = data.photos ?? [];
    const employees = data.employees ?? [];

    const { meta } = useBusiness();
    const { pageContent } = usePageContent(businessSlug, "gallery");


    const dynamicTab = meta?.tabs
        ? Object.values(meta.tabs).find(t => t.route === 'gallery' || t.route === '/gallery')
        : null;

    const headerImage =
        dynamicTab?.headerImage || "";


    const [selectedService, setSelectedService] = useState("all");
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const getTabLabel = (localizedValue: any) => {
        if (!localizedValue) return "";
        return localizedValue[lang] || localizedValue["en"] || "";
    };

    const serviceOptions = useMemo(
        () => [
            { id: "all", title: t("FAQ.allServices") || "All Services" },
            ...services.map((s) => ({ id: s.id, title: s.title?.[lang] || "Untitled Service" })),
        ],
        [services, lang, t]
    );

    const employeeOptions = useMemo(
        () => [
            { id: "all", title: t("gallery.allEmployees") || "All Employees" },
            ...employees.map((e) => ({ id: e.id!, title: e.fullName?.[lang] || e.fullName || "Unnamed Employee" })),
        ],
        [employees, lang, t]
    );

    // Фильтруем фото
    const filteredPhotos = useMemo(
        () =>
            photos.filter(
                (p) =>
                    (selectedService === "all" || p.serviceId === selectedService) &&
                    (selectedEmployee === "all" || p.employeeId === selectedEmployee)
            ),
        [photos, selectedService, selectedEmployee]
    );

    const enrichedPhotos = useMemo(
        () =>
            filteredPhotos.map((p) => ({
                ...p,
                service: services.find((s) => s.id === p.serviceId),
                employee: employees.find((e) => e.id === p.employeeId),
            })),
        [filteredPhotos, services, employees]
    );

    if (loading) return <p className="text-center py-10">{t("loading")}</p>;

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
                        {getTabLabel(dynamicTab?.title) || t("gallery.title")}
                    </h2>

                    <div className="md:flex justify-between block">
                        <p className="text-base lg:text-2xl font-normal text-foreground duration-500 mb-4">
                            {getTabLabel(dynamicTab?.description) || t("gallery.subtitle")}
                        </p>

                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                            <span className="text-foreground text-[1.5rem] font-[600]">{t("FAQ.direction")}</span>

                            {/* Селект для сервисов */}
                            <select
                                className="border rounded-lg py-2 px-3 text-black w-full md:w-auto"
                                value={selectedService}
                                onChange={(e) => {
                                    setSelectedService(e.target.value);
                                    setSelectedEmployee("all");
                                    setCurrentPage(1);
                                }}
                            >
                                {serviceOptions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>

                            {/* Селект для сотрудников */}
                            <select
                                className="border rounded-lg py-2 px-3 text-black w-full md:w-auto"
                                value={selectedEmployee}
                                onChange={(e) => {
                                    setSelectedEmployee(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                {employeeOptions.map((e) => (
                                    <option key={e.id} value={e.id}>{e.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <PhotoList photos={enrichedPhotos} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
}
