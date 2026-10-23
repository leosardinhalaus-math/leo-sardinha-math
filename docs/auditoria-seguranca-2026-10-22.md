# Auditoria de segurança — 2026-10-22 (parcial)

Escopo: repositório público Leo Sardinha.Math e componentes Calculus Royale. Análise estática; **não** representa pentest nem comprovação de vulnerabilidade explorável.

## Achados observados
1. **CI:** `.github/workflows/security-regressions.yml` não monitorava todo `jogos/calculus-royale-src/**`; alterado nesta branch para disparar testes quando o código-fonte do jogo muda.
2. **Workflow de build:** `.github/workflows/build-calculus-royale.yml` usa `contents: write` em todo o workflow e faz push para `main`. Recomendação: separar build (somente leitura) de publicação (escrita limitada), bloquear concorrência indevida, proteger main e exigir revisões/checks.
3. **Proteção de branch:** consulta à API de branch protection retornou 403 (permissão insuficiente), enquanto a API de rulesets retornou `[]`. Portanto proteção efetiva não confirmada; conferir na interface GitHub.
4. **Sessões:** `jogos/calculus-royale/player.js` guarda tokens de acesso e refresh token Supabase em `localStorage`; riscos caso ocorra XSS. Validar superfícies de HTML dinâmico e preferir SDK/padrão de sessão com mitigação de XSS.
5. **Estatísticas:** `player.js` envia estatísticas calculadas a partir de `localStorage`; não devem ser tratadas como placar competitivo verificado. É necessária validação autoritativa no servidor para ranking confiável.
6. **Credenciais:** chave `sb_publishable_...` no JavaScript é pública por design. Não classificá-la como segredo; verificar RLS das tabelas Supabase e não publicar `service_role` ou chaves privadas.
7. **Firestore:** `firestore.rules` restringe progresso ao dono e nega gravação direta em leaderboard, o que é bom; regras Firestore não substituem as políticas RLS do Supabase que está configurado como provedor atual.
8. **Dependências:** `package.json` usa intervalos de versão em várias dependências; o build utiliza `npm ci` com lockfile. Validar alertas Dependabot e adicionar verificações de vulnerabilidade sem desestabilizar builds.
9. **Cópia do jogo:** o repositório é público e o jogo executa no navegador. Assets e JavaScript entregues ao cliente não podem ser tornados incopiáveis. Não usar bloqueio de botão direito como proteção. Conferir licenças dos assets de terceiros; documentar titularidade/licenciamento das criações próprias e manter fontes de alto valor em repositório privado, respeitando dependências do build.

## Próximas verificações recomendadas
- Procurar segredos privados no histórico Git, e não apenas na versão atual; revogar imediatamente qualquer segredo confirmado.
- Auditar páginas do site inteiro para sinks XSS (`innerHTML`, `insertAdjacentHTML`, `eval`), entrada controlada pelo usuário e tratamento seguro.
- Inspecionar políticas RLS no projeto Supabase ativo e testar acessos anônimos e entre usuários.
- Configurar regras de proteção da `main` com PR, checks, restrição de push e aprovação antes de merge; avaliar comportamento do bot que hoje comita builds nela.
- Aplicar permissões mínimas ao GitHub Actions, pinagem de actions por commit e dependências, e testes de regressão adicionais.
- Aplicar cabeçalhos CSP, Referrer-Policy e demais proteções em hospedagem compatível; testar compatibilidade com Godot/Three.js/PWA.
- Checar registros de licença/direitos autorais dos próprios personagens, trilhas, cartas, modelos 3D e materiais externos.

## Estado
- Alteração proposta neste PR: ampliar acionamento dos testes de regressão para todas as mudanças no código-fonte Calculus Royale.
- Sem execução dos testes pelo assistente, sem deploy, sem alterações na branch principal.
