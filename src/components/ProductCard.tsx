"use client";

import Link from "next/link";

type Product = {
    $id: string;
    name: string;
    price: number;
    image_url: string;
    description?: string;
    backImage?: string;
    categories?: string | string[];
};

export default function ProductCard({ item }: { item: Product }) {
    return (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-zinc-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link href={`/product/${item.$id}`} className="block">
                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-zinc-50 p-4 sm:p-5">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-zinc-950 shadow-sm">
                        Allwear Hub
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-full bg-[#6FC276] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                        View
                    </div>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <img
                        src="/images/Logo.png"
                        alt="Allwear"
                        className="h-auto w-[80px] object-contain sm:w-[100px]"
                    />

                    <p className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-500">
                        Online
                    </p>
                </div>

                <Link href={`/product/${item.$id}`} className="block">
                    <h3 className="line-clamp-2 min-h-[38px] text-sm font-black leading-tight text-zinc-950 transition group-hover:text-[#6FC276] sm:min-h-[44px] sm:text-base">
                        {item.name}
                    </h3>
                </Link>

                {item.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                        {item.description}
                    </p>
                ) : (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                        Browse product details, select your size and add to cart.
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        From
                    </p>

                    <p className="mt-1 text-xl font-black text-zinc-950">
                        R{Number(item.price || 0).toFixed(2)}
                    </p>

                    <Link
                        href={`/product/${item.$id}`}
                        className="mt-4 flex w-full items-center justify-center rounded-full bg-zinc-950 px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#6FC276] sm:text-sm"
                    >
                        View Product
                    </Link>
                </div>
            </div>
        </article>
    );
}