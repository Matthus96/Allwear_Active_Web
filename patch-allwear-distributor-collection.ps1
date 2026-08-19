# Allwear Active Web — Distributor + Collection parity patch
# Run this from the root of the Allwear_Active_Web repository.
# It creates/switches to a feature branch, refuses to touch locally-modified target files,
# applies the parity changes, then runs npm build.

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Content
    )
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Read-Normalized {
    param([Parameter(Mandatory=$true)][string]$Path)
    $text = [System.IO.File]::ReadAllText($Path)
    return $text.Replace("`r`n", "`n")
}

function Replace-Required {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Old,
        [Parameter(Mandatory=$true)][string]$New,
        [Parameter(Mandatory=$true)][string]$Label
    )

    $text = Read-Normalized $Path
    $oldNorm = $Old.Replace("`r`n", "`n")
    $newNorm = $New.Replace("`r`n", "`n")

    if (-not $text.Contains($oldNorm)) {
        throw "Patch stopped: could not find expected block for '$Label' in $Path. No further changes were applied."
    }

    $text = $text.Replace($oldNorm, $newNorm)
    Write-Utf8NoBom -Path $Path -Content $text
    Write-Host "  OK  $Label"
}

$root = (Get-Location).Path

if (-not (Test-Path (Join-Path $root "package.json")) -or
    -not (Test-Path (Join-Path $root "src\lib\appwrite.ts"))) {
    throw "Run this script from the root of the Allwear_Active_Web repository."
}

$targets = @(
    "src/lib/appwrite.ts",
    "src/app/account/page.tsx",
    "src/app/distributor/orders/page.tsx",
    "src/app/orders/page.tsx",
    "src/hooks/useIsDistributor.ts"
)

# Protect unrelated/in-progress work.
$dirty = git status --porcelain -- $targets

if ($LASTEXITCODE -ne 0) {
    throw "Could not read git status."
}

if ($dirty) {
    Write-Host ""
    Write-Host "These target files already have local changes:" -ForegroundColor Yellow
    $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    throw "Commit/stash those target-file changes first, then rerun this patch."
}

$branch = "feature/distributor-collection-parity"
$currentBranch = (git branch --show-current).Trim()

if ($currentBranch -ne $branch) {
    $branchExists = git branch --list $branch
    if ($branchExists) {
        git switch $branch
    } else {
        git switch -c $branch
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Could not create/switch to $branch."
    }
}

Write-Host ""
Write-Host "Applying Allwear distributor + collection parity..." -ForegroundColor Cyan

$appwritePath = Join-Path $root "src\lib\appwrite.ts"
$accountPath = Join-Path $root "src\app\account\page.tsx"
$distributorPath = Join-Path $root "src\app\distributor\orders\page.tsx"
$ordersPath = Join-Path $root "src\app\orders\page.tsx"
$hookPath = Join-Path $root "src\hooks\useIsDistributor.ts"

# 1) Centralise the distributor team ID, matching the mobile app logic.
Replace-Required -Path $appwritePath -Label "Appwrite distributor team config" -Old @'
    distributorCollectionId: "distributor",

    defaultDistributorId: "6a3502a1001eae91ffd9",
'@ -New @'
    distributorCollectionId: "distributor",

    distributorTeamId:
        process.env.NEXT_PUBLIC_DISTRIBUTOR_TEAM_ID ||
        "6a3519de0031fcab27e3",

    defaultDistributorId: "6a3502a1001eae91ffd9",
'@

# 2) Add the distributor membership hook.
$hookContent = @'
"use client";

import { useEffect, useState } from "react";

import { appwriteConfig, teams } from "@/lib/appwrite";

export default function useIsDistributor() {
    const [isDistributor, setIsDistributor] = useState(false);
    const [checkingDistributor, setCheckingDistributor] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const checkDistributor = async () => {
            try {
                setCheckingDistributor(true);

                const result = await teams.list({
                    total: false,
                });

                const allowed = result.teams.some(
                    (team) => team.$id === appwriteConfig.distributorTeamId
                );

                if (!cancelled) {
                    setIsDistributor(allowed);
                }
            } catch (error) {
                console.log("DISTRIBUTOR TEAM CHECK ERROR:", error);

                if (!cancelled) {
                    setIsDistributor(false);
                }
            } finally {
                if (!cancelled) {
                    setCheckingDistributor(false);
                }
            }
        };

        checkDistributor();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        isDistributor,
        checkingDistributor,
    };
}
'@

