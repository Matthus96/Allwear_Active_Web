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
                    appwriteError.message ||
                    (error instanceof Error ? error.message : "Something went wrong");

                setError(errorMessage);

                console.error("APPWRITE FETCH ERROR:", {
                    message: errorMessage,
                    code: appwriteError.code,
                    type: appwriteError.type,
                    response: appwriteError.response,
                    rawError: error,
                });
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

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