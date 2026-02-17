import { Package, Download, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PackageCardProps {
  name: string;
  version: string;
  description: string;
  isInstalled?: boolean;
  isDev?: boolean;
  onInstall?: () => Promise<boolean>;
  onRemove?: () => Promise<boolean>;
}

export function PackageCard({
  name,
  version,
  description,
  isInstalled,
  isDev,
  onInstall,
  onRemove,
}: PackageCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: (() => Promise<boolean>) | undefined) => {
    if (!action || loading) return;
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <div className="card group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <Package size={14} className="text-white/40" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
            <p className="text-[11px] text-white/30">v{version}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isDev && <span className="badge-category">dev</span>}
          {isInstalled && <span className="badge-installed">installed</span>}
        </div>
      </div>

      {description && (
        <p className="mt-2 text-xs text-white/50 line-clamp-2">{description}</p>
      )}

      <div className="mt-3 flex gap-2">
        {!isInstalled && onInstall && (
          <button
            onClick={() => handleAction(onInstall)}
            disabled={loading}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Install
          </button>
        )}
        {isInstalled && onRemove && (
          <button
            onClick={() => handleAction(onRemove)}
            disabled={loading}
            className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
