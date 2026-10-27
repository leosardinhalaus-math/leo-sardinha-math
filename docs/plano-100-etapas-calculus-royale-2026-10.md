# Calculus Royale — 100 etapas de segurança, qualidade e publicação

Estado inicial verificado em 2026-10-25: projeto Supabase `vmblubjbgwhaplsptymj` ACTIVE_HEALTHY; PR #4 em rascunho; nove checks do GitHub Actions verdes no commit `ff721dc34ee6eb2983dcc5ee2a173c6298578f70`.

## Regras de execução

- `[ ]` significa **pendente**, não concluído. A aprovação do usuário autoriza execução progressiva, não presume sucesso.
- Trabalhar na branch `auditoria-lgpd-video-2026-10`; manter `main` intacta até gates de release.
- Não registrar credenciais ou dados pessoais em artefatos; evitar novos custos e mudanças irreversíveis.
- Para cada alteração: risco, diff, testes, evidência, rollback, atualização da wiki.
- Publicação, restauração, exclusão de dados, alteração de pagamento e ações potencialmente custosas exigem checagem específica de impacto antes da execução.
- Distinção crucial: sincronização de dados do cliente não é pontuação confiável. Validação de ranking exige servidor.

## Fase 1: Inventário e diagnóstico

- [x] 1. Confirmar SHA e branch da PR
- [x] 2. Registrar checks do GitHub
- [x] 3. Verificar status do Supabase
- [x] 4. Inventariar clientes Firebase
- [x] 5. Localizar integração Supabase
- [x] 6. Relacionar páginas e jogos
- [x] 7. Mapear dados pessoais coletados
- [ ] 8. Separar ambientes publicados e testes
- [x] 9. Identificar dependências e versões
- [x] 10. Documentar riscos e critérios de bloqueio

## Fase 2: Identidade e sessões

- [x] 11. Revisar cadastro por e-mail
- [x] 12. Revisar confirmação de e-mail
- [x] 13. Revisar login e mensagens de erro
- [x] 14. Revisar expiração de sessão
- [x] 15. Revisar rotação de refresh token
- [x] 16. Revisar logout remoto e local
- [x] 17. Evitar tokens em URLs e logs
- [ ] 18. Proteger armazenamento de sessões
- [x] 19. Testar usuário não autenticado
- [x] 20. Testar usuário autenticado com token expirado

## Fase 3: Supabase e privilégios

- [x] 21. Inspecionar RLS em tabelas públicas
- [x] 22. Auditar políticas SELECT
- [x] 23. Auditar políticas INSERT
- [x] 24. Auditar políticas UPDATE
- [x] 25. Auditar políticas DELETE
- [x] 26. Inventariar GRANTs por papel
- [x] 27. Limitar projeções REST do cliente
- [ ] 28. Definir exposição mínima do ranking
- [ ] 29. Testar acesso cruzado entre jogadores
- [x] 30. Reexecutar security advisors

## Fase 4: Firebase e Firestore

- [x] 31. Validar dependências pinadas
- [x] 32. Repetir npm audit
- [x] 33. Executar testes Firestore Emulator
- [x] 34. Checar regras por proprietário
- [x] 35. Testar leitura pública permitida
- [x] 36. Testar gravação anônima bloqueada
- [x] 37. Testar alteração de dados de terceiros
- [x] 38. Verificar índices Firestore
- [x] 39. Checar segredo versus chave pública
- [x] 40. Registrar resultados e versões testadas

## Fase 5: Pontuação e anti-trapaça

- [x] 41. Modelar ameaças ao ranking
- [ ] 42. Separar estatísticas exibidas de confiáveis
- [x] 43. Identificar cálculos manipuláveis no cliente
- [x] 44. Definir evento legítimo de vitória
- [x] 45. Criar contrato de submissão validável
- [x] 46. Definir limites de frequência por jogador
- [x] 47. Planejar idempotência das submissões
- [x] 48. Planejar validação de progressão impossível
- [x] 49. Projetar verificação no servidor
- [ ] 50. Testar rejeição de pontuação fraudulenta

## Fase 6: Segurança web

