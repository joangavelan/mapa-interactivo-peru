import type { BBox, Feature, Point, Polygon } from 'geojson'

export type TerritoryProps = {
  id: string
  name: string
  com?: Point
  bbox?: BBox
}

export type Territory = Feature<Polygon, TerritoryProps>

export type Centroid = Feature<Point, TerritoryProps>

export type TerritoryTypes = {
  regions: Territory[]
  provinces: Territory[]
  districts: Territory[]
}

export type TerritoryFeatures = {
  boundaries: Territory[]
  centers: Centroid[]
}
