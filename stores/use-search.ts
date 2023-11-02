import { create } from 'zustand'

type State = {
  searchQuery: string
  clickedResultId: string
  setSearchQuery: (q: string) => void
  setClickedResultId: (tid: string) => void
}

export const useSearch = create<State>((set) => ({
  searchQuery: '',
  clickedResultId: '',
  setSearchQuery: (q) => set(() => ({ searchQuery: q })),
  setClickedResultId: (tid: string) => set(() => ({ clickedResultId: tid }))
}))
