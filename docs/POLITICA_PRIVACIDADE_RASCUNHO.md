# Política de privacidade — Leo Sardinha.Math

**RASCUNHO PARA REVISÃO — NÃO É UMA POLÍTICA VIGENTE.**

Versão de trabalho: 4 de novembro de 2026. Este texto não ativa o login, não autoriza cadastro infantil e não declara que o site inteiro esteja em conformidade com a LGPD. Os campos entre colchetes e o inventário das aplicações precisam ser concluídos antes de sua adoção.

## 1. Responsável e alcance

Responsável pelo tratamento: **Leonardo Sardinha**.

Contato de privacidade: **leosardinhalaus@gmail.com**.

Este documento está sendo preparado para o site público Leo Sardinha.Math e sua área Educação no Render, atualmente em teste técnico. O projeto é, neste momento, independente; não se presume vínculo institucional pela utilização de um e-mail acadêmico.

O site público e o portal restrito são ambientes diferentes. O primeiro continua disponível no GitHub Pages. O portal de teste está em https://leo-sardinha-educacao-v2.onrender.com. O responsável confirmou nesta conversa a entrada com Google, o reconhecimento da conta autorizada, a saída e o novo acesso em 4 de novembro de 2026. O modo continua auth-test, com atividades bloqueadas. Não há liberação para alunos. Restringir um ambiente não torna privadas as cópias ou os arquivos já publicados no outro.

## Escolha para a primeira fase

A primeira fase será preparada **sem cadastro infantil e sem guardar nomes, respostas ou desempenho individual dos alunos no servidor do portal**. O acesso será do adulto autorizado; os resultados das atividades locais ficarão no aparelho. Arquivos que o adulto decidir baixar ou imprimir ficam sob seus cuidados. Isso não elimina dados técnicos de conexão tratados pelos provedores. Qualquer ampliação para registros individuais exigirá nova avaliação antes de ser implementada. Processar ou gerar arquivos apenas no aparelho também pode ser tratamento de dados pessoais quando alguém for identificável; não enviar ao servidor reduz a circulação, mas não torna o tratamento automaticamente anônimo ou fora da LGPD. O projeto mantém os deveres que lhe cabem; orientar o adulto sobre arquivos não é uma transferência integral de responsabilidade.

## 2. Quais dados podem ser tratados

| Situação | Dados envolvidos | Observação |
|---|---|---|
| Navegação | Dados técnicos de conexão, como IP, horário e informações do navegador, conforme o provedor | Região do serviço Render: Oregon (US West), EUA, informada pelo responsável; demais configurações e retenção ainda precisam ser confirmadas |
| Login Google do adulto no teste | Identificador da conta e e-mail verificado | O portal solicita somente `openid email`; não recebe a senha nem solicita Gmail, contatos ou Drive |
| Autorização de acesso | E-mails da lista privada de adultos autorizados | Não há cadastro público de alunos no piloto |
| Sessão do portal | Identificador aleatório em cookie, dados mínimos da sessão e token de proteção contra requisições indevidas | Os tokens Google são descartados pelo portal após verificar a identidade |
| Atividades locais | Respostas, desenhos, configurações, fotos escolhidas e resultados, conforme a aplicação | Várias atividades processam dados no navegador; isso não significa que todas tenham o mesmo funcionamento |
| Arquivos baixados | Relatórios, moldes, exercícios ou registros produzidos no aparelho | O adulto é responsável pelo armazenamento e compartilhamento posteriores |
| Módulos com serviços online próprios | Podem incluir e-mail, nome de jogador, avatar, progresso ou ranking | Inventário e configuração de cada integração ainda estão em revisão; esses módulos não integram o piloto supervisionado |
| Pedidos de suporte ou privacidade | Contato e informações necessárias para atender à solicitação | Não enviar senhas, documentos ou dados de crianças sem necessidade e orientação |

**Não existe uma promessa de anonimização geral.** Mesmo sem cadastro infantil, dados técnicos de conexão podem ser tratados pela hospedagem ou por serviços externos. Também não se afirma que todos os jogos funcionem apenas localmente.

## 3. Finalidades e fundamento legal

As finalidades propostas são disponibilizar atividades educativas, autenticar os adultos autorizados, controlar acessos, manter a segurança e atender solicitações dos titulares.

