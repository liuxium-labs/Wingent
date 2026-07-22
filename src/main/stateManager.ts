import os from 'os';
import path from 'path';
import fs from 'fs';

const SETTINGS_FILE = path.join(os.homedir(), '.wingent-v7-settings.json');
const NOTES_FILE = path.join(os.homedir(), '.wingent-v7-notes.json');
const POSITIONS_FILE = path.join(os.homedir(), '.wingent-v7-positions.json');
const DATA_FILE = path.join(os.homedir(), '.wingent-v7-data.json');

export class StateManager {
  settings: any;
  notes: any;
  positions: any;
  data: any;

  settingsTimer: NodeJS.Timeout | null = null;
  notesTimer: NodeJS.Timeout | null = null;
  positionsTimer: NodeJS.Timeout | null = null;
  dataTimer: NodeJS.Timeout | null = null;

  constructor() {
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
    this.settings.active = this.settings.active.filter((id: string) => validWidgets.includes(id));

    const hasClock = this.settings.active.some((id: string) => id === 'clock' || id === 'big-clock');
    if (hasClock) {
      this.settings.active = [
        ...this.settings.active.filter((id: string) => id !== 'clock' && id !== 'big-clock'),
        'clock'
      ];
    }
    this.settings.active = [...new Set(this.settings.active)];
    this.saveSettings();
  }

  private load(file: string, fallback: any) {
    try {
      if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {}
    return fallback;
  }

  saveSettings() {
    if (this.settingsTimer) clearTimeout(this.settingsTimer);
    this.settingsTimer = setTimeout(() => fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings)), 300);
  }

  saveNotes() {
    if (this.notesTimer) clearTimeout(this.notesTimer);
    this.notesTimer = setTimeout(() => fs.writeFileSync(NOTES_FILE, JSON.stringify(this.notes)), 300);
  }

  savePositions() {
    if (this.positionsTimer) clearTimeout(this.positionsTimer);
    this.positionsTimer = setTimeout(() => fs.writeFileSync(POSITIONS_FILE, JSON.stringify(this.positions)), 100);
  }

  saveData() {
    if (this.dataTimer) clearTimeout(this.dataTimer);
    this.dataTimer = setTimeout(() => fs.writeFileSync(DATA_FILE, JSON.stringify(this.data)), 300);
  }

  updateSettings(newSettings: any) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  updatePosition(id: string, x: number, y: number) {
    this.positions[id] = { x, y };
    this.savePositions();
  }

  toggleWidget(id: string) {
    if (this.settings.active.includes(id)) {
      this.settings.active = this.settings.active.filter((a: string) => a !== id);
    } else {
      this.settings.active.push(id);
    }
    this.saveSettings();
  }

  setNote(id: string, text: string) {
    this.notes[id] = text;
    this.saveNotes();
  }

  setData(id: string, key: string, value: any) {
    if (!this.data[id]) this.data[id] = {};
    this.data[id][key] = value;
    this.saveData();
  }
}

export const state = new StateManager();