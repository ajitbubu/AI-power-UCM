
import os, requests, json
import uvicorn
from fastapi import FastAPI, Query, Header, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models import Base, Vendor, ConsentSession, ConsentChoice, ScanJob, CookieFinding, Alert

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ucm.db")
MODEL_SVC_URL = os.getenv("MODEL_SVC_URL", "http://model_service:9000")
ADMIN_KEY = os.getenv("ADMIN_API_KEY", "dev-admin-key")

engine = create_engine(DATABASE_URL, future=True)

# Initialize schema
with engine.begin() as conn:
    Base.metadata.create_all(conn)

# Seed vendors if empty
with Session(engine) as s:
    if s.query(Vendor).count() == 0:
        v1 = Vendor(id="00000000-0000-4000-a000-000000000111", name="Google Analytics", domain="google-analytics.com",
                    iab_purposes=[7,10], gpp_sections=["USNAT"], google_mappings={"analytics_storage":"granted"}, risk_score=0.2)
        v2 = Vendor(id="00000000-0000-4000-a000-000000000222", name="Meta Pixel", domain="facebook.com",
                    iab_purposes=[1,3,4,7], gpp_sections=["USNAT","USCA"], google_mappings={"ad_user_data":"denied","ad_personalization":"denied"}, risk_score=0.6)
        s.add_all([v1, v2]); s.commit()

