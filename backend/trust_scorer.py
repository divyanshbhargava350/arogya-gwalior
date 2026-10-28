"""
Trust Scorer (0-100, Explainable Rule-Based + Contradiction Engine).
Detects advertised claims vs functional reality mismatches, stale data penalties,
and sparse evidence caps.
"""
from typing import Dict, Any, List, Tuple

class TrustScorer:
    def __init__(self):
        pass

    def evaluate(self, facility: Dict[str, Any], extracted: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate facility trustworthiness and flag clinical contradictions.
        Returns score (0-100), confidence ('High', 'Medium', 'Low', 'Unverified'),
        red_flags, green_flags, and detailed rationale.
        """
        score = 70 # baseline starting score
        red_flags: List[Dict[str, str]] = []
        green_flags: List[Dict[str, str]] = []
        confidence = "High"

        unstructured = facility.get("unstructured_notes", "")
        unstructured_lower = unstructured.lower()
        dataset = facility.get("dataset", "")
        survey_year = str(facility.get("survey_year", "2022"))
        
        # 1. Sparse evidence check (OSM-only without clinical survey notes)
        if dataset == "gwalior_osm" and not facility.get("is_demo"):
            return {
                "trust_score": 45,
                "confidence": "Unverified",
                "red_flags": [{
                    "tag": "SPARSE_EVIDENCE",
                    "issue": "Basic OpenStreetMap directory entry only. No clinical inspection notes or verified staffing details.",
                    "evidence": "OSM directory entry"
                }],
                "green_flags": [{
                    "tag": "GEO_VERIFIED",
                    "description": "Geographic coordinates confirmed on OpenStreetMap.",
                    "evidence": f"Lat: {facility.get('latitude')}, Lon: {facility.get('longitude')}"
                }],
                "profile_estimate": "partial"
            }

        # 2. CONTRADICTION 1: ICU listed vs Functional / Oxygen working
        icu_listed = facility.get("icu_listed", "").lower() in ["yes", "1"] or "icu" in facility.get("specialties_listed", "").lower()
        if icu_listed:
            if extracted.get("icu_functional") == 0:
                score -= 30
                red_flags.append({
                    "tag": "HOLLOW_ICU",
                    "issue": "ICU claimed on signboard/directory, but equipment (ventilator/concentrator) is non-functional or staff absent.",
                    "evidence": self._extract_snippet(unstructured, ["concentrator unplugged", "ventilator not working", "sirf bed hai", "cylinder khali", "no trained staff", "under repair"])
                })
            elif extracted.get("icu_functional") == 1:
                score += 10
                green_flags.append({
                    "tag": "VERIFIED_ICU",
                    "description": "Functional ICU with verified working ventilator and central oxygen line.",
                    "evidence": self._extract_snippet(unstructured, ["icu running", "icu functional", "ventilator working", "o2 supply"])
                })

        # 3. CONTRADICTION 2: 24/7 Emergency listed vs Doctor at night
        emerg_listed = facility.get("emergency_listed", "").lower() in ["yes", "1"] or "emergency" in facility.get("specialties_listed", "").lower()
        if emerg_listed:
            if extracted.get("emergency_functional") == 0:
                score -= 30
                red_flags.append({
                    "tag": "LOCKED_EMERGENCY",
                    "issue": "24/7 Emergency claimed, but no resident doctor at night / ward locked / only compounder available.",
                    "evidence": self._extract_snippet(unstructured, ["doctor not available after 6pm", "only compounder", "ward locked", "gate locked", "duty doctor 'on call'"])
                })
            elif extracted.get("emergency_functional") == 1:
                score += 10
                green_flags.append({
                    "tag": "VERIFIED_EMERGENCY",
                    "description": "Round-the-clock emergency casualty with resident Medical Officer present at night.",
                    "evidence": self._extract_snippet(unstructured, ["resident mo present", "doctor on duty", "casualty me doctor raat ko bhi", "emergency open all hours"])
                })

        # 4. CONTRADICTION 3: Advanced surgery claimed without Anesthesiologist or Surgeon
        surgery_listed = "surgery" in facility.get("specialties_listed", "").lower() or "advanced surgery" in unstructured_lower or "major" in unstructured_lower
        if surgery_listed:
            anes = extracted.get("anesthesiologist")
            surg = extracted.get("surgeon")
            if anes == 0 or (anes is None and surg == 0):
                score -= 25
                red_flags.append({
                    "tag": "SURGERY_WITHOUT_ANESTHESIA",
                    "issue": "Advanced surgery / OT advertised, but lacking a dedicated anesthesiologist or surgeon on duty.",
                    "evidence": self._extract_snippet(unstructured, ["no surgeon", "no anesthesiologist", "anaesthesia by visiting doctor", "visiting docter"])
                })
            elif anes == 1 and surg == 1:
                score += 10
                green_flags.append({
                    "tag": "SURGERY_CAPABLE",
                    "description": "Functional OT with dedicated MS surgeon and posted anesthesiologist.",
                    "evidence": self._extract_snippet(unstructured, ["surgeon", "anaesthetist posted", "appendectomy and hernia done regularly"])
                })

        # 5. Resident Doctor Green Flag
        if extracted.get("resident_doctor") == 1:
            score += 10
            green_flags.append({
                "tag": "RESIDENT_DOCTOR",
                "description": "Full-time MBBS resident doctor stays on campus.",
                "evidence": self._extract_snippet(unstructured, ["stays on campus", "rmo 24 hrs", "resident physician", "quarters inside"])
            })

        # 6. Bed Availability Bonus
        beds_avail = extracted.get("beds_available")
        if beds_avail is not None and beds_avail > 0:
            score += 5
            green_flags.append({
                "tag": "BEDS_AVAILABLE",
                "description": f"{beds_avail} vacant beds verified during inspection.",
                "evidence": f"{beds_avail} beds vacant"
            })
        elif beds_avail == 0:
            score -= 5
            red_flags.append({
                "tag": "ZERO_BEDS",
                "issue": "All beds occupied at time of survey.",
                "evidence": "all beds occupied"
            })

        # 7. Stale Data Penalty (Survey older than 2022)
        try:
            year = int(survey_year)
            if year < 2021:
                score -= 15
                confidence = "Medium"
                red_flags.append({
                    "tag": "STALE_SURVEY",
                    "issue": f"Survey data is from {year} (>2 years old). Ground conditions may have changed.",
                    "evidence": f"Survey Year: {year}"
                })
            elif year == 2021:
                score -= 5
                confidence = "Medium"
        except (ValueError, TypeError):
            confidence = "Low"

        # Bound score between 5 and 99
        score = max(5, min(99, score))

        # Profile estimation
        if len(red_flags) >= 2 or score < 45:
            profile = "hollow"
        elif score >= 75 and len(red_flags) == 0:
            profile = "solid"
        else:
            profile = "partial"

        return {
            "trust_score": score,
            "confidence": confidence,
            "profile_estimate": profile,
            "red_flags": red_flags,
            "green_flags": green_flags
        }

    def _extract_snippet(self, text: str, patterns: List[str]) -> str:
        text_lower = text.lower()
        for p in patterns:
            idx = text_lower.find(p.lower())
            if idx != -1:
                start = max(0, idx - 15)
                end = min(len(text), idx + len(p) + 25)
                return f"...{text[start:end].replace(chr(10), ' ').strip()}..."
        return "Clinical note inspection record"
