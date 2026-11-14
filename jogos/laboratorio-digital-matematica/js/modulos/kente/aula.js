const palette = ['#dfa52d', '#9f392d', '#28614d', '#253952'];
const names = ['Dourado', 'Terracota', 'Verde', 'Azul'];
const sources = {
  unesco: 'https://ich.unesco.org/en/RL/craftsmanship-of-traditional-woven-textile-kente-02130',
  asante: 'https://africa.si.edu/collection/object/nmafa_EJ10571',
  flag: 'https://africa.si.edu/collection/object/nmafa_74-31-29'
};
const make = (tag, text) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  return element;
};

export function aula(panel) {
  panel.innerHTML = `
    <div class="k-lesson">
      <header><h2>Explorando a matemática do tecido Kente</h2>
      <p>Roteiro em quatro momentos, adaptado do plano de Leonardo Sardinha, João Luca Alencar Rapozo, Fabiany Mendonça e Ana Beatriz Alves.</p></header>
      <section class="k-card">
        <h3>1. Localize Gana</h3>
        <p>Gana fica na África Ocidental, entre Costa do Marfim e Togo, ao sul de Burkina Faso e de frente para o Golfo da Guiné.</p>
        <p><a href="https://www.openstreetmap.org/#map=5/7.9/-1.0" target="_blank" rel="noopener noreferrer">Abrir o mapa da África Ocidental</a></p>
        <p>Localize Gana no mapa-múndi e compare sua posição com a do Brasil. Na bandeira de Gana, observe as faixas vermelha, amarela e verde e a estrela preta. Essas cores também aparecem em outras bandeiras africanas.</p>
        <div class="k-flag" role="img" aria-label="Bandeira de Gana: três faixas horizontais vermelha, amarela e verde, com uma estrela preta no centro"><span aria-hidden="true">★</span></div>
      </section>
      <section class="k-card">
        <h3>2. Observe o tecido e escute as histórias</h3>
        <p>Entre as comunidades que praticam a tecelagem kente estão os Asante, em Gana, e os Ewe, em Gana e no Togo. Os tecelões produzem faixas estreitas que podem ser unidas para formar o tecido. A UNESCO inscreveu o saber artesanal em 2024.</p>
        <p>O plano apresenta Ananse, a aranha das narrativas orais, como inspiração para conversar sobre o ato de tecer. Em seguida, compare duas peças do acervo e observe como mudam as faixas, as cores e os motivos. Relacione possíveis significados à história da peça observada e à comunidade que a produziu.</p>
        <ul><li><a href="${sources.asante}" target="_blank" rel="noopener noreferrer">Peça Asante com losangos · Smithsonian</a></li>
        <li><a href="${sources.flag}" target="_blank" rel="noopener noreferrer">Peça Asante com faixas e relação com a bandeira · Smithsonian</a></li>
        <li><a href="${sources.unesco}" target="_blank" rel="noopener noreferrer">Tecelagem tradicional · UNESCO</a></li></ul>
      </section>
      <section class="k-card">
        <h3>3. Investigue e crie em dupla</h3>
        <p><a href="https://scratch.mit.edu/projects/1236078015/fullscreen/" target="_blank" rel="noopener noreferrer">Abrir o projeto Scratch indicado pelo QR do slide</a></p>
        <p>Em <strong>Geometria 2D</strong>, identifique figuras e monte um padrão com peças. No <strong>Ateliê Kente</strong>, desenhe uma composição por coordenadas. Use o <strong>Laboratório 3D</strong> para prever reflexões e comparar montagens de pinos no plano e em camadas.</p>
      </section>
      <section class="k-card">
        <h3>4. Socialize no mural</h3>
        <p>Salve o desenho no <strong>Mural</strong>. Na apresentação, descreva as figuras e diga qual parte se repete, onde aparece uma simetria ou o que inspirou as escolhas da dupla. Imprima o desenho para montar um mural físico.</p>
      </section>
    </div>`;
}

