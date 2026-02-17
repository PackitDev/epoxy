import * as fs from 'fs';
import * as path from 'path';

export class ConfigManager {
  readConfig(projectPath: string): string | null {
    const configPath = path.join(projectPath, 'packet.config.ts');
    try {
      return fs.readFileSync(configPath, 'utf-8');
    } catch {
      return null;
    }
  }

  writeConfig(projectPath: string, content: string): boolean {
    const configPath = path.join(projectPath, 'packet.config.ts');
    try {
      fs.writeFileSync(configPath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  readEnv(projectPath: string): Record<string, string> {
    const envPath = path.join(projectPath, '.env');
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      const result: Record<string, string> = {};
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          result[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
        }
      }
      return result;
    } catch {
      return {};
    }
  }

  writeEnv(projectPath: string, content: string): boolean {
    const envPath = path.join(projectPath, '.env');
    try {
      fs.writeFileSync(envPath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  appendEnvVars(projectPath: string, vars: Record<string, string>): boolean {
    const envPath = path.join(projectPath, '.env');
    try {
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
      }

      const existing = this.readEnv(projectPath);
      const newLines: string[] = [];

      for (const [key, value] of Object.entries(vars)) {
        if (!(key in existing)) {
          newLines.push(`${key}=${value}`);
        }
      }

      if (newLines.length > 0) {
        if (content && !content.endsWith('\n')) content += '\n';
        content += '\n# Added by Epoxy\n' + newLines.join('\n') + '\n';
        fs.writeFileSync(envPath, content, 'utf-8');
      }

      return true;
    } catch {
      return false;
    }
  }

  updatePacketConfig(projectPath: string, moduleConfig: Record<string, any>): boolean {
    let config = this.readConfig(projectPath);
    if (!config) return false;

    // Simple approach: append module config before the closing export
    // This is a basic implementation; a full AST-based approach would be more robust
    for (const [key, value] of Object.entries(moduleConfig)) {
      const configStr = JSON.stringify(value, null, 2).replace(/"/g, "'");
      if (!config.includes(`${key}:`)) {
        // Add to the export default object
        const lastBrace = config.lastIndexOf('};');
        if (lastBrace > -1) {
          config = config.slice(0, lastBrace) + `  ${key}: ${configStr},\n` + config.slice(lastBrace);
        }
      }
    }

    return this.writeConfig(projectPath, config);
  }
}
