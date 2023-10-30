import * as React from 'react'
import { MapSection } from './map-section'
import { Header } from './header'
import { getMarkers } from '@/lib/sanity'

export default async function Home() {
  const markers = await getMarkers()

  return (
    <div className='relative h-screen'>
      <Header />
      <MapSection markers={markers} />
    </div>
  )
}
