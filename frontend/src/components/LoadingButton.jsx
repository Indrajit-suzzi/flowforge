export default function LoadingButton({ children, loading, onClick, style, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: loading || disabled ? '#334155' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.7 : 1,
        transition: 'all 0.2s',
        ...style
      }}
    >
      {loading && (
        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      )}
      {children}
    </button>
  );
}