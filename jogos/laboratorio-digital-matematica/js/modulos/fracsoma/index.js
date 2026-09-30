import {modulo} from '../../core/ui.js?v=22';
import {ler,salvar,concluir} from '../../core/estado.js';

// Múltiplo de todos os denominadores: peças e alvos têm valor inteiro.
export const UNIDADE=10800;
export const DENOMINADORES=[2,3,4,5,6,8,9,10,12,15,16,18,20,24,25,27,30];
const FASES=[
  [[2,3],[2,5],[3,4],[3,5],[4,5]],
  [[3,5],[3,8],[4,5],[4,6],[5,6]],
  [[4,5],[4,8],[5,6],[5,8],[6,9]],
  [[2,6],[3,10],[4,12],[5,10],[6,8]],
  [[3,8],[4,12],[5,15],[6,9],[8,12]],
  [[6,9],[8,10],[9,12],[10,15],[12,18]],
  [[4,5,10],[3,6,9],[4,8,12],[5,10,15],[6,9,18]],
  [[2,3,10],[3,4,12],[4,5,20],[5,6,15],[3,8,24]]
];
const mdc=(a,b)=>b?mdc(b,a%b):a;
export const valorPecas=pecas=>pecas.reduce((s,d)=>s+UNIDADE/d,0);
export const valorDesafio=desafio=>desafio.reduce((s,[n,d])=>s+n*UNIDADE/d,0);
export function fracaoReduzida(valor){const g=mdc(valor,UNIDADE);return [valor/g,UNIDADE/g]}

function opcoes(denominadores){
  return denominadores.reduce((parciais,d)=>parciais.flatMap(parcial=>
    Array.from({length:Math.min(3,d-1)},(_,i)=>[...parcial,[i+1,d]])
      .filter(desafio=>valorDesafio(desafio)<=UNIDADE)
  ),[[]]);
}
const OPCOES=FASES.map(fase=>fase.flatMap(opcoes));
const assinatura=desafio=>desafio.map(([n,d])=>`${n}/${d}`).join(' + ');
export function gerarDesafios(primeiroAnterior=''){
  const usados=new Set();
  return OPCOES.map((opcoesNivel,nivel)=>{
    const disponiveis=opcoesNivel.filter(opcao=>
      !usados.has(assinatura(opcao)) && (nivel!==0 || assinatura(opcao)!==primeiroAnterior)
    );
    const escolhido=disponiveis[Math.floor(Math.random()*disponiveis.length)];
    usados.add(assinatura(escolhido));
    return escolhido.map(par=>[...par]);
  });
}

