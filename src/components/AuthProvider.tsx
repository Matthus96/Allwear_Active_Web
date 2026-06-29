"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return <>{children}</>;
}