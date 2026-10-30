# Estratégia de integração dos PRs #2–#6 — 25/10/2026

## Decisão
**Preservar todos os PRs em rascunho. Consolidar segurança no PR #4, recuperar funcionalidade do PR #2 somente depois de atualizar sua base, integrar SEO (#5) e editoriais (#6) posteriormente, sempre com validação. Não publicar ou fazer merge automaticamente.**

## Comparação real de arquivos e Git
| PR | Finalidade | Estado observado | Dependências |
|---|---|---|---|
| #2 | Recompensas, baús, torres e combate | `mergeable=false`; 1 commit à frente e **30 atrás** da main; 17 arquivos modificados | Precisa atualização/rebase e testes de jogabilidade antes de merge |
| #3 | Segurança básica, CI, aviso de privacidade | `mergeable=true`; 9 arquivos modificados | Divide `perfil/index.html` e `ranking/index.html` com #4 |
| #4 | Auditoria e correção de segurança geral | `mergeable=true` antes desta rodada; dezenas de arquivos | Gatilho para validações de segurança, RLS e tokens |
| #5 | SEO, favicon, metadados, sitemap | `mergeable=true`; altera perfil/ranking e várias páginas de site | Revisar conflitos e preservar avisos de privacidade e segurança do #4 |
| #6 | Módulos editoriais e documentação | `mergeable=true`; altera `index.html` e `educacao.html` | Revisar com alterações de SEO do #5 |

Na comparação **dos arquivos alterados nos próprios PRs**, #2 não tem caminhos em comum com #3/#4. Isso **não significa** que #2 esteja pronto para merge: o GitHub informa que não é mesclável com a `main`, após divergência histórica. Não forçar o merge nem sobrescrever arquivos de jogo recentes.

## Consolidação efetuada no PR #4
- Portado de #3 o `privacidade.html`, explicitamente marcado como **minuta em revisão**, sem alegar conformidade LGPD.
- Portada a referência documental à LGPD com atribuição à obra original.
- Avisos aos novos usuários e links à privacidade em ambas as cópias da página de perfil e ranking, sem retirar os avisos sobre placares não validados.
- Gatilhos de `.github/workflows/security-regressions.yml` ampliados para `jogos/calculus-royale-src/**` em push e PR.
- Adicionados testes de privacidade e paridade das páginas.
- Ampliado `.github/workflows/calculus-build-gate.yml` com testes de combate, salvamento, progressão, regras de batalha e encontros nas cavernas antes do build.
- A publicação do site continua fora desta branch.

O PR #3 **não deve ser fechado ainda**: conserva mudanças exclusivas em `index.html` e `wiki.html`, além de um workflow alternativo e documentação histórica. Conferir/portar o que permanecer necessário e só então decidir sobre encerramento por duplicidade, sem perder autoria.

## Ordem de integração sugerida

1. **#4 como base de segurança**: conferir 8 workflows, testes RLS entre usuários A/B, cadastro/desconexão reais e navegação mobile; concluir aviso de privacidade antes de divulgar cadastro. Revisar as implicações do auto-deploy antes de permitir merge.
2. **#3 consolidado**: comparar linha a linha os avisos da página inicial/wiki e preservá-los, se úteis; evitar mesclar HTML antigo sobre as cópias mais seguras do #4.
3. **#2 funcionalidade**: criar branch de integração sobre uma base atualizada, aplicar a mudança tática em pequenos commits com resolução manual, manter personagens/arquivos recentes; executar testes de combate, baús, salvamento, campanha, builds e verificações mobile antes de aprovação.
4. **#5 SEO**: reaplicar metadados a partir da base integrada, especialmente nos HTMLs de perfil/ranking (sem suprimir avisos), verificar canônicos, URL real e indexação.
5. **#6 editorial**: resolver as duas sobreposições `index.html` e `educacao.html` sobre a versão SEO, validar módulos no site e revisar interfaces/privacidade.

## Risco prioritário: build com push automático
O workflow `.github/workflows/build-calculus-royale.yml` da `main` usa `contents: write` e faz `git push origin HEAD:main` após compilar. Por isso, **um merge que altera a fonte do jogo pode acionar uma segunda escrita automática em produção**. Antes de autorizar o merge do #2 ou alterações futuras na fonte, migrar para um fluxo de build de PR em somente leitura e publicação explicitamente aprovada, ou configurar proteção da branch e revisar o mecanismo de deploy. Não remover essa automação às cegas, pois isso também afeta a atualização do jogo.

## Atualização — build sem push automático
No PR #4, o workflow `.github/workflows/build-calculus-royale.yml` foi alterado: o job agora tem `contents: read`, `persist-credentials: false`, não executa `git push` nem `git commit` e faz upload de um artefato `calculus-royale-build-candidate` para revisão. Uma regressão automatizada testa esses invariantes. **A alteração está apenas no PR**, não na `main` publicada.
Ao integrar #4, alterações futuras no código-fonte deixam de enviar automaticamente a pasta compilada `jogos/calculus-royale/` ao repositório. Será necessária uma etapa deliberada de promoção/publicação do artefato, com revisão e testes visuais.
Atenção: o workflow separado `.github/workflows/deploy.yml` do Godot ainda é disparado a cada push em `main` e publica o site via GitHub Pages. Portanto, **mesclar em `main` continua sendo um evento de publicação**, mesmo quando o workflow específico do Calculus Royale já não faz push.

## Critérios que impedem publicação
- Projeto público e jogos estáticos podem ser copiados tecnicamente; nunca expor segredos ou `service_role` no navegador.
- Placar informado pelo navegador ainda não é placar homologado: falta servidor verificar partidas.
- RLS no banco está habilitada e permissões foram verificadas por SQL, mas **não foi feito teste com duas contas reais distintas**.
- Documento de privacidade é minuta: faltam contato, bases legais, retenção e procedimento aplicável a menores.
- GitHub Actions e validação do PR precisam estar aprovados no **commit atual**, não em commits antigos.
- Revisar proteções de branch e deploy antes do merge na main.

## Comandos de referência para atualizar o PR #2 em ambiente de integração (não executados)
```sh
git fetch origin
git switch -c integration/calculus-rewards origin/main
git cherry-pick -n cd52d999e0c7ab22520704210c58b6324ffc7fbe
# Resolver os conflitos caso haja; não aceitar --theirs indiscriminadamente.
# Executar npm ci, npm run check, testes de combate/campanha/baús, npm run build.
# Commitar na branch de integração após revisão, sem push para main.
```
