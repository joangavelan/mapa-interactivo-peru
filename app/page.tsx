'use client'

import type { Centroid, RegionProps, Territory, TerritoryTypes } from '@/types'
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
  highlightLayer,
  moving_label_styles,
  province_area_styles,
  province_outline_styles,
  region_area_styles,
  region_outline_styles,
  territories_outline_styles
} from './layer-styles'
import { getCentroidFeatures, getFixedLabelFilter } from './utils'

const peru_bbox = [-84.6356535, -18.3984472, -68.6519906, -0.0392818]

export default function Home() {
  const [entered_territories, setEnteredTerritories] = React.useState<
    Territory[]
  >([])
  const grouped_territories = React.useRef<TerritoryTypes>({
    regions: [],
    provinces: [],
    districts: []
  })
  const all_territories = React.useRef<Territory[]>([])

  const [regions, setRegions] = React.useState<RegionProps>({
    boundaries: [],
    centers: []
  })

  const [dynamicCentroids, setDynamicCentroids] = React.useState<Centroid[]>([])
  const [fixedLabelsFilter, setFixedLabelsFilter] = React.useState<any[]>([
    'all',
    true
  ])
  const [movingLabelsFilter, setMovingLabelsFilter] = React.useState<any[]>([
    'all',
    true
  ])
  const [hoverInfo, setHoverInfo] = React.useState<{
    longitude: number
    latitude: number
    territoryId?: string
  } | null>(null)

  const onHover = React.useCallback((event: MapLayerMouseEvent) => {
    const territory = event.features && event.features[0]
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      territoryId: territory && territory.properties?.id
    })
  }, [])

  const selectedTerritory = (hoverInfo && hoverInfo.territoryId) || ''

  const filter = React.useMemo(
    () => ['in', 'id', selectedTerritory],
    [selectedTerritory]
  )

  const map_ref = React.useRef<MapRef>(null)
  const region_id = entered_territories[0]?.properties?.id
  const province_id = entered_territories[1]?.properties?.id
  const deepest_entered_territory = entered_territories.at(-1)

  React.useEffect(() => {
    const load_territories = async () => {
      const data = await get_territories()
      grouped_territories.current = data
      all_territories.current = [
        ...data.regions,
        ...data.provinces,
        ...data.districts
      ]
      // set initial regions boundaries and centers
      const regions_centers = data.regions.map((region) => {
        return turf.point(region?.properties?.com, {
          name: region.properties?.name,
          id: region.properties?.id
        })
      })
      setRegions({
        boundaries: data.regions,
        centers: regions_centers
      })
    }

    load_territories()
  }, [])

  const filtered_provinces = React.useMemo(() => {
    if (!region_id) return { boundaries: [], centers: [] }
    return grouped_territories.current.provinces.reduce<RegionProps>(
      (acc, province) => {
        if (province.properties?.id.startsWith(region_id)) {
          acc['boundaries'].push(province)
          acc['centers'].push(
            turf.point(province?.properties?.com, {
              name: province.properties?.name,
              id: province.properties?.id
            })
          )
        }
        return acc
      },
      { boundaries: [], centers: [] }
    )
  }, [region_id])

  const filtered_districts = React.useMemo(() => {
    if (!province_id) return { boundaries: [], centers: [] }
    return grouped_territories.current.districts.reduce<RegionProps>(
      (acc, district) => {
        if (district.properties?.id.startsWith(province_id)) {
          acc['boundaries'].push(district)
          acc['centers'].push(
            turf.point(district?.properties?.com, {
              name: district.properties?.name,
              id: district.properties?.id
            })
          )
        }
        return acc
      },
      { boundaries: [], centers: [] }
    )
  }, [province_id])

  const handleLeftClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    const clicked_point = turf.point([lng, lat])

    const clicked_territories: Territory[] = []

    for (const territory of all_territories.current) {
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

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    const { centroidFeatures } = getCentroidFeatures({
      map: e.target,
      layers: ['region_area', 'province_area', 'district_area']
    })
    const fixedLabelFilter = getFixedLabelFilter(centroidFeatures)

    setDynamicCentroids(centroidFeatures)

    if (entered_territories.length) {
      setFixedLabelsFilter(
        fixedLabelFilter.concat(
          ...[
            entered_territories[0]?.properties?.id,
            entered_territories[1]?.properties?.id
          ].filter(Boolean)
        )
      )
      setMovingLabelsFilter([
        '!in',
        'id',
        ...[
          entered_territories[0]?.properties?.id,
          entered_territories[1]?.properties?.id
        ].filter(Boolean)
      ])
    } else {
      setFixedLabelsFilter(['all', true])
      setMovingLabelsFilter(['all', false])
    }
  }

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
      onMouseMove={onHover}
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
        <Layer {...highlightLayer} filter={filter} />
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
        <Layer {...fixed_label_styles} filter={fixedLabelsFilter} />
      </Source>
      <Source
        id='territories-moving-centers'
        type='geojson'
        data={{
          type: 'FeatureCollection',
          features: dynamicCentroids
        }}
      >
        <Layer {...moving_label_styles} filter={movingLabelsFilter} />
      </Source>
      <ScaleControl />
      <FullscreenControl />
      <GeolocateControl />
      <NavigationControl />
    </Map>
  )
}
