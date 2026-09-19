import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "client", "public");
const ids = ["limit","slope","chain","implicit","area","ftc","series","taylor","rate","newton"];

let failed = false;

for (const id of ids) {
  const file = path.join(root, "assets", "cards", "characters", `${id}.webp`);
  const exists = fs.existsSync(file);
  const size = exists ? fs.statSync(file).size : 0;
  const ok = exists && size > 1000;
  console.log(`${ok ? "OK" : "ERRO"}  ${id.padEnd(10)} ${size} bytes`);
  if (!ok) failed = true;
}

if (failed) {
  console.error("\nFalha: um ou mais personagens não possuem asset individual válido.");
  process.exit(1);
}

console.log("\nTodos os personagens individuais foram validados.");
