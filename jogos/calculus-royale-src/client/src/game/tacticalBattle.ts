import { getCardProfile } from './cardProfiles.ts';
import { unitX, type CombatUnit, type CombatEvent } from './combat.ts';
import { REGULATION_SECONDS, OVERTIME_SECONDS, type MatchOutcome } from './battleRules.ts';

export type Tower = {id:string; enemy:boolean; role:'side'|'king'; lane:number; x:number; hp:number; maxHp:number; active:boolean; cooldown:number; range:number; damage:number; cadence:number; targetId?:number};
export type Placement = {progress:number; lane:number};
export const FIELD = {minLane:-3,maxLane:3,riverHalfWidth:1.1,bridgeLanes:[-1.65,1.65],bridgeHalfWidth:.55,deployMin:3,deployMax:42,spellMax:96,grid:.5};
export const TOWER_RULES = {range:4.4,cadence:1.2,damage:3,kingRange:4.8,kingHpFactor:1.4};
export type CombatRole='tank'|'melee'|'ranged'|'area'|'spell'|'building'|'support';
export function combatRole(unit:Pick<CombatUnit,'cardId'|'kind'>):CombatRole{
 if(unit.kind==='feitiço')return 'spell';if(unit.kind==='estrutura')return 'building';if(unit.kind==='relíquia')return 'support';
 const p=getCardProfile(unit.cardId);
 if(['guardian','golem','titan'].includes(p.archetype))return 'tank';
 if(p.kind==='chain'||p.kind==='burn')return 'area';
 if(['archer','mage','priest','engineer','angel'].includes(p.archetype))return 'ranged';
 return 'melee';
}
export function combatDescription(unit:Pick<CombatUnit,'cardId'|'kind'>){
 const descriptions:Record<CombatRole,string>={tank:'Tanque: muita vida, combate próximo.',melee:'Tropa: avança pela ponte e ataca de perto.',ranged:'Distância: ataca antes do contato.',area:'Área: pressiona alvos próximos.',spell:'Feitiço: efeito imediato na área marcada; pode atingir o lado rival.',building:'Estrutura: defesa imóvel, atrai tropas, dura 24 s.',support:'Relíquia: aura imóvel de suporte, dura 18 s.'};
 return descriptions[combatRole(unit)];
}
export function createTowers(enemyHp:number,enemyMultiplier=1):Tower[]{
 return [false,true].flatMap(enemy=>[-1.65,1.65,0].map((lane,i)=>{
  const king=i===2,maxHp=Math.round((enemy?enemyHp:96)*(king?TOWER_RULES.kingHpFactor:1));
  return {id:`${enemy?'enemy':'ally'}:${king?'king':i}`,enemy,role:king?'king' as const:'side' as const,lane,x:(enemy?1:-1)*(king?9.3:7.8),hp:maxHp,maxHp,active:!king,cooldown:0,range:king?TOWER_RULES.kingRange:TOWER_RULES.range,damage:TOWER_RULES.damage*(enemy?enemyMultiplier:1),cadence:TOWER_RULES.cadence};
 }));
}
export function crowns(towers:Tower[],enemy:boolean){
 const destroyed=towers.filter(t=>t.enemy!==enemy&&t.hp<=0);
 return destroyed.some(t=>t.role==='king')?3:destroyed.length;
}
export function battleResult(towers:Tower[],elapsed:number,suddenDeath=false):MatchOutcome|null{
 const allyKing=towers.find(t=>!t.enemy&&t.role==='king')!,enemyKing=towers.find(t=>t.enemy&&t.role==='king')!;
 if(allyKing.hp<=0||enemyKing.hp<=0)return allyKing.hp<=0&&enemyKing.hp<=0?'draw':enemyKing.hp<=0?'victory':'defeat';
 const score=crowns(towers,false)-crowns(towers,true);
 if(elapsed>=REGULATION_SECONDS||suddenDeath){if(score!==0)return score>0?'victory':'defeat';}
 // Coroas empatadas dão morte súbita; ao seu fim compara-se a fração total de vida.
 if(elapsed>=REGULATION_SECONDS+OVERTIME_SECONDS){
  const fraction=(enemy:boolean)=>towers.filter(t=>t.enemy===enemy).reduce((sum,t)=>sum+t.hp/t.maxHp,0);
  const diff=fraction(false)-fraction(true);return Math.abs(diff)<.005?'draw':diff>0?'victory':'defeat';
 }
 return null;
}
export function snapPlacement(point:Placement):Placement{
 return {progress:Math.round(point.progress/2.5)*2.5,lane:Math.round(point.lane/FIELD.grid)*FIELD.grid};
}
export function validPlacement(kind:CombatUnit['kind'],point:Placement,units:CombatUnit[]=[]){
 if(!Number.isFinite(point.progress)||!Number.isFinite(point.lane)||point.lane<FIELD.minLane||point.lane>FIELD.maxLane)return false;
 if(point.progress<FIELD.deployMin||point.progress>(kind==='feitiço'?FIELD.spellMax:FIELD.deployMax))return false;
 const x=-9+point.progress*.18;
 if(kind!=='feitiço'&&Math.abs(x)<FIELD.riverHalfWidth)return false;
 return kind==='feitiço'||!units.some(u=>u.kind!=='feitiço'&&Math.hypot((u.progress-point.progress)*.18,(u.lane??0)-point.lane)<.65);
}
const distance=(a:{x:number;lane:number},b:{x:number;lane:number})=>Math.hypot(a.x-b.x,a.lane-b.lane);
const position=(u:CombatUnit,enemy:boolean)=>({x:unitX(u,enemy),lane:u.lane??1.65});
const range=(u:CombatUnit)=>['ranged','area','building'].includes(combatRole(u))?3:1.12;
function normalize(u:CombatUnit):CombatUnit{
 const role=combatRole(u),maxHp=u.maxHp??Math.round((20+2*u.power)*(role==='tank'?1.6:1));
 return {...u,lane:u.lane??1.65,maxHp,hp:u.hp??maxHp,shield:u.shield??0,cooldown:u.cooldown??0,lifetime:u.lifetime??(role==='building'?24:role==='support'?18:Infinity)};
}

