// @ts-ignore
import * as turf from '@turf/turf'
import type { Feature, Point, Polygon, Position } from 'geojson'
import mapboxgl, { MapboxGeoJSONFeature } from 'mapbox-gl'
import polylabel from 'polylabel'

type Centroid = Feature<Point, { name: string; id: string }>

export const groupBy = <T>(list: T[], keyGetter: (arg: T) => string) => {
  const map = new Map<string, T[]>()
  list.forEach(function (item) {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

export const getVisualCenter = (
  feature: Feature,
  mapViewBound: Feature<Polygon>
): Centroid | undefined => {
  if (feature?.geometry?.type == 'Polygon') {
    const intersection = turf.intersect(mapViewBound, feature.geometry)
    if (intersection) {
      const visualCenter: Centroid = turf.point([0, 0], {
        name: feature.properties?.name,
        id: feature.properties?.id
      })
      if (intersection.geometry.coordinates.length > 1) {
        const intersections: Position[] = []
        intersection.geometry.coordinates.forEach(function (
          coordinate: Position[][]
        ) {
          intersections.push(polylabel(coordinate))
        })

        visualCenter.geometry.coordinates = getCenter(intersections)
      } else {
        visualCenter.geometry.coordinates = polylabel(
          intersection.geometry.coordinates
        )
      }
      return visualCenter
    }
  }
}

export const getCenter = (coordinates: Position[]): Position => {
  const lngList: Position = []
  const latList: Position = []
  coordinates.forEach((coordinate) => {
    lngList.push(coordinate[0])
    latList.push(coordinate[1])
  })
  const meanLng = lngList.reduce((p, c) => p + c, 0) / lngList.length
  const meanLat = latList.reduce((p, c) => p + c, 0) / latList.length
  return [meanLng, meanLat]
}

export const setBoundsForLabels: (map: mapboxgl.Map) => ({
  layers,
  labelKey
}: {
  layers: string[]
  labelKey: string
}) => {
  fixedLabelFilter: string[]
  centroidFeatures: Centroid[]
} = (map) => {
  const mapBounds = map.getBounds()
  const mapViewBound = getMapViewBounds(mapBounds)
  return ({ layers, labelKey }) => {
    const features: MapboxGeoJSONFeature[] = map.queryRenderedFeatures(
      undefined,
      {
        layers
      }
    )
    const visualCenterList: Centroid[][] = []
    const fixedLabelFilter = ['!in', labelKey]
    const groups = groupBy(features, (feature) => feature.properties![labelKey])
    groups.forEach((value, key) => {
      const centerOfMass = JSON.parse(value[0].properties!.com)
      if (!mapBounds.contains(centerOfMass)) {
        fixedLabelFilter.push(key)
        const visualCenter = value.map((obj) =>
          getVisualCenter(obj, mapViewBound)
        )
        const cleared = visualCenter.filter(Boolean) as Feature<
          Point,
          { name: string; id: string }
        >[]
        if (cleared.length) {
          visualCenterList.push(cleared)
        }
      }
    })
    const centroidFeatures: Centroid[] = []
    visualCenterList.forEach((obj) => {
      const coordinatesList: Position[] = []
      obj.forEach(function (feature) {
        coordinatesList.push(feature.geometry.coordinates)
      })
      const center = getCenter(coordinatesList)

      const centerFeature: Centroid = turf.point(center, {
        name: obj[0].properties!.name,
        id: obj[0].properties!.id
      })
      centroidFeatures.push(centerFeature)
    })
    return {
      fixedLabelFilter,
      centroidFeatures
    }
  }
}

export const getMapViewBounds = (
  mapBounds: mapboxgl.LngLatBounds
): Feature<Polygon> => {
  const southWest = [mapBounds.getWest(), mapBounds.getSouth()]
  const northEast = [mapBounds.getEast(), mapBounds.getNorth()]
  const mapViewBound: Feature<Polygon> = turf.polygon([
    [
      southWest,
      [northEast[0], southWest[1]],
      northEast,
      [southWest[0], northEast[1]],
      southWest
    ]
  ])
  return mapViewBound
}
