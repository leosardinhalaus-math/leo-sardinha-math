import { stepCombat, SPAWN_ZONES, zoneAvailable, type CombatUnit, type CombatEvent } from "@/game/combat";
import { BATTLE_TICK_SECONDS, DECK_SIZE, ELIXIR_PER_TICK, OVERTIME_SECONDS, REGULATION_SECONDS, STARTING_ELIXIR, battleClockLabel, compareTowerHealth, elixirMultiplier, normalizeDeck, type MatchOutcome } from "@/game/battleRules";
import { getStageEncounter } from "@/game/stageEncounters";
import { getCardProfile, abilityDescription } from "@/game/cardProfiles";
import { isStageUnlocked, normalizeStageProgress, resolveStageVictory } from "@/game/progression";
import { createChallengePicker, type Challenge } from "@/data/powerUpChallenges";
import { WORLD_MAPS } from "@/data/worldMaps";
import { readStorage, storageKeys, writeStorage } from "@/data/saveGame";
import { getCardImage, getCardImageFallback } from "@/data/cardArt";
import RoyaleCard from "./RoyaleCard";
import SpecialItemsBoard from "./SpecialItemsBoard";
import { useEffect, useMemo, useRef, useState } from "react";
import WorldArena from "./WorldArena";
import { Swords, Zap, Trophy, LockKeyhole, Sparkles, Shield, Flame, RotateCcw, BookOpen, ArrowUpRight, MapPinned, Layers3, X, CheckCircle2, Gift, Coins, Volume2, VolumeX, PackageOpen, Gem, Star, ScrollText } from "lucide-react";

type Card = {
  id: string;
  name: string;
  icon: string;
  kind: "tropa" | "feitiço" | "estrutura" | "relíquia";
  cost: number;
  rarity: "comum" | "rara" | "épica" | "lendária";
  formula: string;
  effect: string;
  power: number;
};

type World = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  chapters: string[];
  focus: string;
  cards: Card[];
};

type Unit = CombatUnit;
type View = "home" | "lobby" | "map" | "battle" | "deck";
type CollisionEvent = { left: string; right: string; leftKind: Card["kind"]; rightKind: Card["kind"]; detail: string; style: "kinetic" | "arcane" | "fortress" | "relic" | "hybrid" };
type ChestReward = { rarity: "comum" | "rara" | "épica" | "lendária"; chest: string; coins: number; essence: number; item: string; icon: string };
type InventoryReward = ChestReward & { world: number; claimedAt: number };
type SurvivalEntry = { score: number; wave: number; date: string };
type SurvivalBadge = { id: string; wave: number; name: string; icon: string; detail: string; reward: number };

const worlds: World[] = [
  {
    id: 1,
    title: "Portões da Derivada",
    subtitle: "O instante ganha velocidade",
    color: "#fb8068",
    glow: "#25d6e5",
    chapters: ["1.1 Velocidade & reta tangente", "1.2 Derivadas elementares", "1.3 Regras de diferenciação", "1.4 Continuidade", "1.5 Quociente & trigonometria", "1.6 Euler & Bernoulli"],
    focus: "Derivada mede a taxa de mudança no instante; uma carta bem lançada encontra a reta tangente.",
    cards: [
      { id: "slope", name: "Arqueira da Derivada", icon: "↗", kind: "tropa", cost: 3, rarity: "comum", formula: "f'(a) = lim [f(a+h)−f(a)] / h", effect: "Avança velozmente e perfura uma torre.", power: 14 },
      { id: "limit", name: "Guardião do Limite", icon: "lim", kind: "estrutura", cost: 4, rarity: "rara", formula: "limₓ→ₐ f(x)", effect: "Estabiliza a defesa conforme a função se aproxima do alvo.", power: 18 },
      { id: "power", name: "Mago da Potência", icon: "xⁿ", kind: "tropa", cost: 4, rarity: "rara", formula: "d/dx xⁿ = n·xⁿ⁻¹", effect: "Golpe pesado; quanto maior n, maior o impacto.", power: 20 },
      { id: "sine", name: "Bailarina Seno", icon: "sin", kind: "tropa", cost: 2, rarity: "comum", formula: "(sen x)' = cos x", effect: "Dança em ondas e distrai a defesa.", power: 9 },
      { id: "euler", name: "Orbe de Euler", icon: "eˣ", kind: "feitiço", cost: 5, rarity: "épica", formula: "(eˣ)' = eˣ", effect: "Explosão auto-regenerativa no alvo.", power: 28 },
    ],
  },
  {
    id: 2,
    title: "Cânion da Cadeia",
    subtitle: "Dentro de dentro de dentro",
    color: "#a482ff",
    glow: "#ffcc67",
    chapters: ["2.1 Regra da cadeia", "2.2 Inversas & ln(x)", "2.3 Diferenciação implícita", "2.4 Taxas relacionadas", "2.5 Potências reais"],
    focus: "Componha efeitos: a derivada de f(g(x)) multiplica a mudança externa pela mudança interna.",
    cards: [
      { id: "chain", name: "Mago da Cadeia", icon: "∘", kind: "tropa", cost: 3, rarity: "rara", formula: "(f∘g)' = f'(g) · g'", effect: "Cada acerto dispara uma flecha interna.", power: 16 },
      { id: "ln", name: "Ladina ln(x)", icon: "ln", kind: "tropa", cost: 2, rarity: "comum", formula: "(ln x)' = 1/x", effect: "Fica mais precisa conforme se aproxima do alvo.", power: 10 },
      { id: "implicit", name: "Golem Implícito", icon: "∂", kind: "estrutura", cost: 5, rarity: "épica", formula: "F(x,y)=0 → y' = −Fₓ/Fᵧ", effect: "Protege aliados com escudo de equação.", power: 25 },
      { id: "rate", name: "Engenheiro das Taxas", icon: "dt", kind: "feitiço", cost: 4, rarity: "rara", formula: "dx/dt · dy/dx = dy/dt", effect: "Acelera todas as tropas no caminho.", power: 18 },
    ],
  },
  {
    id: 3,
    title: "Observatório do Valor Médio",
    subtitle: "Leia a forma antes do golpe",
    color: "#44dfab",
    glow: "#ff9670",
    chapters: ["3.1 Valor médio de Cauchy", "3.2 Crescimento & decrescimento", "3.3 Derivadas superiores", "3.4 Taylor & erro", "3.5 Otimização", "3.6 Gráficos & Newton"],
    focus: "Analisar crescimento, concavidade e aproximações permite decidir onde investir o próximo elixir.",
    cards: [
      { id: "cauchy", name: "Guardião de Cauchy", icon: "≈", kind: "estrutura", cost: 4, rarity: "rara", formula: "f'/g' = [f(b)−f(a)]/[g(b)−g(a)]", effect: "Equilibra os dois lados da arena.", power: 18 },
      { id: "taylor", name: "Oráculo de Taylor", icon: "Σ", kind: "tropa", cost: 3, rarity: "épica", formula: "f(x) ≈ Σ f⁽ⁿ⁾(a)(x−a)ⁿ/n!", effect: "Replica o último ataque com erro mínimo.", power: 22 },
      { id: "newton", name: "Titã de Newton", icon: "N", kind: "tropa", cost: 5, rarity: "lendária", formula: "xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)", effect: "Salta para a raiz mais próxima da torre.", power: 30 },
      { id: "opt", name: "Bússola Ótima", icon: "⌖", kind: "relíquia", cost: 2, rarity: "comum", formula: "f'(x)=0 → candidato", effect: "Encontra o ponto de maior dano.", power: 11 },
    ],
  },
  {
    id: 4,
    title: "Delta da Integral",
    subtitle: "A variação se acumula",
    color: "#b18aff",
    glow: "#51d8ff",
    chapters: ["4.1 Área & variação acumulada", "4.2 Valor médio da integral", "4.3 Teorema fundamental", "4.4 Primitivas", "4.5 Volumes & Cavalieri", "4.6 Fractais & Gabriel"],
    focus: "A integral acumula pequenas variações; cada ponto de vida recuperado representa uma soma contínua.",
    cards: [
      { id: "area", name: "Sacerdotisa da Integral", icon: "∫", kind: "tropa", cost: 3, rarity: "comum", formula: "∫ₐᵇ f(x)dx = área líquida", effect: "Recupera vida proporcional ao terreno.", power: 15 },
      { id: "ftc", name: "Colosso Fundamental", icon: "F", kind: "feitiço", cost: 4, rarity: "épica", formula: "d/dx ∫ₐˣ f(t)dt = f(x)", effect: "Converte acúmulo em um raio imediato.", power: 24 },
      { id: "cavalieri", name: "Mestre Cavalieri", icon: "▥", kind: "estrutura", cost: 5, rarity: "lendária", formula: "mesmas seções → mesmo volume", effect: "Cria uma torre espelhada temporária.", power: 27 },
      { id: "fractal", name: "Semente Fractal", icon: "✣", kind: "relíquia", cost: 2, rarity: "rara", formula: "padrão em toda escala", effect: "Duplica unidades pequenas.", power: 12 },
    ],
  },
  {
    id: 5,
    title: "Forja da Antiderivada",
    subtitle: "Técnica, precisão e limite",
    color: "#ffb269",
    glow: "#fa6f92",
    chapters: ["5.1 Substituição", "5.2 Integração por partes", "5.3 Trapézios & métodos numéricos", "5.4 Integrais impróprias", "5.5 Comparação & séries"],
    focus: "As técnicas de integração transformam problemas difíceis em passos que podem ser verificados.",
    cards: [
      { id: "sub", name: "Alquimista u", icon: "u", kind: "tropa", cost: 3, rarity: "rara", formula: "u=g(x), du=g'(x)dx", effect: "Troca a variável e surpreende a torre.", power: 17 },
      { id: "parts", name: "Duelista por Partes", icon: "uv", kind: "tropa", cost: 4, rarity: "épica", formula: "∫u dv = uv − ∫v du", effect: "Divide o dano em dois golpes precisos.", power: 23 },
      { id: "trap", name: "Engenheira Trapézio", icon: "▱", kind: "estrutura", cost: 2, rarity: "comum", formula: "Tₙ = h/2·[f₀+2Σfᵢ+fₙ]", effect: "Ataque estável mesmo sem fórmula fechada.", power: 13 },
      { id: "improper", name: "Sentinela Imprópria", icon: "∞", kind: "relíquia", cost: 5, rarity: "lendária", formula: "limite de uma integral", effect: "Resiste enquanto a série converge.", power: 29 },
    ],
  },
];


