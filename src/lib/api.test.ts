import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitEnquiry, submitReview, trackPropertyView } from './api'

function mockFetch(response: { ok: boolean; body?: unknown }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    json: () => Promise.resolve(response.body ?? {}),
  })
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('submitEnquiry', () => {
  it('POSTs to /api/enquiry and returns the response body', async () => {
    const fetchMock = mockFetch({ ok: true, body: { success: true } })
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitEnquiry({ type: 'contact', name: 'Jo', email: 'jo@example.com' })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/enquiry'), expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ type: 'contact', name: 'Jo' })
    expect(result).toEqual({ success: true })
  })

  it('throws the server error message on failure', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false, body: { error: 'Missing email' } }))
    await expect(submitEnquiry({ type: 'contact' })).rejects.toThrow('Missing email')
  })

  it('falls back to a generic error when the body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('not json')),
    }))
    await expect(submitEnquiry({ type: 'contact' })).rejects.toThrow('Submission failed')
  })
})

describe('submitReview', () => {
  it('POSTs review payload to /api/review', async () => {
    const fetchMock = mockFetch({ ok: true, body: { id: 'r1' } })
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitReview({ author: 'Anna', rating: 5, text: 'Great service' })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/review'), expect.anything())
    expect(result).toEqual({ id: 'r1' })
  })
})

describe('trackPropertyView', () => {
  it('POSTs the property id to /api/track-view', async () => {
    const fetchMock = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await trackPropertyView('property-123')

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/track-view'), expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ propertyId: 'property-123' })
  })

  it('never throws, even when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(trackPropertyView('property-123')).resolves.toBeUndefined()
  })
})
