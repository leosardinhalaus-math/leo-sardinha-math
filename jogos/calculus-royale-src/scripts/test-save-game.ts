import assert from 'node:assert/strict';
import {createSaveStore,SAVE_ENVELOPE_KEY,SAVE_SCHEMA_VERSION,storageKeys} from '../client/src/data/saveGame.ts';

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
console.log('PASS: save versionado, migração legada, compatibilidade e recuperação de dados inválidos.');
