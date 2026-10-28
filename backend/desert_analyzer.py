"""
Healthcare Desert Analyzer for Sanjeevani.
Computes spatial access scores, distance to nearest verified capability,
and clinical desert risk indices across Indian districts and PIN codes.
Specialties covered: Emergency Surgery, ICU, Dialysis, Oncology, Trauma.
"""
from typing import Dict, Any, List, Optional
from collections import defaultdict
from backend.data_loader import FacilityRepository, haversine_distance
from backend.extractor import ExtractorAgent
from backend.trust_scorer import TrustScorer
from backend.schema_config import DISTRICT_CENTROIDS

class DesertAnalyzer:
    def __init__(self, repo: FacilityRepository):
        self.repo = repo
        self.extractor = ExtractorAgent()
        self.scorer = TrustScorer()
        self._cache: Optional[Dict[str, Any]] = None

    def analyze(self) -> Dict[str, Any]:
        if self._cache:
            return self._cache

        all_facilities = self.repo.get_all()
        
        # 1. First classify each facility's verified functional capabilities
        verified_by_specialty = {
            "surgery": [],
            "icu": [],
            "dialysis": [],
            "oncology": [],
            "trauma": []
        }

        district_groups = defaultdict(list)
        pincode_groups = defaultdict(list)

        for fac in all_facilities:
            fid = fac["facility_id"]
            notes = fac.get("unstructured_notes", "")
            dataset = fac.get("dataset", "")
            ext = self.extractor.extract(notes, facility_id=fid, dataset=dataset)
            trust = self.scorer.evaluate(fac, ext)

            fac_point = {
                "id": fid,
                "name": fac["name"],
                "lat": fac["latitude"],
                "lon": fac["longitude"],
                "district": fac["district"],
                "pincode": fac["pincode"],
                "trust_score": trust["trust_score"],
                "is_solid": trust["profile_estimate"] == "solid"
            }

            district_groups[fac["district"]].append(fac)
            if fac.get("pincode"):
                pincode_groups[fac["pincode"]].append(fac)

            # Verification logic for clinical access
            if ext.get("appendectomy_capable") == 1 or (ext.get("surgeon") == 1 and ext.get("anesthesiologist") == 1 and trust["trust_score"] >= 65):
                verified_by_specialty["surgery"].append(fac_point)

            if ext.get("icu_functional") == 1 and trust["trust_score"] >= 60:
                verified_by_specialty["icu"].append(fac_point)

            if ext.get("dialysis") == 1:
                verified_by_specialty["dialysis"].append(fac_point)

            if ext.get("oncology") == 1:
                verified_by_specialty["oncology"].append(fac_point)

            if ext.get("trauma") == 1 and trust["trust_score"] >= 60:
                verified_by_specialty["trauma"].append(fac_point)

        # 2. Analyze District Deserts
        district_analysis = []
        for dist, d_facs in district_groups.items():
            c_lat, c_lon, _ = DISTRICT_CENTROIDS.get(dist, (d_facs[0]["latitude"], d_facs[0]["longitude"], 0))

            spec_scores = {}
            flow_lines = {}
            for spec, v_list in verified_by_specialty.items():
                # Find nearest verified facility to district centroid
                if v_list:
                    nearest = min(v_list, key=lambda p: haversine_distance(c_lat, c_lon, p["lat"], p["lon"]))
                    dist_to_nearest = haversine_distance(c_lat, c_lon, nearest["lat"], nearest["lon"])
                    flow_lines[spec] = {
                        "from_lat": c_lat,
                        "from_lon": c_lon,
                        "to_lat": nearest["lat"],
                        "to_lon": nearest["lon"],
                        "to_facility": nearest["name"],
                        "distance_km": dist_to_nearest
                    }
                else:
                    dist_to_nearest = 300.0

                # Count in-district verified facilities
                in_dist_count = sum(1 for p in v_list if p["district"] == dist)
                
                # Desert score (0 = excellent, 100 = critical desert)
                # Weighted by distance to care and local capacity
                raw_risk = min(100.0, (dist_to_nearest * 1.8) / (in_dist_count + 1.0))
                spec_scores[spec] = {
                    "verified_count": in_dist_count,
                    "distance_to_nearest_km": round(dist_to_nearest, 1),
                    "desert_risk": round(raw_risk, 1)
                }

            overall_desert_risk = round(sum(s["desert_risk"] for s in spec_scores.values()) / len(spec_scores), 1)

            status = "Well Served"
            if overall_desert_risk > 70:
                status = "Critical Desert"
            elif overall_desert_risk > 45:
                status = "Severe Deficit"
            elif overall_desert_risk > 25:
                status = "Moderate Access"

            district_analysis.append({
                "district": dist,
                "state": d_facs[0]["state"],
                "latitude": c_lat,
                "longitude": c_lon,
                "total_facilities": len(d_facs),
                "overall_desert_risk": overall_desert_risk,
                "status": status,
                "specialties": spec_scores,
                "flow_lines": flow_lines
            })

        district_analysis.sort(key=lambda x: x["overall_desert_risk"], reverse=True)

        self._cache = {
            "districts": district_analysis,
            "summary": {
                "critical_deserts": sum(1 for d in district_analysis if d["status"] == "Critical Desert"),
                "severe_deficits": sum(1 for d in district_analysis if d["status"] == "Severe Deficit"),
                "total_districts": len(district_analysis),
                "total_verified_surgery": len(verified_by_specialty["surgery"]),
                "total_verified_icu": len(verified_by_specialty["icu"]),
                "total_verified_dialysis": len(verified_by_specialty["dialysis"]),
                "total_verified_oncology": len(verified_by_specialty["oncology"]),
                "total_verified_trauma": len(verified_by_specialty["trauma"])
            }
        }
        return self._cache
