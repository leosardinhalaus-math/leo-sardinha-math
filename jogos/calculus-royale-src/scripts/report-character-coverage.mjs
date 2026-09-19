import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "client", "public", "assets", "cards", "characters");
const ids = ["limit","slope","chain","implicit","area","ftc","series","taylor","rate","newton","power","sine","euler","ln","cauchy","opt","cavalieri","fractal","sub","parts","trap","improper","continuity","quotient","secant","bernoulli","inverse","expchain","root","mirror","mean","growth","taylor2","miner","average","volume","surface","gabriel","cavalieri-advanced","surface-flux","parts2","simpson","compare","simpson-advanced","comparison"];
const existing = [];
const missing = [];

for (const id of ids) {
  const file = path.join(root, `${id}.webp`);
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) existing.push(id);
  else missing.push(id);
}

console.log(`Character art coverage: ${existing.length}/${ids.length}`);
console.log("Present:", existing.join(", "));
if (missing.length) console.log("Missing:", missing.join(", "));

fs.writeFileSync(
  path.resolve(process.cwd(), "character-art-coverage.json"),
  JSON.stringify({ total: ids.length, present: existing.length, existing, missing }, null, 2)
);
