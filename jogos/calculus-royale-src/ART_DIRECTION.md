# Calculus Royale — Direção de Arte v1

## Identidade
Cartoon 2D polido + fantasia matemágica. O jogo deve parecer competitivo e heroico sem perder legibilidade didática.

## Regra de leitura
Cada carta precisa comunicar em menos de um segundo:
1. personagem;
2. classe matemática;
3. símbolo/fórmula;
4. raridade;
5. função de combate.

## Composição
- 65% personagem
- 20% fórmula/efeito
- 15% fundo
- busto, 3/4 ou corpo próximo
- uma silhueta forte por personagem
- um efeito visual principal
- fundo com baixo ruído

## Paleta-base
- Azul profundo: #102A4D
- Ciano arcano: #2ED6E8
- Dourado: #F3C86A
- Coral de ataque: #FF7C67
- Roxo épico: #8D63FF
- Verde integral: #3DDA9A
- Branco de brilho: #F4FBFF

## Raridades
- comum: prata / azul frio
- rara: ciano / azul
- épica: roxo
- lendária: dourado

## Classes
- derivada: velocidade, corte, setas, diagonais
- limite: portais, aproximação, bordas e equilíbrio
- integral: fluxo, espiral, acúmulo e preenchimento
- série: repetição, ecos, Σ e convergência
- suporte: instrumentos, mecanismos, runas e dispositivos

## Exportação
Para cada personagem:
- art: 1024×1024 WebP
- thumb: 512×512 WebP
- battle: 256×256 WebP
- PNG somente quando transparência for necessária
- SVG para ícones e molduras

## QA obrigatório
- reconhecível a 120 px;
- fórmula legível;
- personagem separado do fundo;
- sem microdetalhes essenciais;
- sem texto gerado dentro da ilustração;
- sem deformação por resize;
- contraste validado em mobile.

O catálogo oficial e os prompts ficam em `client/src/data/card-visual-manifest.json`.
