import type {LocalizedText} from "./LocalizedText.ts";

export interface FAQ {
  id?: string;
  serviceId?: string;
  question: LocalizedText;
  answer: LocalizedText;
  serviceIds?: string[];
}