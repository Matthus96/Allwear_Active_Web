"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import useAppwrite from "@/hooks/useAppwrite";

import {
    getCategories,
    getMenu,
    type Category,
    type Product,
} from "@/lib/appwrite";

export default function ShopPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const category = searchParams.get("category") || "";
    const query = searchParams.get("query") || "";

    const [searchValue, setSearchValue] = useState(query);

    const {
        data: productsData,
        loading,
        refetch,
    } = useAppwrite<Product[], any>({
        fn: getMenu,
        params: {
            category,
            query,
        },
    });

    const products = productsData ?? [];

    const { data: categories = [] } = useAppwrite<Category[], any>({
        fn: getCategories,
    });

    useEffect(() => {
        refetch({
            category,
            query,
        });
        // Do not add refetch here. It can cause repeated fetching.
    }, [category, query]);

    useEffect(() => {
        setSearchValue(query);
    }, [query]);

    const activeCategory = category;

    const selectedCategoryName = useMemo(() => {
        if (!activeCategory) return "All Products";

        const selected = categories?.find(
            (cat) => String(cat.$id) === String(activeCategory)
        );

        return selected?.name ?? "Selected Category";
    }, [activeCategory, categories]);

    const updateShopRoute = ({
        categoryId,
        searchQuery,
    }: {
        categoryId?: string;
        searchQuery?: string;
    }) => {
        const params = new URLSearchParams();

        if (searchQuery) {
            params.set("query", searchQuery);
        }

        if (categoryId) {
            params.set("category", categoryId);
        }

        router.push(`/shop${params.toString() ? `?${params}` : ""}`);
    };

    const handleCategoryClick = (categoryId?: string) => {
        updateShopRoute({
            categoryId,
            searchQuery: query,
        });
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        updateShopRoute({
            categoryId: activeCategory,
            searchQuery: searchValue.trim(),
        });
    };

    const handleClearFilters = () => {
        setSearchValue("");
        router.push("/shop");
    };

    const productCount = products?.length ?? 0;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* SHOP HERO */}
            <section className="bg-zinc-950 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Collection
                    </p>

                    <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
                        Shop Allwear Active
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                        Browse our latest activewear, lifestyle apparel and
                        performance-ready pieces. Add your favourites to cart
                        and get delivery for a flat R100.00.
                    </p>
                </div>
            </section>

            {/* SHOP BODY */}
            <section className="mx-auto max-w-7xl px-6 py-12">
                {/* TOP TOOLBAR */}
                <div className="mb-10 flex flex-col gap-5 border-b border-zinc-100 pb-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            {selectedCategoryName}
                        </p>

                        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">
                            {loading
                                ? "Loading products..."
                                : `${productCount} product${
                                      productCount === 1 ? "" : "s"
                                  } available`}
                        </h2>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full max-w-xl overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm"
                    >
                        <input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search products..."
                            className="min-w-0 flex-1 px-5 py-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
                        />

                        <button
                            type="submit"
                            className="bg-zinc-950 px-6 py-4 text-sm font-black text-white transition hover:bg-zinc-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                    {/* SIDEBAR */}
                    <aside className="h-fit rounded-3xl border border-zinc-100 bg-zinc-50 p-5 lg:sticky lg:top-28">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-zinc-950">
                                Categories
                            </h3>

                            {(activeCategory || query) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-xs font-black uppercase tracking-wide text-[#6FC276]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
                            <button
                                onClick={() => handleCategoryClick()}
                                className={`whitespace-nowrap rounded-full px-5 py-3 text-left text-sm font-black transition lg:w-full ${
                                    !activeCategory
                                        ? "bg-[#6FC276] text-white"
                                        : "bg-white text-zinc-800 hover:bg-zinc-100"
                                }`}
                            >
                                All Products
                            </button>

                            {(categories ?? []).map((cat) => {
                                const isActive =
                                    String(cat.$id) ===
                                    String(activeCategory);

                                return (
                                    <button
                                        key={cat.$id}
                                        onClick={() =>
                                            handleCategoryClick(String(cat.$id))
                                        }
                                        className={`whitespace-nowrap rounded-full px-5 py-3 text-left text-sm font-black transition lg:w-full ${
                                            isActive
                                                ? "bg-[#6FC276] text-white"
                                                : "bg-white text-zinc-800 hover:bg-zinc-100"
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 rounded-2xl bg-white p-5">
                            <p className="text-sm font-black text-zinc-950">
                                Delivery
                            </p>

                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Flat delivery fee of{" "}
                                <span className="font-black text-zinc-950">
                                    R100.00
                                </span>{" "}
                                added at checkout.
                            </p>
                        </div>
                    </aside>

                    {/* PRODUCT AREA */}
                    <div>
                        {query && (
                            <div className="mb-6 rounded-2xl bg-zinc-50 px-5 py-4 text-sm text-zinc-600">
                                Showing results for{" "}
                                <span className="font-black text-zinc-950">
                                    “{query}”
                                </span>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-3xl border border-zinc-100 bg-white"
                                    >
                                        <div className="h-56 animate-pulse bg-zinc-100" />
                                        <div className="space-y-3 p-5">
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-11 animate-pulse rounded-full bg-zinc-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : productCount > 0 ? (
                            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                                {products.map((item) => (
                                    <ProductCard
                                        key={item.$id}
                                        item={item}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50 px-6 py-20 text-center">
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    No Results
                                </p>

                                <h3 className="mt-3 text-3xl font-black text-zinc-950">
                                    No products found
                                </h3>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
                                    Try another category or search term. You can
                                    also clear all filters and browse the full
                                    collection.
                                </p>

                                <button
                                    onClick={handleClearFilters}
                                    className="mt-6 rounded-full bg-zinc-950 px-7 py-4 text-sm font-black text-white"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}