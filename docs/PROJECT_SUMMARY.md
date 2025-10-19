# UCM AI - Project Summary

## 📋 Project Overview

**Universal Consent Manager (UCM AI)** is a privacy-first consent management platform with AI-powered cookie classification, supporting multiple regulatory frameworks including TCFv2.2 (GDPR), GPPv2 (CCPA), and Google Consent Mode.

---

## 📁 Complete Project Structure

```
ucm-ai-local/
├── 📄 README.md                    # Main documentation & quick start
├── 📄 ARCHITECTURE.md              # System architecture & flow diagrams
├── 📄 FEATURES.md                  # Complete feature documentation
├── 📄 TESTING.md                   # Testing guide & procedures
├── 📄 STATUS.md                    # System health & status
├── 📄 PROJECT_SUMMARY.md           # This file
├── 📄 docker-compose.yml           # Docker orchestration
├── 📄 docker-compose.ucm-ai.yml    # Alternative Docker config
├── 📄 env.ucm-ai.example           # Environment variables example
│
├── 🐍 backend/                     # FastAPI Backend
│   ├── app.py                      # Main API application
│   ├── models.py                   # SQLAlchemy database models
│   ├── requirements.txt            # Python dependencies
│   ├── alembic.ini                 # Database migration config
│   ├── ucm.db                      # SQLite database (local dev)
│   ├── alembic/                    # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   └── tests/
│       └── test_policy.py          # Policy tests
│
└── ⚛️  frontend/                    # Next.js Frontend
    ├── package.json                # Node dependencies
    ├── tsconfig.json               # TypeScript config
    ├── next.config.js              # Next.js config
    ├── middleware.ts               # Geo-detection middleware
    ├── .env.local                  # Environment variables
    │
    ├── app/                        # Next.js App Router
    │   ├── layout.tsx              # Root layout
    │   ├── page.tsx                # Home page
    │   │
    │   ├── product/                # 🛍️ Product Page
    │   │   └── page.tsx            # E-commerce demo with cookie banner
    │   │
    │   ├── test-gpc/               # 🛡️ GPC Test Page
    │   │   └── page.tsx            # GPC detection & testing
    │   │
    │   ├── admin/                  # 👨‍💼 Admin Section
    │   │   └── audit/
    │   │       └── page.tsx        # Audit dashboard
    │   │
    │   └── api/                    # 🔌 API Routes
    │       ├── admin/
    │       │   └── audit/
    │       │       └── route.ts    # Admin audit API
    │       └── ucm/
    │           ├── runtime/
    │           │   └── route.ts    # Runtime config API
    │           └── consent/
    │               └── route.ts    # Consent submission API
    │
    └── components/                 # React Components
        └── CookieBanner.tsx        # Cookie consent banner
```

---

## 🎯 Key Features Implemented

### 1. ✅ Product Page with Cookie Banner
- **Location**: `/product`
- **Features**:
  - Professional e-commerce UI with 6 product cards
  - Automatic cookie banner on first visit
  - Persistent consent storage
  - Responsive design

### 2. ✅ Cookie Banner Component
- **Features**:
  - GPC detection with visual badge
  - Framework display (TCFv2.2/GPPv2)
  - Four consent purposes:
    - Strictly Necessary (required)
    - Functional
    - Analytics
    - Advertising
  - Three action modes:
    - Accept All
    - Reject All
    - Customize (with toggles)
  - LocalStorage persistence
  - Backend integration

### 3. ✅ GPC (Global Privacy Control) Detection
- **Location**: `/test-gpc`
- **Features**:
  - Real-time browser signal detection
  - Visual status indicators
  - Simulate GPC on/off for testing
  - Runtime configuration display
  - Color-coded consent flags
  - Browser setup instructions

### 4. ✅ Multi-Framework Support
- **TCFv2.2**: EU/EEA/UK (GDPR)
- **GPPv2**: US states (CCPA/CPRA)
- **Base**: Other regions
- Automatic selection based on geo-location

### 5. ✅ Google Consent Mode Integration
- Automatic GCM flag generation
- Purpose-to-signal mapping
- GPC override for advertising
- GTM/GA4 ready

### 6. ✅ Admin Dashboard
- **Location**: `/admin/audit`
- **Features**:
  - View all audit events
  - Filter by type
  - Real-time updates
  - Admin authentication

