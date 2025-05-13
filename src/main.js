import { app, BrowserWindow, Menu, ipcMain, protocol } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function openWindow(htmlFileName, windowConfig = {}) {
  const state = storage.read(htmlFileName, 'config', defalutWindowConfig);
  const newWindow = new BrowserWindow({
    ...state,
    ...windowConfig,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  if (state.showDevTools) {
    newWindow.webContents.openDevTools();
  }

  const file = path.join(__dirname, htmlFileName);
  newWindow.loadURL('file://' + file);
  newWindow.on('close', () => {
    saveWindowState(htmlFileName, newWindow);
  });

  return newWindow;
}

function getAllTestHtmls() {
  const testDir = path.join(__dirname, 'tests');
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
        openWindow('tests/' + test + '.html', { autoHideMenuBar: true });
      }
    }))
  },
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const mainWindow = openWindow('index.html');

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
