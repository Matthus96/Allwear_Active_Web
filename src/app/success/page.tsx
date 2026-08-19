"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCartStore } from "@/store/cart.store";

const VERIFY_URL = "/api/paystack/verify";
const DELIVERY_FEE = 100;

type FulfilmentMethod = "delivery" | "collection";
type SuccessStatus = "checking" | "success" | "failed";

const numberValue = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

function SuccessContent() {
    const searchParams = useSearchParams();
    const hasVerifiedRef = useRef(false);

    const clearCart = useCartStore((state) => state.clearCart);
    const addOrder = useCartStore((state) => state.addOrder);
    const pendingPayment = useCartStore((state) => state.pendingPayment);
    const clearPendingPayment = useCartStore(
        (state) => state.clearPendingPayment
    );

    const [status, setStatus] = useState<SuccessStatus>("checking");
    const [message, setMessage] = useState("Verifying your payment...");
    const [completedFulfilmentMethod, setCompletedFulfilmentMethod] =
        useState<FulfilmentMethod | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            if (hasVerifiedRef.current) return;

            const reference =
                searchParams.get("reference") ||
                searchParams.get("trxref") ||
                pendingPayment?.reference;

            if (!reference) {
                setStatus("failed");
                setMessage("No payment reference found.");
                return;
            }

            hasVerifiedRef.current = true;

            try {
                const verifyUrl = `${VERIFY_URL}?reference=${encodeURIComponent(
                    reference
                )}`;

                const verifyRes = await fetch(verifyUrl, {
                    cache: "no-store",
                });
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

                const paymentSuccessful =
                    verifyData?.success === true ||
                    verifyData?.data?.status === "success";

                if (!paymentSuccessful) {
                    setStatus("failed");
                    setMessage("Payment could not be confirmed.");
                    return;
                }

                const transaction = verifyData?.data ?? {};
                const metadata = transaction?.metadata ?? {};

                // Paystack metadata is now the source of truth. Browser state
                // remains only a fallback for local order-history convenience.
                const metadataItems = Array.isArray(metadata?.items)
                    ? metadata.items
                    : [];
                const items =
                    metadataItems.length > 0
                        ? metadataItems
                        : pendingPayment?.items ?? [];

                const fulfilmentMethod: FulfilmentMethod =
                    metadata?.fulfilmentMethod === "collection"
                        ? "collection"
                        : "delivery";

                const deliveryFee = numberValue(
                    metadata?.deliveryFee,
                    fulfilmentMethod === "collection" ? 0 : DELIVERY_FEE
                );
                const totalFromPaystack = numberValue(transaction?.amount) / 100;
                const total =
                    totalFromPaystack > 0
                        ? totalFromPaystack
                        : numberValue(pendingPayment?.totalPrice);
                const subtotal = numberValue(
                    metadata?.subtotal,
                    Math.max(total - deliveryFee, 0)
                );
                const quantity = items.reduce(
                    (sum: number, item: any) =>
                        sum + Math.max(0, numberValue(item?.quantity)),
                    0
                );

                if (items.length > 0) {
                    addOrder({
                        id: reference,
                        items,
                        subtotal,
                        deliveryFee,
                        total,
                        date:
                            transaction?.paid_at ||
                            transaction?.paidAt ||
                            new Date().toISOString(),
                        quantity,
                    });
                }

                clearCart();
                clearPendingPayment();

                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("allwear_fulfilment_details");
                    sessionStorage.removeItem("allwear_delivery_details");
                    localStorage.removeItem("allwear_coupon");
                }

                setCompletedFulfilmentMethod(fulfilmentMethod);
                setStatus("success");
                setMessage(
                    fulfilmentMethod === "collection"
                        ? "Payment confirmed. Your order has been placed for collection."
                        : "Payment confirmed. Your order has been placed for delivery."
                );
            } catch (error: any) {
                console.error("SUCCESS PAGE ERROR:", error);
                setStatus("failed");
                setMessage(
                    error?.message ||
                        "Something went wrong while verifying payment."
                );
            }
        };

        verifyPayment();
    }, [
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

                {status === "success" &&
                completedFulfilmentMethod === "collection" ? (
                    <div className="mt-6 rounded-2xl bg-white p-5 text-left ring-1 ring-zinc-100">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Collection Point
                        </p>
                        <p className="mt-2 text-lg font-black text-zinc-950">
                            Allwear Factory Shop
                        </p>
                        <p className="mt-3 text-sm font-bold leading-6 text-zinc-600">
                            55 Albert Wessels Drive
                            <br />
                            Riverside Industrial
                            <br />
                            Newcastle
                        </p>
                    </div>
                ) : null}

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
