import { useState, useEffect } from 'react'
import { useItemData } from './hooks/useItemData'
import { useJEIStore } from './store/jeiStore'
import { DesktopLayout } from './components/layout/DesktopLayout'
import { MobileLayout } from './components/layout/MobileLayout'

const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  )

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return isMobile
}

export default function App() {
  useItemData()
  const isMobile = useIsMobile()

  const { loading, error } = useJEIStore(s => ({
    loading: s.loading,
    error: s.error,
  }))

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--mc-font)',
        color: 'var(--mc-gray)',
        fontSize: 14,
        background: 'var(--mc-bg)',
      }}>
        Loading ATM10 data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--mc-font)',
        color: 'var(--mc-red)',
        fontSize: 12,
        background: 'var(--mc-bg)',
        gap: 8,
        padding: 24,
        textAlign: 'center',
      }}>
        <div>Failed to load item data</div>
        <div style={{ color: 'var(--mc-dark-gray)', fontSize: 10 }}>{error}</div>
        <div style={{ color: 'var(--mc-gray)', fontSize: 10, marginTop: 8 }}>
          Run <code style={{ color: 'var(--mc-yellow)' }}>npm run build:data</code> to generate item data.
        </div>
      </div>
    )
  }

  return isMobile ? <MobileLayout /> : <DesktopLayout />
}
