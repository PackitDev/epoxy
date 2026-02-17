import { Package, Trash2 } from 'lucide-react';
import type { PackageInfo } from '../types';

interface InstalledListProps {
  packages: PackageInfo[];
  onRemove: (name: string) => void;
}

export function InstalledList({ packages, onRemove }: InstalledListProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        No packages installed yet
      </div>
    );
  }

  const deps = packages.filter((p) => !p.isDev);
  const devDeps = packages.filter((p) => p.isDev);

  return (
    <div className="space-y-4">
      {deps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Dependencies ({deps.length})
          </h4>
          <div className="space-y-0.5">
            {deps.map((pkg) => (
              <div
                key={pkg.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 group transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Package size={12} className="text-white/30 shrink-0" />
                  <span className="text-sm text-white/80 truncate">{pkg.name}</span>
                  <span className="text-[10px] text-white/30">{pkg.version}</span>
                </div>
                <button
                  onClick={() => onRemove(pkg.name)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {devDeps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Dev Dependencies ({devDeps.length})
          </h4>
          <div className="space-y-0.5">
            {devDeps.map((pkg) => (
              <div
                key={pkg.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 group transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Package size={12} className="text-white/20 shrink-0" />
                  <span className="text-sm text-white/50 truncate">{pkg.name}</span>
                  <span className="text-[10px] text-white/20">{pkg.version}</span>
                </div>
                <button
                  onClick={() => onRemove(pkg.name)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
