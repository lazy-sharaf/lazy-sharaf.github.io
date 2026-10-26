"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

const cityVertex = /* glsl */ `
  attribute float aSeed;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying vec3  vLocal;
  varying vec3  vNormalL;
  varying float vDepth;
  varying float vSeed;

  void main() {
    vSeed = aSeed;

    mat4 im = mat4(1.0);
    #ifdef USE_INSTANCING
      im = instanceMatrix;
    #endif

    // metres, so the window grid stays the same size on every building
    vec3 scale = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
    vLocal  = position * scale;
    vNormalL = normal;

    vec4 world = modelMatrix * im * vec4(position, 1.0);
    vWorld   = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * mat3(im) * normal);

    vec4 mv = viewMatrix * world;
    vDepth  = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const cityFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uFog;
  uniform vec3  uBase;
  uniform vec3  uSunCol;
  uniform vec3  uSunDir;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying vec3  vLocal;
  varying vec3  vNormalL;
  varying float vDepth;
  varying float vSeed;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    // side faces only — roofs stay blank
    float side = step(abs(vNormalL.y), 0.5);
    float u = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    float v = vWorld.y;

    vec2 cell = vec2(u / 1.9, v / 3.0);
    vec2 id   = floor(cell);
    vec2 f    = fract(cell);

    // depth fade instead of derivatives — fwidth breaks up at triangle edges
    float detail = 1.0 - smoothstep(30.0, 80.0, vDepth);

    float wx = smoothstep(0.24, 0.28, f.x) * (1.0 - smoothstep(0.72, 0.76, f.x));
    float wy = smoothstep(0.30, 0.34, f.y) * (1.0 - smoothstep(0.76, 0.80, f.y));

    float win = wx * wy * side;

    float r    = hash21(id + vSeed * 91.7);
    float lit  = step(0.62, r);
    float glow = 0.30 + 0.70 * hash21(id * 1.37 + 3.1);

    vec3 wcol = mix(vec3(1.0, 0.74, 0.46), vec3(0.62, 0.78, 1.0), step(0.90, r));

    vec3 nearWin = wcol * win * lit * glow * 0.80;
    vec3 farWin  = vec3(1.0, 0.74, 0.48) * 0.085;

    // concrete, a touch lighter toward the roof
    vec3 col = uBase * (0.55 + 0.45 * smoothstep(0.0, 34.0, v));

    // west faces catch the last of the sun
    float sun = max(dot(N, normalize(uSunDir)), 0.0);
    col += uSunCol * pow(sun, 4.0) * 0.10;

    col += mix(farWin, nearWin, detail);

    // floor slab lines
    float slab = smoothstep(0.94, 1.0, fract(v / 3.0));
    col *= 1.0 - slab * 0.22 * detail;

    float fog = 1.0 - exp(-pow(vDepth * 0.020, 2.0));
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const beaconVertex = /* glsl */ `
  attribute float aSeed;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const beaconFragment = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uTime;
  varying float vSeed;

  void main() {
    float blink = 0.55 + 0.45 * sin(uTime * 1.6 + vSeed * 40.0);
    gl_FragColor = vec4(uColor * blink, 1.0);
  }
