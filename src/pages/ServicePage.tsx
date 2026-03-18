import { useParams, Link } from "react-router-dom"; // Удален useNavigate (ошибка TS6133)
import { useTranslation } from "react-i18next";
import { TopImage } from "../components/TopImage.tsx";
import PhotoList from "../components/PhotoList.tsx";
import { ContentBlockRenderer } from "../components/ContentBlockRenderer.tsx";
import FAQList from "../components/FAQList.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import PriceTable from "../components/PriceTable.tsx";
import { Button } from "@heroui/react";

// Types
import type { Special } from "../models/Special.ts";
import type { Blog } from "../models/Blog.ts";
import type { ContentBlock } from "../models/ContentBlock.ts";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import type { Service } from "../models/Service.ts";
import type { PriceModel } from "../models/Price.ts";
import type { Employee } from "../models/Employee.ts";
import type { FAQ } from "../models/FAQ.ts";
import type { Photo } from "../models/Photo.ts";
import {useBusiness} from "../context/BusinessContext.tsx";

// Вспомогательная функция для приведения LocalizedText к строке (решает ошибки TS2322)
function getLabel(value: any, lang: string): string {
  if (!value) return "";
  const text = value[lang] || value['en'] || "";
  return Array.isArray(text) ? text.join(", ") : text;
}

