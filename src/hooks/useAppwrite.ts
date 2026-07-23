"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAppwriteOptions<T, P extends Record<string, any>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

const useAppwrite = <T, P extends Record<string, any>>({
    fn,
    params = {} as P,
    skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await fn({ ...fetchParams });
                setData(result);
            } catch (error: unknown) {
                const appwriteError = error as {
                    message?: string;
                    code?: number;
                    type?: string;
                    response?: unknown;
                };

                const errorMessage =
                    appwriteError?.message || "Something went wrong while fetching data.";

                setError(errorMessage);

            console.warn("APPWRITE FETCH WARNING:", {
                message: errorMessage,
                code: appwriteError?.code,
                type: appwriteError?.type,
                response: appwriteError?.response,
            });
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    console.log("APPWRITE CONFIG", {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    origin: typeof window !== "undefined" ? window.location.origin : "server",
    });

    useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
    }, [skip, fetchData]);

    const refetch = async (newParams?: P) => {
        await fetchData((newParams ?? params) as P);
    };

    return {
        data,
        loading,
        error,
        refetch,
    };
};

export default useAppwrite;