import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const businessServices = [
    {
        title: "Bulk Orders",
        description:
            "Order apparel, uniforms and branded products in quantity for teams, companies, schools and organisations.",
        href: "/business/bulk-orders",
        label: "Start Bulk Order",
    },
    {
        title: "Sample Requests",
        description:
            "Request product samples before committing to larger orders, campaigns or rollout quantities.",
        href: "/business/sample-request",
        label: "Request Samples",
    },
    {
        title: "Speak to a Rep",
        description:
            "Get guidance from our team on sizing, branding, lead times, product ranges and order planning.",
        href: "/business/contact-rep",
        label: "Contact a Rep",
    },
];

const audiences = [
    "Schools",
    "Sports Clubs",
    "Companies",
    "Events",
    "Churches",
    "Government Departments",
    "Retailers",
    "Teams",
];

const processSteps = [
    {
        title: "Tell us what you need",
        description:
            "Send your organisation details, product interest, quantities and branding requirements.",
    },
    {
        title: "We review your request",
        description:
            "Our team checks product availability, suitable options, timelines and requirements.",
    },
    {
        title: "Get guided support",
        description:
            "A representative assists with pricing, samples, branding and order planning.",
    },
    {
        title: "Approve and proceed",
        description:
            "Once everything is confirmed, your order moves into production or fulfilment.",
    },
];

export default function BusinessPage() {
    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F4F1EA] text-zinc-950">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-20 text-white md:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.28),transparent_35%)]" />
                <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-black/40 to-transparent" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-[#6FC276]">
                        Allwear Business
                    </p>

                    <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight md:text-8xl">
                        Premium supply solutions for businesses and organisations.
                    </h1>

                    <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                        Bulk orders, sample requests and dedicated representative
                        support for schools, teams, companies, events and
                        organisations.
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
                <div className="mb-8">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Business Services
                    </p>

                    <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        Built for bigger orders and better support.
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {businessServices.map((service) => (
                        <Link
                            key={service.title}
                            href={service.href}
                            className="group rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                                Business
                            </p>

                            <h3 className="mt-4 text-3xl font-black">
                                {service.title}
                            </h3>

                            <p className="mt-4 text-sm leading-7 text-zinc-600">
                                {service.description}
                            </p>

                            <span className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition group-hover:bg-[#6FC276]">
                                {service.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="bg-white px-5 py-12 md:py-16">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Who We Supply
                        </p>

                        <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                            Designed for organisations that need reliability.
                        </h2>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600 md:text-base">
                            Whether you are planning uniforms, branded apparel,
                            teamwear, event merchandise or corporate clothing,
                            Allwear Business gives you a direct route to support.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {audiences.map((item) => (
                            <div
                                key={item}
                                className="rounded-2xl bg-[#F4F1EA] p-5 text-center font-black text-zinc-950 ring-1 ring-black/5"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
                <div className="rounded-[3rem] bg-zinc-950 p-8 text-white md:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Our Process
                    </p>

                    <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        A guided process from enquiry to fulfilment.
                    </h2>

                    <div className="mt-10 grid gap-5 md:grid-cols-4">
                        {processSteps.map((step, index) => (
                            <div
                                key={step.title}
                                className="rounded-[2rem] bg-white/10 p-6 ring-1 ring-white/10"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6FC276] text-sm font-black text-white">
                                    {index + 1}
                                </div>

                                <h3 className="mt-5 text-xl font-black">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-300">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-16">
                <div className="rounded-[3rem] bg-white p-8 text-center shadow-sm ring-1 ring-black/5 md:p-12">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Ready to begin?
                    </p>

                    <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        Let’s help your organisation order with confidence.
                    </h2>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/business/bulk-orders"
                            className="inline-flex justify-center rounded-full bg-zinc-950 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#6FC276]"
                        >
                            Bulk Order Enquiry
                        </Link>

                        <Link
                            href="/business/contact-rep"
                            className="inline-flex justify-center rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                        >
                            Speak to a Rep
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}