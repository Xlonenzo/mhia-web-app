"""Create sample simulations with results for testing"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, Simulation, SimulationResult, SimulationStatus, ModelType, TimeStep
from datetime import datetime, timedelta
import json
import uuid
import numpy as np

def create_sample_simulations():
    """Create sample simulations with results"""
    db = SessionLocal()
    
    try:
        # Get test user
        user = db.query(User).filter(User.username == "testuser").first()
        if not user:
            print("Test user not found!")
            return
        
        print(f"Creating simulations for user: {user.username} (ID: {user.id})")
        
        # Create a completed simulation with results
        sim1 = Simulation(
            id=uuid.uuid4(),
            name="Colorado River Basin Model",
            description="Large-scale watershed analysis with climate projections",
            owner_id=user.id,
            model_type=ModelType.INTEGRATED,
            status=SimulationStatus.COMPLETED,
            time_step=TimeStep.DAILY,
            start_date=datetime(2023, 1, 1),
            end_date=datetime(2023, 12, 31),
            configuration={
                "basin_area": 1000,
                "mean_elevation": 500,
                "annual_precipitation": 1200
            },
            progress=100,
            completed_at=datetime.now() - timedelta(days=2)
        )
        db.add(sim1)
        db.flush()
        
        # Create sample results for simulation 1
        # Daily results (simplified)
        dates = [(datetime(2023, 1, 1) + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(365)]
        precipitation = [np.random.uniform(0, 20) for _ in range(365)]
        runoff = [p * 0.3 + np.random.uniform(0, 2) for p in precipitation]
        evapotranspiration = [p * 0.5 + np.random.uniform(1, 3) for p in precipitation]
        infiltration = [p * 0.2 + np.random.uniform(0, 1) for p in precipitation]
        
        daily_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=sim1.id,
            result_type="daily_results",
            data={
                "dates": dates,
                "precipitation": precipitation,
                "runoff": runoff,
                "evapotranspiration": evapotranspiration,
                "infiltration": infiltration,
                "temperature": [20 + np.random.uniform(-5, 5) for _ in range(365)]
            },
            created_at=datetime.now() - timedelta(days=2)
        )
        db.add(daily_result)
        
        # Annual summary
        annual_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=sim1.id,
            result_type="annual_results",
            data={
                "total_precipitation": sum(precipitation),
                "total_evapotranspiration": sum(evapotranspiration),
                "total_runoff": sum(runoff),
                "total_infiltration": sum(infiltration),
                "water_balance_error": 0.02,
                "mean_temperature": 20.5
            },
            created_at=datetime.now() - timedelta(days=2)
        )
        db.add(annual_result)
        
        # Create a running simulation
        sim2 = Simulation(
            id=uuid.uuid4(),
            name="Urban Watershed Analysis",
            description="Urban hydrology with green infrastructure scenarios",
            owner_id=user.id,
            model_type=ModelType.SOCIOHYDROLOGICAL,
            status=SimulationStatus.RUNNING,
            time_step=TimeStep.DAILY,
            start_date=datetime(2023, 6, 1),
            end_date=datetime(2024, 5, 31),
            configuration={
                "population": 100000,
                "urban_area": 250,
                "green_infrastructure": True
            },
            progress=65
        )
        db.add(sim2)
        
        # Create a pending simulation
        sim3 = Simulation(
            id=uuid.uuid4(),
            name="Aquifer Recharge Study",
            description="Artificial aquifer storage and recovery feasibility",
            owner_id=user.id,
            model_type=ModelType.ARTIFICIAL_AQUIFER,
            status=SimulationStatus.PENDING,
            time_step=TimeStep.MONTHLY,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            configuration={
                "aquifer_capacity": 1000000,
                "recharge_rate": 100,
                "extraction_rate": 50
            },
            progress=0
        )
        db.add(sim3)
        
        db.commit()
        
        print(f"\nCreated simulations:")
        print(f"1. {sim1.name} (ID: {sim1.id}) - Status: {sim1.status}")
        print(f"2. {sim2.name} (ID: {sim2.id}) - Status: {sim2.status}")
        print(f"3. {sim3.name} (ID: {sim3.id}) - Status: {sim3.status}")
        print("\nSample simulations created successfully!")
        
    except Exception as e:
        print(f"Error creating simulations: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_simulations()