# Proposta de operação — piloto acompanhado

**RASCUNHO PARA REVISÃO — NÃO VIGENTE.**

Preparada em 4 de novembro de 2026 para decisão de Leonardo Sardinha, contato leosardinhalaus@gmail.com. Não altera configurações nem libera alunos. Os prazos propostos abaixo só se tornam compromissos após adoção e implementação do procedimento.

## 1. Escopo proposto

Entrada por adulto previamente autorizado e acompanhado manualmente pelo responsável pelo projeto. Sem conta infantil, histórico individual no servidor, publicidade, ranking infantil, chat entre usuários ou upload de dados de alunos. Somente quatro atividades locais revisadas: Batalha Naval, Bingo de Frações, Missão Primos e Música em Círculo. A liberação não abrange os demais módulos públicos antigos.

O responsável confirmou em 4 de novembro de 2026 que pretende usar o piloto nos dois contextos: em casa/com famílias e em escolas ou cursos. Essa escolha não libera alunos nem adiciona professores ou familiares à lista de acesso. O adulto acompanha e escolhe a proposta adequada à faixa etária. O sistema não verifica idade, parentesco ou representação legal automaticamente.

### Uso em casa ou com famílias

O adulto previamente autorizado conduz a atividade e acompanha a criança, sem entregar sua conta ou sessão para uso autônomo. Escolhe exercícios adequados, evita identificadores e decide como guardar ou excluir os arquivos baixados. Sair do portal não apaga arquivos, histórico ou armazenamento local; em aparelho compartilhado, deve cuidar também desses dados. O aviso às famílias deve estar disponível em linguagem simples antes do início do piloto.

### Uso em escolas ou cursos

Antes da liberação institucional, registrar a instituição participante, um contato responsável e os adultos que conduzirão as atividades, por canal privado e com dados mínimos. Não enviar listas de alunos para configurar o acesso. Cada adulto autorizado utiliza sua própria conta; não criar senha coletiva nem compartilhar credenciais Google com a turma.

Registrar com a escola ou curso as finalidades da atividade, quem decide sobre eventuais dados, quem pode acessar relatórios, os cuidados com dispositivos e os canais de atendimento. Os papéis de controlador e operador dependem das decisões e do tratamento efetivos; este documento não classifica automaticamente o projeto como operador da instituição.

Informar famílias e estudantes em linguagem apropriada. A autorização técnica do professor não substitui a avaliação do melhor interesse ou eventual procedimento legalmente necessário. A atividade não exige conta infantil, lista nominal, nota ou perfil no portal. Evitar nomes nos relatórios; se a instituição mantiver registros próprios, deverá avaliar sua finalidade, fundamento, acesso e retenção, sem atribuir isso automaticamente ao portal. O projeto não recebe esses registros como parte do piloto proposto.

Em laboratório ou tablet compartilhado, o adulto deve controlar sua sessão, encerrar o acesso ao fim, cuidar dos arquivos baixados e usar perfis adequados de navegador. O procedimento não deve depender de pedir a senha do Google ao estudante. O plano de aula deve prever alternativa pedagógica acessível quando houver impedimento de uso digital, sem prometer que todos os recursos atuais já possuam versão equivalente fora do portal.

## 2. Tratamentos e fundamentos para avaliação

| Operação | Necessidade e dados | Hipótese proposta e limite |
|---|---|---|
| Autenticação e autorização do adulto | Identificador Google e e-mail verificado, lista privada | Avaliar legítimo interesse, art. 7º, IX, com art. 10 da LGPD; não se fundamenta em consentimento genérico nem autoriza dados de alunos |
| Sessão e segurança do portal | Identificador opaco, CSRF e horários; eventos mínimos | Mesma hipótese, limitada a acesso seguro; não formar perfil de comportamento |
| Suporte rotineiro solicitado pelo adulto | Contato e relato estritamente necessários | Avaliar legítimo interesse com expectativa de resposta; não solicitar dados de menores para suporte comum |
| Atendimento de direitos e deveres legais | Pedido, verificação proporcional e resposta | Obrigação legal, art. 7º, II, no que efetivamente for exigido; retenção e eventual defesa de direitos devem ter justificativa específica |
| Conexão durante uso acompanhado | Provedores podem tratar IP e outros metadados | Mapear responsáveis, necessidade, fundamento e transferências; o login adulto não exclui a possibilidade de dados relativos a menores |
| Respostas e relatórios locais | Estado da atividade e arquivos no aparelho | Não enviados como perfil ao servidor nas quatro aplicações revisadas; ainda avaliar contexto do dispositivo e cuidados com menores |

