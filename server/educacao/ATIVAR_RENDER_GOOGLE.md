# Ativação guiada — Render e Google

> Revisão documental temporariamente retirada do site. Identificação e contato neste roteiro são marcadores de revisão: não copiá-los para a configuração em produção. As cópias de revisão são mantidas fora do repositório; não reinserir dados pessoais, evidências brutas ou PDFs sem conferência.

Estado atualizado em 4 de novembro de 2026: serviço de referência [ENDEREÇO PÚBLICO DO PROJETO] em teste técnico. O responsável confirmou login com as duas contas iniciais, saída, novo acesso e bloqueio da Batalha Naval por URL direta na mesma aba autenticada. Plano do workspace Hobby e ausência de destino padrão em Log Streams conferidos por informação/captura. Os rascunhos chegaram a ser publicados para revisão e foram posteriormente retirados, junto de seus downloads; não são políticas vigentes.

As seções 1 a 3 abaixo são referência para manutenção ou reconstrução. Não recriar hospedagem, cliente OAuth ou segredos para repetir um teste já concluído. O serviço anterior não é o destino dos novos testes. Atividades permanecem bloqueadas: EDU_ACTIVITIES_ENABLED=false e EDU_SUPERVISED_PILOT=true. A implantação não restringe o GitHub Pages público ou seu histórico.

## Separação entre conteúdo aberto e acesso reservado

Diretriz atualizada em 5 de novembro de 2026: manter as atividades educativas públicas e usar login somente para funções ou materiais que tenham necessidade definida de restrição. A Educação no GitHub Pages continua aberta. O portal Render permanece em teste técnico, com atividades bloqueadas; a implementação agora prepara permissões distintas de professor e administrador, com páginas de conferência de acesso. O fluxo de publicação de PDFs está preparado, com armazenamento externo privado e ativação separada; veja MATERIAIS_RESERVADOS.md. O painel não edita o site nem altera contas.

Um recurso reservado deve ficar fora do repositório e dos artefatos públicos, com autorização conferida no servidor antes de cada entrega. A escolha deve ser feita por recurso: não retirar toda a Educação nem modificar seu link para o portal de teste. O setor de revisão documental e seus downloads continuam retirados. O histórico e cópias já publicados não são apagados por essa separação.

## 1. Criar a hospedagem gratuita de teste

Abra [ENDEREÇO PÚBLICO DO PROJETO] e entre/crie sua conta no Render. Confirme que o serviço `leo-[IDENTIFICAÇÃO REMOVIDA]-educacao` usa o plano **Free** antes de concluir. O blueprint não cria banco nem disco pago e desliga atualizações automáticas. Não selecione upgrade pago para seguir este roteiro.

O Render vai ler `render.yaml`, exportar apenas recursos web para `.edu-dist` e executar `launch.mjs`. A URL HTTPS será atribuída pelo próprio Render; o nome final pode variar. Esta URL é o próximo dado que deve ser informado ao assistente. Ela não é segredo.

Neste primeiro momento, o serviço mostra **Configuração em andamento** e retorna 503 para conteúdo e login. `/healthz` retorna `status: setup` somente para o monitor da hospedagem. A Educação NÃO está liberada nesse estado.

O plano gratuito é para o piloto com as contas iniciais: ele dorme após inatividade, e o reinício encerra sessões em memória. Há limites de recursos/tráfego do provedor. Não é uma promessa de serviço contínuo para turmas grandes. HTTPS e subdomínio `onrender.com` são fornecidos pelo serviço. Regras do plano devem ser conferidas no painel no momento da criação.

## 2. Configurar o Google Cloud

Acesse https://console.cloud.google.com/ e selecione/crie o projeto que ficará sob seu controle. A conta usada para administrar o projeto não precisa ser a única conta autorizada no site.

Na **Google Auth Platform** (ou APIs e Serviços → Tela de consentimento OAuth):

1. Preencha nome da aplicação, e-mail de suporte e contato do responsável.
2. Configure o público para permitir contas externas: uma aplicação interna de uma organização pode impedir o uso de contas Gmail. A conta institucional também pode depender da política do administrador da instituição.
3. Enquanto estiver em teste, adicione as duas contas iniciais como usuários de teste no painel do Google. Não coloque esses e-mails no repositório.
4. Em **Clients/Clientes**, crie um cliente OAuth do tipo **Web application/Aplicativo da Web**.
5. Em origens JavaScript autorizadas, informe a origem HTTPS do serviço Render, sem caminho.
6. Em URI de redirecionamento autorizada, informe exatamente `https://SEU-SERVICO.onrender.com/auth/callback`, usando a URL real. Não use curinga nem a URL do GitHub Pages.
7. Guarde o client ID e o client secret no painel seguro do Render, no passo seguinte. Não envie o secret no chat e não faça commit dele.

