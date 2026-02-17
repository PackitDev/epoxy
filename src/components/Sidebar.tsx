import { useProjectStore } from '../stores/project-store';
import {
  LayoutDashboard,
  Package,
  Puzzle,
  Layers,
  FolderOpen,
  ChevronDown,
  ToggleLeft,
  Settings,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'features' as const, label: 'Features', icon: ToggleLeft },
  { id: 'config' as const, label: 'Config', icon: Settings },
  { id: 'packages' as const, label: 'Packages', icon: Package },
  { id: 'modules' as const, label: 'Modules', icon: Puzzle },
  { id: 'presets' as const, label: 'Presets', icon: Layers },
];

export function Sidebar() {
  const currentPage = useProjectStore((s) => s.currentPage);
  const setCurrentPage = useProjectStore((s) => s.setCurrentPage);
  const activeProject = useProjectStore((s) => s.activeProject);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);
  const openProject = useProjectStore((s) => s.openProject);

  return (
    <aside className="w-60 h-full bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col">
      {/* App title with drag region */}
      <div className="h-9 flex items-center px-4 border-b border-[#1e1e1e] app-drag-region">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500" />
          <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            EPOXY
          </span>
        </div>
      </div>

      {/* Project selector */}
      <div className="p-3 border-b border-[#1e1e1e]">
        <button
          onClick={openProject}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen size={14} className="text-white/40 shrink-0" />
            <span className="text-xs text-white/80 truncate">
              {activeProject ? activeProject.name : 'Open Project...'}
            </span>
          </div>
          <ChevronDown size={12} className="text-white/40 shrink-0" />
        </button>

        {/* Recent projects */}
        {!activeProject && projects.length > 0 && (
          <div className="mt-2 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-white/30 px-2 py-1">Recent</p>
            {projects.slice(0, 5).map((p) => (
              <button
                key={p.path}
                onClick={() => selectProject(p)}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-orange-400' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Version */}
      <div className="p-3 border-t border-[#1e1e1e]">
        <p className="text-[10px] text-white/20 text-center">Epoxy v1.0.0-beta.1</p>
      </div>
    </aside>
  );
}
