import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BulkOrdersPage() {
    return (
        <main className="min-h-screen bg-[#F4F1EA]">
            <Navbar />

            <section className="mx-auto max-w-5xl px-5 py-20">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                    Allwear Business
                </p>

                <h1 className="mt-4 text-5xl font-black tracking-tight text-zinc-950 md:text-7xl">
                    Bulk Order Enquiry
                </h1>

                <p className="mt-5 max-w-2xl text-zinc-600">
                    This page will hold the bulk order enquiry form.
                </p>

                <Link
                    href="/business"
                    className="mt-8 inline-flex rounded-full bg-zinc-950 px-6 py-3 font-black text-white"
                >
                    Back to Business
                </Link>
            </section>

            <Footer />
        </main>
    );
}