import create from 'zustand'

type State = {
  activeRoutes: string[]
  activateRoute: (routeId: string) => void
  deactivateRoute: (routeId: string) => void
  setActiveRoutes: (routeIds: string[]) => void
}

export const useRouteFilters = create<State>((set) => ({
  activeRoutes: [],
  activateRoute: (id) => set((state) => ({ activeRoutes: [...state.activeRoutes, id] })),
  deactivateRoute: (id) =>
    set((state) => ({
      activeRoutes: state.activeRoutes.filter((activeRouteId) => activeRouteId !== id)
    })),
  setActiveRoutes: (routeIds) => set(() => ({ activeRoutes: routeIds }))
}))
