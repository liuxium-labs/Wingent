import React, { useState, useEffect } from 'react';

const BatteryWidget = ({ settings }: { settings: any }) => {
  const [b, setB] = useState({ percent: 100, charging: false });

  useEffect(() => {
    const u = async () => { if (window.electronAPI) { const s = await window.electronAPI.getSystemStats(); setB({ percent: s.battery, charging: s.isCharging }); } };
    const i = setInterval(u, 5000);
    u();
    return () => clearInterval(i);
  }, []);

  const d = 160;
  const c = Math.PI * d;
  const o = c - (b.percent / 100) * c;

  return (
    <div className="widget draggable" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px', marginBottom: '20px' }}>POWER</div>
      <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="90" cy="90" r="80" fill="none" stroke={b.charging ? '#30d158' : settings.accentColor} strokeWidth="8" strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{ transition: '1s' }} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '38px', fontWeight: 'bold', color: '#fff' }}>{Math.round(b.percent)}%</span>
          {b.charging && <span style={{ fontSize: '11px', color: '#30d158', marginTop: '5px' }}>CHARGING</span>}
        </div>
      </div>
    </div>
  );
};

export default BatteryWidget;
