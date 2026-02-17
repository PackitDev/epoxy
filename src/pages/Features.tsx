import { useState } from 'react';
import { useProjectStore } from '../stores/project-store';
import {
  Database,
  Shield,
  Mail,
  CreditCard,
  Zap,
  Radio,
  ShieldAlert,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
} from 'lucide-react';

interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'core' | 'database' | 'auth' | 'integrations' | 'utilities';
  dependencies: string[];
  devDependencies: string[];
  envVars: Record<string, string>;
  configChanges?: Record<string, any>;
}

const FEATURES: FeatureDefinition[] = [
  // Database
  {
    id: 'database-postgres',
    name: 'PostgreSQL',
    description: 'PostgreSQL database with pg driver',
    icon: Database,
    category: 'database',
    dependencies: ['pg@^8.11.3'],
    devDependencies: ['@types/pg@^8.10.9'],
    envVars: {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/mydb',
    },
  },
  {
    id: 'database-mysql',
    name: 'MySQL',
    description: 'MySQL database with mysql2 driver',
    icon: Database,
    category: 'database',
    dependencies: ['mysql2@^3.7.0'],
    devDependencies: [],
    envVars: {
      DATABASE_URL: 'mysql://user:password@localhost:3306/mydb',
    },
  },
  {
    id: 'database-sqlite',
    name: 'SQLite',
    description: 'SQLite database for development',
    icon: Database,
    category: 'database',
    dependencies: ['better-sqlite3@^9.4.3'],
    devDependencies: ['@types/better-sqlite3@^7.6.8'],
    envVars: {
      DATABASE_URL: 'file:./dev.db',
    },
  },
  {
    id: 'database-mongodb',
    name: 'MongoDB',
    description: 'MongoDB NoSQL database',
    icon: Database,
    category: 'database',
    dependencies: ['mongodb@^6.3.0'],
    devDependencies: [],
    envVars: {
      DATABASE_URL: 'mongodb://localhost:27017/mydb',
    },
  },
  // Auth
  {
    id: 'auth-jwt',
    name: 'JWT Authentication',
    description: 'Stateless JWT auth with bcrypt',
    icon: Shield,
    category: 'auth',
    dependencies: ['jsonwebtoken@^9.0.2', 'bcrypt@^5.1.1'],
    devDependencies: ['@types/jsonwebtoken@^9.0.5', '@types/bcrypt@^5.0.2'],
    envVars: {
      JWT_SECRET: 'change-this-to-a-random-secret-string',
    },
  },
  {
    id: 'auth-session',
    name: 'Session Auth',
    description: 'Session-based authentication',
    icon: Shield,
    category: 'auth',
    dependencies: ['express-session@^1.17.3'],
    devDependencies: ['@types/express-session@^1.17.10'],
    envVars: {
      SESSION_SECRET: 'change-this-to-a-random-secret-string',
    },
  },
  {
    id: 'auth-oauth',
    name: 'OAuth',
    description: 'OAuth with Google & GitHub',
    icon: Shield,
    category: 'auth',
    dependencies: [
      'passport@^0.7.0',
      'passport-google-oauth20@^2.0.0',
      'passport-github2@^0.1.12',
    ],
    devDependencies: ['@types/passport@^1.0.16'],
    envVars: {
      GOOGLE_CLIENT_ID: 'your-google-client-id',
      GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
      GITHUB_CLIENT_ID: 'your-github-client-id',
      GITHUB_CLIENT_SECRET: 'your-github-client-secret',
    },
  },
  // Integrations
  {
    id: 'stripe-payments',
    name: 'Stripe Payments',
    description: 'Payment processing with Stripe',
    icon: CreditCard,
    category: 'integrations',
    dependencies: ['stripe@^14.14.0'],
    devDependencies: [],
    envVars: {
      STRIPE_SECRET_KEY: 'sk_test_...',
      STRIPE_WEBHOOK_SECRET: 'whsec_...',
    },
  },
  {
    id: 'email-resend',
    name: 'Resend Email',
    description: 'Transactional email with Resend',
    icon: Mail,
    category: 'integrations',
    dependencies: ['resend@^3.1.0'],
    devDependencies: [],
    envVars: {
      RESEND_API_KEY: 're_...',
    },
  },
  // Utilities
  {
    id: 'cache-redis',
    name: 'Redis Cache',
    description: 'Fast caching with Redis',
    icon: Zap,
    category: 'utilities',
    dependencies: ['ioredis@^5.3.2'],
    devDependencies: [],
    envVars: {
      REDIS_URL: 'redis://localhost:6379',
    },
  },
  {
    id: 'websockets',
    name: 'WebSockets',
    description: 'Real-time with Socket.IO',
    icon: Radio,
    category: 'utilities',
    dependencies: ['socket.io@^4.7.4'],
    devDependencies: [],
    envVars: {},
  },
  {
    id: 'rate-limiting',
    name: 'Rate Limiting',
    description: 'API rate limiting protection',
    icon: ShieldAlert,
    category: 'utilities',
    dependencies: ['express-rate-limit@^7.1.5'],
    devDependencies: [],
    envVars: {},
  },
  {
    id: 'cors-advanced',
    name: 'Advanced CORS',
    description: 'Fine-grained CORS control',
    icon: Globe,
    category: 'utilities',
    dependencies: [],
    devDependencies: [],
    envVars: {
      CORS_ORIGIN: 'https://yourdomain.com',
      CORS_CREDENTIALS: 'true',
    },
  },
];

