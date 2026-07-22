import React, { useState, useEffect, useRef } from 'react';

const Clock = ({ settings, id }: { settings: any, id: string }) => {
  const [t, setT] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (ref.current && window.electronAPI) {
      const { width, height } = ref.current.getBoundingClientRect();
      window.electronAPI.resizeWindow(id, width, height);
    }
  }, [settings.bigClockSize, settings.fontFamily, id]);

  const timeStr = t.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });

  const textStyle: React.CSSProperties = {
    fontSize: `${settings.bigClockSize || 350}px`,
    fontWeight: 400,
    letterSpacing: `-${(settings.bigClockSize || 350) / 20}px`,
    color: settings.accentColor,
    lineHeight: '0.8',
    fontFamily: settings.fontFamily || 'Segoe UI Variable Display, Segoe UI, system-ui',
    whiteSpace: 'nowrap',
    display: 'inline-block'
  };

  return (
    <div ref={ref} className="widget draggable" style={{ padding: '10px', display: 'inline-block', background: 'transparent' }}>
      <div style={textStyle}>
        {timeStr}
      </div>
    </div>
  );
};

export default Clock;