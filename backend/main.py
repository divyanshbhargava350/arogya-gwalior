"""
FastAPI Backend Application for SANJEEVANI: Agentic Healthcare Intelligence System.
Endpoints:
  /api/search             - Natural language + GPS facility search
  /api/ai/consult         - Dr. Sanjeevani AI symptom verification & OTC medicine guidance
  /api/gwalior/specialties- Categorized Gwalior & MP hospitals (Eye, Heart, Kidney, Trauma, etc.)
  /api/gwalior/localities - Gwalior locality coordinates and reference points
  /api/facility/{id}      - Full facility inspection drilldown
  /api/deserts            - PIN code & district healthcare desert analysis
  /api/evaluate           - Ground-truth evaluation benchmarks & confusion matrices
  /api/scenarios/bihar    - Hero Scenario 1 (Ananya, Samastipur)
  /api/scenarios/gwalior  - Hero Scenario 2 (Gwalior Real OSM Night Surgery)
  /api/stats              - Dataset profile and distribution statistics
  /api/trace/{id}         - Claim verification and raw note evidence highlighter
  /api/voice              - Multi-lingual voice symptom transcription/interpretation
  /api/auth/login|me|logout - Name + phone/email login; pages at /login and /dashboard
"""
import os
import time
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.data_loader import FacilityRepository, GWALIOR_LOCALITIES
from backend.gwalior_data import get_gwalior_hospitals, get_gwalior_medicals
from backend.extractor import ExtractorAgent
from backend.trust_scorer import TrustScorer
from backend.validator import ValidatorAgent
from backend.reasoner import ReasonerAgent
from backend.desert_analyzer import DesertAnalyzer
from backend.evaluator import SystemEvaluator
from backend.ai_consultant import AIConsultantAgent
from backend.auth import AuthStore
from backend import hospital_portal