/** Tick determinístico. Feitiços resolvem uma vez; o restante mantém HP/cadência. */
export function stepTacticalBattle(allies:CombatUnit[],enemies:CombatUnit[],inputTowers:Tower[],dt:number,time:number){
 const a=allies.map(normalize),b=enemies.map(normalize),towers=inputTowers.map(t=>({...t})),events:CombatEvent[]=[];
 function emit(u:CombatUnit,enemy:boolean,label:string,type:CombatEvent['type']='ability',target?:{x:number;lane:number}){
  events.push({id:`${time.toFixed(3)}:${enemy}:${u.id}:${events.length}`,sourceId:u.id,cardId:u.cardId,enemy,x:position(u,enemy).x,z:u.lane!,label,type,targetX:target?.x,targetZ:target?.lane});
 }
 function hurt(u:CombatUnit,amount:number,pierce=false){
  const absorbed=pierce?0:Math.min(u.shield!,amount);u.shield!-=absorbed;
  const damage=Math.min(u.hp!,Math.max(0,amount-absorbed));u.hp!-=damage;return damage;
 }
 function support(u:CombatUnit,team:CombatUnit[],enemy:boolean){
  const profile=getCardProfile(u.cardId),friends=team.filter(v=>v!==u&&v.hp!>0&&distance(position(v,enemy),position(u,enemy))<=3.5);
  for(const v of friends){
   if(profile.kind==='heal')v.hp=Math.min(v.maxHp!,v.hp!+profile.amount);
   else if(profile.kind==='haste'){v.haste=profile.amount;v.hasteTime=profile.duration;}
   else if(profile.kind==='reflect'){v.reflect=profile.amount;v.reflectTime=profile.duration;}
   else v.shield=Math.min(v.maxHp!,v.shield!+Math.max(2,profile.amount||u.power*.2));
  }
  u.cooldown=1.2;u.lastAttack=time;emit(u,enemy,`${profile.ability}: aura · ${friends.length} aliado(s)`);
 }
 function attack(u:CombatUnit,target:CombatUnit,team:CombatUnit[],opponents:CombatUnit[],enemy:boolean){
  const p=getCardProfile(u.cardId),base=Math.max(2,u.power*p.factor),damage=hurt(target,base*(p.kind==='double'?2:1),p.kind==='pierce');
  if((target.reflectTime??0)>0)hurt(u,damage*(target.reflect??0));
  if(p.kind==='shield')u.shield=Math.min(u.maxHp!,u.shield!+p.amount);
  if(p.kind==='heal'){
   const patient=team.filter(v=>v.hp!>0&&distance(position(v,enemy),position(u,enemy))<4).sort((v,w)=>(w.maxHp!-w.hp!)-(v.maxHp!-v.hp!))[0]??u;
   patient.hp=Math.min(patient.maxHp!,patient.hp!+p.amount);
  }
  if(p.kind==='slow'){target.slow=p.amount;target.slowTime=p.duration;}
  if(p.kind==='burn'){target.burn=p.amount;target.burnTime=p.duration;}
  if(p.kind==='haste')for(const friend of team)if(distance(position(friend,enemy),position(u,enemy))<4){friend.haste=p.amount;friend.hasteTime=p.duration;}
  if(p.kind==='reflect'){u.reflect=p.amount;u.reflectTime=p.duration;}
  if(p.kind==='chain'){
   const others=opponents.filter(v=>v!==target&&v.hp!>0&&distance(position(v,!enemy),position(target,!enemy))<3).sort((v,w)=>v.id-w.id).slice(0,Math.max(0,p.amount-1));
   others.forEach(v=>hurt(v,base*.6));
  }
  u.cooldown=1.2;u.lastAttack=time;emit(u,enemy,`${p.ability}: −${Math.round(damage)} HP`, 'ability',position(target,!enemy));
 }
 for(const team of [a,b])for(const u of team){
  u.cooldown=Math.max(0,u.cooldown!-dt);
  if((u.burnTime??0)>0)hurt(u,(u.burn??0)*Math.min(dt,u.burnTime!),true);
  for(const key of ['slowTime','burnTime','hasteTime','reflectTime'] as const)u[key]=Math.max(0,(u[key]??0)-dt);
  if(u.kind==='estrutura'||u.kind==='relíquia'){u.lifetime!-=dt;if(u.lifetime!<=0)u.hp=0;}
 }
 // Both sides' spells resolve before towers and movement, with explicit target geometry.
 for(const [team,opponents,enemy] of [[a,b,false],[b,a,true]] as const)for(const u of team){
  if(u.hp!<=0||u.kind!=='feitiço')continue;
  const p=getCardProfile(u.cardId),targets=opponents.filter(v=>v.hp!>0&&distance(position(u,enemy),position(v,!enemy))<=2.2);
  targets.forEach(target=>attack(u,target,team,[],enemy));
  for(const tower of towers)if(tower.enemy!==enemy&&tower.hp>0&&distance(position(u,enemy),tower)<2.2){
   const damage=u.power*p.factor*.35;tower.hp=Math.max(0,tower.hp-damage);emit(u,enemy,`${p.ability}: torre −${Math.round(damage)} HP`,'tower',tower);
  }
  if(['heal','haste','shield','reflect'].includes(p.kind))support(u,team,enemy);
  emit(u,enemy,`${p.ability}: feitiço resolvido · ${targets.length} alvo(s)`);u.hp=0;
 }
 for(const tower of towers){
  tower.cooldown=Math.max(0,tower.cooldown-dt);
  if(tower.role==='king'&&(tower.hp<tower.maxHp||towers.some(t=>t.enemy===tower.enemy&&t.role==='side'&&t.hp<=0)))tower.active=true;
  if(!tower.active||tower.hp<=0)continue;
  const targets=(tower.enemy?a:b).filter(u=>u.hp!>0&&u.kind!=='feitiço'&&distance(position(u,!tower.enemy),tower)<=tower.range).sort((u,v)=>distance(position(u,!tower.enemy),tower)-distance(position(v,!tower.enemy),tower)||u.id-v.id);
  tower.targetId=targets[0]?.id;
  if(targets[0]&&tower.cooldown<=0){
   hurt(targets[0],tower.damage);tower.cooldown=tower.cadence;
   const point=position(targets[0],!tower.enemy);
   events.push({id:`${time}:${tower.id}`,sourceId:-1,cardId:'slope',enemy:tower.enemy,x:tower.x,z:tower.lane,targetX:point.x,targetZ:point.lane,label:`${tower.role==='king'?'Rei':'Torre lateral'} → ${targets[0].name}: −${Math.round(tower.damage)} HP`,type:'tower'});
  }
 }
 for(const [team,opponents,enemy] of [[a,b,false],[b,a,true]] as const)for(const u of team){
  if(u.hp!<=0)continue;
  if(u.kind==='relíquia'){
   if(u.cooldown!<=0){
    const profile=getCardProfile(u.cardId);
    if(['heal','haste','shield','reflect'].includes(profile.kind))support(u,team,enemy);
    else {
     const target=opponents.filter(v=>v.hp!>0&&distance(position(v,!enemy),position(u,enemy))<=3.5).sort((v,w)=>distance(position(v,!enemy),position(u,enemy))-distance(position(w,!enemy),position(u,enemy)))[0];
     if(target)attack(u,target,team,opponents,enemy);
     // Chain relics also amplify nearby compositions with a modest timed haste.
     if(profile.kind==='chain')for(const friend of team)if(friend!==u&&distance(position(friend,enemy),position(u,enemy))<=3.5){friend.haste=.2;friend.hasteTime=profile.duration;}
    }
   }continue;
  }
  const point=position(u,enemy);
  // Structures in the lane pull advancing troops; otherwise choose the nearest legal target.
  const targets=opponents.filter(v=>v.hp!>0&&Math.abs(v.lane!-u.lane!)<1.1&&distance(position(v,!enemy),point)<=range(u));
  targets.sort((v,w)=>(v.kind==='estrutura'?-1:0)-(w.kind==='estrutura'?-1:0)||distance(position(v,!enemy),point)-distance(position(w,!enemy),point)||v.id-w.id);
  if(targets[0]){if(u.cooldown!<=0)attack(u,targets[0],team,opponents,enemy);continue;}
  if(u.kind==='estrutura')continue;
  const enemyTowers=towers.filter(t=>t.enemy!==enemy&&t.hp>0);
  const laneTower=enemyTowers.find(t=>t.role==='side'&&Math.sign(t.lane)===Math.sign(u.lane!))??enemyTowers.find(t=>t.role==='king');
  if(!laneTower)continue;
  if(distance(point,laneTower)<=range(u)){
   if(u.cooldown!<=0){const damage=Math.max(2,u.power*getCardProfile(u.cardId).factor);laneTower.hp=Math.max(0,laneTower.hp-damage);u.cooldown=1.2;u.lastAttack=time;emit(u,enemy,`${u.name}: torre −${Math.round(damage)} HP`,'tower',laneTower);}continue;
  }
  const speed=(combatRole(u)==='tank'?5:7)*(1+((u.hasteTime??0)>0?u.haste??0:0))*(1-((u.slowTime??0)>0?u.slow??0:0));
  let travel=speed*.18*dt;
  const direction=enemy?-1:1,bridge=FIELD.bridgeLanes.reduce((best,z)=>Math.abs(z-u.lane!)<Math.abs(best-u.lane!)?z:best);
  // Before reaching the river, align with a bridge; no crossing through open water.
  const approaching=point.x*direction<0&&Math.abs(point.x)<=FIELD.riverHalfWidth+1;
  const targetLane=approaching||Math.abs(point.x)<FIELD.riverHalfWidth?bridge:point.x*direction>2?laneTower.lane:u.lane!;
  const laneStep=Math.min(Math.abs(targetLane-u.lane!),travel);u.lane!+=Math.sign(targetLane-u.lane!)*laneStep;
  if(approaching&&Math.abs(u.lane!-bridge)>FIELD.bridgeHalfWidth&&Math.abs(point.x)<=FIELD.riverHalfWidth+.1)travel=0;
  for(const v of opponents)if(v.hp!>0&&Math.abs(v.lane!-u.lane!)<.7){const gap=(position(v,!enemy).x-point.x)*direction;if(gap>0)travel=Math.min(travel,Math.max(0,gap-1));}
  u.progress=Math.min(101,u.progress+travel/.18);
 }
 for(const [team,enemy] of [[a,false],[b,true]] as const)for(const u of team)if(u.hp!<=0&&u.kind!=='feitiço')emit(u,enemy,`${u.name} derrotado`,'defeat');
 return {allies:a.filter(u=>u.hp!>0),enemies:b.filter(u=>u.hp!>0),towers,events};
}

