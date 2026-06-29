import type { Product } from "@/lib/appwrite";

const STORAGE_KEY = "allwear_wishlist_products";

export const getWishlistProducts = (): Product[] => {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const isProductInWishlist = (productId: string) => {
    return getWishlistProducts().some((item) => item.$id === productId);
};

export const addProductToWishlist = (product: Product) => {
    if (typeof window === "undefined") return;

    const existing = getWishlistProducts();

    const next = [
        product,
        ...existing.filter((item) => item.$id !== product.$id),
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const removeProductFromWishlist = (productId: string) => {
    if (typeof window === "undefined") return;

    const existing = getWishlistProducts();

    const next = existing.filter((item) => item.$id !== productId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const toggleWishlistProduct = (product: Product) => {
    if (isProductInWishlist(product.$id)) {
        removeProductFromWishlist(product.$id);
        return false;
    }

    addProductToWishlist(product);
    return true;
};