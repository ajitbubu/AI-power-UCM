# UCM AI - Features Overview

## 🎯 Core Features

### 1. Cookie Banner with Consent Management

**Location:** http://localhost:3000/product

The cookie banner provides a complete consent management interface:

- **Automatic Display**: Shows on first visit, hidden after consent
- **Customizable Purposes**: 
  - Strictly Necessary (always required)
  - Functional
  - Analytics
  - Advertising
- **Three Action Modes**:
  - Accept All - Grants all permissions
  - Reject All - Only necessary cookies
  - Customize - Granular control per purpose
- **Visual Feedback**: Toggle switches with clear states
- **Persistent Storage**: Consent saved to localStorage and backend

### 2. GPC (Global Privacy Control) Detection

**Location:** http://localhost:3000/test-gpc

Automatic detection and respect for user privacy signals:

- **Browser Signal Detection**: Reads `navigator.globalPrivacyControl`
- **Visual Indicator**: Green badge when GPC is detected
- **Automatic Enforcement**: 
  - Advertising automatically denied
  - Ad vendors filtered from allowed list
  - GCM flags set to "denied" for ads
- **Header Forwarding**: Sends `Sec-GPC: 1` header to backend
- **Testing Interface**: Simulate GPC on/off for development

**Supported Browsers:**
- Chrome/Edge (with extension)
- Firefox (native support)
- Brave (built-in)
- DuckDuckGo (default enabled)

### 3. Multi-Framework Support

Automatic framework selection based on user region:

#### TCFv2.2 (Transparency & Consent Framework)
- **Regions**: EU, EEA, UK
- **Features**:
  - IAB vendor list integration
  - Purpose-based consent
  - TCF consent string generation
  - GDPR compliance

#### GPPv2 (Global Privacy Platform)
- **Regions**: US, US-CA, US-VA, US-CO, US-CT, US-UT
- **Features**:
  - State-specific privacy laws
  - GPP string generation
  - CCPA/CPRA compliance
  - Multi-state support

#### Base Framework
- **Regions**: All others
- **Features**:
  - Simple consent model
  - No complex strings
  - Basic privacy compliance

### 4. Google Consent Mode (GCM) Integration

Automatic mapping of consent choices to Google's consent signals:

**GCM Flags:**
- `ad_user_data`: User data for advertising
- `ad_personalization`: Personalized advertising
- `analytics_storage`: Analytics cookies

**Logic:**
```
Analytics Purpose Allowed → analytics_storage: "granted"
Advertising Purpose Allowed + No GPC → ad_*: "granted"
GPC Detected → ad_*: "denied" (override)
```

**Integration Ready:**
- Google Tag Manager
- Google Analytics 4
- Google Ads

### 5. Geo-Based Configuration

**Middleware:** `frontend/middleware.ts`

Automatic region detection and configuration:

- **Cookie-Based**: `ucm_region` cookie
- **Mock Override**: `?mockCountry=FR` parameter
- **Fallback**: Defaults to US
- **Supported Regions**:
  - EU/EEA/UK → TCFv2.2
  - US States → GPPv2
  - Others → Base

### 6. Admin Dashboard

**Location:** http://localhost:3000/admin/audit

Complete audit and monitoring interface:

**Features:**
- View all audit events
- Filter by type:
  - Privacy headers
  - Anomalies
  - Blocked cookies
  - Purpose drift
  - Unregistered vendors
- Real-time updates
- Detailed event information
- Export capabilities (future)

**Authentication:**
- Requires `X-Admin-Key` header
- Configurable via environment variable
- Default: `dev-admin-key`

### 7. Privacy Header Logging

**Configuration:** Set `PRIVACY_LOGGING=true` in backend

Logs all privacy-related headers:

**Captured Headers:**
- `Sec-GPC`: Global Privacy Control
- `DNT`: Do Not Track
- `User-Agent`: Browser information
- `Sec-CH-UA`: Client hints
- `Sec-CH-UA-Mobile`: Mobile detection
- `Sec-CH-UA-Platform`: Platform information
- `X-Forwarded-For`: IP address

**Storage:**
- Stored in `alerts` table
- Type: `privacy_headers`
- JSON details field
- Timestamp included

### 8. Vendor Management

**API Endpoints:**
- `GET /api/ucm/vendors` - List all vendors
- `POST /api/ucm/vendors` - Create vendor (admin)
- `PUT /api/ucm/vendors/{id}` - Update vendor (admin)

**Vendor Properties:**
- Name and domain
- IAB purpose IDs
- GPP sections
- Google Consent Mode mappings
- Risk score (0.0 - 1.0)

**Seed Vendors:**
1. Google Analytics
   - IAB Purposes: 7, 10
   - GPP: USNAT
   - GCM: analytics_storage
   - Risk: 0.2

2. Meta Pixel
   - IAB Purposes: 1, 3, 4, 7
   - GPP: USNAT, USCA
   - GCM: ad_user_data, ad_personalization
   - Risk: 0.6

### 9. Cookie Scanning (AI-Powered)

**API Endpoint:** `POST /api/ucm/scan`

Automated cookie discovery and classification:

**Process:**
1. Scan website for cookies
2. Extract cookie properties:
   - Name, domain, path
   - First-party vs third-party
   - TTL, SameSite, Secure flags
   - Initiator script
3. AI classification via model service
4. Purpose prediction with confidence score
5. Store findings in database

**Classification:**
- Purpose: analytics, advertising, functional, necessary, unknown
- Confidence: 0.0 - 1.0
- Vendor matching

### 10. Consent Receipt

