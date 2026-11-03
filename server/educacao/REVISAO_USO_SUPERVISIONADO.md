# Piloto supervisionado — preparação técnica

Contexto informado pelo responsável: projeto independente com público de 6 a 30 anos. Esta etapa não ativa cadastro infantil, não cadastra alunos e não presume que uma conta Google comprove maioridade. A lista inicial deve conter somente os dois endereços do próprio responsável, mantidos fora do repositório.

## O que ficou preparado

`EDU_SUPERVISED_PILOT=true` é o padrão do servidor e consta no blueprint Render. O responsável pode testar quatro atividades locais: Batalha Naval, Bingo de Frações, Missão Primos e Música em Círculo. Há instruções específicas de adequação etária na entrada: a atividade de primos começa no 6º ano; o círculo musical contém aprofundamentos que não devem ser exigidos de crianças de 6 anos.

O piloto usa uma página de entrada própria, sem formulário para nome, data de nascimento, foto, e-mail ou senha da criança. O cadastro de adultos não é aberto: a lista continua privada e manual. Os caminhos de outras aplicações são recusados no servidor antes da entrega, inclusive se o adulto tentar a URL direta; a verificação é repetida depois da resolução de symlinks. A CSP do piloto limita conexões a self e recusa iframes. Links externos de referência ainda podem levar a outros sites; acompanhamento adulto permanece necessário.

Essas restrições só valerão na origem do servidor quando a versão for implantada. O GitHub Pages atual e cópias previamente baixadas continuam públicos. Não houve alteração de segredos, contas ou configurações reais no Render, e o login Google de produção ainda não foi testado.

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

- Nome completo/identificação do responsável pelo tratamento e contato de privacidade que poderá ser publicado.
- Definição documentada de finalidade e fundamento legal, considerando melhor interesse e idade. Se consentimento for a base escolhida para dados da criança, implementar procedimento específico, destacado e verificável do responsável; esta versão não o coleta.
- Aviso real dos provedores, retenção de logs, localização do serviço e transferências pertinentes. A região do serviço Render deve ser conferida no painel.
- Se houver relação com escola ou instituição, esclarecer os papéis e responsabilidades antes de usar dados de alunos.
- Fazer deploy manual da versão nova no Render (as atualizações automáticas estão desligadas), preencher as informações obrigatórias e testar as duas contas, logout, revogação e links diretos. Enquanto faltar configuração, o launcher mantém 503 e não serve atividades.
- Somente após validar a origem nova, planejar a retirada das rotas antigas do GitHub Pages. Não quebrar os links públicos antes de o substituto estar verificado.

Lei de referência: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — considerar os artigos 6º, 9º, 14 e 18, além do fundamento aplicável. O melhor interesse não se resume a um checkbox ou à autenticação Google.

## Verificação

218 testes Node na suíte local. O teste integrado do piloto usa provedor Google simulado, assinatura RSA e identidades fictícias: verifica callback, sessão de adulto autorizado, bloqueio autenticado de aplicações fora do piloto, CSP e revogação imediata. Não deve ser confundido com teste no Google real ou Render. Os testes existentes continuam cobrindo cookies, PKCE, claims inválidos, acesso direto sem sessão, exportação sem segredos e modo de configuração fechado.
