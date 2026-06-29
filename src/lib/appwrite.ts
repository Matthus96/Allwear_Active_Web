import {
    Account,
    Avatars,
    Client,
    Databases,
    Functions,
    ID,
    Models,
    Query,
    Storage,
    Teams,
} from "appwrite";

export type Category = Models.Document & {
    name: string;
};

export type Product = Models.Document & {
    name: string;
    price: number;
    image_url: string;
    description?: string;
    backImage?: string;
    categories?: string | string[];

    modelFrontImage?: string;
    modelSideImage?: string;
    modelBackImage?: string;
    modelCloseupImage?: string;
};

export type ProductInventory = Models.Document & {
    productId: string;
    productName?: string;
    range?: string;
    size: string;
    quantity: number;
    available?: boolean;
};

export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,

    databaseId: "6a056e4c0007e2f52631",
    bucketId: "6a06b4ff0024a8e44558",

    userCollectionId: "user",
    categoriesCollectionId: "categories",
    menuCollectionId: "menu",
    customizationsCollectionId: "customizations",
    menuCustomizationsCollectionId: "menu_customizations",
    ordersCollectionId: "orders",
    addressesCollectionId: "addresses",
    productInventoryCollectionId: "product-inventory",

    distributorCollectionId: "distributor",

    defaultDistributorId: "6a3502a1001eae91ffd9",
    defaultDistributorName: "Allwear HQ",

    deleteAccountFunctionId:
    process.env.NEXT_PUBLIC_DELETE_ACCOUNT_FUNCTION_ID || "",
};

export const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);

const avatars = new Avatars(client);

export const getImageUrl = (fileId: string) => {
    return String(storage.getFileView(appwriteConfig.bucketId, fileId));
};

const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase();
};

const getInitialsAvatar = (name?: string) => {
    const safeName = name?.trim() || "User";
    return String(avatars.getInitials(safeName));
};

export const getMenuById = async ({
    id,
}: {
    id: string;
}): Promise<Product> => {
    try {
        const res = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        );

        return res as unknown as Product;
    } catch (e: any) {
        console.log("GET MENU BY ID ERROR:", e);
        throw new Error(e?.message || "Could not fetch menu item.");
    }
};

export const getMenu = async ({
    category,
    query,
}: {
    category?: string;
    query?: string;
}): Promise<Product[]> => {
    try {
        const queries: string[] = [];

        if (category) {
            queries.push(Query.equal("categories", category));
        }

        if (query) {
            queries.push(Query.search("name", query));
        }

        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );

        return res.documents as unknown as Product[];
    } catch (e: any) {
        console.log("GET MENU ERROR:", e);
        throw new Error(e?.message || "Could not fetch products.");
    }
};

export const getCategories = async (): Promise<Category[]> => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        );

        return res.documents as unknown as Category[];
    } catch (e: any) {
        console.log("GET CATEGORIES ERROR:", e);
        throw new Error(e?.message || "Could not fetch categories.");
    }
};

export const getProductInventory = async (
    productId: string
): Promise<ProductInventory[]> => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productInventoryCollectionId,
            [Query.equal("productId", productId)]
        );

        return res.documents as unknown as ProductInventory[];
    } catch (e: any) {
        console.log("GET PRODUCT INVENTORY ERROR:", e);
        throw new Error(e?.message || "Could not fetch product inventory.");
    }
};

export const signIn = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    try {
        return await account.createEmailPasswordSession(
            normalizeEmail(email),
            password
        );
    } catch (e: any) {
        console.log("SIGN IN ERROR:", e);
        throw new Error(e?.message || "Could not sign in.");
    }
};

export const signUp = async ({
    email,
    password,
    name,
}: {
    email: string;
    password: string;
    name: string;
}) => {
    try {
        const cleanEmail = normalizeEmail(email);
        const cleanName = name.trim();

        const newAccount = await account.create(
            ID.unique(),
            cleanEmail,
            password,
            cleanName
        );

        await account.createEmailPasswordSession(cleanEmail, password);

        const existingProfile = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", newAccount.$id)]
        );

        if (existingProfile.documents.length > 0) {
            return existingProfile.documents[0];
        }

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: cleanEmail,
                name: cleanName,
                avatar: getInitialsAvatar(cleanName),
                deleted: false,
            }
        );
    } catch (e: any) {
        console.log("SIGN UP ERROR:", e);
        throw new Error(e?.message || "Could not create account.");
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount?.$id) {
            return null;
        }

        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!res.documents.length) {
            return await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                {
                    accountId: currentAccount.$id,
                    email: normalizeEmail(currentAccount.email),
                    name: currentAccount.name || "User",
                    avatar: getInitialsAvatar(currentAccount.name),
                    deleted: false,
                }
            );
        }

        const user = res.documents[0];

        if (user.deleted === true) {
            await logout();
            return null;
        }

        return user;
    } catch {
        return null;
    }
};

export const getUserAddresses = async () => {
    try {
        const currentAccount = await account.get();

        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.addressesCollectionId,
            [
                Query.equal("userId", currentAccount.$id),
                Query.orderDesc("$createdAt"),
            ]
        );

        return res.documents;
    } catch (e: any) {
        console.log("GET ADDRESSES ERROR:", e);
        throw new Error(e?.message || "Could not fetch addresses.");
    }
};

