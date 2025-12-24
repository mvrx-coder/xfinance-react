# ============================================================
# xFinance 3.0 - Script de Desenvolvimento
# Inicia Backend (FastAPI) + Frontend (Vite) simultaneamente
# ============================================================

param(
    [string]$BindHost = "127.0.0.1",
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Banner
Write-Host ""
Write-Host "  +=============================================+" -ForegroundColor Magenta
Write-Host "  |         xFinance 3.0 - Dev Server          |" -ForegroundColor Magenta
Write-Host "  |         React + FastAPI + SQLite           |" -ForegroundColor Magenta
Write-Host "  +=============================================+" -ForegroundColor Magenta
Write-Host ""

# Configurar variavel de ambiente
$env:XF_BASE_DIR = "E:\MVRX\Financeiro\xFinance_3.0"
Write-Host "[CONFIG] XF_BASE_DIR = $env:XF_BASE_DIR" -ForegroundColor Cyan

# Funcao para iniciar o Backend
function Start-Backend {
    Write-Host "[BACKEND] Iniciando FastAPI na porta $BackendPort..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectRoot "backend"
    $venvActivate = Join-Path $backendPath ".venv\Scripts\Activate.ps1"
    
    if (-not (Test-Path $venvActivate)) {
        Write-Host "[ERRO] Ambiente virtual nao encontrado em: $venvActivate" -ForegroundColor Red
        Write-Host "[DICA] Execute: cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor Yellow
        return $false
    }
    
    # Criar script temporario para o backend
    $tempScript = Join-Path $env:TEMP "xfinance_backend.ps1"
    $scriptContent = @"
Set-Location '$backendPath'
& '$venvActivate'
`$env:XF_BASE_DIR = 'E:\MVRX\Financeiro\xFinance_3.0'
Write-Host ''
Write-Host '  [FastAPI] Backend rodando em http://${BindHost}:${BackendPort}' -ForegroundColor Green
Write-Host '  [FastAPI] Docs: http://${BindHost}:${BackendPort}/docs' -ForegroundColor Cyan
Write-Host '  [FastAPI] Pressione Ctrl+C para parar' -ForegroundColor Yellow
Write-Host ''
python -m uvicorn main:app --host $BindHost --port $BackendPort --reload
"@
    Set-Content -Path $tempScript -Value $scriptContent -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit -File `"$tempScript`""
    return $true
}

# Funcao para iniciar o Frontend
function Start-Frontend {
    Write-Host "[FRONTEND] Iniciando Vite na porta $FrontendPort..." -ForegroundColor Yellow
    
    $nodeModules = Join-Path $ProjectRoot "node_modules"
    
    if (-not (Test-Path $nodeModules)) {
        Write-Host "[ERRO] node_modules nao encontrado!" -ForegroundColor Red
        Write-Host "[DICA] Execute: npm install" -ForegroundColor Yellow
        return $false
    }
    
    # Criar script temporario para o frontend
    $tempScript = Join-Path $env:TEMP "xfinance_frontend.ps1"
    $scriptContent = @"
Set-Location '$ProjectRoot'
Write-Host ''
Write-Host '  [Vite] Frontend rodando em http://localhost:${FrontendPort}' -ForegroundColor Green
Write-Host '  [Vite] Pressione Ctrl+C para parar' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@
    Set-Content -Path $tempScript -Value $scriptContent -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit -File `"$tempScript`""
    return $true
}

# Logica principal
$success = $true

if (-not $FrontendOnly) {
    $success = Start-Backend
    Start-Sleep -Seconds 2
}

if ($success -and (-not $BackendOnly)) {
    $success = Start-Frontend
}

if ($success) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Sistema iniciado com sucesso!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Frontend: http://localhost:$FrontendPort" -ForegroundColor Cyan
    Write-Host "  Backend:  http://${BindHost}:$BackendPort" -ForegroundColor Cyan
    Write-Host "  API Docs: http://${BindHost}:$BackendPort/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Dica: Feche os terminais abertos para parar" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[ERRO] Falha ao iniciar o sistema" -ForegroundColor Red
    exit 1
}
