import { useProjectStore } from '../stores/project-store';
import { PresetCard } from '../components/PresetCard';
import { Layers } from 'lucide-react';

export function Presets() {
  const presets = useProjectStore((s) => s.presets);
  const installedModules = useProjectStore((s) => s.installedModules);
  const installPreset = useProjectStore((s) => s.installPreset);
  const activeProject = useProjectStore((s) => s.activeProject);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Layers size={48} className="text-white/10 mb-4" />
        <h2 className="text-lg font-bold text-white/60">No Project Open</h2>
        <p className="text-sm text-white/30 mt-1">Open a project to install full-stack presets</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Presets</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Install a complete feature set with one click — multiple modules bundled together
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            id={preset.id}
            name={preset.name}
            description={preset.description}
            icon={preset.icon}
            modules={preset.modules}
            installedModules={installedModules}
            onInstall={() => installPreset(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}
