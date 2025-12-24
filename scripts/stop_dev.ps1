# ============================================================
# xFinance 3.0 - Parar Servidores de Desenvolvimento
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "  Parando servidores xFinance..." -ForegroundColor Yellow
Write-Host ""

# Parar processos Node (Vite)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  [OK] Processos Node/Vite encerrados" -ForegroundColor Green
} else {
    Write-Host "  [--] Nenhum processo Node encontrado" -ForegroundColor Gray
}

# Parar processos Python (Uvicorn)
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*main:app*"
}
if ($pythonProcesses) {
    $pythonProcesses | Stop-Process -Force
    Write-Host "  [OK] Processos Python/Uvicorn encerrados" -ForegroundColor Green
} else {
    Write-Host "  [--] Nenhum processo Uvicorn encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  Servidores parados!" -ForegroundColor Cyan
Write-Host ""


