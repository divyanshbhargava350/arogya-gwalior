ROLE
You are a senior full-stack + AI engineer and an award-winning product designer.
Build "SANJEEVANI" (placeholder name): an Agentic Healthcare Intelligence System for India
that finds the RIGHT facility at THIS moment, not just the nearest one.

PERSONAS TO DESIGN FOR
A) Ananya, 34, semi-rural Bihar (Samastipur, GPS lat 25.90, lon 85.78), basic Android phone,
   slow 3G, Rs 500 cash. Her father has severe abdominal pain. She needs ONE trusted answer in
   under 10 seconds, in her own language, by voice if needed.
B) A family in Gwalior, Madhya Pradesh (city centre approx lat 26.22, lon 78.18) needing the
   right hospital for an emergency at night. This is the REAL-GEOGRAPHY demo.

DATA (all in /data/)
1. india_10k_synthetic.csv: 10,000 SYNTHETIC facilities, 17 columns:
   facility_id, name, facility_type, ownership, state, district, pincode, address, latitude,
   longitude, phone, beds_listed, specialties_listed, emergency_listed, icu_listed,
   survey_year, unstructured_notes
   - unstructured_notes is messy: English + Hinglish, typos ("docter", "emergancy"), random
     CAPS/lowercase, mixed separators, filler text. The truth is hidden in it.
   - Deliberate dirt: ~4% PIN missing, ~3% lat/long missing, ~12% phone missing, survey years
     2019-2023. ~40% of rows are Bihar; 38 districts in 14 states.
2. ground_truth.csv: EVALUATION ONLY for the synthetic file. NEVER let any agent, scorer or
   search read it. Columns: facility_id, profile (solid/partial/hollow), icu_listed,
   icu_functional, oxygen_working, emergency_24x7_listed, emergency_functional, surgeon,
   anesthesiologist, resident_doctor, part_time_doctors, dialysis, oncology, trauma,
   blood_bank, beds_available, advanced_surgery_listed, appendectomy_capable
3. gwalior_facilities.csv: REAL hospitals/clinics in Gwalior, MP from OpenStreetMap (same 17
   columns, IDs GWL0001...). It has real names, locations, some phone/beds/emergency tags, but
   NO equipment/staff detail. Created by fetch_gwalior.py.
4. gwalior_demo_notes.csv (build this in Step 1): a clearly labeled SYNTHETIC notes layer for
   Gwalior facilities so the agents have something to reason on. Rules:
   - Column `notes_source` = "SYNTHETIC_DEMO" on every row, and the UI must show a visible
     "Demo data" badge for any capability that comes from this layer.
   - Never present invented capabilities of a real named hospital as real fact. In the UI and
     demo script, say the Gwalior capability details are simulated.
   - Reuse the same trap patterns as the main dataset (unplugged ICU, advanced surgery without
     anesthesiologist, 24/7 claim with no night doctor, Hinglish phrasing).
   - Keep a separate gwalior_ground_truth.csv for evaluation, never read by the agents.
5. The real "India 10k Dataset" may use different column names. Put ALL column names in ONE
   schema-mapping config so real data can be swapped in with minimal change. Profile every
   file first and show me the report.

DATA LOADING RULES
- Merge into one table with a `dataset` column: "india10k_synthetic", "gwalior_osm",
  "gwalior_demo_notes". Every result and citation shows which dataset it came from.
- Deduplicate Gwalior records (same name within ~100 m). Impute missing lat/long from PIN or
  district centroid and flag "approximate location".
- Gwalior OSM rows missing PIN: reverse-assign from the nearest known Gwalior PIN centroid
  (474xxx range) and flag as inferred.

KNOWN TRAPS THE SYSTEM MUST CATCH
- ~1,700 facilities list an ICU that is not functional ("oxygen concentrator unplugged",
  "ventilator not working", "ICU board lagaya hai par andar sirf bed hai").
- ~1,900 claim advanced surgery with no anesthesiologist.
- "24/7 EMERGENCY" written on the gate but ward locked / no doctor at night.
- Hinglish: "ICU me ventilator chalu hai", "bed khali", "doctor sahab shaam ko aate hain".
- Part-time / visiting doctors in many phrasings.

