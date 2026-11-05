export const MATERIAL_BUCKET='education-teacher-materials';
const fields='id,title,description,school_year,math_topics,status,object_key,byte_size,sha256,revision,created_at,published_at';
export function createMaterialsStore(env,fetchImpl=fetch){
 if(!env.EDU_MATERIALS_SUPABASE_URL||!env.EDU_MATERIALS_SUPABASE_SECRET_KEY)return null;
 const url=new URL(env.EDU_MATERIALS_SUPABASE_URL),secret=env.EDU_MATERIALS_SUPABASE_SECRET_KEY;
 if(url.origin!==env.EDU_MATERIALS_SUPABASE_URL||url.protocol!=='https:'||!/^([a-z0-9]+)\.supabase\.co$/.test(url.hostname))throw Error('materials_config');
 // Modern secret keys go only in apikey. Legacy service_role JWTs also need Authorization.
 const headers={apikey:secret,...(secret.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+secret})};
 async function request(path,options={}){
  const response=await fetchImpl(url.origin+path,{...options,headers:{...headers,...options.headers},redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('materials_storage');
  return response;
 }
 const table='/rest/v1/education_materials';
 return {
  async verify(){const bucket=await(await request('/storage/v1/bucket/'+MATERIAL_BUCKET)).json();if(bucket.public!==false)throw Error('materials_public_bucket');},
  async list(admin,page=0){const qs=new URLSearchParams({select:fields,order:'created_at.desc,id.desc',limit:'21',offset:String(page*20)});if(!admin)qs.set('status','eq.published');return (await request(table+'?'+qs)).json();},
  async get(id,admin){const qs=new URLSearchParams({select:fields,id:'eq.'+id,limit:'1'});if(!admin)qs.set('status','eq.published');return (await(await request(table+'?'+qs)).json())[0]||null;},
  async create(row,bytes){
   await request('/storage/v1/object/'+MATERIAL_BUCKET+'/'+row.object_key,{method:'POST',headers:{'Content-Type':'application/pdf','x-upsert':'false','cache-control':'0'},body:bytes});
   try{await request(table,{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});}
   catch(error){try{await request('/storage/v1/object/'+MATERIAL_BUCKET,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[row.object_key]})})}catch{}throw error;}
  },
  async transition(id,revision,status){
   const old=status==='published'?'draft':'published',qs=new URLSearchParams({id:'eq.'+id,revision:'eq.'+revision,status:'eq.'+old,select:'id'});
   const response=await request(table+'?'+qs,{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status,revision:revision+1,published_at:status==='published'?new Date().toISOString():null})});
   return (await response.json()).length===1;
  },
  async download(key){
   const response=await request('/storage/v1/object/authenticated/'+MATERIAL_BUCKET+'/'+key);
   const limit=5*1024*1024,parts=[];let size=0;
   for await(const part of response.body){size+=part.length;if(size>limit)throw Error('materials_storage');parts.push(part);}
   return Buffer.concat(parts);
  }
 };
}
