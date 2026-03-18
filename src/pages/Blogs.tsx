import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopImage } from "../components/TopImage.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import type { Blog } from "../models/Blog.ts";
import { useBusiness } from "../context/BusinessContext.tsx";
import { useFetchData } from "../hooks/useFetchData.ts";
import {BlogItem} from "../components/BlogItem.tsx";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function Blogs() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";
  const { businessSlug } = useParams<{ businessSlug: string }>();

  const { data, loading } = useFetchData(["blogs"], businessSlug);
  const blogs = (data.blogs || []) as Blog[];
  const { meta } = useBusiness();
  const { pageContent } = usePageContent(businessSlug, "blogs");

  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'blogs' || t.route === '/blogs')
      : null;

  const headerImage = dynamicTab?.headerImage || "";

  const getTabLabel = (localizedValue: any) => {
    if (!localizedValue) return "";
    return localizedValue[lang] || localizedValue["en"] || "";
  };

  if (loading) {
    return <p className="text-center py-10 text-foreground">{t("loading")}</p>;
  }

  return (
      <div className="w-full bg-background min-h-screen">
        <TopImage source={headerImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs />

          <div className="py-8 mb-[3.5rem] w-full text-foreground transition-colors duration-500">
            {/* Заголовок страницы */}
            <div className="mb-10">
              <h2 className="text-3xl lg:text-5xl font-[800] mb-[1.5rem] text-foreground">
                {getTabLabel(dynamicTab?.title) || t("blog.title")}
              </h2>
              <p className="text-base lg:text-2xl font-normal text-gray-500 dark:text-gray-400 max-w-[50rem]">
                {getTabLabel(dynamicTab?.description) || t("blog.subtitle")}
              </p>
            </div>


            {pageContent?.content && pageContent.content.length > 0 && (
                <div className="mb-12">
                  <ContentBlockRenderer content={pageContent.content} />
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {blogs.map((item) => (
                  <div key={item.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[24rem]">
                    <BlogItem blog={item} lang={lang} businessSlug={businessSlug || ""} />
                  </div>
              ))}
            </div>

          </div>
        </div>
      </div>
  );
}