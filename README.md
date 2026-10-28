# 🌿 SANJEEVANI (संजीवनी)
### Agentic Healthcare Intelligence & AI Platform for Gwalior, Madhya Pradesh & India
*Finds the RIGHT facility at THIS moment, not just the nearest one.*

---

## ⚡ Quick Start (Setup in 3 Commands)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Run backend & full-stack server (includes built React UI)
python -m backend.main

# 3. Open in Browser
http://localhost:8000
```

> **Note for Judges**: The pre-built React frontend is included in `frontend/dist/` and served automatically by FastAPI at `http://localhost:8000`. You do **not** need Node.js or npm installed to run and test the complete application!

---

## 🌟 Key Capabilities Built for You

### 1. 🩺 "Dr. Sanjeevani AI" - Interactive Clinical Triage & Certified Medicine Guide
* **First Step Onboarding**: When user opens the platform, it asks:
  > *"What is your problem? / आपको क्या समस्या है?"*
* **Clinical Verification**: Verifies patient age, duration of illness, and severity checks.
* **Evidence-Based Medicine & First-Aid Guidance (No Random Guesswork)**:
  - **Fever & Body Aches (बुखार)**: Paracetamol (Dolo 650 / Crocin) with adult/pediatric dosages, frequency (every 6-8 hours, max 3000mg/day), liver cautions, and lukewarm sponge instructions.
  - **Cold, Sneezing & Runny Nose (सर्दी, जुकाम)**: Cetirizine 10mg / Levocetirizine 5mg at bedtime, non-drowsy Loratadine, saline nasal drops, steam inhalation.
  - **Cough (खांसी)**: Distinguishes dry hacking cough (Dextromethorphan) vs wet productive phlegm (Guaifenesin + Ambroxol).
  - **Acidity & Gas (गैस, सीने में जलन)**: Pantoprazole 40mg (Pan-40) 30 mins before breakfast, antacid liquids (Digene / Gelusil).
  - **Loose Motions / Diarrhea (दस्त)**: WHO Oral Rehydration Salts (ORS Electral) sachet in 1L water, Zinc Sulfate, probiotic flora support.
  - **Mandatory Antibiotic Caution**: Explicitly warns that antibiotics (like Azithromycin) are ineffective against viral flu/cold and must **never** be taken without a physical doctor's examination.
* **Emergency Escalation**: For critical signs (chest pain radiating to arm, acute right abdominal pain, eye trauma, blocked urine), it triggers immediate red-flag warnings and auto-triages to the nearest specialized Gwalior hospital.

---

### 2. 🏥 Dedicated Gwalior & Madhya Pradesh Hospital Directory
Categorized specifically for patient needs:
* 👁️ **Eye Hospitals (नेत्र अस्पताल)**:
  - *Ratan Jyoti Netralaya (RJN Ophthalmic Institute)*: Premier NABH super-specialty eye hospital, modular OT for cataract, retina & Lasik.
  - *Gwalior Netra Chikitsalaya (Gwalior Eye Hospital)*: Phoolbagh, charitable eye surgery & glaucoma care.
  - *ASG Eye Hospital*: City Center, Contoura Lasik, retina & refractive surgery.
  - *Drishti Eye Care & Laser Centre*: Morar.
  - *Jawaharlal Nehru Eye Department (JAH & GRMC)*: 24/7 emergency eye trauma casualty.
* 🫀 **Heart & Cardiac Care (हृदय रोग संस्थान)**:
  - *Super Speciality Hospital (SSH) & GRMC Cardiac Institute*: Government digital Cath Lab running 24x7, angioplasty, pacemaker & 20-bed CCU.
  - *BIMR Heart Institute (Birla Hospital)*: Interventional cardiology, bypass surgery (CABG) & mobile cardiac ICU ambulance.
  - *Apollo Spectra Hospital - Cardiac & Critical Care*: City Center, 24x7 emergency chest pain unit, 2D Echo, Troponin rapid test.
  - *Kalyan Memorial Heart & Multispecialty Hospital*: Morar.
* 🩸 **Kidney, Nephrology & Dialysis (गुर्दा एवं डायलिसिस)**:
  - *Gwalior Kidney Care & Hemodialysis Centre*: City Center, 12 Fresenius dialysis machines, double RO plant, resident DM nephrologist.
  - *BIMR Nephrology & Dialysis Unit*: 15 stations, CRRT for ICU patients, kidney stone laser.
  - *Super Speciality Hospital (SSH) - Government Free Dialysis Unit*: Pradhan Mantri National Dialysis Programme, 100% free under Ayushman.
  - *Apex Urology & Kidney Stone Clinic*: Jayendraganj, Lashkar.
* 🚑 **24/7 Emergency & Trauma (आपातकालीन व ट्रॉमा)**:
  - *JAH Level-1 Trauma Centre*: 100-bed tertiary trauma centre, in-house blood bank, round-the-clock neurosurgeons & orthopaedic surgeons.
  - *Civil Hospital Morar*: 24-hour casualty, emergency resuscitation.
* 🎗️ **Cancer Care (कैंसर संस्थान)**:
  - *Cancer Hospital & Research Institute (CHRI Gwalior)*: Mandre Ki Mata, Lashkar, Linear Accelerators, Cobalt radiation, surgical oncology & chemotherapy daycare.
* 👶 **Mother & Child Care (महिला व शिशु अस्पताल)**:
  - *Kamla Raja Hospital (KRH)*: Government 450-bed women & children hospital, Level-3 NICU & PICU.
  - *Sharda Mother & Child Nursing Home*: Thatipur.
