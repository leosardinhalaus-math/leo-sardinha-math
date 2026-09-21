# Calculus Royale — fonte do jogo

URL: https://leosardinhalaus-math.github.io/leo-sardinha-math/jogos/calculus-royale/

## Código e publicação

- `client/src/components/GameCanvas.tsx` é o componente canônico, já com navegação, deck e progressão.
- `client/src/components/WorldArena.tsx` gerencia o ciclo de vida da cena, dimensionamento, pausa fora da batalha e alternativa ilustrada se WebGL estiver indisponível.
- `client/src/game/scene.ts` cria arquitetura própria para Limites, Derivadas, Séries, Integrais e Aplicações. A geometria é decorativa; as regras de combate continuam no componente principal.
- `client/src/data/worldMaps.ts` é a correspondência entre índice da ilha, tema, imagem e cor.
- `client/src/data/cardArt.ts` fornece as imagens para mão, editor, combate e sobrevivência.
- `client/src/main.tsx` importa as folhas de estilo na ordem correta.

O workflow `.github/workflows/build-calculus-royale.yml` prepara imagens, instala dependências fixadas pelo lockfile, valida assets, verifica TypeScript e compila. O resultado em `jogos/calculus-royale/` é publicado pelo GitHub Pages. Não editar o bundle gerado.

Os antigos `.packed/GameCanvas.*` e `patch_pages.py` são arquivos históricos; não executá-los sobre o componente canônico. O workflow não os usa mais para reconstruir código. Os dados compactados das imagens continuam sendo usados para preparar os assets.

## Execução local

```sh
npm ci
mkdir -p client/public/assets/cards
cat .packed/card-sprite.webp.b64.part{1,2,3,4,5,6} | base64 -d > client/public/assets/cards/card-sprite.webp
python -m pip install pillow
python scripts/extract_world_maps.py
python scripts/split_card_sprite.py
python scripts/generate_character_assets.py
npm run check
npm run dev
```

## Preparação e desafios

O fluxo é Início → Preparação → Arena. A preparação reúne deck/evoluções, mapa, inventário, sobrevivência, perfil e ranking. Escolher uma ilha volta para a preparação e preserva o deck selecionado; o combate só avança na arena. A mão usa quatro cartas lado a lado na faixa inferior, com altura observada para reservar espaço no conteúdo. Os power-ups ficam junto à mão.

`client/src/data/powerUpChallenges.ts` contém 40 perguntas (8 por ilha), com alternativas embaralhadas e sorteio sem repetição até esgotar cada grupo. A virada de grupo também evita repetir a última pergunta. O combate pausa durante os desafios e ao abrir inventário ou sobrevivência.

## Artes atuais e futuro 3D

Os dez recortes de `card-sprite.webp` vêm da prancha ilustrada original (Guardião, Arqueira, Mago, Golem, Sacerdotisa, Colosso, Feiticeiro, Oráculo, Engenheiro e Titã). As outras 35 cartas agora usam ilustrações de fantasia geradas em IA no mesmo estilo. Os seis atlas em `art-source/` e seu manifesto preservam a associação de cada retrato à carta. `generate_character_assets.py` apenas extrai essas artes; não desenha mais personagens procedurais. O hash de cada atlas é verificado antes da extração.

Os personagens atuais são imagens 2D com animações de deslocamento/ataque em CSS. A arquitetura da arena usa Babylon.js e geometria 3D. Não há modelos articulados de personagens integrados neste estágio.

Para um piloto 3D, começar pela Arqueira (`slope`): referência de corpo inteiro → modelo texturizado → esqueleto → animações `idle`, `walk`, `attack`, `hit`, `death` → exportação GLB → integração com a posição e os eventos de combate. Um vídeo gerado por IA não substitui esse modelo. O carregador GLB e a sincronização de animações ainda precisam ser implementados quando houver um asset real para validar.

Meshy oferece imagem-para-3D, rigging e animação; Mixamo pode aplicar animações a personagens humanoides compatíveis. A fidelidade, a malha e o custo devem ser avaliados com um personagem antes de produzir o elenco inteiro.
