# Listas por habilidade

Nova aba da Área do Professor com cinco listas fixas de cinco questões para cada uma das 38 habilidades cadastradas nos guias de Álgebra (16) e Geometria (22), do 1º ao 5º ano. Total: 190 listas e 950 questões, com gabaritos e critérios para respostas abertas.

## Uso

Abra `professor/listas/`. Escolha área, ano, habilidade e lista. O endereço registra a seleção (`?habilidade=EF05MA13&lista=2`). Os guias possuem um link direto para as listas da habilidade selecionada e a aba oferece o caminho de volta.

O gabarito começa fechado e fecha novamente ao trocar de seleção. Impressão do aluno e impressão de gabarito são separadas, mesmo se as respostas estiverem visíveis na tela. O botão “Imprimir 5 listas” reúne somente as cinco listas da habilidade atual. Para gerar PDF, use “Salvar como PDF” na janela de impressão.

As cinco listas oferecem variações de prática, não uma classificação automática de dificuldade. Os descritores mantêm as sínteses pedagógicas dos guias existentes. As questões são novas; não são itens oficiais de avaliação do MEC. Referência curricular: https://basenacionalcomum.mec.gov.br/.

## Manutenção

- `index.html`, `style.css`, `app.js`: interface estática e desenhos SVG, sem dependência externa em tempo de uso.
- `data.js`: banco fixo com questões, respostas, critérios e descritores de figuras.
- `../../tools/build-exercise-lists.py`: gerador determinístico. Lê os descritores existentes nos dois guias e grava o banco. Requer somente Python padrão.
- `../../tools/check-exercise-bank.py`: checa cobertura, contagens, IDs, 25 questões distintas por habilidade, limites das malhas e respostas das sequências repetitivas.
- `../../tools/check-exercise-ui.cjs`: navega pelas 190 listas em Chromium usando Playwright; testa filtros, links, histórico, impressão e largura de 390 px. Requer Playwright instalado; `CHROMIUM_EXECUTABLE` pode apontar para um navegador compatível já instalado. Capturas e PDFs de teste vão para `/tmp/`.

```sh
python3 tools/build-exercise-lists.py
python3 tools/check-exercise-bank.py
node --check professor/listas/app.js
node tools/check-exercise-ui.cjs
```

## Validação em 24/09/2026

- 38 habilidades vinculadas aos descritores originais; 190 listas e 950 questões.
- 25 questões distintas dentro de cada habilidade, considerando enunciado e figura.
- Todas as 190 listas e seus gabaritos renderizados no navegador; zero erros JavaScript.
- Links entre guia e lista, filtros, histórico e recuperação de URL inválida conferidos.
- Layouts de desktop e 390 px inspecionados; sem rolagem horizontal nos casos testados.
- Impressão A4 de uma lista, das cinco listas e do gabarito conferida. Na amostra EF01MA10, cada lista ocupou uma página e o conjunto ocupou cinco; habilidades com mais desenhos podem ocupar mais páginas.
- As folhas do aluno não incluem o gabarito. O PDF de respostas inclui somente o material do professor.

Não houve teste em impressora física nem em Safari/Firefox ou em todos os modelos de celular. Questões abertas exigem leitura do professor e aceitam soluções coerentes além dos exemplos. As questões numéricas foram elaboradas com valores determinísticos e gabaritos correspondentes; a revisão pedagógica pode ajustar a linguagem ao contexto da turma.
