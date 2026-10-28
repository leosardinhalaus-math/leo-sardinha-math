import assert from "node:assert/strict";
import {
  DECK_SIZE,
  REGULATION_SECONDS,
  OVERTIME_SECONDS,
  battleClockLabel,
  compareTowerHealth,
  elixirMultiplier,
  normalizeDeck,
} from "../client/src/game/battleRules.ts";

const catalog = ["slope", "limit", "power", "sine", "euler", "chain", "ln", "implicit", "rate"];
assert.equal(DECK_SIZE, 8);
assert.deepEqual(normalizeDeck(["slope", "limit", "slope", "unknown"], catalog), catalog.slice(0, 8));
assert.deepEqual(normalizeDeck(catalog.slice(0, 9), catalog), catalog.slice(0, 8));
assert.equal(elixirMultiplier(0), 1);
assert.equal(elixirMultiplier(REGULATION_SECONDS - 60), 2);
assert.equal(elixirMultiplier(REGULATION_SECONDS), 3);
assert.equal(battleClockLabel(0), "03:00");
assert.equal(battleClockLabel(REGULATION_SECONDS - 1), "00:01");
assert.equal(battleClockLabel(REGULATION_SECONDS), "OT 00:00");
assert.equal(battleClockLabel(REGULATION_SECONDS + OVERTIME_SECONDS), "OT 01:00");
assert.equal(compareTowerHealth(96, 82), "draw");
assert.equal(compareTowerHealth(80, 41), "victory");
assert.equal(compareTowerHealth(48, 60), "defeat");
// Boundary checks for regulation/overtime and normalized tower-health decisions.
for (const elapsed of [0, 1, REGULATION_SECONDS - 61]) assert.equal(elixirMultiplier(elapsed), 1);
for (const elapsed of [REGULATION_SECONDS - 60, REGULATION_SECONDS - 1]) assert.equal(elixirMultiplier(elapsed), 2);
for (const elapsed of [REGULATION_SECONDS, REGULATION_SECONDS + 1]) assert.equal(elixirMultiplier(elapsed), 3);
assert.equal(battleClockLabel(60), "02:00");
assert.equal(battleClockLabel(REGULATION_SECONDS + 1), "OT 00:01");
assert.equal(compareTowerHealth(50, 50), "draw");
assert.equal(compareTowerHealth(100, 0), "victory");
assert.equal(compareTowerHealth(0, 100), "defeat");
console.log("PASS: deck de 8 cartas, rotação compatível, relógio, elixir duplo/triplo e desempate por proporção de torre.");
