# Malba Tahan · Histórias para pensar

Seção integrada ao Leo Sardinha.Math, em `malba-tahan/`, com entradas pela página inicial e pela página Educação. Implementação estática; não exige instalação nem serviço externo. Todos os recursos são locais.

## Escrita e edição

Foram selecionados oito episódios ou temas dos dois PDFs enviados. Os recontos, diálogos, comandos e roteiros são textos próprios de adaptação educativa; os livros não são distribuídos na seção. Cada oficina informa capítulo ou seção de origem. As variantes são identificadas como adaptações, sem atribuir ao autor números inventados pelo gerador.

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

Cada oficina apresenta um reconto de aproximadamente 630 a 680 palavras em sete etapas, com encontro, impasse, hipótese, investigação, desfecho, nova pergunta e epílogo. O percurso se inspira no jogo existente em `jogos/35-camelos/`, preservado. As falas e cenas são recriadas e identificadas como recontos autorais.

As etapas incluem duas perguntas com alternativas e comentários, registro de hipótese (com opção de continuar sem registrar), cálculo, pistas e consulta assistida à resolução. O avanço após o cálculo depende de resposta conferida ou escolha de estudar a solução. Há navegação para voltar e acesso direto ao desafio.

Cada oficina também oferece novos exemplos, uma resolução comentada, espaço de reflexão e roteiros com materiais acessíveis. A impressão mantém o exemplo atual. O guia do professor inclui respostas; a ficha do estudante não inclui a resolução. Os PDFs reunidos usam uma seleção fixa de exemplos, distinta dos sorteios da interface.

A chave do último exemplo é guardada localmente para evitar repetição imediata entre visitas quando o navegador permite. Sem armazenamento, os desafios continuam funcionando. Os registros escritos ficam apenas na página aberta e são descartados ao trocar de desafio. Nenhum dado é enviado a servidor.

## Verificação

- 4.000 exemplos: partilhas, divisores, somas, quadrados, respostas e variação sem repetição imediata.
- Teste em Chromium: oito oficinas, respostas corretas, filtro por livro, troca de modo, nova rodada, impressão e largura de 390 px; sem erro JavaScript.
- PDFs: histórias ampliadas nas fichas do estudante e recontos completos com desfechos e resoluções no guia; verificação textual da separação de respostas e inspeção visual.

## Ampliação das histórias

A atualização desenvolveu os oito recontos em 56 etapas no total. O caderno do estudante passou a 17 páginas e o guia do professor a 31 páginas. O estudante recebe o desenvolvimento narrativo até a investigação, sem desfecho numérico antecipado. O guia reúne as sete cenas e as resoluções.

Verificação da atualização: 160 exemplos de narrativas conferidos com seus dados; oito percursos completos no Chromium, com as 56 etapas, escolhas, hipóteses, conferência, consulta assistida, nova rodada e modos de tela e papel. Larguras de 320, 390 e 768 px verificadas, sem transbordamento horizontal.

## Personagens em estilo anime

Quatro ilustrações originais apresentam os personagens em contextos de viagem, mercado, salão e jardim. Beremiz e seu companheiro mantêm a mesma referência visual. As imagens representam personagens dos recontos; não são retratos do autor.

O elenco aparece em uma galeria, nos cartões das oito aventuras e ao lado das etapas narrativas. As imagens possuem descrição alternativa quando informativas; nos cartões, a imagem é decorativa porque o título já identifica a aventura. Os arquivos WebP são locais, com dimensões reservadas e carregamento tardio na galeria. As ilustrações evitam quantidades e resultados que poderiam antecipar as respostas dos desafios.
