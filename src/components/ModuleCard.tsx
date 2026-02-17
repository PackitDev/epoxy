import { useState } from 'react';
import {
  Shield,
  Database,
  Layout,
  CreditCard,
  Mail,
  Zap,
  Radio,
  ShieldAlert,
  Loader2,
  Download,
  Trash2,
  Puzzle,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  shield: Shield,
  database: Database,
  layout: Layout,
  'credit-card': CreditCard,
  mail: Mail,
  zap: Zap,
  radio: Radio,
  'shield-alert': ShieldAlert,
  puzzle: Puzzle,
};

const categoryColors: Record<string, string> = {
  auth: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  database: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  frontend: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  payments: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  utilities: 'from-gray-500/20 to-slate-500/20 border-white/10',
};

const categoryIconColors: Record<string, string> = {
  auth: 'text-blue-400',
  database: 'text-green-400',
  frontend: 'text-purple-400',
  payments: 'text-yellow-400',
  utilities: 'text-gray-400',
};

interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isInstalled: boolean;
  dependencyCount: number;
  templateCount: number;
  onInstall: () => Promise<boolean>;
  onRemove: () => Promise<boolean>;
}

export function ModuleCard({
  name,
  description,
  category,
  icon,
  isInstalled,
  dependencyCount,
  templateCount,
  onInstall,
  onRemove,
}: ModuleCardProps) {
  const [loading, setLoading] = useState(false);
  const Icon = iconMap[icon] || Puzzle;
  const colorClass = categoryColors[category] || categoryColors.utilities;
  const iconColor = categoryIconColors[category] || 'text-white/40';

  const handleAction = async (action: () => Promise<boolean>) => {
    if (loading) return;
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <div className={`card group bg-gradient-to-br ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center">
          <Icon size={20} className={iconColor} />
        </div>
        {isInstalled && <span className="badge-installed">Installed</span>}
      </div>

      <h3 className="mt-3 text-sm font-bold text-white">{name}</h3>
      <p className="mt-1 text-xs text-white/50 line-clamp-2">{description}</p>

      <div className="mt-3 flex items-center gap-3 text-[10px] text-white/30">
        {dependencyCount > 0 && <span>{dependencyCount} deps</span>}
        {templateCount > 0 && <span>{templateCount} files</span>}
        <span className="badge-category">{category}</span>
      </div>

      <div className="mt-3">
        {!isInstalled ? (
          <button
            onClick={() => handleAction(onInstall)}
            disabled={loading}
            className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {loading ? 'Installing...' : 'Add to Project'}
          </button>
        ) : (
          <button
            onClick={() => handleAction(onRemove)}
            disabled={loading}
            className="btn-danger w-full text-xs py-2 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {loading ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>
    </div>
  );
}
