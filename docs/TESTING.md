# UCM AI - Testing Guide

This guide provides step-by-step instructions for testing the Universal Consent Manager features.

## Table of Contents

1. [Cookie Banner Testing](#cookie-banner-testing)
2. [GPC Detection Testing](#gpc-detection-testing)
3. [Consent Flow Testing](#consent-flow-testing)
4. [Admin Features Testing](#admin-features-testing)
5. [API Testing](#api-testing)

---

## Cookie Banner Testing

### Test the Product Page with Cookie Banner

1. **Access the Product Page**
   ```
   http://localhost:3000/product
   ```

2. **Expected Behavior**
   - Page loads with product grid
   - Cookie banner appears at the bottom
   - Banner shows consent options

3. **Test Scenarios**

   **Scenario 1: Accept All**
   - Click "Accept All" button
   - Banner should disappear
   - Consent ID saved to localStorage
   - Refresh page - banner should NOT reappear

   **Scenario 2: Reject All**
   - Clear localStorage: `localStorage.clear()`
   - Refresh page
   - Click "Reject All" button
   - Only necessary cookies should be allowed

   **Scenario 3: Customize Preferences**
   - Clear localStorage
   - Refresh page
   - Click "Customize" button
   - Toggle individual purposes
   - Click "Save Preferences"
   - Verify consent is saved

---

## GPC Detection Testing

### Test GPC Signal Detection

1. **Access the GPC Test Page**
   ```
   http://localhost:3000/test-gpc
   ```

2. **Without GPC Enabled**
   - Should show "⚠️ GPC Not Detected"
   - Orange warning banner

3. **Simulate GPC**
   - Click "GPC On" button
   - Observe runtime configuration changes:
     - `ad_user_data`: denied
     - `ad_personalization`: denied
     - `analytics_storage`: granted
   - Allowed vendors list should be filtered

4. **Enable Real GPC in Browser**

   **Chrome/Edge:**
   ```
   1. Install "Global Privacy Control" extension
   2. Enable the extension
   3. Refresh the test page
   ```

   **Firefox:**
   ```
   1. Go to about:config
   2. Search for: privacy.globalprivacycontrol.enabled
   3. Set to: true
   4. Refresh the test page
   ```

   **Brave:**
   ```
   1. Settings → Shields
   2. Enable "Global Privacy Control"
   3. Refresh the test page
   ```

5. **Verify GPC on Product Page**
   - Clear localStorage
   - Go to product page
   - Cookie banner should show green GPC badge
   - "GPC Detected: Your privacy preferences are being respected"

---

## Consent Flow Testing

### End-to-End Consent Flow

1. **Initial Visit**
   ```bash
   # Clear all data
   localStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC"
   })
   ```

2. **Visit Product Page**
   - Cookie banner appears
   - Framework badge shows (TCFv2.2 or GPPv2)

3. **Customize Consent**
   - Click "Customize"
   - Review purposes:
     - ✓ Strictly Necessary (required, always on)
     - Functional
     - Analytics
     - Advertising

4. **Save Consent**
   - Toggle preferences
   - Click "Save Preferences"
   - Check localStorage for `ucm_consent_id`

5. **Verify Backend Storage**
   ```bash
   # Get consent receipt
   curl http://localhost:8000/api/ucm/consents/{consentId}/receipt
   ```

6. **Check Audit Logs**
   - Go to: http://localhost:3000/admin/audit
   - Should see consent events (if privacy logging enabled)

---

## Admin Features Testing

### Vendor Management

1. **List Vendors**
   ```bash
   curl http://localhost:8000/api/ucm/vendors
   ```

2. **Create New Vendor**
   ```bash
   curl -X POST http://localhost:8000/api/ucm/vendors \
     -H "X-Admin-Key: dev-admin-key" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Vendor",
       "domain": "test-vendor.com",
       "iabPurposes": [1, 3],
       "gppSections": ["USNAT"],
       "googleMappings": {
         "ad_user_data": "denied"
       },
       "riskScore": 0.3
     }'
   ```

3. **Update Vendor**
   ```bash
   curl -X PUT http://localhost:8000/api/ucm/vendors/{vendorId} \
     -H "X-Admin-Key: dev-admin-key" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Vendor Name",
       "riskScore": 0.5
     }'
   ```

### Audit Dashboard

1. **Access Dashboard**
   ```
   http://localhost:3000/admin/audit
   ```

2. **Filter by Type**
   - Click "Privacy Headers"
   - Click "Anomalies"
   - Click "All"

3. **Enable Privacy Logging**
   ```bash
   # In docker-compose.yml, add to backend environment:
   PRIVACY_LOGGING: "true"
   
   # Restart services
   docker-compose restart backend
   ```

4. **Generate Privacy Header Logs**
   - Visit product page with GPC enabled
   - Check audit dashboard
   - Should see privacy_headers entries

---

## API Testing

### Runtime Configuration API

```bash
# Get runtime config for EU
curl "http://localhost:8000/api/ucm/runtime?region=EU"

# Get runtime config for US
curl "http://localhost:8000/api/ucm/runtime?region=US"

# Get runtime config with GPC
curl "http://localhost:8000/api/ucm/runtime?region=US&gpc=true" \
  -H "Sec-GPC: 1"
```

### Consent API

```bash
# Submit consent
curl -X POST http://localhost:8000/api/ucm/consent \
  -H "Content-Type: application/json" \
  -H "Sec-GPC: 0" \
  -d '{
    "region": "US",
    "gpc": false,
    "choices": [
      {
        "vendorId": "00000000-0000-4000-a000-000000000111",
        "purpose": "analytics",
        "allowed": true
      },
      {
        "vendorId": "00000000-0000-4000-a000-000000000111",
        "purpose": "ads",
        "allowed": false
      }
    ]
  }'
```

### Cookie Scanning API

```bash
# Start scan
curl -X POST http://localhost:8000/api/ucm/scan \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "depth": 1,
    "includeSubdomains": false
  }'

# Get scan results
curl http://localhost:8000/api/ucm/scan/{jobId}
```

---

## Framework Selection Testing

### Test Different Regions

1. **EU Region (TCFv2.2)**
   ```bash
   # Set region cookie
   document.cookie = "ucm_region=EU"
   
   # Visit product page
   # Should show: Framework: TCFv2.2
   ```

2. **US Region (GPPv2)**
   ```bash
   document.cookie = "ucm_region=US"
   # Should show: Framework: GPPv2
   ```

3. **Mock Country Parameter**
   ```
   http://localhost:3000/product?mockCountry=FR
   # Should detect as EU
   
   http://localhost:3000/product?mockCountry=US
   # Should detect as US
   ```

---

## Google Consent Mode Testing

### Verify GCM Flags

1. **With Analytics Allowed**
   - Accept analytics purpose
   - Check response: `analytics_storage: "granted"`

2. **With Ads Allowed (No GPC)**
   - Accept advertising purpose
   - GPC off
   - Check response:
     - `ad_user_data: "granted"`
     - `ad_personalization: "granted"`

3. **With GPC Enabled**
   - Enable GPC
   - Even if ads accepted in UI
   - Check response:
     - `ad_user_data: "denied"`
     - `ad_personalization: "denied"`

---

## Browser Console Testing

### Check Consent in Console

```javascript
// Check localStorage
console.log("Consent ID:", localStorage.getItem("ucm_consent_id"));

// Check GPC status
console.log("GPC Enabled:", navigator.globalPrivacyControl);

// Check cookies
console.log("Cookies:", document.cookie);

// Simulate GPC
Object.defineProperty(navigator, 'globalPrivacyControl', {
  value: true,
  writable: false
});
```

---

## Automated Testing Checklist

- [ ] Cookie banner appears on first visit
- [ ] Cookie banner does not appear on subsequent visits
- [ ] GPC signal is detected correctly
- [ ] GPC badge appears when signal is present
- [ ] Accept All saves all purposes
- [ ] Reject All saves only necessary purposes
- [ ] Customize allows individual purpose selection
- [ ] Consent ID is stored in localStorage
- [ ] Backend receives and stores consent
- [ ] Consent receipt can be retrieved
- [ ] Admin dashboard loads without errors
- [ ] Vendor list API returns seed vendors
- [ ] Framework selection works for EU/US
- [ ] Google Consent Mode flags are correct
- [ ] Privacy headers are logged (when enabled)

---

## Troubleshooting

### Cookie Banner Not Appearing

```javascript
// Clear localStorage
localStorage.clear();

// Reload page
location.reload();
```

### GPC Not Detected

1. Verify browser extension is installed and enabled
2. Check browser settings
3. Use test page to simulate GPC

### Consent Not Saving

1. Check browser console for errors
2. Verify backend is running: `docker-compose ps`
3. Check backend logs: `docker-compose logs backend`

### API Errors

```bash
# Check backend health
curl http://localhost:8000/api/ucm/vendors

# Check frontend API routes
curl http://localhost:3000/api/ucm/runtime?region=US
```

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test runtime API
ab -n 1000 -c 10 http://localhost:8000/api/ucm/runtime?region=US

# Test consent API
ab -n 100 -c 5 -p consent.json -T application/json \
  http://localhost:8000/api/ucm/consent
```

---

## Next Steps

After completing these tests:

1. Enable privacy logging in production
2. Monitor audit logs for anomalies
3. Add more vendors through admin API
4. Implement cookie scanning for real websites
5. Integrate with Google Tag Manager
6. Add consent receipt email functionality
7. Implement consent withdrawal flow

---

## Support

- Issues: Check [STATUS.md](./STATUS.md)
- Architecture: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- API Docs: http://localhost:8000/docs
