import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const sanityMock = vi.hoisted(() => ({
  sanityReady: false,
  getHomepageSettings: vi.fn().mockResolvedValue(null),
  getFeaturedProperties: vi.fn().mockResolvedValue([]),
  getSiteReviews: vi.fn().mockResolvedValue([]),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  imageUrl: vi.fn().mockReturnValue(''),
}))

vi.mock('@/lib/sanity', () => sanityMock)

import { BlockManagement, Services, ReviewsStrip } from './HomeSections'

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => {
  sanityMock.sanityReady = false
  sanityMock.getHomepageSettings.mockResolvedValue(null)
})

describe('BlockManagement home section', () => {
  it('renders modernised fallback content without a CMS connection', () => {
    wrap(<BlockManagement />)
    expect(screen.getByRole('heading', { name: /complete care for apartment blocks/i })).toBeInTheDocument()
    expect(screen.getByText(/central and Greater London/i)).toBeInTheDocument()
  })

  it('links to the block management page', () => {
    wrap(<BlockManagement />)
    expect(screen.getByRole('link', { name: /explore block management/i })).toHaveAttribute('href', '/block-management')
  })

  it('shows the four service points', () => {
    wrap(<BlockManagement />)
    expect(screen.getByText(/service charge budgeting & collection/i)).toBeInTheDocument()
    expect(screen.getByText(/maintenance contracts, tendered & managed/i)).toBeInTheDocument()
    expect(screen.getByText(/onsite staff appointment & supervision/i)).toBeInTheDocument()
    expect(screen.getByText(/major works & section 20 consultations/i)).toBeInTheDocument()
  })

  it('prefers CMS content when homepage settings exist', async () => {
    sanityMock.sanityReady = true
    sanityMock.getHomepageSettings.mockResolvedValue({
      blockManagement: { title: 'CMS block title', body: 'CMS body copy.' },
    })

    wrap(<BlockManagement />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'CMS block title' })).toBeInTheDocument()
    })
    expect(screen.getByText('CMS body copy.')).toBeInTheDocument()
    // fields the CMS omits fall back to defaults
    expect(screen.getByRole('link', { name: /explore block management/i })).toBeInTheDocument()
  })
})

describe('Services section', () => {
  it('covers lettings, management and sales with London-wide copy', () => {
    wrap(<Services />)
    expect(screen.getByText('Residential lettings')).toBeInTheDocument()
    expect(screen.getByText('Property management')).toBeInTheDocument()
    expect(screen.getByText('Sales & valuations')).toBeInTheDocument()
    expect(screen.getByText(/across central and Greater London/i)).toBeInTheDocument()
  })
})

describe('ReviewsStrip', () => {
  it('renders reviews fetched from the CMS', async () => {
    sanityMock.sanityReady = true
    sanityMock.getSiteReviews.mockResolvedValue([
      { id: 'r1', source: 'custom', rating: 5, text: 'Wonderful service', author: 'Anna, Notting Hill', date: '2016-11-14', showOnSite: true, isPinned: false, sortOrder: 0 },
    ])

    wrap(<ReviewsStrip />)

    await waitFor(() => {
      expect(screen.getByText(/wonderful service/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Anna, Notting Hill')).toBeInTheDocument()
  })
})
