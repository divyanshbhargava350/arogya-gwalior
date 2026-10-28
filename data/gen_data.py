"""Synthetic 'India 10k' facility dataset generator (SYNTHETIC - not real facilities).
Outputs:
  india_10k_synthetic.csv  -> what the system sees (structured + messy notes)
  ground_truth.csv         -> hidden true capabilities, for evaluating the Extractor/Trust Scorer
"""
import csv, random, math

random.seed(42)
N = 10000

# state, district, lat, lon, pin_base, weight
DISTRICTS = [
 ("Bihar","Patna",25.59,85.14,800001,5),("Bihar","Gaya",24.79,85.00,823001,3),
 ("Bihar","Muzaffarpur",26.12,85.39,842001,3),("Bihar","Darbhanga",26.16,85.90,846001,3),
 ("Bihar","Bhagalpur",25.24,86.97,812001,3),("Bihar","Purnia",25.78,87.47,854301,3),
 ("Bihar","Saran",25.78,84.75,841301,3),("Bihar","Samastipur",25.86,85.78,848101,4),
 ("Bihar","Begusarai",25.42,86.13,851101,3),("Bihar","Araria",26.15,87.52,854311,2),
 ("Bihar","Sitamarhi",26.59,85.49,843301,2),("Bihar","Madhubani",26.35,86.07,847211,3),
 ("Bihar","Nalanda",25.13,85.44,803101,2),("Bihar","Vaishali",25.69,85.21,844101,2),
 ("Bihar","Siwan",26.22,84.36,841226,2),("Bihar","Kishanganj",26.10,87.94,855107,2),
 ("Uttar Pradesh","Lucknow",26.85,80.95,226001,4),("Uttar Pradesh","Varanasi",25.32,82.99,221001,3),
 ("Uttar Pradesh","Gorakhpur",26.76,83.37,273001,3),("Uttar Pradesh","Bahraich",27.57,81.60,271801,2),
 ("Jharkhand","Ranchi",23.34,85.31,834001,3),("Jharkhand","Dhanbad",23.80,86.43,826001,2),
 ("West Bengal","Kolkata",22.57,88.36,700001,4),("West Bengal","Malda",25.01,88.14,732101,2),
 ("Madhya Pradesh","Indore",22.72,75.86,452001,3),("Madhya Pradesh","Bhopal",23.26,77.41,462001,3),
 ("Rajasthan","Jaipur",26.91,75.79,302001,3),("Rajasthan","Barmer",25.75,71.39,344001,2),
 ("Maharashtra","Pune",18.52,73.86,411001,4),("Maharashtra","Nagpur",21.15,79.09,440001,3),
 ("Tamil Nadu","Chennai",13.08,80.27,600001,4),("Tamil Nadu","Madurai",9.93,78.12,625001,2),
 ("Karnataka","Bengaluru",12.97,77.59,560001,4),("Kerala","Ernakulam",9.98,76.28,682001,2),
 ("Odisha","Cuttack",20.46,85.88,753001,2),("Assam","Kamrup",26.14,91.74,781001,2),
 ("Gujarat","Ahmedabad",23.02,72.57,380001,3),("Delhi","New Delhi",28.61,77.21,110001,3),
 ("Telangana","Hyderabad",17.39,78.49,500001,3),
]
WEIGHTS = [d[5] for d in DISTRICTS]

TYPES = [  # type, weight, ownership choices
 ("Primary Health Centre",18,["Government"]),("Community Health Centre",12,["Government"]),
 ("District Hospital",4,["Government"]),("Private Nursing Home",22,["Private"]),
 ("Multispecialty Hospital",12,["Private","Trust"]),("Small Clinic",18,["Private"]),
 ("Trauma Centre",3,["Government","Private"]),("Dialysis Centre",3,["Private","Trust"]),
 ("Cancer Centre",2,["Private","Trust","Government"]),("Diagnostic & Polyclinic",6,["Private"]),
]
NAME_A = ["Shri","Maa","Sai","Jan Kalyan","Ganga","Lifeline","Anand","Sanjivani","Om","Raj","Krishna","Bharat",
          "Apollo-style","City","New Life","Jeevan Jyoti","Ram Janki","Shanti","Arogya","Vardhman","Gyan","Mithila"]
NAME_B = ["Hospital","Nursing Home","Clinic","Medical Centre","Care Hospital","Health Centre","Polyclinic"]
STREETS = ["Station Road","Main Bazaar","NH-28","Block Road","Gandhi Chowk","College Road","Station Chowk","Mandi Road"]

