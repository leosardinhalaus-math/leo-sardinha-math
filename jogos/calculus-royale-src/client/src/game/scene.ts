import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { createCharacter, disposeObject, type ModelSpec } from './characters';
import { arenaPosition, moveWithCollisions } from './collisions';
import { createWorld } from './world';

export type ArenaUnit={id:number;cardId:string;name:string;kind:string;progress:number;color:string};
export type ArenaState={allies:ArenaUnit[];enemies:ArenaUnit[];paused:boolean};
type Manifest={characters?:Record<string,ModelSpec>;worlds?:Record<string,{url:string}>};
export type GameHandle={setState:(state:ArenaState)=>void;resetCamera:()=>void;dispose:()=>void};

export function createGameScene(canvas:HTMLCanvasElement,index:number,onReady:(warnings:number)=>void,onError:()=>void):GameHandle{
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
 const actors=new Map<string,{visual:ReturnType<typeof createCharacter>;unit:ArenaUnit;enemy:boolean;age:number;lane:number}>();
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
   if(!actor){const spec=manifest.characters?.[unit.cardId]??manifest.characters?.default;const visual=createCharacter(enemy?'#ff816f':unit.color,unit.kind,spec?assets.get(spec.url):undefined,spec);const lane=enemy?-1.65:1.65;visual.group.position.copy(arenaPosition(unit.progress,enemy,lane));visual.group.rotation.y=enemy?-Math.PI/2:Math.PI/2;scene.add(visual.group);actor={visual,unit,enemy,age:0,lane};actors.set(key,actor);}actor.unit=unit;
  }
  for(const [key,actor] of actors)if(!live.has(key)){scene.remove(actor.visual.group);actor.visual.dispose();actors.delete(key);}
  canvas.dataset.units=String(actors.size);
 }
 const clock=new T.Clock();let frame=0;
 function render(){
  if(disposed)return;frame=requestAnimationFrame(render);const dt=Math.min(clock.getDelta(),.05);
  if(document.hidden)return;
  if(ready){synchronize();for(const actor of actors.values()){
   const {visual,unit,enemy,lane}=actor;const target=arenaPosition(unit.progress,enemy,lane);const distance=visual.group.position.distanceTo(target);
   if(!state.paused){actor.age+=dt;const next=visual.group.position.clone().lerp(target,1-Math.exp(-8*dt));moveWithCollisions(visual.group.position,next,world.obstacles);}
   const motion=state.paused?'idle':actor.age<.65?'jump':unit.progress>=82?'attack':distance>.7?'run':distance>.025?'walk':'idle';
   visual.play(motion);visual.mixer.update(state.paused?0:dt);
  }}
  const dx=(Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft')))*dt*6;
  const dz=(Number(keys.has('s')||keys.has('ArrowDown'))-Number(keys.has('w')||keys.has('ArrowUp')))*dt*6;
  const old=controls.target.clone();controls.target.x=T.MathUtils.clamp(controls.target.x+dx,-8,8);controls.target.z=T.MathUtils.clamp(controls.target.z+dz,-4,4);camera.position.add(controls.target.clone().sub(old));controls.update();renderer.render(scene,camera);
  canvas.dataset.frames=String(Number(canvas.dataset.frames??0)+1);
 }
 render();
 return {setState(next){state=next;},resetCamera,dispose(){disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();canvas.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);canvas.removeEventListener('blur',blur);canvas.removeEventListener('webglcontextlost',lost);actors.forEach(a=>a.visual.dispose());disposeObject(world.root);assets.forEach(a=>disposeObject(a.scene));sun.shadow.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
