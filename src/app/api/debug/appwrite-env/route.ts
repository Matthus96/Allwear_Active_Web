import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const requiredEnv = (name: string) => String(process.env[name] || "").trim();

export async function GET() {
    const endpoint = requiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT").replace(/\/$/, "");
    const projectId = requiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
    const apiKey = requiredEnv("APPWRITE_API_KEY");

    const keyHash = apiKey
        ? createHash("sha256").update(apiKey).digest("hex").slice(0, 16)
        : "";

    if (!endpoint || !projectId || !apiKey) {
        return NextResponse.json(
            {
                ok: false,
                endpoint,
                projectId,
                keyLength: apiKey.length,
                keyHash,
                message: "One or more Appwrite environment variables are missing.",
            },
            { status: 500 }
        );
    }

    const url =
        `${endpoint}/tablesdb/6a056e4c0007e2f52631/tables/orders/rows?total=false`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Appwrite-Project": projectId,
            "X-Appwrite-Key": apiKey,
        },
        cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
        ok: response.ok,
        appwriteStatus: response.status,
        endpoint,
        projectId,
        keyLength: apiKey.length,
        keyHash,
        appwriteResponse: text.slice(0, 500),
    });
}
