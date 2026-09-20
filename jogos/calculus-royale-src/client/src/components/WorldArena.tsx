import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { getWorldMap } from "@/data/worldMaps";

export default function WorldArena({ worldIndex, active }: { worldIndex: number; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("loading");
  const world = getWorldMap(worldIndex);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;
    let engine: Engine | undefined;
    let handle: GameHandle | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let stopVisibility = () => {};
    setStatus("loading");
    try {
      engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false });
      engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 1.5));
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      handle = createGameScene(engine, canvas, worldIndex, motion.matches);
      const render = () => handle?.scene.render();
      const updateVisibility = () => {
        engine?.stopRenderLoop(render);
        if (!document.hidden) engine?.runRenderLoop(render);
      };
      updateVisibility();
      document.addEventListener("visibilitychange", updateVisibility);
      stopVisibility = () => document.removeEventListener("visibilitychange", updateVisibility);
      resizeObserver = new ResizeObserver(() => handle?.resize());
      resizeObserver.observe(canvas);
      handle.scene.executeWhenReady(() => { if (!disposed) setStatus("ready"); });
    } catch (error) {
      console.warn("Arena: usando cenário ilustrado.", error);
      setStatus("fallback");
      resizeObserver?.disconnect();
      stopVisibility();
      handle?.dispose();
      engine?.dispose();
      handle = undefined;
      engine = undefined;
    }
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      stopVisibility();
      handle?.dispose();
      engine?.dispose();
    };
  }, [worldIndex, active]);
  return <div className="world-arena" data-arena-theme={world.slug} data-scene-status={status}>
    <img className="arena-backdrop" src={world.art} alt="" />
    <canvas ref={canvasRef} className="world-arena-canvas" role="img" aria-label={`Arena da ${world.title}: torres, pontes e portais`} />
    <div className="arena-atmosphere" aria-hidden="true" />
    {status === "fallback" && <span className="arena-fallback-note">Cenário ilustrado</span>}
    <div className="arena-world-name"><span>ILHA {String(world.id).padStart(2, "0")}</span><strong>{world.title}</strong></div>
    <span className="arena-side ally-side">SUA BASE</span><span className="arena-side enemy-side">BASE RIVAL</span>
  </div>;
}
