"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import { Archive } from "./Archive";
import { Floor } from "./Floor";

type Tier = "high" | "low" | "static";

/**
 * The flight path. Not a straight dolly: it climbs out of the corridor,
 * clears the monoliths, looks down into the canyon, then dives back to
 * street level. Vertical variation is what makes the space read as
 * architecture rather than a hallway.
 */
const WAYPOINTS = [
  [0, 2.6, 6],
  [1.8, 5.0, -12],
  [-2.2, 15.0, -34],
  [1.6, 34.0, -56],
  [-1.4, 17.0, -78],
  [2.4, 4.6, -100],
  [-1.8, 3.2, -120],
  [0, 2.4, -142],
] as const;

function CameraRig() {
  const { camera } = useThree();

  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        WAYPOINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );

  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((state) => {
    const p = THREE.MathUtils.clamp(scrollState.progress, 0, 1);
    const t = state.clock.elapsedTime;

    path.getPointAt(p, pos.current);

    camera.position.set(
      pos.current.x,
      pos.current.y + Math.sin(t * 0.42) * 0.06,
      pos.current.z,
    );

    // look ahead along the path, extrapolating past the final waypoint
    const aheadT = Math.min(1, p + 0.05);
    path.getPointAt(aheadT, look.current);
    if (aheadT >= 1) {
      look.current.addScaledVector(path.getTangentAt(1), 6);
    }

    // the higher we are, the further down we look, so the canyon stays in frame
    const drop = THREE.MathUtils.clamp((pos.current.y - 2.6) / 31, 0, 1) * 16;

    camera.lookAt(look.current.x, look.current.y - drop, look.current.z);
  });

  return null;
}

export default function Scene() {
  const [tier, setTier] = useState<Tier>("high");
  const lightPos = useRef(new THREE.Vector3(0, 13, 0));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency ?? 4;
    setTier(reduced ? "static" : small || cores <= 4 ? "low" : "high");
  }, []);

  const high = tier === "high";
  const density = high ? 1 : 0.45;

  return (
    <Canvas
      dpr={high ? [1, 1.75] : 1}
      gl={{
        antialias: high,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 2.7, 6], fov: 55, near: 0.1, far: 240 }}
      style={{ pointerEvents: "none" }}
      frameloop={tier === "static" ? "demand" : "always"}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color("#0a0a0b"), 1);
        scene.fog = new THREE.FogExp2(0x0a0a0b, 0.018);
      }}
    >
      <CameraRig />
      <Floor lightPos={lightPos} />
      <Archive density={density} intensity={1} lightPos={lightPos} />

      {high && (
        <EffectComposer>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
          <Vignette offset={0.22} darkness={0.82} eskil={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
