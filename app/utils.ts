import { Centroid, Territory, TerritoryFeatures, TerritoryProps } from '@/types'
// @ts-ignore
import * as turf from '@turf/turf'
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import mapboxgl, { MapboxGeoJSONFeature } from 'mapbox-gl'
import polylabel from 'polylabel'

export const groupListByKey = <T>(list: T[], keyGetter: (arg: T) => string) => {
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
  if (feature.geometry.type == 'Polygon') {
    const intersection: Feature<Polygon | MultiPolygon> = turf.intersect(
      mapViewBound,
      feature.geometry
    )
    if (intersection) {
      const visualCenter: Centroid = turf.point([0, 0], {
        name: feature.properties?.name,
        id: feature.properties?.id
      })
      if (intersection.geometry.coordinates.length > 1) {
        const intersections: Position[] = []
        intersection.geometry.coordinates.forEach((coordinate) => {
          let centroidLike = polylabel(coordinate as Position[][])
          if (centroidLike.some((value) => isNaN(value))) {
            // Need to do this, since there is a chance polylabel returns [NaN, NaN, distance: NaN] and the label
            // this happens because of how intersection polygon (multipolygon?) is calculated for territories that include "holes", like lakes.
            // polylabel needs an extra [] wrapping the coordinates array
            // https://github.com/mapbox/polylabel/issues/25
            // https://github.com/mapbox/polylabel/issues/39#issuecomment-396855257
            // I thought about using this for all coordinates when intersection has > 1 coordinates, but doesn't work and there seems to be no pattern
            centroidLike = polylabel([coordinate] as Position[][])
          }
          intersections.push(centroidLike)
        })

        visualCenter.geometry.coordinates = getCenter(intersections)
      } else {
        visualCenter.geometry.coordinates = polylabel(
          intersection.geometry.coordinates as Position[][]
        )
      }
      return visualCenter
    }
  }
}

// calculates the mean for the given coordinates
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

// get centroids (Point like feature) for visible territories
export const getCentroidFeatures = ({
  map,
  layers,
  uniqueIdentifier = 'id'
}: {
  map: mapboxgl.Map
  layers: string[]
  uniqueIdentifier?: string
}) => {
  const mapBounds = map.getBounds()
  const mapViewBounds = getMapViewBounds(mapBounds)
  const features: MapboxGeoJSONFeature[] = map.queryRenderedFeatures(undefined, {
    layers
  })
  const visualCenterList: Centroid[][] = []
  const groups = groupListByKey(
    features,
    (feature) => feature.properties![uniqueIdentifier!] // assumes unique identifier in properties
  )
  groups.forEach((features) => {
    const centerOfMass = JSON.parse(features[0].properties!.com)
    if (!mapBounds.contains(centerOfMass)) {
      const visualCenter = features
        .map((feature) => getVisualCenter(feature, mapViewBounds))
        .filter(Boolean) as Centroid[]
      if (visualCenter.length) {
        visualCenterList.push(visualCenter)
      }
    }
  })
  const centroidFeatures: Centroid[] = visualCenterList.map((featureList) => {
    const coordinatesList: Position[] = featureList.map((feature) => feature.geometry.coordinates)
    const center = getCenter(coordinatesList)

    const centerFeature: Centroid = turf.point(center, {
      name: featureList[0].properties!.name,
      id: featureList[0].properties!.id
    })
    return centerFeature
  })
  return {
    centroidFeatures
  }
}

export const getFixedLabelFilter = (features: Centroid[], identifier = 'id') => {
  return [
    '!in',
    identifier,
    ...features.map((feature) => feature.properties[identifier as keyof TerritoryProps])
  ]
}

export const getMapViewBounds = (mapBounds: mapboxgl.LngLatBounds): Feature<Polygon> => {
  const southWest = [mapBounds.getWest(), mapBounds.getSouth()]
  const northEast = [mapBounds.getEast(), mapBounds.getNorth()]
  const mapViewBound: Feature<Polygon> = turf.polygon([
    [southWest, [northEast[0], southWest[1]], northEast, [southWest[0], northEast[1]], southWest]
  ])
  return mapViewBound
}

export const getBoundariesAndCenters = (territoryGroup: Territory[], territory_id: string) => {
  return territoryGroup.reduce<TerritoryFeatures>(
    (acc, territory) => {
      if (territory.properties?.id.startsWith(territory_id)) {
        acc['boundaries'].push(territory)
        acc['centers'].push(
          turf.point(territory?.properties?.com, {
            name: territory.properties?.name,
            id: territory.properties?.id
          })
        )
      }
      return acc
    },
    { boundaries: [], centers: [] }
  )
}

export const getTerritoryType = (id: string) => {
  if (id.length === 2) return 'Departamento'
  if (id.length === 4) return 'Provincia'
  if (id.length === 6) return 'Distrito'
}

export const capitalizeWords = (str: string) =>
  str.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase())
