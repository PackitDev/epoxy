import { useState } from 'react';
import { useProjectStore } from '../stores/project-store';
import { ModuleCard } from '../components/ModuleCard';
import { Puzzle } from 'lucide-react';

const categories = ['All', 'Auth', 'Database', 'Frontend', 'Payments', 'Utilities'];

export function Modules() {
  const modules = useProjectStore((s) => s.modules);
  const installedModules = useProjectStore((s) => s.installedModules);
  const installModule = useProjectStore((s) => s.installModule);
  const removeModule = useProjectStore((s) => s.removeModule);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredModules = activeCategory === 'All'
    ? modules
    : modules.filter((m) => m.category.toLowerCase() === activeCategory.toLowerCase());

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Puzzle size={48} className="text-white/10 mb-4" />
        <h2 className="text-lg font-bold text-white/60">No Project Open</h2>
        <p className="text-sm text-white/30 mt-1">Open a project to browse and install modules</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Modules</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Add pre-built features to your project — deps, code, and config, all in one click
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Installed modules section */}
      {installedModules.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-green-400/70 mb-3">
            Installed ({installedModules.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {modules
              .filter((m) => installedModules.includes(m.id))
              .map((mod) => (
                <ModuleCard
                  key={mod.id}
                  id={mod.id}
                  name={mod.name}
                  description={mod.description}
                  category={mod.category}
                  icon={mod.icon}
                  isInstalled={true}
                  dependencyCount={Object.keys(mod.dependencies || {}).length}
                  templateCount={(mod.templates || []).length}
                  onInstall={() => installModule(mod.id)}
                  onRemove={() => removeModule(mod.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Available modules */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-3">
          Available ({filteredModules.filter((m) => !installedModules.includes(m.id)).length})
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredModules
            .filter((m) => !installedModules.includes(m.id))
            .map((mod) => (
              <ModuleCard
                key={mod.id}
                id={mod.id}
                name={mod.name}
                description={mod.description}
                category={mod.category}
                icon={mod.icon}
                isInstalled={false}
                dependencyCount={Object.keys(mod.dependencies || {}).length}
                templateCount={(mod.templates || []).length}
                onInstall={() => installModule(mod.id)}
                onRemove={() => removeModule(mod.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
