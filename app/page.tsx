'use client'

import * as React from 'react'
import Map, { Layer, Source, MapRef, MapLayerMouseEvent, LngLatBoundsLike } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import territories from './assets/territories'
import type { Territory } from '@/types'
import { LocationDisplay } from './location-display'
// @ts-ignore
import * as turf from '@turf/turf'

const all_territories = [...territories.regions, ...territories.provinces, ...territories.districts]

const peru_bbox = [-84.6356535, -18.3984472, -68.6519906, -0.0392818]

export default function Home() {
  const [entered_territories, setEnteredTerritories] = React.useState<Territory[]>([])

  const map_ref = React.useRef<MapRef>(null)

  const filtered_provinces = React.useMemo(() => {
    if (!entered_territories[0]) return []
    const erid = entered_territories[0].properties.id
    return territories.provinces.filter((province) => province.properties.id.startsWith(erid))
  }, [entered_territories])

  const filtered_districts = React.useMemo(() => {
    if (!entered_territories[1]) return []
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

  const deepest_entered_territory = entered_territories.at(-1)

  React.useEffect(() => {
    map_ref.current?.fitBounds((deepest_entered_territory?.bbox ?? peru_bbox) as LngLatBoundsLike, {
      duration: 1400,
      padding: 20
    })
  }, [deepest_entered_territory])

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
      <LocationDisplay enteredTerritories={entered_territories} />

      <Source
        id='visible-territories'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: [...territories.regions, ...filtered_provinces, ...filtered_districts]
        }}
      >
        <Layer
          id='visible-territories-default-outline'
          type='line'
          paint={{
            'line-color': '#ccc',
            'line-width': 1.5
          }}
        />
      </Source>

      <Source
        id='entered-territories'
        type='geojson'
        data={{ type: 'FeatureCollection', features: entered_territories }}
      >
        <Layer
          id='entered-territories-outline'
          type='line'
          paint={{
            'line-color': '#888',
            'line-width': 1.5
          }}
        />
      </Source>

      {deepest_entered_territory && (
        <Source id='deepest-entered-territory' type='geojson' data={deepest_entered_territory}>
          <Layer
            id='deepest-entered-territory-white-outline'
            type='line'
            paint={{
              'line-color': '#fff',
              'line-width': 1.5
            }}
          />
          <Layer
            id='deepest-entered-territory-red-outline'
            type='line'
            paint={{
              'line-color': '#FF0036',
              'line-width': 1.5,
              'line-dasharray': [3, 3]
            }}
          />
        </Source>
      )}
    </Map>
  )
}
