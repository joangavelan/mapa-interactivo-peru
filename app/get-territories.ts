import type { Territory } from '@/types'

export const get_territories = async () => {
  const [
    {
      // @ts-ignore
      value: { features: regions }
    },
    {
      // @ts-ignore
      value: { features: provinces }
    },
    {
      // @ts-ignore
      value: { features: districts }
    }
  ] = await Promise.allSettled([
    import('./assets/territories/regions.json'),
    import('./assets/territories/provinces.json'),
    import('./assets/territories/districts.json')
  ])
  const territories: Record<'regions' | 'provinces' | 'districts', Territory[]> = {
    regions,
    provinces,
    districts
  }
  return territories
}
