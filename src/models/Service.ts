// models/Service.ts

import type {ContentBlock} from "./ContentBlock.ts";
import type {LocalizedText} from "./LocalizedText.ts";

export interface Service  {
  id?: string;

  parentServiceIds?: string[];
  subservices?: string[];

  title: LocalizedText;
  subtitle: LocalizedText;
  headerTitle?: LocalizedText;
  content?: ContentBlock[];
  slug: string;
  mainImage?: string;

  blogs?: string[];
  prices?: string[];
  specials?: string[];
  employees?: string[];
  photos?: string[];
  faqs?: string[];
}