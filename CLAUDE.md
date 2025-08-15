# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (FastAPI)
```bash
# Local development with virtual environment
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run type-check # TypeScript type checking
npm test           # Jest tests
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]
docker-compose up -d [service-name]

# Stop all services
docker-compose down

# Reset database (remove volumes)
docker-compose down -v
```

### Windows Local Development
```bash
# Initial setup
setup-local.bat

# Start services
start-local.bat
```

## Architecture Overview

### Core Architecture
The application follows a modern web architecture with clear separation of concerns:

1. **Frontend (Next.js 14)**: React-based SPA at `frontend/` using TypeScript, Tailwind CSS, and Recharts for visualization
2. **Backend (FastAPI)**: Python REST API at `backend/` handling authentication, simulations, and model execution
3. **Hydrological Models**: Python scientific models at `../modelos/` implementing physical, socio-hydrological, anthropocene, and artificial aquifer simulations
4. **Database**: PostgreSQL for persistent storage with SQLAlchemy ORM
5. **Caching**: Redis for session storage and result caching
6. **Background Tasks**: Celery workers for long-running simulations

### Model Integration Architecture
The system integrates multiple hydrological models through a service layer:

- `backend/app/services/model_runner.py`: Orchestrates model execution
- `IntegratedMHIAModel` at `modelos/mhia_model.py`: Combines all sub-models
- Sub-models communicate through standardized data structures
- Results are stored as JSON in the database and CSV files for export

### API Structure
- `/api/v1/auth/*`: JWT-based authentication endpoints
- `/api/v1/simulations/*`: CRUD operations for simulations
- `/api/v1/models/*`: Model configuration templates
- `/api/v1/results/*`: Simulation results retrieval
- All endpoints defined in `backend/app/api/v1/`

### Frontend Architecture
- **Pages**: App router structure in `frontend/app/`
- **Components**: Reusable UI components in `frontend/app/components/`
- **Authentication**: Context-based auth in `frontend/app/providers/AuthProvider.tsx`
- **API Integration**: Axios-based API client with React Query
- **Visualization**: Recharts components for time series, water balance, and indicators

### Data Flow
1. User configures simulation parameters in frontend
2. Frontend sends POST to `/api/v1/simulations`
3. Backend validates and queues simulation with Celery
4. Model runner executes appropriate models from `../modelos/`
5. Results stored in PostgreSQL and file system
6. Frontend polls for completion and displays visualizations

### Key Integration Points
- Models expect specific data structures defined in `backend/app/schemas/`
- Model outputs are CSV files parsed by `model_runner.py`
- Frontend chart components map directly to model output formats
- Authentication required for all simulation operations

## Important Notes

- Models directory (`../modelos/`) is mounted as volume in Docker
- Frontend runs on port 3000, backend on port 8000
- PostgreSQL credentials in local dev: postgres/password on port 5432
- Redis runs on port 6379 for caching and Celery
- JWT secret key must be changed for production
- Synthetic weather data generated when real data unavailable
- All dates/times handled as UTC in backend, converted in frontend
- Celery workers handle long-running simulations in background
- Requires Node.js 18+ and Python 3.11+ for local development

## Testing & Quality

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest tests/test_auth.py # Run specific test file
```

### Frontend Tests  
```bash
cd frontend
npm test                  # Run Jest tests
npm test -- --watch      # Run tests in watch mode
```

### Code Quality
```bash
# Backend linting/formatting (if available)
cd backend  
black .                   # Format Python code
flake8 .                  # Lint Python code

# Frontend linting
cd frontend
npm run lint              # ESLint
npm run type-check        # TypeScript checking
```