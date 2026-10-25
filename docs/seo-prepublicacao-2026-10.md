# Checklist de publicação do SEO — 24/10/2026

## Testes GitHub Actions
- SEO metadata checks: sucesso no commit 4247e9726c64bc4b92bd6e3284428c25821fd589.
- Security regressions: sucesso no mesmo commit.
- As verificações automatizadas não asseguram indexação nem conformidade de segurança completa.

## URLs e implantação
- `sitemap.xml` e `robots.txt` usam como **hipótese**, ainda não validada, `https://leosardinhalaus-math.github.io/leo-sardinha-math/`.
- Tentativa de acesso externo ao endereço padrão não confirmou a implantação.
- Conferir **Settings > Pages** e domínio configurado antes de acrescentar `rel=canonical`, `og:url`, `og:image` ou submeter o sitemap ao Google Search Console.
- Não publicar um URL canônico adivinhado. Se houver domínio personalizado, regenerar sitemap e robots com endereço verdadeiro.

## Pré-publicação
- [x] Títulos, descrições e favicon nas principais páginas e jogos.
- [x] Testes automáticos de SEO e regressão aprovados no commit indicado.
- [x] Sincronização do fonte e da cópia do perfil e ranking do Calculus Royale.
- [ ] Verificar endereço oficial, resposta HTTP e SSL.
- [ ] Conferir links internos e imagens de compartilhamento em prévia real.
- [ ] Decidir se ranking público deve ser indexado após revisão de privacidade.
- [ ] Adicionar canonicals/OG URLs absolutos com domínio verificado.
- [ ] Validar sitemap e robots já publicados no endereço definitivo.
- [ ] Mesclar PR somente após aceite das pendências.

## Observação
Nenhum commit desta branch implica publicação do site principal.
