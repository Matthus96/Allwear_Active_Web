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
        <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link href={`/product/${item.$id}`} className="block">
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-zinc-50 p-3 sm:p-5">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                    />
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-3 sm:p-5">
                <img
                    src="/images/Logo.png"
                    alt="Allwear Active"
                    className="mb-2 h-auto w-[82px] object-contain sm:w-[105px]"
                />

                <Link href={`/product/${item.$id}`}>
                    <h3 className="line-clamp-2 min-h-[34px] text-sm font-black leading-tight text-zinc-950 sm:min-h-[40px] sm:text-base">
                        {item.name}
                    </h3>
                </Link>

                <p className="mt-2 text-xs font-black text-zinc-500 sm:text-sm">
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
                    className="mt-4 w-full rounded-full bg-[#6FC276] px-3 py-3 text-xs font-black text-white transition hover:brightness-95 sm:px-4 sm:text-sm"
                >
                    Add to Cart +
                </button>
            </div>
        </article>
    );
}