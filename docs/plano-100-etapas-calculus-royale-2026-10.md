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
- [ ] 4. Inventariar clientes Firebase
- [x] 5. Localizar integração Supabase
- [ ] 6. Relacionar páginas e jogos
- [ ] 7. Mapear dados pessoais coletados
- [ ] 8. Separar ambientes publicados e testes
- [ ] 9. Identificar dependências e versões
- [ ] 10. Documentar riscos e critérios de bloqueio

## Fase 2: Identidade e sessões

- [ ] 11. Revisar cadastro por e-mail
- [ ] 12. Revisar confirmação de e-mail
- [ ] 13. Revisar login e mensagens de erro
- [ ] 14. Revisar expiração de sessão
- [ ] 15. Revisar rotação de refresh token
- [ ] 16. Revisar logout remoto e local
- [ ] 17. Evitar tokens em URLs e logs
- [ ] 18. Proteger armazenamento de sessões
- [ ] 19. Testar usuário não autenticado
- [ ] 20. Testar usuário autenticado com token expirado

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

- [ ] 31. Validar dependências pinadas
- [ ] 32. Repetir npm audit
- [ ] 33. Executar testes Firestore Emulator
- [ ] 34. Checar regras por proprietário
- [ ] 35. Testar leitura pública permitida
- [ ] 36. Testar gravação anônima bloqueada
- [ ] 37. Testar alteração de dados de terceiros
- [ ] 38. Verificar índices Firestore
- [ ] 39. Checar segredo versus chave pública
- [ ] 40. Registrar resultados e versões testadas

## Fase 5: Pontuação e anti-trapaça

- [ ] 41. Modelar ameaças ao ranking
- [ ] 42. Separar estatísticas exibidas de confiáveis
- [ ] 43. Identificar cálculos manipuláveis no cliente
- [ ] 44. Definir evento legítimo de vitória
- [ ] 45. Criar contrato de submissão validável
- [ ] 46. Definir limites de frequência por jogador
- [ ] 47. Planejar idempotência das submissões
- [ ] 48. Planejar validação de progressão impossível
- [ ] 49. Projetar verificação no servidor
- [ ] 50. Testar rejeição de pontuação fraudulenta

## Fase 6: Segurança web

- [ ] 51. Auditar XSS nos perfis
- [ ] 52. Auditar XSS nos rankings
- [ ] 53. Auditar inserções HTML dinâmicas
- [ ] 54. Revisar URLs controladas por usuários
- [ ] 55. Revisar política CSP
- [ ] 56. Revisar dependências externas
- [ ] 57. Checar integridade de scripts terceiros
- [ ] 58. Checar cabeçalhos de segurança disponíveis
- [ ] 59. Checar vazamento de credenciais no histórico
- [ ] 60. Executar testes de regressão XSS

## Fase 7: Qualidade dos jogos

- [ ] 61. Testar entrada na arena
- [ ] 62. Testar escolha de personagem
- [ ] 63. Testar fidelidade visual das cartas
- [ ] 64. Testar nascimento permitido no mapa
- [ ] 65. Testar desbloqueio após queda de torre
- [ ] 66. Testar pontuação por vitória
- [ ] 67. Testar reinício sem duplicação
- [ ] 68. Testar salvamento offline
- [ ] 69. Testar sincronização após reconexão
- [ ] 70. Testar ranking com contas diferentes

## Fase 8: Compatibilidade e desempenho

- [ ] 71. Verificar viewport móvel
- [ ] 72. Verificar controles por toque
- [ ] 73. Testar navegadores desktop
- [ ] 74. Testar redução de movimento
- [ ] 75. Medir carregamento inicial
- [ ] 76. Auditar tamanho de assets
- [ ] 77. Checar erros JavaScript no console
- [ ] 78. Avaliar requests ao carregar partida
- [ ] 79. Revisar acessibilidade dos controles
- [ ] 80. Verificar modo sem conexão

## Fase 9: Documentação e LGPD

- [ ] 81. Atualizar mapa de dados tratados
- [ ] 82. Descrever finalidade das estatísticas
- [ ] 83. Revisar aviso de privacidade
- [ ] 84. Documentar tratamento de contas infantis
- [ ] 85. Definir período de retenção
- [ ] 86. Especificar exclusão de conta e dados
- [ ] 87. Documentar responsáveis por acessos
- [ ] 88. Documentar fluxo de incidentes
- [ ] 89. Registrar dependências e licenças
- [ ] 90. Atualizar wiki técnica com evidências

## Fase 10: Portões de liberação

- [ ] 91. Executar testes de unidade
- [ ] 92. Executar testes de regressão
- [ ] 93. Executar auditoria de dependências
- [ ] 94. Executar verificador de segredos
- [ ] 95. Executar teste de compilação
- [ ] 96. Validar login e logout reais
- [ ] 97. Validar perfil e ranking reais
- [ ] 98. Revisar alterações de banco antes da aplicação
- [ ] 99. Preparar rollback e notas de lançamento
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
