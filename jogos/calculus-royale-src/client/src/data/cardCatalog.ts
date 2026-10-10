import { abilityDescription } from '../game/cardProfiles.ts';
import { combatDescription } from '../game/tacticalBattle.ts';

export type Card = {
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

export type World = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  chapters: string[];
  focus: string;
  cards: Card[];
};

export const worlds: World[] = [
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

export const getCumulativeCards = (worldIndex: number) => worlds.slice(0, worldIndex + 1).flatMap((item) => [...item.cards, ...(extraCards[item.id] ?? [])]).map(card=>({...card,effect:`${abilityDescription(card.id)} ${combatDescription({cardId:card.id,kind:card.kind})}`}));
