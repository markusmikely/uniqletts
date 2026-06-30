import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

const HomePage        = lazy(() => import('@/pages/HomePage'))
const PropertiesPage  = lazy(() => import('@/pages/PropertiesPage'))
const PropertyDetail  = lazy(() => import('@/pages/PropertyDetail'))
const LandlordsPage   = lazy(() => import('@/pages/LandlordsPage'))
const TenantsPage     = lazy(() => import('@/pages/TenantsPage'))
const ValuationsPage  = lazy(() => import('@/pages/ValuationsPage'))
const AreaGuidePage   = lazy(() => import('@/pages/AreaGuidePage'))
const AboutPage       = lazy(() => import('@/pages/AboutPage'))
const ContactPage     = lazy(() => import('@/pages/ContactPage'))
const ReviewsPage     = lazy(() => import('@/pages/ReviewsPage'))
const LegalPage       = lazy(() => import('@/pages/LegalPage'))
const AdminPage       = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage    = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--color-gray-400)',
      fontSize: '0.875rem',
      fontFamily: 'var(--font-body)',
    }}>
      Loading…
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Admin — no public layout wrapper */}
      <Route path="/admin/*" element={
        <Suspense fallback={<PageLoader />}>
          <AdminLayout><AdminPage /></AdminLayout>
        </Suspense>
      } />

      {/* Public site */}
      <Route path="*" element={
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/properties"          element={<PropertiesPage />} />
              <Route path="/properties/:slug"    element={<PropertyDetail />} />
              <Route path="/landlords"           element={<LandlordsPage />} />
              <Route path="/tenants"             element={<TenantsPage />} />
              <Route path="/valuations"          element={<ValuationsPage />} />
              <Route path="/area-guide"          element={<AreaGuidePage />} />
              <Route path="/about"              element={<AboutPage />} />
              <Route path="/contact"            element={<ContactPage />} />
              <Route path="/reviews"            element={<ReviewsPage />} />
              <Route path="/privacy"            element={<LegalPage slug="privacy" fallbackTitle="Privacy Policy" />} />
              <Route path="/terms"              element={<LegalPage slug="terms" fallbackTitle="Terms of Use" />} />
              <Route path="/cookies"            element={<LegalPage slug="cookies" fallbackTitle="Cookie Policy" />} />
              <Route path="*"                   element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      } />
    </Routes>
  )
}
