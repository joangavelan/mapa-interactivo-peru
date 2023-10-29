'use client'

import * as React from 'react'
import { Route } from '@/types'
import { useRouteFilters } from '@/stores'
import { AiOutlinePlus } from 'react-icons/ai'

type RouteFiltersProps = {
  routes: Route[]
}

export const RouteFilters: React.FC<RouteFiltersProps> = ({ routes }) => {
  const routeFilters = useRouteFilters()

  const allRouteIds = routes.map((r) => r._id)

  const areAllRoutesActive = routeFilters.activeRoutes.length === routes.length

  const toggleAllRoutesActivation = () => {
    areAllRoutesActive
      ? routeFilters.setActiveRoutes([])
      : routeFilters.setActiveRoutes(allRouteIds)
  }

  const toggleSingleRouteActivation = (routeId: string) => {
    routeFilters.activeRoutes.includes(routeId)
      ? routeFilters.deactivateRoute(routeId)
      : routeFilters.activateRoute(routeId)
  }

  return (
    <div className='flex gap-8 items-center'>
      <ul className='flex justify-between gap-6'>
        {routes.map((r) => {
          const isRouteActive = routeFilters.activeRoutes.includes(r._id)

          return (
            <li key={r._id}>
              <button
                onClick={() => toggleSingleRouteActivation(r._id)}
                className='text-sm px-3.5 py-1 rounded-full bg-gray-300 text-gray-800'
                style={
                  isRouteActive
                    ? {
                        backgroundColor: r.hex_color,
                        color: 'white'
                      }
                    : undefined
                }
              >
                Ruta {r.name}
              </button>
            </li>
          )
        })}
      </ul>

      <button
        className='bg-gray-300 text-gray-700 p-3 rounded'
        style={{
          backgroundColor: areAllRoutesActive ? '#FF0036' : undefined,
          color: areAllRoutesActive ? 'white' : undefined
        }}
        onClick={toggleAllRoutesActivation}
      >
        <AiOutlinePlus />
      </button>
    </div>
  )
}
