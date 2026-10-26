"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SUN_DIR } from "@/lib/coast";
import { duskFragment, duskVertex } from "./Shore";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shadowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shadowFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.05, d) * 0.55;
    gl_FragColor = vec4(0.05, 0.025, 0.015, a);
  }
`;

const BODY_R = 0.17;

type CrabProps = {
  seed: number;
  material: THREE.ShaderMaterial;
  shadow: THREE.ShaderMaterial;
};

/** One crab, scuttling sideways along the waterline. */
function Crab({ seed, material, shadow }: CrabProps) {
  const groupRef = useRef<THREE.Group>(null);
  const legRefs = useRef<THREE.Mesh[]>([]);

  const base = useMemo(() => {
    const rnd = mulberry32(seed);
    return {
      x: (rnd() - 0.5) * 11,
      z: -149.5 - rnd() * 2.0,
      phase: rnd() * Math.PI * 2,
      speed: 0.18 + rnd() * 0.1,
      reach: 0.5 + rnd() * 0.9,
      scale: 0.9 + rnd() * 0.5,
      dir: rnd() > 0.5 ? 1 : -1,
    };
  }, [seed]);

  const legGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(0.022, 0.15, 0.022);
    g.translate(0, -0.075, 0);
    return g;
  }, []);

  useEffect(() => () => legGeometry.dispose(), [legGeometry]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = groupRef.current;
    if (!g) return;

    const travel = Math.sin(t * base.speed + base.phase) * base.reach * base.dir;

    g.position.x = base.x + travel;
    g.position.z = base.z;
    g.position.y = 0.11 + Math.abs(Math.sin(t * 9 + base.phase)) * 0.012;
    g.rotation.y = Math.sin(t * 0.7 + base.phase) * 0.16;

    legRefs.current.forEach((leg, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const step = Math.sin(
        t * 9 + base.phase + idx * 1.7 + (side > 0 ? 0 : Math.PI),
      );
      leg.rotation.z = side * (0.5 + step * 0.3);
    });
  });

  return (
    <group ref={groupRef} scale={base.scale} position={[base.x, 0.11, base.z]}>
      {/* contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.104, 0]}>
        <planeGeometry args={[0.72, 0.72]} />
        <primitive object={shadow} attach="material" />
      </mesh>

      {/* shell */}
      <mesh scale={[1, 0.5, 0.85]} material={material}>
        <sphereGeometry args={[BODY_R, 14, 10]} />
      </mesh>

      {/* eye stalks */}
      <mesh position={[-0.055, 0.115, 0.1]} material={material}>
        <sphereGeometry args={[0.026, 8, 6]} />
      </mesh>
      <mesh position={[0.055, 0.115, 0.1]} material={material}>
        <sphereGeometry args={[0.026, 8, 6]} />
      </mesh>

      {/* claws, held out in front */}
      <mesh position={[-0.115, 0.02, 0.165]} material={material}>
        <boxGeometry args={[0.075, 0.065, 0.13]} />
      </mesh>
      <mesh position={[0.115, 0.02, 0.165]} material={material}>
        <boxGeometry args={[0.075, 0.065, 0.13]} />
      </mesh>

      {/* legs */}
      {[0, 1, 2, 3].map((i) => {
        const z = -0.09 + i * 0.06;
        return (
          <group key={`l${i}`}>
            <mesh
              ref={(m) => {
                if (m) legRefs.current[i * 2] = m;
              }}
              geometry={legGeometry}
              material={material}
              position={[-0.14, 0, z]}
              rotation={[0, 0, -0.5]}
            />
            <mesh
              ref={(m) => {
                if (m) legRefs.current[i * 2 + 1] = m;
              }}
              geometry={legGeometry}
              material={material}
              position={[0.14, 0, z]}
              rotation={[0, 0, 0.5]}
            />
          </group>
        );
      })}
    </group>
  );
}

export function Crabs() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: duskVertex,
        fragmentShader: duskFragment,
        uniforms: {
          uBase: { value: new THREE.Color("#7a3a1e") },
          uSunCol: { value: new THREE.Color("#ff8a4a") },
          uSunDir: {
            value: new THREE.Vector3(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).normalize(),
          },
          uFog: { value: new THREE.Color("#2b2330") },
          uRim: { value: 0.45 },
        },
      }),
    [],
  );

  const shadow = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: shadowVertex,
        fragmentShader: shadowFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      material.dispose();
      shadow.dispose();
    },
    [material, shadow],
  );

  return (
    <group>
      {[11, 37, 63, 89, 113].map((seed) => (
        <Crab key={seed} seed={seed} material={material} shadow={shadow} />
      ))}
    </group>
  );
}
