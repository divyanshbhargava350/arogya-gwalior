import React, { useState, useEffect } from 'react';
import { useTheme } from './themeContext';
import Navbar from './components/Navbar';
import GwaliorMap from './components/GwaliorMap';
import {
  Eye,
  Heart,
  Droplets,
  Activity,
  Baby,
  Crosshair,
  Pill,
  Search,
  Mic,
  MapPin,
  Navigation,
  Phone,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Building2,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  FileText,
  BadgePercent
} from 'lucide-react';

export default function App() {
  const { lang } = useTheme();
  const isHi = lang === 'hi';

  // Flow State: null = Screen 1 (Hero & Ask Problem) | string = Screen 2 (Focused Results)
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [symptomText, setSymptomText] = useState("");
  const [aiGuidance, setAiGuidance] = useState(null);
  
  // 2-Section Switch in Screen 2: 'hospitals' | 'medicals'
  const [activeSection, setActiveSection] = useState('hospitals');

  // Facilities data
  const [hospitals, setHospitals] = useState([]);
  const [medicals, setMedicals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // User location state (default Gwalior City Center)
  const [userLocation, setUserLocation] = useState({
    lat: 26.2140,
    lon: 78.1910,
    name: isHi ? "सिटी सेंटर, ग्वालियर" : "City Center, Gwalior",
    key: "city_center"
  });

  // 8 Core Health Categories (Hospitals & 24x7 Medical Stores)
  const problemCategories = [
    {
      id: 'eye',
      icon: Eye,
      title_hi: "नेत्र रोग एवं दृष्टि समस्या",
      title_en: "Eye Care & Ophthalmology",
      desc_hi: "मोतियाबिंद, चश्मा नंबर, आँख में दर्द, लालिमा, रेटिना व लेसिक लेजर",
      desc_en: "Cataract Surgery, Lasik, Glaucoma, Retina & Vision Disorders",
      color: "from-blue-500 to-indigo-600",
      accent: "border-blue-200 dark:border-blue-900",
      badge_hi: "4 विशेषज्ञ अस्पताल",
      badge_en: "4 Specialist Centers",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 'heart',
      icon: Heart,
      title_hi: "हृदय रोग एवं छाती में दर्द",
      title_en: "Heart & Cardiology Care",
      desc_hi: "सीने में दर्द, बेचैनी, बीपी, हार्ट अटैक, एंजियोप्लास्टी व आईसीयू",
      desc_en: "Chest Pain, Heart Attack, 24x7 Cath Lab, Angioplasty, CCU",
      color: "from-rose-500 to-red-600",
      accent: "border-red-200 dark:border-red-900",
      badge_hi: "3 कैथ लैब युक्त अस्पताल",
      badge_en: "3 Cath Lab Centers",
      iconColor: "text-red-600 dark:text-red-400"
    },
    {
      id: 'kidney',
      icon: Droplets,
      title_hi: "गुर्दा रोग एवं डायलिसिस",
      title_en: "Kidney Care & Dialysis",
      desc_hi: "डायलिसिस, गुर्दे की पथरी लेजर, पेशाब में रुकावट व यूरिन इन्फेक्शन",
      desc_en: "Dialysis Machines, Kidney Stone Laser, Acute Renal Care",
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-200 dark:border-amber-900",
      badge_hi: "निःशुल्क व प्राइवेट डायलिसिस",
      badge_en: "Free & Private Dialysis",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      id: 'trauma',
      icon: Activity,
      title_hi: "आपातकालीन दुर्घटना एवं ट्रॉमा",
      title_en: "24x7 Accident & Emergency",
      desc_hi: "सड़क दुर्घटना, हड्डी फ्रैक्चर, गहरी चोट, सिर की चोट व इमरजेंसी सर्जरी",
      desc_en: "Road Accidents, Head Trauma, Fractures, Level-1 Trauma OT",
      color: "from-red-600 to-rose-700",
      accent: "border-rose-200 dark:border-rose-900",
      badge_hi: "24 घंटे इमरजेंसी चालू",
      badge_en: "24x7 Active Casualty",
      iconColor: "text-rose-600 dark:text-rose-400"
    },
    {
      id: 'maternity',
      icon: Baby,
      title_hi: "प्रसूति एवं महिला स्वास्थ्य",
      title_en: "Maternity & Pediatric NICU",
      desc_hi: "गर्भावस्था, सुरक्षित प्रसव (डिलीवरी), सिजेरियन एवं नवजात शिशु गहन चिकित्सा",
      desc_en: "24x7 Labor Room, Normal/C-Section, High-Risk Delivery, Level-3 NICU",
      color: "from-purple-500 to-pink-600",
      accent: "border-purple-200 dark:border-purple-900",
      badge_hi: "लेवल-3 एनआईसीयू चालू",
      badge_en: "Level-3 NICU Active",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      id: 'cancer',
      icon: Crosshair,
      title_hi: "कैंसर संस्थान एवं ऑन्कोलॉजी",
      title_en: "Comprehensive Cancer Care",
      desc_hi: "कीमोथेरेपी डेकेयर, रेडिएशन थेरेपी, कैंसर सर्जरी एवं बायोप्सी जांच",
      desc_en: "Chemotherapy Daycare, Linear Accelerator, Surgical Oncology",
      color: "from-teal-500 to-emerald-600",
      accent: "border-teal-200 dark:border-teal-900",
      badge_hi: "क्षेत्रीय कैंसर संस्थान",
      badge_en: "Regional Cancer Institute",
      iconColor: "text-teal-600 dark:text-teal-400"
    },
    {
      id: 'common_illness',
      icon: Pill,
      title_hi: "सामान्य बीमारियां (बुखार, सर्दी, खांसी, पेट दर्द)",
      title_en: "Common Illnesses (Fever, Cold, Cough)",
      desc_hi: "68 प्रमाणित बीमारियों की दवाएं, खुराक, परहेज व एंटीबायोटिक चेतावनी",
      desc_en: "68 Certified diseases, safe medicines, treatment, precautions & warnings",
      color: "from-emerald-500 to-teal-600",
      accent: "border-emerald-200 dark:border-emerald-900",
      badge_hi: "68 प्रमाणित रोग ज्ञानकोश",
      badge_en: "68 Clinical Formulary",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      id: 'medicals',
      icon: ShoppingBag,
      title_hi: "24 घंटे खुली दवा दुकानें (मेडिकल स्टोर)",
      title_en: "24x7 Medical Stores & Pharmacies",
      desc_hi: "ग्वालियर के 24 घंटे खुले सत्यापित मेडिकल स्टोर, जन औषधि केंद्र, 20% तक छूट एवं व्हाट्सएप होम डिलीवरी",
      desc_en: "Verified 24x7 Gwalior pharmacies, Jan Aushadhi generic savings & direct WhatsApp doorstep orders",
      color: "from-emerald-600 to-teal-700",
      accent: "border-emerald-300 dark:border-emerald-800",
      badge_hi: "24 घंटे दवा दुकानें",
      badge_en: "24x7 Pharmacies",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    }
  ];

  // Always load medical stores on load and when location/language changes
  useEffect(() => {
    loadMedicals(userLocation.lat, userLocation.lon, lang);
  }, [userLocation.lat, userLocation.lon, lang]);

  // Fetch hospitals when problem changes
  useEffect(() => {
    if (selectedProblem && selectedProblem !== 'medicals') {
      loadHospitals(selectedProblem, userLocation.lat, userLocation.lon, lang);
    }
  }, [selectedProblem, userLocation.lat, userLocation.lon, lang]);

  const loadHospitals = async (category, lat, lon, currentLang) => {
    setLoading(true);
    try {
      const catParam = (category === 'common_illness') ? 'general' : category;
      const res = await fetch(`/api/gwalior/specialties?category=${catParam}&lat=${lat}&lon=${lon}&lang=${currentLang}`);
      const data = await res.json();
      setHospitals(data.facilities || []);
      if (data.facilities?.length > 0 && !selectedFacilityId) {
        setSelectedFacilityId(data.facilities[0].id || data.facilities[0].facility_id);
      }
    } catch (e) {
      console.error("Failed to load hospitals:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicals = async (lat, lon, currentLang) => {
    try {
      const res = await fetch(`/api/gwalior/medicals?lat=${lat}&lon=${lon}&lang=${currentLang}`);
      const data = await res.json();
      setMedicals(data.medicals || []);
    } catch (e) {
      console.error("Failed to load medicals:", e);
    }
  };

  // Handle problem selection from Screen 1
  const handleSelectProblem = async (problemId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (problemId === 'medicals') {
      setSelectedProblem('medicals');
      setActiveSection('medicals');
      loadMedicals(userLocation.lat, userLocation.lon, lang);
      setAiGuidance({
        title: isHi ? "ग्वालियर 24 घंटे खुले सत्यापित मेडिकल स्टोर एवं जन औषधि केंद्र" : "Gwalior 24x7 Verified Medical Stores & Jan Aushadhi Centers",
        is_emergency: false,
        symptoms: isHi ? "24x7 रात में खुली दवा दुकानें, जेनेरिक दवाएं, 20% तक छूट एवं व्हाट्सएप होम डिलीवरी सेवा।" : "24x7 open pharmacies, genuine generic medicines, doorstep delivery & night medicine support.",
        treatment: isHi ? "डॉक्टर के पर्चे की दवाएं, प्राथमिक चिकित्सा सामग्री, जीवन रक्षक इंजेक्शन एवं जन औषधि किट।" : "Prescribed medications, emergency first aid, life-saving consumables and generic medicines.",
        precautions: isHi ? "हमेशा डॉक्टर के परामर्श अनुसार ही दवा लें। बिना पर्चे के एंटीबायोटिक्स का सेवन न करें। बिल व एक्सपायरी जांचें।" : "Always take medicines under qualified doctor's prescription. Do not take antibiotics without consultation.",
        warning: null,
        disclaimer: isHi ? "ग्वालियर नगर निगम क्षेत्र के सत्यापित मेडिकल स्टोर।" : "Verified retail medical pharmacies directory in Gwalior."
      });
      return;
    }

    setSelectedProblem(problemId);
    setActiveSection('hospitals');

    if (problemId === 'common_illness') {
      consultAI(isHi ? "सामान्य सर्दी जुकाम और बुखार" : "common cold and fever");
    } else if (problemId === 'kidney') {
      consultAI(isHi ? "गुर्दे की बीमारी और डायलिसिस" : "kidney disease and dialysis");
    } else if (problemId === 'heart') {
      consultAI(isHi ? "सीने में दर्द और दिल की बीमारी" : "chest pain and heart disease");
    } else if (problemId === 'eye') {
      consultAI(isHi ? "आँख में मोतियाबिंद और दृष्टि समस्या" : "cataract and vision eye problem");
    } else if (problemId === 'trauma') {
      consultAI(isHi ? "सड़क दुर्घटना और हड्डी फ्रैक्चर" : "road accident trauma fracture");
    } else if (problemId === 'maternity') {
      consultAI(isHi ? "गर्भावस्था और प्रसव डिलीवरी" : "pregnancy and delivery labor room");
    } else if (problemId === 'cancer') {
      consultAI(isHi ? "कैंसर कीमोथेरेपी और जांच" : "cancer chemotherapy oncology");
    }
  };

  // Consult Dr. Sanjeevani AI Agent
  const consultAI = async (queryText) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: queryText,
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          lang: lang
        })
      });
      const data = await res.json();
      setAiGuidance(data.evaluation || null);

      // Map to correct specialty based on AI diagnosis
      const cat = data.evaluation?.category || 'general';
      if (['eye', 'heart', 'kidney', 'trauma', 'maternity', 'cancer'].includes(cat)) {
        setSelectedProblem(cat);
      } else {
        setSelectedProblem('common_illness');
      }

      if (data.recommended_gwalior_hospitals?.length > 0) {
        setHospitals(data.recommended_gwalior_hospitals);
      }
      if (data.recommended_gwalior_medicals?.length > 0) {
        setMedicals(data.recommended_gwalior_medicals);
      }
    } catch (e) {
      console.error("AI consult failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Handle symptom search form submission
  const handleSymptomSearch = (e) => {
    e.preventDefault();
    if (!symptomText.trim()) return;
    consultAI(symptomText);
  };

  // Handle Live GPS detection
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: isHi ? "मेरी लाइव जीपीएस लोकेशन" : "My Live GPS Location",
            key: "live_gps"
          });
        },
        () => {
          alert(isHi ? "जीपीएस अनुमति उपलब्ध नहीं है। सिटी सेंटर ग्वालियर का उपयोग किया जा रहा है।" : "GPS permission denied. Using City Center Gwalior.");
        }
      );
    }
  };

  // Speech Recognition for Voice Input
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHi ? "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।" : "Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isHi ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptomText(transcript);
      consultAI(transcript);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-slate-950 text-stone-900 dark:text-stone-100 transition-colors font-sans selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Navbar
          onResetHome={() => {
            setSelectedProblem(null);
            setAiGuidance(null);
            setSymptomText("");
          }}
          userLocation={userLocation}
          onLocalitySelect={(loc) => {
            setUserLocation({
              lat: loc.lat,
              lon: loc.lon,
              name: isHi ? loc.label_hi : loc.label_en,
              key: loc.key
            });
          }}
        />

        {/* Top Emergency Announcement Strip */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {isHi
              ? "ग्वालियर 24x7 आपातकालीन सहायता: गंभीर चोट, हार्ट अटैक या दुर्घटना होने पर तुरंत 108 डायल करें।"
              : "Gwalior 24x7 Emergency Advisory: For severe injuries, cardiac arrest, or accidents, dial 108 immediately."}
          </span>
          <a
            href="tel:108"
            className="ml-2 underline font-extrabold text-red-600 dark:text-red-400"
          >
            {isHi ? "कॉल 108" : "Call 108"}
          </a>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: INITIAL WELCOME SCREEN ("पहले पूछो क्या प्रॉब्लम है")             */}
        {/* ========================================================================= */}
        {!selectedProblem ? (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            
            {/* Welcoming Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>{isHi ? "ग्वालियर का पहला क्लिनिकल स्वास्थ्य सहायक" : "Gwalior's Smart Clinical Healthcare Assistant"}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-white font-display tracking-tight leading-tight">
                {isHi ? "नमस्ते! आज आपको क्या स्वास्थ्य समस्या है?" : "Hello! What health problem are you facing today?"}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-medium">
                {isHi
                  ? "नीचे अपनी समस्या चुनें या लिखकर बताएं — हम आपको 68 प्रमाणित बीमारियों की सटीक सलाह, निकटतम अस्पताल एवं 24 घंटे खुली दवा दुकानें दिखाएंगे।"
                  : "Select your health concern below or type symptoms — get verified guidance across 68 diseases, nearest hospitals, and 24x7 medical stores."}
              </p>

              {/* Location & GPS bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm text-xs font-bold text-stone-700 dark:text-stone-300">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? "चुना हुआ इलाका:" : "Selected Area:"} <strong className="text-stone-900 dark:text-white">{userLocation.name}</strong></span>
                </div>

                <button
                  onClick={handleDetectGPS}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isHi ? "मेरी लाइव GPS लोकेशन का उपयोग करें" : "Use My Live GPS"}</span>
                </button>
              </div>
            </div>

            {/* Quick Symptom Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto">
              <form onSubmit={handleSymptomSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder={
                    isHi
                      ? "अपनी समस्या लिखें (उदा. किडनी स्टोन, तेज बुखार, सीने में दर्द, मोतियाबिंद)..."
                      : "Type symptoms (e.g. kidney stone, high fever, chest pain, asthma)..."
                  }
                  className="w-full pl-5 pr-28 py-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 shadow-lg text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none transition"
                />

                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2.5 rounded-2xl transition ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300'
                    }`}
                    title={isHi ? "बोलकर बताएं" : "Speak Symptoms"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isHi ? "खोजें" : "Find"}</span>
                  </button>
                </div>
              </form>

              {/* Symptom Quick Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-stone-400">
                  {isHi ? "त्वरित चयन:" : "Quick Select:"}
                </span>
                {[
                  { label_hi: "गुर्दे की पथरी", label_en: "Kidney Stones", text: "गुर्दे की पथरी" },
                  { label_hi: "किडनी व पेशाब समस्या", label_en: "Kidney & Urinary", text: "किडनी की समस्या" },
                  { label_hi: "तेज बुखार व सिरदर्द", label_en: "High Fever & Chills", text: "तेज बुखार" },
                  { label_hi: "सीने में तेज दर्द", label_en: "Severe Chest Pain", text: "सीने में तेज दर्द" },
                  { label_hi: "सर्दी, जुकाम व खांसी", label_en: "Cold, Cough & Flu", text: "सर्दी जुकाम" },
                  { label_hi: "दमा व सांस फूलना", label_en: "Asthma & Breathing", text: "अस्थमा दमा" },
                  { label_hi: "मोतियाबिंद व आँख जांच", label_en: "Cataract & Vision", text: "मोतियाबिंद" }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const txt = isHi ? chip.text : chip.label_en;
                      setSymptomText(txt);
                      consultAI(txt);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-stone-300 font-semibold transition text-[11px]"
                  >
                    {isHi ? chip.label_hi : chip.label_en}
                  </button>
                ))}
              </div>

              {/* Direct Quick Shortcut to 24x7 Medical Stores */}
              <div className="mt-6 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleSelectProblem('medicals')}
                  className="group px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all flex items-center gap-3 text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                  <span>
                    {isHi
                      ? "💊 क्या आपको केवल दवाएं चाहिए? ग्वालियर के 24 घंटे खुले मेडिकल स्टोर देखें"
                      : "💊 Need Medicines? Browse 24x7 Verified Gwalior Medical Stores"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* The 8 Clean Problem & Service Cards */}
            <div className="mt-14 space-y-4">
              <h2 className="text-center font-black text-xl sm:text-2xl text-stone-900 dark:text-white font-display">
                {isHi ? "अपनी स्वास्थ्य समस्या अथवा सेवा का चयन करें:" : "Select Your Health Category or Service:"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {problemCategories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProblem(item.id)}
                      className={`group relative rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 ${item.accent} shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1`}
                    >
                      <div>
                        {/* Top Badge & Icon */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300">
                            {isHi ? item.badge_hi : item.badge_en}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white font-display group-hover:text-emerald-600 transition-colors">
                          {isHi ? item.title_hi : item.title_en}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 font-medium leading-relaxed">
                          {isHi ? item.desc_hi : item.desc_en}
                        </p>
                      </div>

                      {/* Bottom Action Prompt */}
                      <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>
                          {isHi ? "जाँचें व नजदीकी केंद्र देखें" : "Inspect & View Centers"}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </main>
        ) : (
          /* ========================================================================= */
          /* STEP 2: FOCUSED RESULTS VIEW (TWO SECTIONS: HOSPITALS & MEDICALS)         */
          /* ========================================================================= */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Top Problem Navigation & Change Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  {selectedProblem === 'eye' && <Eye className="w-6 h-6" />}
                  {selectedProblem === 'heart' && <Heart className="w-6 h-6" />}
                  {selectedProblem === 'kidney' && <Droplets className="w-6 h-6" />}
                  {selectedProblem === 'trauma' && <Activity className="w-6 h-6" />}
                  {selectedProblem === 'maternity' && <Baby className="w-6 h-6" />}
                  {selectedProblem === 'cancer' && <Crosshair className="w-6 h-6" />}
                  {selectedProblem === 'common_illness' && <Pill className="w-6 h-6" />}
                  {selectedProblem === 'medicals' && <ShoppingBag className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white font-display">
                      {isHi
                        ? (problemCategories.find(p => p.id === selectedProblem)?.title_hi || "स्वास्थ्य समस्या")
                        : (problemCategories.find(p => p.id === selectedProblem)?.title_en || "Health Concern")}
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                    📍 {userLocation.name} • {hospitals.length} {isHi ? "सत्यापित अस्पताल" : "Verified Hospitals"} • {medicals.length} {isHi ? "मेडिकल स्टोर" : "Pharmacies"}
                  </p>
                </div>
              </div>

              {/* Prominent Change Problem Button */}
              <button
                onClick={() => {
                  setSelectedProblem(null);
                  setAiGuidance(null);
                  setSymptomText("");
                }}
                className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-2 transition shadow-sm active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? "🔄 समस्या बदलें / नया पूछें" : "🔄 Change Problem / Ask New"}</span>
              </button>
            </div>

            {/* DR. SANJEEVANI AI CERTIFIED 68-DISEASE CLINICAL DIAGNOSIS CARD */}
            {aiGuidance && (
              <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl ${
                aiGuidance.is_emergency
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                      aiGuidance.is_emergency ? 'bg-red-600' : 'bg-emerald-600'
                    }`}>
                      {aiGuidance.is_emergency ? <ShieldAlert className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                    </div>

                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        aiGuidance.is_emergency
                          ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100'
                          : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                      }`}>
                        {aiGuidance.is_emergency
                          ? (isHi ? "🚨 तत्काल अस्पताल आपातकाल" : "🚨 IMMEDIATE HOSPITAL ESCALATION")
                          : (isHi ? "प्रमाणित स्वास्थ्य विश्लेषण एवं उपचार" : "CERTIFIED CLINICAL DIAGNOSIS & CARE")}
                      </span>

                      <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-display mt-1">
                        {aiGuidance.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Clinical Content: Symptoms, Treatment, Precautions, Warning */}
                <div className="mt-6 space-y-4">
                  
                  {/* Symptoms */}
                  {aiGuidance.symptoms && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm text-xs sm:text-sm">
                      <div className="text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                        {isHi ? "📋 प्रमुख लक्षण:" : "📋 Symptoms:"}
                      </div>
                      <p className="font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                        {aiGuidance.symptoms}
                      </p>
                    </div>
                  )}

                  {/* Treatment */}
                  {aiGuidance.treatment && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm text-xs sm:text-sm">
                      <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                        <Pill className="w-4 h-4" />
                        <span>{isHi ? "💊 उपचार एवं अनुशंसित दवा:" : "💊 Treatment & Medical Care:"}</span>
                      </div>
                      <p className="font-extrabold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        {aiGuidance.treatment}
                      </p>
                    </div>
                  )}

                  {/* Precautions */}
                  {aiGuidance.precautions && (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm">
                      <div className="text-[11px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{isHi ? "🛡️ सावधानियां एवं परहेज:" : "🛡️ Precautions:"}</span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                        {aiGuidance.precautions}
                      </p>
                    </div>
                  )}

                  {/* Warning */}
                  {aiGuidance.warning && (
                    <div className="p-4 rounded-2xl bg-red-100/70 dark:bg-red-950/60 border border-red-300 dark:border-red-900 text-xs sm:text-sm text-red-900 dark:text-red-200">
                      <div className="font-black uppercase tracking-wider text-[11px] text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isHi ? "⚠️ गंभीर चेतावनी:" : "⚠️ Clinical Warning:"}</span>
                      </div>
                      <p className="font-bold leading-relaxed">
                        {aiGuidance.warning}
                      </p>
                    </div>
                  )}

                  {/* 10 General Health Precautions Collapsible */}
                  {aiGuidance.general_precautions && (
                    <details className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs cursor-pointer group">
                      <summary className="font-extrabold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                        <span>{isHi ? "📌 10 आवश्यक सामान्य स्वास्थ्य सावधानियां" : "📌 10 Essential Health Precautions"}</span>
                        <span className="text-[10px] text-emerald-600 group-open:rotate-90 transition-transform">▶</span>
                      </summary>
                      <ul className="mt-3 space-y-1.5 pl-2 text-stone-600 dark:text-stone-400">
                        {aiGuidance.general_precautions.map((p, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <span className="font-bold text-emerald-600">{pIdx + 1}.</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* Medical Disclaimer */}
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 italic pt-1">
                    {aiGuidance.disclaimer}
                  </p>
                </div>
              </div>
            )}

            {/* REAL INTERACTIVE MAP OF GWALIOR (SHOWS HOSPITALS OR MEDICALS) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-stone-900 dark:text-white font-display flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>
                      {isHi ? "ग्वालियर लाइव स्वास्थ्य मैप (अस्पताल एवं मेडिकल स्टोर)" : "Gwalior Live Healthcare Map (Hospitals & Pharmacies)"}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isHi
                      ? "नीले बिंदु पर आप हैं • पिन पर क्लिक करके पूरे नाम, डॉक्टर, खाली बेड या मेडिकल स्टोर देखें"
                      : "Blue pulse is your location • Click any pin to inspect hospital or 24x7 medical store"}
                  </p>
                </div>

                <button
                  onClick={handleDetectGPS}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">{isHi ? "लाइव लोकेशन" : "Live GPS"}</span>
                </button>
              </div>

              <GwaliorMap
                userLocation={userLocation}
                facilities={hospitals}
                medicals={medicals}
                activeSection={activeSection}
                selectedFacilityId={selectedFacilityId}
                onSelectFacility={(item) => setSelectedFacilityId(item.id || item.facility_id)}
                lang={lang}
              />
            </div>

            {/* ========================================================================= */}
            {/* TWO SECTION SWITCH: HOSPITALS VS MEDICAL STORES                          */}
            {/* ========================================================================= */}
            <div className="space-y-6 pt-2">
              
              {/* Clean Segmented Tab Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-stone-200 dark:border-slate-800">
                <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveSection('hospitals')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                      activeSection === 'hospitals'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isHi ? "🏥 अस्पताल" : "🏥 Hospitals"}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
                      {hospitals.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('medicals')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                      activeSection === 'medicals'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Pill className="w-4 h-4" />
                    <span>{isHi ? "💊 24 घंटे मेडिकल स्टोर" : "💊 24x7 Medical Stores"}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
                      {medicals.length}
                    </span>
                  </button>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ⚡ {isHi ? "दूरी के अनुसार क्रमबद्ध" : "Sorted by Proximity"}
                </span>
              </div>

              {/* SECTION A: HOSPITALS LIST */}
              {activeSection === 'hospitals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hospitals.map((h) => {
                    const isSelected = selectedFacilityId === (h.id || h.facility_id);
                    const hName = isHi ? (h.name_hi || h.name) : (h.name_en || h.name);
                    const hType = isHi ? (h.type_hi || h.facility_type) : (h.type_en || h.facility_type);
                    const hAddress = isHi ? (h.address_hi || h.address) : (h.address_en || h.address);
                    const hER = isHi ? (h.emergency_room_hi || h.emergency_room) : (h.emergency_room_en || h.emergency_room);
                    const hDoc = isHi ? (h.doctor_available_hi || h.doctor_available) : (h.doctor_available_en || h.doctor_available);
                    const hBeds = isHi ? (h.beds_detail_hi || h.beds_detail) : (h.beds_detail_en || h.beds_detail);
                    const hSpecs = isHi ? (h.specialties_hi || h.specialties) : (h.specialties_en || h.specialties);

                    const cleanHospName = (h.name_en || h.name || '').replace(/\s*\([^)]*\)/g, '').trim();
                    const hospDestQuery = cleanHospName
                      ? `${cleanHospName}, ${h.address_en || h.address || 'Gwalior, Madhya Pradesh'}`
                      : `${h.latitude},${h.longitude}`;
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospDestQuery)}`;
                    const shareMsg = `*आरोग्य ग्वालियर (SANJEEVANI)*\n🏥 ${hName}\n📍 ${hAddress}\n🚗 ${h.distance_km} km (~${h.estimated_eta_mins} मिनट)\n🚨 ${hER}\n👨‍⚕️ ${hDoc}\n🛏️ ${hBeds}\n📞 फोन: ${h.phone}`;
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;

                    return (
                      <div
                        key={h.id || h.facility_id}
                        onClick={() => setSelectedFacilityId(h.id || h.facility_id)}
                        className={`rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 p-6 shadow-md hover:shadow-xl flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'border-stone-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Type & Distance Badges */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {hType}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{h.distance_km} km</span>
                              <span className="text-stone-400 font-normal">• ~{h.estimated_eta_mins} {isHi ? "मिनट" : "mins"}</span>
                            </div>
                          </div>

                          {/* Hospital Name */}
                          <h4 className="font-black text-lg sm:text-xl text-stone-900 dark:text-white font-display leading-snug break-words">
                            {hName}
                          </h4>

                          {/* Address */}
                          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                            <span>{hAddress}</span>
                          </p>

                          {/* 1. Emergency Room Status */}
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1 animate-pulse" />
                            <div>
                              <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                                {isHi ? "आपातकालीन कक्ष स्थिति:" : "Emergency Room (ER) Status:"}
                              </div>
                              <div className="mt-0.5">{hER}</div>
                            </div>
                          </div>

                          {/* 2. Doctor Available on Duty */}
                          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-800 dark:text-stone-200">
                            <div className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400">
                              {isHi ? "ड्यूटी पर उपलब्ध डॉक्टर:" : "Doctor Available on Duty:"}
                            </div>
                            <div className="mt-0.5 font-semibold">{hDoc}</div>
                          </div>

                          {/* 3. Bed Availability */}
                          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                            <div className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                              {isHi ? "खाली बेड स्थिति:" : "Vacant Beds Detail:"}
                            </div>
                            <div className="mt-0.5 font-bold">{hBeds}</div>
                          </div>

                          {/* Ayushman Acceptance Tag */}
                          {h.ayushman_accepted && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 text-[11px] font-extrabold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span>{isHi ? "आयुष्मान भारत मान्य (100% निःशुल्क उपचार)" : "Ayushman PM-JAY Accepted (100% Free)"}</span>
                            </div>
                          )}

                          {/* Specialties Chips */}
                          {hSpecs && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {hSpecs.split(';').slice(0, 3).map((spec, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300"
                                >
                                  {spec.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Call, Directions, WhatsApp */}
                        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {h.phone && (
                              <a
                                href={`tel:${h.phone}`}
                                className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{isHi ? "कॉल करें" : "Call Now"}</span>
                              </a>
                            )}

                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition active:scale-95"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{isHi ? "रास्ता देखें" : "Directions"}</span>
                            </a>

                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-2xl bg-green-50 hover:bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800 transition"
                              title={isHi ? "व्हाट्सएप पर शेयर करें" : "Share on WhatsApp"}
                            >
                              <Share2 className="w-4 h-4 text-green-600" />
                            </a>
                          </div>

                          {/* Direct Button to jump to nearby Medical Stores */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSection('medicals');
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 hover:text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isHi ? "इस अस्पताल के पास 24 घंटे मेडिकल स्टोर देखें" : "View Nearby 24x7 Medical Stores"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION B: NEARBY MEDICAL STORES & PHARMACIES */}
              {activeSection === 'medicals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medicals.map((m) => {
                    const isSelected = selectedFacilityId === m.id;
                    const mName = isHi ? (m.name_hi || m.name) : (m.name_en || m.name);
                    const mType = isHi ? (m.type_hi || m.type) : (m.type_en || m.type);
                    const mAddress = isHi ? (m.address_hi || m.address) : (m.address_en || m.address);
                    const mHours = isHi ? (m.opening_hours_hi || m.opening_hours) : (m.opening_hours_en || m.opening_hours);
                    const mServices = isHi ? (m.services_hi || m.services) : (m.services_en || m.services);
                    const mDiscount = isHi ? (m.discount_info_hi || m.discount_info) : (m.discount_info_en || m.discount_info);

                    const cleanMedName = (m.name_en || m.name || '').replace(/\s*\([^)]*\)/g, '').trim();
                    const medDestQuery = cleanMedName
                      ? `${cleanMedName}, ${m.address_en || m.address || 'Gwalior, Madhya Pradesh'}`
                      : `${m.latitude},${m.longitude}`;
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(medDestQuery)}`;
                    const whatsappOrderUrl = `https://api.whatsapp.com/send?phone=${m.whatsapp || '+919425112233'}&text=${encodeURIComponent(
                      `नमस्ते! मुझे आरोग्य ग्वालियर से दवाइयां मंगवानी हैं। मेरा पता: ${userLocation.name}`
                    )}`;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedFacilityId(m.id)}
                        className={`rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 p-6 shadow-md hover:shadow-xl flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'border-stone-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Store Type & Distance */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {mType}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{m.distance_km} km</span>
                              <span className="text-stone-400 font-normal">• ~{m.estimated_eta_mins} {isHi ? "मिनट" : "mins"}</span>
                            </div>
                          </div>

                          {/* Medical Store Name */}
                          <h4 className="font-black text-lg sm:text-xl text-stone-900 dark:text-white font-display leading-snug">
                            {mName}
                          </h4>

                          {/* Address */}
                          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                            <span>{mAddress}</span>
                          </p>

                          {/* 24x7 Opening Hours Badge */}
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                            <span>{mHours}</span>
                          </div>

                          {/* Discount / Generic Jan Aushadhi Info */}
                          {mDiscount && (
                            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                              <BadgePercent className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="font-semibold">{mDiscount}</span>
                            </div>
                          )}

                          {/* Services Available */}
                          {mServices && (
                            <div className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-slate-800 p-3 rounded-2xl border border-stone-200 dark:border-slate-700">
                              <div className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 mb-1">
                                {isHi ? "उपलब्ध सेवाएं व दवाएं:" : "Available Services & Meds:"}
                              </div>
                              <p className="font-medium text-stone-700 dark:text-stone-300">
                                {mServices}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Direct Call, WhatsApp Order, Google Maps Directions */}
                        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          {m.phone && (
                            <a
                              href={`tel:${m.phone}`}
                              className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{isHi ? "दुकान पर कॉल करें" : "Call Store"}</span>
                            </a>
                          )}

                          <a
                            href={whatsappOrderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20 transition active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{isHi ? "व्हाट्सएप ऑर्डर" : "WhatsApp Order"}</span>
                          </a>

                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 transition"
                            title={isHi ? "दुकान का रास्ता देखें" : "Directions"}
                          >
                            <Navigation className="w-4 h-4 text-blue-500" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </main>
        )}
      </div>

      {/* Clean Minimal Footer */}
      <footer className="mt-16 border-t border-stone-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-extrabold text-stone-800 dark:text-stone-200 font-display">
              {isHi ? "आरोग्य ग्वालियर (Arogya Gwalior)" : "Arogya Gwalior"}
            </span>
            <span>• {isHi ? "सत्यापित अस्पताल, 24x7 मेडिकल स्टोर्स एवं स्वास्थ्य परामर्श" : "Verified Hospitals, 24x7 Medical Stores & Health Guidance"}</span>
          </div>

          <div className="text-[11px] text-stone-400">
            {isHi
              ? "ग्वालियर, मध्य प्रदेश • 68 प्रमाणित रोग ज्ञानकोश • आई.पी.एच.एस. एवं एन.ए.बी.एच. मानक"
              : "Gwalior, Madhya Pradesh • 68 Clinical Formularies • IPHS & NABH Aligned"}
          </div>
        </div>
      </footer>
    </div>
  );
}
