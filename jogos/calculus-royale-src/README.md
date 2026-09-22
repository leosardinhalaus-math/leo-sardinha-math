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
npm run test:combat
npm run build
npm run test:models
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
| `client/src/game/combat.ts` | Simulação de contato, HP, cooldowns, status e zonas de spawn |
| `client/src/game/cardProfiles.ts` | 45 perfis visuais e habilidades temáticas |
| `client/src/game/proceduralCharacters.ts` | Modelagem das silhuetas, acessórios e sete animações |
| `client/src/game/effects.ts` | Partículas conforme a habilidade da carta |
| `scripts/generate-models.ts` | Exporta os 45 modelos GLB com animações completas |
| `client/src/game/world.ts` | Cinco ilhas procedurais com torres, pontes e ornamentos |
| `client/src/game/collisions.ts` | Conversão de coordenadas e colisões Box3 com subpassos e deslize |
| `client/public/assets/models/manifest.json` | Configuração opcional dos personagens e mapas externos |
| `client/src/world-arena.css` | Canvas responsivo e HUD da arena |
| `client/src/data/` | Cartas, mapas, artes e desafios |
| `art-source/`, `.packed/`, `scripts/` | Fontes e preparação das imagens incluídas no projeto |

## Decisões de adaptação

O jogo continua sendo comandado pelas cartas, com câmera estratégica elevada e fixa do sul para o norte. Roda/pinça aproxima, R centraliza e os botões alternam entre a ilha inteira e o combate. As fases, recompensas, deck, retratos e desafios permanecem.

A arena normal agora começa após a primeira invocação. Toque numa carta, escolha A1–A3 (faixa superior) ou B1–B3 (inferior), veja a prévia 3D e confirme. Também é possível tocar numa zona diretamente no canvas, usando Raycaster. A posição determina a faixa e o avanço inicial. Zonas ocupadas são bloqueadas. A batalha pausa durante a escolha; cancelar não gasta elixir nem altera o rodízio. A confirmação custa o elixir da carta uma única vez e requer a prévia carregada. Sem WebGL, os botões continuam disponíveis no modo ilustrado.

**Mudança intencional nas regras, conforme o briefing:** tropas da mesma faixa param ao contato e ativam sua habilidade a cada 1,2 s. Há HP por tropa (20 + 2 × poder), escudo, cura, lentidão, fluxo de dano por segundo, aceleração, reflexão, perfuração, golpes duplos e ataques em cadeia. Cada uma das 45 cartas possui nome de habilidade, parâmetros, paleta e motivo visual próprios. As animações de ataque são compartilhadas por arquétipo; os efeitos distinguem as cartas. Consulte [o catálogo completo](docs/CARTAS_3D.md).

A simulação pura em `combat.ts` roda em passos de 100 ms e independe de FPS/WebGL. O avanço vira X entre −9 e +9; a faixa vira Z = ±1,65. Tropas de faixas diferentes não colidem. A colisão com a torre, em 96% de avanço, aplica o poder da carta uma única vez e consome a unidade; os efeitos secundários são aplicados nos duelos entre tropas. Feitiços não causam mais dano remoto imediato ao serem lançados. Zoom agora acelera por 3 s, sem teletransportar através do rival. O antigo modal de choque foi substituído por partículas e um registro dos efeitos reais. Vitória/derrota aparecem antes de seguir ao fluxo de recompensas.

A Sobrevivência recebe os novos modelos e animações, mas conserva seu sistema próprio de defesa por cartas e ondas; a escolha de spawn e os duelos com status pertencem à arena normal.

Box3 impede os avatares de entrar nos obstáculos estáticos, com pequenos subpassos para evitar atravessamento. As rotas e pontes ficam livres. Luz hemisférica e direcional, sombras, fundo e névoa compõem a cena. O pixel ratio é limitado a 1,5 e sombras a 1024²; câmera e canvas acompanham o tamanho do contêiner. Fora da arena a cena é descartada. Sem WebGL, o jogo continua no cenário ilustrado com os retratos se movimentando.

## Modelos gratuitos e animações

O projeto gera **45 arquivos GLB jogáveis**, com `idle`, `walk`, `run`, `jump`, `attack`, `victory` e `defeat`, através de `npm run models` (também executado automaticamente antes de `dev` e `build`). Eles ficam em `client/public/assets/models/generated/`. São modelos low-poly procedurais inspirados nas paletas, silhuetas e acessórios observados nas cartas: arco, lâminas, escudos, cajados, livros, ferramentas, asas e relíquias flutuantes.

Os modelos são reconstruções 3D estilizadas a partir das referências visuais, com diferenças próprias de cabelo, rosto, roupa, armadura, arma e formação mágica. Eles usam hierarquias de pivôs animados (membros rígidos), enquanto o carregador também aceita modelos externos com esqueleto. As ilustrações originais do deck permanecem intactas.

