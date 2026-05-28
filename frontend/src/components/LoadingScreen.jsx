import { useState, useEffect } from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '3px solid #1e293b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 8, border: '3px solid transparent', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite reverse' }} />
        </div>
        <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>{message}{dots}</p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>Please wait</p>
      </div>
    </div>
  );
}