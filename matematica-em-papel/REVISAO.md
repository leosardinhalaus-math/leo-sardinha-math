# Matemática em Papel — revisão do gerador fotográfico

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
