"""
LLM Analysis API endpoints
Generates expert consultant reports using Anthropic Claude
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from uuid import UUID
import logging

from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.user import User
from app.services.simulation_service import SimulationService
from app.services.llm_analysis_service import LLMAnalysisService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/simulations/{simulation_id}/consultant-analysis", response_model=Dict[str, Any])
async def generate_consultant_analysis(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate LLM-powered consultant analysis for a simulation
    """
    try:
        simulation_service = SimulationService(db)
        llm_service = LLMAnalysisService()
        
        # Get simulation details
        simulation = await simulation_service.get_simulation(
            simulation_id=simulation_id,
            user_id=current_user.id
        )
        
        if not simulation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulation not found"
            )
        
        # Get simulation results
        results = await simulation_service.get_simulation_results(
            simulation_id=simulation_id,
            user_id=current_user.id
        )
        
        if not results:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No results available for this simulation. Run the simulation first."
            )
        
        # Convert simulation to dict for LLM processing
        simulation_dict = {
            "id": str(simulation.id),
            "name": simulation.name,
            "description": simulation.description,
            "model_type": simulation.model_type,
            "time_step": simulation.time_step,
            "start_date": simulation.start_date.isoformat() if simulation.start_date else None,
            "end_date": simulation.end_date.isoformat() if simulation.end_date else None,
            "status": simulation.status,
            "created_at": simulation.created_at.isoformat() if simulation.created_at else None,
            "physical_config": simulation.configuration.get("physical_config") if simulation.configuration else {},
            "socio_config": simulation.configuration.get("socio_config") if simulation.configuration else {},
            "aquifer_config": simulation.configuration.get("aquifer_config") if simulation.configuration else {}
        }
        
        # Generate LLM analysis
        logger.info(f"Generating LLM analysis for simulation {simulation_id}")
        analysis = await llm_service.generate_consultant_analysis(
            simulation_data=simulation_dict,
            results_data=results
        )
        
        # Add metadata
        analysis["simulation_id"] = str(simulation_id)
        analysis["simulation_name"] = simulation.name
        analysis["generated_for_user"] = current_user.username
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating consultant analysis for simulation {simulation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate consultant analysis: {str(e)}"
        )

@router.get("/simulations/{simulation_id}/consultant-analysis/cached", response_model=Dict[str, Any])
async def get_cached_consultant_analysis(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get previously cached consultant analysis (if available)
    This endpoint can be extended to store/retrieve cached analyses from database
    """
    # For now, this just redirects to generate new analysis
    # In production, you might want to cache analyses in database or Redis
    return await generate_consultant_analysis(simulation_id, db, current_user)

@router.get("/llm/status")
async def get_llm_status():
    """
    Check LLM service availability
    """
    try:
        llm_service = LLMAnalysisService()
        
        # Check if API key is available
        has_api_key = bool(llm_service.api_key)
        
        return {
            "llm_available": has_api_key,
            "provider": "Anthropic Claude",
            "model": "claude-3-sonnet-20240229" if has_api_key else None,
            "fallback_available": True,
            "status": "ready" if has_api_key else "api_key_missing"
        }
        
    except Exception as e:
        logger.error(f"Error checking LLM status: {str(e)}")
        return {
            "llm_available": False,
            "provider": "Anthropic Claude",
            "model": None,
            "fallback_available": True,
            "status": "error",
            "error": str(e)
        }