export const DECK_SIZE = 8;
export const STARTING_ELIXIR = 5;
export const ELIXIR_PER_TICK = 0.045;
export const BATTLE_TICK_SECONDS = 0.1;
export const REGULATION_SECONDS = 180;
export const OVERTIME_SECONDS = 60;

export type MatchOutcome = "victory" | "defeat" | "draw";

/** Elixir acelera no último minuto e triplica durante a morte súbita. */
export function elixirMultiplier(elapsedSeconds: number): 1 | 2 | 3 {
  if (elapsedSeconds >= REGULATION_SECONDS) return 3;
  if (elapsedSeconds >= REGULATION_SECONDS - 60) return 2;
  return 1;
}

/** Mantém a ordem escolhida, remove IDs repetidos/desconhecidos e completa com cartas válidas. */
export function normalizeDeck(savedIds: string[], availableIds: string[]): string[] {
  const available = new Set(availableIds);
  const chosen = [...new Set(savedIds.filter((id) => available.has(id)))].slice(0, DECK_SIZE);
  for (const id of availableIds) {
    if (chosen.length >= DECK_SIZE) break;
    if (!chosen.includes(id)) chosen.push(id);
  }
  return chosen;
}

export function battleClockLabel(elapsedSeconds: number): string {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, Math.floor(elapsedSeconds)) : 0;
  const format = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  if (elapsed >= REGULATION_SECONDS) return `OT ${format(Math.min(OVERTIME_SECONDS, elapsed - REGULATION_SECONDS))}`;
  return format(REGULATION_SECONDS - elapsed);
}

/** Compara a fração de HP restante para não favorecer torres com HP inicial diferente. */
export function compareTowerHealth(allyHp: number, enemyHp: number, allyMax = 96, enemyMax = 82): MatchOutcome {
  const difference = Math.max(0, allyHp) / allyMax - Math.max(0, enemyHp) / enemyMax;
  if (Math.abs(difference) < 0.005) return "draw";
  return difference > 0 ? "victory" : "defeat";
}
