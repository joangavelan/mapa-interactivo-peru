'use client'

import * as React from 'react'
import { SearchBar } from './search-bar'
import { SearchResults } from './search-results'
import { useSearch } from '@/stores'
import { get_territories } from './get-territories'
import { Territory } from '@/types'

export const SearchBox = () => {
  const { searchQuery } = useSearch()
  const [territories, setTerritories] = React.useState<Territory[]>([])

  React.useEffect(() => {
    const load_territories = async () => {
      const { regions, provinces, districts } = await get_territories()
      const territories = [...regions, ...provinces, ...districts]
      setTerritories(territories)
    }
    load_territories()
  }, [])

  return (
    <div className='relative w-72'>
      <SearchBar />
      {searchQuery && <SearchResults territories={territories} />}
    </div>
  )
}
