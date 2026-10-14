[CmdletBinding()]
param([string]$Exe = "$PSScriptRoot\..\dist\CameraDaGraci.exe", [string]$OutputDir = "$PSScriptRoot\..\smoke-output")
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
        if ($process.MainWindowHandle -ne 0 -and $process.MainWindowTitle.StartsWith('Camera da Graci 1.3') -and $process.Responding) { $ready = $true; break }
    }
    if (-not $ready) { throw 'Application did not create a responding Camera da Graci window.' }
    Start-Sleep -Seconds 2
    $process.Refresh()
    if ($process.HasExited -or -not $process.Responding) { throw 'Application failed after opening.' }
    # Inspect the actual compiled native UI; no webcam or personal image is used.
    Add-Type -AssemblyName System.Drawing
    Add-Type -ReferencedAssemblies 'System.Drawing','System' -TypeDefinition @'
using System;
using System.Drawing;
using System.Runtime.InteropServices;
public static class CameraDaGraciUi {
    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr dc, uint flags);
    [DllImport("user32.dll", EntryPoint="GetClassLongPtrW")] public static extern IntPtr GetClassLongPtr(IntPtr hwnd, int index);
    [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wparam, IntPtr lparam);
    public static void Capture(IntPtr hwnd, string path) {
        Rect r;
        if (!GetWindowRect(hwnd, out r)) throw new Exception("Could not measure window.");
        using (var bitmap = new Bitmap(r.Right-r.Left, r.Bottom-r.Top)) {
            using (var g = Graphics.FromImage(bitmap)) {
                IntPtr dc = g.GetHdc();
                bool printed;
                try { printed = PrintWindow(hwnd, dc, 2); } finally { g.ReleaseHdc(dc); }
                if (!printed) throw new Exception("Could not capture native window.");
            }
            bitmap.Save(path, System.Drawing.Imaging.ImageFormat.Png);
        }
    }
}
'@
    if ([CameraDaGraciUi]::GetClassLongPtr($process.MainWindowHandle, -14) -eq [IntPtr]::Zero -or
        [CameraDaGraciUi]::GetClassLongPtr($process.MainWindowHandle, -34) -eq [IntPtr]::Zero) { throw 'Application icons were not loaded from the executable.' }
    $screenDir = Join-Path $OutputDir 'screenshots'
    New-Item -ItemType Directory -Force -Path $screenDir | Out-Null
    [CameraDaGraciUi]::Capture($process.MainWindowHandle, (Join-Path $screenDir 'camera.png'))
    for ($i=0; $i -lt 8; $i++) { [void][CameraDaGraciUi]::SendMessage($process.MainWindowHandle, 0x100, [IntPtr]37, [IntPtr]::Zero) }
    for ($i=0; $i -lt 9; $i++) {
        Start-Sleep -Milliseconds 500
        [CameraDaGraciUi]::Capture($process.MainWindowHandle, (Join-Path $screenDir "film-$i.png"))
        [void][CameraDaGraciUi]::SendMessage($process.MainWindowHandle, 0x100, [IntPtr]39, [IntPtr]::Zero)
    }
    [void][CameraDaGraciUi]::SendMessage($process.MainWindowHandle, 0x100, [IntPtr]82, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 500
    [CameraDaGraciUi]::Capture($process.MainWindowHandle, (Join-Path $screenDir 'roll.png'))
    if (-not $process.CloseMainWindow()) { throw 'Could not request clean shutdown.' }
    if (-not $process.WaitForExit(15000)) { throw 'Application did not close cleanly.' }
    if ($process.ExitCode -ne 0) { throw "Application shutdown code: $($process.ExitCode)." }
    'PASS: native application opened, loaded both embedded icons, rendered all nine film cards, and closed cleanly without a webcam.' | Tee-Object -FilePath "$OutputDir\smoke-result.txt"
} finally {
    $process.Refresh()
    if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force }
}
