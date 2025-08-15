"""Add sample results to the completed simulation"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, Simulation, SimulationResult, SimulationStatus
from datetime import datetime, timedelta
import json
import uuid
import numpy as np

def add_sample_results():
    """Add sample results to completed simulations"""
    db = SessionLocal()
    
    try:
        # Find the completed simulation
        completed_sim = db.query(Simulation).filter(
            Simulation.status == SimulationStatus.COMPLETED
        ).first()
        
        if not completed_sim:
            print("No completed simulation found!")
            return
            
        print(f"Adding results to simulation: {completed_sim.name} (ID: {completed_sim.id})")
        
        # Check if results already exist
        existing_results = db.query(SimulationResult).filter(
            SimulationResult.simulation_id == completed_sim.id
        ).first()
        
        if existing_results:
            print("Results already exist for this simulation")
            return
        
        # Generate realistic daily data for 365 days
        start_date = datetime(2023, 1, 1)
        dates = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(365)]
        
        # Generate realistic precipitation data (seasonal pattern)
        precipitation = []
        for i in range(365):
            month = (i // 30) % 12 + 1
            # Wet season: Dec-Mar (months 12, 1, 2, 3)
            if month in [12, 1, 2, 3]:
                base_precip = 8.0  # Higher in wet season
            else:
                base_precip = 2.0  # Lower in dry season
            
            daily_precip = max(0, np.random.gamma(2, base_precip/2))
            precipitation.append(round(daily_precip, 2))
        
        # Generate correlated runoff (30-40% of precipitation with lag)
        runoff = []
        for i in range(365):
            precip_influence = precipitation[i] * 0.35
            if i > 0:
                precip_influence += precipitation[i-1] * 0.15
            if i > 1:
                precip_influence += precipitation[i-2] * 0.05
            
            daily_runoff = max(0, precip_influence + np.random.normal(0, 0.5))
            runoff.append(round(daily_runoff, 2))
        
        # Generate evapotranspiration (temperature dependent)
        evapotranspiration = []
        temperature = []
        for i in range(365):
            month = (i // 30) % 12 + 1
            # Seasonal temperature variation
            base_temp = 20 + 8 * np.sin((month - 1) * np.pi / 6)  # Varies from 12-28°C
            daily_temp = base_temp + np.random.normal(0, 3)
            temperature.append(round(daily_temp, 1))
            
            # ET based on temperature and available water
            base_et = max(0, (daily_temp - 5) * 0.2)  # Simple temperature-based ET
            if precipitation[i] > 0:
                base_et *= 1.2  # Higher ET when water available
            daily_et = max(0, base_et + np.random.normal(0, 0.3))
            evapotranspiration.append(round(daily_et, 2))
        
        # Generate infiltration (remainder of water balance)
        infiltration = []
        for i in range(365):
            # Infiltration = Precipitation - Runoff - ET (with losses)
            daily_infiltration = max(0, precipitation[i] - runoff[i] - evapotranspiration[i])
            infiltration.append(round(daily_infiltration, 2))
        
        # Create daily results
        daily_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=completed_sim.id,
            result_type="daily_results",
            data={
                "dates": dates,
                "precipitation": precipitation,
                "runoff": runoff,
                "evapotranspiration": evapotranspiration,
                "infiltration": infiltration,
                "temperature": temperature,
                "total_days": 365
            },
            created_at=datetime.now() - timedelta(days=1)
        )
        db.add(daily_result)
        
        # Create annual summary
        annual_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=completed_sim.id,
            result_type="annual_results",
            data={
                "total_precipitation": round(sum(precipitation), 2),
                "total_evapotranspiration": round(sum(evapotranspiration), 2),
                "total_runoff": round(sum(runoff), 2),
                "total_infiltration": round(sum(infiltration), 2),
                "mean_temperature": round(sum(temperature) / len(temperature), 2),
                "water_balance_error": round(abs(sum(precipitation) - sum(evapotranspiration) - sum(runoff) - sum(infiltration)) / sum(precipitation) * 100, 2),
                "runoff_coefficient": round(sum(runoff) / sum(precipitation), 3),
                "max_daily_precipitation": max(precipitation),
                "max_daily_runoff": max(runoff),
                "drought_days": len([p for p in precipitation if p < 0.1])
            },
            created_at=datetime.now() - timedelta(days=1)
        )
        db.add(annual_result)
        
        # Create monthly summary
        monthly_data = []
        for month in range(1, 13):
            month_start = (month - 1) * 30
            month_end = min(month * 30, 365)
            month_indices = range(month_start, month_end)
            
            monthly_data.append({
                "month": f"2023-{month:02d}",
                "precipitation": round(sum(precipitation[i] for i in month_indices), 2),
                "evapotranspiration": round(sum(evapotranspiration[i] for i in month_indices), 2),
                "runoff": round(sum(runoff[i] for i in month_indices), 2),
                "infiltration": round(sum(infiltration[i] for i in month_indices), 2),
                "mean_temperature": round(sum(temperature[i] for i in month_indices) / len(month_indices), 2)
            })
        
        monthly_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=completed_sim.id,
            result_type="monthly_results",
            data={
                "months": [m["month"] for m in monthly_data],
                "total_precipitation": [m["precipitation"] for m in monthly_data],
                "total_evapotranspiration": [m["evapotranspiration"] for m in monthly_data],
                "total_runoff": [m["runoff"] for m in monthly_data],
                "total_infiltration": [m["infiltration"] for m in monthly_data],
                "mean_temperature": [m["mean_temperature"] for m in monthly_data]
            },
            created_at=datetime.now() - timedelta(days=1)
        )
        db.add(monthly_result)
        
        # Create performance indicators
        indicators_result = SimulationResult(
            id=uuid.uuid4(),
            simulation_id=completed_sim.id,
            result_type="indicators",
            data={
                "water_use_efficiency": 0.78,
                "storage_reliability": 0.92,
                "environmental_flow_compliance": 0.88,
                "flood_protection_level": 0.85,
                "drought_resilience": 0.71,
                "system_robustness": 0.82,
                "sustainability_index": 0.79
            },
            created_at=datetime.now() - timedelta(days=1)
        )
        db.add(indicators_result)
        
        db.commit()
        
        print("✅ Sample results added successfully!")
        print(f"- Daily results: {len(dates)} days")
        print(f"- Annual totals: {round(sum(precipitation), 1)} mm precipitation")
        print(f"- Monthly summaries: 12 months")
        print(f"- Performance indicators: 7 metrics")
        
    except Exception as e:
        print(f"Error adding results: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_results()