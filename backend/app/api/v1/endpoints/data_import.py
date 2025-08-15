from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
import pandas as pd
import io
import logging
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.user import User
from app.services.data_import_service import DataImportService

logger = logging.getLogger(__name__)
router = APIRouter()

# Supported file types
SUPPORTED_FILE_TYPES = {
    'meteorological': {
        'description': 'Meteorological data (precipitation, temperature, etc.)',
        'required_columns': ['date', 'precipitation_mm', 'temperature_c'],
        'optional_columns': ['humidity_percent', 'wind_speed_ms', 'solar_radiation']
    },
    'observed_flow': {
        'description': 'Observed river/stream flow data',
        'required_columns': ['date', 'flow_cms'],
        'optional_columns': ['water_level_m', 'quality_index']
    },
    'streamflow': {
        'description': 'Historical streamflow records',
        'required_columns': ['date', 'discharge'],
        'optional_columns': ['stage', 'velocity']
    },
    'groundwater': {
        'description': 'Groundwater level and quality data',
        'required_columns': ['date', 'water_level_m'],
        'optional_columns': ['quality_index', 'temperature_c', 'ph']
    },
    'basin_data': {
        'description': 'Basin characteristics and parameters',
        'required_columns': ['parameter', 'value'],
        'optional_columns': ['unit', 'source', 'confidence']
    }
}

@router.get("/file-types")
async def get_supported_file_types():
    """
    Get list of supported file types and their requirements
    """
    return {
        "supported_types": SUPPORTED_FILE_TYPES,
        "supported_formats": ["csv", "txt"],
        "max_file_size_mb": 50
    }

@router.post("/upload")
async def upload_data_files(
    files: List[UploadFile] = File(...),
    file_types: List[str] = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and validate data files for hydrological modeling
    """
    if len(files) != len(file_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of files must match number of file types"
        )
    
    data_import_service = DataImportService(db)
    results = []
    
    for file, file_type in zip(files, file_types):
        try:
            # Validate file type
            if file_type not in SUPPORTED_FILE_TYPES:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": f"Unsupported file type: {file_type}"
                })
                continue
            
            # Check file size (50MB limit)
            if file.size and file.size > 50 * 1024 * 1024:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": "File size exceeds 50MB limit"
                })
                continue
            
            # Read and validate file content
            content = await file.read()
            
            # Reset file position for potential re-reading
            await file.seek(0)
            
            # Process the file
            result = await data_import_service.process_uploaded_file(
                file=file,
                file_type=file_type,
                content=content,
                user_id=current_user.id,
                description=description
            )
            
            results.append(result)
            
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"Processing failed: {str(e)}"
            })
    
    return {
        "message": f"Processed {len(files)} files",
        "results": results,
        "summary": {
            "total_files": len(results),
            "successful": len([r for r in results if r["status"] == "success"]),
            "failed": len([r for r in results if r["status"] == "error"])
        }
    }

@router.post("/validate")
async def validate_file_content(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Validate file content without storing it
    """
    if file_type not in SUPPORTED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_type}"
        )
    
    try:
        content = await file.read()
        
        # Parse CSV content
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Get file type configuration
        config = SUPPORTED_FILE_TYPES[file_type]
        
        # Check for required columns
        missing_required = []
        for col in config['required_columns']:
            if not any(col.lower() in df_col.lower() for df_col in df.columns):
                missing_required.append(col)
        
        # Check data quality
        data_quality = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "missing_values": df.isnull().sum().to_dict(),
            "data_types": df.dtypes.astype(str).to_dict()
        }
        
        # Generate preview
        preview = df.head(10).fillna('').to_dict(orient='records')
        
        validation_result = {
            "filename": file.filename,
            "file_type": file_type,
            "is_valid": len(missing_required) == 0,
            "missing_required_columns": missing_required,
            "available_columns": list(df.columns),
            "data_quality": data_quality,
            "preview": preview
        }
        
        if not validation_result["is_valid"]:
            validation_result["suggestions"] = [
                f"Add missing column: {col}" for col in missing_required
            ]
        
        return validation_result
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File encoding not supported. Please use UTF-8 encoding."
        )
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File appears to be empty"
        )
    except pd.errors.ParserError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV parsing error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error validating file {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )

@router.get("/user-datasets")
async def get_user_datasets(
    skip: int = 0,
    limit: int = 100,
    file_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's uploaded datasets
    """
    data_import_service = DataImportService(db)
    
    datasets = await data_import_service.get_user_datasets(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        file_type=file_type
    )
    
    return datasets

@router.get("/dataset/{dataset_id}")
async def get_dataset_details(
    dataset_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific dataset
    """
    data_import_service = DataImportService(db)
    
    dataset = await data_import_service.get_dataset_details(
        dataset_id=dataset_id,
        user_id=current_user.id
    )
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset

@router.delete("/dataset/{dataset_id}")
async def delete_dataset(
    dataset_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user's dataset
    """
    data_import_service = DataImportService(db)
    
    success = await data_import_service.delete_dataset(
        dataset_id=dataset_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return {"message": "Dataset deleted successfully"}

@router.post("/dataset/{dataset_id}/use-in-simulation")
async def use_dataset_in_simulation(
    dataset_id: UUID,
    simulation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Link a dataset to a simulation for use in modeling
    """
    data_import_service = DataImportService(db)
    
    success = await data_import_service.link_dataset_to_simulation(
        dataset_id=dataset_id,
        simulation_id=simulation_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset or simulation not found"
        )
    
    return {"message": "Dataset linked to simulation successfully"}

@router.get("/statistics")
async def get_import_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's data import statistics
    """
    data_import_service = DataImportService(db)
    
    stats = await data_import_service.get_user_import_statistics(current_user.id)
    
    return stats