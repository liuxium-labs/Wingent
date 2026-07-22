import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import { state } from './stateManager';

export class WidgetManager {
  widgets: Map<string, BrowserWindow> = new Map();

  create(type: string, id: string) {
    if (this.widgets.has(id)) return;

    const pos = state.positions[id] || { x: undefined, y: undefined };
    
    const w = (id.includes('clock')) ? 1200 : 300;
    const h = (id.includes('clock')) ? 800 : 200;

    const win = new BrowserWindow({
      width: w, height: h, x: pos.x, y: pos.y,
      frame: false, transparent: true, alwaysOnTop: false,
      skipTaskbar: true, hasShadow: false,
      useContentSize: true,
      webPreferences: { 
        preload: path.join(__dirname, '..', 'preload.js'), 
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'), { query: { type, id } });
    this.widgets.set(id, win);
    win.once('ready-to-show', () => { win.show(); });
    win.on('move', () => { const [nx, ny] = win.getPosition(); state.updatePosition(id, nx, ny); });
    win.on('closed', () => { this.widgets.delete(id); });
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('update-settings', state.settings);
    });
  }

  resize(id: string, width: number, height: number) {
    const win = this.widgets.get(id);
    if (win) {
      win.setSize(Math.ceil(width) + 10, Math.ceil(height) + 10);
    }
  }

  close(id: string) { if (this.widgets.has(id)) this.widgets.get(id)?.close(); }
  updateAllStyles() { this.widgets.forEach(win => win.webContents.send('update-settings', state.settings)); }
}

export const widgetManager = new WidgetManager();