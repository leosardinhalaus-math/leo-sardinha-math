const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const {PDFDocument,PDFName,PDFString}=require('../server/educacao/node_modules/pdf-lib');
async function pdfBytes(active=false){const pdf=await PDFDocument.create();pdf.addPage().drawText('Atividade de fracoes');pdf.setAuthor('PRIVATE_METADATA_FIXTURE');pdf.setTitle('ORIGINAL_TITLE_FIXTURE');pdf.context.lookup(pdf.context.trailerInfo.Info).set(PDFName.of('Author'),pdf.context.register(PDFString.of('PRIVATE_METADATA_FIXTURE')));const metadata=pdf.context.register(pdf.context.stream('<xmp>PRIVATE_XMP_FIXTURE</xmp>',{Type:'Metadata',Subtype:'XML'}));pdf.catalog.set(PDFName.of('Metadata'),metadata);if(active)pdf.catalog.set(PDFName.of('OpenAction'),pdf.context.obj({S:PDFName.of('JavaScript'),JS:PDFString.of('app.alert(1)')}));return Buffer.from(await pdf.save())}
test('PDFs são regravados sem metadados básicos; ações interativas e arquivos falsos são recusados',async()=>{
 const {sanitizePdf}=await import('../server/educacao/materials-pdf.mjs');const clean=await sanitizePdf(await pdfBytes());
 const loaded=await PDFDocument.load(clean,{updateMetadata:false});assert.equal(loaded.getAuthor(),undefined);assert.equal(loaded.getTitle(),undefined);assert.equal(loaded.getPageCount(),1);assert(!clean.includes(Buffer.from('PRIVATE_METADATA_FIXTURE')));assert(!clean.includes(Buffer.from('PRIVATE_XMP_FIXTURE')));assert(!loaded.catalog.has(PDFName.of('Metadata')));
 await assert.rejects(sanitizePdf(await pdfBytes(true)));await assert.rejects(sanitizePdf(Buffer.from('%PDF-invalid')));await assert.rejects(sanitizePdf(Buffer.alloc(5*1024*1024+1)));
});
test('envio, rascunho, revisão, publicação, retirada e revogação são protegidos em HTTP',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'edu-materials-')),site=path.join(dir,'site'),list=path.join(dir,'allowed.json');await fs.mkdir(site);await fs.writeFile(path.join(site,'educacao.html'),'EDUCATION');await fs.writeFile(path.join(site,'index.html'),'PUBLIC');
 const accountList=[{email:'admin@example.test',role:'admin'},{email:'teacher@example.test',role:'teacher'}];await fs.writeFile(list,JSON.stringify(accountList));
 const rows=new Map(),objects=new Map();let publicBucket=false,failInsert=false,revokeOnDownload=false;
 const backend=http.createServer(async(req,res)=>{try{
  assert.equal(req.headers.apikey,'sb_secret_fixture');assert.equal(req.headers.authorization,undefined);
  const u=new URL(req.url,'http://backend.test'),parts=[];for await(const part of req)parts.push(part);const bytes=Buffer.concat(parts),json=()=>JSON.parse(bytes||'{}');
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data))};
  if(u.pathname==='/storage/v1/bucket/education-teacher-materials')return send(200,{public:publicBucket});
  if(u.pathname.startsWith('/storage/v1/object/authenticated/')){const key=u.pathname.split('/').pop();if(revokeOnDownload)await fs.writeFile(list,JSON.stringify([accountList[0]]));if(!objects.has(key))return send(404,{});res.writeHead(200,{'Content-Type':'application/pdf'});return res.end(objects.get(key));}
  if(u.pathname==='/storage/v1/object/education-teacher-materials'&&req.method==='DELETE'){for(const key of json().prefixes)objects.delete(key);return send(200,{});}
  if(u.pathname.startsWith('/storage/v1/object/education-teacher-materials/')&&req.method==='POST'){const key=u.pathname.split('/').pop();if(objects.has(key))return send(409,{});objects.set(key,bytes);return send(200,{});}
  if(u.pathname==='/rest/v1/education_materials'){
   if(req.method==='POST'){if(failInsert)return send(500,{});const row={revision:1,created_at:new Date().toISOString(),...json()};rows.set(row.id,row);return send(201,{});}
   const matches=[...rows.values()].filter(row=>(!u.searchParams.has('id')||'eq.'+row.id===u.searchParams.get('id'))&&(!u.searchParams.has('status')||'eq.'+row.status===u.searchParams.get('status'))&&(!u.searchParams.has('revision')||'eq.'+row.revision===u.searchParams.get('revision')));
   if(req.method==='PATCH'){for(const row of matches)Object.assign(row,json());return send(200,matches.map(row=>({id:row.id})));}
   const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||21);return send(200,matches.slice(offset,offset+limit));
  }
  return send(404,{});
 }catch(error){res.writeHead(500);res.end('test backend error');}});
 await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve));const backendUrl='http://127.0.0.1:'+backend.address().port;
 const mock=path.join(dir,'mock.mjs');await fs.writeFile(mock,`import{generateKeyPairSync,sign}from'node:crypto';const nativeFetch=globalThis.fetch,{privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048}),key={...publicKey.export({format:'jwk'}),kid:'test',use:'sig',alg:'RS256'};globalThis.fetch=async(url,options)=>{const target=String(url);if(target.startsWith('https://fixture.supabase.co/'))return nativeFetch(${JSON.stringify(backendUrl)}+new URL(target).pathname+new URL(target).search,options);if(target.endsWith('/certs'))return Response.json({keys:[key]});if(target.endsWith('/token')){const code=new URLSearchParams(options.body).get('code'),[nonce,name]=code.split(':'),now=Math.floor(Date.now()/1000),h=Buffer.from(JSON.stringify({alg:'RS256',kid:'test'})).toString('base64url'),b=Buffer.from(JSON.stringify({iss:'https://accounts.google.com',aud:'test-client',nonce,sub:'id-'+name,email:name+'@example.test',email_verified:true,hd:'example.test',iat:now,exp:now+300})).toString('base64url');return Response.json({id_token:h+'.'+b+'.'+sign('RSA-SHA256',Buffer.from(h+'.'+b),privateKey).toString('base64url')})}throw Error('Unexpected request')};`);
 let child,base;
 async function start(enabled='true'){
  const port=24000+Math.floor(Math.random()*10000);base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,['--import',mock,'server/educacao/server.mjs'],{env:{...process.env,EDU_ORIGIN:'https://education.example.test',EDU_PORT:String(port),EDU_BIND:'127.0.0.1',EDU_CONTENT_ROOT:site,EDU_ALLOWLIST_FILE:list,EDU_GOOGLE_CLIENT_ID:'test-client',EDU_GOOGLE_CLIENT_SECRET:'oauth-fixture',EDU_PRIVACY_CONTACT:'contact@example.test',EDU_CONTROLLER_NAME:'Test controller',EDU_LEGAL_BASIS_NOTICE:'Test notice',EDU_PROVIDER_NOTICE:'Test providers',EDU_SUPERVISED_PILOT:'true',EDU_ACTIVITIES_ENABLED:'false',EDU_MATERIALS_ENABLED:enabled,EDU_MATERIALS_SUPABASE_URL:'https://fixture.supabase.co',EDU_MATERIALS_SUPABASE_SECRET_KEY:'sb_secret_fixture'},stdio:'ignore'});
  for(let i=0;i<100;i++){try{await fetch(base+'/healthz');return}catch{await new Promise(resolve=>setTimeout(resolve,30))}}throw Error('Server startup');
 }
 async function stop(){if(child){const process=child;child=null;process.kill();await new Promise(resolve=>process.once('exit',resolve));}}
 async function login(name){let r=await fetch(base+'/auth/google',{redirect:'manual'});const google=new URL(r.headers.get('location')),flow=r.headers.getSetCookie()[0].split(';')[0];r=await fetch(base+'/auth/callback?'+new URLSearchParams({state:google.searchParams.get('state'),code:google.searchParams.get('nonce')+':'+name}),{redirect:'manual',headers:{cookie:flow}});assert.equal(r.status,303);const cookie=r.headers.getSetCookie().find(x=>x.startsWith('__Host-edu-session=')).split(';')[0];r=await fetch(base+'/educacao.html',{headers:{cookie}});const csrf=(await r.text()).match(/name="csrf" value="([^"]+)"/)[1];return {cookie,csrf};}
 const get=(p,user,method='GET')=>fetch(base+p,{method,redirect:'manual',headers:user?{cookie:user.cookie}:{}});
 function upload(user,pdf,patch={}){const form=new FormData();for(const[k,v]of Object.entries({title:'Frações: roteiro',description:'Um material reservado',school_year:'6º ano',math_topics:'Frações equivalentes',csrf:user.csrf,privacy_reviewed:'yes',...patch}))form.set(k,v);form.set('file',new Blob([pdf],{type:'application/pdf'}),'atividade.pdf');return fetch(base+'/admin/materiais/enviar',{method:'POST',redirect:'manual',headers:{cookie:user.cookie,Origin:'https://education.example.test'},body:form});}
 const transition=(id,action,user,revision,extra={},origin='https://education.example.test')=>fetch(base+'/admin/materiais/'+id+'/'+action,{method:'POST',redirect:'manual',headers:{cookie:user.cookie,Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf:user.csrf,revision:String(revision),reviewed:'yes',...extra})});
 try{
  await start();let admin=await login('admin'),teacher=await login('teacher');const pdf=await pdfBytes();
  assert.equal((await get('/admin/materiais')).status,303);assert.equal((await get('/professores/materiais')).status,303);
  assert.equal((await upload(teacher,pdf)).status,403);assert.equal((await upload(admin,pdf,{csrf:'wrong'})).status,403);assert.equal((await upload(admin,pdf,{privacy_reviewed:'no'})).status,400);assert.equal((await upload(admin,await pdfBytes(true))).status,400);
  let r=await upload(admin,pdf);assert.equal(r.status,303);assert.match(r.headers.get('location'),/notice=uploaded/);assert.equal(rows.size,1);const id=[...rows.keys()][0];
  const download='/professores/materiais/'+id+'/baixar';assert.equal((await get(download,teacher)).status,404);r=await get('/professores/materiais',teacher);assert(!((await r.text()).includes('Frações: roteiro')));
  r=await get('/admin/materiais/'+id+'/baixar',admin);assert.equal(r.status,200);assert.match(r.headers.get('content-disposition'),/^attachment/);const clean=Buffer.from(await r.arrayBuffer());assert.equal((await PDFDocument.load(clean,{updateMetadata:false})).getAuthor(),undefined);
  assert.equal((await transition(id,'publicar',teacher,1)).status,403);assert.equal((await transition(id,'publicar',admin,1,{},'https://other.example.test')).status,403);assert.equal((await transition(id,'publicar',admin,1,{csrf:'wrong'})).status,403);assert.equal((await transition(id,'publicar',admin,1,{reviewed:'no'})).status,400);
  assert.equal((await transition(id,'publicar',admin,1)).status,303);assert.equal((await transition(id,'publicar',admin,1)).status,409);
  r=await get(download,teacher);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(Buffer.from(await r.arrayBuffer()).length,rows.get(id).byte_size);assert.equal((await get(download,teacher,'HEAD')).status,200);
  await stop();await start();admin=await login('admin');teacher=await login('teacher');assert.equal((await get(download,teacher)).status,200,'data survives app restart through external storage');
  publicBucket=true;assert.equal((await get(download,teacher)).status,503);publicBucket=false;
  const stored=objects.get(id+'.pdf');objects.set(id+'.pdf',Buffer.from('corrupted'));assert.equal((await get(download,teacher)).status,503);objects.set(id+'.pdf',stored);
  assert.equal((await transition(id,'retirar',admin,2)).status,303);assert.equal((await get(download,teacher)).status,404);assert.equal((await get('/admin/materiais/'+id+'/baixar',admin)).status,200);
  failInsert=true;assert.equal((await upload(admin,pdf)).status,503);assert.equal(objects.size,1,'failed metadata insert compensates upload');failInsert=false;
  assert.equal((await transition(id,'publicar',admin,3)).status,303);revokeOnDownload=true;assert.equal((await get(download,teacher)).status,403);revokeOnDownload=false;await fs.writeFile(list,JSON.stringify(accountList));
  await stop();await start('false');admin=await login('admin');assert.equal((await get('/admin/materiais',admin)).status,403);assert.equal((await upload(admin,pdf)).status,403);assert.equal((await get('/jogos/batalha-naval/',admin)).status,403);
 }finally{await stop();await new Promise(resolve=>backend.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
});
