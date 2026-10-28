"""
Clinical AI Consultant & Symptom Verification Agent (Dr. Sanjeevani AI).
Powered by authoritative 68 Common Diseases Knowledge Base, verified OTC drug guidance,
strict antibiotic warnings, and accurate hospital / medical store routing.
"""
from typing import Dict, Any, List, Optional
import re
from backend.disease_knowledge_base import (
    DISEASES_68,
    GENERAL_HEALTH_PRECAUTIONS,
    MEDICAL_DISCLAIMER_EN,
    MEDICAL_DISCLAIMER_HI,
    find_matching_disease
)

class AIConsultantAgent:
    """
    Expert Medical AI Consultant for Arogya Gwalior & Sanjeevani.
    Analyzes symptoms across 68 core medical conditions in English, Hindi, and Hinglish.
    Accurately separates kidney, cardiac, eye, orthopedic, and respiratory conditions from fever/cold.
    """
    def __init__(self):
        pass

    def evaluate_symptom(
        self,
        symptom_text: str,
        age: Optional[int] = 30,
        duration_days: Optional[int] = 1,
        lang: str = "hi"
    ) -> Dict[str, Any]:
        text = symptom_text.lower().strip()
        is_hi = (lang == "hi")

        # 1. First, search the 68 Disease Knowledge Base
        matched_disease = find_matching_disease(text)

        if matched_disease:
            disclaimer = MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            return {
                "status": "DISEASE_MATCHED",
                "is_emergency": matched_disease.get("is_emergency", False),
                "disease_id": matched_disease["id"],
                "category": matched_disease["hospital_category"],
                "title": matched_disease["name_hi"] if is_hi else matched_disease["name_en"],
                "title_en": matched_disease["name_en"],
                "title_hi": matched_disease["name_hi"],
                "symptoms": matched_disease["symptoms_hi"] if is_hi else matched_disease["symptoms_en"],
                "treatment": matched_disease["treatment_hi"] if is_hi else matched_disease["treatment_en"],
                "precautions": matched_disease["precautions_hi"] if is_hi else matched_disease["precautions_en"],
                "warning": matched_disease["warning_hi"] if is_hi else matched_disease["warning_en"],
                "action": matched_disease["treatment_hi"] if is_hi else matched_disease["treatment_en"],
                "first_aid": matched_disease["precautions_hi"] if is_hi else matched_disease["precautions_en"],
                "general_precautions": [
                    p["text_hi"] if is_hi else p["text_en"] for p in GENERAL_HEALTH_PRECAUTIONS
                ],
                "disclaimer": disclaimer,
                "summary": f"Identified {matched_disease['name_en']}. Showing exact clinical symptoms, treatments, precautions, and verified Gwalior specialist hospitals."
            }

        # 2. Critical Emergency Fallbacks
        # Heart Attack / Cardiac Emergency
        if any(w in text for w in ["heart attack", "cardiac", "हार्ट अटैक", "हार्ट", "दिल का दौरा", "chest pain", "seene me dard", "छाती में दर्द", "सीने में दर्द"]):
            title_en = "Cardiac Alert / Acute Heart Emergency"
            title_hi = "हृदय आपातकाल (हार्ट अटैक का संदेह)"
            action_en = "Immediate emergency hospitalization required! Do NOT exert or walk. Dial 108 ambulance or proceed to Cath Lab / Cardiac ICU in Gwalior (BIMR Heart Institute or Super Specialty Hospital JAH Kampoo)."
            action_hi = "तत्काल आपातकालीन अस्पताल पहुंचें! मरीज को पैदल न चलाएं। तुरंत 108 एम्बुलेंस बुलाएं या सीधे निकटतम कैथ लैब व कार्डियक आईसीयू (बीआईएमआर हार्ट इंस्टीट्यूट मुरार या सुपर स्पेशलिटी हॉस्पिटल जेएएच कंपू) ले जाएं।"
            first_aid_en = "Chew 1 Disprin/Aspirin 300mg immediately if not allergic. Sit upright and loosen clothing."
            first_aid_hi = "यदि एलर्जी न हो तो तुरंत 1 डिस्प्रिन (Disprin 300mg) चबाएं। मरीज को पीठ के सहारे आराम से बैठाएं।"
            return {
                "status": "CRITICAL_EMERGENCY",
                "is_emergency": True,
                "category": "heart",
                "title": title_hi if is_hi else title_en,
                "title_en": title_en,
                "title_hi": title_hi,
                "action": action_hi if is_hi else action_en,
                "first_aid": first_aid_hi if is_hi else first_aid_en,
                "treatment": action_hi if is_hi else action_en,
                "precautions": first_aid_hi if is_hi else first_aid_en,
                "warning": "Do not delay transportation. Early angioplasty saves heart muscle." if not is_hi else "देरी न करें। शुरुआती घंटों में इलाज से दिल को बचाया जा सकता है।",
                "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            }

        # Kidney / Dialysis Emergency
        if any(w in text for w in ["kidney", "gurda", "dialysis", "किडनी", "गुर्दा", "डायलिसिस", "पथरी"]):
            title_en = "Kidney & Nephrology Evaluation"
            title_hi = "गुर्दा रोग एवं डायलिसिस परामर्श"
            action_en = "Specialist nephrology evaluation required at Gwalior Kidney Care City Center, BIMR Hospital, or SSH Government Free Dialysis Center."
            action_hi = "ग्वालियर के प्रमुख गुर्दा केंद्रों पर जांच कराएं: ग्वालियर किडनी केयर सिटी सेंटर, बीआईएमआर मुरार या सुपर स्पेशलिटी हॉस्पिटल कंपू।"
            treatment_en = "Urine R/M, KFT (Serum Creatinine, Urea), Ultrasound KUB; treatment strictly based on stone size or renal function."
            treatment_hi = "यूरिन जांच, केएफटी (क्रिएटिनिन व यूरिया) और सोनोग्राफी जांच; पथरी के आकार या गुर्दे की स्थिति अनुसार इलाज।"
            precautions_en = "Drink 3 to 4 Litres of water daily; avoid unprescribed painkillers (NSAIDs); avoid self-medication."
            precautions_hi = "दिन में 3-4 लीटर पानी पिएं; बिना डॉक्टर के दर्द निवारक गोलियां (पेनकिलर) बिल्कुल न खाएं।"
            warning_en = "Fever with back pain, or complete inability to pass urine requires immediate hospital care."
            warning_hi = "पीठ में दर्द के साथ बुखार या पेशाब रुक जाना आपातकालीन अस्पताल जाने का संकेत है।"
            return {
                "status": "KIDNEY_EVALUATION",
                "is_emergency": False,
                "category": "kidney",
                "title": title_hi if is_hi else title_en,
                "title_en": title_en,
                "title_hi": title_hi,
                "symptoms": "पेशाब में जलन, पीठ/कमर में दर्द, सूजन, पथरी का दर्द या डायलिसिस की आवश्यकता।" if is_hi else "Burning urination, flank pain, swelling, stone pain, or dialysis need.",
                "treatment": treatment_hi if is_hi else treatment_en,
                "precautions": precautions_hi if is_hi else precautions_en,
                "warning": warning_hi if is_hi else warning_en,
                "action": action_hi if is_hi else action_en,
                "first_aid": precautions_hi if is_hi else precautions_en,
                "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            }

        # Eye Condition
        if any(w in text for w in ["eye", "aankh", "आँख", "आंख", "vision", "motiyabind", "मोतियाबिंद", "चश्मा"]):
            title_en = "Ophthalmic Examination Needed"
            title_hi = "नेत्र रोग एवं दृष्टि परामर्श"
            action_en = "Visit specialized eye hospitals in Gwalior: Ratan Jyoti Netralaya (RJN) Kampoo or Gwalior Netra Chikitsalaya Phoolbagh."
            action_hi = "ग्वालियर के नेत्र अस्पताल जाएं: रतन ज्योति नेत्रालय (आरजेएन) कंपू या ग्वालियर नेत्र चिकित्सालय फूलबाग।"
            treatment_en = "Comprehensive slit-lamp eye examination, vision testing, intraocular pressure measurement."
            treatment_hi = "आँखों की विस्तृत स्लिट-लैम्प जांच, रोशनी व नंबर की जांच, आँख के प्रेशर की जांच।"
            precautions_en = "Do NOT rub eyes. Never use steroid eye drops without an ophthalmologist examining your cornea."
            precautions_hi = "आँखों को न मलें। बिना डॉक्टर की सलाह कभी भी स्टेरॉयड आई ड्रॉप्स न डालें।"
            warning_en = "Sudden vision loss or severe eye pain requires emergency ophthalmic care."
            warning_hi = "अचानक रोशनी जाना या आँख में तेज दर्द आपातकालीन जांच का संकेत है।"
            return {
                "status": "EYE_EVALUATION",
                "is_emergency": False,
                "category": "eye",
                "title": title_hi if is_hi else title_en,
                "title_en": title_en,
                "title_hi": title_hi,
                "symptoms": "धुंधला दिखना, आँख में दर्द, लाली, पानी आना, चश्मा नंबर बदलना।" if is_hi else "Blurry vision, eye pain, redness, watering, cataract symptoms.",
                "treatment": treatment_hi if is_hi else treatment_en,
                "precautions": precautions_hi if is_hi else precautions_en,
                "warning": warning_hi if is_hi else warning_en,
                "action": action_hi if is_hi else action_en,
                "first_aid": precautions_hi if is_hi else precautions_en,
                "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            }

        # Road Accident / Trauma Emergency
        if any(w in text for w in ["accident", "fracture", "chot", "haddi", "polytrauma", "एक्सीडेंट", "दुर्घटना", "हड्डी टूट गई", "फ्रैक्चर", "सिर में चोट"]):
            title_en = "Level-1 Trauma & Emergency Surgery"
            title_hi = "आपातकालीन ट्रॉमा एवं दुर्घटना चिकित्सा"
            action_en = "Rush immediately to 24x7 Level-1 Trauma Centre at Jaya Arogya Hospital (JAH) Kampoo or Civil Hospital Morar."
            action_hi = "तुरंत 24 घंटे चालू लेवल-1 ट्रॉमा सेंटर जयारोग्य अस्पताल (जेएएच) कंपू या सिविल हॉस्पिटल मुरार पहुंचें।"
            first_aid_en = "Apply direct firm pressure on bleeding wounds with clean cloth. Splint broken limbs. Keep neck still."
            first_aid_hi = "खून बहने पर साफ कपड़े से दबाएं। टूटी हड्डी को सहारा दें। गर्दन को हिलने न दें।"
            return {
                "status": "CRITICAL_EMERGENCY",
                "is_emergency": True,
                "category": "trauma",
                "title": title_hi if is_hi else title_en,
                "title_en": title_en,
                "title_hi": title_hi,
                "action": action_hi if is_hi else action_en,
                "first_aid": first_aid_hi if is_hi else first_aid_en,
                "treatment": action_hi if is_hi else action_en,
                "precautions": first_aid_hi if is_hi else first_aid_en,
                "warning": "Severe blood loss or head trauma is life threatening. Dial 108 immediately." if not is_hi else "अत्यधिक रक्तस्राव या सिर की चोट जानलेवा हो सकती है। तुरंत 108 बुलाएं।",
                "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            }

        # Maternity & Labor
        if any(w in text for w in ["delivery", "pregnancy", "prasav", "labor pain", "गर्भावस्था", "प्रसव", "डिलीवरी", "दर्द उठ गया"]):
            title_en = "Maternity & Emergency Labor Care"
            title_hi = "आपातकालीन प्रसव एवं प्रसूति सेवा"
            action_en = "Rush immediately to 24x7 Emergency Labor Room & Level-3 NICU at Kamla Raja Hospital (KRH Women & Children) JAH Campus, Gwalior."
            action_hi = "तुरंत 24 घंटे चालू प्रसव कक्ष एवं एनआईसीयू युक्त कमला राजा चिकित्सालय (केआरएच) जयारोग्य परिसर कंपू ग्वालियर ले जाएं।"
            first_aid_en = "Keep mother resting on her left side. Dial 108 for ambulance with trained paramedic."
            first_aid_hi = "गर्भवती महिला को बाईं करवट लिटाएं और तुरंत 108 जननी एक्सप्रेस या एम्बुलेंस बुलाएं।"
            return {
                "status": "CRITICAL_EMERGENCY",
                "is_emergency": True,
                "category": "maternity",
                "title": title_hi if is_hi else title_en,
                "title_en": title_en,
                "title_hi": title_hi,
                "action": action_hi if is_hi else action_en,
                "first_aid": first_aid_hi if is_hi else first_aid_en,
                "treatment": action_hi if is_hi else action_en,
                "precautions": first_aid_hi if is_hi else first_aid_en,
                "warning": "Sudden water breaking, severe bleeding, or reduced baby movement requires urgent care." if not is_hi else "अचानक पानी छूटना या रक्तस्राव होना आपातकाल है।",
                "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
            }

        # Default General Guidance (Fever / General Consult)
        fever_disease = DISEASES_68[0] # Common cold / flu as general reference
        return {
            "status": "GENERAL_INQUIRY",
            "is_emergency": False,
            "category": "general",
            "title": "सामान्य स्वास्थ्य परामर्श" if is_hi else "General Health Consultation",
            "title_en": "General Health Consultation",
            "title_hi": "सामान्य स्वास्थ्य परामर्श",
            "symptoms": "कृपया अपनी विशिष्ट समस्या बताएं जैसे: बुखार, सर्दी, खांसी, पेट दर्द, आँख, दिल, या किडनी की परेशानी।" if is_hi else "Please specify symptoms like fever, cold, cough, abdominal pain, eye, heart, or kidney issues.",
            "treatment": "पर्याप्त आराम, खूब गुनगुना पानी, तरल पदार्थ और आवश्यकतानुसार चिकित्सक से परामर्श।" if is_hi else "Rest, abundant hydration, and consultation with a physician as needed.",
            "precautions": "बिना डॉक्टर की सलाह एंटीबायोटिक या तेज दवाइयां न लें।" if is_hi else "Do not take antibiotics or heavy medications without doctor advice.",
            "warning": "लक्षण 2-3 दिन से अधिक रहने पर निकटतम अस्पताल में जांच कराएं।" if is_hi else "If symptoms persist beyond 2-3 days, visit a nearby clinic or hospital.",
            "action": "निकटतम सत्यापित अस्पताल या मेडिकल स्टोर से संपर्क करें।" if is_hi else "Contact nearest verified hospital or pharmacy.",
            "general_precautions": [
                p["text_hi"] if is_hi else p["text_en"] for p in GENERAL_HEALTH_PRECAUTIONS
            ],
            "disclaimer": MEDICAL_DISCLAIMER_HI if is_hi else MEDICAL_DISCLAIMER_EN
        }
