# Plano de 20 passos — vídeo de lançamento e auditoria de segurança

Referência: vídeo enviado (21 s), título visível **“10 coisas para fazer ao colocar seu site no ar”**.

## Visível e identificável no vídeo
- Criar Perfil da Empresa no Google (relevante apenas se existir estabelecimento/atendimento elegível; não criar cadastro fictício).
- Configurar `robots.txt`.
- Configurar meta descriptions.
- Publicar `sitemap.xml`.
- Usar hospedagem confiável; menção promocional à MXC Digital **não implica obrigação de migrar**.

O vídeo curto não fornece conteúdo verificável de dez dicas distintas. Os passos complementares abaixo são recomendações técnicas deste projeto, não falas atribuídas ao vídeo.

## 20 passos, com resultado

### SEO / colocação no ar (PR #5)
1. [x] Confirmar presença de `robots.txt` na branch.
2. [x] Verificar permissões de rastreamento no teste automatizado.
3. [x] Detectar bloqueio global acidental de rastreamento.
4. [x] Validar formato e existência do `sitemap.xml`.
5. [x] Confirmar uso de HTTPS nas URLs declaradas.
6. [x] Verificar URLs únicas e caminhos locais existentes.
7. [x] Proibir inclusão da página de login/perfil no sitemap.
8. [x] Verificar meta descriptions nas seis páginas principais.
9. [x] Verificar Open Graph/Twitter e idioma `pt-BR`.
10. [ ] Confirmar domínio público real, fazer Search Console, prévia social e avaliar Perfil da Empresa no Google apenas se elegível.

### Segurança / pré-publicação (PR #4)
11. [x] Verificar que PR #4 permanece rascunho e fora da `main`.
12. [x] Criar teste para bloqueio de arquivos .env e credenciais.
13. [x] Verificar presença do detector de segredos atuais em CI.
14. [x] Verificar scanner de histórico e checkout completo.
15. [x] Verificar que logs do scanner não exibem valores de chaves.
16. [x] Testar paridade entre cópias do arquivo de autenticação do jogo.
17. [x] Testar que consultas públicas de perfil/estatísticas não usam `select=*`.
18. [x] Verificar política declarada de escrita negada no ranking Firebase (atenção: jogo usa Supabase).
19. [ ] Corrigir vulnerabilidades altas no lockfile e validar novo `npm audit` / execução funcional.
20. [ ] Validar policies RLS em Supabase ativo com contas de teste e somente então decidir publicação.

## Resultado e ressalvas
- O CI de SEO passou após a adição de verificações na branch. Não comprova indexação real ou domínio.
- No momento da elaboração, regressões de segurança do PR #4 estavam em execução; a auditoria de dependências tinha falhas altas conhecidas.
- Supabase estava inativo e tabelas indisponíveis; não se deve interpretar resposta vazia de advisors como validação de RLS.
- **Não mesclar/publicar automaticamente**: os passos 10, 19 e 20 são pré-requisitos externos/técnicos não concluídos.
