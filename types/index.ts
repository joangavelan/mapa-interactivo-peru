import { Feature, Polygon, BBox } from 'geojson'

export type TerritoryProps = {
  id: 'string'
  name: 'string'
  bbox: BBox
}

export type Territory = Feature<Polygon, TerritoryProps>
