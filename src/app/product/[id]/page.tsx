"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MeasurementSheet from "@/components/MeasurementSheet";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ProductCard from "@/components/ProductCard";

import {
    getRecentlyViewedProducts,
    saveRecentlyViewedProduct,
} from "@/lib/recentlyViewed";

import {
    isProductInWishlist,
    toggleWishlistProduct,
} from "@/lib/wishlist";

import {
    getMenu,
    getMenuById,
    getProductInventory,
    type Product,
    type ProductInventory,
} from "@/lib/appwrite";

import { useCartStore } from "@/store/cart.store";


type ProductWithComingSoon = Product & {
    isComingSoon?: boolean | string;
    comingSoon?: boolean | string;
    status?: string;
};

const normalizeFlagText = (value: unknown) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeSize = (value: unknown) =>
    typeof value === "string" ? value.trim().toUpperCase() : "";

const GARMENT_SIZE_ORDER = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
    "7XL",
    "8XL",
    "9XL",
    "10XL",
    "11XL",
    "12XL",
];

const isMetricLengthSize = (value: unknown) => {
    const normalized =
        typeof value === "string" ? value.trim().toLowerCase() : "";

    return /^\d+(?:\.\d+)?\s*(cm|m)$/.test(normalized);
};

const getMetricLengthInCm = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(cm|m)$/);

    if (!match) return null;

    const amount = Number(match[1]);

    if (!Number.isFinite(amount)) return null;

    return match[2] === "m" ? amount * 100 : amount;
};

const compareInventorySizes = (a: string, b: string) => {
    const normalizedA = normalizeSize(a);
    const normalizedB = normalizeSize(b);

    const garmentIndexA = GARMENT_SIZE_ORDER.indexOf(normalizedA);
    const garmentIndexB = GARMENT_SIZE_ORDER.indexOf(normalizedB);

    if (garmentIndexA !== -1 || garmentIndexB !== -1) {
        if (garmentIndexA === -1) return 1;
        if (garmentIndexB === -1) return -1;

        return garmentIndexA - garmentIndexB;
    }

    const metricA = getMetricLengthInCm(a);
    const metricB = getMetricLengthInCm(b);

    if (metricA !== null || metricB !== null) {
        if (metricA === null) return 1;
        if (metricB === null) return -1;

        return metricA - metricB;
    }

    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
    });
};

const isTruthyFlag = (value: unknown) =>
    value === true ||
    normalizeFlagText(value) === "true" ||
    normalizeFlagText(value) === "yes";

const isProductComingSoon = (item: ProductWithComingSoon | null) => {
    if (!item) return false;

    return (
        isTruthyFlag(item.isComingSoon) ||
        isTruthyFlag(item.comingSoon) ||
        normalizeFlagText(item.status) === "coming soon" ||
        normalizeFlagText(item.status) === "coming-soon"
    );
};

const formatPrice = (price: unknown) =>
    new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
    }).format(Number(price || 0));

const normalizeCategories = (categories?: string | string[]) => {
    if (!categories) return [];

    if (Array.isArray(categories)) {
        return categories.map((category) => String(category));
    }

    return [String(categories)];
};