const questions = [
  { name: 'Quadrado', points: [[1,1],[4,1],[4,4],[1,4]], explanation: 'Quatro lados iguais e quatro ângulos retos.' },
  { name: 'Retângulo', points: [[1,1],[6,1],[6,4],[1,4]], explanation: 'Quatro ângulos retos e lados vizinhos de comprimentos diferentes neste exemplo.' },
  { name: 'Triângulo', points: [[1,4],[6,4],[3,1]], explanation: 'Três vértices e três lados, mesmo quando a figura muda de orientação.' },
  { name: 'Losango', points: [[1,2.5],[3.5,.75],[6,2.5],[3.5,4.25]], explanation: 'Quatro lados de mesmo comprimento. Os ângulos deste exemplo não são retos.' }
];

function drawFigure(canvas, question) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,350,250);
  for (let row=0;row<5;row++) for (let col=0;col<7;col++) {
    ctx.fillStyle=palette[(2*row+col)%4];
    ctx.fillRect(col*50,row*50,50,50);
  }
  ctx.beginPath();
  question.points.forEach(([x,y],i)=>i===0 ? ctx.moveTo(x*50,y*50) : ctx.lineTo(x*50,y*50));
  ctx.closePath();
  ctx.fillStyle='#fff3cb';
  ctx.fill();
  ctx.strokeStyle='#172f29';
  ctx.lineWidth=5;
  ctx.stroke();
}

const pieces = [
  ['Quadrado dourado', palette[0], 'square'], ['Quadrado azul', palette[3], 'square'],
  ['Triângulo terracota', palette[1], 'triangle'], ['Triângulo verde', palette[2], 'triangle']
];
const target = [2,0,0,3,1,2,3,1,1,3,2,1,3,0,0,2];
function pieceAt(element, index, turn=0) {
  element.replaceChildren();
  if (index===null) return;
  const piece=make('span');
  const [,color,shape]=pieces[index];
  piece.className='k-piece k-'+shape;
  piece.style.setProperty('--piece',color);
  piece.style.rotate=turn*90+'deg';
  element.append(piece);
}