Uma proposta por operação, com avaliação preliminar de necessidade e salvaguardas, está em PROPOSTA_OPERACAO_PILOTO.md. Para autenticação e proteção do acesso de adultos, propõe-se avaliar o legítimo interesse (art. 7º, IX, e art. 10 da LGPD); para atendimento de direitos legalmente exigível, a obrigação legal (art. 7º, II). A proposta ainda precisa de decisão registrada do responsável. Ela não se estende automaticamente a dados de menores, integrações antigas ou finalidades futuras.

Cada operação precisa de fundamento e de informação sobre finalidade, necessidade, destinatários e duração. O caráter independente, gratuito ou educacional do projeto não constitui dispensa geral da LGPD. As exceções do art. 4º dependem de enquadramento próprio; o projeto não assume a exceção de uso exclusivamente particular para um portal também destinado a escolas e cursos. Legítimo interesse não é base para dados pessoais sensíveis (art. 11).

A escolha não deve ser feita apenas para preencher um campo técnico. O login com Google, a presença de um aviso ou a autorização de um e-mail não equivalem, por si, a consentimento válido ou a uma justificativa para qualquer uso de dados.

Se houver tratamentos adicionais, como registros individuais de aprendizagem ou compartilhamento com escola, sua finalidade e fundamento precisarão ser definidos antes da implementação. Não serão automaticamente abrangidos pelo acesso ao portal.

## 4. Crianças e adolescentes

O público previsto inclui pessoas de 6 a 30 anos. Para esta proposta, distinguem-se crianças de 6 a 11 anos, adolescentes de 12 a 17 anos e adultos a partir de 18 anos, observadas as definições do art. 2º do ECA e as hipóteses excepcionais nele previstas. A faixa de 18 a 30 anos não integra o grupo de crianças e adolescentes; seus dados continuam protegidos pela LGPD. Esta divisão serve à revisão, não cria verificação automática de idade nem amplia o piloto para contas autônomas de adolescentes.

A proposta inicial é um **piloto supervisionado por adultos**, com estas limitações:

- A lista deve conter somente adultos previamente autorizados. A conta Google não comprova maioridade e o sistema não verifica idade automaticamente.
- A criança participa com acompanhamento, sem conta própria no portal.
- O piloto não solicita nome, data de nascimento, foto, e-mail ou perfil de aprendizagem da criança para liberar as atividades.
- O adulto deve escolher propostas adequadas à idade e evitar inserir dados identificadores em exercícios e arquivos.
- Aplicações com cadastro próprio, salvamento em nuvem ou integrações ainda não revisadas ficam fora do piloto na origem protegida.

O piloto não implementa coleta de consentimento parental, comprovação de responsabilidade ou cadastro infantil. Antes de criar contas ou registros individuais de crianças, será necessário avaliar o melhor interesse, o fundamento legal, a proporcionalidade e o procedimento aplicável. Quando o tratamento de dados de criança se apoiar em consentimento, este deverá ser específico, destacado e dado por pelo menos um dos pais ou pelo responsável legal, com esforços razoáveis de verificação, nos termos do art. 14, §§ 1º e 5º, da LGPD. Não basta uma caixa genérica. Outras hipóteses legais exigem fundamentação própria e preservação do melhor interesse, conforme o Enunciado ANPD nº 1/2023; não se adota consentimento como requisito universal nem legítimo interesse como autorização geral. A situação de adolescentes deve considerar seus direitos, autonomia progressiva e o contexto jurídico aplicável.

A revisão também deve abranger a Lei nº 15.211/2025 (ECA Digital) e a regulamentação pertinente. O login de um adulto e a supervisão proposta não demonstram, por si, atendimento das obrigações de aferição de idade, supervisão parental e proteção por padrão. Como há intenção expressa de atender crianças e adolescentes, esta revisão parte da incidência do ECA Digital sobre a oferta educacional dirigida a esse público, sujeita à análise das obrigações concretas e eventuais hipóteses legais específicas. O acesso por adulto não é usado como exclusão da lei. As medidas proporcionais de idade, supervisão, prevenção de riscos e informação precisam ser definidas e demonstradas antes da liberação. Não se está adicionando coleta de documentos ou biometria nem presumindo dispensa por curadoria de materiais.

O responsável confirmou uso previsto nos dois contextos: em casa/com famílias e em escolas ou cursos. Em casa, o adulto autorizado acompanha e cuida dos arquivos no aparelho. No uso institucional, deverão ser registrados os responsáveis pela atividade, as finalidades e os papéis de cada participante conforme as decisões e tratamentos efetivos. O projeto não é automaticamente operador da escola ou curso. A autorização técnica de um professor não autoriza indistintamente todo tratamento de dados dos alunos.

