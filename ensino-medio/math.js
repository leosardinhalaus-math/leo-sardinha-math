(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EMFunctions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function validate(p){
 if(!['linear','quadratic','exponential','logarithmic'].includes(p.family))throw Error('Escolha uma família de funções.');
 for(const k of ['a','b','c','q','min','max'])if(!Number.isFinite(p[k]))throw Error('Preencha todos os parâmetros com números finitos.');
 if(p.min>=p.max||Math.abs(p.min)>1000||Math.abs(p.max)>1000)throw Error('Use um intervalo crescente entre −1000 e 1000.');
 if(['a','b','c'].some(k=>Math.abs(p[k])>10000))throw Error('Use coeficientes entre −10000 e 10000.');
 if(['exponential','logarithmic'].includes(p.family)&&(p.q<=0||p.q===1||p.q>100))throw Error('A base deve ser positiva, diferente de 1 e no máximo 100.');
 if(p.family==='logarithmic'&&p.min<=0)throw Error('Para o logaritmo, todo o intervalo deve ter x > 0.');
}
function value(p,x){switch(p.family){case 'linear':return p.a*x+p.b;case 'quadratic':return p.a*x*x+p.b*x+p.c;case 'exponential':return p.a*p.q**x;case 'logarithmic':return Math.log(x)/Math.log(p.q);default:throw Error('Função desconhecida.');}}
function sample(p,count=161){validate(p);if(!Number.isInteger(count)||count<2||count>1000)throw Error('Quantidade de pontos inválida.');return Array.from({length:count},(_,i)=>{const x=p.min+(p.max-p.min)*i/(count-1),y=value(p,x);if(!Number.isFinite(y)||Math.abs(y)>1e12)throw Error('Os valores ficaram muito grandes. Reduza o intervalo ou os parâmetros.');return{x,y};});}
return{validate,value,sample};});
