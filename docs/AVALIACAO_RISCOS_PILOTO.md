# Avaliação inicial de riscos — quatro atividades

**RASCUNHO PARA REVISÃO — NÃO VIGENTE.**

Data: 4 de novembro de 2026. Contextos: casa/famílias e escolas/cursos. Esta avaliação inicial cobre a cópia local das quatro atividades e interações limitadas. Não é um RIPD completo, auditoria integral de segurança ou autorização para uso com alunos. Evidências técnicas: EVIDENCIAS_PILOTO_2026-11-04.json.

## 1. Benefício e escolha de dados mínimos

O benefício proposto é explorar ideias matemáticas com explicação, experimentação e conversa acompanhada. A avaliação da aprendizagem deve considerar raciocínio e representações; um acerto isolado no jogo não é diagnóstico de capacidade ou nota escolar automática.

Não são necessários nome, foto, e-mail, matrícula, escola ou idade exata do estudante para as quatro aplicações funcionarem. O adulto configura a atividade e conduz a participação. A escola ou curso não precisa enviar listas de alunos para preparar o acesso. Dados técnicos de conexão e dados da autenticação do adulto continuam exigindo avaliação própria.

## 2. Fluxos revisados

| Atividade | Entrada e estado local | Saída e destinatário | Benefício pedagógico e mediação |
|---|---|---|---|
| Batalha Naval | Ano/conteúdo, posicionamento de peças, coordenadas e respostas; histórico em memória | Relatório de contas e CSV/PDF acionados pelo usuário; arquivos no aparelho | Coordenadas, operações e estratégia; conteúdo depende do ano selecionado; acompanhar competição e erros |
| Bingo de Frações | Seleção de frações, sorteio, marcações e desenhos locais | Cartela e representação na tela, inclusive modo de projeção | Representação e equivalência; usar material concreto quando adequado e evitar comparação constrangedora entre estudantes |
| Missão Primos | Limite N, tamanho do bloco, escolhas da malha e quiz; cálculo em Worker | Estatísticas, gráficos, CSV e impressão no aparelho | Divisibilidade e algoritmos, indicada a partir do 6º ano; números grandes medem cálculo do aparelho, não desempenho da criança |
| Música em Círculo | Notas, acordes, transformações, andamento e frequência; síntese sonora no navegador | SVG, fichas e PDFs locais; links externos opcionais podem abrir outros sites | Geometria, padrões, proporções e aritmética modular; selecionar o nível e oferecer leitura visual sem depender de áudio |

O portal mantém separadamente a sessão do adulto e seus controles. Cookies de sessão não foram testados por esta execução local das aplicações; são cobertos por verificações do servidor. Provedores podem tratar dados técnicos mesmo quando não há envio de respostas para nuvem pelo código da atividade.

## 3. Evidência observada no navegador

Em contexto novo de Chromium para cada aplicação, foram carregadas as páginas e executadas: seleção do modo e sorteio da frota na Batalha Naval; sorteio no Bingo; cálculo padrão até 1000 e download CSV em Primos; troca de círculo, transposição, síntese de acorde e download SVG em Música.

Nas interações observadas: nenhuma requisição para outra origem, nenhum erro JavaScript e nenhuma chave de localStorage/sessionStorage ou cookie criado pelas aplicações. A execução usou cópia local e CSP do piloto. Não abriu fontes externas, não percorreu todas as partidas, não mediu toda persistência possível (como caches ou histórico) e não inspecionou o provedor de hospedagem. Não permite afirmar que todo o site ou todas as ações sejam locais.

## 4. Matriz qualitativa inicial

