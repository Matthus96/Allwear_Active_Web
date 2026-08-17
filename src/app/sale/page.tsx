import type { Metadata } from "next";

import SalePageClient from "@/components/SalePageClient";

export const metadata: Metadata = {
    title: "Clearance Sale",
    description:
        "Shop reduced Allwear Active apparel and view the current discount on every sale product.",
    alternates: {
        canonical: "/sale",
    },
};

export default function SalePage() {
    return <SalePageClient />;
}
