import Link from "next/link";
import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "Size Guide | Allwear Active",
    description:
        "Compare Allwear Active garment measurements and choose your best fit.",
};

const sizes = [
    ["XS", "47 cm", "65 cm", "41 cm", "19 cm"],
    ["S", "50 cm", "68 cm", "43 cm", "20 cm"],
    ["M", "53 cm", "71 cm", "45 cm", "21 cm"],
    ["L", "56 cm", "74 cm", "47 cm", "22 cm"],
    ["XL", "59 cm", "77 cm", "49 cm", "23 cm"],
    ["2XL", "62 cm", "80 cm", "51 cm", "24 cm"],
    ["3XL", "65 cm", "83 cm", "53 cm", "25 cm"],
];

export default function SizeGuidePage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-zinc-950 px-4 py-14 text-white sm:py-20">
                <div className="mx-auto w-full max-w-5xl">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Find your fit
                    </p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                        Size Guide
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                        Compare these garment measurements with an item you already
                        own and love. Measurements are approximate and shown in
                        centimetres.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
                <div className="overflow-x-auto rounded-[2rem] border border-zinc-100 shadow-sm">
                    <table className="w-full min-w-[680px] border-collapse text-left">
                        <thead className="bg-[#6FC276] text-white">
                            <tr>
                                {["Size", "Chest", "Length", "Shoulder", "Sleeve"].map((heading) => (
                                    <th key={heading} className="px-5 py-4 text-xs font-black uppercase tracking-wider">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sizes.map(([size, chest, length, shoulder, sleeve]) => (
                                <tr key={size} className="bg-white even:bg-zinc-50">
                                    <td className="px-5 py-4 font-black text-zinc-950">{size}</td>
                                    <td className="px-5 py-4 text-zinc-600">{chest}</td>
                                    <td className="px-5 py-4 text-zinc-600">{length}</td>
                                    <td className="px-5 py-4 text-zinc-600">{shoulder}</td>
                                    <td className="px-5 py-4 text-zinc-600">{sleeve}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 rounded-[2rem] bg-zinc-50 p-6 ring-1 ring-zinc-100 sm:p-8">
                    <h2 className="text-xl font-black text-zinc-950">How to measure</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                        Lay a similar garment flat without stretching it. Measure the
                        chest from underarm to underarm, the length from the highest
                        shoulder point to the hem, and the sleeve from the shoulder seam.
                        If you fall between sizes, choose the larger size for a more
                        relaxed fit.
                    </p>
                    <Link
                        href="/shop"
                        className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                    >
                        Continue shopping
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
