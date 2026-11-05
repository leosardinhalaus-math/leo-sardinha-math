import {spawn} from 'node:child_process';
export const MAX_PDF=5*1024*1024;
let running=0;
export function sanitizePdf(bytes){
 if(bytes.length===0||bytes.length>MAX_PDF)return Promise.reject(Error('invalid_pdf'));
 if(running>=2)return Promise.reject(Error('pdf_busy'));
 running++;
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--max-old-space-size=128',new URL('./materials-pdf-worker.mjs',import.meta.url).pathname],{stdio:['pipe','pipe','ignore']});
  const chunks=[];let size=0,done=false;
  const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);running--;error?reject(error):resolve(result)};
  const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('invalid_pdf'))},8000);
  child.stdout.on('data',part=>{size+=part.length;if(size>MAX_PDF){child.kill('SIGKILL');finish(Error('invalid_pdf'))}else chunks.push(part)});
  child.on('error',()=>finish(Error('invalid_pdf')));
  child.stdin.on('error',()=>{});
  child.on('close',code=>code===0&&size?finish(null,Buffer.concat(chunks)):finish(Error('invalid_pdf')));
  child.stdin.end(bytes);
 });
}