app = FastAPI(title="UCM-AI Local Dev API (DB + Model Service + Cookie Fallback)", version="2.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

PRIVACY_LOGGING = os.getenv("PRIVACY_LOGGING", "false").lower() in ("1","true","yes")

def _log_privacy_headers(request: Request):
    if not PRIVACY_LOGGING:
        return
    try:
        hdrs = {
            "sec-gpc": request.headers.get("sec-gpc"),
            "dnt": request.headers.get("dnt"),
            "user-agent": request.headers.get("user-agent"),
            "sec-ch-ua": request.headers.get("sec-ch-ua"),
            "sec-ch-ua-mobile": request.headers.get("sec-ch-ua-mobile"),
            "sec-ch-ua-platform": request.headers.get("sec-ch-ua-platform"),
            "x-forwarded-for": request.headers.get("x-forwarded-for"),
        }
        with Session(engine) as s:
            s.add(Alert(site="*", type="privacy_headers", details=json.dumps(hdrs)))
            s.commit()
    except Exception:
        pass

# --------- Schemas ---------
class GCMFlags(BaseModel):
    ad_user_data: str = Field(default="denied", pattern="^(granted|denied)$")
    ad_personalization: str = Field(default="denied", pattern="^(granted|denied)$")
    analytics_storage: str = Field(default="denied", pattern="^(granted|denied)$")

class UISchemaPurpose(BaseModel):
    key: str; label: str; description: str; default: bool = False

class UISchema(BaseModel):
    title: str; text: str; locale: str = "en-US"; purposes: List[UISchemaPurpose]

class RuntimeConfig(BaseModel):
    framework: str; gcm: GCMFlags; ui: UISchema; allowedVendors: List[str]

class ConsentChoiceIn(BaseModel):
    vendorId: str; purpose: str; allowed: bool

class ConsentRequest(BaseModel):
    userId: Optional[str] = None; region: str; gpc: bool = False; choices: List[ConsentChoiceIn]; meta: Optional[Dict[str, Any]] = None

class ConsentResponse(BaseModel):
    consentId: str; framework: str; tcfString: Optional[str] = None; gppString: Optional[str] = None; gcmFlags: GCMFlags; savedAt: datetime

class ScanRequest(BaseModel):
    url: str; depth: int = 1; includeSubdomains: bool = False

# --------- Admin API Key ---------
api_key_header = APIKeyHeader(name="X-Admin-Key", auto_error=False)
def require_admin(x_admin_key: str = Depends(api_key_header)):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid admin key")
    return True

# --------- Endpoints ---------
@app.get("/api/ucm/runtime", response_model=RuntimeConfig)
def get_runtime(request: Request, region: str = Query("auto"), gpc: bool = Query(False), x_forwarded_for: Optional[str] = Header(None), sec_gpc: Optional[str] = Header(None)):
    _log_privacy_headers(request)
    # Cookie fallback when region is auto
    cookie_region = (request.cookies.get("ucm_region") or "").upper()
    effective_region = region
    if (not region) or (region.lower() == "auto"):
        effective_region = cookie_region or "US"

    framework = "Base"
    if effective_region.upper() in ("EU","EEA","UK"):
        framework = "TCFv2.2"
    elif effective_region.upper() in ("US","US-CA","US-VA","US-CO","US-CT","US-UT","US-NAT"):
        framework = "GPPv2"

    effective_gpc = bool(gpc) or (sec_gpc == "1")
    gcm = GCMFlags(ad_user_data="denied" if effective_gpc else "granted", ad_personalization="denied" if effective_gpc else "granted", analytics_storage="granted")
    ui = UISchema(title="Your Privacy Choices", text="We use cookies to improve your experience. Adjust your preferences below.",
        purposes=[
            UISchemaPurpose(key="necessary", label="Strictly Necessary", description="Required for site to function.", default=True),
            UISchemaPurpose(key="functional", label="Functional", description="Preferences and features.", default=False),
            UISchemaPurpose(key="analytics", label="Analytics", description="Helps us understand usage.", default=True),
            UISchemaPurpose(key="ads", label="Advertising", description="Personalized ads and tracking.", default=False),
        ])
    allowed = []
    with Session(engine) as s:
        for v in s.query(Vendor).all():
            gm = v.google_mappings or {}
            if ("analytics_storage" in gm) and not effective_gpc: allowed.append(v.id)
            if "ad_user_data" in gm and not effective_gpc: allowed.append(v.id)
    return RuntimeConfig(framework=framework, gcm=gcm, ui=ui, allowedVendors=list(set(allowed)))

@app.post("/api/ucm/consent", response_model=ConsentResponse, status_code=201)
def post_consent(body: ConsentRequest, sec_gpc: Optional[str] = Header(None), request: Request = None):
    if request is not None:
        _log_privacy_headers(request)
    cid = str(uuid4())
    if body.userId is None: body.userId = str(uuid4())
    framework = "TCFv2.2" if body.region.upper() in ("EU","EEA","UK") else "GPPv2"
    tcf = "CPXxRfAPXxRfAAcABBENBRCgAAAAAAAAAAA_gAEMX9f_X__b39v_l9f__9f_l_9f_t0eY1f9_7fi-8Nyd_X_L8X4u_5vV4MyvB36pq4KuR4Eu3LBIQpQIkVCRgIA"
    gpp = "DBABLA~Bbv1qY.AA"
    gcm = {"ad_user_data": "denied", "ad_personalization": "denied", "analytics_storage": "denied"}
    if any(c.purpose=="analytics" and c.allowed for c in body.choices): gcm["analytics_storage"]="granted"
    if any(c.purpose=="ads" and c.allowed for c in body.choices) and not body.gpc:
        gcm["ad_user_data"]="granted"; gcm["ad_personalization"]="granted"
    with Session(engine) as s:
        cs = ConsentSession(id=cid, user_id=body.userId, region=body.region, gpc=body.gpc, framework=framework,
                            tcf_string=tcf if framework=="TCFv2.2" else None, gpp_string=gpp if framework=="GPPv2" else None, gcm_flags=gcm)
        s.add(cs); s.flush()
        for ch in body.choices:
            s.add(ConsentChoice(consent_session_id=cid, vendor_id=ch.vendorId, purpose=ch.purpose, allowed=ch.allowed))
        s.commit()
    return {"consentId": cid, "framework": framework, "tcfString": tcf if framework=="TCFv2.2" else None,
            "gppString": gpp if framework=="GPPv2" else None, "gcmFlags": gcm, "savedAt": datetime.now(timezone.utc)}

@app.get("/api/ucm/consents/{consentId}/receipt")
def get_receipt(consentId: str):
    with Session(engine) as s:
        cs = s.get(ConsentSession, consentId)
        if not cs: raise HTTPException(404, "Consent not found")
        choices = s.query(ConsentChoice).filter(ConsentChoice.consent_session_id==consentId).all()
        return {"consentId": consentId, "userId": cs.user_id, "region": cs.region, "gpc": cs.gpc, "framework": cs.framework,
                "vendors": [ {"vendorId": c.vendor_id, "purpose": c.purpose, "allowed": c.allowed} for c in choices ],
                "cookies": [], "timestamp": cs.created_at.isoformat(), "signature": "sha256-demo-signature"}

@app.post("/api/ucm/scan")
def start_scan(body: ScanRequest):
    # create job
    with Session(engine) as s:
        job = ScanJob(url=body.url, status="running")
        s.add(job); s.flush()
        samples = ["_ga", "_fbp", "__Host-csrf"]
        for name in samples:
            try:
                r = requests.post(f"{MODEL_SVC_URL}/ai/classify", json={"cookieName": name}, timeout=5)
                r.raise_for_status()
                pred = r.json()
            except Exception:
                pred = {"purpose": "unknown", "confidence": 0.5}
            dom = "google-analytics.com" if name=="_ga" else ("facebook.com" if name=="_fbp" else "parentcompany.com")
            cf = CookieFinding(job_id=job.id, name=name, domain=dom, first_party=name.startswith("__Host-"),
                               ttl_seconds=3600 if name.startswith("__Host-") else 7776000,
                               same_site="Lax", secure=True, initiator_script="demo.js",
                               purpose_pred=pred.get("purpose","unknown"), confidence=float(pred.get("confidence",0.5)))
            s.add(cf)
        job.status="complete"; s.commit()
        return {"jobId": job.id, "status": job.status}

@app.get("/api/ucm/scan/{jobId}")
def get_scan(jobId: str):
    with Session(engine) as s:
        job = s.get(ScanJob, jobId)
        if not job: raise HTTPException(404, "Scan not found")
        rows = s.query(CookieFinding).filter(CookieFinding.job_id==jobId).all()
        return {"jobId": job.id, "status": job.status, "findings": [{
            "id": r.id, "name": r.name, "domain": r.domain, "firstParty": r.first_party, "ttlSeconds": r.ttl_seconds,
            "sameSite": r.same_site, "secure": r.secure, "initiatorScript": r.initiator_script,
            "purposePred": r.purpose_pred, "confidence": r.confidence, "detectedAt": r.detected_at.isoformat()
        } for r in rows ]}

@app.post("/api/ucm/anomalies", status_code=204)
def post_anomaly(evt: Dict[str, Any]):
    with Session(engine) as s:
        a = Alert(site=evt.get("site",""), type=evt.get("type",""), cookie_name=evt.get("cookieName"),
                  vendor_id=evt.get("vendorId"), details=evt.get("details"))
        s.add(a); s.commit()
    return {}

@app.get("/api/ucm/vendors")
def list_vendors(q: Optional[str] = None):
    with Session(engine) as s:
        rows = s.query(Vendor).all()
        if q:
            ql = q.lower()
            rows = [v for v in rows if ql in v.name.lower() or ql in v.domain.lower()]
        return [{
            "id": v.id, "name": v.name, "domain": v.domain, "iabPurposes": v.iab_purposes, "gppSections": v.gpp_sections,
            "googleMappings": v.google_mappings, "riskScore": v.risk_score
        } for v in rows]

# Admin endpoints (create/update vendors)
from pydantic import BaseModel
class VendorIn(BaseModel):
    id: Optional[str] = None
    name: str
    domain: str
    iabPurposes: List[int] = []
    gppSections: List[str] = []
    googleMappings: Dict = {}
    riskScore: float = 0.0

@app.post("/api/ucm/vendors", dependencies=[Depends(require_admin)])
def post_vendor(v: VendorIn):
    with Session(engine) as s:
        vid = v.id or str(uuid4())
        row = Vendor(id=vid, name=v.name, domain=v.domain,
                     iab_purposes=v.iabPurposes, gpp_sections=v.gppSections,
                     google_mappings=v.googleMappings, risk_score=v.riskScore)
        s.add(row); s.commit()
        return {"id": vid}

@app.put("/api/ucm/vendors/{vendorId}", dependencies=[Depends(require_admin)])
def put_vendor(vendorId: str, v: VendorIn):
    with Session(engine) as s:
        row = s.get(Vendor, vendorId)
        if not row: raise HTTPException(404, "Vendor not found")
        row.name = v.name or row.name
        row.domain = v.domain or row.domain
        row.iab_purposes = v.iabPurposes or row.iab_purposes
        row.gpp_sections = v.gppSections or row.gpp_sections
        row.google_mappings = v.googleMappings or row.google_mappings
        row.risk_score = v.riskScore if v.riskScore is not None else row.risk_score
        s.commit()
        return {"id": vendorId, "updated": True}


from typing import Literal

@app.get("/api/ucm/audit")
def get_audit(limit: int = 50, type: Optional[Literal["privacy_headers","blocked_set","purpose_drift","unregistered_vendor", "anomaly"]] = None, _: bool = Depends(require_admin)):
    limit = max(1, min(limit, 500))
    with Session(engine) as s:
        q = s.query(Alert).order_by(Alert.occurred_at.desc())
        if type:
            # legacy alias: 'anomaly' covers everything except privacy_headers
            if type == "anomaly":
                q = q.filter(Alert.type != "privacy_headers")
            else:
                q = q.filter(Alert.type == type)
        rows = q.limit(limit).all()
        return [{
            "id": r.id,
            "type": r.type,
            "site": r.site,
            "cookieName": r.cookie_name,
            "vendorId": r.vendor_id,
            "details": r.details,
            "occurredAt": r.occurred_at.isoformat()
        } for r in rows]


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
