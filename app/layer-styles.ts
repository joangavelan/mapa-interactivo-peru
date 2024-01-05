import type { LayerProps } from 'react-map-gl'

export const visible_territories_outline_styles: LayerProps = {
  id: 'visible-territories-outline-styles',
  type: 'line',
  paint: {
    'line-color': '#b3b3b3',
    'line-width': 1.5
  }
}

export const region_area_styles: LayerProps = {
  id: 'region_area',
  type: 'fill',
  paint: {
    'fill-color': 'transparent'
  },
  filter: ['==', ['length', ['get', 'id']], 2]
}

export const province_area_styles: LayerProps = {
  id: 'province_area',
  type: 'fill',
  paint: {
    'fill-color': 'transparent'
  },
  filter: ['==', ['length', ['get', 'id']], 4]
}

export const district_area_styles: LayerProps = {
  id: 'district_area',
  type: 'fill',
  paint: {
    'fill-color': 'transparent'
  },
  filter: ['==', ['length', ['get', 'id']], 6]
}

export const entered_territories_outline_styles: LayerProps = {
  id: 'entered-territories-outline',
  type: 'line',
  paint: {
    'line-color': 'red',
    'line-width': 1.5
  }
}

export function moving_label_styles({
  textColor,
  textHaloColor
}: {
  textColor: string
  textHaloColor: string
}): LayerProps {
  return {
    id: 'moving_labels',
    type: 'symbol',
    layout: {
      'text-field': '{name}',
      'text-size': {
        base: 1,
        stops: [
          [12, 12],
          [16, 16]
        ]
      },
      'text-padding': 3,
      'text-letter-spacing': 0.1,
      'text-max-width': 7,
      'text-transform': 'uppercase',
      'text-allow-overlap': true // to avoid label collision, optionally can be true but they will clutter
    },
    paint: {
      'text-color': textColor,
      'text-halo-color': textHaloColor,
      'text-halo-width': 1.5,
      'text-halo-blur': 1
    }
  }
}

export function fixed_label_styles({
  textColor,
  textHaloColor
}: {
  textColor: string
  textHaloColor: string
}): LayerProps {
  return {
    id: 'fixed_labels',
    type: 'symbol',
    layout: {
      'text-field': '{name}',
      'text-size': {
        base: 1,
        stops: [
          [12, 12],
          [16, 16]
        ]
      },
      'text-padding': 3,
      'text-letter-spacing': 0.1,
      'text-max-width': 7,
      'text-transform': 'uppercase',
      'text-allow-overlap': false // to avoid label collision,
    },
    paint: {
      'text-color': textColor,
      'text-halo-color': textHaloColor,
      'text-halo-width': 1.5,
      'text-halo-blur': 1
    }
  }
}

// Highlighted territory polygons
export const hovered_territory_style: LayerProps = {
  id: 'territory-hover',
  type: 'line',
  source: 'visible-territories',
  paint: {
    'line-color': 'red',
    'line-width': 3
  }
}
