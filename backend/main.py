"""
xFinance API - FastAPI Backend

Entry point do backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings, resolve_sqlite_path
from routers import auth, inspections, acoes, lookups

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# =============================================================================
# LIFESPAN (startup/shutdown)
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação."""
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 Iniciando xFinance API v%s", settings.APP_VERSION)
    
    try:
        db_path = resolve_sqlite_path()
        logger.info("📂 Banco de dados: %s", db_path)
    except FileNotFoundError as e:
        logger.error("❌ Banco de dados não encontrado: %s", e)
        raise
    
    logger.info("✅ API pronta para receber requisições")
    logger.info("=" * 60)
    
    yield
    
    # Shutdown
    logger.info("🛑 Encerrando xFinance API")


# =============================================================================
# APLICAÇÃO
# =============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API do sistema xFinance - Controle Financeiro",
    lifespan=lifespan,
)


# =============================================================================
# MIDDLEWARE
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# ROUTERS
# =============================================================================

app.include_router(auth.router)
app.include_router(inspections.router, prefix="/api/inspections", tags=["Inspections"])
app.include_router(acoes.router, prefix="/api/acoes", tags=["Ações"])
app.include_router(lookups.router, prefix="/api/lookups", tags=["Lookups"])


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/api/health")
def health_check():
    """Endpoint de health check."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
def root():
    """Rota raiz - redireciona para docs."""
    return {
        "message": "xFinance API",
        "docs": "/docs",
        "health": "/api/health",
    }


# =============================================================================
# DESENVOLVIMENTO
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )

