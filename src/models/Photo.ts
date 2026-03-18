// models/Service.ts
import type { LocalizedText } from "./LocalizedText.ts";

export interface ImageItem {
  src: string;
  title?: LocalizedText;
  description?: LocalizedText;
}

export interface Photo {
  id?: string;
  serviceIds?: string[];
  subserviceIds?: string[];
  employeeId?: string;

  title?: LocalizedText;
  description?: LocalizedText;

  mainImage: string;
  imgArr?: ImageItem[];
}