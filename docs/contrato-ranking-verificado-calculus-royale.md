# Calculus Royale — contrato de pontuação verificada (proposta, não implantada)

> **Estado:** projeto técnico e critérios de aceitação. Nenhuma função de servidor, tabela nova, migração ou bloqueio de gravação foi ativado. O ranking público do Supabase continua **informal e não verificado**.

## 1. Falha demonstrada por inspeção do código

O cliente `jogos/calculus-royale/player.js` lê `calculus-royale:wins`, `completed-worlds`, `survival-leaderboard`, `survival-badges` e o inventário do `localStorage`. Calcula XP e troféus localmente e envia `game_stats` via `POST /rest/v1/game_stats?on_conflict=user_id`, com token autenticado.

RLS corretamente restringe **qual usuário pode alterar uma linha**, mas não prova **que o jogador venceu de verdade**. Qualquer controle puramente client-side (valor máximo, checksum, ofuscação, chave embutida, validação de avatar) é contornável. Uma assinatura de nonce fornecida pelo próprio cliente não constitui prova de vitória.

A alternativa Firebase em `firebase-cloud.js` mantém `progress` privado e o `leaderboard` somente gravável por serviço confiável, mas **a existência de regras seguras não implica que o backend de validação exista**. Firebase não está selecionado na configuração pública atual.

## 2. Objetivo e fronteiras de confiança

- **Jogo offline:** continua livre, dados locais e cópia na nuvem quando o usuário optar; estatísticas marcadas como *não verificadas*. Não inventar ranking "competitivo" para salvamentos offline.
- **Partida ranqueada online:** só eventos autorizados e validados pelo servidor podem alterar o ranking **verificado**.
- **Cliente:** responsável por interface, controles, renderização e registro candidato de ações; **nunca** autoridade para pontuação oficial.
- **Servidor confiável:** autentica, emite identificador único, fixa versão de regras e seed, verifica ações/estado e calcula pontos. Não aceitar `xp`, `trophies`, `wins` ou `completed_worlds` como pontuação pronta.
- **Banco:** armazena sessões de partida, submissões com identificadores únicos e ranking verificado. Inserção/alteração da tabela verificada vedadas a `anon` e `authenticated`; service-role somente em ambiente servidor, nunca em repositório ou navegador.

## 3. Contrato planejado (versão 1)

**Abertura** — `POST /functions/v1/start-ranked-match`; `Authorization: Bearer <access_token>`; corpo `{mode, rules_version, client_version}`. A resposta contém `match_id` (UUID), `seed` e `expires_at`, vinculados à identidade autenticada. O servidor registra `started` e parâmetros de partida. *Só gerar seed não valida jogadas*.

**Submissão** — `POST /functions/v1/submit-ranked-match`, token de autenticação, corpo:
```json
{
  "match_id": "UUID atribuído pelo servidor",
  "request_id": "UUID único de idempotência",
  "rules_version": 1,
  "events": [
    {"seq": 1, "tick": 1, "kind": "move", "payload": {}}
  ]
}
```
Os nomes `kind` e `payload` são **provisórios**; alinhar aos controles e estado real da arena antes de implementar. Não incluir ponto/XP/troféus como dados confiáveis.

**Validação obrigatória**: (1) token e dono; (2) partida não expirada, versão compatível e nonce/seed vinculados; (3) tamanho e formato limitados; (4) sequências contínuas e ações legalmente possíveis; (5) replay determinístico ou estado autoritativo no servidor que confirme vitória; (6) cálculo de recompensas exclusivamente servidor; (7) atualização transacional e idempotente.

**Resposta** — `{status: "verified", match_id, public_score}` somente depois de persistir; erros de replay/autoridade respondem com rejeição sem afetar salvamento local. Reenvio com mesmo `request_id` não duplica troféus.

## 4. Limites, abuso e integridade

- Por identidade: uma partida ranqueada ativa por modo, taxa por minuto ajustada por medições reais, limites globais por IP e proteção contra automatização. Responder 429 no excesso; não escolher limites definitivos sem teste de carga e uso legítimo.
- `UNIQUE(match_id)` na finalização e `UNIQUE(user_id,request_id)` na submissão. Duplicatas retornam resultado anterior, sem conceder nova recompensa.
- Rejeitar eventos fora da ordem, ações impossíveis para o estado da partida, progresso além das regras, estado final incompatível com as ações, duração incompatível com as regras e premiação fora da tabela versionada.
- Detectar replays da mesma partida por outra conta, colisões de IDs, alteração de seed, tentativa de finalizar partida de terceiros, payloads gigantes e tentativas após expiração.
- O tempo do dispositivo e o navegador **não** são fontes confiáveis. Duração é indício de abuso, não prova suficiente para banir automaticamente um jogador.
- Log mínimo: `match_id`, `user_id`, código do motivo de rejeição, versão de regras, timestamps do servidor; **nunca** token, senha ou salvamento completo em logs.

## 5. Fluxo de publicação seguro

