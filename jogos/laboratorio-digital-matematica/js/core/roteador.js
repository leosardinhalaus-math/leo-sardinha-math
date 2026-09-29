import {catalogo} from '../dados/textos.js';
import {ler} from './estado.js';

const caminhos={adivinhacao:'adivinhacao',fracsoma:'fracsoma',abelha:'abelha',poligonos:'poligonos',divisores:'divisores',cpf:'cpf',kente:'kente',estacao:'estacao',teoria:'teoria',avaliador:'avaliador',espiral:'espiral',referencias:'referencias'};
const destacados=['grimorio','detetive','fracsoma'];
const falas={
  grimorio:'Acenda as runas e descubra seu poder!',
  detetive:'Uma pista está nos dígitos!',
  fracsoma:'Vamos juntar as peças!',
  adivinhacao:'Menos palpites, mais estratégia!',
  abelha:'Procure a fração certa!',
  poligonos:'Quantos lados você vê?',
  divisores:'Monte pares de fatores!',
  cpf:'Confira os restos da conta!',
  kente:'Encontre o padrão do tecido!',
  estacao:'Papel ou tela? Experimente!'
};
let atual=null;
let visibilidade=null;

function reagir(personagem,fala){
  personagem.classList.remove('reagindo');
  void personagem.offsetWidth;
  personagem.classList.add('reagindo','falando');
  fala.textContent=personagem.dataset.fala;
  clearTimeout(fala._tempoFala);
  fala._tempoFala=setTimeout(()=>{
    personagem.classList.remove('reagindo','falando');
    fala.textContent='';
  },2800);
}

function ativarTeclado(personagem){
  personagem.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();personagem.click()}
  });
}

function cartao(c,feitos,ordem=0){
  const href=c.href||`#/${c.id}`;
  const personagem=c.id==='grimorio'
    ?'<img class="cartao-personagem" src="./images/mago-chibi.webp" alt="" loading="lazy">'
    :`<span class="cartao-personagem sprite-chibi sprite-${c.id}" aria-hidden="true"></span>`;
  return `<a class="cartao cartao-inicio cartao-${c.id}" style="--cor:${c.cor};--delay:${Math.min(ordem,7)*65}ms" href="${href}"><span class="cartao-topo"><span class="icone" aria-hidden="true">${c.icone}</span><span class="cartao-seta" aria-hidden="true">↗</span></span><span class="cartao-assunto">${c.assunto||'EXPERIMENTO'}</span><h3>${c.titulo}</h3><p>${c.resumo}</p>${personagem}${feitos[c.id]?'<small>✓ Refletido</small>':''}</a>`;
}

