"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

  uniform vec3 uBg;
  uniform vec3 uLine;
  uniform vec3 uSignal;
  uniform vec3 uLightPos;

  varying vec3  vWorld;
  varying float vDepth;

  void main() {
    vec2 coord = vWorld.xz * 0.5;
    vec2 grid  = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);

    float fog = 1.0 - exp(-pow(vDepth * 0.030, 2.0));
    float vis = 1.0 - clamp(fog, 0.0, 1.0);

    vec3 col = uBg;
    col += uLine * line * 0.12 * vis;

    // soft pool of light on the ground under the moving key light
    float d = distance(vWorld.xz, uLightPos.xz);
    col += uSignal * 0.028 * exp(-d * 0.055) * vis;

    col = mix(col, uBg, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Floor({ lightPos }: { lightPos: React.RefObject<THREE.Vector3> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uBg: { value: new THREE.Color("#121216") },
      uLine: { value: new THREE.Color("#3a3a44") },
      uSignal: { value: new THREE.Color("#ff6b2c") },
      uLightPos: { value: new THREE.Vector3(0, 0, 0) },
    }),
    [],
  );

  useFrame(() => {
    if (materialRef.current && lightPos.current) {
      materialRef.current.uniforms.uLightPos.value.copy(lightPos.current);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -60]}>
      <planeGeometry args={[420, 420]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
