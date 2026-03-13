const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('starlightAPI', {
  updateDiscord: (data) => ipcRenderer.send('sync-discord', data)
});