# Laboratório Digital de Matemática

PWA em português para estudantes do 6º ao 9º ano e professores. Dez objetos de aprendizagem interativos, quadro teórico, avaliador de OA, diário criativo e referências. HTML, CSS e JavaScript puros, sem bibliotecas, login ou servidor de dados. Os registros ficam no armazenamento local do navegador.

## Estrutura

```text
index.html                 página principal
manifest.webmanifest       instalação no celular
service-worker.js          arquivos offline e atualização
.nojekyll                  desativa Jekyll no Pages
gerar-icones.html          gerador alternativo de PNG
icons/                     ícones 192, 512 e maskable
css/tema.css, estilos.css, inicio.css  tema e layout
js/main.js                 inicialização
js/core/                   roteador, estado, interface
js/dados/                  textos, referências, regras da abelha
js/modulos/<nome>/index.js módulos independentes montar/desmontar
cartelas-magicas.html, detetive-do-cpf.html  jogos autônomos conectados à entrada
images/  cenário do laboratório, elenco chibi, herói e dragão do Grimório
```

## Executar localmente

Abra o terminal **dentro desta pasta** e rode `python -m http.server 8000` (ou `python3 -m http.server 8000`). Abra `http://localhost:8000/`. Alternativa: `npx serve .`. Não abra `index.html` diretamente pelo Explorador: módulos ES e service worker precisam de HTTP. O app instala via HTTPS no GitHub Pages ou via localhost.

## Publicar no GitHub Pages

1. Crie um repositório vazio no GitHub. Nesta pasta, execute:

   ```sh
   git init
   git add .
   git commit -m "Publica Laboratório Digital de Matemática"
   git branch -M main
   git remote add origin https://github.com/USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```

2. No repositório, abra **Settings > Pages > Build and deployment**. Escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e salve.
3. Aguarde a publicação. O endereço será `https://USUARIO.github.io/NOME-DO-REPO/`.
4. No Chrome do Android, abra o endereço, aguarde carregar as atividades, use **menu > Adicionar à tela inicial** (ou **Instalar app**, conforme a versão). No iPhone, use o menu de compartilhamento do Safari e **Adicionar à Tela de Início**.

Os caminhos de todos os recursos são relativos à pasta do projeto; a navegação usa `#/modulo` e funciona em um subcaminho do Pages.

## Atualizar

Edite o conteúdo e troque `VERSAO='ldm-v17'` por `ldm-v18` (ou próximo número) em `service-worker.js` antes de publicar novamente. O app mostrará **Nova versão disponível. Atualizar** quando detectar o novo worker. Se o celular mantiver a versão antiga, feche e reabra o app conectado, toque em **Atualizar**, ou limpe os dados do site no navegador e visite o endereço novamente. Limpar os dados do site também apaga diário e avaliações locais; faça isso apenas se necessário.

## Ícones

Os PNGs prontos estão em `icons/`. Para recriá-los, abra `gerar-icones.html` e baixe os três arquivos com os nomes indicados, substituindo os existentes em `icons/`. O ícone maskable mantém seu desenho na área central segura.

## Identidade visual

A entrada usa uma cena de laboratório como fundo e dez cartões com personagens chibi. Os nove personagens dos demais temas usam arquivos individuais `images/chibi-*.webp`; o Mestre Arcano tem imagem própria. As atividades integradas exibem seu personagem no cabeçalho. O Grimório usa herói e dragão chibi, e os jogos autônomos compartilham o cenário. Na entrada, toque nos personagens (ou use Enter/Espaço) para ver reações e falas. Nos cartões, o gesto aparece ao passar o cursor ou focar. O mago, o herói, o dragão, o detetive e os mascotes das atividades também reagem ao toque. As entradas, os personagens, as runas e as peças do Frac-Soma têm animações leves; a preferência do sistema por movimento reduzido desativa esses efeitos. Tudo é carregado localmente pelo service worker.

## Teste rápido

- Adivinhação: palpites de 1 a 100, dicas e faixa da aba Estratégia.
- Grimório: confira que 13 = 1 + 4 + 8 no ritual e na forja; vença um dragão com a soma exata.
- Detetive: confira pesos, quociente, resto, verificador e a diferença entre passar no cálculo e ser um documento real.
- Frac-Soma: leve peças das linhas à soma, revele equivalências, digite frações equivalentes e avance pelos oito desafios; teste também toque e teclado.
- Abelha: jogue sozinho e em dupla, erre/acertе tipos, confira movimento e imprima a folha.
- Polígonos: desenhe triângulo e hexágono, confira ângulos.
- Divisores: compare 1, 7 e 24; veja pares de fatores.
- CPF: use `123456789`, confira pesos, restos e aviso de privacidade.
- Kente: pinte, encontre pares e resolva as três sequências.
- Estação: mova o controle de linhas e registre uma reflexão.
- Professor: abra conceitos, avalie OA e recarregue; confira diário salvo por atividade.
- Offline: visite uma vez conectado, abra todos os módulos, desligue a rede e recarregue. Teste também com um subcaminho do Pages.

## Nota sobre fontes

O enunciado menciona o trabalho **Perspectivas em Educação Matemática** (COLUNI-UFF/IME-UFF), mas não inclui o texto nem sua ficha bibliográfica. As referências apresentadas são as obras nomeadas no enunciado e fontes complementares; antes de citar a bibliografia como completa desse trabalho, consulte o original. A UNESCO reconhece o **saber artesanal da tecelagem Kente**, não qualquer padrão geométrico digital criado aqui.
