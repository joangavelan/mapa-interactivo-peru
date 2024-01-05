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

export type Coordinates = {
  lng: number
  lat: number
}

export type Image = {
  _id: string
  altText: string
  title: string
  url: string
  lqip: string
}

export type Service = {
  label: string
  value: 'hotel' | 'restaurant' | 'sshh'
}

export type Route = {
  _id: string
  name: string
  hex_color: string
}

export type Place = {
  _id: string
  title: string
  coordinates: Coordinates
  description: { _key: string; paragraph: string }[]
  directions: string
  images: Image[]
  location: string
  near_cities: string[]
  route: Route & { icon_url: string }
  services: Service[]
  slug: string
}

export type Marker = {
  _id: string
  title: string
  coordinates: Coordinates
  route: Route & { icon_url: string }
  featured_image: Image
  description: string
  slug: string
}

export type MapStyle =
  | 'mapbox://styles/joangavelan/cloajpwg700qd01qp0h5ifff1'
  | 'mapbox://styles/joangavelan/clr06wl5c00v401qxgth1bygo'
