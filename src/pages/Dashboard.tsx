import { useProjectStore } from '../stores/project-store';
import { InstalledList } from '../components/InstalledList';
import {
  FolderOpen,
  Package,
  Route,
  Terminal,
  Code2,
  Puzzle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function Dashboard() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const packages = useProjectStore((s) => s.packages);
  const installedModules = useProjectStore((s) => s.installedModules);
  const modules = useProjectStore((s) => s.modules);
  const removePackage = useProjectStore((s) => s.removePackage);
  const setCurrentPage = useProjectStore((s) => s.setCurrentPage);
  const openProject = useProjectStore((s) => s.openProject);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-pink-500/20 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Epoxy</h1>
          <p className="text-white/50 text-sm mb-8">
            Open a Packet SDK project to manage packages, modules, and presets with a visual interface.
          </p>
          <button
            onClick={openProject}
            className="btn-primary text-sm px-6 py-3 inline-flex items-center gap-2"
          >
            <FolderOpen size={16} />
            Open Project Folder
          </button>

          {projects.length > 0 && (
            <div className="mt-8 w-full">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Detected Projects
              </h3>
              <div className="space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => selectProject(p)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen size={14} className="text-white/30 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-sm text-white/80 truncate">{p.name}</p>
                        <p className="text-[10px] text-white/30 truncate">{p.path}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const depCount = Object.keys(activeProject.dependencies).length;
  const devDepCount = Object.keys(activeProject.devDependencies).length;
  const activeModuleNames = modules
    .filter((m) => installedModules.includes(m.id))
    .map((m) => m.name);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Project header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{activeProject.name}</h1>
          <p className="text-xs text-white/40 mt-0.5">{activeProject.path}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.epoxy?.openInEditor(activeProject.path)}
            className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"
          >
            <Code2 size={12} />
            Open in Editor
          </button>
          <button
            onClick={() => window.epoxy?.openTerminal(activeProject.path)}
            className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"
          >
            <Terminal size={12} />
            Terminal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="card flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('packages')}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Package size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{depCount}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Dependencies</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('packages')}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Package size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{devDepCount}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Dev Deps</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('modules')}>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Puzzle size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{installedModules.length}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Modules</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Route size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{activeProject.routeCount}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Routes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active modules */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">Active Modules</h2>
            <button
              onClick={() => setCurrentPage('modules')}
              className="text-xs text-orange-400/60 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              Browse <ArrowRight size={10} />
            </button>
          </div>
          {activeModuleNames.length > 0 ? (
            <div className="space-y-1.5">
              {activeModuleNames.map((name) => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                  <Puzzle size={12} className="text-orange-400" />
                  <span className="text-sm text-white/80">{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-6">
              <Puzzle size={24} className="text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/30">No modules installed</p>
              <button
                onClick={() => setCurrentPage('modules')}
                className="mt-2 text-xs text-orange-400/60 hover:text-orange-400"
              >
                Add your first module
              </button>
            </div>
          )}
        </div>

        {/* Installed packages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70">Installed Packages</h2>
            <button
              onClick={() => setCurrentPage('packages')}
              className="text-xs text-orange-400/60 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              Manage <ArrowRight size={10} />
            </button>
          </div>
          <div className="card max-h-80 overflow-y-auto">
            <InstalledList
              packages={packages}
              onRemove={(name) => removePackage(name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
