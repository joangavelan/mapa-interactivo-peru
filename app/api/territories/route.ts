import regions from '@/app/assets/territories-api-data/regions.json'
import provinces from '@/app/assets/territories-api-data/provinces.json'
import districts from '@/app/assets/territories-api-data/districts.json'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const territories = { regions, provinces, districts }

  return new Response(JSON.stringify(territories))
}
