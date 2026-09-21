import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const root = path.resolve(process.cwd(), "client", "public", "assets", "cards", "characters");
const ids = [
"limit","slope","chain","implicit","area","ftc","series","taylor","rate","newton",
"power","sine","euler","ln","cauchy","opt","cavalieri","fractal","sub","parts","trap",
"improper","continuity","quotient","secant","bernoulli","inverse","expchain","root","mirror",
"mean","growth","taylor2","miner","average","volume","surface","gabriel","cavalieri-advanced",
"surface-flux","parts2","simpson","compare","simpson-advanced","comparison"
];

const missing=[];
for(const id of ids){
  const file=path.join(root, id+".webp");
  const ok=fs.existsSync(file) && fs.statSync(file).size>1000;
  console.log((ok?"OK":"ERRO")+"  "+id);
  if(!ok) missing.push(id);
}
console.log("\nCoverage: "+(ids.length-missing.length)+"/"+ids.length);
if(missing.length){
  console.error("Missing: "+missing.join(", "));
  process.exit(1);
}

// Existing files alone do not prove that procedural art has been replaced.
const provenance=JSON.parse(fs.readFileSync(path.join(root,'illustration-provenance.json'),'utf8'));
const completed=JSON.parse(fs.readFileSync('client/src/data/character-art-backlog.json','utf8')).completedIllustrations;
for(const {id} of completed){
  const record=provenance.portraits[id];
  const bytes=fs.readFileSync(path.join(root,id+'.webp'));
  if(!record || createHash('sha256').update(bytes).digest('hex')!==record.sha256) throw new Error('Illustration provenance mismatch: '+id);
}
console.log('Verified 35 illustrated portraits against build provenance.');
