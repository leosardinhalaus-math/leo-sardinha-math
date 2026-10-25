# Plano de 100 verificações de segurança — Leo Sardinha.Math

> Status **Verificado** indica exame de arquivo, log ou configuração, não comprova segurança total. **Pendente** exige teste ou correção adicional.

Última evidência: preview de remediação Vite/Calulus Royale passou com zero vulnerabilidades; Firebase continua com 5 altas e 5 moderadas. PR #4 permanece como rascunho. Não publicar até resolver os bloqueios.

## Credenciais e histórico
1. **Verificado** — Confirmar PR em rascunho.
2. **Verificado** — Verificar branch separada.
3. **Verificado** — Conferir .gitignore.
4. **Verificado** — .env ignorado.
5. **Verificado** — .env.* ignorado.
6. **Verificado** — Credenciais PEM ignoradas.
7. **Verificado** — Testar scanner de arquivos atuais.
8. **Verificado** — Testar scanner Git histórico.
9. **Verificado** — Garantir não imprimir valores das chaves.
10. **Pendente** — Verificar forks e clones externos.

## Configuração GitHub
11. **Verificado** — Permissão contents read.
12. **Verificado** — Revisar gatilhos PR.
13. **Verificado** — Revisar gatilhos main.
14. **Verificado** — Revisar checkout completo do histórico.
15. **Verificado** — Verificar timeout dos jobs.
16. **Verificado** — Verificar falhas com exit code.
17. **Pendente** — Bloquear merge em check reprovado.
18. **Pendente** — Revisar proteção branch main.
19. **Pendente** — Revisar revisores obrigatórios.
20. **Pendente** — Revisar privilégios Actions.

## Clientes e sessões
21. **Verificado** — Conferir cópia do player.js.
22. **Verificado** — Conferir cópia cloud-config.js.
23. **Verificado** — Restringir campos perfis públicos.
24. **Verificado** — Restringir campos estatísticas públicas.
25. **Verificado** — Identificar localStorage token.
26. **Pendente** — Analisar expiração sessão.
27. **Pendente** — Analisar logout.
28. **Pendente** — Analisar CSRF no provedor.
29. **Pendente** — Considerar cookies HttpOnly via backend.
30. **Pendente** — Testar contas A/B.

## XSS e DOM
31. **Verificado** — Testar nomes escapados no perfil.
32. **Verificado** — Testar nomes escapados no ranking.
33. **Verificado** — Testar paridade fonte/publicado.
34. **Pendente** — Mapear innerHTML.
35. **Pendente** — Mapear URL dinâmica.
36. **Pendente** — Verificar DOM injection.
37. **Pendente** — Testar escaping em mensagens.
38. **Pendente** — Verificar tratamento de erros.
39. **Pendente** — Avaliar CSP report-only.
40. **Pendente** — Testar CSP em navegadores.

## Supabase
41. **Verificado** — Identificar ID do projeto.
42. **Verificado** — Consultar estado do projeto.
43. **Pendente** — Obter advisory de segurança.
44. **Pendente** — Tentar listar tabelas.
45. **Pendente** — Confirmar RLS habilitada.
46. **Pendente** — Verificar policies SELECT público.
47. **Pendente** — Verificar USING proprietário.
48. **Pendente** — Verificar WITH CHECK proprietário.
49. **Pendente** — Testar isolamento entre jogadores.
50. **Pendente** — Revisar service_role fora do bundle.

## Firebase
51. **Verificado** — Revisar firestore.rules.
52. **Verificado** — Verificar leaderboard write false.
53. **Verificado** — Verificar owner em progresso.
54. **Verificado** — Verificar create valida campos.
55. **Pendente** — Verificar update valida campos.
56. **Pendente** — Verificar delete owner.
57. **Pendente** — Verificar list bounded.
58. **Pendente** — Testar emulador Firebase.
59. **Pendente** — Inspecionar índices e regras.
60. **Pendente** — Revisar Firebase SDK.

## Dependências de jogo
61. **Verificado** — Inspecionar package.json.
62. **Verificado** — Inspecionar package-lock.
63. **Verificado** — Auditar Vite.
64. **Verificado** — Auditar source-map-js.
65. **Verificado** — Gerar fix sem force.
66. **Verificado** — Verificar zero vulnerabilidades no preview.
67. **Verificado** — Preservar package.json.
68. **Pendente** — Verificar npm ci.
69. **Pendente** — Rodar typecheck após fix.
70. **Pendente** — Rodar build após fix.

## Dependências Firebase
71. **Verificado** — Inspecionar package.json Firebase.
72. **Verificado** — Inspecionar lockfile Firebase.
73. **Verificado** — Auditar gRPC.
74. **Verificado** — Auditar OpenTelemetry.
75. **Verificado** — Verificar Node exigido.
76. **Verificado** — Atualizar preview para Node 24.12.
77. **Verificado** — Executar audit fix sem force.
78. **Verificado** — Revisar conflitos transitivos.
79. **Pendente** — Testar emulador pós-fix.
80. **Pendente** — Corrigir todos altos sem regressão.

## Jogos e publicação
81. **Verificado** — Verificar build CI.
82. **Verificado** — Revisar service-worker cache.
83. **Verificado** — Revisar origem da navegação.
84. **Verificado** — Verificar dados privados em cache.
85. **Verificado** — Testar salvamento offline.
86. **Verificado** — Testar login no desktop.
87. **Verificado** — Testar login no celular.
88. **Verificado** — Testar ranking.
89. **Pendente** — Testar backup/restauração.
90. **Pendente** — Liberar publicação somente após gates.

## Privacidade e operação
91. **Pendente** — Verificar política de privacidade.
92. **Pendente** — Verificar minimização de dados.
93. **Pendente** — Verificar retenção logs.
94. **Pendente** — Verificar exclusão do usuário.
95. **Pendente** — Verificar direitos LGPD.
96. **Pendente** — Verificar dados menores.
97. **Pendente** — Verificar rate limits API.
98. **Pendente** — Verificar erros sem dados sensíveis.
99. **Pendente** — Preparar resposta a incidente.
100. **Pendente** — Rever resultado final dos 100 passos.

## Gates de publicação
- Dependências com severidade alta devem ser corrigidas/mitigadas e testadas.
- Projeto Supabase ativo e RLS validada com contas de teste.
- Build, regressões, verificação de credenciais e aprovação de revisão completos.
- Não modificar a branch main automaticamente enquanto houver bloqueios.