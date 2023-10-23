import { Feature, Polygon } from 'geojson'

export type TerritoryProps = {
  id: string
  name: string
}

export type Territory = Feature<Polygon, TerritoryProps>
