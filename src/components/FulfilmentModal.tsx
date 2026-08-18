"use client";

import { useEffect } from "react";

type FulfilmentMethod = "collection" | "delivery";

type FulfilmentModalProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (method: FulfilmentMethod) => void;
};

export default function FulfilmentModal({
    open,
    onClose,
    onSelect,
}: FulfilmentModalProps) {
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fulfilment-modal-title"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                    onClose();
                }
            }}
        >
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-zinc-950 hover:text-white"
                >
                    ×
                </button>

                <div className="bg-zinc-950 px-6 py-8 text-white sm:px-8">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6FC276]">
                        Checkout
                    </p>

                    <h2
                        id="fulfilment-modal-title"
                        className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl"
                    >
                        How would you like to receive your order?
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
                        Choose one option to continue. Payment only becomes
                        available after a fulfilment method has been selected.
                    </p>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                    <button
                        type="button"
                        onClick={() => onSelect("collection")}
                        className="group rounded-[1.5rem] border border-zinc-200 bg-white p-5 text-left transition hover:border-[#6FC276] hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Pickup
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-zinc-950">
                                    Collect
                                </h3>
                            </div>

                            <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-700">
                                FREE
                            </span>
                        </div>

                        <div className="mt-5 text-sm font-bold leading-6 text-zinc-600">
                            <p>Allwear Factory Shop</p>
                            <p>55 Albert Wessels Drive</p>
                            <p>Riverside Industrial</p>
                            <p>Newcastle</p>
                        </div>

                        <p className="mt-5 text-sm font-black text-zinc-950 transition group-hover:text-[#6FC276]">
                            Choose collection →
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelect("delivery")}
                        className="group rounded-[1.5rem] border border-zinc-200 bg-white p-5 text-left transition hover:border-[#6FC276] hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                    Courier
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-zinc-950">
                                    Deliver
                                </h3>
                            </div>

                            <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-700">
                                R100
                            </span>
                        </div>

                        <p className="mt-5 text-sm font-bold leading-6 text-zinc-600">
                            Continue to enter or select your delivery address.
                            The flat delivery fee is added at checkout.
                        </p>

                        <p className="mt-5 text-sm font-black text-zinc-950 transition group-hover:text-[#6FC276]">
                            Choose delivery →
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
}
