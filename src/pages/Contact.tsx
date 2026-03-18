import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { TopImage } from "../components/TopImage";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useBusiness } from "../context/BusinessContext";
import { useGeneralInfo } from "../hooks/useGeneralInfo";

import MynauiClockFour from "~icons/mynaui/clock-four";
import OcticonMail24 from "~icons/octicon/mail-24";
import UilTelegramAlt from "~icons/uil/telegram-alt";
import SimpleIconsViber from "~icons/simple-icons/viber";
import IcBaselineWhatsapp from "~icons/ic/baseline-whatsapp";
import StreamlineInstagram from "~icons/streamline/instagram";
import F7LogoFacebook from "~icons/f7/logo-facebook";
import BiDashLg from "~icons/bi/dash-lg";
import MaterialSymbolsPhoneIphoneOutlineSharp from "~icons/material-symbols/phone-iphone-outline-sharp";
import {ContentBlockRenderer} from "../components/ContentBlockRenderer.tsx";
import {usePageContent} from "../hooks/usePageContent.tsx";

export default function Contact() {
  const { i18n, t } = useTranslation();
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";

  const { info, loading } = useGeneralInfo(businessSlug);

  const { meta } = useBusiness();

  const { pageContent } = usePageContent(businessSlug, "contact");

  const dynamicTab = meta?.tabs
      ? Object.values(meta.tabs).find(t => t.route === 'contact' || t.route === '/contact')
      : null;

  const headerImage =
      dynamicTab?.headerImage || "";

  const workingHours = useMemo(() => info?.working_hours ?? [], [info]);
  const messengers = useMemo(() => info?.messengers ?? {}, [info]);
  const socials = useMemo(() => info?.socials ?? {}, [info]);

  if (loading) {
    return (
        <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase">
          {t("loading") || "Loading..."}
        </div>
    );
  }

  return (
      <div className="w-full flex flex-col items-center justify-center">

        <TopImage source={headerImage} />

        <div className="w-full px-4 md:px-[5rem]">
          <Breadcrumbs />

          <div className="py-8 mb-[2.5rem] text-foreground duration-500">
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-6">{t("contact.contacts")}</h2>
          </div>

          {pageContent?.content && pageContent.content.length > 0 && (
              <div className="mb-12">
                <ContentBlockRenderer content={pageContent.content} />
              </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 mb-20 text-foreground duration-500">
            <div className="flex flex-wrap gap-6 lg:w-1/2">

              <div className="mb-[2rem] w-full md:w-[calc(50%-0.75rem)]">
                <div className="flex items-center gap-8 mb-[1rem]">
                  <BiDashLg className="text-muted duration-500 size-[2rem] md:size-[3rem]"/>
                  <p className="font-semibold mb-1 text-[1.5rem] md:text-[2rem]">{t("contact.phone")}</p>
                </div>

                <div className="flex items-center gap-8 ">
                  <MaterialSymbolsPhoneIphoneOutlineSharp className="text-foreground duration-500 size-[2.2rem] md:size-[4rem]"/>
                  <div>
                    {/* Адрес на отдельной строке */}
                    <p className="text-[1rem] md:text-[1.3rem] break-words">{info?.address?.[lang]}</p>
                    <a href={`tel:${info?.phone?.[lang]}`} className="text-foreground duration-500 text-[1.3rem] md:text-[1.7rem] font-[600]">
                      {info?.phone?.[lang]}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mb-[2rem] w-full md:w-[calc(50%-0.75rem)]">
                <div className="flex items-center gap-8 mb-[1rem]">
                  <BiDashLg className="text-muted duration-500 size-[2rem] md:size-[3rem]"/>
                  <p className="font-semibold mb-1 text-[1.5rem] md:text-[2rem]">{t("contact.working_hours")}</p>
                </div>

                <div className="flex items-center gap-8">
                  <MynauiClockFour className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]"/>
                  <div>
                    {workingHours.map((item, idx) => {
                      const daysArray = Array.isArray(item.days) ? item.days : [item.days];
                      return (
                          <p key={idx} className="text-[1rem] md:text-[1.3rem]">
                            {daysArray.map(d => d[lang]).join(", ")}:{" "}
                            <span className="text-[1.3rem] md:text-[1.7rem] font-semibold">{item.hours}</span>
                          </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mb-[2rem] w-full md:w-[calc(50%-0.75rem)]">
                <div className="flex items-center gap-8 mb-[1rem]">
                  <BiDashLg className="text-muted duration-500 size-[2rem] md:size-[3rem]"/>
                  <p className="font-semibold mb-1 text-[1.5rem] md:text-[2rem]">{t("contact.email")}</p>
                </div>

                <div className="flex items-center gap-8 ">
                  <OcticonMail24 className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]"/>
                  <div>
                    <a href={`mailto:${info?.email}`} className="text-foreground duration-500 text-[1.2rem] md:text-[1.5rem] font-[600] break-all">
                      {info?.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mb-[2rem] w-full md:w-[calc(50%-0.75rem)]">
                <div className="flex items-center gap-8 mb-[1rem]">
                  <BiDashLg className="text-muted duration-500 size-[2rem] md:size-[3rem]"/>
                  <p className="font-semibold mb-2 text-[1.5rem] md:text-[2rem]">{t("contact.write")}</p>
                </div>

                <div className="flex items-center gap-4">
                  {messengers.telegram && (
                      <a href={messengers.telegram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                        <UilTelegramAlt className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]" />
                      </a>
                  )}
                  {messengers.viber && (
                      <a href={messengers.viber} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                        <SimpleIconsViber className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]" />
                      </a>
                  )}
                  {messengers.whatsapp && (
                      <a href={messengers.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                        <IcBaselineWhatsapp className="text-foreground duration-500 size-[2.5rem] md:size-[3.3rem]" />
                      </a>
                  )}
                </div>
              </div>

              <div className="mb-[2rem] w-full md:w-[calc(50%-0.75rem)]">
                <div className="flex items-center gap-8 mb-[1rem]">
                  <BiDashLg className="text-muted duration-500 size-[2rem] md:size-[3rem]"/>
                  <p className="font-semibold mb-2 text-[1.5rem] md:text-[2rem]">{t("contact.subscribe")}</p>
                </div>

                <div className="flex items-center gap-4">
                  {socials.instagram && (
                      <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                        <StreamlineInstagram className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]" />
                      </a>
                  )}
                  {socials.facebook && (
                      <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                        <F7LogoFacebook className="text-foreground duration-500 size-[2.2rem] md:size-[3rem]" />
                      </a>
                  )}
                </div>
              </div>

            </div>

            <div className="flex-1 h-[400px] lg:w-1/2 lg:h-auto overflow-hidden rounded-[2rem]">
              {info?.map ? (
                  <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none" dangerouslySetInnerHTML={{ __html: info.map }} />
              ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 uppercase font-black tracking-widest">
                    Map not set
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
