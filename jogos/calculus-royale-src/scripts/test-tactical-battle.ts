import assert from 'node:assert/strict';
import { createTowers, stepTacticalBattle, battleResult, crowns, validPlacement, chooseAI, combatRole, FIELD } from '../client/src/game/tacticalBattle.ts';
import { type CombatUnit } from '../client/src/game/combat.ts';
import { getCumulativeCards } from '../client/src/data/cardCatalog.ts';
const unit=(id:number,overrides:Partial<CombatUnit>={}):CombatUnit=>({id,cardId:'slope',icon:'',name:'Arqueira',kind:'tropa',progress:70,power:14,color:'#fff',lane:-1.65,hp:100,maxHp:100,...overrides});
const towers=createTowers(96);
let tick=stepTacticalBattle([unit(1)],[],towers,.1,1);
assert(tick.allies[0].hp!<100,'torre lateral ataca dentro do alcance');
assert.equal(tick.towers.find(t=>t.id==='enemy:0')?.targetId,1);
const cooled=stepTacticalBattle(tick.allies,[],tick.towers,.1,1.1);assert.equal(cooled.allies[0].hp,tick.allies[0].hp,'cadência impede ataque por frame');
const distant=stepTacticalBattle([unit(1,{progress:20})],[],towers,.1,1);assert.equal(distant.allies[0].hp,100,'fora de alcance');
tick=stepTacticalBattle([unit(2,{progress:65}),unit(1,{progress:70})],[],towers,.1,1);assert.equal(tick.towers.find(t=>t.id==='enemy:0')?.targetId,1,'alvo mais próximo');
const king=towers.find(t=>t.id==='enemy:king')!;assert.equal(king.active,false);
let damaged=towers.map(t=>t.id===king.id?{...t,hp:t.hp-1}:t);
assert.equal(stepTacticalBattle([],[],damaged,.1,1).towers.find(t=>t.id===king.id)?.active,true);
damaged=towers.map(t=>t.id==='enemy:0'?{...t,hp:0}:t);
assert.equal(stepTacticalBattle([],[],damaged,.1,1).towers.find(t=>t.id===king.id)?.active,true);
assert.equal(crowns(damaged,false),1);assert.equal(battleResult(damaged,180),'victory');
assert.equal(battleResult(damaged,10),null);assert.equal(battleResult(damaged,181,true),'victory');
assert.equal(battleResult(towers,180),null,'empate inicia morte súbita');
assert.equal(battleResult(towers,240),'draw');
assert.equal(battleResult(towers.map(t=>t.id==='enemy:king'?{...t,hp:0}:t),1),'victory');
assert.equal(battleResult(towers.map(t=>t.role==='king'?{...t,hp:0}:t),1),'draw');
assert.equal(battleResult(towers.map(t=>t.id==='enemy:0'?{...t,hp:t.hp-10}:t),240),'victory');

assert(validPlacement('tropa',{progress:20,lane:1.5}));
assert(!validPlacement('tropa',{progress:70,lane:1.5}));
assert(!validPlacement('estrutura',{progress:50,lane:0}));
assert(validPlacement('feitiço',{progress:70,lane:-1.5}));
assert(!validPlacement('tropa',{progress:20,lane:1.5},[unit(1,{progress:20,lane:1.5})]));
assert(!validPlacement('feitiço',{progress:NaN,lane:0}));
assert(!validPlacement('tropa',{progress:20,lane:4}));

const spell=unit(1,{kind:'feitiço',cardId:'euler',progress:50}),target=unit(2,{progress:50});
tick=stepTacticalBattle([spell],[target],towers,.1,1);assert.equal(tick.allies.length,0);assert(tick.enemies[0].hp!<100);assert(tick.enemies[0].burn!>0);
assert.equal(stepTacticalBattle(tick.allies,tick.enemies,tick.towers,.1,1.1).events.filter(e=>e.cardId==='euler').length,0,'feitiço não repete');
tick=stepTacticalBattle([unit(1,{kind:'estrutura',cardId:'limit',progress:15})],[],towers,.1,1);assert.equal(tick.allies[0].progress,15);
assert.equal(stepTacticalBattle(tick.allies,[],towers,24,25).allies.length,0,'estrutura expira');
tick=stepTacticalBattle([unit(1,{kind:'relíquia',cardId:'mirror',progress:15}),unit(2,{progress:20})],[],towers,.1,1);
assert.equal(tick.allies[0].progress,15);assert(tick.allies[1].reflect!>0,'relíquia concede aura');
assert.equal(stepTacticalBattle([tick.allies[0]],[],towers,18,20).allies.length,0);
const ranged=stepTacticalBattle([unit(1,{progress:44})],[unit(2,{progress:44,cooldown:10})],towers,.1,1);assert(ranged.events.some(e=>e.sourceId===1&&e.type==='ability'),'arqueira ataca antes do contato');
const catalog=getCumulativeCards(4);assert.equal(catalog.length,45);
for(const card of catalog){
 const input=unit(1,{cardId:card.id,kind:card.kind,progress:50,power:card.power,hp:70});
 const result=stepTacticalBattle([input,unit(3,{progress:50,hp:30})],[unit(2,{progress:50,cooldown:10})],towers,.1,1);
 if(card.kind==='feitiço')assert(!result.allies.some(u=>u.id===1),`${card.id}: não caminha nem persiste`);
 else if(card.kind==='estrutura'||card.kind==='relíquia')assert.equal(result.allies.find(u=>u.id===1)?.progress,50,`${card.id}: posição fixa`);
 assert([...result.allies,...result.enemies].every(u=>Number.isFinite(u.hp)&&u.hp!>0&&u.hp!<=u.maxHp!),`${card.id}: HP válido`);
 assert(result.events.some(e=>e.cardId===card.id)||result.allies.some(u=>(u.hasteTime??0)>0),`${card.id}: habilidade ou aura real`);
}

let traveling=[unit(1,{progress:35,lane:3})];
for(let i=0;i<140;i++){
 const next=stepTacticalBattle(traveling,[],towers,.1,i/10);traveling=next.allies;
 for(const u of traveling){const x=-9+u.progress*.18;if(Math.abs(x)<FIELD.riverHalfWidth)assert(FIELD.bridgeLanes.some(z=>Math.abs(z-u.lane!)<=FIELD.bridgeHalfWidth),'cruza somente pelas pontes');}
}
const ai=chooseAI([{cardId:'euler',kind:'feitiço',power:28,cost:5},{cardId:'limit',kind:'estrutura',power:18,cost:4}],5,[unit(1,{progress:80}),unit(2,{progress:80})],[],towers);
assert(ai);assert.equal(ai.card.kind,'feitiço');assert(validPlacement(ai.card.kind,ai.point));assert.equal(chooseAI([{cardId:'slope',kind:'tropa',power:14,cost:3}],2,[],[],towers),null);
console.log('PASS: alcance, cadência, alvo, ativação do Rei, coroas, morte súbita, desempate, colocação, feitiços, estruturas, relíquias, pontes e IA.');
