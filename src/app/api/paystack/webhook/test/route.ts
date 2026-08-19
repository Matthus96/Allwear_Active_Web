import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { finalizePaidAllwearOrder } from "@/lib/server/allwear-order-automation";

export const runtime = "nodejs";

const validSignature = ({
    rawBody,
    signature,
    secret,
}: {
    rawBody: string;
    signature: string;
    secret: string;
}) => {
    const expected = createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(signature || "", "utf8");

    return (
        expectedBuffer.length === actualBuffer.length &&
        timingSafeEqual(expectedBuffer, actualBuffer)
    );
};

const testTransaction = (transaction: any) => {
    const rawMetadata = transaction?.metadata;

    let metadata: any = {};
    if (rawMetadata && typeof rawMetadata === "object") {
        metadata = { ...rawMetadata };
    } else if (rawMetadata) {
        try {
            metadata = JSON.parse(String(rawMetadata));
        } catch {
            metadata = {};
        }
    }

    const originalReference = String(transaction?.reference || "").trim();
    const originalName = String(
        metadata?.customerDetails?.fullName ||
        transaction?.customer?.first_name ||
        "Customer"
    ).trim();

    return {
        ...transaction,
        reference: originalReference
            ? `TEST-${originalReference}`
            : `TEST-${Date.now()}`,
        metadata: {
            ...metadata,
            source: "allwear-active-test",
            testMode: true,
            originalPaystackReference: originalReference || null,
            customerDetails: {
                ...(metadata.customerDetails || {}),
                fullName: originalName.startsWith("TEST -")
                    ? originalName
                    : `TEST - ${originalName}`,
            },
        },
    };
};

export async function POST(request: Request) {
    const secretKey = String(
        process.env.PAYSTACK_TEST_SECRET_KEY || ""
    ).trim();

    if (!secretKey) {
        return NextResponse.json(
            {
                success: false,
                message: "Missing PAYSTACK_TEST_SECRET_KEY.",
            },
            { status: 500 }
        );
    }

    const rawBody = await request.text();
    const signature =
        request.headers.get("x-paystack-signature") || "";

    if (
        !validSignature({
            rawBody,
            signature,
            secret: secretKey,
        })
    ) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Paystack test signature.",
            },
            { status: 401 }
        );
    }

    let event: any;

    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid webhook JSON.",
            },
            { status: 400 }
        );
    }

    if (event?.event !== "charge.success") {
        return NextResponse.json({
            success: true,
            ignored: true,
            testMode: true,
            event: event?.event || null,
        });
    }

    try {
        const result = await finalizePaidAllwearOrder(
            testTransaction(event?.data)
        );

        return NextResponse.json({
            success: true,
            testMode: true,
            ...result,
        });
    } catch (error: any) {
        console.error(
            "PAYSTACK TEST WEBHOOK AUTOMATION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                testMode: true,
                message:
                    error?.message ||
                    "Could not finalize test paid order.",
            },
            { status: 500 }
        );
    }
}
