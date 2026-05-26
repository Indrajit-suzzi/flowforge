import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error, retryCount: 0 };
  }

  handleRetry = () => {
    const nextCount = this.state.retryCount + 1;
    if (nextCount >= 3) {
      window.location.reload();
      return;
    }
    this.setState({ error: null, retryCount: nextCount });
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#fca5a5', marginBottom: '12px' }}>Something went wrong</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button onClick={this.handleRetry} className="btn-primary" style={{ border: 'none' }}>
            {this.state.retryCount < 2 ? 'Try again' : 'Reload page'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
