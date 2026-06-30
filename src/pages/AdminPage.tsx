import { lazy, Suspense } from 'react'
import config from '../../sanity.config'

const Studio = lazy(() =>
  import('sanity').then(mod => ({ default: mod.Studio }))
)

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading admin…</div>}>
      <Studio config={config} />
    </Suspense>
  )
}