export type AICard=Pick<CombatUnit,'cardId'|'kind'|'power'> & {cost:number};
/** Score threats, area trades and counterattacks; deterministic variation by stage. */
export function chooseAI(cards:AICard[],elixir:number,opponents:CombatUnit[],friends:CombatUnit[],towers:Tower[],style=0){
 const threats=opponents.filter(u=>u.hp===undefined||u.hp>0).sort((u,v)=>v.progress-u.progress);
 const threat=threats[0],lane=threat?.lane??(style%2?-1.65:1.65);
 const clustered=threats.filter(u=>Math.abs((u.lane??0)-lane)<1.2).length;
 const underPressure=Boolean(threat&&threat.progress>60);
 const weakest=towers.filter(t=>!t.enemy&&t.role==='side'&&t.hp>0).sort((u,v)=>u.hp/u.maxHp-v.hp/v.maxHp)[0];
 const chosen=cards.map((card,index)=>({card,index,score:card.power/card.cost+(card.kind==='feitiço'?clustered*2:0)+(underPressure&&card.kind==='estrutura'?5:0)+(friends.length&&card.kind==='relíquia'?3:0)+(style%3===1&&combatRole(card)==='tank'?2:0)+(style%3===2&&combatRole(card)==='ranged'?2:0)-index*.05})).filter(c=>c.card.cost<=elixir).sort((u,v)=>v.score-u.score)[0];
 if(!chosen)return null;
 const point=chosen.card.kind==='feitiço'&&threat?{progress:Math.max(5,Math.min(95,100-threat.progress)),lane:threat.lane??lane}:{progress:underPressure?28:12,lane:underPressure?lane:weakest?.lane??lane};
 const preferred=snapPlacement(point);
 const legal=validPlacement(chosen.card.kind,preferred,friends)?preferred:[28,20,12.5,5].flatMap(progress=>[point.lane,point.lane<0?-2.5:2.5,-point.lane].map(lane=>snapPlacement({progress,lane}))).find(candidate=>validPlacement(chosen.card.kind,candidate,friends));
 return legal?{...chosen,point:legal}:null;
}
