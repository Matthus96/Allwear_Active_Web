"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart.store";

const VERIFY_URL = "https://6a0d7486003a70759065.nyc.appwrite.run";

export default function SuccessPage() {
    const searchParams = useSearchParams();

    const clearCart = useCartStore((s) => s.clearCart);
    const addOrder = useCartStore((s) => s.addOrder);
    const pendingPayment = useCartStore((s) => s.pendingPayment);
    const clearPendingPayment = useCartStore((s) => s.clearPendingPayment);

    const [status, setStatus] = useState<
        "checking" | "success" | "failed"
    >("checking");

    const [message, setMessage] = useState("Verifying your payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const reference =
                    searchParams.get("reference") ||
                    searchParams.get("trxref") ||
                    pendingPayment?.reference;

                if (!reference) {
                    setStatus("failed");
                    setMessage("No payment reference found.");
                    return;
                }

                const verifyRes = await fetch(
                    `${VERIFY_URL}?reference=${reference}`
                );

                const verifyData = await verifyRes.json();

                const success =
                    verifyData?.success === true ||
                    verifyData?.status === true ||
                    verifyData?.data?.status === "success";

                if (!success) {
                    setStatus("failed");
                    setMessage("Payment could not be confirmed.");
                    return;
                }

                const items = pendingPayment?.items ?? [];
                const total = pendingPayment?.totalPrice ?? 0;

                const quantity = items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );

                addOrder({
                    id: reference,
                    items,
                    subtotal: Math.max(total - 100, 0),
                    deliveryFee: items.length > 0 ? 100 : 0,
                    total,
                    date: new Date().toISOString(),
                    quantity,
                });

                clearCart();
                clearPendingPayment();

                setStatus("success");
                setMessage("Payment confirmed. Your order has been placed.");
            } catch (error: any) {
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

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/shop"
                        className="rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
                    >
                        Continue Shopping
                    </Link>

                    <Link
                        href="/cart"
                        className="rounded-full bg-white px-6 py-3 font-black text-zinc-950"
                    >
                        View Cart
                    </Link>
                </div>
            </div>
        </main>
    );
}