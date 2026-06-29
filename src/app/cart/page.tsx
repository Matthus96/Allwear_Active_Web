"use client";

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";

import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

const INIT_URL = "https://6a0d6117002dd75f9543.nyc.appwrite.run";
const VERIFY_URL = "https://6a0d7486003a70759065.nyc.appwrite.run";

const DELIVERY_FEE = 100.0;

export default function CartPage() {
    const items = useCartStore((s) => s.items ?? []);
    const totalPrice = useCartStore((s) => s.getTotalPrice());
    const totalItems = useCartStore((s) => s.getTotalItems());
    const clearCart = useCartStore((s) => s.clearCart);
    const addOrder = useCartStore((s) => s.addOrder);
    const increaseQty = useCartStore((s) => s.increaseQty);
    const decreaseQty = useCartStore((s) => s.decreaseQty);
    const removeItem = useCartStore((s) => s.removeItem);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);
    const hydrated = useAuthStore((state) => state.hydrated);

    const [loading, setLoading] = useState(false);
    const lockRef = useRef(false);

    const subtotal = totalPrice;
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
    const finalTotal = subtotal + deliveryFee;

    const handlePayNow = async () => {
    if (loading || lockRef.current) return;

    lockRef.current = true;
    setLoading(true);

    try {
        if (!items.length) {
            alert("Cart is empty");
            return;
        }

        if (!hydrated || authLoading) {
            alert("Checking your account. Please try again in a moment.");
            return;
        }

        if (!user?.email || !user?.$id) {
            router.push("/login?redirect=/cart");
            return;
        }

        const initRes = await fetch("/api/paystack/init", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
                userId: user.$id,
                amount: finalTotal,
                items,
                subtotal,
                deliveryFee,
            }),
        });

        const initData = await initRes.json();

        if (!initRes.ok || !initData?.authorization_url) {
            throw new Error(initData?.message || "Payment init failed");
        }

        useCartStore.getState().setPendingPayment({
            reference: initData.reference,
            items,
            totalPrice: finalTotal,
        });

        window.location.href = initData.authorization_url;
    } catch (error: any) {
        alert(error?.message || "Something went wrong.");
    } finally {
        setLoading(false);
        lockRef.current = false;
    }
};

    return (
        <main className="min-h-screen bg-white">
            <section className="mx-auto max-w-5xl px-5 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-[#6FC276]">
                            Cart
                        </p>
                        <h1 className="text-3xl font-black text-zinc-950">
                            Your order
                        </h1>
                    </div>

                    <Link
                        href="/shop"
                        className="rounded-full bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-900"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-10 text-center">
                        <h2 className="text-xl font-black text-zinc-950">
                            Your cart is empty
                        </h2>
                        <p className="mt-2 text-zinc-500">
                            Add some products before checking out.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
                        >
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={`${item.productId}-${item.size ?? "default"}`}
                                    className="flex gap-4 rounded-3xl border border-zinc-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 p-3">
                                        <img
                                            src={
                                                item.stockSnapshot.image_url
                                            }
                                            alt={item.stockSnapshot.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="font-black text-zinc-950">
                                                {
                                                    item.stockSnapshot
                                                        .name
                                                }
                                            </h3>

                                            <p className="mt-1 text-sm text-zinc-500">
                                                Size:{" "}
                                                {item.size ?? "default"}
                                            </p>

                                            <p className="mt-1 font-bold text-zinc-900">
                                                R
                                                {Number(
                                                    item.stockSnapshot
                                                        .price || 0
                                                ).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center rounded-full bg-zinc-100">
                                                <button
                                                    onClick={() =>
                                                        decreaseQty(
                                                            item.id,
                                                            item.size,
                                                            item.customizations
                                                        )
                                                    }
                                                    className="px-4 py-2 font-black"
                                                >
                                                    -
                                                </button>

                                                <span className="min-w-8 text-center font-bold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQty(
                                                            item.id,
                                                            item.size,
                                                            item.customizations
                                                        )
                                                    }
                                                    className="px-4 py-2 font-black"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeItem(
                                                        item.id,
                                                        item.size,
                                                        item.customizations
                                                    )
                                                }
                                                className="text-sm font-bold text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit rounded-3xl border border-zinc-100 bg-zinc-50 p-6">
                            <h2 className="text-lg font-black text-zinc-950">
                                Payment Summary
                            </h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">
                                        Items ({totalItems})
                                    </span>
                                    <span className="font-bold">
                                        R{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">
                                        Delivery
                                    </span>
                                    <span className="font-bold">
                                        R{deliveryFee.toFixed(2)}
                                    </span>
                                </div>

                                <div className="border-t border-zinc-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-black">
                                            Total
                                        </span>
                                        <span className="font-black">
                                            R{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayNow}
                                disabled={loading}
                                className="mt-6 w-full rounded-full bg-[#6FC276] px-6 py-4 font-black text-white disabled:opacity-60"
                            >
                                {loading ? "Processing..." : "Pay Now"}
                            </button>

                            <button
                                onClick={clearCart}
                                className="mt-3 w-full rounded-full bg-white px-6 py-4 font-bold text-zinc-700"
                            >
                                Clear Cart
                            </button>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}