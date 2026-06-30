import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import styles from './Nav.module.css'
import logo from '../../assets/logo.webp'

const NAV_LINKS = [
  { label: 'Properties', href: '/properties' },
  { label: 'Landlords',  href: '/landlords' },
  { label: 'Tenants',    href: '/tenants' },
  { label: 'Area guide', href: '/area-guide' },
  { label: 'About',      href: '/about' },
  { label: 'Contact',    href: '/contact' },
]

export default function Nav() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location                = useLocation()

  /* Close mobile menu on route change */
  useEffect(() => { setOpen(false) }, [location.pathname])

  /* Add border shadow on scroll */
  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 8)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  /* Trap scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>

        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Uniqletts — home">
          <img src={logo} width={90} height={57} alt="Uniqletts" />
        </Link>

        {/* Desktop nav */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link to="/valuations" className={`btn btn-accent ${styles.desktopCta}`}>
          Free valuation
        </Link>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={`${styles.bar} ${open ? styles.bar1Open : ''}`} />
          <span className={`${styles.bar} ${open ? styles.bar2Open : ''}`} />
          <span className={`${styles.bar} ${open ? styles.bar3Open : ''}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/valuations" className={`btn btn-accent ${styles.drawerCta}`}>
            Free valuation
          </Link>
        </nav>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
