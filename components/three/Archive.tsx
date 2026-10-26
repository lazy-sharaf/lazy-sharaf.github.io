"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scrollState } from "@/lib/scroll";
import { archiveFragment, archiveVertex } from "./shaders";

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

export const CORRIDOR_LENGTH = 150;

type Props = {
  intensity?: number;
  density?: number;
  lightPos: React.RefObject<THREE.Vector3>;
};

export function Archive({ intensity = 1, density = 1, lightPos }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const cursor = useRef(new THREE.Vector3(9999, 9999, 9999));
  const target = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2(0, 0));
  const hasPointer = useRef(false);
  const { camera } = useThree();

  const { geometry, count } = useMemo(() => {
    const rnd = mulberry32(0x2f8ab3);

    const rows = Math.round(64 * density);
    const perSide = Math.round(9 * density);
    const outer = Math.round(220 * density);

    const matrices: THREE.Matrix4[] = [];
    const seeds: number[] = [];
    const dummy = new THREE.Object3D();

    const push = (
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
    ) => {
      dummy.position.set(x, h / 2, z);
      dummy.scale.set(w, h, d);
      dummy.rotation.y = (rnd() - 0.5) * 0.08;
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
      seeds.push(rnd());
    };

    // inner corridor walls — kept wide so the centre of the frame stays
    // dark and content reads over it
    for (let r = 0; r < rows; r++) {
      const z = -r * 2.4 + (rnd() - 0.5) * 0.6;
      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < perSide; i++) {
          const x = s * (6.8 + i * 1.95 + (rnd() - 0.5) * 0.35);
          const h = 3 + Math.pow(rnd(), 1.6) * 17;
          push(x, z, 0.35 + rnd() * 0.85, h, 0.35 + rnd() * 0.85);
        }
      }
    }

    // outer skyline, taller and further out
    for (let i = 0; i < outer; i++) {
      const s = rnd() > 0.5 ? 1 : -1;
      const x = s * (20 + rnd() * 46);
      const z = -rnd() * CORRIDOR_LENGTH;
      const h = 6 + Math.pow(rnd(), 1.4) * 22;
      push(x, z, 1.2 + rnd() * 3.2, h, 1.2 + rnd() * 3.2);
    }

    const g = new THREE.BoxGeometry(1, 1, 1);
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
    g.userData.matrices = matrices;

    return { geometry: g, count: matrices.length };
  }, [density]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrices = geometry.userData.matrices as THREE.Matrix4[];
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [geometry]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
      hasPointer.current = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;

    const t = state.clock.elapsedTime;
    const u = mat.uniforms;

    // project the pointer into the world, a fixed distance ahead of the camera
    if (hasPointer.current) {
      target.current
        .set(pointer.current.x, pointer.current.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize()
        .multiplyScalar(16)
        .add(camera.position);
      cursor.current.lerp(target.current, 0.18);
    }

    u.uTime.value = t;
    u.uCursor.value.copy(cursor.current);

    // the key light orbits near the camera so surfaces keep resolving
    lightPos.current?.set(
      Math.sin(t * 0.28) * 9,
      13 + Math.sin(t * 0.19) * 3.5,
      camera.position.z - 16 + Math.cos(t * 0.28) * 8,
    );
    if (lightPos.current) u.uLightPos.value.copy(lightPos.current);

    u.uFade.value = THREE.MathUtils.lerp(
      u.uFade.value as number,
      intensity,
      0.06,
    );
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={archiveVertex}
        fragmentShader={archiveFragment}
        fog={false}
        uniforms={{
          uBg: { value: new THREE.Color("#101014") },
          uBase: { value: new THREE.Color("#0b0b0f") },
          uBone: { value: new THREE.Color("#e8e4dc") },
          uSignal: { value: new THREE.Color("#ff6b2c") },
          uCursor: { value: new THREE.Vector3(9999, 9999, 9999) },
          uRadius: { value: 7.5 },
          uFade: { value: 0 },
          uLightPos: { value: new THREE.Vector3(0, 14, 0) },
          uTime: { value: 0 },
        }}
      />
    </instancedMesh>
  );
}