**API Endpoint:** `GET /api/ucm/consents/{id}/receipt`

Cryptographically signed consent records:

**Receipt Contents:**
- Consent ID and user ID
- Region and framework
- GPC status
- Vendor choices per purpose
- Cookie list
- Timestamp
- Digital signature (demo)

**Use Cases:**
- Proof of consent
- Audit trail
- User data requests
- Compliance documentation

---

## 🔒 Privacy & Security Features

### Privacy-First Design

1. **No Tracking Without Consent**: Banner blocks until user choice
2. **GPC Respect**: Automatic enforcement of privacy signals
3. **Granular Control**: Per-purpose consent options
4. **Transparent**: Clear descriptions of each purpose
5. **Revocable**: Users can change preferences anytime

### Security Measures

1. **Admin Authentication**: API key required for sensitive operations
2. **CORS Protection**: Configurable origin restrictions
3. **Input Validation**: Pydantic models for all requests
4. **SQL Injection Prevention**: SQLAlchemy ORM
5. **XSS Protection**: React's built-in escaping

---

## 🎨 User Experience Features

### Cookie Banner UX

- **Non-Intrusive**: Bottom overlay, doesn't block content
- **Clear Actions**: Three obvious choices
- **Visual Feedback**: Toggle switches, color coding
- **Responsive**: Works on mobile and desktop
- **Accessible**: Keyboard navigation, screen reader friendly

### Product Page Demo

- **Realistic E-commerce**: Product grid with cards
- **Interactive**: Hover effects, add to cart buttons
- **Professional Design**: Clean, modern interface
- **Navigation**: Header with links to all pages

### GPC Test Page

- **Educational**: Explains what GPC is
- **Interactive**: Simulate GPC on/off
- **Visual Feedback**: Color-coded status indicators
- **Detailed Output**: Shows runtime configuration
- **Browser Instructions**: How to enable GPC

---

## 🔧 Developer Features

### API Documentation

**Swagger UI:** http://localhost:8000/docs

- Interactive API testing
- Request/response examples
- Schema documentation
- Try-it-out functionality

### Hot Reload

- **Frontend**: Next.js Fast Refresh
- **Backend**: Uvicorn auto-reload
- **Docker**: Volume mounting for live updates

### Debugging

- **Console Logging**: Detailed error messages
- **Network Tab**: Inspect API calls
- **React DevTools**: Component inspection
- **Backend Logs**: `docker-compose logs backend`

### Environment Configuration

**Backend:**
```env
DATABASE_URL=postgresql://...
MODEL_SVC_URL=http://model_service:9000
ADMIN_API_KEY=dev-admin-key
PRIVACY_LOGGING=false
```

**Frontend:**
```env
BACKEND_BASE_URL=http://backend:8000
ADMIN_API_KEY=dev-admin-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📊 Analytics & Monitoring

### Audit Logs

Track all consent-related events:

- Consent granted/denied
- Privacy headers received
- Cookie anomalies detected
- Vendor violations
- Purpose drift

### Metrics (Future)

- Consent acceptance rate
- GPC adoption rate
- Framework distribution
- Vendor popularity
- Purpose preferences

---

## 🚀 Integration Examples

### Google Tag Manager

```javascript
// Apply consent
gtag('consent', 'update', {
  'ad_user_data': gcmFlags.ad_user_data,
  'ad_personalization': gcmFlags.ad_personalization,
  'analytics_storage': gcmFlags.analytics_storage
});
```

### Custom Implementation

```javascript
// Fetch runtime config
const config = await fetch('/api/ucm/runtime?region=auto&gpc=false');

// Show banner with config
showConsentBanner(config);

// Save consent
const consent = await fetch('/api/ucm/consent', {
  method: 'POST',
  body: JSON.stringify({
    region: 'US',
    gpc: false,
    choices: [...]
  })
});

// Apply consent
applyConsent(consent.gcmFlags);
```

---

## 🎯 Compliance Features

### GDPR (EU)

- ✅ Explicit consent required
- ✅ Granular purpose control
- ✅ Right to withdraw
- ✅ Consent receipts
- ✅ Data portability

### CCPA/CPRA (California)

- ✅ Opt-out mechanism
- ✅ Do Not Sell signal
- ✅ GPC support
- ✅ Privacy policy link
- ✅ Disclosure requirements

### Other Regulations

- ✅ LGPD (Brazil)
- ✅ PIPEDA (Canada)
- ✅ POPIA (South Africa)
- ✅ Extensible framework

---

## 🔮 Future Enhancements

### Planned Features

1. **Consent Withdrawal**: Allow users to revoke consent
2. **Email Receipts**: Send consent confirmation via email
3. **Multi-Language**: Support for multiple languages
4. **A/B Testing**: Test different banner designs
5. **Analytics Dashboard**: Consent metrics and insights
6. **Vendor Reputation**: Community-driven vendor ratings
7. **Cookie Blocking**: Automatically block non-consented cookies
8. **Consent Sync**: Cross-domain consent synchronization

### Integration Roadmap

1. WordPress plugin
2. Shopify app
3. React component library
4. Vue.js component
5. Angular module
6. Mobile SDKs (iOS/Android)

---

## 📚 Resources

- **Documentation**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **System Status**: [STATUS.md](./STATUS.md)
- **API Reference**: http://localhost:8000/docs

---

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- Additional consent frameworks
- More vendor integrations
- UI/UX enhancements
- Performance optimizations
- Documentation improvements
- Test coverage
- Accessibility features

---

## 📄 License

This project is for development and testing purposes.