const extraCards: Record<number, Card[]> = {
  1: [
    { id: "continuity", name: "Sentinela Contínua", icon: "≈", kind: "estrutura", cost: 3, rarity: "rara", formula: "lim f(x) = f(a)", effect: "Mantém o fluxo sem saltos na defesa.", power: 13 },
    { id: "quotient", name: "Ladina do Quociente", icon: "÷", kind: "tropa", cost: 4, rarity: "rara", formula: "(u/v)' = (u'v−uv')/v²", effect: "Divide o alvo e acerta duas vezes.", power: 19 },
    { id: "secant", name: "Cavaleiro Secante", icon: "sec", kind: "tropa", cost: 2, rarity: "comum", formula: "(sec x)' = sec x·tan x", effect: "Ganha alcance quando a tangente cresce.", power: 10 },
    { id: "bernoulli", name: "Alquimista Bernoulli", icon: "e", kind: "feitiço", cost: 5, rarity: "lendária", formula: "(1+1/n)ⁿ → e", effect: "Transforma limite em explosão exponencial.", power: 31 },
  ],
  2: [
    { id: "inverse", name: "Bruxa da Inversa", icon: "f⁻¹", kind: "tropa", cost: 3, rarity: "rara", formula: "(f⁻¹)' = 1/f'(f⁻¹)", effect: "Devolve o dano pelo caminho inverso.", power: 15 },
    { id: "expchain", name: "Elo Exponencial", icon: "aˣ", kind: "relíquia", cost: 2, rarity: "comum", formula: "(aˣ)' = aˣ ln a", effect: "Amplifica uma carta composta.", power: 12 },
    { id: "root", name: "Mestre das Raízes", icon: "√", kind: "tropa", cost: 4, rarity: "épica", formula: "xᵖ/ᑫ = √[q]{xᵖ}", effect: "Encontra a raiz do escudo inimigo.", power: 21 },
    { id: "mirror", name: "Espelho Implícito", icon: "↔", kind: "estrutura", cost: 5, rarity: "lendária", formula: "dy/dx = −Fₓ/Fᵧ", effect: "Replica a última defesa lançada.", power: 26 },
  ],
  3: [
    { id: "mean", name: "Juiz de Cauchy", icon: "M", kind: "estrutura", cost: 3, rarity: "comum", formula: "f'(c)/g'(c) = Δf/Δg", effect: "Redistribui a força entre as duas lanes.", power: 14 },
    { id: "growth", name: "Batedora Crescente", icon: "+", kind: "tropa", cost: 2, rarity: "comum", formula: "f'(x)>0 ⇒ f cresce", effect: "Corre mais rápido em terreno positivo.", power: 11 },
    { id: "taylor2", name: "Escriba de Taylor", icon: "T₂", kind: "relíquia", cost: 4, rarity: "épica", formula: "P₂(x)=f(a)+f'(a)h+f''(a)h²/2", effect: "Prevê o próximo movimento inimigo.", power: 23 },
    { id: "miner", name: "Mineradora Ótima", icon: "min", kind: "tropa", cost: 5, rarity: "lendária", formula: "f'(x)=0; f''(x)<0", effect: "Escava o máximo local da torre.", power: 28 },
  ],
  4: [
    { id: "average", name: "Monge do Valor Médio", icon: "μ", kind: "tropa", cost: 2, rarity: "comum", formula: "f̄ = 1/(b−a) ∫f", effect: "Equilibra a vida das duas torres.", power: 10 },
    { id: "volume", name: "Tecelã de Volumes", icon: "V", kind: "estrutura", cost: 4, rarity: "rara", formula: "V = ∫ A(x)dx", effect: "Constrói uma barreira em camadas.", power: 20 },
    { id: "surface", name: "Navegadora de Superfície", icon: "S", kind: "tropa", cost: 3, rarity: "épica", formula: "S = ∫ 2πr ds", effect: "Cobre a arena com dano contínuo.", power: 18 },
    { id: "gabriel", name: "Arauto de Gabriel", icon: "∞", kind: "feitiço", cost: 5, rarity: "lendária", formula: "∫₁∞ 1/x² dx = 1", effect: "Vence uma distância infinita com precisão.", power: 32 },
    { id: "cavalieri-advanced", name: "Arquiteto de Cavalieri", icon: "▥²", kind: "estrutura", cost: 6, rarity: "lendária", formula: "A₁(x)=A₂(x) ⇒ V₁=V₂", effect: "Compara seções e duplica a defesa por um instante.", power: 35 },
    { id: "surface-flux", name: "Tecelã do Fluxo", icon: "∯", kind: "relíquia", cost: 4, rarity: "épica", formula: "∯_S F·n dS", effect: "Transforma fluxo acumulado em dano contínuo.", power: 26 },
  ],
  5: [
    { id: "parts2", name: "Mestre das Partes", icon: "uv", kind: "tropa", cost: 3, rarity: "rara", formula: "∫u dv = uv−∫vdu", effect: "Troca posição e força com a unidade rival.", power: 17 },
    { id: "simpson", name: "Mecânica Simpson", icon: "Sₙ", kind: "estrutura", cost: 2, rarity: "comum", formula: "Sₙ ≈ h/3(f₀+4f₁+2f₂+…)", effect: "Aproxima o dano com três pontos.", power: 12 },
    { id: "compare", name: "Oráculo da Comparação", icon: "≤", kind: "relíquia", cost: 4, rarity: "épica", formula: "0≤f≤g; ∫g converge ⇒ ∫f", effect: "Copia apenas o menor dano recebido.", power: 22 },
    { id: "series", name: "Feiticeiro da Série", icon: "Σ∞", kind: "tropa", cost: 5, rarity: "lendária", formula: "Σ aₙ converge?", effect: "Mergulha no infinito e retorna com combo.", power: 30 },
    { id: "simpson-advanced", name: "Oráculo de Simpson", icon: "Sₙ²", kind: "feitiço", cost: 6, rarity: "lendária", formula: "Sₙ → ∫ₐᵇ f(x)dx", effect: "Aproxima a torre com precisão numérica crescente.", power: 36 },
    { id: "comparison", name: "Guardião da Comparação", icon: "≤∞", kind: "estrutura", cost: 4, rarity: "épica", formula: "0≤f≤g, ∫g converge", effect: "Bloqueia dano enquanto a série rival converge.", power: 25 },
  ],
};