Essas hipóteses são propostas para avaliação do responsável. Dados sensíveis, perfis de crianças, novas integrações e finalidades futuras não estão abrangidos. Legítimo interesse não é hipótese para dados sensíveis: eventual necessidade desses dados exige análise do art. 11. O caráter educacional, independente ou gratuito não constitui dispensa geral da LGPD. O melhor interesse deve ser analisado no caso concreto, inclusive nos dados técnicos de conexão, conforme a LGPD e o Enunciado ANPD nº 1/2023.

## 3. Avaliação preliminar do legítimo interesse — adultos

Finalidade: permitir ao adulto entrar em uma área de acesso fechado e manter a sessão com segurança. Benefício esperado: explorar matemática com acompanhamento, sem abrir contas de alunos.

Necessidade: sub distingue a conta de forma estável; e-mail permite conferir a autorização e atender o adulto. Não solicitar nome de perfil, foto, contatos ou Drive. Alternativa considerada: senha própria, que exigiria guardar credenciais e manter recuperação de senha; OAuth reduz essa carga, mas envolve Google. Conteúdos abertos que não precisarem de identificação devem continuar avaliados separadamente.

Balanceamento: o adulto inicia voluntariamente o login e recebe informação antes de entrar; isso não é, por si, consentimento. Os riscos incluem acesso indevido, exposição de e-mail, dispositivo compartilhado e tratamento no exterior. Salvaguardas existentes incluem escopos mínimos, cookie HttpOnly/Secure, prazos de sessão, lista privada, saída, revogação e bloqueio por servidor. Transferências, condições dos provedores e o canal operacional ainda precisam de fechamento.

Conclusão preliminar: existe justificativa a avaliar para autenticação mínima de adultos; esta análise não aprova o tratamento por terceiros nem substitui a decisão documentada do responsável. Para menores, a análise precisa considerar também ECA Digital e contexto real; não reutilizar automaticamente esta conclusão.

## 4. Retenção e revisão propostas

| Registro | Regra proposta | Estado |
|---|---|---|
| Tentativa de login | Até 10 minutos de validade lógica | Implementado no servidor |
| Sessão | 30 minutos inativa ou 8 horas absolutas; pode acabar no reinício | Implementado no servidor |
| Adultos autorizados | Revisão a cada 30 dias e retirada quando terminar a necessidade | Procedimento manual proposto; sem agendador implantado |
| Suporte comum | Eliminar até 90 dias após conclusão, salvo necessidade específica documentada | Proposto; não há limpeza automática da caixa de e-mail |
| Pedido de direitos | Manter somente o registro necessário para demonstrar atendimento; definir prazo específico e justificativa antes de adoção | Decisão pendente; não aplicar automaticamente o prazo do suporte |
| Incidente com dados pessoais | Registro restrito e mínimo, por pelo menos 5 anos conforme regulamentação aplicável | Procedimento a adotar; não publicar ocorrências ou evidências pessoais no GitHub |
| Logs do Render | Plano Hobby confirmado; referência de 7 dias no explorador segundo documentação pública | Captura mostra Set default, sem destino padrão configurado; conferir demais retenções e mudanças futuras; não prometer exclusão global após 7 dias |
| Arquivo baixado pelo usuário | Cuidados no aparelho e exclusão quando deixar de ser necessário | Fora da sessão; sair não apaga arquivos baixados |

