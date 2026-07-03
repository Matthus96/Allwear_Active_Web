import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Shop Activewear",
    description:
        "Shop Allwear Active apparel, activewear, sportswear, teamwear and lifestyle collections in South Africa.",

    alternates: {
        canonical: "/shop",
    },

    openGraph: {
        title: "Shop Activewear | Allwear Active",
        description:
            "Browse Allwear Active apparel, activewear, sportswear, teamwear and lifestyle collections in South Africa.",
        url: "/shop",
        siteName: "Allwear Active",
        locale: "en_ZA",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Shop Activewear | Allwear Active",
        description:
            "Browse Allwear Active apparel, activewear, sportswear, teamwear and lifestyle collections in South Africa.",
    },
};

export default function ShopLayout({ children }: { children: ReactNode }) {
    return children;
}