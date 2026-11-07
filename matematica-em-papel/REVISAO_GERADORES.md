# Revisão dos geradores — 7 de novembro de 2026

Base revisada: commit 86de8b5, após a correção das fotos 2 e 4 de HEX/OCT.

## Resultado

Não foi identificado outro erro de recomposição nas verificações executadas. Isso não constitui validação física dos modelos.

O mini-livro imprime uma grade de 190 × 134 mm numa folha A4 retrato. As instruções anteriores não explicavam que era necessário retirar as margens antes de dobrar o retângulo. Foi acrescentado contorno externo contínuo na impressão e instrução de recorte, preservando os vincos tracejados e o corte central.

## Verificações

- 109 testes Node aprovados: HEX/OCT, cubo invertível, seis Poly Puzzles, Sphericon, enquadramento, preparação da impressão do livro, fabricação digital e importação de projetos externos.
- Chromium/Playwright local: 47 casos, sem erros JavaScript. Incluem geração de HEX/OCT/cubo, seis puzzles, Sphericon, livro, 20 guias de origami, dez exportadores de fabricação e seis telas em largura de 390 px, sem transbordamento horizontal.
- 31 PDFs iniciais: HEX/OCT/cubo/Sphericon em uma página A4 paisagem cada; seis puzzles em duas páginas paisagem cada; livro em uma página retrato; 20 guias de origami em três a cinco páginas retrato, conforme o conteúdo.
- Uploads adicionais com imagens quadradas, verticais e panorâmicas: quatro fotos incorporadas em cada PDF de OCT/cubo e oito no PDF do livro. SVGs de OCT/cubo com XML válido e quatro imagens incorporadas.
- Após o ajuste do livro: 27 testes de impressão/enquadramento aprovados; PDF de uma página com oito imagens, contorno sólido e instruções de retirada das margens. Revisão visual dos PDFs de livro, Sphericon, puzzle de 21 peças e primeira página do guia Cachorro.

## Limites

Os testes foram executados sobre uma cópia local do código, não sobre o site publicado. Não houve montagem em papel, impressão física duplex, execução em impressora 3D ou laser, nem validação manual das dobras dos 20 origamis. A revisão não inclui o conteúdo pedagógico das atividades BNCC, REA e jogos. No Sphericon, a foto é acabamento dos setores, sem promessa de recomposição de uma imagem plana contínua.
