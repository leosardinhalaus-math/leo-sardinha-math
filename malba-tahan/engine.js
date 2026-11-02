/* Núcleo matemático independente da interface. */
(function(root){
'use strict';
const pick=(a,r)=>a[Math.floor(r()*a.length)];
const integer=(a,b,r)=>a+Math.floor(r()*(b-a+1));
function divisors(n){const a=[];for(let i=1;i<=Math.floor(n/2);i++)if(n%i===0)a.push(i);return a;}
const sum=a=>a.reduce((x,y)=>x+y,0);
const fours={0:'4+4-4-4',1:'(4+4)/(4+4)',2:'4/4+4/4',3:'(4+4+4)/4',4:'4+(4-4)*4',5:'(4*4+4)/4',6:'4+(4+4)/4',7:'4+4-4/4',8:'4+4+4-4',9:'4+4+4/4'};
function expression(raw){
 const s=String(raw).replace(/\s/g,'').replace(/[×·]/g,'*').replace(/[÷:]/g,'/').replace(/−/g,'-');
 if(s.length>100||!/^[4+*/()\-]+$/.test(s)||(s.match(/4/g)||[]).length!==4||/44/.test(s))throw Error('Use exatamente quatro algarismos 4, operações +, −, ×, ÷ e parênteses.');
 let i=0;
 function atom(){if(s[i]==='4'){i++;return 4;}if(s[i]==='('){i++;const v=add();if(s[i++]!==')')throw Error('Confira os parênteses.');return v;}throw Error('Confira a ordem dos números e das operações.');}
 function mul(){let v=atom();while(s[i]==='*'||s[i]==='/'){const op=s[i++],b=atom();if(op==='/'&&b===0)throw Error('Não é possível dividir por zero.');v=op==='*'?v*b:v/b;}return v;}
 function add(){let v=mul();while(s[i]==='+'||s[i]==='-'){const op=s[i++],b=mul();v=op==='+'?v+b:v-b;}return v;}
 const v=add();if(i!==s.length||!Number.isFinite(v))throw Error('Confira a expressão.');return v;
}
function generate(id,r=Math.random){
 switch(id){
 case 'camelos':{const k=integer(1,6,r),total=36*k;return {id,key:k,k,n:total-1,total,answers:[18*k,12*k,4*k,total-34*k]};}
 case 'paes':{const pair=pick([[5,3],[7,5],[8,7],[4,3],[6,4],[9,6],[8,5],[11,7],[10,8]],r),[a,b]=pair;return {id,key:pair.join('-'),a,b,coins:a+b,answers:[2*a-b,2*b-a]};}
 case 'quatros':{const target=integer(0,9,r);return {id,key:target,target,solution:fours[target],answers:[target]};}
 case 'vasos':{const m=pick([3,6,9,12],r);return {id,key:m,m,count:m,total:3*m,liquid:3*m/2,eachVessels:m,eachLiquid:m/2};}
 case 'xadrez':{const start=integer(1,4,r),cells=integer(5,12,r);return {id,key:start+'-'+cells,start,cells,last:start*2**(cells-1),total:start*(2**cells-1),answers:[start*2**(cells-1),start*(2**cells-1)]};}
 case 'magico':{const a=integer(1,4,r),b=integer(0,9,r);let grid=[8,1,6,3,5,7,4,9,2].map(n=>a*n+b);for(let j=integer(0,3,r);j>0;j--)grid=[grid[6],grid[3],grid[0],grid[7],grid[4],grid[1],grid[8],grid[5],grid[2]];if(r()<0.5)grid=[grid[2],grid[1],grid[0],grid[5],grid[4],grid[3],grid[8],grid[7],grid[6]];const hidden=pick([[0,4,8],[1,3,6],[2,5,7],[0,2,4]],r);return {id,key:grid.join('-')+':'+hidden,grid,hidden,constant:15*a+3*b,answers:hidden.map(i=>grid[i])};}
 case 'amigos':{const pair=pick([[220,284],[1184,1210],[2620,2924]],r);return {id,key:pair.join('-'),a:pair[0],b:pair[1],da:divisors(pair[0]),db:divisors(pair[1]),answers:[pair[1],pair[0]]};}
 case 'perfeitos':{const n=pick([6,12,18,20,24,28,30,36,40,48,60,100,120,496],r),d=divisors(n),s=sum(d);return {id,key:n,n,d,s,classification:s===n?'perfeito':s<n?'deficiente':'abundante',answers:[s]};}
 default:throw Error('Atividade desconhecida');
 }
}
function next(id,previous,r=Math.random){for(let i=0;i<40;i++){const v=generate(id,r);if(String(v.key)!==String(previous))return v;}return generate(id,r);}
function check(v,values){
 if(v.id==='quatros'){try{return {ok:Math.abs(expression(values[0])-v.target)<1e-9};}catch(e){return {ok:false,message:e.message};}}
 if(v.id==='vasos'){
 const n=values.map(Number);if(values.length!==9||values.some(s=>String(s).trim()==='')||n.some(x=>!Number.isInteger(x)||x<0))return {ok:false,message:'Preencha os nove campos com quantidades inteiras a partir de zero.'};
 const ok=[0,1,2].every(row=>sum(n.slice(row*3,row*3+3))===v.m&&2*n[row*3]+n[row*3+1]===v.m)&&[0,1,2].every(col=>n[col]+n[col+3]+n[col+6]===v.m);return {ok};
 }
 if(values.some(s=>String(s).trim()===''))return {ok:false,message:'Preencha todos os campos antes de conferir.'};
 const nums=values.map(x=>Number(String(x).replace(',','.')));return {ok:nums.length===v.answers.length&&nums.every((x,i)=>Number.isFinite(x)&&Math.abs(x-v.answers[i])<1e-9)};
}
const api={generate,next,check,expression,divisors,sum,fours};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TahanMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
