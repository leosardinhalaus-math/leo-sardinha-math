import assert from "node:assert/strict";
import { getStageEncounter, ISLAND_ENCOUNTERS, ISLAND_ONE_CAVES } from "../client/src/game/stageEncounters.ts";

const expectedLengths = [6, 5, 6, 6, 5];
assert.deepEqual(ISLAND_ENCOUNTERS.map((island) => island.length), expectedLengths, "Todas as etapas existentes precisam ter um encontro configurado");
assert.equal(ISLAND_ONE_CAVES.length, 6, "A Ilha 1 deve manter suas seis cavernas");
assert.equal(ISLAND_ENCOUNTERS.flat().length, 28, "As cinco ilhas devem cobrir as 28 etapas atuais");

for (const [worldIndex, stages] of ISLAND_ENCOUNTERS.entries()) {
  for (const [stageIndex, encounter] of stages.entries()) {
    const label = `Ilha ${worldIndex + 1}, etapa ${stageIndex + 1}`;
    assert(encounter.name.length > 0 && encounter.objective.length > 20, `${label} precisa de tema e missão claros`);
    assert(encounter.enemyTowerHp > 0 && encounter.enemyTowerHp <= 120, `${label} precisa manter a torre em faixa vencível`);
    assert(encounter.enemyPowerMultiplier >= 0.3 && encounter.enemyPowerMultiplier <= 0.93, `${label} precisa manter a força rival calibrada`);
    assert(encounter.aiPlayInterval >= 2.6 && encounter.aiPlayInterval <= 8, `${label} precisa ter um intervalo viável para recuperar elixir`);
    assert.deepEqual(getStageEncounter(worldIndex, stageIndex), encounter, `${label} precisa carregar o encontro correto`);
    if (stageIndex > 0) {
      const previous = stages[stageIndex - 1];
      assert(encounter.enemyTowerHp > previous.enemyTowerHp, `${label}: a torre deve ganhar resistência gradualmente`);
      assert(encounter.enemyPowerMultiplier > previous.enemyPowerMultiplier, `${label}: a força da IA deve crescer por etapa`);
      assert(encounter.aiPlayInterval < previous.aiPlayInterval, `${label}: o ritmo rival deve aumentar por etapa`);
    }
  }
  if (worldIndex > 0) {
    const previousBoss = ISLAND_ENCOUNTERS[worldIndex - 1].at(-1)!;
    const first = stages[0];
    assert(first.enemyTowerHp > previousBoss.enemyTowerHp, `A Ilha ${worldIndex + 1} deve começar depois do chefe anterior`);
    assert(first.enemyPowerMultiplier > previousBoss.enemyPowerMultiplier, `A força deve continuar crescendo entre ilhas`);
    assert(first.aiPlayInterval < previousBoss.aiPlayInterval, `O ritmo deve continuar crescendo entre ilhas`);
  }
}

assert.equal(getStageEncounter(0, 99).name, ISLAND_ONE_CAVES[5].name, "Índice alto deve ser limitado à última caverna");
assert.equal(getStageEncounter(0, -1).name, ISLAND_ONE_CAVES[0].name, "Índice negativo deve abrir a primeira caverna");
assert.equal(getStageEncounter(1, 99).name, ISLAND_ENCOUNTERS[1][4].name, "Cada ilha deve limitar o índice à sua própria última etapa");
console.log("PASS: 28 etapas das cinco ilhas têm missões próprias, tuning viável e dificuldade progressiva entre etapas e ilhas.");
