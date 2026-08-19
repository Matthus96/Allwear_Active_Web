const toHex = (value: number) =>
    (value >>> 0).toString(16).padStart(8, "0");

/**
 * Produces a stable 128-bit-style hexadecimal fingerprint using only
 * ES2015-compatible 32-bit integer operations. This intentionally avoids
 * BigInt because the Allwear web app currently targets pre-ES2020 output.
 */
const hash128 = (value: string) => {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;

    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);

        h1 = h2 ^ Math.imul(h1 ^ code, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ code, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ code, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ code, 2716044179);
    }

    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);

    h1 ^= h2 ^ h3 ^ h4;
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;

    return `${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}`;
};

/**
 * Stable Appwrite-safe document ID for a Paystack reference.
 * 4-char prefix + 32 hex chars = Appwrite's 36-char max.
 */
export const getOrderDocumentId = (reference: string) => {
    const cleanReference = String(reference || "").trim();

    if (!cleanReference) {
        throw new Error("Missing order reference.");
    }

    return `ord_${hash128(cleanReference)}`;
};
