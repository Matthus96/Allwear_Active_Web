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
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link href={`/product/${item.$id}`} className="block">
                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-zinc-50 p-3 sm:p-4">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-zinc-950 shadow-sm sm:text-[10px]">
                        Allwear Hub
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 rounded-full bg-[#6FC276] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                        View
                    </div>
                </div>
            </Link>

           <div className="flex flex-1 flex-col p-2.5 sm:p-3">
    <div className="mb-1 flex items-center justify-between gap-2">
        <img
            src="/images/Logo.png"
            alt="Allwear"
            className="h-auto w-[60px] object-contain sm:w-[74px]"
        />

        <p className="rounded-full bg-zinc-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-zinc-500 sm:text-[9px]">
            Online
        </p>
    </div>

    <Link href={`/product/${item.$id}`} className="block">
        <h3 className="line-clamp-1 text-sm font-black leading-none text-zinc-950 transition group-hover:text-[#6FC276] sm:text-[15px]">
            {item.name}
        </h3>
    </Link>

    {item.description ? (
        <p className="mt-1 line-clamp-1 text-[11px] leading-3 text-zinc-500">
            {item.description}
        </p>
    ) : (
        <p className="mt-1 line-clamp-1 text-[11px] leading-3 text-zinc-500">
            Browse product details, select your size and add to cart.
        </p>
    )}

    <div className="mt-2">
        <p className="text-[9px] font-bold uppercase leading-none tracking-wide text-zinc-400">
            From
        </p>

        <p className="mt-0.5 text-lg font-black leading-none text-zinc-950">
            R{Number(item.price || 0).toFixed(2)}
        </p>

        <Link
            href={`/product/${item.$id}`}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#6FC276] sm:text-sm"
        >
            View Product
        </Link>
    </div>
</div>
        </article>
    );
}