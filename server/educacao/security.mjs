import {randomBytes,timingSafeEqual,createPublicKey,verify} from 'node:crypto';
export const random=()=>randomBytes(32).toString('base64url');
export function equal(a,b){return typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b))}
export function verifiedClaims(token,keys,{clientId,nonce,now=Date.now()/1000}){const parts=token.split('.');if(parts.length!==3)throw Error('token');const header=JSON.parse(Buffer.from(parts[0],'base64url'));if(header.alg!=='RS256'||typeof header.kid!=='string')throw Error('algorithm');const jwk=keys.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.use||k.use==='sig')&&(!k.alg||k.alg==='RS256'));if(!jwk)throw Error('key');if(!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw Error('signature');const c=JSON.parse(Buffer.from(parts[1],'base64url'));if(!['https://accounts.google.com','accounts.google.com'].includes(c.iss)||c.aud!==clientId||(c.azp&&c.azp!==clientId)||!Number.isFinite(c.exp)||c.exp<=now||!Number.isFinite(c.iat)||c.iat>now+60||!equal(c.nonce,nonce)||typeof c.sub!=='string'||!c.sub||c.email_verified!==true||typeof c.email!=='string')throw Error('claims');return {sub:c.sub,email:c.email.toLowerCase(),googleHostedEmail:c.email.toLowerCase().endsWith('@gmail.com')||(typeof c.hd==='string'&&c.hd.length>0)}}
export function allowed(email,entries){return entries.some(x=>typeof x==='string'&&x.toLowerCase()===email.toLowerCase())}
export function publicPath(path){return ['/','/index.html','/sobre.html','/privacidade-educacao.html','/assets/site.css','/assets/home.css','/assets/home.js'].includes(path)||/^\/assets\/home\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|svg|woff2?)$/.test(path)}
export function deniedPath(path){return path.split('/').some(p=>p.startsWith('.')||['server','tests','tools','node_modules','docs','scripts','.git'].includes(p))||!(/\.(html|css|js|mjs|json|svg|png|jpg|jpeg|webp|gif|ico|pdf|mp4|mp3|wav|ogg|woff|woff2|ttf|sb3|ggb|wasm|pck|zip)$/i.test(path)||path.endsWith('/'))}

export function validAllowlist(entries){
 if(!Array.isArray(entries)||!entries.length||entries.length>10000)return false;
 const emails=[];
 for(const entry of entries){
  const email=typeof entry==='string'?entry:entry?.email;
  if(typeof email!=='string'||!/^[^\s@]+@[^\s@]+$/.test(email))return false;
  if(typeof entry!=='string'){
   if(!entry||typeof entry!=='object'||Array.isArray(entry)||Object.keys(entry).some(k=>!['email','sub','role'].includes(k)))return false;
   if('role' in entry&&!['teacher','admin'].includes(entry.role))return false;
   if('sub' in entry&&(typeof entry.sub!=='string'||!entry.sub))return false;
   if(!('sub' in entry)&&!('role' in entry))return false;
  }
  emails.push(email.toLowerCase());
 }
 return new Set(emails).size===emails.length;
}
function matchesIdentity(identity,entry){
 const email=typeof entry==='string'?entry:entry.email;
 if(typeof identity?.email!=='string'||email.toLowerCase()!==identity.email.toLowerCase())return false;
 if(typeof entry==='object'&&'sub' in entry)return entry.sub===identity.sub;
 return identity.googleHostedEmail===true;
}
export function identityRole(identity,entries){
 if(!validAllowlist(entries))return null;
 const entry=entries.find(entry=>matchesIdentity(identity,entry));
 return entry?(typeof entry==='object'?entry.role||'teacher':'teacher'):null;
}
export function identityAllowed(identity,entries){return identityRole(identity,entries)!==null}