def pick_type():
    return random.choices(TYPES, weights=[t[1] for t in TYPES])[0]

def haversine(a,b,c,d):
    R=6371; p=math.pi/180
    x=math.sin((c-a)*p/2)**2+math.cos(a*p)*math.cos(c*p)*math.sin((d-b)*p/2)**2
    return 2*R*math.asin(math.sqrt(x))

def profile_for(ftype):
    """returns profile: 'solid' (really capable), 'partial', 'hollow' (claims > reality)"""
    base = {"District Hospital":(.55,.35,.10),"Trauma Centre":(.5,.3,.2),"Multispecialty Hospital":(.4,.3,.3),
            "Cancer Centre":(.6,.3,.1),"Dialysis Centre":(.6,.3,.1),"Community Health Centre":(.2,.45,.35),
            "Private Nursing Home":(.2,.4,.4),"Primary Health Centre":(.05,.45,.5),
            "Small Clinic":(.05,.35,.6),"Diagnostic & Polyclinic":(.1,.4,.5)}[ftype]
    return random.choices(["solid","partial","hollow"], weights=base)[0]

def make_truth(ftype, profile):
    big = ftype in ("District Hospital","Trauma Centre","Multispecialty Hospital","Cancer Centre")
    mid = big or ftype in ("Community Health Centre","Private Nursing Home","Dialysis Centre")
    t = dict(icu_listed=0,icu_functional=0,oxygen_working=0,emergency_24x7_listed=0,emergency_functional=0,
             surgeon=0,anesthesiologist=0,resident_doctor=0,part_time_doctors=0,dialysis=0,oncology=0,
             trauma=0,blood_bank=0,beds_available=0,advanced_surgery_listed=0,appendectomy_capable=0)
    r = random.random
    if profile=="solid":
        t.update(resident_doctor=1,oxygen_working=1,emergency_24x7_listed=1,emergency_functional=1)
        if mid:
            t.update(surgeon=int(r()<.85),anesthesiologist=int(r()<.85),icu_listed=int(r()<.8))
            t["icu_functional"]=t["icu_listed"]
            t["blood_bank"]=int(r()<.5)
        t["appendectomy_capable"]=int(t["surgeon"] and t["anesthesiologist"] and r()<.9)
        t["advanced_surgery_listed"]=t["appendectomy_capable"]
        t["beds_available"]=random.choice([0,1,2,3,5,8]) if mid else random.choice([0,1,2])
    elif profile=="partial":
        t.update(resident_doctor=int(r()<.7),oxygen_working=int(r()<.6),emergency_24x7_listed=int(r()<.6),
                 part_time_doctors=int(r()<.55))
        t["emergency_functional"]=int(t["emergency_24x7_listed"] and t["resident_doctor"] and r()<.6)
        if mid:
            t.update(surgeon=int(r()<.5),anesthesiologist=int(r()<.3),icu_listed=int(r()<.4))
            t["icu_functional"]=int(t["icu_listed"] and t["oxygen_working"] and r()<.5)
        t["appendectomy_capable"]=int(t["surgeon"] and t["anesthesiologist"] and r()<.6)
        t["advanced_surgery_listed"]=int(t["appendectomy_capable"] or r()<.15)
        t["beds_available"]=random.choice([0,0,1,2,4])
    else:  # hollow: claims exceed reality
        t.update(emergency_24x7_listed=int(r()<.7),icu_listed=int(mid and r()<.6),
                 advanced_surgery_listed=int(r()<.35),part_time_doctors=int(r()<.7),
                 resident_doctor=int(r()<.2),oxygen_working=int(r()<.2),surgeon=int(r()<.15))
        t["beds_available"]=random.choice([0,0,0,1])
    # specialised services
    if ftype=="Dialysis Centre" or (big and r()<.25): t["dialysis"]=int(profile!="hollow")
    if ftype=="Cancer Centre" or (ftype=="Multispecialty Hospital" and r()<.12): t["oncology"]=int(profile!="hollow")
    if ftype in ("Trauma Centre","District Hospital") or (ftype=="Multispecialty Hospital" and r()<.3):
        t["trauma"]=int(profile!="hollow")
    return t

# ---------- messy note generation ----------
FILLER = ["Survey done by ANM during village visit.","data entered from paper form","contact person: manager",
          "NABH not applied","building 2 floor, lift not working","parking available","near bus stand",
          "OPD 9am-2pm","ayushman card accepted","JSY payments accepted","pharmacy on premises",
          "approached by DM office last yr","signboard says 'Advanced Care'","ph no. may have changed",
          "staff strength not verified","power backup: inverter only","generator available but diesel issue",
          "toilets fine, water supply irregular","last inspection 2022","info given verbally by watchman"]

