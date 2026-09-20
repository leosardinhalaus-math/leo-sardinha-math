import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { getWorldMap } from "@/data/worldMaps";
import "@babylonjs/core/Materials/standardMaterial";

const palettes = [
  { stone: "#214665", top: "#477995", dark: "#102438", light: "#73edff", sky: "#081d36", bridge: "#6899ad" },
  { stone: "#6d3027", top: "#b86d43", dark: "#352124", light: "#ffb65e", sky: "#271724", bridge: "#8d6046" },
  { stone: "#332755", top: "#61528b", dark: "#19182f", light: "#c2a0ff", sky: "#100e29", bridge: "#8b7dc5" },
  { stone: "#204a44", top: "#498767", dark: "#0a302e", light: "#85ffbc", sky: "#0b292c", bridge: "#9ca885" },
  { stone: "#483839", top: "#7d6460", dark: "#291f2c", light: "#ffda7c", sky: "#271a29", bridge: "#b89965" },
];

export type GameHandle = { scene: Scene; resize: () => void; dispose: () => void };

/** Decorative architecture only. Combat, progression and card timing remain in React. */
export function createGameScene(engine: Engine, canvas: HTMLCanvasElement, worldIndex = 0, reducedMotion = false): GameHandle {
  const world = getWorldMap(worldIndex);
  const p = palettes[world.id - 1];
  const scene = new Scene(engine);
  scene.metadata = { world: world.slug };
  const sky = Color3.FromHexString(p.sky);
  scene.clearColor = new Color4(sky.r, sky.g, sky.b, 1);
  const camera = new FreeCamera("arena-camera", new Vector3(0, 20, -18), scene);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.mode = 1;
  camera.minZ = .1;
  camera.maxZ = 100;
  const resize = () => {
    engine.resize();
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    const halfWidth = Math.max(14, 6.2 * aspect);
    camera.orthoLeft = -halfWidth;
    camera.orthoRight = halfWidth;
    camera.orthoTop = halfWidth / aspect;
    camera.orthoBottom = -halfWidth / aspect;
  };
  resize();
  const hemi = new HemisphericLight("sky-fill", new Vector3(0, 1, 0), scene);
  hemi.intensity = .55;
  hemi.groundColor = Color3.FromHexString(p.dark);
  const sun = new DirectionalLight("island-light", new Vector3(-.4, -1, .6), scene);
  sun.intensity = .85;
  sun.diffuse = Color3.FromHexString(worldIndex === 1 || worldIndex === 4 ? "#ffdfaa" : "#d4edff");
  const glow = new GlowLayer("island-glow", scene, { mainTextureFixedSize: 256, blurKernelSize: 24 });
  glow.intensity = .3;
  const mat = (name: string, color: string, emission = 0) => {
    const m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(color);
    m.emissiveColor = m.diffuseColor.scale(emission);
    m.specularColor = Color3.Black();
    return m;
  };
  const stone = mat("stone", p.stone), top = mat("top", p.top), dark = mat("dark", p.dark);
  const bridgeMat = mat("bridge", p.bridge), gold = mat("gold", "#e5b969", .12);
  const glowMat = mat("magic", world.accent, .9), light = mat("light", p.light, .85);
  const ally = mat("ally", "#5ce8ed", .7), enemy = mat("enemy", "#ff8170", .65);
  const moving: { mesh: Mesh; kind: "orbit" | "spin" | "float"; phase: number; baseY: number }[] = [];
  let serial = 0;
  const place = (mesh: Mesh, x: number, y: number, z: number, material: StandardMaterial) => {
    mesh.position.set(x, y, z);
    mesh.material = material;
    mesh.isPickable = false;
    return mesh;
  };
  const box = (name: string, x: number, y: number, z: number, w: number, h: number, d: number, material = stone) =>
    place(MeshBuilder.CreateBox(`${name}-${serial++}`, { width: w, height: h, depth: d }, scene), x, y, z, material);
  const cylinder = (name: string, x: number, y: number, z: number, diameter: number, height: number, material = stone, vertices = 8, tip = diameter) =>
    place(MeshBuilder.CreateCylinder(`${name}-${serial++}`, { diameterBottom: diameter, diameterTop: tip, height, tessellation: vertices }, scene), x, y, z, material);
  const orb = (name: string, x: number, y: number, z: number, size: number, material = light) =>
    place(MeshBuilder.CreateSphere(`${name}-${serial++}`, { diameter: size, segments: 8 }, scene), x, y, z, material);
  const ring = (name: string, x: number, y: number, z: number, diameter: number, material = gold, upright = false) => {
    const m = place(MeshBuilder.CreateTorus(`${name}-${serial++}`, { diameter, thickness: .1, tessellation: 32 }, scene), x, y, z, material);
    if (upright) m.rotation.x = Math.PI / 2;
    return m;
  };
  const animate = (mesh: Mesh, kind: "orbit" | "spin" | "float", phase = 0) => moving.push({ mesh, kind, phase, baseY: mesh.position.y });

  // Two stone banks and two crossings make the combat direction legible.
  for (const side of [-1, 1]) {
    box("island-foundation", side * 7, -.85, 0, 11, 1.5, 10);
    box("island-surface", side * 7, -.03, 0, 11.2, .2, 10.2, top);
    for (let i = 0; i < 5; i++) {
      cylinder("island-rock", side * (3 + i * 2), -1.2, (i % 2 ? 1 : -1) * 4.9, 2.1, 2 + i % 3, stone, 5, .8);
    }
    for (const z of [-1.6, 1.6]) {
      box("lane", side * 7, .1, z, 10.7, .08, 1.55, bridgeMat);
      box("lane-trim", side * 7, .16, z - .78, 10.6, .06, .07, glowMat);
    }
  }
  if (worldIndex === 3 || worldIndex === 4) {
    box(worldIndex === 3 ? "canal" : "molten-channel", 0, -.8, 0, 3, .12, 12, glowMat);
    for (let i = 0; i < 8; i++) box("flow", .65 * Math.sin(i), -.66, -5 + i * 1.4, .75, .035, .035, light);
  }
  for (const z of [-1.6, 1.6]) {
    if (worldIndex === 0 || worldIndex === 2) {
      for (let i = 0; i < 7; i++) {
        const m = box("floating-step", -1.5 + i * .5, .14, z, .43, .22, 1.6, bridgeMat);
        animate(m, "float", i * .65);
      }
    } else {
      box("bridge-deck", 0, .14, z, 3.6, .3, 1.75, bridgeMat);
      for (let i = -3; i <= 3; i++) box("bridge-plank", i * .48, .32, z, .38, .08, 1.7, worldIndex === 4 ? dark : top);
      for (const edge of [-1, 1]) {
        box("bridge-rail", 0, .83, z + edge * .95, 3.9, .12, .1, gold);
        for (const x of [-1.75, 1.75]) box("bridge-post", x, .48, z + edge * .95, .15, .85, .15, stone);
      }
    }
  }

  const tower = (x: number, z: number, team: StandardMaterial) => {
    cylinder("tower-plinth", x, .24, z, 2.1, .5, dark, 6);
    if (worldIndex === 0) {
      box("crystal-tower", x, 1.1, z, 1.1, 1.8, 1.1);
      cylinder("crystal-spire", x, 2.6, z, 1.2, 1.35, team, 4, 0);
      ring("crystal-collar", x, 1.65, z, 1.65, gold);
    } else if (worldIndex === 1) {
      for (let i = 0; i < 3; i++) box("canyon-tier", x, .65 + i * .58, z, 1.6 - i * .22, .6, 1.6 - i * .22, i === 1 ? top : stone);
      const arrow = cylinder("tangent-arrow", x, 2.35, z, .95, .9, team, 3, 0);
      arrow.rotation.z = -.24;
    } else if (worldIndex === 2) {
      cylinder("observatory", x, 1, z, 1.45, 1.7, top, 16);
      orb("observatory-dome", x, 1.9, z, 1.6, dark);
      const orbit = ring("observatory-orbit", x, 2.25, z, 2, team, true);
      orbit.rotation.z = .5; animate(orbit, "spin");
      orb("observatory-star", x, 2.25, z, .45, light);
    } else if (worldIndex === 3) {
      for (let i = 0; i < 4; i++) cylinder("garden-tier", x, .6 + i * .5, z, 1.85 - i * .26, .35, i % 2 ? top : stone, 8);
      orb("garden-heart", x, 2.35, z, .6, team);
      for (const offset of [-.65, .65]) cylinder("garden-pillar", x + offset, 1.15, z, .23, 2.2, gold, 6);
    } else {
      box("forge-tower", x, 1.05, z, 1.6, 1.7, 1.6, dark);
      box("forge-window", x, 1.05, z - .81, .8, .75, .035, team);
      cylinder("forge-cap", x, 2.1, z, 1.65, .6, bridgeMat, 8, 1);
      cylinder("forge-chimney", x, 2.7, z, .5, .8, stone, 8);
      orb("forge-flame", x, 3.15, z, .36, light);
    }
    ring("team-base", x, .52, z, 2.1, team);
  };
  for (const side of [-1, 1]) for (const z of [-3.6, 3.6]) tower(side * 9.7, z, side < 0 ? ally : enemy);

  // Landmark silhouettes and portals are unique to each mathematical island.
  for (const side of [-1, 1]) {
    const x = side * 5.8, z = 3.8;
    if (worldIndex === 0) {
      for (const dx of [-1.05, 1.05]) {
        box("portal-pillar", x + dx, 1.35, z, .4, 2.7, .5);
        cylinder("portal-tip", x + dx, 3, z, .6, .8, gold, 4, 0);
      }
      const portal = ring("infinity-gate", x, 1.6, z, 2.2, glowMat, true);
      animate(portal, "spin", side);
      for (let i = 0; i < 4; i++) {
        const crystal = cylinder("levitating-crystal", side * (3 + i * .85), 1.2 + i % 2, -4.6, .5, 1.1, glowMat, 4, 0);
        animate(crystal, "float", i);
      }
    } else if (worldIndex === 1) {
      for (let i = 0; i < 3; i++) {
        box("canyon-rock", x + (i - 1) * 1.4, .7 + i * .3, z + .5, 1.2, 1.5 + i * .6, 1.6, i % 2 ? top : stone);
        const shard = cylinder("canyon-spire", x + (i - 1) * 1.4, 2.3 + i * .3, z + .5, 1.3, 1.5, top, 4, 0);
        shard.rotation.z = side * .18;
      }
      for (const dx of [-1.5, 1.5]) {
        cylinder("torch", x + dx, .7, -3.9, .25, 1.4, dark);
        const fire = orb("torch-flame", x + dx, 1.5, -3.9, .48, light);
        animate(fire, "float", dx);
      }
    } else if (worldIndex === 2) {
      cylinder("astral-platform", x, .3, z, 3.1, .5, dark, 24);
      for (let i = 0; i < 3; i++) {
        const orbit = ring("series-orbit", x, 1.5, z, 2 + i * .45, i % 2 ? glowMat : gold, true);
        orbit.rotation.z = i * Math.PI / 3;
        animate(orbit, "spin", i);
      }
      orb("astral-core", x, 1.5, z, .7, light);
      for (let i = 0; i < 8; i++) {
        const star = orb("series-star", x + Math.cos(i) * 2.2, 2, z + Math.sin(i) * .8, .13, light);
        animate(star, "float", i);
      }
    } else if (worldIndex === 3) {
      for (let i = 0; i < 4; i++) {
        const tx = side * (3 + i * 1.3), tz = i % 2 ? 4.3 : -4.4;
        cylinder("tree-trunk", tx, .7, tz, .25, 1.4, bridgeMat);
        cylinder("tree-crown", tx, 1.6, tz, 1.5, 2.2, top, 7, 0);
        orb("forest-firefly", tx + .4, 1.5, tz, .12, light);
      }
      const arch = ring("integral-arch", x, .7, z, 2.6, gold, true);
      box("arch-foot", x - 1.3, .4, z, .45, .9, .6);
      box("arch-foot", x + 1.3, .4, z, .45, .9, .6);
      arch.scaling.y = 1.15;
    } else {
      const cog = ring("forge-wheel", x, 1.6, z, 2.6, gold, true);
      for (let i = 0; i < 12; i++) {
        const tooth = box("gear-tooth", 0, 0, 0, .38, .22, .42, bridgeMat);
        tooth.parent = cog;
        tooth.position.set(Math.cos(i * Math.PI / 6) * 1.32, 0, Math.sin(i * Math.PI / 6) * 1.32);
        tooth.rotation.y = -i * Math.PI / 6;
      }
      animate(cog, "spin", side);
      box("wheel-pedestal", x, .55, z, 2.7, 1.1, .8, dark);
      for (let i = 0; i < 4; i++) {
        const spark = orb("forge-spark", x + Math.sin(i) * 1.2, 1 + i * .5, -4.5, .1, light);
        animate(spark, "float", i);
      }
    }
  }
  // Warm/cold border studs keep the playing surface readable at phone sizes.
  for (let i = -5; i <= 5; i++) for (const z of [-5.25, 5.25]) box("border-rune", i * 2.25, .2, z, .32, .12, .15, i < 0 ? ally : enemy);
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (reducedMotion) return;
    const t = performance.now() / 1000;
    for (const item of moving) {
      if (item.kind === "float") item.mesh.position.y = item.baseY + Math.sin(t * 1.4 + item.phase) * .09;
      else item.mesh.rotation.y = t * .2 + item.phase;
    }
  });
  return { scene, resize, dispose: () => { scene.onBeforeRenderObservable.remove(observer); scene.dispose(); } };
}