### 7. ✅ Privacy Header Logging
- Configurable via `PRIVACY_LOGGING` env
- Captures GPC, DNT, User-Agent, Client Hints
- Stored in alerts table

### 8. ✅ Vendor Management
- List, create, update vendors
- Admin API with authentication
- 2 seed vendors (Google Analytics, Meta Pixel)

### 9. ✅ Database Models
- Vendors
- Consent Sessions
- Consent Choices
- Scan Jobs
- Cookie Findings
- Alerts

### 10. ✅ API Documentation
- Interactive Swagger UI at `/docs`
- Complete endpoint documentation
- Try-it-out functionality

---

## 🌐 Available Pages & URLs

| Page | URL | Description | Status |
|------|-----|-------------|--------|
| 🏠 Home | http://localhost:3000 | Landing page with links | ✅ Working |
| 🛍️ Product | http://localhost:3000/product | E-commerce with cookie banner | ✅ Working |
| 🛡️ GPC Test | http://localhost:3000/test-gpc | GPC detection testing | ✅ Working |
| 📊 Admin Audit | http://localhost:3000/admin/audit | Audit logs dashboard | ✅ Working |
| 📚 API Docs | http://localhost:8000/docs | Interactive API documentation | ✅ Working |

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ucm/runtime` | Get runtime configuration |
| POST | `/api/ucm/consent` | Submit consent choices |
| GET | `/api/ucm/consents/{id}/receipt` | Get consent receipt |
| POST | `/api/ucm/scan` | Start cookie scan |
| GET | `/api/ucm/scan/{id}` | Get scan results |
| POST | `/api/ucm/anomalies` | Report anomalies |
| GET | `/api/ucm/vendors` | List vendors |

### Admin Endpoints (require X-Admin-Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ucm/vendors` | Create vendor |
| PUT | `/api/ucm/vendors/{id}` | Update vendor |
| GET | `/api/ucm/audit` | Get audit logs |

---

## 🐳 Docker Services

| Service | Image | Port | Status |
|---------|-------|------|--------|
| frontend | node:20-alpine | 3000 | ✅ Running |
| backend | python:3.11-slim | 8000 | ✅ Running |
| db | postgres:15-alpine | 5432 | ✅ Healthy |
| model_service | python:3.11-slim | 9000 | ✅ Running |

---

## 📊 Database Schema

### Tables

1. **vendors**
   - id, name, domain
   - iab_purposes, gpp_sections
   - google_mappings, risk_score

2. **consent_sessions**
   - id, user_id, region, gpc
   - framework, tcf_string, gpp_string
   - gcm_flags

3. **consent_choices**
   - id, consent_session_id
   - vendor_id, purpose, allowed

4. **scan_jobs**
   - id, url, status

5. **cookie_findings**
   - id, job_id, name, domain
   - purpose_pred, confidence

6. **alerts**
   - id, site, type
   - cookie_name, vendor_id, details

---

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI 0.115.0
- **Database**: PostgreSQL 15 (Docker) / SQLite (Local)
- **ORM**: SQLAlchemy 2.0.44
- **Migrations**: Alembic 1.13.2
- **Server**: Uvicorn 0.32.0
- **Testing**: Pytest 8.3.3

### Frontend
- **Framework**: Next.js 14.2.0
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20
- **Styling**: Inline styles (CSS-in-JS)
- **State**: React Hooks

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 (production) / SQLite (dev)
- **Reverse Proxy**: Next.js API routes

---

## 🚀 Quick Start Commands

### Start All Services
```bash
docker-compose up --build
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Check Status
```bash
docker-compose ps
```

### Clean Database
```bash
docker-compose down -v
```

---

## 🧪 Testing Checklist

- [x] Cookie banner appears on first visit
- [x] Cookie banner hides after consent
- [x] GPC signal detection works
- [x] GPC badge appears when active
- [x] Accept All saves all purposes
- [x] Reject All saves only necessary
- [x] Customize allows granular control
- [x] Consent persists in localStorage
- [x] Backend receives consent
- [x] Admin dashboard loads
- [x] Vendor API returns data
- [x] Framework selection works (EU/US)
- [x] GCM flags are correct
- [x] API documentation accessible

---

## 📚 Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| README.md | Quick start & overview | ✅ Complete |
| ARCHITECTURE.md | System architecture & flows | ✅ Complete |
| FEATURES.md | Feature documentation | ✅ Complete |
| TESTING.md | Testing procedures | ✅ Complete |
| STATUS.md | System health status | ✅ Complete |
| PROJECT_SUMMARY.md | This file | ✅ Complete |

---

## 🔐 Environment Variables

### Backend (.env or docker-compose.yml)
```env
DATABASE_URL=postgresql+psycopg2://ucm:ucm@db:5432/ucmdb
MODEL_SVC_URL=http://model_service:9000
ADMIN_API_KEY=dev-admin-key
PRIVACY_LOGGING=false
```

### Frontend (.env.local)
```env
BACKEND_BASE_URL=http://backend:8000
ADMIN_API_KEY=dev-admin-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🎨 UI Components