export function geometria(panel) {
  panel.innerHTML=`
    <div class="k-lesson">
      <section class="k-card">
        <h2>Encontre a figura</h2><p>Observe a forma clara destacada no padrão.</p>
        <canvas class="k-figure" width="350" height="250" role="img"></canvas>
        <div class="k-choices"></div>
        <p class="k-geometry-status" role="status"></p>
        <button class="k-next" type="button" hidden>Próxima figura</button>
      </section>
      <section class="k-card">
        <h2>Quebra-cabeça de peças</h2><p>Escolha uma peça, gire se for necessário e toque numa casa para copiar o modelo. Depois, invente outra composição com as mesmas peças.</p>
        <div class="k-puzzle-pair">
          <div><h3>Modelo</h3><div class="k-puzzle k-target" role="img" aria-label="Modelo do quebra-cabeça com quadrados e triângulos"></div></div>
          <div><h3>Sua montagem</h3><div class="k-puzzle k-build" role="group" aria-label="Casas da montagem"></div></div>
        </div>
        <div class="k-choices k-pieces"></div>
        <div class="barra-acoes"><button type="button" class="k-rotate">Girar peça</button><button type="button" class="k-check">Conferir modelo</button><button type="button" class="k-reset">Limpar montagem</button></div>
        <p class="k-puzzle-status" role="status"></p>
      </section>
    </div>`;
  const $=selector=>panel.querySelector(selector);
  let stage=0;
  const next=$('.k-next');
  const feedback=$('.k-geometry-status');
  const choices=questions.map(({name})=>make('button',name));
  $('.k-choices').append(...choices);
  function question() {
    const figure=questions[stage];
    const canvas=$('canvas');
    drawFigure(canvas,figure);
    const sides=figure.points.map(([x,y],i)=>{
      const [nextX,nextY]=figure.points[(i+1)%figure.points.length];
      return Math.hypot(x-nextX,y-nextY);
    });
    const equal=sides.every(side=>side===sides[0]);
    canvas.setAttribute('aria-label',figure.points.length+' lados.'+(figure.points.length===4 ?
      (equal?' Os quatro lados são iguais.':' Os lados vizinhos têm medidas diferentes.')+
      (stage===3?' Os ângulos não são retos.':' Os ângulos são retos.'):''));
    choices.forEach(button=>button.disabled=false);
    feedback.textContent='Figura '+(stage+1)+' de '+questions.length+'.';
    next.hidden=true;
  }
  for (const button of choices) button.addEventListener('click',()=>{
    const figure=questions[stage];
    if (button.textContent!==figure.name) {
      feedback.textContent='Observe a quantidade de lados e os ângulos e tente de novo.';
      return;
    }
    feedback.textContent=figure.name+'. '+figure.explanation;
    choices.forEach(choice=>choice.disabled=true);
    next.textContent=stage===questions.length-1?'Recomeçar':'Próxima figura';
    next.hidden=false;
    next.focus();
  });
  next.addEventListener('click',()=>{
    stage=(stage+1)%questions.length;
    question();
    choices[0].focus();
  });
  question();

  const turns=[0,0,0,1,0,1,3,0,0,2,0,0,3,0,0,2];
  const board=Array(16).fill(null);
  let selected=0, rotation=0;
  const placement=$('.k-puzzle-status');
  const coordinate=i=>'ABCD'[Math.floor(i/4)]+(i%4+1);
  for (const [i,index] of target.entries()) {
    const sample=make('span');
    pieceAt(sample,index,turns[i]);
    $('.k-target').append(sample);
    const cell=make('button');
    cell.setAttribute('aria-label','Casa '+coordinate(i)+', vazia');
    cell.addEventListener('click',()=>{
      board[i]=[selected,rotation];
      pieceAt(cell,selected,rotation);
      cell.setAttribute('aria-label','Casa '+coordinate(i)+', '+pieces[selected][0]);
      placement.textContent='Peça colocada em '+coordinate(i)+'.';
    });
    $('.k-build').append(cell);
  }
  const options=pieces.map(([name],i)=>{
    const button=make('button',name);
    button.addEventListener('click',()=>{
      selected=i;
      rotation=0;
      selectPiece();
    });
    return button;
  });
  $('.k-pieces').append(...options);
  function selectPiece() {
    options.forEach((button,i)=>button.setAttribute('aria-pressed',String(selected===i)));
    $('.k-rotate').disabled=pieces[selected][2]==='square';
    $('.k-rotate').textContent='Girar peça · '+rotation*90+'°';
    placement.textContent=pieces[selected][0]+' a '+rotation*90+'°.';
  }
  $('.k-rotate').addEventListener('click',()=>{rotation=(rotation+1)%4;selectPiece();});
  $('.k-check').addEventListener('click',()=>{
    const matches=board.filter((cell,i)=>cell && cell[0]===target[i] &&
      (pieces[cell[0]][2]==='square' || cell[1]===turns[i])).length;
    placement.textContent=matches===16?'Montagem completa!':'Casas iguais ao modelo: '+matches+' de 16.';
  });
  $('.k-reset').addEventListener('click',()=>{
    board.fill(null);
    [...$('.k-build').children].forEach((cell,i)=>{
      cell.replaceChildren();
      cell.setAttribute('aria-label','Casa '+coordinate(i)+', vazia');
    });
    placement.textContent='Montagem limpa.';
  });
  selectPiece();
}

const mirrorTiles = [
  [0,1,1,0, 1,2,3,1, 1,3,0,2, 0,1,2,3],
  [2,0,0,1, 0,0,1,3, 0,1,3,2, 1,3,2,2],
  [3,1,2,0, 2,3,1,2, 0,2,3,1, 1,0,2,3]
];

