# Firebase / Cloud Firestore — Calculus Royale

Estado: código de integração preparado; conexão com um projeto real ainda não ativada.
O provedor existente permanece selecionado e nenhum dado do Supabase foi migrado.

## O que esta etapa implementa

- Login/cadastro por e-mail usando Firebase Authentication e sessão limitada à aba.
- Perfil público com nome de jogador, identificador e avatar; sem e-mail.
- Salvamento privado em `progress/{uid}`, enviado somente ao clicar em **Salvar progresso online**.
- Restauração explícita do próprio salvamento, com confirmação antes de substituir o progresso local.
- Leitura do ranking com atualização em tempo real e encerramento da assinatura ao sair da página.
- Regras que impedem um jogador de acessar o salvamento de outro ou escrever no ranking oficial.

Os pontos do aparelho são dados não verificados. O cliente salva esse resumo apenas no documento privado.
O ranking público só aceita escrita de um servidor confiável com Admin SDK/IAM. A lógica de validação
de partidas nesse servidor é uma próxima etapa; este código não transforma pontuação local em resultado oficial.

## Ativação após conectar a conta Firebase

1. Selecionar/criar o projeto e registrar um aplicativo Web.
2. Habilitar Authentication com e-mail/senha e autorizar `leosardinhalaus-math.github.io`.
3. Criar Cloud Firestore em modo de produção. Publicar `firestore.rules` e `firestore.indexes.json`
   neste projeto, sem substituir regras de outra aplicação por engano.
4. Copiar a configuração **pública do aplicativo Web** para `cloud-config.js` e selecionar `provider: 'firebase'`.
   Exemplo de formato (usar somente os valores reais fornecidos pelo Firebase):

```js
window.CalculusCloudConfig = Object.freeze({
  provider: 'firebase',
  firebase: {apiKey: '...', authDomain: '...', projectId: '...', appId: '...'}
});
```

5. Atualizar a origem em `jogos/calculus-royale-src/client/public/` e a cópia publicada em
   `jogos/calculus-royale/`. A geração do jogo deve manter essas cópias iguais. Ao ativar ou alterar
   o provedor, incrementar a versão do cache nas duas cópias de `sw.js` para atualizar a configuração nos aparelhos.
6. Testar duas contas de teste: uma não pode acessar o progresso da outra. Confirmar upload,
   restauração em outro navegador e saída. Só depois anunciar o serviço online como ativo.

Não colocar credenciais de conta de serviço/Admin SDK em arquivos do site. A configuração Web não é
uma credencial administrativa; a autorização dos dados é feita pelo Authentication e pelas regras.
Não ativar Analytics, serviços pagos, migração de usuários ou importação de dados automaticamente.

## Testes sem conta ou banco de produção

Testes rápidos: `node --test tests/*security.test.cjs`.

Regras reais no emulador: Java 21+, Node 22+; em `tools/firebase-tests`, executar `npm ci` e `npm test`.
O teste usa exclusivamente `demo-calculus-royale` em `127.0.0.1:8080` com jogadores fictícios.

Fontes oficiais:
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/rules/unit-tests
