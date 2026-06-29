"use client";

import { useState } from "react";
import Link from "next/link";
import CartButton from "@/components/CartButton";
import { useAuthStore } from "@/store/auth.store";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "Collections", href: "/#divisions" },
        { label: "Account", href: "/account" },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
                <Link href="/" className="flex min-w-0 items-center">
                    <img
                        src="/images/Logo.png"
                        alt="Allwear Logo"
                        className="h-auto w-[100px] object-contain sm:w-[140px] md:w-[190px]"
                    />
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-bold text-zinc-700 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="hover:text-[#6FC276]"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {user ? (
                            <button
                                type="button"
                                onClick={logout}
                                className="font-bold hover:text-[#6FC276]"
                            >
                                Logout
                            </button>
                    ) : (
                        <Link href="/login" className="hover:text-[#6FC276]">
                            Login
                        </Link>
                    )}
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <Link
                        href="/shop"
                        className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#6FC276] md:inline-flex"
                    >
                        Shop Now
                    </Link>

                    <CartButton />

                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-xl font-black text-zinc-950 lg:hidden"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? "×" : "☰"}
                    </button>
                </div>
            </div>

            {menuOpen ? (
                <div className="absolute left-0 top-full z-50 w-full border-t border-zinc-100 bg-white px-4 py-4 shadow-xl lg:hidden">
                    <div className="space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-2xl px-4 py-3 text-sm font-black text-zinc-950 hover:bg-zinc-50"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                <Link
                                    href="/orders"
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-2xl px-4 py-3 text-sm font-black text-zinc-950 hover:bg-zinc-50"
                                >
                                    Orders
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        logout();
                                    }}
                                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-2xl px-4 py-3 text-sm font-black text-zinc-950 hover:bg-zinc-50"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            ) : null}
        </header>
    );
}