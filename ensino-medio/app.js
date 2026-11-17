'use strict';
(()=>{
 const $=id=>document.getElementById(id), cards=[...document.querySelectorAll('.skill')];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const searchable=new Map(cards.map(c=>[c,normalize(c.textContent)]));
 function filter(){const q=normalize($('search').value.trim()),b=$('block').value,s=$('status').value;let count=0;
  for(const c of cards){c.hidden=!(searchable.get(c).includes(q)&&(b==='all'||(b==='priority'?c.dataset.block!=='0':c.dataset.block===b))&&(s==='all'||c.dataset.status===s));if(!c.hidden)count++;}
  $('results').textContent=`${count} de 43 habilidades na seleção.`;$('empty').hidden=count!==0;
 }
 function clear(){ $('search').value='';$('block').value='all';$('status').value='all';filter();}
 ['search','block','status'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',filter));
 $('clear').addEventListener('click',()=>{clear();history.replaceState(null,'',location.pathname);});
 document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{clear();$('block').value=a.dataset.pick;filter();}));
 $('expand').addEventListener('click',()=>cards.filter(c=>!c.hidden).forEach(c=>c.querySelector('details').open=true));
 function openHash(){const code=location.hash.slice(1);if(/^EM13MAT\d{3}$/.test(code)){const c=$(code);if(c){clear();c.querySelector('details').open=true;c.scrollIntoView({block:'start'});}}}
 addEventListener('hashchange',openHash);openHash();
 let beforePrint=[];
 function preparePrint(){beforePrint=[...document.querySelectorAll('.skill details')].map(el=>[el,el.open]);cards.filter(c=>!c.hidden).forEach(c=>{c.querySelector('details').open=true;c.querySelector('.answer').open=$('with-answers').checked;});document.body.classList.toggle('print-answers',$('with-answers').checked);}
 function restorePrint(){beforePrint.forEach(([el,open])=>el.open=open);beforePrint=[];document.body.classList.remove('print-answers');}
 addEventListener('beforeprint',preparePrint);addEventListener('afterprint',restorePrint);
 $('print').addEventListener('click',()=>window.print());
 const fmt=n=>Math.abs(n)>=1e7||(Math.abs(n)>0&&Math.abs(n)<0.001)?n.toExponential(3).replace('.',','):new Intl.NumberFormat('pt-BR',{maximumFractionDigits:4}).format(n);
 function params(){return{family:$('family').value,a:+$('coef-a').value,b:+$('coef-b').value,c:+$('coef-c').value,q:+$('base-q').value,min:+$('x-min').value,max:+$('x-max').value};}
 function svg(tag,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;}
 function render(){const p=params();try{const points=EMFunctions.sample(p),table=EMFunctions.sample(p,9),plot=$('plot');
  const formula=p.family==='linear'?`f(x) = ${fmt(p.a)}x + (${fmt(p.b)})`:p.family==='quadratic'?`f(x) = ${fmt(p.a)}x² + (${fmt(p.b)})x + (${fmt(p.c)})`:p.family==='exponential'?`f(x) = ${fmt(p.a)} · ${fmt(p.q)}ˣ`:`f(x) = log de x na base ${fmt(p.q)}`;
  $('formula').textContent=formula;
  $('values').replaceChildren(...table.map(({x,y})=>{const row=document.createElement('tr');for(const n of [x,y]){const td=document.createElement('td');td.textContent=fmt(n);row.append(td);}return row;}));
  let ymin=Math.min(...points.map(v=>v.y)),ymax=Math.max(...points.map(v=>v.y));const pad=(ymax-ymin)*.08||1;ymin-=pad;ymax+=pad;
  const sx=x=>64+(x-p.min)/(p.max-p.min)*508,sy=y=>300-(y-ymin)/(ymax-ymin)*270;
  plot.replaceChildren(svg('title',{id:'plot-title'},formula),svg('desc',{id:'plot-description'},`Intervalo de ${fmt(p.min)} a ${fmt(p.max)}. Consulte a tabela de valores após o gráfico.`));
  for(let i=0;i<=4;i++){const x=p.min+(p.max-p.min)*i/4,y=ymin+(ymax-ymin)*i/4;plot.append(svg('line',{x1:sx(x),x2:sx(x),y1:30,y2:300,stroke:'#d4e2eb'}),svg('line',{x1:64,x2:572,y1:sy(y),y2:sy(y),stroke:'#d4e2eb'}),svg('text',{x:sx(x),y:324,'text-anchor':'middle','font-size':12,fill:'#294c63'},fmt(x)),svg('text',{x:58,y:sy(y)+4,'text-anchor':'end','font-size':10,fill:'#294c63'},fmt(y)));}
  if(p.min<=0&&p.max>=0)plot.append(svg('line',{x1:sx(0),x2:sx(0),y1:30,y2:300,stroke:'#516f82'}));
  if(ymin<=0&&ymax>=0)plot.append(svg('line',{x1:64,x2:572,y1:sy(0),y2:sy(0),stroke:'#516f82'}));
  plot.append(svg('polyline',{points:points.map(v=>`${sx(v.x)},${sy(v.y)}`).join(' '),fill:'none',stroke:'#0369a1','stroke-width':3}),svg('text',{x:577,y:324,'font-size':13},'x'),svg('text',{x:66,y:20,'font-size':13},'f(x)'));
  $('lab-status').textContent=p.family==='quadratic'&&p.a===0?'Com a = 0, a expressão deixa de ser quadrática.':p.family==='exponential'&&p.a===0?'Com a = 0, o resultado é a função constante zero.':'Gráfico e tabela atualizados. Valores exibidos com arredondamento.';
 }catch(err){$('lab-status').textContent=err.message;$('formula').textContent='';$('values').replaceChildren();$('plot').replaceChildren(svg('title',{},'Não há gráfico válido para os parâmetros informados.'));}}
 $('function-form').addEventListener('submit',e=>{e.preventDefault();render();});
 $('family').addEventListener('change',()=>{const f=$('family').value;for(const [id,show] of [['a',f!=='logarithmic'],['b',['linear','quadratic'].includes(f)],['c',f==='quadratic'],['q',['exponential','logarithmic'].includes(f)]]){const label=$(id+'-label');label.hidden=!show;label.querySelector('input').disabled=!show;}
  if(f==='logarithmic'){$('x-min').value=.25;$('x-max').value=8;}else{$('x-min').value=-4;$('x-max').value=4;}render();});
 render();
})();
