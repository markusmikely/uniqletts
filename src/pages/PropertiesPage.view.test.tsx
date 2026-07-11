import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PropertiesPage from './PropertiesPage'

vi.mock('@/lib/sanity', () => ({
  sanityReady: false,
  getAllProperties: vi.fn().mockResolvedValue([]),
  getHomepageSettings: vi.fn().mockResolvedValue(null),
  getSiteReviews: vi.fn().mockResolvedValue([]),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  imageUrl: vi.fn().mockReturnValue(''),
}))

// the map view pulls in Leaflet, which jsdom can't render — stub it
vi.mock('@/components/properties/PropertiesMap', () => ({
  default: ({ properties }: { properties: unknown[] }) => (
    <div data-testid="map-stub">{properties.length} markers</div>
  ),
}))

function renderPage(url = '/properties') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PropertiesPage />
    </MemoryRouter>
  )
}

describe('PropertiesPage views', () => {
  it('defaults to the grid view with all mock properties', async () => {
    renderPage()
    expect(await screen.findByText(/6 properties found/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grid view/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to the detailed list view with excerpts', async () => {
    renderPage()
    await screen.findByText(/6 properties found/i)

    await userEvent.click(screen.getByRole('button', { name: /list view/i }))

    expect(screen.getByText(/moments from Hyde Park/i)).toBeInTheDocument()
    expect(screen.getAllByText(/view property/i).length).toBeGreaterThan(0)
  })

  it('switches to the map view and passes geocoded properties to the map', async () => {
    renderPage()
    await screen.findByText(/6 properties found/i)

    await userEvent.click(screen.getByRole('button', { name: /map view/i }))

    expect(await screen.findByTestId('map-stub')).toHaveTextContent('6 markers')
  })

  it('honours the view URL parameter', async () => {
    renderPage('/properties?view=list')
    await screen.findByText(/6 properties found/i)
    expect(screen.getByRole('button', { name: /list view/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies bed and price URL parameters from the hero search', async () => {
    renderPage('/properties?type=lettings&beds=2&maxPrice=2500')
    expect(await screen.findByText(/2 properties found/i)).toBeInTheDocument()
  })

  it('filters by extras through the advanced panel', async () => {
    renderPage()
    await screen.findByText(/6 properties found/i)

    await userEvent.click(screen.getByRole('button', { name: /more filters/i }))
    await userEvent.click(screen.getByRole('button', { name: /balcony \/ terrace/i }))

    await waitFor(() => {
      expect(screen.getByText(/2 properties found/i)).toBeInTheDocument()
    })
  })

  it('clears all filters from the empty state', async () => {
    renderPage('/properties?type=sales&beds=4')
    await screen.findByText(/0 properties found/i)

    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))

    expect(await screen.findByText(/6 properties found/i)).toBeInTheDocument()
  })
})
