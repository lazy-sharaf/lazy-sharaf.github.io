"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { coastAt, WATER_Z } from "@/lib/coast";

/**
 * A dolphin porpoising off the beach.
 *
 * It works an ellipse a little way out from the sand, dipping under between
 * breaches and arcing clear of the surface. The body is a lathe turned from a
 * profile curve; the fins are flat triangles. At this distance the whole thing
 * reads as silhouette, which is what a dolphin against a low sun actually
 * looks like — so it is worth keeping the shapes simple and the outline clean.
 *
 * The spine bends in the vertex shader rather than being a rigid mesh. A
 * leaping dolphin arches its whole body, and a straight one reads as a model.
 */

const L = 3.2; // body length, metres

const CX = -6; // ellipse centre
const CZ = WATER_Z - 34;
const RX = 8;
const RZ = 4;

const LAPS = 1 / 40; // laps per second
const LEAPS = 6; // breaches per lap
const REST = -0.6; // how deep it sits between breaches
const RISE = 2.6; // how far it clears the water

const NIGHT = new THREE.Color("#17161a");
const DUSK = new THREE.Color("#2b2330");

const dolphinVertex = /* glsl */ `
  uniform float uBend;
  uniform float uLen;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;

  void main() {
    vec3 p = position;
    vec3 n = normal;

    // Bend the spine into an arc. The angle grows as the square of the
    // distance from the nose, so the head stays pointed and the tail takes
    // almost all of the curve — which is how a dolphin arches.
    float t = clamp((uLen * 0.5 - p.z) / uLen, 0.0, 1.0);
    float a = uBend * t * t;
    float c = cos(a);
    float s = sin(a);

    vec2 yz = vec2(p.y, p.z - uLen * 0.5);
    p.y = yz.x * c - yz.y * s;
    p.z = yz.x * s + yz.y * c + uLen * 0.5;

    vec2 nz = vec2(n.y, n.z);
    n.y = nz.x * c - nz.y * s;
    n.z = nz.x * s + nz.y * c;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld   = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * n);
    vec4 mv  = viewMatrix * world;
    vDepth   = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const dolphinFragment = /* glsl */ `
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

    // wet skin: slate, with the sunset caught on the flank edges
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    vec3 col = uBase + uRim * fres * 1.45;

    // the back picks up the sky, the belly stays dark
    col += uRim * max(N.y, 0.0) * 0.22;

    float fd = vDepth * 0.020;
    float fog = 1.0 - exp(-fd * fd);
    col = mix(col, uFog, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** A flat triangle — the fins are thin enough that one face reads fine. */
function tri(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
) {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([...a, ...b, ...c], 3),
  );
  g.computeVertexNormals();
  return g;
}

function quad(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
) {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3),
  );
  g.computeVertexNormals();
  return g;
}

