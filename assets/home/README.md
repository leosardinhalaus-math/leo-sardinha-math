# Página inicial — escrita e revisão

## 1. Organização

A abertura apresenta dois caminhos principais: explorar o acervo e planejar uma aula. Quatro entradas conduzem aos filtros de Fundamental, Médio, Superior e professores. As etapas são sugestões de uso, explicitamente adaptáveis à turma; recursos de Cálculo estão no Superior.

Os destaques apresentam Matemática em Papel, Música em Círculo e fabricação digital. Uma chamada separada dá acesso às 96 atividades BNCC. O catálogo tem 14 recursos, com seis apresentados inicialmente e expansão progressiva. O conteúdo completo está no HTML e pode ser consultado sem JavaScript.

## 2. Escritor

Textos descrevem a ação possível em cada recurso: ouvir, criar, comparar, imprimir ou investigar. A frase principal e a identidade azul/amarela foram preservadas. Os números 96 atividades, 20 origamis e dez peças correspondem ao acervo disponível. Não foram acrescentadas promessas de resultados de aprendizagem, certificações ou vínculos institucionais.

As imagens são capturas reais de recursos autorais do próprio site, sem fotos enviadas por usuários:

- `musica.jpg`: CMaj7 na ordem das quintas, desenho inicial do simulador Música em Círculo.
- `papel.jpg`: molde HEX A4 com os quatro padrões vetoriais da galeria.
- `fabricacao.jpg`: pirâmide de base retangular no laboratório de medidas.

Capturas produzidas com Chromium, em JPEG. São prévias da interface/modelo digital, não fotos de objetos fabricados. Código e capturas autorais: CC BY-SA 4.0.

## 3. Revisor

A revisão visual corrigiu uma faixa branca na captura de música e substituiu setas sem suporte na fonte por um caractere legível. O cartão de Cálculo em Godot foi mantido como recurso separado; seu destino é gerado pelo workflow `.github/workflows/deploy.yml`, não um diretório versionado. O build anterior foi conferido como concluído com sucesso. A navegação anterior foi preservada.

Estilos adicionais ficam em `assets/home.css`, carregado somente pela página inicial; `assets/site.css` não foi alterado. `assets/home.js` controla menu, filtros, links por etapa e expansão da lista. Não há dependência de servidor, armazenamento de perfil ou biblioteca externa para esses controles.

Verificação em Chromium/Playwright:

- 14 recursos, seleção dos quatro públicos, contagem de resultados, dois passos de expansão e ocultação do botão ao esgotar a lista.
- Links diretos `#fundamental`, `#ensino-medio`, `#ensino-superior` e `#professores`; atalhos da abertura e reinicialização do filtro.
- Preservação dos destinos da página anterior; existência dos destinos locais e declaração da rota Godot no workflow de publicação.
- Imagens carregadas; ausência de erros JavaScript e de respostas HTTP de erro na navegação local.
- Larguras 320, 390, 768, 900, 1024 e 1440 px sem transbordamento horizontal.
- Menu móvel, estado `aria-expanded`, fechamento por Escape e retorno de foco ao botão.
- Primeiro atalho por etapa inteiramente visível sem rolagem na tela de 390 × 844.
- Sem JavaScript: 14 recursos e todos os links de navegação disponíveis; filtros inativos ficam ocultos.
- Inspeção visual das versões de computador e celular. Esta revisão não equivale a um estudo de uso com turmas nem a uma auditoria completa de acessibilidade.

## Concepção de aprendizagem

A seção Conheça o projeto apresenta a conversa e a investigação coletiva como constitutivas de um ambiente matemático. A frase é apresentada como formulação autoral inspirada em Mateus 18:20, sem ser tratada como citação literal ou como significado matemático do versículo. O convite para comparar estratégias em dupla também aparece na página Educação, na abertura das atividades BNCC e no roteiro de sala de aula do simulador musical.
