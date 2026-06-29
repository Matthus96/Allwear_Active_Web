"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

import type { Product } from "@/lib/appwrite";
import { getWishlistProducts } from "@/lib/wishlist";

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setProducts(getWishlistProducts());
    }, []);

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 text-white md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Allwear Hub
                    </p>

                    <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
                        Wishlist
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Products you saved for later.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-10 md:py-12">
                {products.length === 0 ? (
                    <div className="rounded-[3rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100 md:p-14">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Empty Wishlist
                        </p>

                        <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-5xl">
                            No saved products yet.
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500">
                            Save products from the product page and they’ll appear here.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-8 inline-flex rounded-full bg-[#6FC276] px-8 py-4 font-black text-white transition hover:bg-zinc-950"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Saved Products
                                </p>

                                <h2 className="mt-2 text-3xl font-black text-zinc-950">
                                    {products.length} product
                                    {products.length === 1 ? "" : "s"} saved
                                </h2>
                            </div>

                            <Link
                                href="/shop"
                                className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                            {products.map((item) => (
                                <ProductCard key={item.$id} item={item} />
                            ))}
                        </div>
                    </>
                )}
            </section>

            <Footer />
        </main>
    );
}