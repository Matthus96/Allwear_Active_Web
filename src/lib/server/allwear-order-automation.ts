import { createHash } from "node:crypto";

import { getOrderDocumentId } from "@/lib/order-id";
import {
    buildInvoicePdf,
    type InvoicePdfLineItem,
} from "@/lib/server/invoice-pdf";

const DATABASE_ID = "6a056e4c0007e2f52631";
const ORDERS_TABLE_ID = "orders";
const DEFAULT_DISTRIBUTOR_ID = "6a3502a1001eae91ffd9";
const DEFAULT_DISTRIBUTOR_NAME = "Allwear HQ";

const DEFAULT_BUSINESS_ADDRESS =
    "55 Albert Wessels Drive, Riverside Industrial, Newcastle, KwaZulu-Natal, South Africa";

const nowIso = () => new Date().toISOString();

const requiredEnv = (name: string) => {
    const value = String(process.env[name] || "").trim();
    if (!value) throw new Error(`Missing ${name}.`);
    return value;
};

const parseMetadata = (raw: any) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;

    try {
        return JSON.parse(String(raw));
    } catch {
        return {};
    }
};

const parseJsonObject = (raw: any) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;

    try {
        const parsed = JSON.parse(String(raw));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const numberValue = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const emailList = (value: unknown) =>
    String(value || "")
        .split(/[;,]/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const escapeHtml = (value: unknown) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatMoney = (value: number) => `R${Number(value || 0).toFixed(2)}`;

const safeDateCompact = (value: unknown) => {
    const date = new Date(String(value || ""));
    if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return date.toISOString().slice(0, 10).replace(/-/g, "");
};

const invoiceNumberFor = (reference: string, paidAt: unknown) => {
    const digest = createHash("sha256")
        .update(reference)
        .digest("hex")
        .slice(0, 8)
        .toUpperCase();

    return `AA-${safeDateCompact(paidAt)}-${digest}`;
};

const appwriteHeaders = () => ({
    "Content-Type": "application/json",
    "X-Appwrite-Project": requiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"),
    "X-Appwrite-Key": requiredEnv("APPWRITE_API_KEY"),
});

const appwriteUrl = (path: string) =>
    `${requiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT").replace(/\/$/, "")}${path}`;

const readResponse = async (response: Response) => {
    const text = await response.text();
    let data: any = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    return data;
};

const getOrderDocument = async (documentId: string) => {
    const response = await fetch(
        appwriteUrl(
            `/tablesdb/${DATABASE_ID}/tables/${ORDERS_TABLE_ID}/rows/${encodeURIComponent(
                documentId
            )}`
        ),
        {
            method: "GET",
            headers: appwriteHeaders(),
            cache: "no-store",
        }
    );

    if (response.status === 404) return null;

    const data = await readResponse(response);
    if (!response.ok) {
        throw new Error(data?.message || "Could not read the Allwear order.");
    }

    return data;
};

const createOrderDocument = async ({
    documentId,
    transaction,
    metadata,
    invoiceNumber,
}: {
    documentId: string;
    transaction: any;
    metadata: any;
    invoiceNumber: string;
}) => {
    const accountId = String(metadata.accountId || metadata.userId || "").trim();
    const userId = String(metadata.userId || metadata.accountId || "").trim();
    const customerEmail = String(
        transaction?.customer?.email || metadata?.customerDetails?.email || ""
    )
        .trim()
        .toLowerCase();

    if (!customerEmail) {
        throw new Error("Paid transaction has no customer email.");
    }


    const isTestMode = String(transaction.reference || "").startsWith("TEST-");

    const appwriteTotal = isTestMode
        ? 300
        : numberValue(transaction.amount) / 100;

    const gatewayResponse = {
        provider: "paystack",
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        subtotal: numberValue(metadata.subtotal),
        fulfilmentMethod: metadata.fulfilmentMethod || null,
        deliveryFee: numberValue(metadata.deliveryFee),
        couponCode: metadata.couponCode || null,
        couponDiscount: numberValue(metadata.couponDiscount),
        customerDetails: metadata.customerDetails || null,
        deliveryDetails: metadata.deliveryDetails || null,
        collectionDetails: metadata.collectionDetails || null,
        invoiceNumber,
        invoiceEmailStatus: "pending",
    };

    const response = await fetch(
        appwriteUrl(
            `/tablesdb/${DATABASE_ID}/tables/${ORDERS_TABLE_ID}/rows`
        ),
        {
            method: "POST",
            headers: appwriteHeaders(),
            body: JSON.stringify({
                rowId: documentId,
                data: {
                    reference: transaction.reference,
                    email: customerEmail,
                    items: JSON.stringify(
                        Array.isArray(metadata.items) ? metadata.items : []
                    ),
                    total: appwriteTotal,
                    accountId: accountId || null,
                    userId: userId || null,
                    status: "order_placed",
                    trackingStatus: "order_placed",
                    paidAt: transaction.paid_at || transaction.paidAt || nowIso(),
                    gateway_response: JSON.stringify(gatewayResponse),
                    distributorId: DEFAULT_DISTRIBUTOR_ID,
                    distributorName: DEFAULT_DISTRIBUTOR_NAME,
                },
            }),
        }
    );

    const data = await readResponse(response);

    if (response.status === 409) {
        return getOrderDocument(documentId);
    }

    if (!response.ok) {
        throw new Error(data?.message || "Could not create the Allwear order.");
    }

    return data;
};

const updateGatewayResponse = async (order: any, gatewayResponse: any) => {
    const response = await fetch(
        appwriteUrl(
            `/tablesdb/${DATABASE_ID}/tables/${ORDERS_TABLE_ID}/rows/${encodeURIComponent(
                order.$id
            )}`
        ),
        {
            method: "PATCH",
            headers: appwriteHeaders(),
            body: JSON.stringify({
                data: {
                    gateway_response: JSON.stringify(gatewayResponse),
                },
            }),
        }
    );

    const data = await readResponse(response);
    if (!response.ok) {
        throw new Error(data?.message || "Could not update invoice delivery status.");
    }

    return data;
};

const itemLinesFromMetadata = (metadata: any): InvoicePdfLineItem[] => {
    const items = Array.isArray(metadata.items) ? metadata.items : [];

    return items.map((item: any) => {
        const quantity = Math.max(1, numberValue(item.quantity, 1));
        const basePrice = numberValue(item?.stockSnapshot?.price);
        const customizations = Array.isArray(item.customizations)
            ? item.customizations
            : [];
        const customizationPrice = customizations.reduce(
            (sum: number, customization: any) =>
                sum + numberValue(customization?.price),
            0
        );
        const unitPrice = basePrice + customizationPrice;

        return {
            name:
                String(item?.stockSnapshot?.name || item?.name || item?.productName || "Item").trim() ||
                "Item",
            size: String(item?.size || "").trim() || undefined,
            quantity,
            unitPrice,
            total: unitPrice * quantity,
            customizations: customizations
                .map((customization: any) => {
                    const name = String(customization?.name || "").trim();
                    if (!name) return "";
                    const price = numberValue(customization?.price);
                    return price ? `${name} (${formatMoney(price)})` : name;
                })
                .filter(Boolean),
        };
    });
};

const fulfilmentAddress = (metadata: any) => {
    const method = String(metadata.fulfilmentMethod || "delivery").toLowerCase();
    const details =
        method === "collection"
            ? metadata.collectionDetails || {}
            : metadata.deliveryDetails || {};

    const lines = [
        details.name,
        details.addressLine1,
        details.addressLine2,
        details.suburb,
        [details.city, details.province].filter(Boolean).join(", "),
        details.postalCode,
    ]
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);

    return lines;
};

const buildEmailHtml = ({
    customerName,
    invoiceNumber,
    reference,
    total,
    internal,
}: {
    customerName: string;
    invoiceNumber: string;
    reference: string;
    total: number;
    internal: boolean;
}) => `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#18181b;line-height:1.55">
  <h1 style="font-size:26px;margin-bottom:8px">Allwear Active</h1>
  <h2 style="font-size:20px;margin-top:0">Paid invoice ${escapeHtml(invoiceNumber)}</h2>
  <p>${
      internal
          ? `Payment received from <strong>${escapeHtml(customerName)}</strong>.`
          : `Hi ${escapeHtml(customerName)}, thank you for your order.`
  }</p>
  <p>Your paid invoice is attached as a PDF.</p>
  <table style="border-collapse:collapse;width:100%;margin:20px 0">
    <tr><td style="padding:8px 0;color:#71717a">Invoice</td><td style="padding:8px 0;text-align:right;font-weight:700">${escapeHtml(
        invoiceNumber
    )}</td></tr>
    <tr><td style="padding:8px 0;color:#71717a">Payment reference</td><td style="padding:8px 0;text-align:right">${escapeHtml(
        reference
    )}</td></tr>
    <tr><td style="padding:8px 0;color:#71717a">Total paid</td><td style="padding:8px 0;text-align:right;font-weight:700">${escapeHtml(
        formatMoney(total)
    )}</td></tr>
  </table>
  <p style="font-size:13px;color:#71717a">This email was generated automatically after Paystack confirmed the payment.</p>
</div>`;

const sendInvoiceEmail = async ({
    to,
    subject,
    html,
    pdf,
    filename,
    idempotencyKey,
}: {
    to: string[];
    subject: string;
    html: string;
    pdf: Buffer;
    filename: string;
    idempotencyKey: string;
}) => {
    const apiKey = requiredEnv("RESEND_API_KEY");
    const from = requiredEnv("INVOICE_FROM_EMAIL");
    const replyTo = String(process.env.INVOICE_REPLY_TO || "").trim();

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "AllwearActive-InvoiceMailer/1.0",
            "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
            from,
            ...(replyTo ? { reply_to: replyTo } : {}),
            to,
            subject,
            html,
            attachments: [
                {
                    filename,
                    content: pdf.toString("base64"),
                },
            ],
        }),
    });

    const data = await readResponse(response);
    if (!response.ok) {
        throw new Error(data?.message || data?.error || "Could not send invoice email.");
    }

    return data;
};

