import { useEffect, useRef, useState } from 'react';
import { createGameScene, type ArenaUnit, type ArenaState, type GameHandle } from '@/game/scene';
import { getWorldMap } from '@/data/worldMaps';
import { SPAWN_ZONES } from '@/game/combat';
import { getCardImage } from '@/data/cardArt';

export default function WorldArena({worldIndex,active,allies=[],enemies=[],paused=false,events=[],placement,outcome,onSelectZone,onAvailabilityChange}:{onAvailabilityChange?:(ready:boolean)=>void;events?:ArenaState['events'];placement?:ArenaState['placement'];outcome?:ArenaState['outcome'];onSelectZone?:(id:string)=>void;worldIndex:number;active:boolean;allies?:ArenaUnit[];enemies?:ArenaUnit[];paused?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);const handle=useRef<GameHandle|undefined>(undefined);
 const [status,setStatus]=useState('loading');const [warnings,setWarnings]=useState(0);const world=getWorldMap(worldIndex);
 const latest=useRef({allies,enemies,paused,events,placement,outcome});latest.current={allies,enemies,paused,events,placement,outcome};
 const selectRef=useRef(onSelectZone);selectRef.current=onSelectZone;
 useEffect(()=>{onAvailabilityChange?.(active&&status!=='loading');},[active,status,onAvailabilityChange]);
 useEffect(()=>{if(!active||!canvasRef.current)return;setStatus('loading');setWarnings(0);
  try{handle.current=createGameScene(canvasRef.current,worldIndex,count=>{setWarnings(count);setStatus('ready');},()=>setStatus('fallback'),id=>selectRef.current?.(id));handle.current.setState(latest.current);}catch(error){console.warn('Arena 3D indisponível.',error);setStatus('fallback');}
  return()=>{handle.current?.dispose();handle.current=undefined;};
 },[worldIndex,active]);
 useEffect(()=>{handle.current?.setState({allies,enemies,paused,events,placement,outcome});},[allies,enemies,paused,events,placement,outcome]);
 return <div className="world-arena" data-arena-theme={world.slug} data-scene-status={status}>
  <img className="arena-backdrop" src={world.art} alt=""/>
  <canvas ref={canvasRef} className="world-arena-canvas" tabIndex={0} aria-label={`Arena 3D da ${world.title}. Visão fixa do sul para o norte; use pinça ou roda para zoom e R para centralizar.`}/>
  {status==='loading'&&<div className="arena-loading" role="status">Preparando arena 3D…</div>}
  {status==='fallback'&&<><span className="arena-fallback-note">Modo ilustrado · 3D indisponível</span>{[...allies.map(u=>({u,enemy:false})),...enemies.map(u=>({u,enemy:true}))].map(({u,enemy})=><img key={`${enemy}${u.id}`} className="arena-fallback-unit" src={getCardImage(u.cardId)} alt={u.name} style={{left:(u.lane??(enemy?-1.65:1.65))<0?'56%':'44%',top:`${enemy?18+u.progress*.64:82-u.progress*.64}%`}}/>)}</>}
  {status==='fallback'&&placement&&<img className="arena-fallback-unit" src={getCardImage(placement.unit.cardId)} alt={`Prévia de ${placement.unit.name}`} style={{left:(SPAWN_ZONES.find(z=>z.id===placement.zoneId)?.lane??0)<0?'56%':'44%',top:`${82-(SPAWN_ZONES.find(z=>z.id===placement.zoneId)?.progress??5)*.64}%`,outline:'3px solid #ffe18c'}}/>}
  {warnings>0&&status==='ready'&&<span className="arena-fallback-note">Alguns modelos usam a versão provisória</span>}
  <div className="arena-world-name"><span>ILHA {String(world.id).padStart(2,'0')}</span><strong>{world.title}</strong></div>
  <div className="arena-camera-help"><span>SUL ↑ NORTE · pinça para zoom</span><div className="arena-view-buttons"><button onClick={()=>handle.current?.viewIsland()} aria-label="Ver ilha inteira">Ilha inteira</button><button onClick={()=>handle.current?.resetCamera()} aria-label="Centralizar câmera">Combate</button></div></div>
 </div>;
}
