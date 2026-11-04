# Inventário do piloto — conferência técnica

**RASCUNHO PARA REVISÃO — NÃO VIGENTE.**

Atualização: 4 de novembro de 2026. Este inventário distingue o código revisado e o resultado do teste informado pelo responsável; não certifica todas as configurações da hospedagem. A liberação de atividades permanece pausada. Não contém a lista privada de contas, client secret ou tokens.

## 1. Informações já confirmadas pelo responsável

Responsável: **Leonardo Sardinha**.

Contato de privacidade autorizado para publicação: **leosardinhalaus@gmail.com**.

Projeto independente, com público previsto de 6 a 30 anos. Uso previsto em casa/com famílias e em escolas ou cursos, confirmado em 4 de novembro de 2026. Piloto proposto: entrada somente por adulto autorizado, sem cadastro infantil e sem perfil individual de aprendizagem. Os fluxos de acompanhamento e preparação institucional estão em PROPOSTA_OPERACAO_PILOTO.md; não há instituição identificada, lista de alunos ou novas contas autorizadas por esta revisão.

Origem do teste: https://leo-sardinha-educacao-v2.onrender.com. O responsável confirmou Login reconhecido, saída para a tela de acesso e novo login. A versão de correção da saída é 22b4af2; a origem anterior não é o endereço de referência para novos testes. Isso não comprova teste real de ambas as contas, revogação, negação de conta não autorizada ou remoção das cópias públicas.

## 2. Dados e prazos no código do portal

| Operação | Dados mínimos | Prazo ou limite previsto |
|---|---|---|
| Início do login | state, nonce, verificador PKCE e identificador aleatório da tentativa | Até 10 minutos no servidor; tentativa consumida no callback |
| Validação Google | Token de identidade, sub e e-mail verificado; hd usado apenas para determinar se a conta é gerenciada | Token descartado após a verificação; domínio hd não é guardado na sessão |
| Sessão autorizada | sub, e-mail, indicador de autoridade do e-mail, CSRF e horários de criação/uso | 30 minutos de inatividade ou 8 horas absolutas; reinícios podem encerrar antes |
| Lista privada | E-mails de adultos e, quando necessário, vínculo com o sub estável da conta | Enquanto autorizados; relida a cada acesso; periodicidade de revisão ainda a definir |
| Logs deliberados do aplicativo | Tipo de evento e horário | Encaminhados à saída do processo; retenção final depende da hospedagem |
| Documentos de privacidade | Nome do responsável e contato autorizado | Publicação futura vinculada à adoção; rascunhos já são identificados como tal |

Cookies essenciais previstos: __Host-edu-flow e __Host-edu-session. Os prazos de validade no servidor não são uma promessa de exclusão de todo vestígio do navegador ou dos provedores.

## 3. Autoridade da conta e autorização

Assinatura, emissor, audiência, expiração e nonce são verificados antes de autorizar. O e-mail deve constar na lista privada.

Para entradas simples por e-mail, a implementação exige Gmail ou indicação hd de conta gerenciada, conforme as orientações do Google. Em um endereço de terceiro sem essa indicação, email_verified não basta: o acesso exige vínculo manual entre e-mail e sub estável na lista privada. Uma tentativa recusada não autoriza trocar ou ampliar a lista automaticamente.

Não se grava o token Google em localStorage no portal. Não há prova automática de maioridade; a lista deve continuar limitada a adultos manualmente autorizados. A autorização técnica não constitui consentimento para tratar dados de crianças.

## 4. Atividades incluídas no piloto

| Aplicação | Tratamento identificado no código revisado | Limite importante |
|---|---|---|
| Batalha Naval | Contas, respostas e relatório em memória da página; CSV e PDF no aparelho | Sem registro individual no servidor do portal; não inserir identificação desnecessária em folhas |
| Bingo de Frações | Marcações e desenhos locais no navegador | Adulto escolhe uma proposta adequada à idade |
| Missão Primos | Limite numérico, Worker, gráficos e estatísticas locais | Conteúdo indicado a partir do 6º ano, não como atividade autônoma para 6 anos |
| Música em Círculo | Notas, figuras, síntese sonora e fichas locais | Áudio não exige microfone; fontes externas são links opcionais; mediação conforme a idade |

O código revisado dessas aplicações não identificou envio automático dessas respostas para nuvem. Isso não elimina dados técnicos de conexão tratados pela hospedagem, nem dispensa revisão se o código mudar.

Calculus Royale, demais jogos e leitores Scratch/GeoGebra ficam fora do piloto até avaliação própria. O servidor recusa esses caminhos no modo supervisionado; a CSP limita conexões à própria origem e bloqueia iframes. A origem pública antiga não recebe essa proteção automaticamente.

## 5. Provedores: fatos e pendências

Google: autenticação com escopos openid email; não se solicita Gmail, Drive ou contatos. O Google pode tratar dados técnicos conforme seus serviços e políticas. A documentação orienta usar sub como identificador estável; email_verified não garante autoridade sobre qualquer endereço externo.

