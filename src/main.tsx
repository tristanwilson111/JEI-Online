import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface ErrorBoundaryState { error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('JEI Online crashed:', error, info)
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', background: '#1a1a1a',
          color: '#FF5555', fontFamily: 'monospace', fontSize: 12,
          padding: 24, gap: 8, textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, color: '#FFFFFF' }}>JEI Online failed to load</div>
          <div>{error.message}</div>
          <div style={{ color: '#555555', fontSize: 10, maxWidth: 600, wordBreak: 'break-all' }}>
            {error.stack?.split('\n').slice(0, 5).join('\n')}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, background: '#4a4a4a', color: '#fff', border: 'none', padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.state.error ? null : this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