| Risco ou necessidade | Quem pode ser afetado | Medida preparada ou existente | O que falta comprovar |
|---|---|---|---|
| Relacionar respostas a um aluno por contexto | Estudantes e turmas | Batalha usa Jogador 1/Equipe, sem campo de nome; instruir armazenamento restrito | CSV contém ano, horário e respostas; avaliar necessidade dessa granularidade antes de uso institucional e combinar destino, acesso e exclusão dos relatórios |
| Incentivo a identificar fichas de música | Estudantes | Na cópia local foram retirados Nome/Turma/Data da ficha e do gerador PDF; registro opcional sem identificação pessoal | Ajuste incluído nesta revisão autorizada para publicação; conferir impressão física e orientar que código ligado a uma lista de alunos também pode identificar |
| Arquivos e sessão em equipamento compartilhado | Adultos e estudantes | Cookie protegido, saída e expiração no servidor; orientação para perfil de navegador apropriado | Procedimento real da instituição para downloads, impressões, histórico e sessões; logout não é limpeza do dispositivo |
| Constrangimento por acertos/erros ou competição | Crianças e adolescentes | Previsão de respeito e acompanhamento nos termos; atividades não usam ranking infantil público no piloto proposto | Observar mediação e mensagens durante partidas; não projetar relatório individual identificado nem usar tempo de cálculo como classificação de alunos |
| Atividade inadequada à idade | Crianças mais novas e adolescentes | Notas de mediação no portal; Primos a partir do 6º ano; aprofundamentos separados no círculo musical | Conferência de conteúdo, classificação indicativa quando aplicável e linguagem por público; BNCC não é classificação indicativa |
| Barreiras de som, leitura, cor ou movimento | Estudantes com diferentes necessidades | Conteúdo textual, dados em tabela em Primos e áudio acionado pelo usuário em Música | Avaliação de acessibilidade, teclado/leitor de tela e necessidades reais; pausas e alternativa pedagógica preparada pela instituição |
| Links de referência para terceiros | Adultos e menores acompanhados | Referências são links opcionais; iframes são bloqueados pela CSP do piloto | Conferir destino e informação de saída; a CSP não impede navegação voluntária para outro site |
| Dados técnicos e tratamento no exterior | Adultos e possíveis menores usuários do aparelho | Escopos Google mínimos, sem perfil infantil no portal e Render em Oregon informado | Plano Hobby confirmado pelo responsável; referência de 7 dias no explorador de logs; captura mostra Set default em Log Streams, sem destino padrão configurado; verificar demais retenções, condições e mecanismo de transferência aplicável |
| Idade, vínculo e supervisão não demonstrados | Crianças e adolescentes | Lista privada de adultos e acompanhamento proposto | Mecanismos pertinentes ao ECA Digital e verificação adequada à base escolhida; login não comprova idade ou responsabilidade legal |
| Nova versão, integração ou recurso externo | Todos os participantes | Piloto limitado a quatro aplicações; demais caminhos bloqueados no modo supervisionado | Repetir avaliação antes de nova função, serviço externo, perfil ou mudança relevante; limites deste teste não valem automaticamente para versões futuras |

As medidas não receberam classificação residual de risco baixo: falta testar sua efetividade no contexto real. O critério de fechamento é evidência por item, e não uma pontuação numérica sem suporte.

## 5. Próximas decisões e verificações

- Responsável pelo projeto: decidir os fundamentos, medidas de proteção, operação dos canais, condições dos provedores e regras de acesso. O responsável confirmou o plano Hobby do workspace Render. A documentação informa 7 dias no explorador de logs; A captura de Log Streams mostra Set default, sem destino padrão configurado; demais retenções ainda precisam de confirmação própria.
- Família: receber informação, acompanhar e orientar o uso; isso não transfere para ela todos os deveres do projeto.
- Escola ou curso: definir papéis reais, responsável adulto, finalidade, arquivos no dispositivo e informação às famílias, usando FICHA_PREPARACAO_INSTITUCIONAL.md. Não preencher ou publicar dados de estudantes.
- Antes de liberar: demonstrar as medidas aplicáveis de idade, supervisão, segurança, acessibilidade e adequação etária e revisar as pendências jurídicas com o responsável.

## 6. Fontes e relação com a revisão

Esta avaliação aplica ao caso os critérios descritos em RELATORIO_REVISAO_LGPD_ECA.md e suas fontes oficiais: LGPD, ECA, ECA Digital e orientações da ANPD. Ela complementa o inventário e não substitui contratos, registros privados, verificação de produção ou a decisão documentada do responsável.
