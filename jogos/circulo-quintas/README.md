# Música em Círculo

Atividade autoral de Leo Sardinha.Math, CC BY-SA 4.0, ligada pela página Educação. HTML, CSS e JavaScript locais, sem bibliotecas, gravações de terceiros ou requisições necessárias ao funcionamento do simulador. A referência audiovisual foi usada para compreender o pedido, não redistribuída.

## Exploração

- Ordens cromática e de quintas; dez tipos de acordes e seleção livre das classes de altura.
- Transposição Tₙ(x) = x + n e reflexão Iₙ(x) = n − x, módulo 12, com comparação anterior e eixo de reflexão.
- Contorno poligonal ou ligações de todos os pares; rastros limitados às últimas 24 coleções. Tétrade: 4 arestas no contorno, 6 em K₄.
- Gerador com salto de 0 a 11 e ponto inicial escolhido; período 12/mdc(k,12). A animação inclui a posição inicial e o retorno final.
- Progressão editável com até 32 acordes; dois tempos por acorde, um por posição no gerador. Andamento ajustável. Playback finito, parada explícita e ao sair da página/ocultar a aba.
- Áudio sintetizado pela Web Audio API, iniciado somente por ação do usuário. Acorde, arpejo, disposição das vozes e comparação de quinta pura/temperada. Baixo/inversão de vozes mantém o conjunto de classes; não representa Iₙ.
- Exportação do desenho como SVG independente, com estilos e fundo incorporados. Ficha de investigação imprimível em uma página A4; respostas do professor ficam fora da impressão.

## Revisão conceitual

A posição no círculo de quintas é 7x módulo 12, pois 7 é seu próprio inverso módulo 12. Transpor n semitons gira n posições cromáticas ou 7n posições na ordem de quintas; trocar entre as duas representações reordena os vértices e pode alterar o formato. D₁₂ designa, explicitamente, o grupo de 24 simetrias do dodecágono. A progressão não é afirmada como um ciclo no grafo das notas; uma envoltória cardioide tampouco é inferida do acúmulo de cordas.

O modelo discreto identifica classes enarmônicas na afinação temperada. Os nomes mostrados são identificadores de classes e não resolvem toda a ortografia harmônica. O código detecta um nome possível para conjuntos de notas conhecidos; coleções simétricas podem admitir mais de uma fundamental. A sequência inicial é um exemplo livre, não a transcrição do vídeo.

A comparação de afinação usa (3/2)^12 / 2^7 = 531441/524288 ≈ 1,01364326477, equivalente a 23,46001038 cents. A quinta temperada é 2^(7/12); seu ajuste em relação à pura é aproximadamente 1,955 cent. A explicação não atribui toda a história do temperamento a um único motivo.

## Fundamentos e fontes

- [Open Music Theory: pitch-class sets and transformations](https://viva.pressbooks.pub/openmusictheory/chapter/pc-sets-normal-order-and-transformations/).
- [John Baez: The Mathematics of Tuning Systems](https://math.ucr.edu/home/baez/tuning_talk/).
- [BNCC oficial, MEC](https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf): EF06MA05/06 (PDF p.303), EF07MA21 (p.311), EF08MA18 (p.317), EM13MAT105 (p.535) e EM13MAT304 (p.538). Articulação pedagógica autoral; teoria de grupos é aprofundamento, não uma habilidade nomeada da BNCC. No Ensino Médio, a distribuição por série depende do currículo local.

## Verificação

`node --test tests/music-circle.test.cjs`

Testes independentes cobrem todos os saltos e inícios, acordes do exemplo, enarmonia, limite do parser, 24 permutações distintas, fechamento por composição, relações de D₁₂, posições geométricas, conservação das cordas sob transposição, contagens de arestas, invariância de classes nas disposições de vozes, frequências e coma pitagórico.

Chromium/Playwright: construção de acordes, T₇ nas duas ordens, I₀ aplicada duas vezes, modos de ligação, ciclo de salto 4, osciladores Web Audio, progressão completa, parada, entrada inválida como texto, SVG independente, PDF de uma página, largura móvel de 390 px, seleção por teclado e link na página Educação. O teste de áudio verifica geração e parâmetros; não substitui avaliação de escuta em diferentes dispositivos.
