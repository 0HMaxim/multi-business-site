import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { TopImage } from "../components/TopImage.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import { useBusiness } from "../context/BusinessContext.tsx";
import type { Service } from "../models/Service.ts";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function Services() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const { data, loading } = useFetchData<{
    services: Service[];
  }>(["services"], businessSlug);

  const { pageContent } = usePageContent(businessSlug, "services");

  const { meta } = useBusiness();

  const getTabLabel = (localizedValue: any) => {
    if (!localizedValue) return "";
    return localizedValue[lang] || localizedValue["en"] || "";
  };

  const services = data.services ?? [];

  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'services' || t.route === '/services')
      : null;

  const headerImage = dynamicTab?.headerImage || "";

  if (loading) {
    return <p className="text-center py-10 font-black text-gray-300 animate-pulse uppercase">Loading...</p>;
  }

  return (
      <div className="w-full items-center justify-center">
        <TopImage source={headerImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs />


          <div className="py-8 mb-[3.5rem] duration-500 text-foreground">
            <h2 className="text-3xl lg:text-5xl font-[800] mb-[1.5rem]">
              {getTabLabel(dynamicTab?.title) || t("services.title")}
            </h2>
            <p className="md:text-2xl text-[1.25rem] font-normal text-foreground/80 duration-500 max-w-[60rem]">
              {getTabLabel(dynamicTab?.description)|| t("services.subtitle")}
            </p>
          </div>


          {pageContent?.content && pageContent.content.length > 0 && (
              <div className="mb-12">
                <ContentBlockRenderer content={pageContent.content} />
              </div>
          )}


          <div className="flex flex-wrap justify-center gap-8 mb-20">
            {services.map((service: Service) => (
                <Link
                    key={service.id}
                    to={`/${lang}/${businessSlug}/services/${service.slug}`}
                    /* Убрал жесткие max-h, чтобы карточка могла дышать, но сохранил форму */
                    className="group rounded-[3rem] md:rounded-[10rem] shadow-md overflow-hidden
        relative flex-shrink-0
        w-full sm:w-[calc(50%-1rem)] lg:w-[24rem] xl:w-[28rem]
        h-[22rem] md:h-[25rem]
        hover:shadow-2xl transition-all duration-500 "
                >
                  {service.mainImage && (
                      <img
                          src={service.mainImage}
                          alt={getTabLabel(service.title)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                  )}

                  {/* Оверлей: в темной теме делаем его чуть плотнее */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-primary/60 transition-colors duration-500" />

                  {/* Контейнер для текста */}
                  <div className="absolute inset-0 flex flex-col justify-end items-center p-6 md:p-10 text-center">
                    <div className="bg-black/20 backdrop-blur-sm p-4 rounded-3xl w-full group-hover:bg-transparent transition-all">
                      <p className="text-[1.25rem] md:text-[1.75rem] font-black text-white leading-tight
                        break-words hyphens-auto line-clamp-2 uppercase tracking-tight shadow-black drop-shadow-lg">
                        {getTabLabel(service.title)}
                      </p>

                      {/* Маленький индикатор, который появляется при наведении */}
                      <div className="h-1 w-0 bg-white mx-auto mt-2 group-hover:w-12 transition-all duration-500 rounded-full" />
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
  );
}