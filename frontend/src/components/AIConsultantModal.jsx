import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import {
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  MapPin,
  Phone,
  Navigation,
  Share2,
  HelpCircle,
  Send,
  Volume2
} from 'lucide-react';

export default function AIConsultantModal({
  userLocation,
  onSelectHospital,
  initialSymptom = ""
}) {
  const { t, lang } = useTheme();
  const [symptom, setSymptom] = useState(initialSymptom);
  const [age, setAge] = useState(28);
  const [durationDays, setDurationDays] = useState(1);
  const [severity, setSeverity] = useState('mild'); // mild, moderate, severe
  const [consultResult, setConsultResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickSymptoms = [
    { label: "🌡️ Fever & Body Ache (बुखार)", query: "mujhe bukhar aur badan dard hai" },
    { label: "🤧 Cold, Cough & Sneezing (सर्दी, जुकाम)", query: "sardi jukam aur naak beh rahi hai" },
    { label: "👁️ Eye Strain / Vision Problem (आँखों की समस्या)", query: "aankh me dard aur dhundhla dikh raha hai" },
    { label: "🫀 Chest Tightness (सीने में दर्द / दिल की तकलीफ)", query: "severe chest pain and left arm pain" },
    { label: "🩸 Kidney / Urine Pain / Dialysis (गुर्दा / पेशाब में दर्द)", query: "kidney me tez dard aur urine problem" },
    { label: "🤢 Acidity & Gas (गैस, एसिडिटी)", query: "pet me gas aur seene me jalan ho rahi hai" },
    { label: "🚽 Loose Motions / Diarrhea (दस्त)", query: "loose motions aur pet me marod hai" }
  ];

  const handleConsult = async (queryText = symptom) => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: queryText,
          age: parseInt(age) || 30,
          duration_days: parseInt(durationDays) || 1,
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          locality: userLocation.name
        })
      });
      const data = await res.json();
      setConsultResult(data);
    } catch (e) {
      console.error("Consultation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakGuidance = () => {
    if (!consultResult || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const evalData = consultResult.evaluation;
    let speakText = "";

    if (evalData.is_emergency) {
      speakText = `सावधान! यह आपातकालीन स्थिति हो सकती है। तुरंत अस्पताल जाएं। नजदीकी अस्पताल ${consultResult.recommended_gwalior_hospitals?.[0]?.name || 'ग्वालियर हॉस्पिटल'} है।`;
    } else if (evalData.clinical_guidance?.primary_medicine) {
      const med = evalData.clinical_guidance.primary_medicine;
      speakText = `डॉ. संजीवनी सलाह: ${med.name} लें। खुराक: ${med.dosage}। यदि 3 दिन में आराम न मिले तो डॉक्टर से संपर्क करें।`;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'hi-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Stethoscope className="w-7 h-7 animate-pulse text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-display">
                Dr. Sanjeevani AI (डॉ. संजीवनी क्लीनिकल असिस्टेंट)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AI Triaged
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
              What's your problem? Accurate evidence-based medicines for common illnesses & instant Gwalior hospital triage for acute care.
            </p>
          </div>
        </div>

        {/* User Location Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-semibold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>{userLocation.name || "Gwalior (City Center)"}</span>
        </div>
      </div>

      {/* Step 1: Tell Your Problem Input */}
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-extrabold text-stone-900 dark:text-white">
          1. What is your health problem today? / आपको क्या तकलीफ है?
        </label>

        {/* Quick Symptom Chips */}
        <div className="flex flex-wrap gap-2">
          {quickSymptoms.map((qs, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSymptom(qs.query);
                handleConsult(qs.query);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-emerald-500 border border-transparent font-medium text-stone-700 dark:text-stone-300 transition flex items-center gap-1.5"
            >
              <span>{qs.label}</span>
            </button>
          ))}
        </div>

        {/* Free text / search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConsult(symptom)}
            placeholder="Describe symptoms (e.g. 2 din se bukhar hai konsi dawai lu, chest pain, eye problem, kidney stone)..."
            className="flex-1 px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <button
            onClick={() => handleConsult(symptom)}
            disabled={loading || !symptom.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm shadow hover:from-emerald-700 hover:to-teal-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Verify & Prescribe</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Verification Details (Age, Duration, Severity) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-semibold block mb-1">
              Patient Age (उम्र):
            </span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg px-2 py-1 font-mono text-stone-900 dark:text-white"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-semibold block mb-1">
              Duration of Symptoms (कितने दिन से है?):
            </span>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg px-2 py-1 text-stone-900 dark:text-white"
            >
              <option value={1}>Today / 1 Day (आज से)</option>
              <option value={2}>2 - 3 Days (दो-तीन दिन से)</option>
              <option value={5}>4 - 7 Days (एक हफ्ते से)</option>
              <option value={14}>More than 2 Weeks (दो हफ्ते से ज्यादा)</option>
            </select>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-semibold block mb-1">
              Severity Level (तीव्रता):
            </span>
            <div className="flex gap-1">
              {['mild', 'moderate', 'severe'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`flex-1 py-1 rounded capitalize font-bold transition text-[11px] ${
                    severity === lvl
                      ? lvl === 'severe'
                        ? 'bg-red-600 text-white'
                        : lvl === 'moderate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Consultation Output Card */}
      {consultResult && (
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-slate-800 animate-fadeIn">
          {/* Audio speak guidance button */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Verified Clinical Assessment
            </span>
            <button
              onClick={handleSpeakGuidance}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isSpeaking
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Speaking...' : 'Listen to Advice (आवाज़ में सुनें)'}</span>
            </button>
          </div>

          {/* CRITICAL EMERGENCY ESCALATION CARD */}
          {consultResult.evaluation.is_emergency && (
            <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500 text-red-950 dark:text-red-200 space-y-3">
              <div className="flex items-center gap-2 font-black text-red-600 dark:text-red-400 text-base">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <span>🚨 CRITICAL EMERGENCY DETECTED - IMMEDIATE HOSPITALIZATION REQUIRED</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                {consultResult.evaluation.summary}
              </p>

              {consultResult.evaluation.alerts?.map((al, aIdx) => (
                <div key={aIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-300/50 text-xs space-y-1">
                  <div className="font-extrabold text-red-700 dark:text-red-300">
                    {al.title}
                  </div>
                  <p className="text-stone-700 dark:text-stone-300">
                    <strong>Action:</strong> {al.action}
                  </p>
                  {al.first_aid && (
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      <strong>Immediate First-Aid:</strong> {al.first_aid}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="tel:108"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 108 Emergency Ambulance</span>
                </a>
              </div>
            </div>
          )}

          {/* SAFE COMMON AILMENT PRESCRIPTION CARD */}
          {consultResult.evaluation.clinical_guidance && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-slate-950 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white font-display">
                    {consultResult.evaluation.clinical_guidance.title}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Certified First-Line OTC
                </span>
              </div>

              {/* Primary Medicine Details */}
              {consultResult.evaluation.clinical_guidance.primary_medicine && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-emerald-900 dark:text-emerald-300">
                      💊 {consultResult.evaluation.clinical_guidance.primary_medicine.name || "Recommended Medicine"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Generic: {consultResult.evaluation.clinical_guidance.primary_medicine.generic}
                    </span>
                  </div>

                  <div className="text-stone-700 dark:text-stone-300">
                    <strong>Dosage & Frequency (खुराक):</strong>{' '}
                    {consultResult.evaluation.clinical_guidance.primary_medicine.dosage}
                  </div>

                  {consultResult.evaluation.clinical_guidance.primary_medicine.precautions && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/50">
                      <strong>⚠️ Precautions:</strong>{' '}
                      {consultResult.evaluation.clinical_guidance.primary_medicine.precautions}
                    </div>
                  )}
                </div>
              )}

              {/* Strict Antibiotic Warning */}
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory Medical Caution:</strong> Antibiotics (like Azithromycin, Augmentin, Ciprofloxacin) are prescription-only medicines and are completely INEFFECTIVE against viral colds and fevers. Never take antibiotics without a physician's physical examination.
                </div>
              </div>

              {/* Home Care Instructions */}
              {consultResult.evaluation.clinical_guidance.home_care && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Recommended Home Supportive Care (घरेलू देखभाल):
                  </span>
                  <ul className="list-disc list-inside text-xs text-stone-700 dark:text-stone-300 space-y-1">
                    {consultResult.evaluation.clinical_guidance.home_care.map((hc, hIdx) => (
                      <li key={hIdx}>{hc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags When to rush to hospital */}
              {consultResult.evaluation.clinical_guidance.red_flags && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold block mb-1">
                    🚨 Danger Signs (When to immediately visit a Gwalior Hospital):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {consultResult.evaluation.clinical_guidance.red_flags.map((rf, rIdx) => (
                      <li key={rIdx}>{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* NEARBY GWALIOR HOSPITALS FOR THIS CONDITION */}
          {consultResult.recommended_gwalior_hospitals?.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>Nearest Gwalior & MP Facilities Equipped for this Condition:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  From {userLocation.name}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consultResult.recommended_gwalior_hospitals.map((h) => (
                  <div
                    key={h.facility_id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {h.facility_type}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {h.distance_km} km ({h.estimated_eta_mins} mins)
                        </span>
                      </div>

                      <h5 className="font-extrabold text-sm text-stone-900 dark:text-white mt-1.5 font-display">
                        {h.name}
                      </h5>
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{h.address || h.locality}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100 dark:border-slate-800">
                      {h.phone && (
                        <a
                          href={`tel:${h.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call: {h.phone}</span>
                        </a>
                      )}
                      <a
                        href={`https://maps.google.com/?q=${h.latitude},${h.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Navigation className="w-3 h-3 text-blue-500" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
