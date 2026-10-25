# Dez verificações antes da publicação — 2026-10-24

**Decisão: NÃO mesclar.** A autorização está condicionada à resolução de bloqueadores técnicos.

1. **Estado do PR #4:** aberto, rascunho; alterações em branch separada.
2. **Security regressions:** workflow aprovado no commit 5b66bdc.
3. **Secret exposure guard:** workflow aprovado no mesmo commit; cobertura apenas dos arquivos atuais.
4. **Git history secret audit:** workflow aprovado no mesmo commit; limitada às referências recuperadas no checkout, não cobre forks e clones.
5. **Dependências Calculus Royale:** 2 vulnerabilidades HIGH, identificadas em `source-map-js` e `vite`; logs recomendam `npm audit fix`, ainda não aplicado e testado.
6. **Dependências ferramentas Firebase:** 11 alertas (6 HIGH, 5 MODERATE); alguns caminhos automáticos usam `npm audit fix --force` com mudanças incompatíveis. Não executar atualizações destrutivas sem testes.
7. **Projeto Supabase:** projeto `Calculus Royale` ref `vmblubjbgwhaplsptymj`, status **INACTIVE** na consulta conectada.
8. **Acesso real às tabelas:** tentativa `list_tables` não conseguiu acessar o banco; autorização RLS em produção não pôde ser confirmada.
9. **Advisors de segurança Supabase:** consulta respondeu sem avisos, mas **não** comprova RLS válida porque o banco se encontra inacessível.
10. **Gate de liberação:** auditoria de dependências configurada para todas as PRs; mesmo com outros checks verdes, bloquear merge até corrigir vulnerabilidades e validar RLS.

## Próximas correções técnicas obrigatórias
- Atualizar lockfile das dependências com instalação reproduzível e executar testes de build, browser e jogo.
- Para ferramentas Firebase, planejar atualização major compatível em branch isolada, sem usar `--force` cegamente.
- Restaurar/verificar projeto Supabase apenas com avaliação explícita das consequências operacionais; não foi restaurado.
- Conferir policies das tabelas `player_profiles`, `game_stats` e tabelas de progresso usando identidades A/B/anon em um ambiente ativo.
- Não armazenar ou registrar chaves privadas no frontend, repositório ou logs.
- Reexecutar pipelines após as correções e exigir aprovação final.

**Nenhuma alteração no banco de dados ou publicação na main foi executada.**
