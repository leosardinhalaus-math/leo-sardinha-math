# Educação — acesso Google em teste técnico

> Revisão documental temporariamente retirada do site. Identificação e contato neste roteiro são marcadores de revisão: não copiá-los para a configuração em produção. As cópias de revisão são mantidas fora do repositório; não reinserir dados pessoais, evidências brutas ou PDFs sem conferência.

Esta implementação precisa de servidor Node 22.16+ com HTTPS em um domínio novo, sem Service Workers preexistentes. GitHub Pages não executa este servidor e continua público. Nenhum botão ou redirecionamento no navegador é apresentado como proteção dos arquivos.

## Separação entre conteúdo aberto e acesso reservado

Diretriz atualizada em 5 de novembro de 2026: manter as atividades educativas públicas e usar login somente para funções ou materiais que tenham necessidade definida de restrição. A Educação no GitHub Pages continua aberta. O portal Render permanece em teste técnico, com atividades bloqueadas; a implementação agora prepara permissões distintas de professor e administrador, com páginas de conferência de acesso. O painel ainda não edita o site, publica arquivos ou altera contas. Essas operações exigem implementação e armazenamento próprios.

Um recurso reservado deve ficar fora do repositório e dos artefatos públicos, com autorização conferida no servidor antes de cada entrega. A escolha deve ser feita por recurso: não retirar toda a Educação nem modificar seu link para o portal de teste. O setor de revisão documental e seus downloads continuam retirados. O histórico e cópias já publicados não são apagados por essa separação.

## Uso supervisionado preparado

Para o contexto de alunos a partir de 6 anos, o padrão agora é um piloto com entrada por adulto e apenas quatro atividades locais. Aplicações com cadastro próprio, nuvem ou leitores externos ficam bloqueadas na origem protegida. Veja [REVISAO_USO_SUPERVISIONADO.md](REVISAO_USO_SUPERVISIONADO.md) para limites, inventário, testes e pendências de ativação. Não foi implementado cadastro infantil ou coleta de consentimento parental.

## O que foi implementado

Google OAuth/OIDC com authorization code, PKCE S256, state e nonce de uso único; assinatura RS256 por JWKS do Google, emissor, audiência, expiração, horário e e-mail verificado. Só solicita `openid email`; não pede perfil, contatos, Gmail ou Drive. Credenciais ficam no ambiente do servidor. Tokens Google são descartados após a identidade ser validada.

Sessão opaca aleatória no servidor, cookie __Host Secure/HttpOnly/SameSite=Lax. Expira em 30 minutos de inatividade ou 8 horas absolutas. A lista privada de contas é relida em cada acesso: remover um e-mail bloqueia o acesso seguinte. Sem cadastro público, perfil público ou ranking. As páginas reservadas de conferência são /admin/ e /professores/. A administração é somente de consulta nesta etapa; a manutenção da lista continua sendo função do operador do servidor.

Autorização para páginas, jogos, PDFs e arquivos; negação padrão, validação após realpath para evitar desvios por links simbólicos, proteção de diretórios internos e ausência de cache em respostas. Logout POST com verificação de origem e CSRF; sair não encerra a conta Google. Logs do aplicativo contêm apenas tipo de evento e horário, sem e-mail, IP, cookie, código OAuth ou token. O provedor de hospedagem pode manter logs próprios: sua configuração é parte da ativação.

O cabeçalho Service-Worker: script é recusado. A implantação exige origem nova: Service Workers antigos e caches offline podem contornar a nova restrição se a origem já estiver sob controle de um worker. Downloads previamente feitos e cópias públicas não podem ser revogados por este mecanismo. Progresso local de jogos não é apagado no logout; orientar uso de perfil de navegador separado em aparelhos compartilhados.

Os cabeçalhos do portal não substituem a revisão de cada atividade e integração. Não há alegação de auditoria integral ou conformidade jurídica certificada.

## Implantação guiada sem hospedagem existente

Foi adicionado um blueprint Render no plano Free e um roteiro em [ATIVAR_RENDER_GOOGLE.md](ATIVAR_RENDER_GOOGLE.md). O launcher inicia em modo restrito de configuração quando faltam campos obrigatórios: não serve atividades e não inicia OAuth. A exportação .edu-dist exclui arquivos internos, segredos com nomes reconhecidos e links simbólicos; não é um detector universal de dados pessoais. O serviço v2 e o cliente Google já foram configurados pelo titular. As seções de implantação são referência de manutenção, não instrução para recriar contas ou segredos.

## Referência de implantação e pendências de liberação

Hospedagem, cliente Google e variáveis do teste já estão configurados. Os itens abaixo descrevem requisitos e manutenção; não precisam ser refeitos só para ler a revisão. A liberação para alunos continua pendente. A revisão de provedores está preservada nas cópias privadas de trabalho, fora do repositório.

