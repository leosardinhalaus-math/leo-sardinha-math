export function analisar(texto) {
  const limpo = texto.trim();
  if (!limpo) return 'Insira um texto para analisar.';
  const palavras = limpo.split(/\s+/).length;
  const observacoes = [];
  if (/\S {2,}\S/.test(texto)) observacoes.push('Há espaços duplicados dentro de uma linha.');
  if (/\S[ \t]+[,;!?](?!\S)/.test(texto) || /\S[ \t]+[.:](?=\s|$)/m.test(texto)) {
    observacoes.push('Confira o espaço antes da pontuação.');
  }
  if (/[!?]{2,}/.test(texto)) observacoes.push('Confira os sinais de exclamação ou interrogação repetidos.');
  if (/\b(a gente|vc|pq|tbm)\b/i.test(texto)) observacoes.push('Confira se a linguagem informal combina com o público.');
  if (limpo.length > 150 && /[\p{L}\p{N}]$/u.test(limpo)) observacoes.push('Confira a pontuação no fim do texto.');
  if (palavras > 90 && !/\n\s*\n/.test(limpo)) observacoes.push('Considere separar as ideias em parágrafos.');
  if (!observacoes.length) observacoes.push('Nenhum ponto mecânico sinalizado. Confira a clareza e a precisão matemática.');
  return ['Palavras: ' + palavras, ...observacoes.map(item => '• ' + item)].join('\n');
}

export function ajustarEspacos(texto) {
  // Mantém recuos, quebras de linha, reticências e sinais usados na matemática.
  return texto.replace(/(\S) {2,}(?=\S)/g, '$1 ')
    .replace(/(\S)[ \t]+([.,;!?])(?=\s|$)/g, '$1$2');
}
