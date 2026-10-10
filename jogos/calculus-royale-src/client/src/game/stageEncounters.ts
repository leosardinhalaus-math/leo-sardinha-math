export type StageEncounter = {
  name: string;
  objective: string;
  difficulty: string;
  enemyTowerHp: number;
  enemyPowerMultiplier: number;
  aiPlayInterval: number;
};

type Lesson = Pick<StageEncounter, "name" | "objective" | "difficulty">;
type TuningCurve = { towerStart: number; towerStep: number; powerStart: number; powerStep: number; intervalStart: number; intervalStep: number };

/** Encontros da Ilha 1: ensinam primeiro, aumentam a pressão por etapas e fecham com um chefe. */
export const ISLAND_ONE_CAVES: StageEncounter[] = [
  { name: "Velocidade e reta tangente", objective: "Observe a taxa de variação e use uma carta leve para abrir a primeira rota.", difficulty: "Treino", enemyTowerHp: 72, enemyPowerMultiplier: 0.34, aiPlayInterval: 8.0 },
  { name: "Derivadas elementares", objective: "Compare as regras de potência e seno; preserve elixir para responder ao rival.", difficulty: "Leve", enemyTowerHp: 76, enemyPowerMultiplier: 0.38, aiPlayInterval: 7.2 },
  { name: "Regras de diferenciação", objective: "Encadeie duas cartas na mesma faixa e aproveite a janela antes do contra-ataque.", difficulty: "Intermediária", enemyTowerHp: 80, enemyPowerMultiplier: 0.42, aiPlayInterval: 6.4 },
  { name: "Continuidade", objective: "Estabilize a defesa antes de avançar: uma linha contínua evita rupturas na torre.", difficulty: "Tática", enemyTowerHp: 84, enemyPowerMultiplier: 0.46, aiPlayInterval: 5.7 },
  { name: "Quociente e trigonometria", objective: "Divida a pressão entre as faixas e escolha o instante certo para contra-atacar.", difficulty: "Avançada", enemyTowerHp: 88, enemyPowerMultiplier: 0.49, aiPlayInterval: 5.1 },
  { name: "Euler e Bernoulli", objective: "No confronto final, calcule o investimento de elixir e procure a abertura decisiva.", difficulty: "Chefe", enemyTowerHp: 92, enemyPowerMultiplier: 0.52, aiPlayInterval: 4.6 },
];

