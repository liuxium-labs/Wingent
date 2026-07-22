"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getSystemStats: () => electron_1.ipcRenderer.invoke('get-system-stats'),
    onUpdateSettings: (callback) => electron_1.ipcRenderer.on('update-settings', (_event, value) => callback(value)),
    saveNote: (id, text) => electron_1.ipcRenderer.send('save-note', { id, text }),
    getNote: (id) => electron_1.ipcRenderer.invoke('get-note', id),
    saveData: (id, key, value) => electron_1.ipcRenderer.send('save-data', { id, key, value }),
    getData: (id, key) => electron_1.ipcRenderer.invoke('get-data', { id, key }),
    getWeather: () => electron_1.ipcRenderer.invoke('get-weather'),
    resizeWindow: (id, width, height) => electron_1.ipcRenderer.send('resize-window', { id, width, height }),
});
