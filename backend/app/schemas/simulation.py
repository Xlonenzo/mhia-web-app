from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class SimulationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ModelType(str, Enum):
    PHYSICAL = "physical"
    SOCIOHYDROLOGICAL = "sociohydrological"
    ANTHROPOCENE = "anthropocene"
    ARTIFICIAL_AQUIFER = "artificial_aquifer"
    INTEGRATED = "integrated"

class TimeStep(str, Enum):
    DAILY = "daily"
    MONTHLY = "monthly"
    ANNUAL = "annual"

class PhysicalModelConfig(BaseModel):
    basin_area: float = Field(..., gt=0, description="Basin area in km²")
    mean_elevation: float = Field(..., gt=0, description="Mean elevation in meters")
    mean_slope: float = Field(..., ge=0, le=100, description="Mean slope percentage")
    soil_depth: float = Field(..., gt=0, description="Soil depth in meters")
    porosity: float = Field(..., gt=0, le=1, description="Soil porosity (0-1)")
    hydraulic_conductivity: float = Field(..., gt=0, description="Hydraulic conductivity m/day")
    
    # Land use percentages (must sum to 100)
    forest_percent: float = Field(..., ge=0, le=100)
    agricultural_percent: float = Field(..., ge=0, le=100)
    urban_percent: float = Field(..., ge=0, le=100)  
    water_percent: float = Field(..., ge=0, le=100)
    
    # Meteorological data
    annual_precipitation: float = Field(..., gt=0, description="Annual precipitation in mm")
    mean_temperature: float = Field(..., description="Mean annual temperature in °C")
    
    @validator('forest_percent', 'agricultural_percent', 'urban_percent', 'water_percent')
    def validate_land_use_sum(cls, v, values):
        if 'forest_percent' in values and 'agricultural_percent' in values and 'urban_percent' in values:
            total = values['forest_percent'] + values['agricultural_percent'] + values['urban_percent'] + v
            if abs(total - 100) > 0.1:  # Allow small floating point errors
                raise ValueError('Land use percentages must sum to 100%')
        return v

class SocioModelConfig(BaseModel):
    population: int = Field(..., gt=0, description="Total population")
    population_growth_rate: float = Field(..., ge=0, description="Annual population growth rate %")
    water_demand_per_capita: float = Field(..., gt=0, description="Water demand per capita L/day")
    gdp_per_capita: float = Field(..., gt=0, description="GDP per capita USD")
    agricultural_demand: float = Field(..., ge=0, description="Agricultural water demand m³/day")
    industrial_demand: float = Field(..., ge=0, description="Industrial water demand m³/day")
    governance_index: float = Field(..., ge=0, le=1, description="Water governance index (0-1)")
    water_price: float = Field(..., ge=0, description="Water price USD/m³")
    initial_risk_perception: float = Field(..., ge=0, le=1, description="Initial risk perception (0-1)")
    initial_memory: float = Field(..., ge=0, le=1, description="Initial memory of extreme events (0-1)")

class AquiferModelConfig(BaseModel):
    include_aquifer: bool = Field(default=False, description="Include artificial aquifer model")
    aquifer_capacity: Optional[float] = Field(None, description="Aquifer capacity m³")
    recharge_rate: Optional[float] = Field(None, description="Recharge rate m³/day")
    extraction_rate: Optional[float] = Field(None, description="Extraction rate m³/day")

class SimulationConfigurationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    model_type: ModelType = ModelType.INTEGRATED
    time_step: TimeStep = TimeStep.DAILY
    start_date: datetime
    end_date: datetime
    
    # Model configurations
    physical_config: PhysicalModelConfig
    socio_config: SocioModelConfig
    aquifer_config: Optional[AquiferModelConfig] = None
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v
    
    @validator('end_date')
    def validate_simulation_duration(cls, v, values):
        if 'start_date' in values:
            duration_days = (v - values['start_date']).days
            if duration_days > 3650:  # 10 years max
                raise ValueError('Simulation duration cannot exceed 10 years')
            if duration_days < 1:
                raise ValueError('Simulation duration must be at least 1 day')
        return v

class SimulationCreate(SimulationConfigurationBase):
    pass

class SimulationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    configuration: Optional[Dict[str, Any]] = None

class SimulationResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    status: SimulationStatus
    model_type: ModelType
    time_step: TimeStep
    start_date: datetime
    end_date: datetime
    configuration: Dict[str, Any]
    progress: float
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    owner_id: UUID
    
    class Config:
        from_attributes = True

class SimulationListResponse(BaseModel):
    simulations: List[SimulationResponse]
    total: int
    skip: int
    limit: int

class SimulationResultResponse(BaseModel):
    id: UUID
    simulation_id: UUID
    result_type: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True