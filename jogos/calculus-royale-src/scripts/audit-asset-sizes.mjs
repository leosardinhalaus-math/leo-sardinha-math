import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run after `npm run build`; inspect the actual deployable Vite output, not source estimates.
const root = resolve(process.argv[2] ?? fileURLToPath(new URL('../dist/public/', import.meta.url)));
const modelDir = join(root, 'assets/models/generated');
const manifest = JSON.parse(readFileSync(join(modelDir, 'manifest.json'), 'utf8'));
const characters = manifest.characters;
assert(characters && typeof characters === 'object' && !Array.isArray(characters), 'Missing generated model manifest');
const ids = Object.keys(characters);
assert.equal(ids.length, 45, 'The game currently requires 45 generated character models');

const MAX_MODEL_BYTES = 1024 * 1024;
const MAX_TOTAL_MODEL_BYTES = 32 * 1024 * 1024;
let modelBytes = 0;
for (const id of ids) {
  assert.match(id, /^[a-z0-9-]+$/, `Invalid model ID: ${id}`);
  const expectedUrl = `./assets/models/generated/${id}.glb`;
  assert.equal(characters[id]?.url, expectedUrl, `Unexpected model path for ${id}`);
  const size = statSync(join(modelDir, `${id}.glb`)).size;
  assert(size > 0 && size <= MAX_MODEL_BYTES, `${id}.glb: ${size} bytes, limit ${MAX_MODEL_BYTES}`);
  modelBytes += size;
}
const actualModels = readdirSync(modelDir).filter(name => extname(name).toLowerCase() === '.glb');
assert.deepEqual(actualModels.sort(), ids.map(id => `${id}.glb`).sort(), 'Orphaned or missing generated GLB models');
assert(modelBytes <= MAX_TOTAL_MODEL_BYTES, `Generated models exceed ${MAX_TOTAL_MODEL_BYTES} bytes`);

const assets = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile()) assets.push({ path: fullPath.slice(root.length + 1), bytes: statSync(fullPath).size });
  }
}
walk(root);
assets.sort((a, b) => b.bytes - a.bytes);
const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
const mib = bytes => (bytes / (1024 * 1024)).toFixed(2);
console.log(`Asset audit: ${ids.length} generated GLBs (${mib(modelBytes)} MiB, <=32 MiB); ${assets.length} deployable files (${mib(totalBytes)} MiB total).`);
console.log('Largest deployable files:\n' + assets.slice(0, 10).map(a => `  ${mib(a.bytes)} MiB  ${a.path}`).join('\n'));
console.log('PASS: generated model inventory and size budget; total deployment size is informational, not a mobile transfer measurement.');