* 📍 **Surrounding Madhya Pradesh Hubs**:
  - *Dabra Civil Hospital (Gwalior Rural, MP)*
  - *Morena District Hospital (MP)*
  - *Bhind District Hospital (MP)*

---

### 3. 📍 Real-Time Location & Gwalior Locality Matching
- **Live GPS Detection**: Tap *"Use My Live GPS"* to calculate exact driving distance and travel time from your phone's coordinates.
- **Gwalior Locality Selector**: Choose directly from Gwalior neighborhoods:
  * *Lashkar (Maharaj Bada / Kampoo)*
  * *City Center (Madhav Rao Scindia Marg)*
  * *Morar (Mall Road / Civil Hospital)*
  * *Thatipur / Gandhi Nagar*
  * *Kampoo (JAH & GRMC Medical Campus)*
  * *Padav (Railway Station Area)*
  * *Hazira / Fort Road*
  * *Dabra, Morena, Bhind (MP)*
- Every hospital card displays **exact distance (km)**, **travel time (mins)**, **phone number with 1-click calling**, **Google Maps navigation**, and **WhatsApp family share**.

---

### 4. 🧪 Ground-Truth Evaluation & Hero Scenarios
- **Hero Scenario 1 (Bihar Ananya)**: Rejects `F09999` (15 km trap with unplugged concentrator) and recommends `F10000` (20 km solid nursing home with active surgeon and Ayushman acceptance).
- **Hero Scenario 2 (Gwalior)**: Disqualifies hollow signboard traps claiming 24/7 surgery with locked gates, and directs patient to verified night surgical facilities with posted anesthesiologists.
- **National Healthcare Desert Crisis Map**: Interactive spatial deficit index across 40 districts with animated flow lines connecting underserved areas to verified facilities.

---

## 🔐 Login
Open `http://localhost:8000/login` - enter name + phone (10-digit) or email. New users are auto-registered
(stored in `data/users.db`). After login you land on `/dashboard`. API: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.

---

## 🏥 Hospital Portal & Admin
- **Hospital staff:** `http://localhost:8000/hospital` - register (select hospital, name, phone/email, password) -> admin approves -> login -> update ER open/closed, free beds (General/ICU/Ventilator), doctors on duty, phone, timings, Ayushman. Patients see it instantly with "Updated x min ago" (and a warning if older than 6 hours).
- **Admin:** `http://localhost:8000/admin` - approve / reject hospital accounts. Default password `admin123`; change it before sharing:
  - Windows (PowerShell): `$env:ADMIN_PASSWORD="your-password"; python -m backend.main`
  - Mac/Linux: `ADMIN_PASSWORD=your-password python -m backend.main`
- Code: `backend/hospital_portal.py`, pages in `backend/pages/`. Data is stored in `data/users.db`.

---

## 📁 Repository Structure

```
arogya_gwalior/
├── backend/
│   ├── ai_consultant.py      # Dr. Sanjeevani AI: symptom verification & certified OTC meds
│   ├── data_loader.py        # SQLite repository with Gwalior & MP specialty indexing
│   ├── schema_config.py      # Unified column mapping for any real dataset swap
│   ├── extractor.py          # Agent 1: Hinglish capability extractor + citation matcher
│   ├── trust_scorer.py       # 0-100 explainable trust score & contradiction engine
│   ├── medical_standards.py  # IPHS & NABH acute clinical safety requirements
│   ├── validator.py          # Agent 3: Clinical safety validator & audit logger
│   ├── reasoner.py           # Agent 2: Multi-lingual intent normalizer & router
│   ├── desert_analyzer.py    # Spatial deficit analysis across 5 specialties
│   ├── evaluator.py          # Ground-truth evaluation benchmarks & confusion matrix
│   └── main.py               # FastAPI application + static frontend server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIConsultantModal.jsx      # Dr. Sanjeevani AI symptom verification & meds
│   │   │   ├── SpecialtyHospitalGrid.jsx  # Gwalior & MP Eye, Heart, Kidney, Trauma Directory
│   │   │   ├── Navbar.jsx                 # Nav with theme, language, and tab pickers
│   │   │   ├── EmergencySearch.jsx        # Giant emergency button, voice mic & presets
│   │   │   ├── ResultCard.jsx             # SVG Trust Ring, badges, reasoning timeline
│   │   │   ├── RejectedNearbyPanel.jsx    # The Wow Moment: Why the closer hospital fails
│   │   │   ├── CrisisMap.jsx              # Interactive desert map with animated flow lines
│   │   │   ├── EvaluationDashboard.jsx    # Benchmark suite with 2x2 confusion matrix
│   │   │   ├── HeroStory.jsx              # Guided interactive case study walkthrough
│   │   │   └── TraceDrawer.jsx            # Raw survey note audit drawer
│   │   ├── translations.js   # 8-language localization dictionary
│   │   ├── themeContext.jsx   # Theme & language state manager
│   │   ├── App.jsx            # Main app shell & orchestration
│   │   └── index.css          # Theme variables & ECG heartbeat animations
│   ├── dist/                  # Optimized production build (82.1 kB gzipped)
│   └── package.json
├── data/
│   ├── gwalior_facilities.csv          # Categorized Gwalior Eye, Heart, Kidney, Trauma Hospitals
│   ├── build_gwalior_specialties.py    # Gwalior dataset builder
│   ├── india_10k_synthetic.csv         # 10,000 national benchmark dataset
│   ├── ground_truth.csv                # Hidden evaluation truth
│   ├── gwalior_demo_notes.csv          # Simulated Gwalior clinical notes
│   └── gwalior_ground_truth.csv        # Gwalior ground truth
├── README.md                           # Documentation
└── demo_script.md                      # 3-minute presentation script
```
