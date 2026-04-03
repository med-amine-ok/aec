"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ============================================================
// Port of the Three.js Ocean Scene (sky + sea only) as a React
// background component. No user controls / UI / seafloor / blocks.
// ============================================================

/* ---------- PRNG (Random.js port) ---------- */
class Random {
  seed: number;
  state: number;
  constructor(seed?: number) {
    this.seed = seed ?? Math.random();
    this.state = this.generate(this.seed);
  }
  next() {
    this.state = this.generate(this.state);
    return this.state;
  }
  private generate(x: number) {
    const n = Math.sin(x * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  }
}

/* ---------- Shader chunks (Settings.js port) ---------- */
const GLOBAL_CHUNK = /* glsl */ `
  const float FOG_DISTANCE = 1000.0;
`;

const SKYBOX_CHUNK = /* glsl */ `
  #include <common>

  const float DITHER_STRENGTH = 0.1;

  const vec3 DAY_SKY_COLOR = vec3(0.25, 0.4, 0.6);
  const vec3 DAY_HORIZON_COLOR = vec3(0.75, 0.9, 1);
  const vec3 EARLY_TWILIGHT_COLOR = vec3(1, 0.83, 0.5);
  const vec3 LATE_TWILIGHT_COLOR = vec3(1, 0.333, 0.167);
  const vec3 NIGHT_SKY_COLOR = vec3(0.06, 0.1, 0.15);
  const vec3 NIGHT_HORIZON_COLOR = vec3(0.07, 0.13, 0.18);

  const float SUN_SHARPNESS = 2000.0;
  const float SUN_SIZE = 5.0;
  const float MOON_SHARPNESS = 12000.0;
  const float MOON_SIZE = 5000.0;

  const float STARS_SHARPNESS = 50.0;
  const float STARS_SIZE = 10.0;
  const float WIDTH_SCALE = 1.0 / 6.0;
  const float WIDTH_SCALE_HALF = WIDTH_SCALE / 2.0;
  const vec3 STARS_COLORS[6] = vec3[6](
    vec3(1.0, 0.95, 0.9),
    vec3(1.0, 0.9, 0.9),
    vec3(0.9, 1.0, 1.0),
    vec3(0.9, 0.95, 1.0),
    vec3(1.0, 0.9, 1.0),
    vec3(1.0, 1.0, 1.0)
  );
  const float STARS_FALLOFF = 15.0;
  const float STARS_VISIBILITY = 450.0;

  const vec3 UP = vec3(0.0, 1.0, 0.0);

  uniform mat3 _SkyRotationMatrix;
  uniform sampler2D _DitherTexture;
  uniform vec2 _DitherTextureSize;
  uniform float _SunVisibility;
  uniform float _TwilightTime;
  uniform float _TwilightVisibility;
  uniform float _MoonVisibility;
  uniform float _GridSize;
  uniform float _GridSizeScaled;
  uniform sampler2D _Stars;
  uniform float _SpecularVisibility;
  uniform vec3 _DirToLight;
  uniform vec3 _Light;

  float dither = 0.0;

  vec2 sampleCubeCoords(vec3 dir) {
    vec3 absDir = abs(dir);
    bool xPositive = dir.x > 0.0;
    bool yPositive = dir.y > 0.0;
    bool zPositive = dir.z > 0.0;
    float maxAxis = 1.0;
    float u = 0.0;
    float v = 0.0;
    float i = 0.0;

    if (xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
      maxAxis = absDir.x; u = -dir.z; v = dir.y; i = 0.0;
    }
    if (!xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
      maxAxis = absDir.x; u = dir.z; v = dir.y; i = 1.0;
    }
    if (yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
      maxAxis = absDir.y; u = dir.x; v = -dir.z; i = 2.0;
    }
    if (!yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
      maxAxis = absDir.y; u = dir.x; v = dir.z; i = 3.0;
    }
    if (zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
      maxAxis = absDir.z; u = dir.x; v = dir.y; i = 4.0;
    }
    if (!zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
      maxAxis = absDir.z; u = -dir.x; v = dir.y; i = 5.0;
    }

    u = i * WIDTH_SCALE + (u / maxAxis + 1.0) * WIDTH_SCALE_HALF;
    v = (v / maxAxis + 1.0) * 0.5;
    return vec2(u, v);
  }

  void sampleDither(vec2 fragCoord) {
    dither = (texture2D(_DitherTexture, (fragCoord - vec2(0.5)) / _DitherTextureSize).x - 0.5) * DITHER_STRENGTH;
  }

  vec3 sampleSkybox(vec3 dir) {
    vec3 viewDir = _SkyRotationMatrix * dir;
    float density = clamp(pow2(1.0 - max(0.0, dot(dir, UP) + dither)), 0.0, 1.0);
    float sunLight = dot(viewDir, UP);
    float sun = min(pow(max(0.0, sunLight), SUN_SHARPNESS) * SUN_SIZE, 1.0);
    float moonLight = -sunLight;
    float moon = min(pow(max(0.0, moonLight), MOON_SHARPNESS) * MOON_SIZE, 1.0);
    vec3 day = mix(DAY_SKY_COLOR, DAY_HORIZON_COLOR, density);
    vec3 twilight = mix(LATE_TWILIGHT_COLOR, EARLY_TWILIGHT_COLOR, _TwilightTime);
    vec3 night = mix(NIGHT_SKY_COLOR, NIGHT_HORIZON_COLOR, density);
    vec3 sky = mix(night, day, _SunVisibility);
    sky = mix(sky, twilight, density * clamp(sunLight * 0.5 + 0.5 + dither, 0.0, 1.0) * _TwilightVisibility);
    vec2 cubeCoords = sampleCubeCoords(viewDir);
    vec4 gridValue = texture2D(_Stars, cubeCoords);
    vec2 gridCoords = vec2(cubeCoords.x * _GridSizeScaled, cubeCoords.y * _GridSize);
    vec2 gridCenterCoords = floor(gridCoords) + gridValue.xy;
    float stars = max(min(pow(1.0 - min(distance(gridCoords, gridCenterCoords), 1.0), STARS_SHARPNESS) * gridValue.z * STARS_SIZE, 1.0), moon);
    stars *= min(exp(-dot(sky, vec3(1.0)) * STARS_FALLOFF) * STARS_VISIBILITY, 1.0);
    sky = mix(sky, max(STARS_COLORS[int(gridValue.w * 6.0)], vec3(moon)), stars);
    sky = mix(sky, vec3(1.0), sun);
    return sky;
  }

  vec3 sampleFog(vec3 dir) {
    vec3 viewDir = _SkyRotationMatrix * dir;
    float sunLight = dot(viewDir, UP);
    vec3 twilight = mix(LATE_TWILIGHT_COLOR, EARLY_TWILIGHT_COLOR, _TwilightTime);
    vec3 horizon = mix(NIGHT_HORIZON_COLOR, DAY_HORIZON_COLOR, _SunVisibility);
    horizon = mix(horizon, twilight, clamp(sunLight * 0.5 + 0.5 + dither, 0.0, 1.0) * _TwilightVisibility);
    return horizon;
  }
`;

const OCEAN_CHUNK = /* glsl */ `
  #include <global>
  #include <skybox>

  const float NORMAL_MAP_SCALE = 0.1;
  const float NORMAL_MAP_STRENGTH = 0.2;
  const vec2 VELOCITY_1 = vec2(0.1, 0.0);
  const vec2 VELOCITY_2 = vec2(0.0, 0.1);
  const float SPECULAR_SHARPNESS = 100.0;
  const float SPECULAR_SIZE = 1.1;
  const float MAX_VIEW_DEPTH = 100.0;
  const float DENSITY = 0.35;
  const float MAX_VIEW_DEPTH_DENSITY = MAX_VIEW_DEPTH * DENSITY;
  const vec3 ABSORPTION = vec3(1.0) / vec3(10.0, 40.0, 100.0);
  const float CRITICAL_ANGLE = asin(1.0 / 1.33) / PI_HALF;

  uniform float _Time;
  uniform sampler2D _NormalMap1;
  uniform sampler2D _NormalMap2;
`;

/* ---------- Skybox shaders (SkyboxShader.js port) ---------- */
const SKYBOX_VERTEX = /* glsl */ `
  uniform mat3 _SkyRotationMatrix;
  attribute vec3 coord;
  varying vec3 _worldPos;
  varying vec3 _coord;
  void main() {
    _worldPos = coord;
    _coord = _SkyRotationMatrix * _worldPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKYBOX_FRAGMENT = /* glsl */ `
  #include <skybox>
  uniform float _Time;
  const float STARS_DRIFT_SPEED = 0.001;
  varying vec3 _worldPos;
  varying vec3 _coord;
  void main() {
    vec3 worldDir = normalize(_worldPos);
    vec3 viewDir = normalize(_coord);
    float dither = (texture2D(_DitherTexture, (gl_FragCoord.xy - vec2(0.5)) / _DitherTextureSize).x - 0.5) * DITHER_STRENGTH;
    float density = clamp(pow2(1.0 - max(0.0, dot(worldDir, UP) + dither)), 0.0, 1.0);
    float sunLight = dot(viewDir, UP);
    float sun = min(pow(max(0.0, sunLight), SUN_SHARPNESS) * SUN_SIZE, 1.0);
    float moonLight = -sunLight;
    float moon = min(pow(max(0.0, moonLight), MOON_SHARPNESS) * MOON_SIZE, 1.0);
    vec3 day = mix(DAY_SKY_COLOR, DAY_HORIZON_COLOR, density);
    vec3 twilight = mix(LATE_TWILIGHT_COLOR, EARLY_TWILIGHT_COLOR, _TwilightTime);
    vec3 night = mix(NIGHT_SKY_COLOR, NIGHT_HORIZON_COLOR, density);
    vec3 sky = mix(night, day, _SunVisibility);
    sky = mix(sky, twilight, density * clamp(sunLight * 0.5 + 0.5 + dither, 0.0, 1.0) * _TwilightVisibility);
    vec2 cubeCoords = sampleCubeCoords(viewDir);
    cubeCoords += vec2(_Time * STARS_DRIFT_SPEED, _Time * STARS_DRIFT_SPEED * 0.7);
    vec4 gridValue = texture2D(_Stars, cubeCoords);
    vec2 gridCoords = vec2(cubeCoords.x * _GridSizeScaled, cubeCoords.y * _GridSize);
    vec2 gridCenterCoords = floor(gridCoords) + gridValue.xy;
    float stars = max(min(pow(1.0 - min(distance(gridCoords, gridCenterCoords), 1.0), STARS_SHARPNESS) * gridValue.z * STARS_SIZE, 1.0), moon);
    stars *= min(exp(-dot(sky, vec3(1.0)) * STARS_FALLOFF) * STARS_VISIBILITY, 1.0);
    sky = mix(sky, max(STARS_COLORS[int(gridValue.w * 6.0)], vec3(moon)), stars);
    sky = mix(sky, vec3(1.0), sun);
    gl_FragColor = vec4(sky, 1.0);
  }
`;

/* ---------- Ocean shaders (OceanShaders.js port) ---------- */
const SURFACE_VERTEX = /* glsl */ `
  #include <ocean>
  varying vec2 _worldPos;
  varying vec2 _uv;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    _worldPos = worldPos.xz;
    _uv = _worldPos * NORMAL_MAP_SCALE;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const SURFACE_FRAGMENT = /* glsl */ `
  #include <ocean>
  varying vec2 _worldPos;
  varying vec2 _uv;
  void main() {
    vec3 viewVec = vec3(_worldPos.x, 0.0, _worldPos.y) - cameraPosition;
    float viewLen = length(viewVec);
    vec3 viewDir = viewVec / viewLen;
    vec3 normal = texture2D(_NormalMap1, _uv + VELOCITY_1 * _Time).xyz * 2.0 - 1.0;
    normal += texture2D(_NormalMap2, _uv + VELOCITY_2 * _Time).xyz * 2.0 - 1.0;
    normal *= NORMAL_MAP_STRENGTH;
    normal += vec3(0.0, 0.0, 1.0);
    normal = normalize(normal).xzy;
    sampleDither(gl_FragCoord.xy);
    if (cameraPosition.y > 0.0) {
      vec3 halfWayDir = normalize(_DirToLight - viewDir);
      float specular = max(0.0, dot(normal, halfWayDir));
      specular = pow(specular, SPECULAR_SHARPNESS) * _SpecularVisibility;
      float reflectivity = pow2(1.0 - max(0.0, dot(-viewDir, normal)));
      vec3 reflection = sampleSkybox(reflect(viewDir, normal));
      vec3 surface = reflectivity * reflection;
      surface = max(surface, specular);
      float fog = clamp(viewLen / FOG_DISTANCE + dither, 0.0, 1.0);
      surface = mix(surface, sampleFog(viewDir), fog);
      gl_FragColor = vec4(surface, max(max(reflectivity, specular), fog));
      return;
    }
    float originY = cameraPosition.y;
    viewLen = min(viewLen, MAX_VIEW_DEPTH);
    float sampleY = originY + viewDir.y * viewLen;
    vec3 light = exp((sampleY - MAX_VIEW_DEPTH_DENSITY) * ABSORPTION);
    light *= _Light;
    float reflectivity = pow2(1.0 - max(0.0, dot(viewDir, normal)));
    float t = clamp(max(reflectivity, viewLen / MAX_VIEW_DEPTH) + dither, 0.0, 1.0);
    if (dot(viewDir, normal) < CRITICAL_ANGLE) {
      vec3 r = reflect(viewDir, -normal);
      sampleY = r.y * (MAX_VIEW_DEPTH - viewLen);
      vec3 rColor = exp((sampleY - MAX_VIEW_DEPTH_DENSITY) * ABSORPTION);
      rColor *= _Light;
      gl_FragColor = vec4(mix(rColor, light, t), 1.0);
      return;
    }
    gl_FragColor = vec4(light, t);
  }
`;

const VOLUME_VERTEX = /* glsl */ `
  varying vec3 _worldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    _worldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const VOLUME_FRAGMENT = /* glsl */ `
  #include <ocean>
  varying vec3 _worldPos;
  void main() {
    vec3 viewVec = _worldPos - cameraPosition;
    float viewLen = length(viewVec);
    vec3 viewDir = viewVec / viewLen;
    float originY = cameraPosition.y;
    if (cameraPosition.y > 0.0) {
      float distAbove = cameraPosition.y / -viewDir.y;
      viewLen -= distAbove;
      originY = 0.0;
    }
    viewLen = min(viewLen, MAX_VIEW_DEPTH);
    float sampleY = originY + viewDir.y * viewLen;
    vec3 light = exp((sampleY - viewLen * DENSITY) * ABSORPTION);
    light *= _Light;
    gl_FragColor = vec4(light, 1.0);
  }
`;

// ============================================================
// React Component
// ============================================================

export default function OceanBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const showPlane = pathname !== "/dashboard";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    // WebGL availability check
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    // ---------- Register custom shader chunks ----------
    const chunks = THREE.ShaderChunk as Record<string, string>;
    chunks["global"] = GLOBAL_CHUNK;
    chunks["skybox"] = SKYBOX_CHUNK;
    chunks["ocean"] = OCEAN_CHUNK;

    // ---------- Clock ----------
    const clock = new THREE.Clock();
    clock.start();

    // ---------- Renderer ----------
    // ---------- Renderers ----------
    // Background Renderer (for the Skybox at -1)
    const bgRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
    });

    // Overlay Renderer (for the Plane at 40)
    const overlayRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      depth: true,
      powerPreference: "high-performance",
    });
    overlayRenderer.setClearColor(0x000000, 0);

    const isMobile = window.innerWidth < 768;
    const pixelRatio = isMobile
      ? Math.min(window.devicePixelRatio, 1)
      : Math.min(window.devicePixelRatio, 1.5);

    [bgRenderer, overlayRenderer].forEach((r) => {
      r.setPixelRatio(pixelRatio);
      r.setSize(container.clientWidth, container.clientHeight, false);
      r.domElement.style.display = "block";
    });

    container.appendChild(bgRenderer.domElement);

    // Create a dynamic overlay container for the plane
    const overlayContainer = document.createElement("div");
    Object.assign(overlayContainer.style, {
      position: "fixed",
      inset: 0,
      zIndex: 40,
      pointerEvents: "none",
      overflow: "hidden",
    });
    document.body.appendChild(overlayContainer);
    overlayContainer.appendChild(overlayRenderer.domElement);

    // ---------- Scene & Camera ----------
    // ---------- Scenes & Camera ----------
    const bgScene = new THREE.Scene();
    const overlayScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.3,
      4000,
    );
    camera.position.set(0, 2, 0);
    // Look slightly above horizon for a nice view
    camera.rotation.set(-0.05, 0, 0);

    // ---------- Sky rotation (synced to Algeria real time) ----------
    // Algeria = Africa/Algiers = UTC+1, no DST
    function getAlgeriaDecimalHour() {
      const now = new Date();
      // Get current UTC hours as a decimal
      const utcHours =
        now.getUTCHours() +
        now.getUTCMinutes() / 60 +
        now.getUTCSeconds() / 3600;
      // Algeria is UTC+1
      return (utcHours + 1) % 24;
    }

    // Real-time speed: full 2π rotation in 24h = 86400s
    const skySpeed = (2 * Math.PI) / 86400;
    const skyInitial = new THREE.Vector3(0, 1, 0);
    const skyAxis = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      THREE.MathUtils.degToRad(-30),
    );
    // Map Algeria time to sky angle: angle=0 → noon, angle=π → midnight
    const algeriaHour = getAlgeriaDecimalHour();
    let skyAngle = ((algeriaHour - 12) / 24) * 2 * Math.PI;
    const dirToLight = new THREE.Vector3();
    const rotationMatrix = new THREE.Uniform(new THREE.Matrix3());

    function setSkyRotationMatrix(angle: number) {
      const cos = Math.cos(angle);
      const cos1 = 1 - cos;
      const sin = Math.sin(angle);
      const u = skyAxis;
      const u2 = skyAxis.clone().multiply(skyAxis);
      rotationMatrix.value.set(
        cos + u2.x * cos1,
        u.x * u.y * cos1 - u.z * sin,
        u.x * u.z * cos1 + u.y * sin,
        u.y * u.x * cos1 + u.z * sin,
        cos + u2.y * cos1,
        u.y * u.z * cos1 - u.x * sin,
        u.z * u.x * cos1 - u.y * sin,
        u.z * u.y * cos1 + u.x * sin,
        cos + u2.z * cos1,
      );
    }

    // Initial sky state
    setSkyRotationMatrix(skyAngle);
    skyInitial.applyMatrix3(rotationMatrix.value);
    dirToLight.set(-skyInitial.x, skyInitial.y, -skyInitial.z);
    skyInitial.set(0, 1, 0);

    // ---------- Stars texture ----------
    const starsSeed = 87;
    const gridSize = 64;
    const starsCount = 10000;
    const maxOffset = 0.43;
    const starsMap = new Uint8Array(gridSize * gridSize * 24);

    function vector3ToStarMap(dir: THREE.Vector3, value: number[]) {
      const absDir = new THREE.Vector3(
        Math.abs(dir.x),
        Math.abs(dir.y),
        Math.abs(dir.z),
      );
      const xPositive = dir.x > 0;
      const yPositive = dir.y > 0;
      const zPositive = dir.z > 0;
      let maxAxis = 0,
        u = 0,
        v = 0,
        i = 0;

      if (xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
        maxAxis = absDir.x;
        u = -dir.z;
        v = dir.y;
        i = 0;
      }
      if (!xPositive && absDir.x >= absDir.y && absDir.x >= absDir.z) {
        maxAxis = absDir.x;
        u = dir.z;
        v = dir.y;
        i = 1;
      }
      if (yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
        maxAxis = absDir.y;
        u = dir.x;
        v = -dir.z;
        i = 2;
      }
      if (!yPositive && absDir.y >= absDir.x && absDir.y >= absDir.z) {
        maxAxis = absDir.y;
        u = dir.x;
        v = dir.z;
        i = 3;
      }
      if (zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
        maxAxis = absDir.z;
        u = dir.x;
        v = dir.y;
        i = 4;
      }
      if (!zPositive && absDir.z >= absDir.x && absDir.z >= absDir.y) {
        maxAxis = absDir.z;
        u = -dir.x;
        v = dir.y;
        i = 5;
      }

      u = Math.floor((u / maxAxis + 1) * 0.5 * gridSize);
      v = Math.floor((v / maxAxis + 1) * 0.5 * gridSize);

      const j = (v * gridSize * 6 + i * gridSize + u) * 4;
      starsMap[j] = value[0];
      starsMap[j + 1] = value[1];
      starsMap[j + 2] = value[2];
      starsMap[j + 3] = value[3];
    }

    const rng = new Random(starsSeed);
    for (let i = 0; i < starsCount; i++) {
      const a = rng.next() * Math.PI * 2;
      const b = rng.next() * 2 - 1;
      const c = Math.sqrt(1 - b * b);
      const target = new THREE.Vector3(Math.cos(a) * c, Math.sin(a) * c, b);
      vector3ToStarMap(target, [
        THREE.MathUtils.lerp(0.5 - maxOffset, 0.5 + maxOffset, rng.next()) *
          255,
        THREE.MathUtils.lerp(0.5 - maxOffset, 0.5 + maxOffset, rng.next()) *
          255,
        Math.pow(rng.next(), 6) * 255,
        rng.next() * 255,
      ]);
    }

    const starsTexture = new THREE.DataTexture(
      starsMap,
      gridSize * 6,
      gridSize,
    );
    starsTexture.wrapS = THREE.RepeatWrapping;
    starsTexture.wrapT = THREE.RepeatWrapping;
    starsTexture.needsUpdate = true;
    const starsUniform = new THREE.Uniform(starsTexture);

    // ---------- Dither texture ----------
    const ditherSizeUniform = new THREE.Uniform(new THREE.Vector2());
    const ditherUniform = new THREE.Uniform<THREE.Texture | null>(null);
    const loader = new THREE.TextureLoader();
    loader.load("/ocean/bluenoise.png", (texture) => {
      ditherSizeUniform.value.set(texture.image.width, texture.image.height);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      ditherUniform.value = texture;
    });

    // ---------- Skybox uniforms ----------
    const up = new THREE.Vector3(0, 1, 0);
    const sunVisibility = new THREE.Uniform(1);
    const twilightTime = new THREE.Uniform(0);
    const twilightVisibility = new THREE.Uniform(0);
    const specularVisibility = new THREE.Uniform(1);
    const light = new THREE.Uniform(new THREE.Vector3(1, 1, 1));

    function computeSkyUniforms() {
      const intensity = dirToLight.dot(up);
      sunVisibility.value = THREE.MathUtils.clamp((intensity + 0.1) * 2, 0, 1);
      twilightTime.value = THREE.MathUtils.clamp((intensity + 0.1) * 3, 0, 1);
      twilightVisibility.value = 1 - Math.min(Math.abs(intensity * 3), 1);
      specularVisibility.value = Math.sqrt(sunVisibility.value);
      const l = Math.min(sunVisibility.value + 0.333, 1);
      light.value.set(l, l, l);
    }
    computeSkyUniforms();

    function setSkyboxUniforms(material: THREE.ShaderMaterial) {
      material.uniforms._SkyRotationMatrix = rotationMatrix;
      material.uniforms._DitherTexture = ditherUniform;
      material.uniforms._DitherTextureSize = ditherSizeUniform;
      material.uniforms._SunVisibility = sunVisibility;
      material.uniforms._TwilightTime = twilightTime;
      material.uniforms._TwilightVisibility = twilightVisibility;
      material.uniforms._GridSize = new THREE.Uniform(gridSize);
      material.uniforms._GridSizeScaled = new THREE.Uniform(gridSize * 6);
      material.uniforms._Stars = starsUniform;
      material.uniforms._SpecularVisibility = specularVisibility;
      material.uniforms._DirToLight = new THREE.Uniform(dirToLight);
      material.uniforms._Light = light;
    }

    // ---------- Skybox mesh ----------
    const skyHalfSize = 2000;
    const skyVertices = new Float32Array([
      -skyHalfSize,
      -skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      -skyHalfSize,
      -skyHalfSize,
      -skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      skyHalfSize,
      -skyHalfSize,
      -skyHalfSize,
      skyHalfSize,
      skyHalfSize,
      skyHalfSize,
      skyHalfSize,
      skyHalfSize,
    ]);
    const skyIndices = [
      2, 3, 0, 3, 1, 0, 0, 1, 4, 1, 5, 4, 1, 3, 5, 3, 7, 5, 3, 2, 7, 2, 6, 7, 2,
      0, 6, 0, 4, 6, 4, 5, 6, 5, 7, 6,
    ];
    const skyGeo = new THREE.BufferGeometry();
    skyGeo.setAttribute("position", new THREE.BufferAttribute(skyVertices, 3));
    skyGeo.setAttribute("coord", new THREE.BufferAttribute(skyVertices, 3));
    skyGeo.setIndex(skyIndices);

    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKYBOX_VERTEX,
      fragmentShader: SKYBOX_FRAGMENT,
    });
    setSkyboxUniforms(skyMat);

    const skyTimeUniform = new THREE.Uniform(0);
    skyMat.uniforms._Time = skyTimeUniform;
    const skybox = new THREE.Mesh(skyGeo, skyMat);
    bgScene.add(skybox); // Back in the background scene

    // ---------- Lighting for 3D models (in Overlay Scene) ----------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    overlayScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 200, 50);
    overlayScene.add(directionalLight);

    // ---------- Airplane model ----------
    let planeModel: THREE.Group | null = null;
    let planeT = Math.random(); // random start position along flight path

    // Flight path: figure-8 that stays visible in the sky
    const flightSpeed = 0.06;

    function updatePlanePosition(t: number) {
      if (!planeModel) return;
      const angle = t * Math.PI * 2;

      // Figure-8 (lemniscate) path in front of the camera
      const x = Math.sin(angle) * 400;
      const z = -200 - Math.cos(angle) * 150; // always in front (negative z)
      const y = 80 + Math.sin(angle * 2) * 60 + Math.cos(angle * 3) * 15;

      planeModel.position.set(x, y, z);

      // Look toward next point on path
      const na = (t + 0.002) * Math.PI * 2;
      const nx = Math.sin(na) * 400;
      const nz = -200 - Math.cos(na) * 150;
      const ny = 80 + Math.sin(na * 2) * 60 + Math.cos(na * 3) * 15;
      planeModel.lookAt(nx, ny, nz);

      // Bank into turns
      const bankAngle = -Math.cos(angle) * 0.25;
      planeModel.rotateZ(bankAngle);
    }

    if (showPlane) {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load("/source/scene.gltf", (gltf) => {
        const raw = gltf.scene;

        // The Sketchfab GLTF has nested node matrices that rotate the model.
        // Clear all transforms so we start fresh, then apply our own.
        raw.traverse((node) => {
          node.rotation.set(0, 0, 0);
          node.quaternion.identity();
          node.matrix.identity();
          node.matrixAutoUpdate = true;
        });

        raw.scale.set(0.02, 0.02, 0.02);

        // Outer pivot for lookAt; inner pivot for model orientation correction.
        // Model geometry: X = wingspan (-1302..1302), Y = fuselage (-470..1344), Z = height (-172..491)
        // After clearing transforms: nose is at +Y, wings on X, top at +Z.
        // Three.js lookAt points -Z forward. We need nose → -Z.
        // rotateX(+π/2): Y → Z, Z → -Y  → nose now at +Z (wrong direction)
        // rotateX(-π/2): Y → -Z, Z → +Y → nose now at -Z (correct!), top at +Y (correct!)
        const innerPivot = new THREE.Group();
        innerPivot.rotation.set(-Math.PI / 2, 0, 0);
        innerPivot.add(raw);

        const outerPivot = new THREE.Group();
        outerPivot.add(innerPivot);
        planeModel = outerPivot;
        overlayScene.add(planeModel); // In the overlay scene
        updatePlanePosition(planeT);
      });
    }

    // ---------- Resize handler ----------
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      bgRenderer.setSize(w, h, false);
      overlayRenderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    let isVisible = true;
    let isDestroyed = false;
    let lastFrameTime = 0;
    const targetFrameMs = 1000 / 30;

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Disable IntersectionObserver to keep plane visible across all sections
    /*
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);
    */

    // ---------- Animation loop ----------
    let animId = 0;
    function animate(now = 0) {
      if (isDestroyed) return;
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;
      if (now - lastFrameTime < targetFrameMs) return;
      lastFrameTime = now;

      const dt = Math.min(clock.getDelta(), 1 / 15);

      // Update sky time for star drift
      skyTimeUniform.value = clock.elapsedTime;

      // Sky rotation
      skyAngle += dt * skySpeed;
      setSkyRotationMatrix(skyAngle);
      skyInitial.applyMatrix3(rotationMatrix.value);
      dirToLight.set(-skyInitial.x, skyInitial.y, -skyInitial.z);
      skyInitial.set(0, 1, 0);
      computeSkyUniforms();

      // Keep skybox centered on camera
      // Keep skybox centered on camera
      skybox.position.copy(camera.position);

      // Animate airplane
      planeT = (planeT + dt * flightSpeed) % 1;
      updatePlanePosition(planeT);

      // Update directional light to match sun direction
      directionalLight.position.set(
        dirToLight.x * 200,
        dirToLight.y * 200,
        dirToLight.z * 200,
      );
      directionalLight.intensity = Math.max(sunVisibility.value * 1.0, 0.15);
      ambientLight.intensity = Math.max(sunVisibility.value * 0.6, 0.1);

      bgRenderer.render(bgScene, camera);
      overlayRenderer.render(overlayScene, camera);
    }
    animate();

    // ---------- Cleanup ----------
    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      // observer.disconnect(); // Disabled with observer removal
      bgRenderer.dispose();
      overlayRenderer.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      starsTexture.dispose();
      ditherUniform.value?.dispose();
      if (planeModel) {
        planeModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
      if (container.contains(bgRenderer.domElement)) {
        container.removeChild(bgRenderer.domElement);
      }
      if (document.body.contains(overlayContainer)) {
        document.body.removeChild(overlayContainer);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
      }}
    />
  );
}
