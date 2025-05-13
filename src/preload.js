const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    requestReload: () => ipcRenderer.send('reload-window'),
    toggleDevTools: () => ipcRenderer.send('toggle-dev-tools')
});