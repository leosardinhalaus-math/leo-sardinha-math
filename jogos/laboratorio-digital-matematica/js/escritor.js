import {catalogo} from './dados/textos.js';
import {ler, salvar} from './core/estado.js';
import {analisar, ajustarEspacos} from './revisor.js';

const temas = {
  inicio: 'Descreva uma descoberta que você fez no laboratório.',
  grimorio: 'Explique como as potências de 2 ajudam a descobrir um número.',
  detetive: 'Crie uma pista com pesos e restos usando números fictícios.',
  adivinhacao: 'Compare palpites ao acaso com a estratégia de dividir o intervalo.',
  fracsoma: 'Mostre como as peças representam a soma de duas frações.',
  abelha: 'Explique como você classificou uma fração antes de escolher o caminho.',
  poligonos: 'Descreva o percurso da tartaruga usando lados e ângulos de giro.',
  divisores: 'Explique como a montagem de retângulos revela pares de fatores.',
  cpf: 'Explique o papel dos pesos e do resto usando um exemplo fictício.',
  kente: 'Descreva o padrão, as figuras e as simetrias de uma criação no Ateliê.',
  estacao: 'Compare o que mudou ao resolver a mesma questão no papel e na tela.',
  teoria: 'Relacione um conceito do quadro teórico a uma atividade do laboratório.',
  avaliador: 'Justifique sua avaliação da atividade com um exemplo observável.',
  espiral: 'Registre o que fez, o que descobriu e o que quer investigar a seguir.',
  referencias: 'Comente como uma referência ajuda a entender a atividade estudada.'
};
const setores = [
  {id:'inicio', titulo:'Laboratório · início', href:'./#/'},
  ...catalogo,
  {id:'teoria', titulo:'Quadro teórico'},
  {id:'avaliador', titulo:'Avaliador'},
  {id:'espiral', titulo:'Diário'},
  {id:'referencias', titulo:'Referências'}
];
const formatos = {
  atividade:['Objetivo de aprendizagem','Materiais e preparação','Passo a passo','Perguntas para discussão','O que observar na resposta'],
  artigo:['Introdução e pergunta central','Explicação com exemplo','Conclusão'],
  historia:['Personagens e cenário','Situação inicial','Desafio matemático','Desfecho'],
  resumo:['Ideia central','Pontos essenciais','Conclusão']
};

const $ = id => document.getElementById(id);
const seletor = $('setor');
const sugestao = $('sugestao');
const rascunho = $('rascunho');
const revisao = $('revisao');
const tema = $('tema-texto');
const publico = $('publico');
const formato = $('formato');
const status = $('escritor-status');
const observacoes = $('observacoes');
const campos = [tema, publico, formato, rascunho, revisao];
const inicioObservacoes = observacoes.textContent;
let setor;
let chave;

function gravar() {
  const dados = Object.fromEntries(campos.map(campo => [campo.id, campo.value]));
  const salvo = salvar(chave, dados);
  if (!salvo) status.textContent = 'O navegador não conseguiu salvar este rascunho.';
  return salvo;
}

function abrir(id) {
  setor = setores.find(item => item.id === id) ?? setores[0];
  chave = 'editorial:' + setor.id;
  const salvo = ler(chave, {});
  leitorUrl.searchParams.set('setor', setor.id);
  history.replaceState(null, '', leitorUrl);
  seletor.value = setor.id;
  $('voltar').href = setor.href ?? './#/' + setor.id;
  sugestao.textContent = temas[setor.id];
  for (const campo of campos) {
    const opcoes = campo.options ? Array.from(campo.options, op => op.value) : null;
    const valor = salvo?.[campo.id];
    campo.value = typeof valor === 'string' && (!opcoes || opcoes.includes(valor))
      ? valor : opcoes ? opcoes[0] : campo === tema && setor.id !== 'inicio' ? setor.titulo : '';
  }
  status.textContent = '';
  observacoes.textContent = inicioObservacoes;
}

function exportar(nome, texto) {
  const url = URL.createObjectURL(new Blob([texto], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const leitorUrl = new URL(location.href);
const temaPreferido = ler('tema');
if (temaPreferido) document.documentElement.dataset.tema = temaPreferido;
seletor.append(...setores.map(item => new Option(item.titulo, item.id)));
seletor.addEventListener('change', () => abrir(seletor.value));
for (const campo of campos) campo.addEventListener('input', () => {
  gravar();
  if (campo === revisao) observacoes.textContent = 'Texto alterado. Selecione Analisar texto para atualizar as observações.';
});
$('roteiro').addEventListener('click', () => {
  if (rascunho.value.trim() && !confirm('Substituir o rascunho deste setor pelo roteiro?')) return;
  const titulo = tema.value.trim() || setor.titulo;
  rascunho.value = [titulo, 'Público: ' + publico.value, '', sugestao.textContent, '',
    ...formatos[formato.value].map(secao => secao + '\n')].join('\n');
  if (gravar()) status.textContent = 'Roteiro criado. Complete as seções no rascunho.';
  rascunho.focus();
});
$('enviar').addEventListener('click', () => {
  if (!rascunho.value.trim()) {
    status.textContent = 'Escreva um rascunho antes de enviar.';
    return;
  }
  if (revisao.value.trim() && revisao.value !== rascunho.value &&
      !confirm('Substituir o texto que já está no Revisor?')) return;
  revisao.value = rascunho.value;
  gravar();
  observacoes.textContent = analisar(revisao.value);
  revisao.focus();
});
$('analisar').addEventListener('click', () => { observacoes.textContent = analisar(revisao.value); });
$('corrigir').addEventListener('click', () => {
  revisao.value = ajustarEspacos(revisao.value);
  gravar();
  observacoes.textContent = analisar(revisao.value);
});
$('exportar-rascunho').addEventListener('click', () => exportar('rascunho-' + setor.id + '.txt', rascunho.value));
$('exportar-revisao').addEventListener('click', () => exportar('revisao-' + setor.id + '.txt',
  revisao.value + '\n\nObservações\n' + analisar(revisao.value)));
abrir(leitorUrl.searchParams.get('setor'));
