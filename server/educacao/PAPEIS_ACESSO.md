# Permissões de acesso — preparação

As atividades públicas permanecem abertas. Esta separação só se aplica à origem reservada; não torna privados arquivos do GitHub Pages. Não libera atividades no portal de teste.

## O que esta versão entrega

| Papel | /professores/ | /admin/ |
|---|---|---|
| Sem sessão ou fora da lista | Login obrigatório; conta não autorizada recusada | Login obrigatório; conta não autorizada recusada |
| teacher | Acesso somente aos materiais publicados | Recusado |
| admin | Página reservada | Painel e publicação de materiais, quando configurados |

A publicação de PDFs está implementada no fluxo descrito em [MATERIAIS_RESERVADOS.md](MATERIAIS_RESERVADOS.md), com armazenamento externo privado e ativação separada. O editor do site e o formulário para conceder acesso não fazem parte desta versão. A lista continua sendo mantida pelo operador na hospedagem.

## Configuração privada

A lista continua fora da raiz publicada e fora do Git. Exemplos com endereços fictícios:

```json
[
  { "email": "responsavel@example.test", "role": "admin" },
  { "email": "professor@example.test", "role": "teacher" }
]
```

Substituir somente no arquivo privado da hospedagem, sem publicar contas reais. Sem sub, a identidade ainda deve ter e-mail sob autoridade do Google, Gmail ou conta gerenciada. Endereços de terceiros exigem vínculo ao sub estável já conferido:

```json
{ "email": "adulto@example.test", "sub": "identificador-estavel-conferido", "role": "teacher" }
```

Nunca inventar sub nem enviar tokens pelo chat. Entradas antigas, como strings ou objetos com email e sub, mantêm acesso de professor; não recebem poder administrativo. Papéis desconhecidos, duplicatas e vínculos incompletos invalidam a lista e fecham o acesso. Não existe regra de primeiro usuário administrador.

## Atualização e revogação

O servidor relê a lista por requisição. Rebaixar admin para teacher retira o painel no acesso seguinte. Remover a conta invalida a sessão no próximo acesso. A atualização efetiva do arquivo pode exigir salvar e reiniciar o serviço conforme o mecanismo de Secret Files da hospedagem; um reinício também encerra sessões em memória.

As verificações de revogação com Google simulado não comprovam que uma alteração administrativa real na hospedagem já foi aplicada.

## Entrega e implantação

Rotas e subrotas reservadas nunca são servidas como arquivos públicos. Aliases por symlink para essas pastas também não podem entregar seus arquivos estáticos. Páginas autorizadas têm no-store; logout usa POST, origem e CSRF. A lista e seus endereços não aparecem nos painéis.

Atualizar o código não modifica as variáveis, Secret Files ou usuários de teste do Google. A implantação no Render é manual. Manter EDU_ACTIVITIES_ENABLED=false e EDU_SUPERVISED_PILOT=true enquanto o portal estiver em teste. Não promover professores a administradores para contornar uma recusa.

## Verificação

`node --test tests/education-roles.test.cjs` verifica papéis por identidade, conta legada, e-mail de terceiro vinculado ao sub, tentativas de elevação, rebaixamento e revogação com sessão ativa, bloqueio por URL e por alias, sem alterar contas reais. Executar também as regressões de autenticação e do modo de teste.
