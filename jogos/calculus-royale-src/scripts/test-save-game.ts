import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSaveStore,normalizeSavedCounter,SAVE_ENVELOPE_KEY,SAVE_SCHEMA_VERSION,storageKeys} from '../client/src/data/saveGame.ts';

class MemoryStorage{
 private values=new Map<string,string>();
 getItem(key:string){return this.values.get(key)??null;}
 setItem(key:string,value:string){this.values.set(key,value);}
}

const legacy=new MemoryStorage();
legacy.setItem(storageKeys.coins,JSON.stringify(320));
legacy.setItem(storageKeys.deck,JSON.stringify(['slope','limit']));
const migrated=createSaveStore(legacy);
assert.equal(migrated.read(storageKeys.coins,0),320);
assert.deepEqual(migrated.read<string[]>(storageKeys.deck,[]),['slope','limit']);
const first=JSON.parse(legacy.getItem(SAVE_ENVELOPE_KEY)!);
assert.equal(first.schemaVersion,SAVE_SCHEMA_VERSION);
assert.equal(first.data[storageKeys.coins],320);

migrated.write(storageKeys.coins,475);
migrated.write(storageKeys.playerName,'Léo');
assert.equal(JSON.parse(legacy.getItem(storageKeys.coins)!),475,'chave antiga continua compatível');
assert.equal(createSaveStore(legacy).read(storageKeys.playerName,''),'Léo');
assert.equal(createSaveStore(legacy).snapshot().schemaVersion,SAVE_SCHEMA_VERSION);

const broken=new MemoryStorage();broken.setItem(SAVE_ENVELOPE_KEY,'{inválido');broken.setItem(storageKeys.worldIndex,'também inválido');
assert.equal(createSaveStore(broken).read(storageKeys.worldIndex,0),0,'save inválido usa fallback seguro');
// Leitura bloqueada por política de privacidade não pode derrubar a inicialização.
class UnreadableStorage extends MemoryStorage {
 getItem(_key:string):string|null {throw new Error('SecurityError: access denied');}
}
const unreadable=createSaveStore(new UnreadableStorage());
assert.equal(unreadable.read(storageKeys.coins,7),7);
assert.deepEqual(unreadable.snapshot().data,{});
assert.doesNotThrow(()=>unreadable.write(storageKeys.coins,12));

// Envelopes com data=null/array/primitivo são inválidos, mas dados legados válidos sobrevivem.
const malformed=new MemoryStorage();
for (const data of [null,[],42,'texto']) {
 malformed.setItem(SAVE_ENVELOPE_KEY,JSON.stringify({schemaVersion:SAVE_SCHEMA_VERSION,updatedAt:1,data}));
 malformed.setItem(storageKeys.coins,'9');
 assert.equal(createSaveStore(malformed).read(storageKeys.coins,0),9);
}
// Dados locais não confiáveis não devem transformar vitórias em concatenação de texto,
// nem introduzir NaN, frações ou objetos nos saldos usados pela interface.
for (const invalid of [null, undefined, '7', -1, 2.5, NaN, Infinity, -Infinity, {}, [], Number.MAX_SAFE_INTEGER + 1]) {
 assert.equal(normalizeSavedCounter(invalid, 0), 0);
 assert.equal(normalizeSavedCounter(invalid, 320), 320);
}
assert.equal(normalizeSavedCounter(0, 320), 0);
assert.equal(normalizeSavedCounter(18, 0), 18);
assert.equal(normalizeSavedCounter(Number.MAX_SAFE_INTEGER, 0), Number.MAX_SAFE_INTEGER);
assert.equal(normalizeSavedCounter('3', NaN), 0);
const gameCanvas = readFileSync(new URL('../client/src/components/GameCanvas.tsx', import.meta.url), 'utf8');
for (const [key, fallback] of [['wins',0], ['coins',320], ['essence',6]] as const) {
 assert.ok(gameCanvas.includes(`normalizeSavedCounter(readStorage<unknown>(storageKeys.${key}, ${fallback}), ${fallback})`),
   `O contador ${key} deve ser normalizado na inicialização`);
}
console.log('PASS: save versionado, recuperação de envelopes e contadores locais validados.');
