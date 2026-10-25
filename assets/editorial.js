'use strict';
const el=id=>document.getElementById(id);
function suggestions(t){
 const result=[];
 if(!t.trim())return ['Insira um texto para analisar.'];
 if(/ {2,}/.test(t))result.push('Há espaços duplicados.');
 if(/\s+[,.!?;:]/.test(t))result.push('Existe espaço antes de pontuação.');
 if(/([!?.,])\1{1,}/.test(t))result.push('Revise sinais de pontuação repetidos.');
 if(/\b(a gente|vc|pq|tbm)\b/i.test(t))result.push('Verifique se expressões informais combinam com o público.');
 if(t.trim().length>150&&!/[.!?]/.test(t))result.push('O texto longo não contém pontuação final.');
 if(t.split(/\s+/).filter(Boolean).length>90&&!t.includes('\n'))result.push('Considere dividir o texto em parágrafos.');
 return result.length?result:['Nenhum problema simples detectado. Faça também uma revisão de sentido, fatos e ortografia.'];
}
function simpleFix(t){return t.replace(/ {2,}/g,' ').replace(/\s+([,.!?;:])/g,'$1').replace(/([!?.,])\1+/g,'$1');}
function download(filename,body){const blob=new Blob([body],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
el('outline').onclick=()=>{
 const title=el('topic').value.trim()||'Meu texto',who=el('audience').value,format=el('genre').value;
 const templates={
 artigo:['Introdução: por que o tema importa?','Desenvolvimento: conceitos, exemplos e explicações.','Conclusão: principais aprendizados.'],
 atividade:['Objetivo de aprendizagem','Materiais e preparação','Passo a passo da atividade','Questões para discussão','Critérios de avaliação'],
 historia:['Personagens e cenário','Situação inicial','Conflito e desenvolvimento','Desfecho e reflexão'],
 resumo:['Ideia central','Pontos essenciais','Conclusão sintética']
 };
 const proposed=title+'\nPúblico: '+who+'\n\n'+templates[format].map(s=>s+'\n').join('\n');
 if(el('draft').value.trim()&&!confirm('Substituir o texto atual pelo roteiro?'))return;
 el('draft').value=proposed;el('writerStatus').textContent='Roteiro editável criado.';
};
el('sendReview').onclick=()=>{el('reviewText').value=el('draft').value;el('reviewStatus').textContent='Texto enviado ao Revisor.';el('reviewText').focus()};
el('analyze').onclick=()=>{const t=el('reviewText').value;const words=t.trim()?t.trim().split(/\s+/).length:0;el('report').textContent='Palavras: '+words+'\n'+suggestions(t).map(s=>'• '+s).join('\n')};
el('apply').onclick=()=>{el('reviewText').value=simpleFix(el('reviewText').value);el('analyze').click();el('reviewStatus').textContent='Correções mecânicas aplicadas. Confira o sentido antes de usar.';};
el('save').onclick=()=>download('meu-texto.txt',el('draft').value);
el('exportReview').onclick=()=>download('texto-revisado.txt',el('reviewText').value+'\n\nObservações\n'+el('report').textContent);