app = FastAPI(
    title="SANJEEVANI Healthcare Intelligence API",
    description="Agentic Healthcare Intelligence System for India - Finding the right facility at this moment, not just the nearest.",
    version="2.1.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
PAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages")

repo = FacilityRepository(DATA_DIR)
extractor = ExtractorAgent()
scorer = TrustScorer()
validator = ValidatorAgent()
reasoner = ReasonerAgent(repo)
desert_analyzer = DesertAnalyzer(repo)
evaluator = SystemEvaluator(DATA_DIR, repo)
ai_consultant = AIConsultantAgent()
auth_store = AuthStore(DATA_DIR)
hospital_portal.init_portal(DATA_DIR)
app.include_router(hospital_portal.router)

class SearchRequest(BaseModel):
    query: str
    latitude: float
    longitude: float
    radius_km: Optional[float] = 50.0
    language: Optional[str] = "en"

class VoiceRequest(BaseModel):
    transcript: str
    language: Optional[str] = "hi"
    latitude: Optional[float] = 26.2140
    longitude: Optional[float] = 78.1910

class SymptomConsultRequest(BaseModel):
    symptom: str
    age: Optional[int] = 30
    duration_days: Optional[int] = 1
    latitude: Optional[float] = 26.2140
    longitude: Optional[float] = 78.1910
    locality: Optional[str] = "City Center"
    lang: Optional[str] = "hi"

class LoginRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

def _bearer(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    """Login / auto-register with name + (phone or email). No OTP, kept simple."""
    try:
        res = auth_store.login(req.name, req.phone, req.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "success", **res}

@app.get("/api/auth/me")
def auth_me(authorization: Optional[str] = Header(None)):
    user = auth_store.get_user(_bearer(authorization))
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return {"status": "success", "user": user}

@app.post("/api/auth/logout")
def auth_logout(authorization: Optional[str] = Header(None)):
    auth_store.logout(_bearer(authorization))
    return {"status": "success"}

@app.get("/login", include_in_schema=False)
def login_page():
    return FileResponse(os.path.join(PAGES_DIR, "login.html"))

@app.get("/dashboard", include_in_schema=False)
def dashboard_page():
    return FileResponse(os.path.join(PAGES_DIR, "dashboard.html"))

@app.get("/api/gwalior/medicals")
def get_medicals(
    lat: Optional[float] = Query(26.2140),
    lon: Optional[float] = Query(78.1910),
    lang: Optional[str] = Query("hi")
):
    """
    Returns verified Gwalior medical stores & 24x7 pharmacies sorted by distance
    with dual-language services, discount info, phone and whatsapp.
    """
    meds = get_gwalior_medicals(user_lat=lat, user_lon=lon, lang=lang or "hi")
    return {
        "language": lang,
        "user_location": {"latitude": lat, "longitude": lon},
        "total_count": len(meds),
        "total_found": len(meds),
        "medicals": meds
    }

@app.get("/api/info")
def get_info():
    return {
        "service": "SANJEEVANI Agentic Healthcare Intelligence System",
        "status": "online",
        "version": "2.1.0",
        "facilities_indexed": len(repo.get_all()),
        "endpoints": [
            "/api/ai/consult",
            "/api/gwalior/specialties",
            "/api/gwalior/localities",
            "/api/search",
            "/api/facility/{id}",
            "/api/deserts",
            "/api/evaluate",
            "/api/scenarios/bihar",
            "/api/scenarios/gwalior",
            "/api/stats",
            "/api/trace/{id}"
        ]
    }

@app.get("/api/gwalior/localities")
def get_gwalior_localities():
    """Return Gwalior & MP reference localities with coordinates."""
    return GWALIOR_LOCALITIES

@app.get("/api/gwalior/specialties")
def get_gwalior_specialties(
    category: str = Query("all"),
    lat: Optional[float] = Query(26.2140),
    lon: Optional[float] = Query(78.1910),
    lang: Optional[str] = Query("hi")
):
    """
    Get Gwalior and Madhya Pradesh hospitals categorized by specialty
    (eye, heart, kidney, trauma, cancer, maternity, general, all)
    with 100% dual-language support (Hindi / English), 24x7 ER status,
    available doctors on duty, and vacant beds.
    """
    facilities = get_gwalior_hospitals(
        category=category,
        user_lat=lat,
        user_lon=lon,
        lang=lang or "hi"
    )
    return {
        "category": category,
        "language": lang,
        "user_location": {"latitude": lat, "longitude": lon},
        "total_count": len(facilities),
        "facilities": facilities
    }

@app.post("/api/ai/consult")
def consult_ai_agent(req: SymptomConsultRequest):
    """
    Dr. Sanjeevani AI Agent:
    - Evaluates symptoms in Hindi and English (fever, cold, cough, headache, acidity, diarrhea, heart, eye, kidney, trauma)
    - Verifies age, duration, and red-flag danger signs
    - Provides evidence-based OTC drug recommendations with safe dosages and precautions
    - Recommends nearest specialized Gwalior/MP hospitals based on user's location!
    """
    evaluation = ai_consultant.evaluate_symptom(
        symptom_text=req.symptom,
        age=req.age,
        duration_days=req.duration_days,
        lang=req.lang or "hi"
    )

    # Retrieve relevant nearby Gwalior facilities based on triaged category
    cat = evaluation.get("category") or "general"
    nearby_hospitals = get_gwalior_hospitals(
        category=cat if cat != "general" else "all",
        user_lat=req.latitude,
        user_lon=req.longitude,
        lang=req.lang or "hi"
    )[:4]

    nearby_medicals = get_gwalior_medicals(
        user_lat=req.latitude,
        user_lon=req.longitude,
        lang=req.lang or "hi"
    )[:4]

    return {
        "symptom_query": req.symptom,
        "patient_profile": {
            "age": req.age,
            "duration_days": req.duration_days,
            "locality": req.locality
        },
        "evaluation": evaluation,
        "recommended_gwalior_hospitals": nearby_hospitals,
        "recommended_gwalior_medicals": nearby_medicals
    }

@app.get("/api/stats")
def get_stats():
    facilities = repo.get_all()
    states = {}
    districts = {}
    types = {}
    datasets = {}
    categories = {}
    missing_pin = 0
    missing_lat = 0
    missing_phone = 0

    for f in facilities:
        st = f.get("state", "Unknown")
        dt = f.get("district", "Unknown")
        tp = f.get("facility_type", "Unknown")
        ds = f.get("dataset", "Unknown")
        ct = f.get("category", "general")

        states[st] = states.get(st, 0) + 1
        districts[dt] = districts.get(dt, 0) + 1
        types[tp] = types.get(tp, 0) + 1
        datasets[ds] = datasets.get(ds, 0) + 1
        categories[ct] = categories.get(ct, 0) + 1

        if f.get("pincode_inferred"):
            missing_pin += 1
        if f.get("location_approximate"):
            missing_lat += 1
        if not f.get("phone"):
            missing_phone += 1

    return {
        "total_facilities": len(facilities),
        "categories": categories,
        "datasets": datasets,
        "states": sorted([{"state": k, "count": v} for k, v in states.items()], key=lambda x: x["count"], reverse=True),
        "types": sorted([{"type": k, "count": v} for k, v in types.items()], key=lambda x: x["count"], reverse=True),
        "data_quality": {
            "missing_pincode_imputed": missing_pin,
            "approximate_location_imputed": missing_lat,
            "missing_phone": missing_phone
        }
    }

@app.post("/api/search")
def search(req: SearchRequest):
    return reasoner.process_query(
        query=req.query,
        user_lat=req.latitude,
        user_lon=req.longitude,
        radius_km=req.radius_km or 50.0
    )

@app.get("/api/search")
def search_get(
    q: str = Query("emergency surgery"),
    lat: float = Query(26.2140),
    lon: float = Query(78.1910),
    radius: float = Query(50.0),
    lang: str = Query("en")
):
    return reasoner.process_query(query=q, user_lat=lat, user_lon=lon, radius_km=radius)

@app.get("/api/facility/{facility_id}")
def get_facility_detail(facility_id: str):
    fac = repo.get_facility(facility_id)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    notes = fac.get("unstructured_notes", "")
    dataset = fac.get("dataset", "")
    ext = extractor.extract(notes, facility_id=facility_id, dataset=dataset)
    trust = scorer.evaluate(fac, ext)
    val = validator.validate(fac, ext, "appendectomy")

    return {
        "facility": fac,
        "extracted_capabilities": ext,
        "trust_evaluation": trust,
        "surgical_validation": val,
        "raw_notes": notes
    }

@app.get("/api/deserts")
def get_deserts():
    return desert_analyzer.analyze()

@app.get("/api/evaluate")
def run_evaluation(sample_size: int = Query(1000)):
    return evaluator.run_full_evaluation(sample_size=sample_size)

@app.get("/api/scenarios/bihar")
def get_bihar_scenario():
    """Hero Scenario 1: Ananya, Samastipur Bihar, lat 25.90, lon 85.78."""
    return reasoner.process_query(
        query="Severe abdominal pain, need emergency appendectomy, nearest option, part-time doctors are okay.",
        user_lat=25.90,
        user_lon=85.78,
        radius_km=45.0
    )

@app.get("/api/scenarios/gwalior")
def get_gwalior_scenario():
    """Hero Scenario 2: Gwalior real map night emergency surgery, lat 26.22, lon 78.18."""
    return reasoner.process_query(
        query="Gwalior me raat ko emergency surgery ke liye sabse paas ka hospital jahan anaesthetist ho.",
        user_lat=26.22,
        user_lon=78.18,
        radius_km=30.0
    )

@app.get("/api/trace/{facility_id}")
def get_trace(facility_id: str):
    fac = repo.get_facility(facility_id)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    notes = fac.get("unstructured_notes", "")
    ext = extractor.extract(notes, facility_id=facility_id, dataset=fac.get("dataset", ""))
    trust = scorer.evaluate(fac, ext)

    return {
        "facility_id": facility_id,
        "facility_name": fac.get("name"),
        "dataset": fac.get("dataset"),
        "notes_source": fac.get("notes_source"),
        "survey_year": fac.get("survey_year"),
        "raw_unstructured_notes": notes,
        "evidence_quote": ext.get("evidence_quote"),
        "red_flags": trust.get("red_flags"),
        "green_flags": trust.get("green_flags"),
        "confidence": trust.get("confidence")
    }

@app.post("/api/voice")
def process_voice(req: VoiceRequest):
    transcript = req.transcript
    res = reasoner.process_query(
        query=transcript,
        user_lat=req.latitude or 26.2140,
        user_lon=req.longitude or 78.1910,
        radius_km=45.0
    )
    top = res.get("top_recommendation")
    spoken_summary = ""
    if top:
        if req.language in ["hi", "bho", "mai"]:
            spoken_summary = f"आपके पास सबसे सही अस्पताल {top['name']} है, जो {top['distance_km']} किलोमीटर दूर है।"
        else:
            spoken_summary = f"The safest verified facility for your condition is {top['name']}, located {top['distance_km']} kilometers away."

    return {
        "recognized_transcript": transcript,
        "language": req.language,
        "spoken_response": spoken_summary,
        "search_results": res
    }

# Mount static frontend production build if available
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    is_dev = os.environ.get("ENV", "production").lower() == "development"
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=is_dev)
