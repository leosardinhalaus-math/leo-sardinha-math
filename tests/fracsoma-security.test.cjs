const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../jogos/laboratorio-digital-matematica/js/modulos/fracsoma/index.js'),'utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/\bexport\s+/g,'');

function mount(record){
 const handlers={},node={textContent:''},saved=new Map();
 const container={innerHTML:'',addEventListener:(name,fn)=>handlers[name]=fn,querySelector:selector=>{
  assert.equal(selector,'[data-fs-recorde]');return node;
 }};
 vm.runInNewContext(source+'\nmontar({});',{
  modulo:(_,config,body)=>body(container),
  ler:(key,fallback)=>key==='fracsoma-recorde'?record:fallback,
  salvar:(key,value)=>saved.set(key,value),concluir:()=>{},
  document:{dispatchEvent:()=>{}},CustomEvent:class{},queueMicrotask:()=>{}
 });
 return {container,node,handlers,saved};
}

const cases=[
 ['HTML string','<b>marcador-local</b>',0],['numeric string','12',0],['null',null,0],
 ['object',{},0],['array',[],0],['NaN',NaN,0],['Infinity',Infinity,0],
 ['negative',-1,0],['above maximum',81,0],['fractional',7.5,0],
 ['zero',0,0],['valid score',12,12],['maximum score',80,80]
];
for(const [name,value,expected] of cases)test('Frac-Soma record: '+name,()=>{
 const {container,node}=mount(value);
 assert.equal(node.textContent,String(expected));
 assert.ok(!container.innerHTML.includes('marcador-local'));
 assert.match(container.innerHTML,/data-fs-recorde/);
});
