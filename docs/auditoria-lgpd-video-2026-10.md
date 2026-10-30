# Auditoria inicial — checklist do vídeo (24/10/2026)

> Status: triagem técnica preliminar; **não** certifica conformidade com LGPD, legislação consumerista nem WCAG. Branch de trabalho; não publicada no site.

## Itens identificados no vídeo

- [ ] Política de privacidade com controlador, finalidade, base legal, retenção, compartilhamentos, direitos dos titulares e canal de contato.
- [ ] Termos de uso condizentes com o funcionamento real dos jogos.
- [ ] Inventário de formulários e coleta de dados; adequação à LGPD.
- [ ] Consentimento de cookies apenas quando necessário; bloqueio prévio de tags não essenciais e possibilidade de alterar preferência.
- [ ] Google Analytics e scripts de rastreamento: verificar se existem e impedir carregamento não autorizado quando aplicável.
- [ ] Coleta mínima e exclusão de dados: mapear funcionalidades, inclusive perfil, ranking, autenticação e jogos.
- [ ] Identificação de serviços e integrações de terceiros; contratos e transferências, quando pertinentes.
- [ ] Revisão de direitos de imagens, fontes, ilustrações e outros ativos.
- [ ] Contraste visual, navegação por teclado, rótulos acessíveis e auditoria de acessibilidade.
- [ ] Botões claros, informações verdadeiras e transparência sobre funcionamento dos serviços.
- [ ] Depoimentos reais, dados institucionais e promessas comprováveis: publicar somente quando existirem.
- [ ] Política de reembolso: **avaliar aplicabilidade**; não acrescentar como se houvesse vendas.
- [ ] Legislação aplicável: revisão jurídica contextual, não geração automática de selo de conformidade.

## Evidências verificadas

- Repositório: `leosardinhalaus-math/leo-sardinha-math`, ramo `main`.
- `index.html`: navegação de Início, Educação, Sobre mim, Classroom, Imagens e Wiki; rodapé simples sem links jurídicos visíveis.
- Árvore do repositório: não foram encontrados arquivos cujos caminhos contenham `privacy`, `privacidade`, `termos`, `cookie` ou `lgpd` na busca inicial por nomes.
- A presença de `firebase.json`, `firestore.rules` e páginas de `perfil` e `ranking` exige inventário detalhado de tratamento de dados. **Não comprova** por si só coleta pessoal.
- Não foram auditados todos os scripts, chamadas de rede, permissões, armazenamento, regras e jornadas; ausência de evidência não equivale à inexistência.

## Plano de execução seguro

1. Inventariar código de formulários, scripts de terceiros, `localStorage`, cookies, Firebase e rankings em todas as páginas e jogos.
2. Criar mapa de dados: tipo, finalidade, base legal, destinatário, retenção, segurança e direitos; considerar uso por crianças.
3. Redigir política de privacidade **após** confirmar as práticas e o canal de contato. Não inventar CPF, CNPJ, endereço ou encarregado.
4. Implementar controle de rastreamento opcional somente onde houver tecnologias não essenciais; registrar a decisão localmente apenas se adequado.
5. Acrescentar links de documentos revisados no rodapé de páginas aplicáveis.
6. Validar teclado, contraste, foco, formulários, rotas, mobile, scripts e ausência de regressões.
7. Documentar achados e mudanças na Wiki, submetendo as alterações para revisão antes de publicar.

## Princípio

Segurança e conformidade não são garantidas por uma checklist visual: dependem de implementação, prova e revisão periódica.
