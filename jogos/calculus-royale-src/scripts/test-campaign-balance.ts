import assert from 'node:assert/strict';
import { getCumulativeCards, worlds, type Card } from '../client/src/data/cardCatalog.ts';
import { createTowers, stepTacticalBattle, battleResult, chooseAI, validPlacement, combatRole, type Placement } from '../client/src/game/tacticalBattle.ts';
import { getStageEncounter } from '../client/src/game/stageEncounters.ts';
import { STARTING_ELIXIR, ELIXIR_PER_TICK, BATTLE_TICK_SECONDS, elixirMultiplier, normalizeDeck } from '../client/src/game/battleRules.ts';
import { type CombatUnit } from '../client/src/game/combat.ts';

const strategies=['simple','standard','defensive'] as const;
function deckFor(catalog:Card[],strategy:typeof strategies[number]){
 const score=(card:Card)=>strategy==='simple'?(card.kind==='tropa'?10:0)-card.cost:strategy==='defensive'?(card.kind==='estrutura'?9:combatRole({cardId:card.id,kind:card.kind})==='tank'?8:card.kind==='tropa'?5:card.kind==='relíquia'?7:2)+card.power/card.cost:(card.kind==='tropa'?5:card.kind==='feitiço'?3:1)+card.power/card.cost;
 return normalizeDeck([...catalog].sort((a,b)=>score(b)-score(a)).map(c=>c.id),catalog.map(c=>c.id));
}
export function simulate(world:number,stage:number,strategy:typeof strategies[number]){
 const catalog=getCumulativeCards(world),encounter=getStageEncounter(world,stage),deck=deckFor(catalog,strategy);
 let allyQueue=[...deck],enemyQueue=normalizeDeck([...catalog.slice((world+stage)%catalog.length),...catalog.slice(0,(world+stage)%catalog.length)].map(c=>c.id),catalog.map(c=>c.id));
 let allies:CombatUnit[]=[],enemies:CombatUnit[]=[],towers=createTowers(encounter.enemyTowerHp,encounter.enemyPowerMultiplier),allyElixir=STARTING_ELIXIR,enemyElixir=STARTING_ELIXIR,enemyWait=0,playerWait=0,id=0;
 const spawn=(card:Card,point:Placement,enemy:boolean):CombatUnit=>({id:++id,cardId:card.id,icon:card.icon,name:card.name,kind:card.kind,...point,power:enemy?Math.max(4,Math.round(card.power*encounter.enemyPowerMultiplier)):card.power,color:'#fff'});
 for(let tick=0;tick<2400;tick++){
  const time=(tick+1)*BATTLE_TICK_SECONDS;
  const result=stepTacticalBattle(allies,enemies,towers,BATTLE_TICK_SECONDS,time);allies=result.allies;enemies=result.enemies;towers=result.towers;
  const outcome=battleResult(towers,time);if(outcome)return {outcome,time:Number(time.toFixed(1)),deck};
  const gain=ELIXIR_PER_TICK*elixirMultiplier(time);allyElixir=Math.min(10,allyElixir+gain);enemyElixir=Math.min(10,enemyElixir+gain);enemyWait+=.1;playerWait+=.1;
  if(playerWait>=1){
   const threats=[...enemies].sort((a,b)=>b.progress-a.progress),threat=threats[0];
   const side=towers.filter(t=>t.enemy&&t.role==='side'&&t.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   const options=allyQueue.slice(0,4).map((cardId,index)=>({card:catalog.find(c=>c.id===cardId)!,index})).filter(v=>v.card.cost<=allyElixir);
   const chosen=options.sort((a,b)=>{
    const score=(card:Card)=>card.kind==='tropa'?card.power/card.cost+3:card.kind==='estrutura'?(strategy==='defensive'&&threat?.progress>50?8:allies.some(u=>u.kind==='estrutura')?-10:0):card.kind==='feitiço'?(threat?5:2):allies.length>1?3:-3;
    return score(b.card)-score(a.card);
   })[0];
   if(chosen){
    const card=chosen.card,lane=threat&&threat.progress>55?(threat.lane??-1.65):side?.lane??-1.65;
    const point=card.kind==='feitiço'?(threat?{progress:Math.max(5,Math.min(95,100-threat.progress)),lane:threat.lane??lane}:{progress:90,lane:side?.lane??0}):[35,27.5,20,12.5,5].flatMap(progress=>[lane,lane<0?-2.5:2.5,-lane].map(lane=>({progress,lane}))).find(point=>validPlacement(card.kind,point,allies));
    if(point&&validPlacement(card.kind,point,allies)){allies.push(spawn(card,point,false));allyElixir-=card.cost;allyQueue=[...allyQueue.slice(0,chosen.index),...allyQueue.slice(chosen.index+1),card.id];playerWait=0;}
   }
  }
  if(enemyWait>=encounter.aiPlayInterval){
   const options=enemyQueue.slice(0,4).map(cardId=>catalog.find(c=>c.id===cardId)!);
   const ai=chooseAI(options.map(c=>({cardId:c.id,kind:c.kind,power:c.power,cost:c.cost})),enemyElixir,allies,enemies,towers,world+stage);
   if(ai&&validPlacement(ai.card.kind,ai.point,enemies)){
    const card=options[ai.index];enemies.push(spawn(card,ai.point,true));enemyElixir-=card.cost;
    const index=enemyQueue.indexOf(card.id);enemyQueue=[...enemyQueue.slice(0,index),...enemyQueue.slice(index+1),card.id];enemyWait=0;
   }
  }
 }
 return {outcome:battleResult(towers,240)??'draw',time:240,deck};
}
let victories=0,total=0;
for(let world=0;world<5;world++)for(let stage=0;stage<worlds[world].chapters.length;stage++){
 const results=strategies.map(strategy=>({strategy,...simulate(world,stage,strategy)}));total+=results.length;victories+=results.filter(r=>r.outcome==='victory').length;
 console.log(`${world+1}.${stage+1} ${results.map(r=>`${r.strategy}:${r.outcome}@${r.time}s`).join(' | ')}`);
 assert(results.some(r=>r.outcome==='victory'),`casa ${world+1}.${stage+1} precisa ser vencível com uma estratégia sem evoluções`);
 for(const r of results)assert(r.deck.every(id=>getCumulativeCards(world).some(c=>c.id===id)),'nenhuma carta futura');
}
assert.equal(total,84);console.log(`PASS: 28 casas, incluindo 5.5; ${victories}/${total} vitórias determinísticas com três decks sem evolução.`);