O piloto proposto não pede listas nominais, notas ou perfis de aprendizagem de turmas. Eventuais registros próprios da instituição exigem avaliação separada de fundamento, acesso e retenção; o portal não os recebe como parte desta proposta. O contato do projeto atende questões do portal, enquanto a instituição deverá informar seu canal para os tratamentos sob sua responsabilidade. Os fluxos constam em PROPOSTA_OPERACAO_PILOTO.md.

### Imagem, dignidade e informação adequada

A proposta protege imagem, identidade, privacidade, autonomia e dignidade, conforme os arts. 15 a 18 do ECA. O piloto não autoriza publicar fotos, vozes, trabalhos identificados ou resultados individuais de menores. Eventual uso de imagem ou divulgação futura exigirá avaliação específica, finalidade e procedimento próprios; uma licença de conteúdo ou a autorização de acesso não resolve esses direitos.

As informações deverão estar disponíveis antes do uso, em linguagem simples e acessível às famílias e aos estudantes, de acordo com idade e necessidades de acessibilidade (art. 14, § 6º, da LGPD). Não condicionar a atividade a dados além dos necessários (art. 14, § 4º). Respeitar sinais de desconforto e evitar exposição de erros ou comparações constrangedoras. Esses são critérios para adoção e revisão das atividades, não afirmação de auditoria completa de acessibilidade.

## 5. Cookies, armazenamento e sessão

No teste técnico já implantado, o portal utiliza cookies essenciais de autenticação:

- `__Host-edu-flow`: identifica a tentativa de login, com validade lógica de até 10 minutos no servidor.
- `__Host-edu-session`: identifica a sessão do adulto, com expiração após 30 minutos de inatividade ou 8 horas desde sua criação.

Os cookies são configurados como Secure, HttpOnly e SameSite=Lax. As sessões ficam em memória; reinícios do serviço podem encerrá-las antes desses prazos. O prazo lógico no servidor é distinto da permanência física de um cookie no navegador.

O portal preparado não adiciona publicidade nem ferramentas de análise de comportamento. As configurações do site público, de aplicações antigas e de terceiros precisam de verificação própria; essa afirmação não é estendida automaticamente a elas.

Alguns jogos podem manter configurações ou progresso no armazenamento local do navegador. Encerrar a sessão não apaga automaticamente esse conteúdo, o histórico do navegador ou os arquivos baixados. Em aparelhos compartilhados, recomenda-se um perfil de navegador separado e acompanhamento do adulto.

## 6. Prestadores, compartilhamento e transferências

Podem participar do funcionamento: GitHub/GitHub Pages na parte pública; Render na hospedagem do portal de teste; Google na autenticação; e, em determinadas aplicações, Supabase, Firebase, GeoGebra ou TurboWarp, conforme sua configuração e utilização.

O responsável informou que o serviço Render está configurado em **Oregon (US West), Estados Unidos**. Essa informação identifica a região do serviço; não comprova a localização de todos os logs, backups, suporte ou tratamentos do Google e demais provedores. As transferências internacionais pertinentes ainda precisam de avaliação e documentação.

A presença nessa lista não significa que todos estejam ativos em todas as páginas, nem que todos tenham o mesmo papel jurídico. Integrações com conta, nuvem e leitores externos permanecem fora do piloto até revisão.

**[PENDENTE: confirmar serviços efetivamente ativos, responsabilidades, contratos, locais dos demais tratamentos, dados enviados, retenção e eventual mecanismo aplicável às transferências internacionais.]**

O piloto não solicita autorização para acessar arquivos pessoais no Drive, mensagens ou contatos. Não se prevê comercializar dados de alunos ou publicar seu desempenho. Qualquer alteração de finalidade exigirá avaliação e informação adequadas.

Links de referência podem levar a outros sites, sujeitos a suas próprias políticas. A saída do portal não encerra a conta Google.

## 7. Retenção e exclusão

Na implementação do portal de teste, as tentativas de login e sessões seguem os prazos descritos acima. O aplicativo registra tipo de evento e horário, sem registrar deliberadamente e-mail, senha, cookie, código OAuth ou token nesses logs.

A lista de adultos permanece enquanto houver autorização; sua remoção bloqueia o acesso na verificação seguinte. A proposta para adoção é revisar a lista a cada 30 dias e eliminar pedidos rotineiros de suporte até 90 dias após a conclusão. São critérios propostos, ainda não adotados nem automatizados. Os prazos dos provedores precisam de confirmação própria; registros de incidentes e obrigações específicas recebem tratamento separado.