const getCumulativeCards = (worldIndex: number) => worlds.slice(0, worldIndex + 1).flatMap((item) => [...item.cards, ...(extraCards[item.id] ?? [])]).map(card=>({...card,effect:abilityDescription(card.id)}));
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

const chestRewards: Record<number, ChestReward> = {
  0: { rarity: "comum", chest: "Baú do Aprendiz", coins: 80, essence: 1, item: "Fragmento de Tangente", icon: "↗" },
  1: { rarity: "rara", chest: "Baú da Cadeia", coins: 135, essence: 2, item: "Núcleo de Composição", icon: "∘" },
  2: { rarity: "épica", chest: "Baú do Valor Médio", coins: 220, essence: 3, item: "Pergaminho de Taylor", icon: "Σ" },
  3: { rarity: "lendária", chest: "Baú Integral Prismático", coins: 340, essence: 5, item: "Relíquia de Cavalieri", icon: "∫" },
  4: { rarity: "lendária", chest: "Baú do Infinito", coins: 500, essence: 8, item: "Selo da Convergência", icon: "∞" },
};
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
  const available = getCumulativeCards(4).map((card) => card.id);
  const saved = readStorage<string[]>(storageKeys.deck, available.slice(0, DECK_SIZE));
  return normalizeDeck(saved, available);
};

