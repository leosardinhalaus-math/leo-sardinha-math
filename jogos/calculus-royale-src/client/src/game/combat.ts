import { getCardProfile } from './cardProfiles.ts';
export type CombatUnit={id:number;cardId:string;icon:string;name:string;kind:'tropa'|'feitiço'|'estrutura'|'relíquia';progress:number;power:number;color:string;lane?:number;hp?:number;maxHp?:number;shield?:number;cooldown?:number;slow?:number;slowTime?:number;burn?:number;burnTime?:number;haste?:number;hasteTime?:number;reflect?:number;reflectTime?:number;lastAttack?:number};
export type CombatEvent={id:string;sourceId:number;cardId:string;enemy:boolean;x:number;z:number;label:string;type:'ability'|'defeat'|'tower'};
export const SPAWN_ZONES=[-1.65,1.65].flatMap((lane,row)=>[5,14,23].map((progress,col)=>({id:`${row?'B':'A'}${col+1}`,lane,progress,label:`${row?'Inferior':'Superior'} · ${['base','meio','frente'][col]}`})));
export const unitX=(unit:Pick<CombatUnit,'progress'>,enemy:boolean)=>(enemy?1:-1)*(9-unit.progress*.18);
export function zoneAvailable(id:string,units:CombatUnit[]){const zone=SPAWN_ZONES.find(z=>z.id===id);return Boolean(zone&&!units.some(u=>Math.abs((u.lane??1.65)-zone.lane)<1&&Math.abs(u.progress-zone.progress)<7));}
function normalize(u:CombatUnit,enemy:boolean):CombatUnit{return {...u,lane:u.lane??(enemy?-1.65:1.65),maxHp:u.maxHp??(20+u.power*2),hp:u.hp??(20+u.power*2),shield:u.shield??0,cooldown:u.cooldown??0};}

