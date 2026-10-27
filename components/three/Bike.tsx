"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { coastAt } from "@/lib/coast";

/**
 * A bike working the street.
 *
 * It runs a closed loop: down the right-hand lane toward the viewer, a U-turn
 * at the near end, back up the left-hand lane, and a U-turn at the far end.
 * Driving on the left, so oncoming traffic passes on the camera's right.
 *
 * The loop is a real curve rather than a ping-pong, so the turnarounds are
 * actual arcs — the bike banks into them and the headlight sweeps across the
 * road. Nothing ever teleports, so no fade is needed.
 *
 * Everything is primitives — no assets, matching the rest of the scene.
 */

const LANE = 4.2;
const NEAR_Z = 26;
const FAR_Z = -92;
const SPEED = 16; // m/s
const WHEEL_R = 0.32;

const NIGHT = new THREE.Color("#17161a");
const DUSK = new THREE.Color("#2b2330");

const bikeVertex = /* glsl */ `
  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld   = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv  = viewMatrix * world;
    vDepth   = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const bikeFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uFog;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    // rim light so the silhouette separates from the dark road
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 col = uBase + uRim * fres * 1.1;

    // a touch of sky on upward faces
    col += uRim * max(N.y, 0.0) * 0.05;

    float fd = vDepth * 0.020;
    float fog = 1.0 - exp(-fd * fd);
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const poolVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const poolFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    // stretched along the road, brightest just ahead of the wheel
    float d = length(vec2(p.x * 2.4, p.y * 0.92));
    float a = smoothstep(0.85, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor * a * 1.4, a * 0.5);
  }
`;

