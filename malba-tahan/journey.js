/* Leitura guiada inspirada no percurso do jogo original dos 35 camelos. */
window.TahanJourney=(()=>{
'use strict';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let story,variant,step=0,mode='digital',answers={},hypothesis='',hypothesisSkipped=false,solved=false,assisted=false,onRecord=()=>{};
function canContinue(){if(step===1||step===5)return answers[step]?.correct===true;if(step===2)return hypothesis.trim().length>0||hypothesisSkipped;if(step===3)return solved||assisted;return true;}
function help(){if(canContinue())return step===6?'Você pode reler a história ou escolher outro desafio.':'';if(step===1||step===5)return 'Escolha uma resposta e confira a ideia antes de continuar.';if(step===2)return 'Registre uma hipótese ou escolha continuar sem registrar.';return 'Confira seu cálculo ou abra “Entenda uma solução” para investigar com apoio.';}
function navigation(){if(!story)return;$('#journey-prev').disabled=step===0;$('#journey-next').disabled=!canContinue();$('#journey-next').textContent=step===6?'Reler a história ↻':'Continuar →';$('#journey-help').textContent=help();}
function move(n){step=Math.max(0,Math.min(6,n));render();$('#scene-title').focus({preventScroll:true});$('#story-journey').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function render(){if(!story)return;
 const scene=story.scenes[step],quiz=story.quizzes[step];
 $('#story-journey').hidden=mode==='paper';$('#paper-story').hidden=mode!=='paper';$('#journey-nav').hidden=mode==='paper';
 $('.activity-grid').hidden=mode==='digital'&&step!==3&&step!==4;$('.reasoning').hidden=mode==='digital'&&step!==6;
 $('#answer-form').hidden=mode==='digital'&&step===4;
 $('#scene-position').textContent=`Etapa ${step+1} de 7 · ${['O encontro','O impasse','Sua hipótese','Sua vez de investigar','O desfecho','Outra pergunta','O que você leva'][step]}`;
 const cast=window.TahanCharacters.forStory(variant.id);const portrait=$('#scene-character-image');if(portrait.getAttribute('src')!==cast.image)portrait.src=cast.image;portrait.alt=cast.alt;$('#scene-character-caption').textContent=cast.caption;
 $('#journey-progress').value=step+1;$('#scene-title').textContent=scene.title;$('#scene-text').innerHTML=scene.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('');
 $('#scene-choice').hidden=!quiz;$('#scene-hypothesis').hidden=step!==2;
 if(quiz){$('#scene-choice').innerHTML=`<h4>${escape(quiz.prompt)}</h4><div class="story-options" role="group" aria-label="${escape(quiz.prompt)}">${quiz.options.map((o,i)=>`<button type="button" data-story-option="${i}" aria-pressed="${answers[step]?.selected===i}"><span aria-hidden="true">${String.fromCharCode(65+i)}</span>${escape(o)}</button>`).join('')}</div><p class="story-feedback${answers[step]?.correct?' correct':''}" id="story-feedback" role="status" aria-live="polite">${answers[step]?escape(answers[step].correct?quiz.feedback:'Essa ideia ainda não atende à pergunta. Releia a cena e compare as alternativas.'):''}</p>`;}
 $('#story-hypothesis').value=hypothesis;
 $('#story-camel-link').hidden=variant.id!=='camelos'||step!==6;
 if(step===4)$('#solution').open=true;
 $('#journey-outcome').hidden=step!==6;$('#journey-outcome').textContent=solved?'Você conferiu seu cálculo. Agora registre o que descobriu com a história.':assisted?'Você investigou com apoio da resolução. Pode voltar e testar sua ideia antes de concluir.':'Você chegou ao epílogo pela leitura. Pode voltar ao desafio quando quiser.';
 navigation();
}
function start(v){variant=v;story=window.TahanStories.create(v);step=0;answers={};hypothesis='';hypothesisSkipped=false;solved=false;assisted=false;$('#paper-story-body').innerHTML=printStory(false);render();}
function printStory(teacher){if(!story)return '';return `<p class="print-story-note">Reconto autoral inspirado nas obras indicadas. Cenas e falas recriadas; os números acompanham esta rodada.</p>`+story.scenes.map((s,i)=>{
 if(!teacher&&i>=4)return '';
 const quiz=story.quizzes[i];
 return `<section class="print-scene"><h3>${i+1}. ${escape(s.title)}</h3>${s.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}${quiz?`<p><b>Para conversar:</b> ${escape(quiz.prompt)}</p><ol type="A">${quiz.options.map(o=>`<li>${escape(o)}</li>`).join('')}</ol>${teacher?`<p><b>Comentário:</b> ${escape(quiz.feedback)}</p>`:''}`:''}${i===2?`<p><b>Sua hipótese:</b> ${escape(story.hypothesis)}</p>${hypothesis?`<p>${escape(hypothesis)}</p>`:'<p>_________________________________________________________________</p>'}`:''}</section>`;
 }).join('')+(!teacher?'<p><b>A história espera sua descoberta:</b> investigue o desafio antes de consultar o desfecho no guia do professor.</p>':'');}
function init(callback){onRecord=callback||(()=>{});
 $('#journey-prev').addEventListener('click',()=>move(step-1));
 $('#journey-next').addEventListener('click',()=>{if(canContinue())move(step===6?0:step+1);});
 $('#skip-story').addEventListener('click',()=>move(3));
 $('#skip-hypothesis').addEventListener('click',()=>{hypothesisSkipped=true;move(3);});
 $('#story-hypothesis').addEventListener('input',e=>{hypothesis=e.target.value;hypothesisSkipped=false;navigation();onRecord();});
 $('#scene-choice').addEventListener('click',e=>{const b=e.target.closest('[data-story-option]');if(!b)return;const quiz=story.quizzes[step],selected=Number(b.dataset.storyOption),correct=selected===quiz.answer;answers[step]={selected,correct};render();$('#scene-choice').querySelector(`[data-story-option="${selected}"]`).focus({preventScroll:true});});
 $('#solution').addEventListener('toggle',()=>{if($('#solution').open&&!solved){assisted=true;navigation();}});
}
return {init,start,setMode(value){mode=value;if(story&&mode==='paper')$('#paper-story-body').innerHTML=printStory(false);render();},markSolved(){solved=true;navigation();},printStory,getHypothesis:()=>hypothesis};
})();
