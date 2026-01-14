param(
  [string]$Server = "marcusadm@192.168.1.235",
  [string]$LocalAppDir = "E:\MVRX\Financeiro\xFinance_3.0\x_site",
  [string]$RemoteAppDir = "/opt/apps/xsite"
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando '$Name' não encontrado no PATH."
  }
}

Require-Command "ssh"
Require-Command "scp"
Require-Command "tar"

if (-not (Test-Path -LiteralPath $LocalAppDir)) {
  throw "Diretório local do x_site não encontrado: $LocalAppDir"
}

$sshOpts = @(
  "-o", "BatchMode=yes",
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ConnectTimeout=10"
)

function Invoke-Ssh([string]$Cmd) {
  & ssh @sshOpts $Server $Cmd
}

function Invoke-SshScript([string[]]$Lines) {
  # Envia conteúdo com LF puro (evita CRLF -> $'\r' no bash)
  $tempScript = [System.IO.Path]::GetTempFileName()
  try {
    $content = ($Lines -join "`n") + "`n"
    [System.IO.File]::WriteAllText($tempScript, $content, [System.Text.UTF8Encoding]::new($false))
    & cmd /c "type `"$tempScript`" | ssh $($sshOpts -join ' ') $Server `"bash -s`""
    if ($LASTEXITCODE -ne 0) {
      throw "Falha ao executar script remoto via SSH (exit=$LASTEXITCODE)."
    }
  } finally {
    if (Test-Path $tempScript) { Remove-Item -Force $tempScript }
  }
}

# -----------------------------------------------------------------------------
# Pré-checks locais
# -----------------------------------------------------------------------------

foreach ($rel in @("compose.yml", "Dockerfile", "package.json", "package-lock.json")) {
  $p = Join-Path $LocalAppDir $rel
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Arquivo obrigatório não encontrado: $p"
  }
}

# -----------------------------------------------------------------------------
# 1) Preparar diretório no servidor
# -----------------------------------------------------------------------------

Write-Host "==> Preparando diretório no servidor ($Server): $RemoteAppDir" -ForegroundColor Cyan
Invoke-Ssh "mkdir -p '$RemoteAppDir' && chown -R marcusadm:marcusadm '$RemoteAppDir'"

# -----------------------------------------------------------------------------
# 2) Empacotar e enviar código (sem Git/GitHub)
# -----------------------------------------------------------------------------

$bundle = Join-Path $env:TEMP "xsite_bundle.tgz"
if (Test-Path -LiteralPath $bundle) {
  Remove-Item -Force -LiteralPath $bundle
}

Write-Host "==> Criando bundle local (tar.gz)..." -ForegroundColor Cyan
& tar -czf $bundle `
  --exclude="./node_modules" `
  --exclude="./client/node_modules" `
  --exclude="node_modules" `
  --exclude="*/node_modules" `
  --exclude="*/node_modules/*" `
  --exclude="./dist" `
  --exclude="./.git" `
  --exclude="./.env" `
  --exclude="./.venv" `
  --exclude="./terminals" `
  -C $LocalAppDir .

$remoteTmpBundle = "/tmp/xsite_bundle.tgz"
Write-Host "==> Enviando bundle via SCP..." -ForegroundColor Cyan
& scp @sshOpts -- $bundle "$Server`:$remoteTmpBundle"

Write-Host "==> Aplicando bundle no servidor (preservando .env se existir)" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "mkdir -p '$RemoteAppDir/_incoming'"
  "tar -xzf '$remoteTmpBundle' -C '$RemoteAppDir/_incoming'"
  "rm -f '$remoteTmpBundle'"
  ""
  "find '$RemoteAppDir' -mindepth 1 -maxdepth 1 ! -name '.env' ! -name '_incoming' -exec rm -rf {} +"
  "cp -a '$RemoteAppDir/_incoming/.' '$RemoteAppDir/'"
  "rm -rf '$RemoteAppDir/_incoming'"
  "chown -R marcusadm:marcusadm '$RemoteAppDir'"
)

# -----------------------------------------------------------------------------
# 3) Subir stack + healthcheck
# -----------------------------------------------------------------------------

Write-Host "==> Subindo stack (docker compose up -d --build)" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "cd '$RemoteAppDir'"
  "docker compose up -d --build --remove-orphans"
  "docker compose ps"
)

Write-Host "==> Health check (porta 8090)" -ForegroundColor Cyan
Invoke-Ssh "curl -fsS http://127.0.0.1:8090/ | head -n 1"

Write-Host ""
Write-Host "OK: xSite publicado em http://192.168.1.235:8090" -ForegroundColor Green

