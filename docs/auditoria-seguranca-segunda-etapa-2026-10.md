# Auditoria de segurança: segunda etapa — 24/10/2026

## Evidências verificadas nesta etapa
- No commit `3f44a6e`, os workflows **Security regressions** e **Secret exposure guard** passaram.
- `firestore.rules` nega gravações diretas no leaderboard e restringe leitura de progresso ao proprietário. Entretanto, a configuração atual do jogo mantém `provider: 'supabase'`; as regras do Firebase **não substituem as políticas RLS do Supabase**.
- O cliente publicado e a origem de `player.js` foram sincronizados para consultas públicas de perfil/estatísticas com colunas explícitas.
- `player.js` persiste o token de sessão no `localStorage`. Em caso de XSS, scripts executados na mesma origem podem acessar esses tokens. Mitigação prioritária: corrigir XSS e avaliar armazenamento de sessão com backend e cookies HttpOnly/Secure/SameSite; não prometer HttpOnly em GitHub Pages estático.
- `.gitignore` agora ignora arquivos locais de credenciais, mas **não apaga nenhum segredo já versionado**.
- Scanner CI atual examina arquivos rastreados no checkout, **não histórico, forks, logs, objetos antigos nem contas externas**.

## Ações prioritárias pendentes
1. Revisar chaves no histórico inteiro usando verificador que não imprima valores; se encontrar segredos, revogar/rotacionar no provedor imediatamente. Uma limpeza de histórico, se necessária, deve ser coordenada com colaboradores.
2. Revisar a configuração RLS efetiva no painel Supabase para `player_profiles`, `game_stats` e demais tabelas; checar políticas de leitura pública e escrita autenticada.
3. Examinar entrada de dados, DOM e uso de `innerHTML` nos jogos para XSS; preferir `textContent` para dados não confiáveis e sanitização quando HTML for estritamente necessário.
4. Avaliar dependências, lockfiles e workflows de build, incluindo scripts de terceiros e permissões mínimas.
5. Planejar migração de tokens persistidos no navegador, com backend seguro se autenticação de maior risco for necessária.
6. Executar regressões dos jogos antes de mesclar este PR.

## Protocolo de incidente de segredo
Se uma chave foi publicada, **revogue-a e substitua-a antes de alterar histórico**. Investigue acessos indevidos em logs do serviço; atualize secrets do CI; teste a nova chave sem registrá-la em logs. Apagar o arquivo e fazer commit não é suficiente.

## Limitação
Nenhuma exploração prática, auditoria do painel Supabase ou varredura completa do histórico foi executada nesta etapa. Resultado de CI aprovado é apenas uma verificação delimitada.
