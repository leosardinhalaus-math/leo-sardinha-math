import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "client", "public");
const manifestPath = path.resolve(process.cwd(), "client", "src", "data", "card-visual-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const relativeAsset = (asset) => asset.replace(/^\.\//, "").replace(/^\//, "");
const checks = [];

for (const card of manifest.cards) {
  for (const variant of ["art", "thumb", "battle"]) {
    const asset = card[variant];
    const file = path.join(root, relativeAsset(asset));
    checks.push({ id: card.id, variant, asset, exists: fs.existsSync(file) });
  }
}

const missing = checks.filter((item) => !item.exists);
console.table(checks);

if (missing.length) {
  console.warn("\nAssets ainda não produzidos:");
  for (const item of missing) console.warn(`- ${item.id} · ${item.variant}: ${item.asset}`);
  if (process.env.STRICT_CARD_ASSETS === "1") process.exit(1);
} else {
  console.log("\nTodos os assets oficiais estão presentes.");
}
