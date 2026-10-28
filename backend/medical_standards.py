"""
Medical Standards Knowledge Base (IPHS & NABH Guidelines).
Minimum clinical safety requirements for acute procedures in India.
"""
from typing import Dict, Any, List

MEDICAL_STANDARDS: Dict[str, Dict[str, Any]] = {
    "appendectomy": {
        "procedure_name": "Emergency Appendectomy",
        "description": "Acute appendicitis requiring surgical excision under general/regional anaesthesia.",
        "mandatory_requirements": [
            {
                "field": "surgeon",
                "label": "Qualified General Surgeon (MS/DNB or contract surgeon)",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("surgeon") == 1 or ext.get("appendectomy_capable") == 1
            },
            {
                "field": "anesthesiologist",
                "label": "Dedicated Anesthesiologist posted or on-duty",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("anesthesiologist") == 1 or ext.get("appendectomy_capable") == 1
            },
            {
                "field": "oxygen_working",
                "label": "Working Oxygen supply (Cylinders or Central line)",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("oxygen_working") == 1 or ext.get("oxygen_working") is None
            },
            {
                "field": "emergency_functional",
                "label": "Functional Casualty / Resident MO for post-op monitoring",
                "criticality": "HIGH",
                "rule": lambda ext, fac: ext.get("emergency_functional") != 0
            }
        ],
        "allowed_exceptions": {
            "part_time_surgeon": "Visiting or part-time contract surgeon is acceptable if routine emergency appendectomies are performed in-house."
        }
    },
    "icu": {
        "procedure_name": "Intensive Care Unit (ICU) Admission",
        "description": "Life support monitoring for critically ill patients.",
        "mandatory_requirements": [
            {
                "field": "icu_functional",
                "label": "Functional Ventilators and Cardiac Monitors",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("icu_functional") == 1
            },
            {
                "field": "oxygen_working",
                "label": "Uninterrupted Central Oxygen Line or Tested Concentrators",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("oxygen_working") == 1
            },
            {
                "field": "resident_doctor",
                "label": "Round-the-clock Intensivist or Resident Medical Officer",
                "criticality": "HIGH",
                "rule": lambda ext, fac: ext.get("resident_doctor") == 1 or ext.get("emergency_functional") == 1
            }
        ]
    },
    "dialysis": {
        "procedure_name": "Hemodialysis Unit",
        "description": "Renal replacement therapy for end-stage kidney disease or acute renal failure.",
        "mandatory_requirements": [
            {
                "field": "dialysis",
                "label": "Active Hemodialysis Station with Functional RO Plant",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("dialysis") == 1 or "dialysis" in fac.get("specialties_listed", "").lower()
            }
        ]
    },
    "trauma": {
        "procedure_name": "Emergency Trauma Resuscitation",
        "description": "Management of acute polytrauma, fractures, and road traffic accidents.",
        "mandatory_requirements": [
            {
                "field": "trauma",
                "label": "Orthopaedic Surgeon + 24x7 Diagnostic Radiography (X-ray)",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("trauma") == 1 or "trauma" in fac.get("specialties_listed", "").lower()
            },
            {
                "field": "emergency_functional",
                "label": "Functional 24x7 Casualty",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("emergency_functional") != 0
            }
        ]
    },
    "oncology": {
        "procedure_name": "Oncology Care / Chemotherapy",
        "description": "Medical, surgical, or radiation oncology services.",
        "mandatory_requirements": [
            {
                "field": "oncology",
                "label": "Medical Oncologist & Daycare Chemotherapy Setup",
                "criticality": "FATAL",
                "rule": lambda ext, fac: ext.get("oncology") == 1 or "oncology" in fac.get("specialties_listed", "").lower()
            }
        ]
    }
}
