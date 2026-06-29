import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            return NextResponse.json(
                { success: false, message: "Missing PAYSTACK_SECRET_KEY." },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const reference = searchParams.get("reference");

        if (!reference) {
            return NextResponse.json(
                { success: false, message: "Missing payment reference." },
                { status: 400 }
            );
        }

        const paystackRes = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                },
            }
        );

        const data = await paystackRes.json();

        if (!paystackRes.ok || !data?.status) {
            return NextResponse.json(
                {
                    success: false,
                    message: data?.message || "Payment verification failed.",
                    data,
                },
                { status: paystackRes.status || 500 }
            );
        }

        const paid = data?.data?.status === "success";

        return NextResponse.json({
            success: paid,
            message: paid ? "Payment verified." : "Payment not successful.",
            reference,
            status: data?.data?.status,
            amount: data?.data?.amount,
            currency: data?.data?.currency,
            data: data?.data,
        });
        } catch (error: any) {
        console.error("PAYSTACK VERIFY ROUTE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Payment verification failed inside API route.",
                cause: error?.cause?.message || null,
            },
            { status: 500 }
        );
    }
}