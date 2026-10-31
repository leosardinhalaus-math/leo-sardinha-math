/* Matemática e dados autorais · Leo Sardinha.Math · CC BY-SA 4.0 */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MusicMath=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const qualities={maj:{label:'Maior',suffix:'',intervals:[0,4,7]},m:{label:'Menor',suffix:'m',intervals:[0,3,7]},dim:{label:'Diminuta',suffix:'dim',intervals:[0,3,6]},aug:{label:'Aumentada',suffix:'aug',intervals:[0,4,8]},sus4:{label:'Suspensa (4ª)',suffix:'sus4',intervals:[0,5,7]},maj7:{label:'Sétima maior',suffix:'Maj7',intervals:[0,4,7,11]},m7:{label:'Menor com sétima',suffix:'m7',intervals:[0,3,7,10]},'7':{label:'Sétima dominante',suffix:'7',intervals:[0,4,7,10]},m7b5:{label:'Meio-diminuta',suffix:'m7♭5',intervals:[0,3,6,10]},dim7:{label:'Sétima diminuta',suffix:'dim7',intervals:[0,3,6,9]}};
const mod=(x,n=12)=>((x%n)+n)%n;
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a}
function normalize(set){return [...new Set(set.map(x=>mod(x)))].sort((a,b)=>a-b)}
function cycle(start,step){let result=[],x=mod(start);do{result.push(x);x=mod(x+step)}while(x!==mod(start));return result}
const position=(pc,layout)=>mod(pc*(layout==='fifths'?7:1));
const transpose=(set,n)=>normalize(set.map(x=>x+n));
const reflect=(set,n)=>normalize(set.map(x=>n-x));
function chord(root,quality){if(!qualities[quality])throw Error('Tipo de acorde desconhecido.');return normalize(qualities[quality].intervals.map(x=>x+root))}
function identify(set){let key=normalize(set).join(',');for(let root=0;root<12;root++)for(const[q,value]of Object.entries(qualities))if(chord(root,q).join(',')===key)return{root,quality:q,name:names[root]+value.suffix};return null}
function parseChord(token){let m=token.match(/^([A-Ga-g])([#♯b♭]?)(maj7|Maj7|M7|m7b5|m7♭5|ø7|dim7|°7|m7|7|m|maj|dim|aug|sus4)?$/);if(!m)throw Error('Acorde não reconhecido: '+token+'. Ex.: CMaj7, F#m7, Bb7, Bm7b5.');let root=mod(({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[m[1].toUpperCase()]+(['#','♯'].includes(m[2])?1:['b','♭'].includes(m[2])?-1:0)),q=({Maj7:'maj7',M7:'maj7','m7♭5':'m7b5','ø7':'m7b5','°7':'dim7'})[m[3]]||m[3]||'maj';return{root,quality:q,name:m[1].toUpperCase()+m[2]+qualities[q].suffix,notes:chord(root,q)}}
function parseProgression(text){let tokens=text.trim().split(/[\s,;]+/).filter(Boolean);if(!tokens.length||tokens.length>32)throw Error('Escreva de 1 a 32 acordes, separados por espaço ou vírgula.');return tokens.map(parseChord)}
function edges(set,layout,mode){let notes=normalize(set).sort((a,b)=>position(a,layout)-position(b,layout)),result=[];if(mode==='clique'){for(let i=0;i<notes.length;i++)for(let j=i+1;j<notes.length;j++)result.push([notes[i],notes[j]])}else if(notes.length===2)result.push(notes);else if(notes.length>2)for(let i=0;i<notes.length;i++)result.push([notes[i],notes[(i+1)%notes.length]]);return result}
function voicing(set,inversion=0,root){let notes=normalize(set);if(!notes.length)return[];if(root!==undefined)notes.sort((a,b)=>mod(a-root)-mod(b-root));let midi=notes.map((pc,i)=>60+pc);for(let i=1;i<midi.length;i++)while(midi[i]<=midi[i-1])midi[i]+=12;for(let i=0;i<mod(inversion,midi.length);i++)midi.push(midi.shift()+12);return midi}
const frequency=midi=>440*2**((midi-69)/12);
function tuning(){let pure=1.5,equal=2**(7/12),ratio=pure**12/2**7;return{pure,equal,ratio,cents:1200*Math.log2(ratio),fifthCents:1200*Math.log2(pure)-700}}
return{names,qualities,mod,gcd,normalize,cycle,position,transpose,reflect,chord,identify,parseChord,parseProgression,edges,voicing,frequency,tuning};
});
