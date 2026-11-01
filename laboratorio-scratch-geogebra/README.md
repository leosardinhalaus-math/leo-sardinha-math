# Laboratório Scratch e GeoGebra

Três atividades: coordenadas (6º/7º), frações (5º/6º) e polígonos musicais (anos finais/EM). Cada uma oferece um explorador SVG local, dois roteiros de seis etapas (36 etapas no total), conferências, proposta de modificação e registro para download. A impressão contém o roteiro completo da ferramenta selecionada.

Os três projetos Scratch .sb3 são originais, com assets SVG próprios e blocos editáveis. Regeração: `python scripts/build-scratch-examples.py`. São abertos no editor oficial via Arquivo → Carregar do seu computador. O leitor incorporado é o TurboWarp, explicitamente identificado como outro projeto, com project_url apontando ao arquivo público deste site. Não há publicação em conta Scratch.

As construções GeoGebra são criadas por comandos, disponíveis na página e enviados ao applet ao carregar. O botão de exportação .ggb só fica disponível após a API confirmar a criação. Coordenadas: ponto arrastável e projeções; frações: barras com controles d e k, caso unitário; música: tétrade transponível no círculo de quintas. Os leitores externos são carregados somente quando solicitados; falhas mantêm o explorador local e instruções disponíveis.

Validação: 169 testes Node aprovados. Chromium: navegação dos seis roteiros, respostas, restauração, downloads, tela de 390 px sem transbordamento, seis PDFs com as 36 conferências. Projetos carregados e executados no scratch-vm: cinco pares corretos em dez perguntas; frações 2/3 = 6/9; transposição musical por espaço. A VM foi executada sem renderizador: testou blocos, variáveis e fluxo, não a rasterização das canetas.

O ambiente bloqueou acesso HTTP aos domínios GeoGebra e TurboWarp (403). A integração GeoGebra foi verificada com API simulada para as três construções; o carregamento visual nos serviços externos não pôde ser confirmado. A página informa a dependência de internet e oferece comandos para reprodução. Não se apresenta a simulação da API como validação do motor matemático GeoGebra.

Roteiros, código e assets originais: CC BY-SA 4.0. Ferramentas externas mantêm suas próprias licenças.
