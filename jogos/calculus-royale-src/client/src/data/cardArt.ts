import { getCardVisual } from "@/data/cardVisuals";

const CHARACTER_ART: Record<string, string> = {
  limit: "./assets/cards/characters/limit.webp",
  slope: "./assets/cards/characters/slope.webp",
  chain: "./assets/cards/characters/chain.webp",
  implicit: "./assets/cards/characters/implicit.webp",
  area: "./assets/cards/characters/area.webp",
  ftc: "./assets/cards/characters/ftc.webp",
  series: "./assets/cards/characters/series.webp",
  taylor: "./assets/cards/characters/taylor.webp",
  rate: "./assets/cards/characters/rate.webp",
  newton: "./assets/cards/characters/newton.webp",
};

export const CHARACTER_CARD_IDS = Object.freeze(Object.keys(CHARACTER_ART));

export function hasCharacterArt(cardId: string): boolean {
  return Boolean(CHARACTER_ART[cardId]);
}

export function getCardImage(cardId: string): string {
  return (
    CHARACTER_ART[cardId] ??
    getCardVisual(cardId)?.fallback ??
    "./assets/art/world-1.svg"
  );
}

export function getCardImageFallback(cardId: string): string {
  return getCardVisual(cardId)?.fallback ?? "./assets/art/world-1.svg";
}
