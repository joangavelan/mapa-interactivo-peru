// @ts-nocheck

'use client'

import * as React from 'react'
import Map, { Layer, Source, mapRef, ViewStateChangeEvent, MapLayerMouseEvent } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { raw_regions, raw_provinces, raw_districts } from './assets/territories'
import { territories_outline } from './assets/layer-styles'
import * as turf from '@turf/turf'

const territories = [...raw_regions, ...raw_provinces, ...raw_districts]

function getTerritoryType(territoryId: string) {
  if (territoryId.length === 2) return 'region'
  if (territoryId.length === 4) return 'province'
  if (territoryId.length === 6) return 'district'
}

export default function Home() {
  const [map_view, setMapView] = React.useState(null)

  const map_ref = React.useRef<mapRef>(null)

  // Determine the territories the user has entered
  const entered_territories = React.useMemo(() => {
    if (!map_view) return []

    const larger_center_point = turf.buffer(map_view.center_point, 0.5, {
      units: 'kilometers'
    })

    return territories.reduce((ets, territory) => {
      if (
        (turf.booleanWithin(larger_center_point, territory.geometry) &&
          turf.booleanOverlap(map_view.bounds_polygon, territory.geometry)) ||
        turf.booleanWithin(map_view.bounds_polygon, territory.geometry)
      ) {
        ets[getTerritoryType(territory.properties.id)] = territory
      }
      return ets
    }, {})
  }, [map_view])

  // Get the provinces from the entered region
  const filtered_provinces = React.useMemo(() => {
    if (!entered_territories.region) return []
    const orid = entered_territories.region.properties.id
    return raw_provinces.filter((province) => province.properties.id.startsWith(orid))
  }, [entered_territories.region])

  // Get the districts from the entered province
  const filtered_districts = React.useMemo(() => {
    if (!entered_territories.province) return []
    const opid = entered_territories.province.properties.id
    return raw_districts.filter((district) => district.properties.id.startsWith(opid))
  }, [entered_territories.province])

  // Get map view data whenever there is motion
  const handleMapViewStateChange = (event: ViewStateChangeEvent) => {
    const { longitude, latitude } = event.viewState
    const center_point = turf.point([longitude, latitude])
    const map_bounds = map_ref.current?.getBounds()
    const bounds_polygon = turf.bboxPolygon([
      map_bounds?.getWest(),
      map_bounds?.getSouth(),
      map_bounds?.getEast(),
      map_bounds?.getNorth()
    ])

    setMapView({ bounds_polygon, center_point })
  }

  const handleLeftClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    const clicked_point = turf.point([lng, lat])
    let valid_territory

    if (entered_territories.province) {
      valid_territory = filtered_districts.find((district) =>
        turf.booleanPointInPolygon(clicked_point, district.geometry)
      )
    }

    if (!valid_territory && entered_territories.region) {
      valid_territory = filtered_provinces.find((province) =>
        turf.booleanPointInPolygon(clicked_point, province.geometry)
      )
    }

    if (!valid_territory) {
      valid_territory = raw_regions.find((region) =>
        turf.booleanPointInPolygon(clicked_point, region.geometry)
      )
    }

    if (valid_territory) {
      map_ref.current?.fitBounds(valid_territory.properties.bbox as LngLatBoundsLike, {
        duration: 1000,
        padding: -0.1
      })
    }
  }

  const handleRightClick = () => {
    const { region, province, district } = entered_territories
    const adjacent_territory = district ? province : province ? region : null
    const peru_bbox = [-84.6356535, -18.3984472, -68.6519906, -0.0392818]
    const adjacent_territory_bbox = adjacent_territory?.properties.bbox || peru_bbox

    map_ref.current?.fitBounds(adjacent_territory_bbox as LngLatBoundsLike, {
      duration: 1000,
      padding: -0.1
    })
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
      onDragEnd={handleMapViewStateChange}
      onZoomEnd={handleMapViewStateChange}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
    >
      <Source
        id='territories'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: [...raw_regions, ...filtered_provinces, ...filtered_districts]
        }}
      >
        <Layer {...territories_outline} />
      </Source>
    </Map>
  )
}
