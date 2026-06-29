import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        if (!secretKey) {
            return NextResponse.json(
                { success: false, message: "Missing PAYSTACK_SECRET_KEY." },
                { status: 500 }
            );
        }

        const body = await request.json();

        const email = body.email || "customer@allwear.co.za";
        const userId = body.userId || "";
        const amount = Number(body.amount || 0);
        const items = body.items || [];
        const subtotal = Number(body.subtotal || 0);
        const deliveryFee = Number(body.deliveryFee || 0);
        const deliveryDetails = body.deliveryDetails || null;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid payment amount." },
                { status: 400 }
            );
        }

        const paystackRes = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    amount: Math.round(amount * 100),
                    currency: "ZAR",
                    callback_url: `${siteUrl}/success`,
                    metadata: {
                        source: "allwear-active-web",
                        userId,
                        subtotal,
                        deliveryFee,
                        deliveryDetails,
                        items,
                    },
                }),
            }
        );

        const data = await paystackRes.json();

        if (!paystackRes.ok || !data?.status) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        data?.message || "Paystack initialization failed.",
                    data,
                },
                { status: paystackRes.status || 500 }
            );
        }

        return NextResponse.json({
            success: true,
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Payment init failed.",
            },
            { status: 500 }
        );
    }
}