import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/project-store';
import {
  Settings,
  Key,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  FileCode,
  Database,
  Shield,
  Globe,
  Zap,
} from 'lucide-react';

interface EnvVar {
  key: string;
  value: string;
  category: 'database' | 'auth' | 'api' | 'server' | 'other';
  description?: string;
  isSecret?: boolean;
}

const ENV_CATEGORIES = [
  { id: 'database', name: 'Database', icon: Database, color: 'blue' },
  { id: 'auth', name: 'Authentication', icon: Shield, color: 'violet' },
  { id: 'api', name: 'API Keys', icon: Key, color: 'pink' },
  { id: 'server', name: 'Server', icon: Globe, color: 'green' },
  { id: 'other', name: 'Other', icon: Zap, color: 'orange' },
];

const COMMON_ENV_VARS: Partial<EnvVar>[] = [
  { key: 'DATABASE_URL', category: 'database', description: 'Database connection string', isSecret: true },
  { key: 'PORT', category: 'server', description: 'Server port', value: '3000' },
  { key: 'HOST', category: 'server', description: 'Server host', value: '0.0.0.0' },
  { key: 'NODE_ENV', category: 'server', description: 'Environment', value: 'development' },
  { key: 'CORS_ORIGIN', category: 'server', description: 'CORS allowed origins', value: '*' },
  { key: 'JWT_SECRET', category: 'auth', description: 'JWT signing secret', isSecret: true },
  { key: 'SESSION_SECRET', category: 'auth', description: 'Session secret', isSecret: true },
  { key: 'GOOGLE_CLIENT_ID', category: 'auth', description: 'Google OAuth client ID' },
  { key: 'GOOGLE_CLIENT_SECRET', category: 'auth', description: 'Google OAuth secret', isSecret: true },
  { key: 'GITHUB_CLIENT_ID', category: 'auth', description: 'GitHub OAuth client ID' },
  { key: 'GITHUB_CLIENT_SECRET', category: 'auth', description: 'GitHub OAuth secret', isSecret: true },
  { key: 'STRIPE_SECRET_KEY', category: 'api', description: 'Stripe secret key', isSecret: true },
  { key: 'STRIPE_WEBHOOK_SECRET', category: 'api', description: 'Stripe webhook secret', isSecret: true },
  { key: 'RESEND_API_KEY', category: 'api', description: 'Resend API key', isSecret: true },
  { key: 'REDIS_URL', category: 'database', description: 'Redis connection URL', isSecret: true },
];

