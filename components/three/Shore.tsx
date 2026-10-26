"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SUN_DIR, WATER_Z } from "@/lib/coast";

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

export const duskVertex = /* glsl */ `
  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;

  void main() {
    mat4 im = mat4(1.0);
    #ifdef USE_INSTANCING
      im = instanceMatrix;
    #endif

    vec4 world = modelMatrix * im * vec4(position, 1.0);
    vWorld   = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * mat3(im) * normal);

    vec4 mv = viewMatrix * world;
    vDepth  = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const duskFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uBase;
  uniform vec3  uSunCol;
  uniform vec3  uSunDir;
  uniform vec3  uFog;
  uniform float uRim;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    float sun = max(dot(N, normalize(uSunDir)), 0.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0);

    vec3 col = uBase * (0.9 + sun * 1.2);
    col += uSunCol * rim * uRim;
    col += uSunCol * pow(sun, 5.0) * 0.35;

    float fog = 1.0 - exp(-pow(vDepth * 0.020, 2.0));
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function DuskSurface({ color, rim = 0.2 }: { color: string; rim?: number }) {
  return (
    <shaderMaterial
      vertexShader={duskVertex}
      fragmentShader={duskFragment}
      uniforms={{
        uBase: { value: new THREE.Color(color) },
        uSunCol: { value: new THREE.Color("#ff6b2c") },
        uSunDir: { value: new THREE.Vector3(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).normalize() },
        uFog: { value: new THREE.Color("#2b2330") },
        uRim: { value: rim },
      }}
    />
  );
}

const PIER_X = 4.2;
const PIER_START = WATER_Z - 3;
const PIER_END = WATER_Z - 42;

/** A timber pier running out toward the sun. */
function Pier() {
  const posts = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let z = PIER_START; z >= PIER_END; z -= 3) {
      list.push([PIER_X - 1.6, 0.4, z], [PIER_X + 1.6, 0.4, z]);
    }
    return list;
  }, []);

  return (
    <group>
      <mesh position={[PIER_X, 0.62, (PIER_START + PIER_END) / 2]}>
        <boxGeometry args={[3.9, 0.26, PIER_START - PIER_END]} />
        <DuskSurface color="#221812" />
      </mesh>

      {posts.map(([x, y, z], i) => (
        <mesh key={`p${i}`} position={[x, y, z]}>
          <boxGeometry args={[0.22, 1.7, 0.22]} />
          <DuskSurface color="#150f0c" />
        </mesh>
      ))}

      {[-1, 1].map((s) => (
        <mesh
          key={`h${s}`}
          position={[PIER_X + s * 1.8, 2.15, (PIER_START + PIER_END) / 2]}
        >
          <boxGeometry args={[0.07, 0.07, PIER_START - PIER_END]} />
          <DuskSurface color="#150f0c" />
        </mesh>
      ))}

    </group>
  );
}

/** Dark rocks breaking the waterline. */
function Rocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, matrices } = useMemo(() => {
    const rnd = mulberry32(0x1d5c77);
    const g = new THREE.IcosahedronGeometry(1, 1);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    const spots: [number, number, number][] = [
      [-17, -0.35, WATER_Z - 8],
      [-27, -0.4, WATER_Z - 20],
      [-9, -0.25, WATER_Z - 2],
      [19, -0.35, WATER_Z - 14],
      [31, -0.4, WATER_Z - 26],
      [-14, 0.0, WATER_Z + 4],
      [24, 0.0, WATER_Z + 3],
    ];

    spots.forEach(([x, y, z]) => {
      const w = 0.7 + rnd() * 1.5;
      dummy.position.set(x, y + w * 0.2, z);
      dummy.rotation.set(rnd() * 0.5, rnd() * Math.PI, rnd() * 0.5);
      dummy.scale.set(w, w * (0.45 + rnd() * 0.3), w * (0.7 + rnd() * 0.7));
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    });

    return { geometry: g, matrices: list };
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, matrices.length]}>
      <DuskSurface color="#100b09" rim={0.1} />
    </instancedMesh>
  );
}

/** Dune grass in tufts — silhouette, not detail. */
function Grass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, matrices } = useMemo(() => {
    const rnd = mulberry32(0x6a2f41);

    const g = new THREE.PlaneGeometry(0.08, 1, 1, 3);
    g.translate(0, 0.5, 0);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setX(i, pos.getX(i) * (1 - y * 0.9));
    }
    g.computeVertexNormals();

    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let c = 0; c < 46; c++) {
      const side = rnd() > 0.5 ? 1 : -1;
      const cx = side * (3.6 + Math.pow(rnd(), 0.8) * 16);
      const cz = -139 - rnd() * 13;
      const blades = 5 + Math.floor(rnd() * 5);

      for (let b = 0; b < blades; b++) {
        const a = rnd() * Math.PI * 2;
        const r = rnd() * 0.55;

        dummy.position.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r);
        dummy.rotation.set(0, rnd() * Math.PI, (rnd() - 0.5) * 0.3);
        dummy.scale.set(1, 0.3 + rnd() * 0.55, 1);
        dummy.updateMatrix();
        list.push(dummy.matrix.clone());
      }
    }

    return { geometry: g, matrices: list };
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, matrices.length]}>
      <shaderMaterial
        vertexShader={duskVertex}
        fragmentShader={duskFragment}
        side={THREE.DoubleSide}
        uniforms={{
          uBase: { value: new THREE.Color("#100b08") },
          uSunCol: { value: new THREE.Color("#ff6b2c") },
          uSunDir: { value: new THREE.Vector3(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).normalize() },
          uFog: { value: new THREE.Color("#2b2330") },
          uRim: { value: 0.05 },
        }}
      />
    </instancedMesh>
  );
}


/** Shells and pebbles scattered along the tideline. */
function Shells() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, matrices } = useMemo(() => {
    const rnd = mulberry32(0x3c81aa);
    const g = new THREE.SphereGeometry(1, 7, 5);
    const list: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 64; i++) {
      const side = rnd() > 0.5 ? 1 : -1;
      const x = side * (1.6 + Math.pow(rnd(), 0.7) * 14);
      const z = -148.6 - rnd() * 3.1;
      const w = 0.035 + Math.pow(rnd(), 2.0) * 0.09;

      dummy.position.set(x, w * 0.35, z);
      dummy.rotation.set((rnd() - 0.5) * 0.3, rnd() * Math.PI, (rnd() - 0.5) * 0.3);
      dummy.scale.set(w, w * 0.4, w * (0.8 + rnd() * 0.5));
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }

    return { geometry: g, matrices: list };
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, matrices.length]}>
      <DuskSurface color="#7d6142" rim={0.3} />
    </instancedMesh>
  );
}

export function Shore() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    // a slow swell, felt rather than seen
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.035;
    }
  });

  return (
    <group ref={groupRef}>
      <Pier />
      <Rocks />
      <Grass />
      <Shells />
    </group>
  );
}
