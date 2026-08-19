const hash32 = (value: string, seed: number) => {
    let hash = (0x811c9dc5 ^ seed) >>> 0;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash.toString(16).padStart(8, "0");
};

/**
 * Stable Appwrite-safe document ID for a Paystack reference.
 * 4-char prefix + 32 hex chars = Appwrite's 36-char max.
 * Uses 32-bit integer hashing so it also compiles with the site's ES2017 target.
 */
export const getOrderDocumentId = (reference: string) => {
    const cleanReference = String(reference || "").trim();

    if (!cleanReference) {
        throw new Error("Missing order reference.");
    }

    const parts = [
        hash32(cleanReference, 0x00000000),
        hash32(`${cleanReference.length}:${cleanReference}`, 0x9e3779b9),
        hash32(`${cleanReference}:allwear`, 0x85ebca6b),
        hash32(`paystack:${cleanReference}`, 0xc2b2ae35),
    ];

    return `ord_${parts.join("")}`;
};