- [x] 51. Auditar XSS nos perfis
- [x] 52. Auditar XSS nos rankings
- [ ] 53. Auditar inserções HTML dinâmicas
- [x] 54. Revisar URLs controladas por usuários
- [x] 55. Revisar política CSP
- [x] 56. Revisar dependências externas
- [x] 57. Checar integridade de scripts terceiros
- [ ] 58. Checar cabeçalhos de segurança disponíveis
- [x] 59. Checar vazamento de credenciais no histórico
- [x] 60. Executar testes de regressão XSS

## Fase 7: Qualidade dos jogos

- [ ] 61. Testar entrada na arena
- [ ] 62. Testar escolha de personagem
- [ ] 63. Testar fidelidade visual das cartas
- [x] 64. Testar nascimento permitido no mapa
- [ ] 65. Testar desbloqueio após queda de torre
- [ ] 66. Testar pontuação por vitória
- [ ] 67. Testar reinício sem duplicação
- [x] 68. Testar salvamento offline
- [ ] 69. Testar sincronização após reconexão
- [ ] 70. Testar ranking com contas diferentes

## Fase 8: Compatibilidade e desempenho

- [x] 71. Verificar viewport móvel
- [ ] 72. Verificar controles por toque
- [ ] 73. Testar navegadores desktop
- [ ] 74. Testar redução de movimento
- [ ] 75. Medir carregamento inicial
- [x] 76. Auditar tamanho de assets
- [ ] 77. Checar erros JavaScript no console
- [ ] 78. Avaliar requests ao carregar partida
- [ ] 79. Revisar acessibilidade dos controles
- [ ] 80. Verificar modo sem conexão

## Fase 9: Documentação e LGPD

- [x] 81. Atualizar mapa de dados tratados
- [x] 82. Descrever finalidade das estatísticas
- [x] 83. Revisar aviso de privacidade
- [ ] 84. Documentar tratamento de contas infantis
- [ ] 85. Definir período de retenção
- [ ] 86. Especificar exclusão de conta e dados
- [ ] 87. Documentar responsáveis por acessos
- [ ] 88. Documentar fluxo de incidentes
- [ ] 89. Registrar dependências e licenças
- [x] 90. Atualizar wiki técnica com evidências

## Fase 10: Portões de liberação

- [x] 91. Executar testes de unidade
- [x] 92. Executar testes de regressão
- [x] 93. Executar auditoria de dependências
- [x] 94. Executar verificador de segredos
- [x] 95. Executar teste de compilação
- [ ] 96. Validar login e logout reais
- [ ] 97. Validar perfil e ranking reais
- [ ] 98. Revisar alterações de banco antes da aplicação
- [x] 99. Preparar rollback e notas de lançamento
- [ ] 100. Liberar merge apenas com critérios atendidos

## Evidências existentes

- RLS habilitada em `public.player_profiles` e `public.game_stats`; políticas de INSERT/UPDATE condicionadas a `auth.uid() = user_id`.
- SELECT público atualmente permitido nessas tabelas: é preciso projetar e proteger a superfície pública antes de apertar privilégios sem quebrar ranking.
- Cliente Supabase já usa projeções explícitas nas consultas privadas da branch; a autenticação funcional de ponta a ponta ainda não foi comprovada.
- Risco aberto: pontuação calculada pelo cliente pode ser manipulada. Não marcar etapa 50 como concluída sem verificação no servidor.


## Acompanhamento — 2026-10-25, validação atual

**12/100 etapas verificadas documentalmente ou por inspeção técnica:** 1, 2, 3, 5, 21, 22, 23, 24, 25, 26, 27 e 30. Marcação significa que o exame correspondente foi realizado, não que o sistema seja totalmente seguro.

- GitHub: commit de referência `dced0697710d4db3359fb500a3d3850b6a715f84`, PR #4 draft, nove GitHub Actions completados com resultado success.
- Supabase: `public.player_profiles` e `public.game_stats` com RLS ligado, ambas vazias na consulta de resumo; `get_advisors(type=security)` retornou zero alertas.
- Políticas RLS revisadas: SELECT público para ambos os papéis; INSERT e UPDATE vinculados a `auth.uid() = user_id` com `WITH CHECK`; sem política DELETE identificada na inspeção anterior.
- GRANTs de leitura ampla inspecionados; desenho de mínimo privilégio **não implementado**. A etapa 28 permanece pendente.
- Integração Supabase localizada em `jogos/calculus-royale/player.js` e `jogos/calculus-royale-src/client/public/player.js`. Ambos idênticos e com projeções REST explícitas; isso **não reduz** as permissões do banco.
- Pendências críticas: validação real de autenticação e gravação (19, 20, 29, 96, 97), proteção contra falsificação de pontuação (41–50), eventual restrição de SELECT público (28).
- Alterações de banco em produção e fusão da PR não foram executadas nesta rodada.


