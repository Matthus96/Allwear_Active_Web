"use client";

import { FormEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

import {
    getSavedAddresses,
    type SavedAddress,
} from "@/lib/addressBook";

const DELIVERY_FEE = 100.0;

export default function CheckoutPage() {
    const router = useRouter();

    const items = useCartStore((s) => s.items ?? []);
    const totalPrice = useCartStore((s) => s.getTotalPrice());
    const totalItems = useCartStore((s) => s.getTotalItems());

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");

    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);
    const hydrated = useAuthStore((state) => state.hydrated);

    const [loading, setLoading] = useState(false);
    const lockRef = useRef(false);

    const [form, setForm] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        suburb: "",
        city: "",
        province: "",
        postalCode: "",
        deliveryNotes: "",
    });

    const subtotal = totalPrice;
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
    const finalTotal = subtotal + deliveryFee;

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSelectSavedAddress = (addressId: string) => {    
        setSelectedAddressId(addressId);

        const selectedAddress = savedAddresses.find(
            (address) => address.id === addressId
        );

        if (!selectedAddress) return;

        setForm((prev) => ({
            ...prev,
            fullName: selectedAddress.fullName,
            email: selectedAddress.email,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2 || "",
            suburb: selectedAddress.suburb,
            city: selectedAddress.city,
            province: selectedAddress.province,
            postalCode: selectedAddress.postalCode,
            deliveryNotes: selectedAddress.deliveryNotes || "",
        }));
    };

        useEffect(() => {
        setSavedAddresses(getSavedAddresses());
    }, []);

    useEffect(() => {
        if (!user) return;

        setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || user.name || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);

    const validateForm = () => {
        if (!form.fullName.trim()) return "Please enter your full name.";
        if (!form.email.trim()) return "Please enter your email address.";
        if (!form.phone.trim()) return "Please enter your phone number.";
        if (!form.addressLine1.trim()) return "Please enter your street address.";
        if (!form.suburb.trim()) return "Please enter your suburb.";
        if (!form.city.trim()) return "Please enter your city.";
        if (!form.province.trim()) return "Please enter your province.";
        if (!form.postalCode.trim()) return "Please enter your postal code.";

        return null;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading || lockRef.current) return;

        lockRef.current = true;
        setLoading(true);

        try {
            if (!items.length) {
                alert("Your cart is empty.");
                router.push("/shop");
                return;
            }

            if (!hydrated || authLoading) {
                alert("Checking your account. Please try again in a moment.");
                return;
            }

            if (!user?.email || !user?.$id) {
                router.push("/login?redirect=/checkout");
                return;
            }

            const validationError = validateForm();

            if (validationError) {
                alert(validationError);
                return;
            }

            const deliveryDetails = {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                addressLine1: form.addressLine1.trim(),
                addressLine2: form.addressLine2.trim(),
                suburb: form.suburb.trim(),
                city: form.city.trim(),
                province: form.province.trim(),
                postalCode: form.postalCode.trim(),
                deliveryNotes: form.deliveryNotes.trim(),
            };

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
                    deliveryDetails,
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

            if (typeof window !== "undefined") {
                sessionStorage.setItem(
                    "allwear_delivery_details",
                    JSON.stringify(deliveryDetails)
                );
            }

            window.location.href = initData.authorization_url;
        } catch (error: any) {
            alert(error?.message || "Something went wrong.");
        } finally {
            setLoading(false);
            lockRef.current = false;
        }
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-14 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Delivery Details
                    </p>

                    <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        Where should we deliver?
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Confirm your delivery information before continuing to
                        secure payment.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_390px]">
                <form
                    onSubmit={handleSubmit}
                    className="min-w-0 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100 sm:p-8"
                >

                    {savedAddresses.length > 0 ? (
                        <div className="mb-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Saved Addresses
                            </p>

                            <h3 className="mt-2 text-xl font-black text-zinc-950">
                                Use a saved delivery address
                            </h3>

                            <select
                                value={selectedAddressId}
                                onChange={(e) => handleSelectSavedAddress(e.target.value)}
                                className="mt-4 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-bold text-zinc-700 outline-none focus:border-[#6FC276]"
                            >
                                <option value="">Choose saved address</option>

                                {savedAddresses.map((address) => (
                                    <option key={address.id} value={address.id}>
                                        {address.label} — {address.addressLine1}, {address.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}

                    <div className="mb-8">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Customer Information
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            Contact details
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <input
                            value={form.fullName}
                            onChange={(e) =>
                                updateField("fullName", e.target.value)
                            }
                            placeholder="Full name"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.email}
                            onChange={(e) =>
                                updateField("email", e.target.value)
                            }
                            placeholder="Email address"
                            type="email"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.phone}
                            onChange={(e) =>
                                updateField("phone", e.target.value)
                            }
                            placeholder="Phone number"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276] sm:col-span-2"
                        />
                    </div>

                    <div className="mb-8 mt-10">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Delivery Address
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            Address details
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        <input
                            value={form.addressLine1}
                            onChange={(e) =>
                                updateField("addressLine1", e.target.value)
                            }
                            placeholder="Street address"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.addressLine2}
                            onChange={(e) =>
                                updateField("addressLine2", e.target.value)
                            }
                            placeholder="Apartment, unit, complex, business name etc. optional"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                value={form.suburb}
                                onChange={(e) =>
                                    updateField("suburb", e.target.value)
                                }
                                placeholder="Suburb"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.city}
                                onChange={(e) =>
                                    updateField("city", e.target.value)
                                }
                                placeholder="City"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.province}
                                onChange={(e) =>
                                    updateField("province", e.target.value)
                                }
                                placeholder="Province"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.postalCode}
                                onChange={(e) =>
                                    updateField("postalCode", e.target.value)
                                }
                                placeholder="Postal code"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />
                        </div>

                        <textarea
                            value={form.deliveryNotes}
                            onChange={(e) =>
                                updateField("deliveryNotes", e.target.value)
                            }
                            placeholder="Delivery notes optional"
                            className="min-h-32 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />
                    </div>

                    <div className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold text-zinc-500 ring-1 ring-zinc-100">
                        Want to save delivery details for next time?{" "}
                        <Link href="/addresses" className="text-[#6FC276]">
                            Manage Address Book
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-[#6FC276] px-6 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {loading ? "Processing..." : "Continue to Payment"}
                        </button>

                        <Link
                            href="/cart"
                            className="w-full rounded-full bg-white px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-100 sm:w-auto"
                        >
                            Back to Cart
                        </Link>
                    </div>
                </form>

                <aside className="h-fit rounded-[2rem] bg-zinc-50 p-6 ring-1 ring-zinc-100 lg:sticky lg:top-28">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                        Order Summary
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-zinc-950">
                        {totalItems} item{totalItems === 1 ? "" : "s"}
                    </h2>

                    <div className="mt-6 space-y-3">
                        {items.map((item) => (
                            <div
                                key={`${item.productId}-${item.size ?? "default"}`}
                                className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-zinc-100"
                            >
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-50 p-2">
                                    <img
                                        src={item.stockSnapshot.image_url}
                                        alt={item.stockSnapshot.name}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-black text-zinc-950">
                                        {item.stockSnapshot.name}
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-zinc-500">
                                        Size: {item.size ?? "default"} · Qty:{" "}
                                        {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 space-y-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Subtotal</span>
                            <span className="font-black text-zinc-950">
                                R{subtotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Delivery</span>
                            <span className="font-black text-zinc-950">
                                R{deliveryFee.toFixed(2)}
                            </span>
                        </div>

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

                    <p className="mt-5 text-sm leading-6 text-zinc-500">
                        Delivery is currently charged at a flat rate of{" "}
                        <span className="font-black text-zinc-950">
                            R100.00
                        </span>
                        .
                    </p>
                </aside>
            </section>

            <Footer />
        </main>
    );
}