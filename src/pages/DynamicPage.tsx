// pages/DynamicPage.tsx — ФИНАЛЬНАЯ ВЕРСИЯ
// Ключевое исправление: ждём пока meta загрузится через отдельный флаг

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusiness } from "../context/BusinessContext.tsx";
import { ContentBlockRenderer } from "../components/ContentBlockRenderer.tsx";
import { TopImage } from "../components/TopImage.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function DynamicPage() {
    const { slug: rawSlug, businessSlug, lang } = useParams<{
        slug: string;
        businessSlug: string;
        lang: string;
    }>();
    const { i18n } = useTranslation();
    const locale = lang || i18n.language;

    const { meta } = useBusiness();

    // Нормализуем slug: убираем ведущий слэш
    const routeSlug = rawSlug?.replace(/^\//, "");

    const { pageContent, loading: pageLoading } = usePageContent(businessSlug, routeSlug);

    // meta ещё грузится — показываем лоадер
    // Важно: НЕ рендерим 404 пока meta === null
    if (!meta) {
        return (
            <p className="text-center py-10 font-black text-gray-300 animate-pulse uppercase">
                Loading...
            </p>
        );
    }

    // Ищем таб по нормализованному route
    const matchedTab = Object.values(meta.tabs ?? {}).find(t => {
        const tabRoute = (t.route ?? "").replace(/^\//, "");
        return tabRoute === routeSlug;
    });

    // pageContent грузится — тоже лоадер
    if (pageLoading) {
        return (
            <p className="text-center py-10 font-black text-gray-300 animate-pulse uppercase">
                Loading...
            </p>
        );
    }

    // Таб не найден в meta.tabs → 404
    if (!matchedTab) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-4xl font-black text-foreground/20 uppercase tracking-widest">404</p>
                <p className="text-sm text-foreground/40 mt-2">Page not found: /{routeSlug}</p>
            </div>
        );
    }

    const headerImage = matchedTab.headerImage || "";
    const pageTitle =
        matchedTab.title?.[locale] ||
        matchedTab.title?.["en"] ||
        routeSlug || "";
    const pageDescription =
        matchedTab.description?.[locale] ||
        matchedTab.description?.["en"] || "";

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <TopImage source={headerImage} />

            <div className="w-full px-4 md:px-[5rem]">
                <Breadcrumbs />

                <div className="py-8 mb-[2.5rem] text-foreground">
                    <h2 className="text-3xl lg:text-5xl font-[800] mb-3">{pageTitle}</h2>
                    {pageDescription && (
                        <p className="text-base md:text-xl text-foreground/60 max-w-[52rem] leading-relaxed font-normal">
                            {pageDescription}
                        </p>
                    )}
                </div>

                {pageContent?.content && pageContent.content.length > 0 ? (
                    <div className="mb-16">
                        <ContentBlockRenderer content={pageContent.content} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-foreground/10 rounded-[3rem] mb-16">
                        <p className="text-foreground/20 font-black uppercase text-xs tracking-widest">
                            No content yet
                        </p>
                        <p className="text-foreground/15 text-xs mt-1">
                            Admin → Pages → {routeSlug}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
