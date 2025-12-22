# Script para rodar o backend FastAPI em modo desenvolvimento
# Uso: .\run_dev.ps1

$ErrorActionPreference = "Stop"

# Ir para o diretório do backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Verificar se venv existe
if (-not (Test-Path ".venv")) {
    Write-Host "Criando ambiente virtual..." -ForegroundColor Yellow
    python -m venv .venv
}

# Ativar venv
Write-Host "Ativando ambiente virtual..." -ForegroundColor Cyan
& ".\.venv\Scripts\Activate.ps1"

# Instalar dependências
Write-Host "Instalando dependências..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet

# Definir variável de ambiente para o banco
$env:XF_BASE_DIR = "E:\MVRX\Financeiro\xFinance_3.0"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  xFinance API - Modo Desenvolvimento" -ForegroundColor Green
Write-Host "  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Rodar uvicorn
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

