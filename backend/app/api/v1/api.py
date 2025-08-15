from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    simulations,
    models,
    scenarios,
    results,
    stats,
    data_import,
    llm_analysis
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
api_router.include_router(stats.router, prefix="/simulations", tags=["statistics"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["scenarios"])
api_router.include_router(results.router, prefix="/results", tags=["results"])
api_router.include_router(data_import.router, prefix="/data-import", tags=["data-import"])
api_router.include_router(llm_analysis.router, prefix="/llm", tags=["llm-analysis"])