"use client";

import {
    FormEvent,
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";
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

type ProductWithFilters = Product & {
    sizes?: string[] | { label?: string; name?: string; size?: string }[];
    size?: string;
    style?: string;
    styles?: string[] | { label?: string; name?: string; style?: string }[];
};

function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const category = searchParams.get("category") || "";
    const query = searchParams.get("query") || "";
    const selectedSize = searchParams.get("size") || "";
    const selectedStyle = searchParams.get("style") || "";

    const [searchValue, setSearchValue] = useState(query);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);

    const { data: categories = [] } = useAppwrite<Category[], any>({
        fn: getCategories,
    });

    const bannerSlides = [
        {
            eyebrow: "Limited Stock!!",
            title: "Shop the current Allwear Active drop before sizes sell out.",
        },
        {
            eyebrow: "New Zealand Tour",
            title: "Get ready for the New Zealand Tour!! Supporter pieces are landing.",
        },
        {
            eyebrow: "Flat Delivery",
            title: "Online orders include a flat local delivery fee of R100.00.",
        },
    ];

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveBannerIndex((current) =>
                current === bannerSlides.length - 1 ? 0 : current + 1
            );
        }, 3500);

        return () => window.clearInterval(timer);
    }, [bannerSlides.length]);

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                setLoading(true);

                const data = await getMenu({
                    category,
                    query,
                });

                const debugProducts = data as ProductWithFilters[];

                console.log("SHOP PRODUCT DATA:", debugProducts);
                console.log("FIRST PRODUCT:", debugProducts?.[0]);
                console.log("FIRST PRODUCT SIZES:", debugProducts?.[0]?.sizes);

                if (!cancelled) {
                    setProducts(data);
                }
            } catch (error) {
                console.log("SHOP PRODUCTS ERROR:", error);

                if (!cancelled) {
                    setProducts([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            cancelled = true;
        };
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

    const getProductSizes = (item: ProductWithFilters) => {
        if (Array.isArray(item.sizes)) {
            return item.sizes
                .map((size) => {
                    if (typeof size === "string") return size;
                    return size.label || size.size || "";
                })
                .filter(Boolean);
        }

        if (item.size) return [item.size];

        return [];
    };

    const getProductStyles = (item: ProductWithFilters) => {
        if (Array.isArray(item.styles)) {
            return item.styles
                .map((style) => {
                    if (typeof style === "string") return style;
                    return style.label || style.name || style.style || "";
                })
                .filter(Boolean);
        }

        if (item.style) return [item.style];

        return [];
    };

    const sizeOptions = useMemo(() => {
        const sizes = products.flatMap((item) =>
            getProductSizes(item as ProductWithFilters)
        );

        return Array.from(new Set(sizes)).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }, [products]);

    const styleOptions = useMemo(() => {
        const styles = products.flatMap((item) =>
            getProductStyles(item as ProductWithFilters)
        );

        return Array.from(new Set(styles)).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }, [products]);

    const getAvailableProductSizes = (item: ProductWithFilters) => {
    if (!Array.isArray(item.sizes)) return [];

    return item.sizes
        .map((size) => {
            if (typeof size === "string") return size;

            return size.label || size.size || "";
        })
        .filter(Boolean);
};

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            const product = item as ProductWithFilters;

            const matchesSize = selectedSize
                ? getProductSizes(product).some(
                      (size) =>
                          size.toLowerCase().trim() ===
                          selectedSize.toLowerCase().trim()
                  )
                : true;

            const matchesStyle = selectedStyle
                ? getProductStyles(product).some(
                      (style) =>
                          style.toLowerCase().trim() ===
                          selectedStyle.toLowerCase().trim()
                  )
                : true;

            return matchesSize && matchesStyle;
        });
    }, [products, selectedSize, selectedStyle]);

    const updateShopRoute = ({
        categoryId,
        searchQuery,
        size,
        style,
    }: {
        categoryId?: string;
        searchQuery?: string;
        size?: string;
        style?: string;
    }) => {
        const params = new URLSearchParams();

        if (searchQuery) {
            params.set("query", searchQuery);
        }

        if (categoryId) {
            params.set("category", categoryId);
        }

        if (size) {
            params.set("size", size);
        }

        if (style) {
            params.set("style", style);
        }

        router.push(`/shop${params.toString() ? `?${params}` : ""}`, {
            scroll: false,
        });
    };

    const handleCategoryClick = (categoryId?: string) => {
        updateShopRoute({
            categoryId,
            searchQuery: query,
            size: selectedSize,
            style: selectedStyle,
        });
    };

    const handleSizeClick = (size?: string) => {
        updateShopRoute({
            categoryId: activeCategory,
            searchQuery: query,
            size,
            style: selectedStyle,
        });
    };

    const handleStyleClick = (style?: string) => {
        updateShopRoute({
            categoryId: activeCategory,
            searchQuery: query,
            size: selectedSize,
            style,
        });
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        updateShopRoute({
            categoryId: activeCategory,
            searchQuery: searchValue.trim(),
            size: selectedSize,
            style: selectedStyle,
        });
    };

    const handleClearFilters = () => {
        setSearchValue("");

        router.push("/shop", {
            scroll: false,
        });
    };

    const productCount = filteredProducts.length;
    const activeBanner = bannerSlides[activeBannerIndex];

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative w-full overflow-hidden bg-zinc-950 py-5 text-white sm:py-6 lg:py-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="site-container relative">
                    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6FC276] sm:text-sm">
                                {activeBanner.eyebrow}
                            </p>

                            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                                {activeBanner.title}
                            </h1>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {bannerSlides.map((slide, index) => (
                                <button
                                    key={slide.eyebrow}
                                    type="button"
                                    onClick={() => setActiveBannerIndex(index)}
                                    className={`h-2.5 rounded-full transition ${
                                        index === activeBannerIndex
                                            ? "w-8 bg-[#6FC276]"
                                            : "w-2.5 bg-white/30 hover:bg-white/60"
                                    }`}
                                    aria-label={`Show ${slide.eyebrow}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="site-container py-8 sm:py-10 lg:py-12">

                <div className="mb-8 flex flex-col gap-5 border-b border-zinc-100 pb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276] sm:text-sm">
                            {selectedCategoryName}
                        </p>

                        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl md:text-4xl">
                            {loading && products.length === 0
                                ? "Loading products..."
                                : `${productCount} product${
                                      productCount === 1 ? "" : "s"
                                  } available`}
                        </h2>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm sm:max-w-xl sm:flex-row sm:rounded-full"
                    >
                        <input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search products..."
                            className="min-w-0 flex-1 px-5 py-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
                        />

                        <button
                            type="submit"
                            className="shrink-0 bg-zinc-950 px-6 py-4 text-sm font-black text-white transition hover:bg-zinc-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8">
                    <aside className="min-w-0 rounded-3xl border border-zinc-100 bg-zinc-50 p-4 sm:p-5 lg:sticky lg:top-28 lg:h-fit">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h3 className="text-lg font-black text-zinc-950">
                                Filters
                            </h3>

                            {(activeCategory ||
                                query ||
                                selectedSize ||
                                selectedStyle) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="shrink-0 text-xs font-black uppercase tracking-wide text-[#6FC276]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div>
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                Category
                            </p>

                            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryClick()}
                                    className={`shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-left text-sm font-black transition lg:w-full ${
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
                                            type="button"
                                            onClick={() =>
                                                handleCategoryClick(
                                                    String(cat.$id)
                                                )
                                            }
                                            className={`shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-left text-sm font-black transition lg:w-full ${
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
                        </div>

                       <div className="mt-6 border-t border-zinc-200 pt-5">
                            <button
                                type="button"
                                className="mb-4 flex w-full items-center justify-between text-left"
                            >
                                <span className="text-sm font-black uppercase tracking-wide text-zinc-950">
                                    Size
                                </span>

                                <span className="text-sm font-black text-zinc-950">⌃</span>
                            </button>

                            <div className="max-h-[240px] overflow-y-auto pr-2">
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSizeClick()}
                                        className={`flex h-10 items-center justify-center rounded-full border text-sm font-medium transition ${
                                            !selectedSize
                                                ? "border-zinc-950 bg-zinc-950 text-white"
                                                : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950"
                                        }`}
                                    >
                                        All
                                    </button>

                                    {sizeOptions.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeClick(size)}
                                            className={`flex h-10 items-center justify-center  rounded-full border text-sm font-medium transition ${
                                                selectedSize === size
                                                    ? "border-zinc-950 bg-zinc-950 text-white"
                                                    : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                Style
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleStyleClick()}
                                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                                        !selectedStyle
                                            ? "bg-zinc-950 text-white"
                                            : "bg-white text-zinc-700 hover:bg-zinc-100"
                                    }`}
                                >
                                    All Styles
                                </button>

                                {styleOptions.length > 0 ? (
                                    styleOptions.map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() =>
                                                handleStyleClick(style)
                                            }
                                            className={`rounded-full px-4 py-2 text-xs font-black transition ${
                                                selectedStyle === style
                                                    ? "bg-[#6FC276] text-white"
                                                    : "bg-white text-zinc-700 hover:bg-zinc-100"
                                            }`}
                                        >
                                            {style}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-zinc-400">
                                        No style data yet.
                                    </p>
                                )}
                            </div>
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

                    <div className="min-w-0">
                        {(query || selectedSize || selectedStyle) && (
                            <div className="mb-6 rounded-2xl bg-zinc-50 px-5 py-4 text-sm text-zinc-600">
                                Showing filtered results
                                {query ? (
                                    <>
                                        {" "}
                                        for{" "}
                                        <span className="font-black text-zinc-950">
                                            “{query}”
                                        </span>
                                    </>
                                ) : null}
                                {selectedSize ? (
                                    <>
                                        {" "}
                                        in size{" "}
                                        <span className="font-black text-zinc-950">
                                            {selectedSize}
                                        </span>
                                    </>
                                ) : null}
                                {selectedStyle ? (
                                    <>
                                        {" "}
                                        with style{" "}
                                        <span className="font-black text-zinc-950">
                                            {selectedStyle}
                                        </span>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {loading && products.length === 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
                                {Array.from({ length: 12 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-3xl border border-zinc-100 bg-white"
                                    >
                                        <div className="aspect-[4/5] animate-pulse bg-zinc-100" />

                                        <div className="space-y-3 p-3 sm:p-4">
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-11 animate-pulse rounded-full bg-zinc-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : productCount > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
                                {filteredProducts.map((item) => (
                                    <ProductCard key={item.$id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50 px-5 py-16 text-center sm:px-6 sm:py-20">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276] sm:text-sm">
                                    No Results
                                </p>

                                <h3 className="mt-3 text-2xl font-black text-zinc-950 sm:text-3xl">
                                    No products found
                                </h3>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
                                    Try another category, size, style or search
                                    term. You can also clear all filters and
                                    browse the full collection.
                                </p>

                                <button
                                    type="button"
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

export default function ShopPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-white">
                    <p className="font-bold text-zinc-500">Loading shop...</p>
                </main>
            }
        >
            <ShopContent />
        </Suspense>
    );
}