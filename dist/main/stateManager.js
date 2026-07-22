"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = exports.StateManager = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const SETTINGS_FILE = path_1.default.join(os_1.default.homedir(), '.wingent-v7-settings.json');
const NOTES_FILE = path_1.default.join(os_1.default.homedir(), '.wingent-v7-notes.json');
const POSITIONS_FILE = path_1.default.join(os_1.default.homedir(), '.wingent-v7-positions.json');
const DATA_FILE = path_1.default.join(os_1.default.homedir(), '.wingent-v7-data.json');
class StateManager {
    constructor() {
        this.settingsTimer = null;
        this.notesTimer = null;
        this.positionsTimer = null;
        this.dataTimer = null;
        this.settings = this.load(SETTINGS_FILE, {
            fontFamily: 'Segoe UI',
            accentColor: '#ffffff',
            opacity: 0.4,
            active: ['clock', 'system', 'notes'],
            runOnStartup: false,
            bigClockSize: 350
        });
        this.notes = this.load(NOTES_FILE, {});
        this.positions = this.load(POSITIONS_FILE, {});
        this.data = this.load(DATA_FILE, {});
        const validWidgets = ['clock', 'big-clock', 'system', 'notes', 'weather', 'timer', 'battery'];
        this.settings.active = this.settings.active.filter((id) => validWidgets.includes(id));
        const hasClock = this.settings.active.some((id) => id === 'clock' || id === 'big-clock');
        if (hasClock) {
            this.settings.active = [
                ...this.settings.active.filter((id) => id !== 'clock' && id !== 'big-clock'),
                'clock'
            ];
        }
        this.settings.active = [...new Set(this.settings.active)];
        this.saveSettings();
    }
    load(file, fallback) {
        try {
            if (fs_1.default.existsSync(file))
                return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
        }
        catch (e) { }
        return fallback;
    }
    saveSettings() {
        if (this.settingsTimer)
            clearTimeout(this.settingsTimer);
        this.settingsTimer = setTimeout(() => fs_1.default.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings)), 300);
    }
    saveNotes() {
        if (this.notesTimer)
            clearTimeout(this.notesTimer);
        this.notesTimer = setTimeout(() => fs_1.default.writeFileSync(NOTES_FILE, JSON.stringify(this.notes)), 300);
    }
    savePositions() {
        if (this.positionsTimer)
            clearTimeout(this.positionsTimer);
        this.positionsTimer = setTimeout(() => fs_1.default.writeFileSync(POSITIONS_FILE, JSON.stringify(this.positions)), 100);
    }
    saveData() {
        if (this.dataTimer)
            clearTimeout(this.dataTimer);
        this.dataTimer = setTimeout(() => fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(this.data)), 300);
    }
    updateSettings(newSettings) {
        this.settings = Object.assign(Object.assign({}, this.settings), newSettings);
        this.saveSettings();
    }
    updatePosition(id, x, y) {
        this.positions[id] = { x, y };
        this.savePositions();
    }
    toggleWidget(id) {
        if (this.settings.active.includes(id)) {
            this.settings.active = this.settings.active.filter((a) => a !== id);
        }
        else {
            this.settings.active.push(id);
        }
        this.saveSettings();
    }
    setNote(id, text) {
        this.notes[id] = text;
        this.saveNotes();
    }
    setData(id, key, value) {
        if (!this.data[id])
            this.data[id] = {};
        this.data[id][key] = value;
        this.saveData();
    }
}
exports.StateManager = StateManager;
exports.state = new StateManager();
