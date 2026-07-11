import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BlockManagementPage from './BlockManagementPage'

vi.mock('@/lib/sanity', () => ({
  sanityReady: false,
  getHomepageSettings: vi.fn().mockResolvedValue(null),
  getFeaturedProperties: vi.fn().mockResolvedValue([]),
  getSiteReviews: vi.fn().mockResolvedValue([]),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  imageUrl: vi.fn().mockReturnValue(''),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <BlockManagementPage />
    </MemoryRouter>
  )
}

describe('BlockManagementPage', () => {
  it('sets the document title', () => {
    renderPage()
    expect(document.title).toContain('Block Management London')
  })

  it('renders the hero with London-wide positioning', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /block management, handled properly/i })).toBeInTheDocument()
    expect(screen.getByText(/central and Greater London/i)).toBeInTheDocument()
  })

  it('lists the four core services', () => {
    renderPage()
    expect(screen.getByText('Day-to-day building management')).toBeInTheDocument()
    expect(screen.getByText('Service charge & budgeting')).toBeInTheDocument()
    expect(screen.getByText('Developer consultancy')).toBeInTheDocument()
    expect(screen.getByText('Major works & compliance')).toBeInTheDocument()
  })

  it('lists client types from the original site content', () => {
    renderPage()
    expect(screen.getByText('Resident management companies (RMCs)')).toBeInTheDocument()
    expect(screen.getByText('Freeholders & investor funds')).toBeInTheDocument()
    expect(screen.getByText('Developers & house builders')).toBeInTheDocument()
  })

  it('includes the expert witness service from the legacy content', () => {
    renderPage()
    expect(screen.getByText(/expert witness & mediation/i)).toBeInTheDocument()
  })

  it('links the primary CTAs to contact and landlord pages', () => {
    renderPage()
    const contactLinks = screen.getAllByRole('link', { name: /talk to our block team|get in touch/i })
    expect(contactLinks.length).toBeGreaterThanOrEqual(2)
    contactLinks.forEach(link => expect(link).toHaveAttribute('href', '/contact'))
    expect(screen.getByRole('link', { name: /landlord services/i })).toHaveAttribute('href', '/landlords')
  })
})
