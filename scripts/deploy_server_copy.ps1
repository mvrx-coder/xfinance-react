param(
  [string]$Server = "marcusadm@192.168.1.235",
  [string]$LocalAppDir = "E:\MVRX\Financeiro\xFinance_3.0\x_finan",
  [string]$LocalDb = "E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db",
  [string]$RemoteAppDir = "/opt/apps/xfinance",
  [switch]$GenerateEnvIfMissing = $true
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

function Invoke-Ssh([string]$Cmd) {
  & ssh @sshOpts $Server $Cmd
}

function Invoke-SshScript([string[]]$Lines) {
  # Envia conteúdo com LF puro (evita CRLF -> $'\r' no bash)
  # Usa arquivo temporário com encoding Unix e leitura binária
  $tempScript = [System.IO.Path]::GetTempFileName()
  try {
    $content = ($Lines -join "`n") + "`n"
    [System.IO.File]::WriteAllText($tempScript, $content, [System.Text.UTF8Encoding]::new($false))
    # Usar cmd /c com redirecionamento para evitar conversão CRLF do PowerShell
    & cmd /c "type `"$tempScript`" | ssh $($sshOpts -join ' ') $Server `"bash -s`""
  } finally {
    if (Test-Path $tempScript) { Remove-Item -Force $tempScript }
  }
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando '$Name' não encontrado no PATH."
  }
}

Require-Command "ssh"
Require-Command "scp"
Require-Command "tar"

if (-not (Test-Path -LiteralPath $LocalAppDir)) {
  throw "Diretório local do app não encontrado: $LocalAppDir"
}

$sshOpts = @(
  "-o", "BatchMode=yes",
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ConnectTimeout=10"
)

$remoteDbDir = "$RemoteAppDir/x_db"
$remoteDb = "$remoteDbDir/xFinanceDB.db"
$remoteIncomingDb = "$remoteDbDir/xFinanceDB.db.incoming"
$remoteEnv = "$RemoteAppDir/.env"

# -----------------------------------------------------------------------------
# 1) Preparar diretórios persistentes no servidor
# -----------------------------------------------------------------------------

Write-Host "==> Preparando diretórios no servidor ($Server)" -ForegroundColor Cyan
Invoke-Ssh "mkdir -p '$RemoteAppDir' '$remoteDbDir' && chown -R marcusadm:marcusadm '$RemoteAppDir' && chmod 750 '$remoteDbDir'"

# -----------------------------------------------------------------------------
# 2) Enviar banco SOMENTE se não existir
# -----------------------------------------------------------------------------

if (-not (Test-Path -LiteralPath $LocalDb)) {
  throw "Banco local não encontrado: $LocalDb"
}

Write-Host "==> Verificando se o DB já existe no servidor (não sobrescrever)" -ForegroundColor Cyan
try {
  Invoke-Ssh "test -f '$remoteDb'"
  Write-Host "==> DB já existe no servidor. Pulando upload." -ForegroundColor Green
} catch {
  Write-Host "==> DB não existe no servidor. Enviando via SCP..." -ForegroundColor Cyan
  & scp @sshOpts -- $LocalDb "$Server`:$remoteIncomingDb"
  Write-Host "==> Instalando DB no destino (sem sobrescrever)" -ForegroundColor Cyan
  Invoke-Ssh "if [ -f '$remoteDb' ]; then echo 'DB já existe (não sobrescrito). Mantive incoming em $remoteIncomingDb.'; exit 2; else mv '$remoteIncomingDb' '$remoteDb' && chown marcusadm:marcusadm '$remoteDb' && chmod 640 '$remoteDb'; fi"
}

# -----------------------------------------------------------------------------
# 3) Garantir .env (sem sobrescrever) - opcional
# -----------------------------------------------------------------------------

if ($GenerateEnvIfMissing) {
  Write-Host "==> Garantindo .env (sem sobrescrever; gera SECRET_KEY se faltar)" -ForegroundColor Cyan
  Invoke-SshScript @(
    "set -euo pipefail"
    "if [ ! -f '$remoteEnv' ]; then"
    "  umask 077"
    "  SECRET=`$(openssl rand -hex 32)"
    "  printf 'XFINANCE_SECRET_KEY=%s\nXFINANCE_DEBUG=false\n' ""`$SECRET"" > '$remoteEnv'"
    "  chown marcusadm:marcusadm '$remoteEnv'"
    "  chmod 600 '$remoteEnv'"
    "else"
    "  echo '.env já existe (não sobrescrito).'"
    "fi"
  )
} else {
  Write-Host "==> Pulando criação do .env (GenerateEnvIfMissing=false)" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 4) Empacotar e enviar código do app (sem Git/GitHub)
#    - NÃO envia x_db/ nem .env (persistentes no servidor)
# -----------------------------------------------------------------------------

$bundle = Join-Path $env:TEMP "xfinance_bundle.tgz"
if (Test-Path -LiteralPath $bundle) {
  Remove-Item -Force -LiteralPath $bundle
}

Write-Host "==> Criando bundle local (tar.gz)..." -ForegroundColor Cyan
& tar -czf $bundle `
  --exclude="./x_db" `
  --exclude="./.env" `
  --exclude="./node_modules" `
  --exclude="./client/node_modules" `
  --exclude="node_modules" `
  --exclude="*/node_modules" `
  --exclude="*/node_modules/*" `
  --exclude="./dist" `
  --exclude="./.git" `
  --exclude="./.venv" `
  --exclude="./terminals" `
  -C $LocalAppDir .

$remoteTmpBundle = "/tmp/xfinance_bundle.tgz"
Write-Host "==> Enviando bundle via SCP..." -ForegroundColor Cyan
& scp @sshOpts -- $bundle "$Server`:$remoteTmpBundle"

Write-Host "==> Aplicando bundle no servidor (preservando x_db/ e .env)" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "mkdir -p '$RemoteAppDir/_incoming'"
  "tar -xzf '$remoteTmpBundle' -C '$RemoteAppDir/_incoming'"
  "rm -f '$remoteTmpBundle'"
  ""
  "# Remove tudo exceto x_db/ e .env, depois aplica novo conteúdo"
  "find '$RemoteAppDir' -mindepth 1 -maxdepth 1 ! -name 'x_db' ! -name '.env' ! -name '_incoming' -exec rm -rf {} +"
  "cp -a '$RemoteAppDir/_incoming/.' '$RemoteAppDir/'"
  "rm -rf '$RemoteAppDir/_incoming'"
  "chown -R marcusadm:marcusadm '$RemoteAppDir'"
)

# -----------------------------------------------------------------------------
# 5) Subir stack + healthcheck
# -----------------------------------------------------------------------------

Write-Host "==> Subindo stack (docker compose up -d --build)" -ForegroundColor Cyan
Invoke-SshScript @(
  "set -euo pipefail"
  "cd '$RemoteAppDir'"
  'SERVICES=$(docker compose config --services)'
  'echo "==> Services:"'
  'echo "$SERVICES"'
  'echo "$SERVICES" | grep -qx "api"'
  'echo "$SERVICES" | grep -qx "web"'
  "docker compose up -d --build --remove-orphans"
  "docker compose ps"
)

Write-Host "==> Health check" -ForegroundColor Cyan
Invoke-Ssh "curl -fsS http://127.0.0.1:8080/api/health"

Write-Host ""
Write-Host "OK: xFinance publicado em http://192.168.1.235:8080" -ForegroundColor Green


