@echo off
REM ============================================================
REM xFinance 3.0 - Iniciar Sistema de Desenvolvimento
REM Duplo clique neste arquivo para iniciar o sistema
REM ============================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\start_dev.ps1"
pause


