# Verificação dos origamis — 7 de novembro de 2026

Leitura dos 20 roteiros e suas 166 etapas, incluindo ações, camadas, vistas, setas e vincos. Esta revisão é de coerência editorial e de geometria pontual dos esquemas, não uma certificação de montagem física.

## Correções

- Cachorro: a seta do focinho partia de y=110, fora do contorno que terminava em y=90. A seta agora parte da ponta desenhada, chega a y=58 e usa o vinco médio y=74. O contorno final e a aba foram ajustados ao mesmo vinco.
- Coração: a ponta inferior deve alcançar a borda superior y=32,5; o vinco fica em y=73,75. O desenho anterior colocava a base resultante em y=87,5. Ajustados contorno, aba, seta e vinco.
- Sapo: removido um vinco horizontal antecipado na base do quadrado superior. Na etapa seguinte, o vinco horizontal passa pelo cruzamento das diagonais, em y=32,5.
- Casinha: após marcar apenas o lado esquerdo, o desenho não antecipa mais o vinco do lado direito.
- Livro sanfonado: após dividir apenas o primeiro quarto, o desenho não antecipa mais a divisão dos outros três quartos.
- Leque e folha sanfonada: instruções distinguem alternar vale/montanha de virar o conjunto, evitando uma dupla inversão. O leque esclarece qual ponta do pacote comprimido deve ser presa.

## Verificação executada

- 113 testes Node aprovados, incluindo quatro novos testes de origami: presença e continuidade das vistas nas 166 etapas, reflexão das setas com vinco explícito, ponta do cachorro e posição do vinco do coração.
- Os testes específicos do cachorro e coração falham no código anterior e passam com os ajustes.
- Chromium/Playwright: 20 modelos, 166 etapas, navegação para exibir o roteiro completo, 20 PDFs com todos os blocos de conferência presentes, sem erros JavaScript. Largura de 390 px sem transbordamento horizontal.
- Os PDFs ocupam de três a cinco páginas retrato, conforme o roteiro. Revisão visual dos cartões corrigidos de cachorro, coração, sapo, casinha e livro sanfonado.

## Referências e limites

As sequências textuais de raposa e sapo foram comparadas às referências já vinculadas no gerador:
- https://origami.me/fox/
- https://www.origami-fun.com/origami-jumping-frog.html

A referência da estrela transformável e a da casinha não puderam ser recuperadas pela ferramenta de consulta; não são apresentadas como verificadas externamente. Caixa, estrela, sapo, cisne, raposa, marcador, casinha e peixe incluem manipulações de camadas ou volumes que precisam de conferência prática. Não houve montagem em papel dos 20 modelos. Os esquemas continuam simplificados, sem simulação de espessura, oclusão de camadas ou cinemática completa. A continuidade dos nomes das vistas e a paginação não provam que cada dobra física é executável.
