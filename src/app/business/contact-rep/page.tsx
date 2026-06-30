import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Rep = {
    name: string;
    role: string;
    region?: string;
    phone: string;
    shortCode?: string;
    email?: string;
    image?: string;
};

const reps: Rep[] = [
    {
        name: "Anton Sprake",
        role: "Representative",
        region: "Windhoek",
        phone: "00264 6124 0958",
        shortCode: "*785179",
    },
    {
        name: "Anton Sprake",
        role: "Representative",
        region: "Windhoek",
        phone: "00264 8112 7818",
        shortCode: "*785180",
    },
    {
        name: "Arthur Moore",
        role: "Representative",
        region: "Cape Town",
        phone: "021 555 4732",
        shortCode: "*785182",
    },
    {
        name: "Arthur Moore",
        role: "Representative",
        region: "Cape Town",
        phone: "021 780 9003",
        shortCode: "*785183",
    },
    {
        name: "Cathy Labuschagne",
        role: "Representative",
        region: "Pretoria",
        phone: "082 903 6791",
        shortCode: "*785189",
    },
    {
        name: "Colin Palmer",
        role: "Representative",
        region: "Johannesburg",
        phone: "083 377 4833",
        shortCode: "*785028",
    },
    {
        name: "Elan Fister",
        role: "Representative",
        region: "Bloemfontein",
        phone: "082 825 8291",
        shortCode: "*785177",
    },
    {
        name: "Megan",
        role: "Representative",
        phone: "072 385 4729",
    },
    {
        name: "Fonnie Labuschagne",
        role: "Representative",
        region: "Pretoria",
        phone: "082 903 6790",
        shortCode: "*785181",
    },
    {
        name: "Ian Robertson",
        role: "Representative",
        region: "Durban",
        phone: "031 109 2999",
        shortCode: "*785014",
    },
    {
        name: "Ian Robertson",
        role: "Representative",
        region: "Durban",
        phone: "082 496 7219",
        shortCode: "*785015",
    },
    {
        name: "Jacques Visagie",
        role: "Representative",
        region: "Potch",
        phone: "079 414 0038",
        shortCode: "*785027",
    },
    {
        name: "John Cillie",
        role: "Representative",
        region: "East London",
        phone: "041 378 1094",
        shortCode: "*785019",
    },
    {
        name: "John Cillie",
        role: "Sol Representative",
        region: "East London",
        phone: "082 557 3604",
        shortCode: "*785020",
    },
    {
        name: "Keith van Rooyen",
        role: "Representative",
        region: "JHB / PTA Clients",
        phone: "011 706 6685 / 011 706 4495",
        shortCode: "*785033",
    },
    {
        name: "Robin",
        role: "Representative",
        phone: "083 328 1465",
        shortCode: "*785078",
    },
    {
        name: "Keith van Rooyen",
        role: "Representative",
        phone: "083 225 9938",
        shortCode: "*785034",
    },
    {
        name: "Malcolm Palmer",
        role: "Representative",
        phone: "083 606 4584",
        shortCode: "*785081",
    },
    {
        name: "Roy Nell",
        role: "Representative",
        region: "Durban",
        phone: "031 109 2999",
        shortCode: "*785025",
    },
    {
        name: "Roy Nell",
        role: "Sol Representative",
        phone: "066 440 892",
        shortCode: "*785026",
    },
    {
        name: "Willie Jay Jonker",
        role: "Representative",
        phone: "082 363 0955",
        shortCode: "*785006",
    },
];

const getInitials = (name: string) => {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const getTelHref = (phone: string) => {
    const firstNumber = phone.split("/")[0] || phone;

    return `tel:${firstNumber.replace(/[^\d+]/g, "")}`;
};

export default function ContactRepPage() {
    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F4F1EA] text-zinc-950">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-20 text-white md:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.28),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-[#6FC276]">
                        Allwear Business
                    </p>

                    <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-8xl">
                        Speak to a rep.
                    </h1>

                    <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                        Connect with an Allwear representative for bulk orders,
                        sample requests, sizing guidance, branding options and
                        organisational supply support.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/business/bulk-orders"
                            className="inline-flex justify-center rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
                        >
                            Start Bulk Order
                        </Link>

                        <Link
                            href="/business/sample-request"
                            className="inline-flex justify-center rounded-full bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white ring-1 ring-white/20 transition hover:bg-white hover:text-zinc-950"
                        >
                            Request Samples
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Representatives
                        </p>

                        <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                            Dedicated support for your organisation.
                        </h2>
                    </div>

                    <Link
                        href="/business"
                        className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                    >
                        Back to Business
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {reps.map((rep, index) => (
                        <article
                            key={`${rep.name}-${rep.phone}-${index}`}
                            className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="grid gap-0 lg:grid-cols-[190px_1fr]">
                                <div className="relative flex min-h-56 items-center justify-center bg-zinc-950 lg:min-h-full">
                                    {rep.image ? (
                                        <img
                                            src={rep.image}
                                            alt={rep.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6FC276] text-3xl font-black text-white">
                                            {getInitials(rep.name)}
                                        </div>
                                    )}
                                </div>

                                <div className="p-7 md:p-8">
                                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                                        Allwear Rep
                                    </p>

                                    <h3 className="mt-4 text-3xl font-black text-zinc-950">
                                        {rep.name}
                                    </h3>

                                    <p className="mt-2 text-base font-bold text-zinc-600">
                                        {rep.role}
                                    </p>

                                    {rep.region ? (
                                        <p className="mt-4 text-sm leading-7 text-zinc-500">
                                            Region: {rep.region}
                                        </p>
                                    ) : null}

                                    <div className="mt-6 space-y-3 rounded-2xl bg-[#F4F1EA] p-5 ring-1 ring-black/5">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                                Phone
                                            </p>

                                            <a
                                                href={getTelHref(rep.phone)}
                                                className="mt-1 block font-black text-zinc-950"
                                            >
                                                {rep.phone}
                                            </a>
                                        </div>

                                        {rep.shortCode ? (
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                                    Short Code
                                                </p>

                                                <p className="mt-1 font-black text-zinc-950">
                                                    {rep.shortCode}
                                                </p>
                                            </div>
                                        ) : null}

                                        {rep.email ? (
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                                    Email
                                                </p>

                                                <a
                                                    href={`mailto:${rep.email}`}
                                                    className="mt-1 block break-words font-black text-zinc-950"
                                                >
                                                    {rep.email}
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href={getTelHref(rep.phone)}
                                            className="inline-flex justify-center rounded-full bg-[#6FC276] px-6 py-3 text-sm font-black text-white transition hover:bg-zinc-950"
                                        >
                                            Call Rep
                                        </a>

                                        {rep.email ? (
                                            <a
                                                href={`mailto:${rep.email}`}
                                                className="inline-flex justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                                            >
                                                Email Rep
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-16">
                <div className="rounded-[3rem] bg-zinc-950 p-8 text-white md:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Not sure who to contact?
                    </p>

                    <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        Send one message and we’ll route your enquiry.
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        Tell us what your business or organisation needs, and
                        the right Allwear representative will assist with the
                        next steps.
                    </p>

                    <a
                        href="mailto:sales@allwear.co.za"
                        className="mt-8 inline-flex rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
                    >
                        Email Sales Team
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}