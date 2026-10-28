"""
Hospital Portal + Admin for Arogya Gwalior (kept simple, same server / same DB as patients).

Roles:
  - Hospital staff : register (pending) -> admin approves -> login with phone/email + password -> update live data
  - Admin          : login with ADMIN_PASSWORD (env var, default 'admin123') -> approve / reject hospital accounts
Hospital-entered live data (ER status, beds, doctors on duty, phone, hours, Ayushman) is overlaid on the patient
side automatically through gwalior_data.set_live_provider().
"""
import os
import re
import hmac
import hashlib
import secrets
import sqlite3
import threading
import time
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.auth import normalize_phone, PHONE_RE, EMAIL_RE
from backend import gwalior_data

PAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages")
STALE_HOURS = 6
router = APIRouter()


def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _hash(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()


def _bearer(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


class PortalStore:
    def __init__(self, data_dir: str):
        self.conn = sqlite3.connect(os.path.join(data_dir, "users.db"), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        self.fails: Dict[str, list] = {}
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS hospital_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hospital_id TEXT NOT NULL,
                contact_name TEXT NOT NULL,
                phone TEXT UNIQUE,
                email TEXT UNIQUE,
                salt TEXT, pw_hash TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS portal_sessions (
                token TEXT PRIMARY KEY,
                kind TEXT,
                account_id INTEGER,
                created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS hospital_live (
                hospital_id TEXT PRIMARY KEY,
                er_open INTEGER,
                beds_general INTEGER, beds_icu INTEGER, beds_vent INTEGER,
                doctors TEXT, phone TEXT, hours TEXT, ayushman INTEGER,
                updated_at TEXT, updated_by TEXT
            );
        """)
        self.conn.commit()

    # ---- rate limit (5 wrong tries -> 60s lock) ----
    def _locked(self, key: str) -> bool:
        now = time.time()
        self.fails[key] = [t for t in self.fails.get(key, []) if now - t < 60]
        return len(self.fails[key]) >= 5

    def _fail(self, key: str):
        self.fails.setdefault(key, []).append(time.time())

    # ---- sessions ----
    def new_session(self, kind: str, account_id: int) -> str:
        token = secrets.token_urlsafe(32)
        with self.lock:
            self.conn.execute("INSERT INTO portal_sessions VALUES (?,?,?,?)", (token, kind, account_id, _now()))
            self.conn.commit()
        return token

    def session(self, token: Optional[str], kind: str) -> Optional[int]:
        if not token:
            return None
        row = self.conn.execute(
            "SELECT account_id FROM portal_sessions WHERE token=? AND kind=?", (token, kind)).fetchone()
        return row["account_id"] if row else None

    def end_session(self, token: Optional[str]):
        if token:
            with self.lock:
                self.conn.execute("DELETE FROM portal_sessions WHERE token=?", (token,))
                self.conn.commit()

    # ---- live data ----
    def live_rows(self) -> Dict[str, sqlite3.Row]:
        return {r["hospital_id"]: r for r in self.conn.execute("SELECT * FROM hospital_live")}


store: Optional[PortalStore] = None
HOSPITAL_NAMES: Dict[str, str] = {h["id"]: h["name_en"] for h in gwalior_data.GWALIOR_HOSPITALS}


def init_portal(data_dir: str):
    """Call once from main.py. Registers live-data overlay for the patient side."""
    global store
    store = PortalStore(data_dir)
    gwalior_data.set_live_provider(_overlay)
    if os.environ.get("ADMIN_PASSWORD") is None:
        print("[portal] NOTE: using default admin password 'admin123'. Set ADMIN_PASSWORD env var to change it.")


# ---------------- overlay on patient side ----------------
def _ago(updated_at: str, is_hi: bool):
    try:
        mins = int((datetime.now() - datetime.strptime(updated_at, "%Y-%m-%d %H:%M:%S")).total_seconds() // 60)
    except Exception:
        return "", False
    mins = max(mins, 0)
    if mins < 60:
        txt = f"{mins} मिनट पहले" if is_hi else f"{mins} min ago"
    elif mins < 1440:
        txt = f"{mins // 60} घंटे पहले" if is_hi else f"{mins // 60} h ago"
    else:
        txt = f"{mins // 1440} दिन पहले" if is_hi else f"{mins // 1440} d ago"
    return txt, mins > STALE_HOURS * 60


def _overlay(item: Dict[str, Any], is_hi: bool):
    r = store.live_rows().get(item["id"]) if store else None
    if not r:
        return

    def put(key: str, en: str, hi: str):
        item[key + "_en"], item[key + "_hi"] = en, hi
        item[key] = hi if is_hi else en

    if r["er_open"] is not None:
        if r["er_open"]:
            put("emergency_room", "🟢 Emergency Open (confirmed by hospital)", "🟢 इमरजेंसी चालू (अस्पताल द्वारा पुष्टि)")
        else:
            put("emergency_room", "🔴 Emergency Closed / Beds Full", "🔴 इमरजेंसी बंद / बेड फुल")

    if any(r[k] is not None for k in ("beds_general", "beds_icu", "beds_vent")):
        en, hi = [], []
        for col, ne, nh in (("beds_general", "General", "सामान्य"), ("beds_icu", "ICU", "आईसीयू"),
                            ("beds_vent", "Ventilator", "वेंटिलेटर")):
            if r[col] is not None:
                en.append(f"{ne}: {r[col]}")
                hi.append(f"{nh}: {r[col]}")
        put("beds_detail", "🛏️ Free beds - " + " | ".join(en), "🛏️ खाली बेड - " + " | ".join(hi))

    if r["doctors"]:
        put("doctor_available", f"👨‍⚕️ On Duty: {r['doctors']}", f"👨‍⚕️ उपलब्ध डॉक्टर: {r['doctors']}")
    if r["hours"]:
        put("opening_hours", r["hours"], r["hours"])
    if r["phone"]:
        item["phone"] = r["phone"]
    if r["ayushman"] is not None:
        item["ayushman_accepted"] = bool(r["ayushman"])

    ago_hi, stale = _ago(r["updated_at"], True)
    ago_en, _ = _ago(r["updated_at"], False)
    if stale:
        tail_en, tail_hi = f" · ⚠️ May be outdated (updated {ago_en})", f" · ⚠️ जानकारी पुरानी हो सकती है ({ago_hi} अपडेट)"
    else:
        tail_en, tail_hi = f" · 🕒 Updated {ago_en}", f" · 🕒 {ago_hi} अपडेट हुआ"
    item["beds_detail_en"] += tail_en
    item["beds_detail_hi"] += tail_hi
    item["beds_detail"] = item["beds_detail_hi"] if is_hi else item["beds_detail_en"]
    item["live_data"] = True
    item["last_updated"] = r["updated_at"]
    item["data_stale"] = stale


# ---------------- models ----------------
class RegisterReq(BaseModel):
    hospital_id: str
    contact_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str


class HospitalLoginReq(BaseModel):
    login: str
    password: str


class UpdateReq(BaseModel):
    er_open: Optional[bool] = None
    beds_general: Optional[int] = None
    beds_icu: Optional[int] = None
    beds_vent: Optional[int] = None
    doctors: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    ayushman: Optional[bool] = None


class AdminLoginReq(BaseModel):
    password: str


class StatusReq(BaseModel):
    status: str


# ---------------- hospital endpoints ----------------
@router.get("/api/hospital/list")
def hospital_list():
    return [{"id": k, "name": v} for k, v in HOSPITAL_NAMES.items()]


@router.post("/api/hospital/register")
def hospital_register(req: RegisterReq):
    name = req.contact_name.strip()
    phone = normalize_phone(req.phone)
    email = (req.email or "").strip().lower()
    if req.hospital_id not in HOSPITAL_NAMES:
        raise HTTPException(400, "Please select your hospital.")
    if len(name) < 2:
        raise HTTPException(400, "Please enter contact person name.")
    if not phone and not email:
        raise HTTPException(400, "Enter a phone number or an email.")
    if phone and not PHONE_RE.match(phone):
        raise HTTPException(400, "Enter a valid 10-digit mobile number.")
    if email and not EMAIL_RE.match(email):
        raise HTTPException(400, "Enter a valid email address.")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    salt = secrets.token_hex(8)
    try:
        with store.lock:
            store.conn.execute(
                "INSERT INTO hospital_accounts (hospital_id, contact_name, phone, email, salt, pw_hash, status, created_at) "
                "VALUES (?,?,?,?,?,?, 'pending', ?)",
                (req.hospital_id, name, phone or None, email or None, salt, _hash(req.password, salt), _now()))
            store.conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(400, "This phone/email is already registered.")
    return {"status": "pending", "message": "Registered. Wait for admin approval, then login."}


@router.post("/api/hospital/login")
def hospital_login(req: HospitalLoginReq):
    key = "h:" + req.login.strip().lower()
    if store._locked(key):
        raise HTTPException(429, "Too many attempts. Try again in a minute.")
    raw = req.login.strip().lower()
    phone = normalize_phone(raw) if "@" not in raw else ""
    row = store.conn.execute(
        "SELECT * FROM hospital_accounts WHERE (phone=? AND ?!='') OR email=?", (phone, phone, raw)).fetchone()
    if not row or not hmac.compare_digest(_hash(req.password, row["salt"]), row["pw_hash"]):
        store._fail(key)
        raise HTTPException(401, "Wrong phone/email or password.")
    if row["status"] == "pending":
        raise HTTPException(403, "Your account is waiting for admin approval.")
    if row["status"] == "rejected":
        raise HTTPException(403, "Your registration was rejected. Contact admin.")
    return {"status": "success", "token": store.new_session("hospital", row["id"])}


def _hospital_account(authorization: Optional[str]) -> sqlite3.Row:
    aid = store.session(_bearer(authorization), "hospital")
    row = store.conn.execute("SELECT * FROM hospital_accounts WHERE id=?", (aid,)).fetchone() if aid else None
    if not row or row["status"] != "approved":
        raise HTTPException(401, "Not logged in")
    return row


@router.get("/api/hospital/me")
def hospital_me(authorization: Optional[str] = Header(None)):
    acc = _hospital_account(authorization)
    live = store.conn.execute("SELECT * FROM hospital_live WHERE hospital_id=?", (acc["hospital_id"],)).fetchone()
    return {
        "account": {"contact_name": acc["contact_name"], "phone": acc["phone"] or "", "email": acc["email"] or ""},
        "hospital": {"id": acc["hospital_id"], "name": HOSPITAL_NAMES.get(acc["hospital_id"], acc["hospital_id"])},
        "live": dict(live) if live else None,
    }


def _clean_int(v: Optional[int], label: str) -> Optional[int]:
    if v is None:
        return None
    if v < 0 or v > 9999:
        raise HTTPException(400, f"{label} must be between 0 and 9999.")
    return v


@router.put("/api/hospital/update")
def hospital_update(req: UpdateReq, authorization: Optional[str] = Header(None)):
    acc = _hospital_account(authorization)
    doctors = (req.doctors or "").strip()[:200] or None
    hours = (req.hours or "").strip()[:100] or None
    phone = (req.phone or "").strip()[:30] or None
    if phone and not re.match(r"^[0-9+\-\s]{6,20}$", phone):
        raise HTTPException(400, "Enter a valid phone number.")
    vals = (
        None if req.er_open is None else int(req.er_open),
        _clean_int(req.beds_general, "General beds"), _clean_int(req.beds_icu, "ICU beds"),
        _clean_int(req.beds_vent, "Ventilators"),
        doctors, phone, hours, None if req.ayushman is None else int(req.ayushman),
        _now(), acc["contact_name"],
    )
    with store.lock:
        store.conn.execute(
            "INSERT OR REPLACE INTO hospital_live (hospital_id, er_open, beds_general, beds_icu, beds_vent, doctors, "
            "phone, hours, ayushman, updated_at, updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (acc["hospital_id"],) + vals)
        store.conn.commit()
    return {"status": "success", "updated_at": vals[8]}


@router.post("/api/hospital/logout")
def hospital_logout(authorization: Optional[str] = Header(None)):
    store.end_session(_bearer(authorization))
    return {"status": "success"}


# ---------------- admin endpoints ----------------
def _admin(authorization: Optional[str]):
    if store.session(_bearer(authorization), "admin") is None:
        raise HTTPException(401, "Admin login required")


@router.post("/api/admin/login")
def admin_login(req: AdminLoginReq):
    if store._locked("admin"):
        raise HTTPException(429, "Too many attempts. Try again in a minute.")
    real = os.environ.get("ADMIN_PASSWORD", "admin123")
    if not hmac.compare_digest(req.password.encode(), real.encode()):
        store._fail("admin")
        raise HTTPException(401, "Wrong admin password.")
    return {"status": "success", "token": store.new_session("admin", 0)}


@router.get("/api/admin/hospitals")
def admin_hospitals(authorization: Optional[str] = Header(None)):
    _admin(authorization)
    live = store.live_rows()
    rows = store.conn.execute("SELECT * FROM hospital_accounts ORDER BY id DESC").fetchall()
    return {
        "accounts": [{
            "id": r["id"], "hospital": HOSPITAL_NAMES.get(r["hospital_id"], r["hospital_id"]),
            "contact_name": r["contact_name"], "phone": r["phone"] or "", "email": r["email"] or "",
            "status": r["status"], "created_at": r["created_at"],
            "last_update": live[r["hospital_id"]]["updated_at"] if r["hospital_id"] in live else None,
        } for r in rows],
        "hospitals_total": len(HOSPITAL_NAMES),
        "hospitals_with_live_data": len(live),
    }


@router.post("/api/admin/account/{account_id}/status")
def admin_set_status(account_id: int, req: StatusReq, authorization: Optional[str] = Header(None)):
    _admin(authorization)
    if req.status not in ("approved", "rejected", "pending"):
        raise HTTPException(400, "Invalid status")
    with store.lock:
        store.conn.execute("UPDATE hospital_accounts SET status=? WHERE id=?", (req.status, account_id))
        if req.status != "approved":  # kick out any active sessions of that account
            store.conn.execute("DELETE FROM portal_sessions WHERE kind='hospital' AND account_id=?", (account_id,))
        store.conn.commit()
    return {"status": "success"}


@router.post("/api/admin/logout")
def admin_logout(authorization: Optional[str] = Header(None)):
    store.end_session(_bearer(authorization))
    return {"status": "success"}


# ---------------- pages ----------------
@router.get("/hospital", include_in_schema=False)
def hospital_page():
    return FileResponse(os.path.join(PAGES_DIR, "hospital.html"))


@router.get("/admin", include_in_schema=False)
def admin_page():
    return FileResponse(os.path.join(PAGES_DIR, "admin.html"))
