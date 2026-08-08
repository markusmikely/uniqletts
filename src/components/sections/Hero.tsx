import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

/*
  HERO IMAGE NOTE:
  Landscape, 2400px wide, people-focused. Sits behind a semi-transparent
  dark overlay so any well-lit lifestyle shot works.
  Current image: a couple at home in their kitchen (Unsplash).
*/
const HERO_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=2400&q=85&auto=format&fit=crop'

type ListingType = 'lettings' | 'sales'

export default function Hero() {
  const navigate = useNavigate()
  const [listingType, setListingType] = useState<ListingType>('lettings')
  const [minBeds, setMinBeds] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('type', listingType)
    if (minBeds) params.set('beds', minBeds)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <section className={styles.hero} aria-label="Welcome to Uniqletts">

      {/* Full-bleed background image */}
      <img
        src={HERO_IMAGE}
        alt="Modern apartment living room in London"
        className={styles.bgImage}
        width={2400}
        height={1600}
        fetchPriority="high"
        decoding="async"
      />

      {/* Dark overlay for legibility */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* Content — centred over the image */}
      <div className={`container ${styles.content}`}>

        {/* Eyebrow + heading */}
        <div className={styles.copy}>
          <p className={`animate-fade-up ${styles.eyebrow}`}>
            Central London &middot; Greater London &middot; A unique property experience
          </p>

          <h1 className={`animate-fade-up delay-1 ${styles.heading}`}>
            Find your place in<br />
            <span className={styles.headingAccent}>London</span>
          </h1>

          <p className={`animate-fade-up delay-2 ${styles.sub}`}>
            Independent letting and estate agents with 20&nbsp;years of experience
            across central and Greater London.
          </p>
        </div>

        {/* Property search form */}
        <form
          onSubmit={handleSearch}
          className={`animate-fade-up delay-3 ${styles.searchForm}`}
          aria-label="Property search"
          noValidate
        >
          {/* Lettings / Sales toggle */}
          <div className={styles.typeToggle} role="group" aria-label="Listing type">
            <button
              type="button"
              className={`${styles.typeBtn} ${listingType === 'lettings' ? styles.typeBtnActive : ''}`}
              onClick={() => setListingType('lettings')}
              aria-pressed={listingType === 'lettings'}
            >
              To rent
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${listingType === 'sales' ? styles.typeBtnActive : ''}`}
              onClick={() => setListingType('sales')}
              aria-pressed={listingType === 'sales'}
            >
              To buy
            </button>
          </div>

          {/* Filters row */}
          <div className={styles.searchFields}>
            <div className={styles.searchField}>
              <label htmlFor="hero-beds" className={styles.searchLabel}>Bedrooms</label>
              <select
                id="hero-beds"
                className={styles.searchSelect}
                value={minBeds}
                onChange={e => setMinBeds(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className={styles.searchField}>
              <label htmlFor="hero-price" className={styles.searchLabel}>
                {listingType === 'lettings' ? 'Max rent (pcm)' : 'Max price'}
              </label>
              <select
                id="hero-price"
                className={styles.searchSelect}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              >
                <option value="">No limit</option>
                {listingType === 'lettings' ? (
                  <>
                    <option value="1500">£1,500</option>
                    <option value="2000">£2,000</option>
                    <option value="2500">£2,500</option>
                    <option value="3000">£3,000</option>
                    <option value="4000">£4,000</option>
                    <option value="5000">£5,000+</option>
                  </>
                ) : (
                  <>
                    <option value="400000">£400k</option>
                    <option value="600000">£600k</option>
                    <option value="800000">£800k</option>
                    <option value="1000000">£1m</option>
                    <option value="1500000">£1.5m+</option>
                  </>
                )}
              </select>
            </div>

            <button type="submit" className={styles.searchBtn} aria-label="Search properties">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
              Search
            </button>
          </div>
        </form>

        {/* CTAs */}
        <div className={`animate-fade-up delay-4 ${styles.actions}`}>
          <Link to="/valuations" className={styles.ctaAccent}>
            Book a free valuation
          </Link>
          <a href="tel:+02072214000" className={styles.ctaGhost}>
            Call 0207 221 4000
          </a>
        </div>
      </div>

      {/* Trust bar — anchored to bottom of hero */}
      <div className={`animate-fade-up delay-5 ${styles.trustBar}`}>
        <div className={`container ${styles.trustInner}`}>
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>4.9</span>
            <span className={styles.trustStars}>★★★★★</span>
            <span className={styles.trustLabel}>Trustpilot</span>
          </div>
          <div className={styles.trustDivider} aria-hidden="true" />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>20+</span>
            <span className={styles.trustLabel}>Years in London</span>
          </div>
          <div className={styles.trustDivider} aria-hidden="true" />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>500+</span>
            <span className={styles.trustLabel}>Properties let</span>
          </div>
          <div className={styles.trustDivider} aria-hidden="true" />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>Independent</span>
            <span className={styles.trustLabel}>Family-run agency</span>
          </div>
        </div>
      </div>

    </section>
  )
}
