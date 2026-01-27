const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('titanNative', {
    // Check if running in Electron
    isElectron: true,

    // Scan for Titan processes
    scan: () => ipcRenderer.invoke('titan:scan-network'),

    // Fetch URL without CORS
    fetch: (url, options) => ipcRenderer.invoke('tpl:proxy-req', { url, ...options })
});
