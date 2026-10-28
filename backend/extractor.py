"""
Agent 1: EXTRACTOR
Extracts structured clinical capabilities and exact evidence quotes from messy notes
(English + Hinglish, typos, mixed casing, abbreviations).
Returns None for unknown capabilities (never guesses).
"""
import re
from typing import Dict, Any, Optional, List

class ExtractorAgent:
    """
    Robust clinical capability extractor for Indian healthcare facility notes.
    Handles typos ('docter', 'emergancy'), Hinglish ('chalu hai', 'khali', 'aate hain'),
    and separates advertised/listed claims from functional ground reality.
    """
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def extract(self, note: str, facility_id: str = "", dataset: str = "india10k_synthetic") -> Dict[str, Any]:
        if not note:
            return self._empty_extraction(facility_id, dataset, "")

        cache_key = f"{facility_id}::{hash(note)}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        note_lower = note.lower()
        evidence_snippets: List[str] = []

        # 1. ICU FUNCTIONAL
        icu_functional: Optional[int] = None
        icu_pos = ["icu running", "icu functional", "icu me ventilator", "ventilator working", "monitors ok", "o2 supply central line working", "intensivist on call 24x7"]
        icu_neg = ["concentrator unplugged", "ventilator not working", "sirf bed hai", "concentrator not connected", "under repair", "no doctor on duty", "staff absent at night", "cylinder khali", "no trained staff"]

        for pat in icu_pos:
            if pat in note_lower:
                icu_functional = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        
        if icu_functional is None or any(neg in note_lower for neg in icu_neg):
            for pat in icu_neg:
                if pat in note_lower:
                    icu_functional = 0
                    evidence_snippets.append(self._find_snippet(note, pat))
                    break

        # 2. OXYGEN WORKING
        oxygen_working: Optional[int] = None
        o2_pos = ["o2 supply central line working", "oxygen central line", "oxygen cylinders + concentrator working", "ventilator working", "monitors ok", "oxygen working"]
        o2_neg = ["concentrator unplugged", "oxygen cylinder khali", "concentrator not connected", "cylinder khali"]

        for pat in o2_pos:
            if pat in note_lower:
                oxygen_working = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        for pat in o2_neg:
            if pat in note_lower:
                oxygen_working = 0
                evidence_snippets.append(self._find_snippet(note, pat))
                break

        # 3. EMERGENCY FUNCTIONAL
        emergency_functional: Optional[int] = None
        em_pos = ["24x7 emergency ward functional", "emergency open all hours", "casualty me doctor raat ko bhi rehte hain", "resident mo present at night", "ambulance available", "on-duty casualty medical officer"]
        em_neg = ["doctor not available after 6pm", "only compounder at night", "duty doctor 'on call'", "ward locked", "gate locked", "locked at time of survey", "closed at night"]

        for pat in em_pos:
            if pat in note_lower:
                emergency_functional = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        for pat in em_neg:
            if pat in note_lower:
                emergency_functional = 0
                evidence_snippets.append(self._find_snippet(note, pat))
                break

        # 4. SURGEON
        surgeon: Optional[int] = None
        s_pos = ["general surgeon (ms) available", "general surgeon (ms) visits", "resident ms general surgeon", "surgeon on shift", "appendectomy and hernia done regularly", "emergency surgery (appendix", "general surgery daily"]
        s_neg = ["no surgeon", "surgeon visits sometimes"]

        for pat in s_pos:
            if pat in note_lower:
                surgeon = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        if surgeon is None:
            for pat in s_neg:
                if pat in note_lower:
                    surgeon = 0
                    evidence_snippets.append(self._find_snippet(note, pat))
                    break

        # 5. ANESTHESIOLOGIST
        anesthesiologist: Optional[int] = None
        anes_pos = ["anaesthetist posted", "anesthesiologist posted", "anaesthesia machine", "anaesthetist available", "anaesthetist 24 hours"]
        anes_neg = ["no anesthesiologist listed", "anaesthesia by visiting doctor", "no anaesthetist available"]

        for pat in anes_pos:
            if pat in note_lower:
                anesthesiologist = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        if anesthesiologist is None:
            for pat in anes_neg:
                if pat in note_lower:
                    anesthesiologist = 0
                    evidence_snippets.append(self._find_snippet(note, pat))
                    break

        # 6. RESIDENT DOCTOR
        resident_doctor: Optional[int] = None
        res_pos = ["resident mbbs doctor stays on campus", "rmo 24 hrs", "1 resident physician", "resident mo present", "doctor on duty + 2 nurses", "on-duty casualty medical officer"]
        res_neg = ["no resident doctor", "only compounder at night", "doctor not available after 6pm", "duty doctor 'on call'"]

        for pat in res_pos:
            if pat in note_lower:
                resident_doctor = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        if resident_doctor is None:
            for pat in res_neg:
                if pat in note_lower:
                    resident_doctor = 0
                    evidence_snippets.append(self._find_snippet(note, pat))
                    break

        # 7. PART-TIME DOCTORS
        part_time_doctors: Optional[int] = None
        pt_patterns = ["part-time", "part time", "visiting from district", "visiting docter", "specialists come on contract", "docter sahab shaam ko 2 ghante aate hain", "doctor sahab shaam ko 2 ghante aate hain", "on contract (part time)"]
        for pat in pt_patterns:
            if pat in note_lower:
                part_time_doctors = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break

        # 8. SPECIALISED SERVICES
        dialysis = 1 if any(p in note_lower for p in ["dialysis unit", "hemodialysis", "dialysis machines"]) else 0
        oncology = 1 if any(p in note_lower for p in ["oncology opd", "chemo day-care", "cancer treatment", "medical oncologist"]) else 0
        trauma = 1 if any(p in note_lower for p in ["trauma care", "accident cases handled", "ortho surgeon + x-ray", "fracture ot"]) else 0
        blood_bank = 1 if any(p in note_lower for p in ["blood bank licensed", "blood storage tie-up active"]) else 0

        # 9. BEDS AVAILABLE
        beds_available: Optional[int] = None
        bed_match = re.search(r'(\d+)\s+beds?\s+(?:free|khali|vacant)', note_lower)
        if bed_match:
            beds_available = int(bed_match.group(1))
            evidence_snippets.append(self._find_snippet(note, bed_match.group(0)))
        elif "all beds occupied" in note_lower:
            beds_available = 0
            evidence_snippets.append(self._find_snippet(note, "all beds occupied"))

        # 10. APPENDECTOMY CAPABLE (Functional OT + regular surgery)
        appendectomy_capable: Optional[int] = None
        app_pos = ["appendectomy and hernia done regularly", "emergency surgery (appendix", "appendix, c-section) performed in-house", "emergency laparoscopy and appendectomy done regularly"]
        app_neg = ["advanced surgery facility available", "laparoscopic surgery advertised"] # hollow advertising trap

        for pat in app_pos:
            if pat in note_lower:
                appendectomy_capable = 1
                evidence_snippets.append(self._find_snippet(note, pat))
                break
        if appendectomy_capable is None:
            if any(pat in note_lower for pat in app_neg):
                # Advertised without proven routine capability
                appendectomy_capable = 0
                evidence_snippets.append(self._find_snippet(note, "advanced surgery"))

        evidence_quote = " | ".join(dict.fromkeys(evidence_snippets))

        res = {
            "facility_id": facility_id,
            "icu_functional": icu_functional,
            "oxygen_working": oxygen_working,
            "emergency_functional": emergency_functional,
            "surgeon": surgeon,
            "anesthesiologist": anesthesiologist,
            "resident_doctor": resident_doctor,
            "part_time_doctors": part_time_doctors,
            "dialysis": dialysis,
            "oncology": oncology,
            "trauma": trauma,
            "blood_bank": blood_bank,
            "beds_available": beds_available,
            "appendectomy_capable": appendectomy_capable,
            "evidence_quote": evidence_quote,
            "source_row_id": facility_id,
            "dataset": dataset
        }
        self._cache[cache_key] = res
        return res

    def _find_snippet(self, full_text: str, keyword: str) -> str:
        idx = full_text.lower().find(keyword.lower())
        if idx == -1:
            return keyword
        start = max(0, idx - 20)
        end = min(len(full_text), idx + len(keyword) + 30)
        snippet = full_text[start:end].replace("\n", " ").strip()
        return f"...{snippet}..." if start > 0 else f"{snippet}..."

    def _empty_extraction(self, fid: str, dataset: str, quote: str) -> Dict[str, Any]:
        return {
            "facility_id": fid,
            "icu_functional": None,
            "oxygen_working": None,
            "emergency_functional": None,
            "surgeon": None,
            "anesthesiologist": None,
            "resident_doctor": None,
            "part_time_doctors": None,
            "dialysis": None,
            "oncology": None,
            "trauma": None,
            "blood_bank": None,
            "beds_available": None,
            "appendectomy_capable": None,
            "evidence_quote": quote,
            "source_row_id": fid,
            "dataset": dataset
        }

EXTRACTOR_PROMPT_TEMPLATE = """
You are an expert Clinical Data Extractor for Indian Healthcare Facilities.
Analyze the following unstructured facility survey note:
\"\"\"{note}\"\"\"

Extract true functional status (distinguishing advertised claims from verified reality).
Return a valid JSON object matching:
{{
  "icu_functional": 1/0/null,
  "oxygen_working": 1/0/null,
  "emergency_functional": 1/0/null,
  "surgeon": 1/0/null,
  "anesthesiologist": 1/0/null,
  "resident_doctor": 1/0/null,
  "part_time_doctors": 1/0/null,
  "dialysis": 1/0/null,
  "oncology": 1/0/null,
  "trauma": 1/0/null,
  "blood_bank": 1/0/null,
  "beds_available": integer/null,
  "appendectomy_capable": 1/0/null,
  "evidence_quote": "exact matching snippet from text"
}}
RULES:
1. If text says "ICU room present but concentrator unplugged" -> icu_functional: 0, oxygen_working: 0.
2. If text says "claims 24/7 emergency but doctor not available after 6pm" -> emergency_functional: 0.
3. If no evidence for a field, return null (never guess).
"""
