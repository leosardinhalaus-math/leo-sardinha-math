import {randomUUID,createHash} from 'node:crypto';
import {createMaterialsStore} from './materials-store.mjs';
import {sanitizePdf,MAX_PDF} from './materials-pdf.mjs';
const uuid='[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}';
const idPattern=new RegExp('^'+uuid+'$');
export function isMaterialsPath(p){return p==='/admin/materiais'||p.startsWith('/admin/materiais/')||p==='/professores/materiais'||p.startsWith('/professores/materiais/')}
class FormError extends Error{constructor(status,message){super(message);this.status=status}}
const fail=(status,message)=>{throw new FormError(status,message)};
async function body(req,limit){
 if(Number(req.headers['content-length'])>limit){req.resume();fail(413,'O arquivo excede o limite permitido.');}
 const parts=[];let size=0;
 for await(const part of req){size+=part.length;if(size<=limit)parts.push(part);}
 if(size>limit)fail(413,'O arquivo excede o limite permitido.');
 return Buffer.concat(parts);
}
function text(form,name,max,required=false){const value=form.get(name);if(typeof value!=='string'||value.trim().length>max||(/\p{Cc}/u.test(value.replace(/[\r\n\t]/g,''))))fail(400,'Confira os campos do material.');const clean=value.trim();if(required&&clean.length<3)fail(400,'Informe um título com pelo menos três caracteres.');return clean;}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export const materialStyle='<style>.materials label{display:block;margin:16px 0 6px;font-weight:650}.materials input:not([type=checkbox]):not([type=hidden]),.materials textarea{box-sizing:border-box;width:100%;max-width:100%;padding:10px;border:1px solid #8ba5b5;border-radius:6px;font:inherit}.materials button{font:inherit;cursor:pointer;padding:8px 14px;border-radius:6px;border:1px solid #075985;background:#075985;color:white}.materials article{border:1px solid #cddfe9;border-radius:10px;padding:18px;margin:20px 0;overflow-wrap:anywhere}.materials h2{font-size:1.3em}.materials .review{padding:14px;background:#fff7d9;border-radius:8px}.materials .status{font-size:.85em;color:#34566a}.materials small{display:block}.materials input[type=checkbox]{width:20px;height:20px;vertical-align:middle}.materials a:focus-visible,.materials button:focus-visible{outline:3px solid #b07b00;outline-offset:3px}</style>';
export function materialListHtml(rows,{admin,csrf,esc,page=0}){
 const base=admin?'/admin/materiais':'/professores/materiais';
 return rows.slice(0,20).map(row=>{
  if(!idPattern.test(row.id))throw Error('materials_storage');
  return `<article><p class="status">${admin?(row.status==='published'?'Publicado para professores':'Rascunho · somente administração'):'PDF reservado'}</p><h2>${esc(row.title)}</h2><p>${esc(row.description)}</p><p>${esc(row.school_year)}${row.math_topics?' · '+esc(row.math_topics):''}</p><p><a href="${base}/${row.id}/baixar">${admin?'Baixar PDF para conferir':'Baixar PDF'}</a></p>${admin?`<form method="post" action="/admin/materiais/${row.id}/${row.status==='published'?'retirar':'publicar'}"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="revision" value="${esc(row.revision)}">${row.status==='draft'?'<label><input type="checkbox" name="reviewed" value="yes" required> Conferi o PDF baixado, o conteúdo e os direitos de uso.</label>':''}<button type="submit">${row.status==='published'?'Retirar de publicação':'Publicar para professores'}</button></form>`:''}</article>`;
 }).join('')+(rows.length===0?'<p>Nenhum material disponível nesta página.</p>':'')+`<nav aria-label="Páginas de materiais">${page>0?`<a href="${base}?page=${page-1}">← Anterior</a> `:''}${rows.length>20?`<a href="${base}?page=${page+1}">Próxima →</a>`:''}</nav>`;
}
export function uploadHtml(csrf,esc){return `<h2>Preparar um novo material</h2><p>Envie um PDF de até 5 MB e 200 páginas. Ele será salvo como rascunho; professores só terão acesso depois da publicação.</p><form method="post" action="/admin/materiais/enviar" enctype="multipart/form-data"><input type="hidden" name="csrf" value="${esc(csrf)}"><label for="material-title">Título</label><input id="material-title" name="title" maxlength="120" minlength="3" required><label for="material-description">Apresentação do material</label><textarea id="material-description" name="description" maxlength="1200" rows="3"></textarea><label for="material-year">Ano ou público sugerido</label><input id="material-year" name="school_year" maxlength="100" placeholder="Ex.: 6º ano do Fundamental"><label for="material-topics">Conteúdos matemáticos</label><input id="material-topics" name="math_topics" maxlength="200" placeholder="Ex.: frações e equivalências"><label for="material-file">Arquivo PDF</label><input id="material-file" name="file" type="file" accept="application/pdf,.pdf" required><p class="review">Não inclua dados de alunos, senhas ou documentos internos. Revise também o conteúdo e os metadados. A preparação automática retira metadados básicos e recusa recursos interativos; não substitui sua revisão do documento.</p><label><input type="checkbox" name="privacy_reviewed" value="yes" required> Revisei o conteúdo, não incluí dados pessoais ou segredos e tenho direito de disponibilizar o material.</label><p><button type="submit">Salvar como rascunho</button></p></form>`}
export function createMaterialsHandler(env,{fetchImpl=fetch}={}){
 return async(req,res,ctx)=>{
  const {pathname,url,role,s,origin,esc,shell,send,go,reauthorize,audit}=ctx,admin=role==='admin';
  const base=pathname.startsWith('/admin/')?'/admin/materiais':'/professores/materiais';
  try{
   const listPath=pathname===base||pathname===base+'/',upload=pathname==='/admin/materiais/enviar',download=pathname.match(new RegExp('^'+base+'/('+uuid+')/baixar$')),change=pathname.match(new RegExp('^/admin/materiais/('+uuid+')/(publicar|retirar)$'));
   if(!listPath&&!upload&&!download&&!change)return send(res,404,'Não encontrado.');
   if(!(['GET','HEAD'].includes(req.method)&&(listPath||download))&&!(req.method==='POST'&&(upload||change)))return send(res,405,'Método não permitido.');
   if((upload||change)&&!admin)return send(res,403,'Permissão insuficiente.');
   if(req.method==='POST'&&req.headers.origin!==origin)return send(res,403,'Origem inválida.');
   if(env.EDU_MATERIALS_ENABLED!=='true')return send(res,403,shell('Materiais ainda não liberados','<p>A publicação de materiais reservados permanece desativada.</p>'));
   const store=createMaterialsStore(env,fetchImpl);if(!store)throw Error('materials_config');
   // No public bucket is accepted, even if someone changed its setting out of band.
   await store.verify();
   if(listPath){
    const value=url.searchParams.get('page')||'0';if(!/^\d{1,4}$/.test(value))fail(400,'Página inválida.');
    const page=Number(value),rows=await store.list(admin,page);
    if(req.method==='HEAD'){res.writeHead(200);return res.end();}
    const notices=admin?{uploaded:'Rascunho salvo. Baixe e confira antes de publicar.',published:'Material publicado para professores autorizados.',withdrawn:'Material retirado de publicação. Cópias já baixadas permanecem com quem as recebeu.'}:{};
    const message=notices[url.searchParams.get('notice')];
    return send(res,200,shell(admin?'Publicar materiais':'Materiais para professores',materialStyle+`<div class="materials">${message?`<p role="status">${message}</p>`:''}<p>${admin?'<a href="/admin/">← Administração</a>':'<a href="/professores/">← Área de professores</a>'}</p>${admin?uploadHtml(s.csrf,esc):'<p>Materiais reservados para seu planejamento. Evite incluir dados de alunos nas cópias utilizadas.</p>'}<h2>${admin?'Rascunhos e publicações':'Materiais publicados'}</h2>${materialListHtml(rows,{admin,csrf:s.csrf,esc,page})}</div>`));
   }
   if(download){
    const row=await store.get(download[1],admin);if(!row)return send(res,404,'Não encontrado.');
    if(row.object_key!==row.id+'.pdf'||!Number.isInteger(row.byte_size)||row.byte_size>MAX_PDF)throw Error('materials_storage');
    const bytes=await store.download(row.object_key);
    if(bytes.length!==row.byte_size||hash(bytes)!==row.sha256)throw Error('materials_storage');
    // Access is checked again after the remote read, before delivering any bytes.
    const current=await store.get(row.id,admin);if(!current||(!admin&&current.status!=='published'))return send(res,404,'Não encontrado.');
    if(!await reauthorize(admin?'admin':'teacher'))return send(res,403,'Acesso não autorizado.');
    res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="material-'+row.id+'.pdf"','Content-Length':bytes.length,'Content-Security-Policy':"sandbox; default-src 'none'"});
    return res.end(req.method==='HEAD'?undefined:bytes);
   }
   let form;
   if(upload){
    if(!/^multipart\/form-data;\s*boundary=/i.test(req.headers['content-type']||''))fail(400,'Envie o formulário com um arquivo PDF.');
    const bytes=await body(req,MAX_PDF+65536);
    try{form=await new Request('https://form.invalid',{method:'POST',headers:{'Content-Type':req.headers['content-type']},body:bytes}).formData()}catch{fail(400,'Formulário inválido.');}
   }else{if(!(req.headers['content-type']||'').startsWith('application/x-www-form-urlencoded'))fail(400,'Formulário inválido.');form=new URLSearchParams((await body(req,4096)).toString('utf8'));}
   if(typeof form.get('csrf')!=='string'||!ctx.equal(form.get('csrf'),s.csrf))return send(res,403,'Solicitação inválida.');
   if(!await reauthorize('admin'))return send(res,403,'Permissão insuficiente.');
   if(upload){
    const title=text(form,'title',120,true),description=text(form,'description',1200),school_year=text(form,'school_year',100),math_topics=text(form,'math_topics',200),file=form.get('file');
    if(form.get('privacy_reviewed')!=='yes')fail(400,'Confirme a revisão do conteúdo e dos direitos de uso.');
    if(!file||typeof file.arrayBuffer!=='function'||file.size===0||file.size>MAX_PDF||!file.name?.toLowerCase().endsWith('.pdf')||!['application/pdf','application/octet-stream',''].includes(file.type))fail(400,'Escolha um PDF de até 5 MB.');
    let pdf;try{pdf=await sanitizePdf(Buffer.from(await file.arrayBuffer()))}catch(error){if(error.message==='pdf_busy')fail(429,'Há PDFs em preparação. Aguarde e tente novamente.');fail(400,'Não foi possível preparar o PDF. Use um PDF simples, sem formulários, assinaturas, anexos ou ações interativas.');}
    if(!await reauthorize('admin'))return send(res,403,'Permissão insuficiente.');
    const id=randomUUID();await store.create({id,title,description,school_year,math_topics,status:'draft',object_key:id+'.pdf',byte_size:pdf.length,sha256:hash(pdf)},pdf);
    audit('material_draft_created');return go(res,'/admin/materiais?notice=uploaded');
   }
   const value=form.get('revision');if(!/^[1-9]\d{0,8}$/.test(value||''))fail(400,'Versão inválida.');
   const published=change[2]==='publicar';if(published&&form.get('reviewed')!=='yes')fail(400,'Confira o PDF antes de publicar.');
   if(!await store.transition(change[1],Number(value),published?'published':'draft'))fail(409,'O material mudou em outra aba. Atualize a lista antes de continuar.');
   audit(published?'material_published':'material_withdrawn');return go(res,'/admin/materiais?notice='+(published?'published':'withdrawn'));
  }catch(error){
   if(error instanceof FormError)return send(res,error.status,shell('Confira o material',`<p>${esc(error.message)}</p><p><a href="${base}">Voltar aos materiais</a></p>`));
   audit('material_service_unavailable');return send(res,503,shell('Materiais temporariamente indisponíveis','<p>O armazenamento precisa estar configurado e disponível. Nenhum acesso público foi liberado.</p>'));
  }
 };
}
