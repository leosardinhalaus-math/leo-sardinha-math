import {catalogo} from '../dados/textos.js';
import {ler} from './estado.js';

const caminhos={adivinhacao:'adivinhacao',fracsoma:'fracsoma',abelha:'abelha',poligonos:'poligonos',divisores:'divisores',cpf:'cpf',kente:'kente',estacao:'estacao',teoria:'teoria',avaliador:'avaliador',espiral:'espiral',referencias:'referencias'};
const destacados=['grimorio','detetive','fracsoma'];
let atual=null;

function cartao(c,feitos){
  const href=c.href||`#/${c.id}`;
  const personagem=c.id==='grimorio'
    ?'<img class="cartao-personagem" src="./images/mago-chibi.webp" alt="" loading="lazy">'
    :`<span class="cartao-personagem sprite-chibi sprite-${c.id}" aria-hidden="true"></span>`;
  return `<a class="cartao cartao-inicio cartao-${c.id}" style="--cor:${c.cor}" href="${href}"><span class="cartao-topo"><span class="icone" aria-hidden="true">${c.icone}</span><span class="cartao-seta" aria-hidden="true">↗</span></span><span class="cartao-assunto">${c.assunto||'EXPERIMENTO'}</span><h3>${c.titulo}</h3><p>${c.resumo}</p>${personagem}${feitos[c.id]?'<small>✓ Refletido</small>':''}</a>`;
}

export async function navegar(){
  const slug=location.hash.replace(/^#\/?/,'').split('/')[0];
  const main=document.querySelector('main');
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
    main.innerHTML=`<section class="hero-inicio" aria-labelledby="titulo-inicio"><div class="hero-texto"><span class="sobretitulo">LABORATÓRIO DIGITAL · MATEMÁTICA</span><h1 id="titulo-inicio">Um espaço para pensar com as mãos.</h1><p>Investigue padrões, monte ideias e descubra a matemática no seu ritmo. Atividades interativas para aprender fazendo.</p><button class="hero-acao" type="button">Explorar atividades <span aria-hidden="true">↗</span></button><span class="hero-nota">6º ao 9º ano · Gratuito · Sem cadastro</span></div><div class="hero-personagens" aria-hidden="true"><span class="sprite-chibi sprite-detetive"></span><img src="./images/mago-chibi.webp" alt="" width="900" height="1080"><span class="sprite-chibi sprite-fracsoma"></span></div></section><section class="secao-inicio" id="experimentos" aria-labelledby="destaques-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">COMECE POR AQUI</span><h2 id="destaques-titulo">Novas experiências</h2></div><p>Três maneiras de jogar com números.</p></div><div class="grade grade-destaques">${principais.map(c=>cartao(c,feitos)).join('')}</div></section><section class="secao-inicio" aria-labelledby="acervo-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">CONTINUE EXPLORANDO</span><h2 id="acervo-titulo">Todo o laboratório</h2></div><p>Escolha um caminho e experimente.</p></div><div class="grade grade-acervo">${outros.map(c=>cartao(c,feitos)).join('')}</div></section><p class="inicio-rodape">As atividades funcionam no celular, tablet e computador. Após a primeira visita completa, também ficam disponíveis offline.</p>`;
    main.querySelector('.hero-acao').addEventListener('click',()=>main.querySelector('#experimentos').scrollIntoView({behavior:'smooth'}));
    main.focus({preventScroll:true});return;
  }
  if(!caminhos[slug]){main.innerHTML='<h1>Página não encontrada</h1><a href="#/">Voltar ao início</a>';return}
  try{
    const revisao=slug==='fracsoma'?'?v=10':'';
    const modulo=await import(`../modulos/${caminhos[slug]}/index.js${revisao}`);
    if(location.hash.replace(/^#\/?/,'').split('/')[0]!==slug)return;
    atual=modulo;modulo.montar(main);
    if(catalogo.some(c=>c.id===slug)){
      const heading=main.querySelector('h1');
      if(heading){const figura=document.createElement('span');figura.className=`mascote-modulo sprite-chibi sprite-${slug}`;figura.setAttribute('aria-hidden','true');heading.insertAdjacentElement('afterend',figura)}
    }
    main.focus();window.scrollTo(0,0);
  }catch(e){
    console.error(e);
    main.innerHTML='<h1>Não foi possível abrir esta atividade</h1><p>Tente recarregar a página quando estiver conectado.</p><a href="#/">Início</a>';
  }
}
