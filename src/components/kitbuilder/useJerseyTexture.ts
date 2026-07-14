"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import type {
    DesignPattern,
    GarmentName,
    NamePlacement,
    UploadedBadge,
} from "@/store/useKitBuilderStore";

type NamePlacementPreset = {
    x: number;
    y: number;
    rotation: number;
    fontSize: number;
    maxWidth: number;
};

const NAME_PLACEMENT_PRESETS: Record<
    NamePlacement,
    NamePlacementPreset
> = {
    backUpper: {
        x: 0.68,
        y: 0.50,
        rotation: 0,
        fontSize: 0.022,
        maxWidth: 0.17,
    },

    leftSleeve: {
        x: 0.16,
        y: 0.16,
        rotation: 90,
        fontSize: 0.035,
        maxWidth: 0.15,
    },

    rightSleeve: {
        x: 0.84,
        y: 0.16,
        rotation: -90,
        fontSize: 0.035,
        maxWidth: 0.15,
    },
};

type UseJerseyTextureParams = {
    primaryColour: string;
    secondaryColour: string;
    pattern: DesignPattern;
    badge: UploadedBadge | null;
    garmentName: GarmentName;
};

const BODY_GRADIENT_TOP = 0.47;
const BODY_GRADIENT_BOTTOM = 0.91; 

const TEXTURE_SIZE = 2048;

const HORIZONTAL_STRIPE_HEIGHT = 70;
const VERTICAL_STRIPE_WIDTH = 70;
const DIAGONAL_STRIPE_WIDTH = 70;

function drawBaseDesign(
    context: CanvasRenderingContext2D,
    primaryColour: string,
    secondaryColour: string,
    pattern: DesignPattern
) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    context.clearRect(0, 0, width, height);

    context.fillStyle = primaryColour;
    context.fillRect(0, 0, width, height);

    switch (pattern) {
        case "horizontal-stripes": {
            for (
                let y = 0;
                y < height;
                y += HORIZONTAL_STRIPE_HEIGHT * 2
            ) {
                context.fillStyle = secondaryColour;

                context.fillRect(
                    0,
                    y,
                    width,
                    HORIZONTAL_STRIPE_HEIGHT
                );
            }

            break;
        }

        case "vertical-stripes": {
            for (
                let x = 0;
                x < width;
                x += VERTICAL_STRIPE_WIDTH * 2
            ) {
                context.fillStyle = secondaryColour;

                context.fillRect(
                    x,
                    0,
                    VERTICAL_STRIPE_WIDTH,
                    height
                );
            }

            break;
        }

        case "diagonal-stripes": {
            context.save();

            context.translate(
                width / 2,
                height / 2
            );

            context.rotate(-Math.PI / 5);

            context.translate(
                -width / 2,
                -height / 2
            );

            for (
                let x = -width;
                x < width * 2;
                x += DIAGONAL_STRIPE_WIDTH * 2
            ) {
                context.fillStyle = secondaryColour;

                context.fillRect(
                    x,
                    -height,
                    DIAGONAL_STRIPE_WIDTH,
                    height * 3
                );
            }

            context.restore();

            break;
        }

        case "gradient": {
            const gradientStartY =
                height * BODY_GRADIENT_TOP;

            const gradientEndY =
                height * BODY_GRADIENT_BOTTOM;

            const gradient =
                context.createLinearGradient(
                    0,
                    gradientStartY,
                    0,
                    gradientEndY
                );

            gradient.addColorStop(
                0,
                primaryColour
            );

            gradient.addColorStop(
                1,
                secondaryColour
            );

            context.fillStyle = gradient;

            context.fillRect(
                0,
                0,
                width,
                height
            );

            break;
        }
    }
}

function loadImage(
    source: string
): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.crossOrigin = "anonymous";

        image.onload = () => {
            resolve(image);
        };

        image.onerror = () => {
            reject(
                new Error(
                    "The uploaded artwork could not be loaded."
                )
            );
        };

        image.src = source;
    });
}

function fitFontSize(
    context: CanvasRenderingContext2D,
    text: string,
    startingSize: number,
    maximumWidth: number,
    minimumSize: number
) {
    let fontSize = startingSize;

    context.font =
        `900 ${fontSize}px Arial, sans-serif`;

    while (
        context.measureText(text).width >
            maximumWidth &&
        fontSize > minimumSize
    ) {
        fontSize -= 2;

        context.font =
            `900 ${fontSize}px Arial, sans-serif`;
    }

    return fontSize;
}

