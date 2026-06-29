"use client";

import { create } from "zustand";
import {
    getCurrentUser,
    logout as appwriteLogout,
    signIn,
    signUp,
} from "@/lib/appwrite";

type AuthUser = {
    $id: string;
    accountId?: string;
    email: string;
    name?: string;
    avatar?: string;
};

type AuthStore = {
    user: AuthUser | null;
    loading: boolean;
    hydrated: boolean;

    checkAuth: () => Promise<void>;

    login: (email: string, password: string) => Promise<AuthUser | null>;

    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<AuthUser | null>;

    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,
    hydrated: false,

    checkAuth: async () => {
        try {
            set({ loading: true });

            const user = await getCurrentUser();

            set({
                user: user as unknown as AuthUser | null,
                hydrated: true,
            });
        } catch {
            set({
                user: null,
                hydrated: true,
            });
        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        try {
            set({ loading: true });

            await signIn({ email, password });

            const user = await getCurrentUser();

            set({
                user: user as unknown as AuthUser | null,
                hydrated: true,
            });

            return user as unknown as AuthUser | null;
        } finally {
            set({ loading: false });
        }
    },

    register: async (name, email, password) => {
        try {
            set({ loading: true });

            const user = await signUp({
                name,
                email,
                password,
            });

            set({
                user: user as unknown as AuthUser | null,
                hydrated: true,
            });

            return user as unknown as AuthUser | null;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            set({ loading: true });

            await appwriteLogout();

            set({
                user: null,
                hydrated: true,
            });
        } finally {
            set({ loading: false });
        }
    },
}));