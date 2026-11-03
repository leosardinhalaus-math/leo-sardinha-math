# Política de privacidade — Leo Sardinha.Math

**RASCUNHO PARA REVISÃO — NÃO É UMA POLÍTICA VIGENTE.**

Versão de trabalho: 3 de novembro de 2026. Este texto não ativa o login, não autoriza cadastro infantil e não declara que o site inteiro esteja em conformidade com a LGPD. Os campos entre colchetes e o inventário das aplicações precisam ser concluídos antes de sua adoção.

## 1. Responsável e alcance

Responsável pelo tratamento: **Leonardo Sardinha**.

Contato de privacidade: **leosardinhalaus@gmail.com**.

Este documento está sendo preparado para o site público Leo Sardinha.Math e sua futura área Educação no Render. O projeto é, neste momento, independente; não se presume vínculo institucional pela utilização de um e-mail acadêmico.

O site público e o portal restrito são ambientes diferentes. O primeiro continua disponível no GitHub Pages. O portal do Render está em configuração; os controles descritos como futuros só valerão depois de implantados e testados. Restringir um ambiente não torna privadas as cópias ou os arquivos já publicados no outro.

## 2. Quais dados podem ser tratados

| Situação | Dados envolvidos | Observação |
|---|---|---|
| Navegação | Dados técnicos de conexão, como IP, horário e informações do navegador, conforme o provedor | Configurações, retenção e regiões dos provedores ainda precisam ser confirmadas |
| Futuro login Google do adulto | Identificador da conta e e-mail verificado | O portal solicita somente `openid email`; não recebe a senha nem solicita Gmail, contatos ou Drive |
| Autorização de acesso | E-mails da lista privada de adultos autorizados | Não há cadastro público de alunos no piloto |
| Sessão do portal | Identificador aleatório em cookie, dados mínimos da sessão e token de proteção contra requisições indevidas | Os tokens Google são descartados pelo portal após verificar a identidade |
| Atividades locais | Respostas, desenhos, configurações, fotos escolhidas e resultados, conforme a aplicação | Várias atividades processam dados no navegador; isso não significa que todas tenham o mesmo funcionamento |
| Arquivos baixados | Relatórios, moldes, exercícios ou registros produzidos no aparelho | O adulto é responsável pelo armazenamento e compartilhamento posteriores |
| Módulos com serviços online próprios | Podem incluir e-mail, nome de jogador, avatar, progresso ou ranking | Inventário e configuração de cada integração ainda estão em revisão; esses módulos não integram o piloto supervisionado |
| Pedidos de suporte ou privacidade | Contato e informações necessárias para atender à solicitação | Não enviar senhas, documentos ou dados de crianças sem necessidade e orientação |

**Não existe uma promessa de anonimização geral.** Mesmo sem cadastro infantil, dados técnicos de conexão podem ser tratados pela hospedagem ou por serviços externos. Também não se afirma que todos os jogos funcionem apenas localmente.

## 3. Finalidades e fundamento legal

As finalidades propostas são disponibilizar atividades educativas, autenticar os adultos autorizados, controlar acessos, manter a segurança e atender solicitações dos titulares.

**[PENDENTE: definir e documentar o fundamento legal aplicável a cada operação, a necessidade dos dados, os interesses envolvidos e as salvaguardas.]**

A escolha não deve ser feita apenas para preencher um campo técnico. O login com Google, a presença de um aviso ou a autorização de um e-mail não equivalem, por si, a consentimento válido ou a uma justificativa para qualquer uso de dados.

Se houver tratamentos adicionais, como registros individuais de aprendizagem ou compartilhamento com escola, sua finalidade e fundamento precisarão ser definidos antes da implementação. Não serão automaticamente abrangidos pelo acesso ao portal.

## 4. Crianças e adolescentes

O público previsto inclui pessoas de 6 a 30 anos. Crianças, adolescentes e adultos exigem avaliação adequada ao contexto; a idade máxima não elimina os cuidados com os mais novos.

A proposta inicial é um **piloto supervisionado por adultos**, com estas limitações:

- A lista deve conter somente adultos previamente autorizados. A conta Google não comprova maioridade e o sistema não verifica idade automaticamente.
- A criança participa com acompanhamento, sem conta própria no portal.
- O piloto não solicita nome, data de nascimento, foto, e-mail ou perfil de aprendizagem da criança para liberar as atividades.
- O adulto deve escolher propostas adequadas à idade e evitar inserir dados identificadores em exercícios e arquivos.
- Aplicações com cadastro próprio, salvamento em nuvem ou integrações ainda não revisadas ficam fora do piloto na origem protegida.

O piloto não implementa coleta de consentimento parental, comprovação de responsabilidade ou cadastro infantil. Antes de criar contas ou registros individuais de crianças, será necessário avaliar o melhor interesse, o fundamento legal, a proporcionalidade e o procedimento aplicável. Quando a base escolhida exigir consentimento do responsável, deverá existir procedimento específico, destacado e verificável; não basta uma caixa genérica.

