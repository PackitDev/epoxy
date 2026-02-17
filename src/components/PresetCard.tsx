import { useState } from 'react';
import { Rocket, Server, Radio, Loader2, Download, Puzzle } from 'lucide-react';

const presetIcons: Record<string, any> = {
  rocket: Rocket,
  server: Server,
  radio: Radio,
};

const presetGradients: Record<string, string> = {
  'saas-starter': 'from-yellow-500/20 via-orange-500/20 to-pink-500/20 border-yellow-500/20',
  'api-backend': 'from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/20',
  'realtime-app': 'from-purple-500/20 via-pink-500/20 to-red-500/20 border-purple-500/20',
};

interface PresetCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  modules: string[];
  installedModules: string[];
  onInstall: () => Promise<boolean>;
}

export function PresetCard({
  id,
  name,
  description,
  icon,
  modules,
  installedModules,
  onInstall,
}: PresetCardProps) {
  const [loading, setLoading] = useState(false);
  const Icon = presetIcons[icon] || Puzzle;
  const gradient = presetGradients[id] || 'from-gray-500/20 to-slate-500/20 border-white/10';
  const allInstalled = modules.every((m) => installedModules.includes(m));
  const someInstalled = modules.some((m) => installedModules.includes(m));

  const handleInstall = async () => {
    if (loading) return;
    setLoading(true);
    await onInstall();
    setLoading(false);
  };

  return (
    <div className={`card bg-gradient-to-br ${gradient} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon size={128} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center">
            <Icon size={24} className="text-white/80" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{name}</h3>
            <p className="text-xs text-white/40">{modules.length} modules included</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-white/60">{description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {modules.map((m) => (
            <span
              key={m}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                installedModules.includes(m)
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              {m}
            </span>
          ))}
        </div>

        <div className="mt-4">
          {allInstalled ? (
            <div className="badge-installed w-full text-center py-2 text-xs">
              All modules installed
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={loading}
              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {loading
                ? 'Installing...'
                : someInstalled
                ? 'Install Remaining'
                : 'Install All'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
