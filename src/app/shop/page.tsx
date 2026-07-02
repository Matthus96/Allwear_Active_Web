"use client";

import {
    FormEvent,
    Suspense,
    useEffect,
    useMemo,
    useRef,
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

    const filterAnchorRef = useRef<HTMLDivElement | null>(null);
    const [isFilterFloating, setIsFilterFloating] = useState(false);

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
                const handleScroll = () => {
                    if (!filterAnchorRef.current) return;

                    const anchorTop =
                        filterAnchorRef.current.getBoundingClientRect().top;

                    setIsFilterFloating(anchorTop <= 88);
                };

                handleScroll();

                window.addEventListener("scroll", handleScroll, { passive: true });
                window.addEventListener("resize", handleScroll);

                return () => {
                    window.removeEventListener("scroll", handleScroll);
                    window.removeEventListener("resize", handleScroll);
                };
            }, []);

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
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="relative w-full overflow-hidden bg-zinc-950 py-[clamp(1rem,3vw,1.75rem)] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="site-container relative">
                    <div className="flex flex-col gap-[clamp(0.75rem,2vw,1rem)] rounded-[clamp(1.25rem,3vw,2rem)] border border-white/10 bg-white/5 p-[clamp(1rem,3vw,1.5rem)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[clamp(0.65rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-[#6FC276]">
                                {activeBanner.eyebrow}
                            </p>

                            <h1 className="mt-[clamp(0.4rem,1vw,0.5rem)] text-[clamp(1.25rem,4vw,2.25rem)] font-black leading-tight tracking-tight text-white">
                                {activeBanner.title}
                            </h1>
                        </div>

                        <div className="flex shrink-0 items-center gap-[clamp(0.35rem,1vw,0.5rem)]">
                            {bannerSlides.map((slide, index) => (
                                <button
                                    key={slide.eyebrow}
                                    type="button"
                                    onClick={() => setActiveBannerIndex(index)}
                                    className={`h-[clamp(0.45rem,1vw,0.625rem)] rounded-full transition ${
                                        index === activeBannerIndex
                                            ? "w-[clamp(1.3rem,4vw,2rem)] bg-[#6FC276]"
                                            : "w-[clamp(0.45rem,1vw,0.625rem)] bg-white/30 hover:bg-white/60"
                                    }`}
                                    aria-label={`Show ${slide.eyebrow}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="site-container py-[clamp(1.5rem,5vw,3rem)]">
                <div className="mb-[clamp(1rem,4vw,2.5rem)] flex flex-col gap-[clamp(1rem,3vw,1.25rem)] border-b border-zinc-100 pb-[clamp(1rem,4vw,2rem)] lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-[clamp(0.65rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            {selectedCategoryName}
                        </p>

                        <h2 className="mt-[clamp(0.4rem,1vw,0.5rem)] text-[clamp(1.35rem,4.5vw,2.25rem)] font-black leading-tight tracking-tight text-zinc-950">
                            {loading && products.length === 0
                                ? "Loading products..."
                                : `${productCount} product${
                                      productCount === 1 ? "" : "s"
                                  } available`}
                        </h2>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full flex-col overflow-hidden rounded-[clamp(1.25rem,3vw,1.75rem)] border border-zinc-200 bg-white shadow-sm sm:max-w-xl sm:flex-row sm:rounded-full"
                    >
                        <input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search products..."
                            className="min-w-0 flex-1 px-[clamp(1rem,3vw,1.25rem)] py-[clamp(0.85rem,2vw,1rem)] text-[clamp(0.8rem,1.7vw,0.875rem)] font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
                        />

                        <button
                            type="submit"
                            className="shrink-0 bg-zinc-950 px-[clamp(1.25rem,3vw,1.5rem)] py-[clamp(0.85rem,2vw,1rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-white transition hover:bg-zinc-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                        <div
                            ref={filterAnchorRef}
                            className="grid grid-cols-[clamp(6.5rem,30vw,11rem)_minmax(0,1fr)] gap-[clamp(0.75rem,3vw,1.5rem)] lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8"
                        >                    
                        <div className="min-w-0">
                        <aside
                            className={`self-start rounded-[clamp(1rem,3vw,1.75rem)] border border-zinc-100 bg-zinc-50 p-[clamp(0.6rem,2vw,1.25rem)] transition ${
                                isFilterFloating
                                    ? "fixed left-[clamp(0.75rem,3vw,2rem)] top-[5.5rem] z-30 w-[clamp(12rem,38vw,15rem)] shadow-xl lg:sticky lg:left-auto lg:top-28 lg:w-full"
                                    : "relative z-10 w-full"
                            }`}
                        >                       
                        <div className="mb-[clamp(0.75rem,2vw,1.25rem)] flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <h3 className="text-[clamp(0.95rem,2.5vw,1.125rem)] font-black text-zinc-950">
                                Filters
                            </h3>

                            {(activeCategory ||
                                query ||
                                selectedSize ||
                                selectedStyle) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="w-fit shrink-0 text-[clamp(0.6rem,1.3vw,0.75rem)] font-black uppercase tracking-wide text-[#6FC276]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div>
                            <p className="mb-[clamp(0.45rem,1.5vw,0.75rem)] text-[clamp(0.6rem,1.3vw,0.75rem)] font-black uppercase tracking-[0.16em] text-zinc-400">
                                Category
                            </p>

                            <div className="flex flex-col gap-[clamp(0.4rem,1.5vw,0.75rem)]">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryClick()}
                                    className={`w-full rounded-full px-[clamp(0.65rem,2vw,1.25rem)] py-[clamp(0.55rem,1.5vw,0.75rem)] text-left text-[clamp(0.65rem,1.5vw,0.875rem)] font-black leading-tight transition ${
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
                                            className={`w-full rounded-full px-[clamp(0.65rem,2vw,1.25rem)] py-[clamp(0.55rem,1.5vw,0.75rem)] text-left text-[clamp(0.65rem,1.5vw,0.875rem)] font-black leading-tight transition ${
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

                        <div className="mt-[clamp(1rem,3vw,1.5rem)] border-t border-zinc-200 pt-[clamp(0.9rem,3vw,1.25rem)]">
                            <button
                                type="button"
                                className="mb-[clamp(0.6rem,2vw,1rem)] flex w-full items-center justify-between text-left"
                            >
                                <span className="text-[clamp(0.7rem,1.6vw,0.875rem)] font-black uppercase tracking-wide text-zinc-950">
                                    Size
                                </span>

                                <span className="text-[clamp(0.7rem,1.6vw,0.875rem)] font-black text-zinc-950">
                                    ⌃
                                </span>
                            </button>

                            <div className="max-h-[240px] overflow-y-auto pr-1">
                                <div className="grid grid-cols-2 gap-[clamp(0.35rem,1.5vw,0.75rem)] lg:grid-cols-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSizeClick()}
                                        className={`flex h-[clamp(2rem,5vw,2.5rem)] items-center justify-center rounded-full border text-[clamp(0.65rem,1.5vw,0.875rem)] font-medium transition ${
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
                                            className={`flex h-[clamp(2rem,5vw,2.5rem)] items-center justify-center rounded-full border text-[clamp(0.65rem,1.5vw,0.875rem)] font-medium transition ${
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

                        <div className="mt-[clamp(1rem,3vw,1.5rem)]">
                            <p className="mb-[clamp(0.45rem,1.5vw,0.75rem)] text-[clamp(0.6rem,1.3vw,0.75rem)] font-black uppercase tracking-[0.16em] text-zinc-400">
                                Style
                            </p>

                            <div className="flex flex-col gap-[clamp(0.4rem,1.5vw,0.5rem)] lg:flex-row lg:flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => handleStyleClick()}
                                    className={`rounded-full px-[clamp(0.65rem,2vw,1rem)] py-[clamp(0.45rem,1.4vw,0.5rem)] text-[clamp(0.6rem,1.3vw,0.75rem)] font-black leading-tight transition ${
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
                                            className={`rounded-full px-[clamp(0.65rem,2vw,1rem)] py-[clamp(0.45rem,1.4vw,0.5rem)] text-[clamp(0.6rem,1.3vw,0.75rem)] font-black leading-tight transition ${
                                                selectedStyle === style
                                                    ? "bg-[#6FC276] text-white"
                                                    : "bg-white text-zinc-700 hover:bg-zinc-100"
                                            }`}
                                        >
                                            {style}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] text-zinc-400">
                                        No style data yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-[clamp(1rem,3vw,1.5rem)] rounded-[clamp(0.9rem,2vw,1rem)] bg-white p-[clamp(0.75rem,2vw,1.25rem)]">
                            <p className="text-[clamp(0.75rem,1.7vw,0.875rem)] font-black text-zinc-950">
                                Delivery
                            </p>

                            <p className="mt-[clamp(0.35rem,1vw,0.5rem)] text-[clamp(0.68rem,1.5vw,0.875rem)] leading-5 text-zinc-500">
                                Flat fee of{" "}
                                <span className="font-black text-zinc-950">
                                    R100.00
                                </span>{" "}
                                at checkout.
                            </p>
                        </div>
                    </aside>
                    </div>

                    <div className="min-w-0">
                        {(query || selectedSize || selectedStyle) && (
                            <div className="mb-[clamp(0.75rem,2vw,1.5rem)] rounded-[clamp(1rem,2vw,1rem)] bg-zinc-50 px-[clamp(0.85rem,2vw,1.25rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.75rem,1.7vw,0.875rem)] text-zinc-600">
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
                            <div className="grid grid-cols-1 gap-[clamp(0.75rem,2vw,1rem)] min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
                                {Array.from({ length: 12 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-[clamp(1rem,2.5vw,1.5rem)] border border-zinc-100 bg-white"
                                    >
                                        <div className="aspect-[4/5] animate-pulse bg-zinc-100" />

                                        <div className="space-y-3 p-[clamp(0.75rem,2vw,1rem)]">
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-10 animate-pulse rounded-full bg-zinc-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : productCount > 0 ? (
                            <div className="grid grid-cols-1 gap-[clamp(0.75rem,2vw,1rem)] min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
                                {filteredProducts.map((item) => (
                                    <ProductCard key={item.$id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[clamp(1.25rem,3vw,2rem)] border border-zinc-100 bg-zinc-50 px-[clamp(1rem,3vw,1.5rem)] py-[clamp(3rem,8vw,5rem)] text-center">
                                <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    No Results
                                </p>

                                <h3 className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(1.5rem,4vw,1.875rem)] font-black text-zinc-950">
                                    No products found
                                </h3>

                                <p className="mx-auto mt-[clamp(0.6rem,1.5vw,0.75rem)] max-w-md text-[clamp(0.8rem,1.8vw,0.875rem)] leading-7 text-zinc-500">
                                    Try another category, size, style or search
                                    term. You can also clear all filters and
                                    browse the full collection.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="mt-[clamp(1.25rem,3vw,1.5rem)] rounded-full bg-zinc-950 px-[clamp(1.5rem,3vw,1.75rem)] py-[clamp(0.85rem,2vw,1rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-white"
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