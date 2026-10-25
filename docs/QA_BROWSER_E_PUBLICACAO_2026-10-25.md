# QA visual e política de publicação — Calculus Royale (25/10/2026)

## Evidências do navegador
Workflow: [Calculus Royale browser smoke](https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/40190286003), execução no PR #7.
**Resultado:** passou em desktop **1440×900** e celular emulado **390×844** (Chrome headless e touch emulado).
- Tela inicial abre e permite `Jogar sem nome`.
- A preparação abre e a arena aparece com 6 torres (3 aliadas, 3 inimigas).
- O canvas 3D marcou `data-scene-status=ready` nos dois tamanhos.
- Foram registrados **8 assets GLB carregados** na arena nos dois tamanhos.
- Uma carta foi selecionada, posicionamento validado, invocação confirmada e `canvas.dataset.units >= 1` observado.
- Não houve exceções de JavaScript durante a sessão testada.
- O documento não apresentou transbordamento horizontal (**0 px**) nos dois formatos.
- O job anexou 8 PNGs: início, arena, posicionamento e primeira unidade invocada, para desktop e celular.

## Atualização — modo de inspeção do personagem (25/10/2026)
- Implementada a opção **Personagem** na HUD da arena, disponível somente quando uma unidade aliada está ativa. Ela centraliza e aproxima a câmera do personagem 3D real, preservando as câmeras **Combate** e **Ilha inteira**. Não foram utilizados planos com retratos ou billboards.
- O botão tem rótulo acessível `Aproximar personagem 3D`; a barra de ações é ajustada para telas pequenas.
- Teste do navegador abre o close-up, verifica `data-camera-mode=character`, a identificação da carta focada, registra uma captura e volta a `data-camera-mode=combat`.
- **Execução confirmada:** [ações #40192930188](https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/40192930188), aprovado em desktop e celular, com **10 capturas PNG**, incluindo dois close-ups. Capturas revisadas: o personagem passa a ser visualmente identificável na cena com zoom, mas não há comprovação de identidade fiel à ilustração.
- Posteriormente, o close-up foi estendido para **acompanhar suavemente** o ator selecionado enquanto ele se move, sem bloquear o zoom manual. Essa extensão requer a nova execução de QA visual após o commit `3fbc404ca4cbdd5a0cd22463b1e68a5554cb467f`.
- Limite importante: ampliar/seguir a câmera melhora a **legibilidade**, não resolve as diferenças de roupa, cabelo, rosto, acessórios, topologia ou malemolência das animações em relação às cartas. Uma revisão artística individual permanece obrigatória.

## Limites dos testes
- Chrome headless em ambiente Linux não substitui testes em celular físico, GPU real, acessibilidade ou períodos de jogo prolongados.
- A arena apresenta **geometria 3D e torres funcionais**, mas as capturas mostram modelos pequenos e estilizados, ainda **não suficientemente fiéis** às respectivas cartas do deck. O requisito anterior de modelos reconhecíveis, cabelos, barba, vestes e animação orgânica (transferência de peso, preparação/impacto/recuperação) **continua em aberto**; teste de carga de GLB não é teste de fidelidade artística.
- O teste invoca a primeira carta mas ainda não verifica animações específicas, IA em duelos longos, todas as cartas nem desempenho FPS em aparelhos reais.

## Build seguro
No PR #4 a automação `.github/workflows/build-calculus-royale.yml` deixou de fazer `git push` e ganhou acesso `contents: read`. O workflow [Build Calculus Royale](https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/40190123434) passou e produziu o artefato `calculus-royale-build-candidate`.
**O artefato não foi publicado.** Integração em `main` ainda aciona o pipeline Godot Pages `.github/workflows/deploy.yml`; não tratar merge como operação neutra. A pasta estática compilada do jogo somente deve ser promovida após revisão humana, preservação de arquivos e teste das URLs.

## Pendências de aceite
1. Comparar e validar os 45 personagens com a arte das cartas, usando referências individuais e melhorando rigging/animation sem redesenhar as identidades.
2. Avaliar escala, enquadramento e legibilidade do avatar em desktop/celular; o modelo invocado aparece muito pequeno no panorama.
3. Testar toque, gestos, navegação, combate prolongado, níveis e atualização/offline em Android real.
4. Testar controle de acesso Supabase com dois usuários independentes num ambiente de homologação, e tratar pontuações autoenviadas como não verificadas.
5. Definir procedimento manual de promoção do build artefato para `jogos/calculus-royale/`, com commit/PR revisado, **antes** de encerrar o processo de publicação.

## Estado
PR #7 permanece rascunho; PR #4 permanece rascunho; `main` não foi modificada nesta rodada.
