import * as THREE from 'three';
import { ChibiCharacter } from './ChibiCharacter.js';

const perfis={
  mago:{nome:'Mestre Arcano',tipo:'mago',roupa:'#673b9c',secundaria:'#f5c74d',cabelo:'#f5f0e7',capa:'#42246f'},
  detetive:{nome:'Detetive',tipo:'detetive',roupa:'#326386',secundaria:'#e2bd73',cabelo:'#45352f'},
  fracsoma:{nome:'Lia das Frações',tipo:'fracsoma',roupa:'#db648e',secundaria:'#ffd773',cabelo:'#6e4038'},
  adivinhacao:{nome:'Adivinha',tipo:'adivinhacao',roupa:'#805cb0',secundaria:'#d4b4fb',cabelo:'#34305d'},
  abelha:{nome:'Abelha Matemática',tipo:'abelha',roupa:'#ffc339',secundaria:'#34263a',cabelo:'#3b2c2b'},
  poligonos:{nome:'Geômetra',tipo:'poligonos',roupa:'#398f9f',secundaria:'#f8d369',cabelo:'#68452f'},
  divisores:{nome:'Explorador de Divisores',tipo:'divisores',roupa:'#459575',secundaria:'#f5c36f',cabelo:'#4c352d'},
  cpf:{nome:'Agente dos Dígitos',tipo:'cpf',roupa:'#466ca1',secundaria:'#f4c970',cabelo:'#372f38'},
  kente:{nome:'Tecelã Kente',tipo:'kente',roupa:'#c97647',secundaria:'#f5c244',cabelo:'#272c37',pele:'#9c5c3e'},
  estacao:{nome:'Cientista da Estação',tipo:'estacao',roupa:'#8bafc2',secundaria:'#f8ce63',cabelo:'#5a4e53'},
  heroi:{nome:'Herói das Runas',tipo:'heroi',roupa:'#4e84a5',secundaria:'#ebc156',capa:'#ba454d'},
  dragao:{nome:'Dragão',tipo:'dragao',roupa:'#a35675',secundaria:'#f3bd5c',pele:'#b86a84',cabelo:'#743b55'}
};
const falas={
  inicio:['Vamos descobrir juntos!','Uma ideia de cada vez!','A matemática também é aventura!'],
  fase:['Nova missão! Observe as pistas.','Preparado para o próximo desafio?','Olhe com calma e experimente.'],
  acerto:['Acertou! Que boa descoberta!','Isso! Você encontrou o caminho!','Brilhou como uma estrela!'],
  erro:['Quase! Vamos tentar outra estratégia.','Tudo bem errar; observe as pistas.','Experimente uma peça diferente.'],
  vitoria:['Missão cumprida! Você arrasou!','Conseguimos! Que aventura!','Vitória! O raciocínio venceu!'],
  derrota:['Vamos respirar e tentar de novo.','Na próxima a gente consegue!','Cada tentativa ensina um pouco.'],
  parado:['Está pensando? Eu espero você.','Uma pista pode mudar tudo!','Vamos explorar mais um pouco?']
};
const falasTematicas={
  mago:{inicio:['Acenda as runas e descubra seu poder!','Cada runa guarda uma pista matemática.','Um feitiço de cada vez, jovem aprendiz!'],acerto:['As runas brilharam! Boa soma!','O feitiço encaixou direitinho!']},
  detetive:{inicio:['Uma pista está nos dígitos!','Vamos investigar esse resto?','Agente, observe os números!'],erro:['Revise os pesos; a pista está na conta.','Até detetive erra. Olhe o resto!']},
  fracsoma:{inicio:['Vamos juntar as peças!','Uma fração de cada vez!','Qual peça completa a soma?'],acerto:['As peças se encaixaram!','Sua soma ficou certinha!']},
  adivinhacao:{inicio:['Menos palpites, mais estratégia!','Divida as possibilidades ao meio!']},
  abelha:{inicio:['A flor espera por nós!','Qual fração abre o caminho?']},
  poligonos:{inicio:['Cada lado conta uma história!','Que giro forma esta figura?']},
  divisores:{inicio:['Vamos formar pares de fatores!','Quantos divisores você encontra?']},
  cpf:{inicio:['Confira os restos da conta!','Os dígitos verificadores dão pistas.']},
  kente:{inicio:['Descubra o padrão do tecido!','As cores também contam histórias.']},
  estacao:{inicio:['Papel e tela, duas formas de investigar!','Teste uma ideia em cada estação.']},
  heroi:{inicio:['Escolha as runas e me dê poder!','Vamos enfrentar esse dragão juntos!'],vitoria:['Os cinco dragões caíram!','Vitória! A soma certa venceu!']},
  dragao:{inicio:['Raa! Monte o dano exato!','Será que suas runas me alcançam?']}
};
const ultimas=new Map();
function sortear(id,tipo){
  const lista=falasTematicas[id]?.[tipo]||falas[tipo]||falas.inicio,chave=`${id}:${tipo}`;
  const alternativas=lista.filter(f=>f!==ultimas.get(chave));
  const texto=alternativas[Math.floor(Math.random()*alternativas.length)];ultimas.set(chave,texto);return texto;
}
function idDe(elemento){
  if(elemento.classList.contains('mago-chibi')||elemento.getAttribute('src')?.includes('mago-chibi'))return 'mago';
  if(elemento.classList.contains('dragao'))return 'dragao';
  if(elemento.classList.contains('heroi'))return 'heroi';
  if(elemento.classList.contains('detetive-art'))return 'detetive';
  const classe=[...elemento.classList].find(k=>k.startsWith('sprite-')&&perfis[k.slice(7)]);
  if(classe)return classe.slice(7);
  if(elemento.classList.contains('cartao-personagem')){
    const cartao=[...elemento.closest('.cartao-inicio')?.classList||[]].find(k=>k.startsWith('cartao-')&&perfis[k.slice(7)]);
    return cartao?.slice(7)||null;
  }
  return null;
}
function candidatos(){
  return document.querySelectorAll('.personagem-hero,.cartao-personagem,.mascote-modulo,.fig .mago-chibi,.fig .sprite-jogo,.detetive-art');
}

