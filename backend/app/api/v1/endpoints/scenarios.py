from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User, Scenario, Simulation

router = APIRouter()

@router.get("/{simulation_id}/scenarios")
async def get_simulation_scenarios(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all scenarios for a simulation
    """
    # Verify user owns the simulation
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.owner_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    scenarios = db.query(Scenario).filter(
        Scenario.simulation_id == simulation_id
    ).all()
    
    return [
        {
            "id": str(scenario.id),
            "name": scenario.name,
            "description": scenario.description,
            "parameters": scenario.parameters,
            "results": scenario.results,
            "is_baseline": scenario.is_baseline,
            "created_at": scenario.created_at.isoformat(),
            "updated_at": scenario.updated_at.isoformat() if scenario.updated_at else None
        }
        for scenario in scenarios
    ]

@router.post("/{simulation_id}/scenarios")
async def create_scenario(
    simulation_id: UUID,
    scenario_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new scenario for a simulation
    """
    # Verify user owns the simulation
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.owner_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Create scenario
    scenario = Scenario(
        simulation_id=simulation_id,
        name=scenario_data.get("name", "New Scenario"),
        description=scenario_data.get("description"),
        parameters=scenario_data.get("parameters", {}),
        is_baseline=scenario_data.get("is_baseline", False)
    )
    
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    
    return {
        "id": str(scenario.id),
        "name": scenario.name,
        "description": scenario.description,
        "parameters": scenario.parameters,
        "is_baseline": scenario.is_baseline,
        "created_at": scenario.created_at.isoformat()
    }

@router.delete("/{simulation_id}/scenarios/{scenario_id}")
async def delete_scenario(
    simulation_id: UUID,
    scenario_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a scenario
    """
    # Verify user owns the simulation
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.owner_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Delete scenario
    scenario = db.query(Scenario).filter(
        Scenario.id == scenario_id,
        Scenario.simulation_id == simulation_id
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    db.delete(scenario)
    db.commit()
    
    return {"detail": "Scenario deleted successfully"}