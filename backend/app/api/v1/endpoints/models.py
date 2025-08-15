from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import User, ModelConfiguration
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/configurations", response_model=List[Dict[str, Any]])
async def get_model_configurations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get available model configurations
    """
    # Get user's own configurations
    user_configs = db.query(ModelConfiguration).filter(
        ModelConfiguration.created_by == current_user.id
    ).all()
    
    # Get public configurations
    public_configs = db.query(ModelConfiguration).filter(
        ModelConfiguration.is_public == True
    ).all()
    
    # Combine and format
    all_configs = user_configs + public_configs
    unique_configs = {str(config.id): config for config in all_configs}.values()
    
    return [
        {
            "id": str(config.id),
            "name": config.name,
            "description": config.description,
            "model_type": config.model_type.value,
            "parameters": config.parameters,
            "is_template": config.is_template,
            "is_public": config.is_public,
            "created_at": config.created_at.isoformat()
        }
        for config in unique_configs
    ]

@router.get("/parameters/{model_type}")
async def get_model_parameters(
    model_type: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get parameter schema for a specific model type
    """
    parameter_schemas = {
        "physical": {
            "basin_area": {"type": "number", "min": 0, "unit": "km²", "default": 100},
            "mean_elevation": {"type": "number", "min": 0, "unit": "m", "default": 500},
            "mean_slope": {"type": "number", "min": 0, "max": 100, "unit": "%", "default": 5},
            "soil_depth": {"type": "number", "min": 0, "unit": "m", "default": 2},
            "porosity": {"type": "number", "min": 0, "max": 1, "default": 0.4},
            "hydraulic_conductivity": {"type": "number", "min": 0, "unit": "m/day", "default": 0.5},
            "land_use": {
                "forest_percent": {"type": "number", "min": 0, "max": 100, "default": 30},
                "agricultural_percent": {"type": "number", "min": 0, "max": 100, "default": 40},
                "urban_percent": {"type": "number", "min": 0, "max": 100, "default": 20},
                "water_percent": {"type": "number", "min": 0, "max": 100, "default": 10}
            },
            "climate": {
                "annual_precipitation": {"type": "number", "min": 0, "unit": "mm", "default": 1200},
                "mean_temperature": {"type": "number", "unit": "°C", "default": 18}
            }
        },
        "sociohydrological": {
            "population": {"type": "integer", "min": 0, "default": 100000},
            "population_growth_rate": {"type": "number", "min": 0, "unit": "%", "default": 1.5},
            "water_demand_per_capita": {"type": "number", "min": 0, "unit": "L/day", "default": 150},
            "gdp_per_capita": {"type": "number", "min": 0, "unit": "USD", "default": 10000},
            "agricultural_demand": {"type": "number", "min": 0, "unit": "m³/day", "default": 20000},
            "industrial_demand": {"type": "number", "min": 0, "unit": "m³/day", "default": 15000},
            "governance_index": {"type": "number", "min": 0, "max": 1, "default": 0.6},
            "water_price": {"type": "number", "min": 0, "unit": "USD/m³", "default": 0.5},
            "initial_risk_perception": {"type": "number", "min": 0, "max": 1, "default": 0.3},
            "initial_memory": {"type": "number", "min": 0, "max": 1, "default": 0.2}
        },
        "artificial_aquifer": {
            "include_aquifer": {"type": "boolean", "default": False},
            "aquifer_capacity": {"type": "number", "min": 0, "unit": "m³", "default": 1000000},
            "recharge_rate": {"type": "number", "min": 0, "unit": "m³/day", "default": 100},
            "extraction_rate": {"type": "number", "min": 0, "unit": "m³/day", "default": 50}
        },
        "integrated": {
            "includes": ["physical", "sociohydrological", "anthropocene", "artificial_aquifer"]
        }
    }
    
    if model_type not in parameter_schemas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model type '{model_type}' not found"
        )
    
    return parameter_schemas[model_type]

@router.get("/capabilities")
async def get_model_capabilities(
    current_user: User = Depends(get_current_user),
):
    """
    Get information about model capabilities
    """
    return {
        "models": {
            "physical": {
                "name": "Physical Hydrological Model",
                "description": "Water balance, evapotranspiration, runoff, and infiltration modeling",
                "outputs": ["daily_water_balance", "monthly_summaries", "annual_totals"],
                "time_steps": ["daily", "monthly", "annual"]
            },
            "sociohydrological": {
                "name": "Socio-hydrological Model",
                "description": "Human-water interactions, governance, and social dynamics",
                "outputs": ["water_demand", "risk_perception", "social_memory", "governance_effectiveness"],
                "time_steps": ["daily", "monthly", "annual"]
            },
            "anthropocene": {
                "name": "Anthropocene Transformation Model",
                "description": "Climate change impacts and human interventions",
                "outputs": ["climate_projections", "land_use_changes", "adaptation_measures"],
                "time_steps": ["monthly", "annual"]
            },
            "artificial_aquifer": {
                "name": "Artificial Aquifer Model",
                "description": "Groundwater storage and management systems",
                "outputs": ["storage_levels", "recharge_rates", "extraction_impacts"],
                "time_steps": ["daily", "monthly"]
            },
            "integrated": {
                "name": "Integrated MHIA Model",
                "description": "Complete hydrological system modeling combining all components",
                "outputs": ["comprehensive_results", "system_indicators", "scenario_comparisons"],
                "time_steps": ["daily", "monthly", "annual"]
            }
        },
        "features": {
            "scenario_analysis": True,
            "uncertainty_quantification": True,
            "sensitivity_analysis": True,
            "optimization": True,
            "real_time_data": False,
            "forecasting": True
        },
        "export_formats": ["csv", "json", "pdf", "netcdf"],
        "visualization_types": ["time_series", "spatial_maps", "statistical_plots", "dashboards"]
    }