function iniciar(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let renderizador;
  try{
    renderizador=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderizador.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5));
    renderizador.setClearColor(0x000000,0);renderizador.autoClear=false;
  }catch(error){console.info('Arte 2D mantida: WebGL indisponível.',error);return}
  const canvas=renderizador.domElement;canvas.id='chibi3d-canvas';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  const cena=new THREE.Scene();
  cena.add(new THREE.AmbientLight('#ffffff',2.15));
  const luz=new THREE.DirectionalLight('#fff1cc',2.6);luz.position.set(-2,5,6);cena.add(luz);
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,50);
  camera.position.set(0,1.57,6.5);camera.lookAt(0,1.48,0);
  const ativos=new Map();
  let largura=0,altura=0,ultimo=performance.now(),pendente=false,vozLigada=false;
  try{vozLigada=localStorage.getItem('laboratorio-voz-chibi')==='sim'}catch{}
  const sr=document.createElement('span');sr.id='chibi3d-status';sr.className='chibi3d-sr';sr.setAttribute('role','status');document.body.append(sr);
  const voz=document.createElement('button');voz.type='button';voz.id='chibi3d-voz';voz.textContent=vozLigada?'🔊 Voz ligada':'🔇 Voz desligada';voz.setAttribute('aria-pressed',String(vozLigada));
  if('speechSynthesis'in window){
    document.body.append(voz);voz.onclick=()=>{
      vozLigada=!vozLigada;voz.textContent=vozLigada?'🔊 Voz ligada':'🔇 Voz desligada';
      voz.setAttribute('aria-pressed',String(vozLigada));
      try{localStorage.setItem('laboratorio-voz-chibi',vozLigada?'sim':'nao')}catch{}
      if(!vozLigada)speechSynthesis.cancel();
    };
  }
  function dizer(item,tipo='inicio'){
    const texto=sortear(item.id,tipo);
    if(!item.balao){item.balao=document.createElement('span');item.balao.className='chibi3d-balao';item.balao.setAttribute('aria-hidden','true');document.body.append(item.balao)}
    item.personagem.falar(texto,item.balao);sr.textContent=`${perfis[item.id].nome}: ${texto}`;
    if(vozLigada&&'speechSynthesis'in window){
      speechSynthesis.cancel();const fala=new SpeechSynthesisUtterance(texto);
      fala.lang='pt-BR';fala.rate=1.07;fala.pitch=1.27;speechSynthesis.speak(fala);
    }
  }
  function limpar(item){item.balao?.remove();item.personagem.root.removeFromParent();item.personagem.descartar();item.elemento.classList.remove('chibi3d-pronto')}
  function sincronizar(){
    pendente=false;
    for(const [el,item] of ativos)if(!el.isConnected){limpar(item);ativos.delete(el)}
    for(const elemento of candidatos()){
      if(ativos.has(elemento))continue;
      const id=idDe(elemento);if(!id)continue;
      const personagem=new ChibiCharacter(perfis[id]);cena.add(personagem.root);
      const item={elemento,id,personagem,balao:null};ativos.set(elemento,item);
      elemento.classList.add('chibi3d-pronto');
      if(!elemento.classList.contains('cartao-personagem')){
        elemento.addEventListener('click',()=>dizer(item,'inicio'));
        elemento.addEventListener('pointermove',e=>{
          const r=elemento.getBoundingClientRect();personagem.olhar((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);
        });
        elemento.addEventListener('pointerleave',()=>personagem.olhar());
      }
    }
  }
  function agendar(){if(!pendente){pendente=true;requestAnimationFrame(sincronizar)}}
  const observador=new MutationObserver(lista=>{
    if(lista.some(m=>m.type==='childList'&&m.target!==document.body&&
      !m.target.closest?.('.chibi3d-balao')&&m.target!==sr))agendar();
  });
  observador.observe(document.body,{childList:true,subtree:true});sincronizar();
  let falhou=false;
  function restaurar(){
    if(falhou)return;falhou=true;observador.disconnect();
    for(const item of ativos.values())limpar(item);
    canvas.remove();voz.remove();sr.remove();document.body.classList.remove('chibi3d-ligado');
    renderizador.dispose();
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();restaurar()},{once:true});
  function tamanho(){
    if(innerWidth!==largura||innerHeight!==altura){
      largura=innerWidth;altura=innerHeight;renderizador.setSize(largura,altura,false);
      canvas.style.width=`${largura}px`;canvas.style.height=`${altura}px`;
    }
  }
  function quadro(agora){
    if(falhou)return;
    try{
    const dt=Math.min(.05,(agora-ultimo)/1000);ultimo=agora;
    if(document.hidden){requestAnimationFrame(quadro);return}
    tamanho();renderizador.clear();
    for(const item of ativos.values())item.personagem.root.visible=false;
    for(const item of ativos.values()){
      const r=item.elemento.getBoundingClientRect();
      if(r.width<45||r.height<45||r.bottom<0||r.top>altura||r.right<0||r.left>largura){if(item.balao)item.balao.hidden=true;continue}
      item.personagem.atualizar(dt);
      const conversaParado=item.elemento.classList.contains('mascote-modulo')||
        item.elemento.classList.contains('detetive-art')||
        item.elemento.classList.contains('heroi')||
        item.id==='mago'&&item.elemento.classList.contains('personagem-hero');
      if(item.personagem.silencio>16&&conversaParado){
        dizer(item,'parado');
      }
      if(item.balao&&!item.balao.hidden){
        item.balao.style.left=`${Math.min(largura-120,Math.max(120,r.left+r.width/2))}px`;
        item.balao.style.top=`${Math.max(45,r.top+6)}px`;
      }
      const x=Math.max(0,r.left),y=Math.max(0,altura-r.bottom);
      const w=Math.min(largura-x,r.width-(x-r.left)),h=Math.min(altura-y,r.height-(y-(altura-r.bottom)));
      if(w<=0||h<=0)continue;
      camera.left=-1.90*r.width/r.height;camera.right=1.90*r.width/r.height;
      camera.top=1.90;camera.bottom=-1.90;camera.updateProjectionMatrix();
      item.personagem.root.visible=true;
      renderizador.setViewport(x,y,w,h);renderizador.setScissor(x,y,w,h);renderizador.setScissorTest(true);
      renderizador.render(cena,camera);
      item.personagem.root.visible=false;
    }
    renderizador.setScissorTest(false);
    requestAnimationFrame(quadro);
    }catch(erro){console.warn('Arte 2D restaurada após erro no 3D.',erro);restaurar()}
  }
  requestAnimationFrame(quadro);
  document.addEventListener('chibi:evento',evento=>{
    const {id,tipo}=evento.detail||{};
    const candidatos=[...ativos.values()].filter(item=>item.id===id&&item.elemento.getBoundingClientRect().width>0);
    const item=candidatos.find(i=>i.elemento.classList.contains('mascote-modulo'))||
      candidatos.find(i=>i.elemento.classList.contains('heroi')||i.elemento.classList.contains('detetive-art'))||candidatos[0];
    if(!item)return;
    const agora=performance.now();
    if(item.ultimoTipo===tipo&&agora-item.ultimaFala<650)return;
    item.ultimoTipo=tipo;item.ultimaFala=agora;
    const estado={acerto:'comemorar',erro:'errar',vitoria:'comemorar',derrota:'dano',fase:'pular'}[tipo]||'idle';
    item.personagem.estado(estado,tipo==='vitoria'?2:1.1);
    dizer(item,tipo);
  });
  addEventListener('pagehide',restaurar,{once:true});
  document.body.classList.add('chibi3d-ligado');
}
iniciar();
