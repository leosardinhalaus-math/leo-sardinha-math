@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1" -Run
if errorlevel 1 (
 echo.
 echo A compilacao falhou. Consulte build-log.txt e LEIA_PRIMEIRO.txt.
)
pause
