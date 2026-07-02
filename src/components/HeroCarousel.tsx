"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
    {
        eyebrow: "Allwear Active Presents",
        title: "MOVE WITH PURPOSE",
        subtitle: "Performance apparel made for training, movement, and everyday wear.",
        image: "/images/active.png",
        primaryLabel: "Shop",
        primaryHref: "/shop",
    },
    {
        eyebrow: "New Collection",
        title: "HORNS OVER HAKA",
        subtitle: "Supporter merch, New Zealand Tour",
        image: "/images/hero-training.png",
        primaryLabel: "Shop",
        primaryHref: "/shop",
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
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-white">
            <div className="relative aspect-[16/9] w-full bg-white">
                <Image
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="100vw"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/85" />

                <div className="absolute inset-x-0 bottom-[clamp(0.65rem,4vw,4rem)] z-10 mx-auto flex max-w-[min(90vw,64rem)] flex-col items-center px-[clamp(0.75rem,3vw,1.5rem)] text-center text-white">
                    <p className="mb-[clamp(0.15rem,0.8vw,0.75rem)] text-[clamp(0.5rem,1.4vw,0.875rem)] font-bold tracking-tight">
                        {activeSlide.eyebrow}
                    </p>

                    <h1 className="max-w-[min(85vw,56rem)] text-[clamp(1rem,5.7vw,5.5rem)] font-black uppercase leading-none tracking-tight">
                        {activeSlide.title}
                    </h1>

                    <p className="mt-[clamp(0.25rem,1.3vw,1rem)] max-w-[min(80vw,42rem)] text-[clamp(0.55rem,1.4vw,1rem)] font-semibold leading-snug">
                        {activeSlide.subtitle}
                    </p>

                    {activeSlide.primaryHref && activeSlide.primaryLabel && (
                        <div className="mt-[clamp(0.45rem,2.2vw,1.75rem)] flex gap-[clamp(0.35rem,1vw,0.75rem)]">
                            <Link
                                href={activeSlide.primaryHref}
                                className="rounded-full bg-white px-[clamp(0.65rem,2vw,1.5rem)] py-[clamp(0.35rem,1vw,0.75rem)] text-[clamp(0.55rem,1.3vw,0.875rem)] font-bold text-black transition hover:bg-[#6FC276] hover:text-white"
                            >
                                {activeSlide.primaryLabel}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-[clamp(0.35rem,1.8vw,2rem)] left-1/2 z-20 flex -translate-x-1/2 gap-[clamp(0.2rem,0.8vw,0.5rem)]">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-[clamp(0.25rem,0.65vw,0.5rem)] rounded-full transition-all ${
                                activeIndex === index
                                    ? "w-[clamp(0.75rem,2vw,1.5rem)] bg-white"
                                    : "w-[clamp(0.25rem,0.65vw,0.5rem)] bg-white/50"
                            }`}
                        />
                    ))}
                </div>

                <div className="absolute bottom-[clamp(0.8rem,2.5vw,2rem)] right-[clamp(0.8rem,2.5vw,2rem)] z-20 hidden items-center gap-[clamp(0.4rem,1vw,0.75rem)] sm:flex">
                    <button
                        onClick={previousSlide}
                        aria-label="Previous slide"
                        className="grid h-[clamp(2rem,3vw,2.75rem)] w-[clamp(2rem,3vw,2.75rem)] place-items-center rounded-full bg-white/90 text-[clamp(0.9rem,1.5vw,1.25rem)] font-black text-black shadow-lg transition hover:scale-105 hover:bg-[#6FC276] hover:text-white"
                    >
                        ←
                    </button>

                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="grid h-[clamp(2rem,3vw,2.75rem)] w-[clamp(2rem,3vw,2.75rem)] place-items-center rounded-full bg-white/90 text-[clamp(0.9rem,1.5vw,1.25rem)] font-black text-black shadow-lg transition hover:scale-105 hover:bg-[#6FC276] hover:text-white"
                    >
                        →
                    </button>
                </div>
            </div>
        </section>
    );
}