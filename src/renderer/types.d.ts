export interface IElectronAPI {
  getSystemStats: () => Promise<{ cpu: number; mem: number; battery: number; isCharging: boolean; netUp: number; netDown: number; }>;
  onUpdateSettings: (callback: (settings: any) => void) => void;
  saveNote: (id: string, text: string) => void;
  getNote: (id: string) => Promise<string>;
  saveData: (id: string, key: string, value: any) => void;
  getData: (id: string, key: string) => Promise<any>;
  getWeather: () => Promise<any>;
  resizeWindow: (id: string, width: number, height: number) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}