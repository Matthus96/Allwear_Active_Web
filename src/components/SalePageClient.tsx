"use client";

import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import useAppwrite from "@/hooks/useAppwrite";
import { getMenu, type Product } from "@/lib/appwrite";

type MenuParams = {
    category?: string;
    query?: string;
};

export default function SalePageClient() {
    const { data, loading, error } = useAppwrite<Product[], MenuParams>({
        fn: getMenu,
        params: {},
    });

    const saleProducts = (data ?? []).filter((product) => {
        const salePercentage = Number(product.salePercentage);

        return Number.isFinite(salePercentage) && salePercentage > 0;
    });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.42),transparent_40%)]" />

                <div className="site-container relative py-[clamp(3rem,8vw,6rem)]">
                    <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-red-400">
                        Clearance sale
                    </p>

                    <h1 className="mt-3 max-w-4xl text-[clamp(2.25rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight">
                        Move more. Pay less.
                    </h1>

                    <p className="mt-5 max-w-2xl text-[clamp(0.9rem,2vw,1.125rem)] leading-7 text-zinc-300">
                        Shop every reduced Allwear product in one place. The
                        current discount is shown on each product card.
                    </p>

                    <Link
                        href="/shop?sale=true"
                        className="mt-7 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
                    >
                        Filter the full shop
                    </Link>
                </div>
            </section>

            <section className="site-container py-[clamp(2rem,6vw,5rem)]">
                <div className="mb-[clamp(1.25rem,4vw,2.5rem)] flex flex-col gap-3 border-b border-zinc-100 pb-[clamp(1rem,3vw,1.5rem)] sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                            On sale now
                        </p>
                        <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.5rem)] font-black tracking-tight text-zinc-950">
                            {loading
                                ? "Loading sale products..."
                                : `${saleProducts.length} product${
                                      saleProducts.length === 1 ? "" : "s"
                                  } reduced`}
                        </h2>
                    </div>

                    <Link
                        href="/shop"
                        className="w-fit text-sm font-black text-zinc-600 transition hover:text-[#6FC276]"
                    >
                        View all products →
                    </Link>
                </div>

                {error ? (
                    <div className="rounded-[1.5rem] bg-red-50 px-6 py-12 text-center">
                        <h2 className="text-xl font-black text-zinc-950">
                            Sale products could not be loaded
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600">
                            Please refresh the page or try again shortly.
                        </p>
                    </div>
                ) : loading ? (
                    <SaleGridSkeleton />
                ) : saleProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-[clamp(0.75rem,2vw,1rem)] min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
                        {saleProducts.map((product) => (
                            <ProductCard key={product.$id} item={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[1.5rem] bg-zinc-50 px-6 py-16 text-center">
                        <h2 className="text-2xl font-black text-zinc-950">
                            No sale products right now
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600">
                            Check back soon or browse the full collection.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Browse all products
                        </Link>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}

function SaleGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-[clamp(0.75rem,2vw,1rem)] min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
            {Array.from({ length: 10 }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white"
                >
                    <div className="aspect-[4/5] animate-pulse bg-zinc-100" />
                    <div className="space-y-3 p-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}
