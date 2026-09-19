import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Materials/standardMaterial";

type WorldPalette = { floor: string; glow: string; accent: string };

const palettes: WorldPalette[] = [
  { floor: "#102a4d", glow: "#29d9e8", accent: "#ff8064" },
  { floor: "#152846", glow: "#936bff", accent: "#ffcf62" },
  { floor: "#1a2842", glow: "#3fe0a5", accent: "#ff8f6b" },
  { floor: "#201e46", glow: "#b18cff", accent: "#54d9ff" },
  { floor: "#2d1d43", glow: "#ffae63", accent: "#f9688e" },
];

const hexToColor = (hex: string) => {
  const clean = hex.replace("#", "");
  return new Color3(
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  );
};

function material(scene: Scene, name: string, hex: string, emissive = 0.1) {
  const mat = new StandardMaterial(name, scene);
  const color = hexToColor(hex);
  mat.diffuseColor = color;
  mat.emissiveColor = color.scale(emissive);
  mat.specularColor = Color3.Black();
  return mat;
}

export type GameHandle = { scene: Scene; dispose: () => void };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.025, 0.045, 0.1, 1);
  const camera = new FreeCamera("arena-camera", new Vector3(0, 17.5, -20), scene);
  camera.setTarget(new Vector3(0, 0, 1));
  camera.mode = 1;
  camera.orthoLeft = -13;
  camera.orthoRight = 13;
  camera.orthoTop = 8.3;
  camera.orthoBottom = -8.3;
  camera.minZ = 0.1;
  camera.maxZ = 100;

  const hemi = new HemisphericLight("arena-fill", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.65;
  const key = new DirectionalLight("arena-key", new Vector3(-0.2, -1, 0.4), scene);
  key.position = new Vector3(4, 16, -8);
  key.intensity = 0.9;
  const glow = new GlowLayer("formula-glow", scene);
  glow.intensity = 0.75;

  const floorMat = material(scene, "floor", palettes[0].floor, 0.2);
  const cyanMat = material(scene, "cyan", palettes[0].glow, 0.9);
  const coralMat = material(scene, "coral", palettes[0].accent, 0.75);
  const goldMat = material(scene, "gold", "#f8d47b", 0.65);
  const darkMat = material(scene, "dark", "#08182e", 0.1);

  const ground = MeshBuilder.CreateGround("arcane-grid", { width: 26, height: 17 }, scene);
  ground.material = floorMat;

  for (let x = -13; x <= 13; x += 1) {
    const line = MeshBuilder.CreateBox(`grid-x-${x}`, { width: 0.018, height: 0.012, depth: 17 }, scene);
    line.position = new Vector3(x, 0.018, 0);
    line.material = darkMat;
  }
  for (let z = -8; z <= 8; z += 1) {
    const line = MeshBuilder.CreateBox(`grid-z-${z}`, { width: 26, height: 0.012, depth: 0.018 }, scene);
    line.position = new Vector3(0, 0.02, z);
    line.material = darkMat;
  }

  const laneMat = material(scene, "lane", "#17365d", 0.18);
  for (const x of [-4.8, 4.8]) {
    const lane = MeshBuilder.CreateBox(`lane-${x}`, { width: 4.8, height: 0.08, depth: 17 }, scene);
    lane.position = new Vector3(x, 0.07, 0);
    lane.material = laneMat;
  }
  const bridge = MeshBuilder.CreateBox("bridge", { width: 2.5, height: 0.18, depth: 4.4 }, scene);
  bridge.position = new Vector3(0, 0.16, 0);
  bridge.material = coralMat;

  const tower = (name: string, x: number, z: number, mat: StandardMaterial) => {
    const base = MeshBuilder.CreateCylinder(name, { diameter: 2.1, height: 1.4, tessellation: 6 }, scene);
    base.position = new Vector3(x, 0.72, z);
    base.material = mat;
    const crown = MeshBuilder.CreateCylinder(`${name}-crown`, { diameter: 1.35, height: 0.95, tessellation: 6 }, scene);
    crown.position = new Vector3(x, 1.75, z);
    crown.material = mat;
    const orb = MeshBuilder.CreateSphere(`${name}-orb`, { diameter: 0.55, segments: 12 }, scene);
    orb.position = new Vector3(x, 2.5, z);
    orb.material = goldMat;
  };
  tower("enemy-tower-left", -9.6, 5.5, coralMat);
  tower("enemy-tower-right", 9.6, 5.5, coralMat);
  tower("ally-tower-left", -9.6, -5.5, cyanMat);
  tower("ally-tower-right", 9.6, -5.5, cyanMat);

  const portal = (x: number, z: number, color: string, phase: number) => {
    const ring = MeshBuilder.CreateTorus(`portal-${x}`, { diameter: 2.2, thickness: 0.1, tessellation: 32 }, scene);
    ring.rotation.x = Math.PI / 2;
    ring.position = new Vector3(x, 0.25, z);
    ring.material = material(scene, `portal-mat-${x}`, color, 1);
    ring.metadata = { phase };
  };
  portal(-6.4, 0, palettes[0].glow, 0);
  portal(6.4, 0, palettes[1].glow, 1.6);

  for (let i = 0; i < 12; i += 1) {
    const sigil = MeshBuilder.CreateBox(`sigil-${i}`, { width: i % 2 ? 0.85 : 0.32, height: 0.035, depth: 0.035 }, scene);
    sigil.position = new Vector3(-11 + (i % 6) * 4.4, 0.16 + (i % 3) * 0.02, -7 + Math.floor(i / 6) * 14);
    sigil.rotation.y = i % 2 ? 0.28 : -0.5;
    sigil.material = i % 3 === 0 ? goldMat : cyanMat;
  }

  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    const t = performance.now() * 0.001;
    scene.meshes.forEach((mesh) => {
      if (mesh.name.startsWith("portal-")) {
        mesh.rotation.z = t * 0.45 + Number(mesh.metadata?.phase ?? 0);
        mesh.scaling.y = 1 + Math.sin(t * 2 + Number(mesh.metadata?.phase ?? 0)) * 0.04;
      }
    });
  });

  void canvas;
  return {
    scene,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(beforeRender);
      scene.dispose();
    },
  };
}
