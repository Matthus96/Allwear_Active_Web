"use client";

import { useMemo, useState } from "react";

type ProductImageCarouselProps = {
    productName: string;

    frontImage?: string;
    backImage?: string;

    modelFrontImage?: string;
    modelSideImage?: string;
    modelBackImage?: string;
    modelCloseupImage?: string;
};

export default function ProductImageCarousel({
    frontImage,
    backImage,
    modelFrontImage,
    modelSideImage,
    modelBackImage,
    modelCloseupImage,
}: ProductImageCarouselProps) {
    const images = useMemo(() => {
        return [
            modelFrontImage ? { label: "Model Front", url: modelFrontImage } : null,
            modelSideImage ? { label: "Model Side", url: modelSideImage } : null,
            modelBackImage ? { label: "Model Back", url: modelBackImage } : null,
            modelCloseupImage ? { label: "Close-up", url: modelCloseupImage } : null,
            frontImage ? { label: "Product Front", url: frontImage } : null,
            backImage ? { label: "Product Back", url: backImage } : null,
        ].filter(Boolean) as { label: string; url: string }[];
    }, [
        modelFrontImage,
        modelSideImage,
        modelBackImage,
        modelCloseupImage,
        frontImage,
        backImage,
    ]);

    const [activeIndex, setActiveIndex] = useState(0);

    if (!images.length) {
        return (
            <div className="flex h-[420px] items-center justify-center rounded-[2rem] bg-zinc-50 sm:h-[520px]">
                <p className="text-sm font-bold text-zinc-400">
                    No product image available
                </p>
            </div>
        );
    }

    const activeImage = images[activeIndex];

    const goPrevious = () => {
        setActiveIndex((current) =>
            current === 0 ? images.length - 1 : current - 1
        );
    };

    const goNext = () => {
        setActiveIndex((current) =>
            current === images.length - 1 ? 0 : current + 1
        );
    };

    return (
        <div className="w-full min-w-0 space-y-4 sm:space-y-5">
            <div className="relative flex h-[460px] w-full items-center justify-center overflow-hidden rounded-[2rem] bg-white p-4 ring-1 ring-zinc-100 sm:h-[620px] sm:p-6 lg:h-[720px]">
                <img
                    src={activeImage.url}
                    alt={`${activeImage.label}`}
                    className="block max-h-full max-w-full object-contain object-center transition duration-300"
                />

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrevious}
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-zinc-950 shadow-md transition hover:scale-105 sm:left-5 sm:h-11 sm:w-11"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-black text-zinc-950 shadow-md transition hover:scale-105 sm:right-5 sm:h-11 sm:w-11"
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex w-full snap-x gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image, index) => {
                        const active = index === activeIndex;

                        return (
                            <button
                                type="button"
                                key={`${image.label}-${image.url}`}
                                onClick={() => setActiveIndex(index)}
                                className={`flex h-24 w-20 shrink-0 snap-start items-center justify-center overflow-hidden rounded-xl border bg-white p-1 transition sm:h-28 sm:w-24 sm:rounded-2xl ${
                                    active
                                        ? "border-[#6FC276]"
                                        : "border-zinc-100 hover:border-zinc-300"
                                }`}
                            >
                                <img
                                    src={image.url}
                                    alt={`${image.label} thumbnail`}
                                    className="block max-h-full max-w-full object-contain object-center"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}