const CATEGORIES = [
  { id: 'database', name: 'Database', color: 'blue' },
  { id: 'auth', name: 'Authentication', color: 'violet' },
  { id: 'integrations', name: 'Integrations', color: 'pink' },
  { id: 'utilities', name: 'Utilities', color: 'orange' },
];

export function Features() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const packages = useProjectStore((s) => s.packages);
  const installPackage = useProjectStore((s) => s.installPackage);
  const removePackage = useProjectStore((s) => s.removePackage);
  const [togglingFeatures, setTogglingFeatures] = useState<Set<string>>(new Set());

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Open a project to manage features</p>
        </div>
      </div>
    );
  }

  const installedPackageNames = new Set(packages.map((p) => p.name));

  const isFeatureEnabled = (feature: FeatureDefinition): boolean => {
    // Check if all dependencies are installed
    return feature.dependencies.every((dep) => {
      const pkgName = dep.split('@')[0];
      return installedPackageNames.has(pkgName);
    });
  };

  const toggleFeature = async (feature: FeatureDefinition) => {
    const enabled = isFeatureEnabled(feature);
    setTogglingFeatures((prev) => new Set(prev).add(feature.id));

    try {
      if (enabled) {
        // Remove all dependencies
        for (const dep of feature.dependencies) {
          const pkgName = dep.split('@')[0];
          await removePackage(pkgName);
        }
        for (const dep of feature.devDependencies) {
          const pkgName = dep.split('@')[0];
          await removePackage(pkgName);
        }
      } else {
        // Install all dependencies
        for (const dep of feature.dependencies) {
          await installPackage(dep, false);
        }
        for (const dep of feature.devDependencies) {
          await installPackage(dep, true);
        }
      }
    } finally {
      setTogglingFeatures((prev) => {
        const next = new Set(prev);
        next.delete(feature.id);
        return next;
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Feature Toggles</h1>
        <p className="text-sm text-white/40">
          Enable or disable Packet SDK features for {activeProject.name}
        </p>
      </div>

      {/* Info Banner */}
      <div className="card border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-white/70">
            <p className="font-medium text-white/90 mb-1">How it works</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Toggle features on/off to automatically install or remove their dependencies. 
              This helps you keep your project lean by only including what you need.
            </p>
          </div>
        </div>
      </div>

      {/* Features by Category */}
      {CATEGORIES.map((category) => {
        const categoryFeatures = FEATURES.filter((f) => f.category === category.id);
        if (categoryFeatures.length === 0) return null;

        return (
          <div key={category.id}>
            <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categoryFeatures.map((feature) => {
                const enabled = isFeatureEnabled(feature);
                const toggling = togglingFeatures.has(feature.id);
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.id}
                    className={`card transition-all ${
                      enabled
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            enabled
                              ? 'bg-green-500/20'
                              : `bg-${category.color}-500/10`
                          }`}
                        >
                          <Icon
                            size={18}
                            className={enabled ? 'text-green-400' : `text-${category.color}-400`}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{feature.name}</h3>
                          <p className="text-xs text-white/40 mt-0.5">{feature.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFeature(feature)}
                        disabled={toggling}
                        className={`shrink-0 w-12 h-6 rounded-full transition-all relative ${
                          enabled
                            ? 'bg-green-500'
                            : 'bg-white/10 hover:bg-white/20'
                        } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all flex items-center justify-center ${
                            enabled ? 'left-[26px]' : 'left-0.5'
                          }`}
                        >
                          {toggling ? (
                            <Loader2 size={12} className="text-gray-600 animate-spin" />
                          ) : enabled ? (
                            <CheckCircle2 size={12} className="text-green-600" />
                          ) : (
                            <XCircle size={12} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Dependencies */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                        Dependencies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {[...feature.dependencies, ...feature.devDependencies].map((dep) => {
                          const pkgName = dep.split('@')[0];
                          return (
                            <span
                              key={dep}
                              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono"
                            >
                              {pkgName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Env Vars */}
                    {Object.keys(feature.envVars).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
                          Environment Variables
                        </p>
                        <div className="space-y-0.5">
                          {Object.keys(feature.envVars).map((key) => (
                            <p key={key} className="text-[10px] text-white/40 font-mono">
                              {key}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
