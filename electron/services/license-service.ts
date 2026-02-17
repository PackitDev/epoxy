import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir, hostname, platform, arch, cpus } from 'os';
import { createHash } from 'crypto';

// ── Config ────────────────────────────────────────────────────
const LICENSE_CONFIG = {
  API_URL: process.env.PACKET_LICENSE_API || 'https://packet-backend.onrender.com',
  CACHE_DIR: '.packet',
  CACHE_FILE: 'epoxy-license.json',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  GRACE_PERIOD: 7 * 24 * 60 * 60 * 1000, // 7 days offline grace
  CURRENT_VERSION: '1.0.0-beta.1',
};

// ── Types ─────────────────────────────────────────────────────
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

export interface LicenseCache {
  key: string;
  license: LicenseInfo;
  version: VersionInfo;
  cachedAt: number;
  expiresAt: number;
  machineId: string;
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

// ── Machine ID ────────────────────────────────────────────────
function generateMachineId(): string {
  const info = [
    hostname(),
    platform(),
    arch(),
    cpus()[0]?.model || 'unknown',
    homedir(),
  ].join('|');
  
  return createHash('sha256').update(info).digest('hex').substring(0, 32);
}

// ── Cache ─────────────────────────────────────────────────────
function getCachePath(): string {
  return join(homedir(), LICENSE_CONFIG.CACHE_DIR, LICENSE_CONFIG.CACHE_FILE);
}

async function getCachedLicense(): Promise<LicenseCache | null> {
  try {
    const cachePath = getCachePath();
    const data = await readFile(cachePath, 'utf-8');
    const cache: LicenseCache = JSON.parse(data);

    // Check if cache is still valid and for this machine
    const machineId = generateMachineId();
    if (Date.now() < cache.expiresAt && cache.machineId === machineId) {
      return cache;
    }

    return null;
  } catch {
    return null;
  }
}

async function setCachedLicense(
  key: string,
  license: LicenseInfo,
  version: VersionInfo
): Promise<void> {
  try {
    const cacheDir = join(homedir(), LICENSE_CONFIG.CACHE_DIR);
    await mkdir(cacheDir, { recursive: true });

    const cache: LicenseCache = {
      key,
      license,
      version,
      cachedAt: Date.now(),
      expiresAt: Date.now() + LICENSE_CONFIG.CACHE_DURATION,
      machineId: generateMachineId(),
    };

    const cachePath = getCachePath();
    await writeFile(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn('Failed to cache license:', error);
  }
}

async function clearCachedLicense(): Promise<void> {
  try {
    const cachePath = getCachePath();
    await writeFile(cachePath, '{}');
  } catch {
    // Silently fail
  }
}

// ── Epoxy Key Validation ───────────────────────────────────────
const EPOXY_KEY_PREFIX = 'EPOXY-';

function isEpoxyKey(key: string): boolean {
  return typeof key === 'string' && key.trim().toUpperCase().startsWith(EPOXY_KEY_PREFIX);
}

// ── License Service ───────────────────────────────────────────
export class LicenseService {
  private machineId: string;

  constructor() {
    this.machineId = generateMachineId();
  }

  async validateLicense(key: string, skipCache = false): Promise<LicenseValidationResult> {
    const trimmedKey = key?.trim() || '';

    // Epoxy only accepts EPOXY- keys
    if (!isEpoxyKey(trimmedKey)) {
      return {
        valid: false,
        error: 'Enter an Epoxy license key (starts with EPOXY-). Get yours from the dashboard.',
      };
    }

    // Check cache first
    if (!skipCache) {
      const cached = await getCachedLicense();
      if (cached && cached.key === trimmedKey) {
        return {
          valid: true,
          license: cached.license,
          version: cached.version,
        };
      }
    }

    try {
      const response = await fetch(`${LICENSE_CONFIG.API_URL}/api/licenses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: trimmedKey,
          version: LICENSE_CONFIG.CURRENT_VERSION,
          product: 'epoxy',
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `License validation failed: ${response.statusText}`,
        };
      }

      const data = await response.json() as LicenseValidationResult;

      // Cache the result if valid
      if (data.valid && data.license && data.version) {
        await setCachedLicense(trimmedKey, data.license, data.version);
      }

      return data;
    } catch (error) {
      // If offline, check cache with grace period
      const cached = await getCachedLicense();
      if (cached && cached.key === trimmedKey) {
        const gracePeriodEnd = cached.cachedAt + LICENSE_CONFIG.GRACE_PERIOD;
        if (Date.now() < gracePeriodEnd) {
          return {
            valid: true,
            license: cached.license,
            version: cached.version,
          };
        }
      }

      return {
        valid: false,
        error: `License validation failed: ${error instanceof Error ? error.message : 'Network error'}`,
      };
    }
  }

  async activateLicense(key: string): Promise<LicenseActivationResult> {
    const trimmedKey = key?.trim() || '';

    if (!isEpoxyKey(trimmedKey)) {
      return {
        success: false,
        error: 'Enter an Epoxy license key (starts with EPOXY-). Get yours from the dashboard.',
      };
    }

    try {
      const response = await fetch(`${LICENSE_CONFIG.API_URL}/api/licenses/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: trimmedKey,
          machineId: this.machineId,
          version: LICENSE_CONFIG.CURRENT_VERSION,
          product: 'epoxy',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Activation failed: ${errorText}`,
        };
      }

      const data = await response.json() as LicenseActivationResult;

      // Cache the activated license
      if (data.success && data.license) {
        // Fetch version info
        try {
          const versionResponse = await fetch(
            `${LICENSE_CONFIG.API_URL}/api/versions/${LICENSE_CONFIG.CURRENT_VERSION}`
          );
          if (versionResponse.ok) {
            const version = await versionResponse.json() as VersionInfo;
            await setCachedLicense(trimmedKey, data.license, version);
          }
        } catch {
          // Still return success even if version fetch fails
        }
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: `Activation failed: ${error instanceof Error ? error.message : 'Network error'}`,
      };
    }
  }

  async deactivateLicense(): Promise<void> {
    await clearCachedLicense();
  }

  async checkStoredLicense(): Promise<LicenseValidationResult> {
    const cached = await getCachedLicense();
    
    if (!cached || !cached.key) {
      return { valid: false, error: 'No license found' };
    }

    // Validate the stored license
    return this.validateLicense(cached.key);
  }

  async getStoredKey(): Promise<string | null> {
    const cached = await getCachedLicense();
    return cached?.key || null;
  }

  getMachineId(): string {
    return this.machineId;
  }
}