const ISLAND_LESSONS: Lesson[][] = [
  [],
  [
    { name: "Regra da cadeia", objective: "Componha duas ações: combine uma tropa veloz com uma carta de apoio.", difficulty: "Introdução" },
    { name: "Inversas e ln(x)", objective: "Use o baixo custo de ln(x) para reconstruir a pressão depois de defender.", difficulty: "Leve" },
    { name: "Diferenciação implícita", objective: "Proteja a faixa ameaçada enquanto transforma a relação F(x,y)=0 em uma resposta.", difficulty: "Intermediária" },
    { name: "Taxas relacionadas", objective: "Sincronize as faixas: responda onde a taxa de avanço rival está maior.", difficulty: "Tática" },
    { name: "Potências reais", objective: "Acerte o momento do contra-ataque e reserve elixir para a carta de maior potência.", difficulty: "Chefe" },
  ],
  [
    { name: "Valor médio de Cauchy", objective: "Compare as taxas médias antes de comprometer elixir em uma rota.", difficulty: "Introdução" },
    { name: "Crescimento e decrescimento", objective: "Avance pela faixa favorável e mude de plano quando o rival inverter o ritmo.", difficulty: "Leve" },
    { name: "Derivadas superiores", objective: "Construa pressão em camadas: cada carta prepara o próximo golpe.", difficulty: "Intermediária" },
    { name: "Taylor e erro", objective: "Faça uma aproximação segura: mantenha uma resposta disponível para o contra-ataque.", difficulty: "Tática" },
    { name: "Otimização", objective: "Concentre o investimento na rota de maior retorno, sem abandonar a defesa.", difficulty: "Avançada" },
    { name: "Gráficos e Newton", objective: "No chefe, corrija a rota a cada leitura do campo até chegar à raiz.", difficulty: "Chefe" },
  ],
  [
    { name: "Área e variação acumulada", objective: "Some pequenos avanços e proteja as tropas que acumulam pressão.", difficulty: "Introdução" },
    { name: "Valor médio da integral", objective: "Equilibre ataque e defesa usando o custo médio das cartas como referência.", difficulty: "Leve" },
    { name: "Teorema fundamental", objective: "Converta a preparação em um empurrão no instante certo.", difficulty: "Intermediária" },
    { name: "Primitivas", objective: "Encontre uma resposta estável para cada ameaça antes de abrir uma segunda frente.", difficulty: "Tática" },
    { name: "Volumes e Cavalieri", objective: "Compare as duas faixas e fortaleça a que oferece maior área de ataque.", difficulty: "Avançada" },
    { name: "Fractais e Gabriel", objective: "No chefe, mantenha a defesa em escala e acumule dano sem perder o ritmo.", difficulty: "Chefe" },
  ],
  [
    { name: "Substituição", objective: "Troque a variável do plano: transforme uma defesa bem-sucedida em avanço.", difficulty: "Introdução" },
    { name: "Integração por partes", objective: "Divida o investimento entre duas ações complementares.", difficulty: "Intermediária" },
    { name: "Trapézios e métodos numéricos", objective: "Aproxime o custo do próximo movimento e evite gastar todo o elixir.", difficulty: "Tática" },
    { name: "Integrais impróprias", objective: "Resista à pressão prolongada e só avance quando a soma for favorável.", difficulty: "Avançada" },
    { name: "Comparação e séries", objective: "No chefe final, compare as duas rotas e feche a partida com uma sequência convergente.", difficulty: "Chefe" },
  ],
];

const TUNING_CURVES: TuningCurve[] = [
  { towerStart: 0, towerStep: 0, powerStart: 0, powerStep: 0, intervalStart: 0, intervalStep: 0 },
  { towerStart: 94, towerStep: 1, powerStart: 0.54, powerStep: 0.02, intervalStart: 4.5, intervalStep: -0.1 },
  { towerStart: 100, towerStep: 1, powerStart: 0.63, powerStep: 0.02, intervalStart: 4.0, intervalStep: -0.1 },
  { towerStart: 106, towerStep: 1, powerStart: 0.74, powerStep: 0.02, intervalStart: 3.4, intervalStep: -0.1 },
  { towerStart: 112, towerStep: 2, powerStart: 0.85, powerStep: 0.02, intervalStart: 2.8, intervalStep: -0.05 },
];

function buildEncounters(lessons: Lesson[], curve: TuningCurve): StageEncounter[] {
  return lessons.map((lesson, index) => ({
    ...lesson,
    enemyTowerHp: Math.round(curve.towerStart + curve.towerStep * index),
    enemyPowerMultiplier: Number((curve.powerStart + curve.powerStep * index).toFixed(2)),
    aiPlayInterval: Number((curve.intervalStart + curve.intervalStep * index).toFixed(2)),
  }));
}

export const ISLAND_ENCOUNTERS: StageEncounter[][] = [
  ISLAND_ONE_CAVES,
  ...ISLAND_LESSONS.slice(1).map((lessons, index) => buildEncounters(lessons, TUNING_CURVES[index + 1])),
];

const FALLBACK_ENCOUNTER: StageEncounter = {
  name: "Desafio da ilha",
  objective: "Adapte a estratégia às cartas e habilidades desta ilha.",
  difficulty: "Tática",
  enemyTowerHp: 82,
  enemyPowerMultiplier: 0.55,
  aiPlayInterval: 3.8,
};

export function getStageEncounter(worldIndex: number, stageIndex: number): StageEncounter {
  const stages = ISLAND_ENCOUNTERS[worldIndex];
  if (!stages?.length) return { ...FALLBACK_ENCOUNTER, enemyTowerHp: 82 - worldIndex * 4 };
  const stage = Number.isFinite(stageIndex) ? Math.floor(stageIndex) : 0;
  return stages[Math.max(0, Math.min(stages.length - 1, stage))];
}
