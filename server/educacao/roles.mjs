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
  title:'Administração',
  body:`<p>Seu acesso administrativo foi conferido no servidor.</p><dl><dt>Portal de atividades</dt><dd>${activitiesEnabled?'Atividades habilitadas na configuração':'Teste técnico; atividades bloqueadas'}</dd><dt>Materiais reservados</dt><dd><a href="/admin/materiais">Enviar, revisar e publicar materiais</a></dd><dt>Gestão de contas</dt><dd>A lista privada continua sendo mantida na hospedagem.</dd></dl><p>A publicação de PDFs tem um fluxo próprio de rascunho e revisão. A gestão de contas e a edição do site continuam fora deste painel.</p><p><a href="/professores/">Área reservada de professores</a></p>${logout}`
 };
 return {
  title:'Professores · área reservada',
  body:`<p>Seu acesso à área reservada foi conferido. As atividades educativas públicas continuam disponíveis no site principal, sem este login.</p><p><a href="/professores/materiais">Consultar materiais reservados</a>. Os rascunhos da revisão documental continuam retirados.</p>${role==='admin'?'<p><a href="/admin/">Administração</a></p>':''}${logout}`
 };
}
