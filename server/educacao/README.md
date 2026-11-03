# Educação — camada de acesso Google (preparada, não ativada)

Esta implementação precisa de servidor Node 22.16+ com HTTPS em um domínio novo, sem Service Workers preexistentes. GitHub Pages não executa este servidor e continua público. Nenhum botão ou redirecionamento no navegador é apresentado como proteção dos arquivos.

## Uso supervisionado preparado

Para o contexto de alunos a partir de 6 anos, o padrão agora é um piloto com entrada por adulto e apenas quatro atividades locais. Aplicações com cadastro próprio, nuvem ou leitores externos ficam bloqueadas na origem protegida. Veja [REVISAO_USO_SUPERVISIONADO.md](REVISAO_USO_SUPERVISIONADO.md) para limites, inventário, testes e pendências de ativação. Não foi implementado cadastro infantil ou coleta de consentimento parental.

## O que foi implementado

Google OAuth/OIDC com authorization code, PKCE S256, state e nonce de uso único; assinatura RS256 por JWKS do Google, emissor, audiência, expiração, horário e e-mail verificado. Só solicita `openid email`; não pede perfil, contatos, Gmail ou Drive. Credenciais ficam no ambiente do servidor. Tokens Google são descartados após a identidade ser validada.

Sessão opaca aleatória no servidor, cookie __Host Secure/HttpOnly/SameSite=Lax. Expira em 30 minutos de inatividade ou 8 horas absolutas. A lista privada de contas é relida em cada acesso: remover um e-mail bloqueia o acesso seguinte. Sem cadastro público, perfil público ou ranking. Não cria uma área administrativa Web: a manutenção da lista é função do operador do servidor.

Autorização para páginas, jogos, PDFs e arquivos; negação padrão, validação após realpath para evitar desvios por links simbólicos, proteção de diretórios internos e ausência de cache em respostas. Logout POST com verificação de origem e CSRF; sair não encerra a conta Google. Logs do aplicativo contêm apenas tipo de evento e horário, sem e-mail, IP, cookie, código OAuth ou token. O provedor de hospedagem pode manter logs próprios: sua configuração é parte da ativação.

O cabeçalho Service-Worker: script é recusado. A implantação exige origem nova: Service Workers antigos e caches offline podem contornar a nova restrição se a origem já estiver sob controle de um worker. Downloads previamente feitos e cópias públicas não podem ser revogados por este mecanismo. Progresso local de jogos não é apagado no logout; orientar uso de perfil de navegador separado em aparelhos compartilhados.

CSP atual protege base-uri, object-src e frame-ancestors. Não é uma política completa contra XSS: as atividades existentes contêm scripts inline e integrações externas, que precisam de auditoria individual. Não há alegação de auditoria integral ou conformidade jurídica certificada.

## Implantação guiada sem hospedagem existente

Foi adicionado um blueprint Render no plano Free e um roteiro em [ATIVAR_RENDER_GOOGLE.md](ATIVAR_RENDER_GOOGLE.md). O launcher inicia em modo restrito de configuração quando faltam campos obrigatórios: não serve atividades e não inicia OAuth. A exportação .edu-dist exclui arquivos internos, segredos com nomes reconhecidos e links simbólicos; não é um detector universal de dados pessoais. Conta Render e cliente Google ainda precisam ser configurados pelo titular.

## O que falta para ativar

