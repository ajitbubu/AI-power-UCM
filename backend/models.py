from sqlalchemy import Column, String, Boolean, Integer, Float, JSON, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime, timezone

Base = declarative_base()

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    iab_purposes = Column(JSON, default=list)
    gpp_sections = Column(JSON, default=list)
    google_mappings = Column(JSON, default=dict)
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ConsentSession(Base):
    __tablename__ = "consent_sessions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    region = Column(String, nullable=False)
    gpc = Column(Boolean, default=False)
    framework = Column(String, nullable=False)
    tcf_string = Column(Text, nullable=True)
    gpp_string = Column(Text, nullable=True)
    gcm_flags = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ConsentChoice(Base):
    __tablename__ = "consent_choices"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    consent_session_id = Column(String, ForeignKey("consent_sessions.id"), nullable=False)
    vendor_id = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    allowed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ScanJob(Base):
    __tablename__ = "scan_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    url = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CookieFinding(Base):
    __tablename__ = "cookie_findings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("scan_jobs.id"), nullable=False)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    first_party = Column(Boolean, default=False)
    ttl_seconds = Column(Integer, nullable=True)
    same_site = Column(String, nullable=True)
    secure = Column(Boolean, default=False)
    initiator_script = Column(String, nullable=True)
    purpose_pred = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    site = Column(String, nullable=False)
    type = Column(String, nullable=False)
    cookie_name = Column(String, nullable=True)
    vendor_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    occurred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