def note_icu(t, f):
    if t["icu_functional"]:
        return random.choice([f"ICU {random.choice([2,4,6,8])} bed functional, ventilator working, monitors ok",
          "icu running, o2 supply central line working, nurse on every shift",
          "ICU me ventilator aur monitor chalu hai, intensivist on call 24x7"])
    if t["icu_listed"]:
        return random.choice(["ICU room present but oxygen concentrator unplugged, no doctor on duty",
          "ICU listed - 2 beds, ventilator not working since last yr, staff absent at night",
          "ICU board lagaya hai par andar sirf bed hai, oxygen cylinder khali",
          "'ICU' = one room, concentrator not connected, no trained staff",
          "icu available (as per owner) equipment under repair"])
    return ""

def note_emerg(t, f):
    if t["emergency_functional"]:
        return random.choice(["24x7 emergency ward functional, resident MO present at night",
          "emergency open all hours, doctor on duty + 2 nurses, ambulance available",
          "EMERGENCY 24/7 - casualty me doctor raat ko bhi rehte hain"])
    if t["emergency_24x7_listed"]:
        return random.choice(["claims 24/7 emergency but doctor not available after 6pm",
          "24x7 emergency (board), no resident doctor, only compounder at night",
          "emergency service listed; duty doctor 'on call' - phone often unreachable",
          "24/7 EMERGENCY written on gate, ward locked at time of survey"])
    return ""

def note_staff(t, f):
    p=[]
    p.append("general surgeon (MS) available" if t["surgeon"] else random.choice(["","no surgeon","surgeon visits sometimes"]))
    p.append("anaesthetist posted" if t["anesthesiologist"] else random.choice(["","no anesthesiologist listed","anaesthesia by visiting doctor if needed"]))
    if t["resident_doctor"]: p.append(random.choice(["resident MBBS doctor stays on campus","RMO 24 hrs","1 resident physician, quarters inside"]))
    if t["part_time_doctors"]: p.append(random.choice(["part-time doctors, visiting from district hosp twice a week","specialists come on contract, part time basis","doctor sahab shaam ko 2 ghante aate hain (part-time)"]))
    return "; ".join(x for x in p if x)

def note_services(t, f):
    p=[]
    if t["advanced_surgery_listed"] and not t["appendectomy_capable"]:
        p.append(random.choice(["advanced surgery facility available","major & minor OT, laparoscopic surgery advertised"]))
    elif t["appendectomy_capable"]:
        p.append(random.choice(["OT functional, appendectomy and hernia done regularly","emergency surgery (appendix, c-section) performed in-house","OT with anaesthesia machine, general surgery daily"]))
    if t["dialysis"]: p.append(random.choice([f"dialysis unit {random.choice([2,4,6])} machines running","hemodialysis 3 shifts"]))
    if t["oncology"]: p.append(random.choice(["oncology OPD + chemo day-care","cancer treatment, medical oncologist visits weekly"]))
    if t["trauma"]: p.append(random.choice(["trauma care, ortho surgeon + X-ray 24h","accident cases handled, fracture OT available"]))
    if t["blood_bank"]: p.append("blood bank licensed, stock available")
    return "; ".join(p)

def note_beds(t, f):
    if t["beds_available"]>0: return random.choice([f"{t['beds_available']} beds free as of survey",f"currently {t['beds_available']} bed khali"])
    return random.choice(["","all beds occupied","bed availability unknown"])

def mess(s):
    if random.random()<.15: s=s.upper()
    elif random.random()<.12: s=s.lower()
    if random.random()<.2: s=s.replace("doctor","docter").replace("emergency","emergancy")
    return s

def make_note(t, f):
    parts=[note_icu(t,f),note_emerg(t,f),note_staff(t,f),note_services(t,f),note_beds(t,f)]
    parts=[p for p in parts if p]
    random.shuffle(parts)
    parts+=random.sample(FILLER,k=random.randint(1,3))
    random.shuffle(parts)
    sep=random.choice([" | ","; ",". ","\n"," // "])
    return mess(sep.join(parts))