Logs dos provedores e arquivos sob guarda dos usuários têm retenção própria. O responsável confirmou o plano Hobby do workspace Render; segundo a documentação pública do provedor, a retenção no explorador de logs desse plano é de 7 dias. A captura enviada pelo responsável em 4 de novembro de 2026 mostra Set default em Log Streams: nenhum destino padrão de encaminhamento estava configurado na tela apresentada. Isso não é auditoria de todos os tratamentos do provedor; retenções de outros dados técnicos continuam em avaliação. Esse prazo não significa exclusão de todos os dados dos provedores após 7 dias. Obrigações legais ou necessidade de exercício regular de direitos podem exigir conservação específica, que deverá ser documentada.

Não se promete apagar cópias anteriormente baixadas ou publicadas que estejam fora do controle do responsável.

## 8. Direitos e atendimento

Pelo e-mail leosardinhalaus@gmail.com, o titular ou representante poderá solicitar, sem custo, os direitos aplicáveis do art. 18 da LGPD: confirmação e acesso; correção; anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou irregulares; portabilidade nos termos da regulamentação; informação sobre compartilhamento e sobre a possibilidade e consequências de negar consentimento; eliminação dos dados tratados com consentimento, ressalvadas as hipóteses legais; e revogação do consentimento. A oposição cabe nos termos legais, inclusive em caso de descumprimento em tratamento sem consentimento. Também é possível peticionar à ANPD e buscar os órgãos de defesa competentes.

Para confirmação e acesso, o art. 19 prevê resposta simplificada imediata ou declaração completa em até 15 dias a partir do pedido, observadas disposições específicas aplicáveis. Esse prazo não é apresentado como regra única para todos os direitos. Se não for possível atender de imediato, serão informadas as razões e o encaminhamento cabível. O roteiro de atendimento ainda precisa ser adotado.

Pedidos serão avaliados conforme a legislação, com verificação de identidade e representação proporcional ao caso, sem exigir documentos excessivos. A retirada de um consentimento, quando essa for a base, não torna ilícito retroativamente o tratamento anterior válido.

Não há avaliação automática de desempenho escolar no portal de acesso. Uma recusa de entrada pela lista de e-mails poderá ser submetida ao responsável para revisão humana.

## 9. Segurança e incidentes

Foram preparados controles de autorização no servidor, verificação de identidade, expiração, proteção de sessão e recusa de rotas fora do piloto. Testes técnicos não eliminam riscos e não constituem certificação jurídica de conformidade.

O responsável deverá manter acesso administrativo protegido, segredos fora do repositório, atualizações, revisão de permissões e procedimento para incidentes. Eventos serão avaliados e comunicados aos afetados e à autoridade quando exigido pela legislação e regulamentação aplicáveis.

Proposta: Leonardo Sardinha coordena o atendimento de incidentes pelo contato leosardinhalaus@gmail.com, com contenção, registro restrito, avaliação de risco e comunicação quando devida. O roteiro consta em PROPOSTA_OPERACAO_PILOTO.md e ainda precisa ser adotado. O e-mail é canal de contato, não uma promessa de monitoramento contínuo.

## 10. Adoção e alterações

Este texto só poderá ser apresentado como política vigente depois de concluídas as pendências, confirmados os fluxos reais e definida a data de entrada em vigor. Mudanças relevantes deverão ser informadas de modo compreensível, especialmente quando afetarem estudantes.

Revisão LGPD e ECA: consulte RELATORIO_REVISAO_LGPD_ECA.md, que distingue correções documentais de medidas ainda não demonstradas. ECA (Lei nº 8.069/1990): https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-normaatualizada-pl.html . Guia de escopo do ECA Digital publicado pela ANPD em 28/10/2026: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-guia-que-esclarece-quem-deve-cumprir-e-quais-sao-as-responsabilidades-das-plataformas-na-protecao-de-criancas-e-adolescentes .

Referências adicionais consultadas em 4 de novembro de 2026: ECA Digital e orientações da ANPD em https://www.gov.br/anpd/pt-br/assuntos/eca-digital ; legítimo interesse em https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse ; transferências em https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados .

Referência legal: Lei nº 13.709/2018, em especial princípios, transparência, tratamento de dados de crianças/adolescentes e direitos dos titulares: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
