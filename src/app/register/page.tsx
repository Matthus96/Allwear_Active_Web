"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const register = useAuthStore((state) => state.register);

    const redirect = searchParams.get("redirect") || "/shop";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await register(name, email, password);

            router.push(redirect);
        } catch (err: any) {
            setError(err?.message || "Could not create account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
                <Link href="/" className="mb-8 inline-flex items-center">
                    <img
                        src="/images/Logo.png"
                        alt="Allwear Logo"
                        className="h-auto w-[220px] object-contain"
                    />
                </Link>

                <h1 className="text-3xl font-black text-zinc-950">
                    Create Account
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Register to checkout and track your orders.
                </p>

                {error ? (
                    <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-black text-zinc-950">
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#6FC276]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-black text-zinc-950">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#6FC276]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-black text-zinc-950">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#6FC276]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[#6FC276] px-6 py-4 font-black text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                        href={`/login?redirect=${encodeURIComponent(
                            redirect
                        )}`}
                        className="font-black text-[#6FC276]"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-zinc-50">
                    <p className="font-bold text-zinc-500">
                        Loading register...
                    </p>
                </main>
            }
        >
            <RegisterContent />
        </Suspense>
    );
}