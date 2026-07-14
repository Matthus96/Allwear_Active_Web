"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
    ContactShadows,
    Html,
    OrbitControls,
} from "@react-three/drei";

import RugbyJersey from "@/components/kitbuilder/RugbyJersey";
import { useKitBuilderStore } from "@/store/useKitBuilderStore";

function CameraController() {
    const { camera, invalidate } = useThree();

    const cameraView = useKitBuilderStore(
        (state) => state.cameraView
    );

    const cameraRevision = useKitBuilderStore(
        (state) => state.cameraRevision
    );

    useEffect(() => {
switch (cameraView) {
    case "front":
        camera.position.set(0, 0, -6.5);
        break;

    case "side":
        camera.position.set(6.5, 0, 0);
        break;

    case "back":
    default:
        camera.position.set(0, 0, 6.5);
        break;
}

camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
invalidate();
    }, [camera, cameraView, cameraRevision, invalidate]);

    return null;
}

function LoadingModel() {
    return (
        <Html center>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-900 shadow-lg">
                Loading 3D kit
            </div>
        </Html>
    );
}

export default function KitBuilderCanvas() {
    return (
        <Canvas
            shadows
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{
                position: [0, 0, 6.5],
                fov: 38,
                near: 0.1,
                far: 100,
            }}
            fallback={
                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-600">
                    3D rendering is not supported on this device.
                </div>
            }
        >
            <color attach="background" args={["#f4f4f5"]} />

            <ambientLight intensity={1.7} />

            <directionalLight
                position={[4, 6, 5]}
                intensity={3}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <directionalLight
                position={[-4, 2, -3]}
                intensity={1.5}
            />

            <CameraController />

            <Suspense fallback={<LoadingModel />}>
                <RugbyJersey />

<ContactShadows
    position={[0, -1.82, 0]}
    opacity={0.28}
    scale={5}
    blur={2.5}
    far={3}
    resolution={512}
/>
            </Suspense>

<OrbitControls
    makeDefault
    target={[0, 0, 0]}
    enablePan={false}
    enableDamping
    dampingFactor={0.08}
    minDistance={4}
    maxDistance={9}
    minPolarAngle={Math.PI * 0.25}
    maxPolarAngle={Math.PI * 0.75}
/>
        </Canvas>
    );
}