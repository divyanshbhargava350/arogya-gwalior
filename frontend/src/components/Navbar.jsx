import React, { useEffect, useState } from 'react';
import { useTheme } from '../themeContext';
import {
  HeartPulse,
  PhoneCall,
  Sun,
  Moon,
  MapPin,
  User
} from 'lucide-react';

export default function Navbar({
  onResetHome,
  userLocation,
  onLocalitySelect
}) {
  const { theme, setTheme, lang, setLang } = useTheme();
  const isHi = lang === 'hi';

  // Logged-in user (name shown instead of the Login button)
  const [userName, setUserName] = useState(null);
  useEffect(() => {
    let token = null;
    try { token = localStorage.getItem('arogya_token'); } catch (e) {}
    if (!token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.user) setUserName(d.user.name); })
      .catch(() => {});
  }, []);

  const gwaliorLocalities = [
    { key: "city_center", label_hi: "सिटी सेंटर", label_en: "City Center", lat: 26.2140, lon: 78.1910 },
    { key: "kampoo", label_hi: "कंपू / जयारोग्य", label_en: "Kampoo / JAH", lat: 26.2032, lon: 78.1578 },
    { key: "lashkar", label_hi: "लश्कर", label_en: "Lashkar", lat: 26.2080, lon: 78.1620 },
    { key: "morar", label_hi: "मुरार", label_en: "Morar", lat: 26.2280, lon: 78.2250 },
    { key: "thatipur", label_hi: "थाटीपुर", label_en: "Thatipur", lat: 26.2190, lon: 78.2050 },
    { key: "padav", label_hi: "पड़ाव / स्टेशन", label_en: "Padav / Station", lat: 26.2185, lon: 78.1810 }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-stone-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Name */}
          <div
            onClick={onResetHome}
            className="flex items-center gap-2.5 cursor-pointer group"
            title={isHi ? "होम पेज पर जाएं" : "Go to Home"}
          >
            <img
              src="/logo-mark.png"
              alt="Arogya Gwalior"
              className="w-11 h-11 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-white font-display">
                  {isHi ? "आरोग्य ग्वालियर" : "Arogya Gwalior"}
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  24x7
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-none hidden sm:block">
                {isHi ? "ग्वालियर स्मार्ट स्वास्थ्य सेवा" : "Gwalior Healthcare & Emergency"}
              </p>
            </div>
          </div>

          {/* Quick Locality Selector Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <select
              value={userLocation?.key || ""}
              onChange={(e) => {
                const loc = gwaliorLocalities.find(l => l.key === e.target.value);
                if (loc && onLocalitySelect) {
                  onLocalitySelect(loc);
                }
              }}
              className="bg-transparent border-none text-stone-800 dark:text-stone-200 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="">{isHi ? "स्थान: ग्वालियर" : "Location: Gwalior"}</option>
              {gwaliorLocalities.map((loc) => (
                <option key={loc.key} value={loc.key}>
                  {isHi ? loc.label_hi : loc.label_en}
                </option>
              ))}
            </select>
          </div>

          {/* Right Actions: 108 Emergency, Language Toggle, Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 108 Emergency Ambulance Button */}
            <a
              href="tel:108"
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/25 transition active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>{isHi ? "इमरजेंसी: 108" : "108 Emergency"}</span>
            </a>

            {/* Login / Account */}
            <a
              href={userName ? "/dashboard" : "/login"}
              title={userName ? (isHi ? "मेरी प्रोफ़ाइल" : "My profile") : undefined}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[110px] truncate">{userName ? userName : (isHi ? "लॉगिन" : "Login")}</span>
            </a>

            {/* Instant 1-Tap Language Toggle: हिंदी / English */}
            <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  isHi
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  !isHi
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Theme Toggle (Day / Night) */}
            <button
              onClick={() => setTheme(theme === 'night-ward' ? 'sanjeevani-day' : 'night-ward')}
              className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 transition"
              title={isHi ? "थीम बदलें (दिन/रात)" : "Toggle Day/Night Theme"}
            >
              {theme === 'night-ward' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