export function Dolphin() {
  const group = useRef<THREE.Group>(null);
  const splash = useRef<THREE.Mesh>(null);

  const wasAir = useRef(false);
  const splashT = useRef(99);

  const bodyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dolphinVertex,
        fragmentShader: dolphinFragment,
        side: THREE.DoubleSide,
        uniforms: {
          uBase: { value: new THREE.Color("#26314a") },
          uRim: { value: new THREE.Color("#ffb07a") },
          uFog: { value: new THREE.Color("#17161a") },
          uBend: { value: 0 },
          uLen: { value: L },
        },
      }),
    [],
  );

  const splashMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffe4c6",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const geos = useMemo(() => {
    const k = L / 1.88;

    const profile: [number, number][] = [
      [0.004, 0.0],
      [0.022, 0.05],
      [0.040, 0.11],
      [0.070, 0.2],
      [0.105, 0.34],
      [0.135, 0.5],
      [0.15, 0.66],
      [0.152, 0.82],
      [0.142, 0.98],
      [0.122, 1.14],
      [0.096, 1.3],
      [0.068, 1.46],
      [0.042, 1.62],
      [0.022, 1.76],
      [0.01, 1.88],
    ];

    const body = new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r * k, y * k)),
      16,
    );
    // lay it down: nose forward along +z, centred on the origin
    body.rotateX(-Math.PI / 2);
    body.translate(0, 0, L / 2);
    // dolphins are taller than they are wide
    body.scale(0.8, 1.18, 1);

    // dorsal fin, swept back off the shoulders
    const dorsal = tri([0, 0.13, 0.1], [0, 0.1, -0.62], [0, 0.44, -0.4]);

    // tail flukes, in body space so the spine bend carries them
    const flukes = quad(
      [0, 0.01, -1.02],
      [-0.31, 0.03, -1.3],
      [-0.24, 0.02, -1.42],
      [0, 0.01, -1.34],
    );
    const flukesR = quad(
      [0, 0.01, -1.02],
      [0.31, 0.03, -1.3],
      [0.24, 0.02, -1.42],
      [0, 0.01, -1.34],
    );

    // pectorals, angled down and back
    const pecL = tri([-0.09, -0.04, 0.68], [-0.09, -0.06, 0.44], [-0.4, -0.22, 0.3]);
    const pecR = tri([0.09, -0.04, 0.68], [0.09, -0.06, 0.44], [0.4, -0.22, 0.3]);

    return { body, dorsal, flukes, flukesR, pecL, pecR };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);

    const ang = t * LAPS * Math.PI * 2;
    const x = CX + Math.cos(ang) * RX;
    const z = CZ + Math.sin(ang) * RZ;

    // evenly spaced breaches along the ellipse
    const hp = ang * LEAPS;
    const air = Math.max(0, Math.sin(hp));
    const y = REST + Math.pow(air, 1.5) * RISE;

    // sample a little ahead for the heading and the pitch of the arc
    const air2 = Math.max(0, Math.sin(hp + 0.06));
    const y2 = REST + Math.pow(air2, 1.5) * RISE;

    const dx = -Math.sin(ang) * RX * 0.02;
    const dz = Math.cos(ang) * RZ * 0.02;
    const dy = y2 - y;

    const pitch = Math.atan2(dy, Math.hypot(dx, dz));

    g.position.set(x, y, z);
    g.rotation.order = "YXZ";
    g.rotation.y = Math.atan2(dx, dz);
    // +z is forward, so a nose-up arc is a negative rotation about x
    g.rotation.x = -pitch;
    g.rotation.z = -Math.cos(ang) * 0.28;

    // The spine: arched hard in the air, undulating in the water. A leaping
    // dolphin is a C-shape, so the tail drops away from the head.
    bodyMat.uniforms.uBend.value =
      -0.9 * air + Math.sin(t * 8.5) * 0.28 * (1 - air);

    // ---- splash where it breaks back through the surface ----
    if (wasAir.current && air <= 0.0001) {
      splashT.current = 0;
      splash.current?.position.set(x, 0.04, z);
    }
    wasAir.current = air > 0.0001;

    splashT.current += dt;
    const sp = splash.current;
    if (sp) {
      const k = splashT.current / 1.3;
      sp.visible = k < 1;
      if (k < 1) {
        sp.scale.setScalar(0.7 + k * 2.6);
        splashMat.opacity = (1 - k) * 0.5;
      }
    }

    // fog follows the coast, same as everything else
    const coast = coastAt(state.camera.position.z);
    (bodyMat.uniforms.uFog.value as THREE.Color).lerpColors(NIGHT, DUSK, coast);
  });

  return (
    <group>
      <group ref={group}>
        <mesh geometry={geos.body} material={bodyMat} />
        <mesh geometry={geos.dorsal} material={bodyMat} />
        <mesh geometry={geos.pecL} material={bodyMat} />
        <mesh geometry={geos.pecR} material={bodyMat} />
        <mesh geometry={geos.flukes} material={bodyMat} />
        <mesh geometry={geos.flukesR} material={bodyMat} />
      </group>

      <mesh ref={splash} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.6, 1.0, 20, 1]} />
        <primitive object={splashMat} attach="material" />
      </mesh>
    </group>
  );
}
