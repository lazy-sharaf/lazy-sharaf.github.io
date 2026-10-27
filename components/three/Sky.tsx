"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { coastAt, DUSK_COOL, DUSK_WARM, SUN_DIR } from "@/lib/coast";

const vertex = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uCoast;
  uniform vec3  uSunDir;
  uniform vec3  uDuskCool;
  uniform vec3  uDuskWarm;
  uniform float uTime;

  varying vec3 vDir;

  const vec3 NIGHT_ZENITH  = vec3(0.034, 0.034, 0.044);
  const vec3 NIGHT_HORIZON = vec3(0.090, 0.086, 0.102);

  // morning: blue overhead, mauve through the middle, rose and gold low
  const vec3 SKY_ZENITH = vec3(0.050, 0.078, 0.185);
  const vec3 SKY_MID    = vec3(0.265, 0.220, 0.320);
  const vec3 SKY_LOW    = vec3(0.720, 0.420, 0.340);
  const vec3 SUN_FIRE   = vec3(1.000, 0.390, 0.200);

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    float t = clamp(h, 0.0, 1.0);

    float band = pow(1.0 - t, 3.0);
    vec3  night = mix(NIGHT_ZENITH, NIGHT_HORIZON, band);

    vec2  az     = normalize(vec2(d.x, d.z));
    float toward = max(dot(az, normalize(vec2(uSunDir.x, uSunDir.z))), 0.0);

    vec3 horizonCol = mix(uDuskCool, uDuskWarm, pow(toward, 3.0));

    vec3 sky = SKY_ZENITH;
    sky = mix(sky, SKY_MID, 1.0 - smoothstep(0.16, 0.62, t));
    sky = mix(sky, SKY_LOW, 1.0 - smoothstep(0.05, 0.26, t));
    sky = mix(sky, horizonCol, 1.0 - smoothstep(0.0, 0.09, t));

    vec3 col = mix(night, sky, uCoast);

    /* ---------- the rising sun ---------- */
    // Inland the sun is below the horizon and uCoast is 0, so this whole
    // block would multiply by zero. Skipping it is a uniform branch — no
    // divergence, and most of the page never pays for the rays.
    if (uCoast > 0.002) {
      vec3  sunN = normalize(uSunDir);
      float az0  = atan(sunN.x, -sunN.z);
      float el0  = asin(clamp(sunN.y, -1.0, 1.0));

      float dAz = atan(d.x, -d.z) - az0;
      float dEl = asin(clamp(d.y, -1.0, 1.0)) - el0;

      // squashed a little, the way a sun looks climbing out of the sea
      vec2  off = vec2(dAz, dEl * 1.20);
      float rad = length(off);
      const float R = 0.030;

      float disc = 1.0 - smoothstep(R * 0.94, R * 1.04, rad);
      float limb = smoothstep(0.0, R, rad);

      // hot core falling to a red rim — reads as a light source
      vec3 sunFace = mix(vec3(2.6, 1.35, 0.66), vec3(1.10, 0.36, 0.15), pow(limb, 1.3));
      col = mix(col, sunFace, disc * uCoast);

      // rays: three angular octaves, fading out from the disc. Their falloff
      // is exp(-rad * 5.5), so beyond rad 0.6 they contribute nothing.
      if (rad < 0.6) {
        float rayAngle = atan(off.y, off.x) + uTime * 0.015;
        float rays = 0.0;
        rays += 0.55 * pow(0.5 + 0.5 * sin(rayAngle * 17.0 + 1.7), 7.0);
        rays += 0.30 * pow(0.5 + 0.5 * sin(rayAngle * 29.0 - 0.6), 9.0);
        rays += 0.15 * pow(0.5 + 0.5 * sin(rayAngle * 47.0 + 2.4), 11.0);

        col += vec3(1.0, 0.52, 0.26) * rays * exp(-rad * 5.5) * 0.22 * uCoast;
      }

      // soft halo, kept off the disc so the face stays hot
      float sd   = max(dot(d, sunN), 0.0);
      if (sd > 0.55) {
        float glow = pow(sd, 220.0) * 0.22
                   + pow(sd, 26.0)  * 0.16
                   + pow(sd, 6.0)   * 0.05;
        col += SUN_FIRE * glow * (1.0 - disc) * uCoast;
      }

      // the sky itself lifts around the sun
      col += SUN_FIRE * pow(toward, 2.0) * exp(-max(h, 0.0) * 9.0) * 0.16 * uCoast;

      // light lying flat on the waterline
      float wl = h * 90.0;
      float waterline = exp(-wl * wl) * pow(toward, 5.0);
      col += SUN_FIRE * waterline * 0.26 * uCoast;

      // ---- horizon haze ----
      // A band of air standing on the waterline: thickest at the sea surface,
      // thinning upward, taking the sun's colour where the sun is. This is what
      // stops the sea meeting the sky in a hard cut.
      float hz   = max(h, 0.0);
      float haze = exp(-hz * 30.0) * (1.0 - smoothstep(0.06, 0.20, hz));
      haze *= 0.55 + 0.45 * pow(toward, 2.0);
      vec3 hazeCol = mix(horizonCol * 1.25, SUN_FIRE * 0.90, pow(toward, 4.0) * 0.65);
      col = mix(col, hazeCol, haze * 0.62 * uCoast);

      // below the horizon, settle into sea tone
      col = mix(col, horizonCol * 0.26, smoothstep(0.0, -0.20, h) * uCoast);
    }

    // a standing glow on the horizon even inland, so the street has a
    // vanishing point instead of ending in flat black
    col += vec3(1.0, 0.44, 0.20) * exp(-max(h, 0.0) * 12.0) * 0.075;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Sky() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const sunDir = useMemo(
    () => new THREE.Vector3(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).normalize(),
    [],
  );

  useFrame(({ camera, clock }) => {
    if (meshRef.current) meshRef.current.position.copy(camera.position);
    if (materialRef.current) {
      materialRef.current.uniforms.uCoast.value = coastAt(camera.position.z);
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[700, 40, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        uniforms={{
          uCoast: { value: 0 },
          uSunDir: { value: sunDir },
          uDuskCool: { value: new THREE.Color(DUSK_COOL) },
          uDuskWarm: { value: new THREE.Color(DUSK_WARM) },
          uTime: { value: 0 },
        }}
      />
    </mesh>
  );
}
