param(
  [string]$Server = "marcusadm@192.168.1.235",
  [string]$LocalDb = "E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db",
  [string]$RemoteAppDir = "/opt/apps/xfinance",
  [switch]$GenerateEnvIfMissing = $true
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando '$Name' não encontrado no PATH."
  }
}

Require-Command "ssh"
Require-Command "scp"

if (-not (Test-Path -LiteralPath $LocalDb)) {
  throw "Banco local não encontrado: $LocalDb"
}

$sshOpts = @(
  "-o", "BatchMode=yes",
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ConnectTimeout=10"
)

$remoteDbDir = "$RemoteAppDir/x_db"
$remoteDb = "$remoteDbDir/xFinanceDB.db"
$remoteIncoming = "$remoteDbDir/xFinanceDB.db.incoming"
$remoteEnv = "$RemoteAppDir/.env"

Write-Host "==> Preparando diretórios no servidor ($Server)" -ForegroundColor Cyan
ssh @sshOpts $Server "mkdir -p '$remoteDbDir' && chown -R marcusadm:marcusadm '$remoteDbDir' && chmod 750 '$remoteDbDir'"

Write-Host "==> Enviando banco via SCP (sem sobrescrever destino final)" -ForegroundColor Cyan
scp @sshOpts -- $LocalDb "$Server`:$remoteIncoming"

Write-Host "==> Instalando banco no destino (somente se ainda não existir)" -ForegroundColor Cyan
ssh @sshOpts $Server "if [ -f '$remoteDb' ]; then echo 'DB já existe em $remoteDb (não sobrescrito). Mantive incoming em $remoteIncoming.'; exit 2; else mv '$remoteIncoming' '$remoteDb' && chown marcusadm:marcusadm '$remoteDb' && chmod 640 '$remoteDb'; fi"

if ($GenerateEnvIfMissing) {
  Write-Host "==> Garantindo .env (sem sobrescrever; gera SECRET_KEY se faltar)" -ForegroundColor Cyan
  # IMPORTANTE (PowerShell): `$(` é usado para evitar que o PS avalie $(...) localmente.
  ssh @sshOpts $Server @"
if [ ! -f '$remoteEnv' ]; then
  umask 077
  SECRET=`$(openssl rand -hex 32)
  printf 'XFINANCE_SECRET_KEY=%s\nXFINANCE_DEBUG=false\n' "`$SECRET" > '$remoteEnv'
  chown marcusadm:marcusadm '$remoteEnv'
  chmod 600 '$remoteEnv'
else
  echo '.env já existe (não sobrescrito).'
fi
"@
} else {
  Write-Host "==> Pulando criação do .env (GenerateEnvIfMissing=false)" -ForegroundColor Yellow
}

Write-Host "==> Subindo stack (docker compose up -d --build)" -ForegroundColor Cyan
ssh @sshOpts $Server "cd '$RemoteAppDir' && docker compose up -d --build && docker compose ps"

Write-Host "==> Health check" -ForegroundColor Cyan
ssh @sshOpts $Server "curl -fsS http://127.0.0.1:8080/api/health"

Write-Host ""
Write-Host "OK: xFinance publicado em http://192.168.1.235:8080" -ForegroundColor Green


