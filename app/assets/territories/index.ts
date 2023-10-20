import regions_data from './regions.json'
import provinces_data from './provinces.json'
import districts_data from './districts.json'
import type { Territory } from '@/types'

const regions: Territory[] = JSON.parse(JSON.stringify(regions_data))
const provinces: Territory[] = JSON.parse(JSON.stringify(provinces_data))
const districts: Territory[] = JSON.parse(JSON.stringify(districts_data))

const territories: Record<string, Territory[]> = {
  regions,
  provinces,
  districts
}

export default territories
