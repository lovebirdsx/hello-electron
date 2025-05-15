import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shouldWaitForRendererDebugger = process.argv.includes('--wait-for-renderer-debugger');

const defalutWindowConfig = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  showDevTools: false,
}

function saveWindowState(section, window) {
  const bounds = window.getBounds();
  storage.write(section, 'config', {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    showDevTools: window.webContents.isDevToolsOpened(),
  });
}

async function openWindow(htmlFileName, windowConfig = {}) {
  const state = storage.read(htmlFileName, 'config', defalutWindowConfig);
  const newWindow = new BrowserWindow({
    ...state,
    ...windowConfig,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // sandbox: false,
    }
  });

  if (state.showDevTools) {
    newWindow.webContents.openDevTools();
  }

  if (shouldWaitForRendererDebugger && htmlFileName === 'index.html') {
    console.log(`[Main Process] --wait-for-renderer-debugger active for ${htmlFileName}`);
    console.log(`[Main Process] Opening DevTools in detached mode and attaching internal debugger...`);

    // newWindow.webContents.openDevTools({ mode: 'detach' });

    try {
      newWindow.webContents.debugger.attach('1.3');
      console.log('[Main Process] Internal debugger attached. Enabling and pausing renderer...');

      newWindow.webContents.debugger.sendCommand('Debugger.enable').catch(err => {
        console.error(`[Main Process] CRITICAL: Failed to enable debugger for ${htmlFileName}:`, err);
      });
      newWindow.webContents.debugger.sendCommand('Debugger.pause').catch(err => {
        console.error(`[Main Process] CRITICAL: Failed to pause debugger for ${htmlFileName}:`, err);
      });
      console.log(`[Main Process] Renderer for ${htmlFileName} is PAUSED. Attach VS Code debugger to port 9222 now.`);

      newWindow.webContents.debugger.on('detach', (event, reason) => {
        console.log(`[Main Process] Debugger detached from ${htmlFileName}: ${reason}`);
      });
    } catch (error) {
      console.error(`[Main Process] CRITICAL: Failed to attach or pause renderer debugger for ${htmlFileName}:`, err);
      console.error('[Main Process] Ensure no other DevTools instance is already attached to this renderer, and that the DevTools protocol version is compatible.');
    }
  }

  const file = path.join(__dirname, htmlFileName);
  console.log(`[Main Process] Loading ${file}...`);
  newWindow.loadURL('file://' + file);
  newWindow.on('close', () => {
    saveWindowState(htmlFileName, newWindow);

    if (newWindow.webContents.debugger.isAttached()) {
      newWindow.webContents.debugger.detach();
      console.log(`[Main Process] Detached debugger from ${htmlFileName}`);
    }
  });

  return newWindow;
}

function getAllTestHtmls() {
  const testDir = path.join(__dirname, '../renderer/tests');
  return fs.readdirSync(testDir).filter(file => file.endsWith('.html'));
}

const tests = getAllTestHtmls().map(file => file.replace('.html', ''));

const menuTemplate = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(process.platform === 'darwin' ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'close' }
    ]
  },
  {
    label: 'View',
    submenu: tests.map((test) => ({
      label: test,
      click: () => {
        openWindow('../renderer/tests/' + test + '.html', { autoHideMenuBar: true });
      }
    }))
  },
];

app.whenReady().then(async () => {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const mainWindow = await openWindow('../renderer/index.html');

  ipcMain.on('reload-window', (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
      win.reload();
      if (win !== mainWindow) {
        win.removeMenu();
      }

      console.log('Reload:', win.getTitle());
    }
  });

  ipcMain.on('toggle-dev-tools', (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
      win.webContents.toggleDevTools();
      console.log('Toggle DevTools:', win.getTitle());
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
