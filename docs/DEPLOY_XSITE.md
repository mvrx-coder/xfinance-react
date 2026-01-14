# Deploy do x_site (Docker Compose) — padrão `/opt/apps/xsite`

Este guia segue o padrão do seu servidor (headless, SSH por chave, sem Git/GitHub no servidor).

## Premissas

- Porta do x_site na LAN: **8090**
- Fonte da verdade (Windows): `E:\MVRX\Financeiro\xFinance_3.0\x_site`
- Destino no servidor: `/opt/apps/xsite`

## Arquivos do deploy

No `x_site` (o próprio projeto):
- `Dockerfile`
- `compose.yml`
- `.dockerignore`

No `x_finan` (scripts e docs centralizados):
- `scripts/deploy_xsite_copy.ps1`
- `docs/DEPLOY_XSITE.md`

## Deploy (Windows → servidor)

No Windows PowerShell:

```powershell
cd E:\MVRX\Financeiro\xFinance_3.0\x_finan
.\scripts\deploy_xsite_copy.ps1 `
  -Server "marcusadm@192.168.1.235" `
  -LocalAppDir "E:\MVRX\Financeiro\xFinance_3.0\x_site" `
  -RemoteAppDir "/opt/apps/xsite"
```

## Validação

No servidor:

```bash
cd /opt/apps/xsite
docker compose ps
docker compose logs -f --tail=200
```

URL na LAN:
- `http://192.168.1.235:8090`

