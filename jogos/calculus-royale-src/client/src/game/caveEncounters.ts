export type CaveEncounter = {
  name: string;
  objective: string;
  difficulty: string;
  enemyTowerHp: number;
  enemyPowerMultiplier: number;
  aiPlayInterval: number;
};

/** Encontros da primeira ilha: ensinam primeiro, aumentam a pressão por etapas e fecham com um chefe. */
export const ISLAND_ONE_CAVES: CaveEncounter[] = [
  {
    name: "Velocidade e reta tangente",
    objective: "Observe a taxa de variação e use uma carta leve para abrir a primeira rota.",
    difficulty: "Treino",
    enemyTowerHp: 72,
    enemyPowerMultiplier: 0.34,
    aiPlayInterval: 8.0,
  },
  {
    name: "Derivadas elementares",
    objective: "Compare as regras de potência e seno; preserve elixir para responder ao rival.",
    difficulty: "Leve",
    enemyTowerHp: 76,
    enemyPowerMultiplier: 0.38,
    aiPlayInterval: 7.2,
  },
  {
    name: "Regras de diferenciação",
    objective: "Encadeie duas cartas na mesma faixa e aproveite a janela antes do contra-ataque.",
    difficulty: "Intermediária",
    enemyTowerHp: 80,
    enemyPowerMultiplier: 0.42,
    aiPlayInterval: 6.4,
  },
  {
    name: "Continuidade",
    objective: "Estabilize a defesa antes de avançar: uma linha contínua evita rupturas na torre.",
    difficulty: "Tática",
    enemyTowerHp: 84,
    enemyPowerMultiplier: 0.46,
    aiPlayInterval: 5.7,
  },
  {
    name: "Quociente e trigonometria",
    objective: "Divida a pressão entre as faixas e escolha o instante certo para contra-atacar.",
    difficulty: "Avançada",
    enemyTowerHp: 88,
    enemyPowerMultiplier: 0.49,
    aiPlayInterval: 5.1,
  },
  {
    name: "Euler e Bernoulli",
    objective: "No confronto final, calcule o investimento de elixir e procure a abertura decisiva.",
    difficulty: "Chefe",
    enemyTowerHp: 92,
    enemyPowerMultiplier: 0.52,
    aiPlayInterval: 4.6,
  },
];

const OTHER_ISLAND_ENCOUNTER: CaveEncounter = {
  name: "Desafio da ilha",
  objective: "Adapte a estratégia às cartas e habilidades desta ilha.",
  difficulty: "Tática",
  enemyTowerHp: 82,
  enemyPowerMultiplier: 0.55,
  aiPlayInterval: 3.8,
};

export function getCaveEncounter(worldIndex: number, stageIndex: number): CaveEncounter {
  if (worldIndex !== 0) {
    return { ...OTHER_ISLAND_ENCOUNTER, enemyTowerHp: 82 - worldIndex * 4 };
  }
  const stage = Number.isFinite(stageIndex) ? Math.floor(stageIndex) : 0;
  return ISLAND_ONE_CAVES[Math.max(0, Math.min(ISLAND_ONE_CAVES.length - 1, stage))];
}
