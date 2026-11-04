# Preparação dos documentos — revisão de 4 de novembro de 2026

**RASCUNHO PARA REVISÃO — NÃO VIGENTE.**

Responsável: Leonardo Sardinha. Contato autorizado para publicação: leosardinhalaus@gmail.com. Projeto independente, sem vínculo institucional presumido.

## O que já avançou

- Novo portal de referência: https://leo-sardinha-educacao-v2.onrender.com .
- O responsável reportou status ready, mode auth-test e confirmou entrada, conta reconhecida, saída e novo acesso.
- A correção da saída foi publicada em 22b4af2. Foi reproduzido no Chromium que no-referrer pode enviar Origin null no POST; same-origin preserva a validação da origem. Os testes verificam sessão encerrada e recusa de origens indevidas e CSRF inválido.
- Uso nos dois contextos confirmado: em casa/com famílias e em escolas ou cursos. A proposta de operação descreve os cuidados específicos de cada contexto.
- Identificação, contato e região Oregon (US West), Estados Unidos, foram informados. Isso não confirma todos os locais de tratamento dos provedores.
- Política, termos, inventário e comunicado às famílias foram atualizados para refletir o teste. Há proposta concreta de operação em PROPOSTA_OPERACAO_PILOTO.md.

A evidência informada pelo responsável não equivale a uma inspeção administrativa do Render nem a teste de todas as contas.

## Decisões preparadas para revisão

A proposta de operação detalha fundamento por finalidade, necessidade, limites, revisão mensal da lista de adultos, exclusão de suporte rotineiro até 90 dias após encerramento e roteiro de direitos e incidentes. Os prazos são propostas de governança, não configurações já aplicadas. Não é solicitado consentimento genérico nem presumida adoção pelo funcionamento do login.

## Conferências ainda necessárias

| Item | O que falta | Como concluir |
|---|---|---|
| Contextos confirmados | Uso em casa/com famílias e em escolas ou cursos, informado em 4/11/2026 | Preparar os dois fluxos; para cada instituição, ainda registrar responsáveis e papéis por canal privado, sem listas de alunos |
| Fundamentos e melhor interesse | Decisão por operação e riscos do uso por menores | Revisar proposta e documentar avaliação; se a base exigir consentimento parental, definir procedimento específico antes do tratamento |
| ECA e ECA Digital | Demonstrar medidas aplicáveis e adequação etária | Partir da oferta dirigida a menores, revisar proteção integral e registrar riscos e salvaguardas; guia de escopo da ANPD de 28/10/2026 incluído na revisão; login adulto não demonstra cumprimento |
| Render | Plano Hobby confirmado e tela de Log Streams conferida | Referência de 7 dias no explorador; captura mostra Set default, sem destino padrão configurado. Retenções de outros dados e condições dos provedores permanecem em avaliação |
| Provedores e transferências | Termos aplicáveis e mecanismo pertinente | Conferir condições de Google/Render e o mecanismo do art. 33 da LGPD; contrato estrangeiro ou região informada não bastam como comprovação |
| Acesso | Completar verificações que ainda não foram reportadas | Segunda conta autorizada, conta fora da lista, revogação e links diretos de jogos/PDFs; testes fictícios não substituem evidência real |
| Publicação e migração | Separar recursos abertos e o que se pretende restringir | Definir rotas, informar links antigos e impedir novas entregas onde cabível; repositório/histórico/cópias já públicos não se tornam privados |
| Adoção | Aprovação do texto e data efetiva | Registrar decisão e publicar versão acessível no portal; só então planejar liberação das atividades revisadas |

## Revisão LGPD e ECA solicitada

O relatório RELATORIO_REVISAO_LGPD_ECA.md reúne base normativa, correções e critérios de fechamento. Foram acrescentados direitos completos do titular, proteção de imagem, autonomia progressiva, respeito e informação simples para estudantes. Permanecem pendentes a demonstração das medidas de idade e supervisão pertinentes, a avaliação de riscos e acessibilidade, as condições dos provedores e a adoção dos procedimentos. Não usar a revisão como selo de conformidade.

## Avaliação das aplicações e preparação institucional

Foram preparados AVALIACAO_RISCOS_PILOTO.md e FICHA_PREPARACAO_INSTITUCIONAL.md, com evidências locais em EVIDENCIAS_PILOTO_2026-11-04.json. Nas interações limitadas no Chromium não houve requisições externas, cookies ou chaves de localStorage/sessionStorage criados pelas quatro aplicações. Isso não certifica produção, todos os fluxos ou provedores.

As fichas de música foram ajustadas na cópia local para substituir Nome/Turma/Data por registro opcional sem identificação pessoal. O código e o PDF ajustados estão incluídos nesta revisão autorizada para publicação; o estado do Render deve ser verificado separadamente. Relatórios da Batalha Naval podem ser identificáveis pelo contexto, pelas respostas e horários; a necessidade de guardar essa granularidade precisa ser avaliada.

Plano do workspace Render: Hobby, confirmado pelo responsável em 4 de novembro de 2026. A documentação pública informa retenção de 7 dias no explorador de logs para esse plano. A captura enviada mostra Set default em Log Streams, sem destino padrão configurado. Retenções de outros dados dos provedores ainda não foram confirmadas; o prazo do explorador não garante exclusão de todos os dados técnicos.

## Estado atual

EDU_ACTIVITIES_ENABLED=false e EDU_SUPERVISED_PILOT=true. O teste de login está funcionando; jogos e PDFs continuam bloqueados nesse modo. Esta revisão não altera variáveis, lista privada, segredos ou o status do serviço. Não publica política final nem autoriza uso com alunos.

Plano Hobby e ausência de destino padrão em Log Streams foram registrados com base nas informações e captura do responsável. As próximas frentes são a revisão das condições dos provedores e das transferências, os procedimentos de proteção de menores e a decisão sobre publicação dos rascunhos. Não solicitar novamente os dois dados já conferidos.
