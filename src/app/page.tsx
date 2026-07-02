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
                <div className="site-container py-[clamp(2.5rem,6vw,4rem)]">
                    <div className="rounded-[clamp(1.5rem,4vw,3rem)] bg-zinc-100 p-[clamp(1rem,3vw,2.5rem)]">
                        <div className="mb-[clamp(1.5rem,4vw,2rem)] flex flex-col justify-between gap-[clamp(1rem,3vw,1.5rem)] md:flex-row md:items-end">
                            <div>
                                <h2 className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(1.75rem,5vw,3rem)] font-black leading-none tracking-tight text-zinc-950">
                                    What are you looking for?
                                </h2>

                                <p className="mt-[clamp(0.75rem,2vw,1rem)] max-w-3xl text-[clamp(0.85rem,2vw,1rem)] leading-6 text-zinc-600">
                                    Search collections, browse product ranges or jump
                                    straight into the Allwear shop.
                                </p>
                            </div>

                            <Link
                                href="/shop"
                                className="w-fit rounded-full bg-zinc-950 px-[clamp(1.25rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,0.75rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-white transition hover:bg-[#6FC276]"
                            >
                                Shop All Products
                            </Link>
                        </div>

                        <form
                            action="/shop"
                            className="flex flex-col gap-[clamp(0.5rem,1.5vw,0.75rem)] rounded-[clamp(1.25rem,3vw,2rem)] bg-white p-[clamp(0.5rem,1.2vw,0.75rem)] shadow-sm ring-1 ring-zinc-200 md:flex-row"
                        >
                            <input
                                name="query"
                                placeholder="Search Allwear products..."
                                className="min-h-[clamp(2.8rem,6vw,3.5rem)] flex-1 rounded-[clamp(0.9rem,2vw,1.3rem)] px-[clamp(1rem,3vw,1.25rem)] text-[clamp(0.85rem,2vw,1rem)] font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
                            />

                            <button
                                type="submit"
                                className="rounded-[clamp(0.9rem,2vw,1.3rem)] bg-[#6FC276] px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.8rem,2vw,1rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                            >
                                Search
                            </button>
                        </form>

                        <div className="mt-[clamp(1rem,3vw,1.5rem)] flex flex-wrap gap-[clamp(0.5rem,1.5vw,0.75rem)]">
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
                                    className="rounded-full bg-white px-[clamp(1rem,2.5vw,1.25rem)] py-[clamp(0.65rem,1.5vw,0.75rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-950 hover:text-white"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-[clamp(1.5rem,4vw,2rem)] grid gap-[clamp(1rem,3vw,1.5rem)] md:grid-cols-3">
                            <Link
                                href="/shop"
                                className="rounded-[clamp(1.25rem,3vw,2rem)] bg-white p-[clamp(1rem,3vw,1.5rem)] ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Shop
                                </p>

                                <h3 className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(1.25rem,3vw,1.5rem)] font-black leading-tight text-zinc-950">
                                    Online products
                                </h3>

                                <p className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(0.8rem,1.8vw,0.875rem)] leading-6 text-zinc-500">
                                    Browse available products, select sizes and checkout
                                    online.
                                </p>
                            </Link>

                            <Link
                                href="/shop"
                                className="rounded-[clamp(1.25rem,3vw,2rem)] bg-white p-[clamp(1rem,3vw,1.5rem)] ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Browse
                                </p>

                                <h3 className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(1.25rem,3vw,1.5rem)] font-black leading-tight text-zinc-950">
                                    Collections
                                </h3>

                                <p className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(0.8rem,1.8vw,0.875rem)] leading-6 text-zinc-500">
                                    Explore activewear, event ranges and future Allwear
                                    divisions.
                                </p>
                            </Link>

                            <Link
                                href="/cart"
                                className="rounded-[clamp(1.25rem,3vw,2rem)] bg-white p-[clamp(1rem,3vw,1.5rem)] ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Checkout
                                </p>

                                <h3 className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(1.25rem,3vw,1.5rem)] font-black leading-tight text-zinc-950">
                                    Cart & orders
                                </h3>

                                <p className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(0.8rem,1.8vw,0.875rem)] leading-6 text-zinc-500">
                                    Add products to cart, checkout and view your order
                                    history.
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* HUB DIVISIONS */}
            <section id="divisions" className="site-container py-[clamp(2.5rem,6vw,5rem)]">
                <div className="mb-[clamp(1.5rem,4vw,2.5rem)] flex flex-col items-start justify-between gap-[clamp(1rem,3vw,1.5rem)] md:flex-row md:items-end">
                    <div>
                        <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Shop by division
                        </p>

                        <h2 className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(1.75rem,5vw,3rem)] font-black leading-none tracking-tight text-zinc-950">
                            Allwear in one place.
                        </h2>

                        <p className="mt-[clamp(0.75rem,2vw,1rem)] max-w-3xl text-[clamp(0.85rem,2vw,1rem)] leading-6 text-zinc-600">
                            Start with the current collections, then expand the
                            same platform into schoolwear, workwear, corporate
                            apparel and fashion basics.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="hidden rounded-full bg-zinc-950 px-[clamp(1.25rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,0.75rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-white md:inline-flex"
                    >
                        Shop All
                    </Link>
                </div>

                <div className="grid gap-[clamp(1rem,3vw,1.5rem)] md:grid-cols-3">
                    {hubDivisions.map((card) => (
                        <Link
                            href={getCategoryHref(card.categoryName)}
                            key={card.title}
                            className="group relative min-h-[clamp(20rem,60vw,32.5rem)] overflow-hidden rounded-[clamp(1.25rem,3vw,2rem)] bg-zinc-100 p-[clamp(1.25rem,3vw,2rem)]"
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
                                <p className="mb-[clamp(0.5rem,1.5vw,0.75rem)] text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    {card.label}
                                </p>

                                <h3 className="text-[clamp(1.5rem,4vw,1.875rem)] font-black leading-none text-white">
                                    {card.title}
                                </h3>

                                <p className="mt-[clamp(0.6rem,1.5vw,0.75rem)] max-w-xs text-[clamp(0.8rem,1.8vw,0.875rem)] leading-6 text-zinc-200">
                                    {card.description}
                                </p>

                                <span className="mt-[clamp(1rem,2.5vw,1.25rem)] inline-flex w-fit rounded-full bg-white px-[clamp(1rem,2.5vw,1.25rem)] py-[clamp(0.65rem,1.5vw,0.75rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black text-zinc-950 transition group-hover:bg-[#6FC276] group-hover:text-white">
                                    Shop Now
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* FUTURE DIVISIONS */}
            <section className="bg-zinc-100">
                <div className="site-container py-[clamp(2.5rem,6vw,5rem)]">
                    <div className="mb-[clamp(1.5rem,4vw,2.5rem)] max-w-5xl">
                        <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Coming to the Hub
                        </p>

                        <h2 className="mt-[clamp(0.75rem,2vw,1rem)] text-[clamp(1.75rem,5vw,3.75rem)] font-black leading-none tracking-tight text-zinc-950">
                            Built to become Allwear’s complete digital
                            storefront.
                        </h2>

                        <p className="mt-[clamp(0.9rem,2vw,1.25rem)] max-w-4xl text-[clamp(0.85rem,2vw,1rem)] leading-6 text-zinc-600">
                            The current Allwear Active site can grow into a
                            Bash-style product platform for every Allwear
                            division, without losing the shop and checkout
                            system we already have.
                        </p>
                    </div>

                    <div className="grid gap-[clamp(1rem,3vw,1.25rem)] md:grid-cols-4">
                        {futureDivisions.map((division) => (
                            <div
                                key={division}
                                className="rounded-[clamp(1.25rem,3vw,2rem)] bg-white p-[clamp(1rem,3vw,1.5rem)] shadow-sm ring-1 ring-zinc-200"
                            >
                                <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    Future Division
                                </p>

                                <h3 className="mt-[clamp(0.6rem,1.5vw,0.75rem)] text-[clamp(1.25rem,3vw,1.5rem)] font-black leading-tight text-zinc-950">
                                    {division}
                                </h3>

                                <p className="mt-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.8rem,1.8vw,0.875rem)] leading-6 text-zinc-500">
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
            <section className="site-container py-[clamp(2.5rem,6vw,5rem)]">
                <div className="rounded-[clamp(1.5rem,4vw,3rem)] bg-zinc-950 p-[clamp(1.25rem,4vw,3.5rem)] text-white">
                    <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        More than activewear
                    </p>

                    <h2 className="mt-[clamp(0.75rem,2vw,1rem)] max-w-6xl text-[clamp(1.75rem,5vw,3.75rem)] font-black leading-none tracking-tight">
                        A modern digital sales platform for Allwear’s full
                        product capability.
                    </h2>

                    <div className="mt-[clamp(1.5rem,4vw,2.5rem)] grid gap-[clamp(0.75rem,2vw,1.25rem)] md:grid-cols-4">
                        {[
                            "Online product browsing",
                            "Cart and checkout ready",
                            "Category-driven shopping",
                            "Expandable product divisions",
                        ].map((item) => (
                            <div
                                key={item}
                                className="rounded-[clamp(1rem,3vw,1.5rem)] bg-white/10 p-[clamp(1rem,3vw,1.5rem)]"
                            >
                                <p className="text-[clamp(1rem,2.5vw,1.125rem)] font-black leading-tight">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-zinc-100">
                <div className="site-container flex flex-col items-center py-[clamp(2.5rem,6vw,5rem)] text-center">
                    <p className="text-[clamp(0.7rem,1.5vw,0.875rem)] font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Ready to shop?
                    </p>

                    <h2 className="mt-[clamp(0.75rem,2vw,1rem)] max-w-5xl text-[clamp(1.75rem,5vw,3.75rem)] font-black leading-none tracking-tight text-zinc-950">
                        Explore the first version of Allwear Hub.
                    </h2>

                    <Link
                        href="/shop"
                        className="mt-[clamp(1.25rem,3vw,2rem)] rounded-full bg-[#6FC276] px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                    >
                        Go to Shop
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}