# UCM AI - Architecture & Flow Diagrams

This document provides detailed architecture diagrams and flow charts for the Universal Consent Manager (UCM AI) system.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Consent Flow](#consent-flow)
3. [Cookie Scanning Flow](#cookie-scanning-flow)
4. [Admin Vendor Management Flow](#admin-vendor-management-flow)
5. [Privacy Signal Detection Flow](#privacy-signal-detection-flow)
6. [Database Schema](#database-schema)
7. [API Request Flow](#api-request-flow)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web Client  │  │ Consent UI   │  │ Cookie Banner│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ HTTP/HTTPS       │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware (Geo Detection)                              │   │
│  │  - Region Detection (EU/US)                              │   │
│  │  - Cookie: ucm_region                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  App Router  │  │  Admin UI    │  │  Audit UI    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ REST API         │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CORS Middleware                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Public API  │  │  Admin API   │  │  Audit API   │          │
│  │  Endpoints   │  │  (Auth Req)  │  │  (Auth Req)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────┴──────────────────┴──────────────────┴──────────────┐  │
│  │           Business Logic Layer                            │  │
│  │  - Consent Processing                                     │  │
│  │  - Framework Selection (TCF/GPP)                          │  │
│  │  - GPC Detection                                          │  │
│  │  - Privacy Header Logging                                 │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   SQLite     │  │  SQLAlchemy  │          │
│  │  (Docker)    │  │   (Local)    │  │     ORM      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Model Service │
                    │  (AI/ML)       │
                    │  Port: 9000    │
                    └────────────────┘
```

---

## Consent Flow

### User Consent Journey

```
┌─────────────┐
│   User      │
│   Visits    │
│   Website   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. Frontend Middleware                 │
│     - Detect User Location              │
│     - Set ucm_region Cookie             │
│     - Check for ?mockCountry param      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. GET /api/ucm/runtime                │
│     Request Parameters:                 │
│     - region: auto/EU/US                │
│     - gpc: boolean                      │
│     Headers:                            │
│     - Sec-GPC: 0/1                      │
│     - Cookie: ucm_region                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. Backend Processing                  │
│     ┌─────────────────────────────────┐ │
│     │ Determine Effective Region      │ │
│     │ - Check query param             │ │
│     │ - Fallback to cookie            │ │
│     │ - Default to US                 │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Select Framework                │ │
│     │ - EU/EEA/UK → TCFv2.2          │ │
│     │ - US States → GPPv2            │ │
│     │ - Other → Base                 │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Check GPC Signal                │ │
│     │ - Header: Sec-GPC: 1           │ │
│     │ - Query param: gpc=true        │ │
│     │ - Auto-deny ads if GPC         │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Build UI Schema                 │ │
│     │ - Purposes (necessary,          │ │
│     │   functional, analytics, ads)   │ │
│     │ - Default states                │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Query Allowed Vendors           │ │
│     │ - Based on GPC status           │ │
│     │ - Google mappings               │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  4. Return Runtime Config               │
│     {                                   │
│       framework: "TCFv2.2" | "GPPv2",  │
│       gcm: {                            │
│         ad_user_data: "granted/denied", │
│         ad_personalization: "...",      │
│         analytics_storage: "..."        │
│       },                                │
│       ui: { purposes: [...] },          │
│       allowedVendors: [...]             │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  5. User Interacts with Consent UI      │
│     - Reviews purposes                  │
│     - Toggles preferences               │
│     - Clicks "Accept" or "Reject"       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  6. POST /api/ucm/consent               │
│     Request Body:                       │
│     {                                   │
│       userId: "uuid",                   │
│       region: "EU",                     │
│       gpc: false,                       │
│       choices: [                        │
│         {                               │
│           vendorId: "...",              │
│           purpose: "analytics",         │
│           allowed: true                 │
│         }                               │
│       ]                                 │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  7. Backend Saves Consent               │
│     ┌─────────────────────────────────┐ │
│     │ Generate Consent ID             │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Create ConsentSession           │ │
│     │ - Store framework               │ │
│     │ - Generate TCF/GPP strings      │ │
│     │ - Calculate GCM flags           │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Save ConsentChoices             │ │
│     │ - Per vendor                    │ │
│     │ - Per purpose                   │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  8. Return Consent Response             │
│     {                                   │
│       consentId: "uuid",                │
│       framework: "TCFv2.2",             │
│       tcfString: "CP...",               │
│       gppString: "DBABLA~...",          │
│       gcmFlags: {...},                  │
│       savedAt: "2025-10-19T..."         │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  9. Frontend Applies Consent            │
│     - Set consent cookies               │
│     - Initialize GTM/GA with GCM        │
│     - Load/block vendor scripts         │
│     - Store consent ID                  │
└─────────────────────────────────────────┘
```

---

## Cookie Scanning Flow

### Automated Cookie Discovery & Classification

```
┌─────────────┐
│   Admin     │
│   Triggers  │
│   Scan      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. POST /api/ucm/scan                  │
│     Request Body:                       │
│     {                                   │
│       url: "https://example.com",       │
│       depth: 1,                         │
│       includeSubdomains: false          │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. Create Scan Job                     │
│     - Generate job ID                   │
│     - Set status: "running"             │
│     - Store in database                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. Scan Website (Sample Cookies)      │
│     ┌─────────────────────────────────┐ │
│     │ For each detected cookie:      │ │
│     │                                 │ │
│     │ Cookie Examples:                │ │
│     │ - _ga (Google Analytics)        │ │
│     │ - _fbp (Facebook Pixel)         │ │
│     │ - __Host-csrf (First-party)     │ │
│     └─────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  4. AI Classification                   │
│     POST /ai/classify                   │
│     to Model Service                    │
│     ┌─────────────────────────────────┐ │
│     │ Request:                        │ │
│     │ { cookieName: "_ga" }           │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ ML Model Prediction             │ │
│     │ - Purpose: "analytics"          │ │
│     │ - Confidence: 0.95              │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Fallback on Error               │ │
│     │ - Purpose: "unknown"            │ │
│     │ - Confidence: 0.5               │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  5. Store Cookie Finding                │
│     CookieFinding {                     │
│       job_id: "...",                    │
│       name: "_ga",                      │
│       domain: "google-analytics.com",   │
│       first_party: false,               │
│       ttl_seconds: 7776000,             │
│       same_site: "Lax",                 │
│       secure: true,                     │
│       initiator_script: "demo.js",      │
│       purpose_pred: "analytics",        │
│       confidence: 0.95                  │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  6. Update Job Status                   │
│     - Set status: "complete"            │
│     - Return job ID                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  7. GET /api/ucm/scan/{jobId}           │
│     Response:                           │
│     {                                   │
│       jobId: "...",                     │
│       status: "complete",               │
│       findings: [                       │
│         {                               │
│           name: "_ga",                  │
│           domain: "...",                │
│           purposePred: "analytics",     │
│           confidence: 0.95,             │
│           ...                           │
│         }                               │
│       ]                                 │
│     }                                   │
└─────────────────────────────────────────┘
```

---

## Admin Vendor Management Flow

### Creating and Managing Vendors

```
┌─────────────┐
│   Admin     │
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. POST /api/ucm/vendors               │
│     Headers:                            │
│     X-Admin-Key: dev-admin-key          │
│     ┌─────────────────────────────────┐ │
│     │ Authentication Check            │ │
│     │ - Validate admin key            │ │
│     │ - Return 401 if invalid         │ │
│     └─────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  2. Request Body Validation             │
│     {                                   │
│       name: "Google Analytics",         │
│       domain: "google-analytics.com",   │
│       iabPurposes: [7, 10],             │
│       gppSections: ["USNAT"],           │
│       googleMappings: {                 │
│         "analytics_storage": "granted"  │
│       },                                │
│       riskScore: 0.2                    │
│     }                                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. Create Vendor Record                │
│     - Generate UUID if not provided     │
│     - Store in database                 │
│     - Return vendor ID                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  4. Response                            │
│     { id: "uuid" }                      │
└─────────────────────────────────────────┘

┌─────────────┐
│   Update    │
│   Vendor    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  PUT /api/ucm/vendors/{id}              │
│     Headers: X-Admin-Key                │
│     ┌─────────────────────────────────┐ │
│     │ Find Vendor by ID               │ │
│     │ - Return 404 if not found       │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Update Fields                   │ │
│     │ - Merge with existing data      │ │
│     │ - Preserve unmodified fields    │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Save to Database                │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response                               │
│     { id: "uuid", updated: true }       │
└─────────────────────────────────────────┘
```

---

## Privacy Signal Detection Flow

### GPC (Global Privacy Control) & DNT Detection

```
┌─────────────┐
│   User      │
│   Browser   │
│   (GPC On)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  HTTP Request Headers                   │
│     Sec-GPC: 1                          │
│     DNT: 1                              │
│     User-Agent: Mozilla/5.0...          │
│     Sec-CH-UA: "Chrome";v="120"         │
│     Sec-CH-UA-Mobile: ?0                │
│     Sec-CH-UA-Platform: "macOS"         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend Middleware                     │
│     _log_privacy_headers()              │
│     ┌─────────────────────────────────┐ │
│     │ Check PRIVACY_LOGGING env       │ │
│     │ - Skip if false                 │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Extract Headers                 │ │
│     │ - sec-gpc                       │ │
│     │ - dnt                           │ │
│     │ - user-agent                    │ │
│     │ - sec-ch-ua-*                   │ │
│     │ - x-forwarded-for               │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Store in Alerts Table           │ │
│     │ Alert {                         │ │
│     │   type: "privacy_headers",      │ │
│     │   details: JSON(headers)        │ │
│     │ }                               │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  GPC Signal Processing                  │
│     ┌─────────────────────────────────┐ │
│     │ Detect GPC                      │ │
│     │ - Header: Sec-GPC: 1            │ │
│     │ - Query: ?gpc=true              │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Auto-Deny Advertising           │ │
│     │ gcm: {                          │ │
│     │   ad_user_data: "denied",       │ │
│     │   ad_personalization: "denied"  │ │
│     │ }                               │ │
│     └─────────┬───────────────────────┘ │
│               ▼                         │
│     ┌─────────────────────────────────┐ │
│     │ Filter Allowed Vendors          │ │
│     │ - Exclude ad vendors            │ │
│     │ - Allow analytics only          │ │
│     └─────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Return Privacy-Respecting Config       │
└─────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           VENDORS                                │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  VARCHAR (UUID)                           │
│     name                VARCHAR                                  │
│     domain              VARCHAR                                  │
│     iab_purposes        JSON (array of integers)                 │
│     gpp_sections        JSON (array of strings)                  │
│     google_mappings     JSON (object)                            │
│     risk_score          FLOAT                                    │
│     created_at          TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Referenced by
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONSENT_SESSIONS                            │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  VARCHAR (UUID)                           │
│     user_id             VARCHAR                                  │
│     region              VARCHAR (EU/US/etc)                      │
│     gpc                 BOOLEAN                                  │
│     framework           VARCHAR (TCFv2.2/GPPv2/Base)             │
│     tcf_string          TEXT                                     │
│     gpp_string          TEXT                                     │
│     gcm_flags           JSON                                     │
│     created_at          TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONSENT_CHOICES                             │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  INTEGER (auto)                           │
│ FK  consent_session_id  VARCHAR → consent_sessions.id            │
│     vendor_id           VARCHAR                                  │
│     purpose             VARCHAR (analytics/ads/functional/etc)   │
│     allowed             BOOLEAN                                  │
│     created_at          TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                          SCAN_JOBS                               │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  VARCHAR (UUID)                           │
│     url                 VARCHAR                                  │
│     status              VARCHAR (pending/running/complete)       │
│     created_at          TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1:N
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COOKIE_FINDINGS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  INTEGER (auto)                           │
│ FK  job_id              VARCHAR → scan_jobs.id                   │
│     name                VARCHAR                                  │
│     domain              VARCHAR                                  │
│     first_party         BOOLEAN                                  │
│     ttl_seconds         INTEGER                                  │
│     same_site           VARCHAR (Lax/Strict/None)                │
│     secure              BOOLEAN                                  │
│     initiator_script    VARCHAR                                  │
│     purpose_pred        VARCHAR                                  │
│     confidence          FLOAT                                    │
│     detected_at         TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                           ALERTS                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK  id                  INTEGER (auto)                           │
│     site                VARCHAR                                  │
│     type                VARCHAR (privacy_headers/blocked_set/    │
│                                  purpose_drift/unregistered/etc) │
│     cookie_name         VARCHAR (nullable)                       │
│     vendor_id           VARCHAR (nullable)                       │
│     details             TEXT (JSON)                              │
│     occurred_at         TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
```

### Table Relationships

```
VENDORS ──────────┐
                  │ (referenced by vendor_id)
                  │
                  ├──> CONSENT_CHOICES
                  │
                  └──> ALERTS (optional)

CONSENT_SESSIONS ─┬──> CONSENT_CHOICES (1:N)
                  │
                  └──> (user_id links to external user system)

SCAN_JOBS ────────┴──> COOKIE_FINDINGS (1:N)

ALERTS ───────────────> (standalone, logs all anomalies)
```

---

## API Request Flow

### Request Processing Pipeline

```
┌─────────────┐
│   Client    │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. CORS Middleware                     │
│     - Allow all origins (*)             │
│     - Allow credentials                 │
│     - Allow all methods & headers       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. Route Matching                      │
│     ┌─────────────────────────────────┐ │
│     │ Public Routes                   │ │
│     │ - /api/ucm/runtime              │ │
│     │ - /api/ucm/consent              │ │
│     │ - /api/ucm/consents/{id}/receipt│ │
│     │ - /api/ucm/scan                 │ │
│     │ - /api/ucm/scan/{id}            │ │
│     │ - /api/ucm/anomalies            │ │
│     │ - /api/ucm/vendors (GET)        │ │
│     └─────────┬───────────────────────┘ │
│               │                         │
│     ┌─────────┴───────────────────────┐ │
│     │ Admin Routes (Auth Required)    │ │
│     │ - /api/ucm/vendors (POST/PUT)   │ │
│     │ - /api/ucm/audit                │ │
│     └─────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │ Admin Route? │
         └──────┬───────┘
                │
        ┌───────┴───────┐
        │               │
       Yes             No
        │               │
        ▼               ▼
┌───────────────┐  ┌────────────────┐
│ 3a. Auth      │  │ 3b. Skip Auth  │
│     Check     │  │                │
│               │  └────────┬───────┘
│ Validate      │           │
│ X-Admin-Key   │           │
│ Header        │           │
│               │           │
│ ┌───────────┐ │           │
│ │ Valid?    │ │           │
│ └─────┬─────┘ │           │
│       │       │           │
│   ┌───┴───┐   │           │
│   │       │   │           │
│  Yes     No   │           │
│   │       │   │           │
│   │       ▼   │           │
│   │  ┌──────┐ │           │
│   │  │ 401  │ │           │
│   │  │Error │ │           │
│   │  └──────┘ │           │
│   │           │           │
└───┼───────────┘           │
    │                       │
    └───────────┬───────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  4. Privacy Header Logging              │
│     (if PRIVACY_LOGGING=true)           │
│     - Extract headers                   │
│     - Store in alerts table             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  5. Request Validation                  │
│     - Parse query parameters            │
│     - Validate request body             │
│     - Type checking (Pydantic)          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  6. Business Logic                      │
│     - Database queries                  │
│     - Data processing                   │
│     - External API calls (Model Svc)    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  7. Response Serialization              │
│     - Convert to JSON                   │
│     - Apply response model              │
│     - Set status code                   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  8. Return Response                     │
│     - Headers                           │
│     - Status code                       │
│     - JSON body                         │
└─────────────────────────────────────────┘
```

---

## Framework Selection Logic

### Decision Tree for Consent Framework

```
                    ┌─────────────┐
                    │   Request   │
                    │   Region    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Region Check │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ EU/EEA/UK     │  │ US States     │  │ Other         │
│               │  │               │  │               │
│ - EU          │  │ - US          │  │ - CA          │
│ - EEA         │  │ - US-CA       │  │ - AU          │
│ - UK          │  │ - US-VA       │  │ - BR          │
│               │  │ - US-CO       │  │ - etc.        │
│               │  │ - US-CT       │  │               │
│               │  │ - US-UT       │  │               │
│               │  │ - US-NAT      │  │               │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   TCFv2.2     │  │    GPPv2      │  │     Base      │
│               │  │               │  │               │
│ - IAB TCF     │  │ - US Privacy  │  │ - Simple      │
│ - Vendor List │  │ - State Laws  │  │   consent     │
│ - Purpose IDs │  │ - GPP String  │  │ - No strings  │
│ - TCF String  │  │ - Sections    │  │               │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Apply GCM    │
                    │ (Google      │
                    │  Consent     │
                    │  Mode)       │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Return     │
                    │   Config     │
                    └──────────────┘
```

---

## Google Consent Mode (GCM) Mapping

### Purpose to GCM Signal Mapping

```
User Consent Choices
        │
        ▼
┌─────────────────────────────────────────┐
│  Purpose Analysis                       │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Analytics Purpose                  │ │
│  │ - allowed: true                    │ │
│  └────────┬───────────────────────────┘ │
│           │                             │
│           ▼                             │
│  ┌────────────────────────────────────┐ │
│  │ analytics_storage: "granted"       │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Advertising Purpose                │ │
│  │ - allowed: true                    │ │
│  │ - GPC: false                       │ │
│  └────────┬───────────────────────────┘ │
│           │                             │
│           ▼                             │
│  ┌────────────────────────────────────┐ │
│  │ ad_user_data: "granted"            │ │
│  │ ad_personalization: "granted"      │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ GPC Signal Detected                │ │
│  │ - Sec-GPC: 1                       │ │
│  └────────┬───────────────────────────┘ │
│           │                             │
│           ▼                             │
│  ┌────────────────────────────────────┐ │
│  │ Override Advertising               │ │
│  │ ad_user_data: "denied"             │ │
│  │ ad_personalization: "denied"       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Final GCM Flags                        │
│  {                                      │
│    "ad_user_data": "denied",            │
│    "ad_personalization": "denied",      │
│    "analytics_storage": "granted"       │
│  }                                      │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Apply to GTM/GA                        │
│  gtag('consent', 'update', gcmFlags)    │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

### Docker Compose Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Network: ucm-ai-local_default                             │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   frontend   │  │   backend    │  │      db      │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ node:20      │  │ python:3.11  │  │ postgres:15  │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ Port: 3000   │  │ Port: 8000   │  │ Port: 5432   │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ Volume:      │  │ Volume:      │  │ Volume:      │    │ │
│  │  │ ./frontend   │  │ ./backend    │  │ postgres_data│    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  │         │                  │                  │            │ │
│  │         │    depends_on    │    depends_on    │            │ │
│  │         └─────────────────►│◄─────────────────┘            │ │
│  │                            │                               │ │
│  │                            │                               │ │
│  │                            ▼                               │ │
│  │                   ┌──────────────┐                         │ │
│  │                   │model_service │                         │ │
│  │                   │              │                         │ │
│  │                   │ python:3.11  │                         │ │
│  │                   │              │                         │ │
│  │                   │ Port: 9000   │                         │ │
│  │                   └──────────────┘                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Port Mappings:                                                 │
│  - 3000:3000 → Frontend                                         │
│  - 8000:8000 → Backend API                                      │
│  - 5432:5432 → PostgreSQL                                       │
│  - 9000:9000 → Model Service                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Flow

### Admin Authentication

```
┌─────────────┐
│   Client    │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Request Headers                        │
│  X-Admin-Key: <key>                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  APIKeyHeader Dependency                │
│  - Extract X-Admin-Key header           │
│  - Return None if missing               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  require_admin() Function               │
│  ┌─────────────────────────────────────┐│
│  │ Compare with ADMIN_API_KEY env      ││
│  │ - Default: "dev-admin-key"          ││
│  └─────────┬───────────────────────────┘│
└────────────┼─────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
     Match      No Match
      │             │
      ▼             ▼
┌──────────┐  ┌──────────┐
│ Allow    │  │ HTTP 401 │
│ Request  │  │ Invalid  │
│          │  │ Admin Key│
└────┬─────┘  └──────────┘
     │
     ▼
┌──────────────┐
│ Execute      │
│ Endpoint     │
│ Logic        │
└──────────────┘
```

---

## Summary

This architecture document provides comprehensive flow diagrams for:

1. **System Architecture**: Multi-tier architecture with frontend, backend, database, and AI service
2. **Consent Flow**: Complete user journey from page load to consent storage
3. **Cookie Scanning**: Automated discovery and AI classification
4. **Admin Management**: Vendor CRUD operations with authentication
5. **Privacy Signals**: GPC and DNT detection and processing
6. **Database Schema**: Complete ERD with relationships
7. **API Flow**: Request processing pipeline
8. **Framework Selection**: Decision logic for TCF/GPP/Base
9. **GCM Mapping**: Purpose to Google Consent Mode translation
10. **Deployment**: Docker Compose stack architecture
11. **Security**: Admin authentication flow

All flows are designed to be privacy-first, respecting user signals like GPC while providing flexibility for different regulatory frameworks (GDPR, CCPA, etc.).
