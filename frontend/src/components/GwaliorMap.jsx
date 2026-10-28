import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Navigation, Clock, ShieldCheck, Pill, Share2 } from 'lucide-react';

// Custom Map Controller to smoothly animate pan/zoom when location or selected item changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Function to generate custom SVG Leaflet DivIcons for Hospitals
function createHospitalIcon(category, isSelected = false) {
  let color = '#059669'; // default emerald
  let emoji = '🏥';

  if (category === 'eye') {
    color = '#2563eb'; // blue
    emoji = '👁️';
  } else if (category === 'heart') {
    color = '#dc2626'; // red
    emoji = '❤️';
  } else if (category === 'kidney') {
    color = '#d97706'; // amber
    emoji = '🩺';
  } else if (category === 'trauma') {
    color = '#e11d48'; // rose
    emoji = '🚨';
  } else if (category === 'maternity') {
    color = '#9333ea'; // purple
    emoji = '🤰';
  } else if (category === 'cancer') {
    color = '#0d9488'; // teal
    emoji = '🎗️';
  }

  const size = isSelected ? 44 : 36;
  const shadow = isSelected ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.3)';
  const border = isSelected ? '3px solid #ffffff' : '2px solid #ffffff';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${shadow};
        border: ${border};
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isSelected ? '20px' : '16px'};
          line-height: 1;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });
}

// Function to generate custom SVG Leaflet DivIcons for Medical Stores (💊)
function createMedicalIcon(isSelected = false) {
  const size = isSelected ? 42 : 34;
  return L.divIcon({
    className: 'custom-medical-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #059669;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.3)'};
        border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
        cursor: pointer;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isSelected ? '18px' : '15px'};
          line-height: 1;
        ">💊</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });
}

