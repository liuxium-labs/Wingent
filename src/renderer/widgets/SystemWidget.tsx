import React, { useState, useEffect } from 'react';

const SystemWidget = ({ settings }: { settings: any }) => {
  const [s, setS] = useState({ cpu: 0, mem: 0, netUp: 0, netDown: 0 });
  useEffect(() => {
    const u = async () => { if (window.electronAPI) setS(await window.electronAPI.getSystemStats()); };
    const i = setInterval(u, 1000);
    u();
    return () => clearInterval(i);
  }, []);

  const Bar = ({ v, label }: { v: number, label: string }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.6, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span>{Math.round(v)}%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, v))}%`, background: settings.accentColor, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
    </div>
  );

  const NetStat = ({ val, type }: { val: number, type: string }) => {
    const mbps = (val / 1024 / 1024).toFixed(1);
    return (
      <div style={{ flex: 1, color: '#fff', fontSize: '13px' }}>
        <div style={{ fontSize: '9px', opacity: 0.5 }}>{type}</div>
        {mbps} MB/s
      </div>
    );
  };

  return (
    <div className="widget draggable" style={{ padding: '25px', display: 'flex', flexDirection: 'column', width: '220px' }}>
      <div className="title non-draggable" style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px', marginBottom: '10px' }}>PERFORMANCE MONITOR</div>
      <div className="content non-draggable" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Bar label="CPU" v={s.cpu} />
        <Bar label="RAM" v={s.mem} />
        <div style={{ display: 'flex', marginTop: '5px', gap: '15px' }}>
          <NetStat type="DOWNLOAD" val={s.netDown} />
          <NetStat type="UPLOAD" val={s.netUp} />
        </div>
      </div>
    </div>
  );
};

export default SystemWidget;