export async function navegar(){
  const slug=location.hash.replace(/^#\/?/,'').split('/')[0];
  const main=document.querySelector('main');
  visibilidade?.disconnect();visibilidade=null;
  if(atual?.desmontar)atual.desmontar();
  atual=null;
  main.replaceChildren();
  main.classList.toggle('inicio',!slug);
  main.classList.toggle('modulo-com-personagem',!!slug&&catalogo.some(c=>c.id===slug));
  document.body.classList.toggle('pagina-inicio',!slug);
  document.body.classList.toggle('pagina-modulo',!!slug);
  document.querySelectorAll('.rodape a').forEach(a=>{
    if(a.getAttribute('href')==='#/'+(slug||''))a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  if(!slug){
    const feitos=ler('concluidos',{});
    const principais=destacados.map(id=>catalogo.find(c=>c.id===id));
    const outros=catalogo.filter(c=>!destacados.includes(c.id));
    main.innerHTML=`<section class="hero-inicio" aria-labelledby="titulo-inicio"><div class="hero-texto"><span class="sobretitulo">LABORATÓRIO DIGITAL · MATEMÁTICA</span><h1 id="titulo-inicio">Um espaço para pensar com as mãos.</h1><p>Investigue padrões, monte ideias e descubra a matemática no seu ritmo. Atividades interativas para aprender fazendo.</p><button class="hero-acao" type="button">Explorar atividades <span aria-hidden="true">↗</span></button><span class="hero-nota">6º ao 9º ano · Gratuito · Sem cadastro</span></div><div class="hero-personagens"><span class="sprite-chibi sprite-detetive personagem-hero" role="button" tabindex="0" aria-label="Conversar com o Detetive" data-fala="Uma pista está nos dígitos!"></span><img class="personagem-hero" src="./images/mago-chibi.webp" alt="Mestre Arcano" role="button" tabindex="0" aria-label="Conversar com o Mestre Arcano" data-fala="Acenda as runas e descubra seu poder!" width="900" height="1080"><span class="sprite-chibi sprite-fracsoma personagem-hero" role="button" tabindex="0" aria-label="Conversar com a menina das frações" data-fala="Vamos juntar as peças!"></span><p class="fala-personagem" role="status"></p></div></section><section class="secao-inicio" id="experimentos" aria-labelledby="destaques-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">COMECE POR AQUI</span><h2 id="destaques-titulo">Novas experiências</h2></div><p>Três maneiras de jogar com números.</p></div><div class="grade grade-destaques">${principais.map((c,i)=>cartao(c,feitos,i)).join('')}</div></section><section class="secao-inicio" aria-labelledby="acervo-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">CONTINUE EXPLORANDO</span><h2 id="acervo-titulo">Todo o laboratório</h2></div><p>Escolha um caminho e experimente.</p></div><div class="grade grade-acervo">${outros.map((c,i)=>cartao(c,feitos,i)).join('')}</div></section><p class="inicio-rodape">As atividades funcionam no celular, tablet e computador. Após a primeira visita completa, também ficam disponíveis offline.</p>`;
    main.querySelector('.hero-acao').addEventListener('click',()=>main.querySelector('#experimentos').scrollIntoView({behavior:'smooth'}));
    const grupo=main.querySelector('.hero-personagens');
    const fala=grupo.querySelector('.fala-personagem');
    grupo.querySelectorAll('.personagem-hero').forEach(personagem=>{
      personagem.addEventListener('click',()=>{
        grupo.querySelectorAll('.personagem-hero').forEach(outro=>{if(outro!==personagem)outro.classList.remove('reagindo')});
        reagir(personagem,fala);
      });
      ativarTeclado(personagem);
    });
    const cartoes=main.querySelectorAll('.cartao-inicio');
    if('IntersectionObserver' in window){
      visibilidade=new IntersectionObserver(entradas=>{
        entradas.forEach(entrada=>entrada.target.classList.toggle('visivel',entrada.isIntersecting));
      },{rootMargin:'50px',threshold:.1});
      cartoes.forEach(cartao=>visibilidade.observe(cartao));
    }else cartoes.forEach(cartao=>cartao.classList.add('visivel'));
    main.focus({preventScroll:true});return;
  }
  if(!caminhos[slug]){main.innerHTML='<h1>Página não encontrada</h1><a href="#/">Voltar ao início</a>';return}
  try{
    const revisao=slug==='fracsoma'?'?v=15':'';
    const modulo=await import(`../modulos/${caminhos[slug]}/index.js${revisao}`);
    if(location.hash.replace(/^#\/?/,'').split('/')[0]!==slug)return;
    atual=modulo;modulo.montar(main);
    if(catalogo.some(c=>c.id===slug)){
      const heading=main.querySelector('h1');
      if(heading){
        const figura=document.createElement('span');
        figura.className=`mascote-modulo sprite-chibi sprite-${slug}`;
        figura.setAttribute('role','button');figura.tabIndex=0;
        figura.setAttribute('aria-label',`Conversar com o personagem: ${falas[slug]}`);
        figura.dataset.fala=falas[slug];
        heading.insertAdjacentElement('afterend',figura);
        const fala=document.createElement('span');fala.className='fala-modulo sr-only';fala.setAttribute('role','status');
        figura.append(fala);
        figura.addEventListener('click',()=>reagir(figura,fala));
        ativarTeclado(figura);
      }
    }
    main.focus();window.scrollTo(0,0);
  }catch(e){
    console.error(e);
    main.innerHTML='<h1>Não foi possível abrir esta atividade</h1><p>Tente recarregar a página quando estiver conectado.</p><a href="#/">Início</a>';
  }
}
