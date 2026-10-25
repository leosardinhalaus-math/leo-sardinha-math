import { worlds, getCumulativeCards, type Card } from '@/data/cardCatalog';
import { createTowers, stepTacticalBattle, battleResult, crowns, chooseAI, validPlacement, snapPlacement, combatDescription } from '@/game/tacticalBattle';
import { awardStage, openChest, readChestLedger, chestRewards, type ChestReward } from '@/data/chestRewards';
import { type CombatUnit, type CombatEvent } from "@/game/combat";
import { BATTLE_TICK_SECONDS, DECK_SIZE, ELIXIR_PER_TICK, REGULATION_SECONDS, STARTING_ELIXIR, battleClockLabel, elixirMultiplier, normalizeDeck, type MatchOutcome } from "@/game/battleRules";
import { getStageEncounter } from "@/game/stageEncounters";
import { getCardProfile, abilityDescription } from "@/game/cardProfiles";
import { isStageUnlocked, normalizeStageProgress } from "@/game/progression";
import { createChallengePicker, type Challenge } from "@/data/powerUpChallenges";
import { WORLD_MAPS } from "@/data/worldMaps";
import { createSaveStore, readStorage, storageKeys, writeStorage } from "@/data/saveGame";
import { getCardImage, getCardImageFallback } from "@/data/cardArt";
import RoyaleCard from "./RoyaleCard";
import SpecialItemsBoard from "./SpecialItemsBoard";
import { useEffect, useMemo, useRef, useState } from "react";
import WorldArena from "./WorldArena";
import { Swords, Zap, Trophy, LockKeyhole, Sparkles, Shield, Flame, RotateCcw, BookOpen, ArrowUpRight, MapPinned, Layers3, X, CheckCircle2, Gift, Coins, Volume2, VolumeX, PackageOpen, Gem, Star, ScrollText } from "lucide-react";

type Unit = CombatUnit;
type View = "home" | "lobby" | "map" | "battle" | "deck";
type CollisionEvent = { left: string; right: string; leftKind: Card["kind"]; rightKind: Card["kind"]; detail: string; style: "kinetic" | "arcane" | "fortress" | "relic" | "hybrid" };
type SurvivalEntry = { score: number; wave: number; date: string };
type SurvivalBadge = { id: string; wave: number; name: string; icon: string; detail: string; reward: number };


const assetBase = import.meta.env.BASE_URL;
const worldArt = [
  `${assetBase}assets/maps/world-1.webp`,
  `${assetBase}assets/maps/world-2.webp`,
  `${assetBase}assets/maps/world-4.webp`,
  `${assetBase}assets/maps/world-3.webp`,
  `${assetBase}assets/maps/world-5.webp`,
];
const getWorldEnemyHp = (worldIndex: number, stageIndex = 0) => getStageEncounter(worldIndex, stageIndex).enemyTowerHp;

const rarityClass: Record<Card["rarity"], string> = { comum: "common", rara: "rare", épica: "epic", lendária: "legendary" };


const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const svgData = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
// One art source for hand, deck, combat and survival.
const getCardArt = (card: Card) => getCardImage(card.id);
const chestPalette: Record<ChestReward["rarity"], [string, string]> = {
  comum: ["#68d9e8", "#18395b"],
  rara: ["#a482ff", "#32235f"],
  épica: ["#ff8ddb", "#5e234f"],
  lendária: ["#ffd36e", "#b35b32"],
};
const getChestArt = (worldIndex: number) => {
  const reward = chestRewards[worldIndex];
  const [c1, c2] = chestPalette[reward.rarity];
  const item = xmlEscape(reward.item.length > 28 ? `${reward.item.slice(0, 26)}…` : reward.item);
  const icon = xmlEscape(reward.icon);
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 150"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="220" height="150" rx="18" fill="#08162d"/><circle cx="110" cy="69" r="57" fill="${c1}" opacity=".14"/><path d="M48 58 Q110 18 172 58 V77 H48 Z" fill="url(#g)" stroke="#fff2c7" stroke-width="4"/><rect x="43" y="72" width="134" height="55" rx="9" fill="url(#g)" stroke="#fff2c7" stroke-width="4"/><rect x="97" y="66" width="26" height="35" rx="6" fill="#0a1730" stroke="#fff2c7" stroke-width="3"/><text x="110" y="91" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#fff2c7">${icon}</text><path d="M55 46 L63 36 M164 46 L156 36 M110 24 V10" stroke="#fff2c7" stroke-width="4"/><text x="110" y="143" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#ffe9a6">${item}</text></svg>`);
};
const survivalBadges: SurvivalBadge[] = [
  { id: "first-proof", wave: 3, name: "Primeira Prova", icon: "∂", detail: "Alcance a onda 3", reward: 50 },
  { id: "chain-breaker", wave: 5, name: "Quebra-Cadeias", icon: "∘", detail: "Alcance a onda 5", reward: 90 },
  { id: "integral-wall", wave: 8, name: "Muralha Integral", icon: "∫", detail: "Alcance a onda 8", reward: 150 },
  { id: "infinite-scholar", wave: 12, name: "Sábio do Infinito", icon: "∞", detail: "Alcance a onda 12", reward: 250 },
];
const initialDeck = () => {
  const completed=readStorage<boolean[]>(storageKeys.worlds,[]);
  const unlocked=Math.min(4,completed.filter(Boolean).length);
  const available=getCumulativeCards(unlocked).map(card=>card.id);
  const saved = readStorage<string[]>(storageKeys.deck, available.slice(0, DECK_SIZE));
  return normalizeDeck(saved, available);
};