`;

export function City({ density = 1 }: { density?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const beaconMat = useRef<THREE.ShaderMaterial>(null);

  const { geometry, beacons, count, beaconCount } = useMemo(() => {
    const rnd = mulberry32(0x2f8ab3);

    const matrices: THREE.Matrix4[] = [];
    const seeds: number[] = [];
    const beaconSpots: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    const push = (
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
      base = 0,
    ) => {
      dummy.position.set(x, base + h / 2, z);
      dummy.scale.set(w, h, d);
      dummy.rotation.set(0, (rnd() - 0.5) * 0.05, 0);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
      seeds.push(rnd());
    };

    /* ---- street wall ---- */
    const rows = Math.round(49 * density);
    const perSide = Math.round(8 * density);

    for (let r = 0; r < rows; r++) {
      const z = -r * 2.4 + (rnd() - 0.5) * 0.5;

      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < perSide; i++) {
          if (rnd() < 0.07) continue; // the odd alley

          const x = s * (12.4 + i * 3.2 + (rnd() - 0.5) * 0.5);
          const w = 3.2 + rnd() * 4.3;
          const d = 3.2 + rnd() * 4.3;
          const h = 4.5 + Math.pow(rnd(), 1.5) * 20;

          // podium at street level
          if (rnd() < 0.4) {
            push(x, z, w * 1.22, 2.6 + rnd() * 2.6, d * 1.22);
          }

          push(x, z, w, h, d);

          // stepped setback
          if (rnd() < 0.45) {
            const hs = h * (0.18 + rnd() * 0.32);
            push(x, z, w * (0.55 + rnd() * 0.2), hs, d * (0.55 + rnd() * 0.2), h);
          }

          // rooftop mast with an aircraft light
          if (rnd() < 0.3) {
            const len = 2.5 + rnd() * 6;
            const top = h + (rnd() < 0.45 ? h * 0.3 : 0);
            push(x, z, 0.18, len, 0.18, top);
            dummy.position.set(x, top + len + 0.12, z);
            dummy.scale.setScalar(0.16 + rnd() * 0.1);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            beaconSpots.push(dummy.matrix.clone());
          }
        }
      }
    }

    /* ---- skyline behind ---- */
    const outer = Math.round(230 * density);
    for (let i = 0; i < outer; i++) {
      const s = rnd() > 0.5 ? 1 : -1;
      const x = s * (24 + rnd() * 46);
      const z = -rnd() * 116;
      const h = 9 + Math.pow(rnd(), 1.3) * 26;
      push(x, z, 3.4 + rnd() * 5.5, h, 3.4 + rnd() * 5.5);
    }

    const g = new THREE.BoxGeometry(1, 1, 1);
    g.setAttribute(
      "aSeed",
      new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1),
    );
    g.userData.matrices = matrices;

    const b = new THREE.SphereGeometry(1, 6, 4);
    b.setAttribute(
      "aSeed",
      new THREE.InstancedBufferAttribute(
        new Float32Array(beaconSpots.map(() => rnd())),
        1,
      ),
    );
    b.userData.matrices = beaconSpots;

    return {
      geometry: g,
      beacons: b,
      count: matrices.length,
      beaconCount: beaconSpots.length,
    };
  }, [density]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      const m = geometry.userData.matrices as THREE.Matrix4[];
      m.forEach((mat, i) => mesh.setMatrixAt(i, mat));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
    }
    const bm = beaconRef.current;
    if (bm) {
      const m = beacons.userData.matrices as THREE.Matrix4[];
      m.forEach((mat, i) => bm.setMatrixAt(i, mat));
      bm.instanceMatrix.needsUpdate = true;
      bm.frustumCulled = false;
    }
  }, [geometry, beacons]);

  useEffect(
    () => () => {
      geometry.dispose();
      beacons.dispose();
    },
    [geometry, beacons],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (materialRef.current) {
      materialRef.current.uniforms.uFog.value.set("#17161a");
    }
    if (beaconMat.current) {
      beaconMat.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={cityVertex}
          fragmentShader={cityFragment}
          uniforms={{
            uFog: { value: new THREE.Color("#17161a") },
            uBase: { value: new THREE.Color("#121216") },
            uSunCol: { value: new THREE.Color("#ff6b2c") },
            uSunDir: { value: new THREE.Vector3(0.16, 0.06, -1).normalize() },
          }}
        />
      </instancedMesh>

      <instancedMesh ref={beaconRef} args={[beacons, undefined, beaconCount]}>
        <shaderMaterial
          ref={beaconMat}
          vertexShader={beaconVertex}
          fragmentShader={beaconFragment}
          uniforms={{
            uColor: { value: new THREE.Color("#ff3a1c") },
            uTime: { value: 0 },
          }}
        />
      </instancedMesh>
    </group>
  );
}
