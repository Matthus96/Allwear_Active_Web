import type { Metadata } from "next";

import KitBuilderShell from "@/components/kitbuilder/KitBuilderShell";

export const metadata: Metadata = {
    title: "3D Kit Builder | Allwear Active",
    description:
        "Create and preview a custom Allwear rugby kit in 3D.",
};

export default function KitBuilderPage() {
    return <KitBuilderShell />;
}