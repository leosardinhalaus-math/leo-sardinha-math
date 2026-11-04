// Remove only the paused document-review sector from a staged site artifact.
import {readFile,rm,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const reviewPublication=JSON.parse(await readFile(path.join(repository,'config/document-review.json'),'utf8'));
export function reviewPaths(settings=reviewPublication){
  return [...settings.directories,...settings.files].map(p=>{
    if(typeof p!=='string'||path.isAbsolute(p)||p.split('/').some(part=>!part||part==='.'||part==='..')||p.includes('\\'))throw Error('Invalid document-review path');
    return p;
  });
}
export async function filterDocumentReview(target,settings=reviewPublication){
  const root=await realpath(target);
  if(root===await realpath(repository))throw Error('Use a staged site directory, not the source repository');
  if(!settings.paused)return [];
  const removed=[];
  for(const relative of reviewPaths(settings)){
    const parts=relative.split('/');let safe=true;
    for(let i=1;i<parts.length;i++){
      try{if((await lstat(path.join(root,...parts.slice(0,i)))).isSymbolicLink())throw Error('Symlink in review parent path');}
      catch(e){if(e.code==='ENOENT'){safe=false;break}throw e;}
    }
    if(!safe)continue;
    const filename=path.join(root,relative);
    try{await lstat(filename)}catch(e){if(e.code==='ENOENT')continue;throw e;}
    await rm(filename,{recursive:true,force:true});removed.push(relative);
  }
  return removed;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
  if(!process.argv[2])throw Error('Provide the staged site directory');
  const removed=await filterDocumentReview(process.argv[2]);
  console.log(JSON.stringify({section:'document-review',paused:reviewPublication.paused,removed:removed.length}));
}
