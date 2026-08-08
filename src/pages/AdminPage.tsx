import { lazy, Suspense } from 'react'
import '@/styles/admin.css'

// Import BOTH the Studio and its config dynamically so nothing here pulls the
// heavy `sanity` bundle into the public/homepage graph — it loads only on /admin.
const Studio = lazy(async () => {
  const [{ Studio }, { default: config }] = await Promise.all([
    import('sanity'),
    import('../../sanity.config'),
  ])
  return { default: () => <Studio config={config} /> }
})

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
      <Studio />
    </Suspense>
  )
}
