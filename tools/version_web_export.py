"""Give each distinct Godot pack a distinct URL, preserving browser save data."""
import argparse
import hashlib
import json
from pathlib import Path
import re

parser = argparse.ArgumentParser()
parser.add_argument('--dir', type=Path, required=True)
args = parser.parse_args()
page = args.dir / 'index.html'
html = page.read_text()
match = re.search(r'const GODOT_CONFIG = (\{.*?\});', html)
if not match:
    raise SystemExit('Godot Web configuration was not found.')
config = json.loads(match.group(1))
previous = config.get('mainPack') or config['executable'] + '.pck'
source = args.dir / previous
pack_hash = hashlib.sha256(source.read_bytes()).hexdigest()
filename = f'calculus-{pack_hash[:16]}.pck'
target = args.dir / filename
if source != target:
    source.rename(target)
config['mainPack'] = filename
config['fileSizes'].pop(previous, None)
config['fileSizes'][filename] = target.stat().st_size
encoded = json.dumps(config, separators=(',', ':'))
page.write_text(html[:match.start(1)] + encoded + html[match.end(1):])
(args.dir / 'build-version.json').write_text(json.dumps({'pack': filename, 'sha256': pack_hash}) + '\n')
print(f'Versioned Web pack: {filename} ({target.stat().st_size} bytes)')
