import logo from '../../assets/logo.webp'

export function StudioLogo() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <img src={logo} alt="Uniqletts" width={40} height={25} style={{ display: 'block' }} />
      <span
        style={{
          fontFamily: "'Nunito Sans', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: '0.9375rem',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        Uniqletts Admin
      </span>
    </span>
  )
}
