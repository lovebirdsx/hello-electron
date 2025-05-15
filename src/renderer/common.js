window.process = window.process ?? { env: { NODE_ENV: 'development' } };

window.addEventListener('keydown', (event) => {
    if (!window.electronAPI) {
        console.error('electronAPI.requestReload is not available. Check preload script.');
        return;
    }

    if (event.ctrlKey && event.altKey && event.key === 'r') {
        event.preventDefault();
        window.electronAPI.requestReload();
    } else if (event.key === 'F12') {
        event.preventDefault();
        window.electronAPI.toggleDevTools();
    }
});
