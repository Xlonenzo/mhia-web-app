# MHIA - Integrated Hydrological Model for the Anthropocene

A modern web application for hydrological modeling that integrates physical, socio-hydrological, and anthropocene transformation models.

## 🌊 Features

- **Integrated Modeling**: Combine multiple hydrological modeling approaches
- **Modern UI**: Clean, professional interface inspired by Sustainalytics design
- **Real-time Visualization**: Interactive charts and dashboards for results analysis
- **Scenario Analysis**: Compare multiple simulation scenarios
- **User Management**: Secure authentication and user-specific data
- **Export Capabilities**: Download results in multiple formats (CSV, JSON, PDF)

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: FastAPI with Python, SQLAlchemy, and PostgreSQL
- **Models**: Integrated Python hydrological models (Physical, Socio-hydrological, Anthropocene, Artificial Aquifer)
- **Visualization**: Recharts for interactive data visualization
- **Authentication**: JWT-based authentication with secure password hashing
- **Deployment**: Docker containers with nginx reverse proxy

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mhia-web-app
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/v1/docs

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 Model Components

### 1. Physical Hydrological Model
- Water balance calculations
- Evapotranspiration modeling
- Surface runoff and infiltration
- Soil moisture dynamics

### 2. Socio-hydrological Model
- Population dynamics
- Water demand modeling
- Governance factors
- Social perception and memory

### 3. Anthropocene Model
- Climate change impacts
- Land use transformations
- Human interventions

### 4. Artificial Aquifer Model
- Groundwater storage systems
- Recharge and extraction rates
- Storage capacity modeling

## 🎨 Design System

The application uses a design system inspired by Sustainalytics with:

- **Colors**: Teal primary (#00736F), blue secondary
- **Typography**: Roboto font family
- **Components**: Reusable UI components with consistent styling
- **Layout**: Grid-based responsive design

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Session management

## 📈 Data Visualization

- Time series charts for daily/monthly data
- Bar charts for comparative analysis
- Radar charts for indicator visualization
- Water balance pie charts
- Interactive dashboards with filtering

## 🐳 Deployment

### Production Deployment

1. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Setup SSL certificates** (recommended)
   - Update nginx configuration for HTTPS
   - Configure SSL certificates

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key
- `ALLOWED_HOSTS`: Allowed CORS origins

#### Frontend
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

## 📝 API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: `/api/v1/docs`
- ReDoc: `/api/v1/redoc`

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/simulations` - List user simulations
- `POST /api/v1/simulations` - Create new simulation
- `GET /api/v1/simulations/{id}/results` - Get simulation results

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔧 Development Guidelines

### Code Style
- Python: Follow PEP 8, use Black formatter
- TypeScript: Use ESLint and Prettier
- Commit messages: Use conventional commits

### Adding New Models
1. Create model class in `backend/app/models/`
2. Add database migrations with Alembic
3. Create API endpoints in `backend/app/api/v1/endpoints/`
4. Add frontend components in `frontend/app/components/`

## 📦 Project Structure

```
mhia-web-app/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── providers/      # Context providers
│   ├── package.json
│   └── Dockerfile
├── shared/                 # Shared types and constants
├── nginx/                  # Nginx configuration
├── docker-compose.yml      # Development setup
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Email: support@mhia.com

## 🏷️ Version History

- **v1.0.0** - Initial release with integrated modeling capabilities
- **v0.9.0** - Beta release with core functionality
- **v0.1.0** - Alpha release with basic modeling

---

Built with ❤️ for hydrological research and water resource management.