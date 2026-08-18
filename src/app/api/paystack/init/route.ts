import { NextResponse } from "next/server";

import { verifyCoupon } from "@/lib/appwrite";

const DELIVERY_FEE = 100;

const COLLECTION_LOCATION = {
    name: "Allwear Factory Shop",
    addressLine1: "55 Albert Wessels Drive",
    suburb: "Riverside Industrial",
    city: "Newcastle",
};

type FulfilmentMethod =
    | "delivery"
    | "collection";

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
                body.accountId || ""
            ).trim();

        const items: CheckoutItem[] =
            Array.isArray(
                body.items
            )
                ? body.items
                : [];

        const requestedMethod =
            String(
                body.fulfilmentMethod ||
                    "delivery"
            ).trim();

        const fulfilmentMethod: FulfilmentMethod =
            requestedMethod ===
            "collection"
                ? "collection"
                : "delivery";

        const explicitFulfilmentMethod =
            body.fulfilmentMethod ===
                "delivery" ||
            body.fulfilmentMethod ===
                "collection";

        const customerDetails =
            body.customerDetails ??
            null;

        const deliveryDetails =
            fulfilmentMethod ===
            "delivery"
                ? body.deliveryDetails ??
                  null
                : null;

        const collectionDetails =
            fulfilmentMethod ===
            "collection"
                ? COLLECTION_LOCATION
                : null;

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

        if (
            explicitFulfilmentMethod
        ) {
            if (
                !String(
                    customerDetails?.fullName ||
                        ""
                ).trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Missing customer name.",
                    },
                    { status: 400 }
                );
            }

            if (
                !String(
                    customerDetails?.phone ||
                        ""
                ).trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Missing customer phone number.",
                    },
                    { status: 400 }
                );
            }

            if (
                fulfilmentMethod ===
                "delivery"
            ) {
                const requiredFields = [
                    "addressLine1",
                    "suburb",
                    "city",
                    "province",
                    "postalCode",
                ];

                const missingField =
                    requiredFields.find(
                        (field) =>
                            !String(
                                deliveryDetails?.[
                                    field
                                ] || ""
                            ).trim()
                    );

                if (missingField) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                "Delivery address is incomplete.",
                        },
                        { status: 400 }
                    );
                }
            }
        }

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

        const deliveryFee =
            fulfilmentMethod ===
            "delivery"
                ? DELIVERY_FEE
                : 0;

        const finalAmount =
            Math.round(
                Math.max(
                    0,
                    subtotal +
                        deliveryFee -
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

                                        fulfilmentMethod,

                                        deliveryFee,

                                        couponCode:
                                            verifiedCouponCode,

                                        couponDiscount,

                                        customerDetails,

                                        deliveryDetails,

                                        collectionDetails,

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

                fulfilmentMethod,

                deliveryFee,

                collectionDetails,

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
