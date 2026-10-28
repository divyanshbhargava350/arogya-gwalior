"""Fetch real hospitals/clinics around Gwalior (MP) from OpenStreetMap and save in the project schema.
Run on YOUR laptop (needs internet):   python fetch_gwalior.py
Output: gwalior_facilities.csv
Optional: python fetch_gwalior.py --bbox 25.9,77.7,26.6,78.6   (south,west,north,east)
"""
import csv, json, sys, urllib.request, urllib.parse

BBOX = "26.05,78.00,26.40,78.35"  # Gwalior city + outskirts; widen for the whole district
if "--bbox" in sys.argv:
    BBOX = sys.argv[sys.argv.index("--bbox") + 1]

QUERY = f"""[out:json][timeout:90];
(
  nwr["amenity"~"^(hospital|clinic|doctors|dentist)$"]({BBOX});
  nwr["healthcare"]({BBOX});
);
out center tags;"""

ENDPOINTS = ["https://overpass-api.de/api/interpreter",
             "https://overpass.kumi.systems/api/interpreter"]

def fetch():
    body = urllib.parse.urlencode({"data": QUERY}).encode()
    for url in ENDPOINTS:
        try:
            with urllib.request.urlopen(urllib.request.Request(url, body), timeout=120) as r:
                return json.load(r)
        except Exception as e:
            print("failed", url, e)
    raise SystemExit("All Overpass endpoints failed")

def ftype(tags):
    a, h = tags.get("amenity", ""), tags.get("healthcare", "")
    if a == "hospital" or h == "hospital": return "Hospital"
    if a == "clinic" or h == "clinic": return "Clinic"
    if a == "doctors" or h == "doctor": return "Doctor Clinic"
    if a == "dentist": return "Dental Clinic"
    return (h or a or "Health Facility").title()

def convert(data):
    rows, seen = [], set()
    for el in data.get("elements", []):
        t = el.get("tags", {})
        name = t.get("name") or t.get("name:en") or t.get("name:hi")
        if not name: continue
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        key = (name.lower(), round(lat or 0, 3), round(lon or 0, 3))
        if key in seen: continue
        seen.add(key)
        addr = ", ".join(t[k] for k in ("addr:housenumber", "addr:street", "addr:suburb", "addr:city") if t.get(k))
        spec = t.get("healthcare:speciality", "").replace(";", ";")
        notes = " | ".join(x for x in [
            t.get("description"), t.get("note"),
            f"opening_hours: {t['opening_hours']}" if t.get("opening_hours") else "",
            f"operator: {t['operator']}" if t.get("operator") else "",
            f"emergency: {t['emergency']}" if t.get("emergency") else "",
            f"beds: {t['beds']}" if t.get("beds") else "",
            f"source: OpenStreetMap {el['type']}/{el['id']}"] if x)
        rows.append(dict(
            facility_id=f"GWL{len(rows)+1:04d}", name=name, facility_type=ftype(t),
            ownership={"government": "Government", "private": "Private"}.get(t.get("operator:type", ""), ""),
            state="Madhya Pradesh", district="Gwalior", pincode=t.get("addr:postcode", ""),
            address=addr, latitude=lat, longitude=lon,
            phone=t.get("phone") or t.get("contact:phone") or "",
            beds_listed=t.get("beds", ""), specialties_listed=spec,
            emergency_listed="Yes" if t.get("emergency") == "yes" else "",
            icu_listed="", survey_year="", unstructured_notes=notes))
    return rows

if __name__ == "__main__":
    rows = convert(fetch())
    with open("gwalior_facilities.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader(); w.writerows(rows)
    print("saved", len(rows), "facilities -> gwalior_facilities.csv")
