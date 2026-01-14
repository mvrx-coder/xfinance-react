# ============================================================
# xFinance 3.0 - Script de Inicialização Unificado
# Inicia Backend (FastAPI) + Frontend (Vite) simultaneamente
# ============================================================
#
# Uso:
#   .\scripts\start.ps1              # Inicia backend + frontend
#   .\scripts\start.ps1 -BackendOnly # Só backend
#   .\scripts\start.ps1 -FrontendOnly # Só frontend
#
# ============================================================

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173
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

# Configurar variável de ambiente para o banco
# Preferência:
# 1) Respeitar XF_BASE_DIR se já estiver definido
# 2) Inferir como diretório pai do repositório (espera-se: <XF_BASE_DIR>\x_finan)
if (-not $env:XF_BASE_DIR -or $env:XF_BASE_DIR.Trim() -eq "") {
    $env:XF_BASE_DIR = Split-Path -Parent $ProjectRoot
}
Write-Host "[CONFIG] XF_BASE_DIR = $env:XF_BASE_DIR" -ForegroundColor Cyan

# Verificar se o banco existe
$dbPath = Join-Path $env:XF_BASE_DIR "x_db\xFinanceDB.db"
if (-not (Test-Path $dbPath)) {
    Write-Host "[ERRO] Banco de dados nao encontrado: $dbPath" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Banco de dados encontrado" -ForegroundColor Green

# Função para iniciar o Backend
function Start-Backend {
    Write-Host ""
    Write-Host "[BACKEND] Preparando FastAPI..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectRoot "backend"
    $venvPath = Join-Path $backendPath ".venv"
    $venvActivate = Join-Path $venvPath "Scripts\Activate.ps1"
    
    # Verificar ambiente virtual
    if (-not (Test-Path $venvActivate)) {
        Write-Host "[AVISO] Ambiente virtual nao encontrado. Criando..." -ForegroundColor Yellow
        Push-Location $backendPath
        python -m venv .venv
        & $venvActivate
        pip install -r requirements.txt --quiet
        Pop-Location
        Write-Host "[OK] Ambiente virtual criado e dependencias instaladas" -ForegroundColor Green
    }
    
    # Criar script temporário para o backend
    $tempScript = Join-Path $env:TEMP "xfinance_backend.ps1"
    $scriptContent = @"
`$Host.UI.RawUI.WindowTitle = 'xFinance - Backend FastAPI'
Set-Location '$backendPath'
& '$venvActivate'
if (-not `$env:XF_BASE_DIR -or `$env:XF_BASE_DIR.Trim() -eq "") {
    `$env:XF_BASE_DIR = '$(Split-Path -Parent $ProjectRoot)'
}
# Desabilitar scheduler de backup em DEV (evita backup da base de desenvolvimento)
`$env:XF_ENABLE_SCHEDULER = 'false'
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Green
Write-Host '  FastAPI Backend - xFinance 3.0' -ForegroundColor Green
Write-Host '  ----------------------------------------' -ForegroundColor Green
Write-Host '  API:  http://127.0.0.1:$BackendPort' -ForegroundColor Cyan
Write-Host '  Docs: http://127.0.0.1:$BackendPort/docs' -ForegroundColor Cyan
Write-Host '  ----------------------------------------' -ForegroundColor Green
Write-Host '  Ctrl+C para parar' -ForegroundColor Yellow
Write-Host '  ========================================' -ForegroundColor Green
Write-Host ''
python -m uvicorn main:app --host 127.0.0.1 --port $BackendPort --reload
"@
    Set-Content -Path $tempScript -Value $scriptContent -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit -File `"$tempScript`""
    Write-Host "[OK] Backend iniciado na porta $BackendPort" -ForegroundColor Green
    return $true
}

# Função para iniciar o Frontend
function Start-Frontend {
    Write-Host ""
    Write-Host "[FRONTEND] Preparando Vite..." -ForegroundColor Yellow
    
    $nodeModules = Join-Path $ProjectRoot "node_modules"
    
    # Verificar node_modules
    if (-not (Test-Path $nodeModules)) {
        Write-Host "[AVISO] node_modules nao encontrado. Instalando..." -ForegroundColor Yellow
        Push-Location $ProjectRoot
        npm install
        Pop-Location
        Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
    }
    
    # Criar script temporário para o frontend
    $tempScript = Join-Path $env:TEMP "xfinance_frontend.ps1"
    $scriptContent = @"
`$Host.UI.RawUI.WindowTitle = 'xFinance - Frontend Vite'
Set-Location '$ProjectRoot'
Write-Host ''
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host '  Vite Frontend - xFinance 3.0' -ForegroundColor Cyan
Write-Host '  ----------------------------------------' -ForegroundColor Cyan
Write-Host '  App:  http://localhost:$FrontendPort' -ForegroundColor Green
Write-Host '  ----------------------------------------' -ForegroundColor Cyan
Write-Host '  Ctrl+C para parar' -ForegroundColor Yellow
Write-Host '  ========================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
    Set-Content -Path $tempScript -Value $scriptContent -Encoding UTF8
    
    Start-Process powershell -ArgumentList "-NoExit -File `"$tempScript`""
    Write-Host "[OK] Frontend iniciado na porta $FrontendPort" -ForegroundColor Green
    return $true
}

# Lógica principal
$backendOk = $true
$frontendOk = $true

if (-not $FrontendOnly) {
    $backendOk = Start-Backend
    Start-Sleep -Seconds 2
}

if ($backendOk -and (-not $BackendOnly)) {
    $frontendOk = Start-Frontend
}

if ($backendOk -and $frontendOk) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  Sistema iniciado com sucesso!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    if (-not $BackendOnly) {
        Write-Host "  Frontend: http://localhost:$FrontendPort" -ForegroundColor Cyan
    }
    if (-not $FrontendOnly) {
        Write-Host "  Backend:  http://127.0.0.1:$BackendPort" -ForegroundColor Cyan
        Write-Host "  API Docs: http://127.0.0.1:$BackendPort/docs" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "  ARQUITETURA:" -ForegroundColor Yellow
    Write-Host "  Vite (5173) --proxy--> FastAPI (8000) --> SQLite" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Feche os terminais abertos para parar" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[ERRO] Falha ao iniciar o sistema" -ForegroundColor Red
    exit 1
}


