import React, { useState, useEffect, useRef } from 'react';

const TimerWidget = ({ settings, id }: { settings: any, id: string }) => {
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputMin, setInputMin] = useState(25);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (window.electronAPI) {
        const saved = await window.electronAPI.getData(id, 'state');
        if (saved) {
          setSeconds(saved.seconds ?? 1500);
          setRunning(saved.running ?? false);
          setInputMin(saved.inputMin ?? 25);
        }
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.saveData(id, 'state', { seconds, running, inputMin });
    }
  }, [seconds, running, inputMin, id]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { setRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (ref.current && window.electronAPI) {
      const { width, height } = ref.current.getBoundingClientRect();
      window.electronAPI.resizeWindow(id, width, height);
    }
  }, [editing, running, id]);

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  const btnBase: React.CSSProperties = {
    padding: '10px 24px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: '0.2s',
    border: 'none',
    outline: 'none',
  };

  return (
    <div ref={ref} className="widget draggable" style={{ padding: '30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '240px' }}>
      <div style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px', fontWeight: 800, letterSpacing: '2px', marginBottom: '24px' }}>FOCUS TIMER</div>

      {editing ? (
        <div className="non-draggable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <input
            autoFocus
            type="number"
            min={1}
            max={999}
            value={inputMin}
            onChange={e => setInputMin(Math.max(1, Number(e.target.value)))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSeconds(inputMin * 60);
                setEditing(false);
              }
            }}
            style={{ width: '120px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: `2px solid ${settings.accentColor}`, borderRadius: '16px', color: '#fff', fontSize: '36px', fontWeight: 'bold', padding: '12px', outline: 'none' }}
          />
          <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>MINUTES</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              onClick={() => { setSeconds(inputMin * 60); setEditing(false); }}
              style={{ ...btnBase, background: settings.accentColor, color: '#000' }}
            >SET</div>
            <div
              onClick={() => setEditing(false)}
              style={{ ...btnBase, background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >BACK</div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="non-draggable"
            onClick={() => { if (!running) setEditing(true); }}
            style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff', cursor: running ? 'default' : 'pointer', opacity: running ? 1 : 0.7, transition: '0.3s', letterSpacing: '2px' }}
          >
            {mm}:{ss}
          </div>

          <div className="non-draggable" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {!running && seconds > 0 && (
              <div
                onClick={() => setRunning(true)}
                style={{ ...btnBase, background: settings.accentColor, color: '#000' }}
              >PLAY</div>
            )}
            {running && (
              <div
                onClick={() => setRunning(false)}
                style={{ ...btnBase, background: 'rgba(255,255,255,0.15)', color: '#fff' }}
              >PAUSE</div>
            )}
            {(seconds !== inputMin * 60 || running) && (
              <div
                onClick={() => { setRunning(false); setSeconds(inputMin * 60); }}
                style={{ ...btnBase, background: 'rgba(255,69,58,0.35)', color: '#fff' }}
              >RESET</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimerWidget;
