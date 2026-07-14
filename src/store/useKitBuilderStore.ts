"use client";

import { create } from "zustand";

export type GarmentZone =
    | "body"
    | "leftSleeve"
    | "rightSleeve"
    | "collar";

export type UploadedBadge = {
    name: string;
    dataUrl: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
};

export type NamePlacement =
    | "leftSleeve"
    | "rightSleeve"
    | "backUpper";

export type GarmentName = {
    text: string;
    number: string;
    placement: NamePlacement;
    colour: string;
};

export type PlayerDataset = {
    id: string;
    name: string;
    number: string;
    size: string;
    quantity: number;
};

export type CameraView =
    | "front"
    | "back"
    | "side";

export type DesignPattern =
    | "plain"
    | "horizontal-stripes"
    | "vertical-stripes"
    | "diagonal-stripes"
    | "gradient"
    | "inset-stripe";

type ZoneColours =
    Record<GarmentZone, string>;

type KitBuilderState = {
    zoneColours: ZoneColours;
    cameraView: CameraView;
    cameraRevision: number;
    designPattern: DesignPattern;
    secondaryColour: string;

    badge: UploadedBadge | null;

    players: PlayerDataset[];
    selectedPlayerId: string;

    namePlacement: NamePlacement;
    nameColour: string;

    setBadge: (
        badge: UploadedBadge
    ) => void;

    updateBadge: (
        changes: Partial<
            Pick<
                UploadedBadge,
                "x" |
                "y" |
                "scale" |
                "rotation"
            >
        >
    ) => void;

    removeBadge: () => void;

    setZoneColour: (
        zone: GarmentZone,
        colour: string
    ) => void;

    setCameraView: (
        view: CameraView
    ) => void;

    setDesignPattern: (
        pattern: DesignPattern
    ) => void;

    setSecondaryColour: (
        colour: string
    ) => void;

    selectPlayer: (
        playerId: string
    ) => void;

    updatePlayer: (
        playerId: string,
        changes: Partial<
            Omit<PlayerDataset, "id">
        >
    ) => void;

    addPlayer: () => void;

    removePlayer: (
        playerId: string
    ) => void;

    setNamePlacement: (
        placement: NamePlacement
    ) => void;

    setNameColour: (
        colour: string
    ) => void;

    resetDesign: () => void;
};

const defaultZoneColours: ZoneColours = {
    body: "#111111",
    leftSleeve: "#ffffff",
    rightSleeve: "#ffffff",
    collar: "#d4af37",
};

const DEFAULT_PLAYER_COUNT = 12;

function createDefaultPlayers():
    PlayerDataset[] {
    return Array.from(
        {
            length:
                DEFAULT_PLAYER_COUNT,
        },
        (_, index) => ({
            id: `player-${index + 1}`,
            name: "",
            number: "",
            size: "M",
            quantity: 1,
        })
    );
}

function createPlayerId() {
    if (
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
    ) {
        return crypto.randomUUID();
    }

    return [
        "player",
        Date.now(),
        Math.random()
            .toString(36)
            .slice(2, 9),
    ].join("-");
}

export const useKitBuilderStore =
    create<KitBuilderState>(
        (set) => ({
            zoneColours: {
                ...defaultZoneColours,
            },

            cameraView: "front",
            cameraRevision: 0,

            designPattern: "plain",
            secondaryColour:
                "#ffffff",

            badge: null,

            players:
                createDefaultPlayers(),

            selectedPlayerId:
                "player-1",

            namePlacement:
                "backUpper",

            nameColour:
                "#ffffff",

            setZoneColour: (
                zone,
                colour
            ) =>
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
                        state.cameraRevision +
                        1,
                })),

            setDesignPattern: (
                pattern
            ) =>
                set({
                    designPattern:
                        pattern,
                }),

            setSecondaryColour: (
                colour
            ) =>
                set({
                    secondaryColour:
                        colour,
                }),

            setBadge: (badge) =>
                set({
                    badge,
                }),

            updateBadge: (
                changes
            ) =>
                set((state) => ({
                    badge:
                        state.badge
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

            selectPlayer: (
                playerId
            ) =>
                set({
                    selectedPlayerId:
                        playerId,
                }),

            updatePlayer: (
                playerId,
                changes
            ) =>
                set((state) => ({
                    players:
                        state.players.map(
                            (player) =>
                                player.id ===
                                playerId
                                    ? {
                                          ...player,
                                          ...changes,
                                      }
                                    : player
                        ),
                })),

            addPlayer: () =>
                set((state) => {
                    const nextPlayer: PlayerDataset =
                        {
                            id: createPlayerId(),
                            name: "",
                            number: "",
                            size: "M",
                            quantity: 1,
                        };

                    return {
                        players: [
                            ...state.players,
                            nextPlayer,
                        ],
                        selectedPlayerId:
                            nextPlayer.id,
                    };
                }),

            removePlayer: (
                playerId
            ) =>
                set((state) => {
                    if (
                        state.players.length <=
                        1
                    ) {
                        return state;
                    }

                    const nextPlayers =
                        state.players.filter(
                            (player) =>
                                player.id !==
                                playerId
                        );

                    const nextSelectedId =
                        state.selectedPlayerId ===
                        playerId
                            ? nextPlayers[0].id
                            : state.selectedPlayerId;

                    return {
                        players:
                            nextPlayers,
                        selectedPlayerId:
                            nextSelectedId,
                    };
                }),

            setNamePlacement: (
                placement
            ) =>
                set({
                    namePlacement:
                        placement,
                }),

            setNameColour: (
                colour
            ) =>
                set({
                    nameColour:
                        colour,
                }),

            resetDesign: () =>
                set((state) => ({
                    zoneColours: {
                        ...defaultZoneColours,
                    },

                    designPattern:
                        "plain",

                    secondaryColour:
                        "#ffffff",

                    cameraView:
                        "front",

                    cameraRevision:
                        state.cameraRevision +
                        1,

                    badge: null,

                    players:
                        createDefaultPlayers(),

                    selectedPlayerId:
                        "player-1",

                    namePlacement:
                        "backUpper",

                    nameColour:
                        "#ffffff",
                })),
        })
    );
