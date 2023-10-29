import type { Marker, Place, Route } from '@/types'
import { sanity } from './client'

export const getRoutes = async (): Promise<Route[]> => {
  return sanity.fetch({
    query: `
    *[_type == "route"] | order(dateTime(_updatedAt) desc) 
    {
      _id,
      name,
      "hex_color": color.hex
    }
  `
  })
}

export const getMarkers = (): Promise<Marker[]> => {
  return sanity.fetch({
    query: `
      *[_type == "place"]
      { 
        _id, 
        title, 
        "coordinates": coordinates{ lng, lat },
        "route": route->{ _id, name, "icon_url": icon.asset->url, "hex_color": color.hex },
        "popup": {
          "featured_image": images[0].asset->{ _id, url, title, altText, "lqip": metadata.lqip },
          "description": description[0].children[0].text,
          "slug": slug.current
        } 
      }
    `
  })
}

export const getPlace = (slug: string): Promise<Place> => {
  return sanity.fetch({
    query: `
    *[_type == "place" && slug.current == "${slug}"][0]
    {
      _id,
      "slug": slug.current,
      title,
      location,
      "description": description[].children[]{ _key, "paragraph": text },
      "images": images[].asset->{ _id, url, title, altText, "lqip": metadata.lqip },
      directions,
      "services": services[]{ label, value },
      near_cities,
      "route": route->{ _id, name, "icon_url": icon.asset->url, "hex_color": color.hex },
      "coordinates": coordinates{ lng, lat }
    }
  `
  })
}
