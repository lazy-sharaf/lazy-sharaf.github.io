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
  varying vec3  vHalf;
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
    vHalf   = scale * 0.5;
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
  uniform float uMpp;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying vec3  vLocal;
  varying vec3  vHalf;
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

    // depth fade instead of derivatives — fwidth breaks up at triangle edges
    float detail = 1.0 - smoothstep(30.0, 80.0, vDepth);

    /* ---- each building gets its own facade ---- */
    float s = vSeed;
    float pitchX = mix(1.55, 2.55, fract(s * 7.31));
    float pitchY = mix(2.70, 3.70, fract(s * 3.77));

    vec2 cell = vec2(u / pitchX, v / pitchY);
    vec2 id   = floor(cell);
    vec2 f    = fract(cell);

    // three families: punched openings, horizontal ribbons, vertical slots
    float punched = smoothstep(0.22, 0.27, f.x) * (1.0 - smoothstep(0.73, 0.78, f.x))
                  * smoothstep(0.26, 0.31, f.y) * (1.0 - smoothstep(0.74, 0.79, f.y));

    float ribbon = smoothstep(0.03, 0.07, f.x) * (1.0 - smoothstep(0.93, 0.97, f.x))
                 * smoothstep(0.40, 0.45, f.y) * (1.0 - smoothstep(0.60, 0.65, f.y));

    float slot = smoothstep(0.34, 0.39, f.x) * (1.0 - smoothstep(0.61, 0.66, f.x))
               * smoothstep(0.10, 0.15, f.y) * (1.0 - smoothstep(0.88, 0.93, f.y));

    float family = floor(fract(s * 13.7) * 3.0);
    float win = mix(punched, ribbon, step(0.5, family));
    win = mix(win, slot, step(1.5, family));

    // a wide ribbon covers far more area than a punched opening, so it has to
    // be dimmer or bloom turns a whole floor into a white bar
    float winScale = mix(1.0, 0.42, step(0.5, family));
    winScale = mix(winScale, 0.78, step(1.5, family));

    // How much of the grid survives at this pixel. Two things destroy it:
    // looking down a wall (one pixel spans many metres of facade) and plain
    // distance (a whole cell shrinks below a few pixels). Both tests are
    // analytic — no derivatives — so the result is stable frame to frame
    // instead of flickering into speckle.
    float mpp    = vDepth * uMpp;
    float cellPx = min(pitchX, pitchY) / max(mpp, 1e-4);
    float crisp  = smoothstep(0.10, 0.42, abs(dot(N, V)))
                 * smoothstep(3.5, 8.0, cellPx);

    // mean coverage of all three families is close enough to share one number
    win = mix(0.28, win, crisp) * winScale * side;

    // a shadow line under each opening reads as a sill
    float sill = smoothstep(0.17, 0.25, f.y) * (1.0 - smoothstep(0.25, 0.30, f.y));

    /* ---- lights ---- */
    float r = hash21(id + s * 91.7);
    // some blocks are mostly dark, some are busy
    float litBase = mix(0.40, 0.70, fract(s * 5.13));
    float lit  = mix(litBase, step(litBase, r), crisp);
    float glow = mix(1.0, 0.35 + 0.65 * hash21(id * 1.37 + 3.1), crisp);

    vec3 warm = vec3(1.0, 0.74, 0.46);
    vec3 cool = vec3(0.62, 0.78, 1.0);
    vec3 wcol = mix(warm, mix(warm, cool, step(0.88, r)), crisp);
    // whole buildings lean warm or cool
    wcol = mix(wcol, mix(warm, cool, step(0.80, fract(s * 11.3))), 0.35 * crisp);

    // brighter at the bottom of each opening — light spilling off the sill
    float inner = mix(1.06, 0.85, smoothstep(0.0, 1.0, f.y));

    vec3 nearWin = wcol * win * lit * glow * inner * 0.95;

    /* ---- concrete ---- */
    vec3 col = uBase * (0.55 + 0.45 * smoothstep(0.0, 34.0, v));
    col *= 1.0 - sill * 0.30 * side * detail;

    // corner piers give the mass an edge
    float edgeDist = min(vHalf.x - abs(vLocal.x), vHalf.z - abs(vLocal.z));
    float pier = 1.0 - smoothstep(0.0, 0.5, edgeDist);
    col *= 1.0 - pier * 0.45 * detail;

    // parapet at the roof line
    float parapet = 1.0 - smoothstep(0.0, 0.8, vHalf.y - vLocal.y);
    col = mix(col, col * 0.45, parapet * 0.85 * detail);

    // grime where the street meets the wall
    col *= 1.0 - 0.30 * smoothstep(1.4, 0.0, v);

    // west faces catch the last of the sun
    float sun = max(dot(N, normalize(uSunDir)), 0.0);
    float sun2 = sun * sun;
    col += uSunCol * sun2 * sun2 * 0.12;

    // shopfronts at street level — the only light at eye height
    float shop = smoothstep(3.8, 3.2, v) * side;
    float shopLit = step(0.35, hash21(id * 2.1 + s * 13.0));
    float shopBay = mix(1.0, mix(0.4, 1.0, step(0.35, fract(u / 3.1))), crisp);
    col += vec3(1.0, 0.66, 0.38) * shop * (0.03 + 0.11 * shopLit) * shopBay * detail;

    col += nearWin;

    // cool rim so silhouettes separate from the fog instead of merging into it
    float ndv = 1.0 - max(dot(N, V), 0.0);
    col += vec3(0.20, 0.22, 0.30) * ndv * ndv * ndv * 0.45;

    // floor slab lines
    float slab = smoothstep(0.94, 1.0, fract(v / pitchY));
    col *= 1.0 - slab * 0.18 * crisp;

    float fz = vDepth * 0.017;
    float fog = 1.0 - exp(-fz * fz);
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
    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.uFog.value.set("#17161a");
      // metres covered by one vertical pixel at one metre of depth
      const cam = state.camera as THREE.PerspectiveCamera;
      const resY = state.size.height * state.viewport.dpr;
      const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      mat.uniforms.uMpp.value = (2 * tan) / resY;
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
            uBase: { value: new THREE.Color("#1b1b21") },
            uSunCol: { value: new THREE.Color("#ff6b2c") },
            uSunDir: { value: new THREE.Vector3(0.16, 0.06, -1).normalize() },
            uMpp: { value: 0.0012 },
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
