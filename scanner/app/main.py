import logging
from fastapi import FastAPI

from app.core.config import settings
from app.api.endpoints import router as api_router

# Logging Setup
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(title=settings.APP_NAME)

# Incluimos las rutas
app.include_router(api_router)
