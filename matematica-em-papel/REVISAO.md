# Matemática em Papel — modelos e geradores

## Correção: REA ilustrados e enquadramento das fotos

- Os dez modelos REA agora têm oito ilustrações autorais relacionadas às oito páginas: 80 imagens, sem símbolos genéricos como substitutos. Diagramas de água e Lua, frações, polígonos, cronologia, tempos verbais, quadrinhos, experimento, mapas e algoritmos.
- A galeria mostra uma ilustração do tema; Usar/Editar carrega as oito imagens. Imprimir aguarda a preparação. Baixar JSON incorpora as oito imagens PNG de 600×600, com atribuição CC BY-SA 4.0.
- Modelos REA usam fundo branco e texto escuro. As ilustrações acompanham as páginas quando o conteúdo é embaralhado e permanecem nos projetos JSON.
- Mini-livros: moldura quadrada fixa na largura útil de cada página. A coluna da grade é explícita, evitando que legendas curtas diminuam a foto. Preencher o quadrado é o padrão para fotos; Mostrar imagem inteira preserva as bordas. Há ajuste horizontal/vertical por imagem, salvo no JSON. Projetos antigos recebem configurações compatíveis.
- Caleidociclos: a normalização da foto considera o contorno real do modelo. Preencher cobre o hexágono ou quadrado sem distorção; Mostrar inteira inscreve toda a foto dentro do polígono, em vez de ainda cortar as bordas após ajustá-la a um quadrado intermediário. Miniatura e molde usam o mesmo arquivo enquadrado. A transformação dos setores para recompor a imagem montada foi preservada.

### Verificação

- 33 testes Node aprovados, incluindo 16 casos novos de foto vertical, horizontal, panorâmica e quadrada em HEX/OCT, nos modos preencher/preservar. Confirmam proporção, limites do recorte e contenção de todos os cantos da foto no polígono.
- Navegador: dez conjuntos com oito PNGs distintos cada; prévias relacionadas ao conteúdo; exportação/importação JSON com ilustrações; oito imagens no PDF A4; molduras quadradas ocupando toda a largura útil, em tela e impressão; ajuste de posição; larguras móveis de 390 px.
- Pixel de controle em foto uniforme confirmou que a geração aplica HEX e OCT efetivos, sem usar o índice de um callback como tipo de modelo.
- A opção Mostrar imagem inteira manteve os oito arquivos de teste completos em uma página A4, em computador e celular; a preparação assíncrona da impressão continuou passando.


## Correção: imagens dos livros dobráveis na impressão

- O botão de impressão agora aguarda a leitura dos arquivos, a decodificação de todas as imagens e a atualização do layout. Durante o carregamento, fica indisponível; uma falha informa o erro e não abre uma impressão incompleta.
- A grade do livro e a área de cada imagem têm dimensões explícitas. Textos e proporções dos arquivos não podem reduzir a imagem a zero.
- As imagens usam `object-fit: contain`, preservando o arquivo inteiro; o recorte automático com `cover` foi removido apenas dos livros dobráveis.
- Permanecem a ordem das oito páginas, a inversão da fileira superior, o corte central e o A4 retrato existente.
- Três testes de preparação da impressão: aguardar arquivo e oito decodificações; bloquear imagem corrompida; não imprimir outra aba quando a seleção muda durante a espera.
- Chromium/Playwright: oito arquivos alternando 1800×1000 e 800×1600, upload, botão de impressão, exportação/importação JSON e PDF em computador e celular. `pdfimages -list` confirmou as oito imagens com dimensões originais completas, em uma única página A4. No teste anterior, as imagens eram incorporadas com partes cortadas.
- A correção cobre os formatos aceitos pelo campo: JPG, PNG e WEBP.


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

A aba Modelos reúne HEX, OCT, cubo invertível personalizável, Poly Puzzle, Sphericon e mini-livro, com ilustrações e atalhos. Prévia dos caleidociclos e do Sphericon calculada a partir das superfícies em 3D. Onze abas navegáveis por teclado e URLs diretas #poly-puzzle, #sphericon e #modelos. Links descritivos atualizados na página inicial e em Educação.

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

- **HEX:** seis pirâmides, 24 faces triangulares, quatro composições hexagonais. Base e altura da face: 42 mm.
- **OCT:** oito pirâmides, 32 faces triangulares, quatro composições quadradas. Base: 45 mm. Altura: 45/√2 mm.
- Quatro entradas individuais para JPG, PNG ou WEBP até 5 MB; FileReader e verificação de decodificação.
- Recorte central ou imagem completa, com zoom e posição horizontal/vertical por foto. A miniatura usa o mesmo recorte do molde.
- Galeria de quatro padrões vetoriais originais, sem downloads ou dependências externas.
- As quatro imagens são repartidas em setores e transformadas para os triângulos. Cada triângulo recebe um setor da foto, sem repetição da foto inteira em todas as peças.
- A numeração dos setores, a orientação e o centro da imagem acompanham a paridade das dobradiças e a face revelada.
- Molde contínuo com abas C e fechamento F1/F2, legenda de corte/vale/montanha e instruções.
- Impressão de uma página A4 paisagem a 100% e download de SVG independente com as quatro imagens incorporadas.
- **Cubo invertível:** gerador local com quatro fotos, seis pirâmides alternadamente espelhadas e 24 triângulos. A planificação preserva as arestas 1, 1, √3, 2, 2 e √5 do tetraedro de Schatz. Seis peças separadas, abas a/b/c e dobradiças J1–J6 com extremos A/B/C/D identificados. PDF A4 paisagem em uma página e SVG independente.

## Verificação

`node --test tests/kaleidocycle-geometry.test.cjs` — dez testes aprovados:

- Contagem e congruência das faces, bordas do contorno, pares de abas e dimensões de impressão.
- Construção independente dos anéis em 3D, com dobradiças consecutivas ortogonais e fechamento das extremidades.
- Em cada uma das quatro posições de revelação de HEX e OCT, uma única transformação global da imagem recompõe todos os setores. Erro numérico inferior a 10⁻¹⁰. Esta verificação detectou e corrigiu o deslocamento dos setores do OCT em duas faces.

Chromium/Playwright: quatro campos de fotos, troca de modelo, recorte, upload válido/inválido, geração, invalidação do resultado antigo, download SVG, ausência de erros JavaScript e largura móvel de 390 px. HEX e OCT exportados em uma página A4 paisagem cada; XML dos SVGs exportados válido. Revisão visual do formulário e dos moldes gerados.

A validação matemática cobre HEX, OCT e o cubo de Schatz, incluindo a recomposição das imagens nas posições de revelação. Não substitui montagem física com papel, cola e tolerâncias reais; essa montagem não foi realizada.

## Referências

