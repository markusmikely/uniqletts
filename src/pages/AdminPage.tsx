import { lazy, Suspense } from 'react'
import config from '../../sanity.config'
import '@/styles/admin.css'

const Studio = lazy(() =>
  import('sanity').then(mod => ({ default: mod.Studio }))
)

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: "'Nunito Sans', system-ui, sans-serif",
            color: '#6b7685',
            background: '#f0f7fc',
          }}
        >
          Loading Uniqletts admin…
        </div>
      }
    >
      <Studio config={config} />
    </Suspense>
  )
}
