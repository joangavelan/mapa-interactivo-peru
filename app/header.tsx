import React from 'react'
import logo from './assets/culturalismo-logo-blanco.png'
import Image from 'next/image'
import { SearchBox } from './search-box'
import { RouteFilters } from './route-flters'
import { getRoutes } from '@/lib/sanity'

export const Header = async () => {
  const routes = await getRoutes()

  return (
    <div className='relative p-10 z-10 flex items-center gap-8'>
      <Image src={logo} alt='logo' width={50} height={50} />

      <SearchBox />

      <RouteFilters routes={routes} />
    </div>
  )
}