A aplicação solicita somente `openid email`. Não habilite Gmail, Drive ou Contatos para este login. Cadastro no Google como usuário de teste e autorização no site são controles diferentes; ambos precisam estar corretos.

## 3. Configurar os segredos no Render

No serviço → **Environment**, adicione estas variáveis, sem aspas adicionais:

| Variável | Conteúdo |
|---|---|
| EDU_GOOGLE_CLIENT_ID | Client ID do cliente Web criado no Google |
| EDU_GOOGLE_CLIENT_SECRET | Client secret, somente no painel de segredos |
| EDU_CONTROLLER_NAME | Nome/identificação real do responsável pelo tratamento |
| EDU_PRIVACY_CONTACT | Canal real para atender direitos e pedidos de privacidade |
| EDU_LEGAL_BASIS_NOTICE | Finalidades e fundamento legal definidos pelo responsável, incluindo avaliação aplicável a menores |
| EDU_PROVIDER_NOTICE | Provedores usados, localização/transferências relevantes e informações do tratamento |

A origem é obtida de `RENDER_EXTERNAL_URL`, fornecida pelo Render. Se houver domínio personalizado, configurar explicitamente EDU_ORIGIN e alterar também o callback no Google.

Ainda em Environment → **Secret Files**, crie `edu-allowlist.json` com um array JSON dos dois e-mails autorizados, por exemplo no formato `["conta1@dominio", "conta2@dominio"]`, substituindo pelos endereços reais já informados. O arquivo fica em `[CAMINHO PRIVADO OMITIDO]`, fora da raiz publicada. O exemplo neste documento não autoriza contas reais.

Salve e faça um novo deploy/reinício pelo painel. Não invente fundamento legal ou aviso de operadores só para preencher campos: os textos são apresentados aos usuários. O mecanismo técnico não certifica conformidade com a LGPD.

## 4. Conferir a origem de teste e qualquer recurso reservado

Na URL Render, verificar:

- Sem sessão, abrir diretamente Educação, um jogo e um PDF: deve encaminhar ao login, sem enviar o conteúdo.
- Entrar com cada conta autorizada e conferir Login reconhecido. No modo auth-test, jogos e PDFs continuam bloqueados mesmo depois do login.
- Quando houver uma conta adulta de teste disponível fora da lista, verificar a recusa. Um bloqueio pela configuração do Google não comprova recusa pela lista do portal; não criar contas ou ampliar a lista apenas para simular esse resultado.
- Sair da sessão e repetir URLs diretas. Testar expiração e remoção de uma conta da lista.
- Conferir a página de privacidade com os dados reais do responsável.
- Conferir os jogos: a origem nova recusa Service Workers, e o leitor externo TurboWarp precisa de adaptação para arquivos privados; não liberar `.sb3` publicamente como atalho.

Manter o link Educação apontando para o conteúdo público. Para qualquer recurso especificamente escolhido como reservado, concluir sua conferência antes de disponibilizá-lo no servidor e removê-lo dos artefatos públicos atuais. Revisar os workflows para que não o publiquem de novo. O portal de teste não deve substituir a navegação pública. A história pública do repositório e cópias anteriores não se tornam privadas com a criação do serviço novo.

## Verificação automatizada complementar

node scripts/probe-education.mjs verifica publicamente o serviço v2, sem iniciar OAuth ou usar conta real. Exige health ready/auth-test e os marcadores de versão, verifica GET/HEAD em rotas privadas, sessão inválida, ausência de cache e recusa de caminhos internos. Uma mudança inesperada para activities faz a verificação falhar; a expectativa só deve mudar junto de uma liberação deliberada e revisada.

O teste automatizado não confirma idade, vínculo parental, contratos ou a autenticação de cada conta real. O teste da segunda conta e o bloqueio do jogo autenticado já foram confirmados pelo responsável. Em qualquer teste adicional de conta real, compartilhar somente a mensagem final, nunca callback, código, token ou cookie.

## Fontes de configuração

- https://render.com/docs/web-services
- https://render.com/docs/free
- https://render.com/docs/blueprint-spec
- https://render.com/docs/configure-environment-variables
- https://developers.google.com/identity/openid-connect/openid-connect
