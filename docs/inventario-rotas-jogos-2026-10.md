# Inventário de navegação e jogos — Leo Sardinha.Math

**Verificação em 26/10/2026 — branch de auditoria da PR #4.** O inventário se limita aos jogos efetivamente anunciados nas páginas `index.html` e `educacao.html`, e ao destino Godot que estava ausente. Não equivale a varredura integral de todos os arquivos do repositório.

| Página anunciada | Entrada HTML | Verificação |
| --- | --- | --- |
| Calculus Royale | `jogos/calculus-royale/index.html` | Encontrada; aplicação React/Three.js |
| Calculus Royale · Godot | `jogos/calculus-royale-godot/index.html` | **Criada página informativa:** versão Godot ainda não publicada; encaminha à arena jogável |
| Ilha das Derivadas RPG | `jogos/ilha-das-derivadas-rpg/index.html` | Encontrada |
| Ilha do Cálculo | `jogos/ilha-do-calculo/index.html` | Encontrada |
| Bingo de Frações | `jogos/bingo-fracoes/index.html` | Encontrada |
| Bingo de Quádricas | `jogos/bingo-quadricas/index.html` | Encontrada |
| Batalha Naval Matemática | `jogos/batalha-naval/index.html` | Encontrada |
| 35 Camelos | `jogos/35-camelos/index.html` | Encontrada |
| Laboratório Digital de Matemática | `jogos/laboratorio-digital-matematica/index.html` | Encontrada |

Outras páginas de navegação vistoriadas: `index.html`, `educacao.html`, `wiki.html`. Não assumir que ausência de link na listagem prova inexistência de outros jogos na árvore.

## Falha identificada e correção

- As duas páginas anunciavam **“Jogar versão Godot 3D”** em `jogos/calculus-royale-godot/`, mas `index.html` nesse destino não estava no repositório da branch quando verificado.
- Criado destino próprio, responsivo e acessível, declarando com transparência **“A versão Godot ainda está sendo preparada”** e oferecendo link direto à versão jogável Three.js.
- Os dois anúncios foram renomeados para **“Godot 3D · em desenvolvimento”**, mantendo a navegação e evitando prometer jogo inexistente.
- `tests/game-routes-security.test.cjs` verifica entrada HTML de cada jogo anunciado, o rótulo Godot e link para versão jogável. Incluído no workflow de regressão de segurança.

## Critérios do checklist de 100 etapas

- **Etapa 6 — relacionar páginas e jogos:** este inventário e a verificação automatizada documentam a navegação pública anunciada.
- **Etapa 71 — verificar viewport móvel:** todos os nove destinos verificados usam `meta name="viewport"` (o Godot possui viewport explicitamente). Isso é **inspeção estática**, não prova layout correto em todos os tamanhos nem touch; testes de dispositivo (72 e 73) permanecem pendentes.
- **Etapa 77 — erros de JavaScript no console:** ainda não comprovada; testes de HTML e compilação não substituem navegador real.
- **Etapa 90 — Wiki:** registro editorial no `wiki.html` com o vínculo para este inventário, auditoria de segurança e plano de rollback.

## Critério de regressão

A CI rejeitará nova alteração nas páginas inicial/Educação que introduza link para jogo sem arquivo de entrada rastreado. A existência do HTML não valida scripts, imagens, conteúdo pedagógico nem carregamento offline. Essas verificações são independentes e devem permanecer abertas até testes apropriados.
