import React, { useState, useEffect, useRef } from 'react';

const WeatherWidget = ({ settings }: { settings: any }) => {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!window.electronAPI) return;
      const result = await window.electronAPI.getWeather();
      if (result) { setData(result); setErr(false); }
      else { setErr(true); }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ref.current && window.electronAPI) {
      const { width, height } = ref.current.getBoundingClientRect();
      window.electronAPI.resizeWindow('weather', width, height);
    }
  }, [data, err]);

  if (err) {
    return (
      <div ref={ref} className="widget draggable" style={{ padding: '25px', display: 'flex', flexDirection: 'column', width: '220px' }}>
        <div className="title" style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px' }}>WEATHER</div>
        <div style={{ marginTop: '10px', fontSize: '13px', opacity: 0.5 }}>NO CONNECTION</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div ref={ref} className="widget draggable" style={{ padding: '25px', display: 'flex', flexDirection: 'column', width: '220px' }}>
        <div className="title" style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px' }}>WEATHER</div>
        <div style={{ marginTop: '10px', fontSize: '13px', opacity: 0.5 }}>LOADING...</div>
      </div>
    );
  }

  const rainColor = data.rain > 60 ? '#FF453A' : data.rain > 30 ? '#FF9F0A' : '#30D158';

  return (
    <div ref={ref} className="widget draggable" style={{ padding: '25px', display: 'flex', flexDirection: 'column', width: '220px' }}>
      <div className="title" style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px' }}>{data.city.toUpperCase()}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
        <div style={{ fontSize: '48px', fontWeight: 200 }}>{data.temp}°</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{data.condition}</div>
          <div style={{ fontSize: '11px', opacity: 0.4 }}>H:{data.high}° L:{data.low}°</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '12px', opacity: 0.6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 800, letterSpacing: '1px' }}>RAIN</span>
          <span style={{ color: rainColor, fontWeight: 'bold' }}>{data.rain}%</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 800, letterSpacing: '1px' }}>HUMIDITY</span>
          <span>{data.humidity}%</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 800, letterSpacing: '1px' }}>WIND</span>
          <span>{data.wind} mph</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;