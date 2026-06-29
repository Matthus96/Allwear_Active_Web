"use client";

type MeasurementSheetProps = {
    open: boolean;
    size: string;
    onClose: () => void;
};

const measurements: Record<
    string,
    {
        chest: string;
        length: string;
        shoulder: string;
        sleeve: string;
    }
> = {
    XS: {
        chest: "47 cm",
        length: "65 cm",
        shoulder: "41 cm",
        sleeve: "19 cm",
    },

    S: {
        chest: "50 cm",
        length: "68 cm",
        shoulder: "43 cm",
        sleeve: "20 cm",
    },
    M: {
        chest: "53 cm",
        length: "71 cm",
        shoulder: "45 cm",
        sleeve: "21 cm",
    },
    L: {
        chest: "56 cm",
        length: "74 cm",
        shoulder: "47 cm",
        sleeve: "22 cm",
    },
    XL: {
        chest: "59 cm",
        length: "77 cm",
        shoulder: "49 cm",
        sleeve: "23 cm",
    },
    "2XL": {
        chest: "62 cm",
        length: "80 cm",
        shoulder: "51 cm",
        sleeve: "24 cm",
    },

    "3XL": {
        chest: "65 cm",
        length: "83 cm",
        shoulder: "53 cm",
        sleeve: "25 cm",
    },
};

export default function MeasurementSheet({
    open,
    size,
    onClose,
}: MeasurementSheetProps) {
    if (!open) return null;

    const data = measurements[size];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 px-4 md:items-center">
            <div className="w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl md:rounded-[2rem]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Size guide
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-zinc-950">
                            Size {size}
                        </h2>

                        <p className="mt-2 text-sm text-zinc-500">
                            Please check the garment measurements before adding
                            this item to your cart.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-950"
                    >
                        ×
                    </button>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-100">
                    <div className="grid grid-cols-2 bg-zinc-950 px-4 py-3 text-sm font-black text-white">
                        <span>Measurement</span>
                        <span>Value</span>
                    </div>

                    <div className="divide-y divide-zinc-100">
                        <div className="grid grid-cols-2 px-4 py-3 text-sm">
                            <span className="font-bold text-zinc-600">
                                Chest
                            </span>
                            <span className="font-black text-zinc-950">
                                {data?.chest ?? "N/A"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 px-4 py-3 text-sm">
                            <span className="font-bold text-zinc-600">
                                Length
                            </span>
                            <span className="font-black text-zinc-950">
                                {data?.length ?? "N/A"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 px-4 py-3 text-sm">
                            <span className="font-bold text-zinc-600">
                                Shoulder
                            </span>
                            <span className="font-black text-zinc-950">
                                {data?.shoulder ?? "N/A"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 px-4 py-3 text-sm">
                            <span className="font-bold text-zinc-600">
                                Sleeve
                            </span>
                            <span className="font-black text-zinc-950">
                                {data?.sleeve ?? "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-full bg-[#6FC276] px-6 py-4 text-sm font-black uppercase tracking-wide text-white"
                >
                    Confirm size
                </button>
            </div>
        </div>
    );
}