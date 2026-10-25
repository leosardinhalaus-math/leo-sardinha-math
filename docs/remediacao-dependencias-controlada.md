# Remediação de dependências — execução controlada

## Evidências da auditoria
- `jogos/calculus-royale-src`: `vite@7.3.6` e `source-map-js@1.2.1` foram reportados com severidade alta pelo npm audit.
- `tools/firebase-tests`: `@grpc/grpc-js@1.9.16` e dependências transitivas apresentaram alertas, somando 6 altos e 5 moderados no último relatório.
- `npm audit fix --force` **não** foi autorizado automaticamente: pode aplicar versões com breaking changes.
- Supabase Calculus Royale (`vmblubjbgwhaplsptymj`) permanece `INACTIVE` na última consulta, impedindo testes reais de RLS.

## Solução preparada
O workflow `dependency-remediation-preview.yml` propõe atualizar apenas os lockfiles com `npm audit fix --package-lock-only --ignore-scripts`, sem `--force`. Ele confirma que manifestos `package.json` permanecem intactos, reexecuta o npm audit, testa instalação com `npm ci` sem scripts e publica o patch como artefato para análise.

**Atenção:** esse fluxo é uma proposta automatizada, **não** corrige o repositório por si só. O patch só deve ser aplicado após análise e execução dos testes funcionais do jogo, incluindo os scripts de geração de modelos.

## Critérios
1. Download e revisão dos patches gerados por cada job.
2. Atualização segura do lockfile com testes locais/CI de build e runtime.
3. Zero vulnerabilidades altas ou críticas pendentes sem mitigação documentada.
4. Supabase ativo, RLS validada com usuários distintos.
5. Pull request revisado antes de merge.

O workflow usa `workflow_dispatch` para repetição posterior e também executa quando seu próprio arquivo muda em PR. Nenhuma chave, token ou segredo é escrito em logs.
