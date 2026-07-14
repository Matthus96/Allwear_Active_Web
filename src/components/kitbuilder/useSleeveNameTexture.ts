"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import type {
    GarmentName,
} from "@/store/useKitBuilderStore";

export type SleevePlacement =
    | "leftSleeve"
    | "rightSleeve";

export type SleeveUVBounds = {
    minU: number;
    maxU: number;
    minV: number;
    maxV: number;
};

type UseSleeveNameTextureParams = {
    baseColour: string;
    garmentName: GarmentName;
    placement: SleevePlacement;
    uvBounds: SleeveUVBounds | null;
};

const TEXTURE_SIZE = 2048;

export function useSleeveNameTexture({
    baseColour,
    garmentName,
    placement,
    uvBounds,
}: UseSleeveNameTextureParams) {
    const { canvas, texture } = useMemo(() => {
        const nextCanvas =
            document.createElement("canvas");

        nextCanvas.width = TEXTURE_SIZE;
        nextCanvas.height = TEXTURE_SIZE;

        const nextTexture =
            new THREE.CanvasTexture(nextCanvas);

        nextTexture.colorSpace =
            THREE.SRGBColorSpace;

        nextTexture.flipY = false;

        nextTexture.wrapS =
            THREE.ClampToEdgeWrapping;

        nextTexture.wrapT =
            THREE.ClampToEdgeWrapping;

        nextTexture.needsUpdate = true;

        return {
            canvas: nextCanvas,
            texture: nextTexture,
        };
    }, []);

    useEffect(() => {
        const context =
            canvas.getContext("2d");

        if (!context) {
            return;
        }

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.fillStyle = baseColour;

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const text =
            garmentName.text
                .trim()
                .toUpperCase();

        const shouldDrawName =
            text.length > 0 &&
            garmentName.placement === placement &&
            uvBounds !== null;

        if (shouldDrawName && uvBounds) {
            const centreU =
                (uvBounds.minU + uvBounds.maxU) / 2;

            const centreV =
                (uvBounds.minV + uvBounds.maxV) / 2;

            const islandWidth =
                canvas.width *
                (uvBounds.maxU - uvBounds.minU);

            const islandHeight =
                canvas.height *
                (uvBounds.maxV - uvBounds.minV);

            const x =
                canvas.width * centreU;

            // Move the name slightly lower on the sleeve.
            const y =
                canvas.height * centreV +
                islandHeight * 0.36;

            // Keep the name inside a narrower sleeve-safe area.
            const maximumWidth =
                islandWidth * 0.42;

            // Use a controlled font size instead of scaling
            // aggressively from the island height.
            let fontSize = Math.min(
                islandHeight * 0.08,
                72
            );

            fontSize = Math.max(
                fontSize,
                30
            );

context.save();

context.translate(x, y);

// Keep it horizontal until placement is confirmed.
context.rotate(0);

context.textAlign = "center";
context.textBaseline = "middle";
context.fillStyle =
    garmentName.colour;

context.font =
    `900 ${fontSize}px Arial, sans-serif`;

while (
    context.measureText(text).width >
        maximumWidth &&
    fontSize > 32
) {
    fontSize -= 2;

    context.font =
        `900 ${fontSize}px Arial, sans-serif`;
}

context.fillText(
    text,
    0,
    0,
    maximumWidth
);

context.restore();

            context.restore();
        }

        texture.needsUpdate = true;
    }, [
        canvas,
        texture,
        baseColour,
        garmentName,
        placement,
        uvBounds,
    ]);

    useEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    return texture;
}