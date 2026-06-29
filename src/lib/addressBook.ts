export type SavedAddress = {
    id: string;
    label: string;
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    deliveryNotes?: string;
    createdAt: string;
};

const STORAGE_KEY = "allwear_saved_addresses";

export const getSavedAddresses = (): SavedAddress[] => {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveAddress = (
    address: Omit<SavedAddress, "id" | "createdAt">
) => {
    if (typeof window === "undefined") return null;

    const existing = getSavedAddresses();

    const newAddress: SavedAddress = {
        ...address,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    const next = [newAddress, ...existing];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return newAddress;
};

export const deleteSavedAddress = (addressId: string) => {
    if (typeof window === "undefined") return;

    const existing = getSavedAddresses();
    const next = existing.filter((address) => address.id !== addressId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};