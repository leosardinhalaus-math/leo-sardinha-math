// Roles are read from the private allowlist, never from a URL or Google claims.
export function reservedArea(pathname){
 if(pathname==='/admin'||pathname.startsWith('/admin/'))return 'admin';
 if(pathname==='/professores'||pathname.startsWith('/professores/'))return 'teacher';
 return null;
}
export function canAccessArea(role,area){
 return area==='admin'?role==='admin':area==='teacher'&&['teacher','admin'].includes(role);
}
export function areaLanding(area,{csrf,activitiesEnabled,role,esc}){
 const logout=`<form method="post" action="/auth/logout"><input type="hidden" name="csrf" value="${esc(csrf)}"><button type="submit">Sair desta sessão</button></form>`;
 if(area==='admin')return {
  title:'Administração · preparação',
  body:`<p>Seu acesso administrativo foi conferido no servidor.</p><dl><dt>Portal de atividades</dt><dd>${activitiesEnabled?'Atividades habilitadas na configuração':'Teste técnico; atividades bloqueadas'}</dd><dt>Materiais reservados</dt><dd>Publicação ainda não implementada neste painel.</dd><dt>Gestão de contas</dt><dd>A lista privada continua sendo mantida na hospedagem.</dd></dl><p>Este painel permite conferir o estado do acesso. Não altera contas, publica arquivos ou edita o site.</p><p><a href="/professores/">Área reservada de professores</a></p>${logout}`
 };
 return {
  title:'Professores · área reservada',
  body:`<p>Seu acesso à área reservada foi conferido. As atividades educativas públicas continuam disponíveis no site principal, sem este login.</p><p>Ainda não há materiais exclusivos publicados nesta área. Os rascunhos da revisão documental continuam retirados.</p>${role==='admin'?'<p><a href="/admin/">Administração</a></p>':''}${logout}`
 };
}
