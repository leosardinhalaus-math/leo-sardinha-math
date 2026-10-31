# Matemática em Papel — modelos e geradores

## Poly Puzzle

- Gerador de duas fotos, com galeria, recorte, zoom e posicionamento independentes.
- Dissecação autoral de 21 peças: hexágono regular na frente, quadrado de área igual no verso. Usa triangulação, passagem por um retângulo e duas operações de recorte/recomposição por um paralelogramo. Não reproduz o recorte do FoldPlay.
- As peças são isometrias com inversão de orientação entre as duas montagens, apropriadas para virar o papel e revelar a segunda foto.
- Prévia das duas montagens, solução numerada opcional, dois SVGs independentes e duas páginas A4 paisagem para duplex pela borda curta.
- Registro de impressão com cruzes A/B/C: conferir contra a luz antes de cortar.
- Revisão corrigiu uma colisão de IDs entre os dois SVGs da prévia, que poderia exibir a primeira imagem no verso; IDs e referências agora são independentes.

## Sphericon

- Quatro setores de meio-cone, raio de base 35 mm, geratriz 35√2 mm e ângulo π/√2 rad (127,279°).
- Acabamento com foto ou galeria, incluindo uma ilustração autoral de torta.
- Curvas AB/CD segmentadas em doze abas cada, com códigos em sentidos opostos. Bordas retas R1…R4 unem ponta a extremo do arco.
- Visualização da forma em 3D com controle de giro; ela não simula a física do rolamento.
- Molde SVG independente e uma página A4 paisagem, com instruções de montagem em português.
- Referências: [Sphericon, Wolfram MathWorld](https://mathworld.wolfram.com/Sphericon.html) e [Paper Sphericon, Nick Rauh](https://maththem.blogspot.com/2023/08/paper-sphericon.html). Geometria e desenhos implementados originalmente, sem copiar os arquivos dessas páginas.

## Biblioteca e navegação

A aba Modelos reúne HEX, OCT, cubo invertível (guia externo), Poly Puzzle, Sphericon e mini-livro, com ilustrações e atalhos. Prévia dos caleidociclos e do Sphericon calculada a partir das superfícies em 3D. Oito abas navegáveis por teclado e URLs diretas #poly-puzzle, #sphericon e #modelos. Links descritivos atualizados na página inicial e em Educação.

## Verificação da atualização

- `node --test tests/kaleidocycle-geometry.test.cjs tests/paper-materials-geometry.test.cjs`: 14 testes aprovados.
- Poly Puzzle: igualdade de áreas, distâncias conservadas, determinante −1 e ortogonalidade das transformações de todas as peças. Cobertura independente de 2.809 pontos em cada formato, sem lacunas ou sobreposição.
- Sphericon: medidas dos setores e arcos, área da superfície e coincidência em 3D de todos os pares de bordas curvas e retas, com orientação invertida.
- Chromium/Playwright: oito abas, geração, solução, upload inválido, SVGs com IDs únicos, referências de imagens independentes, impressão em duas páginas para o puzzle e uma para o Sphericon, giro, interrupção da animação ao sair da aba, teclado e largura de 390 px.
- Revisão visual da biblioteca, das duas faces impressas do puzzle e do Sphericon.

**Limite:** não houve montagem física com tesoura, cola e impressora. Os testes de geometria não medem a espessura do papel nem a tolerância da impressão duplex. As instruções orientam conferir o registro e experimentar as emendas antes da montagem definitiva.

---

## Revisão anterior: gerador fotográfico de caleidociclos

O módulo de caleidociclos foi refeito a partir da referência visual fornecida pelo usuário: seleção de modelo, quatro fotos independentes, recorte, galeria, geração e instruções de montagem.

## Gerador corrigido

- **HEX:** seis pirâmides, 24 faces triangulares, quatro composições hexagonais. Base e altura da face: 34 mm.
- **OCT:** oito pirâmides, 32 faces triangulares, quatro composições quadradas. Base: 38 mm. Altura: 38/√2 mm.
- Quatro entradas individuais para JPG, PNG ou WEBP até 5 MB; FileReader e verificação de decodificação.
- Recorte central ou imagem completa, com zoom e posição horizontal/vertical por foto. A miniatura usa o mesmo recorte do molde.
- Galeria de quatro padrões vetoriais originais, sem downloads ou dependências externas.
- As quatro imagens são repartidas em setores e transformadas para os triângulos. Cada triângulo recebe um setor da foto, sem repetição da foto inteira em todas as peças.
- A numeração dos setores, a orientação e o centro da imagem acompanham a paridade das dobradiças e a face revelada.
- Molde contínuo com abas C e fechamento F1/F2, legenda de corte/vale/montanha e instruções.
- Impressão de uma página A4 paisagem a 100% e download de SVG independente com as quatro imagens incorporadas.
- O cubo invertível aparece como **guia externo**, com ligação ao molde e à montagem da referência. Não possui gerador fotográfico local: a rede experimental foi retirada por falta de validação suficiente.

## Verificação

`node --test tests/kaleidocycle-geometry.test.cjs` — dez testes aprovados:

- Contagem e congruência das faces, bordas do contorno, pares de abas e dimensões de impressão.
- Construção independente dos anéis em 3D, com dobradiças consecutivas ortogonais e fechamento das extremidades.
- Em cada uma das quatro posições de revelação de HEX e OCT, uma única transformação global da imagem recompõe todos os setores. Erro numérico inferior a 10⁻¹⁰. Esta verificação detectou e corrigiu o deslocamento dos setores do OCT em duas faces.

Chromium/Playwright: quatro campos de fotos, troca de modelo, recorte, upload válido/inválido, geração, invalidação do resultado antigo, download SVG, ausência de erros JavaScript e largura móvel de 390 px. HEX e OCT exportados em uma página A4 paisagem cada; XML dos SVGs exportados válido. Revisão visual do formulário e dos moldes gerados.

A validação matemática cobre as duas redes e a recomposição das imagens nas posições fechadas. Não substitui montagem física com papel, cola e tolerâncias reais; essa montagem não foi realizada.

## Referências

- Referência de produto e fluxo: imagem de FoldPlay enviada pelo usuário. Interface e código novos; sem reutilização de imagens ou código do FoldPlay.
- Geometria e montagem: Jürgen Köller, [Kaleidocycles — Mathematische Basteleien](https://www.mathematische-basteleien.de/kaleidocycles.htm). As proporções de HEX e OCT seguem os modelos fechados de seis e oito pirâmides.
- Padrões da galeria e implementação autorais: CC BY-SA 4.0. Fotos enviadas conservam seus próprios direitos.

## Outros módulos

Origamis, mini-livros, banco de REA e jogos foram preservados. A presente revisão se concentra no gerador fotográfico solicitado na última referência; não constitui validação física ou redesenho das sequências de origami existentes. Os outros módulos mantêm seus próprios controles de JSON e impressão.