const toValidPrice = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }

    return parsed;
};

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const productId = params.id;

    const addItem = useCartStore((state) => state.addItem);

    const [product, setProduct] = useState<Product | null>(null);
    const [inventory, setInventory] = useState<ProductInventory[]>([]);

    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>(
        []
    );

    const [selectedSize, setSelectedSize] = useState("");
    const [measurementOpen, setMeasurementOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const [loading, setLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setInventoryLoading(true);
                setError(null);

                const productData = await getMenuById({ id: productId });

                if (cancelled) return;

                const currentProduct = productData as ProductWithComingSoon;
                const productComingSoon = isProductComingSoon(currentProduct);

                setProduct(productData as Product);
                setIsWishlisted(isProductInWishlist(productData.$id));

                saveRecentlyViewedProduct(productData as Product);

                const recentlyViewed = getRecentlyViewedProducts().filter(
                    (item) => item.$id !== productData.$id
                );

                setRecentlyViewedProducts(recentlyViewed.slice(0, 4));

                if (productComingSoon) {
                    setInventory([]);
                    setSelectedSize("");
                } else {
                    /*
                     * Keep the existing inventory relationship:
                     * product_inventory.productId -> menu.$id
                     */
                    const inventoryData = await getProductInventory(
                        productData.$id,
                        productData.range
                    );

                    if (!cancelled) {
                        setInventory(inventoryData);
                    }
                }

                const allProducts = await getMenu({});

                if (cancelled) return;

                const currentCategories = normalizeCategories(
                    productData.categories
                );

                const scoredProducts = allProducts
                    .filter((item) => item.$id !== productData.$id)
                    .map((item) => {
                        const itemCategories = normalizeCategories(
                            item.categories
                        );

                        const matchingCategoryCount = itemCategories.filter(
                            (category) => currentCategories.includes(category)
                        ).length;

                        return {
                            product: item,
                            score: matchingCategoryCount,
                        };
                    })
                    .sort((a, b) => b.score - a.score);

                const recommendedProducts = scoredProducts
                    .map((item) => item.product)
                    .slice(0, 4);

                setSimilarProducts(recommendedProducts);
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message || "Could not load product.");
                    setInventory([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setInventoryLoading(false);
                }
            }
        };

        if (productId) {
            fetchProduct();
        }

        return () => {
            cancelled = true;
        };
    }, [productId]);

    const getSizeInventory = (size: string) => {
        const normalized = normalizeSize(size);

        return inventory.find(
            (item) => normalizeSize(item.size) === normalized
        );
    };

    const isSizeAvailable = (size: string) => {
        const sizeInventory = getSizeInventory(size);

        if (!sizeInventory) return false;
        if (sizeInventory.available === false) return false;

        return Number(sizeInventory.quantity || 0) > 0;
    };

    const isComingSoon = isProductComingSoon(
        product as ProductWithComingSoon | null
    );

    const sizeOptions = useMemo(() => {
        if (isComingSoon) return [];

        const seen = new Set<string>();
        const options: string[] = [];

        inventory.forEach((item) => {
            const size = String(item.size || "").trim();
            const normalized = normalizeSize(size);

            if (!size || !normalized || seen.has(normalized)) {
                return;
            }

            seen.add(normalized);
            options.push(size);
        });

        return options.sort(compareInventorySizes);
    }, [inventory, isComingSoon]);

    const usesLengthSizing = useMemo(() => {
        return (
            sizeOptions.length > 0 &&
            sizeOptions.every((size) => isMetricLengthSize(size))
        );
    }, [sizeOptions]);

    const availableSizes = useMemo(() => {
        return sizeOptions.filter((size) => isSizeAvailable(size));
    }, [sizeOptions, inventory]);

    const firstAvailableSize = availableSizes[0] || "";

    useEffect(() => {
        if (usesLengthSizing) {
            setMeasurementOpen(false);
        }
    }, [usesLengthSizing]);

    useEffect(() => {
        if (isComingSoon) {
            setSelectedSize("");
            return;
        }

        if (!selectedSize && firstAvailableSize) {
            setSelectedSize(firstAvailableSize);
            return;
        }

        if (
            selectedSize &&
            !availableSizes.some(
                (size) => normalizeSize(size) === normalizeSize(selectedSize)
            )
        ) {
            setSelectedSize(firstAvailableSize);
        }
    }, [firstAvailableSize, selectedSize, isComingSoon, availableSizes]);

    const selectedInventory = useMemo(() => {
        if (!selectedSize) return undefined;

        return inventory.find(
            (item) =>
                normalizeSize(item.size) === normalizeSize(selectedSize)
        );
    }, [inventory, selectedSize]);

    const basePrice = useMemo(
        () => toValidPrice(product?.price) ?? 0,
        [product?.price]
    );

    const selectedInventoryPrice = useMemo(
        () => toValidPrice(selectedInventory?.price),
        [selectedInventory]
    );

    /*
     * Size price wins.
     * If a legacy inventory row does not yet have a price, menu.price remains
     * the safe fallback so existing products do not suddenly become unbuyable.
     */
    const activePrice =
        selectedInventoryPrice !== null
            ? selectedInventoryPrice
            : basePrice;

    const selectedSizeAvailable = selectedSize
        ? isSizeAvailable(selectedSize)
        : false;

    const canAddToCart = Boolean(
        product &&
            !isComingSoon &&
            selectedSizeAvailable &&
            Number.isFinite(activePrice) &&
            activePrice >= 0
    );

    const handleAddToCart = () => {
        if (!product) return;

        if (isComingSoon) {
            alert("This product is coming soon and cannot be added to cart yet.");
            return;
        }

        if (!selectedSize) {
            alert(usesLengthSizing ? "Please select a length." : "Please select a size.");
            return;
        }

        if (!isSizeAvailable(selectedSize)) {
            alert("This size is currently sold out.");
            return;
        }

        const sizeInventory = getSizeInventory(selectedSize);
        const inventoryPrice = toValidPrice(sizeInventory?.price);
        const finalPrice = inventoryPrice !== null ? inventoryPrice : basePrice;

        addItem({
            id: `${product.$id}-${selectedSize}`,
            productId: product.$id,
            size: selectedSize,
            quantity: 1,
            stockSnapshot: {
                name: product.name ?? "Unknown item",
                price: finalPrice,
                image_url: product.image_url ?? "",
            },
        });

        alert(`Added ${selectedSize} to cart at ${formatPrice(finalPrice)}`);
    };

    if (loading) {
        return (
            <main className="min-h-screen overflow-x-hidden bg-white">
                <Navbar />

                <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-12">
                    <div className="aspect-square animate-pulse rounded-[2rem] bg-zinc-100" />

                    <div className="min-w-0 space-y-5">
                        <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
                        <div className="h-16 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
                        <div className="h-8 w-40 animate-pulse rounded bg-zinc-100" />
                        <div className="h-28 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
                    </div>
                </section>

                <Footer />
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen overflow-x-hidden bg-white">
                <Navbar />

                <section className="flex min-h-[70vh] items-center justify-center px-4">
                    <div className="w-full max-w-xl rounded-[2rem] bg-zinc-50 p-6 text-center ring-1 ring-zinc-100">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Product Error
                        </p>

                        <h1 className="mt-3 text-2xl font-black text-zinc-950">
                            Product not found
                        </h1>

                        <p className="mt-3 break-words text-sm text-zinc-500">
                            {error || "This product could not be loaded."}
                        </p>

                        <Link
                            href="/shop"
                            className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 text-sm font-black text-white"
                        >
                            Back to Shop
                        </Link>
                    </div>
                </section>

                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-white">
            <Navbar />

            <section className="bg-zinc-950 px-4 py-4 text-white">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
                    <Link
                        href="/shop"
                        className="rounded-full bg-white/10 px-4 py-3 text-xs font-black text-white ring-1 ring-white/10 transition hover:bg-white hover:text-zinc-950 sm:px-5 sm:text-sm"
                    >
                        ← Back to Shop
                    </Link>

                    <p className="hidden text-sm font-black uppercase tracking-[0.2em] text-[#6FC276] sm:block">
                        Product Details
                    </p>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-14">
                <div className="min-w-0 overflow-hidden">
                    <div className="w-full overflow-hidden rounded-[2rem] bg-zinc-50 ring-1 ring-zinc-100">
                        <ProductImageCarousel
                            productName={product.name}
                            frontImage={product.image_url}
                            backImage={product.backImage}
                            modelFrontImage={product.modelFrontImage}
                            modelSideImage={product.modelSideImage}
                            modelBackImage={product.modelBackImage}
                            modelCloseupImage={product.modelCloseupImage}
                        />
                    </div>
                </div>

                <div className="min-w-0 overflow-hidden">
                    <h1 className="mt-4 max-w-full break-words text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl md:text-6xl">
                        {product.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <p className="rounded-full bg-zinc-950 px-5 py-3 text-xl font-black text-white sm:text-2xl">
                            {isComingSoon
                                ? "Coming Soon"
                                : formatPrice(activePrice)}
                        </p>

                        <p className="rounded-full bg-zinc-100 px-5 py-3 text-xs font-black text-zinc-600 sm:text-sm">
                            {isComingSoon
                                ? "In Development"
                                : selectedSize
                                ? `${selectedSize} price`
                                : "Online Store"}
                        </p>
                    </div>

                    <p className="mt-6 max-w-xl break-words text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                        {product.description ||
                            (isComingSoon
                                ? "This product is still in development and will be available soon. You can view the details now, but ordering is disabled until launch."
                                : usesLengthSizing
                                ? "Select your preferred length below to check availability and add this product to your cart."
                                : "Premium apparel designed for comfort, movement and everyday performance. Select your size below to check availability and add this product to your cart.")}
                    </p>

                    <div className="mt-8 w-full rounded-[2rem] bg-zinc-50 p-4 ring-1 ring-zinc-100 sm:p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                    {isComingSoon ? "Availability" : usesLengthSizing ? "Select Length" : "Select Size"}
                                </p>

                                <h2 className="mt-1 text-xl font-black text-zinc-950 sm:text-2xl">
                                    {isComingSoon ? "Coming Soon" : usesLengthSizing ? "Choose your length" : "Choose your fit"}
                                </h2>
                            </div>

                            {inventoryLoading && !isComingSoon ? (
                                <p className="text-xs font-bold text-zinc-400">
                                    Checking stock...
                                </p>
                            ) : null}
                        </div>

                        {isComingSoon ? (
                            <p className="mb-4 rounded-2xl bg-[#6FC276]/10 px-4 py-3 text-sm font-bold text-[#2f7d37]">
                                This item is still in development. Sizes and checkout
                                will unlock when it launches.
                            </p>
                        ) : null}

                        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                            {sizeOptions.map((size) => {
                                const active = selectedSize === size;
                                const available =
                                    !isComingSoon && isSizeAvailable(size);
                                const sizeInventory = getSizeInventory(size);
                                const quantity = Number(
                                    sizeInventory?.quantity || 0
                                );
                                const rowPrice = toValidPrice(
                                    sizeInventory?.price
                                );
                                const displaySizePrice =
                                    rowPrice !== null ? rowPrice : basePrice;

                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        disabled={!available}
                                        onClick={() => {
                                            if (!available) return;

                                            setSelectedSize(size);

                                            if (!isMetricLengthSize(size)) {
                                                setMeasurementOpen(true);
                                            }
                                        }}
                                        className={`min-h-16 w-full rounded-2xl border px-2 py-2 text-xs font-black transition sm:min-h-20 sm:px-4 sm:text-sm ${
                                            active
                                                ? "border-[#6FC276] bg-[#6FC276] text-white shadow-md"
                                                : available
                                                ? "border-zinc-200 bg-white text-zinc-950 hover:border-[#6FC276]"
                                                : "cursor-not-allowed border-zinc-100 bg-zinc-100 text-zinc-400 line-through"
                                        }`}
                                    >
                                        <span>{size}</span>

                                        {available ? (
                                            <>
                                                <span className="mt-1 block text-[10px] font-bold opacity-80">
                                                    {formatPrice(displaySizePrice)}
                                                </span>

                                                <span className="mt-1 block text-[10px] font-bold opacity-70">
                                                    {quantity} left
                                                </span>
                                            </>
                                        ) : (
                                            <span className="mt-1 block text-[10px] font-bold no-underline">
                                                Sold out
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {!isComingSoon &&
                        !inventoryLoading &&
                        availableSizes.length === 0 ? (
                            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                                {usesLengthSizing
                                    ? "All lengths are currently sold out."
                                    : "This product is currently sold out."}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (!product) return;

                            const nextState = toggleWishlistProduct(product);
                            setIsWishlisted(nextState);
                        }}
                        className="mt-8 w-full rounded-full border border-zinc-200 bg-white px-6 py-4 text-sm font-black text-zinc-950 transition hover:bg-zinc-100"
                    >
                        {isWishlisted ? "♥ Saved to Wishlist" : "♡ Add to Wishlist"}
                    </button>

                    <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            disabled={!canAddToCart}
                            onClick={handleAddToCart}
                            className={`w-full rounded-full px-5 py-4 text-sm font-black text-white transition sm:px-6 sm:text-base ${
                                canAddToCart
                                    ? "bg-[#6FC276] hover:bg-zinc-950"
                                    : "cursor-not-allowed bg-zinc-300"
                            }`}
                        >
                            {isComingSoon
                                ? "Coming Soon"
                                : selectedSizeAvailable
                                ? `Add ${selectedSize} to Cart · ${formatPrice(
                                      activePrice
                                  )}`
                                : usesLengthSizing
                                ? "Select available length"
                                : "Select available size"}
                        </button>

                        <Link
                            href="/cart"
                            className="w-full rounded-full bg-zinc-100 px-5 py-4 text-center text-sm font-black text-zinc-950 transition hover:bg-zinc-200 sm:px-6 sm:text-base"
                        >
                            View Cart
                        </Link>
                    </div>

                    <div className="mt-8 w-full overflow-hidden rounded-[2rem] border border-zinc-100 p-4 sm:p-5">
                        <h3 className="text-base font-black text-zinc-950 sm:text-lg">
                            Product support
                        </h3>

                        <p className="mt-2 break-words text-sm leading-6 text-zinc-500">
                            Need help with sizing, stock or order support?
                            Contact Allwear before checkout for assistance.
                        </p>
                    </div>
                </div>
            </section>

            {similarProducts.length > 0 ? (
                <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:pb-16">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6FC276] sm:text-sm">
                                Similar Products
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl">
                                You may also like
                            </h2>
                        </div>

                        <Link
                            href="/shop"
                            className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            View All Products
                        </Link>
                    </div>

                    <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {similarProducts.map((item) => (
                            <ProductCard key={item.$id} item={item} />
                        ))}
                    </div>
                </section>
            ) : null}

            {!usesLengthSizing ? (
                <MeasurementSheet
                    open={measurementOpen}
                    size={selectedSize}
                    onClose={() => setMeasurementOpen(false)}
                />
            ) : null}

            {recentlyViewedProducts.length > 0 ? (
                <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:pb-16">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6FC276] sm:text-sm">
                                Recently Viewed
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl">
                                Pick up where you left off
                            </h2>
                        </div>

                        <Link
                            href="/shop"
                            className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Back to Shop
                        </Link>
                    </div>

                    <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {recentlyViewedProducts.map((item) => (
                            <ProductCard key={item.$id} item={item} />
                        ))}
                    </div>
                </section>
            ) : null}

            <Footer />
        </main>
    );
}
