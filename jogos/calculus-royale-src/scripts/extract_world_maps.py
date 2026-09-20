from pathlib import Path
import base64
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client" / "src" / "data" / "worldMapsData.ts"
OUT = ROOT / "client" / "public" / "assets" / "maps"

text = SOURCE.read_text(encoding="utf-8")
matches = re.findall(r'(\d+)\s*:\s*"data:image/webp;base64,([^"]+)"', text)

if len(matches) < 5:
    raise SystemExit(f"Esperados 5 mapas embutidos; encontrados {len(matches)}")

OUT.mkdir(parents=True, exist_ok=True)
seen = set()

for number, payload in matches:
    idx = int(number)
    if idx not in range(1, 6) or idx in seen:
        continue
    raw = base64.b64decode(payload, validate=True)
    if len(raw) < 5000 or not raw.startswith(b"RIFF") or b"WEBP" not in raw[:16]:
        raise SystemExit(f"Mapa {idx} inválido ({len(raw)} bytes)")
    target = OUT / f"world-{idx}.webp"
    target.write_bytes(raw)
    seen.add(idx)
    print(f"OK mapa {idx}: {len(raw)} bytes")

missing = [i for i in range(1, 6) if i not in seen]
if missing:
    raise SystemExit(f"Mapas ausentes: {missing}")

print("Mapas premium extraídos: 5/5")
