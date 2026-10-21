# Calculus Royale: Matemática em Batalha — Godot 4

Versão independente em Godot **4.7.2**, com arena 3D, adversário controlado
por IA, 45 cartas, cinco ilhas e 30 missões de Cálculo. O site e o jogo
anterior permanecem disponíveis. Este projeto não implementa multiplayer.

## Jogar e desenvolver

Abra `project.godot` no Godot 4.7.2 e pressione F6 na cena MainMenu, ou F5.
Escolha um nome, monte um deck de oito cartas e entre em **Explorar as ilhas**.
Cada vitória libera a próxima caverna; seis cavernas formam uma ilha.

Na arena, escolha a ponte esquerda ou direita e toque em uma carta.
O jogo pausa os dois exércitos durante a pergunta. Uma resposta correta
permite invocar a unidade; o erro custa um ponto de elixir. A carta usada
volta para a fila do deck. Destrua a torre central adversária antes de
180 segundos; no limite de tempo, vence a maior proporção de vida da torre.
As unidades usam modelos GLB com animações de movimento e combate.

Vitórias inéditas concedem moedas e novas cartas. O treino não altera
a campanha. Nome, deck e progresso são salvos localmente em
`user://calculus_royale_v1.json`, com cópia de segurança. No navegador,
limpar os dados do site também pode apagar esse progresso. O salvamento
é independente do jogo anterior e não está integrado ao Firebase.

## Assets e reprodução

```sh
python -m pip install Pillow==11.3.0
python slice_assets.py
python tests/godot/test_assets.py
godot --headless --editor --import --quit
godot --headless --script tests/godot/test_game.gd
```

O repositório original tem 45 retratos individuais, mas sua antiga grade
contém apenas dez cartas. Por isso, `slice_assets.py` monta uma nova grade
5 × 9 com os 45 retratos existentes, recorta `card_01.webp` a `card_45.webp`,
converte os cinco mapas e copia os 45 modelos animados existentes.
`--grid caminho.webp` aceita uma grade 5 × 9 alternativa. Os arquivos
resultantes e seus hashes ficam registrados em `data/asset-provenance.json`.
As artes são reaproveitadas do projeto; sua origem não constitui uma nova
licença para redistribuição por terceiros.

## Web e APK

Instale os templates de exportação da mesma versão do editor.

```sh
mkdir -p build/web
godot --headless --export-release Web build/web/index.html
python tools/verify_godot_export.py --engine godot --pack build/web/index.pck
```

Sirva `build/web` por HTTP local para testar. A versão Web usa WebGL 2,
sem threads e sem exigir os cabeçalhos de SharedArrayBuffer.
É necessário um navegador com aceleração gráfica compatível.

O workflow **Godot Web and Android** executa os testes, gera os arquivos Web
e um APK Android de teste para ARMv7/ARM64. Os downloads ficam nos artifacts
`calculus-royale-web` e `calculus-royale-android-debug` de cada execução,
com retenção de 30 dias. A compilação Android usa Java 17, plataforma Android
35 e build-tools 35.0.1. O APK usa assinatura de desenvolvimento gerada no
runner; uma publicação na Play Store exige sua própria chave de produção.
A chave temporária muda entre execuções, portanto atualizar uma instalação
de teste anterior pode exigir desinstalá-la, apagando seu progresso local.

O deploy inclui o site existente e adiciona o jogo em
`jogos/calculus-royale-godot/`. Para usar exclusivamente esse workflow na
hospedagem, selecione **GitHub Actions** em Settings → Pages → Source.
Os presets não concedem acesso à Internet ao aplicativo Android.

## Estrutura

- `data/`: banco de cartas, ilhas e proveniência dos assets.
- `scenes/`: menu, mapa das ilhas, arena 3D e unidade.
- `scripts/`: interface, perguntas, salvamento, IA e combate.
- `assets/`: cartas, mapas, modelos animados, ícone e grade de origem.
- `tests/godot/`: verificação dos assets e dos fluxos de jogo.
- `.github/workflows/deploy.yml`: compilação Web/Android e GitHub Pages.