1. Hospedagem com servidor/reverse proxy HTTPS, domínio novo e armazenamento seguro de configuração. Aplicar limites por IP e tamanho de requisição no proxy; o limite conservador da aplicação usa o IP da conexão, que pode ser o próprio proxy. Não confiar indiscriminadamente em X-Forwarded-For.
2. No Google Cloud, criar/selecionar cliente OAuth Web, definir tela de consentimento, origens e callback EXATO `https://NOVO-DOMINIO/auth/callback`. Para contas institucionais e Gmail, o tipo de público deve permitir ambas; em modo de teste, incluir explicitamente os usuários autorizados. A política da instituição pode exigir liberação pelo administrador.
3. Preencher as variáveis de .env.example no gerenciador de segredos. Não enviar o client secret pelo chat nem gravá-lo no Git. EDU_ALLOWLIST_FILE é caminho de JSON privado com um array de e-mails, fora de EDU_CONTENT_ROOT. Os dois e-mails informados foram mantidos somente em arquivo privado da sessão de trabalho, não neste repositório. Transferir por canal seguro ao servidor definitivo.
4. Preencher nome do responsável, contato, finalidades/fundamento legal e aviso dos operadores/transferências. O servidor recusa iniciar se esses campos estiverem vazios. Avaliar melhor interesse de crianças/adolescentes, fundamento legal adequado, necessidade, retenção, atendimento de direitos, contratos e transferências internacionais. Não usar consentimento genérico como justificativa universal; a decisão cabe ao responsável pelo tratamento, com assessoria quando necessária.
5. Executar `node server/educacao/server.mjs` atrás do proxy. Sessões ficam em memória: uma instância, reinício encerra sessões. Para múltiplas instâncias, usar armazenamento de sessões compartilhado com TTL e política de proteção própria.
6. Manter a Educação e as atividades públicas no GitHub Pages. Se um material for escolhido como reservado, separar somente esse recurso da publicação pública e servi-lo pela origem controlada após autenticação e autorização. Conferir os fluxos de publicação para impedir sua reintrodução. O repositório e sua história continuam públicos; nunca colocar dados pessoais ou segredos neles.
7. Adaptar integrações externas: TurboWarp não consegue buscar um .sb3 privado apenas por URL sem a sessão do usuário. Não tornar arquivos públicos para contornar isso. Os downloads autorizados continuam possíveis; a execução incorporada requer adaptação. GeoGebra e outros serviços têm suas próprias políticas de tratamento.
8. Testar no domínio definitivo: duas contas autorizadas, uma recusada, URL direta de jogo/PDF sem sessão, logout, revogação, expiração e tentativa de reutilizar callback. Só então anunciar o acesso como ativo.

## Integrações fora do piloto

As aplicações não incluídas no piloto exigem avaliação específica de autenticação, finalidade, armazenamento e autorização. Os registros detalhados dessa avaliação ficam fora desta documentação pública. A camada de acesso do portal não substitui controles próprios de cada integração.

## Verificação

`node --test tests/education-auth.test.cjs`: assinatura e claims, e-mail autorizado exato, negação de rotas diretas e desvios por symlink, headers, cookie, PKCE e callback falso. Testes usam dados fictícios, sem contas reais. O responsável confirmou as duas contas iniciais e o bloqueio do jogo na mesma aba autenticada. A sondagem pública de 4 de novembro de 2026 verificou ready/auth-test, GET/HEAD privados, sessão inválida e recusa de caminhos internos no serviço v2. Esses resultados não completam as pendências jurídicas, revogação real ou conta fora da lista. A suíte completa permanece disponível em `node --test tests/*.test.cjs`.

## Endereços externos e vínculo com a conta

A lista aceita e-mails simples de contas para as quais o Google é autoridade (Gmail ou claim hd de conta gerenciada). Para endereço de terceiro sem hd, exige entrada privada no formato `{ "email": "[CONTATO A DEFINIR ANTES DA ADOÇÃO]", "sub": "identificador-estavel-conferido" }`. Não inserir um sub presumido, não publicar a lista e não enviar tokens pelo chat. O sub é usado para impedir que a autorização dependa apenas de uma caixa postal externa que possa mudar de titular. Entradas duplicadas ou incompletas são recusadas. Nenhuma conta real foi adicionada ou convertida nesta revisão.

## Etapa de teste do próprio responsável

O padrão agora é `EDU_ACTIVITIES_ENABLED=false`: mesmo uma sessão válida só chega à tela de diagnóstico do login. Jogos, PDFs e atividades continuam bloqueados no servidor. Isso separa testar OAuth de liberar conteúdo a alunos enquanto os documentos são revisados. A configuração e a ordem segura de atualização estão em [TESTE_TECNICO_LOGIN.md](TESTE_TECNICO_LOGIN.md). Não representa aprovação jurídica, publicação de política definitiva ou comprovação de consentimento.

## Permissões de administrador e professor

Veja [PAPEIS_ACESSO.md](PAPEIS_ACESSO.md). As entradas antigas da lista continuam válidas para professor, sem promoção automática a administrador. O papel é conferido na lista privada em cada requisição; parâmetros de URL, cabeçalhos e claims extras do Google não concedem privilégios. A atribuição explícita de administrador é feita pelo operador na hospedagem. Os caminhos /professor/ e /educacao.html do site público permanecem abertos no GitHub Pages.
