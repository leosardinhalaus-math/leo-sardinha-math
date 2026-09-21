const CHARACTER_ART: Record<string, string> = {
  "limit": "./assets/cards/characters/limit.webp",
  "slope": "./assets/cards/characters/slope.webp",
  "chain": "./assets/cards/characters/chain.webp",
  "implicit": "./assets/cards/characters/implicit.webp",
  "area": "./assets/cards/characters/area.webp",
  "ftc": "./assets/cards/characters/ftc.webp",
  "series": "./assets/cards/characters/series.webp",
  "taylor": "./assets/cards/characters/taylor.webp",
  "rate": "./assets/cards/characters/rate.webp",
  "newton": "./assets/cards/characters/newton.webp",
  "power": "./assets/cards/characters/power.webp",
  "sine": "./assets/cards/characters/sine.webp",
  "euler": "./assets/cards/characters/euler.webp",
  "ln": "./assets/cards/characters/ln.webp",
  "cauchy": "./assets/cards/characters/cauchy.webp",
  "opt": "./assets/cards/characters/opt.webp",
  "cavalieri": "./assets/cards/characters/cavalieri.webp",
  "fractal": "./assets/cards/characters/fractal.webp",
  "sub": "./assets/cards/characters/sub.webp",
  "parts": "./assets/cards/characters/parts.webp",
  "trap": "./assets/cards/characters/trap.webp",
  "improper": "./assets/cards/characters/improper.webp",
  "continuity": "./assets/cards/characters/continuity.webp",
  "quotient": "./assets/cards/characters/quotient.webp",
  "secant": "./assets/cards/characters/secant.webp",
  "bernoulli": "./assets/cards/characters/bernoulli.webp",
  "inverse": "./assets/cards/characters/inverse.webp",
  "expchain": "./assets/cards/characters/expchain.webp",
  "root": "./assets/cards/characters/root.webp",
  "mirror": "./assets/cards/characters/mirror.webp",
  "mean": "./assets/cards/characters/mean.webp",
  "growth": "./assets/cards/characters/growth.webp",
  "taylor2": "./assets/cards/characters/taylor2.webp",
  "miner": "./assets/cards/characters/miner.webp",
  "average": "./assets/cards/characters/average.webp",
  "volume": "./assets/cards/characters/volume.webp",
  "surface": "./assets/cards/characters/surface.webp",
  "gabriel": "./assets/cards/characters/gabriel.webp",
  "cavalieri-advanced": "./assets/cards/characters/cavalieri-advanced.webp",
  "surface-flux": "./assets/cards/characters/surface-flux.webp",
  "parts2": "./assets/cards/characters/parts2.webp",
  "simpson": "./assets/cards/characters/simpson.webp",
  "compare": "./assets/cards/characters/compare.webp",
  "simpson-advanced": "./assets/cards/characters/simpson-advanced.webp",
  "comparison": "./assets/cards/characters/comparison.webp",
};

export const CHARACTER_CARD_IDS = Object.freeze(Object.keys(CHARACTER_ART));

export function hasCharacterArt(cardId: string): boolean {
  return Boolean(CHARACTER_ART[cardId]);
}

export function getCardImage(cardId: string): string {
  return `${CHARACTER_ART[cardId] ?? "./assets/cards/characters/fallback.webp"}?v=illustrated-20260921`;
}

export function getCardImageFallback(_cardId: string): string {
  return "./assets/cards/characters/fallback.webp?v=illustrated-20260921";
}
