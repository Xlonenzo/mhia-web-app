"""Check database contents"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User, Simulation, SimulationResult
import json

def check_database():
    """Check database contents"""
    db = SessionLocal()
    
    try:
        # Check users
        users = db.query(User).all()
        print(f"\n=== USERS ({len(users)}) ===")
        for user in users:
            print(f"- {user.username} ({user.email}) - ID: {user.id}")
        
        # Check simulations
        simulations = db.query(Simulation).all()
        print(f"\n=== SIMULATIONS ({len(simulations)}) ===")
        for sim in simulations:
            print(f"- {sim.name}")
            print(f"  ID: {sim.id}")
            print(f"  Status: {sim.status}")
            print(f"  Model: {sim.model_type}")
            print(f"  Owner: {sim.owner_id}")
            print(f"  Created: {sim.created_at}")
        
        # Check results
        results = db.query(SimulationResult).all()
        print(f"\n=== SIMULATION RESULTS ({len(results)}) ===")
        for result in results:
            print(f"- Simulation ID: {result.simulation_id}")
            print(f"  Result Type: {result.result_type}")
            print(f"  Created: {result.created_at}")
            
    except Exception as e:
        print(f"Error checking database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database()