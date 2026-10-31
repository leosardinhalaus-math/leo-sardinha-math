# Matemática em Papel — entrega e revisão

Protótipo em um único index.html, sem dependências externas.

## Implementado
- Caleidociclos: redes de 6, 8, 10 e 12 módulos tetraédricos (4 faces triangulares por módulo), imagens, seis padrões, cores, numeração, abas, vincos, impressão e rotação da rede plana.
- Origamis: cachorro, coração, barquinho, avião, caixa, estrela modular, sapo e cisne; sequências específicas, diagramas SVG e quadrado guia.
- Mini-livro: oito páginas, temas, textos, imagens, embaralhamento e imposição de impressão.
- REA: ciclo da água, fases da Lua, frações equivalentes, linha do tempo, formas geométricas, verbos no tempo, história em quadrinhos, experimento, mapas e paisagens, algoritmos em papel. Sete áreas. Licença CC BY-SA 4.0 para os modelos autorais.
- Jogos: frações, tabuada, ângulos, polígonos e sequências; três níveis, dez rodadas, feedback e pontuação.
- Exportação e importação JSON incluindo imagens; impressão/PDF pelo navegador.

## Revisão e correções
- Conteúdo inserido via textContent; sem eval ou HTML de usuário.
- JPG/PNG/WEBP até 5 MB, máximo de oito imagens e verificação de decodificação.
- JSON com versão, cores, valores permitidos e validação de data URLs.
- Mini-livro: imposição 5/4/3/2 e 6/7/8/1, rotação superior e corte central somente na impressão.
- Impressão A4 sem navegação e controles; remoção de limite que poderia cortar o conteúdo dos origamis.
- Teclado nas abas, foco visível, labels, feedback anunciado e preferência por movimento reduzido.
- Links na página inicial e em Educação.

## Verificação
Chromium/Playwright: cinco módulos, oito origamis, dez REA, cinquenta rodadas, upload, ida e volta JSON, texto com marcação não executado, largura de 390 px sem transbordamento e ausência de erros JavaScript. Mini-livro exportado em uma página A4.

## Limites
A montagem física dos caleidociclos e das sequências de origami não foi validada com papel. As redes são protótipos e exigem teste de montagem antes do uso em turma. A animação gira a rede plana, sem simular o mecanismo tridimensional. “6/8/10/12 faces” foi interpretado como quantidade de módulos tetraédricos para evitar confusão com a contagem de faces triangulares. Não há servidor nem sincronização de projetos; use JSON para guardar o trabalho.

## Uso
Abra a seção, selecione uma aba, personalize e imprima em A4 a 100%, sem cabeçalhos e rodapés. Ative gráficos de fundo para cores. Consulte as instruções de montagem na própria seção. Para salvar ou continuar depois, baixe e abra o JSON.
