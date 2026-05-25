/* eslint-disable react-refresh/only-export-components */
import { AlertCircle } from 'lucide-react';

export default function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={className} style={{ marginBottom: '14px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px', letterSpacing: '0.3px' }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      {error && (
        <div className="field-error-message">
          <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  );
}

export function fieldClass(error) {
  return `input-field${error ? ' field-error' : ''}`;
}

export function selectClass(error) {
  return `select-field${error ? ' field-error' : ''}`;
}