Write-Utf8NoBom -Path $hookPath -Content $hookContent
Write-Host "  OK  Distributor membership hook"

# 3) Account page: show Distributor Orders only to distributor-team members.
Replace-Required -Path $accountPath -Label "Account distributor hook import" -Old @'
import { useCartStore } from "@/store/cart.store";
'@ -New @'
import { useCartStore } from "@/store/cart.store";
import useIsDistributor from "@/hooks/useIsDistributor";
'@

Replace-Required -Path $accountPath -Label "Account distributor state" -Old @'
    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
'@ -New @'
    const totalItems = useCartStore((state) => state.getTotalItems());
    const { isDistributor } = useIsDistributor();

    useEffect(() => {
'@

Replace-Required -Path $accountPath -Label "Account distributor dashboard card" -Old @'
    {
        eyebrow: "Orders",
        title: "My Orders",
        description:
            "View order history, payment status and delivery progress.",
        href: "/orders",
        label: "Track Orders",
    },
    {
        eyebrow: "Delivery",
'@ -New @'
    {
        eyebrow: "Orders",
        title: "My Orders",
        description:
            "View order history, payment status and fulfilment progress.",
        href: "/orders",
        label: "Track Orders",
    },
    ...(isDistributor
        ? [
              {
                  eyebrow: "Distributor",
                  title: "Distributor Orders",
                  description:
                      "Manage assigned orders and update delivery or collection progress.",
                  href: "/distributor/orders",
                  label: "Manage Orders",
              },
          ]
        : []),
    {
        eyebrow: "Delivery",
'@

# 4) Distributor dashboard: gate access and make collection orders first-class.
Replace-Required -Path $distributorPath -Label "Distributor role hook import" -Old @'
import Footer from "@/components/Footer";

import {
'@ -New @'
import Footer from "@/components/Footer";
import useIsDistributor from "@/hooks/useIsDistributor";

import {
'@

Replace-Required -Path $distributorPath -Label "Distributor gateway fulfilment types" -Old @'
type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    deliveryFee?: number;
    deliveryDetails?: DeliveryDetails | null;
};
'@ -New @'
type FulfilmentMethod = "delivery" | "collection";

type CollectionDetails = {
    name?: string;
    addressLine1?: string;
    suburb?: string;
    city?: string;
};

type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    fulfilmentMethod?: FulfilmentMethod;
    deliveryFee?: number;
    deliveryDetails?: DeliveryDetails | null;
    collectionDetails?: CollectionDetails | null;
};
'@

Replace-Required -Path $distributorPath -Label "Distributor context-aware actions" -Old @'
const trackingActions: {
    label: string;
    value: OrderTrackingStatus;
}[] = [
    { label: "Confirm", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Out for delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancel", value: "cancelled" },
];
'@ -New @'
const getTrackingActions = (
    trackingStatus: string,
    fulfilmentMethod: FulfilmentMethod
): {
    label: string;
    value: OrderTrackingStatus;
}[] => {
    switch (trackingStatus) {
        case "order_placed":
            return [
                { label: "Confirm Order", value: "confirmed" },
                { label: "Cancel", value: "cancelled" },
            ];

        case "confirmed":
            return [
                { label: "Mark Preparing", value: "preparing" },
                { label: "Cancel", value: "cancelled" },
            ];

        case "preparing":
            return [
                {
                    label:
                        fulfilmentMethod === "collection"
                            ? "Ready for Collection"
                            : "Out for Delivery",
                    value: "out_for_delivery",
                },
                { label: "Cancel", value: "cancelled" },
            ];

        case "out_for_delivery":
            return [
                {
                    label:
                        fulfilmentMethod === "collection"
                            ? "Mark Collected"
                            : "Mark Delivered",
                    value: "delivered",
                },
            ];

        default:
            return [];
    }
};
'@

Replace-Required -Path $distributorPath -Label "Distributor filter labels" -Old @'
    { label: "Out for delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
'@ -New @'
    { label: "Out / Ready", value: "out_for_delivery" },
    { label: "Delivered / Collected", value: "delivered" },
'@

Replace-Required -Path $distributorPath -Label "Distributor collection status labels" -Old @'
const formatStatus = (status?: string) => {
    if (!status) return "Order placed";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
'@ -New @'
const formatStatus = (
    status?: string,
    fulfilmentMethod: FulfilmentMethod = "delivery"
) => {
    if (!status) return "Order placed";

    if (
        fulfilmentMethod === "collection" &&
        status === "out_for_delivery"
    ) {
        return "Ready for collection";
    }

    if (
        fulfilmentMethod === "collection" &&
        status === "delivered"
    ) {
        return "Collected";
    }

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
'@

Replace-Required -Path $distributorPath -Label "Distributor role state" -Old @'
export default function DistributorOrdersPage() {
    const [orders, setOrders] = useState<OrderDoc[]>([]);
'@ -New @'
export default function DistributorOrdersPage() {
    const { isDistributor, checkingDistributor } = useIsDistributor();

    const [orders, setOrders] = useState<OrderDoc[]>([]);
'@

Replace-Required -Path $distributorPath -Label "Distributor gated order loading" -Old @'
    useEffect(() => {
        loadOrders(true);

        const interval = window.setInterval(() => {
            loadOrders(false);
        }, 10000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);
'@ -New @'
    useEffect(() => {
        if (checkingDistributor || !isDistributor) {
            return;
        }

        loadOrders(true);

        const interval = window.setInterval(() => {
            loadOrders(false);
        }, 10000);

        return () => {
            window.clearInterval(interval);
        };
    }, [checkingDistributor, isDistributor]);
'@

Replace-Required -Path $distributorPath -Label "Distributor restricted-area gate" -Old @'
    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
'@ -New @'
    if (checkingDistributor) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-5">
                    <p className="font-bold text-zinc-500">
                        Checking distributor access...
                    </p>
                </div>
                <Footer />
            </main>
        );
    }

    if (!isDistributor) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-5 py-16">
                    <div className="w-full rounded-[3rem] bg-zinc-50 p-8 text-center ring-1 ring-zinc-100 md:p-12">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#6FC276]">
                            Restricted Area
                        </p>
                        <h1 className="mt-4 text-4xl font-black text-zinc-950">
                            Distributor access only.
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                            This dashboard is available only to accounts in the
                            Allwear distributor team.
                        </p>
                        <Link
                            href="/account"
                            className="mt-8 inline-flex rounded-full bg-zinc-950 px-7 py-3 text-sm font-black text-white transition hover:bg-[#6FC276]"
                        >
                            Back to Account
                        </Link>
                    </div>
                </section>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
'@

Replace-Required -Path $distributorPath -Label "Distributor order fulfilment derivation" -Old @'
                            const deliveryDetails = gateway?.deliveryDetails;
                            const trackingStatus =
                                order.trackingStatus || "order_placed";
                            const isUpdating = updatingOrderId === order.$id;
'@ -New @'
                            const deliveryDetails = gateway?.deliveryDetails;
                            const fulfilmentMethod: FulfilmentMethod =
                                gateway?.fulfilmentMethod === "collection"
                                    ? "collection"
                                    : "delivery";
                            const collectionDetails = gateway?.collectionDetails;
                            const trackingStatus =
                                order.trackingStatus || "order_placed";
                            const availableActions = getTrackingActions(
                                trackingStatus,
                                fulfilmentMethod
                            );
                            const isUpdating = updatingOrderId === order.$id;
'@

Replace-Required -Path $distributorPath -Label "Distributor fulfilment badge" -Old @'
                                                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase text-green-700">
                                                    Paid
                                                </span>

                                                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-zinc-700 ring-1 ring-zinc-100">
'@ -New @'
                                                <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase text-green-700">
                                                    Paid
                                                </span>

                                                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase text-blue-700">
                                                    {fulfilmentMethod ===
                                                    "collection"
                                                        ? "Collection"
                                                        : "Delivery"}
                                                </span>

                                                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-zinc-700 ring-1 ring-zinc-100">
'@

# This replacement affects both status displays on the distributor page.
Replace-Required -Path $distributorPath -Label "Distributor contextual status display" -Old @'
                                                    {formatStatus(
                                                        trackingStatus
                                                    )}
'@ -New @'
                                                    {formatStatus(
                                                        trackingStatus,
                                                        fulfilmentMethod
                                                    )}
'@

Replace-Required -Path $distributorPath -Label "Distributor collection details card" -Old @'
                                            {deliveryDetails ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
'@ -New @'
                                            {fulfilmentMethod === "collection" ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                        Collection Details
                                                    </p>

                                                    <h4 className="mt-2 text-xl font-black text-zinc-950">
                                                        {collectionDetails?.name ||
                                                            "Allwear Factory Shop"}
                                                    </h4>

                                                    <div className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                                                        <p>
                                                            {collectionDetails?.addressLine1 ||
                                                                "55 Albert Wessels Drive"}
                                                        </p>
                                                        <p>
                                                            {collectionDetails?.suburb ||
                                                                "Riverside Industrial"}
                                                            ,{" "}
                                                            {collectionDetails?.city ||
                                                                "Newcastle"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : deliveryDetails ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
'@

Replace-Required -Path $distributorPath -Label "Distributor context-aware action list" -Old @'
                                                {trackingActions.map(
'@ -New @'
                                                {availableActions.map(
'@

# 5) Customer order tracking: delivery and collection get different labels/timelines.
Replace-Required -Path $ordersPath -Label "Customer tracking fulfilment types" -Old @'
type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    deliveryFee?: number;
    deliveryDetails?: {
'@ -New @'
type FulfilmentMethod = "delivery" | "collection";

type CollectionDetails = {
    name?: string;
    addressLine1?: string;
    suburb?: string;
    city?: string;
};

type ParsedGatewayResponse = {
    provider?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    subtotal?: number;
    fulfilmentMethod?: FulfilmentMethod;
    deliveryFee?: number;
    collectionDetails?: CollectionDetails | null;
    deliveryDetails?: {
'@

Replace-Required -Path $ordersPath -Label "Customer dynamic tracking steps" -Old @'
const trackingSteps = [
    {
        key: "order_placed",
        label: "Order placed",
        dateField: "$createdAt",
    },
    {
        key: "confirmed",
        label: "Confirmed",
        dateField: "confirmedAt",
    },
    {
        key: "preparing",
        label: "Preparing",
        dateField: "preparingAt",
    },
    {
        key: "out_for_delivery",
        label: "Out for delivery",
        dateField: "outForDeliveryAt",
    },
    {
        key: "delivered",
        label: "Delivered",
        dateField: "deliveredAt",
    },
];
'@ -New @'
const getTrackingSteps = (fulfilmentMethod: FulfilmentMethod) => [
    {
        key: "order_placed",
        label: "Order placed",
        dateField: "$createdAt",
    },
    {
        key: "confirmed",
        label: "Confirmed",
        dateField: "confirmedAt",
    },
    {
        key: "preparing",
        label: "Preparing",
        dateField: "preparingAt",
    },
    {
        key: "out_for_delivery",
        label:
            fulfilmentMethod === "collection"
                ? "Ready for collection"
                : "Out for delivery",
        dateField: "outForDeliveryAt",
    },
    {
        key: "delivered",
        label:
            fulfilmentMethod === "collection"
                ? "Collected"
                : "Delivered",
        dateField: "deliveredAt",
    },
];
'@

Replace-Required -Path $ordersPath -Label "Customer collection status labels" -Old @'
const formatStatus = (status?: string) => {
    if (!status) return "Order placed";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
'@ -New @'
const formatStatus = (
    status?: string,
    fulfilmentMethod: FulfilmentMethod = "delivery"
) => {
    if (!status) return "Order placed";

    if (
        fulfilmentMethod === "collection" &&
        status === "out_for_delivery"
    ) {
        return "Ready for collection";
    }

    if (
        fulfilmentMethod === "collection" &&
        status === "delivered"
    ) {
        return "Collected";
    }

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
'@

Replace-Required -Path $ordersPath -Label "Customer dynamic tracking index" -Old @'
const getTrackingIndex = (trackingStatus?: string) => {
    const index = trackingSteps.findIndex(
        (step) => step.key === trackingStatus
    );
'@ -New @'
const getTrackingIndex = (
    trackingStatus: string | undefined,
    steps: ReturnType<typeof getTrackingSteps>
) => {
    const index = steps.findIndex(
        (step) => step.key === trackingStatus
    );
'@

Replace-Required -Path $ordersPath -Label "Customer order fulfilment derivation" -Old @'
                            const deliveryDetails = gateway?.deliveryDetails;
                            const orderDate = order.paidAt || order.$createdAt;
                            const paymentFailed = isPaymentFailed(order);
                            const trackingStatus = getTrackingStatus(order);
                            const currentIndex =
                                getTrackingIndex(trackingStatus);
'@ -New @'
                            const deliveryDetails = gateway?.deliveryDetails;
                            const fulfilmentMethod: FulfilmentMethod =
                                gateway?.fulfilmentMethod === "collection"
                                    ? "collection"
                                    : "delivery";
                            const collectionDetails = gateway?.collectionDetails;
                            const steps = getTrackingSteps(fulfilmentMethod);
                            const orderDate = order.paidAt || order.$createdAt;
                            const paymentFailed = isPaymentFailed(order);
                            const trackingStatus = getTrackingStatus(order);
                            const currentIndex =
                                getTrackingIndex(trackingStatus, steps);
'@

Replace-Required -Path $ordersPath -Label "Customer contextual status badge" -Old @'
                                                        {formatStatus(
                                                            trackingStatus
                                                        )}
'@ -New @'
                                                        {formatStatus(
                                                            trackingStatus,
                                                            fulfilmentMethod
                                                        )}
'@

Replace-Required -Path $ordersPath -Label "Customer collection details card" -Old @'
                                            {deliveryDetails ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
'@ -New @'
                                            {fulfilmentMethod === "collection" ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6FC276]">
                                                        Collection Point
                                                    </p>

                                                    <h4 className="mt-2 text-xl font-black text-zinc-950">
                                                        {collectionDetails?.name ||
                                                            "Allwear Factory Shop"}
                                                    </h4>

                                                    <div className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                                                        <p>
                                                            {collectionDetails?.addressLine1 ||
                                                                "55 Albert Wessels Drive"}
                                                        </p>
                                                        <p>
                                                            {collectionDetails?.suburb ||
                                                                "Riverside Industrial"}
                                                            ,{" "}
                                                            {collectionDetails?.city ||
                                                                "Newcastle"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : deliveryDetails ? (
                                                <div className="mt-6 rounded-[2rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
'@

Replace-Required -Path $ordersPath -Label "Customer fulfilment tracking copy" -Old @'
                                                    {paymentFailed
                                                        ? "This payment did not complete successfully."
                                                        : "We will update this order as it moves through fulfilment."}
'@ -New @'
                                                    {paymentFailed
                                                        ? "This payment did not complete successfully."
                                                        : fulfilmentMethod ===
                                                          "collection"
                                                        ? "We will update this order until it is ready for collection and collected."
                                                        : "We will update this order as it moves through delivery."}
'@

Replace-Required -Path $ordersPath -Label "Customer dynamic tracking timeline" -Old @'
                                                    trackingSteps.map(
'@ -New @'
                                                    steps.map(
'@

Replace-Required -Path $ordersPath -Label "Customer dynamic tracking connector length" -Old @'
                                                                        trackingSteps.length -
'@ -New @'
                                                                        steps.length -
'@

Write-Host ""
Write-Host "Patch applied. Running production build..." -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    throw "The code was patched, but npm run build failed. Review the build output before committing."
}

Write-Host ""
Write-Host "Build passed." -ForegroundColor Green
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Next commands:" -ForegroundColor Cyan
Write-Host "  git diff"
Write-Host "  git add src/lib/appwrite.ts src/hooks/useIsDistributor.ts src/app/account/page.tsx src/app/distributor/orders/page.tsx src/app/orders/page.tsx"
Write-Host '  git commit -m "Add distributor and collection parity"'
Write-Host "  git push -u origin feature/distributor-collection-parity"
