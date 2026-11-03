# Ativação guiada — Render e Google

Estado: pacote pronto; conta de hospedagem, domínio do serviço e cliente Google ainda não criados. Nenhuma área foi declarada privada ou retirada do GitHub Pages nesta etapa.

## 1. Criar a hospedagem gratuita de teste

Abra https://render.com/deploy?repo=https://github.com/leosardinhalaus-math/leo-sardinha-math e entre/crie sua conta no Render. Confirme que o serviço `leo-sardinha-educacao` usa o plano **Free** antes de concluir. O blueprint não cria banco nem disco pago e desliga atualizações automáticas. Não selecione upgrade pago para seguir este roteiro.

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

Ainda em Environment → **Secret Files**, crie `edu-allowlist.json` com um array JSON dos dois e-mails autorizados, por exemplo no formato `["conta1@dominio", "conta2@dominio"]`, substituindo pelos endereços reais já informados. O arquivo fica em `/etc/secrets/edu-allowlist.json`, fora da raiz publicada. O exemplo neste documento não autoriza contas reais.

Salve e faça um novo deploy/reinício pelo painel. Não invente fundamento legal ou aviso de operadores só para preencher campos: os textos são apresentados aos usuários. O mecanismo técnico não certifica conformidade com a LGPD.

## 4. Conferir antes de migrar

Na URL Render, verificar:

- Sem sessão, abrir diretamente Educação, um jogo e um PDF: deve encaminhar ao login, sem enviar o conteúdo.
- Entrar com cada conta autorizada e conferir as atividades.
- Entrar com uma terceira conta de teste: deve ser recusada pelo site mesmo após autenticar no Google.
- Sair da sessão e repetir URLs diretas. Testar expiração e remoção de uma conta da lista.
- Conferir a página de privacidade com os dados reais do responsável.
- Conferir os jogos: a origem nova recusa Service Workers, e o leitor externo TurboWarp precisa de adaptação para arquivos privados; não liberar `.sb3` publicamente como atalho.

Somente depois dessa conferência, alterar o link Educação no site principal e excluir as rotas equivalentes dos artefatos do GitHub Pages. Revisar os workflows para que não as publiquem de novo. A origem pública antiga e a história pública do repositório não se tornam privadas com a criação do serviço novo.

## Fontes de configuração

- https://render.com/docs/web-services
- https://render.com/docs/free
- https://render.com/docs/blueprint-spec
- https://render.com/docs/configure-environment-variables
- https://developers.google.com/identity/openid-connect/openid-connect
