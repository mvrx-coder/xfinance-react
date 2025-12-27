@echo off
REM ============================================================
REM xFinance 3.0 - Iniciar Sistema de Desenvolvimento
REM Duplo clique neste arquivo para iniciar o sistema
REM ============================================================
REM
REM Arquitetura:
REM   Vite (5173) --proxy--> FastAPI (8000) --> SQLite
REM
REM ============================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\start.ps1"
pause


