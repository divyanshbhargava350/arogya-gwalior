import React, { useState, useEffect } from 'react';
import { useTheme } from '../themeContext';
import {
  Eye,
  Heart,
  Droplets,
  Activity,
  Baby,
  Crosshair,
  Building2,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Bed,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Filter
} from 'lucide-react';

export default function SpecialtyHospitalGrid({
  userLocation,
  setUserLocation,
  onInspectTrace
}) {
  const { t } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localities, setLocalities] = useState({});

  const categories = [
    { id: 'all', label: 'All Hospitals (सभी)', icon: Building2 },
    { id: 'eye', label: 'Eye Hospitals (नेत्र अस्पताल)', icon: Eye, color: 'text-blue-500' },
    { id: 'heart', label: 'Heart & Cardiac (हृदय रोग)', icon: Heart, color: 'text-red-500' },
    { id: 'kidney', label: 'Kidney & Dialysis (गुर्दा)', icon: Droplets, color: 'text-amber-500' },
    { id: 'trauma', label: '24/7 Trauma & Emergency (आपातकाल)', icon: Activity, color: 'text-rose-600' },
    { id: 'maternity', label: 'Mother & Child (महिला व शिशु)', icon: Baby, color: 'text-purple-500' },
    { id: 'cancer', label: 'Cancer Care (कैंसर संस्थान)', icon: Crosshair, color: 'text-emerald-500' }
  ];

  // Fetch localities on mount
  useEffect(() => {
    fetch('/api/gwalior/localities')
      .then((res) => res.json())
      .then((data) => setLocalities(data))
      .catch((err) => console.error("Error loading localities:", err));
  }, []);

  // Fetch facilities when category or userLocation changes
  useEffect(() => {
    fetchFacilities(activeCategory, userLocation.lat, userLocation.lon);
  }, [activeCategory, userLocation.lat, userLocation.lon]);

  const fetchFacilities = async (category, lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gwalior/specialties?category=${category}&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setFacilities(data.facilities || []);
    } catch (e) {
      console.error("Failed to load specialty facilities", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalityChange = (locKey) => {
    const loc = localities[locKey];
    if (loc) {
      setUserLocation({
        lat: loc.lat,
        lon: loc.lon,
        name: loc.label
      });
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: "My Live GPS Location"
          });
        },
        () => {
          alert("GPS permission denied or unavailable. Using Gwalior City Center.");
        }
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Locality Switcher */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-display">
                Gwalior & Madhya Pradesh Hospital Directory
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
              Verified Eye, Heart, Kidney, Dialysis & Trauma Hospitals sorted by real-time distance from your exact location.
            </p>
          </div>

          {/* Location Controls: Live GPS + Gwalior Localities Dropdown */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleDetectGPS}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 text-xs font-bold flex items-center gap-1.5 transition"
              title="Use current GPS location"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Use My Live GPS</span>
            </button>

            <div className="flex items-center gap-2 bg-stone-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs">
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <select
                onChange={(e) => handleLocalityChange(e.target.value)}
                className="bg-transparent border-none text-stone-800 dark:text-stone-200 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="">Select Gwalior Area (इलाका चुनें)</option>
                {Object.entries(localities).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
            Specialty Filters:
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/10'
                    : 'bg-stone-100 dark:bg-slate-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color || 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400">Loading verified facilities around {userLocation.name}...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-2 font-semibold">
            <span>
              Showing {facilities.length} Verified Facilities in Gwalior & MP
            </span>
            <span>Sorted by Distance from {userLocation.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map((facility) => {
              const isEye = facility.category === 'eye';
              const isHeart = facility.category === 'heart';
              const isKidney = facility.category === 'kidney';
              const isTrauma = facility.category === 'trauma';

              const shareText = `*SANJEEVANI HOSPITAL DETAILS*\n🏥 ${facility.name}\n📍 ${facility.address || facility.locality}\n🚗 ${facility.distance_km} km away (~${facility.estimated_eta_mins} mins)\n📞 Phone: ${facility.phone}\nSpecialties: ${facility.specialties_listed}`;
              const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
              const directionsUrl = `https://maps.google.com/?q=${facility.latitude},${facility.longitude}`;

              return (
                <div
                  key={facility.facility_id}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 p-5 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Category & Proximity Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isEye
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : isHeart
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : isKidney
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {facility.facility_type}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{facility.distance_km} km</span>
                      </div>
                    </div>

                    {/* Hospital Name */}
                    <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white font-display leading-snug">
                      {facility.name}
                    </h3>

                    {/* Address & Locality */}
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                      <span>{facility.address || `${facility.locality}, Gwalior`}</span>
                    </p>

                    {/* Key Specialties Chips */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {facility.specialties_listed
                        ?.split(';')
                        .slice(0, 3)
                        .map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                    </div>

                    {/* Notes Snippet */}
                    {facility.unstructured_notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2.5 line-clamp-2 italic bg-stone-50 dark:bg-slate-900/60 p-2 rounded-lg border border-stone-100 dark:border-slate-800">
                        "{facility.unstructured_notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions: Call, Directions, WhatsApp */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}

                    <div className="flex items-center gap-1.5">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-300 transition"
                        title="Get Navigation Directions"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                      </a>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 transition border border-green-300/40"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5 text-green-600" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
