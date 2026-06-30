import type { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import Analytics from '@/components/Analytics'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Analytics />
      <Nav />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  )
}