export function montar(container){
  modulo(container,{id:'fracsoma',titulo:'Frac-Soma 235',objetivo:'Construir somas de frações com peças unitárias, encontrar equivalências e explicar a resposta.',reflexao:'Quando o cursor roxo coincide com uma divisão de outra linha, o que isso mostra sobre as frações?',professor:'Comece com as frações sorteadas; revele outras linhas conforme surgirem equivalências. Conteúdo: adição e equivalência; pedagogia: construir antes de formalizar; tecnologia: cursor e retorno imediato. Compare com tiras de papel.'},el=>{
    let desafios=gerarDesafios(ler('fracsoma-ultimo-inicio',''));
    salvar('fracsoma-ultimo-inicio',assinatura(desafios[0]));
    let nivel=0,pontos=0,erros=0,concluido=false,visiveis=new Set(),pecas=[],numerador='',denominador='',mensagem='',classe='';
    const recorde=()=>ler('fracsoma-recorde',0);
    const cor=d=>`hsl(${DENOMINADORES.indexOf(d)*43%360} 80% 62%)`;
    const expressao=()=>assinatura(desafios[nivel]);
    const soma=()=>valorPecas(pecas);
    function animar(tipo){document.dispatchEvent(new CustomEvent('chibi:evento',{detail:{id:'fracsoma',tipo}}))}
    function iniciarNivel(){erros=0;concluido=false;visiveis=new Set(desafios[nivel].map(([,d])=>d));pecas=[];numerador=denominador=mensagem=classe='';desenhar();queueMicrotask(()=>animar('fase'))}
    function linha(d){const usadas=pecas.filter(x=>x===d).length;const partes=Array.from({length:d},(_,i)=>`<span class="fs-parte ${i<usadas?'fs-usada':''}" style="--fs-cor:${cor(d)}"></span>`).join('');return `<div class="fs-linha"><strong>1/${d}</strong><button type="button" class="fs-trilho" data-pegar="${d}" aria-label="Adicionar peça um sobre ${d} à soma" ${concluido||usadas>=d?'disabled':''}>${partes}</button></div>`}
    function desenhar(){
      const total=soma();
      const equivalencias=DENOMINADORES.filter(d=>visiveis.has(d)&&total>0&&(total*d)%UNIDADE===0).map(d=>`${total*d/UNIDADE}/${d}`);
      const leitura=total===0?'Toque numa linha para levar uma peça até a soma.':equivalencias.length?`O cursor roxo coincide com: ${equivalencias.join(', ')}.`:'O cursor ainda não coincide com uma divisão das linhas visíveis. Mostre outra linha.';
      const faixa=pecas.map(d=>`<span class="fs-bloco" style="width:${100/d}%;background:${cor(d)}" aria-hidden="true"></span>`).join('');
      const retiradas=pecas.map((d,i)=>`<button type="button" class="fs-retirar" data-retirar="${i}" ${concluido?'disabled':''} aria-label="Retirar a peça ${i+1}, um sobre ${d}">− 1/${d}</button>`).join('');
      el.innerHTML=`<div class="fs"><div class="fs-topo"><p>As frações mudam a cada visita. Toque numa linha para levar uma peça até a soma; use os botões abaixo para devolver peças.</p><strong>Pontos: ${pontos} · Recorde: ${recorde()}</strong></div>
        <div class="fs-cartao"><strong>Desafio ${nivel+1} de ${desafios.length}:</strong> ${expressao()} = ?</div>
        <div class="fs-quadro"><div class="fs-parede">${DENOMINADORES.filter(d=>visiveis.has(d)).map(linha).join('')||'<p>Escolha uma linha abaixo.</p>'}<div class="fs-linha fs-total"><strong>Soma</strong><div class="fs-trilho fs-soma" role="img" aria-label="Soma montada com ${pecas.length} peças">${faixa}</div></div>${total?`<div class="fs-cursor-faixa" aria-hidden="true"><div class="fs-cursor" style="left:${100*total/UNIDADE}%"></div></div>`:''}</div></div>
        <p class="fs-leitura" role="status">${leitura}</p><div class="fs-retiradas" aria-label="Peças na soma">${retiradas||'<span>Nenhuma peça na soma.</span>'}</div>
        <div class="fs-cartao"><strong>Linhas visíveis</strong><div class="fs-linhas">${DENOMINADORES.map(d=>`<button type="button" data-linha="${d}" aria-pressed="${visiveis.has(d)}">1/${d}</button>`).join('')}</div></div>
        <div class="fs-cartao"><div class="fs-resposta"><strong>Resposta:</strong><label>Numerador <input id="fs-numerador" inputmode="numeric" pattern="[0-9]*" maxlength="6" value="${numerador}" ${concluido?'disabled':''}></label><span aria-hidden="true">/</span><label>Denominador <input id="fs-denominador" inputmode="numeric" pattern="[0-9]*" maxlength="6" value="${denominador}" ${concluido?'disabled':''}></label><button type="button" class="primario" data-acao="${concluido?'proximo':'conferir'}">${concluido?nivel===desafios.length-1?'Ver resultado':'Próximo desafio':'Conferir'}</button></div><p class="fs-mensagem ${classe}" role="status">${mensagem}</p></div></div>`;
    }
    function avisar(texto,tipo=''){mensagem=texto;classe=tipo;const saida=el.querySelector('.fs-mensagem');saida.textContent=texto;saida.className=`fs-mensagem ${tipo}`;if(tipo==='erro')animar('erro')}
    function conferir(){
      if(!/^\d{1,6}$/.test(numerador)||!/^[1-9]\d{0,5}$/.test(denominador)){avisar('Digite numerador e denominador inteiros. O denominador precisa ser maior que zero.','erro');return}
      const alvo=valorDesafio(desafios[nivel]);
      if(Number(numerador)*UNIDADE===alvo*Number(denominador)){
        concluido=true;pontos+=Math.max(10-2*erros,4);
        const [n,d]=fracaoReduzida(alvo);mensagem=`Certo! ${expressao()} = ${n}/${d}. Você pode montar essa soma com as peças de vários modos.`;classe='acerto';desenhar();animar('acerto');
      }else{erros++;avisar('Ainda não. Monte a soma e procure uma linha em que o cursor roxo coincida com uma divisão.','erro')}
    }
    function proximo(){
      if(nivel<desafios.length-1){nivel++;iniciarNivel();return}
      concluir('fracsoma');const melhor=Math.max(pontos,recorde());salvar('fracsoma-recorde',melhor);
      el.innerHTML=`<div class="fs fs-fim"><h2>Missão cumprida!</h2><p>Você completou os ${desafios.length} desafios com <strong>${pontos} pontos</strong>. Recorde neste aparelho: ${melhor}.</p><button type="button" class="primario" data-acao="reiniciar">Jogar de novo</button></div>`;animar('vitoria');
    }
    el.addEventListener('input',event=>{
      if(event.target.id==='fs-numerador')numerador=event.target.value.replace(/\D/g,'').slice(0,6);
      else if(event.target.id==='fs-denominador')denominador=event.target.value.replace(/\D/g,'').slice(0,6);
      else return;
      event.target.value=event.target.id==='fs-numerador'?numerador:denominador;
    });
    el.addEventListener('click',event=>{
      const botao=event.target.closest('button');if(!botao||!el.contains(botao))return;
      if(botao.dataset.pegar){const d=Number(botao.dataset.pegar);if(soma()+UNIDADE/d>UNIDADE){avisar('A soma não pode passar de um inteiro.','erro');return}pecas.push(d);desenhar();el.querySelector(`[data-pegar="${d}"]`)?.focus()}
      else if(botao.dataset.retirar!==undefined){pecas.splice(Number(botao.dataset.retirar),1);desenhar();el.querySelector('.fs-retiradas button')?.focus()}
      else if(botao.dataset.linha){const d=Number(botao.dataset.linha);visiveis.has(d)?visiveis.delete(d):visiveis.add(d);desenhar();el.querySelector(`[data-linha="${d}"]`)?.focus()}
      else if(botao.dataset.acao==='conferir')conferir();
      else if(botao.dataset.acao==='proximo')proximo();
      else if(botao.dataset.acao==='reiniciar'){
        desafios=gerarDesafios(assinatura(desafios[0]));
        salvar('fracsoma-ultimo-inicio',assinatura(desafios[0]));
        nivel=pontos=0;iniciarNivel();
      }
    });
    iniciarNivel();
  });
}
export function desmontar(){}
