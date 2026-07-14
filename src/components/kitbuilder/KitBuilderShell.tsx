"use client";

import dynamic from "next/dynamic";
import {
    type ChangeEvent,
    useState,
} from "react";

import {
    type CameraView,
    type GarmentZone,
    type NamePlacement,
    useKitBuilderStore,
} from "@/store/useKitBuilderStore";

    const designPatterns = [
        {
            id: "plain",
            label: "Plain",
        },
        {
            id: "horizontal-stripes",
            label: "Horizontal",
        },
        {
            id: "vertical-stripes",
            label: "Vertical",
        },
        {
            id: "diagonal-stripes",
            label: "Diagonal",
        },
        {
            id: "gradient",
            label: "Gradient",
        },
        {
            id: "inset-stripe",
            label: "Inset Stripe",
        },
    ] as const;

const KitBuilderCanvas = dynamic(
    () => import("@/components/kitbuilder/KitBuilderCanvas"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center bg-zinc-100">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-950" />

                    <p className="text-sm font-semibold text-zinc-600">
                        Preparing 3D builder
                    </p>
                </div>
            </div>
        ),
    }
);

const zones: Array<{
    id: GarmentZone;
    label: string;
}> = [
    {
        id: "body",
        label: "Main body",
    },
    {
        id: "leftSleeve",
        label: "Left sleeve",
    },
    {
        id: "rightSleeve",
        label: "Right sleeve",
    },
    {
        id: "collar",
        label: "Collar",
    },
    
];

const cameraViews: Array<{
    id: CameraView;
    label: string;
}> = [
    {
        id: "front",
        label: "Front",
    },
    {
        id: "back",
        label: "Back",
    },
    {
        id: "side",
        label: "Side",
    },
];

const namePlacements: Array<{
    id: NamePlacement;
    label: string;
    cameraView: CameraView;
}> = [
    {
        id: "leftSleeve",
        label: "Left sleeve",
        cameraView: "side",
    },
    {
        id: "rightSleeve",
        label: "Right sleeve",
        cameraView: "side",
    },
    {
        id: "backUpper",
        label: "Upper back",
        cameraView: "back",
    },
];

const sizeOptions = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
] as const;

