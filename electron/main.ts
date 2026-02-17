import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ProjectScanner } from './services/project-scanner.js';
import { PackageManagerService } from './services/package-manager.js';
import { ModuleScaffolder } from './services/module-scaffolder.js';
import { ConfigManager } from './services/config-manager.js';
import { LicenseService } from './services/license-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const scanner = new ProjectScanner();
const pkgManager = new PackageManagerService();
const scaffolder = new ModuleScaffolder();
const configMgr = new ConfigManager();
const licenseService = new LicenseService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#666',
      height: 36,
    },
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ─────────────────────────────────────────────

// Project
ipcMain.handle('project:scan', async () => {
  return scanner.scanForProjects();
});

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Open Packet Project',
  });
  if (result.canceled || !result.filePaths.length) return null;
  const projectPath = result.filePaths[0];
  return scanner.getProjectInfo(projectPath);
});

ipcMain.handle('project:getInfo', async (_e, projectPath: string) => {
  return scanner.getProjectInfo(projectPath);
});

ipcMain.handle('project:openInEditor', async (_e, projectPath: string) => {
  shell.openPath(projectPath);
});

ipcMain.handle('project:openTerminal', async (_e, projectPath: string) => {
  const { exec } = require('child_process');
  if (process.platform === 'win32') {
    exec(`start cmd /k "cd /d ${projectPath}"`, { cwd: projectPath });
  } else if (process.platform === 'darwin') {
    exec(`open -a Terminal "${projectPath}"`);
  } else {
    exec(`x-terminal-emulator --working-directory="${projectPath}"`);
  }
});

// Packages
ipcMain.handle('package:install', async (_e, projectPath: string, packageName: string, isDev: boolean) => {
  return pkgManager.install(projectPath, packageName, isDev, (progress: string) => {
    mainWindow?.webContents.send('package:progress', progress);
  });
});

ipcMain.handle('package:remove', async (_e, projectPath: string, packageName: string) => {
  return pkgManager.remove(projectPath, packageName, (progress: string) => {
    mainWindow?.webContents.send('package:progress', progress);
  });
});

ipcMain.handle('package:list', async (_e, projectPath: string) => {
  return pkgManager.list(projectPath);
});

ipcMain.handle('package:search', async (_e, query: string) => {
  return pkgManager.search(query);
});

// Modules
ipcMain.handle('module:install', async (_e, projectPath: string, moduleId: string) => {
  return scaffolder.installModule(projectPath, moduleId, (progress: string) => {
    mainWindow?.webContents.send('module:progress', progress);
  });
});

ipcMain.handle('module:remove', async (_e, projectPath: string, moduleId: string) => {
  return scaffolder.removeModule(projectPath, moduleId);
});

ipcMain.handle('module:list', async () => {
  return scaffolder.listModules();
});

ipcMain.handle('module:getInstalled', async (_e, projectPath: string) => {
  return scaffolder.getInstalledModules(projectPath);
});

// Presets
ipcMain.handle('preset:list', async () => {
  return scaffolder.listPresets();
});

ipcMain.handle('preset:install', async (_e, projectPath: string, presetId: string) => {
  return scaffolder.installPreset(projectPath, presetId, (progress: string) => {
    mainWindow?.webContents.send('module:progress', progress);
  });
});

// Config
ipcMain.handle('config:read', async (_e, projectPath: string) => {
  return configMgr.readConfig(projectPath);
});

ipcMain.handle('config:readEnv', async (_e, projectPath: string) => {
  return configMgr.readEnv(projectPath);
});

ipcMain.handle('config:writeEnv', async (_e, projectPath: string, content: string) => {
  return configMgr.writeEnv(projectPath, content);
});

ipcMain.handle('config:writeConfig', async (_e, projectPath: string, config: any) => {
  return configMgr.writeConfig(projectPath, config);
});

// License
ipcMain.handle('license:check', async () => {
  return licenseService.checkStoredLicense();
});

ipcMain.handle('license:activate', async (_e, key: string) => {
  return licenseService.activateLicense(key);
});

ipcMain.handle('license:validate', async (_e, key: string) => {
  return licenseService.validateLicense(key, true);
});

ipcMain.handle('license:deactivate', async () => {
  await licenseService.deactivateLicense();
  return { success: true };
});

ipcMain.handle('license:getStoredKey', async () => {
  return licenseService.getStoredKey();
});

ipcMain.handle('license:getMachineId', async () => {
  return licenseService.getMachineId();
});

// ── App lifecycle ────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