## Correção de ranking — 2026-10-25

- Commit `96cc3c9dfd6dd157db7859e956f83ec1e269f955`: ranking agora busca perfis com filtro de `user_id` exclusivamente dos 100 resultados retornados, corrigindo a junção entre páginas independentes.
- Alteração replicada nos dois arquivos `jogos/calculus-royale/player.js` e `jogos/calculus-royale-src/client/public/player.js`; conteúdo idêntico verificado depois do commit.
- Confirmado em inspeção: consulta anterior de 100 perfis sem filtro eliminada; nova consulta restringe IDs e mantém seleção explícita.
- A regra de servidor sobre pontuações permanece pendente, assim como testes funcionais reais com diversas contas. Esta correção não libera as etapas 41–50 nem a etapa 97.
- CI: após commit, os checks `Dependency security audit`, `Secret exposure guard` e `Security regressions` foram aprovados; os demais ainda estavam em execução na última consulta.


## Continuação executada — 2026-10-25, validação de autenticação e arquitetura de pontuação

**Marcação de etapa [x] neste documento inclui inspeção, correção verificada, teste automatizado ou desenho técnico, conforme o verbo de cada etapa.** Não afirmar que todas as etapas marcadas possuem solução implantada em produção.

- **Cadastro e confirmação (11–12):** páginas `perfil/index.html` (cópia publicada e cópia fonte na branch) agora verificam `C.session()` depois do cadastro. Se não houver sessão, mostram a orientação para confirmar o e-mail. Cópias fonte/publicada mantidas juntas.
- **Sessões e login (13–17, 19–20):** `player.js` valida resposta de login antes de persistir, protege a renovação simultânea do refresh token, limpa sessões expiradas e preserva logout local offline. Testes em `tests/calculus-auth-security.test.cjs` executados pelo CI; são simulações unitárias, não testes de conta real no serviço.
- **Firebase (31–37, 39–40):** pacote `tools/firebase-tests/package.json` declara Firebase 13.0.0, ferramentas 15.34.0 e rules testing 6.0.0; o `package-lock.json` determina o conjunto instalado pelo CI. O emulador testa isolamento de salvamentos, restrição por dono, leitura pública delimitada, proibição de publicação do ranking por clientes e rejeição a campos extras. O resultado de CI é a evidência, não uma validação de Firebase em produção.
- **Riscos de pontuação (41,43,45–49):** `docs/contrato-ranking-verificado-calculus-royale.md` documenta ameaça de falsificação via `localStorage`, contrato provisório de submissão, desenho de idempotência, controles contra replay e arquitetura servidor autoritativa. **Essas etapas são de análise e desenho, não implementação.** As etapas 42,44,50 permanecem pendentes e a futura implantação exige inspeção do motor real de combate.
- **XSS e histórico (51,52,59,60):** escapes de nomes em perfil/ranking revisados; testes de regressão e varredura de segredos no histórico Git aprovados no commit anterior. Proteção completa contra scripts, dependências externas e vazamentos continua sujeita a análise adicional.
- **Classificação dos riscos:** prioridade P0: pontuação sem autoridade do servidor, exposição pública ampliada nas tabelas Supabase e falta de testes E2E com contas reais. Prioridade P1: armazenamento de credenciais em localStorage, staging segregado e validação em navegador móvel. Nenhum destes problemas deve ser tratado como resolvido só porque os testes unitários passaram.
- **Ambientes:** branch de auditoria distinta de main; backend Supabase **não** possui staging isolado confirmado. A etapa 8 permanece pendente.
- **Testes desta rodada:** Security regressions, Dependency security audit, Secret exposure guard, Git history secret audit e build/dependency gate já aprovados no commit do contrato; outros checks ainda em execução na última consulta. O resultado mais recente deve ser reconfirmado antes do merge.
- **Sem implantação:** não foram alteradas policies, migrations, autenticação real, dados de usuários, configurações de billing nem a versão de produção; PR #4 segue draft.

