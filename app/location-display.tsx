import * as React from 'react'
import { Territory } from '@/types'
import { BiWorld } from 'react-icons/bi'

export const LocationDisplay = ({ enteredTerritories }: { enteredTerritories: Territory[] }) => {
  const location = enteredTerritories
    .map((t) => t.properties.name)
    .reverse()
    .join(', ')

  return (
    <div className='absolute left-1/2 -translate-x-1/2 bottom-0 bg-white px-4 py-2.5 rounded-tl-md rounded-tr-md border shadow-sm flex items-center gap-2'>
      <BiWorld className='text-lg text-gray-600' />
      <p className='text-sm text-gray-600'>{location || 'Seleciona un territorio'}</p>
    </div>
  )
}
