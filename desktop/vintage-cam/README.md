# Vintage Cam · Windows

Câmera de fotografia com nove filmes, interface própria em português e processamento local. Projeto nativo C++20/Win32 para Windows 10 2004+ e Windows 11 x64. Não é uma cópia da identidade, dos recursos ou do código do Dazz Cam.

**Estado da entrega:** aplicativo compilado com MSVC no Windows Server 2022. Os testes do shader real, dos nove filmes e de abrir/fechar a janela passaram. A captura com webcam física e o FPS sustentado ainda precisam ser medidos no dispositivo. O pacote executável portátil é separado do projeto-fonte; não exige Visual Studio para rodar.

Compilação validada: [execução Windows de 14/10/2026](https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/38604122601), código `01d4f1884106ae446252943e6ec6d653cce90aed`.

## Como compilar e abrir

1. Extraia o ZIP inteiro.
2. Instale **Visual Studio 2022 Community** ou **Build Tools 2022**, selecionando **Desenvolvimento para desktop com C++**, **MSVC v143 x64/x86** e **Windows SDK 10.0.22621 ou superior**, com cabeçalhos C++/WinRT. Não são necessários NuGet, npm, Qt, Electron ou outras bibliotecas. O compilador é um requisito de desenvolvimento; ocupa vários GB.
3. Execute **COMPILAR_E_ABRIR.cmd**. O script localiza o compilador da Microsoft, compila o núcleo, o teste gráfico e o aplicativo, executa ambos os testes e só então abre o aplicativo. Não faz downloads nem instala programas.
4. O resultado fica em **dist/VintageCam.exe**. Nas próximas vezes, abra **ABRIR.cmd** ou o EXE. O executável usa o runtime C++ estático; o computador de destino não precisa instalar o Visual Studio.
5. Se houver falha, leia **build-log.txt**. Ele contém os comandos de compilação e o resultado dos testes. O arquivo fica na pasta extraída, não dentro do ZIP.

