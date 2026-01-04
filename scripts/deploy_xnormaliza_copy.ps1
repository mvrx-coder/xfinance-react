param(
  [string]$Server = "marcusadm@192.168.1.235",
  [string]$LocalAppDir = "E:\MVRX\Financeiro\xFinance_3.0\x_normaliza",
  [string]$RemoteAppDir = "/opt/apps/xnormaliza"
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
  throw "Diretório local do x_normaliza não encontrado: $LocalAppDir"
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
# 1) Pré-checks locais (arquivos essenciais)
# -----------------------------------------------------------------------------

$composePath = Join-Path $LocalAppDir "compose.yml"
$dockerfilePath = Join-Path $LocalAppDir "Dockerfile"
$requirementsPath = Join-Path $LocalAppDir "requirements.txt"
$normalizerDir = Join-Path $LocalAppDir "normalizer"

foreach ($p in @($composePath, $dockerfilePath, $requirementsPath)) {
  if (-not (Test-Path -LiteralPath $p)) {
    throw "Arquivo obrigatório não encontrado: $p"
  }
}
if (-not (Test-Path -LiteralPath $normalizerDir)) {
  throw "Pasta obrigatória não encontrada: $normalizerDir"
}

# -----------------------------------------------------------------------------
# 2) Preparar diretório no servidor (sem mexer no xFinance)
# -----------------------------------------------------------------------------

Write-Host "==> Preparando diretório no servidor ($Server): $RemoteAppDir" -ForegroundColor Cyan
Invoke-Ssh "mkdir -p '$RemoteAppDir' && chown -R marcusadm:marcusadm '$RemoteAppDir'"

# -----------------------------------------------------------------------------
# 3) Empacotar e enviar código (sem Git/GitHub)
#    - Não enviar bancos locais (x_db/, *.db) para evitar confusão
# -----------------------------------------------------------------------------

$bundle = Join-Path $env:TEMP "xnormaliza_bundle.tgz"
if (Test-Path -LiteralPath $bundle) {
  Remove-Item -Force -LiteralPath $bundle
}

Write-Host "==> Criando bundle local (tar.gz)..." -ForegroundColor Cyan
& tar -czf $bundle `
  --exclude="./x_db" `
  --exclude="./.env" `
  --exclude="./node_modules" `
  --exclude="./dist" `
  --exclude="./.git" `
  --exclude="./.venv" `
  --exclude="./terminals" `
  --exclude="./*.db" `
  --exclude="*.db" `
  -C $LocalAppDir .

$remoteTmpBundle = "/tmp/xnormaliza_bundle.tgz"
Write-Host "==> Enviando bundle via SCP..." -ForegroundColor Cyan
& scp @sshOpts -- $bundle "$Server`:$remoteTmpBundle"

Write-Host "==> Aplicando bundle no servidor" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "mkdir -p '$RemoteAppDir/_incoming'"
  "tar -xzf '$remoteTmpBundle' -C '$RemoteAppDir/_incoming'"
  "rm -f '$remoteTmpBundle'"
  ""
  "# Limpa destino (app é stateless) preservando _incoming/, e aplica novo conteúdo"
  "find '$RemoteAppDir' -mindepth 1 -maxdepth 1 ! -name '_incoming' -exec rm -rf {} +"
  "cp -a '$RemoteAppDir/_incoming/.' '$RemoteAppDir/'"
  "rm -rf '$RemoteAppDir/_incoming'"
  "chown -R marcusadm:marcusadm '$RemoteAppDir'"
)

# -----------------------------------------------------------------------------
# 4) Subir stack + healthcheck
# -----------------------------------------------------------------------------

Write-Host "==> Subindo stack (docker compose up -d --build)" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "cd '$RemoteAppDir'"
  "docker compose up -d --build --remove-orphans"
  "docker compose ps"
)

Write-Host "==> Health check (porta 5173)" -ForegroundColor Cyan
Invoke-Ssh "curl -fsS http://127.0.0.1:5173/ | head -n 1"

Write-Host ""
Write-Host "OK: xNormaliza publicado em http://192.168.1.235:5173" -ForegroundColor Green



