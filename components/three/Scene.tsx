"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import { coastAt } from "@/lib/coast";
import { City } from "./City";
import { Crabs } from "./Crabs";
import { Ground } from "./Ground";
import { Shore } from "./Shore";
import { Sky } from "./Sky";

type Tier = "high" | "low" | "static";

/**
 * The flight path. It climbs out of the city, clears the towers, looks
 * down into the canyon, then drops back to the road — and keeps going
 * until the buildings run out and the road becomes sand.
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

/**
 * A portrait viewport with a 55° vertical FOV only sees ~27° horizontally,
 * which crops the city to a sliver. Widen the vertical FOV as the frame
 * gets taller so the street still reads on a phone.
 */
function AdaptiveFov() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const fov = aspect < 0.7 ? 84 : aspect < 1.05 ? 72 : aspect < 1.45 ? 62 : 55;
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

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

    // the higher we are, the further down we look, so the canyon stays in frame.
    // at the coast we tilt into the water instead, to give the sea some room.
    const drop =
      THREE.MathUtils.clamp((pos.current.y - 2.6) / 31, 0, 1) * 16 +
      coastAt(pos.current.z) * 0.7;

    // portrait frames would otherwise be half empty road — lift the aim so the
    // skyline fills the lower half instead
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const lift = aspect < 0.8 ? 3.4 : 0;

    camera.lookAt(look.current.x, look.current.y - drop + lift, look.current.z);
  });

  return null;
}

/** Fog and clear colour follow the coast so distance never seams. */
function Atmosphere() {
  const { scene, gl, camera } = useThree();
  const night = useMemo(() => new THREE.Color("#17161a"), []);
  const dusk = useMemo(() => new THREE.Color("#2b2330"), []);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x17161a, 0.014);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const coast = coastAt(camera.position.z);
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.color.lerpColors(night, dusk, coast);
      gl.setClearColor(fog.color, 1);
    }
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
      camera={{ position: [0, 2.7, 6], fov: 55, near: 0.1, far: 900 }}
      style={{ pointerEvents: "none" }}
      frameloop={tier === "static" ? "demand" : "always"}
    >
      <Atmosphere />
      <Sky />
      <AdaptiveFov />
      <CameraRig />
      <Ground lightPos={lightPos} />
      <City density={density} />
      <Shore />
      <Crabs />

      {high && (
        <EffectComposer>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
          <Vignette offset={0.22} darkness={0.55} eskil={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
