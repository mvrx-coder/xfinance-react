# Deploy do xFinance (Docker Compose) — padrão `/opt/apps/xfinance`

Este guia segue os seus padrões operacionais:
- Servidor headless (sem GUI)
- Deploy via Docker Compose dentro de `/opt/apps/<app>`
- Sem mexer em firewall/rede
- Sem apagar volumes/dados (nunca usar `down -v` sem comando explícito)

## Pré-requisitos no servidor

- Docker Engine + Docker Compose plugin instalados (você já tem)
- Porta 8080 livre (o stack publica `8080 -> 80`)

## Estrutura no servidor

Padrão sugerido:

- `/opt/apps/xfinance` (repo)
- `/opt/apps/xfinance/x_db/xFinanceDB.db` (banco SQLite)
- `/opt/apps/xfinance/.env` (segredos/variáveis)

## 1) Preparar o banco (UMA vez)

Coloque o arquivo do banco em:

- `/opt/apps/xfinance/x_db/xFinanceDB.db`

Obs.: a pasta `x_db/` **não deve ser versionada no Git** e o backend escreve no banco (ex.: updates de workflow), então `x_db/` precisa ser **gravável**.

## 2) Criar `.env` (UMA vez)

Crie `/opt/apps/xfinance/.env` com pelo menos:

```env
# Obrigatório em produção (LAN ou não)
XFINANCE_SECRET_KEY=troque-por-um-segredo-grande-e-unico

# Opcional (default: false)
XFINANCE_DEBUG=false
```

## 3) Subir o stack (primeiro deploy)

Dentro de `/opt/apps/xfinance`:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=200
```

Healthcheck:

```bash
curl -fsS http://127.0.0.1:8080/api/health
```

Acesso na LAN:

- `http://192.168.1.235:8080`

## Deploy sem Git/GitHub (copiando do diretório local)

Se a fonte da verdade é o diretório local (Windows) e você **não quer Git/GitHub** no servidor, use o script:

- `scripts/deploy_server_copy.ps1`

Ele:
- Cria `x_db/` no servidor se não existir
- Copia `xFinanceDB.db` **somente se não existir** (nunca sobrescreve automaticamente)
- Copia o código do app para `/opt/apps/xfinance` (exclui `x_db/` e `.env`)
- Sobe `docker compose up -d --build` e valida `/api/health`

Exemplo (Windows/PowerShell):

```powershell
cd E:\MVRX\Financeiro\xFinance_3.0\x_finan
.\scripts\deploy_server_copy.ps1 `
  -Server "marcusadm@192.168.1.235" `
  -LocalAppDir "E:\MVRX\Financeiro\xFinance_3.0\x_finan" `
  -LocalDb "E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db" `
  -RemoteAppDir "/opt/apps/xfinance"
```

## 4) Deploys futuros (script)

Os scripts ficam em `scripts/` (no repo) e devem ser executados do servidor.

Marque como executáveis (uma vez):

```bash
chmod +x scripts/*.sh
```

Deploy:

```bash
./scripts/deploy.sh
```

Notas de segurança do `deploy.sh`:
- Cria `x_db/` automaticamente se não existir
- **Não cria / não sobrescreve / não apaga** `x_db/xFinanceDB.db`
- Interrompe o deploy se `./.env` não existir ou se `XFINANCE_SECRET_KEY` não estiver definido

Status:

```bash
./scripts/status.sh
```

Logs:

```bash
./scripts/logs.sh
```

Parar (sem apagar dados):

```bash
./scripts/down.sh
```


