from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.user import User
from app.services.simulation_service import SimulationService

router = APIRouter()

@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics for the current user's simulations
    """
    simulation_service = SimulationService(db)
    stats = await simulation_service.get_user_simulation_stats(current_user.id)
    return stats