export const finalizePaidAllwearOrder = async (transaction: any) => {
    const reference = String(transaction?.reference || "").trim();
    const status = String(transaction?.status || "").trim().toLowerCase();

    if (!reference) throw new Error("Paystack transaction has no reference.");
    if (status !== "success") {
        return { processed: false, reason: "payment_not_successful" };
    }

    const metadata = parseMetadata(transaction?.metadata);
    const source = String(metadata.source || "").trim().toLowerCase();

    if (!source.startsWith("allwear-active-")) {
        return { processed: false, reason: "not_allwear_active" };
    }

    if (!Array.isArray(metadata.items) || metadata.items.length === 0) {
        throw new Error("Allwear payment metadata has no cart items.");
    }

    const customerEmail = String(
        metadata.invoiceEmail ||
            transaction?.customer?.email ||
            metadata?.customerDetails?.email ||
            ""
    )
        .trim()
        .toLowerCase();

    if (!customerEmail) throw new Error("No invoice email is available for this order.");

    const internalRecipients = unique(
        emailList(requiredEnv("INVOICE_INTERNAL_RECIPIENTS"))
    );

    if (internalRecipients.length === 0) {
        throw new Error("INVOICE_INTERNAL_RECIPIENTS contains no valid email addresses.");
    }

    const invoiceNumber = invoiceNumberFor(
        reference,
        transaction.paid_at || transaction.paidAt
    );
    const documentId = getOrderDocumentId(reference);

    let order = await getOrderDocument(documentId);
    if (!order) {
        order = await createOrderDocument({
            documentId,
            transaction,
            metadata,
            invoiceNumber,
        });
    }

    if (!order) throw new Error("Could not load the paid Allwear order.");

    let gatewayResponse = {
        ...parseJsonObject(order.gateway_response),
        provider: "paystack",
        reference,
        status: transaction.status,
        invoiceNumber,
    };

    const customerDetails = metadata.customerDetails || {};
    const customerName =
        String(customerDetails.fullName || transaction?.customer?.first_name || "Customer").trim() ||
        "Customer";
    const customerPhone = String(
        customerDetails.phone || transaction?.customer?.phone || ""
    ).trim();

    const total = numberValue(transaction.amount) / 100;
    const subtotal = numberValue(metadata.subtotal, total);
    const deliveryFee = numberValue(metadata.deliveryFee);
    const couponDiscount = numberValue(metadata.couponDiscount);
    const items = itemLinesFromMetadata(metadata);

    const pdf = buildInvoicePdf({
        invoiceNumber,
        paymentReference: reference,
        paidAt: transaction.paid_at || transaction.paidAt || nowIso(),
        customerName,
        customerEmail,
        customerPhone,
        fulfilmentMethod:
            String(metadata.fulfilmentMethod || "delivery").toLowerCase() ===
            "collection"
                ? "Collection"
                : "Delivery",
        fulfilmentAddress: fulfilmentAddress(metadata),
        items,
        subtotal,
        deliveryFee,
        couponCode: metadata.couponCode || null,
        couponDiscount,
        total,
        legalName: String(process.env.ALLWEAR_LEGAL_NAME || "Allwear Active").trim(),
        address: String(
            process.env.ALLWEAR_INVOICE_ADDRESS || DEFAULT_BUSINESS_ADDRESS
        ).trim(),
        registrationNumber: String(process.env.ALLWEAR_REG_NUMBER || "").trim() || undefined,
        vatNumber: String(process.env.ALLWEAR_VAT_NUMBER || "").trim() || undefined,
        supportEmail: String(process.env.ALLWEAR_SUPPORT_EMAIL || "info@allwear.co.za").trim(),
    });

    const filename = `${invoiceNumber}.pdf`;
    const emailKey = createHash("sha256").update(reference).digest("hex").slice(0, 32);

    if (!gatewayResponse.customerInvoiceEmailSentAt) {
        gatewayResponse = {
            ...gatewayResponse,
            invoiceEmailStatus: "sending_customer",
        };
        order = await updateGatewayResponse(order, gatewayResponse);

        const customerResult = await sendInvoiceEmail({
            to: [customerEmail],
            subject: `Allwear Active paid invoice ${invoiceNumber}`,
            html: buildEmailHtml({
                customerName,
                invoiceNumber,
                reference,
                total,
                internal: false,
            }),
            pdf,
            filename,
            idempotencyKey: `allwear-${emailKey}-customer`,
        });

        gatewayResponse = {
            ...gatewayResponse,
            customerInvoiceEmailSentAt: nowIso(),
            customerInvoiceEmailId: customerResult?.id || null,
            customerInvoiceEmail: customerEmail,
        };
        order = await updateGatewayResponse(order, gatewayResponse);
    }

    if (!gatewayResponse.internalInvoiceEmailSentAt) {
        gatewayResponse = {
            ...gatewayResponse,
            invoiceEmailStatus: "sending_internal",
        };
        order = await updateGatewayResponse(order, gatewayResponse);

        const internalResult = await sendInvoiceEmail({
            to: internalRecipients,
            subject: `PAID - ${invoiceNumber} - ${customerName} - ${formatMoney(total)}`,
            html: buildEmailHtml({
                customerName,
                invoiceNumber,
                reference,
                total,
                internal: true,
            }),
            pdf,
            filename,
            idempotencyKey: `allwear-${emailKey}-internal`,
        });

        gatewayResponse = {
            ...gatewayResponse,
            internalInvoiceEmailSentAt: nowIso(),
            internalInvoiceEmailId: internalResult?.id || null,
            internalInvoiceRecipients: internalRecipients,
        };
        order = await updateGatewayResponse(order, gatewayResponse);
    }

    gatewayResponse = {
        ...gatewayResponse,
        invoiceEmailStatus: "sent",
        invoiceEmailSentAt: gatewayResponse.invoiceEmailSentAt || nowIso(),
    };
    order = await updateGatewayResponse(order, gatewayResponse);

    return {
        processed: true,
        invoiceNumber,
        orderId: order.$id,
        customerEmail,
        internalRecipients,
    };
};
