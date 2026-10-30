# Leo Sardinha.Math / Calculus Royale — plano de reversão e lançamento

**Estado:** preparação técnica para PR #4; **não autoriza merge nem publicação automática**. Atualização 26/10/2026.

## 1. Referências e limites

- Repositório `leosardinhalaus-math/leo-sardinha-math`.
- Branch em revisão `auditoria-lgpd-video-2026-10`, PR `#4`, mantida **draft**.
- Baseline estável de referência para esta rodada: `fdcf7e0473f481dea6eb8d26a3cbf0e53b8baf03` (9 checks verdes ao ser inspecionado).
- `main` permanece a fonte publicada; não fazer `git push --force`, apagar branches ou mudar o provedor de autenticação para tentar consertar um incidente.
- A auditoria criou documentação e testes; correções executadas na branch **não são atualizações automáticas do site público**.
- O banco Supabase do Calculus Royale é um serviço compartilhado com a versão pública; sem ambiente isolado de staging, **não modificar suas policies/tabelas com base só nestes testes**.

## 2. Pré-requisitos mínimos de lançamento

1. Todos os checks requeridos, inclusive `Security regressions`, `Secret exposure guard`, `Git history secret audit`, `Dependency security audit`, `Calculus Royale build and dependency gate`, `Build Calculus Royale` e `Firestore rules`, devem concluir com `success` no **SHA que se pretende mesclar**. Checks anteriores não bastam.
2. Realizar testes manuais no navegador e celular: abrir `index.html`, `educacao.html`, nove destinos anunciados, cadastrar conta, confirmar e-mail, autenticar, sair e entrar novamente, salvar online, carregar perfil e ranking, perder conexão e recuperá-la.
3. Testar acesso no Supabase com três identidades distintas (visitante, A e B) em ambiente de teste. RLS habilitada por si só não prova isolamento de dados.
4. **Pontuação confiável:** o ranking atual continua informal e manipulável por `localStorage`. Não anunciá-lo como oficial nem ativar premiação competitiva sem simulação autoritativa no servidor. Consultar `docs/contrato-ranking-verificado-calculus-royale.md`.
5. Concluir revisão de privacidade LGPD para público educativo (responsável pelos dados, contato, contas infantis, retenção e exclusão), sem alegar conformidade completa antes disso.
6. Fazer uma revisão humana final das alterações; somente então avaliar remover o rascunho e mesclar a PR.

## 3. Reversão antes do merge (situação atual)

- **Falha de CI ou experiência:** manter PR em rascunho; interromper liberação e investigar o job/arquivo afetado; recuperar o arquivo do último commit aprovado.
- Registrar commit e observação com evidência. Para desfazer um commit específico, preferir um novo `git revert <commit_sha>` **na branch**, ou repor o arquivo antigo em novo commit. Evitar reset destrutivo/force push.
- Caso falhe a página provisória Godot, é seguro remover a chamada na navegação da branch e/ou reverter o commit que a criou; a arena Three.js existente permanece independente.
- Após reversão, rerodar os testes e conferir o efeito visual do botão antes de tratar como resolvido.

## 4. Reversão depois de um futuro merge (somente se aprovado)

- Criar nova PR com `git revert <merge_commit>` (ajustando corretamente o tipo de merge); manter trilha de auditoria.
- Evitar apagar registros de partidas, perfis, backups ou contas. Uma reversão do frontend **não desfaz automaticamente uma migração SQL ou dados**.
- Se houver incidente envolvendo segredo exposto, **revogar a credencial primeiro**; retirar o segredo do Git isoladamente não invalida tokens antigos.
- Se a interface ficar indisponível, republicar um artefato conhecido e verificado por processo de deploy controlado, sem publicar builds locais não testados.

## 5. Reversão de uma eventual alteração no Supabase

**Não há DDL novo aplicado por esta rodada.** Antes de qualquer migração futura: registrar backup verificável, esquema anterior, GRANTs e políticas, dependências, queries de teste e SQL reverso; executar primeiro em staging. Alterações de RLS ou de leitura pública exigem testes com múltiplas contas, porque podem cortar o ranking sem mensagem clara ao visitante. Não prometer rollback sem backup confirmado.

## 6. Testes pós-liberação e observabilidade

- Rodar smoke tests de rotas anunciadas e páginas de perfil/ranking.
- Testar origem móvel com conexão intermitente e navegador desktop.
- Confirmar ausência de erros JS fatais, dados falsamente anunciados como salvos e links inexistentes.
- Conferir o uso de recursos externos e custos reais antes de ativar serviços adicionais.
- Não incluir tokens, e-mails, dados privados ou screenshots de contas reais em logs públicos de GitHub Actions.

## 7. Notas de lançamento (rascunho, não publicadas)

**Melhorias candidatas:**
- Erro de link Godot substituído por página honesta de desenvolvimento, com rota para jogo jogável.
- Correção da contagem fictícia de vitórias iniciais de jogadores novos.
- Cadastro com confirmação de e-mail, renovação concorrente de sessão e preservação do progresso durante falha de conexão.
- Consulta de ranking que associa perfis ao conjunto correto de pontuações.
- Novos testes de segurança para HTML dinâmico, persistência e páginas.
- Atualização do aviso de privacidade e inventário técnico.

**Limitações a comunicar:** versão Godot não foi publicada; estatísticas do ranking Supabase não são verificadas por servidor; cobertura de emulador e unit tests não significa teste físico completo; privacidade LGPD permanece em revisão.

## 8. Critério de saída do plano de 100 passos

A última etapa (autorizar merge) é **condicional**. Se as etapas que dependem de identidades reais, ambiente isolado, dispositivo e política de dados continuarem sem evidências, encerrar o relatório de diagnóstico com bloqueadores explícitos, não com uma contagem artificial de 100/100.
