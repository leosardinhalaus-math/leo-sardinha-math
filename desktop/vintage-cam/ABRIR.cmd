@echo off
if not exist "%~dp0dist\CameraDaGraci.exe" (
 echo Primeiro execute COMPILAR_E_ABRIR.cmd. Veja LEIA_PRIMEIRO.txt.
 pause
 exit /b 1
)
start "" "%~dp0dist\CameraDaGraci.exe"
