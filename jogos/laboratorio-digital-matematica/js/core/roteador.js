import {catalogo} from '../dados/textos.js';
import {ler} from './estado.js';

const caminhos={adivinhacao:'adivinhacao',fracsoma:'fracsoma',abelha:'abelha',poligonos:'poligonos',divisores:'divisores',cpf:'cpf',kente:'kente',estacao:'estacao',teoria:'teoria',avaliador:'avaliador',espiral:'espiral',referencias:'referencias'};
const destacados=['grimorio','detetive','fracsoma'];
let atual=null;

function cartao(c,feitos){
  const href=c.href||`#/${c.id}`;
  return `<a class="cartao cartao-inicio" href="${href}"><span class="cartao-topo"><span class="icone" aria-hidden="true">${c.icone}</span><span class="cartao-seta" aria-hidden="true">↗</span></span><span class="cartao-assunto">${c.assunto||'EXPERIMENTO'}</span><h3>${c.titulo}</h3><p>${c.resumo}</p>${feitos[c.id]?'<small>✓ Refletido</small>':''}</a>`;
}

export async function navegar(){
  const slug=location.hash.replace(/^#\/?/,'').split('/')[0];
  const main=document.querySelector('main');
  if(atual?.desmontar)atual.desmontar();
  atual=null;
  main.replaceChildren();
  main.classList.toggle('inicio',!slug);
  document.querySelectorAll('.rodape a').forEach(a=>{
    if(a.getAttribute('href')==='#/'+(slug||''))a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  if(!slug){
    const feitos=ler('concluidos',{});
    const principais=destacados.map(id=>catalogo.find(c=>c.id===id));
    const outros=catalogo.filter(c=>!destacados.includes(c.id));
    main.innerHTML=`<section class="hero-inicio" aria-labelledby="titulo-inicio"><div class="hero-texto"><span class="sobretitulo">LABORATÓRIO DIGITAL · MATEMÁTICA</span><h1 id="titulo-inicio">Um espaço para pensar com as mãos.</h1><p>Investigue padrões, monte ideias e descubra a matemática no seu ritmo. Atividades interativas para aprender fazendo.</p><a class="hero-acao" href="#experimentos">Explorar atividades <span aria-hidden="true">↗</span></a><span class="hero-nota">6º ao 9º ano · Gratuito · Sem cadastro</span></div><div class="hero-foto" role="img" aria-label="Peças de frações e formas geométricas sobre uma mesa de estudo"></div></section><section class="secao-inicio" id="experimentos" aria-labelledby="destaques-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">COMECE POR AQUI</span><h2 id="destaques-titulo">Novas experiências</h2></div><p>Três maneiras de jogar com números.</p></div><div class="grade grade-destaques">${principais.map(c=>cartao(c,feitos)).join('')}</div></section><section class="secao-inicio" aria-labelledby="acervo-titulo"><div class="secao-cabecalho"><div><span class="sobretitulo">CONTINUE EXPLORANDO</span><h2 id="acervo-titulo">Todo o laboratório</h2></div><p>Escolha um caminho e experimente.</p></div><div class="grade grade-acervo">${outros.map(c=>cartao(c,feitos)).join('')}</div></section><p class="inicio-rodape">As atividades funcionam no celular, tablet e computador. Após a primeira visita completa, também ficam disponíveis offline.</p>`;
    main.focus({preventScroll:true});return;
  }
  if(!caminhos[slug]){main.innerHTML='<h1>Página não encontrada</h1><a href="#/">Voltar ao início</a>';return}
  try{
    const revisao=slug==='fracsoma'?'?v=5':'';
    const modulo=await import(`../modulos/${caminhos[slug]}/index.js${revisao}`);
    if(location.hash.replace(/^#\/?/,'').split('/')[0]!==slug)return;
    atual=modulo;modulo.montar(main);main.focus();window.scrollTo(0,0);
  }catch(e){
    console.error(e);
    main.innerHTML='<h1>Não foi possível abrir esta atividade</h1><p>Tente recarregar a página quando estiver conectado.</p><a href="#/">Início</a>';
  }
}