Render: fornece hospedagem e HTTPS. A documentação informa que a retenção dos logs depende do plano do workspace; não se deve confundir plano Free do serviço com todos os planos e configurações da conta. O responsável informou no painel a região **Oregon (US West), Estados Unidos**, em 3 de novembro de 2026. O plano Hobby foi confirmado em 4 de novembro de 2026, ao qual a documentação atribui 7 dias no explorador de logs. Em 4 de novembro de 2026, a captura do responsável mostrou Set default em Log Streams, sem destino padrão configurado. Retenções de outros dados técnicos ainda devem ser confirmadas. A região do serviço não determina, por si só, todos os locais de tratamento do provedor.

GitHub Pages: mantém a parte pública. O repositório, a história e arquivos anteriormente públicos não se tornam privados porque existe um portal no Render.

Supabase/Firebase/GeoGebra/TurboWarp: não são usados para cadastrar alunos ou guardar respostas nas quatro atividades deste piloto. Módulos antigos que os utilizem exigem auditoria separada; não há alegação de que todo o site esteja livre desses serviços.

## 6. Campos do Render e estado

| Campo | Valor ou decisão | Estado |
|---|---|---|
| EDU_CONTROLLER_NAME | Leonardo Sardinha | Identificação fornecida; processo ready reportado pelo responsável |
| EDU_PRIVACY_CONTACT | leosardinhalaus@gmail.com | Contato autorizado; processo ready reportado pelo responsável |
| EDU_LEGAL_BASIS_NOTICE | Aviso restrito ao teste das próprias contas | Configurado para o teste; não é fundamento aprovado para alunos |
| EDU_PROVIDER_NOTICE | Aviso do teste sobre Google, Render e Oregon | Configurado para o teste; condições finais e transferências continuam em avaliação |

O retorno status: ready indica que as variáveis obrigatórias não estão vazias e a lista passou na validação; não comprova que o conteúdo de cada aviso foi aprovado. Nenhuma dessas informações muda os segredos do Render. Não há autorização para ativação automática ou para incluir contas de alunos.

## 7. Retenção documentada pelo provedor

A documentação pública do Render consultada em 4 de novembro de 2026 informa retenção de logs de 7 dias em workspace Hobby, 14 dias em Pro e 30 dias em Scale/Enterprise. São prazos do explorador de logs; não equivalem à exclusão de todos os dados do provedor. O plano Free da instância não confirma sozinho o plano do workspace nem a ausência de encaminhamento externo de logs.

## 8. Limites constatados na revisão LGPD e ECA

A revisão documental não encontrou evidência de mecanismo implantado de aferição de idade, verificação de vínculo com responsável legal, coleta verificável de consentimento parental, teste de acessibilidade com o público ou avaliação formal completa de risco por atividade. A conta autorizada é controle de acesso do adulto. Essas lacunas não são consideradas resolvidas por esta revisão nem pela existência de CSP e cookies seguros.

Não enviar respostas ao servidor não exclui tratamento local de dados pessoais. O fluxo em aparelhos compartilhados e os registros próprios de instituições devem ser avaliados. A proposta agora contém critérios de respeito, proteção de imagem e informação simples; esses critérios ainda exigem aplicação e verificação nas atividades antes da liberação. Consulte RELATORIO_REVISAO_LGPD_ECA.md.

## 9. Evidência local adicional de 4 de novembro de 2026

EVIDENCIAS_PILOTO_2026-11-04.json registra interações limitadas no Chromium em contextos novos. Não houve requisições externas, erros JavaScript, cookies ou chaves de localStorage/sessionStorage criados pelas aplicações nesse teste. A sessão do portal real, todos os estados possíveis, caches e logs do provedor não foram medidos por essa execução.

Na cópia local, a ficha HTML e o gerador PDF de Música em Círculo agora usam registro opcional sem identificação pessoal, em lugar de Nome/Turma/Data. O ajuste está incluído nesta revisão autorizada para publicação; a implantação no Render deve ser verificada separadamente. O relatório da Batalha Naval inclui respostas, ano e horários; os rótulos Jogador 1/Equipe não garantem anonimato por contexto. Os riscos e a preparação institucional estão detalhados em AVALIACAO_RISCOS_PILOTO.md e FICHA_PREPARACAO_INSTITUCIONAL.md.

O plano Hobby do workspace foi confirmado pelo responsável em 4 de novembro de 2026. A referência documental aplicável é de 7 dias no explorador de logs. A captura de Log Streams enviada pelo responsável mostra Set default, sem destino padrão configurado naquela tela; retenções de outros dados técnicos continuam pendentes de conferência. Não se afirma exclusão global dos dados após 7 dias.

## 10. Fontes consultadas

- Google OpenID Connect: https://developers.google.com/identity/openid-connect/openid-connect
- Verificação da identidade e autoridade do e-mail: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- Logs do Render: https://render.com/docs/logging
- Condições do plano gratuito: https://render.com/docs/free
- Tratamento de dados pelo Render: https://render.com/dpa
- Privacidade do Render: https://render.com/privacy

As fontes descrevem os produtos; não confirmam contratos ou opções da conta concreta do responsável. A região Render foi informada separadamente pelo responsável.
