# Validação desta entrega

Data: 14/10/2026.

## Resultado disponível

| Verificação | Resultado |
|---|---|
| Compilação C++20 dos dados e da referência CPU com GCC | Aprovada, sem avisos com `-Wall -Wextra -Werror -pedantic` |
| Nove entradas, identificadores exclusivos e curva monotônica | Aprovada |
| Filme neutro sobre a imagem fixa | Aprovada |
| Semente de granulação com vetor conhecido | Aprovada |
| Repetibilidade da referência CPU para os nove filmes | Aprovada: vinte repetições por filme |
| Rejeição de buffer com dimensões incompatíveis | Aprovada |
| AddressSanitizer e UndefinedBehaviorSanitizer na suíte portátil | Aprovada, com detecção de vazamentos desativada devido à restrição de `/proc` deste ambiente |
| Compilação do aplicativo usando MSVC e Windows SDK | Aprovada no Windows Server 2022 |
| Compilação e execução do HLSL de produção no Direct3D | Aprovada em WARP e no backend padrão com fallback |
| Teste de câmera e captura nativa em resolução máxima | **Não executado** |
| FPS sustentado e inspeção visual em webcam | **Não medidos** |
| Painel de compartilhamento e permissões do Windows | **Não exercitados** |

A primeira entrega foi criada em Linux. Após autorização, o projeto foi compilado pelo GitHub Actions em Windows Server 2022. O teste portátil, o teste do shader de produção e o teste de abertura e encerramento da janela passaram. A máquina de compilação não tem webcam; a captura física não foi testada.

`tests/GpuTests.cpp` executou o **shader de produção**: imagem fixa por nove filmes, oito repetições idênticas para cada filme, grão, data VHS, espelhamento, resolução, retrato e PNG. `tests/SmokeApp.ps1` confirmou que o EXE abre uma janela responsiva e fecha com código zero sem câmera conectada.

Execução: https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/38604122601

Código compilado: `01d4f1884106ae446252943e6ec6d653cce90aed`.

SHA-256 do EXE: `8ea12c5a918046c3751e40375880c6f86bb854ef495b15de94780ff65a990f9c`.

## Validação necessária no Windows

1. Executar `COMPILAR_E_ABRIR.cmd`. Confirmar `CoreTests` e `GpuTests` aprovados. Guardar `build-log.txt` em caso de erro. O script não abre o aplicativo quando a compilação ou um teste falha.
2. Abrir com webcam, boa iluminação e sem outros aplicativos de câmera. Aguardar estabilizar e observar o contador durante 30 segundos. Verificar pelo menos 30 FPS onde o dispositivo realmente suporta essa taxa; testar os nove filmes. Não confundir FPS de captura com taxa de atualização do monitor.
3. Comparar o visor e as fotografias de cada filme. Conferir que o neutro preserva a cor, o P&B é monocromático e o VHS mostra a mesma data no visor e no PNG.
4. Conferir as dimensões da captura no status e nas propriedades do PNG; elas não devem ser limitadas aos 1280 pixels da cópia do visor. Se o driver só oferece uma resolução, esse é o limite disponível.
5. Testar troca entre duas webcams ou frontal/traseira, quando presentes, e conferir a convenção de espelhamento. Em hardware com flash, confirmar os dois estados. Em hardware háptico, confirmar o feedback do carrossel.
6. Negar o acesso em Configurações, abrir o aplicativo e usar a engrenagem para liberar a câmera; clicar em Trocar câmera para tentar novamente. Testar também câmera ocupada e desconexão USB durante o visor.
7. Importar JPEG deitado, JPEG com orientação EXIF de retrato e PNG. Visualizar os nove filmes e revelar duas versões do mesmo original. Conferir que o original não mudou e que cada versão preservou as dimensões orientadas.
8. Abrir o rolo, selecionar foto, ampliar, compartilhar pelo painel Windows, salvar em Imagens e excluir apenas a versão do rolo. Confirmar que a cópia em Imagens permanece. Verificar paginação com mais de doze fotografias.
9. Minimizar e restaurar. Fechar durante a abertura da câmera e durante uma exportação. O fechamento deve aguardar as operações e liberar os dispositivos; o PNG só deve aparecer após a gravação completa.
10. Testar em escalas de tela de 100%, 125%, 150% e em um notebook de 1366×768. A janela deve permanecer em retrato, com os controles acessíveis.

Esses são procedimentos de aceitação a executar; não são resultados já observados.

## Correção 1.1 de abertura da câmera

O usuário relatou que a câmera não abriu na versão 1.0. Não foi fornecido o erro do notebook, e não houve reprodução com uma webcam física. A versão 1.1 remove a checagem prévia de permissão inadequada ao fluxo desktop, torna controles opcionais não fatais, seleciona grupos RGB e tenta formatos alternativos. Ela acrescenta Media Foundation como caminho compatível, reenumeração, limite de espera e registro dos erros de inicialização e quadros.

Passaram os testes Windows de buffers de câmera com padding/stride negativo, bounds/alpha e seleção de 29,97 FPS; conclusão de operações assíncronas, timeout e propagação de cancelamento; shader dos nove filmes e abertura/fechamento sem webcam. O teste de timeout detectou a tentativa inválida de atribuir um segundo delegate de conclusão; a correção usa GetResults após wait_for e passou na nova execução.

Ainda é necessário abrir a câmera real no notebook. VER ERRO permite obter o diagnóstico do dispositivo caso a falha persista. Não se afirma que a causa específica do usuário foi reproduzida ou confirmada.

## Ícones 1.2

Compilação MSVC x64 e todos os testes existentes aprovados na execução https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/38609653213 (código `9aba73bc4d52620fa2bf94eb1947e246a9421c43`). SHA-256 do EXE: `79699f641a6777ab9e2454158552a16a3667c3e3e3d65b6bb79e1baf6071a4c8`.

O teste de janela carregou os ícones grande e pequeno dos recursos embutidos no EXE, percorreu os nove filmes, abriu o rolo e encerrou com código zero. Foram inspecionadas as capturas reais `camera.png`, `film-0.png` a `film-8.png` e `roll.png`: os vetores, as cores e os rótulos cabem nos controles. A conferência inclui uma janela reduzida para a área de trabalho do runner; não substitui testar todos os fatores de escala em monitores físicos.

O ícone `.ico` inclui 16, 24, 32, 48, 64, 128 e 256 pixels. Os vetores da interface usam GDI+ do Windows, sem fonte de símbolos ou pacote de terceiros. O processamento de filme continua passando os testes do shader de produção.

## Nome Camera da Graci · versão 1.3

Compilação MSVC x64 e todas as suítes Windows aprovadas na execução https://github.com/leosardinhalaus-math/leo-sardinha-math/actions/runs/38613826283 (código `5723a61337ee8a791ec80363520eb4fce9f29d0e`). SHA-256 de `CameraDaGraci.exe`: `037ab0305e6af24b7a0c0ae0651c8063d90452f9bebd0c5ed6f61b6406ccddd7`.

O teste de abertura exigiu uma janela cujo título começa com `Camera da Graci 1.3`, verificou os ícones, percorreu os nove filmes e encerrou com código zero. A captura real `camera.png` confirmou o novo cabeçalho e título sem comprometer os controles. O rolo privado e os diagnósticos mantêm os caminhos internos anteriores; novas cópias em Imagens usam `Camera da Graci`. A captura física segue dependendo de teste com webcam.
