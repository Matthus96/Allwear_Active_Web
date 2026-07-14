"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { useJerseyTexture } from "@/components/kitbuilder/useJerseyTexture";
import {
    type SleeveUVBounds,
    useSleeveNameTexture,
} from "@/components/kitbuilder/useSleeveNameTexture";

import {
    type GarmentZone,
    useKitBuilderStore,
} from "@/store/useKitBuilderStore";

const MODEL_URL = "/models/rugby-jersey-05.glb";
const TARGET_HEIGHT = 3.6;

function getZoneFromMeshName(
    name: string
): GarmentZone | null {
    if (name.startsWith("Jersey_Body")) {
        return "body";
    }

    if (name.startsWith("Jersey_LeftSleeve")) {
        return "leftSleeve";
    }

    if (name.startsWith("Jersey_RightSleeve")) {
        return "rightSleeve";
    }

    if (name.startsWith("Jersey_Collar")) {
        return "collar";
    }

    return null;
}

function getLargestZoneUVIslandBounds(
    root: THREE.Object3D,
    targetZone: GarmentZone
): SleeveUVBounds | null {
    let largestBounds: SleeveUVBounds | null =
        null;

    let largestArea = 0;

    root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
            return;
        }

        if (
            getZoneFromMeshName(object.name) !==
            targetZone
        ) {
            return;
        }

        const geometry = object.geometry;

        const uv =
            geometry.getAttribute("uv");

        if (!uv) {
            return;
        }

        const index =
            geometry.getIndex();

        const triangleCount = index
            ? Math.floor(index.count / 3)
            : Math.floor(uv.count / 3);

        if (triangleCount === 0) {
            return;
        }

        const parent =
            new Int32Array(triangleCount);

        for (
            let triangle = 0;
            triangle < triangleCount;
            triangle += 1
        ) {
            parent[triangle] = triangle;
        }

        function find(value: number): number {
            let current = value;

            while (
                parent[current] !== current
            ) {
                parent[current] =
                    parent[parent[current]];

                current = parent[current];
            }

            return current;
        }

        function union(
            first: number,
            second: number
        ) {
            const firstRoot = find(first);
            const secondRoot = find(second);

            if (firstRoot !== secondRoot) {
                parent[secondRoot] = firstRoot;
            }
        }

        function getVertexIndex(
            triangle: number,
            corner: number
        ) {
            const offset =
                triangle * 3 + corner;

            return index
                ? index.getX(offset)
                : offset;
        }

        function getUVKey(
            vertexIndex: number
        ) {
            const u = Math.round(
                uv.getX(vertexIndex) * 100000
            );

            const v = Math.round(
                uv.getY(vertexIndex) * 100000
            );

            return `${u}:${v}`;
        }

        const firstTriangleForUV =
            new Map<string, number>();

        for (
            let triangle = 0;
            triangle < triangleCount;
            triangle += 1
        ) {
            for (
                let corner = 0;
                corner < 3;
                corner += 1
            ) {
                const vertexIndex =
                    getVertexIndex(
                        triangle,
                        corner
                    );

                const key =
                    getUVKey(vertexIndex);

                const existingTriangle =
                    firstTriangleForUV.get(key);

                if (
                    existingTriangle !== undefined
                ) {
                    union(
                        triangle,
                        existingTriangle
                    );
                } else {
                    firstTriangleForUV.set(
                        key,
                        triangle
                    );
                }
            }
        }

        type ComponentData = {
            minU: number;
            maxU: number;
            minV: number;
            maxV: number;
            area: number;
        };

        const components =
            new Map<number, ComponentData>();

        for (
            let triangle = 0;
            triangle < triangleCount;
            triangle += 1
        ) {
            const componentId =
                find(triangle);

            let component =
                components.get(componentId);

            if (!component) {
                component = {
                    minU:
                        Number.POSITIVE_INFINITY,
                    maxU:
                        Number.NEGATIVE_INFINITY,
                    minV:
                        Number.POSITIVE_INFINITY,
                    maxV:
                        Number.NEGATIVE_INFINITY,
                    area: 0,
                };

                components.set(
                    componentId,
                    component
                );
            }

            const a =
                getVertexIndex(triangle, 0);

            const b =
                getVertexIndex(triangle, 1);

            const c =
                getVertexIndex(triangle, 2);

            const au = uv.getX(a);
            const av = uv.getY(a);

            const bu = uv.getX(b);
            const bv = uv.getY(b);

            const cu = uv.getX(c);
            const cv = uv.getY(c);

            component.minU = Math.min(
                component.minU,
                au,
                bu,
                cu
            );

            component.maxU = Math.max(
                component.maxU,
                au,
                bu,
                cu
            );

            component.minV = Math.min(
                component.minV,
                av,
                bv,
                cv
            );

            component.maxV = Math.max(
                component.maxV,
                av,
                bv,
                cv
            );

            component.area +=
                Math.abs(
                    (bu - au) * (cv - av) -
                        (cu - au) *
                            (bv - av)
                ) / 2;
        }

        components.forEach((component) => {
            if (
                component.area <= largestArea
            ) {
                return;
            }

            largestArea = component.area;

            largestBounds = {
                minU: component.minU,
                maxU: component.maxU,
                minV: component.minV,
                maxV: component.maxV,
            };
        });
    });

    return largestBounds;
}

