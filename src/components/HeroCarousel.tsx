"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
    {
        eyebrow: "Allwear Active Presents",
        title: "MOVE WITH PURPOSE",
        subtitle: "Performance apparel made for training, movement, and everyday wear.",
        image: "/images/hero-active.jpg",
        primaryLabel: "Shop",
        primaryHref: "/shop",
        secondaryLabel: "Explore",
        secondaryHref: "/categories",
    },
    {
        eyebrow: "New Collection",
        title: "HORNS OVER HAKA",
        subtitle: "Supporter merch, New Zealand Tour",
        image: "/images/hero-training.jpg",
        primaryLabel: "Shop All",
        primaryHref: "/men",
    },
];

export default function HeroCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeSlide = slides[activeIndex];

    useEffect(() => {
    const timer = setInterval(() => {
        setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setActiveIndex((current) => (current + 1) % slides.length);
    };

    const previousSlide = () => {
        setActiveIndex((current) =>
            current === 0 ? slides.length - 1 : current - 1
        );
    };

    return (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-black">
            <div className="relative min-h-[560px] w-full sm:min-h-[640px] lg:min-h-[760px]">
                <Image
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/65" />

                <div className="absolute inset-x-0 bottom-16 z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center text-white">
                    <p className="mb-3 text-sm font-bold tracking-tight">
                        {activeSlide.eyebrow}
                    </p>

                    <h1 className="max-w-4xl text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
                        {activeSlide.title}
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm font-semibold sm:text-base">
                        {activeSlide.subtitle}
                    </p>

                    <div className="mt-7 flex gap-3">
                        <Link
                            href={activeSlide.primaryHref}
                            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-[#6FC276] hover:text-white"
                        >
                            {activeSlide.primaryLabel}
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2 rounded-full transition-all ${
                                activeIndex === index
                                    ? "w-6 bg-white"
                                    : "w-2 bg-white/50"
                            }`}
                        />
                    ))}
                </div>

                <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
                    <button
                        onClick={previousSlide}
                        aria-label="Previous slide"
                        className="grid h-10 w-15 place-items-center rounded-full bg-white text-xl font-black text-black transition hover:bg-[#6FC276] hover:text-white"
                    >
                        ‹
                    </button>

                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="grid h-10 w-15 place-items-center rounded-full bg-white text-xl font-black text-black transition hover:bg-[#6FC276] hover:text-white"
                    >
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
}