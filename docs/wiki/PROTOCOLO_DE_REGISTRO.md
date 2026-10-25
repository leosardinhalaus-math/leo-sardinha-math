# Protocolo de registro permanente — Wiki Leo Sardinha.Math

**Decisão do responsável pelo projeto (25/10/2026):** registrar **sempre** na Wiki toda evolução relevante dos jogos, atividades, site e ferramentas do Leo Sardinha.Math. A documentação deve acompanhar cada etapa de desenvolvimento, não ficar para o fim.

## A cada etapa ou PR
1. Registrar data, projeto, objetivo pedagógico/técnico e decisão tomada.
2. Descrever o que foi realmente alterado; citar caminhos de arquivos, branch, PR, commit e links verificáveis.
3. Relatar tentativas, erros, limitações, correções e alternativas descartadas, sem esconder falhas.
4. Distinguir claramente **ideia**, **planejado**, **implementado**, **testado em CI**, **testado visualmente**, **publicado**. CI verde não demonstra fidelidade artística perfeita.
5. Acrescentar testes, ambientes, plataformas (web, desktop, Android/Godot), resultados e evidências acessíveis.
6. Registrar próximos passos e pendências com critério de aceite.
7. Atualizar a página `wiki.html` do site para orientar o leitor até a documentação detalhada em `docs/wiki/`.
8. Sempre que as mudanças forem feitas em PR/branch, registrar que **não estão na `main`** nem no site público até o merge/deploy confirmado.
9. Tratar nomes, imagens, arquivos, links e transcrições como fontes; não inventar citações de conversas privadas ou links a artefatos expirados.
10. Não registrar credenciais, tokens, chaves API, dados pessoais de crianças ou informações privadas.

## Onde registrar
- `wiki.html`: índice público com resumos de cada marco, linguagem acessível, links e status.
- `docs/wiki/`: entradas detalhadas, uma por iniciativa/marco, com histórico, critérios e decisões.
- Descrição do PR: ligação com a Wiki e seu estado (rascunho, aprovado, mesclado, publicado).

## Revisão mínima
- [ ] A página Wiki tem entrada/índice atualizado ou justificativa clara caso não haja mudança documentável.
- [ ] O registro detalhado identifica mudanças verificáveis e pendências.
- [ ] O PR aponta para a entrada de documentação correspondente.
- [ ] Publicação e testes não são declarados concluídos sem comprovação.

> Este protocolo é uma convenção editorial do repositório. A documentação é atualizada nas alterações efetivamente realizadas; uma instrução num arquivo não executa atualizações sozinha nem publica automaticamente a Wiki.