# ---------- build rows ----------
rows=[]; truth=[]
def add(fid,name,ftype,own,state,dist,pin,addr,lat,lon,t,profile,note=None,year=None):
    spec=[]
    if t["dialysis"]: spec.append("Nephrology/Dialysis")
    if t["oncology"]: spec.append("Oncology")
    if t["trauma"]: spec.append("Orthopaedics/Trauma")
    if t["surgeon"] or t["advanced_surgery_listed"]: spec.append("General Surgery")
    if ftype in ("Multispecialty Hospital","District Hospital"): spec+=random.sample(["Medicine","Paediatrics","Obstetrics","ENT","Ophthalmology"],2)
    if not spec: spec=["General Medicine"]
    beds=random.choice([0,6,10,20,30]) if ftype in ("Primary Health Centre","Small Clinic","Diagnostic & Polyclinic") else random.choice([20,30,50,100,200])
    row=dict(facility_id=fid,name=name,facility_type=ftype,ownership=own,state=state,district=dist,pincode=pin,
             address=addr,latitude=round(lat,5),longitude=round(lon,5),
             phone="9"+"".join(random.choices("0123456789",k=9)) if random.random()>.12 else "",
             beds_listed=beds,specialties_listed=";".join(spec),
             emergency_listed="Yes" if t["emergency_24x7_listed"] else random.choice(["No",""]),
             icu_listed="Yes" if t["icu_listed"] else random.choice(["No",""]),
             survey_year=year or random.choice([2019,2021,2022,2022,2022,2023]),
             unstructured_notes=note if note is not None else make_note(t,t))
    if random.random()<.04: row["pincode"]=""
    if random.random()<.03: row["latitude"]=row["longitude"]=""
    rows.append(row)
    truth.append(dict(facility_id=fid,profile=profile,**t))

for i in range(1,N-1):
    st,dist,lat,lon,pin0,_=random.choices(DISTRICTS,weights=WEIGHTS)[0]
    ftype,_,owns=pick_type()
    prof=profile_for(ftype)
    t=make_truth(ftype,prof)
    la=lat+random.gauss(0,.12); lo=lon+random.gauss(0,.12)
    pin=pin0+random.randint(0,40)
    name=f"{random.choice(NAME_A)} {random.choice(NAME_B)}" if "Centre" not in ftype and "Hospital" not in ftype else f"{random.choice(NAME_A)} {ftype}"
    if ftype=="Primary Health Centre": name=f"PHC {random.choice(['Rampur','Sonbarsa','Kalyanpur','Bishunpur','Hasanpur','Mahua','Dumri'])}"
    add(f"F{i:05d}",name,ftype,random.choice(owns),st,dist,pin,f"{random.choice(STREETS)}, {dist}",la,lo,t,prof)

# --- Ananya scenario: she is at (25.90, 85.78) near Samastipur ---
tf=dict(icu_listed=1,icu_functional=0,oxygen_working=0,emergency_24x7_listed=1,emergency_functional=0,surgeon=0,
        anesthesiologist=0,resident_doctor=0,part_time_doctors=1,dialysis=0,oncology=0,trauma=0,blood_bank=0,
        beds_available=0,advanced_surgery_listed=1,appendectomy_capable=0)
add("F09999","Shri Ram Janki Hospital","Private Nursing Home","Private","Bihar","Samastipur",848101,
    "NH-28, Block Road, Samastipur",26.035,85.78,tf,"hollow",
    "ICU room available but oxygen concentrator unplugged, no doctor on duty | 24/7 EMERGENCY written on gate, ward locked at time of survey | advanced surgery facility available | visiting docter aate hain (part-time) | last inspection 2022",2022)
tr=dict(icu_listed=0,icu_functional=0,oxygen_working=1,emergency_24x7_listed=1,emergency_functional=1,surgeon=1,
        anesthesiologist=1,resident_doctor=1,part_time_doctors=1,dialysis=0,oncology=0,trauma=0,blood_bank=0,
        beds_available=2,advanced_surgery_listed=1,appendectomy_capable=1)
add("F10000","Maa Sharda Nursing Home","Private Nursing Home","Private","Bihar","Samastipur",848114,
    "Station Chowk, Samastipur",25.72,85.78,tr,"solid",
    "emergency open all hours, resident MBBS doctor stays on campus; general surgeon (MS) visits on contract (part time), anaesthetist posted; OT functional, appendectomy and hernia done regularly | 2 beds free as of survey | oxygen cylinders + concentrator working | ayushman card accepted | info collected 2022 survey, text typed by clerk",2022)

random.shuffle(rows)
cols=list(rows[0].keys())
with open("india_10k_synthetic.csv","w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=cols); w.writeheader(); w.writerows(rows)
tcols=list(truth[0].keys())
with open("ground_truth.csv","w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=tcols); w.writeheader(); w.writerows(truth)
print("rows:",len(rows))
