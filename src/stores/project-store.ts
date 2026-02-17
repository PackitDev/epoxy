import { create } from 'zustand';
import type { ProjectInfo, ModuleDefinition, PresetDefinition, PackageInfo, NpmSearchResult } from '../types';

interface ProjectStore {
  // State
  projects: ProjectInfo[];
  activeProject: ProjectInfo | null;
  packages: PackageInfo[];
  modules: ModuleDefinition[];
  presets: PresetDefinition[];
  installedModules: string[];
  statusMessage: string;
  isLoading: boolean;
  currentPage: 'dashboard' | 'features' | 'config' | 'packages' | 'modules' | 'presets';
  searchResults: NpmSearchResult[];

  // Actions
  setProjects: (projects: ProjectInfo[]) => void;
  setActiveProject: (project: ProjectInfo | null) => void;
  setPackages: (packages: PackageInfo[]) => void;
  setModules: (modules: ModuleDefinition[]) => void;
  setPresets: (presets: PresetDefinition[]) => void;
  setInstalledModules: (ids: string[]) => void;
  setStatusMessage: (msg: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: 'dashboard' | 'features' | 'config' | 'packages' | 'modules' | 'presets') => void;
  setSearchResults: (results: NpmSearchResult[]) => void;

  // Async actions
  scanProjects: () => Promise<void>;
  openProject: () => Promise<void>;
  selectProject: (project: ProjectInfo) => Promise<void>;
  refreshProject: () => Promise<void>;
  installPackage: (name: string, isDev: boolean) => Promise<boolean>;
  removePackage: (name: string) => Promise<boolean>;
  searchPackages: (query: string) => Promise<void>;
  installModule: (moduleId: string) => Promise<boolean>;
  removeModule: (moduleId: string) => Promise<boolean>;
  installPreset: (presetId: string) => Promise<boolean>;
  loadModulesAndPresets: () => Promise<void>;
}

