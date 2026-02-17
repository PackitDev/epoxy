import { useProjectStore } from '../stores/project-store';
import { Loader2 } from 'lucide-react';

export function StatusBar() {
  const statusMessage = useProjectStore((s) => s.statusMessage);
  const isLoading = useProjectStore((s) => s.isLoading);
  const activeProject = useProjectStore((s) => s.activeProject);
  const packages = useProjectStore((s) => s.packages);

  return (
    <div className="h-7 bg-[#0d0d0d] border-t border-[#1e1e1e] flex items-center justify-between px-3 text-[11px]">
      <div className="flex items-center gap-2 text-white/40">
        {isLoading && <Loader2 size={12} className="animate-spin text-orange-400" />}
        <span>{statusMessage}</span>
      </div>
      <div className="flex items-center gap-4 text-white/30">
        {activeProject && (
          <>
            <span>{packages.length} packages</span>
            <span>{activeProject.routeCount} routes</span>
          </>
        )}
      </div>
    </div>
  );
}
