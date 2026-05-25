import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: '48px 24px', textAlign: 'center',
          background: '#080511', color: '#f8fafc',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '24px',
          }}>!</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px', maxWidth: '400px', lineHeight: '1.6' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button onClick={() => this.setState({ error: null })} aria-label="Retry loading the page" style={{
            padding: '10px 24px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            color: '#080511', fontWeight: '600', cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", fontSize: '14px',
          }}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
