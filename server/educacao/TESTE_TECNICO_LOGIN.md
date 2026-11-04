# Testar o login sem liberar atividades

Enquanto as políticas estão em revisão, o caminho é testar apenas o acesso das duas contas do próprio responsável. Não usar esta etapa com alunos. `EDU_ACTIVITIES_ENABLED` fica **false** por padrão; o servidor bloqueia jogos, PDFs e arquivos educacionais mesmo após autenticar. A tela só confirma o login e oferece saída. O bloqueio continua valendo se alguém tentar uma URL direta.

## Resultado registrado em 4 de novembro de 2026

Origem de referência: https://leo-sardinha-educacao-v2.onrender.com . O responsável reportou status ready/mode auth-test e confirmou login, autorização, saída e novo acesso. A correção da política Referrer-Policy para same-origin está em 22b4af2; ela permite validar o Origin do POST sem aceitar origem null. A origem anterior não é o destino para novos testes. Não se afirma que ambas as contas, revogação e acesso de conta não autorizada tenham sido testados no Google real. As atividades permanecem bloqueadas.

## Ordem segura no Render

1. Mantenha `EDU_ACTIVITIES_ENABLED=false` e `EDU_SUPERVISED_PILOT=true`.
2. Antes de preencher os avisos restantes, faça **Manual Deploy → Deploy latest commit**. Salvar variáveis ou reconstruir uma versão antiga não comprova que o novo bloqueio foi implantado.
3. Abra `/healthz`. A versão com este bloqueio informa `build: auth-test-gate-v1`. Se faltarem configurações, `status` permanece `setup`; isso é esperado.
4. Os campos de identidade já confirmados são `EDU_CONTROLLER_NAME=Leonardo Sardinha` e `EDU_PRIVACY_CONTACT=leosardinhalaus@gmail.com`.
5. Para este teste restrito às próprias contas, o aviso operacional pode explicar sua finalidade sem apresentar a política como adotada. Os textos abaixo não são uma avaliação jurídica final e não servem para liberar o uso por alunos.

### EDU_LEGAL_BASIS_NOTICE — aviso do teste, não política final

> Teste técnico solicitado pelo responsável do projeto, limitado às suas próprias contas Google previamente autorizadas, para verificar autenticação, sessão e saída. Não há liberação para alunos, cadastro infantil ou registros individuais de aprendizagem nesta etapa. O fundamento e as condições aplicáveis ao uso educacional permanecem em revisão antes da sua adoção.

No modo `auth-test`, o site identifica esse texto como **Aviso do teste técnico**, não como declaração de fundamento legal aprovado. O nome da variável é preservado por compatibilidade. Não copiar esse texto para uma liberação de atividades.

### EDU_PROVIDER_NOTICE — fatos confirmados para o teste

> Google é usado para confirmar a identidade do adulto, com escopos openid e email. O serviço de hospedagem Render foi informado pelo responsável como localizado em Oregon (US West), Estados Unidos. A região do serviço não comprova todos os locais de tratamento, suporte, logs ou backups dos provedores. Contratos, retenção e condições de transferências pertinentes ao uso educacional ainda estão em revisão. Este teste não autoriza uso por alunos nem torna os rascunhos de privacidade vigentes.

6. Salve as variáveis mantendo o bloqueio das atividades em false. Aguarde o reinício/deploy. `/healthz` deve indicar `status: ready`, `mode: auth-test` e `build: auth-test-gate-v1`.
7. Entre pelo Google com cada conta inicial. O resultado esperado é **Login reconhecido**, com as atividades ainda bloqueadas. Use Sair e confira que a sessão terminou.
8. Ainda com sessão de teste, uma URL direta de jogo ou PDF deve retornar 403. Sem sessão, ela encaminha ao login. Nenhuma conta de teste foi criada automaticamente no Google ou adicionada à lista privada.

Liberar atividades será uma etapa separada, após concluir os documentos e as verificações. Não alterar `EDU_ACTIVITIES_ENABLED` para true como forma de contornar uma falha do login. O GitHub Pages público não é modificado por este teste.
