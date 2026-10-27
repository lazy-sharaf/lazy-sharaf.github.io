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

    float fd = vDepth * 0.020;
    float fog = 1.0 - exp(-fd * fd);
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
    city += uSun * 0.075 * exp(-pool * 0.05) * vis;

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
    // The glitter path is needed by the wet-sand term below, so it is
    // computed first; everything else only matters where water is visible.
    float far = clamp((uWaterZ - vWorld.z) / 420.0, 0.0, 1.0);

    float trackX = cameraPosition.x
                 + (uSunDir.x / max(-uSunDir.z, 0.001)) * (cameraPosition.z - vWorld.z);

    vec3 sea = vec3(0.0);

    if (water > 0.001) {
      vec2  p = vWorld.xz;
      float nearF = 1.0 - smoothstep(0.12, 0.72, far);

      // ---- surface slope from five directional trains ----
      // The plane is never displaced; the normal is what sells moving water.
      // Short chop fades with distance, where it could only alias.
      vec2 slope = vec2(0.0);

      vec2 d1 = vec2( 0.94,  0.34);
      float ph1 = dot(d1, p) * 0.2417 + uTime * 0.55;
      slope += d1 * (0.038 * cos(ph1));

      vec2 d2 = vec2( 0.72, -0.69);
      float ph2 = dot(d2, p) * 0.4488 - uTime * 0.85;
      slope += d2 * (0.040 * cos(ph2));

      vec2 d3 = vec2( 0.30,  0.95);
      float ph3 = dot(d3, p) * 0.8378 + uTime * 1.15;
      slope += d3 * (0.034 * cos(ph3)) * nearF;

      vec2 d4 = vec2(-0.86,  0.51);
      float ph4 = dot(d4, p) * 1.4960 + uTime * 1.70;
      slope += d4 * (0.026 * cos(ph4)) * nearF;

      vec2 d5 = vec2( 0.15, -0.99);
      float ph5 = dot(d5, p) * 2.4435 - uTime * 2.30;
      slope += d5 * (0.020 * cos(ph5)) * nearF;

      vec3 nrm = normalize(vec3(-slope.x, 1.0, -slope.y));
      vec3 Vv  = normalize(cameraPosition - vWorld);
      vec3 Hv  = normalize(normalize(uSunDir) + Vv);

      // a wave face tilted toward the camera catches more sky
      float face = clamp(0.5 + slope.y * 5.0, 0.0, 1.0);

      sea = mix(vec3(0.011, 0.019, 0.038), vec3(0.060, 0.072, 0.102), pow(far, 0.6));
      sea *= 0.86 + 0.30 * face;

      // distance settles into the sky's horizon
      vec2  az = normalize(vec2(vWorld.x - cameraPosition.x, vWorld.z - cameraPosition.z));
      float toward = max(dot(az, normalize(vec2(uSunDir.x, uSunDir.z))), 0.0);
      vec3  horizon = mix(uDuskCool, uDuskWarm, pow(toward, 4.0));

      sea = mix(sea, horizon, smoothstep(0.08, 0.90, far) * 0.92);

      // the swell still reads through the haze
      sea *= 0.90 + 0.20 * face * (1.0 - far * 0.45);

      // ---- foam ----
      // the wash on the sand plus one line breaking further out
      float set  = 0.5 + 0.5 * sin(uTime * 0.45 + vWorld.x * 0.015);
      float fa   = (shore + 0.5 + set * 1.9) * 0.85;
      float fb   = (shore + 4.5 + sin(uTime * 0.5 + vWorld.x * 0.12) * 1.4) * 1.05;
      float foamA = exp(-fa * fa);
      float foamB = exp(-fb * fb) * 0.50;
      float lace  = 0.55 + 0.45 * sin(uTime * 0.9 + vWorld.x * 0.32 + sin(vWorld.x * 0.07) * 2.0);
      sea += vec3(0.78, 0.76, 0.73) * (foamA + foamB) * (0.26 + lace * 0.58);

      // whitecaps where the crests get steep, stretched along the crest
      float steep = length(slope);
      float capN  = hash21(floor(vec2(p.x * 0.11, p.y * 0.75)) + floor(uTime * 0.6) * 7.0);
      float cap   = smoothstep(0.075, 0.125, steep) * step(0.55, capN) * nearF;
      sea += vec3(0.80, 0.79, 0.76) * cap * 0.30;

      // ---- glitter path beneath the sun ----
      float trackW = 0.50 - 0.40 * far;
      float tdx = (vWorld.x - trackX) * trackW;
      float track = exp(-tdx * tdx);

      float ndh = max(dot(nrm, Hv), 0.0);
      float glint = pow(ndh, 240.0) * 3.2 + pow(ndh, 26.0) * 0.22;
      sea += uSun * track * glint * (0.35 + 0.65 * nearF);

      // finer sparkle riding on top of the glints
      float s1 = max(0.5 + 0.5 * sin(vWorld.z * 3.1 + uTime * 1.5 + sin(vWorld.x * 1.1) * 2.4), 0.0);
      float s2 = s1 * s1;
      float s4 = s2 * s2;
      float s8 = s4 * s4;
      float sparkle  = s8 * s4;      // s1^12
      float sparkle2 = s8 * s8 * s2; // s1^18
      sea += uSun * track * (sparkle * 0.55 + sparkle2 * 0.35 * (1.0 - far * 0.7));
    }

    /* ================= COMPOSE ================= */
    vec3 col = mix(city, sand, coast);
    col = mix(col, sea, water);

    // wet sand carries the sun
    float wdx = (vWorld.x - trackX) * 0.09;
    col += uSun * exp(-wdx * wdx) * wet * (1.0 - water) * 0.22;

    col = mix(col, vec3(0.090, 0.086, 0.102), clamp(fog, 0.0, 1.0) * (1.0 - water));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Ground({ lightPos }: { lightPos: React.RefObject<THREE.Vector3> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uAsphalt: { value: new THREE.Color("#191920") },
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
