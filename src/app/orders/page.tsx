"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUserOrders } from "@/lib/appwrite";
import { useAuthStore } from "@/store/auth.store";

type OrderDoc = {
    $id: string;
    reference?: string;
    email?: string;
    items?: string;
    total?: number;

    accountId?: string;
    userId?: string;

    status?: string;
    trackingStatus?: string;

    paidAt?: string;
    gateway_response?: string;

    distributorId?: string;
    distributorName?: string;

    confirmedAt?: string;
    preparingAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;

    $createdAt?: string;
};

type ParsedOrderItem = {
    productId?: string;
    id?: string;
    size?: string;
    quantity?: number;

    name?: string;
    title?: string;
    productName?: string;
    itemName?: string;

    price?: number;
    productPrice?: number;
    totalPrice?: number;
    amount?: number;

    stockSnapshot?: {
        name?: string;
        price?: number;
        image_url?: string;
    };
};

const formatStatus = (status?: string) => {
    if (!status) return "Order placed";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (value?: number) => {
    return `R${Number(value || 0).toFixed(2)}`;
};

const isPaymentFailed = (order: OrderDoc) => {
    const status = order.status?.toLowerCase();
    const trackingStatus = order.trackingStatus?.toLowerCase();

    return status === "payment_failed" || trackingStatus === "payment_failed";
};

const isPaymentSuccessful = (order: OrderDoc) => {
    const status = order.status?.toLowerCase();
    const trackingStatus = order.trackingStatus?.toLowerCase();

    return (
        status === "paid" ||
        status === "order_placed" ||
        trackingStatus === "order_placed" ||
        trackingStatus === "confirmed" ||
        trackingStatus === "preparing" ||
        trackingStatus === "out_for_delivery" ||
        trackingStatus === "delivered"
    );
};

const getPaymentLabel = (order: OrderDoc) => {
    if (isPaymentFailed(order)) return "Payment failed";
    if (isPaymentSuccessful(order)) return "Paid";
    return formatStatus(order.status);
};

const getTrackingStatus = (order: OrderDoc) => {
    if (!order.trackingStatus || order.trackingStatus === "payment_failed") {
        return "order_placed";
    }

    return order.trackingStatus;
};

const trackingSteps = [
    {
        key: "order_placed",
        label: "Order placed",
        dateField: "$createdAt",
    },
    {
        key: "confirmed",
        label: "Confirmed",
        dateField: "confirmedAt",
    },
    {
        key: "preparing",
        label: "Preparing",
        dateField: "preparingAt",
    },
    {
        key: "out_for_delivery",
        label: "Out for delivery",
        dateField: "outForDeliveryAt",
    },
    {
        key: "delivered",
        label: "Delivered",
        dateField: "deliveredAt",
    },
];

const getTrackingIndex = (trackingStatus?: string) => {
    const index = trackingSteps.findIndex(
        (step) => step.key === trackingStatus
    );

    return index >= 0 ? index : 0;
};

const getTrackingDate = (order: OrderDoc, dateField: string) => {
    const value = order[dateField as keyof OrderDoc];

    if (!value || typeof value !== "string") {
        return "";
    }

    return new Date(value).toLocaleString();
};

const getItemName = (item: ParsedOrderItem) => {
    return (
        item.stockSnapshot?.name ||
        item.name ||
        item.productName ||
        item.itemName ||
        item.title ||
        "Product"
    );
};

const getItemQuantity = (item: ParsedOrderItem) => {
    return Number(item.quantity || 1);
};

const getItemUnitPrice = (item: ParsedOrderItem) => {
    const quantity = getItemQuantity(item);

    const directUnitPrice =
        item.stockSnapshot?.price ??
        item.price ??
        item.productPrice ??
        item.amount;

    if (directUnitPrice !== undefined && directUnitPrice !== null) {
        return Number(directUnitPrice);
    }

    if (item.totalPrice !== undefined && item.totalPrice !== null) {
        return Number(item.totalPrice) / quantity;
    }

    return 0;
};

const parseItems = (items?: string): ParsedOrderItem[] => {
    if (!items) return [];

    try {
        const parsed = JSON.parse(items);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (Array.isArray(parsed.items)) {
            return parsed.items;
        }

        if (Array.isArray(parsed.cartItems)) {
            return parsed.cartItems;
        }

        return [];
    } catch {
        return [];
    }
};

export default function OrdersPage() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const hydrated = useAuthStore((state) => state.hydrated);

    const [orders, setOrders] = useState<OrderDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!hydrated) return;

        if (!user?.$id) {
            router.push("/login?redirect=/orders");
            return;
        }

        let cancelled = false;

        const loadOrders = async (showLoader = false) => {
            try {
                if (showLoader) {
                    setLoading(true);
                }

                setError("");

                const data = await getUserOrders({
                    accountId: user.accountId,
                    userId: user.$id,
                    email: user.email,
                });

                if (!cancelled) {
                    setOrders(data as unknown as OrderDoc[]);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message || "Could not load orders.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadOrders(true);

        const interval = window.setInterval(() => {
            loadOrders(false);
        }, 10000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadOrders(false);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [hydrated, user, router]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-zinc-950 px-6 py-20 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Account
                    </p>

                    <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
                        My Orders
                    </h1>

                    <p className="mt-5 max-w-2xl text-zinc-300">
                        View your previous Allwear Active orders and payment
                        status.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 py-12">
                {loading ? (
                    <p className="font-bold text-zinc-500">
                        Loading your orders...
                    </p>
                ) : error ? (
                    <div className="rounded-3xl bg-red-50 p-6 text-red-600">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-3xl bg-zinc-50 p-10 text-center">
                        <h2 className="text-2xl font-black text-zinc-950">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-zinc-500">
                            Your order history will appear here after checkout.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 font-black text-white"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => {
                            const parsedItems = parseItems(order.items);
                            const orderDate =
                                order.paidAt || order.$createdAt || "";
                            const paymentFailed = isPaymentFailed(order);
                            const trackingStatus = getTrackingStatus(order);

                            return (
                                <div
                                    key={order.$id}
                                    className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                Order
                                            </p>

                                            <h2 className="mt-2 text-xl font-black text-zinc-950">
                                                {order.reference || order.$id}
                                            </h2>

                                            <p className="mt-2 text-sm text-zinc-500">
                                                {orderDate
                                                    ? new Date(
                                                          orderDate
                                                      ).toLocaleString()
                                                    : "Date unavailable"}
                                            </p>

                                            {order.distributorName ? (
                                                <p className="mt-1 text-sm text-zinc-500">
                                                    Distributor:{" "}
                                                    {order.distributorName}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                                                    paymentFailed
                                                        ? "bg-red-50 text-red-700"
                                                        : "bg-green-50 text-green-700"
                                                }`}
                                            >
                                                {getPaymentLabel(order)}
                                            </span>

                                            {!paymentFailed ? (
                                                <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black uppercase text-zinc-700">
                                                    {formatStatus(
                                                        trackingStatus
                                                    )}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {parsedItems.length > 0 ? (
                                            parsedItems.map((item, index) => {
                                                const itemName =
                                                    getItemName(item);

                                                const quantity =
                                                    getItemQuantity(item);

                                                const unitPrice =
                                                    getItemUnitPrice(item);

                                                return (
                                                    <div
                                                        key={`${
                                                            item.productId ||
                                                            item.id ||
                                                            "item"
                                                        }-${index}`}
                                                        className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 px-4 py-3"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-zinc-950">
                                                                {itemName}
                                                            </p>

                                                            <p className="text-sm text-zinc-500">
                                                                Qty: {quantity}{" "}
                                                                · Size:{" "}
                                                                {item.size ??
                                                                    "default"}
                                                            </p>
                                                        </div>

                                                        <p className="font-black text-zinc-950">
                                                            {formatCurrency(
                                                                unitPrice *
                                                                    quantity
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                                                <p className="text-sm font-bold text-zinc-500">
                                                    No item details available.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 rounded-3xl bg-zinc-50 p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <h3 className="font-black text-zinc-950">
                                                Tracking
                                            </h3>

                                            <span
                                                className={`rounded-full bg-white px-4 py-2 text-xs font-black uppercase ${
                                                    paymentFailed
                                                        ? "text-red-700"
                                                        : "text-zinc-700"
                                                }`}
                                            >
                                                {paymentFailed
                                                    ? "Payment failed"
                                                    : formatStatus(
                                                          trackingStatus
                                                      )}
                                            </span>
                                        </div>

                                        {paymentFailed ? (
                                            <div className="rounded-2xl bg-red-50 p-4">
                                                <p className="font-black text-red-700">
                                                    Payment failed
                                                </p>

                                                <p className="mt-1 text-sm text-red-500">
                                                    This order was not completed
                                                    successfully.
                                                </p>
                                            </div>
                                        ) : trackingStatus === "cancelled" ? (
                                            <div className="rounded-2xl bg-red-50 p-4">
                                                <p className="font-black text-red-700">
                                                    Order cancelled
                                                </p>

                                                <p className="mt-1 text-sm text-red-500">
                                                    {order.cancelledAt
                                                        ? new Date(
                                                              order.cancelledAt
                                                          ).toLocaleString()
                                                        : "No cancellation date available."}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {trackingSteps.map(
                                                    (step, index) => {
                                                        const currentIndex =
                                                            getTrackingIndex(
                                                                trackingStatus
                                                            );

                                                        const completed =
                                                            index <=
                                                            currentIndex;

                                                        return (
                                                            <div
                                                                key={step.key}
                                                                className="flex gap-4"
                                                            >
                                                                <div className="flex flex-col items-center">
                                                                    <div
                                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                                                                            completed
                                                                                ? "bg-[#6FC276] text-white"
                                                                                : "bg-zinc-200 text-zinc-500"
                                                                        }`}
                                                                    >
                                                                        {index +
                                                                            1}
                                                                    </div>

                                                                    {index !==
                                                                    trackingSteps.length -
                                                                        1 ? (
                                                                        <div
                                                                            className={`mt-2 h-8 w-1 rounded-full ${
                                                                                completed
                                                                                    ? "bg-[#6FC276]"
                                                                                    : "bg-zinc-200"
                                                                            }`}
                                                                        />
                                                                    ) : null}
                                                                </div>

                                                                <div>
                                                                    <p
                                                                        className={`font-black ${
                                                                            completed
                                                                                ? "text-zinc-950"
                                                                                : "text-zinc-400"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            step.label
                                                                        }
                                                                    </p>

                                                                    <p className="text-sm text-zinc-500">
                                                                        {getTrackingDate(
                                                                            order,
                                                                            step.dateField
                                                                        ) ||
                                                                            "Pending"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 border-t border-zinc-100 pt-5">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-black text-zinc-950">
                                                Total
                                            </span>

                                            <strong>
                                                {formatCurrency(order.total)}
                                            </strong>
                                        </div>

                                        {order.gateway_response ? (
                                            <details className="mt-4 rounded-2xl bg-zinc-50 p-4">
                                                <summary className="cursor-pointer text-sm font-black text-zinc-700">
                                                    Payment details
                                                </summary>

                                                <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-500">
                                                    {order.gateway_response}
                                                </pre>
                                            </details>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}