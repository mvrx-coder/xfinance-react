#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# IMPORTANTE: sem "-v" (não apaga volumes/dados)
docker compose down