**Etapas sinalizadas no checklist até este registro: 45/100** (inclui as de desenho; não equivale a porcentagem de software pronto).


### Proteção complementar de logout concorrente — 2026-10-25

- Corrigida corrida entre renovação de sessão e logout: a cada saída ou novo login muda-se a geração lógica da sessão, impedindo que uma resposta atrasada do refresh restaure credenciais removidas.
- Logout agora remove tokens do armazenamento local **antes** de aguardar a chamada remota, inclusive quando esta estiver lenta/indisponível.
- Acrescentados testes de corrida em `tests/calculus-auth-security.test.cjs`: refresh atrasado após logout e limpeza imediata de tokens.
- Status: alteração apenas na branch PR #4; testes CI do commit `e2fb0ebaef3879ea979bd96cfaef9bc90d0f272d` ainda estavam rodando na última consulta. Nenhuma alegação de cobertura E2E de autenticação real.


## Rodada adicional — 25/10/2026, integridade do salvamento e privacidade

**Total com evidências: 52/100.** A marcação significa teste de unidade, inspeção documental ou desenho técnico quando aplicável; não implica implantação integral. Não confundir testes verdes com segurança completa.

### Correções implementadas na branch da auditoria

- Supabase: `ensureProfile` e `syncProgress` **não** anunciam êxito quando o servidor responde com lista vazia ou `user_id` diferente. Testes exercitam respostas confirmadas, vazias e inconsistentes em `tests/calculus-cloud-persistence-security.test.cjs`. Dados locais preservados em caso de falha.
- Sessões: tokens persistidos são validados antes do uso; erros transitórios de conexão, 503 ou 429 durante refresh **não** apagam o token de renovação. Erros definitivos de autenticação o invalidam. Testes de recuperação da conexão foram adicionados em `tests/calculus-auth-security.test.cjs`.
- URLs: `publicProfile(slug)` rejeita slugs malformados antes de formar filtros REST; os links do ranking continuam codificados adequadamente.
- Progressão: novo jogador começava com 12 vitórias fictícias. Corrigido para zero no `GameCanvas.tsx`, com teste estático de regressão em `scripts/test-progression.ts`. A correção não retroage sobre salvamentos já existentes.
- Integridade de números: `localProgress` transforma dados inválidos em inteiros não negativos e dentro de limites compatíveis com colunas Postgres; há testes de salvamento corrompido e normal. **Isso não impede um usuário de adulterar os números**, portanto não liberar ranking competitivo com base nisso.

### Evidências específicas das novas etapas marcadas

- **38 — índices Firestore:** `firestore.indexes.json` tem índice composto `completed_worlds DESC / xp DESC` em `leaderboard`; campos privados de progresso têm índices desligados. Não foram confirmados deploys em produção Firebase.
- **44 — evento legítimo de vitória:** a especificação em `docs/contrato-ranking-verificado-calculus-royale.md` relaciona `compareTowerHealth`, 180 s + até 60 s, simulação `stepCombat` de 100 ms e `finishBattle`. Trata-se de definição de evento e desenho, **não** de verificador de partidas implantado.
- **54 — parâmetro de URL:** validação de `public_slug` e regressão automática contra filtros arbitrários; manter inspeção de outras URLs do site.
- **64 — nascimento em zonas:** a suíte `test:combat` verifica `zoneAvailable` em zonas ocupadas, livres e inválidas; não há ainda teste físico de gesto de toque e Raycaster.
- **68 — salvamento offline:** a suíte `test:save` avalia envelope, migração e recuperação de JSON inválido; ainda falta simulação completa de PWA desconectado em um aparelho real.
- **81 — mapa de dados:** novo `docs/mapa-de-dados-calculus-royale-lgpd.md` diferencia Auth, perfis e estatísticas públicas, chaves locais, tokens e Firebase alternativo desligado.
- **83 — aviso de privacidade:** `privacidade.html` atualizado na branch para informar armazenamento local de tokens e que o provedor atualmente configurado é Supabase; permanece minuta em revisão sem alegação de conformidade. Teste em `tests/calculus-privacy-security.test.cjs`.