export function laboratorio3d(panel) {
  panel.innerHTML=`
    <div class="k-lesson">
      <section class="k-card">
        <h2>Caixa espelhada</h2>
        <p>Preveja o que aparece do outro lado de cada espelho. A vista de cima facilita a conferência das inversões.</p>
        <div class="k-choices">
          <label>Motivo <select class="k-motif"><option value="0">Faixas</option><option value="1">Escada</option><option value="2">Diagonal</option></select></label>
          <label>Reflexão <select class="k-axis"><option value="both">Dois espelhos</option><option value="vertical">Esquerda–direita</option><option value="horizontal">Cima–baixo</option></select></label>
        </div>
        <button type="button" class="k-view-mirror" aria-pressed="false">Vista de cima</button>
        <div class="k-scene k-mirror-scene">
          <div class="k-mirror-board" role="img">
            <div class="k-reflection"></div><div class="k-glass k-glass-x"></div><div class="k-glass k-glass-y"></div>
          </div>
        </div>
        <p class="k-mirror-note"></p>
      </section>
      <section class="k-card">
        <h2>Montagem com e sobre pinos</h2>
        <p>No plano, cada pino recebe uma peça. Na montagem sobre pinos, cada pino comporta até três peças empilhadas. Compare as montagens e descubra quais têm a mesma vista de cima.</p>
        <div class="k-choices">
          <label>Montagem <select class="k-pin-mode"><option value="flat">Com pinos · plano</option><option value="stack">Sobre pinos · camadas</option></select></label>
          <label>Cor <select class="k-pin-color">${names.map((name,i)=>'<option value="'+i+'">'+name+'</option>').join('')}</select></label>
          <label>Ação <select class="k-pin-action"><option value="add">Colocar peça</option><option value="remove">Retirar peça</option></select></label>
        </div>
        <div class="barra-acoes">
          <button type="button" class="k-view-pins" aria-pressed="false">Vista de cima</button>
          <button type="button" class="k-clear-pins">Limpar pinos</button>
        </div>
        <div class="k-scene k-pin-scene"><div class="k-pin-board" role="group" aria-label="Tabuleiro de pinos, A1 a E5"></div></div>
        <p class="k-pin-status" role="status"></p>
      </section>
    </div>`;
  const $=selector=>panel.querySelector(selector);
  function view(button,scene) {
    button.addEventListener('click',()=>{
      const top=scene.classList.toggle('k-top-view');
      button.setAttribute('aria-pressed',String(top));
      button.textContent=top?'Voltar à vista 3D':'Vista de cima';
    });
  }
  function reflect() {
    const axis=$('.k-axis').value;
    const motif=mirrorTiles[Number($('.k-motif').value)];
    const board=$('.k-mirror-board');
    board.dataset.axis=axis;
    const horizontal=axis!=='horizontal', vertical=axis!=='vertical';
    const tiles=[];
    for (let row=0;row<8;row++) for (let col=0;col<8;col++) {
      const tile=make('span');
      const active=(row<4||vertical)&&(col<4||horizontal);
      if (active) {
        const r=row<4?row:7-row, c=col<4?col:7-col;
        tile.style.background=palette[motif[r*4+c]];
        if (row>=4||col>=4) tile.className='k-reflected';
      }
      tiles.push(tile);
    }
    $('.k-reflection').replaceChildren(...tiles);
    const description={both:'O motivo aparece em quatro quadrantes. As colunas e as linhas se invertem nos respectivos espelhos.',vertical:'As colunas se invertem de um lado ao outro. As linhas conservam a ordem.',horizontal:'As linhas se invertem de cima para baixo. As colunas conservam a ordem.'}[axis];
    board.setAttribute('aria-label',description);
    $('.k-mirror-note').textContent=description;
  }
  $('.k-motif').addEventListener('change',reflect);
  $('.k-axis').addEventListener('change',reflect);
  view($('.k-view-mirror'),$('.k-mirror-scene'));
  reflect();

  const layouts={flat:Array.from({length:25},()=>[]),stack:Array.from({length:25},()=>[])};
  const mode=()=>$('.k-pin-mode').value;
  const pinStatus=$('.k-pin-status');
  const pinBoard=$('.k-pin-board');
  const coordinate=i=>'ABCDE'[Math.floor(i/5)]+(i%5+1);
  const buttons=layouts.flat.map((_,i)=>{
    const pin=make('button');
    pin.type='button';
    pin.className='k-pin';
    pin.addEventListener('click',()=>{
      const layers=layouts[mode()][i];
      if ($('.k-pin-action').value==='remove') {
        if (layers.length===0) { pinStatus.textContent=coordinate(i)+' já está vazio.'; return; }
        layers.pop();
      } else {
        const color=Number($('.k-pin-color').value);
        if (mode()==='flat') layers[0]=color;
        else if (layers.length<3) layers.push(color);
        else { pinStatus.textContent=coordinate(i)+' chegou a três peças.'; return; }
      }
      renderPins(coordinate(i)+'. ');
    });
    return pin;
  });
  pinBoard.append(...buttons);
  function renderPins(prefix='') {
    const layout=layouts[mode()];
    layout.forEach((layers,i)=>{
      const pin=buttons[i];
      pin.replaceChildren();
      pin.setAttribute('aria-label','Pino '+coordinate(i)+', '+(layers.length ? layers.map(color=>names[color]).join(', ')+' da base para o topo' : 'vazio'));
      pin.style.background=layers.length?palette[layers.at(-1)]:'#e5c997';
      layers.forEach((color,level)=>{
        const block=make('span');
        block.style.setProperty('--piece',palette[color]);
        block.style.setProperty('--level',level);
        pin.append(block);
      });
      const label=make('small',coordinate(i));
      pin.append(label);
    });
    const total=layout.reduce((sum,layers)=>sum+layers.length,0);
    const occupied=layout.filter(layers=>layers.length).length;
    pinStatus.textContent=prefix+total+' peça(s) em '+occupied+' pino(s).';
  }
  $('.k-pin-mode').addEventListener('change',()=>renderPins());
  $('.k-clear-pins').addEventListener('click',()=>{
    layouts[mode()].forEach(layers=>layers.length=0);
    renderPins('Montagem limpa. ');
  });
  view($('.k-view-pins'),$('.k-pin-scene'));
  renderPins();
}

