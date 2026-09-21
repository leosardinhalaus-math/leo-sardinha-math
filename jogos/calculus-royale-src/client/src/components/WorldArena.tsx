import { useEffect, useRef, useState } from 'react';
import { createGameScene, type ArenaUnit, type GameHandle } from '@/game/scene';
import { getWorldMap } from '@/data/worldMaps';
import { getCardImage } from '@/data/cardArt';

export default function WorldArena({worldIndex,active,allies=[],enemies=[],paused=false}:{worldIndex:number;active:boolean;allies?:ArenaUnit[];enemies?:ArenaUnit[];paused?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);const handle=useRef<GameHandle|undefined>(undefined);
 const [status,setStatus]=useState('loading');const [warnings,setWarnings]=useState(0);const world=getWorldMap(worldIndex);
 const latest=useRef({allies,enemies,paused});latest.current={allies,enemies,paused};
 useEffect(()=>{if(!active||!canvasRef.current)return;setStatus('loading');setWarnings(0);
  try{handle.current=createGameScene(canvasRef.current,worldIndex,count=>{setWarnings(count);setStatus('ready');},()=>setStatus('fallback'));handle.current.setState(latest.current);}catch(error){console.warn('Arena 3D indisponível.',error);setStatus('fallback');}
  return()=>{handle.current?.dispose();handle.current=undefined;};
 },[worldIndex,active]);
 useEffect(()=>{handle.current?.setState({allies,enemies,paused});},[allies,enemies,paused]);
 return <div className="world-arena" data-arena-theme={world.slug} data-scene-status={status}>
  <img className="arena-backdrop" src={world.art} alt=""/>
  <canvas ref={canvasRef} className="world-arena-canvas" tabIndex={0} aria-label={`Arena 3D da ${world.title}. Arraste para girar; pinça ou roda para zoom; WASD ou setas para mover a câmera; R para centralizar.`}/>
  {status==='loading'&&<div className="arena-loading" role="status">Preparando arena 3D…</div>}
  {status==='fallback'&&<><span className="arena-fallback-note">Modo ilustrado · 3D indisponível</span>{[...allies.map(u=>({u,enemy:false})),...enemies.map(u=>({u,enemy:true}))].map(({u,enemy})=><img key={`${enemy}${u.id}`} className="arena-fallback-unit" src={getCardImage(u.cardId)} alt={u.name} style={{left:`${enemy?82-u.progress*.64:18+u.progress*.64}%`,top:enemy?'40%':'60%'}}/>)}</>}
  {warnings>0&&status==='ready'&&<span className="arena-fallback-note">Alguns modelos usam a versão provisória</span>}
  <div className="arena-world-name"><span>ILHA {String(world.id).padStart(2,'0')}</span><strong>{world.title}</strong></div>
  <div className="arena-camera-help"><span>Arraste para girar · pinça para zoom</span><button onClick={()=>handle.current?.resetCamera()} aria-label="Centralizar câmera">↺ Câmera</button></div>
 </div>;
}
