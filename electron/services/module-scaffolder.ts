import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PackageManagerService } from './package-manager.js';
import { ConfigManager } from './config-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  config: Record<string, any>;
  envVars: Record<string, string>;
  templates: { src: string; dest: string }[];
}

export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  modules: string[];
  icon: string;
}

export class ModuleScaffolder {
  private pkgManager = new PackageManagerService();
  private configMgr = new ConfigManager();
  private modulesDir: string;

  constructor() {
    // In dev, modules are relative to the project root
    // In production, they're in the app's resources
    this.modulesDir = path.join(__dirname, '..', '..', 'modules');
    if (!fs.existsSync(this.modulesDir)) {
      this.modulesDir = path.join(__dirname, '..', 'modules');
    }
  }

  listModules(): ModuleDefinition[] {
    const registryPath = path.join(this.modulesDir, 'registry.json');
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      return registry.modules || [];
    } catch {
      return [];
    }
  }

  listPresets(): PresetDefinition[] {
    const registryPath = path.join(this.modulesDir, 'registry.json');
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      return registry.presets || [];
    } catch {
      return [];
    }
  }

  getModuleDefinition(moduleId: string): ModuleDefinition | null {
    const modulePath = path.join(this.modulesDir, moduleId, 'module.json');
    try {
      return JSON.parse(fs.readFileSync(modulePath, 'utf-8'));
    } catch {
      // Fallback to registry
      const modules = this.listModules();
      return modules.find((m) => m.id === moduleId) || null;
    }
  }

  async installModule(
    projectPath: string,
    moduleId: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    const mod = this.getModuleDefinition(moduleId);
    if (!mod) return { success: false, error: `Module "${moduleId}" not found` };

    onProgress?.(`Installing module: ${mod.name}`);

    // 1. Install npm dependencies
    const allDeps = Object.entries(mod.dependencies || {});
    const allDevDeps = Object.entries(mod.devDependencies || {});

    for (const [name, version] of allDeps) {
      onProgress?.(`Installing ${name}@${version}...`);
      const result = await this.pkgManager.install(projectPath, `${name}@${version}`, false);
      if (!result.success) {
        return { success: false, error: `Failed to install ${name}: ${result.error}` };
      }
    }

    for (const [name, version] of allDevDeps) {
      onProgress?.(`Installing ${name}@${version} (dev)...`);
      const result = await this.pkgManager.install(projectPath, `${name}@${version}`, true);
      if (!result.success) {
        return { success: false, error: `Failed to install ${name}: ${result.error}` };
      }
    }

    // 2. Copy template files
    if (mod.templates && mod.templates.length > 0) {
      onProgress?.('Scaffolding files...');
      for (const tmpl of mod.templates) {
        const srcPath = path.join(this.modulesDir, moduleId, 'templates', tmpl.src);
        const destPath = path.join(projectPath, tmpl.dest);

        if (fs.existsSync(srcPath)) {
          const destDir = path.dirname(destPath);
          fs.mkdirSync(destDir, { recursive: true });
          fs.copyFileSync(srcPath, destPath);
          onProgress?.(`  Created: ${tmpl.dest}`);
        }
      }
    }

    // 3. Update config
    if (mod.config && Object.keys(mod.config).length > 0) {
      onProgress?.('Updating packet.config.ts...');
      this.configMgr.updatePacketConfig(projectPath, mod.config);
    }

    // 4. Add env vars
    if (mod.envVars && Object.keys(mod.envVars).length > 0) {
      onProgress?.('Adding environment variables...');
      this.configMgr.appendEnvVars(projectPath, mod.envVars);
    }

    // 5. Mark module as installed
    this.markInstalled(projectPath, moduleId);

    onProgress?.(`Module "${mod.name}" installed successfully!`);
    return { success: true };
  }

  async removeModule(
    projectPath: string,
    moduleId: string
  ): Promise<{ success: boolean; error?: string }> {
    const mod = this.getModuleDefinition(moduleId);
    if (!mod) return { success: false, error: `Module "${moduleId}" not found` };

    // Remove template files
    for (const tmpl of mod.templates || []) {
      const destPath = path.join(projectPath, tmpl.dest);
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
    }

    // Remove from installed list
    this.markUninstalled(projectPath, moduleId);

    return { success: true };
  }

  getInstalledModules(projectPath: string): string[] {
    const metaPath = path.join(projectPath, '.packet', 'modules.json');
    try {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      return [];
    }
  }

  private markInstalled(projectPath: string, moduleId: string) {
    const metaDir = path.join(projectPath, '.packet');
    const metaPath = path.join(metaDir, 'modules.json');

    fs.mkdirSync(metaDir, { recursive: true });

    let installed: string[] = [];
    try {
      installed = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch { /* first install */ }

    if (!installed.includes(moduleId)) {
      installed.push(moduleId);
    }
    fs.writeFileSync(metaPath, JSON.stringify(installed, null, 2));
  }

  private markUninstalled(projectPath: string, moduleId: string) {
    const metaPath = path.join(projectPath, '.packet', 'modules.json');
    try {
      let installed: string[] = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      installed = installed.filter((id) => id !== moduleId);
      fs.writeFileSync(metaPath, JSON.stringify(installed, null, 2));
    } catch { /* nothing to remove */ }
  }

  async installPreset(
    projectPath: string,
    presetId: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    const presets = this.listPresets();
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return { success: false, error: `Preset "${presetId}" not found` };

    onProgress?.(`Installing preset: ${preset.name}`);

    for (const moduleId of preset.modules) {
      const result = await this.installModule(projectPath, moduleId, onProgress);
      if (!result.success) {
        return { success: false, error: `Failed during module "${moduleId}": ${result.error}` };
      }
    }

    onProgress?.(`Preset "${preset.name}" installed successfully!`);
    return { success: true };
  }
}
