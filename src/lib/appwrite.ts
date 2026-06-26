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
    return String(
        storage.getFileView(
            appwriteConfig.bucketId,
            fileId
        )
    );
};

const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase();
};

const getInitialsAvatar = (name?: string) => {
    const safeName = name?.trim() || "User";
    return String(avatars.getInitials(safeName));
};

export const getMenuById = async ({ id }: { id: string }) => {
    try {
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        );
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

        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        return res.documents[0] ?? null;
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

export { ID, Query };