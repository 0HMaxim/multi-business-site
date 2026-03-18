import type { LocalizedText } from "./LocalizedText";

export interface PriceItem {
  duration: LocalizedText;
  procedure: LocalizedText;
  price: LocalizedText;
}

export interface PriceSection {
  subtitle: LocalizedText;
  items: PriceItem[];
}

export interface PriceModel {
  id?: string;
  serviceIds?: string[];
  specials?: string;
  category: LocalizedText;
  columns: {
    duration: LocalizedText;
    procedure: LocalizedText;
    price: LocalizedText;
  };
  sections: PriceSection[];
}
