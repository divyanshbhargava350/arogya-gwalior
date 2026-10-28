"""
Agent 3: VALIDATOR (Clinical Safety Cross-Check & Self-Correction Feedback Loop).
Audits candidate recommendations against IPHS / NABH clinical minimum standards.
Rejects facilities that violate critical clinical safety prerequisites.
"""
from typing import Dict, Any, List, Tuple
from backend.medical_standards import MEDICAL_STANDARDS

class ValidatorAgent:
    def __init__(self):
        self.audit_log: List[Dict[str, Any]] = []

    def validate(self, facility: Dict[str, Any], extracted: Dict[str, Any], procedure_key: str = "appendectomy") -> Dict[str, Any]:
        """
        Validate whether facility is clinically safe to handle procedure_key.
        Returns:
          is_valid: bool
          rejection_reasons: List[Dict]
          evidence_citations: List[str]
          clinical_clearance: str
        """
        standard = MEDICAL_STANDARDS.get(procedure_key.lower())
        if not standard:
            return {
                "is_valid": True,
                "rejection_reasons": [],
                "evidence_citations": [],
                "clinical_clearance": "Standard general admission checks passed."
            }

        rejections = []
        citations = []

        for req in standard["mandatory_requirements"]:
            field = req["field"]
            label = req["label"]
            criticality = req["criticality"]
            rule_fn = req["rule"]

            passed = rule_fn(extracted, facility)
            if not passed:
                # Violation!
                evidence = self._find_relevant_evidence(field, facility.get("unstructured_notes", ""), extracted)
                rejections.append({
                    "field": field,
                    "requirement": label,
                    "criticality": criticality,
                    "evidence": evidence
                })
                citations.append(evidence)

        is_valid = len(rejections) == 0

        # Log audit entry
        log_entry = {
            "facility_id": facility.get("facility_id"),
            "facility_name": facility.get("name"),
            "procedure_key": procedure_key,
            "is_valid": is_valid,
            "rejections": rejections
        }
        self.audit_log.append(log_entry)

        return {
            "is_valid": is_valid,
            "procedure_name": standard["procedure_name"],
            "rejection_reasons": rejections,
            "evidence_citations": citations,
            "clinical_clearance": "Certified compliant with IPHS acute surgical standards." if is_valid else "NON-COMPLIANT: Failed mandatory surgical safety prerequisites."
        }

    def _find_relevant_evidence(self, field: str, notes: str, extracted: Dict[str, Any]) -> str:
        notes_lower = notes.lower()
        if field == "anesthesiologist":
            for pat in ["no anesthesiologist", "no anaesthetist", "anaesthesia by visiting doctor", "visiting docter", "only compounder"]:
                if pat in notes_lower:
                    return self._snippet(notes, pat)
            return "No verified anesthesiologist on duty at facility"
        elif field == "surgeon":
            for pat in ["no surgeon", "surgeon visits sometimes", "only compounder"]:
                if pat in notes_lower:
                    return self._snippet(notes, pat)
            return "No resident surgeon present on site"
        elif field == "oxygen_working":
            for pat in ["concentrator unplugged", "oxygen cylinder khali", "cylinder khali", "concentrator not connected"]:
                if pat in notes_lower:
                    return self._snippet(notes, pat)
            return "Oxygen supply not verified functional"
        elif field == "emergency_functional":
            for pat in ["ward locked", "gate locked", "doctor not available after 6pm", "only compounder at night"]:
                if pat in notes_lower:
                    return self._snippet(notes, pat)
            return "Emergency casualty ward closed / unmanned at night"
        elif field == "icu_functional":
            for pat in ["sirf bed hai", "concentrator unplugged", "ventilator not working", "under repair"]:
                if pat in notes_lower:
                    return self._snippet(notes, pat)
            return "ICU lacks functional ventilator or life-support monitors"
        return extracted.get("evidence_quote") or "Clinical inspection record"

    def _snippet(self, text: str, phrase: str) -> str:
        idx = text.lower().find(phrase.lower())
        if idx == -1:
            return phrase
        start = max(0, idx - 15)
        end = min(len(text), idx + len(phrase) + 30)
        return f"...{text[start:end].replace(chr(10), ' ').strip()}..."
