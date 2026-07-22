import React, { useState, useEffect } from 'react';
import Clock from './widgets/Clock';
import SystemWidget from './widgets/SystemWidget';
import NotesWidget from './widgets/NotesWidget';
import WeatherWidget from './widgets/WeatherWidget';
import TimerWidget from './widgets/TimerWidget';
import BatteryWidget from './widgets/BatteryWidget';

const ThemeControls = ({ onThemeChange }: { onThemeChange: (theme: string) => void }) => (
  <div className="theme-controls non-draggable">
    <div className="theme-dot" style={{ background: '#0A84FF' }} onClick={() => onThemeChange('blue')} />
    <div className="theme-dot" style={{ background: '#FF453A' }} onClick={() => onThemeChange('red')} />
    <div className="theme-dot" style={{ background: '#30D158' }} onClick={() => onThemeChange('green')} />
  </div>
);

const getStyle = (theme: string, settings: any) => {
  const op = Math.max(settings.opacity, 0.01);
  let bg = `rgba(10, 10, 10, ${op})`;
  if (theme.includes('blue')) bg = `rgba(0, 30, 80, ${op})`;
  else if (theme.includes('red')) bg = `rgba(80, 5, 5, ${op})`;
  else if (theme.includes('green')) bg = `rgba(5, 80, 5, ${op})`;

  return {
    backgroundColor: bg,
    borderColor: `rgba(255, 255, 255, ${op / 3})`,
    boxShadow: `0 25px 80px rgba(0, 0, 0, ${op * 1.5})`,
    borderWidth: op > 0.01 ? '1.5px' : '0px',
    borderStyle: 'solid',
    fontFamily: settings.fontFamily || 'Segoe UI'
  };
};

const App = () => {
  const q = new URLSearchParams(window.location.search);
  const type = q.get('type') || 'clock';
  const id = q.get('id') || type;
  const [theme, setTheme] = useState(localStorage.getItem(`t-${id}`) || 'dark');
  const [s, setS] = useState({ 
    fontFamily: 'Segoe UI', 
    accentColor: '#ffffff', 
    opacity: 0.6,
    bigClockSize: 400,
    localTimeSize: 80
  });

  useEffect(() => {
    if (window.electronAPI?.onUpdateSettings) {
      window.electronAPI.onUpdateSettings((ns: any) => setS(prev => ({...prev, ...ns})));
    }
  }, []);

  const render = () => {
    switch (type) {
      case 'clock':
      case 'big-clock': return <Clock settings={s} id={id} />;
      case 'system': return <SystemWidget settings={s} />;
      case 'notes': return <NotesWidget settings={s} id={id} />;
      case 'weather': return <WeatherWidget settings={s} />;
      case 'timer': return <TimerWidget settings={s} id={id} />;
      case 'battery': return <BatteryWidget settings={s} />;
      default: return <Clock settings={s} id={id} />;
    }
  };

  const isClock = type === 'clock' || type === 'big-clock';
  const currentStyle = isClock ? { background: 'transparent', border: 'none', boxShadow: 'none' } : getStyle(theme, s);

  return (
    <div style={{ width: 'fit-content', height: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', ...currentStyle, borderRadius: isClock ? '0' : '32px' }}>
        {!isClock && <ThemeControls onThemeChange={nt => { setTheme(nt); localStorage.setItem(`t-${id}`, nt); }} />}
        {render()}
      </div>
    </div>
  );
};

export default App;