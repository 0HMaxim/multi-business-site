import type { ContentBlock } from "./ContentBlock.ts";

export interface PageContent {
    routeKey: string;
    content?: ContentBlock[];
    updatedAt?: number;
}