1. Criar ambiente de teste isolado antes de qualquer alteração em tabelas reais; avaliar limites/custos do plano Supabase.
2. Extrair motor determinístico de regras ou implementar estado autoritativo do combate no servidor — **bloqueio central do projeto**, não resolvido por uma Edge Function que apenas repete fórmulas do cliente.
3. Implementar novos endpoints e tabelas privadas, com RLS e regras de `GRANT` estritas; usar transação para idempotência.
4. Rodar testes automatizados com usuários A/B e um atacante de teste: falsificação, replay, alteração de conta, submit duplicado, upload excessivo e partidas genuínas.
5. Exibir **ranking verificado** separado do atual **ranking informal** durante migração. A cada fase comunicar ao jogador o significado de cada pontuação; não apagar pontuações antigas.
6. Só após o frontend usar endpoints validados, revogar caminhos de escrita direta **no ranking oficial**, sem bloquear salvamentos particulares e sem quebrar dispositivos já existentes.
7. Revisar advisors de segurança, custo, performance, política de retenção e compatibilidade móvel; documentar rollback.
8. A PR fica em rascunho até todos os testes críticos passarem. A implementação exige inspeção do estado verdadeiro da arena e decisões sobre competição/offline.

## 6. Testes mínimos de aceitação

| Cenário | Resultado esperado |
|---|---|
| Partida validada e inédita | Pontos oficiais calculados no servidor |
| Jogador A usa `match_id` de B | Negado, sem escrita |
| Vitória falsa via `localStorage`/REST | Nunca atinge ranking verificado |
| Envio duplicado | Mesmo resultado, recompensa uma vez |
| Sequência/tick impossível | Negado |
| Partida expirada | Negado |
| Sem conexão | Jogabilidade e salvamento local preservados |
| Conta sem e-mail confirmado quando exigido | Sem acesso ao modo ranqueado |
| Consulta pública | Apenas campos de perfil/pontuação autorizados |
| Serviço sob carga | Rate limit e custo protegidos sem perda de dados |

## 7. Evidência da auditoria

- `player.js`: `localProgress()` e `syncProgress()` usam estado do navegador; por isso a validação de pontos **continua pendente**.
- `firestore.rules`: `leaderboard` é público para leitura limitada e proíbe escrita do cliente; a verificação de vitória no servidor **não** está implementada.
- `cloud-config.js`: provider `supabase`; troca para Firebase não autorizada por esta proposta.
- `docs/plano-100-etapas-calculus-royale-2026-10.md`: registrar etapas de **desenho** separadas de implementação de servidor e testes reais.

**Não aplicar** GRANT/REVOKE, trigger, exclusão de perfil, mudança de provedor, elevação de privilégios ou nova infraestrutura diretamente na produção com base apenas neste documento.

## 8. Evento real de vitória já existente no motor de jogo

Inspeção da implementação TypeScript de 2026-10-25:

1. Em `client/src/game/battleRules.ts`, cada batalha regula **180 s** e tem até **60 s de prorrogação**; `BATTLE_TICK_SECONDS=0.1`, `DECK_SIZE=8`, energia inicial 5. A avaliação de HP usa `compareTowerHealth(allyHp, enemyHp, 96, enemyMax)`: compara as frações de vida e trata diferença absoluta menor que `0.005` como empate.
2. Em `client/src/components/GameCanvas.tsx`, a arena atualiza tropas com `stepCombat(..., 0.1, ...)`, e o estado `battleOutcome` vira `victory` quando a torre inimiga cai, quando há vantagem válida ao término de tempo ou quando um primeiro ataque resolve a morte súbita. Derrota e empate não concedem vitória.
3. `finishBattle()` é chamado somente após `battleOutcome === 'victory'` e utiliza `battleResolvedRef` para prevenir a dupla conclusão **neste cliente**. Incrementa `wins` mesmo em *replay* de casa já vencida; recompensas de avanço dependem de `resolveStageVictory()`.
4. O código originalmente inicializava `wins` de um jogador novo com **12**, sem partida. A correção da branch muda para **zero** e há regressão na suíte `test:progression`. Isso evita dados fictícios de origem, mas não oferece garantia contra adulteração de salvamento.
5. `client/src/game/combat.ts` é uma simulação isolada da renderização e tem testes em `test:combat` cobrindo 45 habilidades, cooldown, dano na torre uma vez, faixas de tropa e zonas de nascimento. Esse motor é um candidato para replay autoritativo após isolar a versão exata das regras e todas as entradas determinísticas.
6. **Atenção:** o combate não equivale ao estado completo da partida; a inteligência artificial, custo de cartas, timers, interações com desafios e resultados ainda dependem do controlador `GameCanvas.tsx`. A simples presença de `stepCombat` no servidor não valida uma vitória; é necessário reproduzir o estado e a sequência de escolhas.

### Critério técnico de “vitória verificada” para um servidor futuro

Uma submissão somente pode contar como vitória oficial quando o servidor: (a) conhece o jogador, modo, mundo, casa, baralho inicial e versão das regras; (b) recebe ou executa escolhas legalmente possíveis em ordem; (c) mantém/reexecuta HP das torres, energia, cronômetro, tropas e adversário; (d) determina resultado `victory` com as mesmas regras da fase; (e) grava **uma única** conclusão em transação associada à partida. Não inferir vitória apenas de `battleOutcome`, `wins`, screenshots, relógio do dispositivo ou `localStorage` enviados pelo navegador.

Enquanto isso não estiver implementado, a classificação Supabase continua **informal, não verificada**.