Em PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\build.ps1 -Run
```

Também é possível abrir esta pasta no Visual Studio, com o componente CMake instalado. O `CMakeLists.txt` define os alvos `VintageCam`, `CoreTests` e `GpuTests`:

```powershell
cmake -S . -B build-vs -G "Visual Studio 17 2022" -A x64
cmake --build build-vs --config Release
ctest --test-dir build-vs -C Release --output-on-failure
```

A pasta `.github/workflows` contém uma compilação opcional para um repositório seu. Ela compila no Windows, executa os testes e publica um artefato com o EXE. Nenhum repositório foi criado nem nenhuma execução remota foi acionada nesta entrega. Isso é uma ferramenta de desenvolvimento; o aplicativo não usa GitHub nem rede em execução.

## Correção de câmera · versão 1.1

A abertura agora reenumera os dispositivos em cada tentativa e seleciona o grupo RGB quando o driver o informa. A verificação de permissão é feita pela API de captura do Windows; uma consulta prévia destinada a outro modelo de aplicativo não interrompe mais a abertura. Flash, resolução fotográfica e formatos opcionais recusados são registrados, sem impedir o visor.

Quando MediaCapture falha ou não entrega imagens, há um backend alternativo local baseado em Media Foundation. Use **ABRIR CÂMERA**, **TROCAR CÂMERA** ou **COMPATÍVEL**. A captura nesse backend muda temporariamente para o maior formato de vídeo nativo aceito pelo driver e volta à resolução de preview depois de adquirir a foto. Isso preserva os pixels disponíveis nesse formato; não garante a resolução de um fluxo Photo independente que o driver não expõe. Flash físico só é anunciado quando o backend utilizado suporta esse controle.

As operações assíncronas de abertura têm tempo máximo de espera e cancelamento. **VER ERRO** abre `%LOCALAPPDATA%/VintageCam/camera-log.txt`, com etapas, códigos de erro, dispositivos encontrados e recebimento do primeiro quadro. O registro é local e não inclui imagens. Se não abrir, compartilhe voluntariamente o texto desse registro para diagnóstico. Feche a versão anterior antes de abrir o novo EXE, pois só uma instância do aplicativo pode usar a câmera.

Os testes adicionados cobrem padding, stride negativo, limites do buffer, alpha, priorização de 29,97 FPS e espera assíncrona com timeout/cancelamento. Esses testes não substituem uma webcam física.

## Usar

- **Fotografar:** aguarde o visor, escolha um filme arrastando o carrossel e clique no obturador ou pressione Espaço. A animação acompanha a pressão.
- **Filmes:** arraste horizontalmente, clique no cartão vizinho, use a roda do mouse ou as setas. O carrossel encaixa no filme escolhido. A vibração é enviada quando o Windows expõe hardware háptico compatível; não há vibração simulada por áudio.
- **Flash:** alterna o flash físico quando a câmera declara suporte. Em webcams sem flash, aparece `FLASH N/D`. Não há clarão artificial de tela fingindo ser flash físico.
- **Trocar câmera:** percorre os dispositivos disponíveis. Quando o Windows identifica uma câmera frontal, o visor e a foto usam o mesmo espelhamento. Sem uma segunda câmera, o botão permite tentar reabrir a atual após liberar as permissões.
- **Importar:** escolha uma foto pelo seletor nativo. Ela é mostrada com o filme ativo. Percorra os nove filmes e clique **Revelar** para criar uma versão; pode revelar outras sem reimportar. O original não é alterado. Clique **Câmera** para voltar.
- **Rolo:** grade de fotografias com seleção, paginação e ações **Compartilhar**, **Salvar em Imagens** e **Excluir**. Duplo clique numa miniatura abre uma visualização ampliada no aplicativo.
- **Compartilhar:** abre o painel de compartilhamento do Windows. O destino é escolhido por você. O aplicativo não envia arquivos automaticamente.
- **Salvar em Imagens:** copia o PNG para `Imagens/VintageCam`. O Windows Fotos pode visualizar os arquivos dessa pasta. A cópia permanece caso você exclua a versão do rolo.
- **Atalhos:** Espaço fotografa/revela; setas mudam filme; I importa; R abre o rolo; Esc volta.
- A câmera pausa quando o aplicativo é minimizado e durante o desenvolvimento de uma foto importada ou a navegação do rolo. O encerramento aguarda a liberação da câmera sem bloquear a thread de interface.

## Nove filmes

| Filme | Característica |
|---|---|
| Neutro | Curva linear, cor preservada, sem grão ou vinheta |
| Negativo 80 | Preto elevado, saturação suave, calor e textura |
| Instantâneo | Pastel, curva cremosa e luz suave |
| Ouro 135 | Amarelo quente, cores vivas e textura fina |
| P&B Arenoso | Luminância monocromática, contraste e grão forte |
| Y2K CCD | Temperatura fria, cor digital e sombras densas |
| Neon 3D | Viés violeta, bloom e separação RGB |
| Vencido | Desvio cromático, sombra elevada e granulação |
| VHS Date | Saturação contida, linhas e data laranja queimada |

## Pipeline real do visor

```text
MediaCapture → MediaFrameReader BGRA → última imagem disponível
→ textura Direct3D 11 → shader de filme → janela do visor
```

A aparência é calculada sobre os pixels do quadro. Não existe preview bruto com uma camada colorida por cima. O shader é compartilhado literalmente entre `Gpu::preview` e `Gpu::develop`. O carimbo VHS também é desenhado no shader, de modo que aparece tanto no visor quanto no arquivo final.

O shader aplica separação cromática opcional, bloom de altas luzes, saturação/luminância, temperatura e viés de canais, curva tonal de cinco pontos, vinheta, grão determinístico e linhas/carimbo opcionais. Os cálculos artísticos usam RGB normalizado no espaço da imagem, sem promessa de simulação físico-química ou calibração de um filme comercial.

O leitor usa aquisição `Realtime` e prefere formatos de pelo menos 30 FPS. O quadro de exibição é limitado a 1280 pixels no maior lado. Existe só um quadro pendente: quadros atrasados são substituídos, sem acumular uma fila. O visor exibe o FPS medido. A interface tem proporção fixa de retrato, ajustada à área disponível e ao DPI. O quadro mantém a proporção da câmera, com barras quando necessário, sem cortar o sensor para preencher a janela.

Se o dispositivo gráfico falhar na criação, há fallback Direct3D WARP por software. Esse fallback permite usar o pipeline, mas pode não atingir 30 FPS. A taxa final depende da webcam, do driver, do computador e do filme. O teste físico descrito em `docs/VALIDACAO.md` é necessário para confirmar desempenho.

### Captura original

No backend MediaCapture, a captura utiliza `CapturePhotoToStreamAsync`, e não uma cópia do último quadro do visor. Os formatos nativos do fluxo Photo são ordenados por área, e o maior aceito em conjunto com o preview é selecionado. O JPEG da câmera é decodificado, passa pelo mesmo shader na sua resolução original e é gravado em PNG, sem a redução usada no visor. A captura e a exportação usam o filme, o espelhamento e a data congelados no momento do clique.

"Resolução do sensor" depende do que o driver oferece. Uma webcam pode expor somente 1920×1080, mesmo se o sensor tiver mais pixels; câmeras sem fluxo Photo independente podem usar a resolução fotográfica padrão do driver. O programa não inventa resolução por ampliação. Os formatos efetivamente anunciados aparecem na linha de status; as dimensões reais da foto aparecem após revelar. Fotos importadas preservam as dimensões depois da orientação EXIF. Imagens acima de 16384 pixels em qualquer eixo são rejeitadas, em conformidade com o limite de textura adotado.

## Dados, privacidade e permissões

- Sem contas, telemetria, anúncios, análise, atualização automática, sockets ou chamadas HTTP.
- Microfone não é solicitado: `StreamingCaptureMode::Video`.
- O rolo é uma pasta local: `%LOCALAPPDATA%/VintageCam/FilmRoll`.
- PNGs são gravados primeiro em `.part` e movidos após finalizar a codificação. Não há arquivos incompletos na grade.
- A importação usa `IFileOpenDialog`; acesso negado, codecs ausentes e imagens corrompidas produzem mensagem legível. JPEG, PNG, BMP e TIFF usam WIC. HEIC/HEIF depende do codec instalado no Windows.
- Em câmera negada, a mensagem orienta liberar o acesso e o botão de engrenagem abre `ms-settings:privacy-webcam`. Libere **acesso à câmera para aplicativos da área de trabalho**. Outros erros incluem câmera ocupada ou ausência de dispositivo. A importação funciona sem webcam.
- **Não existe `Info.plist` no Windows.** Este é um aplicativo Win32 sem empacotamento MSIX: o `app.manifest` declara compatibilidade, DPI e execução sem administrador. Permissões de câmera são controladas pelas configurações de privacidade do Windows. Não foram adicionadas capacidades UWP em um manifesto Win32, onde não teriam efeito.
- Windows N/KN pode precisar do Media Feature Pack para APIs de câmera.
- Compartilhar abre a interface nativa; se você escolher um serviço online como destino, esse outro aplicativo pode transmitir a foto, conforme sua escolha.

## Adicionar um filme

Edite `src/VCFilm.h`. Cada entrada é uma `Film`:

```cpp
{L"meu_filme", L"MEU FILME", L"Descrição curta",
 .12f, .90f, .03f, .20f,     // temperatura, saturação, grão, vinheta
 {.01f, 0.f, -.01f}, .08f,  // viés RGB e bloom
 {.04f, .24f, .50f, .79f, .98f}, // curva tonal monotônica
 .001f, 0.f, false}         // deslocamento cromático, linhas VHS, carimbo
