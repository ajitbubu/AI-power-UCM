# UCM AI - Universal Consent Manager

A privacy-first consent management platform with AI-powered cookie classification, supporting TCFv2.2, GPPv2, and Google Consent Mode.

## 🚀 Features

- **Multi-Framework Support**: TCFv2.2 (EU), GPPv2 (US), and Google Consent Mode
- **AI-Powered Cookie Classification**: Automatic cookie purpose detection
- **Privacy Signal Detection**: GPC (Global Privacy Control) and DNT support
- **Geo-Based Configuration**: Automatic region detection with middleware
- **Admin Dashboard**: Vendor management and audit logging
- **Real-time Cookie Scanning**: Detect and classify cookies on any website
- **Consent Receipt Generation**: Cryptographically signed consent records

## 📁 Project Structure

```
ucm-ai-local/
├── README.md                 # This file - Quick start guide
├── docs/                     # 📚 Complete documentation
│   ├── ARCHITECTURE.md       # System architecture & flow diagrams
│   ├── FEATURES.md           # Complete feature documentation
│   ├── TESTING.md            # Testing guide & procedures
│   ├── STATUS.md             # System health & status
│   ├── PROJECT_SUMMARY.md    # Complete project overview
│   ├── PROJECT_MAP.txt       # Visual navigation guide
│   └── CHECKLIST.md          # Project completion checklist
├── docker-compose.yml        # Docker orchestration
├── backend/                  # FastAPI backend service
│   ├── app.py                # Main API application
│   ├── models.py             # SQLAlchemy database models
│   ├── requirements.txt      # Python dependencies
│   └── alembic/              # Database migrations
└── frontend/                 # Next.js frontend
    ├── app/                  # Next.js app directory
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Home page
    │   ├── product/          # Product page with cookie banner
    │   ├── test-gpc/         # GPC detection test page
    │   ├── admin/audit/      # Admin audit dashboard
    │   └── api/              # API routes
    ├── components/           # React components
    │   └── CookieBanner.tsx  # Cookie consent banner
    ├── middleware.ts         # Geo-detection middleware
    └── package.json          # Node dependencies
```

## ⚡ Quick Start

### Option 1: Docker (Recommended) 🐳

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running

**Start the application:**

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ucm-ai-local

# Start all services with Docker Compose
docker-compose up --build
```

**That's it!** All services will start automatically:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | http://localhost:3000 | Next.js web interface |
| 🔌 Backend API | http://localhost:8000 | FastAPI REST API |
| 📚 API Docs | http://localhost:8000/docs | Interactive API documentation |
| 🗄️ PostgreSQL | localhost:5432 | Database (internal) |
| 🤖 Model Service | localhost:9000 | AI service (placeholder) |

**Stop the application:**
```bash
# Stop all services
docker-compose down

# Stop and remove database (clean slate)
docker-compose down -v
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Option 2: Local Development

**Prerequisites:**
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python app.py
```

Backend will be available at: **http://localhost:8000**
- API Documentation: http://localhost:8000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (if not exists):
```bash
BACKEND_BASE_URL=http://localhost:8000
ADMIN_API_KEY=dev-admin-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 🌐 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| 🏠 Home | http://localhost:3000 | Landing page with quick links |
| 🛍️ Product Page | http://localhost:3000/product | E-commerce demo with cookie banner |
| 🛡️ GPC Test | http://localhost:3000/test-gpc | Test GPC signal detection |
| 📊 Admin Audit | http://localhost:3000/admin/audit | Audit logs dashboard |
| 📚 API Docs | http://localhost:8000/docs | Interactive API documentation |

## 📖 Documentation

All documentation is located in the `docs/` folder:

- **[docs/README.md](./docs/README.md)** - Main documentation index
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture & flow diagrams
- **[docs/FEATURES.md](./docs/FEATURES.md)** - Complete feature documentation
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing guide & procedures
- **[docs/STATUS.md](./docs/STATUS.md)** - System health & status
- **[docs/PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)** - Complete project overview
- **[docs/PROJECT_MAP.txt](./docs/PROJECT_MAP.txt)** - Visual navigation guide
- **[docs/CHECKLIST.md](./docs/CHECKLIST.md)** - Project completion checklist

## 🎯 Key Features

### Cookie Banner with Consent Management
- Automatic display on first visit
- GPC detection with visual badge
- Framework display (TCFv2.2/GPPv2)
- Four consent purposes with toggles
- Three action modes: Accept All, Reject All, Customize
- LocalStorage persistence
- Backend integration

### GPC (Global Privacy Control) Detection
- Real-time browser signal detection
- Visual status indicators
- Simulate GPC on/off for testing
- Automatic ad denial when GPC active
- Runtime configuration display
- Support for Chrome, Firefox, Brave, DuckDuckGo

