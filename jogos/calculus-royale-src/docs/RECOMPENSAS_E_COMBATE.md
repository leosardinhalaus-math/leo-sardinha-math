# Baús e combate tático

## Análise dos três documentos

O briefing de baús define uma primeira entrega com prêmios garantidos e abertura
explícita. A proposta explica o desenho educacional e sugere extensões econômicas.
O terceiro documento pede uma evolução independente do combate. Para resolver a
diferença de escopo, esta entrega conserva os valores e a economia do briefing:
moedas não ganham novos gastos, essência continua custando 3 por evolução e as
cartas mantêm suas fórmulas, custos e poder-base. Novos usos de moedas, perguntas
opcionais, baús semanais e cosméticos ficam para uma etapa posterior.

Os documentos foram usados como requisitos de produto. Não houve merge, deploy,
multiplayer, compra de baús, temporizadores de espera ou sorte para liberar cartas.

## Plano e implementação

1. Separar catálogo, recompensas e simulação da renderização React/Three.js.
2. Persistir recompensa da casa, conclusão, progressão e instância do baú juntos.
3. Criar abertura explícita, histórico e migração dos registros antigos.
4. Integrar seis torres, coroas, tipos de carta, posicionamento e IA à campanha.
5. Validar save, combate, todas as casas, build e interface desktop/mobile.

Estas cinco etapas foram implementadas. O catálogo compartilhado permite que a
interface e as simulações usem as mesmas 45 cartas.

## Recompensas e compatibilidade

Toda casa inédita concede 25 moedas e 1 essência. A última casa acrescenta
3 essências de conclusão e um baú pendente, sem creditar antecipadamente seu
conteúdo. O baú pode ser aberto a qualquer momento pelo inventário; não existe
limite de fila. Seu conteúdo é:

| Ilha | Baú | Moedas | Essência | Colecionável |
| --- | --- | ---: | ---: | --- |
| 1 | Aprendiz | 80 | 1 | Fragmento de Tangente |
| 2 | Cadeia | 135 | 2 | Núcleo de Composição |
| 3 | Valor Médio | 220 | 3 | Pergaminho de Taylor |
| 4 | Integral Prismático | 340 | 5 | Relíquia de Cavalieri |
| 5 | Infinito | 500 | 8 | Selo da Convergência |

O item é apresentado como marco colecionável, sem efeito de combate. IDs estáveis
identificam casas, instâncias e itens. Replays e aberturas repetidas não creditam
recursos. O envelope usa schema 3, mantendo a chave `calculus-royale:save-v2`
para compatibilidade. Registros do inventário v2 são migrados como abertos.

Saldos e recibos são confirmados por uma única gravação do envelope em
localStorage. Só depois a UI recebe o novo estado; as chaves legadas são espelhos.
Se a gravação falhar, o prêmio não é confirmado e o jogador pode tentar novamente.
Isso cobre clique duplo, recarga e falha de quota. Não é uma economia com
autoridade de servidor nem oferece transações concorrentes entre várias abas.

## Combate e posicionamento

Cada lado tem duas torres laterais e um Rei, com HP, alcance, cadência e alvo
independentes. O Rei começa em espera e ativa ao sofrer dano ou perder uma lateral.
Sua destruição encerra a partida. Aos 180 s, coroas diferentes decidem o resultado;
empate segue para 60 s de morte súbita, decidida pela próxima diferença de coroas.
Ao final, soma-se a fração de HP restante das três torres para desempatar.
Elixir dobra no último minuto e triplica na morte súbita.

Tropas têm papéis de tanque, combate próximo, distância e área. Feitiços resolvem
uma única vez no próximo tick de 100 ms e não deixam unidades caminhando.
Estruturas ficam imóveis por 24 s e são priorizadas como alvos dentro da faixa e
do alcance. Relíquias ficam imóveis por 18 s: oferecem aura de suporte ou pulsos
da habilidade original. Vida, efeitos temporários e cooldowns vivem na simulação.

O posicionamento usa grade de 2,5 pontos de avanço e 0,5 unidade lateral, via
clique/toque no campo ou controles acessíveis pelo teclado. Tropas, estruturas e
relíquias só entram no próprio lado; feitiços também podem mirar no rival. A prévia
marca posição e área, mostra validade e permite cancelar sem gastar elixir.
Tropas alinham sua navegação às duas pontes antes de cruzar o rio. A renderização
mostra HP, atividade, coroas, disparos e impactos. Sem WebGL, os controles e o modo
ilustrado continuam disponíveis.

A IA mantém mão de quatro e ciclo de oito, usa somente cartas elegíveis por ilha,
varia a ordem do deck por encontro e avalia pressão, agrupamentos, estruturas,
suporte e a torre lateral mais vulnerável. Não depende de aleatoriedade.

## Validação

Em `jogos/calculus-royale-src`:

```sh
npm run check
npm run test:three
npm run test:combat
npm run test:save
npm run test:progression
npm run test:battle-rules
npm run test:cave-encounters
npm run test:chests
npm run test:tactical
npm run test:campaign
npm run build
npm run test:models
```

A simulação determinística usa decks simples, padrão e defensivo sem evolução em
todas as 28 casas. A rodada de validação obteve 84/84 vitórias. Na casa 5.5, os
tempos foram 42,3 s, 70,3 s e 53,2 s, respectivamente. Isto demonstra viabilidade
com essas políticas; não substitui avaliação de dificuldade por jogadores.

O Chromium foi usado em 1440×1000 e 390×844: arena WebGL, escolha de carta,
posicionamento e invocação funcionaram sem erros JavaScript ou overflow
horizontal. O modo ilustrado mobile também foi verificado com seleção por teclado
e lançamento de feitiço no lado rival, sem unidade persistente. O teste mobile de inventário verificou baú pendente, clique duplo,
histórico, saldo persistido e recarga sem novo crédito. Os avisos de tamanho do
bundle e `player-ui.css` já existiam; o CSS é servido corretamente.

## Próximas decisões

Antes de expandir a economia, testar com jogadores o ritmo da campanha, os papéis
das relíquias e o benefício das evoluções de 12% por nível. Depois, avaliar um uso
cosmético para moedas e uma pergunta de revisão opcional com bônus que nunca
retire o prêmio-base. Baús semanais não fazem parte desta entrega.