const muralKey='atelie-kente-mural-v1';
const validColor=color=>color===null || (typeof color==='string' && /^#[0-9a-f]{6}$/.test(color));
const validGrid=grid=>Array.isArray(grid) && grid.length===100 && grid.every(validColor);
function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

export function mural(panel) {
  panel.innerHTML=`
    <div class="k-lesson"><section class="k-card">
      <h2>Mural das duplas</h2>
      <p>O mural guarda neste navegador uma cópia do desenho atual do Ateliê Kente. Para reunir produções de aparelhos diferentes, use as impressões no mural da turma.</p>
      <form class="k-mural-form">
        <label>Título <input name="title" required maxlength="70" placeholder="Ex.: Losangos em faixas"></label>
        <label>O que a dupla descobriu? <textarea name="note" maxlength="240" rows="3" placeholder="Descreva as formas, a repetição ou a simetria."></textarea></label>
        <button type="submit">Adicionar desenho do Ateliê</button>
      </form>
      <p class="k-mural-status" role="status"></p>
      <div class="k-mural-items"></div>
    </section></div>`;
  const form=panel.querySelector('form');
  const output=panel.querySelector('.k-mural-status');
  const list=panel.querySelector('.k-mural-items');
  const saved=read(muralKey);
  let items=Array.isArray(saved) ? saved.filter(item=>item && typeof item.title==='string' &&
    typeof item.note==='string' && validGrid(item.colors)).slice(0,24) : [];
  function update(next) {
    try { localStorage.setItem(muralKey,JSON.stringify(next)); }
    catch { output.textContent='O navegador não conseguiu salvar esta mudança.'; return false; }
    items=next;
    render();
    return true;
  }
  function render() {
    const cards=items.map((item,i)=>{
      const article=make('article');
      article.className='k-mural-item';
      const grid=make('div');
      grid.className='k-mural-art';
      grid.setAttribute('role','img');
      grid.setAttribute('aria-label','Desenho em grade: '+item.title);
      for (const color of item.colors) {
        const square=make('span');
        square.style.background=color||'#fff9ed';
        grid.append(square);
      }
      const remove=make('button','Retirar do mural');
      remove.type='button';
      remove.addEventListener('click',()=>{
        if (update(items.filter((_,position)=>position!==i))) output.textContent='Desenho retirado.';
      });
      article.append(make('h3',item.title),grid,make('p',item.note),remove);
      return article;
    });
    list.replaceChildren(...(cards.length?cards:[make('p','O mural está vazio.')]));
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const drawing=read('atelie-kente-v1')?.colors;
    if (!validGrid(drawing)||drawing.every(color=>color===null)) {
      output.textContent='Pinte ao menos uma casa no Ateliê Kente antes de adicionar ao mural.';
      return;
    }
    const data=new FormData(form);
    const title=data.get('title').trim();
    if (!title) { output.textContent='Escreva um título para o desenho.'; return; }
    if (items.length>=24) { output.textContent='O mural chegou a 24 desenhos. Retire um para liberar espaço.'; return; }
    if (update([...items,{title,note:data.get('note').trim(),colors:drawing}])) {
      form.reset();
      output.textContent='Desenho adicionado ao mural.';
    }
  });
  render();
}
