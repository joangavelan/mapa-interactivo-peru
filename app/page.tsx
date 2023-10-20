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
    const orid = entered_territories[0].properties.id
    return territories.provinces.filter((province) => province.properties.id.startsWith(orid))
  }, [entered_territories])

  const filtered_districts = React.useMemo(() => {
    if (entered_territories.length < 2) return []
    const opid = entered_territories[1].properties.id
    return territories.districts.filter((district) => district.properties.id.startsWith(opid))
  }, [entered_territories])

  React.useEffect(() => {
    const deepest_territory = entered_territories[entered_territories.length - 1]

    map_ref.current?.fitBounds(
      (deepest_territory?.properties.bbox ?? peru_bbox) as LngLatBoundsLike,
      {
        duration: 1000,
        padding: 20
      }
    )
  }, [entered_territories])

  const handleLeftClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    const clicked_point = turf.point([lng, lat])

    let clicked_territories = [] as Territory[]

    for (let i = 0; i < all_territories.length; i++) {
      if (turf.booleanPointInPolygon(clicked_point, all_territories[i].geometry)) {
        clicked_territories.push(all_territories[i])
        const cts_length = clicked_territories.length

        if (
          cts_length &&
          clicked_territories[cts_length - 1].properties.id !==
            entered_territories[cts_length - 1]?.properties?.id
        ) {
          break
        }
      }
    }

    setEnteredTerritories(clicked_territories)
  }

  const handleRightClick = () => {
    setEnteredTerritories((territories) => territories.slice(0, -1))
  }

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
