"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartCustomization = {
    id: string;
    name?: string;
    price?: number;
};

export type CartItemType = {
    id: string;
    productId: string;
    size?: string;
    quantity: number;
    customizations?: CartCustomization[];
    stockSnapshot: {
        name: string;
        price: number;
        image_url: string;
    };
};

export type Order = {
    id: string;
    items: CartItemType[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    date: string;
    quantity: number;
};

const safeArray = <T,>(arr?: T[] | null): T[] =>
    Array.isArray(arr) ? arr : [];

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const sortById = (x: CartCustomization, y: CartCustomization) =>
        x.id.localeCompare(y.id);

    const aSorted = [...a].sort(sortById);
    const bSorted = [...b].sort(sortById);

    return aSorted.every((item, idx) => item.id === bSorted[idx]?.id);
}

type CartStore = {
    items: CartItemType[];
    orders: Order[];

    pendingPayment: {
        reference: string;
        items: CartItemType[];
        totalPrice: number;
    } | null;

    addItem: (item: CartItemType) => void;
    removeItem: (
        id: string,
        size?: string,
        customizations?: CartCustomization[]
    ) => void;
    increaseQty: (
        id: string,
        size?: string,
        customizations?: CartCustomization[]
    ) => void;
    decreaseQty: (
        id: string,
        size?: string,
        customizations?: CartCustomization[]
    ) => void;
    clearCart: () => void;

    addOrder: (order: Order) => void;

    setPendingPayment: (data: CartStore["pendingPayment"]) => void;
    clearPendingPayment: () => void;

    getTotalItems: () => number;
    getTotalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            orders: [],
            pendingPayment: null,

            addItem: (item) => {
                set((state) => {
                    const items = safeArray(state.items);

                    const existing = items.find(
                        (i) =>
                            i.id === item.id &&
                            i.size === item.size &&
                            areCustomizationsEqual(
                                i.customizations,
                                item.customizations
                            )
                    );

                    if (existing) {
                        return {
                            items: items.map((i) =>
                                i === existing
                                    ? {
                                          ...i,
                                          quantity: i.quantity + 1,
                                      }
                                    : i
                            ),
                        };
                    }

                    return {
                        items: [
                            ...items,
                            {
                                ...item,
                                quantity: item.quantity ?? 1,
                            },
                        ],
                    };
                });
            },

            removeItem: (id, size, customizations) => {
                set((state) => ({
                    items: safeArray(state.items).filter(
                        (i) =>
                            !(
                                i.id === id &&
                                i.size === size &&
                                areCustomizationsEqual(
                                    i.customizations,
                                    customizations
                                )
                            )
                    ),
                }));
            },

            increaseQty: (id, size, customizations) => {
                set((state) => ({
                    items: safeArray(state.items).map((i) =>
                        i.id === id &&
                        i.size === size &&
                        areCustomizationsEqual(
                            i.customizations,
                            customizations
                        )
                            ? {
                                  ...i,
                                  quantity: i.quantity + 1,
                              }
                            : i
                    ),
                }));
            },

            decreaseQty: (id, size, customizations) => {
                set((state) => ({
                    items: safeArray(state.items)
                        .map((i) =>
                            i.id === id &&
                            i.size === size &&
                            areCustomizationsEqual(
                                i.customizations,
                                customizations
                            )
                                ? {
                                      ...i,
                                      quantity: i.quantity - 1,
                                  }
                                : i
                        )
                        .filter((i) => i.quantity > 0),
                }));
            },

            clearCart: () => set({ items: [] }),

            addOrder: (order) => {
                set((state) => ({
                    orders: [order, ...safeArray(state.orders)],
                }));
            },

            setPendingPayment: (data) => set({ pendingPayment: data }),

            clearPendingPayment: () => set({ pendingPayment: null }),

            getTotalItems: () =>
                safeArray(get().items).reduce(
                    (sum, i) => sum + i.quantity,
                    0
                ),

            getTotalPrice: () =>
                safeArray(get().items).reduce((sum, item) => {
                    const base =
                        item.stockSnapshot.price * item.quantity;

                    const extras =
                        safeArray(item.customizations).reduce(
                            (s, c) => s + (c.price ?? 0),
                            0
                        ) * item.quantity;

                    return sum + base + extras;
                }, 0),
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);