"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type SampleLine = {
    stylePattern: string;
    material: string;
    size: string;
    description: string;
};

const sampleCategories = [
    "Dress",
    "Tunic",
    "Skirt",
    "Safari",
    "Blazer",
    "Girls Slacks",
    "Longs",
    "Blouse",
    "Shirt",
    "Shorts",
    "Other Item",
];

const SAMPLE_REF_KEY = "allwear_sample_request_ref_number";

const createEmptyLine = (): SampleLine => ({
    stylePattern: "",
    material: "",
    size: "",
    description: "",
});

const generateReferenceNumber = () => {
    if (typeof window === "undefined") {
        return "000000";
    }

    const currentValue = localStorage.getItem(SAMPLE_REF_KEY);
    const currentNumber = Number(currentValue || 0);

    return String(currentNumber).padStart(6, "0");
};

const incrementReferenceNumber = () => {
    if (typeof window === "undefined") return;

    const currentValue = localStorage.getItem(SAMPLE_REF_KEY);
    const currentNumber = Number(currentValue || 0);
    const nextNumber = currentNumber + 1;

    localStorage.setItem(SAMPLE_REF_KEY, String(nextNumber));
};

export default function SampleRequestPage() {
    const [form, setForm] = useState({
        requestNo: generateReferenceNumber(),
        representative: "",
        date: new Date().toISOString().slice(0, 10),
        dateRequired: "",
        organisation: "",
        schoolLevel: "",
        cityTown: "",
        sampleCategory: "",
        label: "",
        otherParticulars: "",
        sendSampleTo: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
    });

    const representatives = [
    "Anton Sprake - Windhoek",
    "Arthur Moore - Cape Town",
    "Cathy Labuschagne - Pretoria",
    "Colin Palmer - Johannesburg",
    "Elan Pfister - Bloemfontein",
    "Fonnie Labuschagne - Pretoria",
    "Ian Robertson - Durban",
    "Jacques Visagie - Potch",
    "John cillie - Oos Londen",
    "Keith van Rooyen - JHB / PTA Clients",
    "Malcolm Palmer - Johannesburg",
    "Roy Nell - Durban",
    "Willie Jay Jonker",
    "Other / Not sure",
];

    const [sampleLines, setSampleLines] = useState<SampleLine[]>([
        createEmptyLine(),
    ]);

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateSampleLine = (
        index: number,
        field: keyof SampleLine,
        value: string
    ) => {
        setSampleLines((prev) =>
            prev.map((line, lineIndex) =>
                lineIndex === index
                    ? {
                          ...line,
                          [field]: value,
                      }
                    : line
            )
        );
    };

    const addSampleLine = () => {
        setSampleLines((prev) => [...prev, createEmptyLine()]);
    };

    const removeSampleLine = (index: number) => {
        setSampleLines((prev) => {
            if (prev.length === 1) return prev;

            return prev.filter((_, lineIndex) => lineIndex !== index);
        });
    };

    const filledLines = useMemo(() => {
        return sampleLines.filter(
            (line) =>
                line.stylePattern.trim() ||
                line.material.trim() ||
                line.size.trim() ||
                line.description.trim()
        );
    }, [sampleLines]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const subject = `Sample Request ${form.requestNo} - ${
            form.organisation || "Business / Organisation"
        }`;

        const linesText =
            filledLines.length > 0
                ? filledLines
                      .map(
                          (line, index) =>
                              `${index + 1}. Style/Pattern: ${
                                  line.stylePattern || "-"
                              }\n   Material: ${line.material || "-"}\n   Size: ${
                                  line.size || "-"
                              }\n   Description: ${line.description || "-"}`
                      )
                      .join("\n\n")
                : "No sample line details added.";

        const body = `
ALLWEAR BUSINESS SAMPLE REQUEST

Reference No:
${form.requestNo}

Representative:
${form.representative || "-"}

Date:
${form.date || "-"}

Date Required:
${form.dateRequired || "-"}

School / Organisation:
${form.organisation || "-"}

High / Primary:
${form.schoolLevel || "-"}

City / Town:
${form.cityTown || "-"}

Sample Category:
${form.sampleCategory || "-"}

SAMPLE DETAILS:
${linesText}

Label:
${form.label || "-"}

Other Particulars:
${form.otherParticulars || "-"}

Send Sample To:
${form.sendSampleTo || "-"}

CONTACT PERSON:
Name: ${form.contactName || "-"}
Phone: ${form.contactPhone || "-"}
Email: ${form.contactEmail || "-"}
        `.trim();

        incrementReferenceNumber();

        window.location.href = `mailto:sales@allwear.co.za?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#F4F1EA] text-zinc-950">
            <Navbar />

            <section className="relative overflow-hidden bg-zinc-950 px-5 py-20 text-white md:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,194,118,0.28),transparent_35%)]" />

                <div className="relative mx-auto max-w-7xl">
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-[#6FC276]">
                        Allwear Business
                    </p>

                    <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight md:text-8xl">
                        Sample request form.
                    </h1>

                    <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                        Request product samples for schools, businesses, teams
                        and organisations before moving into bulk orders or
                        production planning.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/business/contact-rep"
                            className="inline-flex justify-center rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
                        >
                            Speak to a Rep
                        </Link>

                        <Link
                            href="/business"
                            className="inline-flex justify-center rounded-full bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white ring-1 ring-white/20 transition hover:bg-white hover:text-zinc-950"
                        >
                            Back to Business
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:py-16 lg:grid-cols-[1fr_380px]">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8"
                >
                    <div className="mb-8">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Request Details
                        </p>

                        <h2 className="mt-3 text-4xl font-black tracking-tight">
                            Business / Organisation Sample Request
                        </h2>
                    </div>

                    <div className="mb-6 rounded-[2rem] bg-zinc-950 p-5 text-white">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Auto Generated Reference
                        </p>

                        <div className="mt-3">
                            <p className="break-words text-2xl font-black">
                                {form.requestNo}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <select
                            value={form.representative}
                            onChange={(e) =>
                                updateField("representative", e.target.value)
                            }
                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold text-zinc-700 outline-none focus:border-[#6FC276]"
                        >
                            <option value="">Select representative</option>

                            {representatives.map((rep) => (
                                <option key={rep} value={rep}>
                                    {rep}
                                </option>
                            ))}
                        </select>

                        <select
                            value={form.sampleCategory}
                            onChange={(e) =>
                                updateField("sampleCategory", e.target.value)
                            }
                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold text-zinc-700 outline-none focus:border-[#6FC276]"
                        >
                            <option value="">Select sample category</option>

                            {sampleCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <input
                            value={form.date}
                            onChange={(e) => updateField("date", e.target.value)}
                            type="date"
                            className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.dateRequired}
                            onChange={(e) =>
                                updateField("dateRequired", e.target.value)
                            }
                            type="date"
                            className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.organisation}
                            onChange={(e) =>
                                updateField("organisation", e.target.value)
                            }
                            placeholder="School / Organisation"
                            className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276] md:col-span-2"
                        />

                        <input
                            value={form.schoolLevel}
                            onChange={(e) =>
                                updateField("schoolLevel", e.target.value)
                            }
                            placeholder="High / Primary"
                            className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />

                        <input
                            value={form.cityTown}
                            onChange={(e) =>
                                updateField("cityTown", e.target.value)
                            }
                            placeholder="City / Town"
                            className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                        />
                    </div>

                    <div className="mt-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                                    Sample Details
                                </p>

                                <h3 className="mt-2 text-2xl font-black">
                                    Style, material, size and description
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={addSampleLine}
                                className="w-fit rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                            >
                                Add Sample Line
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {sampleLines.map((line, index) => (
                                <div
                                    key={index}
                                    className="rounded-[2rem] bg-[#F4F1EA] p-4 ring-1 ring-black/5"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-4">
                                        <p className="text-sm font-black text-zinc-500">
                                            Sample Line {index + 1}
                                        </p>

                                        {sampleLines.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSampleLine(index)
                                                }
                                                className="rounded-full bg-white px-4 py-2 text-xs font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <input
                                            value={line.stylePattern}
                                            onChange={(e) =>
                                                updateSampleLine(
                                                    index,
                                                    "stylePattern",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Style / Pattern"
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                                        />

                                        <input
                                            value={line.material}
                                            onChange={(e) =>
                                                updateSampleLine(
                                                    index,
                                                    "material",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Material"
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                                        />

                                        <input
                                            value={line.size}
                                            onChange={(e) =>
                                                updateSampleLine(
                                                    index,
                                                    "size",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Size"
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                                        />

                                        <input
                                            value={line.description}
                                            onChange={(e) =>
                                                updateSampleLine(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Description"
                                            className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Additional Information
                        </p>

                        <div className="mt-5 grid gap-4">
                            <input
                                value={form.label}
                                onChange={(e) =>
                                    updateField("label", e.target.value)
                                }
                                placeholder="Label"
                                className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <textarea
                                value={form.otherParticulars}
                                onChange={(e) =>
                                    updateField(
                                        "otherParticulars",
                                        e.target.value
                                    )
                                }
                                placeholder="Other particulars"
                                rows={4}
                                className="resize-none rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <textarea
                                value={form.sendSampleTo}
                                onChange={(e) =>
                                    updateField("sendSampleTo", e.target.value)
                                }
                                placeholder="Send sample to"
                                rows={3}
                                className="resize-none rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />
                        </div>
                    </div>

                    <div className="mt-10">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Contact Person
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <input
                                value={form.contactName}
                                onChange={(e) =>
                                    updateField("contactName", e.target.value)
                                }
                                placeholder="Contact name"
                                className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.contactPhone}
                                onChange={(e) =>
                                    updateField("contactPhone", e.target.value)
                                }
                                placeholder="Contact phone"
                                className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276]"
                            />

                            <input
                                value={form.contactEmail}
                                onChange={(e) =>
                                    updateField("contactEmail", e.target.value)
                                }
                                placeholder="Contact email"
                                type="email"
                                className="rounded-2xl border border-zinc-200 px-4 py-4 text-sm font-semibold outline-none focus:border-[#6FC276] md:col-span-2"
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            className="rounded-full bg-[#6FC276] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-950"
                        >
                            Send Sample Request
                        </button>

                        <Link
                            href="/business"
                            className="rounded-full bg-zinc-950 px-8 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#6FC276]"
                        >
                            Back to Business
                        </Link>
                    </div>
                </form>

                <aside className="h-fit rounded-[2.5rem] bg-zinc-950 p-7 text-white ring-1 ring-black/5 lg:sticky lg:top-28">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                        Sample Process
                    </p>

                    <h2 className="mt-3 text-3xl font-black">
                        How sample requests work.
                    </h2>

                    <div className="mt-8 space-y-5">
                        {[
                            "A reference number is generated automatically.",
                            "Choose the sample category required.",
                            "Add one or more sample lines if needed.",
                            "Submit the request to the Allwear team.",
                            "A representative will assist with the next steps.",
                        ].map((item, index) => (
                            <div key={item} className="flex gap-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6FC276] text-sm font-black">
                                    {index + 1}
                                </div>

                                <p className="pt-2 text-sm leading-6 text-zinc-300">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-[2rem] bg-white/10 p-5 ring-1 ring-white/10">
                        <p className="text-sm font-black text-white">
                            Need guidance before submitting?
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                            Contact an Allwear representative for help with
                            sample options, sizing, availability and lead times.
                        </p>

                        <Link
                            href="/business/contact-rep"
                            className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-[#6FC276] hover:text-white"
                        >
                            Speak to a Rep
                        </Link>
                    </div>
                </aside>
            </section>

            <Footer />
        </main>
    );
}