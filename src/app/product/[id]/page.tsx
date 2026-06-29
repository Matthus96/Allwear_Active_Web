"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import CartButton from "@/components/CartButton";
import MeasurementSheet from "@/components/MeasurementSheet";
import ProductImageCarousel from "@/components/ProductImageCarousel";

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
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="font-bold text-zinc-500">Loading product...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white px-5">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-zinc-950">
                        Product not found
                    </h1>

                    <p className="mt-2 text-zinc-500">
                        {error || "This product could not be loaded."}
                    </p>

                    <Link
                        href="/shop"
                        className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
                    >
                        Back to Shop
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="mx-auto max-w-7xl px-5 py-8">
                <header className="mb-8 flex items-center justify-between">
                    <Link
                        href="/shop"
                        className="rounded-full bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-900"
                    >
                        ← Back to Shop
                    </Link>

                    <CartButton />
                </header>

                <div className="grid gap-10 lg:grid-cols-2">
                    <ProductImageCarousel
                        productName={product.name}
                        frontImage={product.image_url}
                        backImage={product.backImage}
                        modelFrontImage={product.modelFrontImage}
                        modelSideImage={product.modelSideImage}
                        modelBackImage={product.modelBackImage}
                        modelCloseupImage={product.modelCloseupImage}
                    />

                    <div className="flex flex-col justify-center">
                        <Link href="/" className="inline-flex items-center">
                            <img
                                src="/images/Logo.png"
                                alt="Allwear Logo"
                                className="h-auto w-[180px] max-w-[65vw] object-contain sm:w-[240px] lg:w-[320px]"
                            />
                        </Link>

                        <h1 className="mt-3 text-4xl font-black leading-tight text-zinc-950 md:text-6xl">
                            {product.name}
                        </h1>

                        <p className="mt-5 text-3xl font-black text-zinc-950">
                            R{Number(product.price || 0).toFixed(2)}
                        </p>

                        {product.description ? (
                            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600">
                                {product.description}
                            </p>
                        ) : (
                            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600">
                                Premium activewear designed for comfort,
                                movement and everyday performance.
                            </p>
                        )}

                        <div className="mt-8">
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <p className="text-sm font-black text-zinc-950">
                                    Select Size
                                </p>

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
                                    const sizeInventory =
                                        getSizeInventory(size);
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
                                            className={`min-h-14 min-w-16 rounded-2xl border px-4 py-2 text-sm font-black transition ${
                                                active
                                                    ? "border-[#6FC276] bg-[#6FC276] text-white"
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
                                <p className="mt-3 text-sm font-bold text-red-600">
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
                                    ? "Add to Cart +"
                                    : "Select available size"}
                            </button>

                            <Link
                                href="/cart"
                                className="rounded-full bg-zinc-100 px-8 py-4 text-center font-black text-zinc-950"
                            >
                                View Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <MeasurementSheet
                open={measurementOpen}
                size={selectedSize}
                onClose={() => setMeasurementOpen(false)}
            />
        </main>
    );
}