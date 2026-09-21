"""Extract approved portrait atlas cells; never generate procedural placeholders."""
from pathlib import Path
import hashlib
import json
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source'
OUT = ROOT / 'client/public/assets/cards/characters'

def main():
    manifest = json.loads((SOURCE / 'manifest.json').read_text())
    cols, rows = manifest['columns'], manifest['rows']
    seen = set()
    records = {}
    OUT.mkdir(parents=True, exist_ok=True)
    for atlas in manifest['atlases']:
        source = SOURCE / atlas['file']
        if hashlib.sha256(source.read_bytes()).hexdigest() != atlas['sha256']:
            raise SystemExit(f'Atlas changed unexpectedly: {source}')
        with Image.open(source) as image:
            image = image.convert('RGB')
            if image.width % cols or image.height % rows:
                raise SystemExit(f'Invalid atlas grid: {source}')
            width, height = image.width // cols, image.height // rows
            if min(width, height) < 400 or len(atlas['cards']) != cols * rows:
                raise SystemExit(f'Invalid portrait dimensions or mapping: {source}')
            for index, card in enumerate(atlas['cards']):
                if card in seen:
                    raise SystemExit(f'Duplicate portrait: {card}')
                seen.add(card)
                x, y = index % cols * width, index // cols * height
                target = OUT / f'{card}.webp'
                buffer = BytesIO()
                image.crop((x, y, x + width, y + height)).save(buffer, 'WEBP', quality=92, method=6)
                payload = buffer.getvalue()
                if len(payload) < 1000:
                    raise SystemExit(f'Invalid portrait encoding: {card}')
                temporary = target.with_suffix('.tmp')
                temporary.write_bytes(payload)
                temporary.replace(target)
                records[card] = {'atlas': atlas['file'], 'cell': index, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    expected = {item['id'] for item in json.loads((ROOT / 'client/src/data/character-art-backlog.json').read_text())['completedIllustrations']}
    if seen - {'fallback'} != expected or len(expected) != 35:
        raise SystemExit('Expected 35 replacement portraits')
    (OUT / 'illustration-provenance.json').write_text(json.dumps({'version':manifest['version'], 'portraits':records},indent=2)+'\n')
    print('35 illustrated replacements + illustrated fallback exported; no procedural drawing.')

if __name__ == '__main__':
    main()
