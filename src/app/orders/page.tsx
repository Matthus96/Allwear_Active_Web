"use client";

import { useEffect, useMemo, useState } from "react";
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

type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    deliveryFee?: number;
    deliveryDetails?: {
        fullName?: string;
        email?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        suburb?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        deliveryNotes?: string;
    } | null;
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

const formatStatus = (status?: string) => {
    if (!status) return "Order placed";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (value?: number) => {
    return `R${Number(value || 0).toFixed(2)}`;
};

const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";

    return new Date(value).toLocaleString();
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

    return formatDate(value);
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

const getItemImage = (item: ParsedOrderItem) => {
    return item.stockSnapshot?.image_url || "";
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

const parseGatewayResponse = (
    gatewayResponse?: string
): ParsedGatewayResponse | null => {
    if (!gatewayResponse) return null;

    try {
        return JSON.parse(gatewayResponse);
    } catch {
        return null;
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

    const orderCount = useMemo(() => orders.length, [orders]);

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 text-white md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Allwear Hub Account
                    </p>

                    <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
                        My Orders
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Track your Allwear orders, payment status and delivery
                        progress in one place.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Order History
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            {loading
                                ? "Loading orders..."
                                : `${orderCount} order${
                                      orderCount === 1 ? "" : "s"
                                  } found`}
                        </h2>
                    </div>

                    <Link
                        href="/shop"
                        className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-[2rem] border border-zinc-100 bg-white p-6 shadow-sm"
                            >
                                <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
                                <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
                                <div className="mt-6 h-32 animate-pulse rounded-3xl bg-zinc-100" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] bg-red-50 p-6 text-red-600">
                        <p className="font-black">Could not load orders</p>
                        <p className="mt-2 text-sm">{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-[3rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100 md:p-14">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            No Orders
                        </p>

                        <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-5xl">
                            No orders yet.
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500">
                            Your order history will appear here after your first
                            checkout.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-8 inline-flex rounded-full bg-[#6FC276] px-8 py-4 font-black text-white transition hover:bg-zinc-950"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const parsedItems = parseItems(order.items);
                            const gateway = parseGatewayResponse(
                                order.gateway_response
                            );
                            const deliveryDetails = gateway?.deliveryDetails;
                            const orderDate = order.paidAt || order.$createdAt;
                            const paymentFailed = isPaymentFailed(order);
                            const trackingStatus = getTrackingStatus(order);
                            const currentIndex =
                                getTrackingIndex(trackingStatus);

                            return (
                                <article
                                    key={order.$id}
                                    className="overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm"
                                >
                                    <div className="bg-zinc-50 p-5 md:p-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                    Order Reference
                                                </p>

                                                <h3 className="mt-2 break-words text-xl font-black text-zinc-950 md:text-2xl">
                                                    {order.reference ||
                                                        order.$id}
                                                </h3>

                                                <p className="mt-2 text-sm text-zinc-500">
                                                    Placed:{" "}
                                                    {formatDate(orderDate)}
                                                </p>

                                                {order.distributorName ? (
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        Distributor:{" "}
                                                        {
                                                            order.distributorName
                                                        }
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
                                                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-zinc-700 ring-1 ring-zinc-100">
                                                        {formatStatus(
                                                            trackingStatus
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_360px]">
                                        <div className="min-w-0">
                                            <h4 className="font-black text-zinc-950">
                                                Items
                                            </h4>

                                            <div className="mt-4 space-y-3">
                                                {parsedItems.length > 0 ? (
                                                    parsedItems.map(
                                                        (item, index) => {
                                                            const itemName =
                                                                getItemName(
                                                                    item
                                                                );
                                                            const itemImage =
                                                                getItemImage(
                                                                    item
                                                                );
                                                            const quantity =
                                                                getItemQuantity(
                                                                    item
                                                                );
                                                            const unitPrice =
                                                                getItemUnitPrice(
                                                                    item
                                                                );

                                                            return (
                                                                <div
                                                                    key={`${
                                                                        item.productId ||
                                                                        item.id ||
                                                                        "item"
                                                                    }-${index}`}
                                                                    className="grid gap-3 rounded-2xl bg-zinc-50 p-3 sm:grid-cols-[72px_1fr_auto]"
                                                                >
                                                                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-zinc-100">
                                                                        {itemImage ? (
                                                                            <img
                                                                                src={
                                                                                    itemImage
                                                                                }
                                                                                alt={
                                                                                    itemName
                                                                                }
                                                                                className="h-full w-full object-contain"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-xs font-black text-zinc-300">
                                                                                Item
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="break-words font-black text-zinc-950">
                                                                            {
                                                                                itemName
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-zinc-500">
                                                                            Qty:{" "}
                                                                            {
                                                                                quantity
                                                                            }{" "}
                                                                            ·
                                                                            Size:{" "}
                                                                            {item.size ??
                                                                                "default"}
                                                                        </p>
                                                                    </div>

                                                                    <p className="font-black text-zinc-950 sm:text-right">
                                                                        {formatCurrency(
                                                                            unitPrice *
                                                                                quantity
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    )
                                                ) : (
                                                    <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                                                        <p className="text-sm font-bold text-zinc-500">
                                                            No item details
                                                            available.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {deliveryDetails ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                        Delivery Details
                                                    </p>

                                                    <h4 className="mt-2 text-xl font-black text-zinc-950">
                                                        {
                                                            deliveryDetails.fullName
                                                        }
                                                    </h4>

                                                    <div className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                                                        {deliveryDetails.phone ? (
                                                            <p>
                                                                Phone:{" "}
                                                                {
                                                                    deliveryDetails.phone
                                                                }
                                                            </p>
                                                        ) : null}

                                                        <p>
                                                            {
                                                                deliveryDetails.addressLine1
                                                            }
                                                        </p>

                                                        {deliveryDetails.addressLine2 ? (
                                                            <p>
                                                                {
                                                                    deliveryDetails.addressLine2
                                                                }
                                                            </p>
                                                        ) : null}

                                                        <p>
                                                            {
                                                                deliveryDetails.suburb
                                                            }
                                                            ,{" "}
                                                            {
                                                                deliveryDetails.city
                                                            }
                                                        </p>

                                                        <p>
                                                            {
                                                                deliveryDetails.province
                                                            }{" "}
                                                            {
                                                                deliveryDetails.postalCode
                                                            }
                                                        </p>

                                                        {deliveryDetails.deliveryNotes ? (
                                                            <p className="pt-2 text-zinc-500">
                                                                Notes:{" "}
                                                                {
                                                                    deliveryDetails.deliveryNotes
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <aside className="h-fit rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-zinc-950">
                                                    Order Total
                                                </h4>

                                                <strong className="text-xl text-zinc-950">
                                                    {formatCurrency(
                                                        order.total
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                    Tracking
                                                </p>

                                                <p className="mt-2 text-sm font-bold text-zinc-600">
                                                    {paymentFailed
                                                        ? "This payment did not complete successfully."
                                                        : "We will update this order as it moves through fulfilment."}
                                                </p>
                                            </div>

                                            <div className="mt-5 space-y-4">
                                                {paymentFailed ? (
                                                    <div className="rounded-2xl bg-red-50 p-4">
                                                        <p className="font-black text-red-700">
                                                            Payment failed
                                                        </p>

                                                        <p className="mt-1 text-sm text-red-500">
                                                            This order was not
                                                            completed.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    trackingSteps.map(
                                                        (step, index) => {
                                                            const completed =
                                                                index <=
                                                                currentIndex;

                                                            return (
                                                                <div
                                                                    key={
                                                                        step.key
                                                                    }
                                                                    className="flex gap-3"
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
                                                    )
                                                )}
                                            </div>

                                            {gateway ? (
                                                <details className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
                                                    <summary className="cursor-pointer text-sm font-black text-zinc-700">
                                                        Payment Reference
                                                    </summary>

                                                    <div className="mt-3 space-y-2 text-sm text-zinc-500">
                                                        <p>
                                                            Provider:{" "}
                                                            {gateway.provider ||
                                                                "Paystack"}
                                                        </p>
                                                        <p className="break-words">
                                                            Reference:{" "}
                                                            {gateway.reference ||
                                                                order.reference}
                                                        </p>
                                                        <p>
                                                            Currency:{" "}
                                                            {gateway.currency ||
                                                                "ZAR"}
                                                        </p>
                                                    </div>
                                                </details>
                                            ) : null}
                                        </aside>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}