Não guardar código OAuth, token Google, cookie ou conteúdo integral de requisições em evidências rotineiras. Não incluir lista real de contas em documentos públicos. Alteração do plano, streaming de logs ou novo serviço exige atualizar o inventário.

## 5. Atendimento de direitos — roteiro para adoção

1. Receber o pedido em leosardinhalaus@gmail.com e registrar data, assunto e responsável pelo atendimento em arquivo privado.
2. Confirmar identidade ou representação na medida necessária. Não pedir CPF, documento de criança ou cópia de identidade por padrão. Não solicitar senha ou código do Google.
3. Identificar quais dados estão no portal, no aparelho e com provedores; explicar esse alcance sem prometer acesso administrativo a dados que não estão sob controle do projeto.
4. Responder nos prazos legais pertinentes. Confirmar tratamento/acesso de forma simplificada imediatamente quando possível, ou por declaração completa no prazo de até 15 dias nos termos do art. 19 da LGPD. Não estender esse prazo automaticamente a todo tipo de pedido.
5. Executar correção, revogação de acesso ou exclusão quando cabível e registrar a conclusão. Quando houver retenção legal específica, explicar fundamento e limite em vez de prometer apagamento indiscriminado.

## 6. Incidentes — roteiro para adoção

Responsável proposto: Leonardo Sardinha. Canal: leosardinhalaus@gmail.com. Este contato não equivale a plantão 24 horas.

Ao tomar conhecimento: conter o acesso afetado, preservar evidências mínimas em local privado e registrar quando houve ciência de que dados pessoais foram afetados. Se houver segredo exposto, revogar/rotacionar no provedor; não reproduzir o segredo em relato público. Reiniciar o serviço pode encerrar sessões, mas não remove cópias já obtidas.

Avaliar natureza dos dados, titulares, volume, possíveis consequências e salvaguardas. Havendo hipótese de comunicação obrigatória por risco ou dano relevante, observar a Resolução ANPD nº 15/2024 e os prazos aplicáveis: a regra geral é 3 dias úteis para ANPD e titulares. Não presumir dispensa ou prazo diferenciado de pequeno porte; avaliar o enquadramento. Registrar também incidentes não comunicados e a justificativa, sob acesso restrito, pelo período regulamentar.

## 7. Proteção de crianças e adolescentes

A proposta favorece atividades sem identificação e sem publicidade, recomendações comerciais, comunicação entre desconhecidos ou perfil de aprendizagem em nuvem. Isso reduz riscos, mas não substitui avaliar o ECA Digital, suas regras pertinentes ao serviço e as orientações de aferição de idade e supervisão parental.

Adotar como premissa desta revisão a incidência do ECA Digital na oferta dirigida a crianças e adolescentes, com análise das obrigações específicas segundo as funcionalidades e os riscos. O Guia de escopo publicado pela ANPD em 28/10/2026 reforça a análise funcional do serviço e a proporcionalidade; não há dispensa presumida por login adulto, porte reduzido ou curadoria humana. Não confundir esse guia de escopo com conclusão de todas as regras técnicas de aferição de idade.

Antes de liberar: documentar o contexto de uso, os riscos por faixa etária e as medidas proporcionais. Não acrescentar biometria, documentos ou dados excessivos de menores como solução improvisada. A conta adulta da lista é controle de autorização; não é prova de idade, vínculo ou consentimento parental.

### Melhor interesse e critérios pedagógicos de proteção

Distinguir, para o público proposto, crianças de 6 a 11 anos, adolescentes de 12 a 17 e adultos a partir de 18, observadas as definições e exceções do ECA. Não ampliar o acesso a contas de menores apenas por elaborar esta divisão. O registro de idade exata não é criado por este documento.

Avaliar por atividade: benefício pedagógico, dados realmente necessários, alternativas com menor coleta, adequação do conteúdo, acessibilidade, links externos, uso de som, competição e possibilidade de exposição de erros. Respeitar pausas e desconforto; não usar resultados para humilhar ou discriminar. Autonomia progressiva não significa uso sem proteção. Vinculação à BNCC não substitui avaliação etária nem classificação indicativa quando aplicável.