HERO TEST SCENARIO 1 (Bihar, must work end to end)
Query: "Severe abdominal pain, need emergency appendectomy, nearest option, part-time doctors
are okay." from Ananya at lat 25.90, lon 85.78.
- REJECT F09999 "Shri Ram Janki Hospital" (Samastipur, ~15 km): ICU room but oxygen
  concentrator unplugged, no doctor on duty, 24/7 emergency only written on the gate, advanced
  surgery claimed with no surgeon or anesthesiologist. Show WHY with row citation.
- RECOMMEND F10000 "Maa Sharda Nursing Home" (Samastipur, ~20 km opposite direction): resident
  doctor on campus, surgeon on part-time contract, anaesthetist posted, OT functional,
  appendectomy done regularly, 2 beds free, oxygen working. Plain keyword search for
  "emergency care" will not surface it; semantic + extracted-field search must.

HERO TEST SCENARIO 2 (Gwalior, real map)
Query (Hindi/Hinglish accepted): "Gwalior me raat ko emergency surgery ke liye sabse paas ka
hospital jahan anaesthetist ho." From lat 26.22, lon 78.18.
- The system must rank real Gwalior facilities by distance + trust score, reject at least one
  nearby facility with a contradiction (from the synthetic notes layer) and cite the note text.
- Show a "Demo data" badge on all capability claims in this scenario.

BACKEND (Python, FastAPI)
1. Ingestion: as in DATA LOADING RULES. Embed unstructured_notes with a multilingual
   sentence-transformer into Chroma/FAISS; keep DuckDB/SQLite for structured filters.
2. Agent 1 EXTRACTOR: LLM turns each messy note into JSON:
   {icu_functional, oxygen_working, emergency_functional, surgeon, anesthesiologist,
    resident_doctor, part_time_doctors, dialysis, oncology, trauma, blood_bank,
    beds_available, appendectomy_capable, evidence_quote, source_row_id, dataset}
   Must distinguish "listed" vs "actually functional". Always return the exact evidence snippet.
   If the note has no evidence for a field, return null (unknown), never guess false or true.
   Cache results, batch calls, progress bar and cost estimate.
