import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000/site-settings";

const defaultSettings = { sponsors: true, inspiration: true, joinUs: true };

// Used by Home.jsx and Footer.jsx — fetches from API
export async function fetchSiteSettings() {
  try {
    const res = await axios.get(API);
    return { ...defaultSettings, ...res.data };
  } catch {
    return defaultSettings;
  }
}

const Toggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-4 md:p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors duration-200">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors duration-200 ${enabled ? "bg-purple-600/20 text-purple-400" : "bg-white/5 text-white/30"}`}>
        {enabled ? <Eye size={18} /> : <EyeOff size={18} />}
      </div>
      <div>
        <p className="font-semibold text-sm md:text-base">{label}</p>
        <p className="text-xs opacity-50 mt-0.5">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${enabled ? "bg-purple-600" : "bg-white/20"}`}
      role="switch" aria-checked={enabled}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  </div>
);

export default function SiteSettingsSection() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API)
      .then(res => setSettings({ ...defaultSettings, ...res.data }))
      .finally(() => setLoading(false));
  }, []);

  const update = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await axios.put(API, next);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      setSettings(settings); // revert on failure
    }
  };

  if (loading) return <p className="text-sm opacity-60">Loading settings…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 md:p-5 rounded-2xl border border-purple-500/20">
        <h2 className="text-lg md:text-xl font-semibold">Site Settings</h2>
        <p className="text-xs md:text-sm opacity-80 mt-1">Changes are saved globally and affect all visitors immediately.</p>
      </div>
      <div className="space-y-3">
        <Toggle label="Sponsors Section" description="Scrolling marquee of sponsor logos." enabled={settings.sponsors} onChange={v => update("sponsors", v)} />
        <Toggle label="Our Inspiration Section" description="Leadership cards on the Home page." enabled={settings.inspiration} onChange={v => update("inspiration", v)} />
        <Toggle label="Join Us Button" description="The 'Join Us' button in the footer." enabled={settings.joinUs} onChange={v => update("joinUs", v)} />
      </div>
      <div className={`flex items-center gap-2 text-xs text-green-400 transition-opacity duration-500 ${savedFlash ? "opacity-100" : "opacity-0"}`}>
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        Changes saved globally
      </div>
    </div>
  );
}