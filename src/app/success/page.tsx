"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCartStore } from "@/store/cart.store";
import { createOrder } from "@/lib/appwrite";
import { useAuthStore } from "@/store/auth.store";

const VERIFY_URL = "/api/paystack/verify";
const DELIVERY_FEE = 100;

function SuccessContent() {
    const searchParams = useSearchParams();
    const hasVerifiedRef = useRef(false);

    const clearCart = useCartStore((s) => s.clearCart);
    const addOrder = useCartStore((s) => s.addOrder);
    const pendingPayment = useCartStore((s) => s.pendingPayment);
    const clearPendingPayment = useCartStore((s) => s.clearPendingPayment);

    const user = useAuthStore((state) => state.user);
    const authHydrated = useAuthStore((state) => state.hydrated);

    const [status, setStatus] = useState<
        "checking" | "success" | "failed"
    >("checking");

    const [message, setMessage] = useState("Verifying your payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (hasVerifiedRef.current) return;

                if (!authHydrated) return;

                hasVerifiedRef.current = true;

                const reference =
                    searchParams.get("reference") ||
                    searchParams.get("trxref") ||
                    pendingPayment?.reference;

                if (!reference) {
                    setStatus("failed");
                    setMessage("No payment reference found.");
                    return;
                }

                const items = pendingPayment?.items ?? [];
                const total = pendingPayment?.totalPrice ?? 0;

                if (!items.length || total <= 0) {
                    setStatus("failed");
                    setMessage(
                        "Payment was verified, but your order details were not found. Please contact Allwear with your payment reference."
                    );
                    return;
                }

                const verifyUrl = `${VERIFY_URL}?reference=${encodeURIComponent(
                    reference
                )}`;

                const verifyRes = await fetch(verifyUrl);
                const verifyText = await verifyRes.text();

                let verifyData: any = {};

                try {
                    verifyData = verifyText ? JSON.parse(verifyText) : {};
                } catch {
                    throw new Error(
                        "Verification route did not return valid JSON."
                    );
                }

                if (!verifyRes.ok) {
                    throw new Error(
                        verifyData?.message ||
                            `Verification failed with status ${verifyRes.status}`
                    );
                }

                const success =
                    verifyData?.success === true ||
                    verifyData?.status === true ||
                    verifyData?.data?.status === "success";

                if (!success) {
                    setStatus("failed");
                    setMessage("Payment could not be confirmed.");
                    return;
                }

                const quantity = items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );

                const orderUserId = user?.accountId ?? user?.$id;
                const orderEmail = user?.email;

                if (!orderUserId || !orderEmail) {
                    setStatus("failed");
                    setMessage(
                        "Payment was confirmed, but we could not find your logged-in account to save the order."
                    );
                    return;
                }

                let deliveryDetails: any = null;

                if (typeof window !== "undefined") {
                    const storedDeliveryDetails = sessionStorage.getItem(
                        "allwear_delivery_details"
                    );

                    if (storedDeliveryDetails) {
                        try {
                            deliveryDetails = JSON.parse(
                                storedDeliveryDetails
                            );
                        } catch {
                            deliveryDetails = storedDeliveryDetails;
                        }
                    }
                }

                await createOrder({
                    reference,
                    email: orderEmail,
                    accountId: orderUserId,
                    userId: orderUserId,

                    items: JSON.stringify(items),
                    total,

                    status: "order_placed",
                    trackingStatus: "order_placed",

                    paidAt: new Date().toISOString(),

                    gateway_response: JSON.stringify({
                        provider: "paystack",
                        reference,
                        status: verifyData?.data?.status ?? verifyData?.status,
                        amount: verifyData?.data?.amount ?? verifyData?.amount,
                        currency:
                            verifyData?.data?.currency ?? verifyData?.currency,
                        subtotal: Math.max(total - DELIVERY_FEE, 0),
                        deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
                        deliveryDetails,
                    }),

                    distributorId: "6a3502a1001eae91ffd9",
                    distributorName: "Allwear HQ",
                });

                addOrder({
                    id: reference,
                    items,
                    subtotal: Math.max(total - DELIVERY_FEE, 0),
                    deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
                    total,
                    date: new Date().toISOString(),
                    quantity,
                });

                clearCart();
                clearPendingPayment();

                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("allwear_delivery_details");
                }

                setStatus("success");
                setMessage("Payment confirmed. Your order has been placed.");
            } catch (error: any) {
                console.log("SUCCESS PAGE ERROR:", error);

                setStatus("failed");
                setMessage(
                    error?.message ||
                        "Something went wrong while verifying payment."
                );
            }
        };

        verifyPayment();
    }, [
        authHydrated,
        user,
        searchParams,
        pendingPayment,
        addOrder,
        clearCart,
        clearPendingPayment,
    ]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-5">
            <div className="w-full max-w-lg rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center">
                <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                        status === "success"
                            ? "bg-[#6FC276] text-white"
                            : status === "failed"
                            ? "bg-red-100 text-red-600"
                            : "bg-zinc-200 text-zinc-600"
                    }`}
                >
                    {status === "success"
                        ? "✓"
                        : status === "failed"
                        ? "!"
                        : "..."}
                </div>

                <h1 className="text-3xl font-black text-zinc-950">
                    {status === "success"
                        ? "Order Placed"
                        : status === "failed"
                        ? "Payment Issue"
                        : "Checking Payment"}
                </h1>

                <p className="mt-3 text-zinc-600">{message}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/shop"
                        className="rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
                    >
                        Continue Shopping
                    </Link>

                    <Link
                        href="/orders"
                        className="rounded-full bg-white px-6 py-3 font-black text-zinc-950 ring-1 ring-zinc-200"
                    >
                        View Orders
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-white">
                    <p className="font-bold text-zinc-500">
                        Verifying payment...
                    </p>
                </main>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}