function drawGarmentName(
    context: CanvasRenderingContext2D,
    garmentName: GarmentName
) {
    const nameText =
        garmentName.text.trim().toUpperCase();

    const numberText =
        garmentName.number.trim().toUpperCase();

    if (!nameText && !numberText) {
        return;
    }

    const placement =
        NAME_PLACEMENT_PRESETS[
            garmentName.placement
        ];

    const canvasWidth =
        context.canvas.width;

    const canvasHeight =
        context.canvas.height;

    const x =
        canvasWidth * placement.x;

    const nameY =
        canvasHeight * placement.y;

    const nameMaximumWidth =
        canvasWidth * placement.maxWidth;

    context.save();

    context.translate(x, nameY);

    context.rotate(
        THREE.MathUtils.degToRad(
            placement.rotation
        )
    );

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = garmentName.colour;

    if (nameText) {
        const nameFontSize = fitFontSize(
            context,
            nameText,
            canvasWidth * placement.fontSize,
            nameMaximumWidth,
            28
        );

        context.font =
            `900 ${nameFontSize}px Arial, sans-serif`;

        context.fillText(
            nameText,
            0,
            0,
            nameMaximumWidth
        );
    }

    if (numberText) {
        const numberMaximumWidth =
            canvasWidth * 0.18;

        const numberFontSize = fitFontSize(
            context,
            numberText,
            canvasWidth * 0.105,
            numberMaximumWidth,
            64
        );

        context.font =
            `900 ${numberFontSize}px Arial, sans-serif`;

        context.fillText(
            numberText,
            0,
            canvasHeight * 0.07,
            numberMaximumWidth
        );
    }

    context.restore();
}

async function drawTintedMask(
    context: CanvasRenderingContext2D,
    source: string,
    colour: string,
    cancelled: () => boolean
) {
    const image = await loadImage(source);

    if (cancelled()) {
        return;
    }

    const maskCanvas =
        document.createElement("canvas");

    maskCanvas.width = context.canvas.width;
    maskCanvas.height = context.canvas.height;

    const maskContext =
        maskCanvas.getContext("2d");

    if (!maskContext) {
        return;
    }

    maskContext.clearRect(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
    );

    maskContext.drawImage(
        image,
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
    );

    maskContext.globalCompositeOperation =
        "source-in";

    maskContext.fillStyle = colour;

    maskContext.fillRect(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
    );

    maskContext.globalCompositeOperation =
        "source-over";

    context.drawImage(
        maskCanvas,
        0,
        0
    );
}

export function useJerseyTexture({
    primaryColour,
    secondaryColour,
    pattern,
    badge,
    garmentName,
}: UseJerseyTextureParams) {
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
    const canvasContext =
        canvas.getContext("2d");

    if (!canvasContext) {
        return;
    }

    const context: CanvasRenderingContext2D =
        canvasContext;

    let cancelled = false;

    async function renderTexture() {
        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.fillStyle = primaryColour;

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (pattern === "inset-stripe") {
            await drawTintedMask(
                context,
                "/kitbuilder/designs/inset-stripe/inset-stripe-primary.png",
                primaryColour,
                () => cancelled
            );

            await drawTintedMask(
                context,
                "/kitbuilder/designs/inset-stripe/inset-stripe-secondary.png",
                secondaryColour,
                () => cancelled
            );
        } else {
            drawBaseDesign(
                context,
                primaryColour,
                secondaryColour,
                pattern
            );
        }

        if (cancelled) {
            return;
        }

        if (badge) {
            const activeBadge: UploadedBadge =
                badge;

            try {
                const image = await loadImage(
                    activeBadge.dataUrl
                );

                if (cancelled) {
                    return;
                }

                const badgeWidth =
                    canvas.width *
                    activeBadge.scale;

                const imageRatio =
                    image.naturalHeight /
                    Math.max(
                        image.naturalWidth,
                        1
                    );

                const badgeHeight =
                    badgeWidth * imageRatio;

                const badgeX =
                    canvas.width *
                    activeBadge.x;

                const badgeY =
                    canvas.height *
                    activeBadge.y;

                context.save();

                context.translate(
                    badgeX,
                    badgeY
                );

                context.rotate(
                    THREE.MathUtils.degToRad(
                        activeBadge.rotation
                    )
                );

                context.drawImage(
                    image,
                    -badgeWidth / 2,
                    -badgeHeight / 2,
                    badgeWidth,
                    badgeHeight
                );

                context.restore();
            } catch (error) {
                console.error(
                    "BADGE DRAW ERROR:",
                    error
                );
            }
        }

    if (
        garmentName.placement ===
        "backUpper"
    ) {
        drawGarmentName(
            context,
            garmentName
        );
    }

        texture.needsUpdate = true;
    }

    void renderTexture();

    return () => {
        cancelled = true;
    };
}, [
    canvas,
    texture,
    primaryColour,
    secondaryColour,
    pattern,
    badge,
    garmentName,
]);

    useEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    return texture;
}
