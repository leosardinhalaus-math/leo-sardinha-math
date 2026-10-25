# Integridade do ranking e autorização — 25/10/2026

## Achado confirmado
A função `syncProgress` do `player.js` constrói `stats` a partir de `localProgress()`, que lê `wins`, `coins`, mundos, placar de sobrevivência e inventário do `localStorage`. Qualquer visitante com acesso ao próprio navegador pode modificar esses valores e chamar a API autenticada. Por isso **RLS garante propriedade da linha, não a veracidade dos resultados**.

## Medidas aplicadas ao PR #4
- `ranking/index.html` e perfil público informam de modo claro que as pontuações são relatadas pelos jogadores e não verificadas no servidor.
- O método `leaderboard` aceita apenas as três ordenações oferecidas pela interface.
- As duas cópias (publicação estática e fonte do build) foram sincronizadas.
- Teste `tests/ranking-integrity-security.test.cjs` verifica textos, escape de nomes, lista de ordenações e paridade de arquivos.

## Verificação real das permissões Supabase
- Projeto `vmblubjbgwhaplsptymj` ACTIVE_HEALTHY.
- Tabelas `player_profiles` e `game_stats` com RLS ativada.
- Leitura pública explicitamente permitida; INSERT/UPDATE de jogadores autenticados sujeitos à condição `auth.uid() = user_id`.
- DELETE, TRUNCATE, TRIGGER e REFERENCES não concedidos a `anon` nem `authenticated`. INSERT/UPDATE de `anon` revogados.
- Consulta de catálogos PostgreSQL não encontrou views públicas nem funções SECURITY DEFINER no schema public.
- Restrições CHECK presentes para números não negativos e até cinco mundos completos; **não impedem pontuações falsas positivas**.
- A auditoria acima é de configuração. Faltam testes isolados com duas contas reais distintas, inclusive contra acesso cruzado (A/B).

## O que precisa existir para um ranking confiável
1. Criar mecanismo de partidas e resultados **validados por servidor**, com identificadores exclusivos de partidas e checagem de transições/recompensas; não confiar em dados locais como prova.
2. Separar **progresso pessoal** (salvamento no cliente, sync próprio) de **pontuação homologada** (somente serviço confiável pode registrar).
3. Restringir gravações em tabela de ranking verificado a uma Edge Function ou backend com autenticação, limites de frequência e validação de partida.
4. Ajustar schema, API e páginas após testes contra replay, alteração de placares e envio de resultados impossíveis.
5. Até essa implementação, manter rótulo de ranking informal; não apresentar dados autoenviados como competição auditada.

## Mudança futura de Supabase
Conforme changelog público de 2026, a exposição automática de **novas** tabelas via Data API terá alteração em 30/10/2026. A migração de qualquer tabela nova deve conter GRANT explícito e RLS no mesmo processo. Não abrir permissões amplas como alternativa.

## Liberação
O teste de regressão passa, mas **ainda não comprova integridade competitiva**. Manter o PR #4 não mesclado até testes reais de A/B, regressão manual e avaliação do modelo de ranking. Nenhuma conta real foi criada ou alterada nesta verificação.
