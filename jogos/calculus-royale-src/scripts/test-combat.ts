import assert from 'node:assert/strict';
import { CARD_PROFILES } from '../client/src/game/cardProfiles.ts';
import { stepCombat, SPAWN_ZONES, zoneAvailable, type CombatUnit } from '../client/src/game/combat.ts';
function unit(id:number,cardId='slope',overrides:Partial<CombatUnit>={}):CombatUnit{return {id,cardId,icon:'',name:cardId,kind:'tropa',progress:48,power:20,color:'#fff',lane:1.65,hp:100,maxHp:100,...overrides};}
assert.equal(Object.keys(CARD_PROFILES).length,45);
for(const id of Object.keys(CARD_PROFILES)){
 const result=stepCombat([unit(1,id,{hp:60})],[unit(2,'slope',{cooldown:10,shield:15})],.1,1);
 assert(result.events.some(e=>e.cardId===id&&e.label.includes(CARD_PROFILES[id].ability)),`${id} deve ativar a habilidade ao contato`);
 for(const u of [...result.allies,...result.enemies])assert(u.hp!>=0&&u.hp!<=u.maxHp!&&u.shield!>=0);
 const again=stepCombat(result.allies,result.enemies,.1,1.1);assert(!again.events.some(e=>e.sourceId===1&&e.type==='ability'),`${id}: não pode aplicar dano a cada frame`);
}
const separate=stepCombat([unit(1)],[unit(2,'power',{lane:-1.65})],.1,1);assert.equal(separate.events.length,0,'Faixas diferentes não colidem');
const pierced=stepCombat([unit(1)],[unit(2,'power',{shield:50,cooldown:10})],.1,1);assert(pierced.enemies[0].hp!<100);assert.equal(pierced.enemies[0].shield,50);
const healer=stepCombat([unit(1,'area',{hp:20})],[unit(2,'power',{cooldown:10})],.1,1);assert.equal(healer.allies[0].hp,29);
const shielded=stepCombat([unit(1,'limit')],[unit(2,'power',{cooldown:10})],.1,1);assert.equal(shielded.allies[0].shield,12);
const burned=stepCombat([unit(1,'euler')],[unit(2,'power',{cooldown:10})],.1,1);assert.equal(burned.enemies[0].burn,3);
const burnTick=stepCombat([],burned.enemies,.5,1.5);assert.equal(burnTick.enemies[0].hp,burned.enemies[0].hp!-1.5);
const lastBurn=stepCombat([],[unit(2,'power',{progress:0,burn:3,burnTime:.05})],.1,2);assert.equal(lastBurn.enemies[0].hp,99.85);assert.equal(lastBurn.enemies[0].burnTime,0);
const slowed=stepCombat([unit(1,'sine')],[unit(2,'power',{cooldown:10})],.1,1);assert.equal(slowed.enemies[0].slow,.45);
const expiry=stepCombat([],[unit(2,'power',{progress:0,slow:.45,slowTime:.05})],.1,2);assert.equal(expiry.enemies[0].slowTime,0);
const reflection=stepCombat([unit(1,'power')],[unit(2,'inverse',{reflect:.5,reflectTime:3,cooldown:10})],.1,1);assert(reflection.allies[0].hp!<100);
const killed=stepCombat([unit(1,'power')],[unit(2,'slope',{hp:1,cooldown:10})],.1,1);assert.equal(killed.enemies.length,0);assert(killed.events.some(e=>e.type==='defeat'));
const tower=stepCombat([unit(1,'slope',{progress:95.9})],[],.1,1);assert.equal(tower.enemyDamage,20);assert.equal(tower.allies.length,0);assert(tower.events.some(e=>e.type==='tower'));
const after=stepCombat(tower.allies,tower.enemies,.1,1.1);assert.equal(after.enemyDamage,0,'Torre recebe dano uma única vez');
assert.equal(SPAWN_ZONES.length,6);assert(!zoneAvailable('A1',[unit(1,'slope',{lane:-1.65,progress:5})]));assert(zoneAvailable('B1',[unit(1,'slope',{lane:-1.65,progress:5})]));assert(!zoneAvailable('invalid',[]));
let a=[unit(1,'power',{progress:0,hp:200,maxHp:200})],b=[unit(2,'power',{progress:0,hp:200,maxHp:200})];let contacts=0;
for(let i=0;i<180;i++){const next=stepCombat(a,b,.1,i/10);a=next.allies;b=next.enemies;contacts+=next.events.filter(e=>e.type==='ability').length;if(a.length&&b.length)assert(-9+a[0].progress*.18<=9-b[0].progress*.18+.01,'Tropas não devem atravessar umas às outras');}
assert(contacts>0);
console.log('PASS: 45 habilidades, cooldown, faixas, dano real, cura, escudo, perfuração, status, reflexão, derrota, torre e spawn.');