export default function ServicePage() {
  const { slug, businessSlug } = useParams<{ slug: string; businessSlug: string }>();
  const { i18n, t } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";
  const { meta } = useBusiness();


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

  if (loading) return <div className="p-20 text-center font-black text-gray-300 animate-pulse uppercase">Loading...</div>;

  const services = data.services || [];
  const prices = data.prices || [];
  const blogs = (data.blogs || []) as Blog[];
  const specials = data.specials || [];
  const employees = data.employees || [];
  const faqs = data.faqs || [];
  const photos = data.photos || [];

  const service = services.find((s) => s.slug === slug);
  if (!service || !service.id) return <div className="p-20 text-center font-black text-foreground text-gray-400 uppercase">Service not found</div>;



  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'services' || t.route === '/services' || t.route?.includes('services'))
      : null;

  const tabHeaderImage = dynamicTab?.headerImage || "";

  const finalHeaderImage = service.mainImage || tabHeaderImage;


  const serviceId = service.id;

  // Фильтрация с проверкой типов
  const relatedSubservices = services.filter(s => Array.isArray(s.parentServiceIds) && s.parentServiceIds.includes(serviceId));
  const relatedPrices = prices.filter(p => Array.isArray(p.serviceIds) && p.serviceIds.includes(serviceId));
  const relatedFaqs = faqs.filter(faq =>
      Array.isArray(faq.serviceIds) && faq.serviceIds.includes(serviceId)
  );

  const relatedPhotos = photos
      .filter(p =>
          (Array.isArray(p.serviceIds) && p.serviceIds.includes(serviceId)) ||
          (Array.isArray(p.subserviceIds) && p.subserviceIds.includes(serviceId))
      )
      .map(photo => ({
        ...photo,
        // Оставляем для совместимости с PhotoList, если он ждет одиночные объекты
        service: services.find(s => Array.isArray(photo.serviceIds) && photo.serviceIds.includes(s.id!)),
        employee: photo.employeeId ? employees.find(e => e.id === photo.employeeId) : undefined
      }));

  // Решение TS2345: проверка b.id через "as string" или проверку на существование
  const relatedBlogs = blogs.filter(b => b.id && Array.isArray(service.blogs) && service.blogs.includes(b.id));
  const relatedSpecials = specials.filter(sp => Array.isArray(sp.serviceId) && sp.serviceId.includes(serviceId));
  const relatedEmployees = employees.filter(emp => emp.id && Array.isArray(service.employees) && service.employees.includes(emp.id));

  return (
      <div className="w-full items-center justify-center">

        <TopImage source={finalHeaderImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs
              serviceSlug={service.slug}
              currentTitle={getLabel(service.title, lang) || getLabel(service.headerTitle, lang)}
          />

          <div className="py-8">
            <h2 className="text-3xl lg:text-5xl font-[800] text-foreground mb-[1.5rem]">{getLabel(service.title, lang)}</h2>
          </div>

          <div className="flex flex-col gap-8">
            {service.content && <ContentBlockRenderer content={service.content} />}

            {relatedSubservices.length > 0 && (
                <div className="py-8">
                  <h2 className="text-3xl lg:text-5xl font-[800] text-foreground my-[1.5rem]">{t("servicePage.otherServices")}</h2>
                  <div className="flex flex-wrap gap-4">
                    {relatedSubservices.map((sub) => (
                        <Link
                            key={sub.id}
                            to={`/${lang}/${businessSlug}/services/${sub.slug}`}
                            className="group relative overflow-hidden w-[15rem] h-[12rem] rounded-[10rem] shadow-md hover:bg-[var(--primary)] hover:shadow-xl transition duration-500 cursor-pointer"
                        >
                          {sub.mainImage && (
                              <img
                                  src={sub.mainImage}
                                  // Решение TS2322 (alt)
                                  alt={getLabel(sub.title, lang)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                          )}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full bg-black/30 text-white p-4 text-center">
                            <p className="text-[1rem] font-normal text-foreground">{getLabel(sub.title, lang)}</p>
                          </div>
                        </Link>
                    ))}
                  </div>
                </div>
            )}

            {relatedPrices.length > 0 && ( <PriceTable items={relatedPrices} /> )}

            {/* Раздел сотрудников */}
            {relatedEmployees.length > 0 && (
                <div className="py-12">
                  <h2 className="text-3xl lg:text-4xl font-[800] text-foreground mb-[3rem] text-center">
                    {t("servicePage.employees") || "Наши специалисты"}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-10">
                    {relatedEmployees.map((emp) => {
                      const name = getLabel(emp.fullName, lang) || "Specialist";
                      const position = getLabel(emp.position, lang);

                      return (
                          <Link
                              key={emp.id}
                              to={`/${lang}/${businessSlug}/employees/${emp.slug}`}
                              className="group w-full sm:w-[20rem] bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                          >
                            <div className="h-[24rem] overflow-hidden relative">
                              {emp.photo ? (
                                  <img
                                      src={emp.photo}
                                      alt={name}
                                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                  />
                              ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400">Нет фото</span>
                                  </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <div className="p-8 text-center">
                              <h3 className="text-2xl font-bold text-foreground text-gray-800 group-hover:text-primary transition-colors duration-300">
                                {name}
                              </h3>
                              {position && (
                                  <p className="text-sm text-gray-500 mt-2 font-semibold text-foreground tracking-[0.1em] uppercase">
                                    {position}
                                  </p>
                              )}
                              <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full transform scale-x-50 group-hover:scale-x-100 transition-transform duration-500" />
                            </div>
                          </Link>
                      );
                    })}
                  </div>
                </div>
            )}

            {relatedPhotos.length > 0 && (
                <PhotoList photos={relatedPhotos} currentPage={0} setCurrentPage={() => {}} itemsPerPage={10} />
            )}

            {relatedFaqs.length > 0 && (
                <FAQList faqs={relatedFaqs} currentPage={0} setCurrentPage={() => {}} itemsPerPage={10} />
            )}

            {/* Specials и Blogs аналогично исправлены через getLabel */}
            {relatedSpecials.length > 0 && (
                <div className="py-12">
                  <h2 className="text-3xl lg:text-4xl font-[800] text-foreground mb-[2.5rem]">{t("blog.relatedSpecials") || "Special Offers"}</h2>
                  <div className="flex justify-center items-center flex-wrap gap-6">
                    {relatedSpecials.map((item: Special) => {
                      const titleText = getLabel(item.title, lang);
                      const subtitleText = getLabel(item.subtitle, lang);

                      if (!item.slug) return null;

                      return (
                          <Link
                              key={item.id}
                              to={`/${lang}/${businessSlug}/specials/${item.slug}`}
                              className="group rounded-2xl shadow-md transition overflow-hidden w-full sm:w-[32rem] md:w-[45rem] h-auto flex flex-col md:flex-row md:gap-[2rem] justify-between relative bg-primary mb-[6rem] hover:shadow-xl duration-500"
                          >
                            <div className="p-[2rem] text-foreground w-full md:w-2/6 flex flex-col">
                              <h2 className="text-[1.8rem] font-extrabold text-foreground mb-[1rem]">{titleText}</h2>
                              <p className="text-[1.2rem] pl-[1.5rem] font-light text-foreground mb-[1.5rem]">{subtitleText}</p>
                              <Button
                                  as={Link}
                                  to={`/${lang}/${businessSlug}/specials/${item.slug}`}
                                  className="w-full md:w-auto px-[1.5rem] py-[0.75rem] rounded-[3.5rem] flex items-center justify-center text-foreground font-semibold bg-black hover:bg-primary transition-colors duration-500 mt-auto"
                              >
                                {t("specials.learnMore")}
                              </Button>
                            </div>
                            {item.mainImage && (
                                <div className="overflow-hidden w-full md:w-4/6 block p-0 mt-4 md:mt-0">
                                  <img
                                      src={item.mainImage}
                                      alt={titleText}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                            )}
                          </Link>
                      );
                    })}
                  </div>
                </div>
            )}

            {relatedBlogs.length > 0 && (
                <div className="py-12">
                  <h2 className="text-3xl lg:text-4xl font-[800] mb-[2.5rem]">{t("servicePage.relatedBlogs") || "Related Blogs"}</h2>
                  <div className="flex flex-wrap justify-center gap-8">
                    {relatedBlogs.map((item: Blog) => (
                        <div key={item.id} className="post_item w-[22rem] bg-primary rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-500">
                          <Link to={`/${lang}/${businessSlug}/blogs/${item.slug}`} className="image_block relative block overflow-hidden group">
                            <span
                                className="image bg_img block w-full h-[15rem] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: `url(${item.mainImage})` }}
                            ></span>
                          </Link>
                          <Link to={`/${lang}/${businessSlug}/blogs/${item.slug}`} className="name fw600 block text-[1.3rem] text-foreground font-semibold mt-4 px-4 hover:text-primary transition">
                            {getLabel(item.title, lang)}
                          </Link>
                          <p className="excerpt text-[1rem] text-foreground mt-2 px-4 line-clamp-3">
                            {getLabel(item.content?.find((block: ContentBlock) => block.type === "paragraph")?.content, lang) || "Опис відсутній"}
                          </p>
                          <Link to={`/${lang}/${businessSlug}/blogs/${item.slug}`} className="more fw600 before block text-[1rem] text-foreground font-semibold text-primary mt-4 mb-4 px-4 hover:underline">
                            {t("specials.learnMore")}
                          </Link>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}