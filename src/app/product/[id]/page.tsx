"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import CartButton from "@/components/CartButton";
import { getMenuById, type Product } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import ProductImageCarousel from "@/components/ProductImageCarousel";

const SIZES = ["S", "M", "L", "XL", "2XL"];

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const productId = params.id;

    const addItem = useCartStore((state) => state.addItem);

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState("M");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getMenuById({ id: productId });
                setProduct(data as unknown as Product);
            } catch (e: any) {
                setError(e?.message || "Could not load product.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: product.$id,
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
                <p className="font-bold text-zinc-500">
                    Loading product...
                </p>
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
                        <Link href="/" className="text-2xl font-black tracking-tight text-zinc-950">
                            <img src="/images/Logo.png" alt="Allwear Logo" className="h-15 w-auto" />
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
                            <p className="mb-3 text-sm font-black text-zinc-950">
                                Select Size
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() =>
                                            setSelectedSize(size)
                                        }
                                        className={`h-12 min-w-12 rounded-full px-5 text-sm font-black ${
                                            selectedSize === size
                                                ? "bg-[#6FC276] text-white"
                                                : "bg-zinc-100 text-zinc-950"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={handleAddToCart}
                                className="rounded-full bg-[#6FC276] px-8 py-4 font-black text-white"
                            >
                                Add to Cart +
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
        </main>
    );
}
