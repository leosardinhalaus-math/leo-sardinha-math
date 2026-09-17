# Fortnite RPG: A Ilha das Derivadas

RPG educacional de fã, independente e sem vínculo com Epic Games. Expansão funcional do HTML fornecido: criação de personagem, oito missões, NPCs, vida, XP, classes, atributos, aparência, mapa, inventário, poções e ajuda. É um jogo separado de A Ilha do Cálculo.

Abra `index.html` ou acesse a pasta publicada no GitHub Pages. HTML, CSS, JavaScript e ícones locais; não requer conta, servidor de aplicação ou instalação. Não salva o progresso ao recarregar a página.

## Classes e atributos

- Construtor: velocidade da animação de construção 50% maior (1,2 s em vez de 1,8 s). Não altera o tempo para resolver a questão.
- Explorador: revela o gradiente de cada região desbloqueada no mapa.
- Estrategista: o primeiro erro em Lagrange não causa dano. As demais tentativas seguem a regra normal.
- Guerreiro: causa 125 de dano em vez de 100 na barreira de extremos e ganha 25 XP adicionais.
- INT: +5 XP por ponto em cada missão concluída.
- AGI: recuperação de 2 PV por ponto após acertar, até o limite de 100.
- WIS: dano por erro = max(5, 20 − WIS).

A soma dos atributos deve ser exatamente 10, com valores inteiros de 1 a 10. Cabeça e corpo são escolhas cosméticas: alteram a ficha do personagem e o emblema/tema de sua prévia. O emblema representa a classe, não um modelo 3D.

Começa com 100 PV e duas poções de 35 PV. Concluir as missões 3 e 6 concede uma poção adicional. Ao chegar a 0 PV, é possível recuperar 60 PV e tentar novamente a mesma missão, sem repetir recompensas de regiões concluídas. Pistas não têm custo. A recuperação não concede XP. As relíquias registram a conclusão das missões; não são itens de combate equipáveis.

## Gabarito

| Missão | Resposta |
| --- | --- |
| h(x,y)=x²+y² em (3,5) | 34 |
| f=x²y+3y²: fₓ, fᵧ em (2,1) | 4, 10 |
| h=10−x²−y²: gradiente em (1,2) | (−2,−4) |
| Plano de x²+2y² em (1,2): z=Ax+By+C | A=2, B=8, C=−9 |
| T=3x+2y, x=t², y=3t: dT/dt em t=2 | 18 |
| f=x²+y², ponto (1,2), u=(3/5,4/5) | 22/5=4,4 |
| Máximo de −x²−y²+4x+6y | (2,3), valor 13 |
| Máximo de xy sob x²+y²=25 | 12,5; x=y=±5/√2 (mesmo sinal) |

A missão de extremos usa uma função com máximo global real: 13−(x−2)²−(y−3)². A missão de Lagrange aceita os dois pares ótimos e explica que o positivo faz sentido como recursos. Respostas com vírgula ou ponto são aceitas; não há avaliador de expressões. As soluções só aparecem após acerto, inclusive no mapa, exceto pelo benefício explícito do Explorador.

## Manutenção

`game.js` contém as missões, soluções e regras. Modifique o enunciado e sua validação em conjunto. A entrada do nome é inserida com `textContent`. Os modais usam `dialog`, suportam Escape e restauram o foco. Layout responsivo e animação com respeito a movimento reduzido.

Ícones: Phosphor Icons, MIT; cores adaptadas. Licença em `assets/PHOSPHOR-LICENSE.txt`.
