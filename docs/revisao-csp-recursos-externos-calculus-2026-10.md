# Calculus Royale — revisão de CSP, recursos externos e integridade

**26/10/2026 · somente branch PR #4.** Trata-se de auditoria da superfície do Calculus Royale, não de todas as páginas do portal, nem de uma política CSP aplicada em produção.

## 1. Inventário dos recursos em execução

| Local | Evidência | Classificação |
| --- | --- | --- |
| `jogos/calculus-royale/index.html` | App JavaScript e CSS servidos por `./assets/` na mesma origem, com nome de arquivo versionado | Produção do jogo, sem CDN JS explicitamente referida no HTML |
| `jogos/calculus-royale/perfil/index.html` | `cloud-config.js`, `player.js` da própria origem e **um controlador script inline** | Conta Supabase atualmente ativa |
| `jogos/calculus-royale/ranking/index.html` | `cloud-config.js`, `player.js` da própria origem e **um controlador script inline** | Ranking público atual |
| `jogos/calculus-royale/player.js` | Usa `fetch` para `https://vmblubjbgwhaplsptymj.supabase.co` | Domínio de API necessário para login e estatísticas |
| `jogos/calculus-royale/firebase-runtime.js` | Importa ES modules `firebase-app.js`, `firebase-auth.js`, `firebase-firestore.js` de `https://www.gstatic.com/firebasejs/13.0.0/` | **Alternativa desativada:** `cloud-config.js` declara `provider: 'supabase'` e `firebase: null` |
| `jogos/calculus-royale-src/package.json` | React, Three.js, Vite, TypeScript e dependências npm; workflows fazem `npm ci`, check, build e auditoria | Risco de supply chain gerido parcialmente por lockfiles/CI |

Nenhum `service_role` do Supabase deve ser incluído no frontend. Chaves **publishable** são públicas por definição e dependem de RLS correta para limitar o acesso. Nenhuma chave de servidor foi colocada nesse relatório.

## 2. Por que não ativar CSP restritiva às cegas

As páginas de **perfil** e **ranking** ainda executam scripts inline, e o HTML usa atributos `style` em algumas tags. Uma regra `script-src 'self'` aplicada diretamente, sem nonce/hash ou extração dos controladores para arquivos estáticos, interromperia login e ranking. `style-src 'self'` sem adaptação também bloquearia estilos inline. O jogo 3D pode exigir revisão separada de `worker-src`, `blob:`, `img-src` e carregamento de modelos.

A hospedagem atual é GitHub Pages. O suporte nativo a cabeçalhos personalizados precisa ser verificado no provedor escolhido antes de prescrever configuração (arquivo `_headers` é recurso de **Cloudflare Pages**, não deve ser apresentado como solução universal de GitHub Pages). Uma política via `<meta http-equiv="Content-Security-Policy">` pode oferecer proteção limitada, mas não equivale a todos os cabeçalhos HTTP e não suporta todos os recursos de CSP.

**Plano de migração:** (1) extrair controladores inline para JS de primeira parte mantendo testes; (2) remover atributos de estilo inline quando viável; (3) documentar origens de `connect-src`, imagens, fontes e workers; (4) testar `Content-Security-Policy-Report-Only` onde houver suporte a cabeçalhos, sem enviar dados pessoais nos relatórios; (5) adotar e testar uma CSP restritiva; (6) validar login, ranking, offline e arena em navegadores reais. Não aplicar `unsafe-inline` indiscriminadamente como solução.

## 3. Integridade de scripts externos

- O HTML de produção do Calculus Royale usa arquivos JS e CSS próprios da origem. **Nome com hash no bundle não equivale por si só a SRI**, mas reduz o risco de cache obsoleto quando combinado com build controlado.
- A alternativa Firebase importa módulos diretamente de `www.gstatic.com` com versões explícitas, **sem metadados SRI** na cadeia de importação atual. Isso é um ponto de revisão antes de habilitar Firebase; **não** significa comprometimento conhecido da CDN. Melhor caminho para esse app é empacotar o SDK com o build/lockfile, ou implantar verificação de integridade apropriada após confirmar suporte e CORS.
- Uma SRI eficaz precisa de hash exato dos bytes publicados e suporte CORS para recursos cross-origin. Não inventar hash SRI sem baixar os bytes da versão correta e testar compatibilidade.
- A versão ativa é Supabase, logo mudanças em Firebase agora poderiam aumentar risco desnecessário sem resolver o problema de pontuação falsa.

Referências técnicas públicas:
- https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
- https://github.com/orgs/community/discussions/54257
- https://developers.cloudflare.com/pages/configuration/headers/

## 4. Situação dos cabeçalhos HTTP

**Ainda não aferidos no endpoint publicado.** A tentativa de consulta direta de cabeçalhos deste ambiente falhou por resolução DNS. Não declarar `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` ou `X-Frame-Options` presentes/ausentes com base apenas em arquivos do repositório.

Aferição futura: `curl -I https://leosardinhalaus-math.github.io/leo-sardinha-math/jogos/calculus-royale/`, página de perfil e ranking, seguida de análise de redirects, cabeçalhos e política efetivamente aplicada no DevTools. A etapa 58 do plano continua pendente.

## 5. Melhorias de acessibilidade na mesma rodada

- Páginas de perfil: `for` e `id` nos campos de e-mail/senha/nome; `role=status` e `aria-live` para mensagens de autenticação.
- Ranking: opções de classificação `aria-pressed` atualizadas ao clique; preservação do seletor que retorna todos os botões.
- CSS do portal, perfil e jogo: foco de teclado visível. O jogo respeita a preferência `prefers-reduced-motion` para transições/efeitos cosméticos e parte do movimento da cena 3D sem parar simulação de combate ou o cronômetro.
- Teste `tests/calculus-accessibility-security.test.cjs`: cobre integração estrutural, mas **não** substitui leitores de tela nem validação visual do movimento em aparelho real.

## 6. Critérios de liberação

Esta auditoria conclui **revisão** da CSP e da dependência externa ativa/alternativa; não certifica que uma CSP está implantada, não aprova uso de CDN sem integridade e não substitui verificação HTTP real. Para publicação: validação funcional, CI no SHA final, testes de acessibilidade e aprovação humana antes do merge.