### Multi-Framework Support
- **TCFv2.2**: EU/EEA/UK (GDPR compliance)
- **GPPv2**: US states (CCPA/CPRA compliance)
- **Base**: Other regions
- Automatic selection based on geo-location

### Google Consent Mode Integration
- Automatic GCM flag generation
- Purpose-to-signal mapping
- GPC override for advertising
- GTM/GA4 ready

## 🗄️ Database

### Docker Setup (PostgreSQL)
When running with Docker Compose, PostgreSQL is automatically configured:
- **Host**: localhost:5432
- **Database**: ucmdb
- **User**: ucm
- **Password**: ucm
- **Persistent Storage**: Docker volume `postgres_data`

### Local Development (SQLite)
For local development without Docker, SQLite is used by default:
- Database file: `backend/ucm.db`
- Automatically created on first run
- No additional setup required

### Custom Database Configuration
Set the `DATABASE_URL` environment variable:
```bash
# PostgreSQL
export DATABASE_URL="postgresql+psycopg2://user:password@localhost:5432/dbname"

# SQLite
export DATABASE_URL="sqlite:///./ucm.db"
```

### Database Migrations (Alembic)

Inside `backend/`:
```bash
# Create a new migration
alembic -c alembic.ini revision -m "description" --autogenerate

# Apply migrations
alembic -c alembic.ini upgrade head

# Rollback migration
alembic -c alembic.ini downgrade -1
```

## 🐳 Docker Services

The `docker-compose.yml` orchestrates four services:

| Service | Port | Description |
|---------|------|-------------|
| **db** | 5432 | PostgreSQL 15 database with health checks |
| **model_service** | 9000 | AI model service (placeholder) |
| **backend** | 8000 | FastAPI application with auto-reload |
| **frontend** | 3000 | Next.js application with hot reload |

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild containers
docker-compose up --build

# Check service status
docker-compose ps
```

## 🧪 Testing

### Backend Tests

Run pytest inside `backend/`:
```bash
# Activate virtual environment
source .venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_policy.py

# Run with coverage
pytest --cov=. --cov-report=html
```

### API Testing

Use the interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Or use curl:
```bash
# Get runtime configuration
curl http://localhost:8000/api/ucm/runtime?region=EU

# List vendors
curl http://localhost:8000/api/ucm/vendors

# Create vendor (requires admin key)
curl -X POST http://localhost:8000/api/ucm/vendors \
  -H "X-Admin-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","domain":"test.com"}'
```

## API Endpoints

### Public Endpoints
- `GET /api/ucm/runtime` - Get runtime configuration
- `POST /api/ucm/consent` - Submit consent choices
- `GET /api/ucm/consents/{consentId}/receipt` - Get consent receipt
- `POST /api/ucm/scan` - Start cookie scan
- `GET /api/ucm/scan/{jobId}` - Get scan results
- `POST /api/ucm/anomalies` - Report anomalies
- `GET /api/ucm/vendors` - List vendors

### Admin Endpoints (require X-Admin-Key header)
- `POST /api/ucm/vendors` - Create vendor
- `PUT /api/ucm/vendors/{id}` - Update vendor
- `GET /api/ucm/audit` - Get audit logs

## 🔧 Environment Variables

### Backend
- `DATABASE_URL` - Database connection string (default: `sqlite:///./ucm.db`)
- `MODEL_SVC_URL` - AI model service URL (default: `http://model_service:9000`)
- `ADMIN_API_KEY` - Admin API key (default: `dev-admin-key`)
- `PRIVACY_LOGGING` - Enable privacy header logging (default: `false`)

### Frontend
- `BACKEND_BASE_URL` - Backend API URL (default: `http://localhost:8000`)
- `ADMIN_API_KEY` - Admin API key for server-side requests
- `NEXT_PUBLIC_BASE_URL` - Public frontend URL (default: `http://localhost:3000`)

## 🔧 Development Notes

- **Backend**: Auto-reloads on file changes (uvicorn reload mode)
- **Frontend**: Next.js Fast Refresh for instant updates
- **Database**: Seed vendors are added automatically if database is empty
- **Hot Reload**: Both services support hot reload in Docker
- **Volumes**: Source code is mounted as volumes for live editing
- **Health Checks**: PostgreSQL has health checks to ensure backend starts after DB is ready

## 🚨 Troubleshooting

### Port Already in Use
If ports 3000, 8000, or 5432 are already in use:
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Clean up Docker resources
docker system prune -a

# Remove all containers and volumes
docker-compose down -v
docker system prune -a --volumes
```

### Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs db`
- Verify DATABASE_URL environment variable

### Frontend Not Loading
- Clear Next.js cache: `rm -rf frontend/.next`
- Reinstall dependencies: `docker-compose down && docker-compose up --build`

## 📝 License

This project is for development and testing purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Project Status**: ✅ Complete and Operational

**Last Updated**: 2025-10-19

For detailed documentation, see the [docs/](./docs/) folder.
