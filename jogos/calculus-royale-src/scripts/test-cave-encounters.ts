import assert from "node:assert/strict";
import { getCaveEncounter, ISLAND_ONE_CAVES } from "../client/src/game/caveEncounters.ts";

assert.equal(ISLAND_ONE_CAVES.length, 6, "A Ilha 1 deve ter seis cavernas jogáveis");
for (const [index, cave] of ISLAND_ONE_CAVES.entries()) {
  assert(cave.name.length > 0 && cave.objective.length > 20, `Caverna 1.${index + 1} precisa de nome e missão claros`);
  assert(cave.enemyTowerHp > 0 && cave.enemyTowerHp < 96, `Caverna 1.${index + 1} precisa manter uma torre rival vencível`);
  assert(cave.enemyPowerMultiplier >= 0.3 && cave.enemyPowerMultiplier <= 0.55, `Caverna 1.${index + 1} deve permanecer numa faixa de força justa`);
  assert(cave.aiPlayInterval >= 4.5 && cave.aiPlayInterval <= 8, `Caverna 1.${index + 1} deve dar tempo para recuperar elixir`);
  if (index > 0) {
    assert(cave.enemyTowerHp > ISLAND_ONE_CAVES[index - 1].enemyTowerHp, "A resistência da torre deve crescer por etapa");
    assert(cave.enemyPowerMultiplier > ISLAND_ONE_CAVES[index - 1].enemyPowerMultiplier, "A força rival deve crescer por etapa");
    assert(cave.aiPlayInterval < ISLAND_ONE_CAVES[index - 1].aiPlayInterval, "O rival deve aumentar o ritmo gradualmente");
  }
}
assert.equal(getCaveEncounter(0, 99).name, ISLAND_ONE_CAVES[5].name, "Índice alto deve ser limitado à última caverna");
assert.equal(getCaveEncounter(0, -1).name, ISLAND_ONE_CAVES[0].name, "Índice negativo deve abrir a primeira caverna");
assert.equal(getCaveEncounter(1, 0).enemyTowerHp, 78, "As outras ilhas preservam a vida de torre atual");
console.log("PASS: seis cavernas da Ilha 1, missões matemáticas, progressão justa e parâmetros de encontro válidos.");
