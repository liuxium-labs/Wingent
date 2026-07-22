"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHubServer = startHubServer;
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const stateManager_1 = require("./stateManager");
const widgetManager_1 = require("./widgetManager");
const server = (0, express_1.default)();
const port = 8080;
server.use(express_1.default.json());
server.use((req, res, next) => { res.header("Access-Control-Allow-Origin", "*"); next(); });
function startHubServer() {
    server.get('/', (req, res) => {
        const active = stateManager_1.state.settings.active;
        res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Wingent</title><style>
          body { font-family: -apple-system, sans-serif; background: #000; color: #fff; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
          .hub { width: 900px; padding: 50px; background: rgba(20,20,20,0.9); backdrop-filter: blur(50px); border-radius: 44px; border: 1px solid rgba(255,255,255,0.1); }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 18px; border-radius: 18px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: space-between; font-size: 15px; margin-bottom: 8px; transition: 0.2s; }
          .dot { width: 10px; height: 10px; border-radius: 50%; background: #333; }
          .btn.active .dot { background: #30D158; box-shadow: 0 0 12px #30D158; }
          .kill { background: #FF453A; border: none; font-weight: 700; margin-top: 20px; justify-content: center; }
          input[type="range"] { width: 100%; margin: 10px 0; }
          label { font-size: 11px; opacity: 0.4; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
        </style></head>
        <body>
          <div class="hub">
            <h1>Wingent</h1>
            <div class="grid">
              <div>
                <h3>Widgets</h3>
                ${['clock', 'system', 'notes', 'weather', 'timer', 'battery'].map(t => `<button id="b-${t}" class="btn ${active.includes(t) ? 'active' : ''}" onclick="tog('${t}')">${t.toUpperCase()}<div class="dot"></div></button>`).join('')}
              </div>
              <div>
                <h3>Settings & Scaling</h3>
                <label>Clock Size</label><input type="range" min="100" max="800" value="${stateManager_1.state.settings.bigClockSize}" oninput="upd('bigClockSize',parseInt(this.value))">
                <label>Glass Transparency</label><input type="range" min="0" max="1" step="0.01" value="${stateManager_1.state.settings.opacity}" oninput="upd('opacity',parseFloat(this.value))">
                <br><br>
                <label>Weather City</label><input type="text" value="${stateManager_1.state.settings.weatherCity || 'San Jose'}" onchange="upd('weatherCity', this.value)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:8px;border-radius:8px;width:100%;margin:4px 0 10px 0;font-size:13px;">
                <label>Run on Startup</label> <input type="checkbox" ${stateManager_1.state.settings.runOnStartup ? 'checked' : ''} onchange="upd('runOnStartup', this.checked)">
                <button class="btn" style="margin-top:10px; background: rgba(48, 209, 88, 0.2);" onclick="saveAll(this)">Save All Configuration</button>
                <button class="btn kill" onclick="kill()">Kill Task</button>
              </div>
            </div>
          </div>
          <script>
            async function tog(id){ document.getElementById('b-'+id).classList.toggle('active'); await fetch('/api/toggle/'+id, {method:'POST'}); }
            function upd(k,v){ 
              fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[k]:v})}); 
              if(k === 'runOnStartup') fetch('/api/startup/'+v, {method:'POST'});
            }
            async function saveAll(btn){ 
              const old = btn.innerText; btn.innerText = 'SAVED!'; 
              await fetch('/api/save-all', {method:'POST'});
              setTimeout(() => btn.innerText = old, 2000);
            }
            function kill(){ fetch('/api/kill', {method:'POST'}); }
          </script>
        </body>
      </html>
    `);
    });
    server.post('/api/save-all', (req, res) => { stateManager_1.state.saveSettings(); stateManager_1.state.saveNotes(); stateManager_1.state.savePositions(); res.sendStatus(200); });
    server.post('/api/settings', (req, res) => { stateManager_1.state.updateSettings(req.body); widgetManager_1.widgetManager.updateAllStyles(); res.sendStatus(200); });
    server.post('/api/toggle/:id', (req, res) => {
        const id = req.params.id;
        stateManager_1.state.toggleWidget(id);
        if (widgetManager_1.widgetManager.widgets.has(id)) {
            widgetManager_1.widgetManager.close(id);
        }
        else {
            widgetManager_1.widgetManager.create(id.split('-')[0], id);
        }
        res.sendStatus(200);
    });
    server.post('/api/startup/:enabled', (req, res) => {
        const enabled = req.params.enabled === 'true';
        stateManager_1.state.updateSettings({ runOnStartup: enabled });
        const isPackaged = electron_1.app.isPackaged;
        const appPath = isPackaged ? electron_1.app.getPath('exe') : process.execPath;
        const args = isPackaged ? [] : [path_1.default.join(electron_1.app.getAppPath(), '.')];
        electron_1.app.setLoginItemSettings({
            openAtLogin: enabled,
            path: appPath,
            args: args
        });
        res.sendStatus(200);
    });
    server.post('/api/kill', (req, res) => { res.sendStatus(200); setTimeout(() => electron_1.app.quit(), 100); });
    server.listen(port, '127.0.0.1');
}
