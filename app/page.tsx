import * as React from 'react'
import { MapSection } from './map-section'
import { Header } from './header'

export default function Home() {
  return (
    <div className='relative h-screen'>
      <Header />
      <MapSection />
    </div>
  )
}
