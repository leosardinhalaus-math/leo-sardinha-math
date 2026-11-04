# Piloto supervisionado — preparação técnica

Contexto informado pelo responsável: projeto independente com público de 6 a 30 anos. Esta etapa não ativa cadastro infantil, não cadastra alunos e não presume que uma conta Google comprove maioridade. A lista inicial deve conter somente os dois endereços do próprio responsável, mantidos fora do repositório.

## O que ficou preparado

`EDU_SUPERVISED_PILOT=true` é o padrão do servidor e consta no blueprint Render. O responsável pode testar quatro atividades locais: Batalha Naval, Bingo de Frações, Missão Primos e Música em Círculo. Há instruções específicas de adequação etária na entrada: a atividade de primos começa no 6º ano; o círculo musical contém aprofundamentos que não devem ser exigidos de crianças de 6 anos.

O piloto usa uma página de entrada própria, sem formulário para nome, data de nascimento, foto, e-mail ou senha da criança. O cadastro de adultos não é aberto: a lista continua privada e manual. Os caminhos de outras aplicações são recusados no servidor antes da entrega, inclusive se o adulto tentar a URL direta; a verificação é repetida depois da resolução de symlinks. A CSP do piloto limita conexões a self e recusa iframes. Links externos de referência ainda podem levar a outros sites; acompanhamento adulto permanece necessário.

O portal de referência é https://leo-sardinha-educacao-v2.onrender.com, em modo auth-test. Em 4 de novembro de 2026, o responsável confirmou login reconhecido, saída e novo acesso. As quatro atividades continuam bloqueadas até decisão de liberação. O GitHub Pages atual e cópias previamente baixadas continuam públicos. A revisão documental não altera segredos, contas ou configurações reais. O teste informado não comprova todos os cenários reais de autorização e revogação.

## Inventário da revisão estática

| Componente | Dados/fluxo observado | Decisão do piloto |
|---|---|---|
| Portal Google | sub e e-mail verificado do adulto; sessão em memória; cookie essencial | Somente adultos manualmente autorizados; expiração e revogação por lista |
| Batalha Naval | respostas e relatório na memória da página; CSV/PDF baixados no aparelho | Permitido com acompanhamento; evitar identificação de aluno nas folhas |
| Bingo de Frações | marcações e desenho locais; nenhuma requisição de nuvem identificada no script revisado | Permitido; o adulto seleciona a proposta adequada |
| Missão Primos | limite numérico, Worker e estatísticas locais | Permitido para faixa adequada; sem perfil ou ranking |
| Música em Círculo | conjunto de notas, simulação e síntese sonora locais; PDFs locais | Permitido com mediação; fontes externas são links opcionais |
| Calculus Royale | cadastro próprio, perfil/ranking, progresso em nuvem e tokens no localStorage do cliente legado | Fora do piloto; proteção do portal não corrige o backend desse jogo |
| Scratch/GeoGebra | leitores externos e arquivos .sb3; applets podem comunicar com terceiros | Fora do piloto até adaptar o carregamento privado e revisar provedores |
| Matemática em Papel / demais jogos | módulos de recursos e integrações diferentes | Fora do piloto até revisão específica; não declarar todos aptos por compartilhar o site |

A revisão é técnica, baseada nos arquivos disponíveis e testes. Não certifica conformidade integral com a LGPD, contratos de operadores ou políticas do Google. Dados técnicos de conexão podem ser tratados por Google e Render mesmo sem um cadastro infantil; isso não é anonimização global.

## Pendências que exigem o titular

- Identificação e contato já informados: Leonardo Sardinha, leosardinhalaus@gmail.com. Proposta de operação preparada em docs/PROPOSTA_OPERACAO_PILOTO.md; adoção ainda pendente.
- Definição documentada de finalidade e fundamento legal, considerando melhor interesse e idade. Se consentimento for a base escolhida para dados da criança, implementar procedimento específico, destacado e verificável do responsável; esta versão não o coleta.
- Aviso real dos provedores, retenção de logs, localização do serviço e transferências pertinentes. A região informada é Oregon (US West), Estados Unidos; confirmar plano do workspace, retenção e Log Streams.
- Se houver relação com escola ou instituição, esclarecer os papéis e responsabilidades antes de usar dados de alunos.
- Login, saída e novo acesso já reportados no serviço v2. Completar segunda conta, recusa de não autorizado, revogação e links diretos, sem presumir política vigente a partir de ready.
- Avaliar o ECA Digital e suas medidas pertinentes; login de adulto não comprova idade, parentesco ou cumprimento das obrigações aplicáveis.
- Somente após validar a origem nova, planejar a retirada das rotas antigas do GitHub Pages. Não quebrar os links públicos antes de o substituto estar verificado.

Lei de referência: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — considerar os artigos 6º, 9º, 14 e 18, além do fundamento aplicável. O melhor interesse não se resume a um checkbox ou à autenticação Google.

## Verificação

A suíte de Educação passou em 19 testes após a correção da saída. O total de outras suítes não é usado como prova de conformidade do piloto. O teste integrado do piloto usa provedor Google simulado, assinatura RSA e identidades fictícias: verifica callback, sessão de adulto autorizado, bloqueio autenticado de aplicações fora do piloto, CSP e revogação imediata. Não deve ser confundido com teste no Google real ou Render. Os testes existentes continuam cobrindo cookies, PKCE, claims inválidos, acesso direto sem sessão, exportação sem segredos e modo de configuração fechado.
