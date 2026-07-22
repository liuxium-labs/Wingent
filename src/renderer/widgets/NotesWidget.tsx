import React, { useState, useRef, useEffect } from 'react';

const NotesWidget = ({ settings, id }: { settings: any, id: string }) => {
  const [n, setN] = useState('');
  const timer = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadNote = async () => {
      if (window.electronAPI) {
        const text = await window.electronAPI.getNote(id);
        setN(text);
      }
    };
    loadNote();
  }, [id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    
    if (containerRef.current && window.electronAPI) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      window.electronAPI.resizeWindow(id, width, height);
    }
  }, [n, id]);

  const change = (e: any) => {
    const v = e.target.value;
    setN(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (window.electronAPI) window.electronAPI.saveNote(id, v);
    }, 3000);
  };

  return (
    <div ref={containerRef} className="widget draggable" style={{ padding: '25px', display: 'flex', flexDirection: 'column', width: '300px' }}>
      <div className="title" style={{ color: settings.accentColor, opacity: 0.4, fontSize: '9px' }}>QUICK NOTES</div>
      <textarea 
        ref={textareaRef}
        className="non-draggable" 
        spellCheck="false" 
        value={n} 
        onChange={change} 
        style={{ 
          background: 'transparent', border: 'none', color: '#fff', 
          width: '100%', outline: 'none', resize: 'none', 
          fontSize: '15px', lineHeight: '1.6', fontFamily: 'inherit',
          marginTop: '10px',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
};

export default NotesWidget;