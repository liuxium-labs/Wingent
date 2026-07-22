"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.widgetManager = exports.WidgetManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const stateManager_1 = require("./stateManager");
class WidgetManager {
    constructor() {
        this.widgets = new Map();
    }
    create(type, id) {
        if (this.widgets.has(id))
            return;
        const pos = stateManager_1.state.positions[id] || { x: undefined, y: undefined };
        const w = (id.includes('clock')) ? 1200 : 300;
        const h = (id.includes('clock')) ? 800 : 200;
        const win = new electron_1.BrowserWindow({
            width: w, height: h, x: pos.x, y: pos.y,
            frame: false, transparent: true, alwaysOnTop: false,
            skipTaskbar: true, hasShadow: false,
            useContentSize: true,
            webPreferences: {
                preload: path_1.default.join(__dirname, '..', 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });
        win.loadFile(path_1.default.join(__dirname, '..', 'renderer', 'index.html'), { query: { type, id } });
        this.widgets.set(id, win);
        win.once('ready-to-show', () => { win.show(); });
        win.on('move', () => { const [nx, ny] = win.getPosition(); stateManager_1.state.updatePosition(id, nx, ny); });
        win.on('closed', () => { this.widgets.delete(id); });
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('update-settings', stateManager_1.state.settings);
        });
    }
    resize(id, width, height) {
        const win = this.widgets.get(id);
        if (win) {
            win.setSize(Math.ceil(width) + 10, Math.ceil(height) + 10);
        }
    }
    close(id) { var _a; if (this.widgets.has(id))
        (_a = this.widgets.get(id)) === null || _a === void 0 ? void 0 : _a.close(); }
    updateAllStyles() { this.widgets.forEach(win => win.webContents.send('update-settings', stateManager_1.state.settings)); }
}
exports.WidgetManager = WidgetManager;
exports.widgetManager = new WidgetManager();
