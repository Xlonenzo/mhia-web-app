from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import pandas as pd
import io
import json

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User, Simulation, SimulationResult
from app.services.simulation_service import SimulationService

router = APIRouter()

@router.get("/{simulation_id}")
async def get_simulation_results(
    simulation_id: UUID,
    result_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get simulation results
    """
    simulation_service = SimulationService(db)
    results = await simulation_service.get_simulation_results(
        simulation_id=simulation_id,
        user_id=current_user.id,
        result_type=result_type
    )
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No results found for this simulation"
        )
    
    return results

@router.get("/{simulation_id}/export/{format}")
async def export_simulation_results(
    simulation_id: UUID,
    format: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export simulation results in different formats
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
    
    # Get all results
    results = db.query(SimulationResult).filter(
        SimulationResult.simulation_id == simulation_id
    ).all()
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No results found for this simulation"
        )
    
    if format.lower() == "csv":
        # Export as CSV
        output = io.StringIO()
        
        for result in results:
            if result.result_type in ["daily_results", "monthly_results", "annual_results"]:
                df = pd.DataFrame(result.data)
                df.to_csv(output, index=False)
                output.write("\n\n")
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=simulation_{simulation_id}_results.csv"
            }
        )
    
    elif format.lower() == "json":
        # Export as JSON
        all_results = {
            result.result_type: result.data
            for result in results
        }
        
        return Response(
            content=json.dumps(all_results, indent=2),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=simulation_{simulation_id}_results.json"
            }
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Export format '{format}' not supported. Use 'csv' or 'json'."
        )

@router.get("/{simulation_id}/summary")
async def get_simulation_summary(
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a summary of simulation results
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
    
    # Get results
    results = db.query(SimulationResult).filter(
        SimulationResult.simulation_id == simulation_id
    ).all()
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No results found for this simulation"
        )
    
    # Build summary
    summary = {
        "simulation_id": str(simulation_id),
        "simulation_name": simulation.name,
        "status": simulation.status.value,
        "model_type": simulation.model_type.value,
        "time_period": {
            "start": simulation.start_date.isoformat(),
            "end": simulation.end_date.isoformat()
        },
        "results_available": [result.result_type for result in results],
        "key_metrics": {}
    }
    
    # Extract key metrics from results
    for result in results:
        if result.result_type == "annual_results" and isinstance(result.data, dict):
            summary["key_metrics"]["annual"] = {
                "total_precipitation": result.data.get("total_precipitation"),
                "total_evapotranspiration": result.data.get("total_evapotranspiration"),
                "total_runoff": result.data.get("total_runoff"),
                "water_balance_error": result.data.get("water_balance_error")
            }
        elif result.result_type == "indicators" and isinstance(result.data, dict):
            summary["key_metrics"]["indicators"] = result.data
    
    return summary