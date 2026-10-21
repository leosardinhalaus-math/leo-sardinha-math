const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

for(const folder of ['jogos/calculus-royale','jogos/calculus-royale-src/client/public']){
 for(const page of ['ranking','perfil'])test(folder+'/'+page+': page scripts coexist with the player API',async()=>{
  const elements=new Map(),network=[],tasks=[];
  const element=selector=>{
   if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',style:{}});
   return elements.get(selector);
  };
  const context=vm.createContext({
   window:{},document:{querySelector:element,querySelectorAll:()=>[]},
   localStorage:{getItem:()=>null},
   location:{origin:'https://example.github.io',pathname:'/perfil/',search:''},
   URLSearchParams,
   fetch:async(url,options)=>{network.push({url,options});return {ok:true,text:async()=> '[]'};}
  });
  vm.runInContext(fs.readFileSync(path.join(root,folder,'player.js'),'utf8'),context);
  const html=fs.readFileSync(path.join(root,folder,page,'index.html'),'utf8');
  for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(!/\bsrc\s*=/.test(match[1]))tasks.push(vm.runInContext(match[2],context));
  }
  await Promise.all(tasks);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof context.window.CalculusCloud.session,'function');
  assert.equal(vm.runInContext('typeof SUPABASE_KEY',context),'undefined');
  assert.ok(network.every(call=>!call.options.method||call.options.method==='GET'));
  if(page==='ranking')assert.match(element('#rank').innerHTML,/Ainda não há jogadores/);
  else assert.equal(network.length,0);
 });
}
