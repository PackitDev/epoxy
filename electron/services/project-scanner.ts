import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

export class ProjectScanner {
  private cache: ProjectInfo[] = [];

  async scanForProjects(): Promise<ProjectInfo[]> {
    const searchDirs = this.getSearchDirectories();
    const projects: ProjectInfo[] = [];

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      try {
        const found = await this.scanDirectory(dir, 3);
        projects.push(...found);
      } catch {
        // skip inaccessible directories
      }
    }

    this.cache = projects;
    return projects;
  }

  private getSearchDirectories(): string[] {
    const home = os.homedir();
    const dirs = [
      path.join(home, 'Desktop'),
      path.join(home, 'Documents'),
      path.join(home, 'Projects'),
      path.join(home, 'Dev'),
      path.join(home, 'dev'),
      path.join(home, 'Code'),
      path.join(home, 'code'),
      path.join(home, 'repos'),
      path.join(home, 'workspace'),
    ];

    // Also scan drive roots on Windows
    if (process.platform === 'win32') {
      for (const letter of ['C', 'D', 'E', 'S']) {
        dirs.push(`${letter}:\\Projects`);
        dirs.push(`${letter}:\\Dev`);
        dirs.push(`${letter}:\\Code`);
      }
    }

    return dirs;
  }

  private async scanDirectory(dir: string, depth: number): Promise<ProjectInfo[]> {
    if (depth <= 0) return [];
    const results: ProjectInfo[] = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      // Check if this directory is a Packet project
      const hasPacketConfig = entries.some(
        (e) => e.isFile() && e.name === 'packet.config.ts'
      );
      const hasPackageJson = entries.some(
        (e) => e.isFile() && e.name === 'package.json'
      );

      if (hasPacketConfig && hasPackageJson) {
        const info = await this.getProjectInfo(dir);
        if (info) results.push(info);
        return results; // Don't recurse into project directories
      }

      // Recurse into subdirectories
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        const subPath = path.join(dir, entry.name);
        const subResults = await this.scanDirectory(subPath, depth - 1);
        results.push(...subResults);
      }
    } catch {
      // Permission denied or other error
    }

    return results;
  }

  async getProjectInfo(projectPath: string): Promise<ProjectInfo | null> {
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(pkgPath)) return null;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const hasPacketConfig = fs.existsSync(path.join(projectPath, 'packet.config.ts'));
      const routeCount = this.countRoutes(path.join(projectPath, 'routes'));

      return {
        name: pkg.name || path.basename(projectPath),
        path: projectPath,
        version: pkg.version || '0.0.0',
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        scripts: pkg.scripts || {},
        hasPacketConfig,
        routeCount,
      };
    } catch {
      return null;
    }
  }

  private countRoutes(routesDir: string): number {
    if (!fs.existsSync(routesDir)) return 0;
    let count = 0;
    const scan = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            scan(path.join(dir, entry.name));
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
            count++;
          }
        }
      } catch { /* skip */ }
    };
    scan(routesDir);
    return count;
  }

  getCachedProjects(): ProjectInfo[] {
    return this.cache;
  }
}