// Custom pulsing blue icon for user location
const userLocationIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        background: rgba(37, 99, 235, 0.35);
        border-radius: 50%;
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        background: #2563eb;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export default function GwaliorMap({
  userLocation,
  facilities = [],
  medicals = [],
  activeSection = 'hospitals', // 'hospitals' | 'medicals'
  selectedFacilityId,
  onSelectFacility,
  lang = 'hi'
}) {
  const isHi = lang === 'hi';
  const centerLat = userLocation?.lat || 26.2140;
  const centerLon = userLocation?.lon || 78.1910;

  // Map Filter: 'all' (default, displays both) | 'hospitals' | 'medicals'
  const [mapFilter, setMapFilter] = React.useState('all');

  const showHospitals = mapFilter === 'all' || mapFilter === 'hospitals';
  const showMedicals = mapFilter === 'all' || mapFilter === 'medicals';

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-3xl overflow-hidden border border-stone-200 dark:border-slate-800 shadow-xl z-0">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={[centerLat, centerLon]} zoom={13} />

        {/* Crisp OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS / Locality Marker */}
        <Marker position={[centerLat, centerLon]} icon={userLocationIcon}>
          <Popup className="custom-leaflet-popup" maxWidth={380} minWidth={260} autoPan={true} autoPanPadding={[24, 24]}>
            <div className="p-1 text-center font-sans">
              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                {isHi ? "📍 आपकी वर्तमान स्थिति" : "📍 Your Location"}
              </span>
              <p className="font-extrabold text-xs sm:text-sm text-stone-800 mt-1 break-words">
                {userLocation?.name || (isHi ? "ग्वालियर" : "Gwalior")}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* 1. Hospital Markers */}
        {showHospitals && facilities.map((h) => {
          const isSelected = selectedFacilityId === h.id || selectedFacilityId === h.facility_id;
          const icon = createHospitalIcon(h.category, isSelected);

          const hName = isHi ? (h.name_hi || h.name) : (h.name_en || h.name);
          const hType = isHi ? (h.type_hi || h.facility_type) : (h.type_en || h.facility_type);
          const hAddress = isHi ? (h.address_hi || h.address) : (h.address_en || h.address);
          const hER = isHi ? (h.emergency_room_hi || h.emergency_room) : (h.emergency_room_en || h.emergency_room);
          const hDoc = isHi ? (h.doctor_available_hi || h.doctor_available) : (h.doctor_available_en || h.doctor_available);
          const hBeds = isHi ? (h.beds_detail_hi || h.beds_detail) : (h.beds_detail_en || h.beds_detail);

          const cleanHospName = (h.name_en || h.name || '').replace(/\s*\([^)]*\)/g, '').trim();
          const hospDestQuery = cleanHospName
            ? `${cleanHospName}, ${h.address_en || h.address || 'Gwalior, Madhya Pradesh'}`
            : `${h.latitude},${h.longitude}`;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospDestQuery)}`;

          return (
            <Marker
              key={h.id || h.facility_id}
              position={[h.latitude, h.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectFacility) onSelectFacility(h);
                }
              }}
            >
              <Popup className="custom-leaflet-popup" maxWidth={380} minWidth={280} autoPan={true} autoPanPadding={[24, 24]}>
                <div className="p-2 space-y-2 font-sans text-stone-900">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {hType}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">
                      {h.distance_km} km
                    </span>
                  </div>

                  {/* Hospital Full Name - Guaranteed No Truncation or Cutoff */}
                  <h4 className="font-black text-sm sm:text-base text-stone-900 leading-snug break-words whitespace-normal block w-full">
                    {hName}
                  </h4>

                  <p className="text-xs text-stone-600 leading-snug break-words whitespace-normal">
                    📍 {hAddress}
                  </p>

                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 break-words whitespace-normal">
                    {hER}
                  </div>

                  <div className="text-xs text-stone-700 bg-stone-50 p-2 rounded-xl border border-stone-200 break-words whitespace-normal">
                    {hDoc}
                  </div>

                  <div className="text-xs font-medium text-stone-700 break-words">
                    {hBeds}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100">
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHi ? "कॉल करें" : "Call"}</span>
                      </a>
                    )}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isHi ? "रास्ता देखें" : "Navigate"}</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Medical Store Markers (💊) */}
        {showMedicals && medicals.map((m) => {
          const isSelected = selectedFacilityId === m.id;
          const icon = createMedicalIcon(isSelected);

          const mName = isHi ? (m.name_hi || m.name) : (m.name_en || m.name);
          const mType = isHi ? (m.type_hi || m.type) : (m.type_en || m.type);
          const mAddress = isHi ? (m.address_hi || m.address) : (m.address_en || m.address);
          const mHours = isHi ? (m.opening_hours_hi || m.opening_hours) : (m.opening_hours_en || m.opening_hours);
          const mDiscount = isHi ? (m.discount_info_hi || m.discount_info) : (m.discount_info_en || m.discount_info);

          const cleanMedName = (m.name_en || m.name || '').replace(/\s*\([^)]*\)/g, '').trim();
          const medDestQuery = cleanMedName
            ? `${cleanMedName}, ${m.address_en || m.address || 'Gwalior, Madhya Pradesh'}`
            : `${m.latitude},${m.longitude}`;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(medDestQuery)}`;

          return (
            <Marker
              key={m.id}
              position={[m.latitude, m.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectFacility) onSelectFacility(m);
                }
              }}
            >
              <Popup className="custom-leaflet-popup" maxWidth={380} minWidth={280} autoPan={true} autoPanPadding={[24, 24]}>
                <div className="p-2 space-y-2 font-sans text-stone-900">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {mType}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">
                      {m.distance_km} km
                    </span>
                  </div>

                  {/* Medical Store Full Name */}
                  <h4 className="font-black text-sm sm:text-base text-stone-900 leading-snug break-words whitespace-normal block w-full">
                    {mName}
                  </h4>

                  <p className="text-xs text-stone-600 leading-snug break-words whitespace-normal">
                    📍 {mAddress}
                  </p>

                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    {mHours}
                  </div>

                  {mDiscount && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold break-words">
                      🏷️ {mDiscount}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100">
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHi ? "कॉल करें" : "Call"}</span>
                      </a>
                    )}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isHi ? "रास्ता देखें" : "Navigate"}</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Top Map Layer Filter Switcher: ALL / HOSPITALS / MEDICALS */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-lg flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => setMapFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${
            mapFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          {isHi ? "सभी (अस्पताल + मेडिकल)" : "All (Both)"}
        </button>

        <button
          type="button"
          onClick={() => setMapFilter('hospitals')}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
            mapFilter === 'hospitals'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>🏥</span>
          <span>{facilities.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setMapFilter('medicals')}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
            mapFilter === 'medicals'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>💊</span>
          <span>{medicals.length}</span>
        </button>
      </div>

      {/* Floating Info Overlay Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-md flex items-center gap-2.5 text-xs font-bold text-stone-800 dark:text-stone-200">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          🏥 {facilities.length} {isHi ? "अस्पताल" : "Hospitals"} • 💊 {medicals.length} {isHi ? "मेडिकल स्टोर" : "Pharmacies"}
        </span>
      </div>
    </div>
  );
}
