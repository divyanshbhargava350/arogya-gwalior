"""
Data loader and unified repository for Sanjeevani.
Loads gwalior_facilities.csv, gwalior_demo_notes.csv, india_10k_synthetic.csv.
Performs schema normalization, specialty categorization, deduplication, lat/long & pincode imputation.
"""
import os
import csv
import math
import sqlite3
from typing import List, Dict, Any, Optional
from backend.schema_config import map_row, DISTRICT_CENTROIDS

# Gwalior Localities Reference Coordinates
GWALIOR_LOCALITIES = {
    "Lashkar": {"lat": 26.2052, "lon": 78.1610, "label": "Lashkar (Maharaj Bada / Kampoo)"},
    "City Center": {"lat": 26.2140, "lon": 78.1910, "label": "City Center (Madhav Rao Scindia Marg)"},
    "Morar": {"lat": 26.2280, "lon": 78.2250, "label": "Morar (Mall Road / Civil Hospital)"},
    "Thatipur": {"lat": 26.2210, "lon": 78.2040, "label": "Thatipur / Gandhi Nagar"},
    "Kampoo": {"lat": 26.2032, "lon": 78.1578, "label": "Kampoo (JAH & GRMC Medical Campus)"},
    "Padav": {"lat": 26.2195, "lon": 78.1750, "label": "Padav (Railway Station Area)"},
    "Hazira": {"lat": 26.2300, "lon": 78.1700, "label": "Hazira / Fort Road"},
    "Dabra": {"lat": 25.8950, "lon": 78.3320, "label": "Dabra (Gwalior Rural, MP)"},
    "Morena": {"lat": 26.4950, "lon": 77.9920, "label": "Morena District Hospital (MP)"},
    "Bhind": {"lat": 26.5650, "lon": 78.7840, "label": "Bhind District Hospital (MP)"}
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth's radius in km
    p = math.pi / 180.0
    dlat = (lat2 - lat1) * p
    dlon = (lon2 - lon1) * p
    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def derive_category(name: str, facility_type: str, specialties: str, notes: str) -> str:
    combined = f"{name} {facility_type} {specialties} {notes}".lower()
    if any(w in combined for w in ["eye", "ophthalm", "netra", "cataract", "retina", "lasik", "vision"]):
        return "eye"
    if any(w in combined for w in ["heart", "cardio", "dil", "cath lab", "angioplasty", "bypass", "ccu"]):
        return "heart"
    if any(w in combined for w in ["kidney", "nephro", "dialysis", "renal", "gurda", "urolog"]):
        return "kidney"
    if any(w in combined for w in ["cancer", "oncol", "chemo", "radiation"]):
        return "cancer"
    if any(w in combined for w in ["trauma", "ortho", "accident", "fracture", "haddi"]):
        return "trauma"
    if any(w in combined for w in ["maternity", "pediatric", "women", "gynaec", "shishu", "delivery", "krh", "baby"]):
        return "maternity"
    return "general"

class FacilityRepository:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.facilities: Dict[str, Dict[str, Any]] = {}
        self.db_path = ":memory:"
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_db()
        self.load_all()

    def _init_db(self):
        cur = self.conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS facilities (
                facility_id TEXT PRIMARY KEY,
                name TEXT,
                facility_type TEXT,
                ownership TEXT,
                state TEXT,
                district TEXT,
                locality TEXT,
                pincode TEXT,
                address TEXT,
                latitude REAL,
                longitude REAL,
                phone TEXT,
                beds_listed INTEGER,
                category TEXT,
                specialties_listed TEXT,
                emergency_listed TEXT,
                icu_listed TEXT,
                survey_year TEXT,
                unstructured_notes TEXT,
                dataset TEXT,
                notes_source TEXT,
                is_demo INTEGER DEFAULT 0,
                location_approximate INTEGER DEFAULT 0,
                pincode_inferred INTEGER DEFAULT 0
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_district ON facilities(district)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_state ON facilities(state)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_category ON facilities(category)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_dataset ON facilities(dataset)")
        self.conn.commit()

    def load_all(self):
        # 1. Load Gwalior Demo Notes layer
        gwalior_notes = {}
        gwl_notes_path = os.path.join(self.data_dir, "gwalior_demo_notes.csv")
        if os.path.exists(gwl_notes_path):
            with open(gwl_notes_path, mode="r", encoding="utf-8") as f:
                r = csv.DictReader(f)
                for row in r:
                    gwalior_notes[row["facility_id"]] = {
                        "notes_source": row.get("notes_source", "SYNTHETIC_DEMO"),
                        "simulated_notes": row.get("simulated_notes", ""),
                        "simulated_year": row.get("simulated_year", "2023")
                    }

        # 2. Load Gwalior & Madhya Pradesh facilities
        gwl_fac_path = os.path.join(self.data_dir, "gwalior_facilities.csv")
        if os.path.exists(gwl_fac_path):
            with open(gwl_fac_path, mode="r", encoding="utf-8") as f:
                r = csv.DictReader(f)
                for row in r:
                    mapped = map_row(row, "gwalior_osm")
                    fid = row.get("facility_id") or mapped.get("facility_id")
                    
                    demo_info = gwalior_notes.get(fid, {})
                    is_demo = 1 if demo_info else 0
                    notes_source = demo_info.get("notes_source", "GWALIOR_REGISTRY") if demo_info else "GWALIOR_REGISTRY"
                    
                    notes = row.get("unstructured_notes") or mapped.get("unstructured_notes", "")
                    if demo_info and demo_info.get("simulated_notes"):
                        notes = demo_info["simulated_notes"]

                    lat_val = row.get("latitude") or mapped.get("latitude")
                    lon_val = row.get("longitude") or mapped.get("longitude")
                    pin_val = str(row.get("pincode") or mapped.get("pincode", "")).strip()

                    loc_approx = 0
                    pin_inferred = 0

                    try:
                        lat = float(lat_val)
                        lon = float(lon_val)
                    except (ValueError, TypeError):
                        lat, lon, def_pin = DISTRICT_CENTROIDS.get("Gwalior", (26.2183, 78.1828, 474001))
                        loc_approx = 1

                    if not pin_val or pin_val == "0" or len(pin_val) != 6:
                        pin_val = "474001"
                        pin_inferred = 1

                    try:
                        beds = int(float(row.get("beds_listed") or mapped.get("beds_listed") or 0))
                    except (ValueError, TypeError):
                        beds = 0

                    name = row.get("name") or mapped.get("name", "Medical Facility")
                    ftype = row.get("facility_type") or mapped.get("facility_type", "Hospital")
                    specs = row.get("specialties_listed") or mapped.get("specialties_listed", "")
                    cat = row.get("category") or derive_category(name, ftype, specs, notes)
                    locality = row.get("locality") or "City Center"

                    record = {
                        "facility_id": fid,
                        "name": name,
                        "facility_type": ftype,
                        "ownership": row.get("ownership") or mapped.get("ownership", "Private"),
                        "state": row.get("state") or mapped.get("state", "Madhya Pradesh"),
                        "district": row.get("district") or mapped.get("district", "Gwalior"),
                        "locality": locality,
                        "pincode": pin_val,
                        "address": row.get("address") or mapped.get("address", "Gwalior, Madhya Pradesh"),
                        "latitude": lat,
                        "longitude": lon,
                        "phone": row.get("phone") or mapped.get("phone", "0751-2403200"),
                        "beds_listed": beds,
                        "category": cat,
                        "specialties_listed": specs,
                        "emergency_listed": row.get("emergency_listed") or mapped.get("emergency_listed", "Yes"),
                        "icu_listed": row.get("icu_listed") or mapped.get("icu_listed", ""),
                        "survey_year": row.get("survey_year") or mapped.get("survey_year", "2023"),
                        "unstructured_notes": notes,
                        "dataset": "gwalior_specialties",
                        "notes_source": notes_source,
                        "is_demo": is_demo,
                        "location_approximate": loc_approx,
                        "pincode_inferred": pin_inferred
                    }
                    self._insert_facility(record)

        # 3. Load India 10k Synthetic dataset
        india_path = os.path.join(self.data_dir, "india_10k_synthetic.csv")
        if os.path.exists(india_path):
            with open(india_path, mode="r", encoding="utf-8") as f:
                r = csv.DictReader(f)
                for row in r:
                    mapped = map_row(row, "india10k_synthetic")
                    fid = mapped["facility_id"]
                    dist = mapped.get("district", "Patna")
                    pin = str(mapped.get("pincode", "")).strip()

                    loc_approx = 0
                    pin_inferred = 0

                    lat_raw = mapped.get("latitude")
                    lon_raw = mapped.get("longitude")

                    try:
                        if not lat_raw or not lon_raw:
                            raise ValueError()
                        lat = float(lat_raw)
                        lon = float(lon_raw)
                    except (ValueError, TypeError):
                        c_lat, c_lon, c_pin = DISTRICT_CENTROIDS.get(dist, (25.5941, 85.1376, 800001))
                        lat = c_lat
                        lon = c_lon
                        loc_approx = 1

                    if not pin or pin == "0" or len(pin) != 6:
                        _, _, c_pin = DISTRICT_CENTROIDS.get(dist, (25.5941, 85.1376, 800001))
                        pin = str(c_pin)
                        pin_inferred = 1

                    try:
                        beds = int(float(mapped.get("beds_listed") or 0))
                    except (ValueError, TypeError):
                        beds = 0

                    name = mapped.get("name", "Hospital")
                    ftype = mapped.get("facility_type", "Hospital")
                    specs = mapped.get("specialties_listed", "")
                    notes = mapped.get("unstructured_notes", "")
                    cat = derive_category(name, ftype, specs, notes)

                    record = {
                        "facility_id": fid,
                        "name": name,
                        "facility_type": ftype,
                        "ownership": mapped.get("ownership", "Private"),
                        "state": mapped.get("state", "Bihar"),
                        "district": dist,
                        "locality": dist,
                        "pincode": pin,
                        "address": mapped.get("address", ""),
                        "latitude": lat,
                        "longitude": lon,
                        "phone": mapped.get("phone", ""),
                        "beds_listed": beds,
                        "category": cat,
                        "specialties_listed": specs,
                        "emergency_listed": mapped.get("emergency_listed", ""),
                        "icu_listed": mapped.get("icu_listed", ""),
                        "survey_year": mapped.get("survey_year", "2022"),
                        "unstructured_notes": notes,
                        "dataset": "india10k_synthetic",
                        "notes_source": "SYNTHETIC_DATASET",
                        "is_demo": 0,
                        "location_approximate": loc_approx,
                        "pincode_inferred": pin_inferred
                    }
                    self._insert_facility(record)

        self.conn.commit()
        print(f"Loaded {len(self.facilities)} total facilities into repository.")

    def _insert_facility(self, rec: Dict[str, Any]):
        fid = rec["facility_id"]
        self.facilities[fid] = rec
        cur = self.conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO facilities VALUES (
                :facility_id, :name, :facility_type, :ownership, :state, :district,
                :locality, :pincode, :address, :latitude, :longitude, :phone,
                :beds_listed, :category, :specialties_listed, :emergency_listed,
                :icu_listed, :survey_year, :unstructured_notes, :dataset,
                :notes_source, :is_demo, :location_approximate, :pincode_inferred
            )
        """, rec)

    def get_facility(self, facility_id: str) -> Optional[Dict[str, Any]]:
        return self.facilities.get(facility_id)

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self.facilities.values())

    def get_gwalior_mp_facilities(self, category: Optional[str] = None, user_lat: Optional[float] = None, user_lon: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Get Gwalior & Madhya Pradesh hospitals filtered by specialty category
        and sorted by distance from user_lat, user_lon.
        """
        ref_lat = user_lat if user_lat is not None else 26.2140 # Gwalior City Center default
        ref_lon = user_lon if user_lon is not None else 78.1910

        cur = self.conn.cursor()
        if category and category.lower() != "all":
            cur.execute("""
                SELECT * FROM facilities
                WHERE (state = 'Madhya Pradesh' OR district = 'Gwalior')
                  AND category = ?
            """, (category.lower(),))
        else:
            cur.execute("""
                SELECT * FROM facilities
                WHERE state = 'Madhya Pradesh' OR district = 'Gwalior'
            """)

        rows = [dict(r) for r in cur.fetchall()]
        for r in rows:
            dist = haversine_distance(ref_lat, ref_lon, r["latitude"], r["longitude"])
            r["distance_km"] = dist
            r["estimated_eta_mins"] = max(5, int(dist * 2.2))

        rows.sort(key=lambda x: x["distance_km"])
        return rows

    def search_nearby(self, lat: float, lon: float, radius_km: float = 50.0, district: Optional[str] = None) -> List[Dict[str, Any]]:
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-6)

        cur = self.conn.cursor()
        query = """
            SELECT * FROM facilities
            WHERE latitude BETWEEN ? AND ?
              AND longitude BETWEEN ? AND ?
        """
        params = [lat - lat_delta, lat + lat_delta, lon - lon_delta, lon + lon_delta]
        if district:
            query += " AND district = ?"
            params.append(district)

        cur.execute(query, params)
        rows = [dict(r) for r in cur.fetchall()]

        results = []
        for r in rows:
            dist = haversine_distance(lat, lon, r["latitude"], r["longitude"])
            if dist <= radius_km:
                r["distance_km"] = dist
                r["estimated_eta_mins"] = max(5, int(dist * 2.2))
                results.append(r)

        results.sort(key=lambda x: x["distance_km"])
        return results
