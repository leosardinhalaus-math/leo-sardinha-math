/* Crivo segmentado: bits para ímpares; nenhum vetor com todos os primos. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PrimeLab=api})(typeof self!=='undefined'?self:globalThis,function(){
 'use strict';const MAX_N=100000000;
 function validate(text){const s=String(text).trim();if(!/^\d+$/.test(s))throw Error('Digite apenas algarismos: um inteiro de 2 até 100000000.');const b=BigInt(s);if(b<2n||b>BigInt(MAX_N))throw Error('Escolha um limite entre 2 e 100000000.');return Number(b)}
 function has(bits,i){return (bits[i>>3]&(1<<(i&7)))!==0}
 function set(bits,i){bits[i>>3]|=1<<(i&7)}
 function basePrimes(limit){const size=Math.max(0,Math.floor((limit-1)/2)),bits=new Uint8Array(Math.ceil(size/8));for(let i=0;2*i+3<=Math.sqrt(limit);i++){if(has(bits,i))continue;let p=2*i+3;for(let j=(p*p-3)/2;j<size;j+=p)set(bits,j)}let count=0;for(let i=0;i<size;i++)if(!has(bits,i))count++;const primes=new Uint32Array(count);for(let i=0,j=0;i<size;i++)if(!has(bits,i))primes[j++]=2*i+3;return {primes,flagBytes:bits.byteLength}}
 function isPrime(n){if(!Number.isSafeInteger(n)||n<2)return false;if(n===2)return true;if(n%2===0)return false;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true}
 function trial(n){let count=0,sum=0n;for(let i=2;i<=n;i++)if(isPrime(i)){count++;sum+=BigInt(i)}return {count,sum:sum.toString()}}
 function sieve(n,{segmentBytes=8192,compare=false,onProgress=()=>{}}={}){
  n=validate(n);if(![1024,8192,32768].includes(segmentBytes))throw Error('Tamanho de bloco inválido.');if(compare&&n>100000)throw Error('A comparação por divisões vai somente até 100000.');
  const clock=()=>typeof performance!=='undefined'?performance.now():Date.now(),start=clock(),base=basePrimes(Math.floor(Math.sqrt(n))),oddCount=Math.floor((n-1)/2),capacity=segmentBytes*8,flags=new Uint8Array(Math.ceil(Math.min(capacity,oddCount)/8)),binWidth=Math.ceil((n-1)/Math.min(20,n-1)),bins=new Uint32Array(Math.ceil((n-1)/binWidth)),gaps=new Uint32Array(33),first=new Uint32Array(100),tail=new Uint32Array(10);
  let count=0,sum=0n,previous=0,maxGap=0,maxGapPair=[],lastPercent=-1;
  function record(p){if(count<first.length)first[count]=p;tail[count%10]=p;count++;bins[Math.min(bins.length-1,Math.floor((p-2)/binWidth))]++;if(previous){const gap=p-previous;gaps[Math.min(32,gap)]++;if(gap>maxGap){maxGap=gap;maxGapPair=[previous,p]}}previous=p}
  record(2);sum=2n;
  for(let offset=0;offset<oddCount;offset+=capacity){const length=Math.min(capacity,oddCount-offset),low=3+2*offset,high=low+2*(length-1);flags.fill(0);
   for(const p of base.primes){if(p*p>high)break;let multiple=Math.max(p*p,Math.ceil(low/p)*p);if(multiple%2===0)multiple+=p;for(let i=(multiple-low)/2;i<length;i+=p)set(flags,i)}
   let subtotal=0;for(let i=0;i<length;i++)if(!has(flags,i)){const p=low+2*i;record(p);subtotal+=p}
   // MAX_N * capacity <= 2.63e13 < Number.MAX_SAFE_INTEGER; convert each exact subtotal before accumulating.
   sum+=BigInt(subtotal);const percent=Math.floor(100*(offset+length)/oddCount);if(percent!==lastPercent){lastPercent=percent;onProgress(percent)}
  }
  onProgress(100);const elapsed=clock()-start,tailValues=Array.from({length:Math.min(10,count)},(_,i)=>tail[(Math.max(0,count-10)+i)%10]),numericBytes=base.flagBytes+base.primes.byteLength+flags.byteLength+bins.byteLength+gaps.byteLength+first.byteLength+tail.byteLength;
  const result={n,count,sum:sum.toString(),elapsed,first:Array.from({length:Math.min(count,100)},(_,i)=>first[i]),tail:tailValues,bins:Array.from(bins),binWidth,gaps:Array.from(gaps),maxGap,maxGapPair,markBytes:base.flagBytes+flags.byteLength,numericBytes,basePrimeBytes:base.primes.byteLength,baselineBytes:n+1,segmentBytes,actualSegmentBytes:flags.byteLength};
  if(compare){const t=clock();result.trial=trial(n);result.trial.elapsed=clock()-t;result.agree=result.trial.count===count&&result.trial.sum===result.sum;if(!result.agree)throw Error('Os métodos produziram resultados diferentes.')}
  return result;
 }
 function lessonStep(n,marks,p){if(!Number.isInteger(n)||n<2||n>200)throw Error('A malha usa limites de 2 a 200.');const removed=[];for(let m=p*p;m<=n;m+=p){if(!marks[m]){marks[m]=p;removed.push(m)}}let next=p+1;while(next<=n&&marks[next])next++;return {removed,next,done:next*next>n}}
 return {MAX_N,validate,isPrime,basePrimes,sieve,trial,lessonStep};
});
