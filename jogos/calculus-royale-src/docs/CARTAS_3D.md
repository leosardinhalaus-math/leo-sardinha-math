# Catálogo dos personagens 3D

As 45 cartas usam modelos low-poly gerados em código a partir das artes existentes, sem recortes ou retratos aplicados como placas. Cada combatente recebe uma silhueta própria, com variações de rosto, cabelo, roupa, armadura, arma, objeto mágico e paleta. Espelho, árvore fractal, anéis de Euler, corrente exponencial e vetor ótimo possuem malhas específicas.

Todos os GLBs possuem idle, walk, run, jump, attack, victory e defeat. Ataques usam animações por arquétipo e partículas parametrizadas por carta. Os efeitos abaixo disparam no contato com tropas da mesma faixa, com intervalo de 1,2 s. No contato com a torre, aplica-se o poder integral uma vez e a unidade é consumida.

| Carta | Arquivo GLB (sem extensão) | Arquétipo | Habilidade no contato | Dano inicial |
|---|---|---|---|---|
| Arqueira da Derivada | slope | archer | Flecha tangente: Ignora o escudo do alvo. | 0.8 × poder |
| Guardião do Limite | limit | guardian | Barreira de aproximação: Gera 12 de escudo. | 0.45 × poder |
| Mago da Potência | power | mage | Impacto da potência: Impacto concentrado no alvo. | 1.1 × poder |
| Bailarina Seno | sine | dancer | Onda senoidal: Reduz o movimento em 45% por 3s. | 0.45 × poder |
| Orbe de Euler | euler | orb | Expansão de Euler: Aplica 3 HP/s por 3s. | 0.55 × poder |
| Mago da Cadeia | chain | mage | Composição em cadeia: Atinge até 2 inimigos próximos. | 0.6 × poder |
| Ladina ln(x) | ln | rogue | Precisão logarítmica: Ignora o escudo do alvo. | 0.75 × poder |
| Golem Implícito | implicit | golem | Escudo implícito: Gera 14 de escudo. | 0.5 × poder |
| Engenheiro das Taxas | rate | engineer | Pulso das taxas: Acelera aliados próximos em 50% por 3s. | 0.5 × poder |
| Guardião de Cauchy | cauchy | guardian | Equilíbrio de Cauchy: Gera 10 de escudo. | 0.5 × poder |
| Oráculo de Taylor | taylor | mage | Eco de Taylor: Dois golpes por ativação. | 0.4 × poder × 2 golpes |
| Titã de Newton | newton | titan | Salto à raiz: Impacto concentrado no alvo. | 1.05 × poder |
| Bússola Ótima | opt | relic | Vetor ótimo: Ignora o escudo do alvo. | 0.85 × poder |
| Sacerdotisa da Integral | area | priest | Soma restauradora: Cura até 9 HP do aliado mais ferido. | 0.4 × poder |
| Colosso Fundamental | ftc | titan | Raio fundamental: Ignora o escudo do alvo. | 0.9 × poder |
| Mestre Cavalieri | cavalieri | mage | Seções protetoras: Gera 13 de escudo. | 0.45 × poder |
| Semente Fractal | fractal | relic | Ramificação fractal: Atinge até 3 inimigos próximos. | 0.45 × poder |
| Alquimista u | sub | mage | Transmutação de u: Aplica 3 HP/s por 3s. | 0.5 × poder |
| Duelista por Partes | parts | rogue | Duas partes: Dois golpes por ativação. | 0.45 × poder × 2 golpes |
| Engenheira Trapézio | trap | engineer | Malha trapezoidal: Gera 8 de escudo. | 0.5 × poder |
| Sentinela Imprópria | improper | guardian | Convergência infinita: Gera 15 de escudo. | 0.55 × poder |
| Sentinela Contínua | continuity | priest | Fluxo contínuo: Cura até 7 HP do aliado mais ferido. | 0.4 × poder |
| Ladina do Quociente | quotient | rogue | Corte do quociente: Dois golpes por ativação. | 0.45 × poder × 2 golpes |
| Cavaleiro Secante | secant | guardian | Lâmina secante: Ignora o escudo do alvo. | 0.75 × poder |
| Alquimista Bernoulli | bernoulli | mage | Explosão de Bernoulli: Aplica 4 HP/s por 3s. | 0.6 × poder |
| Bruxa da Inversa | inverse | mage | Retorno inverso: Reflete 35% do próximo dano recebido por 3s. | 0.5 × poder |
| Elo Exponencial | expchain | relic | Elo exponencial: Atinge até 2 inimigos próximos. | 0.55 × poder |
| Mestre das Raízes | root | guardian | Ruptura da raiz: Ignora o escudo do alvo. | 0.9 × poder |
| Espelho Implícito | mirror | relic | Reflexão implícita: Reflete 50% do próximo dano recebido por 3s. | 0.4 × poder |
| Juiz de Cauchy | mean | guardian | Balança de Cauchy: Cura até 8 HP do aliado mais ferido. | 0.4 × poder |
| Batedora Crescente | growth | rogue | Arrancada crescente: Acelera aliados próximos em 60% por 3s. | 0.55 × poder |
| Escriba de Taylor | taylor2 | mage | Previsão quadrática: Reduz o movimento em 40% por 3s. | 0.55 × poder |
| Mineradora Ótima | miner | engineer | Impacto no máximo: Impacto concentrado no alvo. | 1.15 × poder |
| Monge do Valor Médio | average | priest | Média restauradora: Cura até 10 HP do aliado mais ferido. | 0.35 × poder |
| Tecelã de Volumes | volume | priest | Camadas de volume: Gera 12 de escudo. | 0.45 × poder |
| Navegadora de Superfície | surface | dancer | Onda de superfície: Aplica 3 HP/s por 3s. | 0.5 × poder |
| Arauto de Gabriel | gabriel | angel | Sopro de Gabriel: Ignora o escudo do alvo. | 0.9 × poder |
| Arquiteto de Cavalieri | cavalieri-advanced | mage | Dupla seção: Gera 18 de escudo. | 0.5 × poder |
| Tecelã do Fluxo | surface-flux | dancer | Fluxo persistente: Aplica 4 HP/s por 3s. | 0.45 × poder |
| Mestre das Partes | parts2 | rogue | Permuta de golpes: Dois golpes por ativação. | 0.5 × poder × 2 golpes |
| Mecânica Simpson | simpson | engineer | Três pontos de Simpson: Atinge até 3 inimigos próximos. | 0.45 × poder |
| Oráculo da Comparação | compare | mage | Comparação defensiva: Reflete 30% do próximo dano recebido por 3s. | 0.45 × poder |
| Feiticeiro da Série | series | mage | Combo da série: Atinge até 3 inimigos próximos. | 0.55 × poder |
| Oráculo de Simpson | simpson-advanced | mage | Aproximação de Simpson: Impacto concentrado no alvo. | 1.15 × poder |
| Guardião da Comparação | comparison | guardian | Limite comparativo: Gera 16 de escudo. | 0.5 × poder |

A cura escolhe o aliado vivo mais ferido a até 4 unidades de distância no eixo X; escudos acumulam até o HP máximo; status iguais renovam a duração, sem empilhar. Cadeias procuram outros alvos a até 4 unidades do primeiro. Reflexão não desencadeia reflexão recursiva. Dano é limitado ao HP restante e a cura ao HP máximo.

Após npm run models, arquivos em client/public/assets/models/generated/. No site publicado: assets/models/generated/<id>.glb.
