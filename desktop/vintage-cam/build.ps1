[CmdletBinding()]
param([switch]$Run, [switch]$SkipTests)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot 'build-log.txt'
Start-Transcript -Path $log -Force | Out-Null
try {
    if (-not (Get-Command cl.exe -ErrorAction SilentlyContinue)) {
        $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
        if (-not (Test-Path $vswhere)) { throw 'Instale Visual Studio 2022 ou Build Tools 2022 com Desenvolvimento para desktop com C++ e Windows SDK. Veja LEIA_PRIMEIRO.txt.' }
        $install = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        if (-not $install) { throw 'Compilador C++ nao encontrado. Adicione Desenvolvimento para desktop com C++ no Visual Studio Installer.' }
        Import-Module (Join-Path $install 'Common7\Tools\Microsoft.VisualStudio.DevShell.dll')
        Enter-VsDevShell -VsInstallPath $install -SkipAutomaticLocation -DevCmdArguments '-arch=x64 -host_arch=x64' | Out-Null
    }
    if (-not $env:WindowsSdkDir) { throw 'Windows SDK nao encontrado no ambiente de compilacao.' }
    $sdkVersion = $env:WindowsSDKVersion.TrimEnd('\')
    $cppwinrt = Join-Path $env:WindowsSdkDir "Include\$sdkVersion\cppwinrt"
    if (-not (Test-Path (Join-Path $cppwinrt 'winrt\Windows.Media.Capture.h'))) { throw 'Instale Windows SDK 10.0.22621 ou superior, incluindo os cabecalhos C++/WinRT.' }
    $out = Join-Path $PSScriptRoot 'dist'
    $obj = Join-Path $PSScriptRoot 'build'
    $compilerLog = Join-Path $PSScriptRoot 'compiler-log.txt'
    '' | Set-Content -Path $compilerLog
    New-Item -ItemType Directory -Force -Path $out,$obj | Out-Null
    $flags = @('/nologo','/std:c++20','/EHsc','/O2','/MP','/MT','/W4','/permissive-','/Zc:__cplusplus','/utf-8','/DUNICODE','/D_UNICODE','/DWINVER=0x0A00','/D_WIN32_WINNT=0x0A00',"/I$PSScriptRoot\src","/I$cppwinrt")
    $libs = @('windowsapp.lib','runtimeobject.lib','d3d11.lib','dxgi.lib','d3dcompiler.lib','windowscodecs.lib','shlwapi.lib','shell32.lib','ole32.lib','oleaut32.lib','user32.lib','gdi32.lib','gdiplus.lib','advapi32.lib','mf.lib','mfplat.lib','mfreadwrite.lib','mfuuid.lib')
    Push-Location $obj
    try {
        Write-Host '1/3 Compilando o nucleo e o teste de dados...'
        & cl.exe @flags "$PSScriptRoot\tests\CoreTests.cpp" "$PSScriptRoot\src\Film.cpp" "/Fe:$out\CoreTests.exe" 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar CoreTests.' }
        Write-Host 'Compilando os testes de compatibilidade da camera...'
        & cl.exe @flags "$PSScriptRoot\tests\CameraTests.cpp" "/Fe:$out\CameraTests.exe" 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar CameraTests.' }
        Write-Host 'Compilando o teste de timeout da camera...'
        & cl.exe @flags "$PSScriptRoot\tests\AsyncTests.cpp" "/Fe:$out\AsyncTests.exe" /link @libs 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar AsyncTests.' }
        Write-Host '2/3 Compilando o teste do shader real...'


        & cl.exe @flags "$PSScriptRoot\tests\GpuTests.cpp" "$PSScriptRoot\src\Gpu.cpp" "$PSScriptRoot\src\ImageIO.cpp" "/Fe:$out\GpuTests.exe" /link @libs 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar GpuTests.' }
        Write-Host '3/3 Compilando VintageCam.exe...'
        & rc.exe /nologo "/I$PSScriptRoot\assets" "/fo$obj\VintageCam.res" "$PSScriptRoot\assets\VintageCam.rc" 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o icone do aplicativo.' }
        $sources = @('App.cpp','Camera.cpp','CompatCamera.cpp','Gpu.cpp','ImageIO.cpp','Share.cpp') | ForEach-Object { Join-Path "$PSScriptRoot\src" $_ }
        & cl.exe @flags @sources "$obj\VintageCam.res" "/Fe:$out\VintageCam.exe" /link @libs /SUBSYSTEM:WINDOWS /MANIFEST:EMBED "/MANIFESTINPUT:$PSScriptRoot\app.manifest" 2>&1 | Tee-Object -FilePath $compilerLog -Append
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar VintageCam.' }
    } finally { Pop-Location }
    if (-not $SkipTests) {
        & "$out\CoreTests.exe"
        if ($LASTEXITCODE -ne 0) { throw 'CoreTests falhou.' }
        & "$out\CameraTests.exe"
        if ($LASTEXITCODE -ne 0) { throw 'CameraTests falhou.' }
        & "$out\AsyncTests.exe"
        if ($LASTEXITCODE -ne 0) { throw 'AsyncTests falhou.' }
        & "$out\GpuTests.exe"
        if ($LASTEXITCODE -ne 0) { throw 'GpuTests falhou. O executavel nao foi validado.' }
    }
    Write-Host "Pronto: $out\VintageCam.exe" -ForegroundColor Green
    if ($Run) { Start-Process "$out\VintageCam.exe" }
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Diagnostico em: $log"
    exit 1
} finally { Stop-Transcript | Out-Null }
