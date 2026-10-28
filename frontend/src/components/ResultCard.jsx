import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Share2,
  ChevronDown,
  ChevronUp,
  FileText,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ResultCard({
  facility,
  timeline,
  onInspectTrace,
  isTopChoice = false
}) {
  const { t } = useTheme();
  const [expanded, setExpanded] = useState(isTopChoice);

  if (!facility) return null;

  const trustScore = facility.trust_score || 70;
  const isDemo = facility.is_demo === 1 || facility.notes_source === 'SYNTHETIC_DEMO';
  const isOsm = facility.dataset === 'gwalior_osm';

  // SVG Circular progress ring calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  const ringColor =
    trustScore >= 80 ? '#10b981' : trustScore >= 50 ? '#f59e0b' : '#ef4444';

  const shareText = `*SANJEEVANI RECOMMENDATION*\n🏥 ${facility.name}\n📍 ${facility.address || facility.district}\n🚗 ${facility.distance_km} km away (ETA ~${facility.estimated_eta_mins} mins)\n🛡️ Trust Score: ${trustScore}%\n📞 Contact: ${facility.phone}\nVerified for acute surgical care by Sanjeevani Agent Ensemble.`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const googleMapsUrl = `https://maps.google.com/?q=${facility.latitude},${facility.longitude}`;

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border ${
        isTopChoice
          ? 'border-emerald-500/60 shadow-xl shadow-emerald-900/10 ring-2 ring-emerald-500/20'
          : 'border-stone-200 dark:border-slate-700 shadow-md'
      }`}
    >
      {/* Top Banner if Best Choice */}
      {isTopChoice && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{t('recommendedTitle')}</span>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-mono bg-black/20 px-2 py-0.5 rounded">
            Rank #1 Match
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Main Hospital Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300">
                {facility.facility_type}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                {facility.ownership}
              </span>

              {/* Provenance Dataset Badges */}
              {isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Info className="w-2.5 h-2.5" />
                  {t('demoBadge')}
                </span>
              )}
              {isOsm && !isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {t('osmBadge')}
                </span>
              )}
              {!isOsm && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-stone-400">
                  {t('syntheticBadge')}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white font-display leading-tight">
              {facility.name}
            </h3>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>{facility.address || `${facility.district}, ${facility.state}`}</span>
            </p>

            {/* Quick Metrics: Distance, ETA, Beds */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{facility.distance_km} km</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>~{facility.estimated_eta_mins} mins ETA</span>
              </div>
              {facility.extracted_capabilities?.beds_available !== null && (
                <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  <Bed className="w-3.5 h-3.5" />
                  <span>
                    {facility.extracted_capabilities.beds_available > 0
                      ? `${facility.extracted_capabilities.beds_available} beds free`
                      : 'Beds occupied'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Animated SVG Trust Ring */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 sm:self-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-stone-100 dark:text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={ringColor}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-stone-900 dark:text-white font-mono leading-none">
                  {trustScore}
                </span>
                <span className="text-[9px] uppercase font-bold text-stone-400 tracking-tighter">
                  Trust
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-extrabold mt-1 px-1.5 py-0.5 rounded ${
                facility.profile === 'solid'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950'
                  : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950'
              }`}
            >
              {facility.profile || 'Verified'}
            </span>
          </div>
        </div>

        {/* Verified Green Flags Chips */}
        {facility.green_flags && facility.green_flags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {facility.green_flags.map((g, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{g.description || g.tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons: Call, Navigate, WhatsApp, Trace */}
        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('callBtn')}: {facility.phone}</span>
              </a>
            )}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('navigateBtn')}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-300/40 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-green-600" />
              <span>{t('shareWhatsApp')}</span>
            </a>

            <button
              onClick={() => onInspectTrace(facility.facility_id)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300 text-xs font-medium flex items-center gap-1 transition"
              title="Inspect raw survey note"
            >
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>{t('viewTrace')}</span>
            </button>
          </div>

          {/* Toggle Reasoning Timeline */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 ml-auto"
          >
            <span>{t('whyThisOne')}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Agent Reasoning Timeline */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-dashed border-stone-200 dark:border-slate-700/80 bg-stone-50/50 dark:bg-slate-900/50 -mx-5 -mb-5 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Multi-Agent Orchestration Audit Trail
            </h4>

            <div className="space-y-3 relative pl-4 border-l-2 border-emerald-500/40">
              {timeline && timeline.map((step, sIdx) => (
                <div key={sIdx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      {step.agent}
                    </span>
                    <span className="font-mono text-[10px]">{step.timestamp_offset}</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
                <span className="font-bold text-[11px] text-teal-800 dark:text-teal-300">
                  Clinical Standards Clearance
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  {facility.clinical_clearance}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
