from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any
from uuid import UUID
import pandas as pd
import io
import logging
from datetime import datetime
import json
import os
from pathlib import Path

from app.models.models import User, ImportedDataset, Simulation

logger = logging.getLogger(__name__)

class DataImportService:
    """
    Service layer for handling data imports
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.upload_directory = Path("./uploads")
        self.upload_directory.mkdir(exist_ok=True)
    
    async def process_uploaded_file(
        self,
        file: Any,  # UploadFile
        file_type: str,
        content: bytes,
        user_id: UUID,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process and store an uploaded file
        """
        try:
            # Parse the CSV content
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            
            # Validate the data
            validation_result = self._validate_data(df, file_type)
            
            if not validation_result['is_valid']:
                return {
                    "filename": file.filename,
                    "status": "error",
                    "error": f"Validation failed: {', '.join(validation_result['errors'])}"
                }
            
            # Store the file
            file_path = await self._store_file(file, content, user_id, file_type)
            
            # Create database record
            dataset_record = ImportedDataset(
                filename=file.filename,
                original_filename=file.filename,
                file_type=file_type,
                file_path=str(file_path),
                file_size=len(content),
                description=description,
                data_summary=self._generate_data_summary(df),
                quality_metrics=self._calculate_quality_metrics(df),
                column_mapping=self._generate_column_mapping(df, file_type),
                owner_id=user_id
            )
            
            self.db.add(dataset_record)
            self.db.commit()
            self.db.refresh(dataset_record)
            
            logger.info(f"Successfully imported dataset {dataset_record.id} for user {user_id}")
            
            return {
                "filename": file.filename,
                "status": "success",
                "dataset_id": str(dataset_record.id),
                "file_type": file_type,
                "records_count": len(df),
                "columns": list(df.columns),
                "data_summary": dataset_record.data_summary
            }
            
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            return {
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            }
    
    def _validate_data(self, df: pd.DataFrame, file_type: str) -> Dict[str, Any]:
        """
        Validate the imported data based on file type
        """
        errors = []
        warnings = []
        
        # Basic validation
        if df.empty:
            errors.append("File is empty")
            return {"is_valid": False, "errors": errors, "warnings": warnings}
        
        # File type specific validation
        if file_type == 'meteorological':
            if not any('date' in col.lower() for col in df.columns):
                errors.append("Date column not found")
            if not any('precip' in col.lower() for col in df.columns):
                errors.append("Precipitation column not found")
            if not any('temp' in col.lower() for col in df.columns):
                warnings.append("Temperature column not found")
                
        elif file_type == 'observed_flow':
            if not any('date' in col.lower() for col in df.columns):
                errors.append("Date column not found")
            if not any('flow' in col.lower() or 'discharge' in col.lower() for col in df.columns):
                errors.append("Flow/discharge column not found")
                
        elif file_type == 'streamflow':
            if not any('date' in col.lower() for col in df.columns):
                errors.append("Date column not found")
            if not any('discharge' in col.lower() or 'flow' in col.lower() for col in df.columns):
                errors.append("Discharge column not found")
                
        elif file_type == 'groundwater':
            if not any('date' in col.lower() for col in df.columns):
                errors.append("Date column not found")
            if not any('level' in col.lower() or 'depth' in col.lower() for col in df.columns):
                errors.append("Water level column not found")
                
        elif file_type == 'basin_data':
            if not any('parameter' in col.lower() for col in df.columns):
                errors.append("Parameter column not found")
            if not any('value' in col.lower() for col in df.columns):
                errors.append("Value column not found")
        
        # Check for missing values
        missing_percent = (df.isnull().sum() / len(df) * 100).max()
        if missing_percent > 50:
            warnings.append(f"High percentage of missing values ({missing_percent:.1f}%)")
        elif missing_percent > 20:
            warnings.append(f"Moderate missing values ({missing_percent:.1f}%)")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    async def _store_file(self, file: Any, content: bytes, user_id: UUID, file_type: str) -> Path:
        """
        Store the uploaded file to disk
        """
        # Create user-specific directory
        user_dir = self.upload_directory / str(user_id)
        user_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{file_type}_{timestamp}_{file.filename}"
        file_path = user_dir / filename
        
        # Write file
        with open(file_path, 'wb') as f:
            f.write(content)
        
        return file_path
    
    def _generate_data_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate a summary of the data
        """
        summary = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "data_types": df.dtypes.astype(str).to_dict(),
            "date_range": None,
            "numeric_summary": {}
        }
        
        # Try to find date column and get range
        date_cols = [col for col in df.columns if 'date' in col.lower()]
        if date_cols:
            try:
                date_series = pd.to_datetime(df[date_cols[0]])
                summary["date_range"] = {
                    "start": date_series.min().isoformat(),
                    "end": date_series.max().isoformat(),
                    "total_days": (date_series.max() - date_series.min()).days
                }
            except:
                pass
        
        # Get numeric column summary
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols[:5]:  # Limit to first 5 numeric columns
            summary["numeric_summary"][col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "count": int(df[col].count())
            }
        
        return summary
    
    def _calculate_quality_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate data quality metrics
        """
        return {
            "completeness": float((1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100),
            "missing_values": df.isnull().sum().to_dict(),
            "duplicate_rows": int(df.duplicated().sum()),
            "unique_values": {col: int(df[col].nunique()) for col in df.columns[:10]}  # Limit to 10 columns
        }
    
    def _generate_column_mapping(self, df: pd.DataFrame, file_type: str) -> Dict[str, str]:
        """
        Generate mapping between data columns and model parameters
        """
        mapping = {}
        
        for col in df.columns:
            col_lower = col.lower()
            
            # Common mappings
            if 'date' in col_lower:
                mapping[col] = 'date'
            elif 'precip' in col_lower:
                mapping[col] = 'precipitation'
            elif 'temp' in col_lower:
                mapping[col] = 'temperature'
            elif 'flow' in col_lower or 'discharge' in col_lower:
                mapping[col] = 'flow'
            elif 'level' in col_lower:
                mapping[col] = 'water_level'
            elif 'humid' in col_lower:
                mapping[col] = 'humidity'
            elif 'wind' in col_lower:
                mapping[col] = 'wind_speed'
            else:
                mapping[col] = col  # Keep original name
        
        return mapping
    
    async def get_user_datasets(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
        file_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get user's uploaded datasets
        """
        query = self.db.query(ImportedDataset).filter(ImportedDataset.owner_id == user_id)
        
        if file_type:
            query = query.filter(ImportedDataset.file_type == file_type)
        
        total = query.count()
        datasets = query.order_by(ImportedDataset.created_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "datasets": [
                {
                    "id": str(dataset.id),
                    "filename": dataset.filename,
                    "file_type": dataset.file_type,
                    "file_size": dataset.file_size,
                    "description": dataset.description,
                    "data_summary": dataset.data_summary,
                    "quality_metrics": dataset.quality_metrics,
                    "created_at": dataset.created_at.isoformat(),
                    "is_active": dataset.is_active
                }
                for dataset in datasets
            ],
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    async def get_dataset_details(self, dataset_id: UUID, user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific dataset
        """
        dataset = self.db.query(ImportedDataset).filter(
            and_(
                ImportedDataset.id == dataset_id,
                ImportedDataset.owner_id == user_id
            )
        ).first()
        
        if not dataset:
            return None
        
        # Load and preview data if file exists
        preview_data = None
        if os.path.exists(dataset.file_path):
            try:
                df = pd.read_csv(dataset.file_path)
                preview_data = df.head(20).fillna('').to_dict(orient='records')
            except Exception as e:
                logger.warning(f"Could not load data preview for dataset {dataset_id}: {str(e)}")
        
        return {
            "id": str(dataset.id),
            "filename": dataset.filename,
            "original_filename": dataset.original_filename,
            "file_type": dataset.file_type,
            "file_size": dataset.file_size,
            "description": dataset.description,
            "data_summary": dataset.data_summary,
            "quality_metrics": dataset.quality_metrics,
            "column_mapping": dataset.column_mapping,
            "preview_data": preview_data,
            "created_at": dataset.created_at.isoformat(),
            "updated_at": dataset.updated_at.isoformat() if dataset.updated_at else None,
            "is_active": dataset.is_active
        }
    
    async def delete_dataset(self, dataset_id: UUID, user_id: UUID) -> bool:
        """
        Delete a user's dataset
        """
        dataset = self.db.query(ImportedDataset).filter(
            and_(
                ImportedDataset.id == dataset_id,
                ImportedDataset.owner_id == user_id
            )
        ).first()
        
        if not dataset:
            return False
        
        # Delete file from disk
        try:
            if os.path.exists(dataset.file_path):
                os.remove(dataset.file_path)
        except Exception as e:
            logger.warning(f"Could not delete file {dataset.file_path}: {str(e)}")
        
        # Delete database record
        self.db.delete(dataset)
        self.db.commit()
        
        logger.info(f"Deleted dataset {dataset_id} for user {user_id}")
        return True
    
    async def link_dataset_to_simulation(
        self,
        dataset_id: UUID,
        simulation_id: UUID,
        user_id: UUID
    ) -> bool:
        """
        Link a dataset to a simulation
        """
        # Verify both dataset and simulation belong to user
        dataset = self.db.query(ImportedDataset).filter(
            and_(
                ImportedDataset.id == dataset_id,
                ImportedDataset.owner_id == user_id
            )
        ).first()
        
        simulation = self.db.query(Simulation).filter(
            and_(
                Simulation.id == simulation_id,
                Simulation.owner_id == user_id
            )
        ).first()
        
        if not dataset or not simulation:
            return False
        
        # Update simulation configuration to include dataset reference
        config = simulation.configuration or {}
        if 'linked_datasets' not in config:
            config['linked_datasets'] = {}
        
        config['linked_datasets'][dataset.file_type] = {
            'dataset_id': str(dataset_id),
            'filename': dataset.filename,
            'linked_at': datetime.now().isoformat()
        }
        
        simulation.configuration = config
        simulation.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        logger.info(f"Linked dataset {dataset_id} to simulation {simulation_id}")
        return True
    
    async def get_user_import_statistics(self, user_id: UUID) -> Dict[str, Any]:
        """
        Get user's data import statistics
        """
        datasets = self.db.query(ImportedDataset).filter(ImportedDataset.owner_id == user_id).all()
        
        # Count by file type
        type_counts = {}
        for dataset in datasets:
            type_counts[dataset.file_type] = type_counts.get(dataset.file_type, 0) + 1
        
        # Calculate total storage used
        total_storage = sum(dataset.file_size for dataset in datasets)
        
        # Recent uploads (last 30 days)
        recent_date = datetime.now() - pd.Timedelta(days=30)
        recent_uploads = [d for d in datasets if d.created_at >= recent_date]
        
        return {
            "total_datasets": len(datasets),
            "datasets_by_type": type_counts,
            "total_storage_bytes": total_storage,
            "total_storage_mb": round(total_storage / (1024 * 1024), 2),
            "recent_uploads_30_days": len(recent_uploads),
            "active_datasets": len([d for d in datasets if d.is_active]),
            "average_file_size_mb": round((total_storage / len(datasets)) / (1024 * 1024), 2) if datasets else 0
        }