"""
Schema Configuration and Column Mapping for Sanjeevani Healthcare Intelligence System.
Supports mapping external datasets (e.g., MoHFW, state registries, OSM, synthetic) to the canonical internal schema.
"""
from typing import Dict, Any

# Canonical Schema fields:
# facility_id, name, facility_type, ownership, state, district, pincode,
# address, latitude, longitude, phone, beds_listed, specialties_listed,
# emergency_listed, icu_listed, survey_year, unstructured_notes

DATASET_SCHEMAS: Dict[str, Dict[str, str]] = {
    "india10k_synthetic": {
        "facility_id": "facility_id",
        "name": "name",
        "facility_type": "facility_type",
        "ownership": "ownership",
        "state": "state",
        "district": "district",
        "pincode": "pincode",
        "address": "address",
        "latitude": "latitude",
        "longitude": "longitude",
        "phone": "phone",
        "beds_listed": "beds_listed",
        "specialties_listed": "specialties_listed",
        "emergency_listed": "emergency_listed",
        "icu_listed": "icu_listed",
        "survey_year": "survey_year",
        "unstructured_notes": "unstructured_notes",
    },
    "gwalior_osm": {
        "facility_id": "facility_id",
        "name": "name",
        "facility_type": "facility_type",
        "ownership": "ownership",
        "state": "state",
        "district": "district",
        "pincode": "pincode",
        "address": "address",
        "latitude": "latitude",
        "longitude": "longitude",
        "phone": "phone",
        "beds_listed": "beds_listed",
        "specialties_listed": "specialties_listed",
        "emergency_listed": "emergency_listed",
        "icu_listed": "icu_listed",
        "survey_year": "survey_year",
        "unstructured_notes": "unstructured_notes",
    },
    "gwalior_demo_notes": {
        "facility_id": "facility_id",
        "name": "name",
        "notes_source": "notes_source",
        "simulated_notes": "simulated_notes",
        "simulated_year": "simulated_year"
    }
}

# District fallback centroids for geocoding imputation
DISTRICT_CENTROIDS = {
    "Patna": (25.5941, 85.1376, 800001),
    "Gaya": (24.7914, 85.0002, 823001),
    "Muzaffarpur": (26.1209, 85.3647, 842001),
    "Darbhanga": (26.1542, 85.8918, 846004),
    "Bhagalpur": (25.2425, 86.9842, 812001),
    "Purnia": (25.7771, 87.4753, 854301),
    "Saran": (25.7788, 84.7499, 841301),
    "Samastipur": (25.8628, 85.7811, 848101),
    "Begusarai": (25.4182, 86.1272, 851101),
    "Araria": (26.1511, 87.5152, 854311),
    "Sitamarhi": (26.5937, 85.4894, 843302),
    "Madhubani": (26.3541, 86.0718, 847211),
    "Nalanda": (25.1357, 85.4434, 803101),
    "Vaishali": (25.6858, 85.2163, 844101),
    "Siwan": (26.2223, 84.3567, 841226),
    "Kishanganj": (26.1017, 87.9404, 855107),
    "Lucknow": (26.8467, 80.9462, 226001),
    "Varanasi": (25.3176, 82.9739, 221001),
    "Gorakhpur": (26.7606, 83.3732, 273001),
    "Bahraich": (27.5706, 81.5977, 271801),
    "Ranchi": (23.3441, 85.3096, 834001),
    "Dhanbad": (23.7957, 86.4304, 826001),
    "Kolkata": (22.5726, 88.3639, 700001),
    "Malda": (25.0108, 88.1411, 732101),
    "Gwalior": (26.2183, 78.1828, 474001),
    "Indore": (22.7196, 75.8577, 452001),
    "Bhopal": (23.2599, 77.4126, 462001),
    "Jaipur": (26.9124, 75.7873, 302001),
    "Barmer": (25.7521, 71.3967, 344001),
    "Pune": (18.5204, 73.8567, 411001),
    "Nagpur": (21.1458, 79.0882, 440001),
    "Chennai": (13.0827, 80.2707, 600001),
    "Madurai": (9.9252, 78.1198, 625001),
    "Bengaluru": (12.9716, 77.5946, 560001),
    "Ernakulam": (9.9816, 76.2999, 682001),
    "Cuttack": (20.4625, 85.8828, 753001),
    "Kamrup": (26.1445, 91.7362, 781001),
    "Ahmedabad": (23.0225, 72.5714, 380001),
    "New Delhi": (28.6139, 77.2090, 110001),
    "Hyderabad": (17.3850, 78.4867, 500001),
}

def map_row(raw_row: Dict[str, Any], dataset_name: str) -> Dict[str, Any]:
    """Map a raw dictionary using dataset schema configuration to the canonical format."""
    mapping = DATASET_SCHEMAS.get(dataset_name, {})
    canonical = {}
    for canon_col, src_col in mapping.items():
        canonical[canon_col] = raw_row.get(src_col, "")
    return canonical
