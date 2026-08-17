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
    salePercentage?: number | string | null;
    isComingSoon?: boolean | string;
    comingSoon?: boolean | string;
    status?: string;
    isLimitedEdition?: boolean | string;
    limitedEditionUnits?: number | string;
    sizes?: Array<{ quantity: number; available?: boolean }>;
};

export default function ProductCard({ item }: { item: Product }) {
    const normalizedStatus = String(item.status || "").trim().toLowerCase();
    const isComingSoon =
        item.isComingSoon === true ||
        item.comingSoon === true ||
        ["true", "yes"].includes(
            String(item.isComingSoon || item.comingSoon).trim().toLowerCase()
        ) ||
        normalizedStatus === "coming soon" ||
        normalizedStatus === "coming-soon";
    const isLimitedEdition =
        item.isLimitedEdition === true ||
        String(item.isLimitedEdition).trim().toLowerCase() === "true" ||
        String(item.isLimitedEdition).trim().toLowerCase() === "yes";
    const availableStock = (item.sizes || []).reduce(
        (total, size) =>
            size.available === false ? total : total + Number(size.quantity || 0),
        0
    );
    const isLowStock = availableStock > 0 && availableStock < 10;
    const rawSalePercentage = Number(item.salePercentage);
    const salePercentage = Number.isFinite(rawSalePercentage)
        ? Math.min(100, Math.max(0, Math.round(rawSalePercentage)))
        : 0;

    return (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link href={`/product/${item.$id}`} className="block">
                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-zinc-50 p-3 sm:p-4">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
                        {salePercentage > 0 ? (
                            <p className="rounded-full bg-red-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                                Clearance · -{salePercentage}%
                            </p>
                        ) : null}

                        {isComingSoon ? (
                            <p className="rounded-full bg-zinc-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                                Coming Soon
                            </p>
                        ) : isLimitedEdition ? (
                            <p className="rounded-full bg-zinc-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                                Limited Edition
                            </p>
                        ) : isLowStock ? (
                            <p className="rounded-full bg-amber-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
                                Low stock
                            </p>
                        ) : null}
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
        <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-zinc-500">
            {item.description}
        </p>
    ) : (
        <p className="mt-1 line-clamp-1 text-[11px] leading-3 text-zinc-500">
            Browse product details, select your size and add to cart.
        </p>
    )}

    {!isComingSoon ? (
        <div className="mt-2">
            <p className="text-[12px] font-bold uppercase leading-none tracking-wide text-green-600">
                From
            </p>

            {new Intl.NumberFormat("en-ZA", {
                style: "currency",
                currency: "ZAR",
            }).format(item.price)}
        </div>
    ) : null}
            </div>
        </article>
    );
}
