import { app, ipcMain, globalShortcut } from 'electron';
import si from 'systeminformation';
import { state } from './main/stateManager';
import { widgetManager } from './main/widgetManager';
import { startHubServer } from './main/hubServer';

const lock = app.requestSingleInstanceLock();
if (!lock) { app.quit(); } else {
  app.on('second-instance', () => { widgetManager.widgets.forEach(w => { w.show(); w.focus(); }); });

  app.whenReady().then(() => {
    startHubServer();
    state.settings.active.forEach((id: string) => widgetManager.create(id.split('-')[0], id));
    globalShortcut.register('CommandOrControl+Alt+Escape', () => app.quit());
    let eT = 0; let eC = 0;
    globalShortcut.register('Escape', () => {
      const now = Date.now();
      if (now - eT < 500) eC++; else eC = 1; eT = now;
      if (eC === 3) app.quit();
    });
  });
}

ipcMain.on('resize-window', (event: any, { id, width, height }: any) => {
  widgetManager.resize(id, width, height);
});

let lastNetTx = 0;
let lastNetRx = 0;

ipcMain.handle('get-system-stats', async () => {
  const c = await si.currentLoad();
  const m = await si.mem();
  const b = await si.battery();
  const n = await si.networkStats();

  let tx = 0; let rx = 0;
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
});

ipcMain.on('save-note', (event: any, { id, text }: any) => { state.setNote(id, text); });
ipcMain.handle('get-note', (event: any, id: any) => { return state.notes[id] || ''; });

ipcMain.on('save-data', (event: any, { id, key, value }: any) => { state.setData(id, key, value); });
ipcMain.handle('get-data', (event: any, { id, key }: any) => { return state.data[id] ? state.data[id][key] : undefined; });

let weatherCache: any = null;
let weatherLastFetch = 0;

async function httpGet(url: string): Promise<any> {
  const https = await import('https');
  const http = await import('http');
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res: any) => {
      let d = '';
      res.on('data', (c: any) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(); } });
    }).on('error', reject);
  });
}

ipcMain.handle('get-weather', async () => {
  const now = Date.now();
  if (weatherCache && now - weatherLastFetch < 600000) return weatherCache;

  try {
    const city = state.settings.weatherCity || 'San Jose';
    const geo = await httpGet(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);

    if (!geo.results || geo.results.length === 0) return null;
    const lat = geo.results[0].latitude;
    const lon = geo.results[0].longitude;
    const resolvedCity = geo.results[0].name;

    const json = await httpGet(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`
    );
    const code = json.current.weather_code;
    let condition = 'clear';
    if (code >= 1 && code <= 3) condition = 'cloudly';
    else if (code >= 45 && code <= 48) condition = 'foggy';
    else if (code >= 51 && code <= 57) condition = 'drizz';
    else if (code >= 61 && code <= 67) condition = 'rain';
    else if (code >= 71 && code <= 77) condition = 'snow';
    else if (code >= 80 && code <= 82) condition = 'shower';
    else if (code >= 95) condition = 'thunderstorm';

    weatherCache = {
      temp: Math.round(json.current.temperature_2m),
      condition,
      high: Math.round(json.daily.temperature_2m_max[0]),
      low: Math.round(json.daily.temperature_2m_min[0]),
      rain: json.daily.precipitation_probability_max[0] ?? 0,
      humidity: json.current.relative_humidity_2m,
      wind: Math.round(json.current.wind_speed_10m),
      city: resolvedCity
    };
    weatherLastFetch = now;
    return weatherCache;
  } catch (e) {
    return null;
  }
});