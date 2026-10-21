import {test,before,after,beforeEach} from 'node:test';
import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,query,limit,serverTimestamp} from 'firebase/firestore';

let env;
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-calculus-royale',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(new URL('../../firestore.rules',import.meta.url),'utf8')}});
});
beforeEach(async()=>env.clearFirestore());
after(async()=>env?.cleanup());
const profile=id=>({user_id:id,username:'Jogador fictício',public_slug:'jogador-'+id,avatar_seed:'J',created_at:serverTimestamp()});
const save=id=>({user_id:id,schema_version:1,payload_json:'{"calculus-royale:wins":"1"}',summary:{wins:1},updated_at:serverTimestamp()});
const alice=()=>env.authenticatedContext('alice').firestore();
const bob=()=>env.authenticatedContext('bob').firestore();
const guest=()=>env.unauthenticatedContext().firestore();

test('owner may create and read a private save',async()=>{
 const db=alice();await assertSucceeds(setDoc(doc(db,'progress','alice'),save('alice')));await assertSucceeds(getDoc(doc(db,'progress','alice')));
});
test('another user and a guest cannot read a private save',async()=>{
 await setDoc(doc(alice(),'progress','alice'),save('alice'));
 await assertFails(getDoc(doc(bob(),'progress','alice')));await assertFails(getDoc(doc(guest(),'progress','alice')));
});
test('another user cannot overwrite a save',async()=>{
 await assertFails(setDoc(doc(bob(),'progress','alice'),save('alice')));
});
test('owner cannot forge the saved user ID or add fields',async()=>{
 await assertFails(setDoc(doc(alice(),'progress','alice'),{...save('bob')}));
 await assertFails(setDoc(doc(alice(),'progress','alice'),{...save('alice'),admin:true}));
});
test('invalid schema, large payloads and fake timestamps are rejected',async()=>{
 for(const patch of [{schema_version:2},{payload_json:'x'.repeat(200001)},{updated_at:new Date(0)},{summary:{password:'secret'}}]){
  await assertFails(setDoc(doc(alice(),'progress','alice'),{...save('alice'),...patch}));
 }
});
test('public profile contains only approved non-sensitive fields',async()=>{
 await assertSucceeds(setDoc(doc(alice(),'players','alice'),profile('alice')));
 await assertSucceeds(getDoc(doc(guest(),'players','alice')));
 await assertFails(setDoc(doc(alice(),'players','alice'),{...profile('alice'),email:'test@example.invalid'}));
});
test('profile spoofing and invalid names are rejected',async()=>{
 await assertFails(setDoc(doc(bob(),'players','alice'),profile('alice')));
 await assertFails(setDoc(doc(alice(),'players','alice'),{...profile('alice'),public_slug:'jogador-bob'}));
 await assertFails(setDoc(doc(alice(),'players','alice'),{...profile('alice'),username:'A'}));
});
test('guests cannot create profiles',async()=>{
 await assertFails(setDoc(doc(guest(),'players','alice'),profile('alice')));
});
test('profile queries require a bounded limit',async()=>{
 await assertSucceeds(getDocs(query(collection(guest(),'players'),limit(10))));
 await assertFails(getDocs(collection(guest(),'players')));
 await assertFails(getDocs(query(collection(guest(),'players'),limit(101))));
});
test('clients cannot publish official leaderboard scores',async()=>{
 await assertFails(setDoc(doc(alice(),'leaderboard','alice'),{wins:999}));
 await assertFails(setDoc(doc(guest(),'leaderboard','alice'),{wins:999}));
});
test('public leaderboard is readable with a bounded query',async()=>{
 await assertSucceeds(getDocs(query(collection(guest(),'leaderboard'),limit(100))));
 await assertFails(getDocs(collection(guest(),'leaderboard')));
});
test('unknown collections remain closed',async()=>{
 await assertFails(setDoc(doc(alice(),'secret','alice'),{value:1}));
 await assertFails(getDoc(doc(alice(),'secret','alice')));
});
