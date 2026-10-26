"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { DUSK_COOL, DUSK_WARM, SUN_DIR, WATER_Z } from "@/lib/coast";

const vertex = /* glsl */ `
  varying vec3  vWorld;
  varying float vDepth;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3  uAsphalt;
  uniform vec3  uPaint;
  uniform vec3  uSand;
  uniform vec3  uSun;
  uniform vec3  uDuskCool;
  uniform vec3  uDuskWarm;
  uniform vec3  uSunDir;
  uniform vec3  uLightPos;
  uniform float uWaterZ;
  uniform float uTime;

  varying vec3  vWorld;
  varying float vDepth;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float coast = 1.0 - smoothstep(-132.0, -100.0, vWorld.z);
    float water = 1.0 - smoothstep(uWaterZ - 3.0, uWaterZ + 1.5, vWorld.z);

    float fog = 1.0 - exp(-pow(vDepth * 0.020, 2.0));
    float vis = 1.0 - clamp(fog, 0.0, 1.0);

    float ax = abs(vWorld.x);
    float shore = vWorld.z - uWaterZ;

    /* ================= ROAD ================= */
    float an = hash21(floor(vWorld.xz * 4.0));
    vec3 asphalt = uAsphalt * (0.82 + an * 0.4);

    // centre dashes
    float dash = step(0.42, fract(vWorld.z / 8.0)) * (1.0 - smoothstep(0.07, 0.13, ax));
    // solid edge lines
    float edge = 1.0 - smoothstep(0.05, 0.11, abs(ax - 6.0));

    vec3 road = asphalt;
    road += uPaint * (dash * 0.55 + edge * 0.4) * vis;

    // pavement joints
    vec2 pw = abs(fract(vWorld.xz * 0.9) - 0.5) / fwidth(vWorld.xz * 0.9);
    float paver = 1.0 - min(min(pw.x, pw.y), 1.0);

    vec3 walk = vec3(0.072, 0.069, 0.075) + paver * 0.018;
    float walkMask = smoothstep(6.55, 6.9, ax) * (1.0 - smoothstep(9.2, 9.9, ax));

    vec3 city = mix(road, walk, walkMask);
    // kerb
    city = mix(city, vec3(0.13, 0.125, 0.13), smoothstep(6.35, 6.5, ax) * (1.0 - smoothstep(6.5, 6.7, ax)));
    // verge beyond the pavement
    city = mix(city, vec3(0.038, 0.036, 0.042), smoothstep(9.6, 12.0, ax));

    float pool = distance(vWorld.xz, uLightPos.xz);
    city += uSun * 0.05 * exp(-pool * 0.05) * vis;

    /* ================= SAND ================= */
    float m1 = hash21(floor(vWorld.xz * 0.7));
    float m2 = hash21(floor(vWorld.xz * 4.0));
    float g1 = hash21(floor(vWorld.xz * 26.0));

    vec3 sand = uSand * (0.74 + m1 * 0.26 + m2 * 0.10 + g1 * 0.07);

    // wind ripples running along the shore
    float rip = sin(vWorld.z * 2.1 + sin(vWorld.x * 0.22) * 3.2 + m1 * 6.0);
    sand *= 0.94 + 0.07 * smoothstep(0.7, 1.0, rip);

    // wet band, darker and glossier
    float wet = smoothstep(13.0, 0.0, shore);
    sand = mix(sand, sand * 0.34, wet * 0.9);

    /* ================= SEA ================= */
    float far = clamp((uWaterZ - vWorld.z) / 420.0, 0.0, 1.0);

    vec3 sea = mix(vec3(0.010, 0.017, 0.032), vec3(0.070, 0.066, 0.098), pow(far, 0.9));

    // swell — two crossing wave trains
    float w1 = sin(vWorld.z * 0.55 + uTime * 0.8 + sin(vWorld.x * 0.16) * 2.2);
    float w2 = sin(vWorld.z * 1.35 - uTime * 0.55 + sin(vWorld.x * 0.42) * 3.0);
    sea *= 0.90 + 0.10 * w1 + 0.05 * w2;

    // glitter path beneath the sun
    float trackX = cameraPosition.x
                 + (uSunDir.x / max(-uSunDir.z, 0.001)) * (cameraPosition.z - vWorld.z);
    float trackW = 0.50 - 0.40 * far;
    float track  = exp(-pow((vWorld.x - trackX) * trackW, 2.0));

    float sparkle = pow(max(0.5 + 0.5 * sin(vWorld.z * 3.1 + uTime * 1.5 + sin(vWorld.x * 1.1) * 2.4), 0.0), 12.0);
    float sparkle2 = pow(max(0.5 + 0.5 * sin(vWorld.z * 6.7 - uTime * 2.1 + sin(vWorld.x * 2.2) * 3.1), 0.0), 18.0);

    sea += uSun * track * (0.10 + sparkle * 1.15 + sparkle2 * 0.55 * (1.0 - far * 0.7));

    // foam: one line on the sand, one breaking further out
    float foamA = exp(-pow((shore + 0.6) * 0.8, 2.0));
    float foamB = exp(-pow((shore + 4.2 + sin(uTime * 0.5 + vWorld.x * 0.12) * 1.1) * 1.1, 2.0)) * 0.55;
    float foamMod = 0.5 + 0.5 * sin(uTime * 0.9 + vWorld.x * 0.3 + sin(vWorld.x * 0.06) * 2.0);
    sea += vec3(0.72, 0.70, 0.68) * (foamA + foamB) * (0.30 + foamMod * 0.55);

    // distance settles into the sky's horizon
    vec2  az = normalize(vec2(vWorld.x - cameraPosition.x, vWorld.z - cameraPosition.z));
    float toward = max(dot(az, normalize(vec2(uSunDir.x, uSunDir.z))), 0.0);
    vec3  horizon = mix(uDuskCool, uDuskWarm, pow(toward, 4.0));

    sea = mix(sea, horizon, smoothstep(0.10, 0.95, far) * 0.95);

    /* ================= COMPOSE ================= */
    vec3 col = mix(city, sand, coast);
    col = mix(col, sea, water);

    // wet sand carries the sun
    col += uSun * exp(-pow((vWorld.x - trackX) * 0.09, 2.0)) * wet * (1.0 - water) * 0.22;

    col = mix(col, vec3(0.090, 0.086, 0.102), clamp(fog, 0.0, 1.0) * (1.0 - water));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Ground({ lightPos }: { lightPos: React.RefObject<THREE.Vector3> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uAsphalt: { value: new THREE.Color("#15151a") },
      uPaint: { value: new THREE.Color("#b9b2a4") },
      uSand: { value: new THREE.Color("#5c4732") },
      uSun: { value: new THREE.Color("#ff6a42") },
      uDuskCool: { value: new THREE.Color(DUSK_COOL) },
      uDuskWarm: { value: new THREE.Color(DUSK_WARM) },
      uSunDir: { value: new THREE.Vector3(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).normalize() },
      uLightPos: { value: new THREE.Vector3(0, 0, 0) },
      uWaterZ: { value: WATER_Z },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = clock.elapsedTime;
    if (lightPos.current) {
      mat.uniforms.uLightPos.value.copy(lightPos.current);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -420]}>
      <planeGeometry args={[1800, 1800]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
