from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPRITE = ROOT / "client" / "public" / "assets" / "cards" / "card-sprite.webp"
OUT = ROOT / "client" / "public" / "assets" / "cards" / "characters"

CARD_ORDER = [
    "limit", "slope", "chain", "implicit", "area",
    "ftc", "series", "taylor", "rate", "newton",
]

def main():
    if not SPRITE.exists():
        raise SystemExit(f"Sprite não encontrado: {SPRITE}")

    OUT.mkdir(parents=True, exist_ok=True)

    with Image.open(SPRITE) as image:
        image = image.convert("RGB")
        width, height = image.size

        if width % 5 != 0 or height % 2 != 0:
            raise SystemExit(
                f"Dimensão inesperada do sprite: {width}x{height}; esperado grid 5x2."
            )

        cell_w = width // 5
        cell_h = height // 2

        for index, card_id in enumerate(CARD_ORDER):
            col = index % 5
            row = index // 5
            box = (
                col * cell_w,
                row * cell_h,
                (col + 1) * cell_w,
                (row + 1) * cell_h,
            )
            crop = image.crop(box)
            target = OUT / f"{card_id}.webp"
            crop.save(target, "WEBP", quality=88, method=6)

    missing = [card_id for card_id in CARD_ORDER if not (OUT / f"{card_id}.webp").exists()]
    if missing:
        raise SystemExit(f"Falha ao gerar assets: {', '.join(missing)}")

    print(f"Gerados {len(CARD_ORDER)} personagens individuais em {OUT}")

if __name__ == "__main__":
    main()