O exportador transforma as curvas em translações e quaternions glTF. Todos os modelos passam pelo parser real de GLTFLoader em `npm run test:models`. O conjunto atual soma aproximadamente 5 MiB sem compressão, pré-carregado sob a tela de carregamento. O manifesto padrão usa `"useGenerated": true`; entradas explícitas de `characters` substituem modelos de cartas específicas. Para usar apenas seus modelos, remova `useGenerated`. Se um GLB faltar, a mesma geometria é criada diretamente no navegador.

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
        "attack": "Attack",
        "victory": "Victory",
        "defeat": "Defeat"
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

A entrada `slope` só deve ser adicionada quando `archer.glb` existir. Troque os nomes acima pelos nomes exatos dos clips do seu GLB. Sem mapeamento explícito, o carregador procura nomes contendo idle/standing, walk, run/sprint, jump attack/punch/slash, victory/win/celebrat e defeat/death/dying. Se faltar uma ação, usa idle quando disponível; não cria animações esqueléticas que não existem no modelo. Cada instância ganha um esqueleto clonado e um mixer próprio. `height` normaliza a altura, e `yaw` é a correção de orientação em radianos. Os modelos devem estar voltados para +Z antes da orientação de equipe.

Todos os URLs configurados são pré-carregados durante a tela de preparação 3D. Arquivo ausente ou inválido mantém o avatar provisório e mostra uma indicação discreta. Um manifesto vazio desativa os GLBs gerados e mantém a geometria procedural funcional. Para este primeiro pipeline, exporte GLB/glTF sem compressão Draco/KTX2: esses decodificadores não foram incluídos.

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

Índices 1–5 correspondem às cinco ilhas. Use Y para cima, chão Y=0 e área de X=−11…11, Z=−5…5. Preserve corredores com pelo menos 1,2 unidade de largura centrados em Z=±1,65 ao longo de X=−8,1…8,28. Nomeie volumes de colisão `COL_parede`, `COL_rocha`, etc.; eles ficam invisíveis e fornecem suas caixas de colisão. A colisão é AABB, não uma malha física: não suporta rampas, gravidade ou pathfinding. Se colocar um obstáculo no corredor, o visual pode parar enquanto o relógio lógico continua; respeite o contrato do mapa para preservar a sincronização. Sem GLB de mapa, são usadas as ilhas procedurais incluídas.

## Publicação e conteúdo preservado

O workflow `.github/workflows/build-calculus-royale.yml` prepara as imagens, instala as dependências, verifica TypeScript e gera `jogos/calculus-royale/` para GitHub Pages. Edite o código-fonte, não o bundle. Os antigos `.packed/GameCanvas.*` e `patch_pages.py` são históricos e não devem reconstruir o componente atual.

Fluxo: Início → Preparação → Arena. Preparação reúne deck, mapa, inventário, sobrevivência, perfil e ranking. A mão continua horizontal com quatro cartas no rodapé. Os power-ups usam 40 perguntas com alternativas embaralhadas e sem repetição até esgotar o grupo. Os 10 retratos originais e 35 ilustrações adicionais continuam usando os mesmos arquivos.

## Três melhorias possíveis

1. Modelos autorais que correspondam às 45 ilustrações, com animações próprias por classe.
2. Partículas nos feitiços e sons espaciais de ataque.
3. Pathfinding entre faixas e colisões com obstáculos móveis.

O raycast de seleção e o controle das ações seguem as APIs oficiais de [Raycaster](https://threejs.org/docs/pages/Raycaster.html) e [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html).

## Ilha cartunesca

O cenário procedural tem oceano animado, praia, colinas verdes, cidade colorida, centro futurista, acampamento e moinho. Cada uma das cinco ilhas mantém sua paleta e pontos de interesse. A iluminação usa materiais Standard, sombras e névoa em Three.js; não depende de Unreal Engine, ray tracing ou texturas 8K.

Use **Ilha inteira** para a vista aérea e **Combate** para aproximar a arena. A seleção de carta aproxima a câmera automaticamente. Os elementos decorativos ficam fora dos corredores e das seis zonas de invocação.

Os 45 combatentes são malhas 3D geradas em GLB, sem recortes ou retratos planos. Cada modelo usa a carta como referência para silhueta, cabelo, roupa, armadura, arma, objeto mágico e paleta. Relíquias como o espelho, a árvore fractal e os anéis de Euler possuem geometria própria. Os poderes continuam associados às regras de cada carta e exibem partículas temáticas no contato. A câmera não gira: a batalha é mostrada do sul para o norte, com zoom e enquadramento automático da invocação.
