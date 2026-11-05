# Testar o login sem liberar atividades

> Revisão documental temporariamente retirada do site. Identificação e contato neste roteiro são marcadores de revisão: não copiá-los para a configuração em produção. As cópias de revisão são mantidas fora do repositório; não reinserir dados pessoais, evidências brutas ou PDFs sem conferência.

Enquanto as políticas estão em revisão, o caminho é testar apenas o acesso das duas contas do próprio responsável. Não usar esta etapa com alunos. `EDU_ACTIVITIES_ENABLED` fica **false** por padrão; o servidor bloqueia jogos, PDFs e arquivos educacionais mesmo após autenticar. A tela só confirma o login e oferece saída. O bloqueio continua valendo se alguém tentar uma URL direta.

## Separação entre conteúdo aberto e acesso reservado

Diretriz atualizada em 5 de novembro de 2026: manter as atividades educativas públicas e usar login somente para funções ou materiais que tenham necessidade definida de restrição. A Educação no GitHub Pages continua aberta. O portal Render permanece em teste técnico, com atividades bloqueadas; a implementação agora prepara permissões distintas de professor e administrador, com páginas de conferência de acesso. O painel ainda não edita o site, publica arquivos ou altera contas. Essas operações exigem implementação e armazenamento próprios.

Um recurso reservado deve ficar fora do repositório e dos artefatos públicos, com autorização conferida no servidor antes de cada entrega. A escolha deve ser feita por recurso: não retirar toda a Educação nem modificar seu link para o portal de teste. O setor de revisão documental e seus downloads continuam retirados. O histórico e cópias já publicados não são apagados por essa separação.

## Resultado registrado em 4 de novembro de 2026

Origem de referência: [ENDEREÇO PÚBLICO DO PROJETO] . O responsável reportou status ready/mode auth-test e confirmou login, autorização, saída e novo acesso. A correção da política Referrer-Policy para same-origin está em 22b4af2; ela permite validar o Origin do POST sem aceitar origem null. A origem anterior não é o destino para novos testes. As duas contas da lista inicial já apresentaram Login reconhecido segundo o responsável. A captura posterior também confirmou Atividades ainda não liberadas ao acessar a Batalha Naval na mesma aba autenticada. No teste solicitado de PDF com sessão ativa, o responsável também enviou captura da tela de atividades bloqueadas. A imagem registra o resultado visual relatado; não comprova isoladamente a URL, o estado da sessão ou o código HTTP. Revogação real e conta fora da lista permanecem pendentes. As atividades permanecem bloqueadas.

## Ordem segura no Render

1. Mantenha `EDU_ACTIVITIES_ENABLED=false` e `EDU_SUPERVISED_PILOT=true`.
2. Antes de preencher os avisos restantes, faça **Manual Deploy → Deploy latest commit**. Salvar variáveis ou reconstruir uma versão antiga não comprova que o novo bloqueio foi implantado.
3. Abra `/healthz`. A versão com este bloqueio informa `build: auth-test-gate-v1`. Se faltarem configurações, `status` permanece `setup`; isso é esperado.
4. Os campos de identidade já confirmados são `EDU_CONTROLLER_NAME=[RESPONSÁVEL A DEFINIR ANTES DA ADOÇÃO]` e `EDU_PRIVACY_CONTACT=[CONTATO A DEFINIR ANTES DA ADOÇÃO]`.
5. Para este teste restrito às próprias contas, o aviso operacional pode explicar sua finalidade sem apresentar a política como adotada. Os textos abaixo não são uma avaliação jurídica final e não servem para liberar o uso por alunos.

### EDU_LEGAL_BASIS_NOTICE — aviso do teste, não política final

> Teste técnico solicitado pelo responsável do projeto, limitado às suas próprias contas Google previamente autorizadas, para verificar autenticação, sessão e saída. Não há liberação para alunos, cadastro infantil ou registros individuais de aprendizagem nesta etapa. O fundamento e as condições aplicáveis ao uso educacional permanecem em revisão antes da sua adoção.

No modo `auth-test`, o site identifica esse texto como **Aviso do teste técnico**, não como declaração de fundamento legal aprovado. O nome da variável é preservado por compatibilidade. Não copiar esse texto para uma liberação de atividades.

### EDU_PROVIDER_NOTICE — fatos confirmados para o teste

> Google é usado para confirmar a identidade do adulto, com escopos openid e email. O serviço de hospedagem Render foi informado pelo responsável como localizado em [REGIÃO A CONFIRMAR NA CONFIGURAÇÃO]. A região do serviço não comprova todos os locais de tratamento, suporte, logs ou backups dos provedores. Contratos, retenção e condições de transferências pertinentes ao uso educacional ainda estão em revisão. Este teste não autoriza uso por alunos nem torna os rascunhos de privacidade vigentes.

6. Salve as variáveis mantendo o bloqueio das atividades em false. Aguarde o reinício/deploy. `/healthz` deve indicar `status: ready`, `mode: auth-test` e `build: auth-test-gate-v1`.
7. Entre pelo Google com cada conta inicial. O resultado esperado é **Login reconhecido**, com as atividades ainda bloqueadas. Use Sair e confira que a sessão terminou.
8. Ainda com sessão de teste, uma URL direta de jogo ou PDF deve retornar 403. Sem sessão, ela encaminha ao login. Nenhuma conta de teste foi criada automaticamente no Google ou adicionada à lista privada.

Liberar atividades será uma etapa separada, após concluir os documentos e as verificações. Não alterar `EDU_ACTIVITIES_ENABLED` para true como forma de contornar uma falha do login. O GitHub Pages público não é modificado por este teste.
