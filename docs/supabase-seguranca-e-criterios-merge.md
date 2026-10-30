# Revisão operacional Supabase e permissões — etapa 5

O frontend do Calculus Royale usa `provider: supabase`; portanto, `firestore.rules` não protege automaticamente as tabelas do Supabase.

## Verificação no projeto Supabase (somente com acesso autorizado)
- Confirmar se RLS está habilitada em **todas** as tabelas expostas via REST: `player_profiles`, `game_stats`, `player_progress` (ou nomes equivalentes em produção).
- Conferir permissões de `anon` e `authenticated` por tabela: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- Para perfis públicos, liberar somente dados deliberadamente públicos. Não disponibilizar e-mail, tokens, dados privados ou registros de autenticação.
- Para progressos privados, exigir `auth.uid() = user_id` tanto em `USING` quanto em `WITH CHECK` quando pertinentes.
- Verificar se pontuações públicas podem ser alteradas diretamente pelo navegador. Se houver ranking competitivo, gravar resultados verificados via servidor autenticado, nunca confiar apenas nos dados enviados pelo jogador.
- Testar três papéis: visitante anônimo, jogador A autenticado e jogador B autenticado. B não deve ler nem alterar os dados privados de A.
- Registrar evidências dos testes **sem compartilhar credenciais ou dados pessoais**.

## Rotação e segredos
- Usar somente chave pública/publishable no frontend; `service_role`, admin keys e segredos privados jamais podem entrar no bundle ou GitHub Pages.
- Se um segredo tiver vazado em qualquer commit, revogar e gerar outro **antes** de limpar o histórico.
- O workflow de histórico percorre commits que o checkout recupera com `fetch-depth: 0`; não garante cobertura de forks, clones antigos ou refs apagadas.

## Dependências e proteção contra XSS
- A execução `Dependency security audit` consulta advisories de npm dos dois lockfiles, bloqueando risco alto ou crítico reportado.
- As novas regressões XSS cobrem dois pontos relevantes da interface, mas não são uma análise completa de todas as atribuições `innerHTML`.
- Revisar CSP compatível com scripts/CDNs usados, sem ativar uma diretiva que quebre os jogos antes de um teste funcional.

## Critério para liberar merge
1. Workflows de segurança, histórico e dependências aprovados ou falhas triadas com justificativa.
2. Verificação real das políticas Supabase com papéis de teste.
3. Revisão de regressão funcional em dispositivos desktop e mobile.
4. Nenhuma chave privada exposta; eventuais chaves comprometidas revogadas.
5. Revisão humana final do PR antes de mesclar.

**Atualização de 25/10/2026:** o projeto `vmblubjbgwhaplsptymj` foi restaurado com sucesso e confirmou estado `ACTIVE_HEALTHY`. As tabelas `public.player_profiles` e `public.game_stats` possuem RLS ativada e políticas de leitura pública e escrita própria (`auth.uid() = user_id`). Uma migração aplicada no banco revogou `TRUNCATE`, `TRIGGER`, `REFERENCES` e `DELETE` de `anon` e `authenticated`, além de `INSERT` e `UPDATE` de `anon`. Um SELECT posterior com `has_table_privilege` confirmou o bloqueio dessas permissões. O consultor de segurança não retornou avisos. **Ainda falta testar entre contas reais distintas; as políticas de SELECT seguem públicas por projeto.**
