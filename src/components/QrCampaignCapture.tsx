"use client";

import { useEffect } from "react";

const STORAGE_KEYS = {
    coupon: "allwear_coupon",
    referral: "allwear_ref",
    campaign: "allwear_campaign",
};

export default function QrCampaignCapture() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);

        const coupon = params.get("coupon");
        const referral = params.get("ref");
        const campaign = params.get("campaign");

        if (coupon) {
            localStorage.setItem(
                STORAGE_KEYS.coupon,
                coupon.trim().toUpperCase()
            );
        }

        if (referral) {
            localStorage.setItem(
                STORAGE_KEYS.referral,
                referral.trim().toUpperCase()
            );
        }

        if (campaign) {
            localStorage.setItem(
                STORAGE_KEYS.campaign,
                campaign.trim()
            );
        }
    }, []);

    return null;
}