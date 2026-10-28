import React, { useState, useEffect } from 'react';
import { useTheme } from '../themeContext';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Database, Calendar } from 'lucide-react';

export default function TraceDrawer({ facilityId, onClose }) {
  const { t } = useTheme();
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facilityId) return;
    setLoading(true);
    fetch(`/api/trace/${facilityId}`)
      .then((res) => res.json())
      .then((data) => setTraceData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [facilityId]);

  if (!facilityId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-stone-200 dark:border-slate-800">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-white font-display">
                Traceability & Raw Evidence Audit
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-400">Loading verified source audit trail...</p>
            </div>
          ) : traceData ? (
            <div className="mt-6 space-y-6">
              {/* Facility Meta */}
              <div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {traceData.facility_id}
                </span>
                <h4 className="text-xl font-black text-stone-900 dark:text-white font-display">
                  {traceData.facility_name}
                </h4>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 flex items-center gap-1">
                    <Database className="w-3 h-3 text-stone-400" />
                    Dataset: {traceData.dataset}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    Survey Year: {traceData.survey_year || '2022'}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Confidence: {traceData.confidence}
                  </span>
                </div>
              </div>

              {/* Raw Unstructured Note Box */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                  Raw Ground Survey Note (Original Text):
                </span>
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs font-mono text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {traceData.raw_unstructured_notes || "No notes record attached."}
                </div>
              </div>

              {/* Extracted Exact Evidence Snippet */}
              {traceData.evidence_quote && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    Key Extracted Clinical Evidence:
                  </span>
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 font-mono italic">
                    "{traceData.evidence_quote}"
                  </div>
                </div>
              )}

              {/* Flags Breakdown */}
              {traceData.green_flags && traceData.green_flags.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-2">
                    Verified Capabilities (Green Flags):
                  </span>
                  <div className="space-y-1.5">
                    {traceData.green_flags.map((g, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{g.description || g.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {traceData.red_flags && traceData.red_flags.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">
                    Contradictions & Red Flags:
                  </span>
                  <div className="space-y-1.5">
                    {traceData.red_flags.map((r, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 text-xs text-red-900 dark:text-red-200"
                      >
                        <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{r.tag}</span>
                        </div>
                        <p>{r.issue}</p>
                        {r.evidence && (
                          <p className="font-mono text-[11px] text-stone-500 mt-1 italic">
                            Evidence: "{r.evidence}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center text-xs text-stone-400">
          <span>IPHS / NABH Audit Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-white font-semibold transition"
          >
            Close Audit Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