### Impedimentos mantidos

A classificação Supabase continua informal e **sem validação autoritativa de vitória**. Ainda falta ambiente de staging do banco, testes A/B com contas reais, restrição da exposição pública sem quebrar clientes, validação em celular/desktop, responsável LGPD e processo de exclusão/retensão. Todas as mudanças aqui documentadas ficam na PR #4, sem merge e sem escrita no banco nesta rodada.


## Continuação — 26/10/2026: regressão de HTML dinâmico em perfil e ranking

- **Implementado:** novo teste `tests/calculus-dynamic-html-security.test.cjs` no commit `37961a3f68c68c4ce53a214fa3283cbc9bda52f1`. Executa os controladores inline reais de `perfil/index.html` e `ranking/index.html` em DOM simulado, carregando a implementação real de `C.safe` de `player.js`.
- **Casos cobertos:** valores hostis em avatar, apelido, slug, troféus, vitórias, nível e XP com `<img onerror>` e `<svg onload>`; verifica que dados inseridos por `innerHTML` são escapados, que o título usa `textContent` e que o slug não injeta atributos no link do ranking.
- **Evidência CI:** no SHA `37961a3f68c68c4ce53a214fa3283cbc9bda52f1`, o job `Security regressions` (run `40316574141`, job `121550560238`) executou com sucesso `node --test tests/*security.test.cjs`. Os nove workflows da PR concluíram com `success`, incluindo compilação, dependências, Firestore e varredura de segredos.
- **Escopo e limites:** este teste protege os dois controladores examinados contra regressões específicas; não é navegador real, não prova ausência de XSS em todo o portal, não valida CSP nem pontuação autoritativa. **Etapa 53 continua pendente** até inventário e auditoria dos demais pontos de HTML dinâmico. **Total permanece 52/100**; não foi marcada nenhuma etapa nova sem cobertura integral.
- **Risco/rollback:** alteração exclusivamente de teste; caso cause falha espúria, reverter o commit do teste. Nenhuma mudança em Supabase de produção, cobrança, deploy, `main` ou política de segurança.


## Continuação de 26/10/2026 — rotas, testes de publicação e rollback

**Novo total: 62/100 etapas com evidências; 38 pendentes.** Inclui tarefas de auditoria e documentação, não é índice de segurança, nem afirma que a produção está pronta. PR #4 continua `draft`; `main` e políticas Supabase não foram alteradas.

### Falha real corrigida

- Em `index.html` e `educacao.html`, a CTA "Jogar versão Godot 3D" apontava para `jogos/calculus-royale-godot/`, mas o GitHub não continha `index.html` para esse destino na branch.
- Criado `jogos/calculus-royale-godot/index.html` com página responsiva, link à arena Three.js que já é jogável e informação honesta de desenvolvimento, **sem afirmar que Godot foi entregue**.
- Botões corrigidos para "Godot 3D · em desenvolvimento".
- Adicionado `tests/game-routes-security.test.cjs`, que verifica os destinos de jogo citados por `index.html` e `educacao.html`, a existência do HTML Godot, o rótulo e o link à arena ativa. Documento `docs/inventario-rotas-jogos-2026-10.md` reúne o inventário.

### Justificativa das etapas marcadas

- **6:** inventário das nove rotas de jogos anunciadas pelas páginas principais; 8 entradas verificadas originalmente e 1 destino Godot criado e testado.
- **71:** meta `viewport` identificada em todas as nove entradas inspecionadas. **Somente inspeção estática:** layout responsivo/touch físico continua pendente nas etapas 72–73.
- **82:** finalidade de estatísticas e identidade documentada em `docs/mapa-de-dados-calculus-royale-lgpd.md`, distinguindo perfil público, ranking informal e salvamento local/online.
- **90:** nova seção na `wiki.html` referencia plano, inventário, riscos do ranking, evidências e critérios de rollback; publicação depende de merge.
- **91–95:** Github Actions no commit `41d8770c1894e1e40f84a9bfb9359bd25cae9e6d` concluíram com `success` nos 9 workflows. Regressões e testes de segurança: run `40350076512`, job `121667404767`; build/TypeScript/progressão: run `40350076675`, job `121667405367`; auditoria de dependências: run `40350076622`, jobs `121667406624` e `121667407070`; histórico de segredos: run `40350076627`, job `121667406405`; `Secret exposure guard` também concluiu com `success`. Verificações valem para esse SHA; **documentação posterior não alterou código executável**, mas a PR exige a validação do SHA final antes do merge.
- **99:** `docs/rollback-e-criterios-lancamento-2026-10.md` contém gates pré-merge, plano de reversão por commit, manejo de incidentes, limitação de rollback de dados e notas provisórias de release.

