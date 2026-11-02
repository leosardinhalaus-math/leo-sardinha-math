# Malba Tahan · Histórias para pensar

Seção integrada ao Leo Sardinha.Math, em `malba-tahan/`, com entradas pela página inicial e pela página Educação. Implementação estática; não exige instalação nem serviço externo. Todos os recursos são locais.

## Escrita e edição

Foram selecionados oito episódios ou temas dos dois PDFs enviados. As aberturas, os comandos e os roteiros são textos próprios de adaptação educativa; os livros não são distribuídos na seção. Cada oficina informa capítulo ou seção de origem. As variantes são identificadas como adaptações, sem atribuir ao autor números inventados pelo gerador.

A apresentação do autor foi conferida nos Clubes da OBMEP: https://clubes.obmep.org.br/blog/bb_malba-tahan/

As descrições de habilidades são sínteses pedagógicas verificadas no documento oficial da BNCC, pp. 301–304 e 313–314: https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf

O foco é o 6º ano. A oficina do tabuleiro inclui extensão para o 8º ano. As associações indicam objetivos e evidências concretas, sem apresentar cobertura integral ou certificação do MEC.

## Revisão matemática

- Camelos: as frações somam 17/18. Acrescentar um animal altera a base de cálculo. A sobra antes de devolver o empréstimo é distinguida da sobra posterior; o acordo não cumpre literalmente as parcelas sobre a herança inicial. Variantes usam 36k − 1 camelos, com k entre 1 e 6.
- Pães: consumo igual entre três pessoas, pães de mesmo tamanho, recompensa proporcional à contribuição efetiva para a convidada. Para contribuições a e b, as moedas são 2a − b e 2b − a quando a recompensa é a + b moedas. Os pares gerados mantêm ambas as contribuições positivas.
- Quatro quatros: alvos de 0 a 9 com soluções garantidas usando quatro algarismos 4 e as quatro operações. O analisador não executa código; recusa concatenação, potências, entradas estranhas e divisão por zero. Outras expressões válidas são aceitas.
- Vasos: os exemplos gerados têm 3, 6, 9 ou 12 de cada tipo. O verificador exige igualdade do número de vasos, do líquido e preservação de todo o estoque. A extensão do caso original com 7 de cada tipo traz uma distribuição válida.
- Xadrez: última casa e total são separados. As variantes pequenas usam inteiros exatos no JavaScript. Os valores de 64 casas aparecem como constantes textuais exatas; não há cálculo impreciso com `Number` para esse total. Notação científica é uma aproximação explicitamente identificada.
- Quadrados mágicos: transformações afins do Lo Shu, rotações e reflexão preservam as três linhas, três colunas e duas diagonais. Os números são distintos e as três lacunas são recuperáveis a partir das pistas.
- Números amigos: listas de divisores positivos próprios, exclusão do próprio número e reciprocidade. Não são repetidas as contagens antigas de pares conhecidos nem a afirmação antiga de infinitude.
- Perfeitos: soma de divisores próprios comparada com o número; classificações deficiente, perfeito e abundante. O termo perfeito é apresentado como definição matemática.

## Digital e analógico

Cada oficina oferece novos exemplos, pistas, uma resolução comentada, espaço de reflexão e roteiros com materiais acessíveis. A impressão mantém o exemplo atual. O guia do professor inclui respostas; a ficha do estudante não inclui a resolução. Os PDFs reunidos usam uma seleção fixa de exemplos, distinta dos sorteios da interface.

A chave do último exemplo é guardada localmente para evitar repetição imediata entre visitas quando o navegador permite. Sem armazenamento, os desafios continuam funcionando. Os registros escritos ficam apenas na página aberta e são descartados ao trocar de desafio. Nenhum dado é enviado a servidor.

## Verificação

- 4.000 exemplos: partilhas, divisores, somas, quadrados, respostas e variação sem repetição imediata.
- Teste em Chromium: oito oficinas, respostas corretas, filtro por livro, troca de modo, nova rodada, impressão e largura de 390 px; sem erro JavaScript.
- PDFs: oito páginas no caderno e dezesseis no guia; verificação textual da separação de respostas e inspeção visual.
