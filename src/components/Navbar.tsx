"use client";

import Link from "next/link";
import CartButton from "@/components/CartButton";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="text-2xl font-black tracking-tight text-zinc-950">
                    <img src="/images/Logo.png" alt="Allwear Logo" className="h-15 w-auto" />
                </Link>

                <nav className="hidden items-center gap-10 text-sm font-bold text-zinc-700 md:flex">
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

                <div className="flex items-center gap-4">
                    <Link
                        href="/shop"
                        className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white md:inline-flex"
                    >
                        Shop Now
                    </Link>

                    <CartButton />
                </div>
            </div>
        </header>
    );
}