- Referência de produto e fluxo: imagem de FoldPlay enviada pelo usuário. Interface e código novos; sem reutilização de imagens ou código do FoldPlay.
- Geometria e montagem: Jürgen Köller, [Kaleidocycles — Mathematische Basteleien](https://www.mathematische-basteleien.de/kaleidocycles.htm). As proporções de HEX e OCT seguem os modelos fechados de seis e oito pirâmides.
- Padrões da galeria e implementação autorais: CC BY-SA 4.0. Fotos enviadas conservam seus próprios direitos.

## Outros módulos

Origamis, mini-livros, banco de REA e jogos foram preservados. A presente revisão se concentra no gerador fotográfico solicitado na última referência; não constitui validação física ou redesenho das sequências de origami existentes. Os outros módulos mantêm seus próprios controles de JSON e impressão.

## Cubo invertível — personalização

Construção analítica própria a partir de Marcus Engel, [M.C. Escher Kaleidocycles (2003)](https://www.polyhedra-world.nc/stuff/AniKa/kaleidocycles_theory.pdf), seção do cubo invertível. Não utiliza a proporção isósceles dos modelos HEX/OCT.

`node --test tests/invertible-cube.test.cjs` verifica a rigidez de todas as arestas e o fechamento das seis dobradiças em 96 posições do ciclo, a alternância de orientação, as dimensões das planificações e a recomposição das quatro fotos sem sobreposição dos setores. O mapeamento das imagens usa as projeções frontal/traseira em duas posições de revelação, com uma transformação afim independente por face.

Chromium/Playwright: quatro arquivos, geração de 24 faces, quatro imagens incorporadas, impressão em uma página A4 paisagem, download SVG e troca entre cubo, HEX e OCT. Recorte com preenchimento ou foto inteira também testado no contorno triangular. Montagem física não realizada.

## Ampliação para impressão

HEX ampliado de 34 para 42 mm (+24% nas dimensões); OCT de 38 para 45 mm (+18%). No cubo invertível, a dobradiça passa de 14 para 18 mm (+29%), girando três planificações em 90° para aproveitar os espaços horizontais. Todos conservam as proporções geométricas e uma página A4 paisagem, com as abas dentro da área imprimível.

## Escolha do papel

O gerador de HEX, OCT e cubo invertível oferece A5, A4 (padrão), A3, Carta, Ofício (330 × 216 mm), Legal e Tabloide. Todos em paisagem, com margem de 10 mm. A planificação, as fotos e as abas recebem a mesma escala, centralizadas na área útil; as cotas impressas acompanham a escala. A seleção invalida o molde anterior e preserva as fotos. O SVG exportado incorpora as dimensões físicas do papel útil e o nome do formato. O tamanho da página PDF é atualizado via regra @page nomeada, sem alterar os outros módulos.

Verificação em Chromium: geração, invalidação e PDF de uma página nas combinações de modelos e formatos, dimensões físicas do PDF, textos atualizados e largura móvel de 390 px.

## Atividades por ano — BNCC

Nova aba Atividades BNCC, em `#atividades-bncc`, com 24 atividades autorais (duas para cada ano do 1º ao 9º do Fundamental e cada série do Médio). Cada ficha inclui objetivo, materiais, tempo, roteiro, ilustração, questões para registro, respostas comentadas, critérios de observação, apoio de acessibilidade e atalho para o recurso relacionado. Seleção por ano/série, impressão individual ou das duas atividades da turma, com orientações do professor opcionais.

Códigos conferidos no [PDF oficial do MEC](https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf). Habilidades apresentadas em sínteses autorais, com ligação à página do código no documento. A seriação do Ensino Médio é expressamente uma sugestão pedagógica do site: a BNCC não fixa EM13MAT por série (explicação do código na página PDF 36). A coleção explora habilidades selecionadas; não pretende cobrir todo o currículo.

Validação em Chromium: 12 seleções, 24 fichas com ilustração, 24 PDFs (versões aluno e professor de cada ano), duas páginas por PDF, ausência de respostas na versão do aluno, impressão individual, preservação da turma ao voltar de um recurso e largura móvel de 390 px. Revisão visual da ficha e do PDF. Testes do catálogo verificam anos completos, identificadores únicos e correspondência dos códigos EF ao ano.

## Ampliação do acervo e fabricação digital

- Atividades BNCC: de 24 para 96, oito por ano/série (1º ao 9º do Fundamental e três séries do Médio). Os 24 roteiros anteriores foram mantidos e 72 novos foram redigidos com problemas, perguntas e respostas próprios; todos preservam objetivo, habilidade, materiais, evidências e apoios. Algumas propostas avançadas se conectam à nova aba de fabricação digital.
- Origamis: de oito para 20 modelos. Acrescentados gato, raposa, tulipa plana, copo de papel, envelope, marcador de canto, leque, folha sanfonada, casinha, base pipa, livro sanfonado e peixe plano. Cada novo modelo tem base de papel, nível, foco matemático e esquemas vetoriais por etapa. As dobras são esquemas de apoio; montagem física não foi realizada.
- Nova aba `#fabricacao-digital` (3D e Laser): fundamentos de geometria, medidas, escala, tolerância e investigação; relação explícita com competências da BNCC e com os objetivos do Mais Ciência na Escola; oito projetos com evidências de aprendizagem e referências para o professor. A progressão do Médio é sugerida pelo site. Articulação pedagógica autoral, sem vínculo institucional presumido.
- Fontes: BNCC oficial do MEC; [Decreto nº 12.049/2024, arts. 2º e 3º](https://www2.camara.leg.br/legin/fed/decret/2024/decreto-12049-11-junho-2024-795750-publicacaooriginal-172028-pe.html); perguntas frequentes da chamada CNPq 13/2024 como referência histórica; documentação Prusa e Epilog para princípios de camadas, materiais e exaustão. Não são apresentados editais antigos como inscrições abertas.
- Planejador paramétrico: placa retangular com furo central exportada em SVG nominal com dimensões físicas em mm; prisma retangular maciço exportado em STL fechado, com orientação externa. Contas de área, contornos, volume e camadas ideais. Campos são validados e os arquivos exigem preparação no software de fabricação/fatiamento; não incluem instruções de máquina. A avaliação do laboratório considera uso responsável, material aprovado, acessibilidade e revisão de protótipo.

Verificação: 123 testes Node aprovados. Teste geométrico independente do STL verifica volume, 12 triângulos, orientação e duas incidências opostas por aresta; SVG verificado quanto a unidades e contornos. Chromium: 96 fichas nos 12 anos, PDFs aluno/professor com oito páginas por ano, navegação e atalhos, 20 modelos de origami, download SVG/STL, bloqueio de entradas inválidas e largura móvel de 390 px. Guia de fabricação digital exportado em cinco páginas A4; dois novos origamis amostrados em uma página cada. Nenhuma operação real de impressora 3D ou cortadora foi executada.

## Variação de peças e projetos externos

Laboratório ampliado para dez modelos: placa retangular com furo, disco/arruela, polígono regular com furo e triângulo retângulo em SVG; prisma retangular, cilindro, cone, pirâmide de base retangular, prisma triangular reto e esfera em STL. Campos visíveis acompanham cada peça. Área e volume são analíticos; os sólidos curvos usam malhas trianguladas aproximadas e a interface explica essa diferença. Todos os sólidos são maciços; furos pertencem às opções 2D.

A nova aba `#projetos-externos` importa arquivos locais SVG, STL binário/ASCII, OBJ e JSON exportado pela própria aba. Permite prévia, giro da malha, interpretação da unidade, dimensões da caixa envolvente, área dos triângulos e uma checagem limitada de incidência/orientação de arestas. Autoria, licença, ano, habilidades e notas são campos declarados pelo usuário. O JSON guarda arquivo, ficha e unidade; o arquivo original pode ser baixado separadamente. Não há envio a um servidor nem galeria pública: a importação e a ficha permanecem na memória do navegador até o usuário exportar.

SVG: reconstrução da prévia com lista permitida de geometrias e atributos, sem scripts, eventos, imagens, referências externas ou efeitos. O original é preservado como arquivo; a prévia é simplificada. Limites: 2 MB de texto SVG; malhas com até 50.000 triângulos e 10 MB; JSON incorporado de até 14 MB. OBJ aceita triângulos e polígonos convexos planos de até 32 vértices; faces côncavas precisam de triangulação na origem. Não se afirma reparo ou validação completa para fabricação.

Verificação: 133 testes Node aprovados; as seis malhas geradas têm duas incidências opostas por aresta, volume orientado positivo e erro de volume abaixo de 1% nos sólidos curvos. Parsers STL binário/ASCII e OBJ testados com arquivos válidos e inválidos. Chromium: dez prévias e dez downloads; SVG com script/eventos/referências externas sem execução ou requisição externa; importação de STL e OBJ; reabertura de JSON com autoria/licença/unidade preservadas; navegação sem perda da ficha; entradas inválidas e largura móvel de 390 px. Fabricação física não realizada.
