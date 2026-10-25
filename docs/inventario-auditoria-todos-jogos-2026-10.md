# Inventário de superfícies — auditoria transversal (24/10/2026)

## Escopo rastreado no repositório

Levantamento da árvore `main`: 630 blobs e 28 documentos HTML. **Inventário de caminhos, não auditoria dinâmica completa.** Todos os grupos abaixo entram no escopo.

| Área | Entradas HTML | Checagens exigidas |
|---|---|---|
| Portal institucional | `index.html`, `educacao.html`, `sobre.html`, `classroom.html`, `imagens.html`, `wiki.html`, `404.html` | privacidade, navegação, links, conteúdo remoto e acessibilidade |
| Matemática | `algebra/index.html`, `geometria/index.html` | entradas do usuário, conteúdo inserido no DOM, mobile |
| Professor | `professor/index.html`, `professor/listas/index.html` | dados de alunos, impressão, exportação |
| 35 Camelos | `jogos/35-camelos/index.html` | HTML dinâmico e terceiros |
| Batalha Naval | `jogos/batalha-naval/index.html`, `atividades.html` | nomes, placares, persistência e teclado |
| Bingos | `jogos/bingo-fracoes/index.html`, `jogos/bingo-quadricas/index.html` | conteúdo dinâmico, impressão e acessibilidade |
| Calculus Royale | `jogos/calculus-royale/index.html`, `perfil/index.html`, `ranking/index.html` | contas, sessões, perfil público, ranking, autenticação e RLS |
| Calculus Royale (fonte) | `jogos/calculus-royale-src/client/index.html`, `public/perfil/index.html`, `public/ranking/index.html` | não corrigir apenas build; manter fonte/build sincronizados |
| Ilha das Derivadas RPG | `jogos/ilha-das-derivadas-rpg/index.html` | DOM, estado do jogo, acessibilidade |
| Ilha do Cálculo | `jogos/ilha-do-calculo/index.html` | DOM, estado do jogo, acessibilidade |
| Laboratório Digital | `index.html`, `cartelas-magicas.html`, `detetive-do-cpf.html`, `gerar-icones.html` sob `jogos/laboratorio-digital-matematica/` | persistência, módulos, simulação de CPF, CDN e cache offline |

## Achados concretos: leitura seletiva (não inferir exploração confirmada)

**A1 — Alta prioridade, autenticação e dados pessoais**: `jogos/calculus-royale/player.js` contém cliente de Supabase, grava tokens de sessão em `localStorage` e disponibiliza operações de perfis e placares por API REST. Isso aumenta o impacto potencial de XSS. O arquivo também inclui suporte opcional a Firebase. Investigar configuração efetiva, política de RLS do Supabase, rotação/expiração de sessões e garantia de não publicar email, ID ou outros dados além do estritamente necessário. A chave `sb_publishable_` é publicável por natureza; não classificá-la automaticamente como segredo. NÃO mover uma chave secreta ao cliente.

**A2 — Média/alta, exposição de perfis**: `firestore.rules` permite `get` público e `list` limitado em `players` e `leaderboard`; escrita de placares é negada no cliente e `progress` exige o proprietário. `players` inclui `user_id`, `username`, `public_slug`, `avatar_seed` e `created_at`. Revisar necessidade de disponibilizar identificadores e medidas contra coleta massiva. Uma consulta com `limit` não é controle completo de scraping.

**A3 — Privacidade infantil**: classificação etária dos usuários não verificada. Por se tratar de portal de atividades escolares, avaliar privacidade por padrão e minimização de dados de crianças e adolescentes antes de expandir perfis públicos.

**A4 — Laboratório/CPF**: `jogos/laboratorio-digital-matematica/detetive-do-cpf.html` descreve missões simuladas e gera sequências aleatórias de nove dígitos para ensinar verificadores. Deve permanecer estritamente didático. Verificar em outras rotas se há campos que aceitam/armazenam CPF real; **não foi constatada coleta real nesse arquivo inspecionado**.

**A5 — Dependências externas**: Detetive do CPF importa Three.js por `cdn.jsdelivr.net` com versão definida. Revisar pinagem, estratégia offline e política de terceiros, sem pressupor telemetria maliciosa.

**A6 — Avisos legais**: `index.html` tem rodapé sem política de privacidade e termos de uso. Arquivos de mesmo nome não foram identificados no inventário de caminhos. Ainda é necessário examinar práticas reais antes de escrever declarações jurídicas definitivas.

## Procedimentos de teste por superfície

1. Procurar uso de `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function` e manipulação de URL; rastrear fonte dos valores e codificação contextual. Achado por grep não significa XSS.
2. Encontrar `localStorage`, `sessionStorage`, cookies, IndexedDB, caches e dados enviados por `fetch`/SDK.
3. Inspecionar `target="_blank"`, políticas de origem, dependências e SRI quando tecnicamente aplicável.
4. Verificar autenticação, rate limiting, leitura de perfil e permissões reais na instância Supabase/Firebase; regras versionadas não provam regras implantadas.
5. Testar fluxo de teclado, zoom, rótulos, contraste, foco, reduced-motion e impressão.
6. Testar jogos sem internet e em mobile; regressão de salvar, reiniciar, partidas, ranking, autenticação e navegação.
7. Revisar GitHub Actions, dependências e permissões de publicação; não conceder escrita desnecessária.
8. Registrar para cada problema: caminho, reprodução, impacto, correção, teste, status e responsável.

## Critérios de aceite

Não declarar LGPD cumprida ou site imune a hackers. Marcar cada superfície como verificada apenas após testes positivos e negativos. Alterações que afetem login, banco de dados ou a experiência dos jogadores exigem validação antes de mesclar na `main`.

## Próximas alterações de código (necessitam auditoria de dependências)

- Remover manipulações inseguras do DOM somente com rastreamento do dado até o destino.
- Reduzir informações públicas de jogadores sem quebrar consultas de ranking.
- Restringir sessões expostas por XSS por meio de mitigação de injeção e revisão de arquitetura; evitar migrar tokens sem compatibilidade.
- Implementar links legais e avisos de terceiros quando os documentos forem fiéis ao funcionamento real.
