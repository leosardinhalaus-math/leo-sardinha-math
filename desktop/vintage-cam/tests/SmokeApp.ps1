[CmdletBinding()]
param([string]$Exe = "$PSScriptRoot\..\dist\VintageCam.exe", [string]$OutputDir = "$PSScriptRoot\..\smoke-output")
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$process = Start-Process -FilePath (Resolve-Path $Exe) -PassThru
try {
    $deadline = [DateTime]::UtcNow.AddSeconds(30)
    $ready = $false
    while ([DateTime]::UtcNow -lt $deadline) {
        Start-Sleep -Milliseconds 200
        $process.Refresh()
        if ($process.HasExited) { throw "Application exited during startup with code $($process.ExitCode)." }
        if ($process.MainWindowHandle -ne 0 -and $process.MainWindowTitle.StartsWith('Vintage Cam') -and $process.Responding) { $ready = $true; break }
    }
    if (-not $ready) { throw 'Application did not create a responding Vintage Cam window.' }
    Start-Sleep -Seconds 2
    $process.Refresh()
    if ($process.HasExited -or -not $process.Responding) { throw 'Application failed after opening.' }
    if (-not $process.CloseMainWindow()) { throw 'Could not request clean shutdown.' }
    if (-not $process.WaitForExit(15000)) { throw 'Application did not close cleanly.' }
    if ($process.ExitCode -ne 0) { throw "Application shutdown code: $($process.ExitCode)." }
    'PASS: native application opened a responding window and closed cleanly without a webcam.' | Tee-Object -FilePath "$OutputDir\smoke-result.txt"
} finally {
    $process.Refresh()
    if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force }
}
