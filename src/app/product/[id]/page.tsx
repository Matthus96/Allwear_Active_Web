"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import CartButton from "@/components/CartButton";
import MeasurementSheet from "@/components/MeasurementSheet";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
    getMenuById,
    getProductInventory,
    type Product,
    type ProductInventory,
} from "@/lib/appwrite";

import { useCartStore } from "@/store/cart.store";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const productId = params.id;

    const addItem = useCartStore((state) => state.addItem);

    const [product, setProduct] = useState<Product | null>(null);
    const [inventory, setInventory] = useState<ProductInventory[]>([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [measurementOpen, setMeasurementOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setInventoryLoading(true);
                setError(null);

                const productData = await getMenuById({ id: productId });
                setProduct(productData as Product);

                const inventoryData = await getProductInventory(productId);
                setInventory(inventoryData);
            } catch (e: any) {
                setError(e?.message || "Could not load product.");
            } finally {
                setLoading(false);
                setInventoryLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const getSizeInventory = (size: string) => {
        return inventory.find(
            (item) =>
                String(item.size || "")
                    .trim()
                    .toUpperCase() === size.toUpperCase()
        );
    };

    const isSizeAvailable = (size: string) => {
        const sizeInventory = getSizeInventory(size);

        if (!sizeInventory) return false;

        const quantity = Number(sizeInventory.quantity || 0);

        if (sizeInventory.available === false) {
            return false;
        }

        return quantity > 0;
    };

    const availableSizes = useMemo(() => {
        return SIZES.filter((size) => isSizeAvailable(size));
    }, [inventory]);

    useEffect(() => {
        if (!selectedSize && availableSizes.length > 0) {
            setSelectedSize(availableSizes[0]);
        }

        if (selectedSize && !isSizeAvailable(selectedSize)) {
            setSelectedSize(availableSizes[0] || "");
        }
    }, [availableSizes, selectedSize]);

    const selectedSizeAvailable = selectedSize
        ? isSizeAvailable(selectedSize)
        : false;

    const handleAddToCart = () => {
        if (!product) return;

        if (!selectedSize) {
            alert("Please select a size.");
            return;
        }

        if (!isSizeAvailable(selectedSize)) {
            alert("This size is currently sold out.");
            return;
        }

        addItem({
            id: `${product.$id}-${selectedSize}`,
            productId: product.$id,
            size: selectedSize,
            quantity: 1,
            stockSnapshot: {
                name: product.name ?? "Unknown item",
                price: product.price ?? 0,
                image_url: product.image_url ?? "",
            },
        });

        alert("Added to cart");
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-2">
                    <div className="aspect-square animate-pulse rounded-[3rem] bg-zinc-100" />

                    <div className="flex flex-col justify-center">
                        <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
                        <div className="mt-5 h-16 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
                        <div className="mt-5 h-8 w-40 animate-pulse rounded bg-zinc-100" />
                        <div className="mt-8 h-28 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
                    </div>
                </section>

                <Footer />
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="flex min-h-[70vh] items-center justify-center px-5">
                    <div className="max-w-xl rounded-[2rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Product Error
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-zinc-950">
                            Product not found
                        </h1>

                        <p className="mt-3 text-zinc-500">
                            {error || "This product could not be loaded."}
                        </p>

                        <Link
                            href="/shop"
                            className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
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
        <main className="min-h-screen bg-white">
            <Navbar />

                <section className="bg-zinc-950 px-5 py-5 text-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                        <Link
                            href="/shop"
                            className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white hover:text-zinc-950"
                        >
                            ← Back to Shop
                        </Link>

                        <p className="hidden text-sm font-black uppercase tracking-[0.2em] text-[#6FC276] sm:block">
                            Product Details
                        </p>
                    </div>
                </section>

            <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
                <div>
                    <div className="overflow-hidden rounded-[3rem] bg-zinc-50 ring-1 ring-zinc-100">
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

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Delivery
                            </p>
                            <p className="mt-2 text-sm font-bold text-zinc-700">
                                Flat R100.00 delivery
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Stock
                            </p>
                            <p className="mt-2 text-sm font-bold text-zinc-700">
                                Size-based availability
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Fit
                            </p>
                            <p className="mt-2 text-sm font-bold text-zinc-700">
                                Measurement guide included
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Allwear Hub Product
                    </p>

                    <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-zinc-950 md:text-6xl">
                        {product.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <p className="rounded-full bg-zinc-950 px-5 py-3 text-2xl font-black text-white">
                            R{Number(product.price || 0).toFixed(2)}
                        </p>

                        <p className="rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-600">
                            Online Store
                        </p>
                    </div>

                    {product.description ? (
                        <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600">
                            {product.description}
                        </p>
                    ) : (
                        <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600">
                            Premium apparel designed for comfort, movement and
                            everyday performance. Select your size below to
                            check availability and add this product to your cart.
                        </p>
                    )}

                    <div className="mt-8 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
                                    Select Size
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-zinc-950">
                                    Choose your fit
                                </h2>
                            </div>

                            {inventoryLoading ? (
                                <p className="text-xs font-bold text-zinc-400">
                                    Checking stock...
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {SIZES.map((size) => {
                                const active = selectedSize === size;
                                const available = isSizeAvailable(size);
                                const sizeInventory = getSizeInventory(size);
                                const quantity = Number(
                                    sizeInventory?.quantity || 0
                                );

                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        disabled={!available}
                                        onClick={() => {
                                            if (!available) return;

                                            setSelectedSize(size);
                                            setMeasurementOpen(true);
                                        }}
                                        className={`min-h-16 min-w-16 rounded-2xl border px-4 py-2 text-sm font-black transition ${
                                            active
                                                ? "border-[#6FC276] bg-[#6FC276] text-white shadow-md"
                                                : available
                                                ? "border-zinc-200 bg-white text-zinc-950 hover:border-[#6FC276]"
                                                : "cursor-not-allowed border-zinc-100 bg-zinc-100 text-zinc-400 line-through"
                                        }`}
                                    >
                                        <span>{size}</span>

                                        {available ? (
                                            <span className="mt-1 block text-[10px] font-bold opacity-70">
                                                {quantity} left
                                            </span>
                                        ) : (
                                            <span className="mt-1 block text-[10px] font-bold no-underline">
                                                Sold out
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {!inventoryLoading && availableSizes.length === 0 ? (
                            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                                This product is currently sold out.
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            disabled={!selectedSizeAvailable}
                            onClick={handleAddToCart}
                            className={`rounded-full px-8 py-4 font-black text-white transition ${
                                selectedSizeAvailable
                                    ? "bg-[#6FC276] hover:bg-zinc-950"
                                    : "cursor-not-allowed bg-zinc-300"
                            }`}
                        >
                            {selectedSizeAvailable
                                ? `Add ${selectedSize} to Cart +`
                                : "Select available size"}
                        </button>

                        <Link
                            href="/cart"
                            className="rounded-full bg-zinc-100 px-8 py-4 text-center font-black text-zinc-950 transition hover:bg-zinc-200"
                        >
                            View Cart
                        </Link>
                    </div>

                    <div className="mt-8 rounded-[2rem] border border-zinc-100 p-5">
                        <h3 className="text-lg font-black text-zinc-950">
                            Product support
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Need help with sizing, stock or order support?
                            Contact Allwear before checkout for assistance.
                        </p>
                    </div>
                </div>
            </section>

            <MeasurementSheet
                open={measurementOpen}
                size={selectedSize}
                onClose={() => setMeasurementOpen(false)}
            />

            <Footer />
        </main>
    );
}