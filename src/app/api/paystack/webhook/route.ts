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

export async function POST(request: Request) {
    const secretKey = String(process.env.PAYSTACK_SECRET_KEY || "").trim();

    if (!secretKey) {
        return NextResponse.json(
            { success: false, message: "Missing PAYSTACK_SECRET_KEY." },
            { status: 500 }
        );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (
        !validSignature({
            rawBody,
            signature,
            secret: secretKey,
        })
    ) {
        return NextResponse.json(
            { success: false, message: "Invalid Paystack signature." },
            { status: 401 }
        );
    }

    let event: any;

    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid webhook JSON." },
            { status: 400 }
        );
    }

    if (event?.event !== "charge.success") {
        return NextResponse.json({
            success: true,
            ignored: true,
            event: event?.event || null,
        });
    }

    try {
        const result = await finalizePaidAllwearOrder(event?.data);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        console.error("PAYSTACK WEBHOOK AUTOMATION ERROR:", error);

        // Return a failure so Paystack retries delivery while a transient
        // Appwrite/Resend/config problem is being resolved.
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Could not finalize paid order.",
            },
            { status: 500 }
        );
    }
}
