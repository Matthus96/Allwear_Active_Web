"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useIsDistributor from "@/hooks/useIsDistributor";

import {
    appwriteConfig,
    getDistributorOrders,
    updateOrderTrackingStatus,
    type OrderTrackingStatus,
} from "@/lib/appwrite";

type OrderDoc = {
    $id: string;
    reference?: string;
    email?: string;
    items?: string;
    total?: number;

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
    productName?: string;
    itemName?: string;
    title?: string;

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

type DeliveryDetails = {
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
};

type FulfilmentMethod = "delivery" | "collection";

type CollectionDetails = {
    name?: string;
    addressLine1?: string;
    suburb?: string;
    city?: string;
};

type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    fulfilmentMethod?: FulfilmentMethod;
    deliveryFee?: number;
    deliveryDetails?: DeliveryDetails | null;
    collectionDetails?: CollectionDetails | null;
};

const getTrackingActions = (
    trackingStatus: string,
    fulfilmentMethod: FulfilmentMethod
): {
    label: string;
    value: OrderTrackingStatus;
}[] => {
    switch (trackingStatus) {
        case "order_placed":
            return [
                { label: "Confirm Order", value: "confirmed" },
                { label: "Cancel", value: "cancelled" },
            ];

        case "confirmed":
            return [
                { label: "Mark Preparing", value: "preparing" },
                { label: "Cancel", value: "cancelled" },
            ];

        case "preparing":
            return [
                {
                    label:
                        fulfilmentMethod === "collection"
                            ? "Ready for Collection"
                            : "Out for Delivery",
                    value: "out_for_delivery",
                },
                { label: "Cancel", value: "cancelled" },
            ];

        case "out_for_delivery":
            return [
                {
                    label:
                        fulfilmentMethod === "collection"
                            ? "Mark Collected"
                            : "Mark Delivered",
                    value: "delivered",
                },
            ];

        default:
            return [];
    }
};

