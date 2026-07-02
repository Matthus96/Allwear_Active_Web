"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import useAppwrite from "@/hooks/useAppwrite";
import { getCategories, type Category } from "@/lib/appwrite";
import InfoTicker from "@/components/InfoTicker";
import HeroCarousel from "@/components/HeroCarousel";

export default function HomePage() {
    const { data: categoriesData } = useAppwrite<Category[], any>({
        fn: getCategories,
    });

    const categories = categoriesData ?? [];

    const getCategoryHref = (categoryName: string) => {
        const matchedCategory = categories.find(
            (cat) =>
                cat.name.toLowerCase().trim() ===
                categoryName.toLowerCase().trim()
        );

        return matchedCategory
            ? `/shop?category=${String(matchedCategory.$id)}`
            : "/shop";
    };

    const hubDivisions = [
        {
            title: "Allwear Active",
            label: "Performance & lifestyle",
            categoryName: "Allwear",
            image: "/images/allwear-card.png",
            description: "Training, travel, recovery and everyday activewear.",
        },
        {
            title: "Comrades",
            label: "Event collection",
            categoryName: "Comrades",
            image: "/images/comrades-card.png",
            description: "Official event-inspired apparel and merchandise.",
        },
        {
            title: "Bafana Bafana",
            label: "Supporter range",
            categoryName: "Bafana Bafana",
            image: "/images/bafana-card.png",
            description: "Supporter apparel built around national pride.",
        },
    ];

    const futureDivisions = [
        "Workwear",
        "Corporatewear",
        "Fashion Basics",
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <HeroCarousel />

            {/* INFO TICKER */}
            <section className="bg-black">
                <InfoTicker />
            </section>

            {/* SHOPPING ENTRY */}
            <section className="bg-white">
                <div className="site-container py-16">
                    <div className="rounded-[3rem] bg-zinc-100 p-5 md:p-10">
                        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                                    What are you looking for?
                                </h2>

                                <p className="mt-4 max-w-3xl text-zinc-600">
                                    Search collections, browse product ranges or jump
                                    straight into the Allwear shop.
                                </p>
                            </div>

                            <Link
                                href="/shop"
                                className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                            >
                                Shop All Products
                            </Link>
                        </div>

                        <form
                            action="/shop"
                            className="flex flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-zinc-200 md:flex-row"
                        >
                            <input
                                name="query"
                                placeholder="Search Allwear products..."
                                className="min-h-14 flex-1 rounded-[1.3rem] px-5 text-base font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
                            />

                            <button
                                type="submit"
                                className="rounded-[1.3rem] bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                            >
                                Search
                            </button>
                        </form>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {[
                                "Activewear",
                                "Comrades",
                                "Bafana Bafana",
                                "T-Shirts",
                                "Golfers",
                                "New Arrivals",
                            ].map((item) => (
                                <Link
                                    key={item}
                                    href="/shop"
                                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-950 hover:text-white"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <Link
                                href="/shop"
                                className="rounded-[2rem] bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Shop
                                </p>

                                <h3 className="mt-3 text-2xl font-black text-zinc-950">
                                    Online products
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-500">
                                    Browse available products, select sizes and checkout
                                    online.
                                </p>
                            </Link>

                            <Link
                                href="/shop"
                                className="rounded-[2rem] bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Browse
                                </p>

                                <h3 className="mt-3 text-2xl font-black text-zinc-950">
                                    Collections
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-500">
                                    Explore activewear, event ranges and future Allwear
                                    divisions.
                                </p>
                            </Link>

                            <Link
                                href="/cart"
                                className="rounded-[2rem] bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Checkout
                                </p>

                                <h3 className="mt-3 text-2xl font-black text-zinc-950">
                                    Cart & orders
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-500">
                                    Add products to cart, checkout and view your order
                                    history.
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* HUB DIVISIONS */}
            <section id="divisions" className="site-container py-20">
                <div className="mb-10 flex items-end justify-between gap-6">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Shop by division
                        </p>

                        <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                            Allwear in one place.
                        </h2>

                        <p className="mt-4 max-w-3xl text-zinc-600">
                            Start with the current collections, then expand the
                            same platform into schoolwear, workwear, corporate
                            apparel and fashion basics.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="hidden rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white md:inline-flex"
                    >
                        Shop All
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {hubDivisions.map((card) => (
                        <Link
                            href={getCategoryHref(card.categoryName)}
                            key={card.title}
                            className="group relative min-h-[520px] overflow-hidden rounded-[2rem] bg-zinc-100 p-8"
                        >
                            <Image
                                src={card.image}
                                alt={card.title}
                                fill
                                className="object-cover object-top transition duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />

                            <div className="relative z-10 flex h-full flex-col justify-end">
                                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    {card.label}
                                </p>

                                <h3 className="text-3xl font-black text-white">
                                    {card.title}
                                </h3>

                                <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-200">
                                    {card.description}
                                </p>

                                <span className="mt-5 inline-flex w-fit rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950 transition group-hover:bg-[#6FC276] group-hover:text-white">
                                    Shop Now
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* FUTURE DIVISIONS */}
            <section className="bg-zinc-100">
                <div className="site-container py-20">
                    <div className="mb-10 max-w-5xl">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Coming to the Hub
                        </p>

                        <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-6xl">
                            Built to become Allwear’s complete digital
                            storefront.
                        </h2>

                        <p className="mt-5 max-w-4xl text-zinc-600">
                            The current Allwear Active site can grow into a
                            Bash-style product platform for every Allwear
                            division, without losing the shop and checkout
                            system we already have.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-4">
                        {futureDivisions.map((division) => (
                            <div
                                key={division}
                                className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200"
                            >
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
                                    Future Division
                                </p>

                                <h3 className="mt-3 text-2xl font-black text-zinc-950">
                                    {division}
                                </h3>

                                <p className="mt-4 text-sm leading-6 text-zinc-500">
                                    Product ranges, catalogue pages, quote
                                    support and online shopping can be added
                                    here next.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CREDIBILITY */}
            <section className="site-container py-20">
                <div className="rounded-[3rem] bg-zinc-950 p-8 text-white md:p-14">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        More than activewear
                    </p>

                    <h2 className="mt-4 max-w-6xl text-4xl font-black tracking-tight md:text-6xl">
                        A modern digital sales platform for Allwear’s full
                        product capability.
                    </h2>

                    <div className="mt-10 grid gap-5 md:grid-cols-4">
                        {[
                            "Online product browsing",
                            "Cart and checkout ready",
                            "Category-driven shopping",
                            "Expandable product divisions",
                        ].map((item) => (
                            <div
                                key={item}
                                className="rounded-3xl bg-white/10 p-6"
                            >
                                <p className="text-lg font-black">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-zinc-100">
                <div className="site-container flex flex-col items-center py-20 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Ready to shop?
                    </p>

                    <h2 className="mt-4 max-w-5xl text-4xl font-black tracking-tight text-zinc-950 md:text-6xl">
                        Explore the first version of Allwear Hub.
                    </h2>

                    <Link
                        href="/shop"
                        className="mt-8 rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                    >
                        Go to Shop
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}