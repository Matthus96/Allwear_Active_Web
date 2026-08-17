import { NextResponse } from "next/server";

import { verifyCoupon } from "@/lib/appwrite";

const DELIVERY_FEE = 100;

type CheckoutItem = {
    id?: string;
    productId?: string;
    size?: string;
    quantity?: number;

    customizations?: Array<{
        id?: string;
        name?: string;
        price?: number;
    }>;

    stockSnapshot?: {
        name?: string;
        price?: number;
        image_url?: string;
    };
};

export async function POST(
    request: Request
) {
    try {
        const secretKey =
            process.env.PAYSTACK_SECRET_KEY;

        const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            "http://localhost:3000";

        if (!secretKey) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing PAYSTACK_SECRET_KEY.",
                },
                {
                    status: 500,
                }
            );
        }

        const body =
            await request.json();

        const email =
            String(
                body.email ||
                    "customer@allwear.co.za"
            )
                .trim()
                .toLowerCase();

        const userId =
            String(
                body.userId || ""
            ).trim();

        const accountId =
            String(
                body.accountId ||
                    ""
            ).trim();

        const items: CheckoutItem[] =
            Array.isArray(
                body.items
            )
                ? body.items
                : [];

        const deliveryDetails =
            body.deliveryDetails ??
            null;

        const couponCode =
            body.couponCode
                ? String(
                      body.couponCode
                  )
                      .trim()
                      .toUpperCase()
                : null;

        if (
            items.length ===
            0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Cart is empty.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * CALCULATE SUBTOTAL
         * ---------------------------------------------------------
         *
         * We do NOT trust body.amount or body.couponDiscount.
         *
         * Coupon discount will be recalculated below.
         */
        const calculatedSubtotal =
            items.reduce(
                (
                    total,
                    item
                ) => {
                    const quantity =
                        Math.max(
                            0,
                            Number(
                                item.quantity ||
                                    0
                            )
                        );

                    const basePrice =
                        Number(
                            item
                                .stockSnapshot
                                ?.price ||
                                0
                        );

                    const customizations =
                        Array.isArray(
                            item.customizations
                        )
                            ? item.customizations
                            : [];

                    const customizationPrice =
                        customizations.reduce(
                            (
                                sum,
                                customization
                            ) =>
                                sum +
                                Number(
                                    customization.price ||
                                        0
                                ),
                            0
                        );

                    const unitPrice =
                        basePrice +
                        customizationPrice;

                    return (
                        total +
                        unitPrice *
                            quantity
                    );
                },
                0
            );

        const subtotal =
            Math.round(
                calculatedSubtotal *
                    100
            ) / 100;

        if (
            !Number.isFinite(
                subtotal
            ) ||
            subtotal <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid cart subtotal.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * COUPON
         * ---------------------------------------------------------
         *
         * Only ONE coupon code can enter this checkout.
         *
         * verifyCoupon also checks all cart products against
         * Appwrite and rejects the coupon if ANY item is on sale.
         */
        let couponDiscount = 0;

        let verifiedCouponCode:
            | string
            | null = null;

        if (couponCode) {
            const couponResult =
                await verifyCoupon(
                    {
                        code:
                            couponCode,

                        subtotal,

                        items:
                            items.map(
                                (
                                    item
                                ) => ({
                                    productId:
                                        String(
                                            item.productId ||
                                                ""
                                        ).trim(),

                                    quantity:
                                        Number(
                                            item.quantity ||
                                                0
                                        ),
                                })
                            ),

                        accountId:
                            accountId ||
                            undefined,

                        userId:
                            userId ||
                            undefined,

                        email:
                            email ||
                            undefined,
                    }
                );

            if (
                !couponResult.valid
            ) {
                return NextResponse.json(
                    {
                        success:
                            false,

                        message:
                            couponResult.message,
                    },
                    {
                        status: 400,
                    }
                );
            }

            couponDiscount =
                Math.round(
                    Number(
                        couponResult.discount ||
                            0
                    ) * 100
                ) / 100;

            verifiedCouponCode =
                String(
                    couponResult
                        .coupon
                        ?.code ||
                        couponCode
                )
                    .trim()
                    .toUpperCase();
        }

        /*
         * ---------------------------------------------------------
         * FINAL TOTAL
         * ---------------------------------------------------------
         */
        const finalAmount =
            Math.round(
                Math.max(
                    0,
                    subtotal +
                        DELIVERY_FEE -
                        couponDiscount
                ) * 100
            ) / 100;

        if (
            !Number.isFinite(
                finalAmount
            ) ||
            finalAmount <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid payment amount.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ---------------------------------------------------------
         * PAYSTACK
         * ---------------------------------------------------------
         */
        const paystackRes =
            await fetch(
                "https://api.paystack.co/transaction/initialize",
                {
                    method:
                        "POST",

                    headers: {
                        Authorization: `Bearer ${secretKey}`,

                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(
                            {
                                email,

                                amount:
                                    Math.round(
                                        finalAmount *
                                            100
                                    ),

                                currency:
                                    "ZAR",

                                callback_url:
                                    `${siteUrl}/success`,

                                metadata:
                                    {
                                        source:
                                            "allwear-active-web",

                                        userId,

                                        accountId,

                                        subtotal,

                                        deliveryFee:
                                            DELIVERY_FEE,

                                        couponCode:
                                            verifiedCouponCode,

                                        couponDiscount,

                                        deliveryDetails,

                                        items,
                                    },
                            }
                        ),
                }
            );

        const data =
            await paystackRes.json();

        if (
            !paystackRes.ok ||
            !data?.status
        ) {
            return NextResponse.json(
                {
                    success:
                        false,

                    message:
                        data?.message ||
                        "Paystack initialization failed.",

                    data,
                },
                {
                    status:
                        paystackRes.status ||
                        500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,

                authorization_url:
                    data.data
                        .authorization_url,

                access_code:
                    data.data
                        .access_code,

                reference:
                    data.data
                        .reference,

                subtotal,

                deliveryFee:
                    DELIVERY_FEE,

                couponCode:
                    verifiedCouponCode,

                couponDiscount,

                amount:
                    finalAmount,
            }
        );
    } catch (error: any) {
        console.error(
            "PAYSTACK INIT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ||
                    "Payment init failed.",
            },
            {
                status: 500,
            }
        );
    }
}