# 🎙️ 3-Minute Presentation Demo Script
## Project: SANJEEVANI (संजीवनी) - Agentic Healthcare Intelligence for India

---

### [0:00 - 0:45] Minute 1: The Fatal Flaw of Modern Hospital Navigation

*(Presenter speaks with conviction, showing the landing screen on `http://localhost:8000`)*

> "Judges, in India today, when a medical emergency strikes, people open Google Maps or hospital directory apps and pick the closest hospital. But here is the tragic truth: **Proximity is often a fatal illusion.**
>
> In our national facility database of 10,000 facilities, **1,719 facilities** advertise an ICU on their signboard that is completely fake or broken—the oxygen concentrator is unplugged, or there are no doctors on duty. Over **4,100 facilities** claim '24/7 EMERGENCY' on their gate, but the ward is padlocked at night with only an unqualified compounder inside.
>
> When acute appendicitis or trauma strikes, sending a patient to the *closest* hospital can be a death sentence. Meet **Ananya**—a 34-year-old daughter in rural Samastipur, Bihar. Her father has acute lower right abdominal pain. She has an inexpensive Android phone, a 3G connection, and Rs 500 cash. She needs ONE safe answer in under 10 seconds."

---

### [0:45 - 1:45] Minute 2: The Hero Test & "The Wow Moment"

*(Presenter clicks the top amber pill: `⚡ Ananya (Bihar)`)*

> "Watch what happens when Ananya searches: *'Severe abdominal pain, need emergency appendectomy, nearest option, part-time doctors are okay.'*
>
> Commercial apps would send her to **Shri Ram Janki Hospital** because it is closer—only **15 km away**—and its signboard claims '24/7 Emergency & Advanced Surgery'.
>
> But look at our **'REJECTED NEARBY'** panel—**this is the wow moment**.
> Sanjeevani's Extractor and Validator read the ground survey text:
> *'ICU room available but oxygen concentrator unplugged, no doctor on duty... 24/7 EMERGENCY written on gate, ward locked at time of survey... no surgeon or anesthesiologist.'*
>
> Sanjeevani **disqualified** the closer hospital and routed Ananya to **Maa Sharda Nursing Home**, 20 km away in the opposite direction.
> Why? Because our multi-agent ensemble verified that Maa Sharda has:
> 1. A resident MBBS doctor on campus 24x7,
> 2. A qualified general surgeon and dedicated posted anaesthetist,
> 3. Two vacant beds, working oxygen, and crucially for Ananya, **Ayushman Bharat card accepted**.
>
> Notice the **Animated Trust Score Ring** showing **99/100 (Solid)**, and click **'Why this facility?'** to see the complete audit trail of our 4 AI agents in 1.8 seconds."

---

### [1:45 - 2:30] Minute 3: Real Geography in Gwalior & Multi-Lingual Voice

*(Presenter switches language dropdown to `हिंदी (Hindi)` and clicks `⚡ Gwalior`)*

> "Now let's switch to our **Real Geography Demo in Gwalior, Madhya Pradesh**.
> We ingested real hospitals from OpenStreetMap using real coordinates and amenities. Look at the top right: we can instantly switch to Hindi, Bhojpuri, Maithili, or Tamil. Low-literacy patients can press the **'Speak'** button in their own mother tongue.
>
> In Gwalior, a patient needing emergency night surgery is routed to **Apollo Spectra Hospital**, while hollow candidates claiming 24/7 surgery with locked doors at night are disqualified. And notice our strict clinical honesty: all simulated capability claims carry a clear **'Demo data'** badge."

---

### [2:30 - 3:00] Wrap-up: Healthcare Deserts & Ground-Truth Benchmarks

*(Presenter clicks `Desert Crisis Map` tab, then `Evaluation` tab)*

> "Finally, look at our **Crisis Map**. We computed spatial deficit scores across Indian districts for five critical specialties—Surgery, ICU, Dialysis, Oncology, and Trauma. Notice the animated flow vectors connecting healthcare deserts in rural Bihar and Rajasthan to the nearest certified safe hospital.
>
> And in our **Evaluation Tab**, we benchmarked our agents against hidden ground truth:
> - **Contradiction Detection F1:** 72.2%
> - **Hero Scenario 1 (Bihar):** **PASSED** (F09999 rejected, F10000 #1)
> - **Hero Scenario 2 (Gwalior):** **PASSED**
>
> Sanjeevani doesn't just find the nearest hospital. It finds the **RIGHT** hospital at **THIS** moment. Thank you!"
