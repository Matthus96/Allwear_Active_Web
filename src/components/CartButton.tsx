"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export default function CartButton() {
    const items = useCartStore((state) => state.items);

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-950"
        >
            <ShoppingBag size={20} />

            {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6FC276] px-1 text-xs font-black text-white">
                    {totalItems}
                </span>
            )}
        </Link>
    );
}