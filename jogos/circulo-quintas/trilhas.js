'use strict';
(()=>{
const host=document.querySelector('#trilhas'),api=window.MusicCircle,M=window.MusicMath;
if(!host||!api)return;
const tracks=[
 {title:'Ouvir e repetir',goal:'Compare sons e reproduza pequenas sequências.',evidence:'Observe se a criança distingue sons e repete a ordem, com apoio quando necessário.',missions:[
 ['Sons iguais ou diferentes?','Ouça o modelo. Os dois sons são iguais? Depois toque nas notas para experimentar.',[0,0],'same'],
 ['O som mudou?','Ouça e compare os dois sons. Explique o que percebeu.',[0,7],'same'],
 ['Minha primeira sequência','Ouça Dó, Mi, Sol. Repita tocando nessas notas, na mesma ordem.',[0,4,7],'repeat']]},
 {title:'Descobrir padrões',goal:'Encontre a parte que se repete e continue a sequência.',evidence:'Peça que a criança mostre a unidade de repetição, além de acertar a próxima nota.',missions:[
 ['Duas notas, um padrão','Ouça Dó, Sol, Dó, Sol. Toque na nota que vem depois.',[0,7,0,7],'next',0],
 ['Uma repetição diferente','Ouça Dó, Dó, Sol, Dó, Dó. Qual nota completa o padrão?', [0,0,7,0,0],'next',7],
 ['Você é o compositor','Crie um padrão de duas ou três notas e ensine a um colega. Ele consegue continuar?',[],'create']]},
 {title:'Contar no círculo',goal:'Avance e volte contando os espaços entre posições.',evidence:'Observe se conta deslocamentos, sem contar a posição inicial como primeiro passo.',missions:[
 ['Cinco passos','Comece em 0 (Dó). Avance cinco posições no sentido horário. Toque onde chegará.',[0],'next',5],
 ['Passando pelo início','Comece em 10. Avance cinco posições. Depois do 11 vem o 0. Onde chegará?', [10],'next',3],
 ['Voltando no círculo','Comece em 2. Volte quatro posições no sentido anti-horário. Onde chegará?', [2],'next',10]]},
 {title:'Transformar e comparar',goal:'Investigue figuras, giros e reflexões com apoio visual.',evidence:'Compare quantidade de vértices, distâncias e orientação. Não exija fórmulas.',missions:[
 ['Uma figura de três notas','Toque em três notas diferentes. Observe a figura e compare com a de um colega.',[],'create'],
 ['Girando a figura','Prepare o exemplo e use Girar um passo. O que mudou? A forma foi preservada?', [0,4,7],'rotate'],
 ['O espelho musical','Prepare o exemplo e reflita no eixo que passa por 0 e 6. Repita a reflexão. O que acontece?', [0,4,7],'reflect']]},
 {title:'Investigar e justificar',goal:'Faça previsões, registre ciclos e compare representações.',evidence:'Peça uma previsão antes do teste e uma explicação baseada nas posições observadas.',missions:[
 ['Saltos de três','Partindo de 0, salte sempre três posições. Quantas posições diferentes visita antes de retornar?', [0,3,6,9,0],'count',4],
 ['Comparando saltos','Teste saltos de 2, 3, 5 e 7. Registre as posições e compare os ciclos.',[],'cycle'],
 ['As mesmas notas, outro desenho','Prepare Dó–Mi–Sol. Compare o círculo cromático e o de quintas. Ouça as notas juntas e depois em sequência.', [0,4,7],'compare']]}
];
let year=new URLSearchParams(location.search).get('trilha')==='em'?5:0,step=0,attempt=[],heardTimer;const records=new Map();
function el(tag,text,attrs={}){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e}
function button(text,fn){const b=el('button',text,{type:'button'});b.onclick=fn;return b}
const title=el('h2','Uma descoberta de cada vez'),label=el('label','Escolha sua turma',{for:'trail-year'}),select=el('select',undefined,{id:'trail-year'});
tracks.forEach((t,i)=>select.append(el('option',`${i+1}º ano · ${t.title}`,{value:i})));select.append(el('option','Exploração completa · aprofundamento',{value:5}));
const content=el('div');host.append(title,label,select,content);select.value=String(year);
function feedback(text){document.querySelector('#trail-feedback').textContent=text}
function remember(){const t=document.querySelector('#trail-record');if(t)records.set(`${year}-${step}`,t.value)}
function show(){
 api.stop();attempt=[];document.body.classList.toggle('guided',year<5);document.body.dataset.year=year+1;
 if(year===5){content.replaceChildren(el('p','Todos os recursos estão disponíveis. Volte a uma turma quando quiser retomar as missões.'));return}
 const t=tracks[year],m=t.missions[step];api.layout('chromatic');document.querySelector('#trail').checked=false;document.querySelector('#ghost').checked=false;api.reset([]);
 content.replaceChildren(el('p',t.goal),el('p',`Missão ${step+1} de ${t.missions.length} · 10 a 15 minutos`,{class:'trail-step'}),el('h3',m[0]),el('p',m[1]),el('p','1. Faça uma previsão. 2. Experimente. 3. Explique o que descobriu.'));
 const tools=el('div',undefined,{class:'trail-tools'});content.append(tools);
 if(m[2].length)tools.append(button('Ouvir modelo',()=>api.listen(m[2])));
 tools.append(button('Recomeçar seleção',()=>{attempt=[];api.reset([]);feedback('Pronto para uma nova tentativa.')}),button('Ouvir minha seleção',()=>api.listen(api.notes())),button('Parar som',()=>api.stop()));
 if(m[3]==='same')for(const [text,value]of [['Iguais',true],['Diferentes',false]])tools.append(button(text,()=>feedback(value===(m[2][0]===m[2][1])?'Isso! Agora explique como percebeu.':'Ouça novamente e compare. Você pode tentar outra vez.')));
 if(['rotate','reflect','compare'].includes(m[3]))tools.append(button('Preparar exemplo',()=>api.reset(m[2])));
 if(m[3]==='rotate')tools.append(button('Girar um passo',()=>{api.transform('T',1);feedback('Compare a figura antes e depois: as distâncias foram mantidas.')}));
 if(m[3]==='reflect')tools.append(button('Refletir no espelho',()=>{api.transform('I',0);feedback('O eixo passa por 0 e 6. Aplique de novo e compare.')}));
 if(m[3]==='compare'){tools.append(button('Ordem cromática',()=>api.layout('chromatic')),button('Ordem de quintas',()=>{api.layout('fifths');feedback('Cada posição vizinha representa agora um salto de sete semitons, em vez de um. As notas selecionadas continuam iguais.')}),button('Ouvir notas juntas',()=>api.listen(api.notes(),true)))}
 if(m[3]==='cycle')for(const k of [2,3,5,7])tools.append(button(`Salto ${k}`,()=>{const seq=M.cycle(0,k);api.reset(seq);api.listen([...seq,0]);feedback(`Percurso: ${[...seq,0].join(' → ')}. ${seq.length} posições diferentes antes do retorno.`)}));
 if(m[3]==='count'){const l=el('label','Minha previsão: quantidade de posições',{for:'trail-answer'}),input=el('input',undefined,{id:'trail-answer',type:'number',min:1,max:12});content.append(l,input,button('Conferir previsão',()=>feedback(Number(input.value)===m[4]?'Sim: 0, 3, 6 e 9. O retorno ao 0 não conta como uma nova posição.':'Conte as posições diferentes: 0 → 3 → 6 → 9 → 0. Experimente novamente.')))}
 content.append(el('p','Toque nas notas do círculo abaixo. Você também pode usar Tab e Enter.',{id:'trail-feedback',class:'trail-feedback',role:'status'}));
 const record=el('textarea',undefined,{id:'trail-record',class:'trail-record',rows:3,maxlength:2000,placeholder:'Minha previsão / O que observei / Minha explicação'});record.value=records.get(`${year}-${step}`)||'';
 content.append(el('label','Meu registro — também pode ser feito oralmente ou no papel',{for:'trail-record'}),record,el('p','O registro fica apenas nesta página enquanto ela estiver aberta. Imprima para guardar; não coloque dados pessoais.',{class:'hint'}));
 const nav=el('div',undefined,{class:'trail-tools'}),prev=button('Missão anterior',()=>{remember();step--;show()}),next=button(step===2?'Rever a trilha':'Próxima missão',()=>{remember();step=(step+1)%3;show()});prev.disabled=step===0;nav.append(prev,next,button('Imprimir missão e registro',()=>window.print()));content.append(nav);
 const teacher=el('details',undefined,{class:'trail-teacher'});teacher.append(el('summary','Orientações para o professor'),el('p',t.evidence),el('p','Avance pela compreensão demonstrada, sem pontuação por velocidade. Retome missões e aceite explicações orais, gestuais ou desenhadas. Use cartões e um círculo no chão como alternativa. O áudio é opcional; a sequência também é mostrada visualmente.'),el('p','As trilhas são uma proposta pedagógica adaptável. Giros e ciclos são explorações concretas, sem exigir teoria de grupos, notação modular ou memorização de acordes. A articulação à BNCC deve considerar a atividade e o currículo local.'));content.append(teacher);
}
select.onchange=()=>{remember();year=Number(select.value);step=0;show()};
document.addEventListener('music-note',e=>{if(year===5)return;const m=tracks[year].missions[step];api.listen([e.detail]);attempt.push(e.detail);if(m[3]==='next')feedback(e.detail===m[4]?'Você encontrou! Explique seu caminho.':'Experimente novamente: acompanhe a sequência ou conte os passos.');if(m[3]==='repeat'&&attempt.length===m[2].length){feedback(attempt.every((v,i)=>v===m[2][i])?'Sequência reproduzida! Agora crie outra.':'Ouça o modelo e tente novamente.');attempt=[]}});
document.addEventListener('music-heard',e=>{document.querySelectorAll('.heard').forEach(n=>n.classList.remove('heard'));const n=document.querySelector(`#circle [data-pc="${e.detail}"]`);n?.classList.add('heard');clearTimeout(heardTimer);heardTimer=setTimeout(()=>n?.classList.remove('heard'),450)});
show();
})();
