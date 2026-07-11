import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('@/lib/sanity', () => ({
  sanityReady: false,
  getHomepageSettings: vi.fn().mockResolvedValue(null),
  getFeaturedProperties: vi.fn().mockResolvedValue([]),
  getAllProperties: vi.fn().mockResolvedValue([]),
  getPropertyBySlug: vi.fn().mockResolvedValue(null),
  getSiteReviews: vi.fn().mockResolvedValue([]),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  getLegalPage: vi.fn().mockResolvedValue(null),
  getVideoEmbedUrl: vi.fn(),
  imageUrl: vi.fn().mockReturnValue(''),
  client: {},
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('App routing', () => {
  it('serves the block management page at /block-management', async () => {
    renderAt('/block-management')
    expect(
      await screen.findByRole('heading', { level: 1, name: /block management, handled properly/i })
    ).toBeInTheDocument()
  })

  it('includes block management in the main navigation', async () => {
    renderAt('/')
    const nav = await screen.findByRole('navigation', { name: /main navigation/i })
    // the link renders in both the desktop nav and the mobile drawer
    const links = await screen.findAllByRole('link', { name: 'Block management' })
    expect(links.length).toBeGreaterThanOrEqual(1)
    const desktopLink = links.find(l => nav.contains(l))
    expect(desktopLink).toBeDefined()
    expect(desktopLink).toHaveAttribute('href', '/block-management')
  })

  it('renders the homepage with the block management section', async () => {
    renderAt('/')
    expect(
      await screen.findByRole('heading', { name: /complete care for apartment blocks/i })
    ).toBeInTheDocument()
  })

  it('shows the 404 page for unknown routes', async () => {
    renderAt('/definitely-not-a-page')
    const matches = await screen.findAllByText(/404|not found/i)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })
})
