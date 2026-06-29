"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const hydrated = useAuthStore((state) => state.hydrated);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        if (!hydrated) return;

        if (!user?.$id) {
            router.push("/login?redirect=/settings");
        }
    }, [hydrated, user, router]);

    if (!hydrated) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="font-bold text-zinc-500">
                    Loading settings...
                </p>
            </main>
        );
    }

    if (!user?.$id) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 text-white md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.35),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Account Settings
                    </p>

                    <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
                        Settings
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Manage your Allwear Hub profile, account access and support options.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-10 md:py-12">
                <div className="rounded-[2rem] bg-zinc-50 p-6 ring-1 ring-zinc-100 md:p-8">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                        Profile
                    </p>

                    <h2 className="mt-3 text-3xl font-black text-zinc-950">
                        Your details
                    </h2>

                    <div className="mt-6 grid gap-4">
                        <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                Name
                            </p>

                            <p className="mt-2 break-words text-lg font-black text-zinc-950">
                                {user.name || "Allwear Customer"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                Email
                            </p>

                            <p className="mt-2 break-words text-lg font-black text-zinc-950">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-zinc-500">
                        Profile editing is not active yet. For now, your account details are managed through your Allwear login.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <Link
                        href="/orders"
                        className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Orders
                        </p>

                        <h3 className="mt-3 text-2xl font-black text-zinc-950">
                            Order history
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            View payment status, delivery progress and previous purchases.
                        </p>
                    </Link>

                    <Link
                        href="/addresses"
                        className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Delivery
                        </p>

                        <h3 className="mt-3 text-2xl font-black text-zinc-950">
                            Saved addresses
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Manage saved delivery details for faster checkout.
                        </p>
                    </Link>

                    <a
                        href="mailto:support@allwear.co.za"
                        className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                            Support
                        </p>

                        <h3 className="mt-3 text-2xl font-black text-zinc-950">
                            Help & Support
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Contact Allwear support for help with orders, delivery or payments.
                        </p>
                    </a>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-[2rem] bg-red-50 p-6 text-left ring-1 ring-red-100 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
                            Session
                        </p>

                        <h3 className="mt-3 text-2xl font-black text-red-700">
                            Logout
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-red-500">
                            Sign out of your Allwear Hub account on this device.
                        </p>
                    </button>
                </div>

                <div className="mt-8 rounded-[2rem] bg-zinc-950 p-6 text-white md:p-8">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Account Safety
                    </p>

                    <h2 className="mt-3 text-3xl font-black">
                        Need to delete your account?
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
                        Account deletion is not enabled on this web page yet. If needed, contact support and we can connect this to your existing delete account function later.
                    </p>

                    <a
                        href="mailto:support@allwear.co.za"
                        className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-[#6FC276] hover:text-white"
                    >
                        Contact Support
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