function downloadTextFile(
    fileName: string,
    contents: string,
    mimeType: string
) {
    const blob = new Blob(
        [contents],
        {
            type: mimeType,
        }
    );

    const url =
        URL.createObjectURL(blob);

    const anchor =
        document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(
        anchor
    );

    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function escapeCsvValue(
    value:
        | string
        | number
) {
    const text =
        String(value ?? "");

    return `"${text.replace(
        /"/g,
        '""'
    )}"`;
}

export default function KitBuilderShell() {

    const players = useKitBuilderStore(
        (state) => state.players
    );

    const selectedPlayerId =
        useKitBuilderStore(
            (state) =>
                state.selectedPlayerId
        );

    const selectPlayer =
        useKitBuilderStore(
            (state) =>
                state.selectPlayer
        );

    const updatePlayer =
        useKitBuilderStore(
            (state) =>
                state.updatePlayer
        );

    const addPlayer =
        useKitBuilderStore(
            (state) =>
                state.addPlayer
        );

    const removePlayer =
        useKitBuilderStore(
            (state) =>
                state.removePlayer
        );

    const namePlacement =
        useKitBuilderStore(
            (state) =>
                state.namePlacement
        );

    const setNamePlacement =
        useKitBuilderStore(
            (state) =>
                state.setNamePlacement
        );

    const nameColour =
        useKitBuilderStore(
            (state) =>
                state.nameColour
        );

    const setNameColour =
        useKitBuilderStore(
            (state) =>
                state.setNameColour
        );

    const zoneColours = useKitBuilderStore(
        (state) => state.zoneColours
    );

    const cameraView = useKitBuilderStore(
        (state) => state.cameraView
    );

    const setZoneColour = useKitBuilderStore(
        (state) => state.setZoneColour
    );

    const setCameraView = useKitBuilderStore(
        (state) => state.setCameraView
    );

    const resetDesign = useKitBuilderStore(
        (state) => state.resetDesign
    );

    const designPattern =
    useKitBuilderStore(
        (state) =>
            state.designPattern
    );

    const secondaryColour =
        useKitBuilderStore(
            (state) =>
                state.secondaryColour
        );

    const setDesignPattern =
        useKitBuilderStore(
            (state) =>
                state.setDesignPattern
        );

    const setSecondaryColour =
        useKitBuilderStore(
            (state) =>
                state.setSecondaryColour
        );

    const badge = useKitBuilderStore(
        (state) => state.badge
    );

    const setBadge = useKitBuilderStore(
        (state) => state.setBadge
    );

    const updateBadge = useKitBuilderStore(
        (state) => state.updateBadge
    );

    const removeBadge = useKitBuilderStore(
        (state) => state.removeBadge
    );

    const [badgeError, setBadgeError] =
        useState<string | null>(null);

    const [
        exportMessage,
        setExportMessage,
    ] = useState<string | null>(
        null
    );

            function handleBadgeUpload(
                event: ChangeEvent<HTMLInputElement>
            ) {
                const file =
                    event.target.files?.[0];

                event.target.value = "";

                if (!file) {
                    return;
                }

                const allowedTypes = [
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                ];

                if (!allowedTypes.includes(file.type)) {
                    setBadgeError(
                        "Upload a PNG, JPG or WebP image."
                    );

                    return;
                }

                const maximumSize =
                    5 * 1024 * 1024;

                if (file.size > maximumSize) {
                    setBadgeError(
                        "The image must be smaller than 5 MB."
                    );

                    return;
                }

                setBadgeError(null);

                const reader = new FileReader();

                reader.onload = () => {
                    if (
                        typeof reader.result !== "string"
                    ) {
                        setBadgeError(
                            "The image could not be read."
                        );

                        return;
                    }

                    setBadge({
                        name: file.name,
                        dataUrl: reader.result,

                        // Starting coordinates for this jersey's
                        // lower-left front UV panel.
                        x: 0.25,
                        y: 0.43,

                        scale: 0.11,
                        rotation: 0,
                    });
                };

                reader.onerror = () => {
                    setBadgeError(
                        "The image could not be read."
                    );
                };

                reader.readAsDataURL(file);
            }


    const selectedPlayer =
        players.find(
            (player) =>
                player.id ===
                selectedPlayerId
        ) ?? players[0];

    const activePlayers =
        players.filter(
            (player) =>
                player.name.trim() ||
                player.number.trim()
        );

    function handleExportJob() {
        if (
            activePlayers.length === 0
        ) {
            setExportMessage(
                "Add at least one player name or number before exporting."
            );

            return;
        }

        const createdAt =
            new Date();

        const timestamp =
            createdAt
                .toISOString()
                .replace(/\D/g, "")
                .slice(0, 14);

        const jobId =
            `KIT-TEST-${timestamp}`;

        const exportPlayers =
            activePlayers.map(
                (player) => ({
                    ...player,
                    name:
                        player.name
                            .trim()
                            .toUpperCase(),
                    number:
                        player.number
                            .trim()
                            .toUpperCase(),
                })
            );

        const job = {
            schemaVersion: 1,
            jobId,
            createdAt:
                createdAt.toISOString(),

            garment: {
                id:
                    "rugby-jersey-05",
                model:
                    "/models/rugby-jersey-05.glb",
            },

            design: {
                pattern:
                    designPattern,

                primaryColour:
                    zoneColours.body,

                secondaryColour,

                zoneColours,
            },

            personalisation: {
                namePlacement,
                nameColour,
            },

            badge: badge
                ? {
                      name:
                          badge.name,
                      x: badge.x,
                      y: badge.y,
                      scale:
                          badge.scale,
                      rotation:
                          badge.rotation,
                  }
                : null,

            players:
                exportPlayers,
        };

        const csvRows = [
            [
                "jobId",
                "playerId",
                "name",
                "number",
                "size",
                "quantity",
                "namePlacement",
                "nameColour",
            ],

            ...exportPlayers.map(
                (player) => [
                    jobId,
                    player.id,
                    player.name,
                    player.number,
                    player.size,
                    player.quantity,
                    namePlacement,
                    nameColour,
                ]
            ),
        ];

        const csv =
            csvRows
                .map((row) =>
                    row
                        .map(
                            escapeCsvValue
                        )
                        .join(",")
                )
                .join("\r\n");

        downloadTextFile(
            `${jobId}.json`,
            JSON.stringify(
                job,
                null,
                2
            ),
            "application/json"
        );

        window.setTimeout(() => {
            downloadTextFile(
                `${jobId}-roster.csv`,
                csv,
                "text/csv;charset=utf-8"
            );
        }, 250);

        setExportMessage(
            `${exportPlayers.length} player dataset${
                exportPlayers.length === 1
                    ? ""
                    : "s"
            } exported for Roster Flow.`
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <section className="border-b border-zinc-200 px-5 py-6 lg:px-8">
                <div className="mx-auto flex max-w-[1500px] flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                        Allwear Custom
                    </span>

                    <h1 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">
                        3D Kit Builder
                    </h1>

                    <p className="max-w-2xl text-sm leading-6 text-zinc-600 md:text-base">
                        Design and preview your rugby kit from every
                        angle.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
                {/* CONTROLS */}
                <aside className="order-2 rounded-3xl border border-zinc-200 bg-white p-5 lg:order-1">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                                Step 1
                            </p>

                            <h2 className="mt-1 text-xl font-black text-zinc-950">
                                Kit colours
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={resetDesign}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-black text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="mt-7 border-t border-zinc-200 pt-6">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                            Team badge
                        </p>

                        <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-4 py-5 text-center transition hover:border-zinc-950">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleBadgeUpload}
                                className="sr-only"
                            />

                            <span>
                                <span className="block text-sm font-black text-zinc-900">
                                    Upload badge
                                </span>

                                <span className="mt-1 block text-xs text-zinc-500">
                                    Transparent PNG recommended
                                </span>
                            </span>
                        </label>

                        {badgeError ? (
                            <p className="mt-2 text-xs font-semibold text-red-600">
                                {badgeError}
                            </p>
                        ) : null}

                        {badge ? (
                            <div className="mt-4 space-y-4 rounded-2xl bg-zinc-100 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-xs font-bold text-zinc-700">
                                        {badge.name}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={removeBadge}
                                        className="text-xs font-black text-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <label className="block">
                                    <span className="mb-2 flex justify-between text-xs font-bold text-zinc-600">
                                        Horizontal position
                                        <span>
                                            {Math.round(
                                                badge.x * 100
                                            )}
                                            %
                                        </span>
                                    </span>

                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.005}
                                        value={badge.x}
                                        onChange={(event) =>
                                            updateBadge({
                                                x: Number(
                                                    event.target.value
                                                ),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 flex justify-between text-xs font-bold text-zinc-600">
                                        Vertical position
                                        <span>
                                            {Math.round(
                                                badge.y * 100
                                            )}
                                            %
                                        </span>
                                    </span>

                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.005}
                                        value={badge.y}
                                        onChange={(event) =>
                                            updateBadge({
                                                y: Number(
                                                    event.target.value
                                                ),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 flex justify-between text-xs font-bold text-zinc-600">
                                        Badge size
                                        <span>
                                            {Math.round(
                                                badge.scale * 100
                                            )}
                                            %
                                        </span>
                                    </span>

                                    <input
                                        type="range"
                                        min={0.03}
                                        max={0.35}
                                        step={0.005}
                                        value={badge.scale}
                                        onChange={(event) =>
                                            updateBadge({
                                                scale: Number(
                                                    event.target.value
                                                ),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 flex justify-between text-xs font-bold text-zinc-600">
                                        Rotation
                                        <span>
                                            {badge.rotation}°
                                        </span>
                                    </span>

                                    <input
                                        type="range"
                                        min={-180}
                                        max={180}
                                        step={1}
                                        value={badge.rotation}
                                        onChange={(event) =>
                                            updateBadge({
                                                rotation: Number(
                                                    event.target.value
                                                ),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </label>
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-7 border-t border-zinc-200 pt-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                                    Team roster
                                </p>

                                <p className="mt-1 text-xs font-semibold text-zinc-500">
                                    {players.length} player datasets
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addPlayer}
                                className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                            >
                                Add player
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {players.map(
                                (
                                    player,
                                    index
                                ) => {
                                    const isActive =
                                        player.id ===
                                        selectedPlayerId;

                                    return (
                                        <button
                                            key={player.id}
                                            type="button"
                                            onClick={() =>
                                                selectPlayer(
                                                    player.id
                                                )
                                            }
                                            className={`min-w-0 rounded-xl px-2 py-3 text-xs font-black transition ${
                                                isActive
                                                    ? "bg-zinc-950 text-white"
                                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                            title={
                                                player.name ||
                                                `Player ${index + 1}`
                                            }
                                        >
                                            <span className="block truncate">
                                                {player.name ||
                                                    `Player ${index + 1}`}
                                            </span>

                                            {player.number ? (
                                                <span className="mt-1 block text-[10px] opacity-70">
                                                    #{player.number}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        {selectedPlayer ? (
                            <div className="mt-4 space-y-3 rounded-2xl bg-zinc-100 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-zinc-900">
                                        Edit selected player
                                    </p>

                                    {players.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removePlayer(
                                                    selectedPlayer.id
                                                )
                                            }
                                            className="text-xs font-black text-red-600"
                                        >
                                            Remove row
                                        </button>
                                    ) : null}
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-xs font-bold text-zinc-600">
                                        Player name
                                    </span>

                                    <input
                                        type="text"
                                        value={selectedPlayer.name}
                                        maxLength={18}
                                        placeholder="NAME"
                                        onChange={(event) =>
                                            updatePlayer(
                                                selectedPlayer.id,
                                                {
                                                    name:
                                                        event.target.value.toUpperCase(),
                                                }
                                            )
                                        }
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-black uppercase text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-2 block text-xs font-bold text-zinc-600">
                                            Number
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={selectedPlayer.number}
                                            maxLength={3}
                                            placeholder="10"
                                            onChange={(event) =>
                                                updatePlayer(
                                                    selectedPlayer.id,
                                                    {
                                                        number:
                                                            event.target.value
                                                                .replace(
                                                                    /[^0-9A-Za-z]/g,
                                                                    ""
                                                                )
                                                                .toUpperCase(),
                                                    }
                                                )
                                            }
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-black text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-xs font-bold text-zinc-600">
                                            Size
                                        </span>

                                        <select
                                            value={selectedPlayer.size}
                                            onChange={(event) =>
                                                updatePlayer(
                                                    selectedPlayer.id,
                                                    {
                                                        size:
                                                            event.target.value,
                                                    }
                                                )
                                            }
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-black text-zinc-950 outline-none transition focus:border-zinc-950"
                                        >
                                            {sizeOptions.map(
                                                (size) => (
                                                    <option
                                                        key={size}
                                                        value={size}
                                                    >
                                                        {size}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-xs font-bold text-zinc-600">
                                        Quantity
                                    </span>

                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={selectedPlayer.quantity}
                                        onChange={(event) =>
                                            updatePlayer(
                                                selectedPlayer.id,
                                                {
                                                    quantity:
                                                        Math.max(
                                                            1,
                                                            Number(
                                                                event.target.value
                                                            ) || 1
                                                        ),
                                                }
                                            )
                                        }
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-black text-zinc-950 outline-none transition focus:border-zinc-950"
                                    />
                                </label>
                            </div>
                        ) : null}

                        <div className="mt-4">
                            <p className="mb-2 text-sm font-bold text-zinc-800">
                                Name placement
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                                {namePlacements.map(
                                    (placement) => {
                                        const isActive =
                                            namePlacement ===
                                            placement.id;

                                        return (
                                            <button
                                                key={placement.id}
                                                type="button"
                                                onClick={() => {
                                                    setNamePlacement(
                                                        placement.id
                                                    );

                                                    setCameraView(
                                                        placement.cameraView
                                                    );
                                                }}
                                                className={`rounded-xl px-2 py-3 text-xs font-black transition ${
                                                    isActive
                                                        ? "bg-zinc-950 text-white"
                                                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                                }`}
                                            >
                                                {placement.label}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-3">
                            <div>
                                <span className="block text-sm font-bold text-zinc-800">
                                    Name colour
                                </span>

                                <span className="font-mono text-xs uppercase text-zinc-500">
                                    {nameColour}
                                </span>
                            </div>

                            <input
                                type="color"
                                value={nameColour}
                                onChange={(event) =>
                                    setNameColour(
                                        event.target.value
                                    )
                                }
                                className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                                aria-label="Choose player-name colour"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleExportJob}
                            className="mt-4 w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white transition hover:bg-zinc-800"
                        >
                            Done — export test job
                        </button>

                        {exportMessage ? (
                            <p className="mt-3 text-xs font-semibold leading-5 text-zinc-600">
                                {exportMessage}
                            </p>
                        ) : null}

                        <p className="mt-3 text-xs leading-5 text-zinc-500">
                            The selected player is shown on the 3D jersey.
                            Done exports a JSON design job and a CSV roster
                            for the Roster Flow test.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {zones.map((zone) => (
                            <label
                                key={zone.id}
                                className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-3 transition hover:border-zinc-400"
                            >
                                <span className="text-sm font-bold text-zinc-800">
                                    {zone.label}
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="font-mono text-xs uppercase text-zinc-500">
                                        {zoneColours[zone.id]}
                                    </span>

                                    <input
                                        type="color"
                                        value={zoneColours[zone.id]}
                                        onChange={(event) =>
                                            setZoneColour(
                                                zone.id,
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                                        aria-label={`Choose ${zone.label} colour`}
                                    />
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-7 border-t border-zinc-200 pt-6">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                            Design pattern
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            {designPatterns.map(
                                (pattern) => {
                                    const isActive =
                                        designPattern ===
                                        pattern.id;

                                    return (
                                        <button
                                            key={pattern.id}
                                            type="button"
                                            onClick={() =>
                                                setDesignPattern(
                                                    pattern.id
                                                )
                                            }
                                            className={`rounded-xl px-3 py-3 text-xs font-black transition ${
                                                isActive
                                                    ? "bg-zinc-950 text-white"
                                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                        >
                                            {pattern.label}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        {designPattern === "gradient" ? (
                            <div className="mt-4 space-y-3">
                                {/* PRIMARY GRADIENT COLOUR */}
                                <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-3">
                                    <div>
                                        <span className="block text-sm font-bold text-zinc-800">
                                            Primary colour
                                        </span>

                                        <span className="font-mono text-xs uppercase text-zinc-500">
                                            {zoneColours.body}
                                        </span>
                                    </div>

                                    <input
                                        type="color"
                                        value={zoneColours.body}
                                        onChange={(event) =>
                                            setZoneColour(
                                                "body",
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                                        aria-label="Choose primary gradient colour"
                                    />
                                </label>

                                {/* SECONDARY GRADIENT COLOUR */}
                                <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-3">
                                    <div>
                                        <span className="block text-sm font-bold text-zinc-800">
                                            Secondary colour
                                        </span>

                                        <span className="font-mono text-xs uppercase text-zinc-500">
                                            {secondaryColour}
                                        </span>
                                    </div>

                                    <input
                                        type="color"
                                        value={secondaryColour}
                                        onChange={(event) =>
                                            setSecondaryColour(
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                                        aria-label="Choose secondary gradient colour"
                                    />
                                </label>
                            </div>
                        ) : designPattern !== "plain" ? (
                            <label className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-200 p-3">
                                <div>
                                    <span className="block text-sm font-bold text-zinc-800">
                                        Pattern colour
                                    </span>

                                    <span className="font-mono text-xs uppercase text-zinc-500">
                                        {secondaryColour}
                                    </span>
                                </div>

                                <input
                                    type="color"
                                    value={secondaryColour}
                                    onChange={(event) =>
                                        setSecondaryColour(
                                            event.target.value
                                        )
                                    }
                                    className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                                    aria-label="Choose pattern colour"
                                />
                            </label>
                        ) : null}
                    </div>

                    <div className="mt-7 border-t border-zinc-200 pt-6">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                            Camera angle
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {cameraViews.map((view) => {
                                const isActive =
                                    cameraView === view.id;

                                return (
                                    <button
                                        key={view.id}
                                        type="button"
                                        onClick={() =>
                                            setCameraView(view.id)
                                        }
                                        className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                                            isActive
                                                ? "bg-zinc-950 text-white"
                                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                        }`}
                                    >
                                        {view.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-7 rounded-2xl bg-zinc-100 p-4">
                        <p className="text-sm font-bold text-zinc-900">
                            Prototype controls
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Drag to rotate. Scroll or pinch to zoom.
                            The simplified jersey will be replaced by
                            the production 3D garment model.
                        </p>
                    </div>
                </aside>

                {/* VIEWER */}
                <div className="order-1 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 lg:order-2">
                    <div className="relative h-[520px] w-full sm:h-[620px] lg:h-[calc(100vh-190px)] lg:min-h-[650px]">
                        <KitBuilderCanvas />

                        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-zinc-700 shadow-sm backdrop-blur">
                            Rugby jersey prototype
                        </div>

                        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950/85 px-5 py-2 text-center text-xs font-bold text-white backdrop-blur">
                            Drag to rotate · Scroll to zoom
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}