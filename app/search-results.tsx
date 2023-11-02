'use client'

import { useSearch } from '@/stores'
import { Territory } from '@/types'
import * as React from 'react'
import { capitalizeWords, getTerritoryType } from './utils'

type Props = {
  territories: Territory[]
}

export const SearchResults: React.FC<Props> = ({ territories }) => {
  const { searchQuery, setClickedResultId } = useSearch()

  const results = territories
    .filter((t) => t.properties.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .slice(0, 5)

  return (
    <div className='absolute bg-white text-gray-800 top-16 p-3 w-full rounded flex flex-col gap-2'>
      {results.length ? (
        results.map((r) => (
          <div
            key={r.properties.id}
            className='flex flex-col hover:bg-slate-100 py-2 px-2.5 cursor-pointer'
            onClick={() => setClickedResultId(r.properties.id)}
          >
            <h3>{capitalizeWords(r.properties.name)}</h3>
            <p>{getTerritoryType(r.properties.id)}</p>
          </div>
        ))
      ) : (
        <p className='py-2 px-2.5'>Sin resultados</p>
      )}
    </div>
  )
}
