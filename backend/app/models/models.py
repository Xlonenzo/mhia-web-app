from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()

class SimulationStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ModelType(enum.Enum):
    PHYSICAL = "physical"
    SOCIOHYDROLOGICAL = "sociohydrological"  
    ANTHROPOCENE = "anthropocene"
    ARTIFICIAL_AQUIFER = "artificial_aquifer"
    INTEGRATED = "integrated"

class TimeStep(enum.Enum):
    DAILY = "daily"
    MONTHLY = "monthly"
    ANNUAL = "annual"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    simulations = relationship("Simulation", back_populates="owner")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(SimulationStatus), default=SimulationStatus.PENDING)
    model_type = Column(Enum(ModelType), default=ModelType.INTEGRATED)
    time_step = Column(Enum(TimeStep), default=TimeStep.DAILY)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    configuration = Column(JSON, nullable=False)
    error_message = Column(Text, nullable=True)
    progress = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Foreign Keys
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="simulations")
    results = relationship("SimulationResult", back_populates="simulation", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="simulation", cascade="all, delete-orphan")

class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    result_type = Column(String, nullable=False)  # 'daily', 'monthly', 'annual', 'indicators'
    data = Column(JSON, nullable=False)
    result_metadata = Column(JSON, nullable=True)
    file_path = Column(String, nullable=True)  # Path to CSV file if saved
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign Keys
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id"), nullable=False)

    # Relationships
    simulation = relationship("Simulation", back_populates="results")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=False)
    results = Column(JSON, nullable=True)
    is_baseline = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id"), nullable=False)

    # Relationships
    simulation = relationship("Simulation", back_populates="scenarios")

class ModelConfiguration(Base):
    __tablename__ = "model_configurations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    model_type = Column(Enum(ModelType), nullable=False)
    parameters = Column(JSON, nullable=False)
    is_template = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    creator = relationship("User")

class BasinData(Base):
    __tablename__ = "basin_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    area_km2 = Column(Float, nullable=False)
    mean_elevation_m = Column(Float, nullable=False)
    mean_slope_percent = Column(Float, nullable=False)
    soil_depth_m = Column(Float, nullable=False)
    porosity = Column(Float, nullable=False)
    hydraulic_conductivity = Column(Float, nullable=False)
    land_use = Column(JSON, nullable=False)  # Forest, agricultural, urban, water percentages
    location = Column(JSON, nullable=True)  # Coordinates, region info
    climate_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    creator = relationship("User")

class ImportedDataset(Base):
    __tablename__ = "imported_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # meteorological, observed_flow, etc.
    file_path = Column(String, nullable=False)  # Path to stored file
    file_size = Column(Integer, nullable=False)  # File size in bytes
    description = Column(Text, nullable=True)
    data_summary = Column(JSON, nullable=True)  # Summary statistics
    quality_metrics = Column(JSON, nullable=True)  # Data quality metrics
    column_mapping = Column(JSON, nullable=True)  # Mapping to model parameters
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User")