3. Agent 2 REASONER: parse complex queries (e.g. "nearest facility in rural Bihar that can do
   emergency appendectomy and uses part-time doctors") into filters + semantic search +
   haversine distance ranking from GPS/PIN. English, Hindi, Hinglish queries.
4. TRUST SCORER (0-100, explainable, rule-based + LLM): flag contradictions with citations:
   - advanced surgery claimed but no anesthesiologist
   - 24/7 emergency claimed but no doctor/staff at night
   - ICU claimed without working oxygen/ventilator
   - equipment listed without staff to run it
   - stale data (survey older than 2022) lowers confidence
   - sparse evidence (e.g. OSM-only rows) caps confidence, shown as "Unverified"
   Output score, red flags, green flags, confidence.
5. Agent 3 VALIDATOR (self-correction loop): cross-check the answer against a medical-standards
   knowledge file (IPHS / NABH-style minimum requirements for appendectomy, ICU, dialysis,
   trauma, oncology). On failure send back to the Reasoner to re-rank. Log every correction.
6. TRACEABILITY: every claim links to facility_id + dataset + exact snippet.
7. DESERT ANALYZER: per PIN code / district, access score for Oncology, Dialysis, Trauma,
   Emergency Surgery, ICU = verified facilities weighted by trust score + distance to nearest
   verified one. Flag high-risk deserts. Include a Gwalior district view.
8. Endpoints: /search, /facility/{id}, /deserts, /trace/{query_id}, /voice.

EVALUATION (build this, it wins judges)
Use the ground-truth files ONLY in the evaluation module:
- Extractor accuracy and F1 per field (icu_functional, anesthesiologist, appendectomy_capable...)
- Contradiction detection precision/recall (flags vs profile == "hollow")
- Hero scenario 1 test: F09999 rejected, F10000 ranked #1
- Hero scenario 2 test: a contradiction facility in Gwalior is rejected with citation
- Results table + confusion matrices on an "Evaluation" page in the app.

FRONTEND: MAKE IT JAW-DROPPING (React + Vite + Tailwind + Framer Motion + GSAP, MapLibre GL /
deck.gl for maps, Three.js for hero)
Design direction: "Medical emergency meets Indian craft". Cinematic, warm, trustworthy, alive.
- HERO: full-screen animated India map of glowing dots, soft pulsing; red pulsing zones =
  deserts. GSAP ScrollTrigger story: India -> Bihar -> Samastipur -> Ananya, then a second
  zoom to Gwalior, then the product demo.
- EMERGENCY MODE: giant button "Emergency / Abhi Madad Chahiye". One tap: GPS -> speak or type
  symptom -> result in under 10 seconds.
- RESULT CARD: name, ETA, distance, animated TRUST RING, red/green flag chips, dataset badge
  (Synthetic / OSM / Demo), "Why this one?" expander with animated agent timeline
  (Extractor -> Reasoner -> Scorer -> Validator), one-tap Call / Navigate / WhatsApp share.
- "REJECTED NEARBY" panel: the closer facility that fails and WHY, with citation. This is the
  wow moment, for both Bihar and Gwalior.
- CRISIS MAP PAGE: PIN-code choropleth, layer toggles (Oncology, Dialysis, Trauma, ICU), 3D
  extruded hex-bins, animated flow lines from desert to nearest verified facility, time slider.
- TRACE DRAWER: click any claim -> raw note text with evidence highlighted.
- Micro-interactions: magnetic buttons, skeleton shimmer, count-up numbers, parallax cards,
  glassmorphism, page transitions, Lottie ECG heartbeat loader.

THEMES (switcher, persisted)
1. "Sanjeevani Day": warm cream, saffron, deep teal.
2. "Night Ward": near-black navy, neon cyan + emergency red glow.
3. "Mithila": Madhubani-inspired borders, earthy reds/yellows.
4. "High Contrast": accessibility mode, large text.

FONTS (Google Fonts)
Display: Clash Display / Poppins ExtraBold. Body: Inter / Mukta. Hindi/Bhojpuri/Maithili: Noto
Sans Devanagari, headings Yatra One / Tiro Devanagari Hindi. Bengali: Hind Siliguri. Tamil: Noto
Sans Tamil. Telugu: Noto Sans Telugu. Citations/numbers: JetBrains Mono. Story accent: Kalam.

LANGUAGES (i18next, instant switch)
English, Hindi, Bhojpuri, Maithili, Bengali, Tamil, Telugu, Marathi. Voice in/out (Web Speech
API / Bhashini). Symptom input in any language is normalized to medical intent by the LLM.
Icons + colors so low-literacy users understand.

LOW-BANDWIDTH + RURAL READY
PWA, offline cache of last results, lite mode (no 3D, static tiles), lazy images, initial JS
under 200KB in lite mode, works on 3G. WhatsApp/SMS share: "name, distance, phone, trust score".

SAFETY AND HONESTY
Always show: "Verified from data, not a medical diagnosis. Call 108 for life-threatening
emergencies." Show data freshness (survey year), dataset source and confidence. Never present a
facility as certain when evidence is weak. Mark approximate locations. Label all synthetic and
demo data clearly; never imply invented details about a real named hospital are real.

DELIVERABLES
1. Repo structure + README (setup in 3 commands).
2. Data profiling notebook for all datasets + extraction prompt templates.
3. Working backend + frontend with both hero scenarios preloaded.
4. Evaluation report.
5. 3-minute demo script + architecture diagram.

WORK ORDER (show progress after each step, ask before big assumptions)
Step 1 profile all data + build Gwalior demo notes layer -> Step 2 extractor -> Step 3 scorer +
validator -> Step 4 evaluation vs ground truth -> Step 5 search API -> Step 6 desert maps ->
Step 7 frontend polish -> Step 8 demo.
