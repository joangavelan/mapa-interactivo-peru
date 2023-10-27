'use client'

import type { Centroid, Territory, TerritoryTypes } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'
// @ts-ignore
import * as turf from '@turf/turf'
import * as React from 'react'
import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  LngLatBoundsLike,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  ScaleControl,
  Source,
  ViewStateChangeEvent
} from 'react-map-gl'
import { get_territories } from './get-territories'
import { LocationDisplay } from './location-display'

import {
  district_area_selected_styles,
  district_area_styles,
  district_outline_styles,
  fixed_label_styles,
  hoverLayer,
  moving_label_styles,
  province_area_styles,
  province_outline_styles,
  region_area_styles,
  region_outline_styles,
  territories_outline_styles
} from './layer-styles'
import {
  getBoundariesAndCenters,
  getCentroidFeatures,
  getFixedLabelFilter
} from './utils'

const peru_bbox = [-84.6356535, -18.3984472, -68.6519906, -0.0392818]

export default function Home() {
  const map_ref = React.useRef<MapRef>(null)
  const [entered_territories, setEnteredTerritories] = React.useState<
    Territory[]
  >([])
  const [territory_data, setTerritoryData] = React.useState<TerritoryTypes>({
    regions: [],
    provinces: [],
    districts: []
  })
  const [dynamic_centroids, setDynamicCentroids] = React.useState<Centroid[]>(
    []
  )

  const [hover_info, setHoverInfo] = React.useState<{
    longitude: number
    latitude: number
    territoryId?: string
  } | null>(null)

  const region_id = entered_territories[0]?.properties?.id
  const province_id = entered_territories[1]?.properties?.id
  const deepest_entered_territory = entered_territories.at(-1)
  const hovered_territory = (hover_info && hover_info.territoryId) || ''

  const hoverFilter = React.useMemo(
    () => ['in', 'id', hovered_territory],
    [hovered_territory]
  )

  const all_territories = React.useMemo(() => {
    return [
      ...territory_data.regions,
      ...territory_data.provinces,
      ...territory_data.districts
    ]
  }, [territory_data])

  const regions = React.useMemo(() => {
    const regions_centers = territory_data.regions.map((region) => {
      return turf.point(region?.properties?.com, {
        name: region.properties?.name,
        id: region.properties?.id
      })
    })
    return {
      boundaries: territory_data.regions,
      centers: regions_centers
    }
  }, [territory_data])

  const filtered_provinces = React.useMemo(() => {
    if (!region_id) return { boundaries: [], centers: [] }
    return getBoundariesAndCenters(territory_data.provinces, region_id)
  }, [region_id, territory_data.provinces])

  const filtered_districts = React.useMemo(() => {
    if (!province_id) return { boundaries: [], centers: [] }
    return getBoundariesAndCenters(territory_data.districts, province_id)
  }, [province_id, territory_data.districts])

  const handleHover = React.useCallback((event: MapLayerMouseEvent) => {
    const territory = event.features && event.features[0]
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      territoryId: territory && territory.properties?.id
    })
  }, [])

  React.useEffect(() => {
    const load_territories = async () => {
      const territories = await get_territories()
      setTerritoryData(territories)
    }
    load_territories()
  }, [])

  const handleLeftClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    const clicked_point = turf.point([lng, lat])
    const clicked_territories: Territory[] = []

    for (const territory of all_territories) {
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

  const handleMoveEnd = React.useCallback(
    (e: ViewStateChangeEvent) => {
      // only calculates if user entered any territory level
      if (entered_territories.length) {
        const { centroidFeatures } = getCentroidFeatures({
          map: e.target,
          layers: ['region_area', 'province_area', 'district_area']
        })
        setDynamicCentroids(centroidFeatures)
      }
    },
    [entered_territories.length]
  )

  React.useEffect(() => {
    map_ref.current?.fitBounds(
      (deepest_entered_territory?.properties?.bbox ??
        peru_bbox) as LngLatBoundsLike,
      {
        duration: 1400,
        padding: 20
      }
    )
  }, [deepest_entered_territory])

  const fixed_labels_filter = React.useMemo(() => {
    if (entered_territories.length) {
      const filter = getFixedLabelFilter(dynamic_centroids)
      return filter.concat(...[region_id, province_id].filter(Boolean))
    }
    return ['all', true]
  }, [dynamic_centroids, entered_territories.length, region_id, province_id])

  const moving_labels_filter = React.useMemo(() => {
    if (entered_territories.length) {
      return ['!in', 'id', ...[region_id, province_id].filter(Boolean)]
    }
    return ['all', false]
  }, [entered_territories.length, region_id, province_id])

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
      onMoveEnd={handleMoveEnd}
      onMouseMove={handleHover}
      interactiveLayerIds={['region_area', 'province_area', 'district_area']}
    >
      <LocationDisplay enteredTerritories={entered_territories} />

      <Source
        id='visible-territories'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: [
            ...regions.boundaries,
            ...filtered_provinces.boundaries,
            ...filtered_districts.boundaries
          ]
        }}
      >
        <Layer {...region_area_styles} />
        <Layer {...province_area_styles} />
        <Layer {...district_area_styles} />
        <Layer {...hoverLayer} filter={hoverFilter} />
        <Layer {...territories_outline_styles} />
      </Source>

      <Source
        id='entered-territories'
        type='geojson'
        data={{ type: 'FeatureCollection', features: entered_territories }}
      >
        <Layer {...region_outline_styles} />
        <Layer {...province_outline_styles} />
        <Layer {...district_area_selected_styles} />
        <Layer {...district_outline_styles} />
      </Source>
      <Source
        id='territories-fixed-centers'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: [
            ...regions.centers,
            ...filtered_provinces.centers,
            ...filtered_districts.centers
          ]
        }}
      >
        <Layer {...fixed_label_styles} filter={fixed_labels_filter} />
      </Source>
      <Source
        id='territories-moving-centers'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: dynamic_centroids
        }}
      >
        <Layer {...moving_label_styles} filter={moving_labels_filter} />
      </Source>
      <ScaleControl />
      <FullscreenControl />
      <GeolocateControl />
      <NavigationControl />
    </Map>
  )
}