O uso por uma escola exigirá esclarecer os papéis e responsabilidades da escola e do projeto. Este rascunho não presume que o professor possa autorizar indistintamente todo tratamento de dados dos alunos.

## 5. Cookies, armazenamento e sessão

Após a ativação, o portal utilizará cookies essenciais de autenticação:

- `__Host-edu-flow`: identifica a tentativa de login, com validade lógica de até 10 minutos no servidor.
- `__Host-edu-session`: identifica a sessão do adulto, com expiração após 30 minutos de inatividade ou 8 horas desde sua criação.

Os cookies são configurados como Secure, HttpOnly e SameSite=Lax. As sessões ficam em memória; reinícios do serviço podem encerrá-las antes desses prazos. O prazo lógico no servidor é distinto da permanência física de um cookie no navegador.

O portal preparado não adiciona publicidade nem ferramentas de análise de comportamento. As configurações do site público, de aplicações antigas e de terceiros precisam de verificação própria; essa afirmação não é estendida automaticamente a elas.

Alguns jogos podem manter configurações ou progresso no armazenamento local do navegador. Encerrar a sessão não apaga automaticamente esse conteúdo, o histórico do navegador ou os arquivos baixados. Em aparelhos compartilhados, recomenda-se um perfil de navegador separado e acompanhamento do adulto.

## 6. Prestadores, compartilhamento e transferências

Podem participar do funcionamento: GitHub/GitHub Pages na parte pública; Render na futura hospedagem do portal; Google na autenticação; e, em determinadas aplicações, Supabase, Firebase, GeoGebra ou TurboWarp, conforme sua configuração e utilização.

A presença nessa lista não significa que todos estejam ativos em todas as páginas, nem que todos tenham o mesmo papel jurídico. Integrações com conta, nuvem e leitores externos permanecem fora do piloto até revisão.

**[PENDENTE: confirmar serviços efetivamente ativos, responsabilidades, contratos, regiões, dados enviados, retenção e eventual mecanismo aplicável às transferências internacionais.]**

O piloto não solicita autorização para acessar arquivos pessoais no Drive, mensagens ou contatos. Não se prevê comercializar dados de alunos ou publicar seu desempenho. Qualquer alteração de finalidade exigirá avaliação e informação adequadas.

Links de referência podem levar a outros sites, sujeitos a suas próprias políticas. A saída do portal não encerra a conta Google.

## 7. Retenção e exclusão

Na implementação preparada, as tentativas de login e sessões seguem os prazos descritos acima. O aplicativo registra tipo de evento e horário, sem registrar deliberadamente e-mail, senha, cookie, código OAuth ou token nesses logs.

A lista de adultos permanece enquanto houver autorização; sua remoção bloqueia o acesso na verificação seguinte. **[PENDENTE: definir revisão periódica da lista e prazos de retenção dos registros operacionais e de suporte.]**

Logs dos provedores e arquivos sob guarda dos usuários têm retenção própria. Esses prazos ainda precisam ser confirmados. Obrigações legais ou necessidade de exercício regular de direitos podem exigir conservação específica, que deverá ser documentada.

Não se promete apagar cópias anteriormente baixadas ou publicadas que estejam fora do controle do responsável.

## 8. Direitos e atendimento

Pelo canal de privacidade a ser informado, o titular ou representante poderá solicitar os direitos aplicáveis, incluindo confirmação do tratamento, acesso, correção e informações sobre compartilhamento, bem como exclusão, oposição ou revogação quando cabíveis.

Pedidos serão avaliados conforme a legislação, com verificação de identidade e representação proporcional ao caso, sem exigir documentos excessivos. A retirada de um consentimento, quando essa for a base, não torna ilícito retroativamente o tratamento anterior válido.

Não há avaliação automática de desempenho escolar no portal de acesso. Uma recusa de entrada pela lista de e-mails poderá ser submetida ao responsável para revisão humana.

## 9. Segurança e incidentes

Foram preparados controles de autorização no servidor, verificação de identidade, expiração, proteção de sessão e recusa de rotas fora do piloto. Testes técnicos não eliminam riscos e não constituem certificação jurídica de conformidade.

O responsável deverá manter acesso administrativo protegido, segredos fora do repositório, atualizações, revisão de permissões e procedimento para incidentes. Eventos serão avaliados e comunicados aos afetados e à autoridade quando exigido pela legislação e regulamentação aplicáveis.

**[PENDENTE: responsável operacional por incidentes e canal de comunicação.]**

## 10. Adoção e alterações

Este texto só poderá ser apresentado como política vigente depois de concluídas as pendências, confirmados os fluxos reais e definida a data de entrada em vigor. Mudanças relevantes deverão ser informadas de modo compreensível, especialmente quando afetarem estudantes.

Referência legal: Lei nº 13.709/2018, em especial princípios, transparência, tratamento de dados de crianças/adolescentes e direitos dos titulares: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
