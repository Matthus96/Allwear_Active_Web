"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";

type Product = {
    $id: string;
    name: string;
    price: number;
    image_url: string;
    description?: string;
    backImage?: string;
};

export default function ProductCard({ item }: { item: Product }) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link href={`/product/${item.$id}`}>
                <div className="flex h-56 items-center justify-center bg-zinc-50 p-6">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                    />
                </div>
            </Link>

            <div className="p-5">
                <Link href={`/product/${item.$id}`}>
                    <h3 className="line-clamp-1 text-base font-bold text-zinc-950">
                        {item.name}
                    </h3>
                </Link>

                <p className="mt-1 text-sm text-zinc-500">
                    From R{Number(item.price || 0).toFixed(2)}
                </p>

                <button
                    onClick={() =>
                        addItem({
                            id: item.$id,
                            productId: item.$id,
                            size: "default",
                            quantity: 1,
                            stockSnapshot: {
                                name: item.name ?? "Unknown item",
                                price: item.price ?? 0,
                                image_url: item.image_url ?? "",
                            },
                        })
                    }
                    className="mt-4 w-full rounded-full bg-[#6FC276] px-4 py-3 text-sm font-black text-white transition hover:brightness-95"
                >
                    Add to Cart +
                </button>
            </div>
        </div>
    );
}