import * as THREE from "three";

import type {
    DesignPattern,
} from "@/store/useKitBuilderStore";

type CreateJerseyTextureParams = {
    primaryColour: string;
    secondaryColour: string;
    pattern: DesignPattern;
};

const TEXTURE_SIZE = 2048;

export function createJerseyTexture({
    primaryColour,
    secondaryColour,
    pattern,
}: CreateJerseyTextureParams) {
    const canvas = document.createElement("canvas");

    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error(
            "Could not create jersey texture canvas."
        );
    }

    context.fillStyle = primaryColour;
    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    switch (pattern) {
        case "horizontal-stripes": {
            const stripeHeight = 100;

            for (
                let y = 0;
                y < canvas.height;
                y += stripeHeight * 2
            ) {
                context.fillStyle =
                    secondaryColour;

                context.fillRect(
                    0,
                    y,
                    canvas.width,
                    stripeHeight
                );
            }

            break;
        }

        case "vertical-stripes": {
            const stripeWidth = 100;

            for (
                let x = 0;
                x < canvas.width;
                x += stripeWidth * 2
            ) {
                context.fillStyle =
                    secondaryColour;

                context.fillRect(
                    x,
                    0,
                    stripeWidth,
                    canvas.height
                );
            }

            break;
        }

        case "diagonal-stripes": {
            context.save();

            context.translate(
                canvas.width / 2,
                canvas.height / 2
            );

            context.rotate(-Math.PI / 5);

            context.translate(
                -canvas.width / 2,
                -canvas.height / 2
            );

            const stripeWidth = 170;

            for (
                let x = -canvas.width;
                x < canvas.width * 2;
                x += stripeWidth * 2
            ) {
                context.fillStyle =
                    secondaryColour;

                context.fillRect(
                    x,
                    -canvas.height,
                    stripeWidth,
                    canvas.height * 3
                );
            }

            context.restore();

            break;
        }

        case "gradient": {
            const gradient =
                context.createLinearGradient(
                    0,
                    0,
                    canvas.width,
                    canvas.height
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
                canvas.width,
                canvas.height
            );

            break;
        }

        case "plain":
        default:
            break;
    }

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.flipY = false;

    texture.needsUpdate = true;

    return texture;
}