import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl = "https://allwearactive.co.za";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),

    applicationName: "Allwear Active",

    title: {
        default: "Allwear Active | Premium Activewear in South Africa",
        template: "%s | Allwear Active",
    },

    description:
        "Shop Allwear Active apparel, activewear, teamwear and lifestyle collections in South Africa.",

    keywords: [
        "Allwear",
        "Allwear Active",
        "activewear South Africa",
        "gym wear South Africa",
        "sportswear South Africa",
        "teamwear South Africa",
        "lifestyle apparel South Africa",
        "running apparel South Africa",
        "training apparel South Africa",
    ],

    authors: [{ name: "Allwear" }],
    creator: "Allwear",
    publisher: "Allwear",

    alternates: {
        canonical: siteUrl,
    },

    icons: {
        icon: "/favicon.ico",
    },

    openGraph: {
        title: "Allwear Active | Premium Activewear in South Africa",
        description:
            "Shop Allwear Active apparel, activewear, teamwear and lifestyle collections in South Africa.",
        url: siteUrl,
        siteName: "Allwear Active",
        locale: "en_ZA",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Allwear Active | Premium Activewear in South Africa",
        description:
            "Shop Allwear Active apparel, activewear, teamwear and lifestyle collections in South Africa.",
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },

    category: "ecommerce",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html
            lang="en-ZA"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full overflow-x-hidden bg-white text-zinc-950">
                <AuthProvider>{children}</AuthProvider>
            </body>

            <GoogleAnalytics gaId="G-0FBQSWTVC8" />
        </html>
    );
}