import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

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

export class PackageManagerService {
  async install(
    projectPath: string,
    packageName: string,
    isDev: boolean,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    const flag = isDev ? '--save-dev' : '--save';
    const cmd = `npm install ${packageName} ${flag} --ignore-scripts`;

    onProgress?.(`Installing ${packageName}...`);

    return new Promise((resolve) => {
      let stderrOutput = '';
      const child = exec(cmd, { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 });

      child.stdout?.on('data', (data: string) => {
        const msg = data.toString().trim();
        if (msg) onProgress?.(msg);
      });
      
      child.stderr?.on('data', (data: string) => {
        const msg = data.toString().trim();
        stderrOutput += msg + '\n';
        if (msg && !msg.startsWith('npm warn')) {
          onProgress?.(msg);
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          onProgress?.(`✓ Successfully installed ${packageName}`);
          resolve({ success: true });
        } else {
          const errorMsg = stderrOutput || `Exit code ${code}`;
          onProgress?.(`✗ Failed to install ${packageName}: ${errorMsg}`);
          resolve({ success: false, error: errorMsg });
        }
      });

      child.on('error', (err) => {
        onProgress?.(`✗ Error: ${err.message}`);
        resolve({ success: false, error: err.message });
      });
    });
  }

  async remove(
    projectPath: string,
    packageName: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    const cmd = `npm uninstall ${packageName}`;

    onProgress?.(`Removing ${packageName}...`);

    return new Promise((resolve) => {
      exec(cmd, { cwd: projectPath }, (error, _stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          onProgress?.(`Removed ${packageName}`);
          resolve({ success: true });
        }
      });
    });
  }

  list(projectPath: string): PackageInfo[] {
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const result: PackageInfo[] = [];

      for (const [name, version] of Object.entries(pkg.dependencies || {})) {
        result.push({ name, version: version as string, description: '', isDev: false });
      }
      for (const [name, version] of Object.entries(pkg.devDependencies || {})) {
        result.push({ name, version: version as string, description: '', isDev: true });
      }

      return result;
    } catch {
      return [];
    }
  }

  async search(query: string): Promise<NpmSearchResult[]> {
    if (!query || query.length < 2) return [];

    return new Promise((resolve) => {
      const url = `https://api.npms.io/v2/search?q=${encodeURIComponent(query)}&size=20`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const results: NpmSearchResult[] = (json.results || []).map((r: any) => ({
              name: r.package?.name || '',
              version: r.package?.version || '',
              description: r.package?.description || '',
              keywords: r.package?.keywords || [],
              downloads: r.score?.detail?.popularity || 0,
            }));
            resolve(results);
          } catch {
            resolve([]);
          }
        });
      }).on('error', () => resolve([]));
    });
  }
}
