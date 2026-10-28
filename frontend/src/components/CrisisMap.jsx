import React, { useState, useEffect } from 'react';
import { useTheme } from '../themeContext';
import {
  MapPin,
  Activity,
  Layers,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';

export default function CrisisMap({ desertsData }) {
  const { t } = useTheme();
  const [activeSpecialty, setActiveSpecialty] = useState('surgery');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [filterRegion, setFilterRegion] = useState('all');

  const specialties = [
    { id: 'surgery', label: 'Emergency Surgery', icon: '🔪' },
    { id: 'icu', label: 'ICU & Ventilators', icon: '🫁' },
    { id: 'dialysis', label: 'Hemodialysis', icon: '🩸' },
    { id: 'oncology', label: 'Oncology Care', icon: '🎗️' },
    { id: 'trauma', label: 'Trauma & Fractures', icon: '🚑' }
  ];

  const districts = desertsData?.districts || [];
  const summary = desertsData?.summary || {};

  // Select first critical desert by default
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0]);
    }
  }, [districts]);

  // Filtered districts
  const filteredDistricts = districts.filter((d) => {
    if (filterRegion === 'bihar') return d.state === 'Bihar';
    if (filterRegion === 'mp') return d.state === 'Madhya Pradesh';
    return true;
  });

  // Calculate normalized coordinate positions for India map visualization
  // Lat: 8 to 35, Lon: 68 to 96
  const getMapCoords = (lat, lon) => {
    const minLat = 9.0;
    const maxLat = 30.5;
    const minLon = 70.0;
    const maxLon = 93.0;

    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header and Specialty Toggles */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white font-display flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block" />
              <span>National Healthcare Desert Crisis Map</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Real-time spatial deficit index: verified surgical & critical care availability weighted by trust score and transit distance.
            </p>
          </div>

          {/* Region Filters */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterRegion('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterRegion === 'all'
                  ? 'bg-white dark:bg-slate-700 shadow text-stone-900 dark:text-white'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All India
            </button>
            <button
              onClick={() => setFilterRegion('bihar')}
              className={`px-3 py-1 rounded-lg transition ${
                filterRegion === 'bihar'
                  ? 'bg-white dark:bg-slate-700 shadow text-stone-900 dark:text-white'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Bihar Focus
            </button>
            <button
              onClick={() => setFilterRegion('mp')}
              className={`px-3 py-1 rounded-lg transition ${
                filterRegion === 'mp'
                  ? 'bg-white dark:bg-slate-700 shadow text-stone-900 dark:text-white'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Gwalior & MP
            </button>
          </div>
        </div>

        {/* Specialty Selector Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {specialties.map((s) => {
            const isActive = activeSpecialty === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSpecialty(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-slate-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Summary Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-stone-100 dark:border-slate-700/60">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50">
            <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">
              Critical Deserts
            </span>
            <div className="text-xl font-black text-red-700 dark:text-red-300 font-mono">
              {summary.critical_deserts || 0}
            </div>
            <span className="text-[10px] text-stone-500">&gt;70 Risk Score</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Severe Deficits
            </span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {summary.severe_deficits || 0}
            </div>
            <span className="text-[10px] text-stone-500">45-70 Risk Score</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Verified Surgery
            </span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {summary.total_verified_surgery || 0}
            </div>
            <span className="text-[10px] text-stone-500">Certified Functional</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/50">
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
              Verified ICUs
            </span>
            <div className="text-xl font-black text-cyan-700 dark:text-cyan-300 font-mono">
              {summary.total_verified_icu || 0}
            </div>
            <span className="text-[10px] text-stone-500">Working Ventilators</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer and District Drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider">
                Spatial Access & Emergency Flow Vector
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px]">
                Live Flow
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" />
                Critical Desert
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Severe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Safe Hub
              </span>
            </div>
          </div>

          {/* SVG Map Canvas with Flow Lines */}
          <div className="relative w-full h-[380px] my-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* Glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Animated Flow Lines from selected district to nearest verified facility */}
              {selectedDistrict?.flow_lines?.[activeSpecialty] && (() => {
                const fl = selectedDistrict.flow_lines[activeSpecialty];
                const from = getMapCoords(fl.from_lat, fl.from_lon);
                const to = getMapCoords(fl.to_lat, fl.to_lon);
                return (
                  <g>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="url(#flowGrad)"
                      strokeWidth="1.2"
                      strokeDasharray="2, 2"
                      className="animate-pulse"
                    />
                    <circle
                      cx={to.x}
                      cy={to.y}
                      r="2.5"
                      fill="#10b981"
                      filter="url(#glow)"
                    />
                  </g>
                );
              })()}

              {/* District Node Circles */}
              {filteredDistricts.map((d) => {
                const coords = getMapCoords(d.latitude, d.longitude);
                const specInfo = d.specialties?.[activeSpecialty];
                const risk = specInfo?.desert_risk || d.overall_desert_risk;
                const isSelected = selectedDistrict?.district === d.district;

                let nodeColor = '#10b981';
                if (risk > 70) nodeColor = '#ef4444';
                else if (risk > 45) nodeColor = '#f59e0b';
                else if (risk > 25) nodeColor = '#eab308';

                return (
                  <g
                    key={d.district}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedDistrict(d)}
                  >
                    {/* Pulsing ring for critical deserts */}
                    {risk > 70 && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="3.5"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="0.6"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? '2.8' : '1.8'}
                      fill={nodeColor}
                      stroke={isSelected ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected ? '0.8' : '0.4'}
                      filter="url(#glow)"
                    />

                    {/* Label */}
                    <text
                      x={coords.x + 2}
                      y={coords.y + 0.8}
                      fontSize="2.4"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="Inter"
                    >
                      {d.district}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-2">
            <span>Coordinates normalized from district survey centroids</span>
            <span className="font-mono">IPHS Benchmark 2023</span>
          </div>
        </div>

        {/* Selected District Drilldown Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200 dark:border-slate-700 shadow-xl flex flex-col justify-between">
          {selectedDistrict ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    District Diagnostic
                  </span>
                  <h3 className="text-xl font-extrabold text-stone-900 dark:text-white font-display">
                    {selectedDistrict.district}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    {selectedDistrict.state} • {selectedDistrict.total_facilities} Registered Facilities
                  </p>
                </div>

                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    selectedDistrict.overall_desert_risk > 70
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : selectedDistrict.overall_desert_risk > 45
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {selectedDistrict.status}
                </span>
              </div>

              {/* Overall Desert Risk Gauge */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-600 dark:text-stone-400">
                    Desert Vulnerability Index:
                  </span>
                  <span className="font-mono text-sm font-black text-stone-900 dark:text-white">
                    {selectedDistrict.overall_desert_risk}/100
                  </span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedDistrict.overall_desert_risk > 70
                        ? 'bg-red-500'
                        : selectedDistrict.overall_desert_risk > 45
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedDistrict.overall_desert_risk}%` }}
                  />
                </div>
              </div>

              {/* Flow Line / Nearest Verified Safe Hub */}
              {selectedDistrict.flow_lines?.[activeSpecialty] && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Nearest Verified Safe Facility</span>
                  </div>
                  <div className="font-extrabold text-stone-900 dark:text-white text-sm">
                    {selectedDistrict.flow_lines[activeSpecialty].to_facility}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-2">
                    <span>
                      Transit Distance: <strong>{selectedDistrict.flow_lines[activeSpecialty].distance_km} km</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Specialty Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Access By Clinical Discipline:
                </span>
                {selectedDistrict.specialties &&
                  Object.entries(selectedDistrict.specialties).map(([specKey, specVal]) => (
                    <div
                      key={specKey}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        specKey === activeSpecialty
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-stone-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">
                        {specKey}
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-stone-600 dark:text-stone-300">
                          {specVal.verified_count} verified ({specVal.distance_to_nearest_km} km)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Select any district node on the map to inspect clinical deficit scores.</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700 text-[11px] text-stone-400">
            Weighted by verified staff, active equipment & emergency readiness.
          </div>
        </div>
      </div>
    </div>
  );
}
