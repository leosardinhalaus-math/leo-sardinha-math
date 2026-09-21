"""Prepara todas as imagens a partir das fontes versionadas (Python + Pillow)."""
from pathlib import Path
import base64
import subprocess
import sys
root = Path(__file__).resolve().parent.parent
cards = root / 'client/public/assets/cards'
cards.mkdir(parents=True, exist_ok=True)
encoded = ''.join((root / f'.packed/card-sprite.webp.b64.part{i}').read_text() for i in range(1, 7))
(cards / 'card-sprite.webp').write_bytes(base64.b64decode(encoded))
for script in ['extract_world_maps.py', 'split_card_sprite.py', 'generate_character_assets.py']:
    subprocess.run([sys.executable, str(root / 'scripts' / script)], cwd=root, check=True)
