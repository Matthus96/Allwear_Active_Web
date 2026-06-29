"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

export default function AccountPage() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const hydrated = useAuthStore((state) => state.hydrated);
    const logout = useAuthStore((state) => state.logout);

    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
        if (!hydrated) return;

        if (!user?.$id) {
            router.push("/login?redirect=/account");
        }
    }, [hydrated, user, router]);

    if (!hydrated) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="font-bold text-zinc-500">Loading account...</p>
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

const accountCards = [
    {
        eyebrow: "Orders",
        title: "My Orders",
        description:
            "View order history, payment status and delivery progress.",
        href: "/orders",
        label: "Track Orders",
    },
    {
        eyebrow: "Delivery",
        title: "Saved Addresses",
        description: "Manage saved delivery addresses for faster checkout.",
        href: "/addresses",
        label: "Manage Addresses",
    },
    {
        eyebrow: "Saved",
        title: "Wishlist",
        description: "Return to products you saved for later.",
        href: "/wishlist",
        label: "View Wishlist",
    },
    {
        eyebrow: "Shopping",
        title: "Cart",
        description: `You currently have ${totalItems} item${
            totalItems === 1 ? "" : "s"
        } in your cart.`,
        href: "/cart",
        label: "View Cart",
    },
    ...(totalItems > 0
        ? [
              {
                  eyebrow: "Checkout",
                  title: "Ready to Pay",
                  description:
                      "Continue to delivery details and secure payment.",
                  href: "/checkout",
                  label: "Go to Checkout",
              },
          ]
        : []),
    {
        eyebrow: "Account",
        title: "Settings",
        description: "Manage your account details and preferences.",
        href: "/settings",
        label: "Open Settings",
    },
    {
        eyebrow: "Support",
        title: "Help & Support",
        description:
            "Need help with an order, payment or delivery? Contact support.",
        href: "mailto:support@allwear.co.za",
        label: "Contact Support",
    },
    {
        eyebrow: "Store",
        title: "Shop",
        description:
            "Continue browsing Allwear Hub products and collections.",
        href: "/shop",
        label: "Continue Shopping",
    },
];

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
                        Welcome back.
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Manage your orders, saved products, delivery details and
                        shopping activity from one place.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-10 md:py-12">
                <div className="mb-8 overflow-hidden rounded-[2rem] bg-zinc-50 ring-1 ring-zinc-100">
                    <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
                        <div className="p-6 md:p-8">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Profile
                            </p>

                            <h2 className="mt-4 text-3xl font-black text-zinc-950 md:text-4xl">
                                {user.name || "Allwear Customer"}
                            </h2>

                            <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                                {user.email}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/orders"
                                    className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                                >
                                    View Orders
                                </Link>

                                <Link
                                    href="/shop"
                                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-100"
                                >
                                    Shop Now
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-red-600 ring-1 ring-zinc-200 transition hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-950 p-6 text-white md:p-8">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                Cart Status
                            </p>

                            <h3 className="mt-4 text-4xl font-black">
                                {totalItems}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-zinc-300">
                                item{totalItems === 1 ? "" : "s"} currently in
                                your cart.
                            </p>

                            <Link
                                href={totalItems > 0 ? "/checkout" : "/shop"}
                                className="mt-6 inline-flex rounded-full bg-[#6FC276] px-6 py-3 text-sm font-black text-white transition hover:bg-white hover:text-zinc-950"
                            >
                                {totalItems > 0
                                    ? "Continue Checkout"
                                    : "Start Shopping"}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                        Account Menu
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-zinc-950">
                        Quick access
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {accountCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="group rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                {card.eyebrow}
                            </p>

                            <h3 className="mt-3 text-2xl font-black text-zinc-950">
                                {card.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                                {card.description}
                            </p>

                            <span className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition group-hover:bg-[#6FC276]">
                                {card.label}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 rounded-[3rem] bg-zinc-950 p-8 text-white md:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Allwear Hub
                    </p>

                    <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
                        Your one-stop Allwear shopping platform.
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Browse products, save favourites, checkout securely and
                        track your orders as Allwear Hub continues to grow.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/shop"
                            className="inline-flex justify-center rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
                        >
                            Shop Products
                        </Link>

                        <Link
                            href="/wishlist"
                            className="inline-flex justify-center rounded-full bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white ring-1 ring-white/15 transition hover:bg-white hover:text-zinc-950"
                        >
                            View Wishlist
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}