import {useTranslation} from "react-i18next";
import PriceTable from "../components/PriceTable.tsx";
import {TopImage} from "../components/TopImage.tsx";
import {Breadcrumbs} from "../components/Breadcrumbs.tsx";
import {useBusiness} from "../context/BusinessContext.tsx";
import {useParams} from "react-router-dom";
import i18n from "i18next";
// Импортируем хук
import { useGeneralInfo } from "../hooks/useGeneralInfo";
import {usePageContent} from "../hooks/usePageContent.tsx";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";

export default function Price() {
    const { t } = useTranslation();
    const lang = i18n.language as "uk" | "ru" | "en" | "de";
    const { businessSlug } = useParams<{ businessSlug: string }>();

    const { meta } = useBusiness();

    const { pageContent } = usePageContent(businessSlug, "price");

    const { info } = useGeneralInfo(businessSlug);

    const dynamicTab = meta?.tabs
        ? Object.values(meta.tabs).find(t => t.route === 'price' || t.route === '/prices' || t.route === 'price')
        : null;

    const headerImage = dynamicTab?.headerImage || "";

    const getLocalizedValue = (obj: any) => {
        if (!obj) return "";
        return obj[lang] || obj["en"] || "";
    };

    return (
        <div className="w-full items-center justify-center ">
            <TopImage source={headerImage}/>

            <div className="w-full px-4 md:px-[5rem]">
                <Breadcrumbs />

                <div className="py-8 mb-[3.5rem] w-full">
                    <h2 className="text-3xl lg:text-5xl duration-500 text-foreground font-[800] mb-[1.5rem]">
                        {getLocalizedValue(dynamicTab?.title) || t("price.title")}
                    </h2>

                    <div className="md:flex justify-between block">
                        <div className="text-base lg:text-2xl font-normal text-foreground duration-500 mb-4 whitespace-pre-line">
                            <p>{getLocalizedValue(dynamicTab?.description) || t("price.subtitle")}
                                <span>
                                    {info?.phone && (
                                        <a href={`tel:${info?.phone?.[lang]}`} className="text-foreground duration-500 text-[1.3rem] md:text-[1.7rem] font-[600]">
                                             {info?.phone?.[lang]}
                                        </a>
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>

                    {pageContent?.content && pageContent.content.length > 0 && (
                        <div className="mb-12">
                            <ContentBlockRenderer content={pageContent.content} />
                        </div>
                    )}

                    <PriceTable businessSlug={businessSlug}/>
                </div>
            </div>
        </div>
    );
}