export function Bike() {
  const group = useRef<THREE.Group>(null);
  const front = useRef<THREE.Mesh>(null);
  const rear = useRef<THREE.Mesh>(null);
  const dist = useRef(0);
  const heading = useRef(0);
  const lean = useRef(0);

  const bodyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bikeVertex,
        fragmentShader: bikeFragment,
        uniforms: {
          uBase: { value: new THREE.Color("#0b0b10") },
          uRim: { value: new THREE.Color("#ff9a5e") },
          uFog: { value: new THREE.Color("#17161a") },
        },
      }),
    [],
  );

  const darkMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#0c0c11" }),
    [],
  );
  const midMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#15151c" }),
    [],
  );
  const headMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#fff4d6", toneMapped: false }),
    [],
  );
  const tailMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ff2b1a", toneMapped: false }),
    [],
  );
  const poolMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: poolVertex,
        fragmentShader: poolFragment,
        uniforms: { uColor: { value: new THREE.Color("#ffd9a8") } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const wheelGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.12, 16);
    g.rotateZ(Math.PI / 2); // axis along X, so the wheel spins on X
    return g;
  }, []);

  // Closed loop, driving on the left: the +x lane comes toward the viewer,
  // U-turns behind the camera, then the -x lane heads back out. The points
  // either side of each end pull the curve into an arc rather than a corner.
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [
      new THREE.Vector3(LANE, 0, FAR_Z),
      new THREE.Vector3(LANE, 0, 0),
      new THREE.Vector3(LANE, 0, NEAR_Z),
      new THREE.Vector3(LANE * 0.5, 0, NEAR_Z + 3.2),
      new THREE.Vector3(0, 0, NEAR_Z + 4),
      new THREE.Vector3(-LANE * 0.5, 0, NEAR_Z + 3.2),
      new THREE.Vector3(-LANE, 0, NEAR_Z),
      new THREE.Vector3(-LANE, 0, 0),
      new THREE.Vector3(-LANE, 0, FAR_Z),
      new THREE.Vector3(-LANE * 0.5, 0, FAR_Z - 3.2),
      new THREE.Vector3(0, 0, FAR_Z - 4),
      new THREE.Vector3(LANE * 0.5, 0, FAR_Z - 3.2),
    ];
    const c = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
    c.arcLengthDivisions = 400;
    return c;
  }, []);

  const length = useMemo(() => curve.getLength(), [curve]);

  useEffect(() => {
    return () => {
      wheelGeo.dispose();
      bodyMat.dispose();
      darkMat.dispose();
      midMat.dispose();
      headMat.dispose();
      tailMat.dispose();
      poolMat.dispose();
    };
  }, [wheelGeo, bodyMat, darkMat, midMat, headMat, tailMat, poolMat]);

  const pos = useRef(new THREE.Vector3());
  const tan = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    dist.current = (dist.current + SPEED * delta) % length;
    const u = dist.current / length;

    curve.getPointAt(u, pos.current);
    curve.getTangentAt(u, tan.current);

    const target = Math.atan2(tan.current.x, tan.current.z);

    // shortest-path heading change, used to bank into the turns
    let dh = target - heading.current;
    if (dh > Math.PI) dh -= Math.PI * 2;
    if (dh < -Math.PI) dh += Math.PI * 2;
    heading.current = target;

    const rate = delta > 0 ? dh / delta : 0;
    const wanted = THREE.MathUtils.clamp(-rate * 0.16, -0.5, 0.5);
    lean.current += (wanted - lean.current) * Math.min(1, delta * 8);

    g.position.set(
      pos.current.x,
      0.02 + Math.sin(state.clock.elapsedTime * 6) * 0.006,
      pos.current.z,
    );
    g.rotation.y = target;
    g.rotation.z = lean.current;

    if (front.current) front.current.rotation.x -= (SPEED / WHEEL_R) * delta;
    if (rear.current) rear.current.rotation.x -= (SPEED / WHEEL_R) * delta;

    (bodyMat.uniforms.uFog.value as THREE.Color).lerpColors(
      NIGHT,
      DUSK,
      coastAt(pos.current.z),
    );
  });

  return (
    <group ref={group}>
      {/* wheels */}
      <mesh
        ref={front}
        geometry={wheelGeo}
        material={bodyMat}
        position={[0, WHEEL_R, 0.68]}
      />
      <mesh
        ref={rear}
        geometry={wheelGeo}
        material={midMat}
        position={[0, WHEEL_R, -0.68]}
      />

      {/* frame, tank, fairing, seat */}
      <mesh position={[0, 0.55, 0]} material={midMat}>
        <boxGeometry args={[0.16, 0.3, 0.9]} />
      </mesh>
      <mesh position={[0, 0.78, 0.02]} rotation={[0.1, 0, 0]} material={midMat}>
        <boxGeometry args={[0.3, 0.24, 0.45]} />
      </mesh>
      <mesh position={[0, 0.85, 0.5]} rotation={[-0.25, 0, 0]} material={bodyMat}>
        <boxGeometry args={[0.28, 0.34, 0.3]} />
      </mesh>
      <mesh position={[0, 0.79, -0.42]} material={darkMat}>
        <boxGeometry args={[0.24, 0.07, 0.42]} />
      </mesh>
      <mesh position={[0, 0.83, -0.62]} rotation={[0.2, 0, 0]} material={midMat}>
        <boxGeometry args={[0.16, 0.13, 0.3]} />
      </mesh>

      {/* forks and bars */}
      <mesh position={[-0.11, 0.58, 0.6]} rotation={[0.28, 0, 0]} material={midMat}>
        <boxGeometry args={[0.045, 0.55, 0.045]} />
      </mesh>
      <mesh position={[0.11, 0.58, 0.6]} rotation={[0.28, 0, 0]} material={midMat}>
        <boxGeometry args={[0.045, 0.55, 0.045]} />
      </mesh>
      <mesh position={[0, 0.95, 0.4]} material={midMat}>
        <boxGeometry args={[0.5, 0.04, 0.04]} />
      </mesh>

      {/* rider */}
      <mesh position={[0, 1.05, -0.04]} rotation={[-0.32, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.34, 0.48, 0.3]} />
      </mesh>
      <mesh position={[0, 1.3, 0.16]} material={midMat}>
        <sphereGeometry args={[0.13, 12, 10]} />
      </mesh>
      <mesh position={[-0.16, 1.02, 0.26]} rotation={[-0.95, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.07, 0.07, 0.42]} />
      </mesh>
      <mesh position={[0.16, 1.02, 0.26]} rotation={[-0.95, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.07, 0.07, 0.42]} />
      </mesh>
      <mesh position={[-0.17, 0.78, -0.22]} rotation={[0.5, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.1, 0.1, 0.36]} />
      </mesh>
      <mesh position={[0.17, 0.78, -0.22]} rotation={[0.5, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.1, 0.1, 0.36]} />
      </mesh>

      {/* headlight and tail light */}
      <mesh position={[0, 0.82, 0.72]} material={headMat}>
        <sphereGeometry args={[0.075, 10, 8]} />
      </mesh>
      <mesh position={[0, 0.78, -0.78]} material={tailMat}>
        <boxGeometry args={[0.12, 0.05, 0.03]} />
      </mesh>

      {/* light thrown on the road ahead */}
      <mesh position={[0, 0.015, 4.6]} rotation={[-Math.PI / 2, 0, 0]} material={poolMat}>
        <planeGeometry args={[3.2, 9]} />
      </mesh>
    </group>
  );
}
