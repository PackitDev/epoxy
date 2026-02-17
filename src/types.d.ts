export interface ProjectInfo {
  name: string;
  path: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  hasPacketConfig: boolean;
  routeCount: number;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  isDev: boolean;
}

export interface NpmSearchResult {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  downloads: number;
}

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

export interface LicenseInfo {
  key: string;
  version: string;
  status: 'free' | 'licensed' | 'expired' | 'invalid';
  isEarlyAccess: boolean;
  activations: number;
  maxActivations: number;
  expiresAt?: string;
}

export interface VersionInfo {
  version: string;
  status: 'beta' | 'current' | 'supported' | 'free' | 'legacy';
  price: number;
  features: string[];
  releaseDate: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: LicenseInfo;
  version?: VersionInfo;
  error?: string;
}

export interface LicenseActivationResult {
  success: boolean;
  license?: LicenseInfo;
  error?: string;
}

interface EpoxyAPI {
  scanProjects: () => Promise<ProjectInfo[]>;
  openProject: () => Promise<ProjectInfo | null>;
  getProjectInfo: (path: string) => Promise<ProjectInfo | null>;
  openInEditor: (path: string) => Promise<void>;
  openTerminal: (path: string) => Promise<void>;
  installPackage: (projectPath: string, name: string, isDev: boolean) => Promise<{ success: boolean; error?: string }>;
  removePackage: (projectPath: string, name: string) => Promise<{ success: boolean; error?: string }>;
  listPackages: (projectPath: string) => Promise<PackageInfo[]>;
  searchPackages: (query: string) => Promise<NpmSearchResult[]>;
  installModule: (projectPath: string, moduleId: string) => Promise<{ success: boolean; error?: string }>;
  removeModule: (projectPath: string, moduleId: string) => Promise<{ success: boolean; error?: string }>;
  listModules: () => Promise<ModuleDefinition[]>;
  getInstalledModules: (projectPath: string) => Promise<string[]>;
  listPresets: () => Promise<PresetDefinition[]>;
  installPreset: (projectPath: string, presetId: string) => Promise<{ success: boolean; error?: string }>;
  readConfig: (projectPath: string) => Promise<string | null>;
  readEnv: (projectPath: string) => Promise<Record<string, string>>;
  writeEnv: (projectPath: string, content: string) => Promise<boolean>;
  writeConfig: (projectPath: string, config: any) => Promise<boolean>;
  // License
  checkLicense: () => Promise<LicenseValidationResult>;
  activateLicense: (key: string) => Promise<LicenseActivationResult>;
  validateLicense: (key: string) => Promise<LicenseValidationResult>;
  deactivateLicense: () => Promise<{ success: boolean }>;
  getStoredKey: () => Promise<string | null>;
  getMachineId: () => Promise<string>;
  // Events
  onPackageProgress: (cb: (msg: string) => void) => () => void;
  onModuleProgress: (cb: (msg: string) => void) => () => void;
}

declare global {
  interface Window {
    epoxy: EpoxyAPI;
  }
}