1. Hospedagem com servidor/reverse proxy HTTPS, domínio novo e armazenamento seguro de configuração. Aplicar limites por IP e tamanho de requisição no proxy; o limite conservador da aplicação usa o IP da conexão, que pode ser o próprio proxy. Não confiar indiscriminadamente em X-Forwarded-For.
2. No Google Cloud, criar/selecionar cliente OAuth Web, definir tela de consentimento, origens e callback EXATO `https://NOVO-DOMINIO/auth/callback`. Para contas institucionais e Gmail, o tipo de público deve permitir ambas; em modo de teste, incluir explicitamente os usuários autorizados. A política da instituição pode exigir liberação pelo administrador.
3. Preencher as variáveis de .env.example no gerenciador de segredos. Não enviar o client secret pelo chat nem gravá-lo no Git. EDU_ALLOWLIST_FILE é caminho de JSON privado com um array de e-mails, fora de EDU_CONTENT_ROOT. Os dois e-mails informados foram mantidos somente em arquivo privado da sessão de trabalho, não neste repositório. Transferir por canal seguro ao servidor definitivo.
4. Preencher nome do responsável, contato, finalidades/fundamento legal e aviso dos operadores/transferências. O servidor recusa iniciar se esses campos estiverem vazios. Avaliar melhor interesse de crianças/adolescentes, fundamento legal adequado, necessidade, retenção, atendimento de direitos, contratos e transferências internacionais. Não usar consentimento genérico como justificativa universal; a decisão cabe ao responsável pelo tratamento, com assessoria quando necessária.
5. Executar `node server/educacao/server.mjs` atrás do proxy. Sessões ficam em memória: uma instância, reinício encerra sessões. Para múltiplas instâncias, usar armazenamento de sessões compartilhado com TTL e política de proteção própria.
6. Migrar a Educação e seus arquivos para a origem controlada e retirar as rotas públicas equivalentes da publicação GitHub Pages. Revisar também os fluxos de publicação: o workflow atual republica arquivos e não pode restaurar acidentalmente rotas retiradas. O repositório e sua história continuam públicos; nunca colocar dados pessoais ou segredos neles.
7. Adaptar integrações externas: TurboWarp não consegue buscar um .sb3 privado apenas por URL sem a sessão do usuário. Não tornar arquivos públicos para contornar isso. Os downloads autorizados continuam possíveis; a execução incorporada requer adaptação. GeoGebra e outros serviços têm suas próprias políticas de tratamento.
8. Testar no domínio definitivo: duas contas autorizadas, uma recusada, URL direta de jogo/PDF sem sessão, logout, revogação, expiração e tentativa de reutilizar callback. Só então anunciar o acesso como ativo.

## Revisão da infraestrutura anterior

Calculus Royale tem integração Supabase e alternativa Firebase preparada, ainda não ativada segundo docs/FIREBASE.md. Não se migraram usuários nem se alteraram regras/bancos. A chamada de advisors do Supabase retornou erro de projeto hibernado; não foi possível concluir auditoria de políticas do banco. O cliente legado guarda tokens em localStorage, uma superfície diferente da nova sessão HttpOnly. A proteção do portal não corrige automaticamente autorização e tratamento de dados de cada jogo.

## Verificação

`node --test tests/education-auth.test.cjs`: assinatura e claims, e-mail autorizado exato, negação de rotas diretas e desvios por symlink, headers, cookie, PKCE e callback falso. Testes usam dados fictícios, sem contas reais. Login real e implantação HTTPS ainda não foram testados, pois dependem da configuração Google e hospedagem. A suíte completa permanece disponível em `node --test tests/*.test.cjs`.

## Endereços externos e vínculo com a conta

A lista aceita e-mails simples de contas para as quais o Google é autoridade (Gmail ou claim hd de conta gerenciada). Para endereço de terceiro sem hd, exige entrada privada no formato `{ "email": "adulto@example.test", "sub": "identificador-estavel-conferido" }`. Não inserir um sub presumido, não publicar a lista e não enviar tokens pelo chat. O sub é usado para impedir que a autorização dependa apenas de uma caixa postal externa que possa mudar de titular. Entradas duplicadas ou incompletas são recusadas. Nenhuma conta real foi adicionada ou convertida nesta revisão.

## Etapa de teste do próprio responsável

O padrão agora é `EDU_ACTIVITIES_ENABLED=false`: mesmo uma sessão válida só chega à tela de diagnóstico do login. Jogos, PDFs e atividades continuam bloqueados no servidor. Isso separa testar OAuth de liberar conteúdo a alunos enquanto os documentos são revisados. A configuração e a ordem segura de atualização estão em [TESTE_TECNICO_LOGIN.md](TESTE_TECNICO_LOGIN.md). Não representa aprovação jurídica, publicação de política definitiva ou comprovação de consentimento.
