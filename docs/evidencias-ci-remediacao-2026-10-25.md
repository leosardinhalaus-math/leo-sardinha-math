# Evidências de execução — rodada seguinte (25/10/2026)

## CI confirmado no commit 2fbdff9
| Workflow | Resultado |
|---|---|
| Security regressions | PASS |
| Secret exposure guard | PASS |
| Git history secret audit | PASS |
| Dependency security audit | FAIL |
| Dependency remediation preview | FAIL no conjunto Firebase; PASS Calculus Royale |

## Precisão do resultado
- A proposta `npm audit fix --package-lock-only --ignore-scripts` para Calculus Royale passou por auditoria de dependências, instalação, verificação TypeScript e build no ambiente do workflow. O patch ainda não foi aplicado ao lockfile versionado.
- No conjunto Firebase, mesmo após a tentativa não destrutiva, restaram alertas do npm; o workflow foi ajustado para **continuar a coletar evidências** de instalação e patch. O gate separado `Dependency security audit` continua bloqueante e **não teve sua severidade reduzida**.
- Os patches `remediation-0` e `remediation-1` foram gerados como artefatos GitHub Actions no run `40157972249`. Precisam ser revisados antes de qualquer incorporação.
- A execução após o commit que mantém a coleta de evidências deve ser confirmada separadamente.

## Próximas intervenções controladas
1. Aplicar patch do Calculus Royale após revisar exatamente as alterações do lockfile; rodar `npm ci`, `npm run check`, `npm run build` e testes funcionais.
2. Para Firebase, registrar o caminho transitivo dos pacotes vulneráveis e resolver requisitos de versão/Node sem `npm audit fix --force` arbitrário.
3. Testar Firebase Emulator com as versões propostas.
4. Reativação do Supabase não executada; projeto inativo até a última consulta.
5. Validar RLS real e autenticação com pelo menos dois usuários de teste.
6. Não publicar na main enquanto os bloqueios continuarem.
