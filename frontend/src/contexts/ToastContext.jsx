/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '#34d399', text: '#d1fae5' },
  error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '#ef4444', text: '#fce7f3' },
  info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: '#60a5fa', text: '#dbeafe' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '#fbbf24', text: '#fef3c7' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px', width: 'calc(100% - 40px)', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => {
            const c = COLORS[t.type] || COLORS.info;
            const Icon = ICONS[t.type] || ICONS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  pointerEvents: 'auto',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: c.bg, border: `1px solid ${c.border}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                }}
              >
                <Icon style={{ width: '18px', height: '18px', color: c.icon, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px', color: c.text, lineHeight: '1.4' }}>{t.message}</span>
                <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', color: c.icon, opacity: 0.6, cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
