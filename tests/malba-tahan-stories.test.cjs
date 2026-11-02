const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../malba-tahan/engine.js');
const S=require('../malba-tahan/stories.js');
test('oito recontos desenvolvidos acompanham os exemplos e mantêm perguntas e desfechos coerentes',()=>{
 for(const id of ['camelos','paes','quatros','vasos','xadrez','magico','amigos','perfeitos']){
  for(let i=0;i<20;i++){
   const v=M.generate(id),s=S.create(v),text=s.scenes.flatMap(x=>x.paragraphs).join(' ');
   assert.equal(s.scenes.length,7);assert(text.split(/\s+/).length>=600);assert(!/undefined|NaN|\[object Object\]/.test(text));
   for(const stage of [1,5]){const q=s.quizzes[stage];assert(q.options[q.answer]);assert(q.feedback.length>40);}
   assert(s.hypothesis.includes('?'));
   if(id==='camelos'){assert(text.includes(String(v.n)));assert(text.includes(String(v.total)));assert(text.includes('17/18'));}
   if(id==='paes'){assert(text.includes(`${v.a} pães`));assert(text.includes(`${v.coins} moedas`));}
   if(id==='xadrez'){assert(text.includes(v.total.toLocaleString('pt-BR')));assert(text.includes(v.last.toLocaleString('pt-BR')));}
   if(id==='magico')assert(text.includes(`a soma deve ser ${v.constant}`));
   if(id==='amigos'){assert(text.includes(String(v.a)));assert(text.includes(String(v.b)));}
   if(id==='perfeitos')assert(text.includes(`o número é ${v.classification}`));
  }
 }
});
