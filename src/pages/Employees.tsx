import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopImage } from "../components/TopImage.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import { useBusiness } from "../context/BusinessContext.tsx";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

//import { uploadBusiness } from "../upload.ts";

export default function Employees() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const { data, loading } = useFetchData(["employees"], businessSlug);
  const employees = data.employees ?? [];

  const { meta } = useBusiness();
  const { pageContent } = usePageContent(businessSlug, "employees");

  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'employees' || t.route === '/employees')
      : null;

  const headerImage =
      dynamicTab?.headerImage || "";

  const getTabLabel = (localizedValue: any) => {
    if (!localizedValue) return "";
    return localizedValue[lang] || localizedValue["en"] || "";
  };


  if (loading) return <p className="text-center py-10">{t("loading") || "Loading Specialists..."}</p>;


  return (
      <div className="w-full items-center justify-center">
        <TopImage source={headerImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs />

          <div className="py-8 mb-[3.5rem] w-full text-foreground duration-500">
            <h2 className="text-3xl lg:text-5xl font-[800] mb-[1.5rem]">
              {getTabLabel(dynamicTab?.title) || t("employees.title")}
            </h2>

            <div className="md:flex justify-between block">
              <p className="text-base lg:text-2xl font-normal mb-4">
                {getTabLabel(dynamicTab?.description) || t("employees.subtitle")}
              </p>
          </div>


            {pageContent?.content && pageContent.content.length > 0 && (
                <div className="mb-12">
                  <ContentBlockRenderer content={pageContent.content} />
                </div>
            )}

          {/* Сетка карточек — ДИЗАЙН КАК БЫЛ (Цельная ссылка) */}
          <div className="flex flex-wrap gap-10 justify-center w-full mb-20">
            {employees.map((item, index) => {
              // Формируем правильный путь: /язык/бизнес/employees/врач
              const profileUrl = `/${lang}/${businessSlug}/employees/${item.slug || ""}`;

              return (
                  <Link
                      key={item.id || index}
                      to={profileUrl}
                      className="group flex flex-col md:flex-row bg-primary rounded-[4rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden w-full max-w-[45rem] min-h-[25rem] relative "
                  >
                    {/* Контентная часть */}
                    <div className="flex flex-col justify-between p-8 md:p-10 lg:p-12 md:w-1/2">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight group-hover:text-foreground/70 transition-colors duration-300 break-words">
                          {item?.fullName?.[lang] || "No name"}
                        </h2>

                        {/* ВОТ ОН: Твой серый цвет (gray-500) с поддержкой темной темы */}
                        <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-6">
                          {item?.position?.[lang] || "No position"}
                        </p>
                      </div>

                      {/* Кнопка с защитой от вылета */}
                      <div className="w-full md:w-fit px-6 py-4 rounded-full bg-black hover:bg-gray-900 text-white font-bold transition-all active:scale-95 flex items-center justify-center text-center">
                        <span className="text-[10px] sm:text-xs uppercase tracking-tighter sm:tracking-widest leading-tight break-words">
                          {t("employees.bookAppointment", {
                            name: item?.shortName?.[lang] || "",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Фото часть */}
                    <div className="md:w-1/2 h-[22rem] md:h-auto overflow-hidden relative">
                      {item.photo ? (
                          <img
                              src={item.photo}
                              alt={item?.fullName?.[lang]}
                              /* object-top чтобы головы не резало */
                              className="w-full h-full object-cover object-top grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          />
                      ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                            No photo
                          </div>
                      )}
                    </div>
                  </Link>
              );
            })}
          </div>
        </div>
        </div>
      </div>
  );
}