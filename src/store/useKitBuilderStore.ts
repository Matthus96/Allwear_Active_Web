import { create } from "zustand";

export type GarmentZone =
    | "body"
    | "leftSleeve"
    | "rightSleeve"
    | "collar"

    export type UploadedBadge = {
    name: string;
    dataUrl: string;
    

    /**
     * Normalised UV-canvas coordinates.
     * 0 = left/top
     * 1 = right/bottom
     */
    x: number;
    y: number;

    /**
     * Width relative to the full texture.
     * 0.1 means 10% of the texture width.
     */
    scale: number;

    rotation: number;
};

export type NamePlacement =
    | "leftSleeve"
    | "rightSleeve"
    | "backUpper";

export type GarmentName = {
    text: string;
    placement: NamePlacement;
    colour: string;
};

export type CameraView = "front" | "back" | "side";

export type DesignPattern =
    | "plain"
    | "horizontal-stripes"
    | "vertical-stripes"
    | "diagonal-stripes"
    | "gradient"
    | "inset-stripe";
    

type ZoneColours = Record<GarmentZone, string>;

type KitBuilderState = {
    zoneColours: ZoneColours;
    cameraView: CameraView;
    cameraRevision: number;
    designPattern: DesignPattern;
    secondaryColour: string;

    badge: UploadedBadge | null;

    

    setBadge: (badge: UploadedBadge) => void;

    updateBadge: (
        changes: Partial<
            Pick<
                UploadedBadge,
                "x" | "y" | "scale" | "rotation"
            >
        >
    ) => void;
    

    removeBadge: () => void;

    setZoneColour: (
        zone: GarmentZone,
        colour: string
    ) => void;

    setCameraView: (view: CameraView) => void;

    setDesignPattern: (
        pattern: DesignPattern
    ) => void;

    setSecondaryColour: (
        colour: string
    ) => void;

    resetDesign: () => void;

    garmentName: GarmentName;

    updateGarmentName: (
        changes: Partial<GarmentName>
    ) => void;

    clearGarmentName: () => void;
};

const defaultZoneColours: ZoneColours = {
    body: "#111111",
    leftSleeve: "#ffffff",
    rightSleeve: "#ffffff",
    collar: "#d4af37",
};

const defaultGarmentName: GarmentName = {
    text: "",
    placement: "backUpper",
    colour: "#FFFFFF",
};

export const useKitBuilderStore =
    create<KitBuilderState>((set) => ({
        zoneColours: defaultZoneColours,
        cameraView: "front",
        cameraRevision: 0,
        designPattern: "plain",
        secondaryColour: "#ffffff",

        setZoneColour: (zone, colour) =>
            set((state) => ({
                zoneColours: {
                    ...state.zoneColours,
                    [zone]: colour,
                },
            })),

        setCameraView: (view) =>
            set((state) => ({
                cameraView: view,
                cameraRevision:
                    state.cameraRevision + 1,
            })),

        setDesignPattern: (pattern) =>
            set({
                designPattern: pattern,
            }),

        setSecondaryColour: (colour) =>
            set({
                secondaryColour: colour,
            }),

        resetDesign: () =>
            set((state) => ({
                zoneColours: defaultZoneColours,
                designPattern: "plain",
                secondaryColour: "#ffffff",
                cameraView: "front",
                cameraRevision:
                    state.cameraRevision + 1,
            })),

            badge: null,

        setBadge: (badge) =>
            set({
                badge,
            }),

        updateBadge: (changes) =>
            set((state) => ({
                badge: state.badge
                    ? {
                        ...state.badge,
                        ...changes,
                    }
                    : null,
            })),

        removeBadge: () =>
            set({
                badge: null,
            }),

            garmentName: {
                ...defaultGarmentName,
            },

            updateGarmentName: (changes) =>
                set((state) => ({
                    garmentName: {
                        ...state.garmentName,
                        ...changes,
                    },
                })),

            clearGarmentName: () =>
                set({
                    garmentName: {
                        ...defaultGarmentName,
                    },
                }),

    }));