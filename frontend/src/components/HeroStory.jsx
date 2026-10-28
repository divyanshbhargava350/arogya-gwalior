import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HeroStory({ onLaunchBihar, onLaunchGwalior }) {
  const { t } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "intro",
      badge: "The National Crisis",
      title: "The Lethal Illusion of Healthcare Proximity",
      subtitle: "Why India's emergency patients die outside locked hospital gates.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            In modern India, searching for an emergency hospital on commercial navigation apps ranks purely by <strong>geographical distance</strong> or <strong>signboard keywords</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-900 dark:text-red-200">
              <div className="text-xl font-black font-mono">1,719</div>
              <div className="text-xs font-bold mt-0.5">Fake / Broken ICUs</div>
              <p className="text-[11px] text-stone-500 mt-1">Concentrator unplugged, cylinder empty, ventilator out of order.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200">
              <div className="text-xl font-black font-mono">4,133</div>
              <div className="text-xs font-bold mt-0.5">Locked 24/7 Emergencies</div>
              <p className="text-[11px] text-stone-500 mt-1">"24/7 EMERGENCY" painted on the gate, but locked at 8pm with only a compounder.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-900 dark:text-rose-200">
              <div className="text-xl font-black font-mono">~1,900</div>
              <div className="text-xs font-bold mt-0.5">Surgeries without Anaesthesia</div>
              <p className="text-[11px] text-stone-500 mt-1">Advanced surgery advertised, but zero resident anaesthesiologist posted.</p>
            </div>
          </div>
          <p>
            When acute emergencies strike—such as ruptured appendicitis, trauma, or respiratory distress—sending a patient to the <em>nearest</em> facility that lacks functioning equipment is often fatal.
          </p>
        </div>
      )
    },
    {
      id: "bihar",
      badge: "Hero Case 1",
      title: "Ananya in Samastipur: The 15 km vs 20 km Decision",
      subtitle: "How Sanjeevani saved a life by rejecting the closer hospital.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-200 font-medium text-xs">
            <strong>Persona:</strong> Ananya, 34, semi-rural Bihar (GPS 25.90°N, 85.78°E), 3G basic phone, Rs 500 cash. Her father has acute severe abdominal pain requiring emergency appendectomy. She needs ONE trusted answer in under 10 seconds.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {/* The Trap */}
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-400/60">
              <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                ❌ Naive Search Pick (The Fatal Trap)
              </div>
              <h4 className="font-extrabold text-base text-stone-900 dark:text-white mt-1">
                Shri Ram Janki Hospital (F09999)
              </h4>
              <p className="text-xs text-stone-500">Distance: 15.0 km (Closer!)</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-red-900 dark:text-red-200">
                <li>Advertises "24/7 EMERGENCY & ADVANCED SURGERY"</li>
                <li><strong>Inspection Reality:</strong> Oxygen concentrator unplugged, no doctor on duty</li>
                <li>Ward locked at night; visiting docter only; NO surgeon or anaesthetist</li>
                <li><strong>Result:</strong> Disqualified by Sanjeevani Validator</li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400/60">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                ✅ Sanjeevani Certified Match
              </div>
              <h4 className="font-extrabold text-base text-stone-900 dark:text-white mt-1">
                Maa Sharda Nursing Home (F10000)
              </h4>
              <p className="text-xs text-stone-500">Distance: 20.0 km (Opposite direction)</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                <li>Resident MBBS doctor stays on campus 24x7</li>
                <li>General surgeon (MS) on contract + dedicated anaesthetist posted</li>
                <li>Functional OT doing regular appendectomies, 2 beds vacant</li>
                <li>Ayushman Bharat card accepted (Crucial for Ananya's Rs 500 budget!)</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onLaunchBihar}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow hover:from-emerald-700 hover:to-teal-800 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Launch Live Ananya Scenario in Triage Engine</span>
          </button>
        </div>
      )
    },
    {
      id: "gwalior",
      badge: "Hero Case 2",
      title: "Gwalior Real OpenStreetMap: Night Emergency Surgery",
      subtitle: "Navigating real city hospitals while catching simulated staffing traps.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            In Gwalior, Madhya Pradesh (center 26.22°N, 78.18°E), real healthcare facilities from OpenStreetMap are audited against an inspection notes layer clearly tagged <code>SYNTHETIC_DEMO</code> to evaluate safety without misrepresenting real facilities.
          </p>

          <div className="p-4 rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-900 dark:text-white">Query (Hindi/Hinglish):</span>
              <span className="font-mono text-cyan-600">lat: 26.22, lon: 78.18</span>
            </div>
            <p className="font-mono text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-slate-800 p-2.5 rounded border border-stone-200 dark:border-slate-700">
              "Gwalior me raat ko emergency surgery ke liye sabse paas ka hospital jahan anaesthetist ho."
            </p>
          </div>

          <p>
            The system ranks candidate facilities, catches traps claiming 24/7 surgery with locked gates, and directs the patient to verified night surgical facilities (e.g. Apollo Spectra Hospital / JAH GRMC) with working central oxygen and posted anesthesiologists.
          </p>

          <button
            onClick={onLaunchGwalior}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-xs shadow hover:from-cyan-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Launch Live Gwalior Scenario in Triage Engine</span>
          </button>
        </div>
      )
    },
    {
      id: "architecture",
      badge: "The Technology",
      title: "The Multi-Agent Orchestration Architecture",
      subtitle: "Four specialized AI agents operating in continuous feedback.",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
              <span className="text-xs font-extrabold text-amber-600 uppercase">Agent 1: EXTRACTOR</span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Converts messy clinical text (Hinglish, typos, mixed separators) into structured JSON with exact evidence quotes, distinguishing advertised claims from reality.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
              <span className="text-xs font-extrabold text-blue-600 uppercase">Agent 2: REASONER</span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Translates multi-lingual natural language (English, Hindi, Bhojpuri, Maithili) into clinical safety criteria, geocodes GPS coordinates, and ranks by trust and transit distance.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
              <span className="text-xs font-extrabold text-emerald-600 uppercase">TRUST SCORER</span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                0-100 explainable score that detects contradictions (unplugged concentrators, no anaesthesiologist, locked wards) and applies penalties for stale data.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
              <span className="text-xs font-extrabold text-teal-600 uppercase">Agent 3: VALIDATOR</span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Cross-checks candidate facilities against IPHS & NABH surgical standards. On failure, triggers an automated self-correction loop to re-rank the next best verified hospital.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-slate-700 shadow-2xl">
      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
            {slide.badge}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="mt-6">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-display tracking-tight">
          {slide.title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-medium">
          {slide.subtitle}
        </p>

        <div className="mt-6">{slide.content}</div>
      </div>

      {/* Step Indicators */}
      <div className="mt-8 pt-4 border-t border-stone-100 dark:border-slate-700 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === i
                ? 'w-8 bg-emerald-600'
                : 'w-2 bg-stone-200 dark:bg-slate-700 hover:bg-stone-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
