
import os
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_runtime_gpc_header_forces_denied():
    r = client.get("/api/ucm/runtime?region=auto", headers={"Sec-GPC":"1"})
    assert r.status_code == 200
    data = r.json()
    assert data["gcm"]["ad_user_data"] == "denied"
    assert data["gcm"]["ad_personalization"] == "denied"

def test_runtime_region_cookie_eu():
    # Simulate EU cookie
    r = client.get("/api/ucm/runtime?region=auto", cookies={"ucm_region":"EU"})
    assert r.status_code == 200
    assert r.json()["framework"] == "TCFv2.2"

def test_runtime_region_cookie_us():
    r = client.get("/api/ucm/runtime?region=auto", cookies={"ucm_region":"US"})
    assert r.status_code == 200
    assert r.json()["framework"] == "GPPv2"

def test_vendor_admin_auth_required():
    body = {"name":"Mixpanel","domain":"mixpanel.com","iabPurposes":[7,10],"gppSections":["USNAT"],"googleMappings":{"analytics_storage":"granted"},"riskScore":0.2}
    r = client.post("/api/ucm/vendors", json=body)  # no key
    assert r.status_code in (401, 403)

def test_vendor_admin_create_ok():
    body = {"name":"Segment","domain":"segment.com","iabPurposes":[7,10],"gppSections":["USNAT"],"googleMappings":{"analytics_storage":"granted"},"riskScore":0.2}
    r = client.post("/api/ucm/vendors", json=body, headers={"X-Admin-Key":"dev-admin-key"})
    assert r.status_code == 200
    assert "id" in r.json()
