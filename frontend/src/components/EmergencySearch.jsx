import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import { Search, Mic, MicOff, MapPin, Navigation, AlertTriangle, Volume2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function EmergencySearch({
  onSearch,
  loading,
  location,
  setLocation,
  query,
  setQuery,
  topRecommendation
}) {
  const { t, lang } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const presets = [
    {
      label: "Ananya Scenario: Severe Abdominal Pain (Appendectomy)",
      query: "Severe abdominal pain, need emergency appendectomy, nearest option, part-time doctors are okay.",
      lat: 25.90,
      lon: 85.78,
      locationName: "Samastipur, Bihar"
    },
    {
      label: "Gwalior Scenario: Night Emergency Surgery (Anaesthetist)",
      query: "Gwalior me raat ko emergency surgery ke liye sabse paas ka hospital jahan anaesthetist ho.",
      lat: 26.22,
      lon: 78.18,
      locationName: "City Center, Gwalior (MP)"
    },
    {
      label: "Critical ICU & Ventilator Need",
      query: "Patient in respiratory failure, need ICU with working ventilator and oxygen central line.",
      lat: 25.59,
      lon: 85.14,
      locationName: "Patna, Bihar"
    },
    {
      label: "Emergency Hemodialysis",
      query: "Patient with acute kidney injury needing emergency hemodialysis station.",
      lat: 26.12,
      lon: 85.39,
      locationName: "Muzaffarpur, Bihar"
    },
    {
      label: "Accident / Ortho Trauma",
      query: "Highway road accident fracture, need 24x7 trauma care with orthopaedic surgeon.",
      lat: 26.85,
      lon: 80.95,
      locationName: "Lucknow, UP"
    }
  ];

  const handlePresetClick = (p) => {
    setQuery(p.query);
    setLocation({ lat: p.lat, lon: p.lon, name: p.locationName });
    onSearch(p.query, p.lat, p.lon);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Web Speech API is not supported in this browser. Please type your query.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'bn' ? 'bn-IN' : 'en-IN');
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setQuery(speechText);
      setIsListening(false);
      onSearch(speechText, location.lat, location.lon);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSpeakRecommendation = () => {
    if (!topRecommendation || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    let text = "";
    if (lang === 'hi' || lang === 'bho' || lang === 'mai') {
      text = `आपके पास सबसे सुरक्षित जाँचा हुआ अस्पताल ${topRecommendation.name} है, जो ${topRecommendation.distance_km} किलोमीटर दूर है। इसका भरोसा स्कोर ${topRecommendation.trust_score} प्रतिशत है।`;
    } else {
      text = `The safest verified hospital is ${topRecommendation.name}, located ${topRecommendation.distance_km} kilometers away, with a trust score of ${topRecommendation.trust_score} percent.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocation({ lat, lon, name: "GPS Detected Location" });
          onSearch(query, lat, lon);
        },
        () => {
          // Fallback to Ananya Samastipur
          setLocation({ lat: 25.90, lon: 85.78, name: "Samastipur, Bihar (Default)" });
        }
      );
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Giant Emergency Button Hero */}
      <div className="text-center mb-6">
        <button
          onClick={() => {
            const p = presets[0];
            handlePresetClick(p);
          }}
          className="relative inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group overflow-hidden border border-red-400/40"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <AlertTriangle className="w-6 h-6 animate-bounce text-amber-200" />
          <span className="tracking-wide font-display">{t('emergencyBtn')}</span>
          <span className="hidden sm:inline-block text-xs bg-black/20 px-2 py-1 rounded-full font-mono">
            &lt; 10s
          </span>
        </button>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">
          {t('emergencySubtitle')}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-stone-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Query Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(query, location.lat, location.lon)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-24 py-3 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
            
            {/* Mic Button */}
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-slate-800'
                }`}
                title={t('speakBtn')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              {/* Audio Listen Output Button */}
              {topRecommendation && (
                <button
                  type="button"
                  onClick={handleSpeakRecommendation}
                  className={`p-2 rounded-lg transition ${
                    isSpeaking
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                  title="Speak Top Recommendation"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              )}
            </div>
          </div>

          {/* Location Badge / Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs">
              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[140px]">
                  {location.name || `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`}
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
                </div>
              </div>
              <button
                onClick={handleLocateMe}
                className="p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-500"
                title="Detect GPS"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => onSearch(query, location.lat, location.lon)}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm shadow hover:from-emerald-700 hover:to-teal-800 transition flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t('searchBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span>{t('listening')}</span>
          </div>
        )}

        {/* Quick Symptom Presets Chips */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
            Clinical Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(p)}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
