/**
 * The Archive — solid monoliths in a fogged corridor.
 *
 * Unlike the earlier flat additive field, these are real boxes with
 * normals, a moving point light, rim lighting and exponential fog, so
 * the scene has volume, occlusion and depth.
 */

export const archiveVertex = /* glsl */ `
  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;
  varying float vSeed;
  varying vec2  vUv;

  attribute float aSeed;

  void main() {
    vUv   = uv;
    vSeed = aSeed;

    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld     = world.xyz;
    vNormalW   = normalize(mat3(instanceMatrix) * normal);

    vec4 mv = viewMatrix * world;
    vDepth  = -mv.z;

    gl_Position = projectionMatrix * mv;
  }
`;

export const archiveFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uBg;
  uniform vec3  uBase;
  uniform vec3  uBone;
  uniform vec3  uSignal;

  uniform vec3  uCursor;
  uniform float uRadius;
  uniform float uFade;

  uniform vec3  uLightPos;
  uniform float uTime;

  varying vec3  vWorld;
  varying vec3  vNormalW;
  varying float vDepth;
  varying float vSeed;
  varying vec2  vUv;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    // moving point light
    vec3  toLight = uLightPos - vWorld;
    float dist    = length(toLight);
    vec3  L       = toLight / max(dist, 0.001);
    float atten   = 1.0 / (1.0 + 0.012 * dist * dist);
    float diff    = max(dot(N, L), 0.0) * atten;

    // rim light picks out the silhouette against the fog
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    // cursor proximity — the wildcard reveal
    float d    = distance(vWorld, uCursor);
    float prox = 1.0 - smoothstep(uRadius * 0.15, uRadius, d);

    // faint amber marker near the top of some columns
    float top = smoothstep(0.88, 1.0, vUv.y);
    float marker = step(0.9, vSeed) * top;

    vec3 col = uBase * (0.55 + diff * 0.7);
    col += uBone   * rim  * 0.11;
    col += uSignal * marker * (0.18 + prox * 0.9);

    // the reveal lifts the whole face toward bone
    col = mix(col, uBone * (0.28 + diff * 1.1), prox * 0.55);
    col += uSignal * prox * prox * 0.08;

    // exponential-squared fog, fading into the page background
    float fog = 1.0 - exp(-pow(vDepth * 0.028, 2.0));
    col = mix(col, uBg, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col * uFade, 1.0);
  }
`;
