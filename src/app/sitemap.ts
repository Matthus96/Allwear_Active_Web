import type { MetadataRoute } from "next";

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://allwear-active.vercel.app";

const routes = [
    "",
    "/shop",
    "/product",
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/account",
    "/wishlist",
    "/business",
    "/distributor",
];

export default function sitemap(): MetadataRoute.Sitemap {
    return routes.map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.7,
    }));
}