import { Territory } from '@/types'
import * as React from 'react'

export const LocationDisplay = ({ enteredTerritories }: { enteredTerritories: Territory[] }) => {
  const location = enteredTerritories.map((t) => t.properties.name).reverse()

  return (
    <div className='absolute top-10 left-10 bg-white px-4 py-3.5 rounded-md border shadow-sm'>
      <p className='text-sm'>{location.length ? location.join(', ') : 'Seleciona un territorio'}</p>
    </div>
  )
}