export const createAddress = async ({
    label,
    address,
}: {
    label: string;
    address: string;
}) => {
    try {
        const currentAccount = await account.get();

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.addressesCollectionId,
            ID.unique(),
            {
                userId: currentAccount.$id,
                label: label.trim(),
                address: address.trim(),
            }
        );
    } catch (e: any) {
        console.log("CREATE ADDRESS ERROR:", e);
        throw new Error(e?.message || "Could not save address.");
    }
};

export const logout = async () => {
    try {
        await account.deleteSession("current");
    } catch (e) {
        console.log("LOGOUT ERROR:", e);
    }
};

export type OrderTrackingStatus =
    | "order_placed"
    | "confirmed"
    | "preparing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "payment_failed";

export type CreateOrderParams = {
    reference: string;
    email: string;
    items: string;
    total: number;

    accountId?: string;
    userId?: string;

    status?: string;
    trackingStatus?: string;

    paidAt?: string;
    gateway_response?: string;

    distributorId?: string;
    distributorName?: string;
};

export const createOrder = async (order: CreateOrderParams) => {
    try {
        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                reference: order.reference,
                email: order.email,
                items: order.items,
                total: order.total,

                accountId: order.accountId ?? null,
                userId: order.userId ?? null,

                status: order.status ?? "order_placed",
                trackingStatus: order.trackingStatus ?? "order_placed",

                paidAt: order.paidAt ?? new Date().toISOString(),

                gateway_response: order.gateway_response ?? null,

                distributorId:
                    order.distributorId ??
                    appwriteConfig.defaultDistributorId,

                distributorName:
                    order.distributorName ??
                    appwriteConfig.defaultDistributorName,
            }
        );
    } catch (e: any) {
        console.log("CREATE ORDER ERROR:", e);
        throw new Error(e?.message || "Could not create order.");
    }
};

export const getUserOrders = async ({
    accountId,
    userId,
    email,
}: {
    accountId?: string;
    userId?: string;
    email?: string;
}) => {
    try {
        const results: any[] = [];

        const addUnique = (docs: any[]) => {
            docs.forEach((doc) => {
                const exists = results.some((item) => item.$id === doc.$id);

                if (!exists) {
                    results.push(doc);
                }
            });
        };

        if (accountId) {
            const byAccountId = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                [
                    Query.equal("accountId", accountId),
                    Query.orderDesc("$createdAt"),
                ]
            );

            addUnique(byAccountId.documents);
        }

        if (accountId) {
            const byUserIdUsingAccountId = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                [
                    Query.equal("userId", accountId),
                    Query.orderDesc("$createdAt"),
                ]
            );

            addUnique(byUserIdUsingAccountId.documents);
        }

        if (userId && userId !== accountId) {
            const byUserId = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc("$createdAt"),
                ]
            );

            addUnique(byUserId.documents);
        }

        if (email) {
            const byEmail = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                [
                    Query.equal("email", email),
                    Query.orderDesc("$createdAt"),
                ]
            );

            addUnique(byEmail.documents);
        }

        return results.sort((a, b) => {
            const dateA = new Date(a.$createdAt || a.paidAt || 0).getTime();
            const dateB = new Date(b.$createdAt || b.paidAt || 0).getTime();

            return dateB - dateA;
        });
    } catch (e: any) {
        console.log("GET USER ORDERS ERROR:", e);
        throw new Error(e?.message || "Could not fetch orders.");
    }
};

export const getDistributorOrders = async (
    distributorId = appwriteConfig.defaultDistributorId
) => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.equal("distributorId", distributorId),
                Query.orderDesc("$createdAt"),
            ]
        );

        return res.documents;
    } catch (e: any) {
        console.log("GET DISTRIBUTOR ORDERS ERROR:", e);
        throw new Error(e?.message || "Could not fetch distributor orders.");
    }
};

const getTrackingTimestampField = (trackingStatus: OrderTrackingStatus) => {
    switch (trackingStatus) {
        case "confirmed":
            return "confirmedAt";

        case "preparing":
            return "preparingAt";

        case "out_for_delivery":
            return "outForDeliveryAt";

        case "delivered":
            return "deliveredAt";

        case "cancelled":
            return "cancelledAt";

        default:
            return null;
    }
};

export const updateOrderTrackingStatus = async ({
    orderId,
    trackingStatus,
}: {
    orderId: string;
    trackingStatus: OrderTrackingStatus;
}) => {
    try {
        const timestampField = getTrackingTimestampField(trackingStatus);

        const payload: Record<string, any> = {
            trackingStatus,
            status:
                trackingStatus === "cancelled"
                    ? "cancelled"
                    : trackingStatus === "payment_failed"
                    ? "payment_failed"
                    : "order_placed",
        };

        if (timestampField) {
            payload[timestampField] = new Date().toISOString();
        }

        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            payload
        );
    } catch (e: any) {
        console.log("UPDATE ORDER TRACKING ERROR:", e);
        throw new Error(e?.message || "Could not update order status.");
    }
};

export { ID, Query };