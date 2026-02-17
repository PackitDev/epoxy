import { create } from 'zustand';

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

interface LicenseStore {
  // State
  isLicensed: boolean;
  isChecking: boolean;
  license: LicenseInfo | null;
  version: VersionInfo | null;
  error: string | null;
  machineId: string | null;

  // Actions
  checkLicense: () => Promise<boolean>;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => Promise<void>;
  setError: (error: string | null) => void;
}

const isElectron = typeof window !== 'undefined' && !!window.epoxy;

export const useLicenseStore = create<LicenseStore>((set, get) => ({
  isLicensed: false,
  isChecking: true,
  license: null,
  version: null,
  error: null,
  machineId: null,

  checkLicense: async () => {
    set({ isChecking: true, error: null });

    if (!isElectron) {
      // Dev mode - always licensed
      set({ isLicensed: true, isChecking: false });
      return true;
    }

    try {
      // Get machine ID
      const machineId = await window.epoxy.getMachineId();
      set({ machineId });

      // Check stored license
      const result = await window.epoxy.checkLicense();
      
      if (result.valid && result.license) {
        set({
          isLicensed: true,
          license: result.license,
          version: result.version || null,
          isChecking: false,
        });
        return true;
      } else {
        set({
          isLicensed: false,
          license: null,
          version: null,
          error: result.error || null,
          isChecking: false,
        });
        return false;
      }
    } catch (error) {
      set({
        isLicensed: false,
        error: error instanceof Error ? error.message : 'License check failed',
        isChecking: false,
      });
      return false;
    }
  },

  activateLicense: async (key: string) => {
    set({ isChecking: true, error: null });

    if (!isElectron) {
      set({ isLicensed: true, isChecking: false });
      return { success: true };
    }

    try {
      const result = await window.epoxy.activateLicense(key);
      
      if (result.success && result.license) {
        set({
          isLicensed: true,
          license: result.license,
          isChecking: false,
        });
        return { success: true };
      } else {
        set({
          isLicensed: false,
          error: result.error || 'Activation failed',
          isChecking: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Activation failed';
      set({
        isLicensed: false,
        error: errorMsg,
        isChecking: false,
      });
      return { success: false, error: errorMsg };
    }
  },

  deactivateLicense: async () => {
    if (isElectron) {
      await window.epoxy.deactivateLicense();
    }
    set({
      isLicensed: false,
      license: null,
      version: null,
      error: null,
    });
  },

  setError: (error) => set({ error }),
}));