```

Aumente o tamanho declarado de `std::array<Film,9>` para o total novo. O carrossel usa `Films.size()` e descobre a nova entrada automaticamente. Não é necessário criar shader, classe de câmera ou condição por nome. Ajuste no teste o total esperado, já que o requisito desta versão é exatamente nove.

Os parâmetros não têm unidades fotográficas padronizadas. Temperatura é um deslocamento quente/frio relativo. `chroma` usa fração da largura da imagem, e `grain`, `vignette`, `bloom` e `scanlines` são intensidades normalizadas. Curvas devem ter cinco valores crescentes no intervalo de 0 a 1. `stamp` ativa o carimbo genérico `DD MM AA`, com a data local fornecida ao pipeline.

## Testes

`build.ps1` executa por padrão:

1. **CoreTests:** validações dos nove dados, vetor conhecido do gerador de grão, identidade neutra e determinismo de uma referência CPU limitada com imagem fixa.
2. **GpuTests:** compila **o shader de produção** e processa uma imagem fixa por todos os nove filmes, comparando oito repetições byte a byte para cada filme. Confere neutro com tolerância de um nível de byte, preservação de resolução, semente do grão, data VHS, espelhamento, alternância para imagem em retrato e roundtrip PNG. Executa em WARP e depois no dispositivo gráfico padrão, com fallback.

A semente, a data, a imagem e o filme são fixados. Determinismo é exigido entre execuções iguais no mesmo backend; não se exige igualdade de ponto flutuante entre GPUs de fabricantes diferentes. A referência CPU **não** implementa bloom, deslocamento cromático, linhas ou carimbo e **não** substitui o teste gráfico.

Em Linux/macOS, `sh tests/run_portable.sh` compila e executa apenas o teste portátil. A aprovação dele não comprova que o aplicativo Windows compilou. `docs/VALIDACAO.md` registra exatamente o que foi verificado e o que depende do Windows.

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `src/App.cpp` | Interface Win32/GDI, estado, carrossel, importação e rolo |
| `src/Camera.cpp` | MediaCapture, negociação, frames e fotografia |
| `src/VCFilm.h` | Definição de dados e os nove filmes |
| `src/VCShader.h` | Pipeline HLSL único de visor e foto |
| `src/Gpu.cpp` | Direct3D, renderização e readback em resolução original |
| `src/ImageIO.cpp` | WIC, orientação EXIF, PNG e pastas locais |
| `src/Share.cpp` | Painel de compartilhamento do Windows |
| `build.ps1` | Compilação MSVC e execução dos testes |
| `app.manifest` | Manifesto desktop, DPI e compatibilidade |

## Referências oficiais consultadas

- [MediaCapture](https://learn.microsoft.com/en-us/uwp/api/windows.media.capture.mediacapture)
- [Inicialização da câmera na thread STA de interface](https://learn.microsoft.com/en-us/uwp/api/windows.media.capture.mediacapture.initializeasync)
- [MediaFrameReader e aquisição de quadros](https://learn.microsoft.com/en-us/windows/apps/develop/camera/process-media-frames-with-mediaframereader)
- [Captura de foto para memória](https://learn.microsoft.com/en-us/windows/apps/develop/camera/basic-photo-capture)
- [Acesso aos pixels de SoftwareBitmap](https://learn.microsoft.com/en-us/uwp/api/windows.graphics.imaging.softwarebitmap.lockbuffer)
- [FlashControl e suporte do hardware](https://learn.microsoft.com/en-us/uwp/api/windows.media.devices.flashcontrol)
- [Compartilhamento WinRT associado a HWND](https://learn.microsoft.com/en-us/windows/apps/develop/ui/display-ui-objects)

Licença MIT. Identidade visual e nomes dos filmes são próprios. Não inclui recursos do Dazz Cam.
