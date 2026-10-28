import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import {
  AlertOctagon,
  AlertTriangle,
  FileWarning,
  XCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldX,
  FileText,
  Quote
} from 'lucide-react';

export default function RejectedNearbyPanel({
  rejectedFacilities,
  recommendedFacility,
  onInspectTrace
}) {
  const { t } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!rejectedFacilities || rejectedFacilities.length === 0) return null;

  const primaryRejected = rejectedFacilities[0];
  const isCloser =
    recommendedFacility &&
    primaryRejected.distance_km < recommendedFacility.distance_km;

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-amber-500/10 border-2 border-red-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Warning Watermark */}
      <div className="absolute -right-8 -bottom-8 text-red-500/10 pointer-events-none">
        <ShieldX className="w-56 h-56" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-900/30">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-red-900 dark:text-red-300 font-display flex items-center gap-2">
              <span>{t('rejectedTitle')}</span>
              {isCloser && (
                <span className="text-[10px] font-mono uppercase bg-red-600 text-white px-2 py-0.5 rounded font-extrabold tracking-wide">
                  Closer by {(recommendedFacility.distance_km - primaryRejected.distance_km).toFixed(1)} km!
                </span>
              )}
            </h3>
            <p className="text-xs text-red-700/80 dark:text-red-400 font-medium">
              {t('rejectedSubtitle')}
            </p>
          </div>
        </div>

        {/* Counter */}
        <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-300/40">
          {rejectedFacilities.length} Disqualified Nearby
        </span>
      </div>

      {/* Active Rejected Facility Highlight */}
      <div className="mt-5 space-y-4">
        {rejectedFacilities.slice(0, 3).map((facility, idx) => {
          const isSelected = expandedIndex === idx;
          return (
            <div
              key={facility.facility_id}
              className={`rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white/90 dark:bg-slate-900/90 border-red-400/50 shadow-md p-4'
                  : 'bg-white/50 dark:bg-slate-900/50 border-red-200/40 p-3 hover:bg-white/80 dark:hover:bg-slate-900/80 cursor-pointer'
              }`}
              onClick={() => !isSelected && setExpandedIndex(idx)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-stone-900 dark:text-white font-display">
                      {facility.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-semibold">
                      Trust: {facility.trust_score}/100 ({facility.profile || 'Hollow'})
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span>
                      {facility.address || `${facility.district}, ${facility.state}`} •{' '}
                      <strong className="text-red-600 dark:text-red-400 font-mono">
                        {facility.distance_km} km away
                      </strong>
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(isSelected ? -1 : idx);
                  }}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                >
                  {isSelected ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-red-100 dark:border-slate-800 space-y-3">
                  {/* Primary Rejection Reason */}
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/50 text-xs text-red-900 dark:text-red-200">
                    <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400 mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>FATAL CLINICAL SAFETY DISQUALIFICATION</span>
                    </div>
                    <p className="font-semibold">
                      {facility.primary_rejection_reason ||
                        'Failed mandatory medical safety standards for acute surgical intervention.'}
                    </p>
                  </div>

                  {/* Red Flags List */}
                  {facility.red_flags && facility.red_flags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Contradictions Detected vs Reality:
                      </span>
                      {facility.red_flags.map((rf, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-start gap-2 text-xs p-2 rounded bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-stone-800 dark:text-stone-200">
                              {rf.issue}
                            </div>
                            {rf.evidence && (
                              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5 italic">
                                Evidence quote: "{rf.evidence}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw Survey Snippet Citation */}
                  <div className="p-3 rounded-lg bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between mb-1.5 text-stone-500 dark:text-stone-400 text-[11px]">
                      <span className="font-bold flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        Exact Survey Evidence Citation:
                      </span>
                      <span className="font-mono text-[10px]">
                        ID: {facility.facility_id} • Year: {facility.survey_year || '2022'}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-stone-800 dark:text-stone-300 bg-white dark:bg-slate-900 p-2 rounded border border-stone-200 dark:border-slate-700 whitespace-pre-wrap leading-relaxed">
                      {facility.rejection_evidence || facility.unstructured_notes}
                    </p>
                  </div>

                  {/* Traceability Trigger */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onInspectTrace(facility.facility_id)}
                      className="text-xs text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Raw File Record ({facility.facility_id})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Why Naive Search Fails Callout */}
      <div className="mt-5 pt-4 border-t border-red-500/20 text-xs text-red-800 dark:text-red-300/90 leading-relaxed bg-red-500/5 -mx-5 -mb-5 p-5">
        <strong className="font-bold block text-red-900 dark:text-red-200 mb-1">
          💡 The "Sanjeevani Difference" - Why Naive Maps Fail:
        </strong>
        Standard navigation apps rank purely by proximity (15 km vs 20 km) or listed keywords ("24/7 Emergency" on the gate). Routing Ananya to {primaryRejected.name} would have stranded her at a locked ward without an anesthesiologist. Sanjeevani's Extractor and Validator cross-checked the hidden clinical reality to send her to the genuinely equipped facility.
      </div>
    </div>
  );
}
