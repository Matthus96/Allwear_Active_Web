"use client";

import { useEffect, useState } from "react";

import { appwriteConfig, teams } from "@/lib/appwrite";

export default function useIsDistributor() {
    const [isDistributor, setIsDistributor] = useState(false);
    const [checkingDistributor, setCheckingDistributor] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const checkDistributor = async () => {
            try {
                setCheckingDistributor(true);

                const result = await teams.list({
                    total: false,
                });

                const allowed = result.teams.some(
                    (team) => team.$id === appwriteConfig.distributorTeamId
                );

                if (!cancelled) {
                    setIsDistributor(allowed);
                }
            } catch (error) {
                console.log("DISTRIBUTOR TEAM CHECK ERROR:", error);

                if (!cancelled) {
                    setIsDistributor(false);
                }
            } finally {
                if (!cancelled) {
                    setCheckingDistributor(false);
                }
            }
        };

        checkDistributor();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        isDistributor,
        checkingDistributor,
    };
}