# Auditoria de autorização e encerramento de sessão — 25/10/2026

## Resultado confirmado
- O Supabase **Calculus Royale** está no estado `ACTIVE_HEALTHY`.
- As tabelas `player_profiles` e `game_stats` estão com RLS ativa.
- Executei uma consulta SQL de auditoria **somente leitura** com seis verificações por tabela: RLS habilitada, leitura pública declarada, política de inserção própria, política de atualização própria com USING e WITH CHECK, bloqueio de escrita anônima e bloqueio de privilégios perigosos para usuários autenticados. As **12 verificações retornaram true**.
- O banco tinha **0 contas em auth.users, 0 player_profiles e 0 game_stats** na consulta. Portanto, não foi possível verificar isolamento real de dados de dois usuários (A/B). **Não foram criadas contas falsas em produção.**
- Nenhuma pontuação pode ser considerada homologada: o jogo permite atualizar as próprias estatísticas a partir do armazenamento local.

## Correção de logout no GitHub
- O `logout()` do provedor Supabase em ambas as versões do `player.js` chama `POST /auth/v1/logout` usando o token armazenado, quando disponível, para tentar encerrar a sessão remota.
- Independentemente da conexão, elimina o token da sessão local e o nome de perfil pendente, depois recarrega a página.
- Testes automatizados cobrem logout com rede, sem rede e sem token. A revogação no servidor **não é garantida quando offline ou com token vencido**. Nessas situações, a credencial remota pode permanecer ativa até expirar ou ser revogada de outra forma.
- Os tokens seguem em `localStorage`. Essa escolha exige continuar auditando XSS e, futuramente, avaliar uma arquitetura com cookies HttpOnly gerenciados por backend seguro.

## Como reproduzir
- Executar `tools/supabase/verify_access_policies.sql` no editor SQL do projeto.
- Esperar duas linhas e todas as seis verificações em true para a configuração atualmente adotada.
- Os testes A/B com contas distintas **permanecem pendentes**. Recomendado executar primeiro num projeto de homologação, com contas explicitamente destinadas a teste e sem dados reais de terceiros.

## Estado de publicação
Manter o PR #4 não mesclado até validação A/B, revisão de manipulação do ranking e testes manuais de navegação/mobile.