### Bloqueadores preservados

Faltam segurança completa de armazenamento de sessão (18), minimização pública da API Supabase (28), testes A/B com usuários reais (29, 70, 96–97), **pontuação realmente verificada no servidor** (42, 50), auditoria integral de HTML dinâmico e CSP/recursos externos (53, 55–58), testes de jogabilidade em navegador/dispositivo e conexão instável (61–63, 65–67, 69, 72–80), definições finais LGPD (84–89) e autorização de merge condicionada (98, 100). Esses itens **não serão marcados como aprovados** por um teste de sintaxe, um documento, nem simulações unitárias.


## Rodada de 26/10/2026 — acessibilidade, sessões minimizadas e revisão de CSP

**Checklist: 65/100 etapas com evidência de correção, revisão ou documentação; 35 permanecem abertas.** A numeração não certifica segurança nem implantação em produção. **A PR #4 segue em rascunho**; não houve deploy, merge ou alteração do Supabase.

### Implementação e testes na branch

- **Acessibilidade do perfil:** rótulos `for` vinculados a e-mail, senha e apelido, mensagens de autenticação com `aria-live`, foco visível para teclado e apelido exemplar não identificável. As cópias `perfil/index.html` publicada/fonte foram mantidas sincronizadas.
- **Ranking:** as opções de ordenação agora comunicam `aria-pressed`, atualizada no clique. Foi detectada e corrigida uma regressão introduzida na primeira edição que havia trocado incorretamente o seletor de todos os botões pelo seletor de um só elemento. O teste integrado de regressão da PR confirmou a correção. A CI posterior ao conserto passou nos testes de segurança.
- **Preferência por movimento reduzido:** nova folha de acessibilidade importada ao final do bundle aplica foco de teclado e interrompe transições/animações cosméticas quando o sistema pede redução; em `scene.ts`, o motor 3D evita interpolação visual e mistura animada desnecessária, preservando a simulação de combate. `tests/calculus-accessibility-security.test.cjs` cobre o código e a presença de regras. **Etapa 74 permanece pendente** de validação visual em navegador real com a preferência ativada. Etapa 79 também permanece aberta para revisão de todos os controles do jogo.
- **Minimização de perfil na sessão:** `player.js` agora persiste somente `user.id` do objeto de Auth, sem e-mail, metadados nem identidades; sessões legadas com esses campos são migradas para o formato mínimo. Os tokens de autenticação ainda residem no `localStorage`, logo a **etapa 18 permanece aberta** até uma solução de proteção de sessão adequada.
- **Testes:** `tests/calculus-auth-security.test.cjs` valida remoção de e-mail/metadados tanto em novos logins quanto em sessões legadas. Todas as mudanças mantidas na branch, e fontes `player.js` duplicadas sincronizadas.

### Revisão de CSP e dependências externas (55–57)

`docs/revisao-csp-recursos-externos-calculus-2026-10.md` documenta:
- A ausência de CSP estrita implantada e os scripts/estilos inline que exigem refatoração antes da aplicação.
- Bundles do jogo na própria origem e Supabase como serviço ativo.
- Imports externos do `gstatic.com/firebasejs/13.0.0` na alternativa Firebase **desativada**, sem verificação de integridade de módulos configurada. É uma constatação de auditoria, não prova de comprometimento da CDN.
- Necessidade de testar CSP, CORS, scripts externos, offline, perfil, ranking e 3D antes de habilitar restrições. **Não** foi inventado hash SRI, nem aplicada política que quebrasse recursos.
- Não foi possível consultar diretamente os cabeçalhos HTTP do site por falha de DNS no ambiente; **etapa 58 permanece pendente**, assim como a aplicação efetiva de CSP.

