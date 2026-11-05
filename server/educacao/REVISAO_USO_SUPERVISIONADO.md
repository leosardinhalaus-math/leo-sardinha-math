# Piloto supervisionado — preparação técnica

> Revisão documental temporariamente retirada do site. Identificação e contato neste roteiro são marcadores de revisão: não copiá-los para a configuração em produção. As cópias de revisão são mantidas fora do repositório; não reinserir dados pessoais, evidências brutas ou PDFs sem conferência.

Contexto informado pelo responsável: projeto independente com público de 6 a 30 anos. Esta etapa não ativa cadastro infantil, não cadastra alunos e não presume que uma conta Google comprove maioridade. A lista inicial deve conter somente os dois endereços do próprio responsável, mantidos fora do repositório.

## Separação entre conteúdo aberto e acesso reservado

Diretriz atualizada em 5 de novembro de 2026: manter as atividades educativas públicas e usar login somente para funções ou materiais que tenham necessidade definida de restrição. A Educação no GitHub Pages continua aberta. O portal Render permanece em teste técnico, com atividades bloqueadas; a implementação agora prepara permissões distintas de professor e administrador, com páginas de conferência de acesso. O painel ainda não edita o site, publica arquivos ou altera contas. Essas operações exigem implementação e armazenamento próprios.

Um recurso reservado deve ficar fora do repositório e dos artefatos públicos, com autorização conferida no servidor antes de cada entrega. A escolha deve ser feita por recurso: não retirar toda a Educação nem modificar seu link para o portal de teste. O setor de revisão documental e seus downloads continuam retirados. O histórico e cópias já publicados não são apagados por essa separação.

## O que ficou preparado

`EDU_SUPERVISED_PILOT=true` é o padrão do servidor e consta no blueprint Render. O responsável pode testar quatro atividades locais: Batalha Naval, Bingo de Frações, Missão Primos e Música em Círculo. Há instruções específicas de adequação etária na entrada: a atividade de primos começa no 6º ano; o círculo musical contém aprofundamentos que não devem ser exigidos de crianças de 6 anos.

O piloto usa uma página de entrada própria, sem formulário para nome, data de nascimento, foto, e-mail ou senha da criança. O cadastro de adultos não é aberto: a lista continua privada e manual. Os caminhos de outras aplicações são recusados no servidor antes da entrega, inclusive se o adulto tentar a URL direta; a verificação é repetida depois da resolução de symlinks. A CSP do piloto limita conexões a self e recusa iframes. Links externos de referência ainda podem levar a outros sites; acompanhamento adulto permanece necessário.

O portal de referência é [ENDEREÇO PÚBLICO DO PROJETO] em modo auth-test. Em 4 de novembro de 2026, o responsável confirmou login reconhecido, saída e novo acesso. As quatro atividades continuam bloqueadas até decisão de liberação. O GitHub Pages atual e cópias previamente baixadas continuam públicos. A revisão documental não altera segredos, contas ou configurações reais. O teste informado não comprova todos os cenários reais de autorização e revogação.

## Inventário da revisão estática

| Componente | Dados/fluxo observado | Decisão do piloto |
|---|---|---|
| Portal Google | sub e e-mail verificado do adulto; sessão em memória; cookie essencial | Somente adultos manualmente autorizados; expiração e revogação por lista |
| Batalha Naval | respostas e relatório na memória da página; CSV/PDF baixados no aparelho | Permitido com acompanhamento; evitar identificação de aluno nas folhas |
| Bingo de Frações | marcações e desenho locais; nenhuma requisição de nuvem identificada no script revisado | Permitido; o adulto seleciona a proposta adequada |
| Missão Primos | limite numérico, Worker e estatísticas locais | Permitido para faixa adequada; sem perfil ou ranking |
| Música em Círculo | conjunto de notas, simulação e síntese sonora locais; PDFs locais | Permitido com mediação; fontes externas são links opcionais |
| Calculus Royale | integrações e tratamento de dados próprios, com revisão separada | Fora do piloto; proteção do portal não corrige o backend desse jogo |
| Scratch/GeoGebra | leitores externos e arquivos .sb3; applets podem comunicar com terceiros | Fora do piloto até adaptar o carregamento privado e revisar provedores |
| Matemática em Papel / demais jogos | módulos de recursos e integrações diferentes | Fora do piloto até revisão específica; não declarar todos aptos por compartilhar o site |

A revisão é técnica, baseada nos arquivos disponíveis e testes. Não certifica conformidade integral com a LGPD, contratos de operadores ou políticas do Google. Dados técnicos de conexão podem ser tratados por Google e Render mesmo sem um cadastro infantil; isso não é anonimização global.

## Pendências que exigem o titular

- Identificação e contato já informados: [RESPONSÁVEL A DEFINIR ANTES DA ADOÇÃO], [CONTATO A DEFINIR ANTES DA ADOÇÃO]. Proposta de operação preservada nas cópias privadas de revisão; adoção ainda pendente.
- Definição documentada de finalidade e fundamento legal, considerando melhor interesse e idade. Se consentimento for a base escolhida para dados da criança, implementar procedimento específico, destacado e verificável do responsável; esta versão não o coleta.
- Aviso real dos provedores, retenção de logs, localização do serviço e transferências pertinentes. Região e plano já foram informados pelo responsável e registrados nas cópias privadas. Não repetir a coleta desses dados; concluir as condições aplicáveis dos provedores e distinguir retenção no explorador de logs das demais retenções.
- Se houver relação com escola ou instituição, esclarecer os papéis e responsabilidades antes de usar dados de alunos.
- Duas contas, saída, novo acesso e bloqueio do jogo na mesma aba autenticada já reportados no serviço v2. No teste solicitado de PDF com sessão ativa, o responsável também enviou a tela de atividades bloqueadas; a captura registra o resultado visual, sem comprovar isoladamente URL, sessão ou código HTTP. Completar recusa de não autorizado e revogação, sem presumir política vigente a partir de ready.
- Avaliar o ECA Digital e suas medidas pertinentes; login de adulto não comprova idade, parentesco ou cumprimento das obrigações aplicáveis.
- Preservar as atividades abertas no GitHub Pages. Avaliar separadamente qualquer função ou material reservado; a existência do piloto não justifica retirar toda a Educação pública.

Lei de referência: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — considerar os artigos 6º, 9º, 14 e 18, além do fundamento aplicável. O melhor interesse não se resume a um checkbox ou à autenticação Google.

## Verificação

A suíte de Educação passou em 19 testes após a correção da saída. O total de outras suítes não é usado como prova de conformidade do piloto. O teste integrado do piloto usa provedor Google simulado, assinatura RSA e identidades fictícias: verifica callback, sessão de adulto autorizado, bloqueio autenticado de aplicações fora do piloto, CSP e revogação imediata. Não deve ser confundido com teste no Google real ou Render. Os testes existentes continuam cobrindo cookies, PKCE, claims inválidos, acesso direto sem sessão, exportação sem segredos e modo de configuração fechado.
