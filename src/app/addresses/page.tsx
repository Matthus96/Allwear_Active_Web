"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
    deleteSavedAddress,
    getSavedAddresses,
    saveAddress,
    type SavedAddress,
} from "@/lib/addressBook";

const emptyForm = {
    label: "",
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    deliveryNotes: "",
};

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setAddresses(getSavedAddresses());
    }, []);

    const updateField = (field: keyof typeof emptyForm, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        const requiredFields: (keyof typeof emptyForm)[] = [
            "label",
            "fullName",
            "email",
            "phone",
            "addressLine1",
            "suburb",
            "city",
            "province",
            "postalCode",
        ];

        const missingField = requiredFields.find(
            (field) => !form[field].trim()
        );

        if (missingField) {
            setMessage("Please complete all required fields.");
            return;
        }

        saveAddress(form);

        setAddresses(getSavedAddresses());
        setForm(emptyForm);
        setMessage("Address saved.");
    };

    const handleDelete = (addressId: string) => {
        deleteSavedAddress(addressId);
        setAddresses(getSavedAddresses());
    };

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
                        Address Book
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Save delivery details for faster checkout.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:py-12 lg:grid-cols-[1fr_420px]">
                <div>
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Saved Addresses
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-zinc-950">
                                {addresses.length} saved address
                                {addresses.length === 1 ? "" : "es"}
                            </h2>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Go to Checkout
                        </Link>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="rounded-[2rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100">
                            <h3 className="text-2xl font-black text-zinc-950">
                                No saved addresses yet.
                            </h3>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
                                Add your first delivery address using the form.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="rounded-[2rem] bg-zinc-50 p-6 ring-1 ring-zinc-100"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                {address.label}
                                            </p>

                                            <h3 className="mt-2 text-2xl font-black text-zinc-950">
                                                {address.fullName}
                                            </h3>

                                            <div className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                                                <p>{address.phone}</p>
                                                <p>{address.email}</p>
                                                <p>{address.addressLine1}</p>

                                                {address.addressLine2 ? (
                                                    <p>
                                                        {address.addressLine2}
                                                    </p>
                                                ) : null}

                                                <p>
                                                    {address.suburb},{" "}
                                                    {address.city}
                                                </p>

                                                <p>
                                                    {address.province}{" "}
                                                    {address.postalCode}
                                                </p>

                                                {address.deliveryNotes ? (
                                                    <p className="pt-2 text-zinc-500">
                                                        Notes:{" "}
                                                        {address.deliveryNotes}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(address.id)
                                            }
                                            className="w-fit rounded-full bg-white px-5 py-3 text-sm font-black text-red-600 ring-1 ring-zinc-200 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="h-fit rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
                >
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                        New Address
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-zinc-950">
                        Add delivery address
                    </h2>

                    {message ? (
                        <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm font-bold text-zinc-600">
                            {message}
                        </div>
                    ) : null}

                    <div className="mt-6 grid gap-4">
                        <input
                            value={form.label}
                            onChange={(e) =>
                                updateField("label", e.target.value)
                            }
                            placeholder="Address label e.g. Home, Work"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.fullName}
                            onChange={(e) =>
                                updateField("fullName", e.target.value)
                            }
                            placeholder="Full name"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.email}
                            onChange={(e) =>
                                updateField("email", e.target.value)
                            }
                            placeholder="Email address"
                            type="email"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.phone}
                            onChange={(e) =>
                                updateField("phone", e.target.value)
                            }
                            placeholder="Phone number"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.addressLine1}
                            onChange={(e) =>
                                updateField("addressLine1", e.target.value)
                            }
                            placeholder="Street address"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.addressLine2}
                            onChange={(e) =>
                                updateField("addressLine2", e.target.value)
                            }
                            placeholder="Complex, building, unit number"
                            className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                value={form.suburb}
                                onChange={(e) =>
                                    updateField("suburb", e.target.value)
                                }
                                placeholder="Suburb"
                                className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.city}
                                onChange={(e) =>
                                    updateField("city", e.target.value)
                                }
                                placeholder="City"
                                className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                value={form.province}
                                onChange={(e) =>
                                    updateField("province", e.target.value)
                                }
                                placeholder="Province"
                                className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.postalCode}
                                onChange={(e) =>
                                    updateField("postalCode", e.target.value)
                                }
                                placeholder="Postal code"
                                className="w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />
                        </div>

                        <textarea
                            value={form.deliveryNotes}
                            onChange={(e) =>
                                updateField("deliveryNotes", e.target.value)
                            }
                            placeholder="Delivery notes"
                            rows={4}
                            className="w-full resize-none rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <button
                            type="submit"
                            className="rounded-full bg-[#6FC276] px-6 py-4 text-sm font-black text-white transition hover:bg-zinc-950"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
        </main>
    );
}