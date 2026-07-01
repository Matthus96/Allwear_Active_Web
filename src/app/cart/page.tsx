"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { verifyCoupon } from "@/lib/appwrite";

const DELIVERY_FEE = 100.0;

export default function CartPage() {
    const items = useCartStore((s) => s.items ?? []);
    const totalPrice = useCartStore((s) => s.getTotalPrice());
    const totalItems = useCartStore((s) => s.getTotalItems());
    const clearCart = useCartStore((s) => s.clearCart);
    const increaseQty = useCartStore((s) => s.increaseQty);
    const decreaseQty = useCartStore((s) => s.decreaseQty);
    const removeItem = useCartStore((s) => s.removeItem);

    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);
    const hydrated = useAuthStore((state) => state.hydrated);

    const [couponCode, setCouponCode] = useState("");
    const [couponMessage, setCouponMessage] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [checkingCoupon, setCheckingCoupon] = useState(false);

    const [loading, setLoading] = useState(false);
    const lockRef = useRef(false);

    const subtotal = totalPrice;
    const deliveryFee = DELIVERY_FEE;
    const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

    const handleApplyCoupon = async () => {
        try {
            setCheckingCoupon(true);
            setCouponMessage("");

            const result = await verifyCoupon({
                code: couponCode,
                subtotal,
            });

            setCouponMessage(result.message);

            if (result.valid) {
                setAppliedCoupon(result.coupon);
                setCouponDiscount(result.discount);
            } else {
                setAppliedCoupon(null);
                setCouponDiscount(0);
            }
        } catch (error: any) {
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setCouponMessage(error?.message || "Could not verify coupon.");
        } finally {
            setCheckingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponMessage("");
        setCouponDiscount(0);
        setAppliedCoupon(null);
    };

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
                    couponCode: appliedCoupon?.code ?? null,
                    couponDiscount,
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
            <Navbar />

            <section className="relative w-full overflow-hidden bg-zinc-950 py-10 text-white sm:py-12 lg:py-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="site-container relative">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Allwear Hub Checkout
                    </p>

                    <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        Review your cart.
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Check your selected products, sizes and quantities
                        before continuing to secure payment.
                    </p>
                </div>
            </section>

            <section className="site-container py-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Cart Summary
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            {items.length > 0
                                ? `${totalItems} item${
                                      totalItems === 1 ? "" : "s"
                                  } in your cart`
                                : "Your cart is empty"}
                        </h2>
                    </div>

                    <Link
                        href="/shop"
                        className="w-fit rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-900 transition hover:bg-zinc-950 hover:text-white"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[3rem] border border-zinc-100 bg-zinc-50 p-8 text-center md:p-14">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Empty Cart
                        </p>

                        <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-5xl">
                            Nothing here yet.
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500">
                            Browse the Allwear Hub storefront and add products
                            to your cart before checking out.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-8 inline-flex rounded-full bg-[#6FC276] px-8 py-4 font-black text-white transition hover:bg-zinc-950"
                        >
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={`${item.productId}-${
                                        item.size ?? "default"
                                    }`}
                                    className="grid gap-4 rounded-[2rem] border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:grid-cols-[140px_1fr]"
                                >
                                    <div className="flex aspect-square w-full items-center justify-center rounded-[1.5rem] bg-zinc-50 p-4 sm:h-36 sm:w-36">
                                        <img
                                            src={item.stockSnapshot.image_url}
                                            alt={item.stockSnapshot.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-col justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                        Allwear Product
                                                    </p>

                                                    <h3 className="mt-1 line-clamp-2 text-lg font-black text-zinc-950">
                                                        {
                                                            item.stockSnapshot
                                                                .name
                                                        }
                                                    </h3>
                                                </div>

                                                <p className="shrink-0 text-lg font-black text-zinc-950">
                                                    R
                                                    {Number(
                                                        item.stockSnapshot
                                                            .price || 0
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-600">
                                                    Size:{" "}
                                                    {item.size ?? "default"}
                                                </span>

                                                <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-600">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex w-fit items-center rounded-full bg-zinc-100">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQty(
                                                            item.id,
                                                            item.size,
                                                            item.customizations
                                                        )
                                                    }
                                                    className="px-4 py-2 font-black text-zinc-950"
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-8 text-center font-black text-zinc-950">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        increaseQty(
                                                            item.id,
                                                            item.size,
                                                            item.customizations
                                                        )
                                                    }
                                                    className="px-4 py-2 font-black text-zinc-950"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id,
                                                        item.size,
                                                        item.customizations
                                                    )
                                                }
                                                className="w-fit text-sm font-black text-red-600"
                                            >
                                                Remove item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit rounded-[2rem] border border-zinc-100 bg-zinc-50 p-6 lg:sticky lg:top-28">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Payment Summary
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-zinc-950">
                                Order total
                            </h2>

                            <div className="mt-6 rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                                <h3 className="text-lg font-black text-zinc-950">
                                    Coupon Code
                                </h3>

                                <div className="mt-4 flex flex-col gap-3">
                                    <input
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(
                                                e.target.value.toUpperCase()
                                            );
                                            setCouponMessage("");
                                        }}
                                        placeholder="Enter coupon code"
                                        className="min-h-12 rounded-2xl border border-zinc-200 px-4 text-sm font-bold uppercase text-zinc-950 outline-none placeholder:text-zinc-400"
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={
                                                checkingCoupon || !couponCode
                                            }
                                            className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#6FC276] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {checkingCoupon
                                                ? "Checking..."
                                                : "Apply"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            disabled={!appliedCoupon}
                                            className="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-black uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {couponMessage ? (
                                    <p
                                        className={`mt-3 text-sm font-bold ${
                                            appliedCoupon
                                                ? "text-[#6FC276]"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {couponMessage}
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-5 space-y-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">
                                        Items ({totalItems})
                                    </span>
                                    <span className="font-black text-zinc-950">
                                        R{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">
                                        Delivery
                                    </span>
                                    <span className="font-black text-zinc-950">
                                        R{deliveryFee.toFixed(2)}
                                    </span>
                                </div>

                                {couponDiscount > 0 ? (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">
                                            Coupon{" "}
                                            {appliedCoupon?.code
                                                ? `(${appliedCoupon.code})`
                                                : ""}
                                        </span>
                                        <span className="font-black text-[#6FC276]">
                                            -R{couponDiscount.toFixed(2)}
                                        </span>
                                    </div>
                                ) : null}

                                <div className="border-t border-zinc-200 pt-4">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-black text-zinc-950">
                                            Total
                                        </span>
                                        <span className="font-black text-zinc-950">
                                            R{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayNow}
                                disabled={loading}
                                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#6FC276] px-6 py-4 font-black text-white transition hover:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Pay Now"}
                            </button>

                            <Link
                                href="/checkout"
                                className="mt-3 flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-4 font-black text-white transition hover:bg-[#6FC276]"
                            >
                                Continue to Delivery
                            </Link>

                            <button
                                type="button"
                                onClick={clearCart}
                                className="mt-3 w-full rounded-full bg-white px-6 py-4 font-black text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-100"
                            >
                                Clear Cart
                            </button>

                            <div className="mt-5 rounded-[1.5rem] bg-white p-5 text-sm leading-6 text-zinc-500 ring-1 ring-zinc-100">
                                Secure payment will open after you confirm your
                                cart. Delivery is charged at a flat rate of{" "}
                                <span className="font-black text-zinc-950">
                                    R100.00
                                </span>
                                .
                            </div>
                        </aside>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}