### Evidência CI

- No SHA `c76e4e15243604efb40598e877651703cf85b354`, os testes de regressão, regras Firestore, dependências e gate de build passaram após restaurar o seletor correto do ranking.
- No SHA `4e61e1d2283f303988a02064dc042e7ef1d33631`, `Security regressions`, `Calculus Royale build and dependency gate`, `Dependency security audit`, `Secret exposure guard` e os demais jobs concluídos consultados estavam verdes. O workflow de artefato `Build Calculus Royale` ainda estava em fila no momento da consulta.
- Como novos commits de documentação podem disparar pipelines, **validar novamente o SHA final** antes da publicação. Falhas não devem ser dadas como aprovadas.

### Bloqueios intactos

Ainda é necessário implementar validação de pontuação pelo servidor, ambiente de teste, política mínima de leitura pública, teste de acesso entre contas A/B, login/ranking reais, segurança de sessão robusta, testes mobile e LGPD final. Não marcar passos pendentes sem comprovação.


## Continuação — 27/10/2026: auditoria de tamanho dos assets (validação pendente)

- **Mudança proposta na branch:** `scripts/audit-asset-sizes.mjs` percorre o `dist/public` gerado pelo Vite, registra os dez maiores arquivos, o volume total da distribuição e confere inventário, ausência de modelos GLB órfãos, limite de 1 MiB por GLB e 32 MiB para os 45 modelos somados.
- **Integração:** workflow `Build Calculus Royale` passa a executar a auditoria **após o build e a validação dos modelos**, sem publicar nem fazer deploy.
- **Verificação local limitada:** script exercitado com 45 arquivos sintéticos; caso normal passou e remoção de um GLB foi corretamente rejeitada. Isto **não** comprova tamanho dos assets reais; aguardar GitHub Actions antes de marcar a etapa 76.
- **Risco/rollback:** se o orçamento de tamanho falhar em assets legítimos, inspecionar medidas e revisar limites explicitamente; reversão restrita ao script e ao passo de CI. Não altera Supabase, pontuação, `main` nem dados de usuários.
- **Estado:** etapa 76 continua [ ] até confirmação do build completo no SHA desta alteração. O total permanece 65/100.

### Verificação concluída — 27/10/2026 (etapa 76)

- **Etapa 76 verificada e marcada [x]**, total atualizado para **66/100** (34 pendentes). Esta etapa significa **inventário e auditoria automatizada de tamanho**, não otimização concluída nem desempenho móvel aprovado.
- **Commit auditado:** `6ede8735357169e0cb4b3dbf184f9481af33b89e`. GitHub Actions `Build Calculus Royale`: run `40499170199`, job `122172214657`, step `Audit built asset sizes` **success** após `Build game` e `Validate generated GLB models` também aprovados. Os nove workflows associados ao SHA concluíram `success`.
- **Medições no log do CI:** **45 GLBs gerados = 20,48 MiB** (limite 32 MiB), **120 arquivos de distribuição = 26,00 MiB**; maior arquivo `assets/index-TrdF4SGH.js` = 0,98 MiB, maior GLB `power.glb` = 0,65 MiB. O script falha se algum GLB do manifesto faltar, houver GLB órfão, se um modelo exceder 1 MiB ou se a soma dos GLBs exceder 32 MiB.
- **Escopo:** `dist/public` no runner Linux, após geração dos modelos e das artes; o tamanho total é **informativo**, não significa 26 MiB transferidos na primeira visita. **Etapas 75, 77, 78 e testes de dispositivos continuam pendentes**: não há medição de tempo de carregamento, tráfego real ou WebGL em celular.
- **Evidências:** [execução CI](https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/40499170199), [script](https://github.com/leosardinhalaus-math/leo-sardinha-math/blob/auditoria-lgpd-video-2026-10/jogos/calculus-royale-src/scripts/audit-asset-sizes.mjs) e [workflow](https://github.com/leosardinhalaus-math/leo-sardinha-math/blob/auditoria-lgpd-video-2026-10/.github/workflows/build-calculus-royale.yml). Sem deploy, merge, cobrança ou mudança em Supabase.
