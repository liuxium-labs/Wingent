"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const systeminformation_1 = __importDefault(require("systeminformation"));
const stateManager_1 = require("./main/stateManager");
const widgetManager_1 = require("./main/widgetManager");
const hubServer_1 = require("./main/hubServer");
const lock = electron_1.app.requestSingleInstanceLock();
if (!lock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => { widgetManager_1.widgetManager.widgets.forEach(w => { w.show(); w.focus(); }); });
    electron_1.app.whenReady().then(() => {
        (0, hubServer_1.startHubServer)();
        stateManager_1.state.settings.active.forEach((id) => widgetManager_1.widgetManager.create(id.split('-')[0], id));
        electron_1.globalShortcut.register('CommandOrControl+Alt+Escape', () => electron_1.app.quit());
        let eT = 0;
        let eC = 0;
        electron_1.globalShortcut.register('Escape', () => {
            const now = Date.now();
            if (now - eT < 500)
                eC++;
            else
                eC = 1;
            eT = now;
            if (eC === 3)
                electron_1.app.quit();
        });
    });
}
electron_1.ipcMain.on('resize-window', (event, { id, width, height }) => {
    widgetManager_1.widgetManager.resize(id, width, height);
});
let lastNetTx = 0;
let lastNetRx = 0;
electron_1.ipcMain.handle('get-system-stats', () => __awaiter(void 0, void 0, void 0, function* () {
    const c = yield systeminformation_1.default.currentLoad();
    const m = yield systeminformation_1.default.mem();
    const b = yield systeminformation_1.default.battery();
    const n = yield systeminformation_1.default.networkStats();
    let tx = 0;
    let rx = 0;
    if (n && n.length > 0) {
        n.forEach(iface => {
            tx += (iface.tx_sec || 0);
            rx += (iface.rx_sec || 0);
        });
    }
    return {
        cpu: c.currentLoad,
        mem: (m.active / m.total) * 100,
        gpu: 0,
        disk: 0,
        battery: b.percent,
        isCharging: b.isCharging,
        netUp: tx,
        netDown: rx
    };
}));
electron_1.ipcMain.on('save-note', (event, { id, text }) => { stateManager_1.state.setNote(id, text); });
electron_1.ipcMain.handle('get-note', (event, id) => { return stateManager_1.state.notes[id] || ''; });
electron_1.ipcMain.on('save-data', (event, { id, key, value }) => { stateManager_1.state.setData(id, key, value); });
electron_1.ipcMain.handle('get-data', (event, { id, key }) => { return stateManager_1.state.data[id] ? stateManager_1.state.data[id][key] : undefined; });
let weatherCache = null;
let weatherLastFetch = 0;
function httpGet(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const https = yield Promise.resolve().then(() => __importStar(require('https')));
        const http = yield Promise.resolve().then(() => __importStar(require('http')));
        return new Promise((resolve, reject) => {
            const mod = url.startsWith('https') ? https : http;
            mod.get(url, (res) => {
                let d = '';
                res.on('data', (c) => d += c);
                res.on('end', () => { try {
                    resolve(JSON.parse(d));
                }
                catch (_a) {
                    reject();
                } });
            }).on('error', reject);
        });
    });
}
electron_1.ipcMain.handle('get-weather', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = Date.now();
    if (weatherCache && now - weatherLastFetch < 600000)
        return weatherCache;
    try {
        const city = stateManager_1.state.settings.weatherCity || 'San Jose';
        const geo = yield httpGet(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (!geo.results || geo.results.length === 0)
            return null;
        const lat = geo.results[0].latitude;
        const lon = geo.results[0].longitude;
        const resolvedCity = geo.results[0].name;
        const json = yield httpGet(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`);
        const code = json.current.weather_code;
        let condition = 'clear';
        if (code >= 1 && code <= 3)
            condition = 'cloudly';
        else if (code >= 45 && code <= 48)
            condition = 'foggy';
        else if (code >= 51 && code <= 57)
            condition = 'drizz';
        else if (code >= 61 && code <= 67)
            condition = 'rain';
        else if (code >= 71 && code <= 77)
            condition = 'snow';
        else if (code >= 80 && code <= 82)
            condition = 'shower';
        else if (code >= 95)
            condition = 'thunderstorm';
        weatherCache = {
            temp: Math.round(json.current.temperature_2m),
            condition,
            high: Math.round(json.daily.temperature_2m_max[0]),
            low: Math.round(json.daily.temperature_2m_min[0]),
            rain: (_a = json.daily.precipitation_probability_max[0]) !== null && _a !== void 0 ? _a : 0,
            humidity: json.current.relative_humidity_2m,
            wind: Math.round(json.current.wind_speed_10m),
            city: resolvedCity
        };
        weatherLastFetch = now;
        return weatherCache;
    }
    catch (e) {
        return null;
    }
}));
