"""Boot every exported screen from the PCK, outside the source project."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--engine', default='godot')
parser.add_argument('--pack', required=True)
args = parser.parse_args()
engine = shutil.which(args.engine) or str(Path(args.engine).resolve())
pack = str(Path(args.pack).resolve())
with tempfile.TemporaryDirectory(prefix='calculus-export-') as isolated:
    env = dict(os.environ, XDG_DATA_HOME=isolated)
    for scene in ['MainMenu', 'IslandOverworld', 'BattleArena3D']:
        result = subprocess.run(
            [engine, '--headless', '--main-pack', pack,
             f'res://scenes/{scene}.tscn', '--quit-after', '12'],
            cwd=isolated, env=env, text=True, capture_output=True, timeout=60)
        output = result.stdout + result.stderr
        if result.returncode or 'ERROR:' in output or 'SCRIPT ERROR:' in output:
            raise SystemExit(f'Exported {scene} failed:\n{output}')
        print(f'Exported {scene}: OK')
    # Reuse the integration suite as an external script; all game resources
    # must still come from the exported PCK, including a summoned GLB model.
    suite = Path(__file__).resolve().parents[1] / 'tests/godot/test_game.gd'
    result = subprocess.run(
        [engine, '--headless', '--main-pack', pack, '--script', str(suite)],
        cwd=isolated, env=env, text=True, capture_output=True, timeout=90)
    output = result.stdout + result.stderr
    if result.returncode or 'ERROR:' in output or '0 failures' not in output:
        raise SystemExit(f'Exported integration tests failed:\n{output}')
    print(output.strip())
