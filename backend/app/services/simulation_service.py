from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime

from app.models.models import Simulation, SimulationResult, User, SimulationStatus
from app.schemas.simulation import (
    SimulationCreate, 
    SimulationUpdate, 
    SimulationResponse,
    SimulationStatus as SimulationStatusEnum
)

logger = logging.getLogger(__name__)

class SimulationService:
    """
    Service layer for simulation management
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_simulation(self, simulation_data: SimulationCreate, user_id: UUID) -> SimulationResponse:
        """
        Create a new simulation
        """
        try:
            # Convert Pydantic model to dict for database storage
            # Use json_encoders to handle datetime objects
            config_dict = simulation_data.dict()
            
            # Convert datetime objects to ISO format strings for JSON serialization
            def convert_datetimes(obj):
                if isinstance(obj, dict):
                    return {k: convert_datetimes(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_datetimes(item) for item in obj]
                elif isinstance(obj, datetime):
                    return obj.isoformat()
                return obj
            
            config_dict = convert_datetimes(config_dict)
            
            db_simulation = Simulation(
                name=simulation_data.name,
                description=simulation_data.description,
                model_type=simulation_data.model_type.value.upper(),
                time_step=simulation_data.time_step.value.upper(),
                start_date=simulation_data.start_date,
                end_date=simulation_data.end_date,
                configuration=config_dict,
                owner_id=user_id,
                status=SimulationStatus.PENDING
            )
            
            self.db.add(db_simulation)
            self.db.commit()
            self.db.refresh(db_simulation)
            
            logger.info(f"Created simulation {db_simulation.id} for user {user_id}")
            
            return SimulationResponse.from_orm(db_simulation)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating simulation: {str(e)}")
            raise
    
    async def get_simulation(self, simulation_id: UUID, user_id: UUID) -> Optional[SimulationResponse]:
        """
        Get a simulation by ID for a specific user
        """
        simulation = self.db.query(Simulation).filter(
            and_(
                Simulation.id == simulation_id,
                Simulation.owner_id == user_id
            )
        ).first()
        
        if simulation:
            return SimulationResponse.from_orm(simulation)
        return None
    
    async def get_simulation_by_id(self, simulation_id: UUID) -> Optional[Simulation]:
        """
        Get a simulation by ID (without user restriction) - for internal use
        """
        return self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
    
    async def get_user_simulations(
        self, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100,
        status_filter: Optional[SimulationStatusEnum] = None
    ) -> List[SimulationResponse]:
        """
        Get all simulations for a user with optional filtering
        """
        query = self.db.query(Simulation).filter(Simulation.owner_id == user_id)
        
        if status_filter:
            query = query.filter(Simulation.status == status_filter.value)
        
        simulations = query.order_by(Simulation.created_at.desc()).offset(skip).limit(limit).all()
        
        return [SimulationResponse.from_orm(sim) for sim in simulations]
    
    async def count_user_simulations(
        self, 
        user_id: UUID,
        status_filter: Optional[SimulationStatusEnum] = None
    ) -> int:
        """
        Count total simulations for a user
        """
        query = self.db.query(func.count(Simulation.id)).filter(Simulation.owner_id == user_id)
        
        if status_filter:
            query = query.filter(Simulation.status == status_filter.value)
        
        return query.scalar()
    
    async def update_simulation(
        self, 
        simulation_id: UUID, 
        simulation_data: SimulationUpdate, 
        user_id: UUID
    ) -> Optional[SimulationResponse]:
        """
        Update a simulation
        """
        try:
            simulation = self.db.query(Simulation).filter(
                and_(
                    Simulation.id == simulation_id,
                    Simulation.owner_id == user_id
                )
            ).first()
            
            if not simulation:
                return None
            
            # Update fields that are provided
            update_data = simulation_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(simulation, field, value)
            
            simulation.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(simulation)
            
            logger.info(f"Updated simulation {simulation_id}")
            
            return SimulationResponse.from_orm(simulation)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating simulation {simulation_id}: {str(e)}")
            raise
    
    
    async def delete_simulation(self, simulation_id: UUID, user_id: UUID) -> bool:
        """
        Delete a simulation and its results
        """
        try:
            simulation = self.db.query(Simulation).filter(
                and_(
                    Simulation.id == simulation_id,
                    Simulation.owner_id == user_id
                )
            ).first()
            
            if not simulation:
                return False
            
            # Delete associated results first (cascade should handle this, but explicit is better)
            self.db.query(SimulationResult).filter(
                SimulationResult.simulation_id == simulation_id
            ).delete()
            
            # Delete the simulation
            self.db.delete(simulation)
            self.db.commit()
            
            logger.info(f"Deleted simulation {simulation_id}")
            
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting simulation {simulation_id}: {str(e)}")
            raise
    
    async def update_simulation_status(
        self, 
        simulation_id: UUID, 
        status: SimulationStatusEnum,
        error_message: Optional[str] = None,
        progress: Optional[float] = None
    ) -> bool:
        """
        Update simulation status
        """
        try:
            simulation = self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
            
            if not simulation:
                return False
            
            simulation.status = status.value.upper()
            simulation.updated_at = datetime.utcnow()
            
            if error_message:
                simulation.error_message = error_message
            
            if progress is not None:
                simulation.progress = progress
            
            if status == SimulationStatusEnum.COMPLETED:
                simulation.completed_at = datetime.utcnow()
                simulation.progress = 100.0
            elif status == SimulationStatusEnum.RUNNING:
                simulation.completed_at = None
                simulation.error_message = None
            
            self.db.commit()
            
            logger.info(f"Updated simulation {simulation_id} status to {status.value}")
            
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating simulation status: {str(e)}")
            raise
    
    async def save_simulation_results(
        self, 
        simulation_id: UUID, 
        results: Dict[str, Any]
    ) -> bool:
        """
        Save simulation results to database
        """
        try:
            # Save different types of results as separate records
            result_types = ['daily_results', 'monthly_results', 'annual_results', 'indicators']
            
            for result_type in result_types:
                if result_type in results.get('results', {}):
                    db_result = SimulationResult(
                        simulation_id=simulation_id,
                        result_type=result_type,
                        data=results['results'][result_type],
                        result_metadata=results.get('metadata', {})
                    )
                    self.db.add(db_result)
            
            self.db.commit()
            
            logger.info(f"Saved results for simulation {simulation_id}")
            
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving simulation results: {str(e)}")
            raise
    
    async def get_simulation_results(
        self, 
        simulation_id: UUID, 
        user_id: UUID,
        result_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get simulation results
        """
        # First verify user owns the simulation
        simulation = await self.get_simulation(simulation_id, user_id)
        if not simulation:
            return []
        
        query = self.db.query(SimulationResult).filter(
            SimulationResult.simulation_id == simulation_id
        )
        
        if result_type:
            query = query.filter(SimulationResult.result_type == result_type)
        
        results = query.all()
        
        return [
            {
                'id': str(result.id),
                'result_type': result.result_type,
                'data': result.data,
                'metadata': result.result_metadata,
                'created_at': result.created_at.isoformat()
            }
            for result in results
        ]
    
    async def get_user_simulation_stats(self, user_id: UUID) -> Dict[str, Any]:
        """
        Get statistics for user's simulations
        """
        total_simulations = await self.count_user_simulations(user_id)
        
        # Count by status
        running_count = await self.count_user_simulations(user_id, SimulationStatusEnum.RUNNING)
        completed_count = await self.count_user_simulations(user_id, SimulationStatusEnum.COMPLETED)
        failed_count = await self.count_user_simulations(user_id, SimulationStatusEnum.FAILED)
        pending_count = await self.count_user_simulations(user_id, SimulationStatusEnum.PENDING)
        
        # Get recent simulations
        recent_simulations = await self.get_user_simulations(user_id, limit=5)
        
        return {
            'total_simulations': total_simulations,
            'running_simulations': running_count,
            'completed_simulations': completed_count,
            'failed_simulations': failed_count,
            'pending_simulations': pending_count,
            'recent_simulations': recent_simulations
        }