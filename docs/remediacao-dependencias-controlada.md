# Remediação de dependências — execução controlada

## Evidências da auditoria
- `jogos/calculus-royale-src`: `vite@7.3.6` e `source-map-js@1.2.1` foram reportados com severidade alta pelo npm audit.
- `tools/firebase-tests`: `@grpc/grpc-js@1.9.16` e dependências transitivas apresentaram alertas, somando 6 altos e 5 moderados no último relatório.
- `npm audit fix --force` **não** foi autorizado automaticamente: pode aplicar versões com breaking changes.
- **Histórico:** Supabase permaneceu inativo nas consultas anteriores; foi restaurado em 25/10/2026 e confirmado `ACTIVE_HEALTHY`.

## Solução preparada
O workflow `dependency-remediation-preview.yml` propõe atualizar apenas os lockfiles com `npm audit fix --package-lock-only --ignore-scripts`, sem `--force`. Ele confirma que manifestos `package.json` permanecem intactos, reexecuta o npm audit, testa instalação com `npm ci` sem scripts e publica o patch como artefato para análise.

**Atualização de 25/10/2026:** o patch do jogo foi incorporado ao lockfile; o workflow `Calculus Royale build and dependency gate` passou. As dependências Firebase receberam overrides testados de `@grpc/grpc-js` 1.13.6 e `@opentelemetry/core` ^2.8.0, e `Firestore rules` passou com 12 testes. Restam 3 avisos moderados no npm audit do Firebase. Este texto inicial preserva o histórico dos achados.

## Critérios
1. Download e revisão dos patches gerados por cada job.
2. Atualização segura do lockfile com testes locais/CI de build e runtime.
3. Zero vulnerabilidades altas ou críticas pendentes sem mitigação documentada.
4. Supabase ativo, RLS validada com usuários distintos.
5. Pull request revisado antes de merge.

O workflow usa `workflow_dispatch` para repetição posterior e também executa quando seu próprio arquivo muda em PR. Nenhuma chave, token ou segredo é escrito em logs.
