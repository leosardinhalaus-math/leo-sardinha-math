# Calculus Royale — mapa de dados e superfícies de exposição

**Revisão técnica:** 25/10/2026. Inventário por inspeção do código e das permissões atuais. Material de auditoria, não substitui avaliação jurídica LGPD nem política de privacidade final.

## Provedor ativo e dados tratados

A configuração em `jogos/calculus-royale/cloud-config.js` seleciona `supabase`, projeto `vmblubjbgwhaplsptymj`. A alternativa Firebase está prevista no código, mas **não está selecionada** (campo `firebase: null`).

| Local | Dados | Finalidade | Leitura / escrita observadas | Risco e ação |
| --- | --- | --- | --- | --- |
| Supabase Auth | E-mail, identificador de conta, tokens de sessão; senha enviada no fluxo de autenticação | Cadastro/login opcional | Credenciais enviadas somente ao endpoint de identidade, não ao ranking | Validar confirmação de e-mail, proteção antiabuso e política de exclusão da conta |
| `public.player_profiles` | `user_id`, `username`, `public_slug`, `avatar_seed`, `created_at`, `updated_at` | Identificação pública no jogo | RLS habilitada; SELECT para visitantes; INSERT/UPDATE somente dono autenticado | Nome pode identificar menores. Minimizar colunas públicas e moderar apelidos |
| `public.game_stats` | `user_id`, nível, XP, troféus, vitórias, derrotas, mundos, ondas, streaks, baús, moedas, essência, `updated_at` | Ranking informal e progresso sincronizado | RLS habilitada; SELECT público; INSERT/UPDATE autenticado com identidade vinculada | Estatística enviada pelo cliente não é verificada; exige ranking verificado por servidor |
| Navegador `calculus-royale:cloud-session` | Access token, refresh token, expiração, ID do usuário | Restaurar sessão entre páginas e visitas | `localStorage` da origem, acessível a JavaScript da mesma origem | XSS poderia ler tokens; considerar isolamento de origem e arquitetura de sessão mais robusta |
| Navegador `calculus-royale:pending-username` | Nome escolhido antes de confirmação de e-mail | Concluir perfil depois de confirmação | `localStorage`, removido quando perfil criado/logout | Não persistir após falha de cadastro; não pedir nome completo |
| Navegador `calculus-royale:save-v2` e chaves legadas | Baralho, vitórias, moedas, essência, nome/apelido, fases, inventário, preferências de áudio, ondas | Jogo offline e migração local | `localStorage` da origem | Dados controlados pelo dispositivo; não considerá-los prova de vitória competitiva |
| Firestore (alternativa) | `players`, `progress`, `leaderboard` | Alternativa futura | Emulador testa regras: progresso privado ao dono, perfil público e ranking somente publicável por serviço | Testes no emulador **não** provam regras implantadas num projeto Firebase real |

## Fluxos reais observados no frontend

1. **Sem cadastro:** jogo carrega/salva chaves no navegador; não precisa de uma conta para a jogabilidade básica.
2. **Cadastro opcional:** frontend envia e-mail/senha ao Supabase Auth; registra temporariamente apelido para criar perfil se houver sessão após confirmação.
3. **Login:** frontend recebe e mantém tokens em `localStorage`. Renovação por refresh token tem proteção contra chamadas simultâneas e limpeza de credenciais rejeitadas.
4. **Salvar progresso online:** após localizar o perfil, `player.js` envia `game_stats` ao PostgREST; versão da branch só considera sucesso após receber linha confirmada com `user_id` correspondente. Pontos seguem **não verificados**.
5. **Ranking e perfil público:** visitante lê projeções dos perfis e estatísticas. **Projeções restritas no frontend não são controle de permissão no banco.**
6. **Logout:** tokens e nome pendente são removidos imediatamente no navegador; chamada ao servidor tenta revogar sessão, mas rede indisponível não bloqueia limpeza local.

## Objetivos de minimização antes de merge

- Separar (futuro) dados privados de progresso e resumo público somente com colunas necessárias; reduzir `GRANT SELECT` de `anon` por coluna ou migrar para tabelas/views `security_invoker`, considerando que filtros e ordenações PostgREST precisam de leitura de colunas envolvidas.
- Não reduzir as permissões em produção sem staging, inventário dos consumidores da API e teste de regressão com contas A e B.
- Não declarar o ranking oficial ou antifraude até ter replay/estado autoritativo no servidor. Ver `docs/contrato-ranking-verificado-calculus-royale.md`.
- O fluxo para retificação/remoção de perfil, exclusão de conta, retenção por prazo, fornecedor/controlador e contato de atendimento **não está comprovadamente implantado**. Sem isso, não anunciar conformidade LGPD.
- Projeto educativo pode ser acessado por menores; definir a base legal e práticas adequadas de consentimento/responsáveis quando aplicável, por revisão humana especializada.
- O armazenamento de sessão em `localStorage` é uma limitação arquitetural; não declarar segurança absoluta contra XSS. Manter as verificações de `innerHTML`/escapes e investigar segregação do serviço de autenticação em origem própria.
- Confirmar a política aplicável aos dados existentes antes de implementar exclusão automática; não apagar registros históricos sem autorização e mecanismo de recuperação.

## Verificações demonstráveis

- `.github/workflows/security-regressions.yml`: testes de autenticação, perfil, ranking, XSS e REST simulados; não substituem E2E no navegador.
- `tools/firebase-tests/rules.test.mjs`: testes de Firestore Emulator; alternativa ainda não selecionada.
- `jogos/calculus-royale-src/scripts/test-save-game.ts`: regressão de salvamento local e migração legada.
- `jogos/calculus-royale-src/scripts/test-progression.ts`: verifica regressão de 12 vitórias indevidas na primeira entrada.
- Banco Supabase: RLS ativada em `public.player_profiles`/`public.game_stats` e conselheiro de segurança sem lints na última verificação. Isso não prova isolamento de colunas, autenticação ponta-a-ponta ou ausência de abuso.

**Bloqueios de lançamento:** staging; teste A/B/anon; ranking verificado; revisão humana de retenção e atendimento de dados; dispositivos reais; revisão final e merge explícito.
