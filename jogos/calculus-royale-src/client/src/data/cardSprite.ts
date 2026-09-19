import type { CSSProperties } from "react";
export const CARD_SPRITE_URL = "./assets/cards/card-sprite.webp";
const CARD_SPRITE_INDEX: Record<string, number> = {
  limit:0, slope:1, chain:2, implicit:3, area:4,
  ftc:5, series:6, taylor:7, rate:8, newton:9,
};
export function hasCardSprite(id:string){ return CARD_SPRITE_INDEX[id] !== undefined; }
export function getCardSpriteStyle(id:string): CSSProperties | undefined {
  const index=CARD_SPRITE_INDEX[id];
  if(index===undefined) return undefined;
  const col=index%5, row=Math.floor(index/5);
  return {
    backgroundImage:`url("${CARD_SPRITE_URL}")`,
    backgroundSize:"500% 200%",
    backgroundPosition:`${col*25}% ${row*100}%`,
    backgroundRepeat:"no-repeat",
  };
}
