from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Optional
import logging

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models import models
from app.api.v1.api import api_router
from app.core.auth import get_current_user
from app.schemas.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MHIA API server...")
    models.Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down MHIA API server...")

app = FastAPI(
    title="MHIA - Hydrological Modeling API",
    description="API for the Integrated Hydrological Model for the Anthropocene",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MHIA API"}

@app.get("/")
async def root():
    return {
        "message": "MHIA - Integrated Hydrological Model for the Anthropocene API",
        "version": "1.0.0",
        "docs": "/api/v1/docs"
    }

app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )