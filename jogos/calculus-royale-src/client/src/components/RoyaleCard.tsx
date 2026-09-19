import type { CSSProperties, MouseEvent } from "react";
import { getCardVisual } from "@/data/cardVisuals";

type GameCard = {
  id: string;
  name: string;
  formula: string;
  effect: string;
  kind: string;
  rarity: string;
  cost: number;
  power: number;
  icon: string;
};

type Props = {
  card: GameCard;
  level?: number;
  disabled?: boolean;
  selected?: boolean;
  variant?: "hand" | "deck" | "gallery";
  onPlay?: (card: GameCard) => void;
  onEvolve?: (card: GameCard) => void;
};

const rarityLabel: Record<string, string> = {
  comum: "COMUM",
  rara: "RARA",
  "épica": "ÉPICA",
  "lendária": "LENDÁRIA",
};

export default function RoyaleCard({
  card,
  level = 1,
  disabled = false,
  selected = false,
  variant = "hand",
  onPlay,
  onEvolve,
}: Props) {
  const visual = getCardVisual(card.id);
  const effectivePower = Math.round(card.power * (1 + Math.max(0, level - 1) * 0.12));
  const style = {
    "--visual-primary": visual?.palette?.[0] ?? "#2ED6E8",
    "--visual-secondary": visual?.palette?.[1] ?? "#102A4D",
  } as CSSProperties;

  const art = variant === "gallery" ? visual?.art : variant === "deck" ? visual?.thumb : visual?.thumb;
  const fallback = visual?.fallback ?? "./assets/art/world-1.svg";

  const handleEvolve = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEvolve?.(card);
  };

  return (
    <article className={`royale-card rarity-${card.rarity} variant-${variant} ${selected ? "is-selected" : ""}`} style={style}>
      <button
        className="royale-card-hitarea"
        type="button"
        disabled={disabled}
        onClick={() => onPlay?.(card)}
        aria-label={`${card.name}: ${card.formula}`}
      >
        <header className="royale-card-meta">
          <span className="royale-card-cost">{card.cost}</span>
          <span>{card.kind}</span>
          <span>{rarityLabel[card.rarity] ?? card.rarity.toUpperCase()}</span>
        </header>

        <div className="royale-card-art">
          <img
            src={art ?? fallback}
            data-fallback={fallback}
            alt={`${card.name}, personagem inspirado em ${card.formula}`}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              const image = event.currentTarget;
              if (image.src.endsWith(fallback)) return;
              image.src = fallback;
            }}
          />
          <div className="royale-card-vignette" />
          <span className="royale-card-symbol">{visual?.symbol ?? card.icon ?? "∂"}</span>
          <span className="royale-card-formula">{card.formula}</span>
        </div>

        <div className="royale-card-copy">
          <strong>{card.name}</strong>
          <small>{visual?.class ? visual.class.toUpperCase() : "CÁLCULO"}</small>
          <p>{card.effect}</p>
        </div>

        <footer className="royale-card-footer">
          <span>⚡ {effectivePower} poder</span>
          <span>Nv. {level}</span>
        </footer>
      </button>

      {onEvolve && (
        <button className="royale-card-evolve" type="button" onClick={handleEvolve}>
          ✦ Evoluir
        </button>
      )}
    </article>
  );
}
