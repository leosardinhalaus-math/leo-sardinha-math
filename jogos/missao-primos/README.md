# Missão Primos

Atividade baseada no código de somatório enviado pelo usuário, reescrita como laboratório didático. A malha até 30, 100 ou 200 mantém o crivo completo visível, com inspeção de fatores, avanço manual, animação pausável e cinco desafios. Textos explicam definição de primo, exclusão do 1, início em p², limite √N e infinitude dos primos sem afirmar que todo produto de primos mais 1 é primo. Orientações relacionadas à EF06MA05, com aprofundamento para adolescentes.

## Implementação e memória

`core.js` exporta funções puras no Node e no Worker. Crivo segmentado de ímpares: 2 tratado à parte; uma marca por bit; reutilização do bloco; primos-base em Uint32Array. Três capacidades selecionáveis: 1, 8 e 32 KiB. N de 2 até 100.000.000. O total usa BigInt; subtotais inteiros de blocos em Number permanecem abaixo de 2^53 no limite autorizado, e são convertidos antes da acumulação. Não há lista de todos os primos. Primeiros 100, últimos 10 e frequências dos gráficos têm tamanho limitado.

A marcação inclui os bits-base e o bloco. O limite superior dos buffers numéricos soma também primos-base, frequências e amostras; não mede memória total de JavaScript, BigInt, Worker ou SVG. Em N = 100.000.000, bloco padrão: 8.817 bytes de marcação e 14.381 bytes de buffers numéricos, contra N + 1 = 100.000.001 bytes na marcação Uint8Array do código enviado. A comparação é calculada; o vetor antigo não é alocado. Em limites pequenos, o custo auxiliar pode superar a economia na marcação.

Worker para não bloquear a interface e cancelamento por terminate. Comparação por divisões somente até 100.000; sem listas duplicadas. Os tempos medem as implementações com suas respectivas estatísticas e variam por aparelho; não são benchmark universal.

## Gráficos

Frequências por até 20 intervalos, π(x) nos finais dos intervalos e histograma de diferenças entre primos consecutivos (última classe ≥32). Todos os primos contribuem para os dados. π(x) é apresentado como amostras ligadas, não como curva contínua exata. x/ln(x) é aproximação opcional. Valores acessíveis por foco/toque, tabelas, CSV e impressão. Sem gráficos ou leitores de terceiros. Tela pequena usa rolagem interna nos gráficos para manter rótulos legíveis.

## Validação

182 testes Node aprovados na suíte do site. Referências: N=10 → 4 primos, soma 17; N=100 → 25, soma 1060; N=1000 → 168, soma 76127; N=2.000.000 → 148933, soma 142913828922; N=100.000.000 → 5761455, soma 279209790387276. Comparação independente para limites pequenos, fronteiras de blocos, quadrados, diferentes capacidades e validação antes de alocar.

Chromium: peneira, inspeção, animação/pausa, cinco desafios, Worker real, comparação, N=2 e 3, N=2.000.000, cancelamento de N=100.000.000, CSV, PDF com resultados e três gráficos, foco nas barras e tela de 390 px sem transbordamento do documento. Prévia desktop revisada visualmente. O funcionamento não depende de serviços externos.
