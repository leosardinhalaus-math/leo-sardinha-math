# Publicar materiais para professores

Implementação preparada para PDFs reservados. As atividades públicas e a revisão documental retirada não mudam. Não há envio de mensagens a terceiros nem criação automática de contas.

## Fluxo do painel

1. Um administrador entra pelo Google e abre Administração → Enviar, revisar e publicar materiais.
2. Preenche título, apresentação, ano/público e conteúdos matemáticos; envia um PDF e confirma a revisão do conteúdo e dos direitos.
3. O servidor prepara uma cópia do PDF e salva um **rascunho** no armazenamento privado. O nome original do arquivo não é armazenado.
4. O administrador baixa essa cópia, confere conteúdo e apresentação e confirma a publicação.
5. Professores autorizados veem somente materiais publicados. Cada download exige sessão e permissão atuais.
6. Retirar de publicação volta o material para rascunho. A retirada impede novas entregas, mas não recolhe cópias já baixadas. Não há exclusão definitiva pelo painel nesta versão.

## Limites dos PDFs

Até 5 MB e 200 páginas. O processamento roda em processo separado, com limite de tempo e de heap. Os metadados Info e referências Metadata são retirados e o arquivo é regravado. PDFs com ações interativas, formulários, anexos ou assinaturas identificados pelo parser são recusados. O arquivo entregue tem tamanho e SHA-256 conferidos.

Isso não é antivírus nem certificação de anonimização. Nomes, imagens, conteúdo visível, dados em estruturas não identificadas ou segredos no texto precisam de revisão humana. Evitar documentos internos e dados pessoais de estudantes. O administrador deve disponibilizar somente material com direitos de uso e distribuição adequados. A cópia preparada pode perder recursos do PDF original; conferi-la antes de publicar.

## Armazenamento permanente e privado

O Render Free não é usado para guardar arquivos ou catálogo. O adaptador usa um projeto Supabase escolhido pelo responsável, tabela `public.education_materials` e bucket privado `education-teacher-materials`. Nenhum projeto existente é selecionado automaticamente por nome.

O catálogo não contém nomes de contas, e-mails ou registros de alunos. Há somente dados do material, estado, versão e datas. Uma falha ao gravar o catálogo tenta retirar o objeto recém-enviado; se a compensação também falhar, o objeto permanece privado e deve ser conferido na manutenção do bucket. O painel não deve anunciar sucesso nesse caso.

## Configurar somente depois de escolher o projeto

1. Conferir organização, projeto e custos antes de criar recursos. Inspecionar tabelas, bucket e políticas existentes. Aplicar `materials-schema.sql` somente após confirmar o destino; ele cria nomes específicos e não altera tabelas de jogos. Não reaplicar se os objetos já existirem: conferir a implantação anterior primeiro.
2. A tabela tem RLS e privilégios revogados de anon/authenticated. O bucket é privado e uma política restritiva recusa operações diretas de anon/authenticated nesse bucket, inclusive diante de políticas permissivas de outros módulos. O acesso privilegiado do servidor é conferido pelo login Google e pela lista privada, não por claims enviados pelo navegador.
3. Criar uma chave secreta específica do backend no painel do projeto. Copiar a chave diretamente para o ambiente seguro do Render; nunca colocar a chave no Git, no chat, no HTML ou em variável pública. A chave tem privilégios amplos no projeto, o que favorece separar este portal de outros aplicativos.
4. No Render, configurar:

| Variável | Valor |
|---|---|
| EDU_MATERIALS_ENABLED | Manter false durante a preparação; true somente na ativação deliberada dos materiais |
| EDU_MATERIALS_SUPABASE_URL | Origem HTTPS do projeto escolhido, sem barra final |
| EDU_MATERIALS_SUPABASE_SECRET_KEY | Chave secreta do backend; chaves sb_secret usam apenas apikey |

5. O Build Command precisa ser `npm ci --prefix server/educacao && node server/educacao/export-site.mjs`. O Start Command continua `node server/educacao/launch.mjs`. Conferir o comando no serviço v2 criado manualmente: alterar o blueprint no Git não demonstra que o painel foi atualizado.
6. Atribuir explicitamente role admin ao responsável na lista privada, preservando vínculos sub já existentes. Entradas antigas não são promovidas automaticamente. Não ampliar acesso a terceiros para contornar a preparação.
7. Fazer o deploy manual do código novo. Manter EDU_ACTIVITIES_ENABLED=false e EDU_SUPERVISED_PILOT=true. A liberação dos materiais é independente da liberação de jogos no Render.

Se faltar configuração, ocorrer falha de armazenamento ou o bucket for público, não há entrega de materiais. O código não retorna URLs assinadas ou públicas: o servidor busca e envia os bytes após conferir acesso e estado da publicação.

## Conferência de implantação

Antes da ativação, verificar privilégios da tabela, RLS, política restritiva e public=false do bucket. Depois, com um PDF fictício, conferir rascunho, publicação e retirada; acesso negado de professor ao painel, acesso negado sem sessão, download autorizado e indisponibilidade após revogação. Conferir também recusa direta pelo Storage com chave pública e com sessão comum de outro aplicativo, se o projeto for compartilhado.

`node --test tests/education-materials.test.cjs` executa o fluxo com Google e backend de armazenamento simulados. Os testes mostram persistência fora do processo da aplicação e falhas fechadas, mas não comprovam a configuração do projeto real. Executar também a suíte `tests/education-*.test.cjs`.

Incluir o novo provedor e a finalidade no inventário e no aviso aplicável antes do uso real; definir retenção e rotina de backup. O bucket privado não é, sozinho, um backup independente. Não reabrir os downloads retirados da revisão documental para preencher esta biblioteca.