export default function GameCanvas() {
  const [worldIndex, setWorldIndex] = useState(() => Math.min(4, Math.max(0, readStorage(storageKeys.worldIndex, 0))));
  const [energy, setEnergy] = useState(STARTING_ELIXIR);

  const [towers, setTowers] = useState(() => createTowers(getWorldEnemyHp(worldIndex,readStorage(storageKeys.chapter,0)),getStageEncounter(worldIndex,readStorage(storageKeys.chapter,0)).enemyPowerMultiplier));


  const [units, setUnits] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [enemyEnergy, setEnemyEnergy] = useState(5);
  const [enemyLastCard, setEnemyLastCard] = useState("IA calculista aguardando uma abertura...");
  const [mainDeckIds, setMainDeckIds] = useState<string[]>(initialDeck);
  const [deckQueue, setDeckQueue] = useState<string[]>(initialDeck);
  const [view, setView] = useState<View>("home");
  const handRef = useRef<HTMLElement>(null);
  const [handHeight, setHandHeight] = useState(280);
  useEffect(() => {
    if (view !== "battle" || !handRef.current) return;
    const hand = handRef.current;
    const update = () => setHandHeight(Math.ceil(hand.getBoundingClientRect().height));
    const observer = new ResizeObserver(update);
    observer.observe(hand);
    update();
    return () => observer.disconnect();
  }, [view]);
  const [playerName, setPlayerName] = useState(() => readStorage(storageKeys.playerName, ""));
  const [nameDraft, setNameDraft] = useState(() => readStorage(storageKeys.playerName, ""));
  const [completionNotice, setCompletionNotice] = useState<number | null>(null);
  const [celebrationWorld, setCelebrationWorld] = useState<number | null>(null);
  const [phaseReward, setPhaseReward] = useState<(ChestReward & { world: number }) | null>(null);
  const deploymentConfirmedRef = useRef(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [spawnPoint, setSpawnPoint] = useState({progress:12.5,lane:-1.5});
  const [arenaAvailable,setArenaAvailable]=useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleElapsed, setBattleElapsed] = useState(0);
  const [battleOutcome, setBattleOutcome] = useState<MatchOutcome|null>(null);
  const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);
  const combatTimeRef = useRef(0);
  const battleElapsedRef = useRef(0);
  const suddenDeathRef = useRef(false);
  const enemyDeckRef = useRef<string[]>([]);

  const aiElapsedRef = useRef(0);
  const unitSequenceRef = useRef(Date.now());
  const battleSnapshot = useRef({units,enemyUnits,energy,enemyEnergy,towers});
  battleSnapshot.current = {units,enemyUnits,energy,enemyEnergy,towers};
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const dragGestureRef = useRef(false);
  const battleResolvedRef = useRef(false);
  const [battleLog, setBattleLog] = useState("Arena pronta — escolha uma carta para lançar a primeira prova.");
  const [toast, setToast] = useState("");
  const [completedWorlds, setCompletedWorlds] = useState<boolean[]>(() => readStorage(storageKeys.worlds, [false, false, false, false, false]));
  const [stageProgress, setStageProgress] = useState<number[]>(() => {
    const completed=readStorage<boolean[]>(storageKeys.worlds,[false,false,false,false,false]);
    return normalizeStageProgress(worlds.map(item=>item.chapters.length),readStorage<unknown>(storageKeys.stages,[]),completed);
  });
  const [cardLevels, setCardLevels] = useState<Record<string, number>>(() => readStorage(storageKeys.levels, {}));
  const [essence, setEssence] = useState(() => readStorage(storageKeys.essence, 6));
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const challengePicker = useRef(createChallengePicker());
  const [chapter, setChapter] = useState(() => {
    const selectedWorld=Math.min(4,Math.max(0,readStorage(storageKeys.worldIndex,0)));
    const completed=readStorage<boolean[]>(storageKeys.worlds,[false,false,false,false,false]);
    const progress=normalizeStageProgress(worlds.map(item=>item.chapters.length),readStorage<unknown>(storageKeys.stages,[]),completed);
    return Math.min(worlds[selectedWorld].chapters.length-1,progress[selectedWorld]);
  });
  const [wins, setWins] = useState(() => readStorage(storageKeys.wins, 12));
  const [coins, setCoins] = useState(() => readStorage(storageKeys.coins, 320));
  const [soundVolume, setSoundVolume] = useState(() => readStorage(storageKeys.volume, 0.7));
  const [soundMuted, setSoundMuted] = useState(() => readStorage(storageKeys.muted, false));
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [chestLedger, setChestLedger] = useState(() => readChestLedger(createSaveStore()));
  const rewardInventory = chestLedger.instances.filter(chest => chest.state === 'opened');
  const pendingChests = chestLedger.instances.filter(chest => chest.state === 'pending');
  const claimChest = (id:string) => {
    try {
      const result=openChest(createSaveStore(),id);
      setChestLedger(result.ledger);
      if(result.opened){setCoins(result.coins);setEssence(result.essence);setToast(`${result.chest.chest} aberto · +${result.chest.coins} moedas · +${result.chest.essence} essência · ${result.chest.item} (colecionável)`);playSound('reward');}
    } catch {setToast('Não foi possível salvar a abertura. Seu baú continua disponível; tente novamente.');}
  };
  const [survivalOpen, setSurvivalOpen] = useState(false);
  const [survivalRunning, setSurvivalRunning] = useState(false);
  const [survivalWave, setSurvivalWave] = useState(0);
  const [survivalScore, setSurvivalScore] = useState(0);
  const [survivalTower, setSurvivalTower] = useState(100);
  const [survivalEnemies, setSurvivalEnemies] = useState<Unit[]>([]);
  const [survivalElixir, setSurvivalElixir] = useState(7);
  const [survivalLeaderboard, setSurvivalLeaderboard] = useState<SurvivalEntry[]>(() => readStorage(storageKeys.survivalLeaderboard, []));
  const [survivalBadgeIds, setSurvivalBadgeIds] = useState<string[]>(() => readStorage(storageKeys.survivalBadges, []));
  const [survivalChallenge, setSurvivalChallenge] = useState<Challenge | null>(null);
  const [survivalChallengeWave, setSurvivalChallengeWave] = useState(0);
  const [survivalRewardNotice, setSurvivalRewardNotice] = useState<SurvivalBadge | null>(null);
  const survivalTickRef = useRef(0);
  const survivalWaveRef = useRef(0);
  const survivalScoreRef = useRef(0);
  const survivalEndedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const completedWorldsRef = useRef(completedWorlds);
  const stageProgressRef = useRef(stageProgress);
  const world = worlds[worldIndex];
  const currentWorldArt = worldArt[worldIndex];
  const stageEncounter = getStageEncounter(worldIndex, chapter);

  const unlockAudio = () => {
    if (typeof window === "undefined" || !window.AudioContext) return null;
    const context = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  };
  const playSound = (kind: CollisionEvent["style"] | "celebration" | "reward") => {
    if (soundMuted || soundVolume <= 0) return;
    const context = unlockAudio();
    if (!context) return;
    const patterns: Record<string, { notes: number[]; wave: OscillatorType; length: number }> = {
      kinetic: { notes: [180, 110, 240], wave: "sawtooth", length: .09 },
      arcane: { notes: [420, 620, 880, 660], wave: "sine", length: .12 },
      fortress: { notes: [100, 100, 150], wave: "square", length: .13 },
      relic: { notes: [740, 980, 1240], wave: "triangle", length: .16 },
      hybrid: { notes: [220, 440, 330, 660], wave: "triangle", length: .1 },
      celebration: { notes: [392, 523, 659, 784, 1046], wave: "sine", length: .16 },
      reward: { notes: [523, 659, 784, 1046], wave: "triangle", length: .14 },
    };
    const pattern = patterns[kind];
    pattern.notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * pattern.length;
      oscillator.type = pattern.wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.075 * soundVolume, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + pattern.length * .9);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + pattern.length);
    });
  };

  const resetBattleState = (targetWorldIndex = worldIndex, nextDeck = mainDeckIds, targetChapter = chapter) => {
    battleResolvedRef.current = false;
    setTowers(createTowers(getWorldEnemyHp(targetWorldIndex,targetChapter),getStageEncounter(targetWorldIndex,targetChapter).enemyPowerMultiplier));
    setUnits([]);
    setEnemyUnits([]);
    setEnergy(STARTING_ELIXIR);
    setEnemyEnergy(STARTING_ELIXIR);
    setDeckQueue(nextDeck);
    setChallenge(null);
    setPendingCard(null);
    setBattleStarted(false);
    setBattleOutcome(null);
    setBattleElapsed(0);
    setCombatEvents([]);
    battleElapsedRef.current = 0;
    suddenDeathRef.current = false;
    const eligible=getCumulativeCards(targetWorldIndex);
    const offset=(targetWorldIndex+targetChapter)%eligible.length;
    enemyDeckRef.current=normalizeDeck([...eligible.slice(offset),...eligible.slice(0,offset)].map(card=>card.id),eligible.map(card=>card.id));

    combatTimeRef.current = 0;
    aiElapsedRef.current = 0;
  };

  const finishBattle = (targetWorldIndex = worldIndex) => {
    if (battleResolvedRef.current) return;
    battleResolvedRef.current = true;
    setUnits([]);
    setEnemyUnits([]);
    setEnemyEnergy(0);


    try {
      const result=awardStage(createSaveStore(),targetWorldIndex,chapter,worlds[targetWorldIndex].chapters.length);
      setWins(value=>value+1);
      if(result.kind==='replay'){
        setCompletionNotice(null);setCelebrationWorld(null);setPhaseReward(null);setView('lobby');
        setToast('Casa já concluída · sem recompensa repetida.');return;
      }
      setCoins(result.coins);setEssence(result.essence);setChestLedger(result.ledger);
      setStageProgress([...result.progress]);stageProgressRef.current=[...result.progress];
      setCompletedWorlds([...result.completed]);completedWorldsRef.current=[...result.completed];
      playSound('celebration');
      if(result.kind==='advance'){
        setChapter(result.nextStage);setCompletionNotice(null);setCelebrationWorld(null);setPhaseReward(null);setView('lobby');
        setToast('Casa concluída · +25 moedas · +1 essência.');
      } else {
        setCompletionNotice(targetWorldIndex);setCelebrationWorld(targetWorldIndex);
        setPhaseReward({...chestRewards[targetWorldIndex],world:targetWorldIndex});setView('map');
        setToast('Casa: +25 moedas e +1 essência · conclusão: +3 essências · baú pendente no inventário.');
      }
    } catch {
      battleResolvedRef.current=false;
      setToast('Não foi possível salvar sua recompensa. Use Receber recompensa para tentar novamente.');
    }
  };

  useEffect(() => { writeStorage(storageKeys.deck, mainDeckIds); }, [mainDeckIds]);
  useEffect(() => { writeStorage(storageKeys.worlds, completedWorlds); }, [completedWorlds]);
  useEffect(() => { writeStorage(storageKeys.stages, stageProgress); }, [stageProgress]);
  useEffect(() => { writeStorage(storageKeys.levels, cardLevels); }, [cardLevels]);
  useEffect(() => { writeStorage(storageKeys.essence, essence); }, [essence]);
  useEffect(() => { writeStorage(storageKeys.wins, wins); }, [wins]);
  useEffect(() => { writeStorage(storageKeys.coins, coins); }, [coins]);
  useEffect(() => { writeStorage(storageKeys.worldIndex, worldIndex); }, [worldIndex]);
  useEffect(() => { writeStorage(storageKeys.chapter, chapter); }, [chapter]);
  useEffect(() => { writeStorage(storageKeys.volume, soundVolume); }, [soundVolume]);
  useEffect(() => { writeStorage(storageKeys.muted, soundMuted); }, [soundMuted]);

  useEffect(() => { completedWorldsRef.current = completedWorlds; }, [completedWorlds]);
  useEffect(() => { stageProgressRef.current = stageProgress; }, [stageProgress]);
  useEffect(() => { writeStorage(storageKeys.survivalLeaderboard, survivalLeaderboard); }, [survivalLeaderboard]);
  useEffect(() => { writeStorage(storageKeys.survivalBadges, survivalBadgeIds); }, [survivalBadgeIds]);



  useEffect(() => {
    if(view !== "battle" || !battleStarted || battleOutcome || challenge || pendingCard || inventoryOpen || survivalOpen) return;
    const timer=window.setInterval(()=>{
      if(battleResolvedRef.current) return;
      const current=battleSnapshot.current;
      const elapsed=battleElapsedRef.current+BATTLE_TICK_SECONDS;
      const wasSuddenDeath=suddenDeathRef.current;
      battleElapsedRef.current=elapsed;
      if(Math.floor(elapsed)!==Math.floor(elapsed-BATTLE_TICK_SECONDS))setBattleElapsed(Math.floor(elapsed));
      const multiplier=elixirMultiplier(elapsed);
      combatTimeRef.current+=BATTLE_TICK_SECONDS;
      const next=stepTacticalBattle(current.units,current.enemyUnits,current.towers,BATTLE_TICK_SECONDS,combatTimeRef.current);
      setTowers(next.towers);
      setUnits(next.allies);setEnemyUnits(next.enemies);
      setEnergy(value=>Math.min(10,Number((value+ELIXIR_PER_TICK*multiplier).toFixed(3))));
      setEnemyEnergy(value=>Math.min(10,Number((value+ELIXIR_PER_TICK*multiplier).toFixed(3))));
      if(next.events.length){setCombatEvents(previous=>[...previous,...next.events].slice(-12));setBattleLog(next.events[next.events.length-1].label);if(next.events.some(e=>e.type==='ability'))playSound('arcane');}
      const outcome=battleResult(next.towers,elapsed,wasSuddenDeath);
      if(outcome){setBattleOutcome(outcome);if(outcome!=='victory')battleResolvedRef.current=true;setBattleLog(outcome==='draw'?'Empate: coroas e vida equilibradas.':outcome==='victory'?'Vitória por Rei, coroas ou vida restante.':'Derrota por Rei, coroas ou vida restante.');return;}
      if(!wasSuddenDeath&&elapsed>=REGULATION_SECONDS){
        suddenDeathRef.current=true;
        setBattleLog('Coroas empatadas · morte súbita: a próxima torre destruída decide.');setToast('Elixir triplo · destrua uma torre para vencer.');
      }
      if(battleResolvedRef.current)return;
      aiElapsedRef.current+=BATTLE_TICK_SECONDS;
      if(aiElapsedRef.current<stageEncounter.aiPlayInterval)return;
      const catalog=getCumulativeCards(worldIndex);
      const queue=enemyDeckRef.current.length?enemyDeckRef.current:mainDeckIds.slice(0,DECK_SIZE);
      const candidates=queue.slice(0,4).map((id,index)=>({card:catalog.find(card=>card.id===id),index})).filter((entry):entry is {card:Card;index:number}=>entry.card!==undefined&&entry.card.cost<=current.enemyEnergy);
      if(!candidates.length)return;
      const decision=chooseAI(candidates.map(entry=>({cardId:entry.card.id,kind:entry.card.kind,power:entry.card.power,cost:entry.card.cost})),current.enemyEnergy,next.allies,next.enemies,next.towers,worldIndex+chapter);
      if(!decision)return;
      const chosen=candidates[decision.index],aiCard=chosen.card;
      if(!validPlacement(aiCard.kind,decision.point,next.enemies))return;
      aiElapsedRef.current=0;
      enemyDeckRef.current=[...queue.slice(0,chosen.index),...queue.slice(chosen.index+1),aiCard.id];
      const id=++unitSequenceRef.current;
      setEnemyUnits(currentUnits=>[...currentUnits,{id,cardId:aiCard.id,icon:aiCard.icon,name:aiCard.name,kind:aiCard.kind,...decision.point,power:Math.max(4,Math.round(aiCard.power*stageEncounter.enemyPowerMultiplier)),color:'#ff7d72'}]);
      setEnemyEnergy(value=>Math.max(0,Number((value-aiCard.cost).toFixed(2))));
      setEnemyLastCard(`${aiCard.name} · ${getCardProfile(aiCard.id).ability}`);
    },100);
    return()=>{window.clearInterval(timer);};
  },[worldIndex,chapter,view,battleStarted,battleOutcome,challenge,pendingCard,inventoryOpen,survivalOpen,mainDeckIds]);

  // Deixa as animações finais aparecerem antes do fluxo de recompensa existente.
  useEffect(()=>{if(battleOutcome!=='victory')return;const timer=window.setTimeout(()=>finishBattle(worldIndex),1800);return()=>window.clearTimeout(timer);},[battleOutcome,worldIndex]);

  useEffect(() => {
    if(celebrationWorld===null)return;
    const timer=window.setTimeout(()=>setCelebrationWorld(null),3000);
    return()=>window.clearTimeout(timer);
  },[celebrationWorld]);


  useEffect(() => {
    if (!survivalRunning) return;
    const timer = window.setInterval(() => {
      survivalTickRef.current += 1;
      const tick = survivalTickRef.current;
      setSurvivalElixir((value) => Math.min(10, Number((value + .6).toFixed(1))));
      setSurvivalEnemies((current) => {
        let damage = 0;
        const next = current.flatMap((unit) => {
          const progress = unit.progress + 5 + Math.min(5, Math.floor(survivalWave / 5));
          if (progress >= 100) { damage += unit.power; return []; }
          return [{ ...unit, progress }];
        });
        if (damage > 0) setSurvivalTower((value) => {
          const nextTower = Math.max(0, value - damage);
          if (nextTower === 0 && !survivalEndedRef.current) { survivalEndedRef.current = true; setSurvivalRunning(false); playSound("relic"); const entry = { score: survivalScoreRef.current, wave: survivalWaveRef.current, date: new Date().toLocaleDateString("pt-BR") }; setSurvivalLeaderboard((entries) => [...entries, entry].sort((a, b) => b.score - a.score).slice(0, 10)); setToast(`Torre superada na onda ${survivalWaveRef.current}. Pontuação: ${survivalScoreRef.current}.`); }
          return nextTower;
        });
        return next;
      });
      if (tick % 3 === 0) {
        const deck = getCumulativeCards(4);
        const card = deck[(tick / 3 - 1) % deck.length];
        const wave = Math.max(1, survivalWaveRef.current + 1);
        survivalWaveRef.current = wave;
        survivalScoreRef.current += 10 * wave;
        setSurvivalWave(wave);
        setSurvivalScore(survivalScoreRef.current);
        setSurvivalEnemies((current) => [...current, { id: Date.now(), cardId: card.id, icon: card.icon, name: card.name, kind: card.kind, progress: 0, power: Math.max(4, Math.round(card.power * (.34 + wave * .018))), color: "#ff7d72" }]);
        const milestone = survivalBadges.find((badge) => badge.wave === wave);
        if (milestone && !survivalBadgeIds.includes(milestone.id)) { setSurvivalBadgeIds((ids) => [...ids, milestone.id]); setCoins((value) => value + milestone.reward); setSurvivalRewardNotice(milestone); playSound("reward"); setToast(`Emblema conquistado: ${milestone.name} · +${milestone.reward} moedas.`); }
        setBattleLog(`Torre: onda ${wave} · ${card.name} entrou no corredor.`);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [survivalRunning]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cumulativeCards = useMemo(() => getCumulativeCards(worldIndex), [worldIndex]);
  const allCards = useMemo(() => getCumulativeCards(Math.min(4,completedWorlds.filter(Boolean).length)), [completedWorlds]);
  const cardsById = useMemo(() => new Map(allCards.map((card) => [card.id, card])), [allCards]);
  const activeCards = useMemo(() => { return deckQueue.map((id) => cardsById.get(id)).filter((card): card is Card => Boolean(card)).slice(0, 4); }, [cardsById, deckQueue]);
  const nextCard = useMemo(() => cardsById.get(deckQueue[4] ?? "") ?? null, [cardsById, deckQueue]);
  const mainDeckCards = useMemo(() => mainDeckIds.map((id) => cardsById.get(id)).filter((card): card is Card => Boolean(card)), [cardsById, mainDeckIds]);
  const averageElixirCost = useMemo(() => mainDeckCards.length ? (mainDeckCards.reduce((sum, card) => sum + card.cost, 0) / mainDeckCards.length).toFixed(1) : "0.0", [mainDeckCards]);
  const editMainDeck = (card: Card) => {
    if (!mainDeckIds.includes(card.id) && mainDeckIds.length >= DECK_SIZE) {
      setToast(`Deck completo: remova uma carta antes de adicionar outra. (${DECK_SIZE} no máximo)`);
      return;
    }
    const next = mainDeckIds.includes(card.id) ? mainDeckIds.filter((id) => id !== card.id) : [...mainDeckIds, card.id];
    setMainDeckIds(next);
    setDeckQueue(next);
  };
  const reorderDeck = (targetId: string) => {
    if (!draggedCardId || draggedCardId === targetId) return;
    setMainDeckIds((ids) => {
      const next = [...ids];
      const from = next.indexOf(draggedCardId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return ids;
      next.splice(from, 1);
      next.splice(to, 0, draggedCardId);
      setDeckQueue(next);
      return next;
    });
    setDraggedCardId(null);
  };
  const playCard = (card: Card) => {
    unlockAudio();
    if (battleResolvedRef.current || battleOutcome || challenge) return;
    if (energy < card.cost) { setToast("Energia insuficiente — aguarde o elixir."); return; }
    const point=[12.5,20,30,40].flatMap(progress=>[-1.5,1.5,-2.5,2.5].map(lane=>({progress,lane}))).find(point=>validPlacement(card.kind,point,units));
    if(!point){setToast('Área ocupada. Aguarde suas tropas avançarem.');return;}
    deploymentConfirmedRef.current=false;
    setSpawnPoint(point);setPendingCard(card);
    window.requestAnimationFrame(()=>document.querySelector('.arena-frame')?.scrollIntoView({block:'center',behavior:'smooth'}));
  };
  const confirmSpawn = () => {
    const card=pendingCard;
    if(deploymentConfirmedRef.current||!card||!arenaAvailable||battleResolvedRef.current||battleOutcome||energy<card.cost)return;
    if(!validPlacement(card.kind,spawnPoint,units)){setToast('Posição inválida ou ocupada. Escolha outro ponto.');return;}
    deploymentConfirmedRef.current=true;
    const power=Math.round(card.power*(1+(cardLevels[card.id]??0)*.12));
    setEnergy(value=>Math.max(0,Number((value-card.cost).toFixed(2))));
    setUnits(value=>[...value,{id:++unitSequenceRef.current,cardId:card.id,icon:card.icon,name:card.name,kind:card.kind,...spawnPoint,power,color:world.color}]);
    if (!enemyDeckRef.current.length) enemyDeckRef.current = mainDeckIds.slice(0, DECK_SIZE);
    setDeckQueue(queue=>{const position=queue.indexOf(card.id);return position<0?queue:[...queue.slice(0,position),...queue.slice(position+1),card.id];});
    setPendingCard(null);setBattleStarted(true);
    setBattleLog(`${card.name} · ${combatDescription({cardId:card.id,kind:card.kind})}`);
    setToast(`${card.name} invocado · −${card.cost} elixir`);
  };

  const activatePowerUp = (type: "limit" | "root" | "zoom") => {
    if (type === "limit") { setEnergy((value) => Math.min(10, value + 2)); setToast("Power-up Limite ativado: +2 de energia."); }
    if (type === "root") { setTowers(current=>{const wounded=current.filter(t=>!t.enemy&&t.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];return current.map(t=>t.id===wounded?.id?{...t,hp:Math.min(t.maxHp,t.hp+8)}:t);}); setToast("Power-up Raiz ativado: torre recuperada."); }
    if (type === "zoom") { setUnits((value) => value.map((unit) => ({ ...unit, haste: .85, hasteTime: 3 }))); setToast("Power-up Zoom ativado: a próxima aproximação acelera."); }
  };

  const requestPowerUp = (type: "limit" | "root" | "zoom") => {
    if (view !== "battle" || battleResolvedRef.current || pendingCard || battleOutcome || !battleStarted) return;
    setChallenge(challengePicker.current(worldIndex, type));
  };

  const answerChallenge = (answer: string) => {
    if (!challenge) return;
    if (answer === challenge.answer) { activatePowerUp(challenge.type); setChallenge(null); }
    else { setToast("Resposta incorreta — a arena mantém o power-up bloqueado."); setChallenge(null); }
  };

  const evolveCard = (card: Card) => {
    if (!completedWorlds[worldIndex]) { setToast("Conclua a fase para liberar a evolução desta carta."); return; }
    if (essence < 3) { setToast("Essência insuficiente — vença outra fase para ganhar mais."); return; }
    setEssence((value) => value - 3);
    setCardLevels((levels) => ({ ...levels, [card.id]: (levels[card.id] ?? 0) + 1 }));
    setToast(`${card.name} evoluiu para nível ${(cardLevels[card.id] ?? 0) + 2}.`);
  };

  const enterGame = (withName: boolean) => {
    const nextName = withName ? nameDraft.trim().slice(0, 24) : "";
    if (withName && !nextName) { setToast("Digite um nome ou escolha Jogar sem nome."); return; }
    setPlayerName(nextName);
    writeStorage(storageKeys.playerName, nextName);
    setView("lobby");
  };

  const selectWorld = (index: number) => {
    const unlocked = index === 0 || completedWorlds[index - 1];
    if (!unlocked) { setToast("Conclua o mundo anterior para desbloquear esta arena."); return; }
    const nextIds = mainDeckIds.length ? mainDeckIds : getCumulativeCards(index).map((card) => card.id);
    setMainDeckIds(nextIds);
    setWorldIndex(index);
    const nextChapter=Math.min(worlds[index].chapters.length-1,stageProgress[index]??0);
    setChapter(nextChapter);
    resetBattleState(index, nextIds, nextChapter);
    setView("lobby");
    setCompletionNotice(null);
    setPhaseReward(null);
    setBattleLog(`${worlds[index].title} aberto. A IA está preparando suas cartas.`);
    setToast(`${WORLD_MAPS[index].title} selecionada · prepare seu deck`);
  };

  const enterArena = () => {
    if (mainDeckIds.length !== DECK_SIZE) { setToast(`A arena exige um deck completo de ${DECK_SIZE} cartas.`); setView("deck"); return; }
    if (battleResolvedRef.current || !battleStarted) resetBattleState(worldIndex,mainDeckIds,chapter);
    unlockAudio();
    setView("battle");
  };

  const resetBattle = () => {
    resetBattleState(worldIndex, mainDeckIds, chapter);
    setView("battle");
    setCompletionNotice(null);
    setPhaseReward(null);
    setBattleLog("Batalha reiniciada — toda boa prova começa com uma hipótese.");
    setToast("Arena reiniciada · rodízio recomposto");
  };
  const startSurvival = () => { unlockAudio(); survivalTickRef.current = 0; survivalWaveRef.current = 0; survivalScoreRef.current = 0; survivalEndedRef.current = false; setSurvivalWave(0); setSurvivalScore(0); setSurvivalTower(100); setSurvivalElixir(7); setSurvivalEnemies([]); setSurvivalRewardNotice(null); setSurvivalChallenge(null); setSurvivalChallengeWave(0); setSurvivalRunning(true); setSurvivalOpen(true); setToast("Torre de Sobrevivência iniciada · aguente o máximo de ondas."); };
  const requestSurvivalChallenge = () => {
    const wave = survivalWaveRef.current;
    setSurvivalChallengeWave(wave);
    const difficulty = Math.min(4, Math.floor(Math.max(0, wave - 1) / 4));
    setSurvivalChallenge(challengePicker.current(difficulty, "limit"));
  };
  const answerSurvivalChallenge = (answer: string) => {
    if (!survivalChallenge) return;
    if (answer === survivalChallenge.answer) { setSurvivalElixir((value) => Math.min(10, value + 2)); setSurvivalScore((value) => value + 25 + survivalWaveRef.current * 5); survivalScoreRef.current += 25 + survivalWaveRef.current * 5; setToast(`Desafio da onda ${survivalWaveRef.current} resolvido · +elixir e pontuação.`); }
    else setToast("Resposta incorreta — a próxima onda será mais difícil.");
    setSurvivalChallenge(null);
  };
  const playSurvivalCard = (card: Card) => {
    unlockAudio();
    if (!survivalRunning) { setToast("Inicie a torre para lançar cartas."); return; }
    if (survivalElixir < card.cost) { setToast("Elixir insuficiente na torre — aguarde a recarga."); return; }
    setSurvivalElixir((value) => Number((value - card.cost).toFixed(1)));
    setSurvivalEnemies((enemies) => enemies.flatMap((enemy) => enemy.power <= card.power || card.kind === "feitiço" ? [] : [{ ...enemy, power: Math.max(2, enemy.power - Math.round(card.power * .35)) }]));
    survivalScoreRef.current += card.power * 2;
    setSurvivalScore(survivalScoreRef.current);
    setBattleLog(`Torre: ${card.name} respondeu à onda ${survivalWaveRef.current}.`);
    setToast(`${card.name} lançado na torre · −${card.cost} elixir`);
  };
  const closeSurvival = () => { setSurvivalRunning(false); setSurvivalOpen(false); setSurvivalEnemies([]); setSurvivalChallenge(null); };

  return (
    <main className={`game-shell screen-${view}`} style={{ "--hand-height": `${handHeight}px`, "--accent": WORLD_MAPS[worldIndex].accent, "--glow": WORLD_MAPS[worldIndex].accent, backgroundImage: `linear-gradient(rgba(7, 19, 41, .78), rgba(7, 19, 41, .94)), url(${currentWorldArt})` } as React.CSSProperties}>
      <div className="vignette" />
      {view === "home" && <section className="landing-page"><div className="landing-copy"><span className="landing-eyebrow">ARENA EDUCACIONAL · CÁLCULO EM BATALHA</span><div className="landing-logo"><span>∂</span><h1>Calculus <em>Royale</em></h1></div><p>Domine derivadas, integrais, limites e séries usando personagens, fórmulas, baús e estratégia.</p><div className="landing-name-box"><label htmlFor="player-name">NOME DO JOGADOR · OPCIONAL</label><input id="player-name" value={nameDraft} maxLength={24} placeholder="Ex.: Léo Sardinha" onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && nameDraft.trim()) enterGame(true); }} /><button className="landing-play" disabled={!nameDraft.trim()} onClick={() => enterGame(true)}><Swords size={17} /> JOGUE AGORA</button><button className="landing-anon" onClick={() => enterGame(false)}>Jogar sem nome</button></div><div className="landing-links"><a href="./perfil/">Perfil online</a><a href="./ranking/">Ranking</a><a href="../../educacao.html">Leo Sardinha.Math</a></div></div><div className="landing-visual"><img src={WORLD_MAPS[0].art} alt="Mapa das ilhas do Calculus Royale" /><div className="landing-badges"><span>5 ilhas</span><span>personagens + fórmulas</span><span>baús por fase</span><span>ranking online</span></div></div></section>}
      <section className="hud">
        <header className="topbar">
          <a className="site-back-link" href="../../educacao.html" aria-label="Voltar para Educação no Leo Sardinha.Math">← Leo Sardinha.Math</a>
          <div className="brand-block"><div className="brand-mark">∂</div><div><div className="eyebrow">ARENA DE CÁLCULO · TEMPORADA 01</div><h1>Calculus <span>Royale</span></h1></div></div>
          <div className="profile-strip"><div className="header-tools"><button className={`audio-toggle ${audioSettingsOpen ? "active" : ""}`} onClick={() => setAudioSettingsOpen((open) => !open)} title="Configurar volume" aria-label="Configurar volume">{soundMuted || soundVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}<span>{soundMuted ? "mudo" : `${Math.round(soundVolume * 100)}%`}</span></button>{audioSettingsOpen && <div className="audio-popover"><div><strong>Áudio da arena</strong><button onClick={() => setSoundMuted((muted) => !muted)}>{soundMuted ? "Ativar" : "Silenciar"}</button></div><label><span>Volume</span><input aria-label="Volume dos efeitos" type="range" min="0" max="1" step="0.05" value={soundVolume} onChange={(event) => { setSoundVolume(Number(event.target.value)); setSoundMuted(false); }} /></label></div>}<button className="inventory-toggle" onClick={() => setInventoryOpen(true)} title="Abrir inventário"><PackageOpen size={15} /><span>Inventário{pendingChests.length ? ` · ${pendingChests.length} pendentes` : ""}</span></button><button className="survival-toggle" onClick={startSurvival} title="Abrir Torre de Sobrevivência"><Flame size={15} /><span>Torre</span></button></div><button className="top-nav" onClick={() => setView("home")}>∂ Início</button><button className={`top-nav ${view === "map" ? "active" : ""}`} onClick={() => setView("map")}><MapPinned size={14} /> Ilhas</button><button className={`top-nav ${view === "lobby" ? "active" : ""}`} onClick={() => setView("lobby")}><Swords size={14} /> Preparação</button><button className={`top-nav ${view === "deck" ? "active" : ""}`} onClick={() => setView("deck")}><Layers3 size={14} /> Deck</button><a className="top-nav nav-link" href="./perfil/">Perfil</a><a className="top-nav nav-link" href="./ranking/">Ranking</a><div className="stat-chip"><Trophy size={15} /> <strong>{wins}</strong> vitórias</div><div className="stat-chip coin-stat"><Coins size={14} /> <strong>{coins}</strong></div><div className="profile-avatar">Σ</div><div><strong>{playerName || "Visitante"}</strong><small>{completedWorlds.filter(Boolean).length}/5 ilhas · {wins} vitórias</small></div></div>
        </header>

        <div className="world-rail">
          <div className="rail-label"><span>MAPA DA JORNADA</span><b>mundo {world.id} / 5</b></div>
          <div className="world-tabs">{worlds.map((item, index) => <button key={item.id} className={`world-tab ${index === worldIndex ? "active" : ""} ${index === 0 || completedWorlds[index - 1] ? "unlocked" : "locked"}`} onClick={() => selectWorld(index)}><span className="world-number">0{item.id}</span><span className="world-name">{item.title.split(" ").slice(0, 2).join(" ")}</span>{!(index === 0 || completedWorlds[index - 1]) && <LockKeyhole size={12} />}{completedWorlds[index] && <span className="world-complete">✓</span>}</button>)}</div>
        </div>

        <div className="content-grid">
          <aside className="left-panel panel-glass">
            <div className="panel-kicker"><span className="live-dot" /> MISSÃO ATIVA</div>
            <div className="world-heading"><span className="world-badge" style={{ background: world.color }}>{String(world.id).padStart(2, "0")}</span><div><h2>{world.title}</h2><p>{world.subtitle}</p></div></div>
            <p className="world-focus">{world.focus}</p>
            <div className="world-showcase"><div className="section-label">ARTE DA COLEÇÃO</div><img src={currentWorldArt} alt={`Painel ilustrado de ${world.title}`} /><small>Explore o cenário da ilha e use suas cartas para conquistar a próxima fase.</small></div><div className="world-reward-preview"><img src={getChestArt(worldIndex)} alt={`Prévia de ${chestRewards[worldIndex].chest}`} /><div><span className="section-label">BAÚ DA FASE</span><strong>{chestRewards[worldIndex].chest}</strong><small>{chestRewards[worldIndex].item} · +{chestRewards[worldIndex].coins} moedas</small></div></div>
            <div className="chapters"><div className="section-label">CASAS DA ILHA</div>{world.chapters.map((item, index) => {const unlocked=isStageUnlocked(index,stageProgress[worldIndex]??0),done=index<(stageProgress[worldIndex]??0);return <button key={item} disabled={!unlocked} onClick={() => unlocked&&setChapter(index)} className={`chapter ${chapter === index ? "current" : ""} ${done?'done':''} ${!unlocked?'locked':''}`}><span>{worldIndex+1}.{index+1}</span><div><strong>{item.replace(/^\d+\.\d+\s*/,"")}</strong><small>{done?"batalha concluída":chapter===index?"batalha atual":"bloqueada"}</small></div>{done?<span className="check">✓</span>:!unlocked?<LockKeyhole size={12}/>:null}</button>;})}</div>
            <div className="xp-card"><div><span>PROGRESSO DA ILHA</span><strong>{Math.round((stageProgress[worldIndex]??0) / world.chapters.length * 100)}%</strong></div><div className="xp-track"><i style={{ width: `${(stageProgress[worldIndex]??0) / world.chapters.length * 100}%` }} /></div><small>Vença as {world.chapters.length} casas para liberar a próxima ilha.</small></div>
          </aside>

          <section className="battle-column">
            <div className="battle-status"><div className="status-pill"><span className="live-dot" /> {battleOutcome?battleOutcome==='victory'?'FIM · VITÓRIA':battleOutcome==='draw'?'FIM · EMPATE':'FIM · DERROTA':'BATALHA AO VIVO'}</div><span className={`battle-clock ${battleElapsed>=REGULATION_SECONDS?"is-overtime":battleElapsed>=REGULATION_SECONDS-60?"is-double-elixir":""}`} aria-label={`Tempo ${battleClockLabel(battleElapsed)}`}><strong>{battleClockLabel(battleElapsed)}</strong><small>{battleElapsed>=REGULATION_SECONDS?"MORTE SÚBITA · ELIXIR 3×":battleElapsed>=REGULATION_SECONDS-60?"ELIXIR DUPLO · 2×":"ELIXIR · 1×"}</small></span><span className="arena-caption"><Swords size={14} /> {WORLD_MAPS[worldIndex].title}</span><span className="ai-chip"><span className="ai-pulse" /> IA · {enemyEnergy.toFixed(1)} elixir</span><button className="icon-button" onClick={resetBattle} title="Reiniciar batalha"><RotateCcw size={15} /></button></div>
            <div className="arena-frame" data-world={WORLD_MAPS[worldIndex].slug}>
              <WorldArena onAvailabilityChange={setArenaAvailable} worldIndex={worldIndex} stageIndex={chapter} active={view === "battle" && !survivalOpen && !inventoryOpen} allies={units} enemies={enemyUnits} modelIds={mainDeckIds} paused={Boolean(!battleStarted || challenge || pendingCard || inventoryOpen || survivalOpen || battleOutcome)} events={combatEvents} outcome={battleOutcome==='draw'?null:battleOutcome} towers={towers} placement={pendingCard ? {unit:{id:-1,cardId:pendingCard.id,name:pendingCard.name,kind:pendingCard.kind,...spawnPoint,color:world.color},point:spawnPoint,valid:validPlacement(pendingCard.kind,spawnPoint,units),radius:pendingCard.kind==='feitiço'?2.2:.65} : undefined} onSelectPoint={point=>setSpawnPoint(snapPlacement(point))} />
              <div className="tower-scoreboard enemy-scoreboard" aria-label="Torres rivais"><strong>Rival · {crowns(towers,true)} ♛</strong>{towers.filter(t=>t.enemy).map(t=><div key={t.id}><span>{t.role==='king'?'Rei':t.lane<0?'Lateral A':'Lateral B'} · {t.hp<=0?'destruída':t.active?'ativa':'em espera'}</span><meter min={0} max={t.maxHp} value={t.hp}/><small>{Math.ceil(t.hp)}/{t.maxHp} HP</small></div>)}</div>
              <div className="battle-field">{!pendingCard && !battleOutcome && units.length === 0 && enemyUnits.length === 0 && <div className="battle-hint"><Sparkles size={18} /><span>jogue uma carta<br /><small>e veja a prova avançar em 3D</small></span></div>}</div>
              <div className="tower-scoreboard ally-scoreboard" aria-label="Suas torres"><strong>Você · {crowns(towers,false)} ♛</strong>{towers.filter(t=>!t.enemy).map(t=><div key={t.id}><span>{t.role==='king'?'Rei':t.lane<0?'Lateral A':'Lateral B'} · {t.hp<=0?'destruída':t.active?'ativa':'em espera'}</span><meter min={0} max={t.maxHp} value={t.hp}/><small>{Math.ceil(t.hp)}/{t.maxHp} HP</small></div>)}</div>
            </div>
            {battleOutcome && <div className="battle-result" role="status">{battleOutcome==='victory'?'Vitória!':battleOutcome==='draw'?'Empate matemático':'Sua torre caiu'}<small>{battleOutcome==='victory'?'Casa inédita: +25 moedas e +1 essência; conclusão de ilha: +3 essências e um baú para abrir.':battleOutcome==='draw'?'Torres equilibradas. Reinicie para uma nova partida.':'Use Reiniciar batalha para tentar novamente.'}</small>{battleOutcome==='victory'&&<button onClick={()=>finishBattle(worldIndex)}>Receber recompensa</button>}</div>}
            {combatEvents.length>0 && <div className="combat-feed" aria-label="Habilidades ativadas" aria-live="polite">{combatEvents.slice(-3).map(event=><p key={event.id} data-event-type={event.type}><span style={{color:getCardProfile(event.cardId).glow}}>{getCardProfile(event.cardId).symbol}</span>{event.label}</p>)}</div>}
            <div className="battle-log"><span className="log-icon"><Zap size={14} /></span><span>{battleLog}</span><small className="enemy-log">Rival: {enemyLastCard}</small></div>

          </section>

          {view === "battle" && <aside ref={handRef} className="battle-hand" aria-label="Mão de cartas">
            <div className="hand-toolbar"><strong>Mão de batalha <span>· {activeCards.length}/4</span></strong><span className="hand-energy"><Zap size={18} /> {energy.toFixed(1)} / 10 <span>elixir</span></span>{nextCard&&<div className="next-card-preview" aria-label={`Próxima carta: ${nextCard.name}, ${nextCard.cost} elixir`}><img src={getCardImage(nextCard.id)} alt=""/><span>PRÓXIMA<small>{nextCard.name}</small></span><b>{nextCard.cost}</b></div>}<button onClick={() => setView("lobby")}><Layers3 size={17} /> Preparação</button></div>
            {pendingCard && <section className="spawn-panel" aria-label="Posicionar personagem">
              <div className="spawn-heading"><img src={getCardImage(pendingCard.id)} alt=""/><div><strong>{pendingCard.name}</strong><small>POSICIONAMENTO TÁTICO · BATALHA PAUSADA</small></div><button onClick={()=>setPendingCard(null)} aria-label="Cancelar posicionamento">×</button></div>
              <p>{abilityDescription(pendingCard.id)}</p>
              <p>{combatDescription({cardId:pendingCard.id,kind:pendingCard.kind})}</p>
              <p className="spawn-map-hint">Toque no campo ou use os controles. Tropas cruzam o rio pelas pontes. Cancele sem gastar elixir.</p>
              <div className="placement-controls">
                <label>Avanço: {spawnPoint.progress.toFixed(1)}%<input type="range" min="5" max={pendingCard.kind==='feitiço'?95:40} step="2.5" value={spawnPoint.progress} onChange={event=>setSpawnPoint(point=>({...point,progress:Number(event.target.value)}))}/></label>
                <label>Lateral: {spawnPoint.lane.toFixed(1)}<input type="range" min="-3" max="3" step="0.5" value={spawnPoint.lane} onChange={event=>setSpawnPoint(point=>({...point,lane:Number(event.target.value)}))}/></label>
              </div>
              <small role="status">{validPlacement(pendingCard.kind,spawnPoint,units)?'Posição válida':'Posição inválida ou ocupada; mova a prévia.'}</small>
              <button className="spawn-confirm" onClick={confirmSpawn} disabled={!arenaAvailable || !validPlacement(pendingCard.kind,spawnPoint,units)}>{arenaAvailable ? `${pendingCard.kind==='feitiço'?'Lançar':'Invocar'} · ${pendingCard.cost} elixir` : "Carregando prévia…"}</button>
            </section>}
            {!pendingCard && <div className="powerups"><span className="section-label">ITENS DE EVOLUÇÃO</span><div className="powerup-row"><button onClick={() => requestPowerUp("limit")}><span className="power-icon coral"><ArrowUpRight size={17} /></span><span><strong>Limite</strong><small>+2 energia</small></span></button><button onClick={() => requestPowerUp("root")}><span className="power-icon cyan"><Shield size={17} /></span><span><strong>Raiz</strong><small>+8 HP torre</small></span></button><button onClick={() => requestPowerUp("zoom")}><span className="power-icon gold"><Flame size={17} /></span><span><strong>Zoom</strong><small>acelera tropas</small></span></button></div></div>}
            {!pendingCard && <div className="card-stack">{activeCards.map((card) => <RoyaleCard key={card.id} card={card} level={(cardLevels[card.id] ?? 0) + 1} disabled={energy < card.cost || battleResolvedRef.current || Boolean(challenge) || Boolean(pendingCard) || Boolean(battleOutcome)} variant="compact" onPlay={playCard} />)}</div>}
          </aside>}

        </div>
        <footer className="footer-bar"><span>Calculus Royale <b>·</b> aprenda jogando</span><span><span className="mini-dot" /> progresso salvo localmente</span><span>conteúdo: cálculo diferencial e integral</span></footer>
      </section>
      {view === "lobby" && <section className="preparation-screen" aria-labelledby="preparation-title">
        <div className="preparation-heading"><span className="eyebrow">SEU PRÓXIMO DESAFIO</span><h2 id="preparation-title">Prepare sua estratégia</h2><p>{playerName ? `${playerName}, escolha` : "Escolha"} suas cartas e a ilha antes de entrar na batalha.</p></div>
        <div className="preparation-grid"><div className="preparation-island"><img src={WORLD_MAPS[worldIndex].art} alt={WORLD_MAPS[worldIndex].title} /><div><span className="eyebrow">ILHA {worldIndex + 1} · {worldIndex===0?"CAVERNA":"CASA"} {worldIndex+1}.{chapter+1}</span><h3>{WORLD_MAPS[worldIndex].title}</h3><p>{world.chapters[chapter].replace(/^\d+\.\d+\s*/,"")}</p><div className="stage-mission"><div><strong>{worldIndex===0?"CAVERNA":"CASA"} {worldIndex+1}.{chapter+1} · {stageEncounter.difficulty}</strong><span>{stageEncounter.objective}</span></div><small>TORRE RIVAL · {stageEncounter.enemyTowerHp} HP<br/>IA · {Math.round(stageEncounter.enemyPowerMultiplier*100)}% FORÇA<br/>INTERVALO · {stageEncounter.aiPlayInterval.toFixed(1)} S</small></div><div className="preparation-stage-route" aria-label={`${worldIndex===0?"Cavernas":"Casas"} da ${WORLD_MAPS[worldIndex].title}`}>{world.chapters.map((item,index)=>{const unlocked=isStageUnlocked(index,stageProgress[worldIndex]??0),done=index<(stageProgress[worldIndex]??0);return <button key={item} disabled={!unlocked} className={`${chapter===index?'active':''} ${done?'done':''}`} onClick={()=>{if(index!==chapter)resetBattleState(worldIndex,mainDeckIds,index);setChapter(index);}} title={item}><span>{done?'✓':!unlocked?<LockKeyhole size={14}/>:index+1}</span><small>{worldIndex+1}.{index+1}</small></button>;})}</div><button className="prepare-play" onClick={enterArena}><Swords size={22} /> Batalhar na {worldIndex===0?"Caverna":"Casa"} {worldIndex+1}.{chapter+1}</button><small>Vença esta {worldIndex===0?"caverna":"casa"} para avançar pela ilha. A próxima ilha só abre após a última etapa.</small></div></div>
        <div className="preparation-options">
          <button onClick={() => setView("deck")}><Layers3 /><span><strong>Meu deck</strong><small>{mainDeckIds.length} cartas · montar e evoluir</small></span><ArrowUpRight /></button>
          <button onClick={() => setView("map")}><MapPinned /><span><strong>Escolher ilha</strong><small>Explore as 5 arenas do cálculo</small></span><ArrowUpRight /></button>
          <button onClick={() => setInventoryOpen(true)}><PackageOpen /><span><strong>Inventário</strong><small>{pendingChests.length ? `${pendingChests.length} baú(s) pronto(s) para abrir` : "Baús, moedas e recompensas"}</small></span><ArrowUpRight /></button>
          <button onClick={startSurvival}><Flame /><span><strong>Sobrevivência</strong><small>Teste seu deck contra as ondas</small></span><ArrowUpRight /></button>
          <a href="./perfil/"><Star /><span><strong>Meu perfil</strong><small>Acesse seu perfil online</small></span><ArrowUpRight /></a>
          <a href="./ranking/"><Trophy /><span><strong>Ranking</strong><small>Confira a classificação</small></span><ArrowUpRight /></a>
        </div></div>
        <div className="preparation-deck"><div><h3>Seu deck está pronto?</h3><p>Deck de {DECK_SIZE} cartas · as 4 primeiras entram na mão e a próxima aparece para planejar o rodízio.</p></div><div className="preparation-portraits">{mainDeckCards.slice(0, 4).map(card => <figure key={card.id}><img src={getCardImage(card.id)} alt="" /><figcaption>{card.name}</figcaption></figure>)}</div><button className="close-mode" onClick={() => setView("deck")}>Editar deck <ArrowUpRight size={18} /></button></div>
      </section>}
      {view === "map" && <div className="mode-screen map-screen"><div className="mode-screen-header"><div><span className="eyebrow">CALCULUS ROYALE · MAPA PRINCIPAL</span><h2>Trilha das Ilhas do Cálculo</h2><p>Vença todas as casas de uma ilha para revelar a próxima arena.</p></div><button className="close-mode" onClick={() => setView("lobby")}><X size={17} /> Preparação</button></div><div className="completion-banner">{completionNotice !== null ? <><CheckCircle2 size={20} /><span><strong>Ilha {completionNotice + 1} concluída!</strong><small>{worlds[completionNotice].title} dominado. {celebrationWorld !== null ? "A próxima ilha será desbloqueada ao fim da celebração." : "A próxima ilha está pronta para ser explorada."}</small></span></> : <><MapPinned size={20} /><span><strong>Sua jornada</strong><small>Cada ilha possui várias casas. A próxima ilha só abre após a última batalha.</small></span></>}</div>{phaseReward && <div className={`reward-card reward-${phaseReward.rarity}`}><div className="reward-chest"><img src={getChestArt(phaseReward.world)} alt={phaseReward.chest} /></div><div><span className="section-label">{phaseReward.rarity.toUpperCase()} · {chestLedger.instances.find(c=>c.world===phaseReward.world)?.state==='opened'?'BAÚ ABERTO':'BAÚ CONQUISTADO · ABRA NO INVENTÁRIO'}</span><strong>{phaseReward.chest}</strong><small>Casa: +25 moedas · +1 essência. Conclusão: +3 essências.</small><small>{chestLedger.instances.find(c=>c.world===phaseReward.world)?.state==='opened'?'Conteúdo recebido:':'Conteúdo ao abrir:'} <Coins size={12} /> +{phaseReward.coins} moedas · ✦ +{phaseReward.essence} essência</small><small><Gem size={12} /> {phaseReward.icon} {phaseReward.item} · colecionável</small><button onClick={()=>setInventoryOpen(true)}>Ver baús</button></div><span className="reward-sparkle">✦</span></div>}<div className="island-path">{worlds.map((item, index) => { const celebrating = celebrationWorld === index; const unlocked = index === 0 || completedWorlds[index - 1]; const done = completedWorlds[index]; const houses=stageProgress[index]??0; return <div key={item.id} className={`island-node ${unlocked ? "island-unlocked" : "island-locked"} ${done ? "island-done" : ""} ${celebrating ? "island-celebrating" : ""}`}><div className="path-line" /><button onClick={() => selectWorld(index)} disabled={!unlocked || celebrating} className="island-button" style={{ "--island-color": item.color } as React.CSSProperties}><img className="island-map-art" src={WORLD_MAPS[index]?.art ?? WORLD_MAPS[0].art} alt="" aria-hidden="true" /><span className="island-map-shade" /><span className="island-glow" /><span className="island-number">0{item.id}</span><strong>{WORLD_MAPS[index]?.title ?? item.title}</strong><small>{celebrating ? "ilha concluída · celebrando" : done ? `${houses}/${item.chapters.length} casas · concluída` : unlocked ? `${houses}/${item.chapters.length} casas vencidas` : "conclua todas as casas anteriores"}</small>{celebrating ? <span className="celebration-burst">✦</span> : done ? <CheckCircle2 className="island-check" size={17} /> : !unlocked ? <LockKeyhole className="island-lock" size={16} /> : <ArrowUpRight className="island-arrow" size={17} />}</button></div>; })}</div><button className="map-deck-cta" onClick={() => setView("deck")}><Layers3 size={17} /><span><strong>Editar deck principal</strong><small>Escolha quais cartas aparecem no rodízio da batalha</small></span><ArrowUpRight size={16} /></button></div>}
      {view === "deck" && <div className="mode-screen deck-screen"><div className="mode-screen-header"><div><span className="eyebrow">OFICINA DE ESTRATÉGIA · {mainDeckIds.length} CARTAS SELECIONADAS</span><h2>Deck principal</h2><p>Monte um deck de {DECK_SIZE} cartas. Você recebe 4 na mão; a quinta fica visível e cada carta jogada gira para o fim do rodízio.</p></div><button className="close-mode" onClick={() => setView("lobby")}><MapPinned size={17} /> Preparação</button></div><div className="deck-editor-grid"><section className="deck-selected"><div className="section-label">DECK ATUAL · {mainDeckCards.length}/{DECK_SIZE} CARTAS</div><div className="deck-math-stats"><span><small>MÉDIA DE ELIXIR</small><strong>{averageElixirCost}</strong><small>Σ custos ÷ {mainDeckCards.length||1}</small></span><i><b style={{width:`${Math.min(100,Number(averageElixirCost)*10)}%`}} /></i><em>Equilibre cartas leves e pesadas para manter o ciclo.</em></div><div className="drag-hint"><ArrowUpRight size={13} /> Arraste uma carta sobre outra para reorganizar a ordem do rodízio</div><div className="selected-cards">{mainDeckCards.map((card, index) => <button key={card.id} draggable onDragStart={() => { dragGestureRef.current = true; setDraggedCardId(card.id); }} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderDeck(card.id)} onDragEnd={() => setDraggedCardId(null)} onClick={() => { if (dragGestureRef.current) { dragGestureRef.current = false; return; } editMainDeck(card); }} className={`selected-card ${draggedCardId === card.id ? "is-dragging" : ""}`}><span className="drag-grip">⠿</span><span className="selected-order">{String(index + 1).padStart(2, "0")}</span><span className="selected-symbol"><img src={getCardArt(card)} alt="" /></span><span><strong>{card.name}</strong><small>{card.formula}</small></span><X size={14} /></button>)}</div><button className="start-deck-button" onClick={() => { if(mainDeckIds.length!==DECK_SIZE){setToast(`Complete o deck com ${DECK_SIZE} cartas para batalhar.`);return;} setDeckQueue(mainDeckIds); setView("lobby"); setToast("Deck de 8 cartas equipado · rodízio pronto"); }}><Swords size={16} /> Salvar deck e voltar</button></section><section className="deck-library"><div className="deck-upgrades"><h3>Evoluir cartas</h3><p>Você tem {essence} essências. Cada evolução custa 3.</p>{mainDeckCards.map((card) => <button key={card.id} disabled={essence < 3} onClick={() => evolveCard(card)}>{card.name} · Nv. {(cardLevels[card.id] ?? 0) + 1} <span>✦ Evoluir</span></button>)}</div><div className="section-label">BIBLIOTECA DE CARTAS DESBLOQUEADAS</div><div className="library-grid">{allCards.filter((card) => !mainDeckIds.includes(card.id)).map((card) => <button key={card.id} onClick={() => editMainDeck(card)} className="library-card"><span className="library-art"><img src={getCardArt(card)} alt="" /></span><span><strong>{card.name}</strong><small>{card.formula}</small></span><ArrowUpRight size={14} /></button>)}</div></section></div></div>}
      {survivalOpen && <div className="survival-backdrop"><section className="survival-screen"><header className="survival-header"><div><span className="eyebrow">MODO INFINITO · TESTE DE DECK</span><h2>Torre de Sobrevivência</h2><p>Cada onda aumenta o dano. Use seu deck para resistir ao infinito.</p></div><button className="close-mode" onClick={closeSurvival}><X size={17} /> Sair</button></header><div className="survival-stats"><div><span>ONDA</span><strong>{survivalWave}</strong></div><div><span>PONTUAÇÃO</span><strong>{survivalScore}</strong></div><div><span>TORRE</span><strong>{survivalTower}%</strong></div></div><div className="survival-arena"><div className="survival-3d"><WorldArena worldIndex={worldIndex} active={survivalOpen} enemies={survivalEnemies} modelIds={activeCards.map(card=>card.id)} paused={!survivalRunning || Boolean(survivalChallenge)} /></div><div className="survival-deck"><div className="survival-deck-head"><span>DECK DE DEFESA</span><strong>{survivalElixir.toFixed(1)} / 10 elixir</strong></div><div className="survival-deck-cards">{activeCards.map((card) => <button key={card.id} onClick={() => playSurvivalCard(card)}><img className="survival-hand-art" src={getCardImage(card.id)} alt={card.name} /><small>{card.name}</small><b>{card.cost}</b></button>)}</div></div><div className="survival-tip"><Sparkles size={17} /><span>{survivalRunning ? "Aguente a próxima sequência de cartas avançadas." : survivalTower <= 0 ? "A torre caiu. Reinicie para tentar superar sua pontuação." : "Pronto para medir a resistência do deck."}</span></div></div>{survivalRewardNotice && <div className="survival-reward"><div className="badge-medallion">{survivalRewardNotice.icon}</div><div><span className="section-label">EMBLEMA CONQUISTADO</span><strong>{survivalRewardNotice.name}</strong><small>{survivalRewardNotice.detail} · +{survivalRewardNotice.reward} moedas</small></div><button onClick={() => setSurvivalRewardNotice(null)}><X size={14} /></button></div>}<div className="survival-bottom-grid"><div><div className="survival-section-label">EMBLEMAS DA TORRE</div><div className="survival-badges">{survivalBadges.map((badge) => <div key={badge.id} className={`survival-badge ${survivalBadgeIds.includes(badge.id) ? "earned" : "locked"}`} title={badge.detail}><span>{badge.icon}</span><small>{badge.name}</small></div>)}</div></div><div><div className="survival-section-label">MELHORES MARCAS</div><div className="leaderboard">{survivalLeaderboard.length ? survivalLeaderboard.slice(0, 5).map((entry, index) => <div key={`${entry.date}-${index}`}><b>0{index + 1}</b><span>Onda {entry.wave}<small>{entry.date}</small></span><strong>{entry.score}</strong></div>) : <p>Nenhuma marca registrada ainda.</p>}</div></div></div><div className="survival-actions">{survivalRunning && <button className="survival-challenge-button" onClick={requestSurvivalChallenge}>? Desafio da onda {survivalWave}</button>}{!survivalRunning && <button className="start-deck-button" onClick={startSurvival}><Flame size={16} /> {survivalTower <= 0 ? "Tentar novamente" : "Iniciar torre"}</button>}<button className="close-mode" onClick={closeSurvival}>Voltar ao jogo</button></div></section></div>}
      {inventoryOpen && <div className="inventory-backdrop" onClick={() => setInventoryOpen(false)}><aside className="inventory-drawer" onClick={(event) => event.stopPropagation()}><div className="inventory-header"><div><span className="eyebrow">CALCULUS ROYALE · COLEÇÃO</span><h2>Inventário tático</h2><p>Itens especiais, personagens vinculados e recompensas das ilhas.</p></div><button className="close-mode" onClick={() => setInventoryOpen(false)}><X size={17} /> Fechar</button></div><div className="inventory-totals"><div><Coins size={17} /><span><strong>{coins}</strong><small>moedas</small></span></div><div><Gem size={17} /><span><strong>{essence}</strong><small>essência</small></span></div><div><PackageOpen size={17} /><span><strong>{rewardInventory.length}</strong><small>baús abertos</small></span></div></div><div className="inventory-content-grid"><SpecialItemsBoard worldArt={currentWorldArt} worldTitle={WORLD_MAPS[worldIndex].title} featuredCards={mainDeckCards.slice(0,2).map(card=>({id:card.id,name:card.name,formula:card.formula}))}/><div className="inventory-list"><div className="section-label">BAÚS PENDENTES · SEM ESPERA</div>{pendingChests.map(reward=><div key={reward.id} className={`inventory-item inventory-${reward.rarity}`}><div className="inventory-icon"><img src={getChestArt(reward.world)} alt="" /></div><div><strong>{reward.chest}</strong><small>Garantido: +{reward.coins} moedas · +{reward.essence} essência</small><em>{reward.item} · marco colecionável</em><button onClick={()=>claimChest(reward.id)}>Abrir baú</button></div></div>)}<div className="section-label">RECOMPENSAS REGISTRADAS</div>{rewardInventory.length ? [...rewardInventory].reverse().map((reward, index) => <div key={`${reward.claimedAt}-${index}`} className={`inventory-item inventory-${reward.rarity}`}><div className="inventory-icon"><img src={getChestArt(reward.world)} alt={reward.chest} /></div><div><strong>{reward.chest}</strong><small>Fase {reward.world + 1} · {reward.rarity}</small><em><Coins size={12} /> +{reward.coins} · +{reward.essence} essência · {reward.item} (colecionável)</em></div><Star size={14} /></div>) : <div className="inventory-empty"><ScrollText size={22} /><strong>Nenhum baú aberto ainda</strong><small>Conclua uma ilha para adicionar sua primeira recompensa.</small></div>}</div></div></aside></div>}

      {survivalChallenge && <div className="challenge-backdrop"><div className="challenge-modal survival-challenge-modal"><div className="challenge-icon">∫</div><span className="section-label">DESAFIO DA TORRE · ONDA {survivalChallengeWave}</span><h2>Resolva para ganhar vantagem</h2><p>{survivalChallenge.question}</p><div className="challenge-options">{survivalChallenge.options.map((option) => <button key={option} onClick={() => answerSurvivalChallenge(option)}>{option}</button>)}</div><small>A dificuldade acompanha o número de ondas sobrevividas.</small></div></div>}
      {challenge && <div className="challenge-backdrop"><div className="challenge-modal" role="dialog" aria-modal="true" aria-labelledby="powerup-title"><button className="challenge-cancel" onClick={() => setChallenge(null)} aria-label="Cancelar desafio"><X size={22} /></button><div className="challenge-icon">?</div><span className="section-label">DESAFIO-RELÂMPAGO</span><h2 id="powerup-title">Resolva para ativar o power-up</h2><p>{challenge.question}</p><div className="challenge-options">{challenge.options.map((option) => <button key={option} onClick={() => answerChallenge(option)}>{option}</button>)}</div><small>Batalha pausada enquanto você responde.</small></div></div>}
      {toast && <div className="toast"><span className="toast-mark">∂</span>{toast}</div>}
    </main>
  );
}