Registrar a avaliação em arquivo de trabalho sem nomes de alunos. O RELATORIO_REVISAO_LGPD_ECA.md contém a matriz inicial de pendências; ainda não há teste de usabilidade com crianças ou auditoria integral de acessibilidade reportados. A presença de adulto não é prova da efetividade dessas medidas.

Quando o fundamento for consentimento para dados de criança: especificar finalidade e dados; dar destaque ao pedido; obter manifestação de pelo menos um dos pais ou responsável legal; realizar esforços razoáveis de verificação; registrar somente evidência necessária; oferecer informação e revogação facilitadas. O procedimento ainda não foi implementado. Outras bases exigem justificativa própria conforme Enunciado ANPD nº 1/2023, não uma declaração genérica de dispensa de consentimento.

### Proteção diante de suspeita de violência ou crime

Preparar, com a instituição participante, pessoas capacitadas, canal privado e encaminhamento à rede de proteção. Avaliar e cumprir os deveres de comunicação ao Conselho Tutelar nas hipóteses previstas no ECA, inclusive o art. 70-B para entidades e profissionais abrangidos. Não tratar toda preocupação com a criança apenas como incidente de dados nem substituir o dever de comunicação por uma troca de e-mails com o projeto.

Não exigir fotos, documentos ou repetição desnecessária do relato para acolher uma preocupação. Restringir o acesso aos registros e compartilhar somente o necessário com os órgãos e responsáveis competentes, sem prometer confidencialidade absoluta diante de dever legal de comunicação. Situações urgentes exigem os canais de emergência e proteção adequados; a caixa de suporte não oferece atendimento imediato. O procedimento ainda precisa ser adotado e os contatos locais definidos.

## 8. Provedores e transferências

Google autentica; Render hospeda em Oregon, Estados Unidos, conforme informado. GitHub Pages mantém a parte pública. Conferir as condições efetivamente aplicáveis e o mecanismo de transferência pertinente à LGPD e à regulamentação da ANPD. Cláusulas europeias e a escolha de região estrangeira não demonstram, sozinhas, atendimento do mecanismo brasileiro. Não foi confirmada cláusula brasileira específica nas condições da conta.

Se houver pergunta contratual ao provedor, preparar o texto sem dados de alunos ou segredos e submetê-lo ao responsável; esta preparação não envia mensagens a terceiros.

## 9. Evidências e critério de liberação

Já informado pelo responsável: serviço ready/auth-test, conta reconhecida, saída e novo acesso. Testes automatizados usam identidades fictícias e verificam bloqueios, revogação e sessão; não são um teste de todas as contas reais.

Ainda verificar: segunda conta permitida, conta fora da lista, revogação, arquivos por URL direta, condições dos provedores, enquadramento ECA Digital e escopo público/restrito. Aprovar textos e definir data de vigência só após resolver os itens aplicáveis. Não alterar EDU_ACTIVITIES_ENABLED=false durante esta revisão.

## 10. Fontes oficiais consultadas em 4 de novembro de 2026

- LGPD, texto atualizado: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html
- ECA, texto atualizado: https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-normaatualizada-pl.html
- ANPD, guia de escopo do ECA Digital divulgado em 28/10/2026: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-guia-que-esclarece-quem-deve-cumprir-e-quais-sao-as-responsabilidades-das-plataformas-na-protecao-de-criancas-e-adolescentes
- ANPD, orientação sobre legítimo interesse: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse
- ANPD, Enunciado nº 1/2023 sobre crianças e adolescentes: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes
- ANPD, ECA Digital e orientações: https://www.gov.br/anpd/pt-br/assuntos/eca-digital
- ANPD, incidentes: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca
- ANPD, transferências: https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados
- Render, logs: https://render.com/docs/logging
- Render, condições de tratamento: https://render.com/dpa
- Google, identidade: https://developers.google.com/identity/openid-connect/openid-connect

Esta é uma proposta de governança baseada no escopo revisado, não certificação jurídica de conformidade. A consulta às fontes não comprova configurações ou contratos da conta concreta.
