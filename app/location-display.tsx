import * as React from 'react'
import { Territory } from '@/types'

export const LocationDisplay = ({ enteredTerritories }: { enteredTerritories: Territory[] }) => {
  const location = enteredTerritories
    .map((t) => t.properties.name)
    .reverse()
    .join(', ')

  return (
    <div className='absolute top-10 left-10 bg-white px-4 py-3.5 rounded-md border shadow-sm'>
      <p className='text-sm text-gray-600'>{location || 'Seleciona un territorio'}</p>
    </div>
  )
}
