# Calculus Royale — Three.js

Jogo completo de estratégia com cartas, React/TypeScript (módulos JavaScript), Vite e Three.js. A batalha e a sobrevivência agora exibem personagens 3D animados. As 45 ilustrações das cartas continuam preservadas.

[Jogar](https://leosardinhalaus-math.github.io/leo-sardinha-math/jogos/calculus-royale/)

## Rodar o projeto completo

Requisitos: Node.js 22, Python 3 e Pillow. Dentro de `jogos/calculus-royale-src`:

```sh
npm ci
python -m pip install pillow
python scripts/prepare-assets.py
npm run dev -- --host 127.0.0.1
```

Abra o endereço mostrado pelo Vite. Para verificar e criar uma versão estática:

```sh
npm run check
npm run test:three
npm run build
python -m http.server 8000 --directory dist/public
```

Abra http://localhost:8000. Não abra `index.html` por `file://`: módulos, manifesto e GLTFLoader precisam de servidor HTTP. O bundle inclui Three.js, sem depender de CDN em execução. `package-lock.json` fixa as versões.

## Estrutura

| Arquivo/pasta | Função |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | Regras existentes, energia, dano, pontuação, fases, deck e menus HTML |
| `client/src/components/WorldArena.tsx` | Integração React, carregamento, recuperação ilustrada e controles de câmera |
| `client/src/game/scene.ts` | Renderer, câmera, GLTFLoader, sincronização das tropas, Clock, loop e descarte |
| `client/src/game/characters.ts` | Avatares geométricos, clones de esqueletos, AnimationMixer e crossfades |
| `client/src/game/world.ts` | Cinco ilhas procedurais com torres, pontes e ornamentos |
| `client/src/game/collisions.ts` | Conversão de coordenadas e colisões Box3 com subpassos e deslize |
| `client/public/assets/models/manifest.json` | Configuração opcional dos personagens e mapas externos |
| `client/src/world-arena.css` | Canvas responsivo e HUD da arena |
| `client/src/data/` | Cartas, mapas, artes e desafios |
| `art-source/`, `.packed/`, `scripts/` | Fontes e preparação das imagens incluídas no projeto |

## Decisões de adaptação

Este jogo já é uma batalha de cartas, não um jogo de personagem diretamente controlado. Mantivemos o controle pelas cartas, dano, energia, IA, fases, pontuação, armazenamento local e menus. Assumimos câmera estratégica elevada: arrastar gira, roda do mouse ou pinça aproxima; botão direito ou dois dedos deslocam. Com foco no canvas, WASD/setas deslocam a câmera e R centraliza. Não há movimento manual das tropas nem uma nova regra de salto.

O avanço lógico de 0 a 100 vira X entre −9 e +9 (sentido invertido no rival); a faixa vira Z = ±1,65. Os snapshots são interpolados apenas na apresentação. As regras continuam no relógio original do jogo e o render usa requestAnimationFrame + Clock com delta limitado a 50 ms. Pausas dos desafios também congelam os personagens. Salto é uma animação de entrada; correr aparece nos avanços rápidos e atacar na aproximação da torre. Não introduzimos dano por contato ou bloqueio entre tropas, pois isso mudaria o combate existente.

Box3 impede os avatares de entrar nos obstáculos estáticos, com pequenos subpassos para evitar atravessamento. As rotas e pontes ficam livres. Luz hemisférica e direcional, sombras, fundo e névoa compõem a cena. O pixel ratio é limitado a 1,5 e sombras a 1024²; câmera e canvas acompanham o tamanho do contêiner. Fora da arena a cena é descartada. Sem WebGL, o jogo continua no cenário ilustrado com os retratos se movimentando.

## Modelos gratuitos e animações

O jogo já funciona sem download adicional, usando personagens provisórios de cápsulas e caixas. Eles **não reproduzem a aparência das ilustrações**. Todos têm `idle`, `walk`, `run`, `jump` e `attack` via AnimationMixer, com crossfade de 0,2 s. Um GLB externo pode substituir qualquer carta ou o personagem padrão.

Fonte gratuita: [Quaternius — Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html). Na página, use **Download here** ou **Download on Itch.io**, escolha o pacote gratuito e extraia a versão glTF. A página informa licença CC0 e formatos glTF, FBX e Blender. Os nomes e as animações podem variar entre arquivos: confira os clips do modelo escolhido. Se vier `.gltf`, mantenha também o `.bin` e as texturas nas posições relativas originais. Para converter um `.blend` ou FBX, importe no Blender e exporte **glTF 2.0 / GLB**, incluindo animações; prefira animações *in place* (sem deslocamento da raiz).

Coloque seu arquivo em `client/public/assets/models/characters/hero.glb`. Substitua o conteúdo de `client/public/assets/models/manifest.json` por, por exemplo:

```json
{
  "characters": {
    "default": {
      "url": "./assets/models/characters/hero.glb",
      "height": 2,
      "yaw": 0,
      "animations": {
        "idle": "Idle",
        "walk": "Walk",
        "run": "Run",
        "jump": "Jump",
        "attack": "Attack"
      }
    },
    "slope": {
      "url": "./assets/models/characters/archer.glb",
      "height": 2
    }
  },
  "worlds": {}
}
```

A entrada `slope` só deve ser adicionada quando `archer.glb` existir. Troque os nomes acima pelos nomes exatos dos clips do seu GLB. Sem mapeamento explícito, o carregador procura nomes contendo idle/standing, walk, run/sprint, jump e attack/punch/slash. Se faltar uma ação, usa idle quando disponível; não cria animações esqueléticas que não existem no modelo. Cada instância ganha um esqueleto clonado e um mixer próprio. `height` normaliza a altura, e `yaw` é a correção de orientação em radianos. Os modelos devem estar voltados para +Z antes da orientação de equipe.

Todos os URLs configurados são pré-carregados durante a tela de preparação 3D. Arquivo ausente ou inválido mantém o avatar provisório e mostra uma indicação discreta. O manifesto vazio é a configuração padrão funcional. Para este primeiro pipeline, exporte GLB/glTF sem compressão Draco/KTX2: esses decodificadores não foram incluídos.

Referências oficiais: [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html).

## Mapa GLB opcional

Coloque `arena.glb` em `client/public/assets/models/maps/` e configure a ilha 1:

```json
{
  "characters": {},
  "worlds": {
    "1": { "url": "./assets/models/maps/arena.glb" }
  }
}
```

Índices 1–5 correspondem às cinco ilhas. Use Y para cima, chão Y=0 e área de X=−11…11, Z=−5…5. Preserve corredores com pelo menos 1,2 unidade de largura centrados em Z=±1,65 ao longo de X=−9…9. Nomeie volumes de colisão `COL_parede`, `COL_rocha`, etc.; eles ficam invisíveis e fornecem suas caixas de colisão. A colisão é AABB, não uma malha física: não suporta rampas, gravidade ou pathfinding. Se colocar um obstáculo no corredor, o visual pode parar enquanto o relógio lógico continua; respeite o contrato do mapa para preservar a sincronização. Sem GLB de mapa, são usadas as ilhas procedurais incluídas.

## Publicação e conteúdo preservado

O workflow `.github/workflows/build-calculus-royale.yml` prepara as imagens, instala as dependências, verifica TypeScript e gera `jogos/calculus-royale/` para GitHub Pages. Edite o código-fonte, não o bundle. Os antigos `.packed/GameCanvas.*` e `patch_pages.py` são históricos e não devem reconstruir o componente atual.

Fluxo: Início → Preparação → Arena. Preparação reúne deck, mapa, inventário, sobrevivência, perfil e ranking. A mão continua horizontal com quatro cartas no rodapé. Os power-ups usam 40 perguntas com alternativas embaralhadas e sem repetição até esgotar o grupo. Os 10 retratos originais e 35 ilustrações adicionais continuam usando os mesmos arquivos.

## Três melhorias possíveis

1. Modelos autorais que correspondam às 45 ilustrações, com animações próprias por classe.
2. Partículas nos feitiços e sons espaciais de ataque.
3. Pathfinding e combate físico entre tropas, como uma evolução explícita das regras atuais.
