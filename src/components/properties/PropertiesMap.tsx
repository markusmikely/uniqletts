import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { divIcon, latLngBounds } from 'leaflet'
import { formatPrice } from '@/lib/format'
import type { Property } from '@/types'
import 'leaflet/dist/leaflet.css'
import styles from './PropertiesMap.module.css'

const LONDON_CENTRE: [number, number] = [51.5074, -0.1278]

interface PropertiesMapProps {
  properties: Property[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

/** Keeps the viewport fitted to the current marker set. */
function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    const points = properties
      .filter(p => p.geopoint)
      .map(p => [p.geopoint!.lat, p.geopoint!.lng] as [number, number])
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
  }, [map, properties])

  return null
}

export default function PropertiesMap({ properties, selectedSlug, onSelect }: PropertiesMapProps) {
  const markers = useMemo(
    () => properties.filter(p => p.geopoint),
    [properties]
  )

  return (
    <MapContainer
      center={LONDON_CENTRE}
      zoom={11}
      className={styles.map}
      scrollWheelZoom={false}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={markers} />
      {markers.map(p => {
        const selected = p.slug === selectedSlug
        const icon = divIcon({
          className: '',
          html: `<span class="${styles.pin} ${selected ? styles.pinSelected : ''}">${formatPrice(p.price, p.pricePeriod)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })
        return (
          <Marker
            key={p.slug}
            position={[p.geopoint!.lat, p.geopoint!.lng]}
            icon={icon}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p.slug) }}
          />
        )
      })}
    </MapContainer>
  )
}