export function Config() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'env' | 'config'>('env');

  useEffect(() => {
    if (activeProject && window.epoxy) {
      loadEnvVars();
    }
  }, [activeProject]);

  const loadEnvVars = async () => {
    if (!activeProject || !window.epoxy) return;

    try {
      const envData = await window.epoxy.readEnv(activeProject.path);
      const vars: EnvVar[] = Object.entries(envData).map(([key, value]) => {
        const common = COMMON_ENV_VARS.find((v) => v.key === key);
        return {
          key,
          value,
          category: common?.category || 'other',
          description: common?.description,
          isSecret: common?.isSecret || false,
        };
      });
      setEnvVars(vars);
    } catch (error) {
      console.error('Failed to load env vars:', error);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '', category: 'other' }]);
    setHasChanges(true);
  };

  const updateEnvVar = (index: number, updates: Partial<EnvVar>) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], ...updates };
    setEnvVars(updated);
    setHasChanges(true);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const saveEnvVars = async () => {
    if (!activeProject || !window.epoxy) return;

    setIsSaving(true);
    try {
      // Convert to .env format
      const envContent = envVars
        .filter((v) => v.key.trim())
        .map((v) => `${v.key}=${v.value}`)
        .join('\n');

      await window.epoxy.writeEnv(activeProject.path, envContent);

      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save env vars:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addCommonVar = (commonVar: Partial<EnvVar>) => {
    if (envVars.some((v) => v.key === commonVar.key)) return;
    setEnvVars([
      ...envVars,
      {
        key: commonVar.key || '',
        value: commonVar.value || '',
        category: commonVar.category || 'other',
        description: commonVar.description,
        isSecret: commonVar.isSecret,
      },
    ]);
    setHasChanges(true);
  };

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Settings size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Open a project to configure</p>
        </div>
      </div>
    );
  }

  const varsByCategory = ENV_CATEGORIES.map((cat) => ({
    ...cat,
    vars: envVars.filter((v) => v.category === cat.id),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Configuration</h1>
          <p className="text-sm text-white/40">
            Visual configuration for {activeProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadEnvVars}
            disabled={isSaving}
            className="btn-secondary text-xs py-2 flex items-center gap-1.5"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={saveEnvVars}
            disabled={!hasChanges || isSaving}
            className="btn-primary text-xs py-2 flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={12} />
                Saved!
              </>
            ) : (
              <>
                <Save size={12} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('env')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'env'
              ? 'text-white'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Environment Variables
          {activeTab === 'env' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'config'
              ? 'text-white'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Packet Config
          {activeTab === 'config' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          )}
        </button>
      </div>

      {activeTab === 'env' && (
        <>
          {/* Quick Add Common Variables */}
          <div className="card border-violet-500/20 bg-violet-500/5">
            <div className="flex items-start gap-3 mb-3">
              <Zap size={18} className="text-violet-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-white/90 text-sm mb-1">Quick Add</p>
                <p className="text-white/50 text-xs mb-3">
                  Add commonly used environment variables
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ENV_VARS.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => addCommonVar(v)}
                      disabled={envVars.some((ev) => ev.key === v.key)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 transition-colors"
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Environment Variables by Category */}
          {varsByCategory.map((category) => {
            if (category.vars.length === 0) return null;
            const Icon = category.icon;

            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={`text-${category.color}-400`} />
                  <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    {category.name}
                  </h2>
                </div>
                <div className="space-y-2">
                  {category.vars.map((envVar, idx) => {
                    const globalIdx = envVars.indexOf(envVar);
                    const isVisible = showSecrets.has(envVar.key);

                    return (
                      <div key={globalIdx} className="card">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={envVar.key}
                                onChange={(e) =>
                                  updateEnvVar(globalIdx, { key: e.target.value })
                                }
                                placeholder="VARIABLE_NAME"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
                              />
                              {envVar.isSecret && (
                                <button
                                  onClick={() => toggleSecretVisibility(envVar.key)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  {isVisible ? (
                                    <EyeOff size={14} className="text-white/40" />
                                  ) : (
                                    <Eye size={14} className="text-white/40" />
                                  )}
                                </button>
                              )}
                            </div>
                            <input
                              type={envVar.isSecret && !isVisible ? 'password' : 'text'}
                              value={envVar.value}
                              onChange={(e) =>
                                updateEnvVar(globalIdx, { value: e.target.value })
                              }
                              placeholder="value"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
                            />
                            {envVar.description && (
                              <p className="text-xs text-white/30">{envVar.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeEnvVar(globalIdx)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Uncategorized */}
          {envVars.filter((v) => !ENV_CATEGORIES.some((c) => c.id === v.category)).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Other
              </h2>
              <div className="space-y-2">
                {envVars
                  .map((v, idx) => ({ v, idx }))
                  .filter(({ v }) => !ENV_CATEGORIES.some((c) => c.id === v.category))
                  .map(({ v: envVar, idx }) => (
                    <div key={idx} className="card">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={envVar.key}
                            onChange={(e) => updateEnvVar(idx, { key: e.target.value })}
                            placeholder="VARIABLE_NAME"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
                          />
                          <input
                            type="text"
                            value={envVar.value}
                            onChange={(e) => updateEnvVar(idx, { value: e.target.value })}
                            placeholder="value"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
                          />
                        </div>
                        <button
                          onClick={() => removeEnvVar(idx)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Add Variable Button */}
          <button
            onClick={addEnvVar}
            className="w-full card border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 py-4"
          >
            <Plus size={16} className="text-white/40" />
            <span className="text-sm text-white/40">Add Variable</span>
          </button>

          {/* Warning */}
          {hasChanges && (
            <div className="card border-orange-500/20 bg-orange-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm text-white/70">
                  <p className="font-medium text-white/90 mb-1">Unsaved Changes</p>
                  <p className="text-white/50 text-xs">
                    Don't forget to save your changes before closing Epoxy
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'config' && (
        <div className="card text-center py-12">
          <FileCode size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm mb-2">Packet Config Editor</p>
          <p className="text-white/30 text-xs">Coming soon...</p>
        </div>
      )}
    </div>
  );
}
