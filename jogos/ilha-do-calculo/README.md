# A Ilha do Cálculo

Jogo educacional em português, inspirado no clima colorido de aventuras battle royale, com cinco missões sobre cálculo multivariável. Interface independente, sem vínculo com Fortnite ou Epic Games.

## Jogar offline

Extraia todo o ZIP e abra `index.html` no navegador. Mantenha `style.css` e `game.js` na mesma pasta. Não exige servidor, conta, bibliotecas, instalação ou conexão. O progresso dura até recarregar a página; não é salvo.

## Publicar no GitHub Pages

1. Crie ou escolha seu repositório e envie os arquivos extraídos para a raiz (não envie apenas o ZIP).
2. Abra **Settings → Pages**.
3. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
4. Selecione a branch **main**, a pasta **/(root)** e clique em **Save**.
5. Aguarde a publicação e use o endereço exibido pelo GitHub.

Se o repositório já contém outro site, coloque este jogo em uma subpasta e preserve a página inicial existente. O caminho passa a terminar em `/ilha-do-calculo/`.

Referência: [Documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Missões e gabarito

1. **A queda:** h(x,y)=x²+y². Em (3,5), h=34. É possível escolher outras coordenadas inteiras entre −5 e 5; a altitude esperada acompanha a escolha.
2. **Construindo a base:** f=x²+2y², ponto (1,2). Derivadas: fₓ=2x e fᵧ=4y. Plano: z=9+2(x−1)+8(y−2)=2x+8y−9. Respostas A=2, B=8, C=−9. Aproximação local, não planificação global.
3. **Tempestade:** T=3x+2y, x=t², y=3t. dT/dt=6t+6; em t=2, vale 18. Cronômetro de dois minutos, pausável; não bloqueia a aprendizagem quando termina.
4. **Tesouro:** f=x³−3xy+y³. Pontos críticos: (0,0), sela; (1,1), mínimo local. Hessiana com determinante D=36xy−9. Não há máximo global no domínio R², pois f(t,0)=t³ é ilimitada acima. A missão corrige deliberadamente a promessa equivocada de um ponto mais alto. Os pontos podem ser informados em qualquer ordem.
5. **Fuga:** max xy sob x²+y²=25. Máximo 25/2=12,5 nos pares (5/√2,5/√2) e (−5/√2,−5/√2). Para recursos não negativos, apenas o par positivo faz sentido. Aceita vírgula e ponto, aproximados com três casas. A restrição é a do exercício, não um modelo linear de peso.

## Interação e pontuação

Preencha as respostas, confirme e leia a explicação liberada após o acerto. Use as pistas quantas vezes quiser. Avance pelo botão após cada missão. Cada fase concede 120 XP na primeira tentativa, reduzindo 20 por tentativa adicional até o mínimo de 40. Não há perda de partida. A pontuação é apenas motivacional.

## Visualização

O Canvas apresenta malhas isométricas calculadas a partir das funções, a plataforma tangente na fase 2 após o acerto e a circunferência da restrição na fase 5. As escalas vertical e horizontal são diferentes e a malha mostra somente uma janela finita; ela não prova conclusões globais. Os ícones narrativos são arquivos SVG locais da coleção Phosphor Icons (licença MIT incluída em assets/PHOSPHOR-LICENSE.txt), com cores adaptadas. Não inclui os arquivos de arte do Fortnite nem modelos 3D navegáveis. O tema usa céu azul, terreno verde, acentos laranja e tempestade roxa.

## Arquivos e edição

- `index.html`: estrutura e acessibilidade.
- `style.css`: tema responsivo e animações; respeita movimento reduzido.
- `game.js`: missões, validação, cronômetro, pontuação e gráficos.
- `.nojekyll`: publicação de arquivos estáticos.

Para alterar questões, edite `stages`, a validação em `check()` e os gráficos em `draw()` em conjunto. Não usa eval nem execução de expressões digitadas. As questões são fixas; não há sorteio de versões.

Os temas correspondem aos tópicos de funções multivariáveis, planos tangentes, regra da cadeia, extremos e Lagrange. A numeração de capítulos/seções em Stewart varia conforme a edição; o jogo não reproduz páginas do livro.

## Validação desta entrega

Partida completa testada em Chromium: cinco fases, resposta incorreta, vírgula decimal, pontos críticos em ordem inversa, vitória e reinício. Revisão visual realizada em desktop e celular. Também foram verificados 16 cenários de validação da matemática.