const orderFilters: {
    label: string;
    value: "all" | OrderTrackingStatus;
}[] = [
    { label: "All", value: "all" },
    { label: "Order placed", value: "order_placed" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Out / Ready", value: "out_for_delivery" },
    { label: "Delivered / Collected", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
];

const formatCurrency = (value?: number) => {
    return `R${Number(value || 0).toFixed(2)}`;
};

const formatStatus = (
    status?: string,
    fulfilmentMethod: FulfilmentMethod = "delivery"
) => {
    if (!status) return "Order placed";

    if (
        fulfilmentMethod === "collection" &&
        status === "out_for_delivery"
    ) {
        return "Ready for collection";
    }

    if (
        fulfilmentMethod === "collection" &&
        status === "delivered"
    ) {
        return "Collected";
    }

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";

    return new Date(value).toLocaleString();
};

const parseItems = (items?: string): ParsedOrderItem[] => {
    if (!items) return [];

    try {
        const parsed = JSON.parse(items);

        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed.items)) return parsed.items;
        if (Array.isArray(parsed.cartItems)) return parsed.cartItems;

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

export default function DistributorOrdersPage() {
    const { isDistributor, checkingDistributor } = useIsDistributor();

    const [orders, setOrders] = useState<OrderDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState("");

    const [selectedFilter, setSelectedFilter] = useState<
        "all" | OrderTrackingStatus
    >("all");

    const loadOrders = async (showLoader = false) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");

            const data = await getDistributorOrders(
                appwriteConfig.defaultDistributorId
            );

            setOrders(data as unknown as OrderDoc[]);
        } catch (e: any) {
            setError(e?.message || "Could not load distributor orders.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        if (selectedFilter === "all") {
            return orders;
        }

        return orders.filter((order) => {
            const status = order.trackingStatus || "order_placed";

            return status === selectedFilter;
        });
    }, [orders, selectedFilter]);

    useEffect(() => {
        if (checkingDistributor || !isDistributor) {
            return;
        }

        loadOrders(true);

        const interval = window.setInterval(() => {
            loadOrders(false);
        }, 10000);

        return () => {
            window.clearInterval(interval);
        };
    }, [checkingDistributor, isDistributor]);

    const handleUpdateStatus = async (
        orderId: string,
        trackingStatus: OrderTrackingStatus
    ) => {
        try {
            setUpdatingOrderId(orderId);

            await updateOrderTrackingStatus({
                orderId,
                trackingStatus,
            });

            await loadOrders(false);
        } catch (e: any) {
            alert(e?.message || "Could not update order status.");
        } finally {
            setUpdatingOrderId("");
        }
    };

    if (checkingDistributor) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-5">
                    <p className="font-bold text-zinc-500">
                        Checking distributor access...
                    </p>
                </div>
                <Footer />
            </main>
        );
    }

    if (!isDistributor) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-5 py-16">
                    <div className="w-full rounded-[3rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100 md:p-12">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Restricted Area
                        </p>
                        <h1 className="mt-4 text-4xl font-black text-zinc-950">
                            Distributor access only.
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                            This dashboard is available only to accounts in the
                            Allwear distributor team.
                        </p>
                        <Link
                            href="/account"
                            className="mt-8 inline-flex rounded-full bg-zinc-950 px-7 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Back to Account
                        </Link>
                    </div>
                </section>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 text-white md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Distributor Dashboard
                    </p>

                    <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
                        Orders
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Manage orders assigned to {appwriteConfig.defaultDistributorName}.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-10 md:py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Fulfilment
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            {loading
                                ? "Loading orders..."
                                : `${filteredOrders.length} order${
                                    filteredOrders.length === 1 ? "" : "s"
                                } found`}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => loadOrders(true)}
                            className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Refresh
                        </button>

                        <Link
                            href="/account"
                            className="rounded-full bg-white px-6 py-3 text-sm font-black text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-100"
                        >
                            Back to Account
                        </Link>
                    </div>
                </div>

                <div className="mb-8 overflow-x-auto">
                    <div className="flex min-w-max gap-2 rounded-full bg-zinc-50 p-2 ring-1 ring-zinc-100">
                        {orderFilters.map((filter) => {
                            const active = selectedFilter === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setSelectedFilter(filter.value)}
                                    className={`rounded-full px-5 py-3 text-sm font-black transition ${
                                        active
                                            ? "bg-[#6FC276] text-white"
                                            : "bg-white text-zinc-600 hover:bg-zinc-100"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-[2rem] bg-zinc-50 p-8 ring-1 ring-zinc-100">
                        <p className="font-bold text-zinc-500">
                            Loading distributor orders...
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] bg-red-50 p-6 text-red-600">
                        <p className="font-black">Could not load orders</p>
                        <p className="mt-2 text-sm">{error}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-[3rem] bg-zinc-50 p-10 text-center ring-1 ring-zinc-100">
                        <h2 className="text-3xl font-black text-zinc-950">
                            No orders found.
                        </h2>

                        <p className="mt-3 text-sm text-zinc-500">
                            Try another filter or refresh the order list.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => {
                            const parsedItems = parseItems(order.items);
                            const gateway = parseGatewayResponse(
                                order.gateway_response
                            );
                            const deliveryDetails = gateway?.deliveryDetails;
                            const fulfilmentMethod: FulfilmentMethod =
                                gateway?.fulfilmentMethod === "collection"
                                    ? "collection"
                                    : "delivery";
                            const collectionDetails = gateway?.collectionDetails;
                            const trackingStatus =
                                order.trackingStatus || "order_placed";
                            const availableActions = getTrackingActions(
                                trackingStatus,
                                fulfilmentMethod
                            );
                            const isUpdating = updatingOrderId === order.$id;

                            return (
                                <article
                                    key={order.$id}
                                    className="overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm"
                                >
                                    <div className="bg-zinc-50 p-5 md:p-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                                                    {formatDate(
                                                        order.paidAt ||
                                                            order.$createdAt
                                                    )}
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-500">
                                                    Customer:{" "}
                                                    {order.email ||
                                                        deliveryDetails?.email ||
                                                        "Unavailable"}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase text-green-700">
                                                    Paid
                                                </span>

                                                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase text-blue-700">
                                                    {fulfilmentMethod ===
                                                    "collection"
                                                        ? "Collection"
                                                        : "Delivery"}
                                                </span>

                                                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-zinc-700 ring-1 ring-zinc-100">
                                                    {formatStatus(
                                                        trackingStatus,
                                                        fulfilmentMethod
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_380px]">
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
                                                                    className="flex flex-col gap-3 rounded-2xl bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                                >
                                                                    <div>
                                                                        <p className="font-black text-zinc-950">
                                                                            {
                                                                                itemName
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-zinc-500">
                                                                            Qty:{" "}
                                                                            {
                                                                                quantity
                                                                            }{" "}
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
                                                        }
                                                    )
                                                ) : (
                                                    <div className="rounded-2xl bg-zinc-50 p-4">
                                                        <p className="text-sm font-bold text-zinc-500">
                                                            No item details
                                                            available.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {fulfilmentMethod === "collection" ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                        Collection Details
                                                    </p>

                                                    <h4 className="mt-2 text-xl font-black text-zinc-950">
                                                        {collectionDetails?.name ||
                                                            "Allwear Factory Shop"}
                                                    </h4>

                                                    <div className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                                                        <p>
                                                            {collectionDetails?.addressLine1 ||
                                                                "55 Albert Wessels Drive"}
                                                        </p>
                                                        <p>
                                                            {collectionDetails?.suburb ||
                                                                "Riverside Industrial"}
                                                            ,{" "}
                                                            {collectionDetails?.city ||
                                                                "Newcastle"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : deliveryDetails ? (
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
                                            ) : (
                                                <div className="mt-6 rounded-[2rem] bg-yellow-50 p-5 text-yellow-700">
                                                    <p className="font-black">
                                                        No delivery details
                                                        found.
                                                    </p>

                                                    <p className="mt-1 text-sm">
                                                        Check the payment
                                                        reference if this order
                                                        was created before the
                                                        checkout delivery update.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <aside className="h-fit rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                Manage Order
                                            </p>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="font-black text-zinc-950">
                                                    Total
                                                </span>

                                                <strong className="text-xl text-zinc-950">
                                                    {formatCurrency(
                                                        order.total
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
                                                <p className="text-sm font-bold text-zinc-500">
                                                    Current status
                                                </p>

                                                <p className="mt-1 text-xl font-black text-zinc-950">
                                                    {formatStatus(
                                                        trackingStatus,
                                                        fulfilmentMethod
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-5 grid gap-3">
                                                {availableActions.map(
                                                    (action) => (
                                                        <button
                                                            key={action.value}
                                                            type="button"
                                                            disabled={
                                                                isUpdating ||
                                                                trackingStatus ===
                                                                    action.value
                                                            }
                                                            onClick={() =>
                                                                handleUpdateStatus(
                                                                    order.$id,
                                                                    action.value
                                                                )
                                                            }
                                                            className={`rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                                action.value ===
                                                                "cancelled"
                                                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                                                    : "bg-zinc-950 text-white hover:bg-[#6FC276]"
                                                            }`}
                                                        >
                                                            {isUpdating
                                                                ? "Updating..."
                                                                : action.label}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {gateway ? (
                                                <details className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
                                                    <summary className="cursor-pointer text-sm font-black text-zinc-700">
                                                        Payment details
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