'use client'

import { useMapStyle } from '@/stores'

export enum MapStyles {
  satelite = 'mapbox://styles/joangavelan/cloajpwg700qd01qp0h5ifff1',
  streets = 'mapbox://styles/joangavelan/clr06wl5c00v401qxgth1bygo'
}

export const StyleControls = () => {
  const { setMapStyle } = useMapStyle()

  return (
    <div className='absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-3'>
      <button
        className='bg-white px-3 py-2 rounded text-gray-700'
        onClick={() => setMapStyle(MapStyles.satelite)}
      >
        Satelital
      </button>
      <button
        className='bg-white px-3 py-2 rounded text-gray-700'
        onClick={() => setMapStyle(MapStyles.streets)}
      >
        Plano
      </button>
    </div>
  )
}
