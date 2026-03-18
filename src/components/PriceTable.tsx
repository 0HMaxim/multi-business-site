import React, {useState, useEffect, useMemo} from "react";
import { useTranslation } from "react-i18next";
import SolarPowerBold from "~icons/solar/power-bold";
import type { PriceModel } from "../models/Price";
import {useFetchData} from "../hooks/useFetchData";

type Props = {
  items?: PriceModel[]; // <- можем передать готовые цены
  businessSlug?: string;
  serviceId?: string;
  subserviceId?: string;
};

export default function PriceTable({ items, businessSlug, serviceId, subserviceId }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language as "uk" | "ru" | "en" | "de";

  // ИСПРАВЛЕНИЕ ТИПА: Передаем структуру объекта, которую ожидаем получить
  const { data, loading } = useFetchData<{ prices: PriceModel[] }>(
      ["prices"],
      businessSlug
  );

  const prices: PriceModel[] = items ?? data.prices ?? [];
  const isLoading = !items && !!businessSlug && loading;

  const targetId = subserviceId || serviceId;
  const filteredPrices = useMemo(() => {
    return targetId ? prices.filter((p) => p.serviceIds?.includes(targetId)) : prices;
  }, [prices, targetId]);


  const [activeItems, setActiveItems] = useState<Record<string, boolean>>({});

  const [openSections, setOpenSections] = useState<boolean[]>([]);

  useEffect(() => {
    setOpenSections(filteredPrices.map((_, i) => i === 0));
  }, [filteredPrices]);


  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
        prev.map((open, i) => (i === index ? !open : open))
    );
  };

  const toggleItem = (key: string) => {
    setActiveItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) return <p className="text-center py-8">Loading...</p>;
  if (!filteredPrices.length) return <p className="text-center py-8">No prices found.</p>;

  return (
      <div className="w-full">
        {filteredPrices.map((data, idx) => (
            <div key={idx} className="w-full border-b border-muted duration-500 text-foreground">
              <button
                  onClick={() => toggleSection(idx)}
                  className="w-full text-left flex justify-between items-center relative"
              >
                <h2 className="font-[800] text-[1.2rem] lg:text-[2rem] py-[0.8rem] lg:py-[1.5rem] select-text ">
                  {data.category?.[lang] || "No title"}
                </h2>
                <span
                    className={`text-[1.2rem] lg:text-[2rem] transform transition-transform duration-500 absolute right-[1rem] lg:right-[2.5rem] ${
                        openSections[idx] ? "rotate-180" : "rotate-0"
                    }`}
                >
              +
            </span>
              </button>

              <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                      openSections[idx]
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0 duration-0"
                  }`}
              >
                <table className="w-full text-left border-collapse table-auto">
                  <colgroup>
                    <col className="w-auto" />
                    <col className="w-[9999px]" />
                    <col className="w-[1%]" />
                  </colgroup>

                  <thead>
                  <tr className="border-b-2 border-muted text-[0.9rem] lg:text-[1.5rem] duration-500 text-foreground">
                    <th className="px-[0.5rem] lg:px-[3rem] py-[0.5rem] lg:py-[1.5rem] font-[700] whitespace-nowrap">
                      {data.columns?.duration?.[lang] || "—"}
                    </th>

                    <th className="px-[0.5rem] lg:px-[3rem] py-[0.5rem] lg:py-[1.5rem] font-[700]">
                      {data.columns?.procedure?.[lang] || "—"}
                    </th>

                    <th className="px-[0.5rem] lg:px-[3rem] py-[0.5rem] lg:py-[1.5rem] font-[700] text-right whitespace-nowrap">
                      {data.columns?.price?.[lang] || "—"}
                    </th>
                  </tr>
                  </thead>


                  <tbody className="text-[0.875rem] md:text-[1.25rem]">
                  {(data.sections ?? []).map((section, sIndex) => (
                      <React.Fragment key={sIndex}>
                        <tr>
                          <td
                              colSpan={3}
                              className="uppercase font-bold px-[1rem] md:px-[3rem] py-[1rem] md:py-[1.5rem] border-b border-muted duration-500 text-foreground"
                          >
                            {section.subtitle?.[lang]}
                          </td>
                        </tr>

                        {(section.items ?? []).map((item = {} as any, iIndex) => {
                          const key = `${idx}-${sIndex}-${iIndex}`;
                          const active = activeItems[key] || false;

                          return (
                              <tr
                                  key={iIndex}
                                  className={`border-b border-muted transition-colors duration-500 text-foreground ${
                                      active ? "bg-primary text-white" : ""
                                  }`}
                              >
                                {/* Длительность */}
                                <td className="pl-[0.5rem] lg:pl-[3rem] py-[1rem] md:py-[1.5rem] border-r border-muted whitespace-nowrap">
                                  {item?.duration?.[lang] || "—"}
                                </td>

                                {/* Название услуги */}
                                <td className="px-[1rem] lg:px-[3rem] py-[1rem] md:py-[1.5rem]">
                                  {item?.procedure?.[lang] || "—"}
                                </td>

                                {/* Цена + Кнопка */}
                                <td className="px-[1rem] lg:px-[3rem] py-[1rem] md:py-[1.5rem] border-l border-muted">
                                  <div className="flex items-center justify-end gap-2">
      <span className="font-bold whitespace-nowrap">
        {(typeof item?.price === "object"
            ? item.price?.[lang] || item.price?.["en"]
            : item?.price) || "—"}
      </span>
                                    <button
                                        onClick={() => toggleItem(key)}
                                        className="hover:scale-110 transition-transform"
                                    >
                                      <SolarPowerBold className="size-[1rem] md:size-[1.5rem]" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          );
                        })}
                      </React.Fragment>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        ))}
      </div>
  );
}

