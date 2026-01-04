# Deploy do x_normaliza (Docker Compose) — padrão `/opt/apps/xnormaliza`

Este guia segue o mesmo padrão operacional do servidor (headless, SSH por chave, sem Git/GitHub no servidor).

## Premissas (conforme sua decisão)

- O x_normaliza opera **direto** no banco de produção do xFinance:
  - `/opt/apps/xfinance/x_db/xFinanceDB.db`
- Porta do x_normaliza na LAN: **5173**
- Deploy por cópia do diretório local (Windows) para o servidor:
  - Fonte da verdade: `E:\MVRX\Financeiro\xFinance_3.0\x_normaliza`
  - Destino: `/opt/apps/xnormaliza`

## Pré-checks no servidor (uma vez)

Verifique se a porta 5173 está livre:

```bash
sudo ss -ltnp | grep :5173 || true
```

Confirme permissões do DB (precisa ser gravável para UID 1000):

```bash
id marcusadm
ls -la /opt/apps/xfinance/x_db/xFinanceDB.db
```

## Deploy (Windows → servidor)

No Windows PowerShell:

```powershell
cd E:\MVRX\Financeiro\xFinance_3.0\x_finan
.\scripts\deploy_xnormaliza_copy.ps1 `
  -Server "marcusadm@192.168.1.235" `
  -LocalAppDir "E:\MVRX\Financeiro\xFinance_3.0\x_normaliza" `
  -RemoteAppDir "/opt/apps/xnormaliza"
```

## Operação no servidor

```bash
cd /opt/apps/xnormaliza
docker compose ps
docker compose logs -f --tail=200
```

URL na LAN:
- `http://192.168.1.235:5173`