### Pages
1. **Home** - Landing page with navigation
2. **Product** - E-commerce demo
3. **GPC Test** - Privacy signal testing
4. **Admin Audit** - Audit dashboard

### Components
1. **CookieBanner** - Consent management UI
   - GPC badge
   - Purpose toggles
   - Action buttons
   - Framework display

---

## 🔄 Data Flow

### Consent Flow
```
User Visit → Middleware (Geo) → Runtime API → Cookie Banner
    ↓
User Choice → Consent API → Database → Consent Receipt
    ↓
Apply GCM → GTM/GA4 → Track with Consent
```

### GPC Flow
```
Browser Signal → Frontend Detection → Backend Header
    ↓
Auto-Deny Ads → Filter Vendors → Update GCM Flags
    ↓
Visual Badge → User Notification
```

---

## 🛡️ Privacy & Compliance

### Supported Regulations
- ✅ GDPR (EU) - via TCFv2.2
- ✅ CCPA/CPRA (California) - via GPPv2
- ✅ GPC (Global Privacy Control)
- ✅ DNT (Do Not Track)

### Privacy Features
- Explicit consent required
- Granular purpose control
- Right to withdraw (future)
- Consent receipts
- Privacy signal respect
- Transparent data usage

---

## 📈 Metrics & Monitoring

### Available Metrics
- Consent acceptance rate (via audit logs)
- GPC adoption (privacy_headers type)
- Framework distribution (consent_sessions)
- Vendor usage (consent_choices)
- Purpose preferences (consent_choices)

### Monitoring
- Docker container health
- API response times
- Database connections
- Error logs

---

## 🔮 Future Enhancements

### Planned Features
1. Consent withdrawal flow
2. Email consent receipts
3. Multi-language support
4. A/B testing for banners
5. Analytics dashboard
6. Cookie blocking enforcement
7. Cross-domain consent sync
8. Mobile SDKs

### Integration Targets
- WordPress plugin
- Shopify app
- React component library
- Vue.js component
- Angular module

---

## 🐛 Known Issues

None at this time. All services operational.

---

## 📞 Support & Resources

- **Documentation**: All markdown files in root
- **API Reference**: http://localhost:8000/docs
- **Issues**: Check STATUS.md for current status
- **Testing**: Follow TESTING.md guide

---

## 🎯 Success Criteria

✅ All services running in Docker
✅ Cookie banner functional
✅ GPC detection working
✅ Consent saved to database
✅ Admin dashboard accessible
✅ API documentation available
✅ Complete documentation set
✅ Testing guide provided

---

## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Product page with cookie banner
- GPC detection and testing
- Multi-framework support
- Admin dashboard
- Complete documentation

---

## 🏆 Project Highlights

1. **Privacy-First**: GPC support, transparent consent
2. **Multi-Framework**: TCFv2.2, GPPv2, Base
3. **Developer-Friendly**: Hot reload, API docs, testing guide
4. **Production-Ready**: Docker, PostgreSQL, proper architecture
5. **Well-Documented**: 6 comprehensive markdown files
6. **Fully Tested**: All features verified and working

---

## 🎓 Learning Resources

- **GDPR**: https://gdpr.eu/
- **CCPA**: https://oag.ca.gov/privacy/ccpa
- **GPC**: https://globalprivacycontrol.org/
- **TCF**: https://iabeurope.eu/tcf-2-0/
- **GPP**: https://iabtechlab.com/gpp/

---

**Project Status**: ✅ Complete and Operational

**Last Updated**: 2025-10-19

**Maintained By**: UCM AI Development Team
