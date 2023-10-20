'use client'

import * as React from 'react'
import Map, { Layer, Source, MapRef, MapLayerMouseEvent, LngLatBoundsLike } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import territories from './assets/territories'
import { territories_outline } from './assets/layer-styles'
import type { Territory } from '@/types'
// @ts-ignore
import * as turf from '@turf/turf'

const all_territories = [...territories.regions, ...territories.provinces, ...territories.districts]

const peru_bbox = [-84.6356535, -18.3984472, -68.6519906, -0.0392818]

export default function Home() {
  const [entered_territories, setEnteredTerritories] = React.useState<Territory[]>([])

  const map_ref = React.useRef<MapRef>(null)

  const filtered_provinces = React.useMemo(() => {
    if (entered_territories.length < 1) return []
    const erid = entered_territories[0].properties.id
    return territories.provinces.filter((province) => province.properties.id.startsWith(erid))
  }, [entered_territories])

  const filtered_districts = React.useMemo(() => {
    if (entered_territories.length < 2) return []
    const epid = entered_territories[1].properties.id
    return territories.districts.filter((district) => district.properties.id.startsWith(epid))
  }, [entered_territories])

  const handleLeftClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    const clicked_point = turf.point([lng, lat])

    const clicked_territories: Territory[] = []

    for (let i = 0; i < all_territories.length; i++) {
      const territory = all_territories[i]

      if (turf.booleanPointInPolygon(clicked_point, territory.geometry)) {
        clicked_territories.push(territory)

        if (
          clicked_territories[clicked_territories.length - 1]?.properties.id !==
          entered_territories[clicked_territories.length - 1]?.properties.id
        ) {
          break
        }
      }
    }

    if (clicked_territories.length) setEnteredTerritories(clicked_territories)
  }

  const handleRightClick = () => {
    setEnteredTerritories((territories) => territories.slice(0, -1))
  }

  React.useEffect(() => {
    const deepest_territory = entered_territories[entered_territories.length - 1]

    map_ref.current?.fitBounds((deepest_territory?.bbox ?? peru_bbox) as LngLatBoundsLike, {
      duration: 1400,
      padding: 20
    })
  }, [entered_territories])

  return (
    <Map
      ref={map_ref}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        latitude: -9.061119,
        longitude: -78.57901,
        zoom: 5
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle={process.env.NEXT_PUBLIC_MAPBOX_MAPSTYLE}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
    >
      <Source
        id='territories'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: [...territories.regions, ...filtered_provinces, ...filtered_districts]
        }}
      >
        <Layer {...territories_outline} />
      </Source>
    </Map>
  )
}
