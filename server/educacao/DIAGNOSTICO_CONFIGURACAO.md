# Diagnóstico de configuração sem segredos

O painel Render pode indicar Live enquanto o launcher aguarda configuração. Isso significa que o processo está de pé, não que o login já esteja pronto.

A versão com diagnóstico mantém o marcador `build: auth-test-gate-v1` e acrescenta:

- `diagnostics: setup-fields-v1`: identifica o novo formato.
- `revision`: primeiros 12 caracteres do commit fornecido pelo Render; null quando indisponível.
- `host`: hostname público fornecido pelo Render; null quando indisponível.
- `pending`: nomes exatos das configurações ausentes ou vazias, somente no estado setup.
- `issues`: códigos controlados de problemas da lista, sem caminho, conteúdo ou erro bruto.

Nenhum client ID, client secret, e-mail, cookie, token ou conteúdo da lista é retornado pelo diagnóstico. A lista só é examinada quando os demais campos obrigatórios estão presentes; ausência de um issue antes disso não comprova que ela esteja válida.

## Como conferir

1. No serviço correto do Render, usar Manual Deploy → Deploy latest commit.
2. Aguardar o deploy Live e abrir `/healthz`.
3. Se não aparecer `diagnostics: setup-fields-v1`, ainda não está rodando a versão deste diagnóstico.
4. Conferir se o host corresponde ao serviço que está sendo editado e se revision corresponde ao deploy mais recente mostrado no painel.
5. Corrigir somente o que estiver em pending, sem recriar credenciais por tentativa.

Campos preenchidos no painel mas ainda listados em pending exigem conferir se foram salvos e implantados no mesmo serviço e se os nomes são exatos. Não copiar espaços ou quebras de linha junto às chaves. Valores secretos não devem ser enviados pelo chat.

## Códigos da lista de contas

- `file_not_found`: o arquivo indicado não existe no processo; conferir Secret Files e a variável de caminho.
- `file_not_readable`: o processo não conseguiu ler o arquivo; conferir permissões/configuração do provedor.
- `invalid_json`: conteúdo não é JSON válido; não usar aspas tipográficas, comentários ou cercas de código.
- `invalid_allowlist`: JSON foi lido, mas não corresponde à lista esperada; ela precisa ser não vazia, sem e-mails duplicados e com vínculos completos quando exigidos.
- `file_unavailable`: outra falha controlada de leitura, sem divulgar a mensagem de erro ao público.

Enquanto estiver em setup, conteúdo e início de login continuam recusados. Quando chegar a ready/auth-test, atividades ainda permanecem bloqueadas. A configuração do login não aprova uso por alunos nem adota os documentos de privacidade.
