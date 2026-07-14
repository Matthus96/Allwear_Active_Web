"use client";

import { RoundedBox } from "@react-three/drei";

import { useKitBuilderStore } from "@/store/useKitBuilderStore";

export default function PrototypeJersey() {
    const zoneColours = useKitBuilderStore(
        (state) => state.zoneColours
    );

    return (
        <group
            position={[0, -0.05, 0]}
            rotation={[0, 0, 0]}
        >
            {/* MAIN BODY */}
            <RoundedBox
                args={[2.15, 2.8, 0.38]}
                radius={0.16}
                smoothness={5}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={zoneColours.body}
                    roughness={0.72}
                    metalness={0}
                />
            </RoundedBox>

            {/* LEFT SLEEVE */}
            <RoundedBox
                args={[0.78, 1.65, 0.36]}
                radius={0.14}
                smoothness={5}
                position={[-1.28, 0.55, 0]}
                rotation={[0, 0, -0.3]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={zoneColours.leftSleeve}
                    roughness={0.72}
                    metalness={0}
                />
            </RoundedBox>

            {/* RIGHT SLEEVE */}
            <RoundedBox
                args={[0.78, 1.65, 0.36]}
                radius={0.14}
                smoothness={5}
                position={[1.28, 0.55, 0]}
                rotation={[0, 0, 0.3]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={zoneColours.rightSleeve}
                    roughness={0.72}
                    metalness={0}
                />
            </RoundedBox>

            {/* COLLAR */}
            <mesh
                position={[0, 1.25, 0.22]}
                castShadow
            >
                <torusGeometry args={[0.35, 0.09, 24, 64]} />

                <meshStandardMaterial
                    color={zoneColours.collar}
                    roughness={0.65}
                />
            </mesh>

            {/* SUBTLE FRONT CHEST PANEL */}
            <RoundedBox
                args={[1.35, 0.06, 0.025]}
                radius={0.02}
                smoothness={3}
                position={[0, 0.62, 0.215]}
            >
                <meshStandardMaterial
                    color={zoneColours.collar}
                    roughness={0.7}
                />
            </RoundedBox>
        </group>
    );
}