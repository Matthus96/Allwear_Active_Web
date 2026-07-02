import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
    title: "Premium Activewear & Lifestyle Apparel",
    description:
        "Discover Allwear Active apparel, activewear, teamwear and lifestyle collections. Shop quality performance wear built for movement, comfort and everyday style.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Allwear Active | Premium Activewear in South Africa",
        description:
            "Discover Allwear Active apparel, activewear, teamwear and lifestyle collections in South Africa.",
        url: "/",
        type: "website",
    },
};

export default function HomePage() {
    return <HomePageClient />;
}