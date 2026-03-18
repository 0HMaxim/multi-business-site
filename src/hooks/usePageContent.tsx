// hooks/usePageContent.ts
// ИСПРАВЛЕНО:
// 1. Убран ранний return при undefined — эффект всегда сбрасывает состояние
// 2. routeKey нормализуется (убирается ведущий слэш)
// 3. cancelled flag — защита от race condition при быстрой навигации

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../firebase.ts";
import type { PageContent } from "../models/PageContent.ts";

export function usePageContent(businessSlug?: string, routeKey?: string) {
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Всегда сбрасываем при смене зависимостей
        setPageContent(null);
        setLoading(true);

        if (!businessSlug || !routeKey) {
            setLoading(false);
            return;
        }

        // Нормализуем: "/corporate" → "corporate"
        const normalizedKey = routeKey.replace(/^\//, "");

        let cancelled = false;

        get(ref(db, `businesses/${businessSlug}/pages/${normalizedKey}`))
            .then(snapshot => {
                if (cancelled) return;
                setPageContent(snapshot.exists() ? (snapshot.val() as PageContent) : null);
            })
            .catch(err => {
                if (!cancelled) console.error("usePageContent error:", err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [businessSlug, routeKey]);

    return { pageContent, loading };
}