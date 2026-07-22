import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  onUpdateSettings: (callback: any) => ipcRenderer.on('update-settings', (_event: any, value: any) => callback(value)),
  saveNote: (id: string, text: string) => ipcRenderer.send('save-note', { id, text }),
  getNote: (id: string) => ipcRenderer.invoke('get-note', id),
  saveData: (id: string, key: string, value: any) => ipcRenderer.send('save-data', { id, key, value }),
  getData: (id: string, key: string) => ipcRenderer.invoke('get-data', { id, key }),
  getWeather: () => ipcRenderer.invoke('get-weather'),
  resizeWindow: (id: string, width: number, height: number) => ipcRenderer.send('resize-window', { id, width, height }),
});