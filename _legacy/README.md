# 📦 Código Legado (Arquivado)

> **Esta pasta contém código que NÃO está mais em uso no xFinance 3.0**

## Conteúdo

### `/server/` - Backend Express (não usado)
- **Motivo:** Migrado para FastAPI em `/backend/`
- **Arquivado em:** 26/12/2024
- **Arquivos:**
  - `index.ts` - Entrada do Express
  - `routes.ts` - Rotas API (mortas)
  - `storage.ts` - Storage in-memory
  - `static.ts` - Servidor de arquivos estáticos
  - `vite.ts` - Integração Vite-Express

### `/script/` - Scripts de build do Express
- **Motivo:** Não aplicável ao novo sistema
- **Arquivado em:** 26/12/2024
- **Arquivos:**
  - `build.ts` - Build esbuild para o Express

### `drizzle.config.ts` - Configuração Drizzle ORM
- **Motivo:** Drizzle não conecta ao SQLite do xFinance
- **Arquivado em:** 26/12/2024

### `start_dev.ps1` - Script antigo de inicialização
- **Motivo:** Substituído por `scripts/start.ps1`
- **Arquivado em:** 26/12/2024

## ⚠️ Aviso

**NÃO use estes arquivos.** Eles estão aqui apenas para referência histórica.

O sistema atual usa:
- **Backend:** FastAPI em `/backend/`
- **Frontend:** Vite + React em `/client/`
- **Inicialização:** `start.bat` ou `scripts/start.ps1`