export default function RugbyJersey() {
    const { scene } = useGLTF(MODEL_URL);

    const zoneColours = useKitBuilderStore(
        (state) => state.zoneColours
    );

    const designPattern = useKitBuilderStore(
        (state) => state.designPattern
    );

    const secondaryColour = useKitBuilderStore(
        (state) => state.secondaryColour
    );

    const badge = useKitBuilderStore(
        (state) => state.badge
    );

    const garmentName = useKitBuilderStore(
        (state) => state.garmentName
    );

    const preparedModel = useMemo(() => {
        const clonedScene = scene.clone(true);

        clonedScene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) {
                return;
            }

            object.castShadow = true;
            object.receiveShadow = true;

            if (Array.isArray(object.material)) {
                object.material = object.material.map(
                    (material) => material.clone()
                );
            } else if (object.material) {
                object.material =
                    object.material.clone();
            }
        });

        const scaleGroup = new THREE.Group();
        const centreGroup = new THREE.Group();

        centreGroup.add(clonedScene);
        scaleGroup.add(centreGroup);

        scaleGroup.updateMatrixWorld(true);

        const boundingBox =
            new THREE.Box3().setFromObject(
                centreGroup,
                true
            );

        const centre = boundingBox.getCenter(
            new THREE.Vector3()
        );

        const size = boundingBox.getSize(
            new THREE.Vector3()
        );

        centreGroup.position.set(
            -centre.x,
            -centre.y,
            -centre.z
        );

        const modelHeight = Math.max(
            size.y,
            0.001
        );

        const uniformScale =
            TARGET_HEIGHT / modelHeight;

        scaleGroup.scale.setScalar(
            uniformScale
        );

        scaleGroup.updateMatrixWorld(true);

        return scaleGroup;
    }, [scene]);

const sleeveUVBounds = useMemo(
    () => ({
        leftSleeve:
            getLargestZoneUVIslandBounds(
                preparedModel,
                "leftSleeve"
            ),

        rightSleeve:
            getLargestZoneUVIslandBounds(
                preparedModel,
                "rightSleeve"
            ),
    }),
    [preparedModel]
);

    const bodyTexture = useJerseyTexture({
        primaryColour: zoneColours.body,
        secondaryColour,
        pattern: designPattern,
        badge,
        garmentName,
    });

    const leftSleeveTexture =
        useSleeveNameTexture({
            baseColour:
                zoneColours.leftSleeve,
            garmentName,
            placement: "leftSleeve",
            uvBounds:
                sleeveUVBounds.leftSleeve,
        });

    const rightSleeveTexture =
        useSleeveNameTexture({
            baseColour:
                zoneColours.rightSleeve,
            garmentName,
            placement: "rightSleeve",
            uvBounds:
                sleeveUVBounds.rightSleeve,
        });

    useEffect(() => {
        preparedModel.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) {
                return;
            }

            const zone = getZoneFromMeshName(
                object.name
            );

            if (!zone) {
                return;
            }

            const materials = Array.isArray(
                object.material
            )
                ? object.material
                : [object.material];

            materials.forEach((material) => {
                if (
                    !(
                        material instanceof
                        THREE.MeshStandardMaterial
                    )
                ) {
                    return;
                }

                if (zone === "body") {
                    material.color.set("#ffffff");
                    material.map = bodyTexture;
                } else if (zone === "leftSleeve") {
                    material.color.set("#ffffff");
                    material.map = leftSleeveTexture;
                } else if (zone === "rightSleeve") {
                    material.color.set("#ffffff");
                    material.map = rightSleeveTexture;
                } else {
                    material.map = null;
                    material.color.set(
                        zoneColours.collar
                    );
                }

                material.roughness = 0.78;
                material.metalness = 0;
                material.needsUpdate = true;
            });
        });
    }, [
        preparedModel,
        bodyTexture,
        leftSleeveTexture,
        rightSleeveTexture,
        zoneColours,
    ]);

    return (
        <primitive
            object={preparedModel}
            position={[0, 0, 0]}
        />
    );
}

useGLTF.preload(MODEL_URL);