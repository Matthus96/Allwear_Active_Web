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
    productName,
    frontImage,
    backImage,
    modelFrontImage,
    modelSideImage,
    modelBackImage,
    modelCloseupImage,
}: ProductImageCarouselProps) {
    const images = useMemo(() => {
        return [
            modelFrontImage
                ? {
                      label: "Model Front",
                      url: modelFrontImage,
                  }
                : null,

            modelSideImage
                ? {
                      label: "Model Side",
                      url: modelSideImage,
                  }
                : null,

            modelBackImage
                ? {
                      label: "Model Back",
                      url: modelBackImage,
                  }
                : null,

            modelCloseupImage
                ? {
                      label: "Close-up",
                      url: modelCloseupImage,
                  }
                : null,

            frontImage
                ? {
                      label: "Product Front",
                      url: frontImage,
                  }
                : null,

            backImage
                ? {
                      label: "Product Back",
                      url: backImage,
                  }
                : null,
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
            <div className="flex min-h-[520px] items-center justify-center rounded-[2rem] bg-zinc-50">
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
        <div className="space-y-5">
            <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[2rem] bg-zinc-50 p-6">
                <img
                    src={activeImage.url}
                    alt={`${productName} ${activeImage.label}`}
                    className="max-h-[680px] w-full object-contain transition duration-300"
                />

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrevious}
                            className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl font-black text-zinc-950 shadow-md transition hover:scale-105"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl font-black text-zinc-950 shadow-md transition hover:scale-105"
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </>
                )}

                <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-zinc-950 shadow-sm">
                    {activeImage.label}
                </div>
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {images.map((image, index) => {
                        const active = index === activeIndex;

                        return (
                            <button
                                type="button"
                                key={`${image.label}-${image.url}`}
                                onClick={() => setActiveIndex(index)}
                                className={`flex h-24 items-center justify-center overflow-hidden rounded-2xl border p-2 transition ${
                                    active
                                        ? "border-[#6FC276] bg-[#6FC276]/10"
                                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-300"
                                }`}
                            >
                                <img
                                    src={image.url}
                                    alt={`${productName} ${image.label} thumbnail`}
                                    className="h-full w-full object-contain"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}