from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging

from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.simulation import (
    SimulationCreate,
    SimulationUpdate,
    SimulationResponse,
    SimulationStatus,
    SimulationListResponse
)
from app.schemas.user import User
from app.services.simulation_service import SimulationService
from app.services.model_runner import ModelRunner

logger = logging.getLogger(__name__)
router = APIRouter()

async def run_simulation_background(simulation_id: UUID, db: Session):
    """
    Background task to run simulation and generate results
    """
    try:
        simulation_service = SimulationService(db)
        
        # Update simulation status to running
        from app.schemas.simulation import SimulationStatus as SimulationStatusEnum
        await simulation_service.update_simulation_status(simulation_id, SimulationStatusEnum.RUNNING)
        
        # Simulate processing time (in real implementation, this would run the actual model)
        import asyncio
        await asyncio.sleep(5)  # Simulate 5 seconds of processing
        
        # Generate sample results for the new simulation
        from datetime import datetime, timedelta
        import uuid
        import numpy as np
        from app.models.models import SimulationResult
        
        # Get the simulation
        from app.models.models import Simulation
        simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if not simulation:
            logger.error(f"Simulation {simulation_id} not found")
            return
            
        # Generate realistic sample results
        start_date = simulation.start_date
        end_date = simulation.end_date
        
        # Calculate number of days
        days = (end_date - start_date).days + 1
        dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]
        
        # Generate realistic data
        precipitation = [max(0, np.random.gamma(2, 3)) for _ in range(days)]
        runoff = [max(0, p * 0.35 + np.random.normal(0, 0.5)) for p in precipitation]
        evapotranspiration = [max(0, p * 0.4 + np.random.normal(2, 0.5)) for p in precipitation]
        infiltration = [max(0, p - r - et) for p, r, et in zip(precipitation, runoff, evapotranspiration)]
        temperature = [20 + np.random.normal(0, 5) for _ in range(days)]
        
        # Create daily results
        daily_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=simulation_id,
            result_type="daily_results",
            data={
                "dates": dates,
                "precipitation": [round(x, 2) for x in precipitation],
                "runoff": [round(x, 2) for x in runoff],
                "evapotranspiration": [round(x, 2) for x in evapotranspiration],
                "infiltration": [round(x, 2) for x in infiltration],
                "temperature": [round(x, 1) for x in temperature]
            }
        )
        db.add(daily_result)
        
        # Create annual summary
        annual_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=simulation_id,
            result_type="annual_results",
            data={
                "total_precipitation": round(sum(precipitation), 2),
                "total_evapotranspiration": round(sum(evapotranspiration), 2),
                "total_runoff": round(sum(runoff), 2),
                "total_infiltration": round(sum(infiltration), 2),
                "mean_temperature": round(sum(temperature) / len(temperature), 2),
                "water_balance_error": 0.02,
                "runoff_coefficient": round(sum(runoff) / sum(precipitation) if sum(precipitation) > 0 else 0, 3)
            }
        )
        db.add(annual_result)
        
        # Update simulation status to completed
        await simulation_service.update_simulation_status(simulation_id, SimulationStatusEnum.COMPLETED, progress=100.0)
        
        db.commit()
        logger.info(f"Simulation {simulation_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error running simulation {simulation_id}: {str(e)}")
        # Update simulation status to failed
        await simulation_service.update_simulation_status(simulation_id, SimulationStatusEnum.FAILED, error_message=str(e))
        db.rollback()

@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    simulation: SimulationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new simulation with configuration parameters
    """
    try:
        simulation_service = SimulationService(db)
        new_simulation = await simulation_service.create_simulation(
            simulation_data=simulation,
            user_id=current_user.id
        )
        
        # Start simulation in background
        background_tasks.add_task(
            run_simulation_background,
            simulation_id=new_simulation.id,
            db=db
        )
        
        return new_simulation
    except Exception as e:
        logger.error(f"Error creating simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create simulation: {str(e)}"
        )

@router.get("/", response_model=SimulationListResponse)
async def list_simulations(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[SimulationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all simulations for the current user
    """
    simulation_service = SimulationService(db)
    simulations = await simulation_service.get_user_simulations(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status_filter=status_filter
    )
    
    total = await simulation_service.count_user_simulations(
        user_id=current_user.id,
        status_filter=status_filter
    )
    
    return SimulationListResponse(
        simulations=simulations,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get simulation details by ID
    """
    simulation_service = SimulationService(db)
    simulation = await simulation_service.get_simulation(
        simulation_id=simulation_id,
        user_id=current_user.id
    )
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    return simulation

@router.put("/{simulation_id}", response_model=SimulationResponse)
async def update_simulation(
    simulation_id: UUID,
    simulation_update: SimulationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update simulation configuration
    """
    simulation_service = SimulationService(db)
    simulation = await simulation_service.update_simulation(
        simulation_id=simulation_id,
        simulation_data=simulation_update,
        user_id=current_user.id
    )
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    return simulation

@router.delete("/{simulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_simulation(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a simulation and its results
    """
    simulation_service = SimulationService(db)
    success = await simulation_service.delete_simulation(
        simulation_id=simulation_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )

@router.post("/{simulation_id}/run", response_model=Dict[str, str])
async def run_simulation(
    simulation_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start or restart a simulation
    """
    simulation_service = SimulationService(db)
    simulation = await simulation_service.get_simulation(
        simulation_id=simulation_id,
        user_id=current_user.id
    )
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    if simulation.status == SimulationStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Simulation is already running"
        )
    
    # Update status to running
    await simulation_service.update_simulation_status(
        simulation_id=simulation_id,
        status=SimulationStatus.RUNNING
    )
    
    # Start simulation in background
    background_tasks.add_task(
        run_simulation_background,
        simulation_id=simulation_id,
        db=db
    )
    
    return {"message": "Simulation started", "simulation_id": str(simulation_id)}

@router.post("/{simulation_id}/stop", response_model=Dict[str, str])
async def stop_simulation(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Stop a running simulation
    """
    simulation_service = SimulationService(db)
    simulation = await simulation_service.get_simulation(
        simulation_id=simulation_id,
        user_id=current_user.id
    )
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    if simulation.status != SimulationStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Simulation is not running"
        )
    
    # Update status to cancelled
    await simulation_service.update_simulation_status(
        simulation_id=simulation_id,
        status=SimulationStatus.CANCELLED
    )
    
    return {"message": "Simulation stopped", "simulation_id": str(simulation_id)}

