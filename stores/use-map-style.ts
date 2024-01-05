import { MapStyle } from '@/types'
import { create } from 'zustand'

type State = {
  mapStyle: string
  setMapStyle: (mapStyle: MapStyle) => void
}

export const useMapStyle = create<State>((set) => ({
  mapStyle: 'mapbox://styles/joangavelan/clr06wl5c00v401qxgth1bygo',
  setMapStyle: (mapStyle) => set(() => ({ mapStyle: mapStyle }))
}))
