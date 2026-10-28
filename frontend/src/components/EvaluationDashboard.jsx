import React, { useState, useEffect } from 'react';
import { useTheme } from '../themeContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  BarChart3,
  RefreshCw,
  FileCheck,
  Zap,
  Quote
} from 'lucide-react';

export default function EvaluationDashboard() {
  const { t } = useTheme();
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvaluation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate?sample_size=1000');
      const data = await res.json();
      setEvalData(data);
    } catch (e) {
      console.error("Failed to load evaluation", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-stone-200 dark:border-slate-700 shadow-xl">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-emerald-600 animate-spin" />
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          Benchmarking Agents against Hidden Ground Truth...
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Evaluating 1,000 ground truth facilities across 12 clinical fields and contradiction detection matrices.
        </p>
      </div>
    );
  }

  if (!evalData) return null;

  const h1 = evalData.hero_scenario_1;
  const h2 = evalData.hero_scenario_2;
  const cm = evalData.contradiction_metrics;
  const fields = evalData.field_metrics || [];

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-amber-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-300" />
              <h2 className="text-2xl font-black font-display tracking-tight">
                Ground-Truth Clinical Evaluation Engine
              </h2>
            </div>
            <p className="text-xs text-stone-200 mt-1.5 max-w-2xl leading-relaxed">
              Decoupled validation suite auditing the multi-agent system against hidden ground truth data. Evaluates Extractor F1 accuracy, Contradiction Detection precision/recall, and end-to-end Hero Test scenarios.
            </p>
          </div>

          <button
            onClick={fetchEvaluation}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 backdrop-blur transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Benchmark</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs font-mono text-amber-200">
          <span>Facilities Evaluated: <strong>{evalData.evaluated_facilities_count}</strong></span>
          <span>Contradiction F1: <strong>{cm?.f1_score}%</strong></span>
          <span>Contradiction Precision: <strong>{cm?.precision}%</strong></span>
        </div>
      </div>

      {/* Hero Test Scenarios Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hero Scenario 1 (Bihar) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-base text-stone-900 dark:text-white font-display">
                Hero Scenario 1 (Bihar)
              </h3>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {h1?.status}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {/* Disqualified Facility F09999 */}
            <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40">
              <div className="flex items-center justify-between text-red-800 dark:text-red-300 font-bold mb-1">
                <span>❌ Rejected Closer Facility: F09999</span>
                <span className="font-mono text-[10px]">15.0 km</span>
              </div>
              <div className="font-extrabold text-stone-900 dark:text-white">
                {h1?.f09999_details?.name || "Shri Ram Janki Hospital"}
              </div>
              <p className="text-stone-600 dark:text-stone-300 mt-1">
                <strong>Disqualification Reason:</strong> {h1?.f09999_details?.primary_rejection_reason || "No surgeon or anaesthetist; concentrator unplugged"}
              </p>
              <div className="mt-1 text-[11px] font-mono italic text-red-700 dark:text-red-400 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded">
                "{h1?.f09999_details?.rejection_evidence || "...oxygen concentrator unplugged, ward locked..."}"
              </div>
            </div>

            {/* Recommended Top Choice F10000 */}
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                <span>✅ Recommended Top Match: F10000</span>
                <span className="font-mono text-[10px]">20.0 km</span>
              </div>
              <div className="font-extrabold text-stone-900 dark:text-white">
                {h1?.f10000_details?.name || "Maa Sharda Nursing Home"}
              </div>
              <p className="text-stone-600 dark:text-stone-300 mt-1">
                <strong>Certified Capabilities:</strong> Resident MBBS on campus, visiting contract surgeon, anaesthetist posted, 2 beds free, working oxygen.
              </p>
              <div className="mt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                Trust Score: {h1?.f10000_details?.trust_score}/100 • Profile: Solid
              </div>
            </div>
          </div>
        </div>

        {/* Hero Scenario 2 (Gwalior) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              <h3 className="font-extrabold text-base text-stone-900 dark:text-white font-display">
                Hero Scenario 2 (Gwalior Real Map)
              </h3>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {h2?.status}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {/* Disqualified Gwalior Trap */}
            <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40">
              <div className="flex items-center justify-between text-red-800 dark:text-red-300 font-bold mb-1">
                <span>❌ Rejected Hollow Candidate</span>
                <span className="font-mono text-[10px]">{h2?.rejected_trap?.distance_km} km</span>
              </div>
              <div className="font-extrabold text-stone-900 dark:text-white">
                {h2?.rejected_trap?.name || "City Care Trauma & Emergency"}
              </div>
              <p className="text-stone-600 dark:text-stone-300 mt-1">
                <strong>Disqualification Reason:</strong> {h2?.rejected_trap?.primary_rejection_reason || "Advertised 24/7 surgery with no night anaesthetist"}
              </p>
              <div className="mt-1 text-[11px] font-mono italic text-red-700 dark:text-red-400 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded">
                "{h2?.rejected_trap?.rejection_evidence || "...gate locked at night, visiting doctor only..."}"
              </div>
            </div>

            {/* Recommended Gwalior Hospital */}
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                <span>✅ Recommended Top Match</span>
                <span className="font-mono text-[10px]">{h2?.recommended_top?.distance_km} km</span>
              </div>
              <div className="font-extrabold text-stone-900 dark:text-white">
                {h2?.recommended_top?.name || "Apollo Spectra Hospital Gwalior"}
              </div>
              <p className="text-stone-600 dark:text-stone-300 mt-1">
                <strong>Certified Capabilities:</strong> 24x7 emergency casualty MO, posted anaesthetist, major OT with central line oxygen, verified beds free.
              </p>
              <div className="mt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span>Trust Score: {h2?.recommended_top?.trust_score}/100</span>
                <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-1.5 py-0.5 rounded text-[10px]">Demo Data Layer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contradiction Detection Confusion Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700 gap-2">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-white font-display">
              Contradiction Detection Confusion Matrix (Hollow Facility Discovery)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Evaluates system accuracy in detecting advertised claims exceeding ground clinical reality.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">F1: {cm?.f1_score}%</span>
            <span className="text-teal-600 dark:text-teal-400">Precision: {cm?.precision}%</span>
            <span className="text-amber-600 dark:text-amber-400">Recall: {cm?.recall}%</span>
          </div>
        </div>

        {/* 2x2 Matrix */}
        <div className="grid grid-cols-2 gap-3 mt-4 max-w-xl mx-auto">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/40 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
              True Positive (Hollow Caught)
            </span>
            <span className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200">
              {cm?.confusion_matrix?.true_positive || 0}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">Disqualified hollow traps correctly</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/40 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
              False Positive (Cautious)
            </span>
            <span className="text-2xl font-black font-mono text-amber-900 dark:text-amber-200">
              {cm?.confusion_matrix?.false_positive || 0}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">Flagged due to missing staff detail</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300/60 dark:border-rose-800/40 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block">
              False Negative (Missed)
            </span>
            <span className="text-2xl font-black font-mono text-rose-900 dark:text-rose-200">
              {cm?.confusion_matrix?.false_negative || 0}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">Hollow traps not flagged</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300/60 dark:border-blue-800/40 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
              True Negative (Solid Verified)
            </span>
            <span className="text-2xl font-black font-mono text-blue-900 dark:text-blue-200">
              {cm?.confusion_matrix?.true_negative || 0}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">Solid/Partial genuine facilities</p>
          </div>
        </div>
      </div>

      {/* Field-by-Field Extractor Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-base font-extrabold text-stone-900 dark:text-white font-display mb-1">
          Clinical Field Extractor Accuracy Benchmarks (12 Capabilities)
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
          Accuracy, Precision, Recall, and F1 across messy unstructured notes (Hinglish, typos, mixed casing).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-slate-700 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Clinical Capability</th>
                <th className="py-2.5 px-3">F1 Score</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">Performance Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800 font-mono">
              {fields.map((f, idx) => (
                <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-slate-700/50 transition">
                  <td className="py-2 px-3 font-semibold text-stone-800 dark:text-stone-200 font-sans">
                    {f.label}
                  </td>
                  <td className="py-2 px-3 font-black text-emerald-600 dark:text-emerald-400">
                    {f.f1_score}%
                  </td>
                  <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                    {f.accuracy}%
                  </td>
                  <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                    {f.precision}%
                  </td>
                  <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                    {f.recall}%
                  </td>
                  <td className="py-2 px-3 w-40">
                    <div className="w-full bg-stone-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${f.f1_score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
