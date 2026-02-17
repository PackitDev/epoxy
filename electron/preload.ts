import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Project
  scanProjects: () => ipcRenderer.invoke('project:scan'),
  openProject: () => ipcRenderer.invoke('project:open'),
  getProjectInfo: (path: string) => ipcRenderer.invoke('project:getInfo', path),
  openInEditor: (path: string) => ipcRenderer.invoke('project:openInEditor', path),
  openTerminal: (path: string) => ipcRenderer.invoke('project:openTerminal', path),

  // Packages
  installPackage: (projectPath: string, name: string, isDev: boolean) =>
    ipcRenderer.invoke('package:install', projectPath, name, isDev),
  removePackage: (projectPath: string, name: string) =>
    ipcRenderer.invoke('package:remove', projectPath, name),
  listPackages: (projectPath: string) =>
    ipcRenderer.invoke('package:list', projectPath),
  searchPackages: (query: string) =>
    ipcRenderer.invoke('package:search', query),

  // Modules
  installModule: (projectPath: string, moduleId: string) =>
    ipcRenderer.invoke('module:install', projectPath, moduleId),
  removeModule: (projectPath: string, moduleId: string) =>
    ipcRenderer.invoke('module:remove', projectPath, moduleId),
  listModules: () => ipcRenderer.invoke('module:list'),
  getInstalledModules: (projectPath: string) =>
    ipcRenderer.invoke('module:getInstalled', projectPath),

  // Presets
  listPresets: () => ipcRenderer.invoke('preset:list'),
  installPreset: (projectPath: string, presetId: string) =>
    ipcRenderer.invoke('preset:install', projectPath, presetId),

  // Config
  readConfig: (projectPath: string) => ipcRenderer.invoke('config:read', projectPath),
  readEnv: (projectPath: string) => ipcRenderer.invoke('config:readEnv', projectPath),
  writeEnv: (projectPath: string, content: string) => ipcRenderer.invoke('config:writeEnv', projectPath, content),
  writeConfig: (projectPath: string, config: any) => ipcRenderer.invoke('config:writeConfig', projectPath, config),

  // License
  checkLicense: () => ipcRenderer.invoke('license:check'),
  activateLicense: (key: string) => ipcRenderer.invoke('license:activate', key),
  validateLicense: (key: string) => ipcRenderer.invoke('license:validate', key),
  deactivateLicense: () => ipcRenderer.invoke('license:deactivate'),
  getStoredKey: () => ipcRenderer.invoke('license:getStoredKey'),
  getMachineId: () => ipcRenderer.invoke('license:getMachineId'),

  // Events
  onPackageProgress: (cb: (msg: string) => void) => {
    const handler = (_e: any, msg: string) => cb(msg);
    ipcRenderer.on('package:progress', handler);
    return () => ipcRenderer.removeListener('package:progress', handler);
  },
  onModuleProgress: (cb: (msg: string) => void) => {
    const handler = (_e: any, msg: string) => cb(msg);
    ipcRenderer.on('module:progress', handler);
    return () => ipcRenderer.removeListener('module:progress', handler);
  },
};

contextBridge.exposeInMainWorld('epoxy', api);

export type EpoxyAPI = typeof api;