export default function GameCanvas() {
  const [worldIndex, setWorldIndex] = useState(() => Math.min(4, Math.max(0, readStorage(storageKeys.worldIndex, 0))));
  const [energy, setEnergy] = useState(STARTING_ELIXIR);
  const [enemyTower, setEnemyTower] = useState(() => getWorldEnemyHp(worldIndex, 0));
  const [allyTower, setAllyTower] = useState(96);
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
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [spawnZone, setSpawnZone] = useState('A1');
  const [arenaAvailable,setArenaAvailable]=useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleElapsed, setBattleElapsed] = useState(0);
  const [battleOutcome, setBattleOutcome] = useState<MatchOutcome|null>(null);
  const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);
  const combatTimeRef = useRef(0);
  const battleElapsedRef = useRef(0);
  const suddenDeathRef = useRef(false);
  const enemyDeckRef = useRef<string[]>([]);
  const enemyLaneRef = useRef(-1.65);
  const aiElapsedRef = useRef(0);
  const unitSequenceRef = useRef(Date.now());
  const battleSnapshot = useRef({units,enemyUnits,energy,enemyEnergy,allyTower,enemyTower});
  battleSnapshot.current = {units,enemyUnits,energy,enemyEnergy,allyTower,enemyTower};
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
  const [rewardInventory, setRewardInventory] = useState<InventoryReward[]>(() => readStorage(storageKeys.inventory, []));
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
    setEnemyTower(getWorldEnemyHp(targetWorldIndex, targetChapter));
    setAllyTower(96);
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
    enemyDeckRef.current = nextDeck.slice(0, DECK_SIZE);
    enemyLaneRef.current = -1.65;
    combatTimeRef.current = 0;
    aiElapsedRef.current = 0;
  };

  const finishBattle = (targetWorldIndex = worldIndex) => {
    if (battleResolvedRef.current) return;
    battleResolvedRef.current = true;
    setUnits([]);
    setEnemyUnits([]);
    setEnemyEnergy(0);
    setWins((value) => value + 1);

    const alreadyCompleted = completedWorldsRef.current[targetWorldIndex];
    const totalStages=worlds[targetWorldIndex].chapters.length;
    const stageResult=resolveStageVictory(stageProgressRef.current[targetWorldIndex]??0,chapter,totalStages,alreadyCompleted);
    if (stageResult.kind==='replay') {
      setCompletionNotice(null);
      setCelebrationWorld(null);
      setPhaseReward(null);
      setView("lobby");
      setBattleLog(`Casa ${targetWorldIndex+1}.${chapter+1} vencida novamente.`);
      playSound("celebration");
      setToast(`Casa ${targetWorldIndex+1}.${chapter+1} vencida novamente · progresso preservado.`);
      return;
    }

    setStageProgress(current=>{const next=[...current];next[targetWorldIndex]=stageResult.nextProgress;return next;});
    if(stageResult.kind==='advance'){
      setChapter(stageResult.nextStage);
      setCompletionNotice(null);
      setCelebrationWorld(null);
      setPhaseReward(null);
      setCoins(value=>value+25);
      setEssence(value=>value+1);
      setView("lobby");
      setBattleLog(`Casa ${targetWorldIndex+1}.${chapter+1} concluída. A Casa ${targetWorldIndex+1}.${stageResult.nextStage+1} foi liberada.`);
      playSound("celebration");
      setToast(`Casa ${targetWorldIndex+1}.${chapter+1} concluída · próxima batalha liberada.`);
      return;
    }

    const chest = chestRewards[targetWorldIndex];
    setEssence((value) => value + 3 + chest.essence);
    setCompletionNotice(targetWorldIndex);
    setCelebrationWorld(targetWorldIndex);
    setPhaseReward(null);
    setView("map");
    setBattleLog(`${worlds[targetWorldIndex].title} concluído. Celebração e recompensa a caminho.`);
    playSound("celebration");
    setToast(`Fase ${targetWorldIndex + 1} concluída! Celebração iniciada no mapa.`);
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
  useEffect(() => { writeStorage(storageKeys.inventory, rewardInventory); }, [rewardInventory]);
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
      const next=stepCombat(current.units,current.enemyUnits,BATTLE_TICK_SECONDS,combatTimeRef.current,worldIndex);
      setUnits(next.allies);setEnemyUnits(next.enemies);
      setEnergy(value=>Math.min(10,Number((value+ELIXIR_PER_TICK*multiplier).toFixed(3))));
      setEnemyEnergy(value=>Math.min(10,Number((value+ELIXIR_PER_TICK*multiplier).toFixed(3))));
      const nextEnemy=Math.max(0,current.enemyTower-next.enemyDamage),nextAlly=Math.max(0,current.allyTower-next.allyDamage);
      setEnemyTower(nextEnemy);setAllyTower(nextAlly);
      if(next.events.length){setCombatEvents(previous=>[...previous,...next.events].slice(-12));setBattleLog(next.events[next.events.length-1].label);if(next.events.some(e=>e.type==='ability'))playSound('arcane');}
      const outcome=compareTowerHealth(nextAlly,nextEnemy,96,getWorldEnemyHp(worldIndex,chapter));
      if(nextEnemy===0||nextAlly===0){setBattleOutcome(outcome);if(outcome!=='victory')battleResolvedRef.current=true;setBattleLog(outcome==='victory'?'Torre rival derrubada!':outcome==='draw'?'As duas torres caíram juntas.':'Sua torre caiu.');if(outcome==='defeat')setToast('Sua torre caiu. Reinicie para tentar outra formação.');return;}
      if(wasSuddenDeath&&(next.enemyDamage>0||next.allyDamage>0)){setBattleOutcome(outcome);if(outcome!=='victory')battleResolvedRef.current=true;setBattleLog(outcome==='victory'?'Morte súbita: primeiro golpe na torre — vitória!':outcome==='defeat'?'Morte súbita: o rival atingiu sua torre primeiro.':'Morte súbita: ataques simultâneos — empate.');return;}
      if(!wasSuddenDeath&&elapsed>=REGULATION_SECONDS){
        suddenDeathRef.current=true;
        if(outcome!=='draw'){setBattleOutcome(outcome);if(outcome!=='victory')battleResolvedRef.current=true;setBattleLog(outcome==='victory'?'Tempo! Sua torre terminou com mais vida.':'Tempo! A torre rival terminou com mais vida.');return;}
        setBattleLog('Empate matemático · morte súbita: o próximo dano à torre decide.');setToast('Elixir triplo · a próxima torre atingida decide a partida.');
      }
      if(elapsed>=REGULATION_SECONDS+OVERTIME_SECONDS){setBattleOutcome(outcome);if(outcome!=='victory')battleResolvedRef.current=true;setBattleLog(outcome==='draw'?'Fim da morte súbita · empate matemático.':outcome==='victory'?'Fim da morte súbita · sua torre preservou mais vida.':'Fim da morte súbita · o rival preservou mais vida.');return;}
      if(battleResolvedRef.current)return;
      aiElapsedRef.current+=BATTLE_TICK_SECONDS;
      if(aiElapsedRef.current<stageEncounter.aiPlayInterval)return;
      const catalog=getCumulativeCards(4);
      const queue=enemyDeckRef.current.length?enemyDeckRef.current:mainDeckIds.slice(0,DECK_SIZE);
      const candidates=queue.map((id,index)=>({card:catalog.find(card=>card.id===id),index})).filter((entry):entry is {card:Card;index:number}=>entry.card!==undefined&&entry.card.cost<=current.enemyEnergy);
      if(!candidates.length)return;
      const threat=current.units.filter(unit=>unit.hp!>0).sort((a,b)=>b.progress-a.progress)[0];
      const chosen=threat?candidates.reduce((best,entry)=>{
        const score=(card:Card)=>card.power/card.cost+(card.kind==='estrutura'?.45:0)-Math.abs(card.cost-3)*.06;
        return score(entry.card)>score(best.card)?entry:best;
      }):candidates[0];
      aiElapsedRef.current=0;
      const aiCard=chosen.card;
      enemyDeckRef.current=[...queue.slice(0,chosen.index),...queue.slice(chosen.index+1),aiCard.id];
      const lane=threat?.lane??enemyLaneRef.current;
      if(!threat)enemyLaneRef.current=enemyLaneRef.current===-1.65?1.65:-1.65;
      const id=++unitSequenceRef.current;
      setEnemyUnits(currentUnits=>[...currentUnits,{id,cardId:aiCard.id,icon:aiCard.icon,name:aiCard.name,kind:aiCard.kind,progress:5,power:Math.max(4,Math.round(aiCard.power*stageEncounter.enemyPowerMultiplier)),color:'#ff7d72',lane}]);
      setEnemyEnergy(value=>Math.max(0,Number((value-aiCard.cost).toFixed(2))));
      setEnemyLastCard(`${aiCard.name} · ${getCardProfile(aiCard.id).ability}`);
    },100);
    return()=>{window.clearInterval(timer);};
  },[worldIndex,chapter,view,battleStarted,battleOutcome,challenge,pendingCard,inventoryOpen,survivalOpen,mainDeckIds]);

  // Deixa as animações finais aparecerem antes do fluxo de recompensa existente.
  useEffect(()=>{if(battleOutcome!=='victory')return;const timer=window.setTimeout(()=>finishBattle(worldIndex),1800);return()=>window.clearTimeout(timer);},[battleOutcome,worldIndex]);

  useEffect(() => {
    if (celebrationWorld === null) return;
    const timer = window.setTimeout(() => {
      if (completedWorldsRef.current[celebrationWorld]) {
        setCelebrationWorld(null);
        return;
      }
      setCompletedWorlds((currentWorlds) => { const nextWorlds = [...currentWorlds]; nextWorlds[celebrationWorld] = true; return nextWorlds; });
      const reward = chestRewards[celebrationWorld];
      setCoins((value) => value + reward.coins);
      setPhaseReward({ ...reward, world: celebrationWorld });
      setRewardInventory((items) => items.some((item) => item.world === celebrationWorld && item.chest === reward.chest) ? items : [...items, { ...reward, world: celebrationWorld, claimedAt: Date.now() }]);
      playSound("reward");
      setCelebrationWorld(null);
      setToast(`Ilha ${celebrationWorld + 1} celebrada · recompensa recebida.`);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [celebrationWorld]);


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
  const allCards = useMemo(() => getCumulativeCards(4), []);
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
    const available=SPAWN_ZONES.find(zone=>zoneAvailable(zone.id,units));
    if(!available){setToast('As zonas estão ocupadas. Aguarde suas tropas avançarem.');return;}
    setSpawnZone(available.id);setPendingCard(card);
    window.requestAnimationFrame(()=>document.querySelector('.arena-frame')?.scrollIntoView({block:'center',behavior:'smooth'}));
  };
  const confirmSpawn = () => {
    const card=pendingCard;
    if(!card||!arenaAvailable||battleResolvedRef.current||battleOutcome||energy<card.cost)return;
    if(!zoneAvailable(spawnZone,units)){setToast('Zona ocupada. Escolha outra posição.');return;}
    const zone=SPAWN_ZONES.find(item=>item.id===spawnZone)!;
    const power=Math.round(card.power*(1+(cardLevels[card.id]??0)*.12));
    setEnergy(value=>Math.max(0,Number((value-card.cost).toFixed(2))));
    setUnits(value=>[...value,{id:++unitSequenceRef.current,cardId:card.id,icon:card.icon,name:card.name,kind:card.kind,progress:zone.progress,power,color:world.color,lane:zone.lane}]);
    if (!enemyDeckRef.current.length) enemyDeckRef.current = mainDeckIds.slice(0, DECK_SIZE);
    setDeckQueue(queue=>{const position=queue.indexOf(card.id);return position<0?queue:[...queue.slice(0,position),...queue.slice(position+1),card.id];});
    setPendingCard(null);setBattleStarted(true);
    setBattleLog(`${card.name} em ${zone.id} · ${getCardProfile(card.id).ability}`);
    setToast(`${card.name} invocado · −${card.cost} elixir`);
  };

  const activatePowerUp = (type: "limit" | "root" | "zoom") => {
    if (type === "limit") { setEnergy((value) => Math.min(10, value + 2)); setToast("Power-up Limite ativado: +2 de energia."); }
    if (type === "root") { setAllyTower((value) => Math.min(100, value + 8)); setToast("Power-up Raiz ativado: torre recuperada."); }
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
          <div className="profile-strip"><div className="header-tools"><button className={`audio-toggle ${audioSettingsOpen ? "active" : ""}`} onClick={() => setAudioSettingsOpen((open) => !open)} title="Configurar volume" aria-label="Configurar volume">{soundMuted || soundVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}<span>{soundMuted ? "mudo" : `${Math.round(soundVolume * 100)}%`}</span></button>{audioSettingsOpen && <div className="audio-popover"><div><strong>Áudio da arena</strong><button onClick={() => setSoundMuted((muted) => !muted)}>{soundMuted ? "Ativar" : "Silenciar"}</button></div><label><span>Volume</span><input aria-label="Volume dos efeitos" type="range" min="0" max="1" step="0.05" value={soundVolume} onChange={(event) => { setSoundVolume(Number(event.target.value)); setSoundMuted(false); }} /></label></div>}<button className="inventory-toggle" onClick={() => setInventoryOpen(true)} title="Abrir inventário"><PackageOpen size={15} /><span>Inventário</span></button><button className="survival-toggle" onClick={startSurvival} title="Abrir Torre de Sobrevivência"><Flame size={15} /><span>Torre</span></button></div><button className="top-nav" onClick={() => setView("home")}>∂ Início</button><button className={`top-nav ${view === "map" ? "active" : ""}`} onClick={() => setView("map")}><MapPinned size={14} /> Ilhas</button><button className={`top-nav ${view === "lobby" ? "active" : ""}`} onClick={() => setView("lobby")}><Swords size={14} /> Preparação</button><button className={`top-nav ${view === "deck" ? "active" : ""}`} onClick={() => setView("deck")}><Layers3 size={14} /> Deck</button><a className="top-nav nav-link" href="./perfil/">Perfil</a><a className="top-nav nav-link" href="./ranking/">Ranking</a><div className="stat-chip"><Trophy size={15} /> <strong>{wins}</strong> vitórias</div><div className="stat-chip coin-stat"><Coins size={14} /> <strong>{coins}</strong></div><div className="profile-avatar">Σ</div><div><strong>{playerName || "Visitante"}</strong><small>{completedWorlds.filter(Boolean).length}/5 ilhas · {wins} vitórias</small></div></div>
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
              <WorldArena onAvailabilityChange={setArenaAvailable} worldIndex={worldIndex} stageIndex={chapter} active={view === "battle" && !survivalOpen && !inventoryOpen} allies={units} enemies={enemyUnits} modelIds={mainDeckIds} paused={Boolean(!battleStarted || challenge || pendingCard || inventoryOpen || survivalOpen || battleOutcome)} events={combatEvents} outcome={battleOutcome==='draw'?null:battleOutcome} placement={pendingCard ? {unit:{id:-1,cardId:pendingCard.id,name:pendingCard.name,kind:pendingCard.kind,progress:0,color:world.color},zoneId:spawnZone,blocked:SPAWN_ZONES.filter(zone=>!zoneAvailable(zone.id,units)).map(zone=>zone.id)} : undefined} onSelectZone={id=>{if(zoneAvailable(id,units))setSpawnZone(id);}} />
              <div className="tower-label enemy-label"><span>TORRE DO ERRO</span><strong>{enemyTower} HP</strong></div><div className="health-bar enemy-health"><i style={{ width: `${Math.max(0,Math.min(100,enemyTower/getWorldEnemyHp(worldIndex,chapter)*100))}%` }} /></div>
              <div className="battle-field">{!pendingCard && !battleOutcome && units.length === 0 && enemyUnits.length === 0 && <div className="battle-hint"><Sparkles size={18} /><span>jogue uma carta<br /><small>e veja a prova avançar em 3D</small></span></div>}</div>
              <div className="tower-label ally-label"><span>SUA TORRE</span><strong>{allyTower} HP</strong></div><div className="health-bar ally-health"><i style={{ width: `${Math.max(0,Math.min(100,allyTower/100*100))}%` }} /></div>
            </div>
            {battleOutcome && <div className="battle-result" role="status">{battleOutcome==='victory'?'Vitória!':battleOutcome==='draw'?'Empate matemático':'Sua torre caiu'}<small>{battleOutcome==='victory'?'Preparando suas recompensas…':battleOutcome==='draw'?'Torres equilibradas. Reinicie para uma nova partida.':'Use Reiniciar batalha para tentar novamente.'}</small></div>}
            {combatEvents.length>0 && <div className="combat-feed" aria-label="Habilidades ativadas" aria-live="polite">{combatEvents.slice(-3).map(event=><p key={event.id} data-event-type={event.type}><span style={{color:getCardProfile(event.cardId).glow}}>{getCardProfile(event.cardId).symbol}</span>{event.label}</p>)}</div>}
            <div className="battle-log"><span className="log-icon"><Zap size={14} /></span><span>{battleLog}</span><small className="enemy-log">Rival: {enemyLastCard}</small></div>

          </section>

          {view === "battle" && <aside ref={handRef} className="battle-hand" aria-label="Mão de cartas">
            <div className="hand-toolbar"><strong>Mão de batalha <span>· {activeCards.length}/4</span></strong><span className="hand-energy"><Zap size={18} /> {energy.toFixed(1)} / 10 <span>elixir</span></span>{nextCard&&<div className="next-card-preview" aria-label={`Próxima carta: ${nextCard.name}, ${nextCard.cost} elixir`}><img src={getCardImage(nextCard.id)} alt=""/><span>PRÓXIMA<small>{nextCard.name}</small></span><b>{nextCard.cost}</b></div>}<button onClick={() => setView("lobby")}><Layers3 size={17} /> Preparação</button></div>
            {pendingCard && <section className="spawn-panel" aria-label="Posicionar personagem">
              <div className="spawn-heading"><img src={getCardImage(pendingCard.id)} alt=""/><div><strong>{pendingCard.name}</strong><small>POSICIONAMENTO TÁTICO · BATALHA PAUSADA</small></div><button onClick={()=>setPendingCard(null)} aria-label="Cancelar posicionamento">×</button></div>
              <p>{abilityDescription(pendingCard.id)}</p>
              <div className="spawn-direction" aria-label="Direção da arena"><span>↑ Avanço · Torre do Erro</span><strong>Retaguarda → Meio → Frente</strong><span>↓ Início · Sua torre</span></div>
              <p className="spawn-map-hint">A e B são faixas paralelas. Toque uma zona destacada no mapa 3D ou escolha a posição abaixo.</p>
              <div className="spawn-depth-guide" aria-hidden="true"><span>FAIXA</span><span>1 · RETAGUARDA</span><span>2 · MEIO</span><span>3 · FRENTE</span></div>
              <div className="spawn-zones" role="group" aria-label="Zonas de invocação">
                {(["A","B"] as const).map(lane=><div className="spawn-lane-row" key={lane}>
                  <div className="spawn-lane-heading"><strong>{lane}</strong><small>Faixa</small></div>
                  {SPAWN_ZONES.filter(zone=>zone.id[0]===lane).map(zone=>{
                    const available=zoneAvailable(zone.id,units),selected=spawnZone===zone.id;
                    return <button key={zone.id} className="spawn-zone" aria-label={`Zona ${zone.id}, ${zone.label}${selected?", selecionada":""}${available?", disponível":", ocupada"}`} aria-pressed={selected} disabled={!available} title={`${zone.id} · ${zone.label}${available?"":" · ocupada"}`} onClick={()=>setSpawnZone(zone.id)}><span className="spawn-zone-code">{zone.id}</span><span className="spawn-zone-copy"><strong>{zone.label}</strong><small>{selected?"Selecionada":available?"Livre":"Ocupada"}</small></span></button>;
                  })}
                </div>)}
              </div>
              <button className="spawn-confirm" onClick={confirmSpawn} disabled={!arenaAvailable || !zoneAvailable(spawnZone,units)}>{arenaAvailable ? `Invocar em ${spawnZone} · ${pendingCard.cost} elixir` : "Carregando prévia…"}</button>
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
          <button onClick={() => setInventoryOpen(true)}><PackageOpen /><span><strong>Inventário</strong><small>Baús, moedas e recompensas</small></span><ArrowUpRight /></button>
          <button onClick={startSurvival}><Flame /><span><strong>Sobrevivência</strong><small>Teste seu deck contra as ondas</small></span><ArrowUpRight /></button>
          <a href="./perfil/"><Star /><span><strong>Meu perfil</strong><small>Acesse seu perfil online</small></span><ArrowUpRight /></a>
          <a href="./ranking/"><Trophy /><span><strong>Ranking</strong><small>Confira a classificação</small></span><ArrowUpRight /></a>
        </div></div>
        <div className="preparation-deck"><div><h3>Seu deck está pronto?</h3><p>Deck de {DECK_SIZE} cartas · as 4 primeiras entram na mão e a próxima aparece para planejar o rodízio.</p></div><div className="preparation-portraits">{mainDeckCards.slice(0, 4).map(card => <figure key={card.id}><img src={getCardImage(card.id)} alt="" /><figcaption>{card.name}</figcaption></figure>)}</div><button className="close-mode" onClick={() => setView("deck")}>Editar deck <ArrowUpRight size={18} /></button></div>
      </section>}
      {view === "map" && <div className="mode-screen map-screen"><div className="mode-screen-header"><div><span className="eyebrow">CALCULUS ROYALE · MAPA PRINCIPAL</span><h2>Trilha das Ilhas do Cálculo</h2><p>Vença todas as casas de uma ilha para revelar a próxima arena.</p></div><button className="close-mode" onClick={() => setView("lobby")}><X size={17} /> Preparação</button></div><div className="completion-banner">{completionNotice !== null ? <><CheckCircle2 size={20} /><span><strong>Ilha {completionNotice + 1} concluída!</strong><small>{worlds[completionNotice].title} dominado. {celebrationWorld !== null ? "A próxima ilha será desbloqueada ao fim da celebração." : "A próxima ilha está pronta para ser explorada."}</small></span></> : <><MapPinned size={20} /><span><strong>Sua jornada</strong><small>Cada ilha possui várias casas. A próxima ilha só abre após a última batalha.</small></span></>}</div>{phaseReward && <div className={`reward-card reward-${phaseReward.rarity}`}><div className="reward-chest"><img src={getChestArt(phaseReward.world)} alt={phaseReward.chest} /></div><div><span className="section-label">{phaseReward.rarity.toUpperCase()} · RECOMPENSA DESBLOQUEADA</span><strong>{phaseReward.chest}</strong><small><Coins size={12} /> +{phaseReward.coins} moedas · ✦ +{phaseReward.essence} essência</small><small><Gem size={12} /> {phaseReward.icon} {phaseReward.item}</small></div><span className="reward-sparkle">✦</span></div>}<div className="island-path">{worlds.map((item, index) => { const celebrating = celebrationWorld === index; const unlocked = index === 0 || completedWorlds[index - 1]; const done = completedWorlds[index]; const houses=stageProgress[index]??0; return <div key={item.id} className={`island-node ${unlocked ? "island-unlocked" : "island-locked"} ${done ? "island-done" : ""} ${celebrating ? "island-celebrating" : ""}`}><div className="path-line" /><button onClick={() => selectWorld(index)} disabled={!unlocked || celebrating} className="island-button" style={{ "--island-color": item.color } as React.CSSProperties}><img className="island-map-art" src={WORLD_MAPS[index]?.art ?? WORLD_MAPS[0].art} alt="" aria-hidden="true" /><span className="island-map-shade" /><span className="island-glow" /><span className="island-number">0{item.id}</span><strong>{WORLD_MAPS[index]?.title ?? item.title}</strong><small>{celebrating ? "ilha concluída · celebrando" : done ? `${houses}/${item.chapters.length} casas · concluída` : unlocked ? `${houses}/${item.chapters.length} casas vencidas` : "conclua todas as casas anteriores"}</small>{celebrating ? <span className="celebration-burst">✦</span> : done ? <CheckCircle2 className="island-check" size={17} /> : !unlocked ? <LockKeyhole className="island-lock" size={16} /> : <ArrowUpRight className="island-arrow" size={17} />}</button></div>; })}</div><button className="map-deck-cta" onClick={() => setView("deck")}><Layers3 size={17} /><span><strong>Editar deck principal</strong><small>Escolha quais cartas aparecem no rodízio da batalha</small></span><ArrowUpRight size={16} /></button></div>}
      {view === "deck" && <div className="mode-screen deck-screen"><div className="mode-screen-header"><div><span className="eyebrow">OFICINA DE ESTRATÉGIA · {mainDeckIds.length} CARTAS SELECIONADAS</span><h2>Deck principal</h2><p>Monte um deck de {DECK_SIZE} cartas. Você recebe 4 na mão; a quinta fica visível e cada carta jogada gira para o fim do rodízio.</p></div><button className="close-mode" onClick={() => setView("lobby")}><MapPinned size={17} /> Preparação</button></div><div className="deck-editor-grid"><section className="deck-selected"><div className="section-label">DECK ATUAL · {mainDeckCards.length}/{DECK_SIZE} CARTAS</div><div className="deck-math-stats"><span><small>MÉDIA DE ELIXIR</small><strong>{averageElixirCost}</strong><small>Σ custos ÷ {mainDeckCards.length||1}</small></span><i><b style={{width:`${Math.min(100,Number(averageElixirCost)*10)}%`}} /></i><em>Equilibre cartas leves e pesadas para manter o ciclo.</em></div><div className="drag-hint"><ArrowUpRight size={13} /> Arraste uma carta sobre outra para reorganizar a ordem do rodízio</div><div className="selected-cards">{mainDeckCards.map((card, index) => <button key={card.id} draggable onDragStart={() => { dragGestureRef.current = true; setDraggedCardId(card.id); }} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderDeck(card.id)} onDragEnd={() => setDraggedCardId(null)} onClick={() => { if (dragGestureRef.current) { dragGestureRef.current = false; return; } editMainDeck(card); }} className={`selected-card ${draggedCardId === card.id ? "is-dragging" : ""}`}><span className="drag-grip">⠿</span><span className="selected-order">{String(index + 1).padStart(2, "0")}</span><span className="selected-symbol"><img src={getCardArt(card)} alt="" /></span><span><strong>{card.name}</strong><small>{card.formula}</small></span><X size={14} /></button>)}</div><button className="start-deck-button" onClick={() => { if(mainDeckIds.length!==DECK_SIZE){setToast(`Complete o deck com ${DECK_SIZE} cartas para batalhar.`);return;} setDeckQueue(mainDeckIds); setView("lobby"); setToast("Deck de 8 cartas equipado · rodízio pronto"); }}><Swords size={16} /> Salvar deck e voltar</button></section><section className="deck-library"><div className="deck-upgrades"><h3>Evoluir cartas</h3><p>Você tem {essence} essências. Cada evolução custa 3.</p>{mainDeckCards.map((card) => <button key={card.id} disabled={essence < 3} onClick={() => evolveCard(card)}>{card.name} · Nv. {(cardLevels[card.id] ?? 0) + 1} <span>✦ Evoluir</span></button>)}</div><div className="section-label">BIBLIOTECA DE CARTAS DESBLOQUEADAS</div><div className="library-grid">{allCards.filter((card) => !mainDeckIds.includes(card.id)).map((card) => <button key={card.id} onClick={() => editMainDeck(card)} className="library-card"><span className="library-art"><img src={getCardArt(card)} alt="" /></span><span><strong>{card.name}</strong><small>{card.formula}</small></span><ArrowUpRight size={14} /></button>)}</div></section></div></div>}
      {survivalOpen && <div className="survival-backdrop"><section className="survival-screen"><header className="survival-header"><div><span className="eyebrow">MODO INFINITO · TESTE DE DECK</span><h2>Torre de Sobrevivência</h2><p>Cada onda aumenta o dano. Use seu deck para resistir ao infinito.</p></div><button className="close-mode" onClick={closeSurvival}><X size={17} /> Sair</button></header><div className="survival-stats"><div><span>ONDA</span><strong>{survivalWave}</strong></div><div><span>PONTUAÇÃO</span><strong>{survivalScore}</strong></div><div><span>TORRE</span><strong>{survivalTower}%</strong></div></div><div className="survival-arena"><div className="survival-3d"><WorldArena worldIndex={worldIndex} active={survivalOpen} enemies={survivalEnemies} modelIds={activeCards.map(card=>card.id)} paused={!survivalRunning || Boolean(survivalChallenge)} /></div><div className="survival-deck"><div className="survival-deck-head"><span>DECK DE DEFESA</span><strong>{survivalElixir.toFixed(1)} / 10 elixir</strong></div><div className="survival-deck-cards">{activeCards.map((card) => <button key={card.id} onClick={() => playSurvivalCard(card)}><img className="survival-hand-art" src={getCardImage(card.id)} alt={card.name} /><small>{card.name}</small><b>{card.cost}</b></button>)}</div></div><div className="survival-tip"><Sparkles size={17} /><span>{survivalRunning ? "Aguente a próxima sequência de cartas avançadas." : survivalTower <= 0 ? "A torre caiu. Reinicie para tentar superar sua pontuação." : "Pronto para medir a resistência do deck."}</span></div></div>{survivalRewardNotice && <div className="survival-reward"><div className="badge-medallion">{survivalRewardNotice.icon}</div><div><span className="section-label">EMBLEMA CONQUISTADO</span><strong>{survivalRewardNotice.name}</strong><small>{survivalRewardNotice.detail} · +{survivalRewardNotice.reward} moedas</small></div><button onClick={() => setSurvivalRewardNotice(null)}><X size={14} /></button></div>}<div className="survival-bottom-grid"><div><div className="survival-section-label">EMBLEMAS DA TORRE</div><div className="survival-badges">{survivalBadges.map((badge) => <div key={badge.id} className={`survival-badge ${survivalBadgeIds.includes(badge.id) ? "earned" : "locked"}`} title={badge.detail}><span>{badge.icon}</span><small>{badge.name}</small></div>)}</div></div><div><div className="survival-section-label">MELHORES MARCAS</div><div className="leaderboard">{survivalLeaderboard.length ? survivalLeaderboard.slice(0, 5).map((entry, index) => <div key={`${entry.date}-${index}`}><b>0{index + 1}</b><span>Onda {entry.wave}<small>{entry.date}</small></span><strong>{entry.score}</strong></div>) : <p>Nenhuma marca registrada ainda.</p>}</div></div></div><div className="survival-actions">{survivalRunning && <button className="survival-challenge-button" onClick={requestSurvivalChallenge}>? Desafio da onda {survivalWave}</button>}{!survivalRunning && <button className="start-deck-button" onClick={startSurvival}><Flame size={16} /> {survivalTower <= 0 ? "Tentar novamente" : "Iniciar torre"}</button>}<button className="close-mode" onClick={closeSurvival}>Voltar ao jogo</button></div></section></div>}
      {inventoryOpen && <div className="inventory-backdrop" onClick={() => setInventoryOpen(false)}><aside className="inventory-drawer" onClick={(event) => event.stopPropagation()}><div className="inventory-header"><div><span className="eyebrow">CALCULUS ROYALE · COLEÇÃO</span><h2>Inventário tático</h2><p>Itens especiais, personagens vinculados e recompensas das ilhas.</p></div><button className="close-mode" onClick={() => setInventoryOpen(false)}><X size={17} /> Fechar</button></div><div className="inventory-totals"><div><Coins size={17} /><span><strong>{coins}</strong><small>moedas</small></span></div><div><Gem size={17} /><span><strong>{essence}</strong><small>essência</small></span></div><div><PackageOpen size={17} /><span><strong>{rewardInventory.length}</strong><small>baús abertos</small></span></div></div><div className="inventory-content-grid"><SpecialItemsBoard worldArt={currentWorldArt} worldTitle={WORLD_MAPS[worldIndex].title} featuredCards={mainDeckCards.slice(0,2).map(card=>({id:card.id,name:card.name,formula:card.formula}))}/><div className="inventory-list"><div className="section-label">RECOMPENSAS REGISTRADAS</div>{rewardInventory.length ? [...rewardInventory].reverse().map((reward, index) => <div key={`${reward.claimedAt}-${index}`} className={`inventory-item inventory-${reward.rarity}`}><div className="inventory-icon"><img src={getChestArt(reward.world)} alt={reward.chest} /></div><div><strong>{reward.chest}</strong><small>Fase {reward.world + 1} · {reward.rarity}</small><em><Coins size={12} /> +{reward.coins} · {reward.item}</em></div><Star size={14} /></div>) : <div className="inventory-empty"><ScrollText size={22} /><strong>Nenhum baú aberto ainda</strong><small>Conclua uma ilha para adicionar sua primeira recompensa.</small></div>}</div></div></aside></div>}

      {survivalChallenge && <div className="challenge-backdrop"><div className="challenge-modal survival-challenge-modal"><div className="challenge-icon">∫</div><span className="section-label">DESAFIO DA TORRE · ONDA {survivalChallengeWave}</span><h2>Resolva para ganhar vantagem</h2><p>{survivalChallenge.question}</p><div className="challenge-options">{survivalChallenge.options.map((option) => <button key={option} onClick={() => answerSurvivalChallenge(option)}>{option}</button>)}</div><small>A dificuldade acompanha o número de ondas sobrevividas.</small></div></div>}
      {challenge && <div className="challenge-backdrop"><div className="challenge-modal" role="dialog" aria-modal="true" aria-labelledby="powerup-title"><button className="challenge-cancel" onClick={() => setChallenge(null)} aria-label="Cancelar desafio"><X size={22} /></button><div className="challenge-icon">?</div><span className="section-label">DESAFIO-RELÂMPAGO</span><h2 id="powerup-title">Resolva para ativar o power-up</h2><p>{challenge.question}</p><div className="challenge-options">{challenge.options.map((option) => <button key={option} onClick={() => answerChallenge(option)}>{option}</button>)}</div><small>Batalha pausada enquanto você responde.</small></div></div>}
      {toast && <div className="toast"><span className="toast-mark">∂</span>{toast}</div>}
    </main>
  );
}
