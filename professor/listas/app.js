(() => {
  'use strict';
  const bank = window.EXERCISE_BANK;
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const areaNames = {algebra:'Álgebra',geometria:'Geometria'};
  let selected = bank[0], listNumber = 1, answersVisible = false;
  const svg = (body, label, width=400, height=220) => `<svg class="visual" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(label)}"><title>${escape(label)}</title>${body}</svg>`;
  const text = (x,y,value,extra='') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="15" ${extra}>${escape(value)}</text>`;
  const line = (x1,y1,x2,y2,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="line" ${extra}/>`;
  const polygon = points => `<polygon class="figure" points="${points.map(p=>p.join(',')).join(' ')}"/>`;
  function polygonPoints(n,cx,cy,r,angle=-Math.PI/2) {
    return Array.from({length:n},(_,i)=>[cx+r*Math.cos(angle+2*Math.PI*i/n),cy+r*Math.sin(angle+2*Math.PI*i/n)]);
  }
  function shape(name,x=0,y=0,size=65) {
    const s=size, half=s/2;
    let body='';
    switch(name) {
      case 'círculo': body=`<circle class="figure" cx="${half}" cy="${half}" r="${half}"/>`;break;
      case 'quadrado': body=`<rect class="figure" width="${s}" height="${s}"/>`;break;
      case 'retângulo': body=`<rect class="figure" y="${s*.18}" width="${s}" height="${s*.64}"/>`;break;
      case 'triângulo retângulo': body=polygon([[0,0],[0,s],[s,s]])+line(0,s-10,10,s-10)+line(10,s-10,10,s);break;
      case 'triângulo':body=polygon([[half,0],[s,s],[0,s]]);break;
      case 'paralelogramo':body=polygon([[s*.25,8],[s,8],[s*.75,s-8],[0,s-8]]);break;
      case 'trapézio':body=polygon([[s*.27,8],[s*.73,8],[s,s-8],[0,s-8]]);break;
      case 'quadrilátero':body=polygon([[0,4],[s*.8,0],[s,s],[s*.1,s*.8]]);break;
      default: {
        const sides={pentágono:5,hexágono:6,octógono:8}[name] || 5;
        body=polygon(polygonPoints(sides,half,half,half));
      }
    }
    return `<g transform="translate(${x} ${y})">${body}</g>`;
  }
  function diagram(v) {
    if (!v) return '';
    if(v.type==='sequence') return `<div class="sequence" role="img" aria-label="${escape(v.items.join(', '))}">${v.items.map(item=>`<span>${['círculo','quadrado','triângulo','retângulo','pentágono'].includes(item)?`<svg class="sequence-shape" viewBox="0 0 38 38" role="img" aria-label="${escape(item)}"><title>${escape(item)}</title>${shape(item,4,4,30)}</svg>`:escape(item)}</span>`).join('')}</div>`;
    if(v.type==='shapes') return svg(v.items.map((s,i)=>shape(s,20+i*96,18,62)+text(51+i*96,107,String.fromCharCode(65+i))).join(''),'Figuras identificadas por letras, na ordem da esquerda para a direita.',v.items.length*96+10,120);
    if(v.type==='rotated') {
      const sz=50+v.size*2;
      return svg(shape(v.shape,55,45,sz)+`<g transform="translate(285 82) rotate(45)">${shape(v.shape,-sz/2,-sz/2,sz)}</g>`+text(90,165,'A')+text(285,165,'B'),'Duas figuras de mesmas medidas; a segunda está girada.',400,185);
    }
    if(v.type==='grid') {
      const size=v.size,step=23,x0=35,y0=25+size*step;
      let body='';
      for(let i=0;i<=size;i++) {
        body+=line(x0+i*step,25,x0+i*step,y0,'style="stroke:#c0cbd0;stroke-width:1"');
        body+=line(x0,25+i*step,x0+size*step,25+i*step,'style="stroke:#c0cbd0;stroke-width:1"');
        body+=text(x0+i*step,y0+21,i,'style="font-size:12px"')+text(x0-18,y0-i*step+4,i,'style="font-size:12px"');
      }
      body+=line(x0,y0,x0+size*step+8,y0)+line(x0,y0,x0,15);
      for(const [label,x,y] of v.points)body+=`<circle cx="${x0+x*step}" cy="${y0-y*step}" r="4" fill="#17324d"/>`+text(x0+x*step+10,y0-y*step-8,label);
      return svg(body,'Malha com eixos horizontal e vertical numerados de 0 a '+size+'.',size*step+75,size*step+60);
    }
    if(v.type==='room') {
      const [right,left,front,back]=v.labels;
      const body=`<rect x="8" y="8" width="384" height="198" rx="10" fill="#fff" stroke="#a8b9c1"/>`+text(200,105,'VOCÊ')+line(200,82,200,54)+polygon([[195,60],[200,50],[205,60]])+text(325,108,right)+text(72,108,left)+text(200,31,front)+text(200,186,back);
      return svg(body,`Pessoa central olhando para o topo da folha; ${front} no alto, ${back} embaixo, ${left} à esquerda da folha e ${right} à direita.`);
    }
    if(v.type==='solid') {
      let body='';
      switch(v.name) {
        case 'esfera':body='<circle class="figure" cx="200" cy="105" r="70"/><ellipse class="line" cx="200" cy="105" rx="70" ry="22" stroke-dasharray="5 4"/>';break;
        case 'cilindro':body='<path class="figure" d="M135 50 L135 160 C135 192 265 192 265 160 L265 50 Z"/><ellipse class="figure" cx="200" cy="50" rx="65" ry="23"/>';break;
        case 'cone':body='<path class="figure" d="M200 25 L125 165 Q200 205 275 165 Z"/><ellipse class="line" cx="200" cy="165" rx="75" ry="23"/>';break;
        default:{const width=v.name==='cubo'?100:150;const x=200-width/2-20;body=polygon([[x,70],[x+width,70],[x+width,170],[x,170]])+polygon([[x,70],[x+40,30],[x+width+40,30],[x+width,70]])+polygon([[x+width,70],[x+width+40,30],[x+width+40,130],[x+width,170]]);}
      }
      return svg(body,'Representação em perspectiva de um sólido geométrico.');
    }
    if(v.type==='net') {
      let body='';
      if(v.name==='cubo') {
        for(const [x,y] of [[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]])body+=`<rect class="figure" x="${80+x*42}" y="${22+y*42}" width="42" height="42"/>`;
      } else if(v.name==='cilindro') {
        body='<rect class="figure" x="135" y="75" width="130" height="65"/><circle class="figure" cx="200" cy="54" r="20.69"/><circle class="figure" cx="200" cy="161" r="20.69"/>';
      } else {
        const n=v.sides,side=30,r=side/(2*Math.sin(Math.PI/n)),cy=95-r*Math.cos(Math.PI/n),cx=45;
        for(let i=0;i<n;i++)body+=`<rect class="figure" x="${30+i*side}" y="95" width="${side}" height="55"/>`;
        const top=polygonPoints(n,cx,cy,r,Math.PI/2-Math.PI/n);
        body+=polygon(top)+polygon(top.map(([x,y])=>[x,245-y]));
      }
      return svg(body,'Planificação: figuras planas unidas por arestas para montar um sólido.',400,245);
    }
    if(v.type==='streets') {
      const y=62+v.variant*8;
      return svg(line(20,y,380,y)+line(20,y+65,380,y+65)+line(205,16,205,203)+text(35,y-10,'A')+text(35,y+55,'B')+text(223,30,'C')+`<path d="M205 ${y+12}h12v-12" class="line"/>`,'Ruas A e B horizontais e paralelas; rua C vertical cruzando as duas.');
    }
    if(v.type==='angles') {
      let body='';
      v.values.forEach((angle,i)=>{
        const x=90+i*205,y=150,r=75,rad=angle*Math.PI/180;
        body+=line(x,y,x+r,y)+line(x,y,x+r*Math.cos(rad),y-r*Math.sin(rad));
        body+=`<path class="line" d="M${x+24} ${y} A24 24 0 0 0 ${x+24*Math.cos(rad)} ${y-24*Math.sin(rad)}"/>`+text(x+15,184,i?'B':'A');
      });
      return svg(body,'Dois ângulos identificados como A e B.');
    }
    if(v.type==='mirror') {
      let body='';const step=23,cx=200,y=94;
      for(let i=-6;i<=6;i++)body+=line(cx+i*step,25,cx+i*step,185,'style="stroke:#c0cbd0;stroke-width:1"');
      for(let j=0;j<8;j++)body+=line(62,25+j*step,338,25+j*step,'style="stroke:#c0cbd0;stroke-width:1"');
      body+=line(cx,13,cx,205,'stroke-dasharray="6 4"')+text(cx,16,'eixo')+`<circle cx="${cx-v.distance*step}" cy="${y}" r="4" fill="#17324d"/>`+text(cx-v.distance*step,y-10,'A');
      return svg(body,`Eixo vertical e ponto A, ${v.distance} casas à esquerda do eixo.`);
    }
    return '';
  }
  function responseSpace(type) {
    if(type==='drawing')return '<div class="drawing-space" aria-label="Espaço para desenho"></div>';
    if(type==='grid'||type==='largegrid')return `<div class="answer-grid ${type==='largegrid'?'large':''}" aria-label="Malha para desenhar"></div>`;
    return '<div class="response-lines" aria-label="Espaço para resposta"></div>';
  }
  function sheetHTML(skill,number) {
    const list=skill.lists[number-1];
    return `<section class="worksheet" data-list="${list.id}"><div class="sheet-label"><span>${areaNames[skill.area]} · ${skill.year}º ano</span><span>${skill.code} · Lista ${number} de 5</span></div><h2>Lista ${number} · ${skill.code}</h2><p class="skill-description">${escape(skill.description)}</p><div class="student-fields"><span>Nome: ____________________________</span><span>Turma: ______</span><span>Data: ____/____/____</span></div><p class="sheet-instruction">Leia com atenção, registre como pensou e use os espaços para responder ou desenhar. Você pode pedir a leitura do enunciado ao professor.</p>${list.questions.map((q,i)=>`<section class="question" data-question="${q.id}"><h3><span class="question-number">${i+1}.</span> ${escape(q.prompt)}</h3>${diagram(q.visual)}${responseSpace(q.space)}</section>`).join('')}<p class="sheet-footer">Leo Sardinha.Math · ${list.id} · Folha do aluno</p></section>`;
  }
  function keyHTML(skill,number) {
    return `<section class="answer-key" data-key="${skill.code}-L${number}"><p class="teacher">MATERIAL DO PROFESSOR</p><h2>Gabarito · ${skill.code} · Lista ${number}</h2><p>${areaNames[skill.area]} · ${skill.year}º ano</p><ol>${skill.lists[number-1].questions.map(q=>`<li>${escape(q.answer)}</li>`).join('')}</ol><p>Respostas abertas: aceite estratégias e exemplos diferentes que atendam aos critérios indicados.</p></section>`;
  }
  function updateURL(replace=false) {
    const url=new URL(location.href);url.search='';url.searchParams.set('habilidade',selected.code);url.searchParams.set('lista',listNumber);
    history[replace?'replaceState':'pushState'](null,'',url);
  }
  function populateSkills() {
    const options=bank.filter(s=>s.area===$('area').value&&s.year===Number($('year').value));
    $('skill').innerHTML=options.map(s=>`<option value="${s.code}">${s.code}</option>`).join('');
    return options;
  }
  function render() {
    $('skill-summary').textContent=selected.description;
    $('guide-link').href=`../../${selected.area}/?habilidade=${selected.code}`;
    $('guide-link').textContent=`Ver atividades de ${areaNames[selected.area]} →`;
    $('list-buttons').innerHTML=Array.from({length:5},(_,i)=>`<button type="button" data-list-number="${i+1}" aria-pressed="${i+1===listNumber}">Lista ${i+1}</button>`).join('');
    $('worksheet').innerHTML=sheetHTML(selected,listNumber);
    $('answer-key').innerHTML=keyHTML(selected,listNumber);
    $('answer-key').hidden=!answersVisible;
    $('answer-toggle').setAttribute('aria-expanded',String(answersVisible));
    $('answer-toggle').textContent=answersVisible?'Ocultar gabarito':'Mostrar gabarito';
    $('selection-status').textContent=`${areaNames[selected.area]}, ${selected.year}º ano, ${selected.code}, lista ${listNumber}. Cinco questões.`;
    document.title=`${selected.code} · Lista ${listNumber} · Leo Sardinha.Math`;
    // Native Ctrl+P also prints only the current student sheet.
    $('print-root').innerHTML=sheetHTML(selected,listNumber);
  }
  function loadURL() {
    const params=new URLSearchParams(location.search);
    selected=bank.find(s=>s.code===params.get('habilidade'))||bank[0];
    listNumber=Math.max(1,Math.min(5,Number.parseInt(params.get('lista'),10)||1));
    $('area').value=selected.area;$('year').value=selected.year;populateSkills();$('skill').value=selected.code;
    answersVisible=false;render();
  }
  $('area').addEventListener('change',()=>{selected=populateSkills()[0];listNumber=1;answersVisible=false;render();updateURL();});
  $('year').addEventListener('change',()=>{selected=populateSkills()[0];listNumber=1;answersVisible=false;render();updateURL();});
  $('skill').addEventListener('change',()=>{selected=bank.find(s=>s.code===$('skill').value);listNumber=1;answersVisible=false;render();updateURL();});
  $('list-buttons').addEventListener('click',event=>{
    const button=event.target.closest('[data-list-number]');if(!button)return;
    listNumber=Number(button.dataset.listNumber);answersVisible=false;render();updateURL();
    $('list-buttons').querySelector(`[data-list-number="${listNumber}"]`).focus();
  });
  $('answer-toggle').addEventListener('click',()=>{answersVisible=!answersVisible;render();});
  function printMaterial(kind) {
    const root=$('print-root');
    root.innerHTML=kind==='all'?selected.lists.map(l=>sheetHTML(selected,l.number)).join(''):kind==='key'?keyHTML(selected,listNumber):sheetHTML(selected,listNumber);
    window.print();
  }
  $('print-one').addEventListener('click',()=>printMaterial('one'));
  $('print-all').addEventListener('click',()=>printMaterial('all'));
  $('print-key').addEventListener('click',()=>printMaterial('key'));
  window.addEventListener('afterprint',()=>{$('print-root').innerHTML=sheetHTML(selected,listNumber);});
  window.addEventListener('popstate',loadURL);
  loadURL();updateURL(true);
})();
