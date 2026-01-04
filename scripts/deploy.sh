#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> xFinance | deploy"

# -----------------------------------------------------------------------------
# Pré-checks (segurança / layout)
# -----------------------------------------------------------------------------

# Layout obrigatório: ./x_db/xFinanceDB.db (não versionado)
mkdir -p "x_db"

if [ ! -f "x_db/xFinanceDB.db" ]; then
  cat <<'EOF'
ERRO: Banco SQLite não encontrado.

Esperado em: ./x_db/xFinanceDB.db

Ações:
- Crie a pasta (se necessário): mkdir -p x_db
- Copie o banco para: x_db/xFinanceDB.db

IMPORTANTE:
- Este script NÃO cria, NÃO sobrescreve e NÃO apaga xFinanceDB.db.
EOF
  exit 1
fi

# .env (segredos) - não versionado
if [ ! -f ".env" ]; then
  cat <<'EOF'
ERRO: Arquivo .env não encontrado.

Crie ./\.env com pelo menos:

XFINANCE_SECRET_KEY=coloque-um-segredo-forte
XFINANCE_DEBUG=false

IMPORTANTE:
- O deploy foi interrompido para evitar subir com SECRET_KEY padrão.
EOF
  exit 1
fi

if ! grep -qE '^XFINANCE_SECRET_KEY=.+$' ".env"; then
  cat <<'EOF'
ERRO: XFINANCE_SECRET_KEY ausente no .env.

Adicione no .env:
XFINANCE_SECRET_KEY=coloque-um-segredo-forte

IMPORTANTE:
- O deploy foi interrompido para evitar subir com SECRET_KEY padrão.
EOF
  exit 1
fi

if command -v git >/dev/null 2>&1 && [ -d ".git" ]; then
  echo "==> Atualizando código (git pull --ff-only)"
  git pull --ff-only
fi

echo "==> Build (docker compose build --pull)"
docker compose build --pull

echo "==> Subindo stack (docker compose up -d)"
docker compose up -d --remove-orphans

echo "==> Status"
docker compose ps

if command -v curl >/dev/null 2>&1; then
  echo "==> Health check (http://127.0.0.1:8080/api/health)"
  curl -fsS "http://127.0.0.1:8080/api/health" | cat
  echo ""
fi