const isElectron = typeof window !== 'undefined' && !!window.epoxy;

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProject: null,
  packages: [],
  modules: [],
  presets: [],
  installedModules: [],
  statusMessage: 'Ready',
  isLoading: false,
  currentPage: 'dashboard',
  searchResults: [],

  setProjects: (projects) => set({ projects }),
  setActiveProject: (project) => set({ activeProject: project }),
  setPackages: (packages) => set({ packages }),
  setModules: (modules) => set({ modules }),
  setPresets: (presets) => set({ presets }),
  setInstalledModules: (ids) => set({ installedModules: ids }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchResults: (results) => set({ searchResults: results }),

  scanProjects: async () => {
    if (!isElectron) return;
    set({ isLoading: true, statusMessage: 'Scanning for projects...' });
    try {
      const projects = await window.epoxy.scanProjects();
      set({ projects, statusMessage: `Found ${projects.length} project(s)` });
    } catch {
      set({ statusMessage: 'Failed to scan projects' });
    } finally {
      set({ isLoading: false });
    }
  },

  openProject: async () => {
    console.log('openProject called, isElectron:', isElectron);
    console.log('window.epoxy:', window.epoxy);
    if (!isElectron) {
      console.log('Not in Electron, returning');
      return;
    }
    console.log('Calling window.epoxy.openProject()');
    const project = await window.epoxy.openProject();
    console.log('Project returned:', project);
    if (project) {
      get().selectProject(project);
    }
  },

  selectProject: async (project) => {
    set({ activeProject: project, isLoading: true, statusMessage: `Loading ${project.name}...` });

    if (isElectron) {
      try {
        const packages = await window.epoxy.listPackages(project.path);
        const installedModules = await window.epoxy.getInstalledModules(project.path);
        set({ packages, installedModules });
      } catch { /* fallback */ }
    } else {
      const packages: PackageInfo[] = [];
      for (const [name, version] of Object.entries(project.dependencies || {})) {
        packages.push({ name, version, description: '', isDev: false });
      }
      for (const [name, version] of Object.entries(project.devDependencies || {})) {
        packages.push({ name, version, description: '', isDev: true });
      }
      set({ packages });
    }

    set({ isLoading: false, statusMessage: `Project loaded: ${project.name}` });
  },

  refreshProject: async () => {
    const { activeProject } = get();
    if (!activeProject) return;
    if (isElectron) {
      const info = await window.epoxy.getProjectInfo(activeProject.path);
      if (info) get().selectProject(info);
    }
  },

  installPackage: async (name, isDev) => {
    const { activeProject } = get();
    if (!activeProject) return false;

    set({ isLoading: true, statusMessage: `Installing ${name}...` });

    if (isElectron) {
      const result = await window.epoxy.installPackage(activeProject.path, name, isDev);
      if (result.success) {
        await get().refreshProject();
        set({ statusMessage: `Installed ${name}` });
        return true;
      } else {
        set({ statusMessage: `Failed: ${result.error}`, isLoading: false });
        return false;
      }
    }

    // Dev mode mock
    await new Promise((r) => setTimeout(r, 1500));
    set({ statusMessage: `Installed ${name} (mock)`, isLoading: false });
    return true;
  },

  removePackage: async (name) => {
    const { activeProject } = get();
    if (!activeProject) return false;

    set({ isLoading: true, statusMessage: `Removing ${name}...` });

    if (isElectron) {
      const result = await window.epoxy.removePackage(activeProject.path, name);
      if (result.success) {
        await get().refreshProject();
        set({ statusMessage: `Removed ${name}` });
        return true;
      } else {
        set({ statusMessage: `Failed: ${result.error}`, isLoading: false });
        return false;
      }
    }

    await new Promise((r) => setTimeout(r, 1000));
    set({ statusMessage: `Removed ${name} (mock)`, isLoading: false });
    return true;
  },

  searchPackages: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return;
    }

    if (isElectron) {
      const results = await window.epoxy.searchPackages(query);
      set({ searchResults: results });
    } else {
      // Dev mode: fetch from npms.io directly
      try {
        const res = await fetch(`https://api.npms.io/v2/search?q=${encodeURIComponent(query)}&size=20`);
        const data = await res.json();
        const results = (data.results || []).map((r: any) => ({
          name: r.package?.name || '',
          version: r.package?.version || '',
          description: r.package?.description || '',
          keywords: r.package?.keywords || [],
          downloads: r.score?.detail?.popularity || 0,
        }));
        set({ searchResults: results });
      } catch {
        set({ searchResults: [] });
      }
    }
  },

  installModule: async (moduleId) => {
    const { activeProject } = get();
    if (!activeProject) return false;

    set({ isLoading: true, statusMessage: `Installing module: ${moduleId}...` });

    if (isElectron) {
      const result = await window.epoxy.installModule(activeProject.path, moduleId);
      if (result.success) {
        const installed = await window.epoxy.getInstalledModules(activeProject.path);
        set({ installedModules: installed, statusMessage: `Module "${moduleId}" installed!`, isLoading: false });
        await get().refreshProject();
        return true;
      } else {
        set({ statusMessage: `Failed: ${result.error}`, isLoading: false });
        return false;
      }
    }

    await new Promise((r) => setTimeout(r, 2000));
    set((s) => ({
      installedModules: [...s.installedModules, moduleId],
      statusMessage: `Module "${moduleId}" installed (mock)`,
      isLoading: false,
    }));
    return true;
  },

  removeModule: async (moduleId) => {
    const { activeProject } = get();
    if (!activeProject) return false;

    set({ isLoading: true, statusMessage: `Removing module: ${moduleId}...` });

    if (isElectron) {
      const result = await window.epoxy.removeModule(activeProject.path, moduleId);
      if (result.success) {
        const installed = await window.epoxy.getInstalledModules(activeProject.path);
        set({ installedModules: installed, statusMessage: `Module "${moduleId}" removed`, isLoading: false });
        return true;
      }
    }

    set((s) => ({
      installedModules: s.installedModules.filter((id) => id !== moduleId),
      statusMessage: `Module "${moduleId}" removed (mock)`,
      isLoading: false,
    }));
    return true;
  },

  installPreset: async (presetId) => {
    const { activeProject } = get();
    if (!activeProject) return false;

    set({ isLoading: true, statusMessage: `Installing preset: ${presetId}...` });

    if (isElectron) {
      const result = await window.epoxy.installPreset(activeProject.path, presetId);
      if (result.success) {
        const installed = await window.epoxy.getInstalledModules(activeProject.path);
        set({ installedModules: installed, statusMessage: `Preset "${presetId}" installed!`, isLoading: false });
        await get().refreshProject();
        return true;
      } else {
        set({ statusMessage: `Failed: ${result.error}`, isLoading: false });
        return false;
      }
    }

    await new Promise((r) => setTimeout(r, 3000));
    const preset = get().presets.find((p) => p.id === presetId);
    if (preset) {
      set((s) => ({
        installedModules: [...new Set([...s.installedModules, ...preset.modules])],
        statusMessage: `Preset "${presetId}" installed (mock)`,
        isLoading: false,
      }));
    }
    return true;
  },

  loadModulesAndPresets: async () => {
    if (isElectron) {
      const [modules, presets] = await Promise.all([
        window.epoxy.listModules(),
        window.epoxy.listPresets(),
      ]);
      set({ modules, presets });
    } else {
      // Dev mode: load from bundled registry
      try {
        const res = await fetch('/modules/registry.json');
        const registry = await res.json();
        set({ modules: registry.modules || [], presets: registry.presets || [] });
      } catch {
        // Inline fallback for dev
        set({
          modules: [
            { id: 'auth-jwt', name: 'JWT Authentication', description: 'Stateless JWT auth with bcrypt password hashing', category: 'auth', icon: 'shield', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'database-postgres', name: 'PostgreSQL Database', description: 'PostgreSQL with pg driver and connection pooling', category: 'database', icon: 'database', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'database-prisma', name: 'Prisma ORM', description: 'Type-safe database access with auto-generated client', category: 'database', icon: 'database', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'react-frontend', name: 'React Frontend', description: 'React 18 + Vite frontend with Tailwind CSS', category: 'frontend', icon: 'layout', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'stripe-payments', name: 'Stripe Payments', description: 'Checkout sessions, webhooks, and subscriptions', category: 'payments', icon: 'credit-card', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'email-resend', name: 'Resend Email', description: 'Transactional email for welcome, reset, notifications', category: 'utilities', icon: 'mail', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'cache-redis', name: 'Redis Cache', description: 'Fast caching, session storage, and rate limiting', category: 'utilities', icon: 'zap', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'websockets', name: 'WebSockets', description: 'Real-time with Socket.IO for live updates', category: 'utilities', icon: 'radio', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
            { id: 'rate-limiting', name: 'Rate Limiting', description: 'Protect your API with configurable rate limiting', category: 'utilities', icon: 'shield-alert', dependencies: {}, devDependencies: {}, config: {}, envVars: {}, templates: [] },
          ],
          presets: [
            { id: 'saas-starter', name: 'SaaS Starter', description: 'Auth + DB + Payments + Email', icon: 'rocket', modules: ['auth-jwt', 'database-postgres', 'stripe-payments', 'email-resend'] },
            { id: 'api-backend', name: 'API Backend', description: 'Auth + DB + Rate Limiting', icon: 'server', modules: ['auth-jwt', 'database-postgres', 'rate-limiting'] },
            { id: 'realtime-app', name: 'Real-time App', description: 'Auth + DB + WebSockets + Redis', icon: 'radio', modules: ['auth-jwt', 'database-postgres', 'websockets', 'cache-redis'] },
          ],
        });
      }
    }
  },
}));
