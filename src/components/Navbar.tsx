"use client";

import { useState } from "react";
import Link from "next/link";
import CartButton from "@/components/CartButton";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
                <Link href="/" className="flex min-w-0 items-center">
                    <img
                        src="/images/Logo.png"
                        alt="Allwear Logo"
                        className="h-auto w-[120px] object-contain sm:w-[160px] md:w-[190px]"
                    />
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-bold text-zinc-700 lg:flex">
                    <Link href="/" className="hover:text-[#6FC276]">
                        Home
                    </Link>
                    <Link href="/shop" className="hover:text-[#6FC276]">
                        Shop
                    </Link>
                    <Link href="/shop" className="hover:text-[#6FC276]">
                        New Arrivals
                    </Link>
                    <Link href="/shop" className="hover:text-[#6FC276]">
                        Activewear
                    </Link>
                    <Link href="/cart" className="hover:text-[#6FC276]">
                        Cart
                    </Link>
                </nav>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <Link
                        href="/shop"
                        className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800 md:inline-flex"
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

            {menuOpen && (
                <nav className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-black text-zinc-800">
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-2xl px-4 py-3 hover:bg-zinc-50 hover:text-[#6FC276]"
                        >
                            Home
                        </Link>

                        <Link
                            href="/shop"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-2xl px-4 py-3 hover:bg-zinc-50 hover:text-[#6FC276]"
                        >
                            Shop
                        </Link>

                        <Link
                            href="/shop"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-2xl px-4 py-3 hover:bg-zinc-50 hover:text-[#6FC276]"
                        >
                            New Arrivals
                        </Link>

                        <Link
                            href="/shop"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-2xl px-4 py-3 hover:bg-zinc-50 hover:text-[#6FC276]"
                        >
                            Activewear
                        </Link>

                        <Link
                            href="/cart"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-2xl px-4 py-3 hover:bg-zinc-50 hover:text-[#6FC276]"
                        >
                            Cart
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}