// Simulação independente do canvas: os efeitos continuam corretos sem WebGL.
export function stepCombat(allies:CombatUnit[],enemies:CombatUnit[],dt:number,time:number,worldIndex=0){
 const a=allies.map(u=>normalize(u,false)),b=enemies.map(u=>normalize(u,true));const events:CombatEvent[]=[];let allyDamage=0,enemyDamage=0;
 function emit(u:CombatUnit,enemy:boolean,label:string,type:CombatEvent['type']='ability'){events.push({id:`${time.toFixed(3)}:${enemy}:${u.id}:${events.length}`,sourceId:u.id,cardId:u.cardId,enemy,x:unitX(u,enemy),z:u.lane!,label,type});}
 for(const team of [a,b])for(const u of team){
  u.cooldown=Math.max(0,u.cooldown!-dt);
  if((u.burnTime??0)>0)u.hp=Math.max(0,u.hp!-(u.burn??0)*Math.min(dt,u.burnTime!));
  for(const key of ['slowTime','burnTime','hasteTime','reflectTime'] as const)u[key]=Math.max(0,(u[key]??0)-dt);
 }
 function hurt(target:CombatUnit,damage:number,pierce=false){const absorb=pierce?0:Math.min(target.shield!,damage);target.shield!-=absorb;const actual=Math.min(target.hp!,Math.max(0,damage-absorb));target.hp!-=actual;return {actual,absorb};}
 function attack(u:CombatUnit,target:CombatUnit,enemy:boolean){
  const p=getCardProfile(u.cardId);const team=enemy?b:a,opponents=enemy?a:b;const base=Math.max(2,Math.round(u.power*p.factor));
  let detail='';const strikes=p.kind==='double'?2:1;let damage=0,absorbed=0;
  for(let hit=0;hit<strikes;hit++){const result=hurt(target,base,p.kind==='pierce');damage+=result.actual;absorbed+=result.absorb;}
  detail=`−${Math.round(damage)} HP${absorbed?` · ${Math.round(absorbed)} bloqueado`:''}`;
  if((target.reflectTime??0)>0){const reflected=hurt(u,Math.round(damage*(target.reflect??0)));detail+=` · retorno −${Math.round(reflected.actual)} HP`;}
  if(p.kind==='shield'){const previous=u.shield!;u.shield=Math.min(u.maxHp!,u.shield!+p.amount);detail+=` · escudo +${Math.round(u.shield-previous)}`;}
  if(p.kind==='heal'){const patient=team.filter(v=>v.hp!>0&&Math.abs(unitX(v,enemy)-unitX(u,enemy))<4).sort((x,y)=>(y.maxHp!-y.hp!)-(x.maxHp!-x.hp!))[0]??u;const healed=Math.min(p.amount,patient.maxHp!-patient.hp!);patient.hp!+=healed;detail+=` · ${patient.name} +${Math.round(healed)} HP`;}
  if(p.kind==='slow'){target.slow=p.amount;target.slowTime=p.duration;detail+=` · lentidão ${Math.round(p.amount*100)}%/${p.duration}s`;}
  if(p.kind==='burn'){target.burn=p.amount;target.burnTime=p.duration;detail+=` · fluxo −${p.amount} HP/s por ${p.duration}s`;}
  if(p.kind==='haste'){for(const friend of team)if(Math.abs(unitX(friend,enemy)-unitX(u,enemy))<4){friend.haste=p.amount;friend.hasteTime=p.duration;}detail+=` · velocidade +${Math.round(p.amount*100)}%/${p.duration}s`;}
  if(p.kind==='reflect'){u.reflect=p.amount;u.reflectTime=p.duration;detail+=` · reflexão ${Math.round(p.amount*100)}%/${p.duration}s`;}
  if(p.kind==='chain'){let count=1;for(const other of opponents){if(other===target||other.hp!<=0||count>=p.amount||Math.hypot(unitX(other,!enemy)-unitX(target,!enemy),other.lane!-target.lane!)>4)continue;hurt(other,Math.round(base*.6));count++;}detail+=` · ${count} alvo(s)`;}
  u.cooldown=1.2;u.lastAttack=time;emit(u,enemy,`${p.ability}: ${detail}`);
 }
 for(const [team,opponents,enemy] of [[a,b,false],[b,a,true]] as const)for(const u of team){
  if(u.hp!<=0)continue;
  const x=unitX(u,enemy);const target=opponents.filter(v=>v.hp!>0&&Math.abs(v.lane!-u.lane!)<.7&&Math.abs(unitX(v,!enemy)-x)<=1.12).sort((v,w)=>Math.abs(unitX(v,!enemy)-x)-Math.abs(unitX(w,!enemy)-x))[0];
  if(target){if(u.cooldown!<=0)attack(u,target,enemy);continue;}
  const speed=(enemy?5:7+(worldIndex===2?2:0))*(1+((u.hasteTime??0)>0?u.haste??0:0))*(1-((u.slowTime??0)>0?u.slow??0:0));
  // Pequenos passos + parada na borda da caixa do rival impedem atravessamento.
  let next=u.progress+speed*dt;
  const direction=enemy?-1:1;
  for(const v of opponents)if(v.hp!>0&&Math.abs(v.lane!-u.lane!)<.7){const gap=(unitX(v,!enemy)-x)*direction;if(gap>0)next=Math.min(next,u.progress+Math.max(0,gap-1)/.18);}
  u.progress=next;
  if(u.progress>=96){if(enemy)allyDamage+=u.power;else enemyDamage+=u.power;u.hp=0;emit(u,enemy,`${getCardProfile(u.cardId).ability}: torre −${u.power} HP`,'tower');}
 }
 for(const [team,enemy] of [[a,false],[b,true]] as const)for(const u of team)if(u.hp!<=0&&!events.some(e=>e.sourceId===u.id&&e.enemy===enemy&&e.type==='tower'))emit(u,enemy,`${u.name} derrotado`,'defeat');
 return {allies:a.filter(u=>u.hp!>0),enemies:b.filter(u=>u.hp!>0),events,allyDamage,enemyDamage};
}
