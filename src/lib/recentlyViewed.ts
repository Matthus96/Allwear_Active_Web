import type { Product } from "@/lib/appwrite";

const STORAGE_KEY = "allwear_recently_viewed_products";
const MAX_ITEMS = 8;

export const getRecentlyViewedProducts = (): Product[] => {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed;
    } catch {
        return [];
    }
};

export const saveRecentlyViewedProduct = (product: Product) => {
    if (typeof window === "undefined") return;

    try {
        const existing = getRecentlyViewedProducts();

        const next = [
            product,
            ...existing.filter((item) => item.$id !== product.$id),
        ].slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Silently fail so product page never breaks.
    }
};