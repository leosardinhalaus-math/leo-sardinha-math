import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { createCharacter, disposeObject, type ModelSpec } from './characters';
import { arenaPosition, moveWithCollisions } from './collisions';
import { createWorld } from './world';
import { createAbilityEffect } from './effects';
import { SPAWN_ZONES, type CombatEvent } from './combat';

export type ArenaUnit={id:number;cardId:string;name:string;kind:string;progress:number;color:string;lane?:number;hp?:number;maxHp?:number;lastAttack?:number};
export type ArenaState={allies:ArenaUnit[];enemies:ArenaUnit[];paused:boolean;events?:CombatEvent[];placement?:{unit:ArenaUnit;zoneId:string;blocked:string[]};outcome?:'victory'|'defeat'|null};
type Manifest={useGenerated?:boolean;characters?:Record<string,ModelSpec>;worlds?:Record<string,{url:string}>};
export type GameHandle={setState:(state:ArenaState)=>void;resetCamera:()=>void;dispose:()=>void};

export function createGameScene(canvas:HTMLCanvasElement,index:number,onReady:(warnings:number)=>void,onError:()=>void,onSelectZone?:(id:string)=>void):GameHandle{
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new T.Scene();scene.background=new T.Color(0x091826);scene.fog=new T.FogExp2(0x091826,.016);
 scene.add(new T.HemisphereLight(0xd7eeff,0x253228,2.1));
 const sun=new T.DirectionalLight(0xffeed6,3);sun.position.set(-7,18,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:12,bottom:-12,near:.1,far:50});sun.shadow.bias=-.001;scene.add(sun);
 const world=createWorld(index);scene.add(world.root);
 const camera=new T.PerspectiveCamera(42,1,.1,120);const controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.minDistance=12;controls.maxDistance=45;controls.maxPolarAngle=Math.PI*.43;controls.minPolarAngle=.3;controls.enablePan=true;
 function resetCamera(){const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);const distance=Math.max(21,13/(Math.tan(T.MathUtils.degToRad(21))*aspect));camera.position.set(0,distance*.78,distance*.7);controls.target.set(0,0,0);controls.update();}
 resetCamera();
 const observer=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(canvas);
 let state:ArenaState={allies:[],enemies:[],paused:false},disposed=false,ready=false,warnings=0;
 let manifest:Manifest={};const assets=new Map<string,GLTF>();
 const actors=new Map<string,{visual:ReturnType<typeof createCharacter>;unit:ArenaUnit;enemy:boolean;age:number;lane:number;exitAge?:number;exitMotion?:'victory'|'defeat';attackFor:number;lastAttack:number;health:T.Mesh}>();
 const zoneMeshes=SPAWN_ZONES.map(zone=>{const material=new T.MeshBasicMaterial({color:0x5bffcc,transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false});const mesh=new T.Mesh(new T.PlaneGeometry(1.35,1.2),material);mesh.rotation.x=-Math.PI/2;mesh.position.copy(arenaPosition(zone.progress,false,zone.lane));mesh.position.y=.13;mesh.userData.zoneId=zone.id;mesh.visible=false;scene.add(mesh);return mesh;});
 let preview:ReturnType<typeof createCharacter>|undefined,previewId='';
 const effects:ReturnType<typeof createAbilityEffect>[]=[];const seenEvents=new Set<string>();
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down={x:0,y:0};
 const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};
 const pointerUp=(e:PointerEvent)=>{if(!state.placement||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(zoneMeshes)[0];if(hit&&!state.placement.blocked.includes(hit.object.userData.zoneId))onSelectZone?.(hit.object.userData.zoneId);};
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
 const keys=new Set<string>();
 function keydown(e:KeyboardEvent){if(document.activeElement!==canvas)return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){keys.add(e.key);e.preventDefault();}if(e.key.toLowerCase()==='r')resetCamera();}
 function keyup(e:KeyboardEvent){keys.delete(e.key);}
 function blur(){keys.clear();}
 canvas.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);canvas.addEventListener('blur',blur);
 const lost=(e:Event)=>{e.preventDefault();onError();};canvas.addEventListener('webglcontextlost',lost);
 // Carregamento opcional: sem GLB configurado, o jogo já funciona com avatares animados.
 const loader=new GLTFLoader();const abort=new AbortController();
 async function prepare(){
  try{const response=await fetch(`${import.meta.env.BASE_URL}assets/models/manifest.json`,{signal:abort.signal});if(!response.ok)throw new Error('Manifesto indisponível');manifest=await response.json();}catch(e){if(disposed)return;console.warn('Usando personagens provisórios.',e);warnings++;}
  if(manifest.useGenerated){try{const response=await fetch(`${import.meta.env.BASE_URL}assets/models/generated/manifest.json`,{signal:abort.signal});if(!response.ok)throw new Error('Modelos não gerados');const generated:Manifest=await response.json();manifest.characters={...generated.characters,...manifest.characters};}catch(e){if(disposed)return;warnings++;console.warn('Usando geometria procedural direta.',e);}}
  const specs=Object.values(manifest.characters??{});const map=manifest.worlds?.[String(index+1)];
  const urls=[...new Set([...specs.map(s=>s.url),...(map?[map.url]:[])])];
  await Promise.all(urls.map(async url=>{try{const model=await loader.loadAsync(new URL(url,document.baseURI).href);if(disposed){disposeObject(model.scene);return;}assets.set(url,model);}catch(e){warnings++;console.warn(`Modelo indisponível: ${url}`,e);}}));
  if(disposed)return;
  if(map&&assets.has(map.url)){
   // O mapa externo deve conservar as duas rotas; apenas meshes COL_* colidem.
   world.root.visible=false;world.obstacles.length=0;const model=assets.get(map.url)!.scene;scene.add(model);model.updateMatrixWorld(true);
   model.traverse(o=>{if(o instanceof T.Mesh){o.receiveShadow=true;o.castShadow=true;if(o.name.startsWith('COL_')){world.obstacles.push(new T.Box3().setFromObject(o));o.visible=false;}}});
  }
  canvas.dataset.modelsLoaded=String(assets.size);ready=true;onReady(warnings);
 }
 void prepare();
 function synchronize(){
  const live=new Set<string>();
  for(const [units,enemy] of [[state.allies,false],[state.enemies,true]] as const)for(const unit of units){
   const key=`${enemy?'e':'a'}${unit.id}`;live.add(key);let actor=actors.get(key);
   if(!actor){const spec=manifest.characters?.[unit.cardId]??manifest.characters?.default;const visual=createCharacter(enemy?'#ff816f':'#69f2e0',unit.kind,spec?assets.get(spec.url):undefined,spec,unit.cardId);const lane=unit.lane??(enemy?-1.65:1.65);visual.group.position.copy(arenaPosition(unit.progress,enemy,lane));visual.group.rotation.y=enemy?-Math.PI/2:Math.PI/2;
    const health=new T.Mesh(new T.PlaneGeometry(.8,.08),new T.MeshBasicMaterial({color:enemy?0xff8866:0x67f5bd,side:T.DoubleSide}));health.position.y=2.4;visual.group.add(health);scene.add(visual.group);actor={visual,unit,enemy,age:0,lane,attackFor:0,lastAttack:0,health};actors.set(key,actor);
   }actor.unit=unit;if((unit.lastAttack??0)!==actor.lastAttack){actor.lastAttack=unit.lastAttack??0;actor.attackFor=.7;}
  }
  for(const [key,actor] of actors)if(!live.has(key)&&actor.exitAge===undefined){actor.exitAge=0;actor.exitMotion=state.events?.some(e=>e.sourceId===actor.unit.id&&e.enemy===actor.enemy&&e.type==='tower')?'victory':'defeat';}
  for(const event of state.events??[]){if(seenEvents.has(event.id))continue;seenEvents.add(event.id);if(event.type!=='defeat'){const effect=createAbilityEffect(event);effects.push(effect);scene.add(effect.group);}}
  while(seenEvents.size>250)seenEvents.delete(seenEvents.values().next().value!);
  canvas.dataset.units=String(live.size);canvas.dataset.effects=String(effects.length);
  for(const mesh of zoneMeshes){mesh.visible=Boolean(state.placement);mesh.material.color.set(state.placement?.blocked.includes(mesh.userData.zoneId)?0xf1746d:state.placement?.zoneId===mesh.userData.zoneId?0xffd77c:0x5bffcc);mesh.material.opacity=state.placement?.zoneId===mesh.userData.zoneId ? .65 : .25;}
  const placement=state.placement;
  if(!placement||previewId!==placement.unit.cardId){if(preview){scene.remove(preview.group);preview.dispose();preview=undefined;}previewId='';}
  if(placement){if(!preview){const spec=manifest.characters?.[placement.unit.cardId]??manifest.characters?.default;preview=createCharacter('#ffe18c',placement.unit.kind,spec?assets.get(spec.url):undefined,spec,placement.unit.cardId);previewId=placement.unit.cardId;scene.add(preview.group);}const zone=SPAWN_ZONES.find(z=>z.id===placement.zoneId)!;preview.group.position.copy(arenaPosition(zone.progress,false,zone.lane));preview.group.rotation.y=Math.PI/2;preview.play('idle');}
  canvas.dataset.previewCard=previewId;canvas.dataset.previewZone=placement?.zoneId??'';
 }

 const clock=new T.Clock();let frame=0;
 function render(){
  if(disposed)return;frame=requestAnimationFrame(render);const dt=Math.min(clock.getDelta(),.05);
  if(document.hidden)return;
  if(ready){synchronize();for(const actor of actors.values()){
   const {visual,unit,enemy,lane}=actor;
   actor.health.scale.x=Math.max(.01,(unit.hp??1)/(unit.maxHp??1));actor.health.quaternion.copy(camera.quaternion);actor.health.quaternion.premultiply(visual.group.quaternion.clone().invert());
   if(actor.exitAge!==undefined){actor.exitAge+=state.paused&&!state.outcome?0:dt;visual.play(actor.exitMotion??'defeat');visual.mixer.update(state.paused&&!state.outcome?0:dt);if(actor.exitAge>1.1){scene.remove(visual.group);visual.dispose();actor.health.geometry.dispose();(actor.health.material as T.Material).dispose();actors.delete(`${enemy?'e':'a'}${unit.id}`);}continue;}
   if(state.outcome){visual.play((state.outcome==='victory')!==enemy?'victory':'defeat');visual.mixer.update(dt);continue;}
   const target=arenaPosition(unit.progress,enemy,lane);const distance=visual.group.position.distanceTo(target);
   if(!state.paused){actor.age+=dt;const next=visual.group.position.clone().lerp(target,1-Math.exp(-8*dt));moveWithCollisions(visual.group.position,next,world.obstacles);}
   actor.attackFor=Math.max(0,actor.attackFor-(state.paused?0:dt));
   const motion=state.paused?'idle':actor.attackFor>0?'attack':actor.age<.65?'jump':distance>.7?'run':distance>.025?'walk':'idle';
   visual.play(motion);visual.mixer.update(state.paused?0:dt);
  }}
  preview?.mixer.update(dt);
  for(let i=effects.length-1;i>=0;i--)if(!effects[i].update(state.paused&&!state.outcome?0:dt)){scene.remove(effects[i].group);effects[i].dispose();effects.splice(i,1);}
  const dx=(Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft')))*dt*6;
  const dz=(Number(keys.has('s')||keys.has('ArrowDown'))-Number(keys.has('w')||keys.has('ArrowUp')))*dt*6;
  const old=controls.target.clone();controls.target.x=T.MathUtils.clamp(controls.target.x+dx,-8,8);controls.target.z=T.MathUtils.clamp(controls.target.z+dz,-4,4);camera.position.add(controls.target.clone().sub(old));controls.update();renderer.render(scene,camera);
  canvas.dataset.frames=String(Number(canvas.dataset.frames??0)+1);
 }
 render();
 return {setState(next){state=next;},resetCamera,dispose(){disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();canvas.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);canvas.removeEventListener('blur',blur);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);actors.forEach(a=>{a.visual.dispose();a.health.geometry.dispose();(a.health.material as T.Material).dispose();});preview?.dispose();zoneMeshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});effects.forEach(e=>e.dispose());disposeObject(world.root);assets.forEach(a=>disposeObject(a.scene));sun.shadow.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
