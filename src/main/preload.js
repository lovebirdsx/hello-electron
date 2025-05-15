const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');
contextBridge.exposeInMainWorld('electronAPI', {
    requestReload: () => {
        ipcRenderer.send('reload-window');
    },
    toggleDevTools: () => {
        ipcRenderer.send('toggle-dev-tools');
    },
});
