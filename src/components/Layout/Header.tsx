import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import IconXMark from "~icons/fa6-solid/xmark";
import IconThreeBars from "~icons/octicon/three-bars-16";
import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded';
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { get, ref } from "firebase/database";
import { db } from "../../firebase";
import type { BusinessMeta } from "../../models/Meta";
import type { LocalizedText } from "../../models/LocalizedText.ts";
import type {Service} from "../../models/Service.ts";

export const getLocalizedText = (
    value?: LocalizedText,
    lang?: string
): string => {
  if (!value) return "";
  const l = (lang || "en") as keyof LocalizedText;
  const v = value[l] ?? value.en;
  return Array.isArray(v) ? v.join(", ") : (v as string) ?? "";
};

export default function Header() {
  const { businessSlug, lang } = useParams<{ businessSlug: string; lang: string }>();
  const [meta, setMeta] = useState<BusinessMeta | null>(null);
  const [services, setServices] = useState<Service[]>([]); // Состояние для услуг
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!businessSlug) return;

    const fetchMetaAndServices = async () => {
      try {
        // Загружаем Meta
        const metaSnapshot = await get(ref(db, `businesses/${businessSlug}/meta`));
        if (metaSnapshot.exists()) setMeta(metaSnapshot.val());

        // Загружаем Services для выпадающего списка
        const servicesSnapshot = await get(ref(db, `businesses/${businessSlug}/services`));
        if (servicesSnapshot.exists()) {
          const data = servicesSnapshot.val();
          // Превращаем объект в массив
          const servicesList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setServices(servicesList);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchMetaAndServices();
  }, [businessSlug]);

  if (!meta) return null;

  const getTabsArray = () => {
    if (!meta.tabs) return [];
    const values = Array.isArray(meta.tabs) ? meta.tabs : Object.values(meta.tabs);
    return values.filter(tab => tab && tab.enabled !== false);
  };

  const tabs = getTabsArray().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
      <>
        <header className="fixed top-4 left-4 right-4 flex items-center justify-between
        md:p-6 p-3 backdrop-blur-md rounded-2xl md:rounded-[5rem]
        text-foreground z-50 shadow-lg border border-white/10">

          {businessSlug && (
              <Link
                  to={`/${lang}/admin/${businessSlug}/meta`}
                  className="flex items-center text-foreground gap-2 bg-black/5 hover:bg-black hover:text-white px-5 py-3 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border border-black/5 shadow-sm"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Admin
              </Link>
          )}

          <nav className="hidden lg:flex gap-4 flex-1 justify-center items-center">
            <Link
                to={`/${lang}/${businessSlug}`}
                className="text-[1rem] font-semibold hover:bg-blue-600 hover:text-white rounded-[5rem] p-[0.8rem_1.5rem] duration-300 transition-colors"
            >
              {getLocalizedText(meta.shortName, lang) || getLocalizedText(meta.name, lang) || "Home"}
            </Link>

            {tabs.map((tab, index) => {
              const isServices = tab.route === "services";

              return (
                  <div key={tab.route || index} className="relative group">
                    <Link
                        to={`/${lang}/${businessSlug}/${tab.route}`}
                        className="flex items-center gap-2 text-[1rem] font-semibold hover:bg-blue-600 hover:text-white rounded-[5rem] p-[0.8rem_1.5rem] duration-300 transition-all"
                    >
                      {getLocalizedText(tab.shortName, lang)}
                      {isServices && <MaterialSymbolsArrowForwardIosRounded className="w-3 h-3 transition-transform group-hover:rotate-180" />}
                    </Link>

                    {/* Выпадающий список для Services */}
                    {isServices && services.length > 0 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10
                          opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                          transition-all duration-300 ease-out p-2 overflow-hidden">

                          <div className="flex flex-col gap-1">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/${lang}/${businessSlug}/services/${service.slug}`}
                                    className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors border-b last:border-0 border-black/5 dark:border-white/5"
                                >
                                  {getLocalizedText(service.title, lang)}
                                </Link>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 z-50">
              {menuOpen ? <IconXMark className="w-8 h-8" /> : <IconThreeBars className="w-8 h-8" />}
            </button>
          </div>
        </header>

        {/* Мобильное меню */}
        <div className={`fixed inset-0 dark:bg-black/95 bg-white/95 p-4 flex flex-col gap-3 transition-all duration-500 z-40
          ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"}`}>

          <div className="flex justify-between items-center p-4">
            <button onClick={() => setMenuOpen(false)} className="p-2">
              <IconXMark className="w-8 h-8" />
            </button>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>

          <Link to={`/${lang}/${businessSlug}`} className="text-xl font-bold p-4 text-foreground" onClick={() => setMenuOpen(false)}>
            {getLocalizedText(meta.name, lang)}
          </Link>

          {tabs.map((tab, index) => (
              <Link
                  key={tab.route || index}
                  to={`/${lang}/${businessSlug}/${tab.route}`}
                  className="text-xl font-medium p-4 border-b dark:border-white/10 text-foreground"
                  onClick={() => setMenuOpen(false)}
              >
                {getLocalizedText(tab.shortName, lang)}
              </Link>
          ))}
        </div>
      </>
  );
}