const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const lessons=require('../laboratorio-scratch-geogebra/lessons.js');
test('os seis roteiros mantêm ação, código e conferência em todas as etapas',()=>{assert.equal(lessons.length,3);let count=0;for(const l of lessons)for(const tool of ['scratch','geogebra']){assert.equal(l[tool].length,6);for(const s of l[tool]){assert(s.action.trim().length>0);assert(s.check.trim().length>0);assert(s.code.trim().length>0);count++}}assert.equal(count,36)});
test('arquivos Scratch têm assets próprios íntegros e grafo de blocos consistente',()=>{execFileSync('python',['-c',`
import zipfile,json,hashlib
from pathlib import Path
for path in Path('laboratorio-scratch-geogebra/exemplos').glob('*.sb3'):
 with zipfile.ZipFile(path) as z:
  project=json.loads(z.read('project.json'))
  assert len(project['targets'])==2
  for target in project['targets']:
   for costume in target['costumes']:
    assert hashlib.md5(z.read(costume['md5ext'])).hexdigest()==costume['assetId']
   blocks=target['blocks']
   for id,b in blocks.items():
    if b['next']:
     assert b['next'] in blocks
     assert blocks[b['next']]['parent']==id
    if b['parent']:assert b['parent'] in blocks
    for v in b['inputs'].values():
     if v[0] in [2,3]:
      assert v[1] in blocks
      assert blocks[v[1]]['parent']==id
`],{cwd:require('node:path').join(__dirname,'..')})});
test('educação e matemática em papel oferecem acesso ao laboratório',()=>{for(const path of ['educacao.html','matematica-em-papel/index.html'])assert(fs.readFileSync(path,'utf8').includes('laboratorio-scratch-geogebra/'))});
